#!/usr/bin/env python3
"""Original score + sound design for "Not My Life" (25.000 s, 120 BPM, D minor). No voice, no samples.

Everything is synthesized here from oscillators and noise (numpy/scipy), so the music is an
original composition owned with this project (see source-selection.md: music origin/license).

Loop: events are rendered on a timeline from -2 s to 31 s and then folded modulo 25 s, so
reverb tails and the approach whoosh that run past 25 s continue seamlessly at 0 s, and
pre-roll before 0 s lands at the end. The limiter is computed circularly, so the output is
exactly periodic (last sample -> first sample is continuous).

Outputs (build/audio/): music.wav, sfx.wav, mix_full.wav (music+SFX), mix_nomusic.wav (SFX only), 48 kHz stereo 24-bit.
"""
import json, os, subprocess, sys
import numpy as np
import scipy.signal as ss

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
OUT = 'build/audio'
os.makedirs(OUT, exist_ok=True)
SR = 48000
L = 25.0
N = int(SR * L)
PRE, POST = 2.0, 6.0
TOT = int(SR * (PRE + L + POST))
BEAT = 0.5
rng = np.random.default_rng(20261111)

def idx(t): return int(round((t + PRE) * SR))
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(n): return np.arange(n) / SR

class Bus:
    def __init__(self): self.x = np.zeros((2, TOT))
    def add(self, t, sig, pan=0.0, gain=1.0):
        sig = np.asarray(sig, dtype=np.float64)
        if sig.ndim == 1:
            a = (pan + 1) * np.pi / 4
            sig = np.vstack([sig * np.cos(a), sig * np.sin(a)]) * np.sqrt(2)
        i = idx(t)
        n = sig.shape[1]
        lo, hi = max(i, 0), min(i + n, TOT)
        if hi > lo:
            self.x[:, lo:hi] += gain * sig[:, lo - i:hi - i]

def sos(kind, f, order=2):
    return ss.butter(order, f, btype=kind, fs=SR, output='sos')
def filt(x, kind, f, order=2): return ss.sosfilt(sos(kind, f, order), x)
def env_adsr(n, a, d, s, r, hold):
    e = np.zeros(n); t = tt(n)
    A = int(a * SR); D = int(d * SR); H = int(hold * SR); R = int(r * SR)
    e[:A] = np.linspace(0, 1, A, endpoint=False) if A else 0
    e[A:A + D] = np.linspace(1, s, max(D, 1))[:len(e[A:A + D])]
    e[A + D:H] = s
    if H < n:
        rel = np.linspace(s, 0, max(R, 1)); m = min(len(rel), n - H); e[H:H + m] = rel[:m]; e[H + m:] = 0
    return e
def saw(freq, n, ph=0.0):
    dt = freq / SR; p = (ph + dt * np.arange(n)) % 1.0; y = 2 * p - 1
    m = p < dt; u = p[m] / dt; y[m] -= u + u - u * u - 1
    m = p > 1 - dt; u = (p[m] - 1) / dt; y[m] -= u * u + u + u + 1
    return y
def noise(n): return rng.standard_normal(n)
def pink(n):
    w = noise(n); b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    return ss.lfilter(b, a, w) * 3.5
def sweep_bp(x, f0, f1, q=1.2, steps=64):
    """band-pass with exponentially moving centre (block-wise)"""
    n = len(x); out = np.zeros(n); bl = int(np.ceil(n / steps)); zi = None
    for k in range(steps):
        a, b = k * bl, min(n, (k + 1) * bl)
        if a >= b: break
        fc = f0 * (f1 / f0) ** ((k + 0.5) / steps); bw = fc / q
        s = ss.butter(2, [max(20, fc - bw / 2), min(SR / 2 - 100, fc + bw / 2)], btype='band', fs=SR, output='sos')
        if zi is None or zi.shape != (s.shape[0], 2): zi = np.zeros((s.shape[0], 2))
        out[a:b], zi = ss.sosfilt(s, x[a:b], zi=zi)
    return out
