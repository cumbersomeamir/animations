#!/usr/bin/env python3
"""Original procedural soundtrack, sound effects and narration mix for the TableVerse 30 s promo.

Every musical note and effect is synthesised here from oscillators and filtered noise (no samples,
no third-party audio). Timing comes from ../timeline.json (written by `node src/render.mjs --timeline`),
so the sound is locked to the same frame numbers as the picture.

Usage (from videos/tableverse/source):
  <venv>/bin/python -I audio/build_audio.py
Outputs: build/mix.wav (48 kHz stereo float), build/stems/{music,sfx,vo}.wav
"""
import json
import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, resample_poly, sosfilt, sosfilt_zi

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
FPS = TL["fps"]
DUR = TL["frames"] / FPS
N = int(round(DUR * SR))
BEAT = 60.0 / TL["bpm"]
rng = np.random.default_rng(2026)


# ----------------------------------------------------------------------------- helpers
def fr(f):
    return f / FPS


def tt(d):
    return np.arange(int(d * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def noise(n):
    return rng.standard_normal(n)


def filt(x, kind, fc, order=2):
    sos = butter(order, fc, kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def fade(x, a=0.003, r=0.01):
    n = len(x)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        x[:na] *= np.linspace(0, 1, na)
    if nr:
        x[-nr:] *= np.linspace(1, 0, nr)
    return x


def sweep_band(x, lo0, lo1, width=1.6, block=512):
    """band-pass with a centre frequency sweeping lo0 -> lo1 (geometric), block-wise with carried state"""
    out = np.zeros_like(x)
    nb = int(np.ceil(len(x) / block))
    zi = None
    for b in range(nb):
        u = b / max(1, nb - 1)
        fc = lo0 * (lo1 / lo0) ** u
        lo, hi = max(30, fc / width), min(SR / 2 - 100, fc * width)
        sos = butter(2, [lo, hi], "bandpass", fs=SR, output="sos")
        if zi is None:
            zi = sosfilt_zi(sos) * 0
        seg = x[b * block:(b + 1) * block]
        y, zi = sosfilt(sos, seg, zi=zi)
        out[b * block:b * block + len(y)] = y
    return out


class Bus:
    def __init__(self):
        self.b = np.zeros((N, 2))

    def add(self, x, t, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N or i + len(x) <= 0:
            return
        if i < 0:
            x = x[-i:]
            i = 0
        x = x[: N - i] * gain
        l, r = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2), np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        self.b[i:i + len(x), 0] += x * l
        self.b[i:i + len(x), 1] += x * r


# ----------------------------------------------------------------------------- instruments
def marimba(m, d=0.7, v=1.0, bright=1.0):
    f = mtof(m)
    t = tt(d)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.32)
         + 0.30 * bright * np.sin(2 * np.pi * f * 3.932 * t) * np.exp(-t / 0.06)
         + 0.07 * bright * np.sin(2 * np.pi * f * 9.54 * t) * np.exp(-t / 0.015))
    return fade(x * v, 0.002, 0.02)


def bell(m, d=1.3, v=1.0):
    f = mtof(m)
    t = tt(d)
    parts = [(1.0, 1.0, 0.9), (2.0, 0.30, 0.45), (2.76, 0.38, 0.32), (5.40, 0.16, 0.14), (8.93, 0.07, 0.06)]
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / dec) for r, a, dec in parts)
    return fade(x * v / 1.6, 0.001, 0.05)


def bass(m, d, v=1.0):
    f = mtof(m)
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.28 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)
    env = np.minimum(1, t / 0.005) * (0.75 * np.exp(-t / 0.28) + 0.25)
    x = np.tanh(1.6 * x * env) / np.tanh(1.6)
    return fade(x * v, 0.002, 0.03)


def kick(v=1.0, dur=0.42):
    t = tt(dur)
    f = 46 + 120 * np.exp(-t / 0.032)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.17) + 0.25 * filt(noise(len(t)), "lowpass", 4000) * np.exp(-t / 0.004)
    return fade(np.tanh(1.5 * x) * v, 0.0005, 0.02)


