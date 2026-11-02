"""Original score + action-timed SFX + Bix narration for Educational Pilot 01. Everything is synthesised here
(numpy/scipy oscillators, noise, filters). No samples or third-party audio. Cue times come from
build/cues.json, exported by src/pilot.mjs, so picture and sound share one timeline.

usage: python audio/mix.py build/cues.json audio/narration build/mix.wav
"""
import json, sys, wave
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, lfilter, lfilter_zi
from scipy.ndimage import minimum_filter1d

SR = 48000
rng = np.random.default_rng(101)
def T(d): return np.arange(max(1, int(d * SR))) / SR
def lp(x, f): return sosfilt(butter(2, min(f, 23000) / (SR / 2), "low", output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f / (SR / 2), "high", output="sos"), x)
def bp(x, a, b): return sosfilt(butter(2, [a / (SR / 2), min(b, 23000) / (SR / 2)], "band", output="sos"), x)
def noise(d): return rng.standard_normal(int(d * SR))
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def dec(n, k): return np.exp(-k * np.arange(n) / SR)
def chirp(f0, f1, d): t = T(d); return np.sin(2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / d)) / SR)


def add(*xs):
    """sum signals of different lengths (zero-padded)"""
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[: len(x)] += x
    return out


def place(buf, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i < 0 or i >= buf.shape[1]: return
    j = min(buf.shape[1], i + len(sig)); s = sig[: j - i] * g
    buf[0, i:j] += s * np.cos((pan + 1) * np.pi / 4) * 1.414; buf[1, i:j] += s * np.sin((pan + 1) * np.pi / 4) * 1.414


def bell(f, d=0.6, g=1.0):
    t = T(d); return g * 0.5 * sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k / d) for r, a, k in ((1, 1, 3), (2.0, 0.3, 5), (3.0, 0.12, 8)))


def marimba(f, d=0.45, g=1.0):
    t = T(d); s = np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 30)
    return g * s * np.minimum(1, t / 0.002)


def pad(freqs, d, a=0.3, r=0.5, cut=1600):
    t = T(d); s = np.zeros(len(t))
    for f in freqs:
        for det in (-0.1, 0.1): s += 2 * ((f * 2 ** (det / 12) * t + rng.uniform()) % 1) - 1
    s /= 2 * len(freqs); s *= np.minimum(1, t / a) * np.minimum(1, (d - t) / r).clip(0, 1)
    return lp(s, cut)


def kick(g=1.0): t = T(0.32); return g * np.sin(2 * np.pi * np.cumsum(48 + 80 * np.exp(-t * 32)) / SR) * np.exp(-t * 10)
def hat(g=1.0): return g * hp(noise(0.04), 7000) * dec(int(0.04 * SR), 80) * 0.3
def whooshf(f0, f1, d, n=36):
    x = noise(d); out = np.zeros_like(x); e = np.linspace(0, len(x), n + 1).astype(int)
    for k in range(n):
        fc = f0 * (f1 / f0) ** (k / (n - 1)); seg = bp(x[max(0, e[k] - 2048): e[k + 1]], fc / 1.6, fc * 1.6); out[e[k]: e[k + 1]] = seg[-(e[k + 1] - e[k]):]
    return out * np.sin(np.pi * T(d) / d) ** 1.4


