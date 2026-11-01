"""Shared timing, easing and colour helpers for the Mello video."""
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
APP = os.path.dirname(PROJECT)  # videos/mello
GEN = os.path.join(PROJECT, "generated")
FONTS = os.path.join(PROJECT, "fonts")
ASSETS = os.path.join(APP, "assets")
OUTPUT = os.path.join(APP, "output")

W, H, FPS = 1080, 1920, 30
DURATION = 30.0
NFRAMES = int(DURATION * FPS)


def load_timeline():
    with open(os.path.join(GEN, "timeline.json")) as fh:
        tl = json.load(fh)
    return {ln["id"]: ln for ln in tl["lines"]}


# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def lerp(a, b, t):
    return a + (b - a) * t


def remap(t, a, b):
    if b == a:
        return 1.0 if t >= b else 0.0
    return clamp((t - a) / (b - a))


def smooth(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def ease_io(x):
    x = clamp(x)
    return 4 * x * x * x if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_in(x):
    x = clamp(x)
    return x * x * x


def ease_out_back(x, s=1.70158):
    x = clamp(x)
    c3 = s + 1
    return 1 + c3 * (x - 1) ** 3 + s * (x - 1) ** 2


def ease_out_elastic(x):
    x = clamp(x)
    if x in (0.0, 1.0):
        return x
    return 2 ** (-10 * x) * math.sin((x * 10 - 0.75) * (2 * math.pi) / 3) + 1


def bump(t, a, b):
    """0 -> 1 -> 0 hump between a and b."""
    x = remap(t, a, b)
    return math.sin(math.pi * x)


def track(t, keys):
    """keys: list of (time, value[, ease]) sorted by time; value may be tuple."""
    if t <= keys[0][0]:
        return keys[0][1]
    for i in range(1, len(keys)):
        t1 = keys[i][0]
        if t <= t1:
            t0, v0 = keys[i - 1][0], keys[i - 1][1]
            v1 = keys[i][1]
            ez = keys[i][2] if len(keys[i]) > 2 else ease_io
            x = ez(remap(t, t0, t1))
            if isinstance(v0, (tuple, list)):
                return tuple(lerp(a, b, x) for a, b in zip(v0, v1))
            return lerp(v0, v1, x)
    return keys[-1][1]


# ---------------------------------------------------------------- colour
def hexrgb(s):
    s = s.lstrip("#")
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def mixrgb(a, b, t):
    return tuple(int(round(lerp(x, y, clamp(t)))) for x, y in zip(a, b))