def clap(v=1.0):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    x = filt(noise(n), "bandpass", [900, 3200])
    env = np.zeros(n)
    for d in (0.0, 0.010, 0.021):
        env += (t >= d) * np.exp(-np.clip(t - d, 0, None) / 0.007)
    env += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) / 0.08) * 0.9
    return fade(x * env * v * 0.5, 0.0005, 0.02)


def hat(v=1.0, opn=False):
    d = 0.3 if opn else 0.06
    n = int(d * SR)
    t = np.arange(n) / SR
    x = filt(noise(n), "highpass", 7000) * np.exp(-t / (0.08 if opn else 0.013))
    return fade(x * v * 0.6, 0.0005, 0.01)


def saw(f, t):
    p = t * f
    return 2 * (p - np.floor(p + 0.5))


def pad(ms, d, v=1.0, cutoff=1500):
    t = tt(d)
    x = np.zeros(len(t))
    for m in ms:
        for det in (-0.07, 0.07):
            x += saw(mtof(m + det), t + rng.random())
    x = filt(x / (2 * len(ms)), "lowpass", cutoff)
    env = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.4)
    return x * env * v


def woodblock(m, v=1.0):
    t = tt(0.12)
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03) + 0.4 * filt(noise(len(t)), "bandpass", [f * 0.8, f * 2]) * np.exp(-t / 0.01)
    return fade(x * v, 0.0005, 0.01)


# ----------------------------------------------------------------------------- sound effects
def sfx_whistle(p):
    d = fr(p.get("dur", 16)) + 0.05
    t = tt(d)
    f = 1900 * (420 / 1900) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.01 * np.sin(2 * np.pi * 7 * t))) / SR
    x = np.sin(ph) * (0.25 + 0.75 * t / d)
    return fade(x * 0.32, 0.01, 0.02)


def sfx_thud(p):
    t = tt(0.9)
    f = 34 + 70 * np.exp(-t / 0.06)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
    crunch = filt(noise(len(t)), "lowpass", 2500) * np.exp(-t / 0.07) * 0.6
    clack = filt(noise(len(t)), "bandpass", [300, 1400]) * np.exp(-t / 0.03) * 0.8
    return fade(np.tanh(1.8 * (x + crunch + clack)) * p.get("gain", 1.0), 0.0005, 0.05)


def sfx_dust(p):
    t = tt(0.5)
    x = filt(noise(len(t)), "lowpass", 1200) * np.exp(-t / 0.15) * np.minimum(1, t / 0.02)
    return x * 0.35


def sfx_boing(p, base=170, d=0.38):
    t = tt(d)
    pitch = p.get("pitch", 1.0)
    f = base * pitch * (1 + 0.7 * (1 - np.exp(-t / 0.05))) * (1 + 0.1 * np.sin(2 * np.pi * 16 * t) * np.exp(-t / 0.15))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * np.minimum(1, t / 0.004)
    return fade(x * 0.45, 0.001, 0.03)


def sfx_pop(p):
    t = tt(0.09)
    pitch = p.get("pitch", 1.0)
    f = 500 * pitch * (1 + 1.4 * (t / 0.09))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)
    x += 0.3 * filt(noise(len(t)), "highpass", 3000) * np.exp(-t / 0.003)
    return fade(x * 0.5, 0.0005, 0.01)


def sfx_freeze(p):
    d = fr(p.get("dur", 30)) + 0.3
    n = int(d * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    # crackles of growing density
    k = 0
    while True:
        k += 1
        u = rng.random() ** 0.6
        pos = int(u * (n - 2000))
        if k > 140:
            break
        click = filt(noise(600), "bandpass", [2500, 9000]) * np.exp(-np.arange(600) / SR / 0.0025)
        out[pos:pos + 600] += click * (0.3 + 0.7 * rng.random())
    shimmer = np.sin(2 * np.pi * np.cumsum(2200 * (2.0 ** (t / d))) / SR) * 0.08 * np.minimum(1, t / 0.3) * np.exp(-np.clip(t - d + 0.4, 0, None) / 0.15)
    return fade((out * 0.5 + shimmer) * 0.55, 0.01, 0.1)


def sfx_shiver(p):
    d = fr(p.get("dur", 18))
    t = tt(d)
    x = (np.sin(2 * np.pi * 140 * t) + 0.4 * np.sin(2 * np.pi * 290 * t)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 22 * t)))
    x = filt(x, "lowpass", 900) * np.sin(np.pi * t / d)
    return x * 0.16


