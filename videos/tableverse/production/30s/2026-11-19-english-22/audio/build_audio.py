#!/usr/bin/env python3
"""Sound for "Too Many Aliens!" (Pop-up Counting Storybook, english-22).

Everything here is synthesised from oscillators and filtered noise (no samples, no third-party audio):
- a bouncy, through-composed space-lobby accompaniment in A-flat major at 100 bpm (soft bass + plucked marimba-like
  melody, a new figure every bar, no short loop), kept far below the voice and ducked under narration; it thins to the
  bass while the tiny alien taps its foot, and the three lift "dings" are tuned to an A-flat chord (lift 1-2-3 rising);
- cartoon foley for the entertainment beats: door squeaks, squish, door clunks, spring "boings" when the tiny alien
  pops out, a rubbery stretch and a twang for the caught antenna, thuds, foot-tap toks, slides, pops and chimes.
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
rng = np.random.default_rng(1122)


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
def sfx_rise(p):
    # tray springs up on its hinge: soft paper whoosh + low thump at the end
    d = fr(p.get("dur", 18)) + 0.2
    t = tt(d)
    x, gr = paper_noise(d, 300, 3000)
    env = np.sin(np.pi * np.clip(t / (d - 0.1), 0, 1)) ** 1.5
    thump = np.sin(2 * np.pi * 85 * t) * np.exp(-np.clip(t - (d - 0.22), 0, None) / 0.06) * (t > d - 0.22)
    return fade((x * env * 0.3 + gr[: len(t)] * env * 0.25 + 0.4 * thump) * 0.8, 0.005, 0.05)


def sfx_pop(p):
    t = tt(0.2)
    pitch = p.get("pitch", 1.0)
    body = filt(noise(len(t)), "bandpass", [200 * pitch, 1000 * pitch]) * np.exp(-t / 0.025)
    snap = filt(noise(len(t)), "highpass", 3000) * np.exp(-t / 0.004)
    tone = np.sin(2 * np.pi * np.cumsum(260 * pitch * (1 + 0.5 * np.exp(-t / 0.02))) / SR) * np.exp(-t / 0.045)
    return fade((body * 0.5 + snap * 0.3 + tone * 0.3) * 0.6, 0.0005, 0.03)


def sfx_swing(p):
    t = tt(0.35)
    x = filt(noise(len(t)), "bandpass", [500, 2500]) * np.sin(np.pi * t / 0.35) ** 2
    return fade(x * 0.12, 0.003, 0.03)


def sfx_score(p):
    # pencil-on-paper scratch as the score line draws
    d = fr(p.get("dur", 26))
    t = tt(d)
    x = filt(noise(len(t)), "bandpass", [2500, 7500]) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t) ** 2)
    return fade(x * 0.06, 0.02, 0.05)


def sfx_glint(p):
    out = np.zeros(int(1.2 * SR))
    for k, m in enumerate([88, 91, 96]):
        x = bell(m, 0.8, 0.3)
        pos = int(k * 0.06 * SR)
        out[pos:pos + len(x)] += x[: len(out) - pos]
    return out * 0.28


def sfx_tick(p):
    return woodtok(900 * p.get("pitch", 1.0), 0.28)


def sfx_light(p):
    # gentle rising note per row found (C major pentatonic), soft
    m = [72, 74, 76, 79, 81][p.get("step", 0)]
    t = tt(0.6)
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.25) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.1)
    return fade(x * 0.14, 0.002, 0.05)


def sfx_slide(p):
    d = fr(p.get("dur", 20))
    t = tt(d)
    x = filt(noise(len(t)), "bandpass", [600, 3000]) * np.sin(np.pi * t / d) ** 2
    return fade(x * 0.09, 0.005, 0.02)


def sfx_hinge(p):
    # soft wooden hinge creak: slowly gliding narrow resonance over grainy noise
    d = fr(p.get("dur", 30))
    t = tt(d)
    f0 = 420 + 140 * np.sin(np.pi * t / d)
    tone = np.sin(2 * np.pi * np.cumsum(f0) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 38 * t) ** 8)
    grain = filt(noise(len(t)), "bandpass", [800, 2400]) * 0.4
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.2
    g = 0.05 if p.get("soft") else 0.09
    return fade((tone * 0.6 + grain) * env * g, 0.01, 0.03)


def sfx_flap(p):
    t = tt(0.25)
    x = filt(noise(len(t)), "bandpass", [300, 2200]) * np.sin(np.pi * np.clip(t / 0.18, 0, 1)) ** 2
    x += 0.3 * np.sin(2 * np.pi * 140 * p.get("pitch", 1) * t) * np.exp(-np.clip(t - 0.15, 0, None) / 0.03) * (t > 0.15)
    return fade(x * 0.4, 0.002, 0.03)


def sfx_chime(p):
    m = [76, 79, 84][min(2, p.get("step", 0))]
    x = bell(m, 1.8, 0.8)
    hi = bell(m + 12, 0.8, 0.25)
    x[: len(hi)] += hi
    if p.get("step", 0) == 2:  # the combined total gets a little chord
        x2 = bell(m - 5, 1.6, 0.5)
        x[: len(x2)] += x2
    return x * 0.3


def sfx_click(p):
    t = tt(0.12)
    x = woodtok(700, 0.6)[: len(t)] + 0.4 * filt(noise(len(t)), "highpass", 2000) * np.exp(-t / 0.005)
    return fade(x * (0.35 if p.get("soft") else 0.6), 0.0003, 0.02)


def sfx_whoosh(p):
    d = fr(p.get("dur", 22)) + 0.1
    t = tt(d)
    x = filt(noise(len(t)), "bandpass", [700, 3500]) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return fade(x * 0.08, 0.005, 0.02)


def sfx_sparkle(p):
    out = np.zeros(int(1.6 * SR))
    for k, m in enumerate([84, 88, 91, 96, 91]):
        x = bell(m, 0.9, 0.3)
        pos = int(k * 0.07 * SR)
        out[pos:pos + len(x)] += x[: len(out) - pos]
    return out * 0.28


def sfx_page(p):
    d = fr(p.get("dur", 24)) + 0.25
    t = tt(d)
    x, gr = paper_noise(d, 500, 5000)
    env = np.sin(np.pi * np.clip(t / (d - 0.15), 0, 1)) ** 1.4
    return fade((x * env * 0.3 + gr[: len(t)] * env * 0.35) * 0.75, 0.01, 0.05)


def sfx_boing(p):
    # cartoon spring: a pitch-wobbling tone that settles, plus a soft thump
    t = tt(0.45)
    pitch = p.get("pitch", 1.0)
    f = 180 * pitch * (1 + 0.9 * np.exp(-t / 0.08)) * (1 + 0.12 * np.sin(2 * np.pi * 14 * t) * np.exp(-t / 0.2))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18)
    x += 0.4 * np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.04)
    return fade(x * (0.13 if p.get("soft") else 0.22), 0.001, 0.05)


def sfx_saw(p):
    # rasping saw strokes: one bright noise burst every 4 frames, alternating pitch (push / pull)
    d = fr(p.get("dur", 10)) + 0.08
    n = int(d * SR)
    out = np.zeros(n)
    stroke = int(SR * 4 / FPS)
    for k, i in enumerate(range(0, n - stroke // 2, stroke)):
        L = min(stroke, n - i)
        tt_ = np.arange(L) / SR
        lo, hi = (1800, 6000) if k % 2 else (1200, 4200)
        b = filt(noise(L), "bandpass", [lo, hi]) * np.sin(np.pi * np.clip(tt_ / (L / SR), 0, 1)) ** 0.7
        b *= 0.6 + 0.4 * (np.sin(2 * np.pi * 110 * tt_) > 0)  # teeth "chatter"
        out[i:i + L] += b
    return fade(out * 0.16, 0.003, 0.03)


def sfx_crack(p):
    # cardboard snap as a box splits
    t = tt(0.3)
    x = filt(noise(len(t)), "bandpass", [500, 3000]) * np.exp(-t / 0.03)
    x += 0.5 * filt(noise(len(t)), "highpass", 3500) * np.exp(-t / 0.008)
    x += 0.35 * np.sin(2 * np.pi * 120 * p.get("pitch", 1.0) * t) * np.exp(-t / 0.05)
    return fade(x * 0.5, 0.0005, 0.04)


def sfx_thud(p):
    t = tt(0.35)
    x = np.sin(2 * np.pi * 65 * t) * np.exp(-t / 0.07) + 0.3 * filt(noise(len(t)), "lowpass", 600) * np.exp(-t / 0.03)
    return fade(x * (0.35 if p.get("soft") else 0.55), 0.001, 0.05)


def sfx_drumroll(p):
    # soft snare roll that swells, ending on a tiny cymbal-less hit
    d = fr(p.get("dur", 40))
    n = int(d * SR)
    out = np.zeros(n)
    hits = np.arange(0, d - 0.05, 1 / 22)
    for h in hits:
        i = int(h * SR)
        L = int(0.06 * SR)
        tt_ = np.arange(L) / SR
        g = 0.3 + 0.7 * (h / d) ** 1.5
        out[i:i + L] += filt(noise(L), "bandpass", [900, 5000]) * np.exp(-tt_ / 0.018) * g * rng.uniform(0.8, 1.0)
    return fade(out * 0.12, 0.01, 0.05)


def sfx_take(p):
    # slide-whistle up: the cartoon "what?!"
    t = tt(0.42)
    f = 700 * 2 ** (1.3 * np.clip(t / 0.3, 0, 1))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - np.exp(-t / 0.02)) * np.exp(-np.clip(t - 0.3, 0, None) / 0.05)
    x += 0.05 * filt(noise(len(t)), "bandpass", [1000, 4000])
    return fade(x * 0.16, 0.002, 0.04)


def sfx_slidedown(p):
    t = tt(0.55)
    f = 1500 * 2 ** (-1.6 * np.clip(t / 0.5, 0, 1))
    vib = 1 + 0.02 * np.sin(2 * np.pi * 7 * t)
    x = np.sin(2 * np.pi * np.cumsum(f * vib) / SR) * (1 - np.exp(-t / 0.02))
    return fade(x * 0.13, 0.002, 0.06)


def sfx_whirl(p):
    # dizzy spin: a wobbling whoosh
    d = fr(p.get("dur", 24))
    t = tt(d)
    x = filt(noise(len(t)), "bandpass", [600, 2600]) * (0.5 + 0.5 * np.sin(2 * np.pi * 6 * t)) * np.sin(np.pi * t / d)
    return fade(x * 0.08, 0.01, 0.03)


def sfx_tok(p):
    return woodtok(380 * p.get("pitch", 1.0), 0.32)


def sfx_roll(p):
    # oranges rolling off the blanket: a low, bumpy rumble
    d = fr(p.get("dur", 20))
    t = tt(d)
    x = filt(noise(len(t)), "lowpass", 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t) ** 2) * np.sin(np.pi * t / d)
    return fade(x * 0.25, 0.01, 0.05)


def sfx_bonk(p):
    # hollow wicker "bonk" on the head + a little spring wobble
    t = tt(0.6)
    x = np.sin(2 * np.pi * 240 * t) * np.exp(-t / 0.06) + 0.6 * np.sin(2 * np.pi * 410 * t) * np.exp(-t / 0.035)
    x += 0.3 * filt(noise(len(t)), "bandpass", [300, 1500]) * np.exp(-t / 0.02)
    f = 300 * (1 + 0.25 * np.sin(2 * np.pi * 11 * t) * np.exp(-t / 0.25))
    x += 0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2) * (t > 0.05)
    return fade(x * 0.32, 0.001, 0.06)


def sfx_stretch(p):
    # rubbery arm stretch: a rising squeak with vibrato
    t = tt(0.32)
    pitch = p.get("pitch", 1.0)
    f = 380 * pitch * 2 ** (0.9 * t / 0.32) * (1 + 0.04 * np.sin(2 * np.pi * 18 * t))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.32) ** 1.5
    x += 0.3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR) * np.sin(np.pi * t / 0.32) ** 2
    return fade(filt(x, "lowpass", 2500) * 0.07, 0.005, 0.03)


def sfx_plop(p):
    t = tt(0.22)
    pitch = p.get("pitch", 1.0)
    f = 520 * pitch * (1 - 0.45 * np.clip(t / 0.08, 0, 1))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05) + 0.3 * filt(noise(len(t)), "lowpass", 900) * np.exp(-t / 0.02)
    return fade(x * 0.22, 0.001, 0.03)


def sfx_hmm(p):
    # a soft thinking hum (closed-mouth "mmm"), very quiet, under the question pause
    d = fr(p.get("dur", 26))
    t = tt(d)
    f = 196 * (1 + 0.03 * np.sin(2 * np.pi * 0.8 * t)) * (1 + 0.06 * t / d)
    x = sum((0.6 ** k) * np.sin(2 * np.pi * np.cumsum(f * k) / SR) for k in range(1, 5))
    x = filt(x, "lowpass", 900) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.8
    return fade(x * 0.035, 0.05, 0.1)


def sfx_squeak(p):
    # straining lift doors: a wobbling rubbery squeak
    d = fr(p.get("dur", 30))
    t = tt(d)
    f = 900 * (1 + 0.15 * np.sin(2 * np.pi * 5 * t)) * (1 + 0.05 * np.sin(2 * np.pi * 23 * t))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.4 + 0.6 * np.sin(2 * np.pi * 3 * t) ** 2) * np.sin(np.pi * t / d)
    return fade(filt(x, "lowpass", 3000) * 0.05, 0.02, 0.05)


def sfx_squish(p):
    t = tt(0.3)
    f = 260 * (1 - 0.4 * np.clip(t / 0.25, 0, 1))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) + 0.4 * filt(noise(len(t)), "lowpass", 1200) * np.exp(-t / 0.06)
    return fade(x * 0.22, 0.003, 0.04)


def sfx_clunk(p):
    t = tt(0.3)
    x = np.sin(2 * np.pi * 110 * t) * np.exp(-t / 0.05) + 0.5 * np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.02)
    x += 0.4 * filt(noise(len(t)), "bandpass", [400, 2500]) * np.exp(-t / 0.012)
    return fade(x * (0.22 if p.get("soft") else 0.36), 0.0005, 0.04)


def sfx_twang(p):
    # the caught antenna springs free
    t = tt(0.7)
    f = 330 * (1 + 0.5 * np.exp(-t / 0.05)) * (1 + 0.06 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / 0.3))
    x = sum((0.55 ** k) * np.sin(2 * np.pi * np.cumsum(f * k) / SR) for k in range(1, 5)) * np.exp(-t / 0.22)
    return fade(x * 0.2, 0.001, 0.06)


def sfx_ding(p):
    # lift chime, tuned to A-flat major: lift 1 = A-flat, lift 2 = C, lift 3 = E-flat (rising)
    m = [80, 84, 87][min(2, p.get("step", 0))]
    x = bell(m, 1.6, 0.8)
    hi = bell(m + 12, 0.7, 0.2)
    x[: len(hi)] += hi
    return x * 0.3


SFX = {"rise": sfx_rise, "pop": sfx_pop, "swing": sfx_swing, "score": sfx_score, "glint": sfx_glint, "tick": sfx_tick,
       "light": sfx_light, "slide": sfx_slide, "hinge": sfx_hinge, "flap": sfx_flap, "chime": sfx_chime, "click": sfx_click,
       "whoosh": sfx_whoosh, "sparkle": sfx_sparkle, "page": sfx_page, "boing": sfx_boing, "saw": sfx_saw,
       "crack": sfx_crack, "thud": sfx_thud, "drumroll": sfx_drumroll, "take": sfx_take, "slidedown": sfx_slidedown,
       "whirl": sfx_whirl, "tok": sfx_tok, "roll": sfx_roll, "bonk": sfx_bonk, "stretch": sfx_stretch, "plop": sfx_plop,
       "hmm": sfx_hmm, "squeak": sfx_squeak, "squish": sfx_squish, "clunk": sfx_clunk, "twang": sfx_twang,
       "ding": sfx_ding}


# ----------------------------------------------------------------------------- music (through-composed, no loop)
# 100 bpm, 4/4 (2.4 s per bar), key of A-flat major (new for this episode); one new figure per bar. During the
# question (the timeline's "pause" window) only the bass plays, so the foot taps carry the rhythm.
BEAT = 0.6
BARS = [  # (bass, melody)
    (44, [68, 72, 75, 72, 68, 72]),      # Ab  squeezed in lift 1 (busy, comic)
    (41, [65, 68, 72, 68]),              # Fm  lift 2? full!
    (37, [65, 68, 73, 77, 73]),          # Db  lift 3? full again! twang
    (39, [70, 67]),                      # Eb  why is there never room? (taps)
    (44, [68, 72, 75, 80]),              # Ab  ding, ding, ding: peek inside
    (37, [73, 77, 80, 77]),              # Db  four aliens in each lift; 4, 8, 12
    (41, [72, 75, 77, 80]),              # Fm  twelve seats... thirteen!
    (39, [75, 79, 82, 79]),              # Eb  3 x 4 = 12, one left over
    (44, [72, 75, 80, 84]),              # Ab
    (37, [73, 77, 80, 85, 80]),          # Db  the next lift is all yours
    (39, [70, 75, 79, 82]),              # Eb
    (44, [68, 72, 75, 80, 84]),          # Ab  CTA resolution
    (44, []),
]


def pluck(m, d=0.6, v=0.5):
    """soft plucked bar (marimba-ish): decaying harmonics with a woody 4th partial, low-passed"""
    f = mtof(m)
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.28) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.05)
    x += 0.2 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.12)
    x *= np.minimum(1, t / 0.002)
    return fade(filt(x, "lowpass", 3800) * v * 0.33, 0.001, 0.08)


def build_music():
    m = Bus()
    bar_len = 4 * BEAT
    p0, p1 = fr(TL["pause"][0]) - 0.1, fr(TL["pause"][1]) - 0.05
    quiet = lambda t: p0 <= t <= p1
    for bar, (bass, mel) in enumerate(BARS):
        t0 = bar * bar_len
        if t0 >= 30:
            break
        m.add(felt_piano(bass, 2.4, 0.5), t0 + 0.02, 1.0, -0.15)
        if not quiet(t0 + 2 * BEAT):
            m.add(felt_piano(bass + 7, 1.1, 0.25), t0 + 2 * BEAT + 0.02, 1.0, -0.1)
        if bar == 11:
            for k, n in enumerate(mel):
                m.add(felt_piano(n, 2.6, 0.3), t0 + k * 0.06, 1.0, 0.1 * (k - 2))
            continue
        if not mel:
            continue
        step = 4 * BEAT / len(mel)
        for k, n in enumerate(mel):
            t = t0 + k * step + rng.uniform(-0.008, 0.008)
            if quiet(t):
                continue
            m.add(pluck(n, 0.6, 0.55 + 0.1 * (k == 0)), t, 1.0, 0.25 if k % 2 else -0.05)
    # soft "boop" pulse on the beat (beat-synced feel), off during the taps and under the CTA
    for i in range(int(30 / BEAT)):
        t = i * BEAT
        if quiet(t) or t > 26.4:
            continue
        L = int(0.12 * SR)
        tt_ = np.arange(L) / SR
        m.add(np.sin(2 * np.pi * 90 * tt_) * np.exp(-tt_ / 0.05) * 0.12, t, 1.0, 0.0)
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
    clipmap = TL.get("vo_clip", {})
    for cid, f in TL["vo"].items():
        x = load_vo(clipmap.get(cid, cid))
        vo.add(x, fr(f))
        spans.append({"id": cid, "start": round(fr(f), 3), "end": round(fr(f) + len(x) / SR, 3)})
    # duck music (-11 dB) and SFX (-5 dB) under narration, smooth 60 ms / 350 ms (deeper than earlier episodes: clearer words)
    env = np.abs(vo.b).max(axis=1)
    win = int(0.03 * SR)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    active = (env > 0.01).astype(float)
    k_att, k_rel = int(0.06 * SR), int(0.35 * SR)
    act = np.convolve(active, np.ones(k_rel) / k_rel, mode="same")
    act = np.clip(np.convolve(act, np.ones(k_att) / k_att, mode="same") * 2.5, 0, 1)
    g_music = 1 - (1 - 10 ** (-11 / 20)) * act
    g_sfx = 1 - (1 - 10 ** (-5 / 20)) * act
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
