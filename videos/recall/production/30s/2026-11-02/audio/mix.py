"""Score + event-locked SFX + narration mix for Recall 30 s production 01 (knowledge challenge).

Everything except the narration is synthesised here (numpy/scipy). SFX helpers adapted from education/pilot-01/audio/mix.py.
Microgame-style rules applied: tempo grid + cue table first (120 BPM, hits on cues), brass stab on each command word,
groove drops to heartbeat + fuse ticks during the 2 s guess, loudest hit right after that silence (answer),
music ducked ~11 dB and foley ~6 dB under the voice; target -14.5 LUFS, true peak <= -1.5 dBTP (4x oversampled limiter).
Outputs: ../build/mix.wav (48 kHz stereo, exactly 30.000 s), ../build/audio_report.json, ../build/cue_table.json
"""
import json
import os

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d
from scipy.signal import butter, lfilter, resample_poly, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BUILD = os.path.join(ROOT, "build")
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
SR, DUR = 48000, float(TL["duration"])
N = int(SR * DUR)
C = TL["cues"]
BEAT = 60 / TL["bpm"]
RNG = np.random.default_rng(20261102)
EVENTS = []
MUS_G, FX_G = 0.42, 0.62
TARGET_LUFS, CEIL_DBTP = -14.5, -1.6


def ta(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, o=2):
    return sosfilt(butter(o, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, btype="high", fs=SR, output="sos"), x)


def place(buf, sig, t0, gain=1.0, pan=0.0, name=None):
    i0 = int(round(t0 * SR))
    if i0 >= N:
        return
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    sig = sig[: N - i0]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i0:i0 + len(sig), 0] += sig * gain * l
    buf[i0:i0 + len(sig), 1] += sig * gain * r
    if name:
        EVENTS.append({"t": round(t0, 3), "beat": round(t0 / BEAT, 2), "sfx": name})


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- SFX (foley)
def whoosh(d, f0, f1):
    n = int(d * SR); x = RNG.standard_normal(n); out = np.zeros(n)
    for i in range(0, n, 512):
        f = f0 + (f1 - f0) * (i / n)
        out[i:i + 512] = bp(x[max(0, i - 2048):i + 512], f * 0.7, f * 1.4)[-len(x[i:i + 512]):]
    return out * np.sin(np.pi * np.arange(n) / n) ** 1.5


def droplet(f):
    t = ta(0.07)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.4 * t / 0.07)) / SR) * np.exp(-t / 0.018)


def bubbles(d, n, f0=500, f1=1500):
    out = np.zeros(int(d * SR))
    for _ in range(n):
        i = int(RNG.random() * (d - 0.08) * SR); dd = droplet(f0 + RNG.random() * (f1 - f0)) * (0.4 + 0.6 * RNG.random())
        out[i:i + len(dd)] += dd[: len(out) - i]
    return out


def plop():
    t = ta(0.35)
    body = np.sin(2 * np.pi * 160 * t) * np.exp(-t / 0.06)
    pitch = np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.08], [380, 900])) / SR) * np.exp(-t / 0.05)
    return 0.8 * body + 0.5 * pitch + 0.45 * bp(RNG.standard_normal(len(t)), 900, 6500) * np.exp(-t / 0.09)


def splash(d=0.7, size=1.0):
    t = ta(d)
    s = bp(RNG.standard_normal(len(t)), 500, 7000) * np.exp(-t / (0.14 * size)) * (1 - np.exp(-t / 0.004))
    out = 0.7 * s + 0.5 * np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.08)
    for _ in range(int(7 * size)):
        i = int((0.06 + RNG.random() * 0.45) * SR); dd = droplet(800 + RNG.random() * 1400) * 0.35
        out[i:i + len(dd)] += dd[: len(out) - i]
    return out


def clunk(f0=118):
    t = ta(0.5)
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dc) for f, a, dc in [(f0, 1, .09), (f0 * 2.6, .5, .05), (f0 * 6.3, .35, .03), (f0 * 13, .2, .02)])
    return s + 0.3 * bp(RNG.standard_normal(len(t)), 200, 2000) * np.exp(-t / 0.012)


def tick(f=2200, d=0.06):
    t = ta(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012) + 0.3 * RNG.standard_normal(len(t)) * np.exp(-t / 0.003)


def stamp_good():
    t = ta(0.9)
    thud = np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.04) + 0.4 * bp(RNG.standard_normal(len(t)), 300, 3000) * np.exp(-t / 0.015)
    bell = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dc) for f, a, dc in [(1318.5, .5, .35), (1975.5, .35, .3), (2637, .2, .2)])
    return 0.8 * thud + bell * (t > 0.02)


