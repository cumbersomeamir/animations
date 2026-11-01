"""Original sound design for the 15 s diagram test (synthesised from sine / FM / noise; no samples).

Distinct palette from the 30 s film: FM bells + sub pulses + filtered-noise "data" textures.
Inputs : build/cues.json (exported from the page's GSAP master timeline), build/vo/manifest.json
Output : build/audio/{music,sfx,vo,mix}.wav  (48 kHz stereo float)
"""
import json, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, DUR = 48000, 15.0
N = int(SR * DUR)
rs = np.random.default_rng(15)
OUT = os.path.join(ROOT, "build", "audio")


def tv(d): return np.arange(int(d * SR)) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f): return sosfilt(butter(2, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, btype="high", fs=SR, output="sos"), x)


def env(n, a=0.002, tau=0.2):
    t = np.arange(n) / SR
    e = np.exp(-t / tau)
    k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k)
    return e


def fm(f, d, ratio=2.0, index=2.5, tau=0.35, itau=0.12):
    t = tv(d)
    mod = np.sin(2 * np.pi * f * ratio * t) * index * np.exp(-t / itau)
    return np.sin(2 * np.pi * f * t + mod) * env(len(t), 0.002, tau)


def sub(f0=95, f1=42, d=0.45, tau=0.14):
    t = tv(d); f = f1 + (f0 - f1) * np.exp(-t * 18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, tau)


def hat(d=0.06, tau=0.012): return hp(rs.standard_normal(int(d * SR)), 7000) * env(int(d * SR), 0.0005, tau)


def clap():
    d = 0.18; n = bp(rs.standard_normal(int(d * SR)), 900, 4500)
    e = np.zeros(len(n))
    for o in (0, 0.011, 0.022): i = int(o * SR); e[i:] += env(len(n) - i, 0.0005, 0.03)
    return n * e * 0.5


def padc(notes, d, att=0.4, rel=0.6):
    t = tv(d); y = np.zeros_like(t)
    for m in notes:
        for det in (-0.08, 0.08):
            f = mtof(m) * 2 ** (det / 12)
            y += np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    e = np.ones_like(t); a, r = int(att * SR), int(rel * SR)
    e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r)
    return lp(y * e, 1800) / (len(notes) * 2.8)


def place(buf, x, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= len(buf): return
    L = min(len(x), len(buf) - i)
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + L, 0] += x[:L] * g * gl * 1.414
    buf[i:i + L, 1] += x[:L] * g * gr * 1.414


# ------------------------------------------------------------------ SFX from the diagram's own cues
POP_NOTES = {"record": 76, "recordSmall": 81, "hub": 69, "step": 79, "ai": 86, "gate": 74, "official": 72, "chip": 84, "cta": 77}


