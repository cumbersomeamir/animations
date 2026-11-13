"""Score + event-locked foley + English narration mix for Recall english-13 (why an elevator feels heavier as it starts
rising; Low-poly Everyday Discovery).

Everything except the narration is synthesised here (numpy/scipy). Same accepted engine, levels and loudness chain as
feedback round 01 / round 02: subtle warm pad that changes chord per story beat (sections from timeline.json) with sparse,
irregular plucks (no repeating loop); music ducked ~11 dB and foley ~6 dB under the voice; target -14.5 LUFS, TP <= -1.6 dBTP.
Outputs: ../build/mix.wav (48 kHz stereo, exactly 30.000 s), ../build/audio_report.json, ../build/cue_table.json
"""
import json
import os

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d
from scipy.signal import butter, lfilter, resample_poly, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BUILD = os.path.join(ROOT, "build")
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
SR, DUR = 48000, float(TL["duration"])
N = int(SR * DUR)
C = TL["cues"]
BEAT = 0.5
RNG = np.random.default_rng(20261109)
EVENTS = []
MUS_G, FX_G = 0.5, 0.6     # accepted English balance (feedback round 01 / round 02)
TARGET_LUFS, CEIL_DBTP = -14.5, -1.6


def ta(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, o=2):
    return sosfilt(butter(o, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, btype="high", fs=SR, output="sos"), x)


def place(buf, sig, t0, gain=1.0, pan=0.0, name=None):
    i0 = int(round(t0 * SR))
    if i0 >= N:
        return
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    sig = sig[: N - i0]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i0:i0 + len(sig), 0] += sig * gain * l
    buf[i0:i0 + len(sig), 1] += sig * gain * r
    if name:
        EVENTS.append({"t": round(t0, 3), "beat": round(t0 / BEAT, 2), "sfx": name})


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- SFX (foley)
def whoosh(d, f0, f1):
    n = int(d * SR); x = RNG.standard_normal(n); out = np.zeros(n)
    for i in range(0, n, 512):
        f = f0 + (f1 - f0) * (i / n)
        out[i:i + 512] = bp(x[max(0, i - 2048):i + 512], f * 0.7, f * 1.4)[-len(x[i:i + 512]):]
    return out * np.sin(np.pi * np.arange(n) / n) ** 1.5


def droplet(f):
    t = ta(0.07)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.4 * t / 0.07)) / SR) * np.exp(-t / 0.018)


def bubbles(d, n, f0=500, f1=1500):
    out = np.zeros(int(d * SR))
    for _ in range(n):
        i = int(RNG.random() * (d - 0.08) * SR); dd = droplet(f0 + RNG.random() * (f1 - f0)) * (0.4 + 0.6 * RNG.random())
        out[i:i + len(dd)] += dd[: len(out) - i]
    return out


def plop():
    t = ta(0.35)
    body = np.sin(2 * np.pi * 160 * t) * np.exp(-t / 0.06)
    pitch = np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.08], [380, 900])) / SR) * np.exp(-t / 0.05)
    return 0.8 * body + 0.5 * pitch + 0.45 * bp(RNG.standard_normal(len(t)), 900, 6500) * np.exp(-t / 0.09)


def splash(d=0.7, size=1.0):
    t = ta(d)
    s = bp(RNG.standard_normal(len(t)), 500, 7000) * np.exp(-t / (0.14 * size)) * (1 - np.exp(-t / 0.004))
    out = 0.7 * s + 0.5 * np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.08)
    for _ in range(int(7 * size)):
        i = int((0.06 + RNG.random() * 0.45) * SR); dd = droplet(800 + RNG.random() * 1400) * 0.35
        out[i:i + len(dd)] += dd[: len(out) - i]
    return out


def clunk(f0=118):
    t = ta(0.5)
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dc) for f, a, dc in [(f0, 1, .09), (f0 * 2.6, .5, .05), (f0 * 6.3, .35, .03), (f0 * 13, .2, .02)])
    return s + 0.3 * bp(RNG.standard_normal(len(t)), 200, 2000) * np.exp(-t / 0.012)


