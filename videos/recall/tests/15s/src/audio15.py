"""Sound for the 15 s test, following the stickman-video skill's audio approach (skill step 6):
named, fully synthesized SFX on the same frames as the action, one music style per section
(intro / play / hope / finale), voice on cues with the music ducking under it. Own code; nothing
from the skill's gen_audio.py was run.  Output: build/mix15.wav + build/sfx_cues.json
"""
import json
import math
import os
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf
from scipy import signal
from scipy.ndimage import minimum_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import video15 as V  # noqa: E402
from cues import CUES, DURATION, FPS  # noqa: E402

SR = 48000
N = int(DURATION * SR)
rng = np.random.default_rng(15)
CUELOG = []
MUSIC_PLAN = [("intro", 0.0, V.ICON_LAND / FPS), ("play", V.ICON_LAND / FPS, V.C4 / FPS),
              ("hope", V.C4 / FPS, 12.0), ("finale", 12.0, DURATION)]


# ---------------------------------------------------------------- dsp helpers
def tv(d):
    return np.arange(int(round(d * SR))) / SR


def nz(d):
    return rng.standard_normal(int(round(d * SR)))


def filt(x, kind, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype=kind, fs=SR, output="sos"), x)


def env(n, a=0.004, d=0.15):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)


def chirp(f0, f1, d, expo=True):
    t = tv(d)
    f = f0 * (f1 / f0) ** (t / d) if expo else f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def put(buf, x, t0, vol=1.0, pan=0.0):
    i0 = int(round(t0 * SR))
    if i0 >= N or len(x) == 0:
        return
    if i0 < 0:
        x, i0 = x[-i0:], 0
    x = x[: N - i0]
    l, r = math.cos((pan + 1) * math.pi / 4) * 1.414, math.sin((pan + 1) * math.pi / 4) * 1.414
    buf[i0:i0 + len(x), 0] += x * vol * l
    buf[i0:i0 + len(x), 1] += x * vol * r


# ---------------------------------------------------------------- named sfx (skill vocabulary)
def whoosh(d=0.4, f0=300, f1=3500):
    n = nz(d)
    out = np.zeros_like(n)
    for k in range(16):
        a, b = k * len(n) // 16, (k + 1) * len(n) // 16
        c = f0 * (f1 / f0) ** (k / 15)
        out[a:b] = filt(n, "band", [c * 0.7, min(c * 1.4, 20000)])[a:b]
    return out * np.sin(np.pi * tv(d) / d) ** 2 * 1.8


def thud(d=0.3, f0=120, f1=45):
    return chirp(f0, f1, d) * env(int(round(d * SR)), 0.002, 0.08) + 0.4 * filt(nz(d), "low", 500) * env(int(round(d * SR)), 0.001, 0.03)


def impact(d=0.9):
    n = int(round(d * SR))
    return (1.2 * chirp(90, 32, d) * env(n, 0.002, 0.22) + 0.8 * filt(nz(d), "low", 1800) * env(n, 0.001, 0.09)
            + 0.3 * filt(nz(d), "high", 3000) * env(n, 0.001, 0.02))


def pop(f0=420, f1=1300, d=0.1):
    return chirp(f0, f1, d) * env(int(round(d * SR)), 0.002, 0.035)


def slam():
    d = 0.5
    n = int(round(d * SR))
    return 0.9 * filt(nz(d), "band", [180, 2500]) * env(n, 0.001, 0.06) + 0.9 * chirp(160, 50, d) * env(n, 0.002, 0.1)


def swish(d=0.16):
    return whoosh(d, 1500, 6000) * 0.8


def punch():
    d = 0.22
    n = int(round(d * SR))
    return 0.9 * filt(nz(d), "band", [300, 3000]) * env(n, 0.001, 0.025) + chirp(200, 70, d) * env(n, 0.002, 0.05)


def bell(f=1480, d=1.2):
    t = tv(d)
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k)
               for r, a, k in ((1, 1, 3), (2.76, 0.4, 5), (5.4, 0.2, 8), (8.9, 0.08, 12))) * 0.6


