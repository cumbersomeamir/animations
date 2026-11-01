"""Original soundtrack + SFX + narration mix, all synthesised locally with numpy/scipy.

Every SFX is placed from timeline.T (the same beats the animation uses).
Output: build/mix.wav (48 kHz stereo, float -> PCM16) and build/audio_events.json
"""
import json
import math
import os
import sys

import numpy as np
import soundfile as sf
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from timeline import DURATION, NARRATION, T  # noqa: E402

SR = 48000
N = int(DURATION * SR)
rng = np.random.default_rng(7)
EVENTS = []


def tvec(d):
    return np.arange(int(d * SR)) / SR


def place(buf, x, t0, gain=1.0, pan=0.0):
    i0 = int(round(t0 * SR))
    if i0 >= N:
        return
    if i0 < 0:
        x = x[-i0:]
        i0 = 0
    x = x[: N - i0]
    l = math.cos((pan + 1) * math.pi / 4) * math.sqrt(2)
    r = math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
    buf[i0:i0 + len(x), 0] += x * gain * l
    buf[i0:i0 + len(x), 1] += x * gain * r


def sfx(buf, name, x, t0, gain=1.0, pan=0.0):
    EVENTS.append({"t": round(t0, 3), "sfx": name})
    place(buf, x, t0, gain, pan)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def noise(d):
    return rng.standard_normal(int(round(d * SR)))


def env_ad(n, a=0.005, d=0.2):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
    return e


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# --- instruments ---------------------------------------------------------
def marimba(f, d=0.6, bright=0.35):
    t = tvec(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7)
    x += bright * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 26)
    x += 0.12 * np.sin(2 * np.pi * f * 9.9 * t) * np.exp(-t * 60)
    x *= np.minimum(1, t / 0.002)
    return x


def pluck(f, d=0.35):
    t = tvec(d)
    x = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * t + k) for k in range(5))
    return x * np.exp(-t * 11) * np.minimum(1, t / 0.003)


def bass(f, d=0.45):
    t = tvec(d)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    e = np.minimum(1, t / 0.01) * np.exp(-t * 3.2)
    e *= np.clip((d - t) / 0.04, 0, 1)
    return x * e


def pad(freqs, d, attack=0.4, release=0.6):
    t = tvec(d)
    x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            for k in range(1, 6):
                x += np.sin(2 * np.pi * ff * k * t + k * det * 10) / k
    x = lp(x, 1800)
    e = np.minimum(1, t / attack) * np.clip((d - t) / release, 0, 1)
    return x * e / (len(freqs) * 3 * 2.2)


def kick(d=0.35):
    t = tvec(d)
    f = 45 + 110 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * np.minimum(1, t / 0.002)


def clap():
    x = np.zeros(int(0.25 * SR))
    for k, o in enumerate((0.0, 0.011, 0.022)):
        n = bp(noise(0.2), 900, 2600) * env_ad(int(0.2 * SR), 0.001, 0.03 if k < 2 else 0.09)
        i = int(o * SR)
        x[i:i + len(n)] += n[: len(x) - i]
    return x * 0.5


def hat(d=0.05):
    return hp(noise(d), 7000) * env_ad(int(d * SR), 0.001, 0.015)


# --- sfx -----------------------------------------------------------------
def pop(f0=300, f1=1150, d=0.12):
    t = tvec(d)
    f = f0 + (f1 - f0) * (t / d) ** 0.6
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22)
    return x + 0.15 * bp(noise(d), 2000, 6000) * np.exp(-t * 60)


def whoosh(d=0.35, lo=400, hi=2400, up=True):
    n = noise(d)
    t = tvec(d)
    out = np.zeros_like(n)
    segs = 12
    for k in range(segs):
        a, b = int(k * len(n) / segs), int((k + 1) * len(n) / segs)
        fr = k / (segs - 1)
        c = lo + (hi - lo) * (fr if up else 1 - fr)
        out[a:b] = bp(n, c * 0.7, min(c * 1.4, SR / 2 - 100))[a:b]
    e = np.sin(np.pi * t / d) ** 2
    return out * e * 1.6


def thud(f=70, d=0.35, body=1.0):
    t = tvec(d)
    fr = f + f * 1.2 * np.exp(-t * 40)
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 11) * body
    x += 0.5 * lp(noise(d), 600) * np.exp(-t * 30)
    return x