def stamp_bad():
    t = ta(0.6)
    thud = np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.25], [220, 90])) / SR) * np.exp(-t / 0.12)
    return 0.9 * thud + 0.4 * bp(RNG.standard_normal(len(t)), 200, 2500) * np.exp(-t / 0.02)


def card_flip():
    t = ta(0.12)
    return bp(RNG.standard_normal(len(t)), 1500, 8000) * np.exp(-t / 0.025) * 0.8


def slam():
    t = ta(0.35)
    return 0.7 * np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.2], [90, 45])) / SR) * np.exp(-t / 0.1) + \
        0.35 * bp(RNG.standard_normal(len(t)), 400, 5000) * np.exp(-t / 0.03)


def shimmer(d=0.8):
    t = ta(d); out = np.zeros(len(t))
    for k, f in enumerate([880, 1108.7, 1318.5, 1760]):
        i = int(k * d / 6 * SR); tt = t[: len(t) - i]
        out[i:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.25)
    return out * 0.22


def ding(f=1174.7):
    t = ta(1.3)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.6) + 0.7 * np.sin(2 * np.pi * f * 1.26 * t) * np.exp(-t / 0.5)) * (1 - np.exp(-t / 0.004)) * 0.4


def pop():
    t = ta(0.12)
    return np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.12], [900, 300])) / SR) * np.exp(-t / 0.03)


def thunk():
    t = ta(0.25)
    return np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.04) + 0.4 * bp(RNG.standard_normal(len(t)), 800, 3000) * np.exp(-t / 0.01)


def gurgle(d):
    t = ta(d)
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 7 * t + np.sin(2 * np.pi * 1.3 * t) * 3)
    return lp(RNG.standard_normal(len(t)), 1200, 2) * am * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.3) * 1.6 + 0.3 * bubbles(d, int(d * 18), 300, 900)


def rush(d):
    t = ta(d)
    return bp(RNG.standard_normal(len(t)), 300, 4000) * np.sin(np.pi * t / d) ** 0.8


def rewind(d):
    t = ta(d)
    f = 400 + 2600 * (t / d) ** 1.3 + 180 * np.sin(2 * np.pi * 31 * t)
    return (0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * bp(RNG.standard_normal(len(t)), 1500, 7000)) * np.sin(np.pi * t / d) ** 0.7


def boing():
    t = ta(0.45)
    f = 330 + 180 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / 0.15) + 120 * t
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * 0.6


def fuse_hiss(d):
    t = ta(d)
    return bp(RNG.standard_normal(len(t)), 3000, 9000) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t) ** 2) * np.minimum(1, t / 0.05) * 0.5


