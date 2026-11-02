"""Original score + action-locked SFX + narration mix for Recall education pilot 01.

Everything except the narration is synthesised here with numpy/scipy (no samples, no downloads).
Inputs : ../timeline.json (cues + narration starts), narration/*.wav (Kokoro, see tts.py)
Outputs: ../build/mix.wav (48 kHz stereo, exactly 15.000 s), ../build/mouth.json (per-frame lip-sync),
         ../build/audio_report.json (loudness, peaks, voice-over-bed balance, SFX event list)
Usage  : .venv/bin/python mix.py
"""
import json
import os

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, lfilter, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BUILD = os.path.join(ROOT, "build")
SR = 48000
DUR = 15.0
N = int(SR * DUR)
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
C = TL["cues"]
RNG = np.random.default_rng(20261102)
EVENTS = []
MUS_G, FX_G = 0.36, 0.5


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def env_adsr(n, a=0.005, r=0.1, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * t / max(r, 1e-4))
    return e


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def place(buf, sig, t0, gain=1.0, pan=0.0, name=None):
    """Mix mono sig into stereo buf at time t0 with equal-power pan (-1 left .. 1 right)."""
    i0 = int(round(t0 * SR))
    if i0 >= N:
        return
    if i0 < 0:
        sig = sig[-i0:]
        i0 = 0
    sig = sig[: N - i0]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i0:i0 + len(sig), 0] += sig * gain * l
    buf[i0:i0 + len(sig), 1] += sig * gain * r
    if name:
        EVENTS.append({"t": round(t0, 3), "sfx": name})


# ---------------------------------------------------------------- SFX
def whoosh(d, f0, f1, q=3.0):
    n = int(d * SR)
    x = RNG.standard_normal(n)
    out = np.zeros(n)
    seg = 512
    for i in range(0, n, seg):
        f = f0 + (f1 - f0) * (i / n)
        out[i:i + seg] = bp(x[max(0, i - 2048):i + seg], f / (1 + 1 / q), f * (1 + 1 / q))[-len(x[i:i + seg]):]
    e = np.sin(np.pi * np.arange(n) / n) ** 1.5
    return out * e


def plop():
    t = t_axis(0.35)
    body = np.sin(2 * np.pi * (160 * t + 900 * t * t * -0.4)) * np.exp(-t / 0.06)
    pitch = np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.08], [380, 900])) / SR) * np.exp(-t / 0.05)
    spl = bp(RNG.standard_normal(len(t)), 900, 6500) * np.exp(-t / 0.09)
    return 0.8 * body + 0.5 * pitch + 0.45 * spl


def splash_big():
    t = t_axis(0.8)
    noise = RNG.standard_normal(len(t))
    s = bp(noise, 500, 7000) * (np.exp(-t / 0.16) * (1 - np.exp(-t / 0.004)))
    low = np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.08)
    drops = np.zeros(len(t))
    for k in range(9):
        t0 = 0.08 + RNG.random() * 0.5
        dd = droplet(800 + RNG.random() * 1400)
        i = int(t0 * SR)
        drops[i:i + len(dd)] += dd[: len(drops) - i] * 0.35
    return 0.7 * s + 0.6 * low + drops


def droplet(f):
    t = t_axis(0.07)
    fr = f * (1 + 1.4 * t / 0.07)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.018)


def bubbles(d, n, f0=500, f1=1500):
    out = np.zeros(int(d * SR))
    for _ in range(n):
        t0 = RNG.random() * (d - 0.08)
        dd = droplet(f0 + RNG.random() * (f1 - f0)) * (0.4 + 0.6 * RNG.random())
        i = int(t0 * SR)
        out[i:i + len(dd)] += dd[: len(out) - i]
    return out


def clunk():
    t = t_axis(0.5)
    parts = [(118, 1.0, 0.09), (311, 0.5, 0.05), (742, 0.35, 0.03), (1530, 0.2, 0.02)]
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dcy) for f, a, dcy in parts)
    s += 0.3 * bp(RNG.standard_normal(len(t)), 200, 2000) * np.exp(-t / 0.012)
    return s