def sfx(e):
    ty = e["type"]
    if ty == "bar": return bell(midi([84, 88, 91, 96][e["step"]]), 0.4, 0.45)
    if ty == "flex": t = T(0.35); return np.sin(2 * np.pi * np.cumsum(300 + 500 * (t / 0.35) ** 0.5) / SR) * dec(len(t), 6) * 0.35
    if ty == "pickup": t = T(0.1); return np.sin(2 * np.pi * np.cumsum(500 + 600 * np.exp(-t * 40)) / SR) * dec(len(t), 30) * 0.5
    if ty == "windup": t = T(0.25); return lp(np.sin(2 * np.pi * np.cumsum(220 + 260 * (t / 0.25)) / SR), 2000) * np.sin(np.pi * t / 0.25) * 0.35
    if ty == "throw": return whooshf(500, 4000, 0.5) * 0.7 + chirp(400, 1800, 0.5) * dec(int(0.5 * SR), 4) * 0.2
    if ty == "tap": return bp(noise(0.02), 2500, 8000) * dec(int(0.02 * SR), 200) * 0.9 + np.sin(2 * np.pi * 1800 * T(0.02)) * dec(int(0.02 * SR), 150) * 0.3
    if ty == "spinner":
        d = e["dur"]; t = T(d); return np.sin(2 * np.pi * 900 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 6 * t)) * 0.06 * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2).clip(0, 1)
    if ty == "confused":
        o = np.zeros(int(0.5 * SR))
        for k, m in enumerate((76, 72)): b = marimba(midi(m), 0.3, 0.5); i = int(k * 0.14 * SR); o[i: i + len(b)] += b
        return o
    if ty in ("whoosh",): return whooshf(300, 2500, 0.7) * 0.6
    if ty == "crestPing": return add(bell(midi(96), 0.4, 0.35), bell(midi(103), 0.35, 0.15))
    if ty == "meterPop": return sfx({"type": "pickup"}) * 1.2
    if ty == "needle":
        d = e["dur"]; o = np.zeros(int(d * SR) + 1000)
        for k in range(int(d / 0.09)): c = hp(noise(0.006), 3000) * dec(int(0.006 * SR), 500); i = int(k * 0.09 * SR); o[i: i + len(c)] += c * 0.35
        return o
    if ty == "shrug": t = T(0.3); return lp(np.sin(2 * np.pi * np.cumsum(220 - 90 * t / 0.3) / SR), 1200) * np.sin(np.pi * t / 0.3) * 0.4
    if ty == "crane": return whooshf(200, 3000, e["dur"] + 0.3) * 0.8
    if ty == "join": return bell(midi(100 + int(rng.integers(0, 5))), 0.18, 0.25)
    if ty == "gate":
        if e.get("hero"): return add(bell(midi(91), 0.6, 0.7), bell(midi(98), 0.5, 0.35))
        return hp(noise(0.008), 2000) * dec(int(0.008 * SR), 300) * 0.6
    if ty == "crowdBed":
        d = e["dur"]; t = T(d); x = bp(noise(d), 250, 2500); am = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 0.7 * t + 1)) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.3 * t))
        return x * am * 0.18 * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.6).clip(0, 1)
    if ty == "zipBack": return chirp(2400, 500, 0.6) * dec(int(0.6 * SR), 3) * 0.25 + whooshf(4000, 600, 0.6) * 0.5
    if ty == "load":
        o = np.zeros(int(0.8 * SR))
        for k, m in enumerate((79, 83, 86)): b = bell(midi(m), 0.6, 0.5); i = int(k * 0.05 * SR); o[i: i + len(b)] += b[: len(o) - i]
        return o
    if ty == "catch": return add(sfx({"type": "pickup"}), marimba(midi(84), 0.3, 0.4))
    if ty == "plaque":
        o = np.zeros(int(1.4 * SR)); t = T(0.25); th = np.sin(2 * np.pi * np.cumsum(90 + 120 * np.exp(-t * 30)) / SR) * dec(len(t), 14) * 0.6
        o[: len(th)] += th
        for m in (74, 78, 81, 86): b = bell(midi(m), 1.2, 0.28); o[: len(b)] += b
        return o
    if ty == "sig": return bell(midi(98), 0.3, 0.15)
    raise ValueError(ty)


def music(dur):
    """D-dorian, 104 BPM. Bright marimba motif while bars light; thins out when the page stalls; a building
    pulse during the crowd reveal; warm resolve on the takeaway."""
    m = np.zeros((2, int(dur * SR))); beat = 60 / 104
    motif = [62, 69, 72, 74, 69, 72, 76, 74]
    for k in range(8): place(m, marimba(midi(motif[k] + 12), 0.4, 0.15), 0.05 + k * beat / 2, 1.0, -0.3 if k % 2 else 0.3)
    place(m, pad([midi(n) for n in (50, 57, 62, 65)], 2.2, 0.05, 0.8, 1800), 0.0, 0.35)
    # stall (1.4-2.7): only a ticking hat
    for k in range(int(1.3 / (beat / 2))): place(m, hat(0.7), 1.4 + k * beat / 2, 1.0, 0.2)
    # explanation (2.7-6.3): soft pad Dm7 -> G7, light marimba every beat
    place(m, pad([midi(n) for n in (50, 57, 60, 65)], 2.0, 0.3, 0.5, 1500), 2.7, 0.3)
    place(m, pad([midi(n) for n in (55, 59, 62, 65)], 1.9, 0.3, 0.5, 1500), 4.55, 0.3)
    for k in range(int(3.5 / beat)): place(m, marimba(midi([74, 72, 69, 72][k % 4]), 0.35, 0.18), 2.8 + k * beat, 1.0, 0.25 if k % 2 else -0.25)
    # reveal (6.3-11.1): building pulse, kick + hats, rising pad
    for k in range(int(4.8 / (beat / 2))):
        tt = 6.3 + k * beat / 2; prog = k / (4.8 / (beat / 2))
        if k % 2 == 0: place(m, kick(0.5 + 0.4 * prog), tt, 1.0)
        place(m, hat(0.4 + 0.6 * prog), tt + beat / 4, 1.0, 0.3 if k % 2 else -0.3)
        place(m, marimba(midi([62, 65, 69, 72][k % 4] + 12), 0.25, 0.12 + 0.1 * prog), tt, 1.0, -0.2 if k % 2 else 0.2)
    place(m, pad([midi(n) for n in (50, 57, 62, 64, 69)], 4.9, 2.5, 0.4, 2200), 6.3, 0.32)
    # resolve (11.1-15): Fmaj7 -> C/E -> Dm9 ring
    place(m, pad([midi(n) for n in (53, 57, 60, 64)], 2.0, 0.2, 0.6, 2000), 11.1, 0.32)
    place(m, pad([midi(n) for n in (50, 57, 62, 64, 69)], 2.9, 0.3, 1.6, 2000), 12.6, 0.34)
    for k in range(int(3.7 / (beat / 2))):
        tt = 11.2 + k * beat / 2
        place(m, marimba(midi([69, 72, 76, 74, 72, 69, 67, 69][k % 8] + 12), 0.4, 0.13 * max(0.3, 1 - k / 18)), tt, 1.0, -0.35 if k % 2 else 0.35)
    return m


