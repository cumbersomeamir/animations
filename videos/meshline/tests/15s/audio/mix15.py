"""Original sound for the 15s text-message test: per-message cues (skill §8: one pop/ding per message on the
frame timeline, keyboard ticks under typing windows) + a light lo-fi chat bed that only "unmutes" when
messaging switches to nearby. Synthesised from scratch with numpy/scipy (no samples).

usage: python audio/mix15.py build/cues.json audio/narration build/mix.wav
"""
import json, sys, wave
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, lfilter, lfilter_zi
from scipy.ndimage import minimum_filter1d

SR = 48000
rng = np.random.default_rng(15)


def T(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, min(f, 23000) / (SR / 2), "low", output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f / (SR / 2), "high", output="sos"), x)
def bp(x, a, b): return sosfilt(butter(2, [a / (SR / 2), min(b, 23000) / (SR / 2)], "band", output="sos"), x)
def noise(d): return rng.standard_normal(int(d * SR))
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def dec(n, k): return np.exp(-k * np.arange(n) / SR)
def chirp(f0, f1, d): t = T(d); return np.sin(2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / d)) / SR)


def place(buf, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i < 0 or i >= buf.shape[1]:
        return
    j = min(buf.shape[1], i + len(sig))
    s = sig[: j - i] * g
    buf[0, i:j] += s * np.cos((pan + 1) * np.pi / 4) * 1.414
    buf[1, i:j] += s * np.sin((pan + 1) * np.pi / 4) * 1.414


def bell(f, d=0.6, g=1.0):
    t = T(d)
    return g * 0.5 * sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k / d) for r, a, k in ((1, 1, 3), (2.0, 0.35, 5), (3.01, 0.15, 8)))


def keys(freqs, d, g=1.0):  # soft electric-piano-ish chord (sine + tremolo + bell attack)
    t = T(d)
    s = sum(np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6) for f in freqs) / len(freqs)
    s *= (1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)) * np.minimum(1, t / 0.01) * np.exp(-t * 0.9) * np.minimum(1, (d - t) / 0.15).clip(0, 1)
    return lp(s, 3500) * g


def kick(g=1.0):
    t = T(0.3); return g * np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-t * 30)) / SR) * np.exp(-t * 11)


def snap(g=1.0):
    return g * bp(noise(0.12), 1500, 6000) * dec(int(0.12 * SR), 45) * 0.5


def shaker(g=1.0):
    return g * hp(noise(0.05), 6000) * dec(int(0.05 * SR), 70) * 0.25


def sub(f, d, g=1.0):
    t = T(d); return g * np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.05).clip(0, 1) * 0.6


