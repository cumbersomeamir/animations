"""Original score + SFX for the Mello promo, synthesized with numpy/scipy (no samples).

Writes generated/music_sfx.wav and generated/mix.wav (48 kHz stereo).
Event times mirror the animation timeline in render.py.
"""
import json
import math
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import GEN, load_timeline  # noqa: E402

SR = 48000
DUR = 30.0
N = int(SR * DUR)
RNG = np.random.default_rng(2026)
TL = load_timeline()


def note(name):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "Eb": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1,
             "A": 0, "Bb": 1, "B": 2}
    pitch, octv = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[pitch] + 12 * (octv - 4)) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def place(buf, x, t0, gain=1.0, pan=0.0):
    a = int(round(t0 * SR))
    if x.ndim == 1:
        th = (clampf(pan, -1, 1) + 1) * math.pi / 4
        x = np.stack([x * math.cos(th), x * math.sin(th)], 1) * math.sqrt(2)
    if a < 0:
        x = x[-a:]
        a = 0
    n = min(len(x), N - a)
    if n > 0:
        buf[a:a + n] += x[:n] * gain


def clampf(x, a, b):
    return max(a, min(b, x))


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, f1, f2, order=2):
    return sosfilt(butter(order, [f1, f2], "band", fs=SR, output="sos"), x, axis=0)


def svf_bp(x, fc, damp=0.6):
    """Bandpass with a time-varying centre (fc array)."""
    y = np.empty_like(x)
    low = band = 0.0
    fca = np.asarray(fc, dtype=np.float64)
    f = 2 * np.sin(np.pi * np.clip(fca, 20, SR / 6) / SR)
    for i in range(len(x)):
        high = x[i] - low - damp * band
        band += f[i] * high
        low += f[i] * band
        y[i] = band
    return y


def fade(x, a=0.005, r=0.02):
    n = len(x)
    na, nr = min(int(a * SR), n), min(int(r * SR), n)
    if na:
        x[:na] *= np.linspace(0, 1, na)
    if nr:
        x[-nr:] *= np.linspace(1, 0, nr)
    return x


# ------------------------------------------------------------------ instruments
def pluck(f, d=0.6, bright=1.0):
    t = tt(d)
    y = np.zeros_like(t)
    for k in range(1, 8):
        y += (1 / k ** 1.4) * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (4 + 3.5 * k / bright))
    return fade(y * 0.5, 0.002, 0.05)


def marimba(f, d=1.2):
    t = tt(d)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 4.5) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18)
    y += 0.15 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t * 60)
    return fade(y * 0.6, 0.001, 0.08)


def bell(f, d=2.5, decay=1.6):
    t = tt(d)
    y = np.zeros_like(t)
    for ratio, amp, dk in ((1, 1.0, 1.0), (2.756, 0.45, 1.9), (5.404, 0.25, 3.2), (8.933, 0.12, 5.0)):
        y += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * decay * dk)
    return fade(y * 0.35, 0.002, 0.2)


def pad_note(f, d, att=1.2, rel=1.5):
    t = tt(d + rel)
    y = np.zeros((len(t), 2))
    for ch, det in ((0, -1), (1, 1)):
        s = np.zeros_like(t)
        for dt in (0.0, 0.0035 * det, -0.0021 * det):
            for k in range(1, 6):
                s += (0.55 ** (k - 1)) * np.sin(2 * np.pi * f * (1 + dt) * k * t + k * 0.7 + ch)
        y[:, ch] = s
    env = np.clip(t / att, 0, 1) ** 1.5
    env *= np.where(t > d, np.exp(-(t - d) / (rel / 3)), 1.0)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 0.23 * t)
    return y * (env * trem)[:, None] * 0.06


def noise(d):
    return RNG.normal(0, 1, int(d * SR))


def whoosh(d, f0, f1, curve=1.0, peak=0.6):
    x = noise(d)
    u = np.linspace(0, 1, len(x))
    fc = f0 * (f1 / f0) ** (u ** curve)
    y = svf_bp(x, fc, 0.9)
    env = np.sin(np.pi * np.clip(u / peak, 0, 1) * 0.5) * np.where(u > peak, 1 - (u - peak) / (1 - peak), 1)
    return fade(y * env * 0.5, 0.005, 0.03)