def horn():
    t = t_axis(0.7)
    e = np.minimum(1, t / 0.05) * np.minimum(1, (0.7 - t) / 0.18)
    s = sum((1 / k) * np.sign(np.sin(2 * np.pi * k * 196 * t)) for k in (1, 2)) + 0.6 * np.sin(2 * np.pi * 246.9 * t)
    return lp(s, 1400, 4) * e * 0.5


def rewind(d):
    """Tape-rewind zip: fast chirpy sweep with flutter."""
    t = t_axis(d)
    f = 400 + 2600 * (t / d) ** 1.3 + 180 * np.sin(2 * np.pi * 31 * t)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    noise = bp(RNG.standard_normal(len(t)), 1500, 7000)
    e = np.sin(np.pi * t / d) ** 0.7
    return (0.35 * tone + 0.5 * noise) * e


def tick(f=2200, d=0.06):
    t = t_axis(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012) + 0.3 * RNG.standard_normal(len(t)) * np.exp(-t / 0.003)


def freeze():
    t = t_axis(0.9)
    s = sum(np.sin(2 * np.pi * f * t + RNG.random() * 6) for f in (1318.5, 1760, 2637))
    return s * np.exp(-t / 0.35) * (1 - np.exp(-t / 0.01)) * 0.25


def bloop(f0=300, f1=700, d=0.18):
    t = t_axis(d)
    f = np.interp(t, [0, d], [f0, f1])
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 1.2


def squish(seed_f):
    t = t_axis(0.32)
    n = RNG.standard_normal(len(t))
    out = np.zeros(len(t))
    seg = 256
    for i in range(0, len(t), seg):
        fc = seed_f * (1.0 + 0.8 * np.sin(np.pi * i / len(t)))
        out[i:i + seg] = bp(n[max(0, i - 2048):i + seg], fc * 0.7, fc * 1.4)[-len(n[i:i + seg]):]
    e = np.sin(np.pi * t / 0.32) ** 0.6 * np.exp(-t / 0.25)
    wet = np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.32], [220, 140])) / SR) * e * 0.4
    return out * e * 1.4 + wet


def ting():
    t = t_axis(1.2)
    parts = [(1046.5, 1.0, 0.5), (2793, 0.45, 0.25), (4186, 0.25, 0.15), (1568, 0.35, 0.35)]
    return sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dcy) for f, a, dcy in parts) * 0.35


def slap():
    t = t_axis(0.6)
    s = bp(RNG.standard_normal(len(t)), 250, 5000) * np.exp(-t / 0.07) * (1 - np.exp(-t / 0.003))
    low = np.sin(2 * np.pi * 75 * t) * np.exp(-t / 0.1)
    return 0.8 * s + 0.7 * low


def slosh(d, f_bob):
    t = t_axis(d)
    n = lp(RNG.standard_normal(len(t)), 900, 2)
    am = 0.5 + 0.5 * np.cos(2 * np.pi * f_bob * t)
    return n * am * np.exp(-t / (d * 0.45)) * 2.0


def shimmer(d=0.7, up=True):
    t = t_axis(d)
    out = np.zeros(len(t))
    notes = [880, 1108.7, 1318.5, 1760] if up else [1760, 1318.5, 1108.7, 880]
    for k, f in enumerate(notes):
        i = int(k * d / 6 * SR)
        tt = t[: len(t) - i]
        out[i:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.25)
    return out * 0.22


def ding():
    t = t_axis(1.4)
    s = np.sin(2 * np.pi * 1174.7 * t) * np.exp(-t / 0.6) + 0.7 * np.sin(2 * np.pi * 1480 * t) * np.exp(-t / 0.5)
    s += 0.2 * np.sin(2 * np.pi * 2349 * t) * np.exp(-t / 0.2)
    return s * (1 - np.exp(-t / 0.004)) * 0.4


def airpuff():
    t = t_axis(0.5)
    return bp(RNG.standard_normal(len(t)), 2500, 9000) * np.sin(np.pi * t / 0.5) ** 2 * 0.5


def pop():
    t = t_axis(0.12)
    return np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 0.12], [900, 300])) / SR) * np.exp(-t / 0.03)


def thunk():
    t = t_axis(0.25)
    return np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.04) + 0.4 * bp(RNG.standard_normal(len(t)), 800, 3000) * np.exp(-t / 0.01)