def sfx(e):
    ty = e["type"]
    if ty == "send":   # crisp swoosh + rising blip
        d = 0.16; t = T(d)
        sw = bp(noise(d), 2500, 9000) * np.sin(np.pi * t / d) ** 2 * 0.35
        return sw + chirp(700, 1500, d) * dec(len(t), 22) * 0.35
    if ty == "receive":  # softer two-tone ding
        o = np.zeros(int(0.6 * SR)); a = bell(midi(88), 0.5, 0.55); b = bell(midi(95), 0.45, 0.4)
        o[: len(a)] += a; o[int(0.07 * SR): int(0.07 * SR) + len(b)] += b; return o
    if ty == "typing":  # quiet keyboard-tick bed under the typing window
        d = e["dur"]; o = np.zeros(int(d * SR) + 2000); tt = 0.0; k = 0
        while tt < d - 0.05:
            c = bp(noise(0.012), 1800, 7000) * dec(int(0.012 * SR), 400) * (0.5 + 0.5 * ((k * 7) % 5) / 4)
            i = int(tt * SR); o[i: i + len(c)] += c; tt += 0.065 + 0.03 * ((k * 3) % 4) / 3; k += 1
        return o * 0.5
    if ty == "fail":  # dull double "bonk"
        o = np.zeros(int(0.4 * SR))
        for k, f in enumerate((240, 180)):
            t = T(0.11); b = np.sign(np.sin(2 * np.pi * np.cumsum(f * (1 - 0.3 * t / 0.11)) / SR)) * dec(len(t), 25)
            i = int(k * 0.13 * SR); o[i: i + len(b)] += lp(b, 1800) * 0.35
        return o
    if ty == "refill":
        d = 0.09; return chirp(900, 2000, d) * dec(int(d * SR), 30) * 0.3 + np.concatenate([hp(noise(0.004), 3000) * 0.3, np.zeros(int(d * SR) - int(0.004 * SR))])
    if ty == "switch":  # Meshline link chime for this test: E5 G#5 B5 E6
        o = np.zeros(int(1.2 * SR))
        for k, m in enumerate((76, 80, 83, 88)):
            b = bell(midi(m), 0.8, 0.5); i = int(k * 0.06 * SR); o[i: i + len(b)] += b[: len(o) - i]
        return o
    if ty in ("sweep", "cardWhoosh"):
        d = e.get("dur", 0.6) + 0.15; t = T(d); x = noise(d); out = np.zeros_like(x); n = 40
        edges = np.linspace(0, len(x), n + 1).astype(int)
        for k in range(n):
            fc = 600 * (6000 / 600) ** (k / (n - 1)) if ty == "sweep" else 3000 * (500 / 3000) ** (k / (n - 1))
            seg = bp(x[max(0, edges[k] - 2048): edges[k + 1]], fc / 1.6, fc * 1.6); out[edges[k]: edges[k + 1]] = seg[-(edges[k + 1] - edges[k]):]
        return out * np.sin(np.pi * t / d) ** 1.5 * 0.6
    if ty == "tapback":
        t = T(0.1); p = np.sin(2 * np.pi * np.cumsum(400 + 800 * np.exp(-t * 40)) / SR) * dec(len(t), 30) * 0.5
        o = np.zeros(int(0.5 * SR)); o[: len(p)] += p; s = bell(midi(100), 0.35, 0.3); o[int(0.05 * SR): int(0.05 * SR) + len(s)] += s; return o
    if ty == "read":
        return bell(midi(93), 0.2, 0.25)
    if ty == "pop":
        t = T(0.12); return np.sin(2 * np.pi * np.cumsum(380 + 900 * np.exp(-t * 45)) / SR) * dec(len(t), 28) * 0.6
    if ty == "ctaPop":
        o = np.zeros(int(1.2 * SR)); p = sfx({"type": "pop"}); o[: len(p)] += p
        for m in (76, 83, 88): b = bell(midi(m), 1.0, 0.3); o[: len(b)] += b
        return o
    if ty == "shimmer":
        return bell(midi(100), 0.5, 0.2) + np.pad(bell(midi(104), 0.45, 0.12), (0, int(0.05 * SR)))[: int(0.5 * SR)]
    raise ValueError(ty)


def music(dur, switch, end):
    m = np.zeros((2, int(dur * SR)))
    # offline: low muffled pad + sparse tick (tension, no groove)
    t = T(switch + 0.3)
    pad = (np.sin(2 * np.pi * midi(40) * t) + 0.5 * np.sin(2 * np.pi * midi(47) * t)) * 0.16 * np.minimum(1, t / 0.4)
    pad *= np.minimum(1, (switch + 0.3 - t) / 0.3).clip(0, 1)
    place(m, lp(pad, 500), 0.0)
    for k in range(int(switch / 0.5)): place(m, shaker(0.6), k * 0.5 + 0.25, 1.0, 0.3)
    # nearby: lo-fi groove at 96 BPM, chords Emaj9 - C#m9 - Amaj9 - B6
    beat = 60 / 96; bar = 4 * beat
    chords = [(40, [64, 68, 71, 75, 78]), (37, [61, 64, 68, 71, 75]), (45, [64, 69, 73, 76, 80]), (47, [63, 66, 71, 75, 78])]
    t0 = switch
    b = 0
    while t0 + b * bar < end:
        root, notes = chords[b % 4]; tb = t0 + b * bar
        place(m, keys([midi(n) for n in notes], bar + 0.2, 0.42), tb, 1.0)
        for k in range(4):
            tt = tb + k * beat
            if tt >= end: break
            place(m, kick(0.75 if k % 2 == 0 else 0.0), tt, 1.0)
            if k % 2 == 1: place(m, snap(0.8), tt, 1.0, 0.1)
            place(m, sub(midi(root), beat * 0.9, 0.55), tt, 1.0)
            for h in range(2): place(m, shaker(0.9), tt + h * beat / 2 + beat / 4, 1.0, -0.3 if h else 0.3)
        b += 1
    # end card: resolve on Emaj9, arpeggio sparkles, ring out to the last frame
    place(m, keys([midi(n) for n in (52, 64, 68, 71, 75, 78)], dur - end + 0.1, 0.5), end, 1.0)
    place(m, sub(midi(40), 2.0, 0.5), end)
    arp = (76, 80, 83, 87, 88, 87, 83, 80)
    for k in range(int((dur - end - 1.0) / 0.156)):
        place(m, bell(midi(arp[k % 8] + 12), 0.3, 0.16 * max(0.2, 1 - k / 26)), end + 0.2 + k * 0.156, 1.0, -0.4 if k % 2 else 0.4)
    # bed fades in over the switch (filter-like volume ramp)
    ramp = np.ones(m.shape[1]); i0, i1 = int(switch * SR), int((switch + 0.6) * SR)
    ramp[i0:i1] = np.linspace(0.2, 1, i1 - i0) ** 2
    return m * ramp