def stamp_sfx():
    d = 0.3
    n = int(round(d * SR))
    return 1.0 * filt(nz(d), "band", [400, 2200]) * env(n, 0.001, 0.03) + 0.6 * chirp(140, 60, d) * env(n, 0.002, 0.07)


def tick(f=2400):
    d = 0.03
    return np.sin(2 * np.pi * f * tv(d)) * np.exp(-tv(d) * 180)


def boing(d=0.5, f=200):
    t = tv(d)
    fr = f * (1 + 0.5 * np.sin(2 * np.pi * 11 * t) * np.exp(-t * 5))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 5)


def scribble(d=0.95):
    t = tv(d)
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (7 + 3 * np.sin(2 * np.pi * 1.3 * t)) * t))
    return filt(nz(d), "band", [2500, 7000]) * filt(am, "low", 60) * np.sin(np.pi * t / d) ** 0.4 * 0.8


def swirl(d=1.5):
    n = nz(d)
    out = np.zeros_like(n)
    t = tv(d)
    for k in range(20):
        a, b = k * len(n) // 20, (k + 1) * len(n) // 20
        c = 400 + 1600 * (k / 19) + 300 * math.sin(k)
        out[a:b] = filt(n, "band", [c * 0.75, c * 1.3])[a:b]
    return out * (0.6 + 0.4 * np.sin(2 * np.pi * 5 * t)) * np.minimum(1, t / 0.2) * np.clip((d - t) / 0.15, 0, 1)


def ding(m, d=0.8):
    t = tv(d)
    f = midi(m)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 14))


def click():
    d = 0.05
    n = int(round(d * SR))
    t = tick(3200)
    return filt(nz(d), "high", 2500) * env(n, 0.0005, 0.006) + 0.6 * np.pad(t, (0, max(0, n - len(t))))[:n]


def stinger():
    d = 1.6
    t = tv(d)
    x = sum(np.sin(2 * np.pi * midi(m) * t + i) for i, m in enumerate((55, 62, 67, 71, 74, 79)))
    return x / 6 * np.minimum(1, t / 0.01) * np.exp(-t * 1.8)


def rattle(d=0.35):
    t = tv(d)
    am = (np.sin(2 * np.pi * 24 * t) > 0.6).astype(float)
    return filt(nz(d), "band", [600, 3000]) * filt(am, "low", 200) * 0.6


def sfx(buf, name, x, frame, vol=0.7, pan=0.0):
    CUELOG.append([int(round(frame)), name, vol])
    put(buf, x, frame / FPS, vol, pan)