def boing():
    t = t_axis(0.45)
    f = 330 + 180 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / 0.15) + 120 * t
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * 0.6


def build_sfx():
    fx = np.zeros((N, 2))
    place(fx, whoosh(0.4, 300, 900) * 0.25, 0.02, 0.5, 0.0, "lift whoosh")
    place(fx, whoosh(0.3, 1400, 500) * 0.5, C["drop"], 0.6, 0.0, "drop whoosh")
    place(fx, plop(), C["splash"], 0.55, 0.0, "plop")
    place(fx, splash_big(), C["splash"] + 0.01, 0.5, 0.0, "splash")
    place(fx, bubbles(1.1, 14), C["splash"] + 0.12, 0.28, 0.1, "bubbles")
    place(fx, clunk(), C["floor"], 0.55, 0.0, "clunk on tank floor")
    place(fx, horn(), C["toot"], 0.28, -0.55, "toy ship toot")
    place(fx, rewind(C["pause"] - C["twirl"]), C["twirl"], 0.5, 0.15, "rewind zip")
    place(fx, bubbles(0.3, 6, 900, 1400)[::-1], C["rewind"], 0.2, 0.0, "reversed bubbles")
    place(fx, tick(1800), C["pause"], 0.6, 0.0, "pause click")
    place(fx, freeze(), C["pause"], 0.6, 0.0, "freeze shimmer")
    place(fx, bloop(260, 620), C["ghostOut"], 0.4, 0.3, "ghost bloop")
    place(fx, tick(1300, 0.08), C["arrowsBall"], 0.45, 0.0, "arrow tick")
    place(fx, tick(2600, 0.05), C["markBall"], 0.3, 0.4, "gauge tick")
    place(fx, rewind(C["catch"] - C["twirl2"]), C["twirl2"], 0.5, 0.15, "rewind zip 2")
    place(fx, splash_big()[::-1][-int(0.45 * SR):] * 0.9, C["rewindSplash"] - 0.45, 0.45, 0.0, "reversed splash")
    place(fx, thunk(), C["catch"], 0.5, 0.0, "catch")
    for k, nm in enumerate(["squish1", "squish2", "squish3"]):
        place(fx, squish(700 + 250 * k), C[nm], 0.6, (k - 1) * 0.2, f"clay squish {k + 1}")
    place(fx, ting(), C["morphEnd"], 0.55, 0.0, "steel ting")
    place(fx, whoosh(0.4, 900, 300) * 0.35, C["lowerStart"], 0.5, 0.0, "lower whoosh")
    place(fx, slap(), C["touch"], 0.55, 0.0, "hull water slap")
    place(fx, slosh(1.3, 1.25), C["touch"] + 0.05, 0.25, 0.0, "slosh")
    place(fx, shimmer(0.7, True), C["ghostHull"], 0.5, 0.0, "displaced-water shimmer")
    place(fx, tick(1300, 0.08), C["arrowsHull"], 0.45, 0.0, "arrow tick")
    place(fx, tick(2600, 0.05), C["markHull"], 0.3, 0.4, "gauge tick")
    place(fx, ding(), C["balanced"], 0.55, 0.0, "balance ding")
    place(fx, whoosh(0.7, 500, 1200) * 0.3, C["declutter"], 0.4, 0.3, "camera whoosh")
    place(fx, tick(2000, 0.05), C["labelSteel"], 0.3, 0.3, "label tick")
    place(fx, airpuff(), C["labelAir"], 0.35, 0.0, "air puff")
    place(fx, pop(), C["flagGrab"] + 0.12, 0.4, -0.3, "flag pop")
    place(fx, thunk(), C["flagPlant"], 0.45, -0.3, "flag plant")
    place(fx, boing(), C["thumbs"] - 0.08, 0.45, 0.2, "hop boing")
    return fx


# ---------------------------------------------------------------- music (original)
def note_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def pluck(f, d, bright=1.0):
    t = t_axis(d)
    s = np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.08) + 0.12 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.05)
    return s * np.exp(-t / 0.28) * (1 - np.exp(-t / 0.003))


