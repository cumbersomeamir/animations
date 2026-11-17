"""Streaming-player test for Tensorblue english-19: an "always HD" player vs a buffer-based adaptive player.
Our own simulation of the published ideas, not any app's code:
  * RFC 8216 (HTTP Live Streaming, 2017): video is a series of Media Segments; Variant Streams hold the same content
    "encoded at a particular bit rate"; clients "should switch between different Variant Streams to adapt to network
    conditions".
  * Huang et al., "A Buffer-Based Approach to Rate Adaptation" (SIGCOMM 2014, Stanford + Netflix): 4-second chunks;
    "the buffer drains at unit rate"; BBA-0 picks the next chunk's rate from buffer occupancy (a reservoir at the
    lowest rate, then a linear "cushion" up to the highest); a new rate can be picked only when a chunk finishes.
Ladder: SD 0.235 and HD 5 Mb/s are the paper's "typically 235kb/s standard definition to 5Mb/s high definition";
the middle 720p rung (1.75 Mb/s) and the network trace are ILLUSTRATIVE. The playback logic is real and exact.
usage: python3 abr_demo.py <out_dir>
"""
import json
import os
import sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
CHUNK = 4.0                                    # seconds of video per chunk (the paper's test setting)
LADDER = [("SD", 0.235), ("720p", 1.75), ("HD", 5.0)]   # Mb/s
BMAX = 20.0                                    # stop requesting while the buffer is this full (seconds)
# BBA-0 rate map: a safety reservoir of two chunks at the lowest rate (the paper: at least one chunk, larger in
# production), then linear up to the highest rate at the fullest buffer a request can see (BMAX - one chunk).
# Other settings tried are reported in the notes (one-chunk reservoir: 2.6 s frozen; 90 % proportions: never HD).
RESERVOIR = 2 * CHUNK
CUSHION = (BMAX - CHUNK) - RESERVOIR
WATCH = 60.0                                   # seconds of wall-clock viewing simulated
DT = 0.01


def bandwidth(t):                              # illustrative: good Wi-Fi, a weak patch, good again
    return 8.0 if t < 14.0 or t >= 40.0 else 1.2


def bba0(buffer_s):
    if buffer_s <= RESERVOIR:
        return 0
    f = LADDER[0][1] + (LADDER[-1][1] - LADDER[0][1]) * min(1.0, (buffer_s - RESERVOIR) / CUSHION)
    return max(i for i, (_, r) in enumerate(LADDER) if r <= f + 1e-9)


def simulate(policy):
    t, buf, playing, started = 0.0, 0.0, False, False
    chunks, samples, stall, frozen_spans = [], [], 0.0, []
    cur = None                                  # chunk being downloaded: dict
    played = 0.0
    while t < WATCH - 1e-9:
        if cur is None and buf + CHUNK <= BMAX + 1e-9:
            q = policy(buf)
            cur = {"i": len(chunks), "q": LADDER[q][0], "qi": q, "mb": LADDER[q][1] * CHUNK, "left": LADDER[q][1] * CHUNK, "t_req": round(t, 2), "buffer_at_req": round(buf, 2)}
        if cur is not None:
            cur["left"] -= bandwidth(t) * DT
            if cur["left"] <= 0:
                cur["t_done"] = round(t + DT, 2); del cur["left"]
                chunks.append(cur); cur = None; buf += CHUNK
                if not started: started = True
        if started:
            if buf > 1e-9:
                if not playing and frozen_spans and frozen_spans[-1][1] is None: frozen_spans[-1][1] = round(t, 2)
                playing = True; d = min(DT, buf); buf -= d; played += d
            else:
                if playing or not frozen_spans or frozen_spans[-1][1] is not None:
                    if playing: frozen_spans.append([round(t, 2), None])
                playing = False; stall += DT
        if round(t / DT) % 10 == 0:
            # quality on screen = the chunk containing the current play position
            pos_chunk = int(played // CHUNK)
            q_on = chunks[pos_chunk]["q"] if pos_chunk < len(chunks) else None
            samples.append([round(t, 2), round(buf, 2), "frozen" if started and not playing else ("playing" if started else "starting"), q_on, round(played, 2)])
        t += DT
    if frozen_spans and frozen_spans[-1][1] is None: frozen_spans[-1][1] = round(WATCH, 2)
    secs = {}
    for s in samples:
        if s[2] == "playing" and s[3]: secs[s[3]] = round(secs.get(s[3], 0) + 0.1, 1)
    first = next(c["t_done"] for c in chunks)
    return {"chunks": chunks, "samples_every_0_1s": samples, "frozen_seconds": round(stall, 1), "frozen_spans": frozen_spans,
            "startup_s": first, "seconds_played": round(played, 1), "seconds_on_screen_by_quality": secs,
            "chunk_qualities": [c["q"] for c in chunks]}


fixed = simulate(lambda b: len(LADDER) - 1)
adaptive = simulate(bba0)
data = {
    "model": "our simulation of the published method (RFC 8216 variants + BBA-0 buffer-based rate map); illustrative network",
    "params": {"chunk_s": CHUNK, "ladder_mbps": LADDER, "buffer_max_s": BMAX, "reservoir_s": RESERVOIR, "cushion_s": CUSHION, "watch_s": WATCH,
               "network_mbps": "8 until 14 s, 1.2 from 14 to 40 s, 8 after"},
    "always_hd": fixed, "adaptive": adaptive,
}
json.dump(data, open(os.path.join(OUT, "abr-demo.json"), "w"))
for name, r in (("always HD", fixed), ("adaptive", adaptive)):
    print(f"{name:10s} frozen {r['frozen_seconds']:5.1f} s  spans {r['frozen_spans']}  startup {r['startup_s']} s  played {r['seconds_played']} s  on-screen {r['seconds_on_screen_by_quality']}")
    print("   chunks:", [(c["q"], c["t_req"], c["t_done"]) for c in r["chunks"]])
