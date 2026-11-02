#!/usr/bin/env python3
"""Original music and SFX for WastePaisa education pilot 01 (numpy synthesis).

Everything here is generated from scratch (sines, noise, Karplus-Strong), with a
fixed RNG seed, so the stems are reproducible and carry no third-party rights.

  stems/music.wav   96 BPM, 6 bars = 15.000 s, D major "curious lab" cue
  stems/sfx.wav     action-timed effects (cue list below mirrors src/choreo.js)
"""
import json, os, wave
import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'stems')
rng = np.random.default_rng(20261102)

BPM = 96
BEAT = 60 / BPM          # 0.625 s
BAR = 4 * BEAT           # 2.5 s


def hz(note):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, o = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


def env_adsr(n, a=0.005, d=0.1, s=0.0, r=0.05, hold=None):
    t = np.arange(n) / SR
    e = np.zeros(n)
    a_n = max(1, int(a * SR))
    e[:a_n] = np.linspace(0, 1, a_n)
    rest = t[a_n:] - a
    e[a_n:] = s + (1 - s) * np.exp(-rest / max(d, 1e-4))
    if hold is not None:
        h = int(hold * SR)
        if h < n:
            e[h:] *= np.exp(-(t[h:] - hold) / max(r, 1e-4))
    return e


def add(buf, sig, t0, gain=1.0, pan=0.0):
    i0 = int(round(t0 * SR))
    if i0 >= len(buf):
        return
    sig = sig[: len(buf) - i0]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[i0:i0 + len(sig), 0] += sig * gain * l * 1.414
    buf[i0:i0 + len(sig), 1] += sig * gain * r * 1.414


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y


def onepole_lp(x, fc):
    # vectorised-ish one-pole via scipy-free recursion in chunks
    return lowpass(x, fc)


def bandnoise(n, f_lo, f_hi):
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < f_lo) | (f > f_hi)] = 0
    y = np.fft.irfft(spec, n)
    return y / (np.max(np.abs(y)) + 1e-9)


def sweep_noise(n, f0, f1, width=0.5):
    """Noise whose band centre sweeps f0->f1 (STFT-free approximation by segments)."""
    out = np.zeros(n); seg = 1024
    for i in range(0, n, seg // 2):
        k = i / max(1, n - 1)
        fc = f0 * (f1 / f0) ** k
        piece = bandnoise(seg, fc * (1 - width / 2), fc * (1 + width / 2)) * np.hanning(seg)
        j = min(n, i + seg); out[i:j] += piece[: j - i]
    return out / (np.max(np.abs(out)) + 1e-9)


# ---------------------------------------------------------------- instruments
def marimba(f, dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.28)
    s += 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.05)
    s += 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.015)
    click = bandnoise(n, 1500, 6000) * np.exp(-t / 0.003) * 0.15
    a = np.minimum(1, t / 0.002)
    return (s + click) * a


def pluck(f, dur=0.7, damp=0.996, bright=0.5):
    n = int(dur * SR); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p) * bright + (1 - bright) * np.sin(np.linspace(0, 2 * np.pi, p, endpoint=False))
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = damp * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    t = np.arange(n) / SR
    return out * np.minimum(1, t / 0.003)


def pad(freqs, dur, attack=0.4, release=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.005):
            s += np.sin(2 * np.pi * f * (1 + det) * t + rng.uniform(0, 6.28))
            s += 0.18 * np.sin(2 * np.pi * 2 * f * (1 + det) * t)
    e = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release).clip(0, 1)
    return s * e / (len(freqs) * 3)


def shaker(dur=0.06):
    n = int(dur * SR); t = np.arange(n) / SR
    return bandnoise(n, 5000, 14000) * np.exp(-t / 0.018) * np.minimum(1, t / 0.004)


def woodblock(f=900, dur=0.12):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.025) + 0.3 * bandnoise(n, 1500, 4000) * np.exp(-t / 0.004)