def pad(freqs, d):
    t = t_axis(d)
    s = sum(np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * 0.3 * t)) + 0.4 * np.sin(2 * np.pi * f * 1.003 * t) for f in freqs)
    e = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.3)
    return lp(s, 1800, 2) * e / len(freqs)


def build_music():
    bpm = 104
    beat = 60 / bpm
    mus = np.zeros((N, 2))
    # D major curious loop: D - Bm - G - A ; final bar resolves to D
    chords = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]]
    bass = [38, 35, 31, 33]
    arp = [0, 2, 1, 2, 0, 2, 1, 2]
    bar = 4 * beat
    nbars = int(np.ceil(DUR / bar))
    for b in range(nbars):
        t0 = b * bar
        ch = chords[b % 4] if t0 < 12.8 else [62, 66, 69]
        bs = bass[b % 4] if t0 < 12.8 else 38
        place(mus, pad([note_hz(m) for m in ch], bar + 0.2), t0, 0.16)
        for k in range(2):
            place(mus, pluck(note_hz(bs), 0.9, 0.4) * 0.9, t0 + k * 2 * beat, 0.35)
        for k in range(8):
            tt = t0 + k * beat / 2
            m = ch[arp[k]] + 12 + (12 if k == 7 and b % 2 else 0)
            place(mus, pluck(note_hz(m), 0.5), tt, 0.13 if k % 2 == 0 else 0.09, pan=0.25 * np.sin(k))
        # soft woodblock on off-beats
        for k in range(4):
            place(mus, tick(1700, 0.04) * 0.5, t0 + k * beat + beat / 2, 0.06, pan=0.3)
    # ending: a gentle final sparkle on the takeaway
    place(mus, shimmer(1.0, True), 13.3, 0.35)
    return mus