def sfx_whoosh(p):
    d = fr(p.get("dur", 18)) + 0.15
    t = tt(d)
    up = p.get("up", False)
    x = sweep_band(noise(len(t)), 500 if up else 3500, 3500 if up else 450)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return fade(x * env * 0.5, 0.005, 0.03)


PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96]


def sfx_sparkle(p):
    n_ = p.get("n", 5)
    out = np.zeros(int(0.15 * n_ * SR + 1.0 * SR))
    for i in range(n_):
        m = PENTA[min(len(PENTA) - 1, 3 + i + int(rng.integers(0, 3)))] + 12
        x = bell(m, 0.5, 0.35)
        pos = int(i * 0.045 * SR)
        out[pos:pos + len(x)] += x
    return out * 0.6


def sfx_knock(p):
    x = woodblock(66, 1.0) + 0.6 * woodblock(59, 0.6)
    t = tt(len(x) / SR)
    x += 0.4 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.02)
    return x * 0.7


def sfx_crack(p):
    t = tt(0.25)
    x = filt(noise(len(t)), "highpass", 2500) * np.exp(-t / 0.02)
    x += 0.3 * bell(100, 0.25, 0.4)[: len(t)]
    return x * 0.45


def tinkles(n_, span, lo=2000, hi=6500, dec=0.06):
    out = np.zeros(int((span + 0.4) * SR))
    for _ in range(n_):
        f = lo * (hi / lo) ** rng.random()
        t = tt(0.25)
        x = np.sin(2 * np.pi * f * t) * np.exp(-t / dec) * (0.3 + 0.7 * rng.random())
        pos = int(rng.random() ** 1.6 * span * SR)
        out[pos:pos + len(x)] += x
    return out


def sfx_shatter(p):
    t = tt(1.0)
    burst = filt(noise(len(t)), "highpass", 1800) * np.exp(-t / 0.18)
    thump = np.sin(2 * np.pi * np.cumsum(60 + 80 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.12)
    x = burst * 0.6 + thump * 0.5
    tk = tinkles(30, 0.7)
    out = np.zeros(max(len(x), len(tk)))
    out[: len(x)] += x
    out[: len(tk)] += tk * 0.35
    return fade(out * 0.75 * p.get("gain", 1.0), 0.0005, 0.05)


def sfx_stomp(p):
    t = tt(0.7)
    boom = np.sin(2 * np.pi * np.cumsum(40 + 90 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.22)
    crunch = filt(noise(len(t)), "bandpass", [400, 4000]) * np.exp(-t / 0.12)
    return fade(np.tanh(1.5 * (boom + 0.7 * crunch)) * 0.8, 0.0005, 0.05)


def sfx_rise(p):
    d = fr(p.get("dur", 40))
    out = np.zeros(int((d + 1.2) * SR))
    steps = 10
    for i in range(steps):
        m = PENTA[i] + (0 if i < 6 else 0)
        x = bell(m, 0.9, 0.5 + 0.05 * i)
        pos = int(i / steps * d * SR)
        out[pos:pos + len(x)] += x
    t = np.arange(len(out)) / SR
    shimmer = sweep_band(noise(len(out)), 3000, 9000) * np.exp(-np.clip(t - d, 0, None) / 0.2) * np.minimum(1, t / 0.2) * 0.25
    return (out * 0.42 + shimmer)


def sfx_snore(p):
    t = tt(1.3)
    breath = filt(noise(len(t)), "bandpass", [200, 900]) * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * t))
    tone = np.sin(2 * np.pi * (95 + 20 * t) * t) * 0.6
    env = np.sin(np.pi * t / 1.3) ** 2
    return (breath * 0.5 + tone) * env * 0.2


def sfx_step(p):
    t = tt(0.06)
    return filt(noise(len(t)), "lowpass", 900) * np.exp(-t / 0.012) * 0.35


DING = [72, 74, 76, 79, 81, 84, 86, 88]  # C major pentatonic, rising with each row