def bell(f, dur=1.6, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for k, (ratio, amp, dec) in enumerate([(1, 1, 0.9), (2.0, 0.5, 0.5), (3.01, 0.3 * bright, 0.25), (4.2, 0.2 * bright, 0.12), (5.43, 0.1 * bright, 0.08)]):
        s += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / dec)
    return s * np.minimum(1, t / 0.002) / 2.1


# ---------------------------------------------------------------- music
def music():
    buf = np.zeros((N + SR, 2))
    chords = [  # (bar, beat offset, duration beats, chord tones, bass)
        (0, 0, 4, ['D4', 'F#4', 'A4', 'E5'], 'D2'),
        (1, 0, 4, ['B3', 'D4', 'F#4', 'A4'], 'B1'),
        (2, 0, 4, ['G3', 'B3', 'D4', 'F#4'], 'G1'),
        (3, 0, 2, ['E3', 'G3', 'B3', 'D4'], 'E2'),
        (3, 2, 2, ['A3', 'D4', 'E4', 'G4'], 'A1'),
        (4, 0, 2, ['B3', 'D4', 'F#4', 'A4'], 'B1'),
        (4, 2, 2, ['G3', 'B3', 'D4', 'F#4'], 'G1'),
        (5, 0, 1.5, ['A3', 'D4', 'E4', 'G4'], 'A1'),
        (5, 1.5, 2.5, ['D4', 'F#4', 'A4', 'E5'], 'D2'),
    ]
    STOP = (9.52, 9.92)  # comedic rest when the film snaps back
    for bar, off, beats, tones, bass in chords:
        t0 = bar * BAR + off * BEAT
        d = beats * BEAT
        add(buf, pad([hz(x) for x in tones], d + 0.5), t0, 0.10)
        # pizzicato bass on beats 1 and 3 (+ pickup)
        for b in np.arange(0, beats, 2):
            tb = t0 + b * BEAT
            if bar == 0 and b == 0:
                continue
            if not (STOP[0] - 0.05 < tb < STOP[1]):
                add(buf, pluck(hz(bass) * 2, 0.6, 0.994, 0.35), tb, 0.36, -0.1)
    # marimba motif (question shape) in bar 1, groove arpeggios afterwards
    motif = [(0.0, 'D5'), (0.5, 'F#5'), (1.0, 'A5'), (1.75, 'B5'), (2.25, 'A5'), (2.75, 'E5')]
    for b, nt in motif:
        add(buf, marimba(hz(nt)), b * BEAT, 0.30, 0.25)
    arps = {1: ['B4', 'D5', 'F#5', 'D5'], 2: ['G4', 'B4', 'D5', 'B4'], 3: ['E4', 'G4', 'B4', 'G4', 'A4', 'D5', 'E5', 'D5'],
            4: ['B4', 'D5', 'F#5', 'D5', 'G4', 'B4', 'D5', 'B4'], 5: ['A4', 'D5', 'E5', 'F#5']}
    for bar, notes in arps.items():
        step = 4 / len(notes) if len(notes) == 4 else 0.5
        for i, nt in enumerate(notes * (1 if len(notes) == 8 else 2)):
            tb = bar * BAR + i * (step if len(notes) == 8 else 0.5) * BEAT
            if tb >= (bar + 1) * BAR or (STOP[0] - 0.02 < tb < STOP[1]):
                continue
            if bar == 5 and tb > 13.62:
                continue
            g = 0.2 if i % 2 == 0 else 0.13
            add(buf, marimba(hz(nt), 0.5), tb, g, 0.3 if i % 2 else -0.3)
    # tug ostinato: rising plucks during the strain (bar 4, 8.15..9.5)
    for i, tb in enumerate(np.arange(8.125, 9.5, BEAT / 2)):
        f = hz('E3') * 2 ** (i / 12)
        add(buf, pluck(f * 2, 0.25, 0.99, 0.6), tb, 0.16, 0.15)
    # light percussion from bar 2, with the snap rest
    for i, tb in enumerate(np.arange(BAR, 13.5, BEAT / 2)):
        if STOP[0] - 0.05 < tb < STOP[1]:
            continue
        add(buf, shaker(), tb, 0.10 if i % 2 else 0.16, 0.4)
        if i % 4 == 2:
            add(buf, woodblock(820), tb, 0.12, -0.35)
    # final resolve chime under the end card
    for k, nt in enumerate(['D5', 'A5', 'F#6']):
        add(buf, bell(hz(nt), 1.8, 0.6), 13.62 + k * 0.06, 0.16, (k - 1) * 0.4)
    m = buf[:N]
    # fade out the last 0.35 s
    f = int(0.35 * SR); m[-f:] *= np.linspace(1, 0, f)[:, None]
    return m