# ---------------------------------------------------------------- narration
def load_narration():
    meta = json.load(open(os.path.join(HERE, "narration", "lines.json")))
    by_id = {m["id"]: m for m in meta["lines"]}
    voice = np.zeros(N)
    spans = []
    for item in TL["narration"]:
        m = by_id[item["id"]]
        a, sr = sf.read(os.path.join(HERE, "narration", m["file"]), dtype="float64")
        if a.ndim > 1:
            a = a.mean(1)
        if sr != SR:
            g = np.gcd(sr, SR)
            a = resample_poly(a, SR // g, sr // g)
        i0 = int(round(item["start"] * SR))
        assert i0 + len(a) <= N, f"{item['id']} runs past the end"
        voice[i0:i0 + len(a)] += a
        spans.append((item["id"], item["start"], item["start"] + len(a) / SR, m["text"]))
    spans.sort(key=lambda s: s[1])
    for (i1, s1, e1, _), (i2, s2, _, _) in zip(spans, spans[1:]):
        assert e1 + 0.15 <= s2, f"narration overlap/too tight: {i1} ends {e1:.2f}, {i2} starts {s2:.2f}"
    # gentle voice EQ: high-pass rumble, small presence lift
    voice = hp(voice, 90, 2)
    voice = voice + 0.25 * bp(voice, 2500, 5000)
    return voice, spans


# ---------------------------------------------------------------- loudness (ITU-R BS.1770-4)
def lufs(x):
    # K-weighting for 48 kHz (coefficients from BS.1770-4)
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    z = np.array([np.sum(np.mean(y[i:i + blk] ** 2, axis=0)) for i in range(0, len(y) - blk, hop)])
    l = -0.691 + 10 * np.log10(z + 1e-12)
    z = z[l > -70]
    rel = -0.691 + 10 * np.log10(np.mean(z)) - 10
    z = z[(-0.691 + 10 * np.log10(z + 1e-12)) > rel]
    return -0.691 + 10 * np.log10(np.mean(z))


def limit(x, ceil, release=0.06, look=0.003):
    """Peak limiter: per-sample gain = min(1, ceil/peak) over a short look-ahead window, smooth release."""
    from scipy.ndimage import maximum_filter1d
    pk = maximum_filter1d(np.max(np.abs(x), axis=1), size=int(look * SR) * 2 + 1)
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    a = np.exp(-1 / (release * SR))
    out = np.empty_like(g); cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    return x * out[:, None]


def main():
    os.makedirs(BUILD, exist_ok=True)
    voice, spans = load_narration()
    fx = build_sfx()
    mus = build_music()

    # time "pause": muffle + dip the music while the scene is frozen
    tt = np.arange(N) / SR
    frz = np.clip((tt - C["pause"]) / 0.12, 0, 1) * np.clip((C["unpause"] - tt) / 0.12, 0, 1)
    muff = lp(mus, 600, 2)
    mus = mus * (1 - frz[:, None]) + muff * frz[:, None] * 0.8

    # duck music under the voice (smoothed envelope)
    venv = np.abs(voice)
    k = int(0.12 * SR)
    venv = np.convolve(venv, np.ones(k) / k, mode="same")
    duck = 1 - 0.55 * np.clip(venv / 0.02, 0, 1)
    mus = mus * duck[:, None]
    fx = fx * (1 - 0.4 * np.clip(venv / 0.02, 0, 1))[:, None]

    # end: fade the last 0.5 s so the file ends cleanly at 15.000 s
    fade = np.clip((DUR - tt) / 0.5, 0, 1)
    vst = np.stack([voice, voice], 1)
    mix = 1.0 * vst + MUS_G * mus + FX_G * fx
    mix *= fade[:, None]

    # normalise to -16 LUFS integrated, then a soft peak limiter at -1.5 dBFS
    gain = 10 ** ((-16.0 - lufs(mix)) / 20)
    mix *= gain
    mix = limit(mix, 10 ** (-1.5 / 20))
    final_lufs = lufs(mix)
    sf.write(os.path.join(BUILD, "mix.wav"), mix.astype(np.float32), SR, subtype="PCM_24")

    # lip-sync envelope per video frame
    fps = TL["fps"]
    nf = int(DUR * fps)
    vg = voice * gain
    rms = np.array([np.sqrt(np.mean(vg[int(i * SR / fps):int((i + 1) * SR / fps)] ** 2)) for i in range(nf)])
    ref = np.percentile(rms[rms > 1e-4], 90) if np.any(rms > 1e-4) else 1
    mouth = np.clip((rms / ref - 0.08) / 0.92, 0, 1) ** 0.8
    sm = np.copy(mouth)
    for i in range(1, nf):
        sm[i] = max(mouth[i], 0.55 * sm[i - 1]) if mouth[i] > sm[i - 1] else 0.5 * sm[i - 1] + 0.5 * mouth[i]
    json.dump({"fps": fps, "frames": [round(float(v), 3) for v in sm]}, open(os.path.join(BUILD, "mouth.json"), "w"))

    # report: voice-over-bed balance during each line
    bed = (MUS_G * mus + FX_G * fx) * gain * fade[:, None]
    bal = []
    for sid, s0, s1, text in spans:
        a, b = int(s0 * SR), int(s1 * SR)
        v = np.sqrt(np.mean((vg[a:b]) ** 2))
        bd = np.sqrt(np.mean(bed[a:b] ** 2))
        words = len(text.split())
        bal.append({"id": sid, "start": round(s0, 3), "end": round(s1, 3), "text": text, "words": words,
                    "words_per_s": round(words / (s1 - s0), 2), "voice_over_bed_db": round(20 * np.log10(v / (bd + 1e-9)), 1)})
    total_words = sum(b["words"] for b in bal)
    rep = {
        "duration_s": len(mix) / SR, "sample_rate": SR, "integrated_lufs": round(final_lufs, 2),
        "sample_peak_dbfs": round(20 * np.log10(np.max(np.abs(mix))), 2),
        "narration_words": total_words, "overall_words_per_s": round(total_words / DUR, 2),
        "speech_seconds": round(sum(b["end"] - b["start"] for b in bal), 2),
        "lines": bal, "sfx_events": EVENTS,
        "music": "original: D-major pluck/pad loop at 104 BPM synthesised in mix.py; muffled during the pause; ducked under voice",
    }
    json.dump(rep, open(os.path.join(BUILD, "audio_report.json"), "w"), indent=2)
    print(json.dumps({k: v for k, v in rep.items() if k not in ("sfx_events",)}, indent=1))


if __name__ == "__main__":
    main()