def click(d=0.03, f=3500):
    x = noise(d) * np.exp(-tt(d) * 220)
    return hp(x, f) * 0.6


def thud(f=60, d=0.5):
    t = tt(d)
    y = np.sin(2 * np.pi * (f * t + 30 * (1 - np.exp(-t * 20)) / 20)) * np.exp(-t * 9)
    y += 0.4 * lp(noise(d), 300) * np.exp(-t * 30)
    return fade(y * 0.9, 0.001, 0.05)


def boing(f0=180, d=0.45, up=True):
    t = tt(d)
    f = f0 * (1 + (0.9 if up else -0.4) * (1 - np.exp(-t * 6))) * (1 + 0.06 * np.sin(2 * np.pi * 18 * t) * np.exp(-t * 4))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 6) + 0.3 * np.sin(2 * ph) * np.exp(-t * 9)
    return fade(y * 0.5, 0.002, 0.05)


def zip_sound(d, f0=900, f1=2400, rate0=18, rate1=34):
    """Ratchety thread-wrap sound: fast ticks with rising pitch."""
    t = tt(d)
    rate = rate0 + (rate1 - rate0) * t / d
    ph = np.cumsum(rate) / SR
    gate = (np.sin(2 * np.pi * ph) > 0.6).astype(float)
    gate = lp(gate, 900)
    fc = f0 * (f1 / f0) ** (t / d)
    y = svf_bp(noise(d), fc, 0.5) * gate
    return fade(y * 0.6, 0.01, 0.05)


def blip(f1, f2, d=0.32):
    t = tt(d)
    y = np.where(t < 0.09, np.sin(2 * np.pi * f1 * t), np.sin(2 * np.pi * f2 * t)) * np.exp(-t * 9)
    return fade(y * 0.35, 0.002, 0.04)


def pop(f=500, d=0.12):
    t = tt(d)
    fr = f * (1 + 2.5 * np.exp(-t * 60))
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 35)
    return fade(y * 0.6, 0.001, 0.02)


def breath_swell(d, inhale=True):
    x = noise(d)
    u = np.linspace(0, 1, len(x))
    if inhale:
        fc = 500 + 1300 * u
        env = np.sin(np.pi * u) ** 0.8 * (0.4 + 0.6 * u)
    else:
        fc = 1600 - 1200 * u
        env = np.sin(np.pi * u) ** 0.7 * (1 - 0.5 * u)
    y = svf_bp(x, fc, 1.1)
    return fade(y * env * 0.35, 0.05, 0.1)


def reverb(x, secs=2.4, wet=0.3):
    n = int(secs * SR)
    t = np.arange(n) / SR
    irl = RNG.normal(0, 1, n) * np.exp(-t / (secs / 5))
    irr = RNG.normal(0, 1, n) * np.exp(-t / (secs / 5))
    irl, irr = lp(irl, 5000), lp(irr, 5000)
    irl /= np.sqrt((irl ** 2).sum())
    irr /= np.sqrt((irr ** 2).sum())
    yl = fftconvolve(x[:, 0], irl)[:len(x)]
    yr = fftconvolve(x[:, 1], irr)[:len(x)]
    return x * (1 - wet) + np.stack([yl, yr], 1) * wet * 1.6