def knock(f=420, d=0.25):
    t = tvec(d)
    x = bp(noise(d), f * 0.8, f * 1.25, 2) * np.exp(-t * 22) * 4
    x += 0.5 * np.sin(2 * np.pi * f * t) * np.exp(-t * 30)
    return x


def rustle(d=0.8, density=40):
    x = np.zeros(int(d * SR))
    for _ in range(int(d * density)):
        i = rng.integers(0, len(x) - 2000)
        L = rng.integers(400, 1800)
        x[i:i + L] += hp(rng.standard_normal(L), 2500) * np.hanning(L) * rng.uniform(0.3, 1.0)
    return x * np.hanning(len(x)) ** 0.3 * 0.6


def flutter(d=0.6, rate=16):
    t = tvec(d)
    am = (0.5 + 0.5 * np.sin(2 * np.pi * rate * t)) ** 2
    return bp(noise(d), 1500, 4500) * am * np.sin(np.pi * t / d) * 0.5


def whistle_fall(d=0.5):
    t = tvec(d)
    f = 1900 * (0.28 ** (t / d)) * (1 + 0.01 * np.sin(2 * np.pi * 7 * t))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return x * np.minimum(1, t / 0.05) * 0.5


def boing(f=170, d=0.6):
    t = tvec(d)
    fr = f * (1 + 0.35 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 5)


def spring_up(d=0.3):
    t = tvec(d)
    f = 200 + 900 * (t / d) ** 1.5
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.6


def gulp(d=0.3):
    t = tvec(d)
    f = 320 * (0.35 ** (t / d))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.5 * np.exp(-t * 4)


def suction(d=0.95):
    n = noise(d)
    t = tvec(d)
    out = np.zeros_like(n)
    for k in range(10):
        a, b = int(k * len(n) / 10), int((k + 1) * len(n) / 10)
        c = 300 + 1500 * (k / 9) ** 1.4
        out[a:b] = bp(n, c * 0.8, c * 1.3)[a:b]
    return out * np.minimum(1, t / 0.15) * np.clip((d - t) / 0.08, 0, 1) * 1.4


def chime(notes, gap=0.06, d=0.9, bright=0.5):
    x = np.zeros(int((d + gap * len(notes)) * SR))
    for i, m in enumerate(notes):
        y = marimba(midi(m), d, bright)
        a = int(i * gap * SR)
        x[a:a + len(y)] += y
    return x


def bellsound(f=1320, d=1.1):
    t = tvec(d)
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dec)
            for r, a, dec in ((1, 1, 3.5), (2.0, 0.45, 5), (2.76, 0.35, 7), (5.4, 0.2, 10), (0.5, 0.25, 3)))
    return x * np.minimum(1, t / 0.002) * 0.6


def tick(f=2600, d=0.03):
    t = tvec(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 200) + 0.3 * hp(noise(d), 4000) * np.exp(-t * 300)


def shimmer(d=1.2):
    x = np.zeros(int(d * SR))
    for k in range(14):
        m = 84 + [0, 4, 7, 11, 12, 16, 19][k % 7]
        y = marimba(midi(m), 0.5, 0.2) * (1 - k / 16)
        a = int(k * 0.045 * SR)
        x[a:a + len(y)] += y[: len(x) - a]
    return x


# --- music ---------------------------------------------------------------
CHORDS = {"C": [48, 52, 55, 60, 64], "Am": [45, 52, 57, 60, 64], "F": [41, 53, 57, 60, 65], "G": [43, 55, 59, 62, 67],
          "Cm": [48, 51, 55, 60, 63], "Ab": [44, 51, 56, 60, 63]}