def sfx(c):
    ty = c["type"]
    if ty == "pop":
        m = POP_NOTES.get(c.get("kind"), 79) + (rs.integers(-2, 3) if c.get("kind") == "recordSmall" else 0)
        return fm(mtof(m) * c.get("pitch", 1), 0.25, 3.0, 1.6, 0.07, 0.03) * 0.55, 0.35
    if ty == "draw":
        d = max(0.12, c["dur"]); t = tv(d)
        n = rs.standard_normal(len(t)); out = np.zeros_like(n); B = 12; L = len(n) // B + 1
        for b in range(B):
            fc = 1500 + 4500 * b / B; seg = n[b * L:(b + 1) * L]; out[b * L:b * L + len(seg)] = bp(seg, fc * 0.7, min(fc * 1.3, 20000))
        return out * np.sin(np.pi * t / d) * 0.25, 0.25
    if ty == "travel":
        d = c["dur"]; t = tv(d)
        # stream of tiny data ticks along the connector
        out = np.zeros(len(t) + 2000); k = 0.0
        base = {"ai": 2200, "gold": 1300, "data": 1700}[c.get("kind", "data")] * c.get("pitch", 1)
        while k < d:
            tick = np.sin(2 * np.pi * base * (1 + k / d * 0.4) * tv(0.02)) * env(int(0.02 * SR), 0.0003, 0.004)
            i = int(k * SR); out[i:i + len(tick)] += tick; k += 0.045
        return out * 0.35, 0.3
    if ty == "arrive":
        m = {"ai": 88, "gold": 79, "data": 84}[c.get("kind", "data")]
        return fm(mtof(m) * c.get("pitch", 1), 0.4, 2.0, 1.2, 0.12, 0.05) * 0.5, 0.3
    if ty == "tangle":
        d = c["dur"]; t = tv(d); out = np.zeros(len(t) + 4000)
        for _ in range(26):  # dissonant scattered blips = records everywhere
            m = rs.choice([70, 71, 73, 76, 77, 82, 83]); x = fm(mtof(m), 0.12, 3.7, 2.5, 0.04, 0.02)
            i = int(rs.uniform(0, d) * SR); out[i:i + len(x)] += x * rs.uniform(0.2, 0.5)
        hiss = bp(rs.standard_normal(len(out)), 3000, 9000) * np.linspace(0, 1, len(out)) * 0.08
        return out + hiss, 0.45
    if ty == "sort":
        d = 0.5; t = tv(d); f = 300 + 1600 * (1 - t / d) ** 2
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.25 + bp(rs.standard_normal(len(t)), 800, 3000) * (1 - t / d) * 0.25), 0.5
    if ty == "step":
        m = [72, 76, 79, 84][c["i"]]
        return fm(mtof(m), 0.9, 1.0, 1.8, 0.4, 0.15) * 0.8, 0.5
    if ty == "typing":
        d = c["dur"]; out = np.zeros(int((d + 0.1) * SR)); k = 0.0
        while k < d:
            x = hp(rs.standard_normal(int(0.012 * SR)), 2500) * env(int(0.012 * SR), 0.0003, 0.003)
            i = int(k * SR); out[i:i + len(x)] += x; k += rs.uniform(0.05, 0.09)
        return out * 0.8, 0.3
    if ty == "verified":
        out = np.zeros(int(1.4 * SR))
        for k, m in enumerate([79, 84, 88]):
            x = fm(mtof(m), 1.2, 1.0, 1.4, 0.45, 0.2); i = int(k * 0.07 * SR); out[i:i + len(x)] += x[:len(out) - i]
        return out * 0.55, 0.7
    if ty == "stepVerified":
        return fm(mtof(91), 0.8, 2.0, 1.0, 0.3, 0.1) * 0.5, 0.4
    if ty == "converge":
        d = c["dur"]; t = tv(d); n = rs.standard_normal(len(t)); out = np.zeros_like(n); B = 14; L = len(n) // B + 1
        for b in range(B):
            fc = 6000 - 5000 * b / B; seg = n[b * L:(b + 1) * L]; out[b * L:b * L + len(seg)] = bp(seg, fc * 0.6, fc * 1.4)
        return out * (t / d) ** 1.5 * 0.5, 0.55
    if ty == "logo":
        out = sub(110, 38, 1.2, 0.35) * 0.9
        x = padc([48, 55, 60, 64, 71], 2.2, att=0.02, rel=1.6) * 2.2
        y = np.zeros(max(len(out), len(x))); y[:len(out)] += out; y[:len(x)] += x
        return y, 0.5
    if ty == "cta":
        a = fm(mtof(84), 0.6, 2.0, 1.0, 0.2, 0.06); b = fm(mtof(91), 0.8, 2.0, 1.0, 0.3, 0.06)
        out = np.zeros(int(0.9 * SR)); out[:len(a)] += a; i = int(0.06 * SR); out[i:i + len(b)] += b[:len(out) - i]
        click = hp(rs.standard_normal(int(0.01 * SR)), 3000) * env(int(0.01 * SR), 0.0002, 0.002)
        out[:len(click)] += click * 0.8
        return out * 0.7, 0.6
    raise ValueError(ty)