# ---------------------------------------------------------------- SFX
def thud(f=90, dur=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f * (1 + 1.5 * np.exp(-t / 0.02))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.07) + 0.25 * bandnoise(n, 100, 1500) * np.exp(-t / 0.015)


def tink(f=2400, dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.06) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.03)
    return s + 0.3 * bandnoise(n, 3000, 9000) * np.exp(-t / 0.004)


def boing(f0=180, f1=520, dur=0.32):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f0 + (f1 - f0) * (1 - np.exp(-t / 0.08)) + 18 * np.sin(2 * np.pi * 22 * t) * np.exp(-t / 0.15)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.12) * np.minimum(1, t / 0.004)


def tap(f=420, dur=0.12):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.02) + 0.7 * bandnoise(n, 600, 3500) * np.exp(-t / 0.006))


def whoosh(dur=0.45, f0=500, f1=3000):
    n = int(dur * SR); t = np.arange(n) / SR
    return sweep_noise(n, f0, f1, 0.9) * np.sin(np.pi * t / dur) ** 1.5


def slice_(dur=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    return sweep_noise(n, 5000, 1800, 0.6) * np.minimum(1, t / 0.01) * np.exp(-t / 0.15)


def flutter(dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 34 * t))
    return bandnoise(n, 400, 5000) * am * np.exp(-t / 0.12)


def pour(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    base = bandnoise(n, 1200, 3800) * 0.35
    bub = np.zeros(n)
    k = 0.0
    while k < dur - 0.05:
        f = rng.uniform(1800, 3200); d = rng.uniform(0.015, 0.035)
        m = int(d * SR); tt = np.arange(m) / SR
        fr = f * (1 + 0.8 * tt / d)
        b = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / (d / 2.5))
        i = int(k * SR); bub[i:i + m] += b[: n - i] * rng.uniform(0.4, 1)
        k += rng.uniform(0.02, 0.07)
    e = np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.15).clip(0, 1)
    return (base + 0.6 * bub) * e


def plap(dur=0.18):
    n = int(dur * SR); t = np.arange(n) / SR
    return bandnoise(n, 200, 1800) * np.exp(-t / 0.03) + 0.6 * np.sin(2 * np.pi * 260 * t) * np.exp(-t / 0.03)


def plink(f=1300, dur=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f * (1 + 0.6 * t / dur)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.05)


def absorb(dur=0.7):
    n = int(dur * SR); t = np.arange(n) / SR
    return bandnoise(n, 1500, 7000) * np.exp(-t / 0.25) * np.minimum(1, t / 0.05) * 0.5


def clack(dur=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    return mx((thud(120, dur), 0.8), (bandnoise(n, 800, 6000) * np.exp(-t / 0.012), 1.0))


def creak(t0, t1):
    dur = t1 - t0; n = int(dur * SR); t = np.arange(n) / SR
    f = 1100 + 900 * (t / dur) ** 1.4 + 40 * np.sin(2 * np.pi * 9 * t)
    ph = np.cumsum(f) / SR
    tone = np.sin(2 * np.pi * ph) + 0.25 * np.sin(4 * np.pi * ph)
    grit = 0.55 + 0.45 * (np.sin(2 * np.pi * 23 * t) > 0)
    return tone * grit * np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.05).clip(0, 1)


