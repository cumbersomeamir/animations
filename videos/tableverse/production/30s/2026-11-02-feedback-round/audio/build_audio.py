#!/usr/bin/env python3
"""Sound for "Four Groups of Three" (Pop-up Counting Storybook).

Everything here is synthesised from oscillators and filtered noise (no samples, no third-party audio):
- a soft, through-composed felt-piano accompaniment (a new chord voicing/pattern every bar, no short loop),
  kept far below the voice and ducked further while narration plays;
- paper foley (page turns, pop-up folds, flaps, slides), wooden "tok" per apple, one gentle chime per
  completed group, small ticks for badges, pencil scribble.
Timing comes from ../timeline.json (node src/render.mjs --timeline) so sound is locked to picture.

Usage (from the episode folder): <venv>/bin/python -I audio/build_audio.py
Outputs: build/mix.wav (48 kHz stereo float32), build/stems/{music,sfx,vo}.wav, build/vo_spans.json
"""
import json
import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, resample_poly, sosfilt

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
FPS = TL["fps"]
N = int(round(TL["frames"] / FPS * SR))
rng = np.random.default_rng(1102)


def fr(f):
    return f / FPS


def tt(d):
    return np.arange(int(d * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def noise(n):
    return rng.standard_normal(n)


def filt(x, kind, fc, order=2):
    return sosfilt(butter(order, fc, kind, fs=SR, output="sos"), x)


def fade(x, a=0.002, r=0.01):
    na, nr = min(len(x), int(a * SR)), min(len(x), int(r * SR))
    if na:
        x[:na] *= np.linspace(0, 1, na)
    if nr:
        x[-nr:] *= np.linspace(1, 0, nr)
    return x


class Bus:
    def __init__(self):
        self.b = np.zeros((N, 2))

    def add(self, x, t, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N:
            return
        if i < 0:  # clip anything that would start before 0 s
            x, i = x[-i:], 0
        x = x[: N - i] * gain
        l, r = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2), np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        self.b[i:i + len(x), 0] += x * l
        self.b[i:i + len(x), 1] += x * r


# ----------------------------------------------------------------------------- instruments
def felt_piano(m, d=2.2, v=0.5):
    """soft felted piano: slightly inharmonic partials, gentle hammer, long soft decay, low-passed"""
    f = mtof(m)
    t = tt(d)
    x = np.zeros(len(t))
    for k, (amp, dec) in enumerate([(1.0, 1.4), (0.42, 0.8), (0.2, 0.5), (0.09, 0.3), (0.05, 0.2)], start=1):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        x += amp * np.sin(2 * np.pi * fk * t + rng.random()) * np.exp(-t / dec)
    x += 0.04 * filt(noise(len(t)), "bandpass", [300, 1800]) * np.exp(-t / 0.012)
    x *= np.minimum(1, t / 0.006)
    x = filt(x, "lowpass", 2600)
    return fade(x * v * 0.45, 0.001, 0.25)


def bell(m, d=1.6, v=1.0):
    f = mtof(m)
    t = tt(d)
    parts = [(1.0, 1.0, 1.0), (2.0, 0.25, 0.5), (2.76, 0.3, 0.32), (5.4, 0.1, 0.12)]
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / dec) for r, a, dec in parts)
    return fade(x * v / 1.6, 0.001, 0.08)


def woodtok(f0=520, v=1.0):
    t = tt(0.16)
    x = np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.035) + 0.5 * np.sin(2 * np.pi * f0 * 2.3 * t) * np.exp(-t / 0.012)
    x += 0.25 * filt(noise(len(t)), "bandpass", [f0, f0 * 4]) * np.exp(-t / 0.006)
    return fade(x * v, 0.0005, 0.02)


def paper_noise(d, lo, hi):
    n = int(d * SR)
    x = filt(noise(n), "bandpass", [lo, hi])
    # crinkle: sparse sharp grains
    grains = np.zeros(n)
    for _ in range(int(d * 140)):
        p = int(rng.random() * (n - 300))
        g = filt(noise(300), "highpass", 2500) * np.exp(-np.arange(300) / SR / 0.002)
        grains[p:p + 300] += g * rng.random()
    return x, grains


# ----------------------------------------------------------------------------- sound effects
def sfx_page(p):
    d = fr(p.get("dur", 18)) + 0.25
    t = tt(d)
    x, gr = paper_noise(d, 500, 5000)
    env = np.sin(np.pi * np.clip(t / (d - 0.15), 0, 1)) ** 1.4
    thump = np.sin(2 * np.pi * 95 * t) * np.exp(-np.clip(t - (d - 0.2), 0, None) / 0.05) * (t > d - 0.2)
    return fade((x * env * 0.35 + gr[: len(t)] * env * 0.4 + 0.25 * thump) * 0.8, 0.01, 0.05)