def reverb(x, t60, mix):
    n = int(t60 * SR); t = np.arange(n) / SR; out = []
    for c in range(2):
        ir = lp(rng.standard_normal(n) * np.exp(-6.9 * t / t60), 5000); ir /= np.sqrt(np.sum(ir ** 2)); out.append(fftconvolve(x[c], ir)[: x.shape[1]])
    return x * (1 - mix) + np.stack(out) * mix


def limiter(x, ceiling=0.7, look_ms=4.0):
    g = np.minimum(1.0, ceiling / np.maximum(np.max(np.abs(x), axis=0), 1e-9))
    la = int(look_ms * SR / 1000); g = minimum_filter1d(g, 2 * la + 1); w = np.hanning(2 * la + 1); g = np.convolve(g, w / w.sum(), mode="same")
    k = np.exp(-1 / (0.06 * SR)); rel, _ = lfilter([1 - k], [1, -k], g, zi=lfilter_zi([1 - k], [1, -k]) * g[0]); return x * np.minimum(g, rel)


def compress(x, thr=0.12, ratio=3.0):
    ka, kr = np.exp(-1 / (0.005 * SR)), np.exp(-1 / (0.08 * SR)); r = np.abs(x)
    env = np.maximum(0.5 * lfilter([1 - ka], [1, -ka], r) + 0.5 * lfilter([1 - kr], [1, -kr], r), 1e-6) * 1.6
    return x * np.where(env > thr, (env / thr) ** (1 / ratio - 1), 1.0)


def read_wav(p):
    with wave.open(str(p)) as w: sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16) / 32768.0
    if sr != SR:
        from scipy.signal import resample_poly; from math import gcd; g = gcd(SR, sr); x = resample_poly(x, SR // g, sr // g)
    return x


def main():
    cue = json.loads(Path(sys.argv[1]).read_text()); nar = Path(sys.argv[2]); out = Path(sys.argv[3])
    dur = cue["duration"]; N = int(dur * SR)
    mus = music(dur)[:, :N]
    fx = np.zeros((2, N))
    # light concert ambience under everything (crowd murmur), louder in the reveal via the crowdBed cue
    amb = bp(noise(dur), 300, 2200)[:N]; tt = np.arange(N) / SR
    amb *= (0.06 + 0.03 * np.sin(2 * np.pi * 0.4 * tt)) * np.minimum(1, tt / 0.3) * np.minimum(1, (dur - tt) / 0.4)
    fx += np.stack([amb, np.roll(amb, 2400)])
    for e in cue["events"]: place(fx, sfx(e), e["t"], e["gain"], e.get("pan", 0))
    vo = np.zeros((2, N)); env = np.zeros(N)
    meta = json.loads((nar / "narration_meta.json").read_text())
    for ln in meta["lines"]:
        x = hp(read_wav(nar / ln["file"]), 90); x = x + 0.25 * bp(x, 2500, 5000); x = compress(x); x /= np.max(np.abs(x)) + 1e-9
        place(vo, x, ln["start"], 1.0); i0 = int(ln["start"] * SR); env[i0: min(N, i0 + len(x))] = 1
    ka, kr = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.3 * SR))
    sm = np.clip(np.maximum(lfilter([1 - kr], [1, -kr], env), lfilter([1 - ka], [1, -ka], env)), 0, 1)
    mus = reverb(mus, 1.3, 0.2) * (1 - 0.82 * sm) * 0.8
    fx = reverb(fx, 0.7, 0.12) * (1 - 0.62 * sm)
    vo = reverb(vo, 0.45, 0.05)
    mix = mus + fx + vo
    mix *= np.minimum(1, np.arange(N) / (0.01 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.3 * SR))
    mix = hp(mix, 25); mix *= 0.13 / np.sqrt(np.mean(mix ** 2)); mix = limiter(mix, 0.70)
    rows = []
    for ln in meta["lines"]:
        i0, i1 = int(ln["start"] * SR), int((ln["start"] + ln["duration"]) * SR)
        v = np.sqrt(np.mean(bp(vo[0, i0:i1], 300, 4000) ** 2)); b = np.sqrt(np.mean(bp((mus + fx)[0, i0:i1], 300, 4000) ** 2))
        rows.append({"id": ln["id"], "start": ln["start"], "end": ln["end"], "text": ln["text"], "speech_band_db": round(20 * np.log10(v / b), 1)})
        print(f"  {ln['id']} {ln['start']:5.2f}-{ln['end']:5.2f}s voice/bed (300-4k) {rows[-1]['speech_band_db']:5.1f} dB  {ln['text']}")
    (out.parent / "voice_balance.json").write_text(json.dumps(rows, indent=1))
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16).T.copy()
    with wave.open(str(out), "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print("mix ->", out, "samples", N, "peak", round(float(np.max(np.abs(mix))), 3))


if __name__ == "__main__":
    main()