def snap(dur=0.45):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = 700 * np.exp(-t / 0.06) + 120
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.1)
    return s + 0.8 * bandnoise(n, 1500, 8000) * np.exp(-t / 0.008)


def chirps():
    out = np.zeros(int(0.5 * SR))
    for k, (t0, f) in enumerate([(0.0, 3100), (0.14, 3500), (0.28, 3300)]):
        n = int(0.08 * SR); t = np.arange(n) / SR
        fr = f * (1 + 0.25 * np.sin(np.pi * t / 0.08))
        s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / 0.08)
        i = int(t0 * SR); out[i:i + n] += s
    return out


def pip(f=1800):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.02) * np.minimum(1, t / 0.002)


def mx(*layers):
    """Sum (signal, gain) layers of different lengths."""
    n = max(len(a) for a, _ in layers); out = np.zeros(n)
    for a, g in layers:
        out[: len(a)] += a * g
    return out


def glassclink():
    return mx((tink(3300, 0.5), 0.6), (tink(4870, 0.4), 0.3))


def shimmer(dur=0.9):
    n = int(dur * SR); s = np.zeros(n)
    for k, f in enumerate([2637, 3136, 3951, 4699]):
        i = int(k * 0.06 * SR)
        b = bell(f, dur, 0.4)[: n - i]
        s[i:i + len(b)] += b * (0.7 ** k)
    return s