def sfx_ding(p):
    m = DING[p.get("step", 0)]
    x = bell(m, 1.4, 1.0)
    hi = bell(m + 12, 0.6, 0.35)
    x[: len(hi)] += hi
    return x * 0.5


def sfx_punch(p):
    t = tt(0.4)
    thump = np.sin(2 * np.pi * np.cumsum(55 + 140 * np.exp(-t / 0.025)) / SR) * np.exp(-t / 0.09)
    crack = filt(noise(len(t)), "bandpass", [900, 5000]) * np.exp(-t / 0.025)
    crunch = filt(noise(len(t)), "bandpass", [300, 2500]) * np.exp(-t / 0.09) * 0.5
    tk = tinkles(10, 0.25, 1500, 4000, 0.04)[: len(t)]
    x = thump + crack + crunch
    x[: len(tk)] += tk * 0.25
    return fade(np.tanh(1.6 * x) * 0.8, 0.0003, 0.03)


def sfx_chime(p):
    notes = p.get("notes", [72, 76])
    out = np.zeros(int(1.3 * SR))
    for i, m in enumerate(notes):
        x = marimba(m + 12, 0.9, 0.8) + 0.4 * bell(m + 12, 0.9, 0.5)
        pos = int(i * 0.08 * SR)
        out[pos:pos + len(x)] += x[: len(out) - pos]
    return out * 0.4


def sfx_rumble(p):
    d = fr(p.get("dur", 30)) + 0.3
    t = tt(d)
    x = filt(noise(len(t)), "lowpass", 140) * 3 + 0.5 * np.sin(2 * np.pi * 41 * t)
    env = np.minimum(1, t / (d * 0.7)) * np.minimum(1, (d - t) / 0.2)
    return x * env * 0.35


def sfx_riser(p):
    d = fr(p.get("dur", 30))
    t = tt(d)
    nz = sweep_band(noise(len(t)), 400, 7000, 1.8)
    tone = np.sin(2 * np.pi * np.cumsum(180 * (6.0 ** (t / d))) / SR) * 0.35
    env = (t / d) ** 2
    return fade((nz * 0.6 + tone) * env * 0.5, 0.01, 0.004)


def sfx_bighit(p):
    t = tt(2.2)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 70 * np.exp(-t / 0.07)) / SR) * np.exp(-t / 0.55)
    crash = filt(noise(len(t)), "highpass", 4500) * np.exp(-t / 0.55) * 0.5
    metal = sum(np.sin(2 * np.pi * f * t) for f in (3150, 4270, 5530, 6890)) * np.exp(-t / 0.35) * 0.04
    sh = sfx_shatter({"gain": 0.8})
    x = np.tanh(1.4 * boom) + crash + metal
    x[: len(sh)] += sh * 0.6
    return fade(x * 0.85, 0.0003, 0.2)


def sfx_confetti(p):
    out = np.zeros(int(1.4 * SR))
    for _ in range(90):
        pos = int(rng.random() ** 1.3 * 1.1 * SR)
        n = 300
        x = filt(noise(n), "highpass", 3000) * np.exp(-np.arange(n) / SR / 0.002)
        out[pos:pos + n] += x * rng.random()
    return out * 0.18


def sfx_clap(p):
    t = tt(0.25)
    x = filt(noise(len(t)), "bandpass", [800, 3500]) * np.exp(-t / 0.018)
    x += 0.5 * np.sin(2 * np.pi * 240 * t) * np.exp(-t / 0.02)
    return fade(x * 0.9, 0.0003, 0.02)


def sfx_tick(p):
    return woodblock(84 + 2 * (p.get("pitch", 1) - 1) * 10, 0.5) * 0.45


SFX = {
    "whistle": sfx_whistle, "thud": sfx_thud, "dust": sfx_dust, "boing": sfx_boing,
    "boing_small": lambda p: sfx_boing({"pitch": 1.5}, 170, 0.25) * 0.6, "pop": sfx_pop, "freeze": sfx_freeze,
    "shiver": sfx_shiver, "whoosh": sfx_whoosh, "sparkle": sfx_sparkle, "knock": sfx_knock, "crack": sfx_crack,
    "shatter": sfx_shatter, "stomp": sfx_stomp, "rise": sfx_rise, "snore": sfx_snore, "step": sfx_step,
    "ding": sfx_ding, "punch": sfx_punch, "chime": sfx_chime, "rumble": sfx_rumble, "riser": sfx_riser,
    "bighit": sfx_bighit, "confetti": sfx_confetti, "clap": sfx_clap, "tick": sfx_tick,
}
SFX_PAN = {"knock": -0.3, "crack": -0.3, "shatter": -0.25, "stomp": 0.25, "snore": 0.1}