def sfx_track():
    b = np.zeros((N, 2))
    sfx(b, "scribble", scribble(0.95), 0, 0.5, -0.1)
    sfx(b, "whoosh", whoosh(0.3, 600, 4000), 29, 0.45, 0.5)
    sfx(b, "pop", pop(500, 1500), 32, 0.6)
    sfx(b, "swish", swish(), 35, 0.4)
    for k, a in enumerate(V.LAND):
        sfx(b, "thud", thud(0.25, 150 - 15 * k, 60), a, 0.75)
        sfx(b, "pop", pop(300 + 80 * k, 900 + 100 * k, 0.07), a, 0.3)
    sfx(b, "rattle", rattle(0.37), 56, 0.35)
    sfx(b, "impact", impact(), V.BLAST, 1.0)
    for k, pn in enumerate((-0.6, 0.0, 0.6)):
        sfx(b, "whoosh", whoosh(0.45, 400, 4500), V.BLAST + k, 0.45, pn)
    sfx(b, "slam", slam(), V.BLAST + 4, 0.8)
    sfx(b, "punch", punch(), 86, 0.35)
    sfx(b, "whoosh", whoosh(0.35, 300, 2000), 96, 0.4, 0.6)
    sfx(b, "pop", pop(900, 500, 0.06), V.ICON_DROP, 0.4, 0.4)
    sfx(b, "whistle", chirp(1700, 600, 0.4) * np.minimum(1, tv(0.4) / 0.05) * 0.35, V.ICON_DROP, 0.5, 0.3)
    sfx(b, "whoosh", whoosh(0.3, 400, 2500), 106, 0.4, -0.3)
    sfx(b, "impact", impact(), V.ICON_LAND, 1.0, 0.25)
    sfx(b, "boing", boing(0.5, 150), V.ICON_LAND + 1, 0.35, 0.3)
    for i in range(6):
        sfx(b, "tick", tick(1800 + 120 * i) + 0, V.TITLE_AT + 12 + 3 * i, 0.5, -0.5 + 0.2 * i)
        sfx(b, "thud", thud(0.12, 200, 90), V.TITLE_AT + 12 + 3 * i, 0.25)
    sfx(b, "whoosh", whoosh(0.4, 500, 5000), 156, 0.4)
    sfx(b, "swirl", swirl(1.5), V.SUCK[0] - 22, 0.5, 0.3)
    for a in V.SUCK:
        sfx(b, "pop", pop(700, 220, 0.12), a, 0.6, 0.3)
    for k, (fi, ci) in enumerate(zip(V.FIRE, V.CATCH)):
        sfx(b, "pop", pop(250, 900, 0.1), fi, 0.6, 0.35)
        sfx(b, "whoosh", whoosh(0.35, 800, 4000), fi + 1, 0.4, 0.1)
        sfx(b, "punch", punch(), ci, 0.9 if k == 2 else 0.7, -0.2)
        sfx(b, "swish", swish(0.12), ci + 2, 0.35)
        sfx(b, "ding", ding(79 + [0, 4, 7][k]), ci + 5, 0.4)
        sfx(b, "thud", thud(0.2, 160, 70), ci + 18, 0.5, -0.6)
    sfx(b, "whoosh", whoosh(0.5, 300, 3000), V.FIRE[1] + 6, 0.45)
    sfx(b, "thud", thud(0.25, 140, 60), V.CLOCK1 + 12, 0.55)
    for fr in range(V.CLOCK1 + 14, V.ESCAPE, 2):
        sfx(b, "tick", tick(2600 if fr % 4 else 2000), fr, 0.28)
    sfx(b, "boing", boing(0.45, 260), V.ESCAPE, 0.5, -0.5)
    sfx(b, "bell", bell(), V.BELL, 0.5, 0.4)
    sfx(b, "bell", bell(), V.BELL + 6, 0.4, 0.4)
    sfx(b, "slam", slam(), V.REVIEW_SLAM, 0.75)
    sfx(b, "whoosh", whoosh(0.3, 400, 3000), V.ESCAPE + 8, 0.4, -0.3)
    sfx(b, "punch", punch(), V.RCATCH, 0.75, -0.4)
    sfx(b, "ding", ding(86), V.RCATCH + 5, 0.4)
    sfx(b, "thud", thud(0.2, 160, 70), V.RPILE, 0.5, -0.6)
    sfx(b, "stamp", stamp_sfx(), V.RSTAMP, 0.85, -0.6)
    sfx(b, "thud", thud(0.25, 140, 60), V.CLOCK2 + 12, 0.45)
    for fr in range(V.CLOCK2 + 14, 356, 6):
        sfx(b, "tick", tick(2200), fr, 0.22)
    sfx(b, "pop", pop(600, 1200, 0.07), V.PIN, 0.45, -0.6)
    sfx(b, "whoosh", whoosh(0.4, 300, 2500), V.CUR_IN, 0.45, 0.6)
    sfx(b, "punch", punch(), V.GRAB, 0.6)
    for i in range(6):
        sfx(b, "tick", tick(2000 + 150 * i), V.TITLE2 + 12 + 2 * i, 0.4, -0.5 + 0.2 * i)
    sfx(b, "pop", pop(400, 1200, 0.08), V.CTA, 0.45)
    sfx(b, "whoosh", whoosh(0.3, 500, 4000), V.THROW, 0.5, 0.1)
    sfx(b, "click", click(), V.CLICK, 0.9)
    sfx(b, "impact", impact(0.6) * 0.6, V.CLICK, 0.6)
    sfx(b, "stinger", stinger(), V.CLICK, 0.55)
    sfx(b, "whoosh", whoosh(0.4, 800, 5000), V.CLICK + 6, 0.35, 0.5)
    return b