def sfx():
    buf = np.zeros((N + SR, 2))
    cues = [
        # (time, generator, gain, pan, note)
        (0.0, lambda: lowpass(bandnoise(int(0.5 * SR), 200, 2500), 1800) * np.hanning(int(0.5 * SR)), 0.35, -0.3, 'cup slides in'),
        (0.53, lambda: thud(110, 0.25), 0.55, -0.1, 'cup settles'),
        (0.06, lambda: boing(200, 460, 0.25), 0.22, 0.5, 'Tinku hop'),
        (0.36, lambda: tink(2300, 0.25), 0.22, 0.45, 'hop land'),
        (0.48, lambda: boing(220, 520, 0.25), 0.2, 0.4, 'Tinku hop'),
        (0.75, lambda: tink(2100, 0.3), 0.25, 0.35, 'hop land'),
        (1.02, lambda: tap(420), 0.55, 0.1, 'tap cup'),
        (1.22, lambda: tap(400), 0.55, 0.1, 'tap cup'),
        (1.5, lambda: mx((tink(3600, 0.2), 0.6), (whoosh(0.15, 2000, 5000), 0.4)), 0.25, 0.3, 'loupe flips down'),
        (2.27, lambda: slice_(0.22), 0.45, 0.0, 'cut down the seam'),
        (2.45, lambda: whoosh(0.4, 1200, 4500), 0.32, 0.0, 'halves open'),
        (2.47, lambda: flutter(0.3), 0.2, 0.0, 'paper flutter'),
        (2.52, lambda: boing(160, 600, 0.3), 0.25, 0.4, 'Tinku startled hop'),
        (2.85, lambda: tink(2000, 0.3), 0.22, 0.3, 'land'),
        (2.95, lambda: shimmer(1.0), 0.32, -0.1, 'film glint'),
        (3.05, lambda: pip(1760), 0.18, -0.4, 'chip PAPER'),
        (3.4, lambda: pip(2350), 0.18, 0.2, 'chip LINING'),
        (4.86, lambda: glassclink(), 0.35, 0.5, 'pick up beaker'),
        (5.2, lambda: pour(0.85), 0.13, -0.05, 'pour (kept low under L3)'),
        (6.2, lambda: plap(), 0.35, 0.45, 'drop hits bare paper'),
        (6.23, lambda: absorb(0.75), 0.12, 0.45, 'paper soaks it up'),
        (6.32, lambda: plink(1300), 0.35, 0.1, 'drop beads on film'),
        (6.42, lambda: pip(1760), 0.16, 0.3, 'chip SOAKS'),
        (6.58, lambda: pip(2350), 0.16, -0.3, 'chip BLOCKS'),
        (6.62, lambda: mx((glassclink(), 0.6), (tap(300), 0.4)), 0.3, 0.5, 'beaker set down'),
        (7.17, lambda: whoosh(0.28, 4000, 1200), 0.3, 0.0, 'halves swing shut'),
        (7.42, lambda: clack(0.2), 0.6, 0.0, 'CLACK + cut (in the L3/L4 gap)'),
        (7.72, lambda: mx((thud(70, 0.15), 0.6), (pip(2400), 0.5)), 0.25, -0.2, 'BONDED lock'),
        (7.95, lambda: plink(2200, 0.12) * 0.5, 0.25, 0.3, 'grab the lip'),
        (8.15, lambda: creak(8.15, 9.52), 0.07, 0.25, 'film stretches (rubber squeak)'),
        (9.52, lambda: snap(), 0.55, 0.2, 'grip slips, film snaps back'),
        (9.55, lambda: whoosh(0.3, 600, 2500), 0.3, 0.4, 'tumble'),
        (9.88, lambda: mx((thud(85, 0.3), 0.8), (tink(1500, 0.4), 0.4)), 0.6, 0.4, 'lands on his bottom'),
        (10.0, lambda: chirps(), 0.12, 0.45, 'dazed'),
        (10.8, lambda: boing(220, 480, 0.22), 0.18, 0.35, 'hop up'),
        (10.98, lambda: tink(2200, 0.25), 0.2, 0.35, 'land'),
        (10.95, lambda: thud(140, 0.18), 0.35, -0.5, 'facility pops up'),
        (11.03, lambda: bell(1318.5, 0.6, 0.5), 0.22, -0.5, 'sign: accepts'),
        (11.2, lambda: thud(130, 0.18), 0.35, 0.0, 'facility pops up'),
        (11.28, lambda: bell(659.3, 0.5, 0.3) * 0.8, 0.22, 0.0, 'sign: does not'),
        (11.45, lambda: thud(140, 0.18), 0.35, 0.5, 'facility pops up'),
        (11.53, lambda: bell(1318.5, 0.6, 0.5), 0.22, 0.5, 'sign: accepts'),
        (12.48, lambda: boing(300, 240, 0.3), 0.14, 0.35, 'shrug'),
        (13.75, lambda: shimmer(0.9), 0.18, 0.3, 'point to takeaway'),
    ]
    # route dashes drawing: soft ticks
    for i in range(12):
        cues.append((10.8 + i * 0.07, lambda: pip(3200) * 0.5, 0.05, (i % 3 - 1) * 0.5, 'route tick'))
    for t0, gen, g, pan, _ in cues:
        add(buf, gen(), t0, g, pan)
    return buf[:N], [(round(c[0], 3), c[4]) for c in cues]


def write(path, a):
    a = np.clip(a, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    m = music(); m *= 0.85 / (np.max(np.abs(m)) + 1e-9)
    s, cues = sfx(); s *= 0.9 / (np.max(np.abs(s)) + 1e-9)
    write(os.path.join(OUT, 'music.wav'), m)
    write(os.path.join(OUT, 'sfx.wav'), s)
    json.dump({'sample_rate': SR, 'duration': DUR, 'bpm': BPM, 'sfx_cues': cues}, open(os.path.join(OUT, 'cues.json'), 'w'), indent=1)
    print('music', m.shape, 'sfx', s.shape, 'cues', len(cues))