def tick(f=2200, d=0.06):
    t = ta(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012) + 0.3 * RNG.standard_normal(len(t)) * np.exp(-t / 0.003)


def stamp_good():
    t = ta(0.9)
    thud = np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.04) + 0.4 * bp(RNG.standard_normal(len(t)), 300, 3000) * np.exp(-t / 0.015)
    bell = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dc) for f, a, dc in [(1318.5, .5, .35), (1975.5, .35, .3), (2637, .2, .2)])
    return 0.8 * thud + bell * (t > 0.02)


def stamp_bad():
    t = ta(0.6)
    thud = np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.25], [220, 90])) / SR) * np.exp(-t / 0.12)
    return 0.9 * thud + 0.4 * bp(RNG.standard_normal(len(t)), 200, 2500) * np.exp(-t / 0.02)


def card_flip():
    t = ta(0.12)
    return bp(RNG.standard_normal(len(t)), 1500, 8000) * np.exp(-t / 0.025) * 0.8


def slam():
    t = ta(0.35)
    return 0.7 * np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.2], [90, 45])) / SR) * np.exp(-t / 0.1) + \
        0.35 * bp(RNG.standard_normal(len(t)), 400, 5000) * np.exp(-t / 0.03)


def shimmer(d=0.8):
    t = ta(d); out = np.zeros(len(t))
    for k, f in enumerate([880, 1108.7, 1318.5, 1760]):
        i = int(k * d / 6 * SR); tt = t[: len(t) - i]
        out[i:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.25)
    return out * 0.22


def ding(f=1174.7):
    t = ta(1.3)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.6) + 0.7 * np.sin(2 * np.pi * f * 1.26 * t) * np.exp(-t / 0.5)) * (1 - np.exp(-t / 0.004)) * 0.4


def pop():
    t = ta(0.12)
    return np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.12], [900, 300])) / SR) * np.exp(-t / 0.03)


def thunk():
    t = ta(0.25)
    return np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.04) + 0.4 * bp(RNG.standard_normal(len(t)), 800, 3000) * np.exp(-t / 0.01)


def gurgle(d):
    t = ta(d)
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 7 * t + np.sin(2 * np.pi * 1.3 * t) * 3)
    return lp(RNG.standard_normal(len(t)), 1200, 2) * am * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.3) * 1.6 + 0.3 * bubbles(d, int(d * 18), 300, 900)


def rush(d):
    t = ta(d)
    return bp(RNG.standard_normal(len(t)), 300, 4000) * np.sin(np.pi * t / d) ** 0.8


def rewind(d):
    t = ta(d)
    f = 400 + 2600 * (t / d) ** 1.3 + 180 * np.sin(2 * np.pi * 31 * t)
    return (0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * bp(RNG.standard_normal(len(t)), 1500, 7000)) * np.sin(np.pi * t / d) ** 0.7


def boing():
    t = ta(0.45)
    f = 330 + 180 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / 0.15) + 120 * t
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * 0.6


def fuse_hiss(d):
    t = ta(d)
    return bp(RNG.standard_normal(len(t)), 3000, 9000) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t) ** 2) * np.minimum(1, t / 0.05) * 0.5


def beep(f=1800.0, d=0.09):
    t = ta(d)
    return np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.004) * np.minimum(1, (d - t) / 0.006) * 0.4


def squish(d=0.18, lo=250, hi=1400):
    t = ta(d)
    return bp(RNG.standard_normal(len(t)), lo, hi) * np.sin(np.pi * t / d) ** 2 * 0.45


def ping(f=2600.0):
    t = ta(0.5)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 1.51 * f * t)) * np.exp(-t / 0.09) * 0.22


def hum(d, f0=118.0, buzz=0.25):
    t = ta(d)
    s = sum((1 / k) * np.sin(2 * np.pi * k * f0 * t) for k in range(1, 7)) + buzz * bp(RNG.standard_normal(len(t)), 900, 2600)
    return lp(s, 1600, 2) * np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.35) * 0.3