def sfx_pop(p):
    t = tt(0.22)
    pitch = p.get("pitch", 1.0)
    body = filt(noise(len(t)), "bandpass", [180 * pitch, 900 * pitch]) * np.exp(-t / 0.03)
    snap = filt(noise(len(t)), "highpass", 3000) * np.exp(-t / 0.004)
    tone = np.sin(2 * np.pi * np.cumsum(220 * pitch * (1 + 0.5 * np.exp(-t / 0.02))) / SR) * np.exp(-t / 0.05)
    return fade((body * 0.6 + snap * 0.35 + tone * 0.35) * 0.7, 0.0005, 0.03)


def sfx_fold(p):
    x, gr = paper_noise(0.2, 1200, 6000)
    t = tt(0.2)
    return fade((x * 0.15 + gr * 0.5) * np.exp(-t / 0.08) * 0.7, 0.002, 0.03)


def sfx_flap(p):
    t = tt(0.25)
    x = filt(noise(len(t)), "bandpass", [300, 2200]) * np.sin(np.pi * np.clip(t / 0.18, 0, 1)) ** 2
    x += 0.3 * np.sin(2 * np.pi * 140 * p.get("pitch", 1) * t) * np.exp(-np.clip(t - 0.15, 0, None) / 0.03) * (t > 0.15)
    return fade(x * 0.45, 0.002, 0.03)


def sfx_toss(p):
    t = tt(0.3)
    x = filt(noise(len(t)), "bandpass", [700, 3000]) * np.sin(np.pi * t / 0.3) ** 2
    return fade(x * 0.12, 0.002, 0.02)


def sfx_tok(p):
    return woodtok(480 * p.get("pitch", 1.0), 0.55)


PENTA = [72, 74, 76, 79, 81, 84]


def sfx_chime(p):
    m = [76, 79, 81, 84, 86][min(4, p.get("step", 0))]
    x = bell(m, 1.8, 0.8)
    hi = bell(m + 12, 0.8, 0.25)
    x[: len(hi)] += hi
    return x * 0.32


def sfx_card(p):
    t = tt(0.08)
    return fade(filt(noise(len(t)), "bandpass", [1500, 6000]) * np.exp(-t / 0.006) * 0.35, 0.0003, 0.01)


def sfx_tick(p):
    return woodtok(900 * p.get("pitch", 1.0), 0.3)


def sfx_lift(p):
    d = fr(p.get("dur", 16)) + 0.8
    out = np.zeros(int(d * SR))
    notes = [67, 72, 74, 76, 79, 81, 84]
    for k, m in enumerate(notes):
        x = bell(m, 0.8, 0.35)
        pos = int(k * 0.06 * SR)
        out[pos:pos + len(x)] += x[: len(out) - pos]
    return out * 0.35


def sfx_slide(p):
    t = tt(0.4)
    x = filt(noise(len(t)), "bandpass", [900, 4000]) * np.sin(np.pi * t / 0.4) ** 2
    return fade(x * 0.06, 0.002, 0.02)


def sfx_count(p):
    m = [72, 74, 76, 77, 79, 81, 83, 84, 86, 88, 89, 91][p.get("step", 0)]
    t = tt(0.4)
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.12) + 0.3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.03)
    return fade(x * 0.12, 0.001, 0.03)


def sfx_pencil(p):
    d = fr(p.get("dur", 44))
    t = tt(d)
    x = filt(noise(len(t)), "bandpass", [2500, 7000])
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 6.5 * t) ** 2
    gaps = np.ones(len(t))
    for g in range(1, 3):  # pencil lifts between the three groups
        a = int(g / 3 * len(t))
        gaps[a - int(0.05 * SR):a + int(0.05 * SR)] = 0.1
    return fade(x * am * gaps * 0.07, 0.02, 0.05)


def sfx_sparkle(p):
    out = np.zeros(int(1.6 * SR))
    for k, m in enumerate([84, 88, 91, 96, 91]):
        x = bell(m, 0.9, 0.3)
        pos = int(k * 0.07 * SR)
        out[pos:pos + len(x)] += x[: len(out) - pos]
    return out * 0.3


SFX = {"page": sfx_page, "pop": sfx_pop, "fold": sfx_fold, "flap": sfx_flap, "toss": sfx_toss, "tok": sfx_tok,
       "chime": sfx_chime, "card": sfx_card, "tick": sfx_tick, "lift": sfx_lift, "slide": sfx_slide,
       "count": sfx_count, "pencil": sfx_pencil, "sparkle": sfx_sparkle}


# ----------------------------------------------------------------------------- music (through-composed, no loop)
# 80 bpm, 4/4 -> 3.0 s per bar; 10 bars = 30 s. Each bar gets its own voicing and broken-chord figure.
BEAT = 0.75
BARS = [  # (bass, chord tones, figure)  figure = beat offsets for the broken chord
    (41, [60, 65, 69], [0, 1, 2, 3]),           # F
    (40, [60, 64, 67], [0, 1.5, 2, 3]),         # C/E
    (38, [57, 62, 65], [0, 1, 2.5, 3]),         # Dm
    (34, [58, 62, 65], [0, 1, 2, 3.5]),         # Bb
    (41, [60, 65, 69, 72], [0, 1, 1.5, 2, 3]),  # F (fill begins to settle)
    (36, [60, 64, 67], [0, 2, 3]),              # C
    (38, [57, 62, 65, 69], [0, 1, 2, 3]),       # Dm  (page turn / regroup)
    (34, [58, 62, 65, 70], [0, 1.5, 3]),        # Bb
    (36, [60, 64, 67, 70], [0, 1, 2]),          # C7 (drawing)
    (41, [60, 65, 69, 72, 77], [0]),            # F  (CTA resolution, held)
]


