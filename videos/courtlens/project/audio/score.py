"""Original soundtrack for the Courtlens film: procedural music + SFX + narration mix.

Everything is synthesised here from sine/noise primitives (no samples, no third-party audio).
Inputs : build/cues.json (SFX cue sheet exported by the renderer from the same timing source)
         build/vo/manifest.json (narration lines + start times)
Outputs: build/audio/music.wav, sfx.wav, vo.wav, mix.wav (48 kHz stereo float)
"""
import json
import os

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 30.0
N = int(SR * DUR)
OUT = os.path.join(ROOT, "build", "audio")
rs = np.random.default_rng(7)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tvec(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def env_ad(n, a, d_tau):
    t = np.arange(n) / SR
    e = np.exp(-t / d_tau)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def noise(d):
    return rs.standard_normal(int(d * SR))


def sweep_sine(f0, f1, d, curve=3.0):
    t = tvec(d)
    f = f1 + (f0 - f1) * np.exp(-t * curve / d * 3)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def bell(f, d=1.4, bright=1.0):
    t = tvec(d)
    ratios = [1, 2.0, 2.76, 5.4, 8.93]
    amps = [1, 0.35, 0.45 * bright, 0.18 * bright, 0.08 * bright]
    taus = [d * 0.42, d * 0.25, d * 0.2, d * 0.1, d * 0.06]
    y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / tau) for r, a, tau in zip(ratios, amps, taus))
    y[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return y / 1.6


def marimba(f, d=0.6, vel=1.0):
    t = tvec(d)
    y = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.22)
         + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.05)
         + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.02))
    y[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return y * vel


def pizz(f, d=0.35, vel=1.0):
    t = tvec(d)
    y = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * t) for k in range(5)) * np.exp(-t / 0.09)
    y[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return lp(y, 3500) * vel * 0.8


def bass(f, d=0.5, vel=1.0):
    t = tvec(d)
    y = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / (d * 0.5))
    na = int(0.006 * SR)
    y[:na] *= np.linspace(0, 1, na)
    y[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    return y * vel


def pad(freqs, d, att=0.6, rel=0.8, bright=0.5):
    t = tvec(d)
    y = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            for k in range(1, 6):
                y += (bright ** (k - 1)) / k * np.sin(2 * np.pi * ff * k * t + rs.uniform(0, 6.28))
    e = np.ones_like(t)
    na, nr = int(att * SR), int(rel * SR)
    e[:na] = np.linspace(0, 1, na) ** 1.5
    e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return lp(y * e, 2200) / (len(freqs) * 3 * 1.8)


def kick(vel=1.0):
    d = 0.32
    y = sweep_sine(130, 45, d, 2.0) * env_ad(int(d * SR), 0.002, 0.11)
    return y * vel


def snap(vel=1.0):
    d = 0.16
    y = bp(noise(d), 1200, 5200) * env_ad(int(d * SR), 0.001, 0.035)
    return y * vel * 0.6


def shaker(vel=1.0):
    d = 0.09
    y = hp(noise(d), 6000) * env_ad(int(d * SR), 0.004, 0.02)
    return y * vel * 0.35


# --------------------------------------------------------------------------- SFX
def sfx(c):
    ty, g, p = c["type"], c.get("gain", 0.5), c.get("pitch", 1.0)
    d = c.get("dur", 0.3)
    if ty == "whoosh":
        n = noise(d)
        out = np.zeros_like(n)
        blocks = 24
        L = len(n) // blocks + 1
        for b in range(blocks):
            u = b / blocks
            fc = (500 + 2600 * np.sin(np.pi * u)) * p
            seg = n[b * L:(b + 1) * L]
            out[b * L:b * L + len(seg)] = bp(seg, fc * 0.6, min(fc * 1.6, 20000))
        e = np.sin(np.pi * np.linspace(0, 1, len(n))) ** 1.5
        return out * e * 0.9
    if ty == "thud":
        dd = 0.35
        y = sweep_sine(110 * p, 42 * p, dd, 2) * env_ad(int(dd * SR), 0.002, 0.09)
        y += lp(noise(dd), 400) * env_ad(int(dd * SR), 0.001, 0.03) * 0.5
        return y
    if ty == "thud_small":
        dd = 0.2
        y = sweep_sine(180, 70, dd, 2) * env_ad(int(dd * SR), 0.001, 0.05)
        y += bp(noise(dd), 300, 2500) * env_ad(int(dd * SR), 0.001, 0.018) * 0.6
        return y
    if ty == "slam":
        dd = 0.6
        y = sweep_sine(95, 38, dd, 1.5) * env_ad(int(dd * SR), 0.001, 0.16)
        y += bp(noise(dd), 900, 5000) * env_ad(int(dd * SR), 0.001, 0.03) * 0.8
        y += lp(noise(dd), 250) * env_ad(int(dd * SR), 0.001, 0.12) * 0.6
        return y
    if ty == "boom":
        dd = 1.4
        y = sweep_sine(70, 32, dd, 1.2) * env_ad(int(dd * SR), 0.002, 0.45)
        y += lp(noise(dd), 180) * env_ad(int(dd * SR), 0.005, 0.35) * 1.2
        return y
    if ty == "creak":
        dd = 0.32
        t = tvec(dd)
        f = 170 * p * (1 + 0.15 * np.sin(2 * np.pi * 3 * t))
        ph = np.cumsum(f) / SR
        pulses = (np.mod(ph, 1.0) < 0.08).astype(float) * (0.6 + 0.4 * rs.random(len(t)))
        y = bp(pulses, 400, 1800) * np.sin(np.pi * t / dd) ** 0.7
        return y * 2.2
    if ty == "rustle":
        dd = d
        n = bp(noise(dd), 1800, 7000)
        grains = np.zeros(len(n))
        for _ in range(int(dd * 70)):
            i = rs.integers(0, len(n) - 2000)
            L = rs.integers(200, 1800)
            grains[i:i + L] += np.hanning(L) * rs.uniform(0.3, 1)
        e = np.exp(-np.linspace(0, 3, len(n)))
        return n * grains * e * 0.8
    if ty == "riser":
        dd = d
        t = tvec(dd)
        u = t / dd
        n = noise(dd)
        out = np.zeros_like(n)
        blocks = 30
        L = len(n) // blocks + 1
        for b in range(blocks):
            fc = 400 + 5000 * (b / blocks) ** 2
            seg = n[b * L:(b + 1) * L]
            out[b * L:b * L + len(seg)] = bp(seg, fc * 0.7, fc * 1.4)
        tone = np.sin(2 * np.pi * np.cumsum(180 + 700 * u ** 2) / SR) * 0.25
        return (out + tone) * u ** 2 * 0.9
    if ty == "page_flip":
        dd = 0.4
        y = sfx({"type": "whoosh", "dur": dd, "pitch": 1.6})
        flap = bp(noise(dd), 600, 4000) * env_ad(int(dd * SR), 0.001, 0.02)
        return y * 0.8 + flap * 0.8
    if ty == "step":
        dd = 0.08
        y = lp(noise(dd), 900) * env_ad(int(dd * SR), 0.001, 0.012) + np.sin(2 * np.pi * 110 * tvec(dd)) * env_ad(int(dd * SR), 0.001, 0.02) * 0.5
        return y
    if ty == "bonk":
        dd = 0.7
        t = tvec(dd)
        f = 520 * np.exp(-t * 6) + 230 + 18 * np.sin(2 * np.pi * 13 * t) * np.exp(-t * 3)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.001, 0.22)
        y += bp(noise(dd), 1500, 5000) * env_ad(len(t), 0.0005, 0.008) * 0.8
        return y * 0.9
    if ty == "twinkle":
        out = np.zeros(int(0.8 * SR))
        for k, m in enumerate([93, 98, 102, 105]):
            b = bell(mtof(m), 0.5, 0.4)
            i = int(k * 0.09 * SR)
            out[i:i + len(b)] += b[: len(out) - i] * 0.6
        return out
    if ty == "skid":
        dd = 0.4
        t = tvec(dd)
        y = bp(noise(dd), 1200, 3200) * (1 - t / dd) ** 1.2
        return y * 0.7
    if ty == "pop":
        dd = 0.12
        y = sweep_sine(380 * p, 950 * p, dd, -1) if False else np.sin(2 * np.pi * np.cumsum(np.linspace(380, 980, int(dd * SR)) * p) / SR)
        return y * env_ad(len(y), 0.001, 0.035)
    if ty == "chime":
        return bell(mtof(81) * p, 1.6, 0.9)
    if ty == "shimmer":
        dd = d + 0.8
        out = np.zeros(int(dd * SR))
        notes = [86, 90, 93, 98, 102, 105]
        for k in range(int(d * 14)):
            m = notes[rs.integers(0, len(notes))]
            b = bell(mtof(m), 0.7, 0.5) * rs.uniform(0.2, 0.5)
            i = int(rs.uniform(0, d) * SR)
            out[i:i + len(b)] += b[: len(out) - i]
        sw = hp(noise(dd), 5000) * np.sin(np.pi * np.linspace(0, 1, len(out))) * 0.08
        return out + sw
    if ty == "tick":
        dd = 0.05
        y = np.sin(2 * np.pi * 1400 * p * tvec(dd)) * env_ad(int(dd * SR), 0.0005, 0.01)
        y += hp(noise(dd), 3000) * env_ad(int(dd * SR), 0.0005, 0.003) * 0.4
        return y
    if ty == "tock":
        dd = 0.15
        t = tvec(dd)
        y = (np.sin(2 * np.pi * 520 * p * t) + 0.4 * np.sin(2 * np.pi * 1310 * p * t)) * env_ad(len(t), 0.0008, 0.03)
        return y
    if ty == "hop":
        return sfx({"type": "whoosh", "dur": 0.18, "pitch": 2.0}) * 0.7
    if ty == "ding":
        return bell(mtof(c.get("note", 81)), 1.2, 0.8)
    if ty == "thunk":
        dd = 0.3
        y = sweep_sine(200, 90, dd, 2) * env_ad(int(dd * SR), 0.001, 0.06)
        y += bp(noise(dd), 600, 3000) * env_ad(int(dd * SR), 0.0005, 0.01) * 0.7
        return y
    if ty == "flutter":
        dd = d
        t = tvec(dd)
        y = bp(noise(dd), 900, 3500) * (0.5 + 0.5 * np.sin(2 * np.pi * 15 * t)) * np.exp(-t / (dd * 0.5))
        return y * 0.6
    if ty == "typing":
        dd = d
        out = np.zeros(int(dd * SR) + 2000)
        tt = 0.0
        while tt < dd:
            k = sfx({"type": "tick", "pitch": rs.uniform(1.6, 2.2)}) * rs.uniform(0.5, 1)
            i = int(tt * SR)
            out[i:i + len(k)] += k
            tt += rs.uniform(0.06, 0.12)
        return out
    if ty == "paper_slap":
        dd = 0.3
        y = bp(noise(dd), 700, 5000) * env_ad(int(dd * SR), 0.0005, 0.025)
        y += sweep_sine(140, 60, dd, 2) * env_ad(int(dd * SR), 0.001, 0.05) * 0.6
        return y
    if ty == "stamp":
        dd = 0.5
        y = sweep_sine(120, 50, dd, 2) * env_ad(int(dd * SR), 0.001, 0.08)
        y += bp(noise(dd), 1500, 6000) * env_ad(int(dd * SR), 0.0005, 0.01) * 0.9
        return y
    if ty == "sting":
        dd = 3.6
        out = np.zeros(int(dd * SR))
        for k, m in enumerate([62, 66, 69, 76, 81]):
            b = bell(mtof(m), 2.6, 0.6) * 0.45
            i = int(k * 0.035 * SR)
            out[i:i + len(b)] += b[: len(out) - i]
        out += pad([mtof(50), mtof(57), mtof(62), mtof(66)], dd, att=0.05, rel=2.5, bright=0.45) * 1.8
        return out
    if ty == "click":
        a = sfx({"type": "tick", "pitch": 1.5})
        out = np.zeros(int(0.12 * SR))
        out[: len(a)] += a
        b = sfx({"type": "tick", "pitch": 1.1})
        i = int(0.045 * SR)
        out[i:i + len(b)] += b * 0.7
        return out * 1.2
    if ty == "clock_ticks":
        dd = d
        out = np.zeros(int((dd + 0.2) * SR))
        k = 0
        tt = 0.0
        while tt < dd:
            s = sfx({"type": "tock", "pitch": 2.4 if k % 2 == 0 else 2.0}) * 0.5
            i = int(tt * SR)
            out[i:i + len(s)] += s
            tt += 0.3 - min(0.12, tt * 0.06)
            k += 1
        return out
    raise ValueError(ty)