def ac_drone(d, f0=55.0):
    """Steady AC/fan drone (low tone + air)."""
    t = ta(d)
    x = 0.7 * np.sin(2 * np.pi * f0 * t) + 0.35 * np.sin(2 * np.pi * 2 * f0 * t) + 0.3 * lp(RNG.standard_normal(len(t)), 400, 2)
    return x * np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.2) * 0.4


def load_fx(name):
    a, sr = sf.read(os.path.join(HERE, "narration", name), dtype="float64")
    if sr != SR:
        g = np.gcd(sr, SR); a = resample_poly(a, SR // g, sr // g)
    return a


def click(f=3200):
    t = ta(0.05)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) + 0.5 * bp(RNG.standard_normal(len(t)), 2000, 8000) * np.exp(-t / 0.004)) * 0.6


def dull_click():
    t = ta(0.08)
    return (np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.01) + 0.4 * bp(RNG.standard_normal(len(t)), 500, 2500) * np.exp(-t / 0.006)) * 0.6


def fabric_tap():
    t = ta(0.12)
    return lp(RNG.standard_normal(len(t)), 900, 2) * np.exp(-t / 0.025) * 0.9 + 0.3 * np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.03)


def build_sfx():
    fx = np.zeros((N, 2))
    # hook: lift chime, the car starts (soft jolt + motor hum), the scale's digits jump
    place(fx, ding(1046.5) * 0.5, 0.02, 0.08, 0.2, "elevator chime")
    place(fx, thunk() * 0.7, C["start"], 0.16, 0, "car starts: soft jolt")
    place(fx, hum(C["stop"] - C["start"] + 0.3, 70.0, 0.08) * 0.5, C["start"], 0.07, -0.1, "elevator motor hum through the ride")
    for k in range(3):
        place(fx, beep(1900.0 + 220 * k, 0.05), C["start"] + 0.08 + 0.09 * k, 0.07, 0.2, "scale digits jump" if k == 0 else None)
    place(fx, whoosh(0.3, 400, 1200) * 0.4, 3.15, 0.2, 0, "cut to the rider")
    place(fx, boing() * 0.5, 5.6, 0.07, 0, "nine kilos?")
    place(fx, tick(1500, 0.05), C["no"], 0.1, 0, "No.")
    place(fx, whoosh(0.32, 400, 1300) * 0.45, 7.25, 0.24, 0, "cut to the cutaway shaft (ends before l03)")
    place(fx, blip(880), C["pushArrow"], 0.11, -0.3, "push arrow")
    place(fx, blip(523.25), C["gravArrow"], 0.11, 0.3, "gravity arrow")
    place(fx, shimmer(0.7) * 0.5, C["extra"], 0.12, -0.3, "extra push")
    place(fx, beep(1500.0, 0.07), C["cruise"], 0.08, 0.2, "reading back to 75.0")
    place(fx, whoosh(0.4, 900, 500) * 0.35, C["slow"], 0.1, 0, "slowing")
    place(fx, beep(1100.0, 0.07), C["slow"] + 0.05, 0.08, 0.2, "reading 65.8")
    place(fx, ding(1318.5) * 0.6, C["stop"], 0.14, 0.1, "arrival ding")
    place(fx, ding(1046.5) * 0.5, C["stop"] + 0.18, 0.12, 0.1, None)
    place(fx, pop() * 0.6, C["massTag"], 0.1, 0, "mass: 75 kg")
    for k, f in enumerate((660.0, 523.25, 392.0)):
        place(fx, blip(f), C["graph"] + 0.8 * k + 0.1, 0.09, -0.3 + 0.3 * k, "speed graph segments" if k == 0 else None)
    place(fx, pop() * 0.6, C["cta"] + 0.3, 0.1, 0, "Recall mark")
    place(fx, ding(1567.98) * 0.6, C["smile"] + 0.1, 0.1, 0, "smile")
    place(fx, ding(1318.5) * 0.5, C["end"] + 0.15, 0.1, 0, None)
    return fx