def reverb(x, t60, mix):
    n = int(t60 * SR); t = np.arange(n) / SR
    out = []
    for c in range(2):
        ir = lp(rng.standard_normal(n) * np.exp(-6.9 * t / t60), 5000); ir /= np.sqrt(np.sum(ir ** 2))
        out.append(fftconvolve(x[c], ir)[: x.shape[1]])
    return x * (1 - mix) + np.stack(out) * mix


def limiter(x, ceiling=0.7, look_ms=4.0):
    g = np.minimum(1.0, ceiling / np.maximum(np.max(np.abs(x), axis=0), 1e-9))
    la = int(look_ms * SR / 1000); g = minimum_filter1d(g, 2 * la + 1)
    w = np.hanning(2 * la + 1); g = np.convolve(g, w / w.sum(), mode="same")
    k = np.exp(-1 / (0.06 * SR)); rel, _ = lfilter([1 - k], [1, -k], g, zi=lfilter_zi([1 - k], [1, -k]) * g[0])
    return x * np.minimum(g, rel)


def read_wav(p):
    with wave.open(str(p)) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16) / 32768.0
    if sr != SR:
        from scipy.signal import resample_poly; from math import gcd
        g = gcd(SR, sr); x = resample_poly(x, SR // g, sr // g)
    return x


def main():
    cue = json.loads(Path(sys.argv[1]).read_text()); nar = Path(sys.argv[2]); out = Path(sys.argv[3])
    dur = cue["duration"]; N = int(dur * SR)
    mus = music(dur, cue["switchAt"], cue["endAt"])[:, :N]
    fx = np.zeros((2, N))
    for e in cue["events"]:
        pan = {"send": 0.25, "receive": -0.25, "typing": -0.25, "fail": 0.25}.get(e["type"], 0.0)  # sent=right, received=left
        place(fx, sfx(e), e["t"], e["gain"], pan)
    vo = np.zeros((2, N)); env = np.zeros(N)
    meta = json.loads((nar / "narration_meta.json").read_text())
    for ln in meta["lines"]:
        x = hp(read_wav(nar / ln["file"]), 90); x = x + 0.25 * bp(x, 2500, 5000); x /= np.max(np.abs(x)) + 1e-9
        place(vo, x, ln["start"], 1.0); i0 = int(ln["start"] * SR); env[i0: min(N, i0 + len(x))] = 1
    k_a, k_r = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.3 * SR))
    sm = np.maximum(lfilter([1 - k_r], [1, -k_r], env), lfilter([1 - k_a], [1, -k_a], env))
    mus = reverb(mus, 1.2, 0.2) * (1 - 0.75 * np.clip(sm, 0, 1)) * 0.85
    fx = reverb(fx, 0.6, 0.1) * (1 - 0.45 * np.clip(sm, 0, 1))
    vo = reverb(vo, 0.5, 0.05)
    mix = mus + fx + vo
    mix *= np.minimum(1, np.arange(N) / (0.01 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.35 * SR))
    mix = hp(mix, 25)
    mix *= 0.135 / np.sqrt(np.mean(mix ** 2))
    mix = limiter(mix, 0.70)
    # QA: speech-band voice/bed ratio per line
    rows = []
    for ln in meta["lines"]:
        i0, i1 = int(ln["start"] * SR), int((ln["start"] + ln["duration"]) * SR)
        v = np.sqrt(np.mean(bp(vo[0, i0:i1], 300, 4000) ** 2)); b = np.sqrt(np.mean(bp((mus + fx)[0, i0:i1], 300, 4000) ** 2))
        rows.append({"id": ln["id"], "start": ln["start"], "text": ln["text"], "speech_band_db": round(20 * np.log10(v / b), 1)})
        print(f"  {ln['id']} {ln['start']:5.2f}s voice/bed (300-4k) {rows[-1]['speech_band_db']:5.1f} dB  {ln['text']}")
    (out.parent / "voice_balance.json").write_text(json.dumps(rows, indent=1))
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16).T.copy()
    with wave.open(str(out), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print("mix ->", out, "samples", N, "peak", round(float(np.max(np.abs(mix))), 3))


if __name__ == "__main__":
    main()