def build_sfx():
    fx = np.zeros((N, 2))
    for c in TL["commands"]:
        place(fx, slam(), c["t"], 0.55, 0, f"command slam {c['word']}")
        place(fx, whoosh(0.18, 1600, 600) * 0.4, c["tag"], 0.45, 0.4, "tag whoosh")
    place(fx, whoosh(0.28, 1400, 500), C["drop"], 0.5, -0.35, "ball drop whoosh")
    place(fx, plop(), C["splash"], 0.55, -0.35, "plop")
    place(fx, splash(0.7, 1.0), C["splash"] + 0.01, 0.42, -0.35, "splash")
    place(fx, bubbles(1.0, 12), C["splash"] + 0.1, 0.25, -0.35, "bubbles")
    place(fx, clunk(), C["ballFloor"], 0.5, -0.35, "ball clunk on tank floor")
    place(fx, stamp_bad(), C["stampBall"], 0.55, -0.35, "x stamp SINKS")
    place(fx, whoosh(0.6, 700, 300) * 0.4, C["shipLower"], 0.35, 0.35, "ship lower whoosh")
    place(fx, splash(0.5, 0.5), C["shipTouch"], 0.35, 0.35, "ship touches water")
    place(fx, stamp_good(), C["stampShip"], 0.55, 0.35, "check stamp FLOATS")
    place(fx, whoosh(0.25, 600, 1600) * 0.5, C["stampsOut"], 0.4, 0, "stamps fly out")
    place(fx, card_flip(), C["sameTags"], 0.5, -0.3, "tag flip")
    place(fx, card_flip(), C["sameTags"] + 0.08, 0.5, 0.3, "tag flip")
    place(fx, card_flip(), C["guess"] + 0.6, 0.6, -0.4, "chip A flip")
    place(fx, card_flip(), C["guess"] + 0.7, 0.6, 0.4, "chip B flip")
    place(fx, fuse_hiss(2.0), C["fuseStart"], 0.18, 0, "fuse hiss")
    for k in range(4):
        place(fx, tick(1800 if k < 3 else 2400, 0.07), C["fuseStart"] + k * BEAT, 0.5, -0.6 + 0.4 * k, f"fuse knot {k + 1}")
    place(fx, stamp_good(), C["answer"] + 0.05, 0.5, 0.3, "answer check")
    place(fx, shimmer(0.9), C["ghost"], 0.55, 0.3, "displaced-water shimmer")
    for k, f in enumerate([2000, 2400]):
        place(fx, tick(f, 0.05), C["markers"] + k * 0.12, 0.4, -0.5 + k, "marker tick")
    place(fx, whoosh(0.35, 500, 1500) * 0.5, C["push"], 0.45, 0.2, "push arrows up")
    place(fx, thunk(), C["shipWeight"], 0.45, 0.3, "weight arrow")
    place(fx, ding(), C["balanced"], 0.5, 0.2, "balance ding")
    place(fx, pop(), C["floatsTick"], 0.35, 0.3, "floats pop")
    place(fx, pop(), C["plugPull"], 0.6, 0.3, "plug pop")
    place(fx, gurgle(C["founder"] - C["plugPull"] - 0.05), C["plugPull"] + 0.05, 0.2, 0.3, "water rushes in through the plug hole")
    place(fx, rush(0.9), C["founder"] - 0.05, 0.3, 0.3, "flood over the rim")
    place(fx, bubbles(1.0, 22, 250, 800), C["founder"] + 0.05, 0.35, 0.3, "sinking bubbles")
    place(fx, clunk(96), C["sunk"], 0.55, 0.3, "ship clunk on floor")
    place(fx, stamp_bad(), C["stampSunk"], 0.55, 0.3, "x stamp SINKS")
    place(fx, thunk(), C["weights"], 0.45, -0.35, "weight arrow ball")
    place(fx, thunk(), C["weights"] + 0.08, 0.45, 0.35, "weight arrow ship")
    place(fx, ding(1046.5), C["notLighter"], 0.4, 0, "same-weight ding")
    place(fx, shimmer(0.7), C["shape"] + 0.1, 0.35, 0, "shape chime")
    place(fx, rewind(C["replayEnd"] - C["replay"]), C["replay"], 0.45, 0.2, "replay rewind")
    place(fx, stamp_bad(), C["stampFinal"], 0.45, -0.35, "final x stamp")
    place(fx, stamp_good(), C["stampFinal"] + 0.25, 0.5, 0.35, "final check stamp")
    place(fx, boing(), C["thumbs"] - 0.05, 0.4, 0.2, "hop")
    return fx


# ---------------------------------------------------------------- music (original groove, 120 BPM, D major)
def kick():
    t = ta(0.35)
    return np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.12], [130, 45])) / SR) * np.exp(-t / 0.12)


def snare():
    t = ta(0.25)
    return 0.6 * bp(RNG.standard_normal(len(t)), 1500, 7000) * np.exp(-t / 0.06) + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)


def hat(v):
    t = ta(0.06)
    return hp(RNG.standard_normal(len(t)), 7000, 2) * np.exp(-t / 0.012) * v


def bass(m, d):
    t = ta(d); f = hz(m)
    s = sum((1 / k) * np.sin(2 * np.pi * k * f * t) for k in range(1, 6))
    return lp(s, 500, 2) * np.minimum(1, t / 0.01) * np.exp(-t / 0.35)


def keys(ms, d):
    t = ta(d)
    s = sum(np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * 2 * hz(m) * t) * np.exp(-t / 0.1) for m in ms)
    return s * np.exp(-t / 0.22) * np.minimum(1, t / 0.004) / len(ms)


def kalimba(m):
    t = ta(0.9); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / 0.03)) * np.exp(-t / 0.35) * np.minimum(1, t / 0.002)


def brass(ms, d=0.45, bright=1.0):
    t = ta(d)
    s = sum(sum((1 / k) * np.sin(2 * np.pi * k * hz(m) * (1 + 0.002 * np.sin(2 * np.pi * 5 * t)) * t) for k in range(1, 8)) for m in ms) / len(ms)
    env = np.minimum(1, t / 0.015) * np.exp(-np.maximum(0, t - 0.08) / (0.12 * bright))
    return lp(s, 1800 + 1800 * bright, 2) * env