def reverb_ir(rt60, n_sec, seed, damp=6000):
    n = int(n_sec * SR); t = tt(n); r = np.random.default_rng(seed)
    ir = np.vstack([r.standard_normal(n), r.standard_normal(n)]) * np.exp(-6.9 * t / rt60)
    ir = np.vstack([filt(ir[0], 'low', damp), filt(ir[1], 'low', damp)])
    ir[:, :int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
def reverb(bus_x, rt60, mix, seed, damp=6000):
    ir = reverb_ir(rt60, rt60 * 1.2, seed, damp)
    wet = np.vstack([ss.fftconvolve(bus_x[0], ir[0])[:TOT], ss.fftconvolve(bus_x[1], ir[1])[:TOT]])
    return bus_x + mix * wet

# ------------------------------------------------------------------ instruments
def pad(chord, t0, t1, cutoff, gain, bus, att=0.35, rel=1.4):
    n = int((t1 - t0 + rel) * SR)
    e = env_adsr(n, att, 0.4, 0.85, rel, t1 - t0)
    L_ = np.zeros(n); R_ = np.zeros(n)
    for m in chord:
        f = hz(m)
        for det, side in ((-0.09, 0), (0.0, 2), (0.08, 1)):
            v = saw(f * 2 ** (det / 12), n, rng.random())
            if side == 0: L_ += v
            elif side == 1: R_ += v
            else: L_ += 0.7 * v; R_ += 0.7 * v
    lp = sos('low', cutoff, 2)
    L_ = ss.sosfilt(lp, L_) * e; R_ = ss.sosfilt(lp, R_) * e
    bus.add(t0, np.vstack([L_, R_]) / (len(chord) * 2.2), gain=gain)

def pluck(m, t0, gain, bus, pan=0.0, dec=0.2, bright=3200):
    n = int((dec * 5 + 0.05) * SR); t = tt(n); f = hz(m)
    v = 0.6 * saw(f, n, rng.random()) + 0.4 * np.sin(2 * np.pi * f * t)
    hi = filt(v, 'low', bright) * np.exp(-t / (dec * 0.35))
    lo = filt(v, 'low', bright * 0.35) * np.exp(-t / dec)
    s = (hi * 0.5 + lo) * np.minimum(1, t / 0.002)
    bus.add(t0, s, pan=pan, gain=gain)

def sub(m, t0, dur, gain, bus, att=0.02, rel=0.25, drive=1.4):
    n = int((dur + rel) * SR); t = tt(n); f = hz(m)
    s = np.tanh(drive * (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t))) / np.tanh(drive)
    bus.add(t0, s * env_adsr(n, att, 0.05, 0.9, rel, dur), gain=gain)

def kick(t0, gain, bus, f0=115, f1=44, dec=0.38):
    n = int(0.6 * SR); t = tt(n)
    fr = f1 + (f0 - f1) * np.exp(-t / 0.045); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph) * np.exp(-t / dec) + 0.25 * filt(noise(n), 'band', [1500, 5000]) * np.exp(-t / 0.004)
    bus.add(t0, np.tanh(1.6 * s), gain=gain)

def clap(t0, gain, bus, pan=0.0):
    n = int(0.45 * SR); t = tt(n); nz = filt(noise(n), 'band', [900, 7000])
    e = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022, 0.034]): i = int(d * SR); e[i:] += np.exp(-(t[:n - i]) / (0.008 if k < 3 else 0.12))
    bus.add(t0, nz * e * 0.6, pan=pan, gain=gain)

def hat(t0, gain, bus, pan=0.0, dec=0.03):
    n = int(0.12 * SR); t = tt(n)
    bus.add(t0, filt(noise(n), 'high', 7000, 4) * np.exp(-t / dec), pan=pan, gain=gain)

