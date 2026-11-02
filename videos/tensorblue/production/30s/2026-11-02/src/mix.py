"""Original score + event-linked SFX + narration mix for Tensorblue 30s production 01.

Everything except the narration is synthesized here (no samples, no third-party audio).
usage: python mix.py <audio_dir>
  reads  voice.wav (Kokoro, 24 kHz mono), sfx-events.json (from dump-events.mjs)
  writes music.wav, sfx.wav (stems, 48 kHz stereo) and mix.wav (48 kHz stereo, 24-bit)
  prints integrated loudness / true peak of the mix
"""
import json
import os
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal
from scipy.ndimage import minimum_filter1d

SR = 48000
DUR = 30.0
N = int(SR * DUR)
TARGET_LUFS = -15.0
TP_CEIL_DB = -1.6
rng = np.random.default_rng(20261102)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def place(buf, x, t0, gain=1.0, pan=0.0):
    i0 = int(round(t0 * SR))
    if i0 >= len(buf):
        return
    x = x[: len(buf) - i0]
    gl = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    gr = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    buf[i0:i0 + len(x), 0] += x * gain * gl
    buf[i0:i0 + len(x), 1] += x * gain * gr


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lowpass(x, f, order=2):
    sos = signal.butter(order, f, btype="low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def highpass(x, f, order=2):
    sos = signal.butter(order, f, btype="high", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def env_ad(n, a, d):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
    return e


# ---------------------------------------------------------------- SFX ----------
def sfx_scratch(d, red=False):
    """pen/pencil scratching on paper: band-limited noise in irregular strokes"""
    n = int(d * SR)
    x = rng.standard_normal(n)
    x = bandpass(x, 1800 if not red else 1300, 7500 if not red else 5200)
    t = np.arange(n) / SR
    rate = rng.uniform(7, 11)
    strokes = np.abs(np.sin(np.pi * rate * t + rng.uniform(0, 3))) ** 1.5
    jitter = lowpass(rng.standard_normal(n), 18) * 6 + 1
    e = strokes * np.clip(jitter, 0.3, 2) * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.06)
    return x * e * 0.22


def sfx_erase(d):
    n = int(d * SR)
    t = np.arange(n) / SR
    x = bandpass(rng.standard_normal(n), 250, 2600)
    rub = np.abs(np.sin(np.pi * 11 * t)) ** 0.8
    e = rub * np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.08)
    return x * e * 0.32


def sfx_pop(kind=""):
    f0, f1 = (900, 430) if kind == "hi" else (420, 210) if kind == "lo" else (640, 300)
    d = 0.12
    t = t_axis(d)
    f = f1 + (f0 - f1) * np.exp(-t / 0.025)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * env_ad(len(t), 0.002, 0.04)
    click = bandpass(rng.standard_normal(len(t)), 2000, 6000) * env_ad(len(t), 0.0005, 0.004) * 0.3
    return (x * 0.55 + click)