def place(buf, x, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= buf.shape[0] or i + len(x) <= 0:
        return
    j0 = max(0, -i)
    x = x[j0:]
    i = max(0, i)
    L = min(len(x), buf.shape[0] - i)
    pan = float(np.clip(pan, -1, 1))
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + L, 0] += x[:L] * gain * gl * 1.414
    buf[i:i + L, 1] += x[:L] * gain * gr * 1.414


# --------------------------------------------------------------------------- music
def music(T):
    m = np.zeros((N, 2))
    B = 0.6
    D3, A2, D2 = 50, 45, 38
    # A — hook (0-3.6): tense pizzicato climbing figure + low drone, stops on the collapse
    place(m, pad([mtof(D2), mtof(A2), mtof(50)], 1.95, att=0.3, rel=0.2, bright=0.6), 0.0, 0.55)
    fig = [62, 65, 69, 70, 69, 65, 62, 65, 69, 72]
    tt, k = 0.0, 0
    while tt < T["breakApart"] - 0.05:
        place(m, pizz(mtof(fig[k % len(fig)]), 0.3, 0.8), tt, 0.5, -0.2 + 0.4 * (k % 2))
        tt += 0.3 if tt < T["land1"] else 0.15
        k += 1
    # B — maze (3.6-9.0): D-minor ostinato on a 100 BPM grid
    t0 = 3.6
    chords = [(t0, [50, 57, 62, 65], 38), (t0 + 4 * B, [46, 53, 58, 62], 34), (t0 + 8 * B, [45, 52, 57, 61], 33)]
    osti = {38: [62, 57, 65, 57, 64, 57, 65, 57], 34: [62, 58, 65, 58, 62, 58, 65, 58], 33: [61, 57, 64, 57, 61, 57, 64, 57]}
    for ci, (cs, notes, root) in enumerate(chords):
        ce = chords[ci + 1][0] if ci + 1 < len(chords) else 9.0
        e = 0
        tt = cs
        while tt < ce - 0.01:
            if tt < T["despair"]:
                place(m, pizz(mtof(osti[root][e % 8]), 0.28, 1.0 if e % 2 == 0 else 0.6), tt, 0.42, 0.3 if e % 2 else -0.3)
                if e % 4 == 0:
                    place(m, bass(mtof(root), 0.5, 1.0), tt, 0.55)
                    place(m, kick(0.7), tt, 0.5)
                if e % 2 == 1:
                    place(m, shaker(1), tt, 0.5, 0.4)
            tt += B / 2
            e += 1
    # despair: low sustained minor chord under the push-in
    place(m, pad([mtof(38), mtof(45), mtof(53)], 1.3, att=0.2, rel=0.6, bright=0.4), T["despair"], 0.6)
    # C — reveal: rising D-major harp arpeggio while the ring sweeps
    place(m, pad([mtof(50), mtof(57), mtof(62), mtof(66)], 4.0, att=1.2, rel=1.0, bright=0.5), T["iconPop"], 0.7)
    arp = [62, 66, 69, 74, 78, 81, 86, 90]
    n_ar = 22
    for k in range(n_ar):
        u = k / n_ar
        tt = T["ring"] + (T["ringEnd"] - T["ring"]) * (u ** 0.85)
        place(m, marimba(mtof(arp[k % len(arp)] - (12 if k < 8 else 0)), 0.5, 0.5 + 0.4 * u), tt, 0.45, -0.5 + u)
    # panel build: light marimba pulse on the grid leading into the groove
    tt, k = T["panel"], 0
    pat = [74, 69, 66, 69]
    while tt < 13.4 - 0.01:
        place(m, marimba(mtof(pat[k % 4]), 0.4, 0.6), tt, 0.4, 0.2)
        tt += B / 2
        k += 1
    place(m, bass(mtof(45), 0.5), 12.8, 0.5)
    place(m, bass(mtof(45), 0.5), 13.1, 0.5)
    # D — groove 13.4-24.6: D | A | Bm | G at 100 BPM
    prog = [([62, 66, 69], 38), ([61, 64, 69], 45), ([62, 66, 71], 47), ([62, 67, 71], 43)]
    gs = 13.4
    bar = 4 * B
    tt, e = gs, 0
    while tt < 24.55 - 0.01:
        bi = int((tt - gs + 1e-6) // bar)
        notes, root = prog[bi % 4]
        beat = e % 8
        light = tt > 18.0  # thinner texture under the assistant dialogue
        arpn = [notes[0], notes[1], notes[2], notes[1] + 12, notes[2], notes[1], notes[0] + 12, notes[2]][beat]
        place(m, marimba(mtof(arpn), 0.45, 0.85 if beat % 2 == 0 else 0.55), tt, 0.38, -0.3 if beat % 2 else 0.3)
        if beat in (0, 3):
            place(m, bass(mtof(root), 0.45, 1.0), tt, 0.55)
        if beat in (0,) or (beat == 4 and not light):
            place(m, kick(0.8), tt, 0.55)
        if beat in (2, 6):
            place(m, snap(0.8), tt, 0.4, 0.15)
        place(m, shaker(0.8 if beat % 2 else 0.5), tt, 0.45, 0.45)
        if beat == 0:
            place(m, pad([mtof(n - 12) for n in notes], bar, att=0.3, rel=0.6, bright=0.35), tt, 0.35)
        tt += B / 2
        e += 1
    # E — outro after the logo sting: sparse marimba motif resolving to D
    outro = [(26.4, 74), (26.7, 78), (27.0, 81), (27.6, 78), (27.9, 81), (28.2, 86), (28.8, 74)]
    for tt, n in outro:
        place(m, marimba(mtof(n), 0.6, 0.6), tt, 0.35, 0.2)
    place(m, pad([mtof(50), mtof(57), mtof(62), mtof(66), mtof(69)], 1.2, att=0.05, rel=1.1, bright=0.5), 28.8, 0.5)
    place(m, bass(mtof(38), 1.1), 28.8, 0.5)
    return m


def compress(x, thresh_db=-20, ratio=3.0, att=0.005, rel=0.12):
    """Feed-forward RMS compressor on a stereo buffer (linked channels)."""
    lvl = np.sqrt(np.convolve(np.mean(x ** 2, axis=1), np.ones(int(0.01 * SR)) / int(0.01 * SR), mode="same")) + 1e-9
    ldb = 20 * np.log10(lvl)
    over = np.maximum(0, ldb - thresh_db)
    gdb = -over * (1 - 1 / ratio)
    # attack/release smoothing of the gain curve
    a_a, a_r = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    sm = np.empty_like(gdb)
    g = 0.0
    for i in range(len(gdb)):
        c = a_a if gdb[i] < g else a_r
        g = c * g + (1 - c) * gdb[i]
        sm[i] = g
    return x * (10 ** (sm / 20))[:, None]


def reverb(x, wet=0.12, length=1.1):
    n = int(length * SR)
    t = np.arange(n) / SR
    ir_l = rs.standard_normal(n) * np.exp(-t / (length * 0.22))
    ir_r = rs.standard_normal(n) * np.exp(-t / (length * 0.22))
    ir_l = lp(ir_l, 5000)
    ir_r = lp(ir_r, 5000)
    out = np.zeros_like(x)
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    for ch, ir in enumerate((ir_l, ir_r)):
        y = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[: len(x)]
        out[:, ch] = y / (np.sqrt(np.sum(ir ** 2)) + 1e-9)
    return x + wet * out


def main():
    os.makedirs(OUT, exist_ok=True)
    cues = json.load(open(os.path.join(ROOT, "build", "cues.json")))
    T = cues["T"]
    # SFX bus
    fx = np.zeros((N, 2))
    for c in cues["cues"]:
        place(fx, sfx(c), c["t"], c.get("gain", 0.5), c.get("pan", 0.0))
    fx = reverb(fx, 0.10, 0.9)
    # music bus
    mu = reverb(music(T), 0.18, 1.6)
    # narration bus
    vo = np.zeros((N, 2))
    man = json.load(open(os.path.join(ROOT, "build", "vo", "manifest.json")))
    for line in man:
        x, sr = sf.read(os.path.join(ROOT, line["file"]), dtype="float32")
        if x.ndim > 1:
            x = x.mean(axis=1)
        # resample 24k -> 48k (linear interpolation is adequate for speech at 2x)
        ti = np.arange(int(len(x) * SR / sr)) / SR
        x48 = np.interp(ti, np.arange(len(x)) / sr, x)
        x48 = hp(x48, 80)
        place(vo, x48, line["start"], 1.0, 0.0)
    vo = compress(vo / (np.max(np.abs(vo)) + 1e-9), thresh_db=-22, ratio=3.0)
    vo *= 0.8 / (np.max(np.abs(vo)) + 1e-9)
    # sidechain ducking of music (and slightly SFX) under narration
    env = np.abs(vo[:, 0])
    win = int(0.04 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    env = env / (env.max() + 1e-9)
    gate = (env > 0.02).astype(float)
    # smooth attack/release of the gate
    k = int(0.25 * SR)
    gate = np.convolve(gate, np.ones(k) / k, mode="same")
    gate = np.clip(gate * 1.5, 0, 1)
    duck_m = 1 - 0.6 * gate
    duck_f = 1 - 0.55 * gate
    mu_peak = np.max(np.abs(mu)) + 1e-9
    fx_peak = np.max(np.abs(fx)) + 1e-9
    mu = mu / mu_peak * 0.30 * duck_m[:, None]
    fx = fx / fx_peak * 0.5 * duck_f[:, None]
    mix = vo + mu + fx
    # gentle fade-in of the first 10 ms and fade-out of last 300 ms
    mix[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    fo = int(0.3 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
    # soft limiter
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    peak = np.max(np.abs(mix))
    mix *= 0.89 / peak
    for name, x in (("music", mu), ("sfx", fx), ("vo", vo), ("mix", mix)):
        sf.write(os.path.join(OUT, f"{name}.wav"), x.astype(np.float32), SR, subtype="FLOAT")
    print("mix peak", float(np.max(np.abs(mix))), "->", os.path.join(OUT, "mix.wav"))


if __name__ == "__main__":
    main()