def bell(m, t0, gain, bus, pan=0.0, dec=1.6):
    n = int(dec * 4 * SR); t = tt(n); f = hz(m)
    mod = 1.8 * np.exp(-t / 0.4) * np.sin(2 * np.pi * f * 3.5 * t)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / dec) * np.minimum(1, t / 0.003)
    bus.add(t0, s, pan=pan, gain=gain)

# ------------------------------------------------------------------ sound design
def impact(t0, gain, bus, depth=1.0):
    n = int(2.6 * SR); t = tt(n)
    fr = 36 + 70 * np.exp(-t / 0.07) * depth; ph = 2 * np.pi * np.cumsum(fr) / SR
    boom = np.sin(ph) * np.exp(-t / (0.55 * depth + 0.2))
    crack = filt(noise(n), 'band', [200, 4000]) * np.exp(-t / 0.035)
    air = filt(noise(n), 'high', 2500) * np.exp(-t / 0.5) * 0.12
    s = (np.tanh(1.4 * (boom + 0.35 * crack)) + air) * np.minimum(1, t / 0.0015)
    L_ = s + 0.06 * filt(noise(n), 'low', 800) * np.exp(-t / 0.3)
    R_ = s + 0.06 * filt(noise(n), 'low', 800) * np.exp(-t / 0.3)
    bus.add(t0, np.vstack([L_, R_]), gain=gain)

def whoosh(t0, dur, f0, f1, gain, bus, pan0=0.0, pan1=0.0, shape='peak_end', q=1.4):
    n = int(dur * SR); t = tt(n); u = t / dur
    nz = sweep_bp(pink(n), f0, f1, q=q)
    if shape == 'peak_end': e = np.sin(np.pi * 0.5 * u) ** 3 * np.minimum(1, (1 - u) / 0.06)
    elif shape == 'peak_start': e = (1 - u) ** 2 * np.minimum(1, u / 0.02)
    else: e = np.sin(np.pi * u) ** 2
    e = e / max(e.max(), 1e-9)
    p = pan0 + (pan1 - pan0) * u; a = (p + 1) * np.pi / 4
    s = nz * e; s /= max(np.abs(s).max(), 1e-9)
    bus.add(t0, np.vstack([s * np.cos(a), s * np.sin(a)]) * np.sqrt(2), gain=gain)

def riser(t0, dur, gain, bus, f0=180, f1=1800):
    n = int(dur * SR); t = tt(n); u = t / dur
    fr = f0 * (f1 / f0) ** (u ** 1.6); ph = 2 * np.pi * np.cumsum(fr) / SR
    tone = (np.sin(ph) + 0.5 * np.sin(2.01 * ph)) * u ** 2.2 * 0.25
    nz = sweep_bp(noise(n), 400, 9000, q=0.9) * u ** 2.5
    s = tone + nz / max(np.abs(nz).max(), 1e-9) * 0.7
    s *= np.minimum(1, (1 - u) / 0.01)
    bus.add(t0, np.vstack([s, np.roll(s, 37)]), gain=gain)

def reverse_swell(t_end, dur, gain, bus):
    n = int(dur * SR); t = tt(n)
    s = filt(noise(n), 'high', 1800) * np.exp(-t / (dur * 0.35))
    s = filt(s, 'low', 9000)[::-1]
    bus.add(t_end - dur, np.vstack([s, np.roll(s, 53)]), gain=gain)

def tick(t0, gain, bus, f=2400, pan=0.0):
    n = int(0.04 * SR); t = tt(n)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) + 0.4 * filt(noise(n), 'high', 3000) * np.exp(-t / 0.002)
    bus.add(t0, s, pan=pan, gain=gain)

def shutter(t0, gain, bus):
    for d, g in ((0.0, 1.0), (0.055, 0.7)):
        n = int(0.05 * SR); t = tt(n)
        s = filt(noise(n), 'band', [1800, 7000]) * np.exp(-t / 0.005) + 0.5 * np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.004)
        bus.add(t0 + d, s, gain=gain * g)