# ------------------------------------------------------------------ score
def music_tense():
    """0-8.4 s: uneasy plucked ostinato + clock ticks + rising drone."""
    buf = np.zeros((N, 2))
    eighth = 60 / 112 / 2
    seq1 = ["D4", "A4", "F4", "A4", "D4", "Bb4", "F4", "A4"]
    seq2 = ["E4", "A4", "G4", "A4", "E4", "C5", "G4", "Bb4"]
    k = 0
    t = 0.0
    while t < 8.35:
        seq = seq1 if (k // 8) % 2 == 0 else seq2
        f = note(seq[k % 8]) * (1 + 0.004 * math.sin(k))
        place(buf, pluck(f, 0.5), t, 0.16, pan=0.35 if k % 2 else -0.35)
        if k % 2 == 0:
            place(buf, lp(pluck(note("D2"), 0.6, 0.5), 400), t, 0.55)
        t += eighth
        k += 1
    # clock ticks (16ths)
    t = 0.0
    k = 0
    while t < 8.3:
        place(buf, click(0.025, 4000), t, 0.10 if k % 4 == 0 else 0.045, pan=-0.5)
        t += eighth / 2
        k += 1
    # dissonant drone builds with the tangle
    td = tt(8.4)
    drone = (np.sin(2 * np.pi * note("D3") * td) + 0.8 * np.sin(2 * np.pi * note("Eb3") * td)
             + 0.3 * np.sin(2 * np.pi * note("A3") * td * 1.003))
    env = np.clip((td - 3.0) / 4.5, 0, 1) ** 1.5 * 0.06
    place(buf, np.stack([drone * env, drone * env], 1), 0.0)
    # filter sweep down after the tap: progressive low-pass by segments
    a, b = int(8.25 * SR), int(8.9 * SR)
    seg = buf[a:b].copy()
    chunks = np.array_split(np.arange(len(seg)), 12)
    for i, idx in enumerate(chunks):
        fc = 6000 * (0.08 ** (i / 11))
        seg[idx] = lp(seg[idx], max(fc, 200), 1) * (1 - i / 12)
    buf[a:b] = seg
    buf[b:] = 0
    return buf


CHORDS = [
    (9.3, ["D3", "A3", "F#4", "C#5", "E5"]),
    (13.6, ["B2", "F#3", "D4", "A4", "C#5"]),
    (16.2, ["G2", "D3", "B3", "F#4", "A4"]),
    (18.6, ["A2", "E3", "C#4", "E4", "B4"]),
    (21.2, ["D3", "A3", "F#4", "A4", "E5"]),
    (23.0, ["G2", "D3", "B3", "F#4", "D5"]),
    (24.4, ["E3", "B3", "D4", "G4", "B4"]),
    (25.4, ["A2", "E3", "D4", "E4", "A4"]),
    (26.2, ["D3", "A3", "F#4", "A4", "D5", "F#5"]),
]


def music_calm():
    buf = np.zeros((N, 2))
    for i, (t0, notes) in enumerate(CHORDS):
        t1 = CHORDS[i + 1][0] if i + 1 < len(CHORDS) else 30.5
        for nm in notes:
            place(buf, pad_note(note(nm), t1 - t0 + 0.3, att=1.0 if i else 0.7, rel=1.6), t0 - 0.15, 1.0)
        root = note(notes[0]) / 2
        tb = tt(t1 - t0 + 0.8)
        sub = np.sin(2 * np.pi * root * tb) * np.clip(tb / 0.6, 0, 1) * np.exp(-np.clip(tb - (t1 - t0), 0, None) * 4)
        place(buf, sub * 0.10, t0)
    # sparse bell arpeggio from the current chord
    t = 11.0
    k = 0
    while t < 28.6:
        ci = max(i for i, (c0, _) in enumerate(CHORDS) if c0 <= t)
        nts = CHORDS[ci][1][2:]
        f = note(nts[(k * 2) % len(nts)]) * 2
        place(buf, bell(f, 2.2, 1.4), t, 0.10, pan=math.sin(k * 1.3) * 0.6)
        t += 1.1 if k % 3 != 2 else 0.55
        k += 1
    return buf


def sfx():
    buf = np.zeros((N, 2))
    # --- scene 1 / 2: threads arrive
    place(buf, whoosh(0.5, 2500, 500, 0.8, 0.8), -0.05, 0.6, pan=-0.6)
    place(buf, boing(160, 0.5, up=False), 0.46, 0.5)
    place(buf, thud(90, 0.25), 0.46, 0.35)
    place(buf, zip_sound(0.55), 0.5, 0.35, pan=-0.1)
    place(buf, boing(220, 0.5, up=True), 1.02, 0.45, pan=0.2)
    place(buf, zip_sound(0.5, 1000, 2600), 1.42, 0.3, pan=0.15)
    place(buf, whoosh(0.7, 3000, 600, 1.0, 0.85), 2.05, 0.55, pan=0.7)
    place(buf, thud(130, 0.2), 2.74, 0.45)
    place(buf, click(0.04, 1500), 2.74, 0.8)
    place(buf, zip_sound(0.45, 1200, 2800), 2.78, 0.3, pan=0.4)
    place(buf, whoosh(0.5, 2800, 500, 0.9, 0.85), 2.95, 0.5, pan=-0.7)
    place(buf, zip_sound(0.45, 800, 2000), 3.45, 0.3, pan=-0.3)
    for k in range(5):  # stumble steps
        place(buf, thud(70, 0.18), 3.45 + k * math.pi / 7.5, 0.35, pan=0.2 * (-1) ** k)
    # alarm trill from the clock
    for k in range(10):
        place(buf, bell(note("E6") if k % 2 else note("F6"), 0.25, 9.0), 3.9 + k * 0.06, 0.06, pan=-0.6)
    place(buf, zip_sound(0.6, 700, 3000, 20, 45), 5.2, 0.35)
    place(buf, thud(55, 0.6), 5.82, 0.9)
    for tt0, f1, f2 in ((6.3, 1318, 1046), (6.95, 1396, 1108), (7.45, 1318, 988)):
        place(buf, blip(f1, f2), tt0, 0.35, pan=0.5 if tt0 > 6.5 else -0.4)
    # phone glow shimmer
    tg = tt(1.0)
    gl = np.sin(2 * np.pi * (1200 + 500 * tg) * tg) * np.sin(np.pi * tg) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tg))
    place(buf, gl * 0.05, 7.2, 1.0, pan=-0.3)
    # --- scene 3: tap, pop, wave
    place(buf, click(0.03, 2500), 8.3, 0.9, pan=-0.3)
    place(buf, bell(note("C7"), 1.6, 1.8), 8.3, 0.25, pan=-0.3)
    place(buf, bell(note("G6"), 1.6, 1.8), 8.33, 0.18, pan=-0.2)
    place(buf, boing(300, 0.6, up=True), 8.35, 0.4)
    place(buf, pop(420), 8.95, 0.7)
    place(buf, breath_swell(0.25, True), 9.05, 0.7)
    rev = whoosh(1.4, 300, 1800, 0.6, 0.25)
    place(buf, rev, 9.2, 0.7)
    for k, nm in enumerate(("D6", "F#6", "A6", "C#7", "E7")):
        place(buf, bell(note(nm), 2.4, 1.2), 9.3 + k * 0.07, 0.12, pan=-0.6 + k * 0.3)
    # --- scene 4: breathing
    place(buf, breath_swell(2.4, True), 11.2, 0.55)
    place(buf, breath_swell(2.6, False), 13.6, 0.6)
    place(buf, breath_swell(2.4, True), 16.2, 0.55)
    place(buf, breath_swell(2.6, False), 18.6, 0.6)
    rels = [(13.75, 15.3), (14.05, 15.6), (18.7, 20.3), (19.0, 20.6)]
    for i, (ra, rb) in enumerate(rels):
        place(buf, pop(700 + 120 * i, 0.1), ra + 0.25, 0.35, pan=(-0.4, 0.4)[i % 2])
        for k in range(6):
            nm = ("A6", "F#6", "D7", "E6", "B6", "C#7")[(k + i) % 6]
            place(buf, bell(note(nm), 1.4, 2.2), ra + 0.35 + k * 0.17, 0.05, pan=math.sin(k + i) * 0.8)
    place(buf, bell(note("D7"), 1.5, 1.6), 20.45, 0.1, pan=0.6)  # plant bloom
    # --- scene 5: platforms
    place(buf, whoosh(0.5, 200, 900, 1.0, 0.7), 21.35, 0.35)
    place(buf, pop(380, 0.14), 21.95, 0.45, pan=0.4)
    place(buf, pop(460, 0.14), 23.15, 0.45, pan=0.0)
    for tl, nm, pn in ((21.62, "D5", 0.0), (22.98, "F#5", 0.4), (24.36, "A5", 0.0)):
        place(buf, marimba(note(nm)), tl, 0.5, pan=pn)
        place(buf, marimba(note(nm) * 2, 0.8), tl + 0.02, 0.15, pan=pn)
    for tj, pn in ((22.62, 0.2), (24.02, 0.2)):
        place(buf, whoosh(0.35, 500, 1800, 1.0, 0.6), tj, 0.25, pan=pn)
        place(buf, thud(80, 0.15), tj + 0.36, 0.3)
    # --- scene 6: end card
    place(buf, whoosh(0.8, 400, 2400, 0.8, 0.8), 25.6, 0.3)
    for k, nm in enumerate(("D6", "F#6", "A6", "D7")):
        place(buf, bell(note(nm), 3.0, 0.9), 26.2 + k * 0.05, 0.13, pan=-0.4 + k * 0.27)
    for k in range(5):
        place(buf, pop(900 + 90 * k, 0.07), 26.25 + k * 0.06, 0.12)
    place(buf, pop(300, 0.18), 26.92, 0.5)
    for ts in (27.9, 29.0):
        tg = tt(0.7)
        sh = np.sin(2 * np.pi * (2500 + 2500 * tg) * tg) * np.sin(np.pi * tg / 0.7) ** 2
        place(buf, sh * 0.035, ts, 1.0, pan=-0.5)
    return buf