def chime_ok():
    t = ta(1.0)
    return (np.sin(2 * np.pi * 1318.5 * t) * np.exp(-t / 0.3) + 0.8 * np.sin(2 * np.pi * 1975.5 * np.maximum(0, t - 0.09)) * np.exp(-np.maximum(0, t - 0.09) / 0.35) * (t > 0.09)) * 0.32


def blip(f):
    t = ta(0.25)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.07) * 0.5


def bonk():
    t = ta(0.4)
    return np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.3], [330, 180])) / SR) * np.exp(-t / 0.12) * 0.5


def rattle(d):
    t = ta(d)
    return bp(RNG.standard_normal(len(t)), 1500, 6000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * t))) * np.sin(np.pi * t / d) * 0.25


def slap():
    t = ta(0.25)
    return bp(RNG.standard_normal(len(t)), 600, 5000) * np.exp(-t / 0.025) + 0.4 * np.sin(2 * np.pi * 160 * t) * np.exp(-t / 0.04)


def thud():
    t = ta(0.6)
    return 0.9 * np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.2], [110, 45])) / SR) * np.exp(-t / 0.15) + 0.3 * bp(RNG.standard_normal(len(t)), 200, 2000) * np.exp(-t / 0.03)


def fizzle(d):
    t = ta(d)
    return bp(RNG.standard_normal(len(t)), 2000, 8000) * np.exp(-t / (d * 0.5)) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t)) * 0.35


def peel():
    t = ta(0.35)
    return bp(RNG.standard_normal(len(t)), 1200, 7000) * np.sin(np.pi * t / 0.35) * (0.6 + 0.4 * np.sin(2 * np.pi * 60 * t)) * 0.5


def clink():
    t = ta(0.4)
    return (np.sin(2 * np.pi * 2350 * t) + 0.6 * np.sin(2 * np.pi * 3520 * t)) * np.exp(-t / 0.08) * 0.25


# ---------------------------------------------------------------- music (original groove, 120 BPM, D major)
def kick():
    t = ta(0.35)
    return np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.12], [130, 45])) / SR) * np.exp(-t / 0.12)


def snare():
    t = ta(0.25)
    return 0.6 * bp(RNG.standard_normal(len(t)), 1500, 7000) * np.exp(-t / 0.06) + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)


def hat(v):
    t = ta(0.06)
    return hp(RNG.standard_normal(len(t)), 7000, 2) * np.exp(-t / 0.012) * v


def bass(m, d):
    t = ta(d); f = hz(m)
    s = sum((1 / k) * np.sin(2 * np.pi * k * f * t) for k in range(1, 6))
    return lp(s, 500, 2) * np.minimum(1, t / 0.01) * np.exp(-t / 0.35)


def keys(ms, d):
    t = ta(d)
    s = sum(np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * 2 * hz(m) * t) * np.exp(-t / 0.1) for m in ms)
    return s * np.exp(-t / 0.22) * np.minimum(1, t / 0.004) / len(ms)


def kalimba(m):
    t = ta(0.9); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.03)) * np.exp(-t / 0.35) * np.minimum(1, t / 0.002)


def brass(ms, d=0.45, bright=1.0):
    t = ta(d)
    s = sum(sum((1 / k) * np.sin(2 * np.pi * k * hz(m) * (1 + 0.002 * np.sin(2 * np.pi * 5 * t)) * t) for k in range(1, 8)) for m in ms) / len(ms)
    env = np.minimum(1, t / 0.015) * np.exp(-np.maximum(0, t - 0.08) / (0.12 * bright))
    return lp(s, 1800 + 1800 * bright, 2) * env


def crash():
    t = ta(1.6)
    return hp(RNG.standard_normal(len(t)), 4000, 2) * np.exp(-t / 0.5) * 0.6


