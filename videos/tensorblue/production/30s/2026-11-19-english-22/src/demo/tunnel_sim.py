"""Tensorblue english-22 test: what a navigation app can estimate in a tunnel with no satellite fix.

Python 3 standard library only. OUR simulation of textbook methods, not any app's code:
  * a made-up road: 100 m approach, a 600 m tunnel with a gentle S-bend, 200 m after the exit
  * the true car: 60 km/h, then slows to 45 km/h halfway through the tunnel (traffic ahead)
  * GPS: one fix per second with 3 m noise outside the tunnel, nothing inside
Estimators that start from the last fix at the tunnel entrance:
  freeze        the dot stays at the last fix
  straight DR   dead reckoning: last speed and last heading, straight ahead (Bowditch: "advancing from a known
                fix ... along the ... ordered course and speed")
  DR + gyro     dead reckoning that also turns with a yaw-rate (turn) sensor, with a small illustrative bias
  DR + gyro + map matching   the same, snapped to the nearest point of the road ahead (map matching:
                Newson & Krumm 2009)
None of them senses the slow-down, so the guesses run ahead of the car: that is the drift.
  beacons       the map-matched guess, re-anchored whenever the car passes a roadside beacon (Waze Beacons idea;
                beacon spacing here, every 100 m, is illustrative)
Accuracy circle: our simple uncertainty model, 4 m + 15 % of the distance travelled since the last fix
(illustrative; Android reports accuracy as a 68 %-confidence radius).

usage: python3 tunnel_sim.py <out_dir>   -> writes tunnel-sim.json
"""
import json
import math
import os
import random
import sys

DT = 0.1
SEED = 20261119
L_IN, L_TUN, L_OUT = 100.0, 600.0, 200.0
V0, V1 = 60 / 3.6, 45 / 3.6
SLOW_AT = L_IN + 300.0                         # starts slowing halfway through the tunnel
GYRO_BIAS = math.radians(0.15)                 # rad/s, illustrative
UNC0, UNC_K = 4.0, 0.15
BEACONS = [L_IN + 50 + 100 * i for i in range(6)]       # illustrative spacing


def heading_at(s):
    """road heading (rad, 0 = straight ahead) along the centreline: a gentle S-bend inside the tunnel"""
    a = math.radians(32)
    def ramp(x, x0, x1):
        return 0.0 if x <= x0 else 1.0 if x >= x1 else 0.5 - 0.5 * math.cos(math.pi * (x - x0) / (x1 - x0))
    return a * ramp(s, 180, 300) - a * ramp(s, 430, 590)


def build_road():
    pts, x, y = [(0.0, 0.0, 0.0)], 0.0, 0.0
    for i in range(1, int(L_IN + L_TUN + L_OUT) + 1):
        h = heading_at(i - 0.5)
        x += math.sin(h); y += math.cos(h)
        pts.append((float(i), x, y))
    return pts                                   # (s, x right, y forward) every metre


ROAD = build_road()


def at_s(s):
    s = max(0.0, min(ROAD[-1][0], s)); i = int(s); f = s - i
    a, b = ROAD[i], ROAD[min(i + 1, len(ROAD) - 1)]
    return (a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f)


def snap(x, y, s_hint):
    """map matching: nearest road point within +-60 m of the previous match (keeps it continuous)"""
    best, bs = 1e18, s_hint
    for i in range(max(0, int(s_hint) - 60), min(len(ROAD) - 1, int(s_hint) + 61)):
        ax, ay, bx, by = ROAD[i][1], ROAD[i][2], ROAD[i + 1][1], ROAD[i + 1][2]
        dx, dy = bx - ax, by - ay
        u = max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))   # continuous projection on the segment
        d = (ax + u * dx - x) ** 2 + (ay + u * dy - y) ** 2
        if d < best:
            best, bs = d, ROAD[i][0] + u
    return bs