def ambience(t0, dur, gain, bus, kind):
    n = int(dur * SR); t = tt(n); u = t / dur
    fade = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3)
    if kind == 'underwater':
        b = filt(pink(n), 'low', 380) * 1.2
        L_, R_ = b, np.roll(b, 900)
        bus.add(t0, np.vstack([L_, R_]) * fade, gain=gain)
        for k in range(26):  # bubble chirps
            ts = t0 + rng.random() * (dur - 0.1); m = int(0.035 * SR); tm = tt(m)
            f = 380 + 600 * rng.random(); fr = f * (1 + 1.6 * tm / 0.035)
            c = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * tm / 0.035) ** 2
            bus.add(ts, filt(c, 'low', 1600), pan=rng.uniform(-0.7, 0.7), gain=gain * 0.5)
    elif kind == 'rain':
        a = filt(pink(n), 'band', [1800, 9000]); b = filt(pink(n), 'band', [1800, 9000])
        fl = 0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t)
        bus.add(t0, np.vstack([a, b]) * fade * fl * 0.5, gain=gain)
        hum = (np.sin(2 * np.pi * 110 * t) + 0.3 * np.sin(2 * np.pi * 220 * t)) * 0.05
        bus.add(t0, hum * fade, gain=gain)
    elif kind == 'space':
        s = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) for f in (41.2, 55.0, 61.7, 82.4)) * 0.18
        s *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.25 * t)
        air = filt(pink(n), 'band', [200, 1200]) * 0.15
        bus.add(t0, np.vstack([s + air, s + np.roll(air, 1200)]) * fade, gain=gain)
        for k in range(40):  # ember crackle
            ts = t0 + rng.random() * (dur - 0.05); m = int(0.01 * SR)
            bus.add(ts, filt(noise(m), 'high', 2500) * np.exp(-tt(m) / 0.0015), pan=rng.uniform(-0.8, 0.8), gain=gain * rng.uniform(0.15, 0.45))
    elif kind == 'world':  # low tonal drone under the payoff (sound design bed, not score)
        s = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) * g for f, g in ((36.7, 1.0), (55.0, 0.7), (73.4, 0.35), (110.0, 0.12)))
        s *= (0.55 + 0.45 * np.sin(np.pi * np.minimum(u, 1.0))) * 0.25
        bus.add(t0, np.vstack([s, np.roll(s, 300)]) * fade, gain=gain)
    elif kind == 'room':
        a = filt(pink(n), 'band', [150, 3000]) * 0.3; b = filt(pink(n), 'band', [150, 3000]) * 0.3
        bus.add(t0, np.vstack([a, b]) * fade, gain=gain)

# ================================================================== SCORE
M = Bus()
# chords (midi)
Dm9 = [50, 53, 57, 60, 64]; Bbmaj7 = [46, 50, 53, 57]; Asus = [45, 50, 52, 57]; Gm7 = [43, 50, 53, 58]
A7sus4 = [45, 50, 52, 55, 59]; Dm = [50, 53, 57, 62]; Bb9 = [46, 53, 57, 60, 62]; Gm9 = [43, 50, 53, 57, 58]; A7 = [45, 52, 55, 61]
Bbmaj9 = [46, 53, 57, 60, 62, 65]; FoverA = [45, 53, 57, 60, 65]; Gm11 = [43, 50, 55, 58, 60, 62]

# pads
pad(Dm9, 0.0, 2.0, 1100, 0.55, M); pad(Bbmaj7, 2.0, 3.0, 1100, 0.55, M, rel=0.3)
pad(Asus, 3.5, 4.0, 900, 0.35, M, att=0.2, rel=0.2)
pad(Gm7, 4.0, 5.0, 1400, 0.5, M); pad(A7sus4, 5.0, 6.0, 1700, 0.55, M)
pad(Dm, 6.0, 9.5, 1700, 0.5, M); pad(Bb9, 9.5, 12.5, 2000, 0.5, M); pad(Gm9, 12.5, 14.5, 2100, 0.5, M); pad(A7, 14.5, 16.0, 2400, 0.5, M)
pad(Bbmaj9, 16.0, 18.0, 3200, 0.62, M, att=0.08); pad(FoverA, 18.0, 20.0, 3000, 0.6, M); pad(Gm11, 20.0, 22.0, 2800, 0.6, M)
pad(Bbmaj7, 22.0, 23.5, 1800, 0.5, M); pad(A7sus4, 23.5, 25.0, 1300, 0.5, M, rel=1.6)

