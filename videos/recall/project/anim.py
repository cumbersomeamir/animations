"""Easing, keyframe tracks and small motion helpers (deterministic, time-based)."""
import math


def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def lerp(a, b, t):
    if isinstance(a, (tuple, list)):
        return tuple(lerp(x, y, t) for x, y in zip(a, b))
    return a + (b - a) * t


def seg(t, t0, t1):
    """Normalised progress of t through [t0, t1], clamped."""
    if t1 <= t0:
        return 1.0 if t >= t1 else 0.0
    return clamp((t - t0) / (t1 - t0))


# --- easings -------------------------------------------------------------
def linear(x):
    return x


def in_quad(x):
    return x * x


def out_quad(x):
    return 1 - (1 - x) * (1 - x)


def in_out_quad(x):
    return 2 * x * x if x < 0.5 else 1 - (-2 * x + 2) ** 2 / 2


def in_cubic(x):
    return x ** 3


def out_cubic(x):
    return 1 - (1 - x) ** 3


def in_out_cubic(x):
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def in_out_sine(x):
    return -(math.cos(math.pi * x) - 1) / 2


def out_back(x, s=1.70158):
    x -= 1
    return 1 + (s + 1) * x ** 3 + s * x ** 2


def in_back(x, s=1.70158):
    return (s + 1) * x ** 3 - s * x ** 2


def out_elastic(x):
    if x <= 0 or x >= 1:
        return x
    return 2 ** (-10 * x) * math.sin((x * 10 - 0.75) * (2 * math.pi / 3)) + 1


def out_bounce(x):
    n1, d1 = 7.5625, 2.75
    if x < 1 / d1:
        return n1 * x * x
    if x < 2 / d1:
        x -= 1.5 / d1
        return n1 * x * x + 0.75
    if x < 2.5 / d1:
        x -= 2.25 / d1
        return n1 * x * x + 0.9375
    x -= 2.625 / d1
    return n1 * x * x + 0.984375


EASE = {
    "lin": linear, "iq": in_quad, "oq": out_quad, "ioq": in_out_quad,
    "ic": in_cubic, "oc": out_cubic, "ioc": in_out_cubic, "ios": in_out_sine,
    "ob": out_back, "ib": in_back, "oe": out_elastic, "obo": out_bounce,
}


class Track:
    """Keyframes [(time, value, ease_into_this_key='ioc'), ...] -> value(t).

    Values may be floats, tuples or dicts of those (dict keys missing from a
    key inherit the previous key's value, so poses can be written as deltas).
    """

    def __init__(self, keys):
        full = []
        prev = None
        for k in keys:
            t, v = k[0], k[1]
            e = k[2] if len(k) > 2 else "ioc"
            if isinstance(v, dict) and isinstance(prev, dict):
                nv = dict(prev)
                nv.update(v)
                v = nv
            full.append((t, v, e))
            prev = v
        self.keys = full

    def __call__(self, t):
        ks = self.keys
        if t <= ks[0][0]:
            return ks[0][1]
        for i in range(1, len(ks)):
            if t <= ks[i][0]:
                t0, v0, _ = ks[i - 1]
                t1, v1, e = ks[i]
                x = EASE[e](seg(t, t0, t1))
                if isinstance(v0, dict):
                    return {k: lerp(v0[k], v1.get(k, v0[k]), x) if not isinstance(v0[k], str) else v1.get(k, v0[k])
                            for k in v0}
                return lerp(v0, v1, x)
        return ks[-1][1]


def arc(t, t0, t1, p0, p1, height, ease=linear):
    """Ballistic arc from p0 to p1 peaking `height` px above the straight line."""
    x = ease(seg(t, t0, t1))
    px = p0[0] + (p1[0] - p0[0]) * x
    py = p0[1] + (p1[1] - p0[1]) * x - height * 4 * x * (1 - x)
    return px, py


def bezier(p0, p1, p2, p3, x):
    u = 1 - x
    return (u ** 3 * p0[0] + 3 * u * u * x * p1[0] + 3 * u * x * x * p2[0] + x ** 3 * p3[0],
            u ** 3 * p0[1] + 3 * u * u * x * p1[1] + 3 * u * x * x * p2[1] + x ** 3 * p3[1])


def shake(t, t0, amp, dur=0.45, freq=26.0, seed=0.0):
    """Decaying camera shake offset (dx, dy) after an impact at t0."""
    if t < t0 or t > t0 + dur:
        return 0.0, 0.0
    k = 1 - (t - t0) / dur
    a = amp * k * k
    return (a * math.sin((t - t0) * freq * 2 * math.pi + seed),
            a * math.cos((t - t0) * freq * 1.7 * 2 * math.pi + seed * 2.3))


def pulse(t, t0, dur):
    """0 -> 1 -> 0 hump over dur starting at t0."""
    x = seg(t, t0, t0 + dur)
    return math.sin(math.pi * x) if 0 < x < 1 else 0.0


def hash01(n):
    """Deterministic pseudo random in [0,1)."""
    x = math.sin(n * 12.9898 + 78.233) * 43758.5453
    return x - math.floor(x)
