"""Real shortest-time routing test for Tensorblue english-16 (Python stdlib only: heapq).

A miniature city as a graph: intersections are nodes, street segments are edges, and each edge costs its
travel time in minutes. The car is at C; the destination is D. Two ways up town: the avenue A1-A2-A3 and
the side streets B1-B2-B3, linked by cross streets. All travel times are ILLUSTRATIVE inputs (made up);
the computation is real: Dijkstra's algorithm (a shortest-path search on a weighted graph with
non-negative weights, per NIST's definition) is run before and after a live-traffic update raises one
avenue segment (A1->A2) from 2 to 7 minutes, starting from where the car is.
We record the chosen route, its total time, the old route's new time, and the order in which the search
settled intersections (used to light up the search in the video).
usage: python3 route_demo.py <out_dir>
"""
import heapq
import json
import os
import sys
import time

out = sys.argv[1]
os.makedirs(out, exist_ok=True)

# two-way streets: (a, b, minutes)
STREETS = [
    ("C", "A1", 2), ("A1", "A2", 2), ("A2", "A3", 3), ("A3", "D", 2),      # the avenue
    ("C", "B1", 3), ("B1", "B2", 2), ("B2", "B3", 3), ("B3", "D", 2),      # the side streets
    ("A1", "B1", 2), ("A2", "B2", 2), ("A3", "B3", 2),                     # cross streets
]


def graph(streets):
    g = {}
    for a, b, w in streets:
        g.setdefault(a, {})[b] = w
        g.setdefault(b, {})[a] = w
    return g


def dijkstra(g, src, dst):
    dist, prev, order, seen = {src: 0}, {}, [], set()
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if u in seen:
            continue
        seen.add(u)
        order.append([u, d])
        if u == dst:
            break
        for v, w in g[u].items():
            nd = d + w
            if nd < dist.get(v, float("inf")):
                dist[v], prev[v] = nd, u
                heapq.heappush(pq, (nd, v))
    path, n = [dst], dst
    while n != src:
        n = prev[n]
        path.append(n)
    return path[::-1], dist[dst], order


def path_time(g, path):
    return sum(g[a][b] for a, b in zip(path, path[1:]))


g0 = graph(STREETS)
route0, t0, order0 = dijkstra(g0, "C", "D")

jammed = [(a, b, 7 if {a, b} == {"A1", "A2"} else w) for a, b, w in STREETS]   # live traffic: A1-A2 now 7 min
g1 = graph(jammed)
t_start = time.perf_counter()
route1, t1, order1 = dijkstra(g1, "C", "D")
search_us = (time.perf_counter() - t_start) * 1e6

data = {
    "inputs": "illustrative travel times (minutes); computation is real Dijkstra (heapq)",
    "streets": STREETS,
    "jam": {"segment": ["A1", "A2"], "minutes_before": 2, "minutes_after": 7},
    "before": {"route": route0, "minutes": t0, "settle_order": order0},
    "after": {"route": route1, "minutes": t1, "settle_order": order1,
              "old_route_now_minutes": path_time(g1, route0)},
    "rerouted": route1 != route0,
    "search_microseconds_this_machine": round(search_us, 1),
}
json.dump(data, open(os.path.join(out, "route-demo.json"), "w"), indent=1)
print(json.dumps(data, indent=1))