# sub / bass
sub(38, 0.0, 2.0, 0.42, M); sub(34, 2.0, 0.95, 0.42, M, rel=0.06)
for k in range(2): sub(33, 3.5 + k * 0.25, 0.12, 0.35, M, rel=0.08)
for k in range(4): sub(31 if k < 2 else 33, 4.0 + k * 0.5, 0.42, 0.38, M)
bass_plan = [(6.0, 9.5, 38), (9.5, 12.5, 34), (12.5, 14.5, 31), (14.5, 15.5, 33)]
for a, b, m in bass_plan:
    t = a
    while t < b - 1e-6:
        sub(m + (12 if int(round((t - a) / 0.25)) % 4 == 3 else 0), t, 0.2, 0.36, M, att=0.004, rel=0.05, drive=2.0); t += 0.25
for a, d, m in [(16.0, 2.0, 34), (18.0, 2.0, 33), (20.0, 2.0, 31), (22.0, 1.5, 34), (23.5, 1.5, 33)]:
    sub(m, a, d - 0.05, 0.42, M, att=0.05, rel=0.6)

# arpeggio (16ths) with ping-pong delay feel via alternating pans
arp_plan = [  # (start, end, chord tones, gain, bright)
    (0.0, 3.0, [62, 65, 69, 72, 76], 0.16, 2400), (3.5, 4.0, [69, 74, 76], 0.10, 2000),
    (4.0, 5.0, [62, 67, 70, 74], 0.18, 2800), (5.0, 6.0, [64, 67, 69, 74, 76], 0.2, 3400),
    (6.0, 9.5, [62, 65, 69, 74], 0.17, 3000), (9.5, 12.5, [62, 65, 70, 74], 0.17, 3400),
    (12.5, 14.5, [62, 67, 70, 74], 0.18, 3600), (14.5, 15.5, [64, 67, 69, 73], 0.18, 3800),
    (16.0, 22.0, [65, 69, 72, 74, 77], 0.12, 4200), (22.0, 25.0, [62, 65, 69, 72, 76], 0.15, 2600),
]
pattern = [0, 2, 1, 3, 2, 4, 3, 1]
for a, b, notes, g, br in arp_plan:
    t = a; k = int(round(a / 0.125))
    while t < b - 1e-6:
        m = notes[pattern[k % len(pattern)] % len(notes)]
        acc = 1.0 if k % 4 == 0 else 0.7
        pluck(m, t, g * acc, M, pan=0.35 if k % 2 else -0.35, dec=0.16, bright=br)
        pluck(m, t + 0.375, g * acc * 0.32, M, pan=-0.6 if k % 2 else 0.6, dec=0.16, bright=br * 0.6)  # dotted-8th echo
        t += 0.125; k += 1

# drums
for k in range(int((15.5 - 6.0) / 0.5)):
    t = 6.0 + k * 0.5
    if t < 9.5 and (k % 2 == 1): continue
    kick(t, 0.5 if t < 9.5 else 0.55, M)
for t in np.arange(9.5, 15.5, 1.0) + 0.5:
    if t < 15.5: clap(t, 0.32, M)
for t in np.arange(9.5, 15.5, 0.25):
    hat(t, 0.1 if (t * 4) % 2 else 0.16, M, pan=0.25)
for t in np.arange(12.5, 15.5, 0.125):
    if (t * 8) % 2: hat(t, 0.07, M, pan=-0.3, dec=0.02)
for t in (16.0, 18.0, 18.75, 20.0):
    kick(t, 0.6, M, f0=95, f1=40, dec=0.5)
