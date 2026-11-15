"""Multiplayer model for Tensorblue english-17 — a small simulation of the design Figma's co-founder described
in "How Figma's multiplayer technology works" (Evan Wallace, Figma blog, 16 Oct 2019). OUR model, not Figma's code.

Described rules we implement:
  * "Property changes on the client are always applied immediately instead of waiting for acknowledgement
    from the server" (optimistic local view).
  * The server keeps "the latest value that any client has sent for a given property on a given object";
    "the server can define the order of events" (arrival order, no timestamps).
  * Two clients changing different properties of the same object don't conflict; the same property ends
    with "the last value that was sent to the server".
  * Clients "discard incoming changes from the server that conflict with unacknowledged property changes"
    (no flicker). A naive client that applies everything is simulated for comparison.
Latencies and values are ILLUSTRATIVE (milliseconds, made up); the event logic is real.
usage: python3 multiplayer_demo.py <out_dir>
"""
import heapq
import json
import os
import sys

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
LAT = {"Ana": 40, "Ben": 60}            # one-way latency to/from the server (ms)


def simulate(naive_ben=False):
    server = {("shape", "x"): 0, ("shape", "fill"): "blue"}
    view = {c: dict(server) for c in LAT}
    unacked = {c: {} for c in LAT}      # property -> count of my unacknowledged changes
    log = {c: [] for c in LAT}
    arrivals = []                       # order the server received edits
    q = []                              # (time, seq, kind, payload)
    seq = [0]

    def push(t, kind, p):
        seq[0] += 1
        heapq.heappush(q, (t, seq[0], kind, p))

    def local_edit(t, who, prop, val):
        view[who][prop] = val                                   # instant, optimistic
        unacked[who][prop] = unacked[who].get(prop, 0) + 1
        log[who].append([t, prop[1], val, "local"])
        push(t + LAT[who], "to_server", (who, prop, val))

    edits = [(0, "Ana", ("shape", "x"), -2), (5, "Ben", ("shape", "x"), 2),          # same property, at once
             (200, "Ana", ("shape", "fill"), "amber"), (202, "Ben", ("shape", "x"), 0)]  # different properties
    for t, who, prop, val in edits:
        push(t, "edit", (who, prop, val))
    while q:
        t, _, kind, p = heapq.heappop(q)
        if kind == "edit":
            local_edit(t, *p)
        elif kind == "to_server":
            who, prop, val = p
            server[prop] = val                                  # server order = arrival order
            arrivals.append([t, who, prop[1], val])
            for c in LAT:
                push(t + LAT[c], "to_client", (c, who, prop, val))
        else:
            c, who, prop, val = p
            if who == c:                                        # my own change came back: acknowledged
                unacked[c][prop] -= 1
                if naive_ben and c == "Ben" and view[c][prop] != val:   # a naive client applies every server message, echoes included
                    view[c][prop] = val
                    log[c].append([t, prop[1], val, "from server (own echo)"])
                continue
            if unacked[c].get(prop, 0) > 0 and not (naive_ben and c == "Ben"):
                log[c].append([t, prop[1], val, "discarded (unacked local change)"])
                continue
            if view[c][prop] != val:
                view[c][prop] = val
                log[c].append([t, prop[1], val, "from server"])
    return server, view, arrivals, log


def flickers(log, prop="x"):
    vals = [v for _, p, v, how in log if p == prop and how != "discarded (unacked local change)"]
    return sum(1 for i in range(1, len(vals) - 1) if vals[i] != vals[i - 1] and vals[i + 1] == vals[i - 1])


server, view, arrivals, log = simulate()
_, view_n, _, log_n = simulate(naive_ben=True)
data = {
    "model": "our simulation of the described design (not Figma's code); latencies/values illustrative",
    "latency_ms": LAT,
    "server_arrival_order": arrivals,
    "final_server": {f"{k[0]}.{k[1]}": v for k, v in server.items()},
    "final_views": {c: {f"{k[0]}.{k[1]}": v for k, v in view[c].items()} for c in view},
    "all_copies_identical": all(view[c] == server for c in view),
    "same_property_winner": "Ben (x = 2): his edit reached the server last",
    "different_properties_both_kept": server[("shape", "fill")] == "amber" and server[("shape", "x")] == 0,
    "logs": log,
    "ben_flickers_with_discard_rule": flickers(log["Ben"]),
    "ben_flickers_naive_client": flickers(log_n["Ben"]),
    "naive_ben_log": log_n["Ben"],
}
json.dump(data, open(os.path.join(out, "multiplayer-demo.json"), "w"), indent=1)
print(json.dumps({k: data[k] for k in ["server_arrival_order", "final_server", "all_copies_identical", "different_properties_both_kept", "ben_flickers_with_discard_rule", "ben_flickers_naive_client"]}, indent=1))
print("Ben log:", log["Ben"]); print("naive Ben log:", log_n["Ben"]); print("Ana log:", log["Ana"])
