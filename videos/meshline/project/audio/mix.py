"""Original procedural soundtrack + SFX + narration mix for the Meshline 30s promo.

Everything here is synthesised from scratch (numpy/scipy oscillators, noise and filters):
no samples, loops or third-party audio. SFX timings come from build/events.json, which
is exported by the renderer (src/scene.mjs -> events()), so sound and picture share one
source of truth.

usage: python audio/mix.py build/events.json <narration_dir> build/mix.wav
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)


# ------------------------------------------------------------------ helpers
def t_arr(d):
    return np.arange(int(d * SR)) / SR


def env_ad(n, a=0.005, d=0.3, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4))
    return e


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100) / (SR / 2), "low", output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f / (SR / 2), "high", output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band", output="sos"), x)


def noise(d):
    return rng.standard_normal(int(d * SR))


def sweep(f0, f1, d, shape="exp"):
    t = t_arr(d)
    if shape == "exp":
        f = f0 * (f1 / f0) ** (t / d)
    else:
        f = f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def tv_bandpass(x, f0, f1, q=2.0, blocks=64):
    """time-varying bandpass by block processing (for whooshes)."""
    out = np.zeros_like(x)
    n = len(x)
    edges = np.linspace(0, n, blocks + 1).astype(int)
    for i in range(blocks):
        a, b = edges[i], edges[i + 1]
        k = i / max(1, blocks - 1)
        fc = f0 * (f1 / f0) ** k
        lo, hi = fc / (1 + 1 / q), fc * (1 + 1 / q)
        seg = x[max(0, a - 2048):b]
        y = bp(seg, max(30, lo), min(hi, 20000))
        out[a:b] = y[-(b - a):]
    return out


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= buf.shape[1] or len(sig) == 0:
        return
    j = min(buf.shape[1], i + len(sig))
    s = sig[: j - i] * gain
    lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += s * lg * 1.414
    buf[1, i:j] += s * rg * 1.414


# ------------------------------------------------------------------ instruments
def pluck(f, d=0.6, bright=1.0):
    t = t_arr(d)
    sig = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * t + k) for k in range(5))
    sig = sig * env_ad(len(t), 0.003, d * 0.35, 3)
    return lp(sig, 1800 + 3000 * bright)


def pad(freqs, d, a=0.4, r=0.6, cutoff=1800):
    t = t_arr(d)
    sig = np.zeros(len(t))
    for f in freqs:
        for det in (-0.12, 0.0, 0.13):
            ff = f * 2 ** (det / 12)
            ph = rng.uniform(0, 1)
            sig += 2 * ((ff * t + ph) % 1) - 1  # saw
    sig /= len(freqs) * 3
    e = np.minimum(1, t / a) * np.minimum(1, (d - t) / r).clip(0, 1)
    return lp(sig * e, cutoff, 2)


def kick(g=1.0):
    d = 0.35
    t = t_arr(d)
    f = 48 + 90 * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    click = hp(noise(0.006), 2000) * 0.25
    s[: len(click)] += click
    return s * g


def hat(d=0.05):
    return hp(noise(d), 7000) * env_ad(int(d * SR), 0.001, d * 0.4, 4) * 0.35


def clap_snare(g=1.0):
    s = np.zeros(int(0.25 * SR))
    for k, off in enumerate((0, 0.009, 0.019)):
        b = bp(noise(0.2), 900, 3200) * env_ad(int(0.2 * SR), 0.001, 0.06 if k < 2 else 0.14, 4)
        i = int(off * SR)
        s[i:i + len(b)] += b[: len(s) - i]
    return s * 0.6 * g


def bass(f, d):
    t = t_arr(d)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    s = np.tanh(1.6 * s) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.05).clip(0, 1)
    return lp(s, 600) * 0.7


def bell(f, d=1.0, g=1.0):
    t = t_arr(d)
    parts = [(1, 1.0, 1.0), (2.76, 0.4, 1.7), (5.4, 0.18, 2.6), (8.93, 0.08, 3.4)]
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k * 3 / d) for r, a, k in parts)
    return s * np.minimum(1, t / 0.002) * g * 0.5


# ------------------------------------------------------------------ SFX bank
def sfx(e):
    ty, g = e["type"], 1.0
    if ty == "crack":
        s = np.zeros(int(0.18 * SR))
        for k in range(5):
            b = hp(noise(0.012), 1500) * env_ad(int(0.012 * SR), 0.0005, 0.004, 3)
            i = int(rng.uniform(0, 0.12) * SR)
            s[i:i + len(b)] += b * rng.uniform(0.4, 1)
        s[:200] += np.sin(2 * np.pi * 3200 * t_arr(200 / SR)) * 0.6
        return s
    if ty == "clunk":
        i = e.get("i", 0)
        d = 0.5
        t = t_arr(d)
        thump = np.sin(2 * np.pi * np.cumsum(55 + 70 * np.exp(-t * 30)) / SR) * np.exp(-t * 14)
        knock = bp(noise(d), 500, 1800) * np.exp(-t * 40)
        base = [520, 690, 910][i % 3]
        ring = sum(a * np.sin(2 * np.pi * base * r * t) for r, a in ((1, 1), (2.41, 0.5), (3.9, 0.25))) * np.exp(-t * 12)
        return 0.9 * thump + 0.6 * knock + 0.22 * ring
    if ty == "tink":
        t = t_arr(0.25)
        return (np.sin(2 * np.pi * 2350 * t) + 0.5 * np.sin(2 * np.pi * 3710 * t)) * np.exp(-t * 26) * 0.5
    if ty == "buzz":
        t = t_arr(0.26)
        sq = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.5 + 0.5 * np.sin(2 * np.pi * 240 * t)
        gate = (np.sin(2 * np.pi * 23 * t) > -0.2).astype(float)
        return lp(sq * gate, 2500) * env_ad(len(t), 0.005, 0.2, 2) * 0.35
    if ty == "error":
        out = np.zeros(int(0.3 * SR))
        for k, f in enumerate((620, 470)):
            t = t_arr(0.09)
            b = np.sign(np.sin(2 * np.pi * f * t)) * np.minimum(1, (0.09 - t) / 0.01) * np.minimum(1, t / 0.003)
            i = int(k * 0.13 * SR)
            out[i:i + len(b)] += lp(b, 3000) * 0.3
        return out
    if ty == "boing":
        t = t_arr(0.32)
        f = 300 + 500 * np.sin(np.pi * t / 0.32) ** 0.5
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.005, 0.2, 2) * 0.45
    if ty == "rattle":
        out = np.zeros(int(0.75 * SR))
        for k in range(10):
            b = bp(noise(0.03), 1200, 5000) * env_ad(int(0.03 * SR), 0.001, 0.01, 3)
            i = int(k * 0.071 * SR)
            out[i:i + len(b)] += b * (0.6 + 0.4 * (k % 2))
        return out * 0.6
    if ty in ("whoosh", "whooshUp", "swish"):
        d = {"whoosh": 1.0, "whooshUp": 0.45, "swish": 0.28}[ty]
        f0, f1 = {"whoosh": (300, 2600), "whooshUp": (500, 3500), "swish": (900, 4000)}[ty]
        x = noise(d)
        s = tv_bandpass(x, f0, f1, 1.5, 48)
        t = t_arr(d)
        return s * np.sin(np.pi * t / d) ** 1.5 * 0.9
    if ty == "hop":
        t = t_arr(0.12)
        return np.sin(2 * np.pi * np.cumsum(110 + 60 * np.exp(-t * 40)) / SR) * np.exp(-t * 30) * 0.5
    if ty == "sigh":
        d = 0.7
        s = tv_bandpass(noise(d), 900, 380, 3, 32)
        t = t_arr(d)
        return s * np.sin(np.pi * t / d) ** 2 * 0.5
    if ty == "notice":
        out = np.zeros(int(0.3 * SR))
        for k, f in enumerate((880, 1320)):
            b = np.sin(2 * np.pi * f * t_arr(0.07)) * env_ad(int(0.07 * SR), 0.003, 0.04, 3)
            i = int(k * 0.09 * SR)
            out[i:i + len(b)] += b * 0.4
        return out
    if ty == "wave":
        return sfx({"type": "swish"}) * 0.6
    if ty == "idea":
        return bell(midi(84), 0.9, 0.8) + bell(midi(91), 0.9, 0.35)
    if ty == "appOpen":
        out = np.zeros(int(0.9 * SR))
        for k, m in enumerate((77, 81, 84, 89)):  # F5 A5 C6 F6 — Meshline motif
            b = bell(midi(m), 0.6, 0.55)
            i = int(k * 0.055 * SR)
            out[i:i + len(b)] += b[: len(out) - i]
        return out
    if ty == "ping":
        d = 1.2
        t = t_arr(d)
        base = np.sin(2 * np.pi * np.cumsum(1760 - 120 * t) / SR) * np.exp(-t * 4.5)
        out = base.copy()
        for k, dl in enumerate((0.19, 0.38)):
            i = int(dl * SR)
            out[i:] += base[: len(out) - i] * (0.35 / (k + 1))
        return out * 0.45
    if ty == "stretch":
        t = t_arr(0.42)
        f = 260 + 300 * (t / 0.42) ** 1.5 + 18 * np.sin(2 * np.pi * 22 * t)
        return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 2200) * env_ad(len(t), 0.05, 0.35, 1.5) * 0.3
    if ty == "zip":
        d = 0.55
        t = t_arr(d)
        tone = sweep(300, 2600, d) * 0.5
        air = tv_bandpass(noise(d), 600, 6000, 2, 40) * 0.8
        return (tone + air) * np.sin(np.pi * t / d) ** 0.8 * 0.8
    if ty == "snap":
        d = 1.3
        t = t_arr(d)
        thump = np.sin(2 * np.pi * np.cumsum(60 + 140 * np.exp(-t * 35)) / SR) * np.exp(-t * 10)
        click = np.zeros(len(t))
        click[:300] = hp(noise(300 / SR), 2500) * 0.8
        chord = bell(midi(77), d, 0.5) + bell(midi(81), d, 0.4) + bell(midi(84), d, 0.35)
        return thump * 0.9 + click + chord[: len(t)] * 0.8
    if ty == "tap":
        t = t_arr(0.03)
        return hp(noise(0.03), 3000) * np.exp(-t * 300) * 0.5 + np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 200) * 0.2
    if ty == "pop":
        t = t_arr(0.12)
        f = 380 + 900 * np.exp(-t * 45)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.002, 0.05, 3) * 0.7
    if ty == "slide":
        d = e.get("dur", 0.8)
        t = t_arr(d)
        f0, f1 = (500, 900) if e.get("dir", 1) > 0 else (900, 500)
        tone = sweep(f0, f1, d) * 0.18
        air = tv_bandpass(noise(d), 1500, 4500, 2, 32) * 0.5
        return (tone + air) * np.sin(np.pi * t / d) * 0.8
    if ty == "chime":
        ms = (88, 93) if e.get("hi") else (84, 89)
        out = np.zeros(int(1.0 * SR))
        for k, m in enumerate(ms):
            b = bell(midi(m), 0.8, 0.6)
            i = int(k * 0.08 * SR)
            out[i:i + len(b)] += b[: len(out) - i]
        return out
    if ty == "step":
        t = t_arr(0.09)
        return (lp(noise(0.09), 400) * 0.8 + np.sin(2 * np.pi * 85 * t) * 0.5) * np.exp(-t * 45) * 0.6
    if ty == "clap":
        body = np.sin(2 * np.pi * np.cumsum(90 + 150 * np.exp(-t_arr(0.3) * 40)) / SR) * np.exp(-t_arr(0.3) * 14)
        cl = clap_snare(1.4)
        sh = bell(midi(96), 1.0, 0.3)
        o2 = np.zeros(int(1.0 * SR))
        o2[: len(cl)] += cl
        o2[: len(body)] += body * 0.6
        o2[: len(sh)] += sh
        return o2
    if ty == "riser":
        d = 0.75
        t = t_arr(d)
        s = tv_bandpass(noise(d), 400, 8000, 2, 48) * 0.7 + sweep(200, 1600, d) * 0.25
        return s * (t / d) ** 2
    if ty == "impact":
        d = 2.2
        t = t_arr(d)
        boom = np.sin(2 * np.pi * np.cumsum(34 + 60 * np.exp(-t * 12)) / SR) * np.exp(-t * 2.2)
        burst = lp(noise(d), 3000) * np.exp(-t * 9) * 0.5
        return boom * 0.9 + burst
    if ty == "logoSweep":
        d = 0.7
        t = t_arr(d)
        return (sweep(400, 900, d) * 0.25 + tv_bandpass(noise(d), 2000, 7000, 2, 32) * 0.4) * np.sin(np.pi * t / d) ** 2
    if ty == "sparkle":
        out = np.zeros(int(1.2 * SR))
        for k, m in enumerate((89, 93, 96, 101)):
            b = bell(midi(m), 0.7, 0.35)
            i = int(k * 0.06 * SR)
            out[i:i + len(b)] += b[: len(out) - i]
        return out
    if ty == "shimmer":
        return bell(midi(100), 0.6, 0.25) + bell(midi(105), 0.6, 0.12)
    raise ValueError(ty)


# ------------------------------------------------------------------ music
def music():
    m = np.zeros((2, N))
    beat = 0.5
    # A: online groove (0 - 0.55), then tape-stop
    a = np.zeros((2, int(1.2 * SR)))
    place(a, kick(0.8), 0.0)
    arp = [65, 69, 72, 77, 72, 69, 65, 69, 72, 77]
    for k, n in enumerate(arp):
        place(a, pluck(midi(n), 0.4, 1.0), k * 0.125, 0.35, -0.3 + 0.6 * (k % 2))
    place(a, pad([midi(53), midi(57), midi(60)], 1.2, 0.02, 0.2, 2200), 0, 0.35)
    place(a, hat(), 0.25, 0.6)
    # tape stop from 0.55 s: read pointer slows to zero over 0.42 s
    ts, td = 0.55, 0.42
    n0, n1 = int(ts * SR), int((ts + td) * SR)
    tape = np.zeros((2, n1))
    tape[:, :n0] = a[:, :n0]
    pos = float(n0)
    for i in range(n0, n1):
        k = (i - n0) / (n1 - n0)
        pos += (1 - k) ** 1.6
        j = int(pos)
        if j + 1 >= a.shape[1]:
            break
        f = pos - j
        tape[:, i] = (a[:, j] * (1 - f) + a[:, j + 1] * f) * (1 - k ** 3)
    m[:, :n1] += tape
    # B: tension drone 0.9 - 7.7 (D minor colour), clock ticks
    d = t_arr(7.2)
    drone = (np.sin(2 * np.pi * midi(38) * d) + 0.5 * np.sin(2 * np.pi * midi(45) * d + 1)) * 0.22
    drone *= np.minimum(1, d / 1.5) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.35 * d))
    drone *= np.minimum(1, (7.2 - d) / 0.8).clip(0, 1)
    place(m, lp(drone, 900), 0.9, 1.0)
    swell = pad([midi(50), midi(57), midi(62), midi(65)], 3.6, 1.6, 1.2, 1200)
    place(m, swell, 4.0, 0.45)
    for k in range(int(1.5 / beat), int(7.5 / beat)):
        place(m, hat(0.02), k * beat, 0.35, 0.3 if k % 2 else -0.3)
    # brighten after app opens
    place(m, pad([midi(69), midi(72), midi(77)], 1.6, 0.3, 1.0, 2400), 6.75, 0.18)
    # C: discovery 7.6 - 11.5: pad + muted pluck pulse building
    place(m, pad([midi(50), midi(57), midi(62), midi(64)], 4.2, 0.6, 0.4, 1500), 7.5, 0.4)
    for k in range(int(7.75 / 0.25), int(11.5 / 0.25)):
        tt = k * 0.25
        prog = (tt - 7.75) / 3.75
        place(m, pluck(midi([62, 69, 64, 69][k % 4]), 0.25, 0.3 + 0.6 * prog), tt, 0.12 + 0.18 * prog, 0.25 if k % 2 else -0.25)
    # D: groove 11.5 - 23.5
    chords = [  # (root midi, pad notes, arp notes)
        (38, [50, 57, 62, 65], [62, 65, 69, 74]),   # Dm
        (34, [46, 53, 58, 62], [58, 62, 65, 70]),   # Bb
        (41, [53, 57, 60, 65], [60, 65, 69, 72]),   # F
        (36, [48, 55, 60, 64], [60, 64, 67, 72]),   # C
    ]
    start, bar = 11.5, 2.0
    for b in range(6):
        t0 = start + b * bar
        root, pn, an = chords[b % 4]
        place(m, pad([midi(n) for n in pn], bar + 0.3, 0.08, 0.3, 2000 + 300 * b), t0, 0.32)
        for k in range(4):
            place(m, bass(midi(root), 0.42), t0 + k * beat, 0.5)
            place(m, bass(midi(root + 12), 0.2), t0 + k * beat + 0.25, 0.25)
        for k in range(16):
            tt = t0 + k * 0.125
            if tt >= 23.45:
                break
            place(m, pluck(midi(an[[0, 1, 2, 3, 2, 1, 3, 2][k % 8]] + 12), 0.3, 1.0), tt, 0.12, -0.35 if k % 2 else 0.35)
    for k in range(int((23.5 - 11.5) / beat)):
        tt = 11.5 + k * beat
        place(m, kick(0.85 if tt >= 12.0 else 1.0), tt, 0.75)
        if tt >= 14.5 and k % 2 == 1:
            place(m, clap_snare(0.8), tt, 0.38)
        if tt >= 12.0:
            place(m, hat(), tt + 0.25, 0.45, 0.25)
            if tt >= 15.5:
                place(m, hat(0.03), tt, 0.25, -0.25)
    # E: end card resolution 24 - 30 (F major, Bb add9, F)
    place(m, pad([midi(n) for n in (41, 53, 57, 60, 65)], 4.2, 0.02, 0.8, 2600), 24.0, 0.42)
    place(m, pad([midi(n) for n in (46, 58, 62, 65, 72)], 2.3, 0.3, 0.6, 2400), 26.0, 0.0)
    place(m, pad([midi(n) for n in (41, 53, 60, 65, 69)], 3.0, 0.4, 2.2, 2200), 27.9, 0.42)
    for k in range(int((29.0 - 24.0) / beat)):
        tt = 24.0 + k * beat
        if k % 2 == 0 and tt < 28.0:
            place(m, kick(0.7), tt, 0.55)
        if tt < 28.0:
            place(m, hat(), tt + 0.25, 0.3)
    arp_end = [65, 69, 72, 77, 81, 77, 72, 69]
    for k in range(int((29.4 - 24.5) / 0.125)):
        tt = 24.5 + k * 0.125
        fade = 1 - max(0, (tt - 27.5) / 2.0)
        place(m, pluck(midi(arp_end[k % 8] + 12), 0.35, 0.9), tt, 0.13 * fade, -0.4 if k % 2 else 0.4)
    for k in range(4):
        place(m, bass(midi(41), 0.45), 24.0 + k * beat, 0.45)
    place(m, bass(midi(41), 2.0), 28.0, 0.35)
    return m


def reverb(x, t60=1.4, mix=0.18):
    n = int(t60 * SR)
    t = np.arange(n) / SR
    ir_l = rng.standard_normal(n) * np.exp(-6.9 * t / t60)
    ir_r = rng.standard_normal(n) * np.exp(-6.9 * t / t60)
    ir_l, ir_r = lp(ir_l, 5000), lp(ir_r, 5000)
    ir_l /= np.sqrt(np.sum(ir_l ** 2)); ir_r /= np.sqrt(np.sum(ir_r ** 2))
    wl = fftconvolve(x[0], ir_l)[: x.shape[1]]
    wr = fftconvolve(x[1], ir_r)[: x.shape[1]]
    return x * (1 - mix) + np.stack([wl, wr]) * mix


def limiter(x, ceiling=0.7, look_ms=4.0):
    """Look-ahead brickwall: windowed-min gain, smoothed with a Hann kernel no wider than the window."""
    from scipy.ndimage import minimum_filter1d
    peak = np.max(np.abs(x), axis=0)
    g = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    la = int(look_ms * SR / 1000)
    g = minimum_filter1d(g, size=2 * la + 1)
    w = np.hanning(2 * la + 1); w /= w.sum()
    g = np.convolve(g, w, mode="same")
    # slower release so gain recovery is not audible as distortion
    from scipy.signal import lfilter, lfilter_zi
    k = np.exp(-1 / (0.06 * SR))
    rel, _ = lfilter([1 - k], [1, -k], g, zi=lfilter_zi([1 - k], [1, -k]) * g[0])
    g = np.minimum(g, rel)  # instant attack (g), slow release (rel)
    return x * g


def compress(x, thr=0.12, ratio=3.0, att=0.005, rel=0.08):
    """Feed-forward RMS-ish compressor for the narration bus (evens out syllable peaks)."""
    from scipy.signal import lfilter
    ka, kr = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    rect = np.abs(x)
    fast = lfilter([1 - ka], [1, -ka], rect)
    slow = lfilter([1 - kr], [1, -kr], rect)
    env = np.maximum(fast * 0.5 + slow * 0.5, 1e-6) * 1.6
    gain = np.where(env > thr, (env / thr) ** (1 / ratio - 1), 1.0)
    return x * gain


def read_wav(path):
    with wave.open(str(path)) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if sr != SR:  # linear-phase resample via FFT
        from scipy.signal import resample_poly
        from math import gcd
        g = gcd(SR, sr)
        x = resample_poly(x, SR // g, sr // g)
    return x


def main():
    ev_path, nar_dir, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    cue = json.loads(ev_path.read_text())
    meta = json.loads((nar_dir / "narration_meta.json").read_text())

    mus = music()
    fx = np.zeros((2, N))
    for e in cue["events"]:
        place(fx, sfx(e), e["t"], e["gain"], e["pan"])

    # narration bus: gentle high-pass + presence, placed at the authored start times
    vo = np.zeros((2, N))
    vo_env = np.zeros(N)
    for ln in meta["lines"]:
        x = read_wav(nar_dir / ln["file"])
        x = hp(x, 90)
        x = x + 0.25 * bp(x, 2500, 5000)
        x = compress(x, thr=0.12, ratio=3.0)
        x /= np.max(np.abs(x)) + 1e-9
        place(vo, x, ln["start"], 1.0, 0.0)
        i0, i1 = int(ln["start"] * SR), int((ln["start"] + len(x) / SR) * SR)
        vo_env[i0:min(N, i1)] = 1
    # sidechain duck for music (fast attack, slow release)
    k_att, k_rel = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.35 * SR))
    from scipy.signal import lfilter
    sm = lfilter([1 - k_rel], [1, -k_rel], vo_env)
    sm = np.maximum(sm, lfilter([1 - k_att], [1, -k_att], vo_env))
    duck = 1 - 0.8 * np.clip(sm, 0, 1)

    mus = reverb(mus, 1.6, 0.22) * duck * 0.9
    fx = reverb(fx, 0.9, 0.12) * (1 - 0.6 * np.clip(sm, 0, 1))
    vo = reverb(vo, 0.6, 0.06)
    mix = mus + fx * 0.85 + vo

    # gentle fade-in of first 10 ms and last 0.5 s
    fi = np.minimum(1, np.arange(N) / (0.01 * SR))
    fo = np.minimum(1, (N - np.arange(N)) / (0.5 * SR))
    mix *= fi * fo
    mix = hp(mix, 25)
    # normalise then soft-limit peaks
    rms = np.sqrt(np.mean(mix ** 2))
    mix *= 0.135 / rms
    mix = limiter(mix, ceiling=0.70)  # -3.1 dBFS sample ceiling leaves headroom for AAC overshoot
    # QA: narration-to-bed ratio inside narration windows
    m = vo_env > 0
    bed = (mus + fx * 0.85)[:, m]
    ratio = 20 * np.log10(np.sqrt(np.mean(vo[:, m] ** 2)) / np.sqrt(np.mean(bed ** 2)))
    print(f"voice-to-bed ratio during narration: {ratio:.1f} dB")
    bed_all = mus + fx * 0.85
    report = []
    for ln in meta["lines"]:
        i0, i1 = int(ln["start"] * SR), int((ln["start"] + ln["duration"]) * SR)
        v = np.sqrt(np.mean(vo[:, i0:i1] ** 2)); bd = np.sqrt(np.mean(bed_all[:, i0:i1] ** 2))
        vs = np.sqrt(np.mean(bp(vo[0, i0:i1], 300, 4000) ** 2)); bs = np.sqrt(np.mean(bp(bed_all[0, i0:i1], 300, 4000) ** 2))
        row = {"id": ln["id"], "start": ln["start"], "text": ln["text"],
               "broadband_db": round(20 * np.log10(v / bd), 1), "speech_band_db": round(20 * np.log10(vs / bs), 1)}
        report.append(row)
        print(f"  {ln['id']} {ln['start']:5.2f}s  broadband {row['broadband_db']:5.1f} dB | 300-4k speech band {row['speech_band_db']:5.1f} dB  {ln['text']}")
    (out.parent / "voice_balance.json").write_text(json.dumps(report, indent=1))
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16).T.copy()
    out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    # stems for QA
    for name, sig in (("music", mus), ("sfx", fx), ("voice", vo)):
        s = (np.clip(sig / (np.max(np.abs(sig)) + 1e-9) * 0.8, -1, 1) * 32767).astype(np.int16).T.copy()
        with wave.open(str(out.parent / f"stem_{name}.wav"), "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes())
    print("mix ->", out, "rms", float(np.sqrt(np.mean(mix ** 2))), "peak", float(np.max(np.abs(mix))))


if __name__ == "__main__":
    main()