# ----------------------------------------------------------------------------- music
CHORDS = {
    "C": (36, [60, 64, 67, 72]),
    "Am": (45, [57, 60, 64, 69]),
    "F": (41, [57, 60, 65, 69]),
    "G": (43, [55, 59, 62, 67]),
}
BARS = [(10, "C"), (14, "Am"), (18, "F"), (22, "G"), (26, "C"), (30, "Am"), (34, "F"), (38, "G"),
        (42, "Am"), (46, "F"), (50, "G"), (54, "C"), (58, "C")]


def build_music():
    m = Bus()
    b2t = lambda b: b * BEAT
    groove0 = TL["music"]["groove_start"] / FPS / BEAT  # beat 10
    drop = TL["music"]["drop_start"] / FPS / BEAT  # beat 43
    hit = TL["music"]["hit"] / FPS / BEAT  # beat 45
    cta = TL["music"]["cta"] / FPS / BEAT  # beat 54
    end_b = DUR / BEAT  # 60
    # --- intro: low suspense drone + ticking clock while frozen
    m.add(pad([36, 43], b2t(groove0) - 0.55, 0.55, 700), 0.55)
    for b in range(2, int(groove0)):
        m.add(woodblock(79 if b % 2 == 0 else 74, 0.35), b2t(b), 0.5, -0.2 if b % 2 else 0.2)
    # --- groove bars
    for (b0, ch) in BARS:
        root, tones = CHORDS[ch]
        final = b0 >= 58
        for beat in range(4):
            b = b0 + beat
            if b >= end_b:
                break
            in_drop = drop <= b < hit + 1
            t = b2t(b)
            # drums
            if not in_drop and not final:
                if beat in (0, 2):
                    m.add(kick(0.9 if b < cta else 0.7), t, 1.0)
                if beat in (1, 3):
                    m.add(clap(0.55), t, 1.0, 0.05)
                for e in range(2):
                    m.add(hat(0.5 if e == 0 else 0.3), t + e * BEAT / 2, 1.0, 0.25)
                if beat == 3:
                    m.add(hat(0.25, True), t + BEAT / 2, 1.0, 0.25)
            # bass line
            if not in_drop and not final:
                pattern = {0: [(0, root, 0.42)], 1: [(0.5, root, 0.2)], 2: [(0, root + 7, 0.4)], 3: [(0, root + 12, 0.2), (0.5, root + 7, 0.2)]}[beat]
                for off, note, d in pattern:
                    m.add(bass(note, d, 0.55), t + off * BEAT)
            # marimba arpeggio (8ths)
            if not in_drop and not final:
                seq = [0, 1, 2, 3, 2, 1, 2, 1]
                for e in range(2):
                    idx = seq[(beat * 2 + e) % 8]
                    oct_ = 12 if b >= hit + 1 else 0
                    m.add(marimba(tones[idx] + oct_, 0.6, 0.30 if e == 0 else 0.22), t + e * BEAT / 2, 1.0, -0.15 if idx % 2 else 0.15)
        # bar pad
        if not final:
            m.add(pad([n - 12 for n in tones[:3]], b2t(4) + 0.3, 0.16), b2t(b0))
    # --- drop: hold Am pad and let the riser/rumble carry tension
    m.add(pad([45, 52, 57, 60], b2t(hit - drop) + 0.2, 0.22, 900), b2t(drop))
    # --- hit: big C major stab
    for n in (48, 55, 60, 64, 67, 72):
        m.add(marimba(n + 12, 1.2, 0.35), b2t(hit))
    m.add(bass(36, 0.9, 0.8), b2t(hit))
    m.add(pad([48, 55, 60, 64], 1.6, 0.25, 2500), b2t(hit))
    # --- CTA: resolution stab + rising bell arpeggio
    for i, n in enumerate([72, 76, 79, 84]):
        m.add(bell(n, 1.6, 0.6), b2t(cta) + i * 0.09)
    m.add(pad([48, 52, 55, 60, 64], b2t(end_b - cta) + 0.1, 0.22, 2200), b2t(cta))
    # final chord (beat 58) rings to the end
    for n in (60, 64, 67, 72, 76):
        m.add(marimba(n, 1.0, 0.3), b2t(58))
    m.add(bass(36, b2t(end_b - 58), 0.6), b2t(58))
    m.add(kick(0.6), b2t(58))
    return m.b