# ---------------------------------------------------------------- music (styles per section)
def pluck(f, d=0.3, bright=4):
    t = tv(d)
    x = sum((0.55 ** k) * np.sin(2 * np.pi * f * (k + 1) * t) for k in range(bright))
    return x * np.exp(-t * 9) * np.minimum(1, t / 0.003)


def kick():
    d = 0.3
    t = tv(d)
    return np.sin(2 * np.pi * np.cumsum(48 + 120 * np.exp(-t * 32)) / SR) * np.exp(-t * 10)


def clap():
    d = 0.18
    return filt(nz(d), "band", [900, 2600]) * env(int(round(d * SR)), 0.001, 0.04) * 0.6


def hat():
    d = 0.04
    return filt(nz(d), "high", 7000) * env(int(round(d * SR)), 0.001, 0.012)


def bass(f, d=0.22):
    t = tv(d)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 7) * np.minimum(1, t / 0.005)


def pad(ms, d, a=0.3, r=0.5):
    t = tv(d)
    x = sum(np.sin(2 * np.pi * midi(m) * k * t + k) / k for m in ms for k in range(1, 5))
    x = filt(x, "low", 2000)
    return x * np.minimum(1, t / a) * np.clip((d - t) / r, 0, 1) / (len(ms) * 2)


G_CH = {"G": [43, 59, 62, 67], "Em": [40, 59, 64, 67], "C": [36, 60, 64, 67], "D": [38, 57, 62, 66]}