def heartbeat():
    t = ta(0.4)
    lub = np.sin(2 * np.pi * 55 * t) * np.exp(-t / 0.06)
    dub = np.zeros_like(t); i = int(0.16 * SR); dub[i:] = 0.7 * np.sin(2 * np.pi * 62 * t[: len(t) - i]) * np.exp(-t[: len(t) - i] / 0.05)
    return lub + dub


def build_music():
    """Subtle, non-looping score: a warm pad that changes chord with each story beat + sparse, varied plucks."""
    mus = np.zeros((N, 2))
    sections = [tuple(x) for x in TL["music_sections"]]   # same chord sequence as feedback round 01, retimed to this story
    for i, (a, b, ch) in enumerate(sections):
        d = b - a + 0.6
        place(mus, warm_pad([hz(m) for m in ch], d), max(0, a - 0.3), 0.22)
        place(mus, pluck_soft(hz(ch[0] - 12), 1.8) * 0.9, a, 0.18, 0, None)
    # sparse plucks: irregular times, chord tones, never a repeating pattern
    R = np.random.default_rng(7)
    t = 0.6
    while t < 28.6:
        ch = next(c for a, b, c in sections if a <= t < b)
        m = ch[int(R.integers(0, len(ch)))] + 12 * int(R.integers(1, 3))
        place(mus, pluck_soft(hz(m), 1.2), t, 0.07 + 0.04 * R.random(), float(R.uniform(-0.5, 0.5)))
        t += float(R.uniform(0.9, 2.1))
    place(mus, pluck_soft(hz(77), 2.0), 29.0, 0.12, 0.2)
    place(mus, pluck_soft(hz(81), 2.0), 29.25, 0.1, -0.2)
    EVENTS.append({"t": 0.0, "sfx": "music: warm pad, chord per story beat (F maj7, D m9, Bb maj7, G m7, C sus, F maj7, Bb 6/9), sparse varied plucks; no loop"})
    return mus


def warm_pad(freqs, d):
    t = ta(d)
    s = sum(np.sin(2 * np.pi * f * t + 0.4 * np.sin(2 * np.pi * 0.21 * t)) + 0.5 * np.sin(2 * np.pi * f * 1.004 * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) for f in freqs)
    env = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)
    return lp(s, 1500, 2) * env / len(freqs)


def pluck_soft(f, d):
    t = ta(d)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.15)) * np.exp(-t / 0.55) * np.minimum(1, t / 0.004)