def main(out_dir):
    rnd = random.Random(SEED)
    t, s, v = 0.0, 0.0, V0
    rows, fixes = [], []
    last_fix = None
    est = {}
    bc_hits = []
    while s < ROAD[-1][0] - 1:
        # true motion
        if s > SLOW_AT and v > V1:
            v = max(V1, v - 1.2 * DT)            # gentle braking
        s += v * DT; t += DT
        yaw_rate = (heading_at(s) - heading_at(s - v * DT)) / DT
        x, y = at_s(s)
        in_tunnel = L_IN <= s <= L_IN + L_TUN
        # GPS once per second outside the tunnel
        fix = None
        if not in_tunnel and abs(t - round(t)) < DT / 2:
            fix = (x + rnd.gauss(0, 3), y + rnd.gauss(0, 3)); fixes.append((round(t, 2), fix))
            last_fix = {'t': t, 's': s, 'x': fix[0], 'y': fix[1], 'v': v, 'h': heading_at(s)}
            est = {}
        if in_tunnel and last_fix is not None:
            if not est:                          # start every estimator from the last fix
                lf = last_fix
                # every guess starts at the last fix and is advanced (last speed, last heading) to the present moment
                k = lf['v'] * (t - DT - lf['t'])
                gx, gy = lf['x'] + k * math.sin(lf['h']), lf['y'] + k * math.cos(lf['h'])
                ms = snap(gx, gy, lf['s'])
                est = {'freeze': [lf['x'], lf['y']], 'straight': [gx, gy], 'gyro': [gx, gy, lf['h']],
                       'mm_s': ms, 'mm_h': lf['h'], 'mm_xy': list(at_s(ms)), 'dist': k, 'bc_s': ms, 'bc_dist': k, 'bc_hits': []}
            lf = last_fix
            est['straight'][0] += lf['v'] * math.sin(lf['h']) * DT; est['straight'][1] += lf['v'] * math.cos(lf['h']) * DT
            g = est['gyro']; g[2] += (yaw_rate + GYRO_BIAS) * DT; g[0] += lf['v'] * math.sin(g[2]) * DT; g[1] += lf['v'] * math.cos(g[2]) * DT
            est['mm_h'] += (yaw_rate + GYRO_BIAS) * DT
            mx, my = est['mm_xy'][0] + lf['v'] * math.sin(est['mm_h']) * DT, est['mm_xy'][1] + lf['v'] * math.cos(est['mm_h']) * DT
            est['mm_s'] = snap(mx, my, est['mm_s'])
            px, py = at_s(est['mm_s']); est['mm_xy'] = [px, py]; est['mm_h'] = heading_at(est['mm_s'])
            est['dist'] += lf['v'] * DT
            est['bc_s'] += lf['v'] * DT; est['bc_dist'] += lf['v'] * DT          # same guess between beacons
            for b in BEACONS:
                if s - v * DT < b <= s:                                          # passing a beacon: re-anchor to it
                    est['bc_s'] = b; est['bc_dist'] = 0.0; bc_hits.append(round(t, 2))
        row = {'t': round(t, 2), 's': round(s, 2), 'x': round(x, 2), 'y': round(y, 2), 'v_kmh': round(v * 3.6, 1), 'tunnel': in_tunnel}
        if in_tunnel and est:
            row['est'] = {k: [round(q, 2) for q in (est[k][:2] if k != 'mm_xy' else est[k])] for k in ('freeze', 'straight', 'gyro', 'mm_xy')}
            row['mm_s'] = round(est['mm_s'], 2)
            row['unc_m'] = round(UNC0 + UNC_K * est['dist'], 1)
            for k in ('freeze', 'straight', 'gyro', 'mm_xy'):
                ex, ey = row['est'][k]; row.setdefault('err_m', {})[k] = round(math.hypot(ex - x, ey - y), 1)
            row['mm_ahead_m'] = round(est['mm_s'] - s, 1)
            row['bc_s'] = round(est['bc_s'], 2); row['bc_ahead_m'] = round(est['bc_s'] - s, 1); row['bc_unc_m'] = round(UNC0 + UNC_K * est['bc_dist'], 1)
        rows.append(row)
    tun = [r for r in rows if r['tunnel'] and 'est' in r]
    last = tun[-1]
    t_in, t_out = tun[0]['t'], last['t']
    first_fix_after = next(f for f in fixes if f[0] > t_out)
    res = {
        'what': 'Our simulation of textbook dead reckoning and map matching on a made-up road; not any app\'s code.',
        'road': {'approach_m': L_IN, 'tunnel_m': L_TUN, 'after_m': L_OUT, 'bend_deg': 32},
        'car': {'speed_kmh_before': 60, 'speed_kmh_after_slowdown': 45, 'slows_at_tunnel_m': SLOW_AT - L_IN},
        'gyro_bias_deg_s': math.degrees(GYRO_BIAS), 'uncertainty_model': f'{UNC0} m + {UNC_K} x distance since last fix',
        'tunnel_time_s': round(t_out - t_in, 1),
        'at_tunnel_exit': {
            'error_m': last['err_m'], 'mm_dot_ahead_of_car_m': last['mm_ahead_m'], 'accuracy_circle_m': last['unc_m'],
            'straight_dr_off_road_m': None,
        },
        'max_error_m': {k: max(r['err_m'][k] for r in tun) for k in ('freeze', 'straight', 'gyro', 'mm_xy')},
        'first_fix_after_exit_t': first_fix_after[0],
        'fix_times_s': [f[0] for f in fixes],
        'beacons_s': BEACONS, 'beacon_hits_t': bc_hits,
        'beacons_max_ahead_m': max(abs(r['bc_ahead_m']) for r in tun),
        'road_xy_every_10m': [(round(p[1], 2), round(p[2], 2)) for p in ROAD[::10]],
        'rows_every_0_5s': [r for i, r in enumerate(rows) if i % 5 == 0],
    }
    # how far the straight-line guess ends up from the road itself (it leaves the road at the bend)
    sx, sy = last['est']['straight']
    res['at_tunnel_exit']['straight_dr_off_road_m'] = round(min(math.hypot(p[1] - sx, p[2] - sy) for p in ROAD), 1)
    os.makedirs(out_dir, exist_ok=True)
    json.dump(res, open(os.path.join(out_dir, 'tunnel-sim.json'), 'w'), indent=1)
    print(json.dumps({k: res[k] for k in ('tunnel_time_s', 'at_tunnel_exit', 'max_error_m', 'first_fix_after_exit_t', 'beacons_max_ahead_m', 'beacon_hits_t')}, indent=1))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out')