# ----------------------------------------------------------------------------- narration
def load_vo(cid):
    sr, x = wavfile.read(os.path.join(HERE, "narration", f"{cid}.wav"))
    x = x.astype(np.float64) / 32768.0 if x.dtype == np.int16 else x.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        g = np.gcd(SR, sr)
        x = resample_poly(x, SR // g, sr // g)
    x = filt(x, "highpass", 85)
    # level-match clips: RMS over voiced samples -> -17 dBFS, peaks capped at -2 dBFS
    v = x[np.abs(x) > 0.02 * np.abs(x).max()]
    rms = np.sqrt(np.mean(v ** 2)) if len(v) else 1e-3
    x *= 10 ** (-17 / 20) / rms
    pk = np.abs(x).max()
    if pk > 10 ** (-2 / 20):
        x *= 10 ** (-2 / 20) / pk
    return x


def build_vo():
    vo = Bus()
    spans = []
    for cid, f in TL["vo"].items():
        x = load_vo(cid)
        vo.add(x, fr(f), 1.0, 0.0)
        spans.append((cid, fr(f), fr(f) + len(x) / SR))
    return vo.b, spans


def duck_curve(vo, depth_db=-9.0, att=0.04, rel=0.30):
    env = np.abs(vo).max(axis=1)
    win = int(0.03 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    active = (env > 0.01).astype(np.float64)
    target = 1 - (1 - 10 ** (depth_db / 20)) * active
    g = np.empty_like(target)
    a_att, a_rel = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    cur = 1.0
    # one-pole smoothing (vectorised in chunks would be faster; this is ~1.4M samples, fine)
    for i in range(len(target)):
        a = a_att if target[i] < cur else a_rel
        cur = a * cur + (1 - a) * target[i]
        g[i] = cur
    return g


def main():
    os.makedirs(os.path.join(ROOT, "build", "stems"), exist_ok=True)
    music = build_music()
    sfx = Bus()
    for name, f, p in TL["sfx"]:
        x = SFX[name](p)
        sfx.add(x, fr(f), 1.0, SFX_PAN.get(name, 0.0))
    vo, spans = build_vo()
    g = duck_curve(vo)
    music_d = music * g[:, None]
    sfx_d = sfx.b * (0.55 + 0.45 * g)[:, None]
    mix = 0.62 * music_d + 0.80 * sfx_d + 1.0 * vo
    # gentle bus glue + safety limiter (soft knee), then peak-normalise to -1 dBFS
    mix = np.tanh(mix * 1.15) / 1.15
    mix *= 10 ** (-1 / 20) / np.abs(mix).max()
    # final 30 ms fade-out to guarantee a click-free end
    nf = int(0.03 * SR)
    mix[-nf:] *= np.linspace(1, 0, nf)[:, None]
    wavfile.write(os.path.join(ROOT, "build", "mix.wav"), SR, mix.astype(np.float32))
    for name, b in (("music", 0.62 * music_d), ("sfx", 0.8 * sfx_d), ("vo", vo)):
        wavfile.write(os.path.join(ROOT, "build", "stems", f"{name}.wav"), SR, b.astype(np.float32))
    with open(os.path.join(ROOT, "build", "vo_spans.json"), "w") as fh:
        json.dump([{"id": c, "start": round(a, 3), "end": round(b, 3)} for c, a, b in spans], fh, indent=2)
    print("mix peak", float(np.abs(mix).max()), "samples", len(mix), "dur", len(mix) / SR)
    for c, a, b in spans:
        print(f"  VO {c:10s} {a:6.2f}s -> {b:6.2f}s")


if __name__ == "__main__":
    main()