# ---------------------------------------------------------------- narration / loudness / limiter
def load_voice():
    meta = {m["id"]: m for m in json.load(open(os.path.join(HERE, "narration", "lines.json")))["lines"]}
    v = np.zeros(N); spans = []
    for it in TL["narration"]:
        m = meta[it["id"]]
        a, sr = sf.read(os.path.join(HERE, "narration", m["file"]), dtype="float64")
        if sr != SR:
            g = np.gcd(sr, SR); a = resample_poly(a, SR // g, sr // g)
        i0 = int(round(it["start"] * SR))
        assert i0 + len(a) <= N
        v[i0:i0 + len(a)] += a
        spans.append((it["id"], it["start"], it["start"] + len(a) / SR, m["text"]))
    spans.sort(key=lambda s: s[1])
    for (a1, _, e1, _), (a2, s2, _, _) in zip(spans, spans[1:]):
        assert e1 + 0.15 <= s2, f"{a1} ends {e1:.2f} too close to {a2} at {s2:.2f}"
    v = hp(v, 90, 2)
    return v + 0.25 * bp(v, 2500, 5000), spans


def lufs(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    z = np.array([np.sum(np.mean(y[i:i + blk] ** 2, axis=0)) for i in range(0, len(y) - blk, hop)])
    z = z[-0.691 + 10 * np.log10(z + 1e-12) > -70]
    rel = -0.691 + 10 * np.log10(np.mean(z)) - 10
    z = z[-0.691 + 10 * np.log10(z + 1e-12) > rel]
    return -0.691 + 10 * np.log10(np.mean(z))


def true_peak_env(x):
    up = resample_poly(x, 4, 1, axis=0)
    pk = np.max(np.abs(up), axis=1).reshape(-1, 4).max(axis=1)
    return pk[: len(x)]


def limit(x, ceil, release=0.08, look=0.004):
    pk = maximum_filter1d(true_peak_env(x), size=int(look * SR) * 2 + 1)
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    a = np.exp(-1 / (release * SR)); out = np.empty_like(g); cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    return x * out[:, None]


def main():
    os.makedirs(BUILD, exist_ok=True)
    voice, spans = load_voice()
    fx, mus = build_sfx(), build_music()
    tt = np.arange(N) / SR
    k = int(0.12 * SR)
    venv = np.convolve(np.abs(voice), np.ones(k) / k, mode="same")
    vact = np.clip(venv / 0.02, 0, 1)
    mus = mus * (10 ** (-11 / 20) * vact + (1 - vact))[:, None]       # duck music ~11 dB under voice
    fx = fx * (10 ** (-6 / 20) * vact + (1 - vact))[:, None]          # duck foley ~6 dB under voice
    tail = np.clip((DUR - tt) / 0.35, 0, 1)                           # avoid a click at 30.000 s (audio only)
    mix = (np.stack([voice, voice], 1) + MUS_G * mus + FX_G * fx) * tail[:, None]
    for _ in range(2):                                                # normalise, limit, re-normalise
        mix *= 10 ** ((TARGET_LUFS - lufs(mix)) / 20)
        mix = limit(mix, 10 ** (CEIL_DBTP / 20))
    gain_voice = 1.0
    sf.write(os.path.join(BUILD, "mix.wav"), mix.astype(np.float32), SR, subtype="PCM_24")
    # report
    bed = (MUS_G * mus + FX_G * fx) * tail[:, None]
    scale = np.sqrt(np.mean(mix ** 2)) / max(1e-9, np.sqrt(np.mean(((np.stack([voice, voice], 1) + bed)) ** 2)))
    lines = []
    for sid, s0, s1, text in spans:
        a, b = int(s0 * SR), int(s1 * SR)
        vr = np.sqrt(np.mean(voice[a:b] ** 2)); br = np.sqrt(np.mean(bed[a:b] ** 2))
        w = len(text.split())
        lines.append({"id": sid, "start": round(s0, 3), "end": round(s1, 3), "text": text, "words": w,
                      "words_per_s": round(w / (s1 - s0), 2), "voice_over_bed_db": round(20 * np.log10(vr / (br + 1e-9)), 1)})
    rep = {"duration_s": len(mix) / SR, "integrated_lufs": round(lufs(mix), 2),
           "true_peak_dbtp_est": round(20 * np.log10(np.max(true_peak_env(mix))), 2),
           "sample_peak_dbfs": round(20 * np.log10(np.max(np.abs(mix))), 2), "lines": lines,
           "narration_words": sum(l["words"] for l in lines), "speech_s": round(sum(l["end"] - l["start"] for l in lines), 2),
           "overall_words_per_s": round(sum(l["words"] for l in lines) / DUR, 2), "bpm": None, "sfx_events": sorted(EVENTS, key=lambda e: e["t"]),
           "music": "original subtle score synthesised in mix.py: warm pad changing chord per story beat + sparse, irregular plucks (no repeating loop)",
           "ducking": "music -11 dB, foley -6 dB under voice", "unused_scale": round(float(scale), 3), "voice_gain": gain_voice}
    json.dump(rep, open(os.path.join(BUILD, "audio_report.json"), "w"), indent=2)
    json.dump({"cues": C, "shots": TL["shots"], "narration": TL["narration"]},
              open(os.path.join(BUILD, "cue_table.json"), "w"), indent=2)
    print(json.dumps({k: v for k, v in rep.items() if k not in ("sfx_events",)}, indent=1))


if __name__ == "__main__":
    main()