def sfx_swish(hero=False):
    d = 0.42
    n = int(d * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    # sweeping band: render in short blocks
    out = np.zeros(n)
    blk = 1024
    for i in range(0, n, blk):
        k = i / n
        fc = (900 + 2600 * np.sin(np.pi * k)) * (1.25 if hero else 1.0)
        sos = signal.butter(2, [fc * 0.6, min(fc * 1.6, SR / 2 - 100)], btype="band", fs=SR, output="sos")
        out[i:i + blk] = signal.sosfilt(sos, x[i:i + blk])
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return out * e * 0.16


def sfx_stamp():
    d = 0.22
    t = t_axis(d)
    thump = np.sin(2 * np.pi * (110 + 60 * np.exp(-t / 0.02)) * t) * env_ad(len(t), 0.002, 0.05)
    paper = bandpass(rng.standard_normal(len(t)), 800, 5000) * env_ad(len(t), 0.001, 0.03) * 0.35
    return thump * 0.7 + paper


def sfx_tick():
    d = 0.05
    t = t_axis(d)
    return bandpass(rng.standard_normal(len(t)), 2500, 7000) * env_ad(len(t), 0.0005, 0.008) * 0.6


def sfx_clock():
    d = 0.32
    out = np.zeros(int(d * SR))
    for k, (t0, fc) in enumerate([(0.0, 2400), (0.14, 1700)]):
        n = int(0.06 * SR)
        tk = bandpass(rng.standard_normal(n), fc * 0.7, fc * 1.4) * env_ad(n, 0.0005, 0.01)
        body = np.sin(2 * np.pi * (fc / 2) * np.arange(n) / SR) * env_ad(n, 0.0005, 0.012) * 0.4
        i0 = int(t0 * SR)
        out[i0:i0 + n] += (tk + body) * 0.7
    return out


def sfx_chime():
    d = 2.2
    t = t_axis(d)
    out = np.zeros(len(t))
    for k, (f, t0) in enumerate([(880.0, 0.0), (1174.66, 0.16)]):
        tt = np.clip(t - t0, 0, None)
        on = (t >= t0).astype(float)
        for ratio, amp, dec in [(1, 1.0, 0.9), (2.0, 0.25, 0.5), (2.76, 0.18, 0.35), (5.4, 0.06, 0.15)]:
            out += on * amp * np.sin(2 * np.pi * f * ratio * tt) * np.exp(-tt / dec) * np.minimum(1, tt / 0.004)
    return out * 0.16


def build_sfx(events):
    buf = np.zeros((N, 2))
    for e in events:
        typ, t0 = e["type"], e["t"]
        pan = float(np.clip(rng.normal(0, 0.25), -0.5, 0.5))
        if typ == "scratch":
            place(buf, sfx_scratch(e.get("d", 0.4), e.get("red", False)), t0, 0.9, pan)
        elif typ == "erase":
            place(buf, sfx_erase(e.get("d", 0.4)), t0, 1.0, pan)
        elif typ == "pop":
            k = "hi" if e.get("hi") else "lo" if e.get("lo") else ""
            place(buf, sfx_pop(k), t0, 0.8, pan)
        elif typ == "swish":
            place(buf, sfx_swish(e.get("hero", False)), t0, 1.0, pan)
        elif typ == "stamp":
            place(buf, sfx_stamp(), t0, 0.9, pan)
        elif typ == "tick":
            place(buf, sfx_tick(), t0, 0.7, pan)
        elif typ == "clock":
            place(buf, sfx_clock(), t0, 0.8, 0.3)
        elif typ == "scribble":
            place(buf, sfx_scratch(e.get("d", 0.3)) * 1.2, t0, 1.0, pan)
        elif typ == "paper":
            n = int(0.5 * SR)
            x = bandpass(rng.standard_normal(n), 500, 4000) * np.sin(np.pi * np.arange(n) / n) ** 2 * 0.12
            place(buf, x, t0, 1.0, 0)
        elif typ == "chime":
            place(buf, sfx_chime(), t0, 1.0, 0.1)
    return buf


# ---------------------------------------------------------------- music --------
BPM = 96
BEAT = 60 / BPM
BAR = BEAT * 4


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# D major: Dmaj9 | Bm7 | Gmaj7 | A6sus  (repeats), ends on Dmaj9
CHORDS = [
    (50, [62, 66, 69, 73, 76]),   # D
    (47, [62, 66, 69, 71, 74]),   # Bm7
    (43, [62, 67, 71, 74, 78]),   # Gmaj7
    (45, [61, 64, 69, 71, 74]),   # A6sus-ish
]


def pluck(f, d, vel):
    """soft felt-piano-like pluck: few harmonics, quick attack, warm decay"""
    t = t_axis(d)
    x = np.zeros(len(t))
    for h, a in [(1, 1.0), (2, 0.35), (3, 0.12), (4, 0.05)]:
        x += a * np.sin(2 * np.pi * f * h * t * (1 + 0.0007 * h)) * np.exp(-t * (2.2 + h * 1.4))
    x *= np.minimum(1, t / 0.006)
    return lowpass(x, 3200) * vel


def pad(freqs, d):
    t = t_axis(d)
    x = np.zeros(len(t))
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            x += np.sin(2 * np.pi * f * (1 + det / 100) * t + rng.uniform(0, 6.28))
    x /= len(freqs) * 3
    e = np.minimum(1, t / 0.9) * np.minimum(1, (d - t) / 0.9)
    return lowpass(x * e, 1400)


def build_music():
    buf = np.zeros((N, 2))
    nbars = int(np.ceil(DUR / BAR))
    for b in range(nbars):
        t0 = b * BAR
        root, tones = CHORDS[b % 4]
        last = b == nbars - 1
        if last:
            root, tones = CHORDS[0]
        # pad (wide), bass on 1 and the "and" of 3
        p = pad([midi(m - 12) for m in tones[:3]], BAR + 0.9)
        place(buf, p * 0.55, t0, 1.0, -0.35)
        place(buf, p * 0.55, t0 + 0.011, 1.0, 0.35)
        bass = pluck(midi(root - 12), 1.6, 0.55)
        place(buf, bass, t0, 1.0, 0)
        if not last:
            place(buf, pluck(midi(root - 12), 1.0, 0.3), t0 + BEAT * 2.5, 1.0, 0)
        # arpeggio in 8ths, sparse and gentle
        pattern = [0, 2, 1, 3, 2, 4, 3, 1] if b % 2 == 0 else [0, 1, 2, 4, 3, 2, 1, 3]
        for i, k in enumerate(pattern):
            if last and i > 3:
                break
            tt = t0 + i * BEAT / 2
            vel = 0.22 + 0.06 * (i % 2 == 0) + rng.uniform(-0.03, 0.03)
            place(buf, pluck(midi(tones[k]), 1.4, vel), tt, 1.0, float(np.clip((k - 2) * 0.22, -0.5, 0.5)))
    # final resolve: a soft D chord at 29.0 s
    for i, m in enumerate([62, 66, 69, 74]):
        place(buf, pluck(midi(m), 1.2, 0.2), 29.0 + i * 0.03, 1.0, (i - 1.5) * 0.2)
    # gentle fades
    t = np.arange(N) / SR
    fade = np.minimum(1, t / 0.25) * np.minimum(1, (DUR - t) / 0.6)
    return buf * fade[:, None]


# ---------------------------------------------------------------- mix ---------
def true_peak_db(x):
    up = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.max(np.abs(up)) + 1e-12)