def music():
    m = np.zeros((N, 2)); B = 0.5
    # hook: ticking 16ths + low unresolved drone
    place(m, padc([33, 34, 45], 2.1, att=0.05, rel=0.3) * 1.2, 0.0, 0.5)
    for k in range(16):
        place(m, hat(0.05, 0.01), k * 0.125, 0.25 + 0.1 * (k % 4 == 0), 0.3)
    # 2.0 onwards: resolved pulse, 120 BPM; chords per 2 beats
    prog = [(2.0, [57, 60, 64, 71], 45), (4.0, [57, 60, 64, 71], 45), (5.2, [60, 64, 67, 71], 48), (7.0, [60, 64, 67, 74], 48),
            (8.2, [53, 57, 60, 64], 41), (10.0, [55, 59, 62, 67], 43), (11.3, [60, 64, 67, 72], 48)]
    for i, (t0, notes, root) in enumerate(prog):
        t1 = prog[i + 1][0] if i + 1 < len(prog) else 12.0
        place(m, padc(notes, t1 - t0 + 0.3, att=0.08, rel=0.3) * 0.9, t0, 0.5)
        tt, e = t0, 0
        while tt < t1 - 0.01:
            beat_pos = round((tt - 2.0) / (B / 2))
            arp = notes[[0, 2, 1, 3, 2, 1, 3, 2][beat_pos % 8]] + 12
            place(m, fm(mtof(arp), 0.3, 2.0, 1.1, 0.1, 0.05) * (0.7 if beat_pos % 2 == 0 else 0.45), tt, 0.4, -0.35 if beat_pos % 2 else 0.35)
            if beat_pos % 2 == 0:
                place(m, sub(90, 45, 0.3, 0.1) * (1.0 if beat_pos % 4 == 0 else 0.6), tt, 0.6)
                if tt < 8.2 or tt >= 11.3:
                    place(m, np.sin(2 * np.pi * mtof(root) * tv(0.45)) * env(int(0.45 * SR), 0.004, 0.2), tt, 0.5)
            if beat_pos % 4 == 2 and tt >= 5.2 and tt < 12.0:
                place(m, clap(), tt, 0.35, 0.1)
            place(m, hat(), tt, 0.18 if beat_pos % 2 else 0.1, 0.4)
            tt += B / 2; e += 1
    # end: held major chord under the logo/CTA, gentle shimmer
    place(m, padc([48, 55, 60, 64, 67], 3.0, att=0.3, rel=1.2) * 1.2, 12.0, 0.32)
    for k, mm in enumerate([84, 88, 91, 96, 91, 88]):
        place(m, fm(mtof(mm), 0.7, 2.0, 0.8, 0.25, 0.08) * 0.35, 13.0 + k * 0.25, 0.35, (-1) ** k * 0.4)
    return m


def compress(x, thresh_db=-22, ratio=3.0):
    lvl = np.sqrt(np.convolve(np.mean(x ** 2, axis=1), np.ones(480) / 480, mode="same")) + 1e-9
    gdb = -np.maximum(0, 20 * np.log10(lvl) - thresh_db) * (1 - 1 / ratio)
    k = int(0.03 * SR); gdb = np.convolve(gdb, np.ones(k) / k, mode="same")
    return x * (10 ** (gdb / 20))[:, None]


def main():
    os.makedirs(OUT, exist_ok=True)
    cues = json.load(open(os.path.join(ROOT, "build", "cues.json")))["cues"]
    fx = np.zeros((N, 2))
    for c in cues:
        x, g = sfx(c)
        pan = float(np.clip((c.get("t") % 1.7) / 1.7 * 0.6 - 0.3, -0.4, 0.4))
        place(fx, x, c["t"], g, pan)
    mu = music()
    vo = np.zeros((N, 2))
    for ln in json.load(open(os.path.join(ROOT, "build", "vo", "manifest.json"))):
        x, sr = sf.read(os.path.join(ROOT, ln["file"]), dtype="float32")
        ti = np.arange(int(len(x) * SR / sr)) / SR
        place(vo, hp(np.interp(ti, np.arange(len(x)) / sr, x), 80), ln["start"], 1.0)
    vo = compress(vo / (np.abs(vo).max() + 1e-9))
    vo *= 0.8 / (np.abs(vo).max() + 1e-9)
    e = np.convolve(np.abs(vo[:, 0]), np.ones(1920) / 1920, mode="same")
    gate = np.clip(np.convolve((e > 0.01 * e.max()).astype(float), np.ones(9600) / 9600, mode="same") * 1.5, 0, 1)
    # level buses by RMS relative to the speech level (not by peak, so one loud hit can't skew a bus)
    rms_db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
    vo_db = rms_db(vo[gate > 0.5])
    mu = mu * 10 ** ((vo_db - 9.5 - rms_db(mu)) / 20) * (1 - 0.55 * gate)[:, None]
    fx = fx * 10 ** ((vo_db - 7.0 - rms_db(fx)) / 20) * (1 - 0.45 * gate)[:, None]
    mix = vo + mu + fx
    mix[:240] *= np.linspace(0, 1, 240)[:, None]
    fo = int(0.25 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix *= 0.89 / np.abs(mix).max()
    for name, x in (("music", mu), ("sfx", fx), ("vo", vo), ("mix", mix)):
        sf.write(os.path.join(OUT, name + ".wav"), x.astype(np.float32), SR, subtype="FLOAT")
    db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
    for ln in json.load(open(os.path.join(ROOT, "build", "vo", "manifest.json"))):
        a, b = int(ln["start"] * SR), int(ln["end"] * SR)
        print(f"{ln['id']} VO over bed: {db(vo[a:b]) - db(mu[a:b] + fx[a:b]):5.1f} dB")
    print("mix ->", os.path.join(OUT, "mix.wav"))


if __name__ == "__main__":
    main()