def duck_env(narr):
    env = np.abs(narr)
    win = int(0.04 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    on = (env > 0.02).astype(float)
    # attack 60 ms, release 350 ms smoothing via asymmetric one-pole on a decimated grid
    dec = 120
    o = on[::dec]
    sm = np.zeros_like(o)
    v = 0.0
    a_up = 1 - math.exp(-dec / (0.06 * SR))
    a_dn = 1 - math.exp(-dec / (0.35 * SR))
    for i, x in enumerate(o):
        v += (x - v) * (a_up if x > v else a_dn)
        sm[i] = v
    sm = np.interp(np.arange(len(narr)), np.arange(len(sm)) * dec, sm)
    return sm


def measure_lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    txt = r.stderr
    i = txt.rfind("Integrated loudness:")
    lufs = float(txt[i:].split("I:")[1].split("LUFS")[0])
    j = txt.rfind("True peak:")
    tp = float(txt[j:].split("Peak:")[1].split("dBFS")[0])
    return lufs, tp


def main():
    narr, sr = sf.read(os.path.join(GEN, "narration.wav"), dtype="float64")
    assert sr == SR
    narr = narr[:N] if len(narr) >= N else np.pad(narr, (0, N - len(narr)))
    tense = music_tense()
    calm = music_calm()
    calm = reverb(calm, 2.6, 0.35)
    fx = sfx()
    fx = reverb(fx, 1.6, 0.18)
    duck = duck_env(narr)
    music = (tense * 0.9 + calm * 1.0) * (1 - 0.5 * duck)[:, None]
    fx_d = fx * (1 - 0.3 * duck)[:, None]
    bed = music + fx_d
    # master fade at the very end
    tail = np.ones(N)
    a = int(28.9 * SR)
    tail[a:] = np.linspace(1, 0, N - a) ** 1.3
    bed *= tail[:, None]
    voice = np.stack([narr, narr], 1) * 1.0
    voice = hp(voice, 80)
    mix = bed * 0.55 + voice
    sf.write(os.path.join(GEN, "music_sfx.wav"), (bed * 0.55).astype(np.float32), SR, subtype="FLOAT")
    tmp = os.path.join(GEN, "_mix_tmp.wav")
    sf.write(tmp, mix.astype(np.float32), SR, subtype="FLOAT")
    lufs, tp = measure_lufs(tmp)
    target = -16.0
    g = 10 ** ((target - lufs) / 20)
    mix *= g
    # soft-knee limiter: above -4 dBFS, peaks approach (never reach) a -1.5 dBFS ceiling
    thr, ceil = 10 ** (-4.0 / 20), 10 ** (-1.5 / 20)
    over = np.abs(mix) > thr
    mix[over] = np.sign(mix[over]) * (thr + (ceil - thr) * np.tanh((np.abs(mix[over]) - thr) / (ceil - thr)))
    out = os.path.join(GEN, "mix.wav")
    sf.write(out, mix.astype(np.float32), SR, subtype="FLOAT")
    os.remove(tmp)
    lufs2, tp2 = measure_lufs(out)
    stats = dict(pre_gain_lufs=round(lufs, 2), applied_gain_db=round(20 * math.log10(g), 2),
                 integrated_lufs=round(lufs2, 2), true_peak_dbfs=round(tp2, 2),
                 sample_peak=round(float(np.abs(mix).max()), 4),
                 limited_samples=int(over.sum()),
                 samples_at_or_above_0dbfs=int((np.abs(mix) >= 1.0).sum()))
    with open(os.path.join(GEN, "audio_stats.json"), "w") as fh:
        json.dump(stats, fh, indent=2)
    print(json.dumps(stats))


if __name__ == "__main__":
    main()