for t in (17.0, 19.0, 21.0):
    clap(t, 0.4, M)
for t in np.arange(16.0, 22.0, 0.25):
    hat(t, 0.06, M, pan=0.4)
kick(22.0, 0.35, M, f0=90, f1=40, dec=0.6)

# shimmer bells
for k, m in enumerate([81, 86, 88, 93]): bell(m, 4.0 + k * 0.06, 0.09, M, pan=-0.5 + k * 0.33)
for k, m in enumerate([77, 81, 84, 89, 93]): bell(m, 16.0 + k * 0.09, 0.08, M, pan=0.5 - k * 0.25, dec=2.2)
for k, m in enumerate([74, 77, 81]): bell(m, 24.25 + k * 0.12, 0.05, M, pan=-0.3 + k * 0.3, dec=1.8)

# musical risers (reverse cymbal style)
reverse_swell(6.0, 1.6, 0.35, M); reverse_swell(16.0, 2.2, 0.45, M)

M.x = reverb(M.x, 2.4, 0.33, 1, damp=7000)

# black card: the score drops out completely 3.000-3.500 s (only the hit remains)
gate = np.ones(TOT); a, b = idx(3.0), idx(3.5); fl = int(0.008 * SR)
gate[a - fl:a] = np.linspace(1, 0, fl); gate[a:b] = 0; gate[b:b + fl] = np.linspace(0, 1, fl)
M.x *= gate

# ================================================================== SOUND DESIGN
X = Bus()
fps = 30
impact(0.0, 0.55, X, depth=0.7)                              # loop downbeat (soft)
shutter(54 / fps, 0.3, X)                                   # dive lands inside the photo
reverse_swell(3.0, 0.55, 0.6, X); impact(3.0, 0.85, X, depth=1.1)   # NEVER HAPPENED hard hit
tick(3.5, 0.25, X, f=1800); tick(3.75, 0.18, X, f=1800)      # tension ticks before it moves
whoosh(3.95, 0.9, 900, 5200, 0.32, X, -0.4, 0.4, shape='bell')  # "moved" air
riser(4.4, 1.6, 0.55, X)
whoosh(5.45, 0.65, 300, 2600, 0.65, X, 0.0, 0.2, shape='peak_end')  # card swipes up into depth
impact(6.0, 0.8, X)
ambience(6.0, 2.27, 0.85, X, 'underwater')
whoosh(8.27, 0.45, 3200, 500, 0.65, X, 0.2, -0.2, shape='peak_start')  # pull back into feed
offs = json.load(open('assets/ui/feed-proof-offsets.json'))['frames']
last = 0
for k, o in enumerate(offs):                                 # scroll ticks follow the real scroll distance
    if o['scroll'] - last >= 64:
        tick((248 + k) / fps, 0.22, X, f=2600, pan=0.15); last = o['scroll']
whoosh(271 / fps, 14 / fps, 400, 4200, 0.75, X, 0.0, 0.0, shape='peak_end')  # push into tile
impact(9.5, 0.75, X)
ambience(9.5, 3.0, 0.8, X, 'rain')
whoosh(362 / fps, 13 / fps, 600, 6000, 0.8, X, -0.8, 0.8, shape='peak_end', q=1.0)  # whip pan
impact(12.5, 0.8, X, depth=1.3)
ambience(12.5, 3.5, 0.95, X, 'space')
riser(14.6, 1.4, 0.55, X, f0=120, f1=2200)
whoosh(455 / fps, 25 / fps, 300, 5200, 0.75, X, 0, 0, shape='peak_end')  # push through
impact(16.0, 0.9, X, depth=1.25)
whoosh(16.02, 2.8, 4200, 260, 0.6, X, 0.4, -0.4, shape='peak_start', q=0.9)  # pull back reveals the world
ambience(16.0, 6.6, 0.75, X, 'room'); ambience(16.0, 6.6, 0.55, X, 'world')
tick(22.0, 0.28, X, f=2000)                                  # viewer closes to the grid (real cut)
whoosh(22.4, 4.4, 250, 3600, 0.6, X, -0.2, 0.15, shape='peak_end', q=1.1)  # approach: 22.4 -> 26.8 (= 1.8 s after the seam)