def build_music():
    m = Bus()
    for bar, (bass, tones, fig) in enumerate(BARS):
        t0 = bar * 4 * BEAT
        m.add(felt_piano(bass, 3.2, 0.55), t0 + 0.02, 1.0, -0.15)
        if bar == len(BARS) - 1:
            for k, n in enumerate(tones):
                m.add(felt_piano(n, 3.0, 0.32), t0 + k * 0.05, 1.0, 0.1 * (k - 2))
            continue
        for k, off in enumerate(fig):
            n = tones[k % len(tones)] + (12 if (bar >= 4 and k == len(fig) - 1) else 0)
            jitter = rng.uniform(-0.012, 0.012)
            m.add(felt_piano(n, 2.4, 0.26 + 0.04 * (k == 0)), t0 + off * BEAT + jitter, 1.0, 0.25 if k % 2 else -0.05)
    # gentle air pad underneath (very low)
    t = tt(30.0)
    pad = np.zeros(len(t))
    for bar, (bass, tones, _) in enumerate(BARS):
        a, b = int(bar * 3.0 * SR), int((bar + 1) * 3.0 * SR)
        seg = t[a:b] - t[a]
        for n in tones[:3]:
            pad[a:b] += np.sin(2 * np.pi * mtof(n) * seg) * 0.05
        pad[a:b] *= np.minimum(1, seg / 0.4) * np.minimum(1, (3.0 - seg) / 0.4)
    m.add(filt(pad, "lowpass", 1200) * 0.5, 0.0)
    return m.b


# ----------------------------------------------------------------------------- narration
def load_vo(cid):
    sr, x = wavfile.read(os.path.join(HERE, "narration", f"{cid}.wav"))
    x = x.astype(np.float64) / 32768.0
    g = np.gcd(SR, sr)
    x = resample_poly(x, SR // g, sr // g)
    x = filt(x, "highpass", 80)
    v = x[np.abs(x) > 0.02 * np.abs(x).max()]
    x *= 10 ** (-17 / 20) / np.sqrt(np.mean(v ** 2))
    pk = np.abs(x).max()
    if pk > 10 ** (-2 / 20):
        x *= 10 ** (-2 / 20) / pk
    return x


def main():
    os.makedirs(os.path.join(ROOT, "build", "stems"), exist_ok=True)
    music = build_music()
    sfx = Bus()
    for name, f, p in TL["sfx"]:
        sfx.add(SFX[name](p), fr(f), 1.0, 0.0)
    vo = Bus()
    spans = []
    for cid, f in TL["vo"].items():
        x = load_vo(cid)
        vo.add(x, fr(f))
        spans.append({"id": cid, "start": round(fr(f), 3), "end": round(fr(f) + len(x) / SR, 3)})
    # duck music (-7 dB) and SFX (-3 dB) under narration, smooth 60 ms / 350 ms
    env = np.abs(vo.b).max(axis=1)
    win = int(0.03 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    active = (env > 0.01).astype(float)
    k_att, k_rel = int(0.06 * SR), int(0.35 * SR)
    act = np.convolve(active, np.ones(k_rel) / k_rel, mode="same")
    act = np.clip(np.convolve(act, np.ones(k_att) / k_att, mode="same") * 2.5, 0, 1)
    g_music = 1 - (1 - 10 ** (-7 / 20)) * act
    g_sfx = 1 - (1 - 10 ** (-3 / 20)) * act
    music_d = music * g_music[:, None] * 0.42
    sfx_d = sfx.b * g_sfx[:, None] * 0.6
    mix = music_d + sfx_d + vo.b
    mix = np.tanh(mix * 1.05) / 1.05
    mix *= 10 ** (-1 / 20) / np.abs(mix).max()
    nf = int(0.04 * SR)
    mix[-nf:] *= np.linspace(1, 0, nf)[:, None]
    wavfile.write(os.path.join(ROOT, "build", "mix.wav"), SR, mix.astype(np.float32))
    for name, b in (("music", music_d), ("sfx", sfx_d), ("vo", vo.b)):
        wavfile.write(os.path.join(ROOT, "build", "stems", f"{name}.wav"), SR, b.astype(np.float32))
    json.dump(spans, open(os.path.join(ROOT, "build", "vo_spans.json"), "w"), indent=2)
    print("samples", len(mix), "dur", len(mix) / SR)
    for s in spans:
        print(f"  {s['id']}: {s['start']:6.2f} -> {s['end']:6.2f}")


if __name__ == "__main__":
    main()