def crash():
    t = ta(1.6)
    return hp(RNG.standard_normal(len(t)), 4000, 2) * np.exp(-t / 0.5) * 0.6


def heartbeat():
    t = ta(0.4)
    lub = np.sin(2 * np.pi * 55 * t) * np.exp(-t / 0.06)
    dub = np.zeros_like(t); i = int(0.16 * SR); dub[i:] = 0.7 * np.sin(2 * np.pi * 62 * t[: len(t) - i]) * np.exp(-t[: len(t) - i] / 0.05)
    return lub + dub


def build_music():
    mus = np.zeros((N, 2))
    chords = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]]
    roots = [38, 35, 31, 33]
    mel = [74, 76, 78, 81, 78, 76, 74, 71]
    pause0, pause1, end = C["fuseStart"], C["answer"], C["end"]
    nb = int(DUR / BEAT)
    for b in range(nb):
        t0 = b * BEAT
        if t0 >= end:
            break
        bar, beat_in = b // 4, b % 4
        ch, rt = chords[bar % 4], roots[bar % 4]
        if pause0 <= t0 < pause1:
            place(mus, heartbeat(), t0, 0.55)
            continue
        place(mus, kick(), t0, 0.55 if beat_in in (0, 2) else 0.0)
        if beat_in in (1, 3):
            place(mus, snare(), t0, 0.25)
        for h in range(2):
            place(mus, hat(1.0 if h == 0 else 0.45), t0 + h * BEAT / 2, 0.12, 0.35)
        place(mus, hat(0.25), t0 + BEAT * 0.75, 0.12, 0.35)              # ghost note
        place(mus, bass(rt, BEAT * 0.9), t0, 0.5) if beat_in in (0, 2) else place(mus, bass(rt + 12 if beat_in == 3 else rt, BEAT * 0.45), t0 + BEAT / 2, 0.38)
        if beat_in in (1, 3):
            place(mus, keys([m + 12 for m in ch], 0.4), t0 + BEAT / 2, 0.16, -0.25)
        if b % 2 == 0:
            place(mus, kalimba(mel[(b // 2) % len(mel)]), t0 + (BEAT / 2 if bar % 2 else 0), 0.14, 0.3)
    # brass stabs a hair before each spoken command (voice lands after the stab)
    for c in TL["commands"]:
        big = c["t"] == C["answer"]
        place(mus, brass([62, 66, 69, 74], 0.6 if big else 0.4, 1.4 if big else 1.0), c["t"], 0.9 if big else 0.55, 0, None)
        EVENTS.append({"t": c["t"], "beat": round(c["t"] / BEAT, 2), "sfx": f"brass stab {c['word']}" + (" (loudest, after the silent guess)" if big else "")})
    place(mus, crash(), C["answer"], 0.5, 0.0, "crash on the answer")
    # rising brass run into the answer is replaced by the silence (skill: loudest hit after the longest silence)
    # ending: button chord on the downbeat at 29.0, ring out to 30.0
    place(mus, brass([50, 62, 66, 69, 74], 1.0, 0.8), end, 0.6, 0, "button chord")
    place(mus, kalimba(86), end + 0.02, 0.2, 0.3)
    place(mus, kalimba(81), end + 0.27, 0.16, -0.3)
    return mus


# ---------------------------------------------------------------- narration / loudness / limiter
def load_voice():
    meta = {m["id"]: m for m in json.load(open(os.path.join(HERE, "narration", "lines.json")))["lines"]}
    v = np.zeros(N); spans = []
    for it in TL["narration"]:
        m = meta[it["id"]]
        a, sr = sf.read(os.path.join(HERE, "narration", m["file"]), dtype="float64")
        if sr != SR:
            g = np.gcd(sr, SR); a = resample_poly(a, SR // g, sr // g)
        i0 = int(round(it["start"] * SR))
        assert i0 + len(a) <= N
        v[i0:i0 + len(a)] += a
        spans.append((it["id"], it["start"], it["start"] + len(a) / SR, m["text"]))
    spans.sort(key=lambda s: s[1])
    for (a1, _, e1, _), (a2, s2, _, _) in zip(spans, spans[1:]):
        assert e1 + 0.15 <= s2, f"{a1} ends {e1:.2f} too close to {a2} at {s2:.2f}"
    v = hp(v, 90, 2)
    return v + 0.25 * bp(v, 2500, 5000), spans


def lufs(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    z = np.array([np.sum(np.mean(y[i:i + blk] ** 2, axis=0)) for i in range(0, len(y) - blk, hop)])
    z = z[-0.691 + 10 * np.log10(z + 1e-12) > -70]
    rel = -0.691 + 10 * np.log10(np.mean(z)) - 10
    z = z[-0.691 + 10 * np.log10(z + 1e-12) > rel]
    return -0.691 + 10 * np.log10(np.mean(z))


def true_peak_env(x):
    up = resample_poly(x, 4, 1, axis=0)
    pk = np.max(np.abs(up), axis=1).reshape(-1, 4).max(axis=1)
    return pk[: len(x)]


def limit(x, ceil, release=0.08, look=0.004):
    pk = maximum_filter1d(true_peak_env(x), size=int(look * SR) * 2 + 1)
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    a = np.exp(-1 / (release * SR)); out = np.empty_like(g); cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    return x * out[:, None]


def main():
    os.makedirs(BUILD, exist_ok=True)
    voice, spans = load_voice()
    fx, mus = build_sfx(), build_music()
    tt = np.arange(N) / SR
    k = int(0.12 * SR)
    venv = np.convolve(np.abs(voice), np.ones(k) / k, mode="same")
    vact = np.clip(venv / 0.02, 0, 1)
    mus = mus * (10 ** (-11 / 20) * vact + (1 - vact))[:, None]       # duck music ~11 dB under voice
    fx = fx * (10 ** (-6 / 20) * vact + (1 - vact))[:, None]          # duck foley ~6 dB under voice
    tail = np.clip((DUR - tt) / 0.35, 0, 1)                           # avoid a click at 30.000 s (audio only)
    mix = (np.stack([voice, voice], 1) + MUS_G * mus + FX_G * fx) * tail[:, None]
    for _ in range(2):                                                # normalise, limit, re-normalise
        mix *= 10 ** ((TARGET_LUFS - lufs(mix)) / 20)
        mix = limit(mix, 10 ** (CEIL_DBTP / 20))
    gain_voice = 1.0
    sf.write(os.path.join(BUILD, "mix.wav"), mix.astype(np.float32), SR, subtype="PCM_24")
    # report
    bed = (MUS_G * mus + FX_G * fx) * tail[:, None]
    scale = np.sqrt(np.mean(mix ** 2)) / max(1e-9, np.sqrt(np.mean(((np.stack([voice, voice], 1) + bed)) ** 2)))
    lines = []
    for sid, s0, s1, text in spans:
        a, b = int(s0 * SR), int(s1 * SR)
        vr = np.sqrt(np.mean(voice[a:b] ** 2)); br = np.sqrt(np.mean(bed[a:b] ** 2))
        w = len(text.split())
        lines.append({"id": sid, "start": round(s0, 3), "end": round(s1, 3), "text": text, "words": w,
                      "words_per_s": round(w / (s1 - s0), 2), "voice_over_bed_db": round(20 * np.log10(vr / (br + 1e-9)), 1)})
    rep = {"duration_s": len(mix) / SR, "integrated_lufs": round(lufs(mix), 2),
           "true_peak_dbtp_est": round(20 * np.log10(np.max(true_peak_env(mix))), 2),
           "sample_peak_dbfs": round(20 * np.log10(np.max(np.abs(mix))), 2), "lines": lines,
           "narration_words": sum(l["words"] for l in lines), "speech_s": round(sum(l["end"] - l["start"] for l in lines), 2),
           "overall_words_per_s": round(sum(l["words"] for l in lines) / DUR, 2), "bpm": TL["bpm"], "sfx_events": sorted(EVENTS, key=lambda e: e["t"]),
           "music": "original 120 BPM D-major groove (kick/snare/hats with ghost notes, synth bass, keys, kalimba, brass stabs), "
                    "heartbeat + fuse ticks only during the 2 s guess, crash + biggest stab on the answer, button chord at 29.0 s; all synthesised in mix.py",
           "ducking": "music -11 dB, foley -6 dB under voice", "unused_scale": round(float(scale), 3), "voice_gain": gain_voice}
    json.dump(rep, open(os.path.join(BUILD, "audio_report.json"), "w"), indent=2)
    json.dump({"bpm": TL["bpm"], "beat_s": BEAT, "cues": C, "commands": TL["commands"], "narration": TL["narration"]},
              open(os.path.join(BUILD, "cue_table.json"), "w"), indent=2)
    print(json.dumps({k: v for k, v in rep.items() if k not in ("sfx_events",)}, indent=1))


if __name__ == "__main__":
    main()