X.x = reverb(X.x, 1.6, 0.22, 2, damp=8000)

# ================================================================== fold, mix, limit, write
def fold(x):
    out = x[:, idx(0):idx(0) + N].copy()
    tail = x[:, idx(0) + N:]; out[:, :tail.shape[1]] += tail[:, :N]
    pre = x[:, :idx(0)]; out[:, N - pre.shape[1]:] += pre
    return out
music, sfx = fold(M.x), fold(X.x)

def lufs(x):
    p = f'{OUT}/_meas.wav'; write_wav(p, x / max(1e-9, np.abs(x).max()) * 0.5)
    r = subprocess.run(['ffmpeg', '-nostats', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    I = [l for l in r.stderr.splitlines() if l.strip().startswith('I:')][-1]
    return float(I.split()[1]) - 20 * np.log10(0.5 / max(1e-9, np.abs(x).max()))
def write_wav(p, x):
    import wave
    y = np.clip(x, -1, 1); y = (y.T * 8388607).astype(np.int32)
    b = np.zeros((y.shape[0], 2, 3), np.uint8)
    for c in range(2):
        v = y[:, c].astype(np.int64) & 0xFFFFFF
        b[:, c, 0] = v & 0xFF; b[:, c, 1] = (v >> 8) & 0xFF; b[:, c, 2] = (v >> 16) & 0xFF
    with wave.open(p, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR); w.writeframes(b.tobytes())
def circular_limit(x, ceiling=10 ** (-2.0 / 20), look=0.004, release=0.12):
    """peak limiter evaluated on three loop copies; the middle copy is returned -> exactly periodic."""
    x3 = np.concatenate([x, x, x], axis=1); pk = np.abs(x3).max(axis=0)
    w = int(look * SR); pk = ss.convolve(pk, np.ones(1), mode='same')
    from scipy.ndimage import maximum_filter1d
    pk = maximum_filter1d(pk, size=2 * w + 1)
    g = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    a = np.exp(-1 / (release * SR)); gs = np.empty_like(g); cur = 1.0
    for i in range(len(g)):  # attack instant (look-ahead window), smooth release
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]; gs[i] = cur
    gs = ss.sosfiltfilt(sos('low', 60), gs)
    return (x3 * np.minimum(gs, 1.0))[:, x.shape[1]:2 * x.shape[1]]

TARGET = -14.0
lm, lx = lufs(music), lufs(sfx)
music_n = music * 10 ** ((-16.5 - lm) / 20)      # music bed level
sfx_n = sfx * 10 ** ((-17.0 - lx) / 20)          # design level under the music
full = music_n + sfx_n
full *= 10 ** ((TARGET - lufs(full)) / 20)
full = circular_limit(full)
nom = sfx * 10 ** ((-15.0 - lx) / 20)
nom = circular_limit(nom)
write_wav(f'{OUT}/music.wav', circular_limit(music_n * 10 ** ((TARGET - lufs(music_n)) / 20)))
write_wav(f'{OUT}/sfx.wav', nom)
write_wav(f'{OUT}/mix_full.wav', full)
write_wav(f'{OUT}/mix_nomusic.wav', nom)
os.remove(f'{OUT}/_meas.wav')
seam = lambda x: float(np.abs(x[:, 0] - x[:, -1]).max())
print(json.dumps({'samples': int(N), 'seconds': N / SR, 'lufs_full': round(lufs(full), 2), 'lufs_nomusic': round(lufs(nom), 2),
                  'peak_full_dbfs': round(20 * np.log10(np.abs(full).max()), 2), 'seam_step_full': seam(full),
                  'typical_step_full': float(np.median(np.abs(np.diff(full, axis=1)))), 'seam_step_nomusic': seam(nom)}, indent=1))