def music():
    m = np.zeros((N, 2))
    i0, i1 = MUSIC_PLAN[0][1], MUSIC_PLAN[0][2]
    # intro: curious tiptoe plucks over a soft pad (no drums)
    notes = [67, 71, 74, 71, 69, 72, 76, 72]
    t, k = 0.0, 0
    while t < i1 - 0.1:
        if not (V.BLAST / FPS - 0.05 < t < V.BLAST / FPS + 0.5):
            put(m, pluck(midi(notes[k % 8] - (12 if t > V.BLAST / FPS else 0))), t, 0.18, -0.25 if k % 2 else 0.25)
        t += 0.25
        k += 1
    put(m, pad([55, 59, 62], V.BLAST / FPS, 0.3, 0.2), 0.0, 0.5)
    put(m, pad([52, 55, 59], i1 - V.BLAST / FPS, 0.1, 0.3), V.BLAST / FPS + 0.2, 0.45)
    # play: bouncy 120 bpm from the icon landing
    p0, p1 = MUSIC_PLAN[1][1], MUSIC_PLAN[1][2]
    prog = ["G", "C", "D", "G", "Em", "C"]
    beat = 0.5
    nb = int((p1 - p0) / beat)
    for q in range(nb):
        tb = p0 + q * beat
        ch = G_CH[prog[(q // 4) % len(prog)]]
        put(m, kick(), tb, 0.5)
        if q % 2 == 1:
            put(m, clap(), tb, 0.35)
        put(m, hat(), tb + 0.25, 0.18)
        put(m, bass(midi(ch[0])), tb, 0.45)
        put(m, bass(midi(ch[0] + 12), 0.12), tb + 0.25, 0.2)
        for n_ in ch[1:]:
            put(m, pluck(midi(n_), 0.16, 3), tb + 0.25, 0.07, 0.3)
    # hope: warm pad + slow arpeggio, light hats
    h0, h1 = MUSIC_PLAN[2][1], MUSIC_PLAN[2][2]
    put(m, pad([55, 59, 62, 66], h1 - h0 + 0.3, 0.4, 0.4), h0, 0.6)
    for q in range(int((h1 - h0) / 0.25)):
        put(m, pluck(midi([67, 71, 74, 78][q % 4]), 0.4, 3), h0 + q * 0.25, 0.08, 0.3 * math.sin(q))
        if q % 2:
            put(m, hat(), h0 + q * 0.25, 0.1)
    # finale: bright swell, no drums, resolves on the click
    f0 = MUSIC_PLAN[3][1]
    put(m, pad([60, 64, 67], V.CLICK / FPS - f0 + 0.1, 0.5, 0.2), f0, 0.55)
    put(m, pad([55, 62, 67, 71, 74], DURATION - V.CLICK / FPS, 0.02, 1.0), V.CLICK / FPS, 0.6)
    for q in range(10):
        put(m, pluck(midi([79, 83, 86, 91][q % 4]), 0.5, 3), V.CLICK / FPS + 0.2 + q * 0.16, 0.06, 0.3 * math.sin(q))
    return m


# ---------------------------------------------------------------- voice + mix
def voice():
    v = np.zeros((N, 2))
    pres = np.zeros(N)
    meta = json.load(open(os.path.join(HERE, "..", "audio", "voice", "lines.json")))
    for line in meta["lines"]:
        x, sr = sf.read(os.path.join(HERE, "..", line["file"]), dtype="float32")
        x = signal.resample_poly(x, SR, sr)
        x = filt(x, "high", 90)
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.8
        put(v, x, line["start"], 1.0)
        a = int(line["start"] * SR)
        pres[a:a + len(x)] = 1
    k = int(0.2 * SR)
    w = np.hanning(k); w /= w.sum()
    return v, np.clip(np.convolve(pres, w, "same") * 1.4, 0, 1)


def lufs(x):
    with tempfile.NamedTemporaryFile(suffix=".wav") as tf:
        sf.write(tf.name, x.astype(np.float32), SR)
        r = subprocess.run(["ffmpeg", "-hide_banner", "-i", tf.name, "-af", "ebur128", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    for line in r[r.rfind("Summary:"):].splitlines():
        if line.strip().startswith("I:"):
            return float(line.split()[1])


def limiter(x, ceil, look=0.005, rel=0.08):
    pk = np.max(np.abs(x), axis=1) + 1e-12
    g = minimum_filter1d(np.minimum(1, ceil / pk), size=2 * int(look * SR) + 1, mode="nearest")
    a = math.exp(-1 / (rel * SR))
    g = np.minimum(g, signal.lfilter([1 - a], [1, -a], g))
    n = int(look * SR)
    g = np.concatenate([g[n:], np.full(n, g[-1])])
    return x * g[:, None]


def main():
    os.makedirs(os.path.join(HERE, "..", "build"), exist_ok=True)
    mus, fx = music(), sfx_track()
    vo, duck = voice()
    mix = 0.35 * mus * (1 - 0.5 * duck)[:, None] + 0.8 * fx * (1 - 0.25 * duck)[:, None] + 1.0 * vo
    fo = int(0.3 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
    ceil = 10 ** (-2.0 / 20)
    mix = mix / np.max(np.abs(mix)) * ceil
    for _ in range(4):
        cur = lufs(limiter(mix, ceil))
        if abs(cur + 16) < 0.3:
            break
        mix *= 10 ** ((-16 - cur) / 20)
    mix = np.clip(limiter(mix, ceil), -ceil, ceil)
    out = os.path.join(HERE, "..", "build", "mix15.wav")
    sf.write(out, mix.astype(np.float32), SR, subtype="PCM_24")
    json.dump({"music_plan": MUSIC_PLAN, "sfx": sorted(CUELOG)}, open(os.path.join(HERE, "..", "build", "sfx_cues.json"), "w"), indent=0)
    print("wrote", out, "sfx cues", len(CUELOG), "LUFS", lufs(mix))


if __name__ == "__main__":
    main()