def music():
    m = np.zeros((N, 2))
    beat = 0.5
    # hook: curious tiptoe plucks (minor), 0 - 2.6
    hook_notes = [72, 75, 79, 75, 72, 75, 80, 79, 75, 74]
    for i, n in enumerate(hook_notes):
        t0 = 0.0 + i * 0.25
        if t0 < 2.55:
            place(m, pluck(midi(n), 0.3), t0, 0.16, pan=-0.2 if i % 2 else 0.2)
    place(m, pad([48, 55, 63], 2.7, 0.2, 0.3), 0.0, 0.5)
    for i in range(5):
        place(m, bass(midi(36 if i % 2 == 0 else 43), 0.45), i * 0.5, 0.34)
    # chase: scurrying 16th plucks, rising, 2.6 - crash
    seq = [72, 74, 75, 77, 79, 77, 75, 74]
    k = 0
    t0 = 2.6
    while t0 < T["crash"] - 0.02:
        n = seq[k % len(seq)] + (k // 8) * 2
        place(m, pluck(midi(n), 0.18), t0, 0.15, pan=0.25 * math.sin(k))
        if k % 4 == 0:
            place(m, bass(midi(36 + (k // 8) * 2), 0.25), t0, 0.36)
            place(m, kick(), t0, 0.35)
        if k % 2 == 1:
            place(m, hat(), t0, 0.12)
        k += 1
        t0 += 0.125
    # sad trombone-ish descent after crash ("Notes everywhere...")
    for i, n in enumerate([55, 54, 53, 52]):
        t0 = 4.95 + i * 0.5
        d = 0.48 if i < 3 else 1.3
        tt = tvec(d)
        f = midi(n) * (1 + (0.012 * np.sin(2 * np.pi * 6 * tt) if i == 3 else 0))
        x = signal.sawtooth(2 * np.pi * np.cumsum(np.full_like(tt, 1.0) * f) / SR)
        x = lp(x, 900) * np.minimum(1, tt / 0.04) * np.clip((d - tt) / 0.1, 0, 1)
        place(m, x, t0, 0.07)
    # groove from the tile landing: 7.5 -> 27.0, bars of 4 beats
    prog = ["C", "Am", "F", "G", "C", "Am", "F", "G", "F", "G"]
    for b, ch in enumerate(prog):
        bt = 7.5 + b * 4 * beat
        notes = CHORDS[ch]
        review = 18.0 <= bt < 24.0
        place(m, pad([notes[1], notes[2], notes[3]], 2.05, 0.3, 0.4), bt, 0.38 if not review else 0.5)
        for q in range(4):
            tb = bt + q * beat
            if tb >= 27.0:
                break
            if not review or q in (0, 2):
                place(m, kick(), tb, 0.42 if not review else 0.3)
            if q in (1, 3) and not review:
                place(m, clap(), tb, 0.22)
            place(m, bass(midi(notes[0] - 12 if notes[0] > 40 else notes[0]), 0.42), tb, 0.36)
            if q % 2 == 1:
                place(m, bass(midi(notes[0]), 0.2), tb + 0.25, 0.18)
            for e in range(2):
                te = tb + e * 0.25
                place(m, hat(), te + 0.25, 0.08 if not review else 0.05)
        # marimba riff (two-bar call)
        riff = [0, 2, 4, 2, 3, 4, 2, 1] if b % 2 == 0 else [4, 3, 2, 3, 4, 3, 2, 0]
        if not review:
            for e, idx in enumerate(riff):
                te = bt + e * 0.25
                if te < 27.0:
                    place(m, marimba(midi(notes[idx] + 12), 0.4, 0.25), te, 0.09, pan=0.3 if e % 2 else -0.3)
    # payoff build + fill
    for i in range(8):
        place(m, kick(), 26.0 + i * 0.075, 0.14 + i * 0.02)
    # end: resolved C chord at the icon pop, gentle arpeggio, tail
    place(m, pad([60, 64, 67, 71], 3.0, 0.05, 1.2), T["icon"], 0.55)
    place(m, bass(midi(36), 1.6), T["icon"], 0.5)
    place(m, kick(), T["icon"], 0.5)
    arp = [72, 76, 79, 84, 79, 76, 72, 76, 79, 83, 84]
    for i, n in enumerate(arp):
        place(m, marimba(midi(n), 0.6, 0.25), T["icon"] + 0.35 + i * 0.22, 0.07, pan=0.35 * math.sin(i))
    return m


# --- SFX design ----------------------------------------------------------
def sfx_track():
    s = np.zeros((N, 2))
    # card pops + wing flutter
    for k, tp in enumerate(T["pop"]):
        pn = [0.3, -0.4, 0.1][k]
        sfx(s, "pop", pop(260 + 80 * k, 1100 + 120 * k), max(0.0, tp), 0.5, pn)
        sfx(s, "flutter", flutter(0.9, 15 + k * 2), max(0.0, tp + 0.05), 0.35, pn)
    sfx(s, "flutter", flutter(2.2, 17), 1.4, 0.18, 0.0)
    sfx(s, "boing_question", boing(330, 0.3), T["again"] + 0.02, 0.06, 0.0)
    # chase
    sfx(s, "toss_whoosh", whoosh(0.3, 600, 2000), 2.36, 0.35, -0.4)
    sfx(s, "book_land", knock(300, 0.2), 2.8, 0.45, -0.6)
    sfx(s, "jump_whoosh", whoosh(0.4, 300, 1800), T["launch"], 0.6, 0.3)
    sfx(s, "card_zip", whoosh(0.22, 1500, 5000), 3.25, 0.4, 0.4)
    sfx(s, "land", thud(80, 0.3), T["land1"], 0.7, 0.4)
    sfx(s, "card_swoop", whoosh(0.2, 1000, 3500, up=False), T["swoop"], 0.35, -0.3)
    sfx(s, "dive_whoosh", whoosh(0.35, 250, 1500), T["dive"], 0.6, -0.2)
    sfx(s, "card_zip", whoosh(0.2, 1500, 5000), 4.12, 0.4, -0.5)
    sfx(s, "crash", thud(55, 0.5, 1.4), T["crash"], 1.0, -0.3)
    sfx(s, "desk_knock", knock(380, 0.3), T["crash"] + 0.01, 0.8, -0.5)
    sfx(s, "papers", rustle(1.1, 50), T["crash"] + 0.05, 0.55, -0.2)
    for i in range(5):
        sfx(s, "stars", marimba(midi(96 + [0, 3, 7, 3, 0][i]), 0.25, 0.1), T["crash"] + 0.15 + i * 0.22, 0.06, -0.3)
    sfx(s, "book_fall", knock(260, 0.2), 5.25, 0.35, -0.6)
    sfx(s, "cards_exit", whoosh(0.5, 800, 3000), T["cards_exit"], 0.32, 0.6)
    sfx(s, "cards_exit", whoosh(0.5, 800, 3000), 5.9, 0.28, -0.6)
    # arrive
    sfx(s, "whistle", whistle_fall(0.5), T["whistle"], 0.32, 0.4)
    sfx(s, "tile_land", thud(50, 0.6, 1.5), T["tile_land"], 1.0, 0.4)
    sfx(s, "boing", boing(150, 0.55), T["tile_land"] + 0.02, 0.3, 0.4)
    sfx(s, "startle_whoosh", whoosh(0.25, 500, 2200), 7.52, 0.3, -0.1)
    sfx(s, "hop_land", thud(110, 0.18, 0.6), 7.85, 0.35, -0.1)
    sfx(s, "glint", chime([84, 88, 91, 96], 0.05, 0.6, 0.3), 8.05, 0.16, 0.4)
    sfx(s, "tile_hop", boing(260, 0.3), 7.95, 0.12, 0.4)
    sfx(s, "pickup", rustle(0.3, 50), T["pickup"], 0.4, -0.1)
    sfx(s, "throw", whoosh(0.35, 500, 2600), T["throw"], 0.5, 0.2)
    sfx(s, "chomp", pop(500, 200, 0.12), T["throw"] + 0.36, 0.35, 0.4)
    sfx(s, "suction", suction(0.95), 9.98, 0.45, 0.4)
    for k, ts in enumerate(T["suck"]):
        sfx(s, "fwip", whoosh(0.18, 1500, 4500), ts + 0.15, 0.3, 0.4 - 0.15 * k)
        sfx(s, "swallow", pop(600, 250, 0.08), ts + 0.38, 0.22, 0.4)
    sfx(s, "gulp", gulp(0.32), T["gulp"], 0.7, 0.4)
    proc = np.zeros(int(0.9 * SR))
    for i in range(11):
        y = tick(1400 + 300 * (i % 3), 0.03)
        a = int(i * 0.08 * SR)
        proc[a:a + len(y)] += y
    proc += 0.4 * lp(noise(0.9), 200) * np.sin(np.pi * tvec(0.9) / 0.9)
    sfx(s, "processing", proc, T["rumble"], 0.35, 0.4)
    # practice
    for k, td in enumerate(T["deal"]):
        sfx(s, "deal", whoosh(0.16, 1200, 4000), td, 0.3, 0.4 - 0.25 * k)
        sfx(s, "deal_tick", tick(2000 + 200 * k), td + 0.45, 0.25, -0.4 + 0.25 * k)
    for k, tp in enumerate(T["practice"]):
        pn = -0.25 if k % 2 == 0 else 0.25
        sfx(s, "flip", whoosh(0.1, 2000, 5000), tp, 0.18, pn)
        sfx(s, "catch_tap", knock(900, 0.08), tp + 0.32, 0.4, pn)
        sfx(s, "correct_ding", chime([72 + [0, 4, 7, 12][k], 79 + [0, 4, 7, 12][k]], 0.04, 0.7, 0.4),
            tp + 0.36, 0.22, pn)
        sfx(s, "into_head", pop(400, 1400, 0.1), tp + 0.7, 0.2, 0.0)
    sfx(s, "cheer", chime([72, 76, 79, 84], 0.05, 0.6), T["fistpump"], 0.18, 0.0)
    # review: time-lapse ticking, drift whirr, bells, taps
    for i in range(int((24.0 - 18.0) / 0.25)):
        tt = 18.0 + i * 0.25
        sfx(s, "clock", tick(1800 if i % 2 == 0 else 1300, 0.025), tt, 0.09, 0.0)
    for td, tb, tt in ((T["drift1"], T["bell1"], T["tap1"]), (T["drift2"], T["bell2"], T["tap2"])):
        sfx(s, "drift_flutter", flutter(tb - td, 14), td, 0.3, 0.2)
        sfx(s, "bell", bellsound(1320), tb, 0.35, 0.4)
        sfx(s, "bell", bellsound(1320), tb + 0.2, 0.28, 0.4)
        sfx(s, "run", whoosh(0.3, 400, 1600), tb + 0.1, 0.25, 0.1)
        sfx(s, "tap", knock(700, 0.12), tt, 0.45, 0.35)
        sfx(s, "review_ding", chime([79, 84, 88], 0.05, 0.8, 0.4), tt + 0.05, 0.22, 0.2)
        sfx(s, "into_head", pop(400, 1500, 0.1), tt + 0.36, 0.22, 0.0)
    # payoff
    for k, tc in enumerate(T["catch"]):
        pn = [0.6, -0.6, 0.6][k]
        sfx(s, "return_whoosh", whoosh(0.45, 600, 3000), tc - 0.45, 0.4, pn)
        sfx(s, "catch_tap", knock(850, 0.08), tc, 0.4, 0.0)
        sfx(s, "word_ding", chime([72 + [0, 4, 7][k], 79 + [0, 4, 7][k], 84 + [0, 4, 7][k]], 0.03, 0.8, 0.4),
            tc + 0.05, 0.2, 0.0)
        sfx(s, "slot", pop(500, 1300, 0.08), tc + 0.45, 0.15, [-0.5, 0.0, 0.5][k])
    sfx(s, "hop", spring_up(0.25), 26.05, 0.2, 0.0)
    sfx(s, "hop_land", thud(120, 0.15, 0.5), 26.45, 0.3, 0.0)
    sfx(s, "toss_whoosh", whoosh(0.45, 400, 3000), T["toss"], 0.55, 0.2)
    # end
    sfx(s, "icon_pop", pop(200, 900, 0.16), T["icon"], 0.6, 0.0)
    sfx(s, "icon_shimmer", shimmer(1.2), T["icon"] + 0.02, 0.16, 0.0)
    sfx(s, "spring_up", spring_up(0.3), 27.08, 0.3, 0.2)
    sfx(s, "perch_tap", knock(600, 0.1), T["perch"], 0.35, 0.3)
    sfx(s, "cta_tick", tick(2400, 0.04), T["cta"], 0.35, 0.0)
    sfx(s, "cta_chime", chime([84, 91], 0.05, 0.8, 0.3), T["cta"] + 0.02, 0.12, 0.0)
    sfx(s, "shine", chime([96, 100, 103], 0.04, 0.5, 0.2), T["shine"], 0.06, 0.3)
    # footsteps from the walk cycles
    try:
        import render
        for (t0, t1, stride, _bob, run) in render.WALKS:
            x0 = render.STUDENT(t0)["hip"][0]
            last = 0
            tt = t0
            while tt <= t1:
                ph = abs(render.STUDENT(tt)["hip"][0] - x0) / (2 * stride)
                step = int(ph * 2)
                if step > last:
                    sfx(s, "step", thud(170, 0.08, 0.4), tt, 0.22 if run else 0.16, 0.0)
                    last = step
                tt += 1 / 240
    except Exception as e:  # pragma: no cover
        print("footsteps skipped:", e)
    return s


def narration_track():
    v = np.zeros((N, 2))
    presence = np.zeros(N)
    meta = json.load(open(os.path.join(HERE, "audio", "narration", "lines.json")))
    for line in meta["lines"]:
        x, sr = sf.read(os.path.join(HERE, line["file"]), dtype="float32")
        if x.ndim > 1:
            x = x.mean(axis=1)
        x = signal.resample_poly(x, SR, sr)
        x = hp(x, 90)
        # gentle presence lift
        x = x + 0.25 * bp(x, 2500, 6000)
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.75
        place(v, x, line["start"], 1.0, 0.0)
        a = int(line["start"] * SR)
        presence[a:a + len(x)] = 1.0
    # smooth presence for ducking (attack 40 ms, release 250 ms)
    k = int(0.25 * SR)
    win = np.hanning(k)
    win /= win.sum()
    duck = np.convolve(presence, win, mode="same")
    return v, np.clip(duck * 1.3, 0, 1)


def limiter(x, ceiling, look=0.005, release=0.08):
    """Look-ahead peak limiter (stereo-linked)."""
    from scipy.ndimage import minimum_filter1d
    pk = np.max(np.abs(x), axis=1) + 1e-12
    g = np.minimum(1.0, ceiling / pk)
    n = int(look * SR)
    g = minimum_filter1d(g, size=2 * n + 1, mode="nearest")
    # smooth release (one-pole) while keeping instant attack
    a = math.exp(-1.0 / (release * SR))
    gr = signal.lfilter([1 - a], [1, -a], g)
    g = np.minimum(g, gr)
    g = np.concatenate([g[n:], np.full(n, g[-1])])  # look-ahead alignment
    return x * g[:, None]


def lufs(x):
    import subprocess
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".wav") as tf:
        sf.write(tf.name, x.astype(np.float32), SR)
        r = subprocess.run(["ffmpeg", "-hide_banner", "-i", tf.name, "-af", "ebur128", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    s = r[r.rfind("Summary:"):]
    for line in s.splitlines():
        if line.strip().startswith("I:"):
            return float(line.split()[1])
    return None


def limit_to_loudness(mix, target_lufs=-16.0, ceiling_db=-1.5):
    ceiling = 10 ** ((ceiling_db - 0.5) / 20)  # extra 0.5 dB headroom for AAC/true-peak
    mix = mix / np.max(np.abs(mix)) * ceiling
    for _ in range(4):
        cur = lufs(limiter(mix, ceiling))
        if cur is None or abs(cur - target_lufs) < 0.3:
            break
        mix = mix * 10 ** ((target_lufs - cur) / 20)
    out = limiter(mix, ceiling)
    return np.clip(out, -ceiling, ceiling)


def main():
    os.makedirs(os.path.join(HERE, "build"), exist_ok=True)
    mus = music()
    fx = sfx_track()
    vo, duck = narration_track()
    mus *= (1 - 0.55 * duck)[:, None]
    fx *= (1 - 0.3 * duck)[:, None]
    mix = 0.55 * mus + 0.6 * fx + 1.0 * vo
    # fade out the last 0.35 s, fade in 10 ms
    fo = int(0.35 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    mix[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    # balance report: voice vs bed (music+sfx) during each narration line
    bed = 0.55 * mus + 0.6 * fx
    bal = []
    for line in NARRATION:
        meta = json.load(open(os.path.join(HERE, "audio", "narration", "lines.json")))
        d = next(l["duration"] for l in meta["lines"] if l["id"] == line["id"])
        i0, i1 = int(line["start"] * SR), int((line["start"] + d) * SR)
        rv = np.sqrt(np.mean(vo[i0:i1] ** 2)) + 1e-9
        rb = np.sqrt(np.mean(bed[i0:i1] ** 2)) + 1e-9
        bal.append({"id": line["id"], "voice_over_bed_db": round(float(20 * np.log10(rv / rb)), 1)})
    with open(os.path.join(HERE, "build", "audio_balance.json"), "w") as f:
        json.dump(bal, f, indent=1)
    mix = limit_to_loudness(mix, target_lufs=-16.0, ceiling_db=-1.5)
    out = os.path.join(HERE, "build", "mix.wav")
    sf.write(out, mix.astype(np.float32), SR, subtype="PCM_24")
    stems = os.path.join(HERE, "build")
    sf.write(os.path.join(stems, "stem_voice.wav"), (vo * 0.9).astype(np.float32), SR, subtype="PCM_16")
    with open(os.path.join(HERE, "build", "audio_events.json"), "w") as f:
        json.dump(sorted(EVENTS, key=lambda e: e["t"]), f, indent=1)
    print("wrote", out, "events", len(EVENTS), "peak", float(np.max(np.abs(mix))))


if __name__ == "__main__":
    main()