def limiter(x, ceil_db, look=0.003, release=0.08):
    """simple look-ahead peak limiter on the 4x-oversampled peak envelope"""
    ceil = 10 ** (ceil_db / 20)
    up = signal.resample_poly(np.max(np.abs(x), axis=1), 4, 1)
    peak = np.maximum.reduceat(np.abs(up), np.arange(0, len(up), 4))[: len(x)]
    need = np.minimum(1.0, ceil / np.maximum(peak, 1e-9))
    la = int(look * SR)
    # look-ahead: gain is the minimum needed within +-`look` of each sample
    g = minimum_filter1d(need, size=2 * la + 1, origin=0)
    # smooth release
    a = np.exp(-1 / (release * SR))
    out = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]
        out[i] = cur
    return x * out[:, None]


def main():
    d = sys.argv[1]
    voice, vsr = sf.read(os.path.join(d, "voice.wav"), dtype="float64")
    if voice.ndim > 1:
        voice = voice.mean(axis=1)
    voice = signal.resample_poly(voice, SR, vsr)
    voice = highpass(voice, 70)
    v = np.zeros(N)
    v[: min(N, len(voice))] = voice[:N]
    ev = json.load(open(os.path.join(d, "sfx-events.json")))
    sfx = build_sfx(ev["sfx"])
    music = build_music()

    meter = pyln.Meter(SR)
    # stem levels relative to the voice (voice upfront)
    vst = np.stack([v, v], axis=1)
    lv = meter.integrated_loudness(vst)
    vst *= 10 ** ((-16.0 - lv) / 20)
    lm = meter.integrated_loudness(music)
    music *= 10 ** ((-33.0 - lm) / 20)
    ls = meter.integrated_loudness(sfx)
    sfx *= 10 ** ((-30.0 - ls) / 20)
    # duck the music under speech (smoothed voice envelope)
    venv = lowpass(np.abs(v), 4)
    venv = venv / (venv.max() + 1e-9)
    duck = 1 - 0.45 * np.clip(venv * 4, 0, 1)
    music *= duck[:, None]
    mix = vst + music + sfx
    # normalise to the target loudness, then keep true peak under the ceiling
    lmix = meter.integrated_loudness(mix)
    g1 = 10 ** ((TARGET_LUFS - lmix) / 20)
    mix *= g1
    if true_peak_db(mix) > TP_CEIL_DB:
        mix = limiter(mix, TP_CEIL_DB - 0.2)
    lfin = meter.integrated_loudness(mix)
    g2 = 10 ** ((TARGET_LUFS - lfin) / 20)
    mix *= g2
    if true_peak_db(mix) > TP_CEIL_DB:
        mix = limiter(mix, TP_CEIL_DB - 0.3)
    # outro: once the last line has ended, lift the score ~+6 dB so the ending
    # does not fall into near-silence. Added after normalisation so every sample
    # under the narration is unchanged.
    t = np.arange(N) / SR
    last_end = max(l["t1"] for l in json.load(open(os.path.join(d, "voice-timing.json")))["lines"])
    ramp = np.clip((t - (last_end + 0.2)) / 0.6, 0, 1)
    lift = (10 ** (6 / 20) - 1) * ramp
    mix += music * (g1 * g2) * lift[:, None]
    sf.write(os.path.join(d, "music.wav"), music, SR, subtype="PCM_16")
    sf.write(os.path.join(d, "sfx.wav"), sfx, SR, subtype="PCM_16")
    sf.write(os.path.join(d, "mix.wav"), mix, SR, subtype="PCM_24")
    print(json.dumps({
        "integrated_lufs": round(meter.integrated_loudness(mix), 2),
        "true_peak_dbtp": round(true_peak_db(mix), 2),
        "voice_lufs_in_mix": round(meter.integrated_loudness(vst * 10 ** ((TARGET_LUFS - lmix) / 20)), 2),
        "samples": len(mix), "sr": SR,
    }))


if __name__ == "__main__":
    main()
