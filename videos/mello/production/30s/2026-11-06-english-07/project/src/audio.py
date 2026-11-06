"""Original score + SFX for Mello english07-01 (English), synthesized with numpy/scipy (no samples, no loops).

Same synth, ducking and master chain as the accepted episodes; only the chord plan and the action SFX are new.
Reads generated/narration.wav (Hindi, Kokoro hf_beta), timeline.json and events.json (scene beats exported by
render.mjs) and writes generated/mix.wav + audio_stats.json. SFX are only for on-screen actions: the padlock snapping onto
Play and jiggling, thumb taps on the tiles, steps into the shoes, the unlock with a soft chime, laces pulled, footsteps
on the walk. -16 LUFS master; music kept quiet under the voice (about 13 dB).
"""
import json
import math
import os
import subprocess

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(os.path.dirname(HERE), "generated")
SR = 48000
DUR = 30.0
N = int(SR * DUR)
RNG = np.random.default_rng(1102)
BED_GAIN = 0.48  # re-measured for this narration: keeps the music about 13 dB under the voice


def load():
    with open(os.path.join(GEN, "timeline.json")) as fh:
        tl = {ln["id"]: ln for ln in json.load(fh)["lines"]}
    with open(os.path.join(GEN, "events.json")) as fh:
        ev = json.load(fh)
    return tl, ev["T"], ev["S"]


def hz(name):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    return 440.0 * 2 ** ((names[name[:-1]] + 12 * (int(name[-1]) - 4)) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def place(buf, x, t0, gain=1.0, pan=0.0):
    a = int(round(t0 * SR))
    if x.ndim == 1:
        th = (max(-1, min(1, pan)) + 1) * math.pi / 4
        x = np.stack([x * math.cos(th), x * math.sin(th)], 1) * math.sqrt(2)
    if a < 0:
        x, a = x[-a:], 0
    n = min(len(x), N - a)
    if n > 0:
        buf[a:a + n] += x[:n] * gain


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, f1, f2, order=2):
    return sosfilt(butter(order, [f1, f2], "band", fs=SR, output="sos"), x, axis=0)


def fade(x, a=0.005, r=0.02):
    n = len(x)
    na, nr = min(int(a * SR), n), min(int(r * SR), n)
    if na:
        x[:na] *= np.linspace(0, 1, na)[:, None] if x.ndim == 2 else np.linspace(0, 1, na)
    if nr:
        x[-nr:] *= np.linspace(1, 0, nr)[:, None] if x.ndim == 2 else np.linspace(1, 0, nr)
    return x


def noise(d):
    return RNG.normal(0, 1, int(d * SR))


# ------------------------------------------------------------------ instruments
def pad_chord(notes, d, att=1.6, rel=2.2, cutoff=1400, gain=0.05):
    """Soft detuned additive pad; long attack/release so chords dissolve into each other."""
    t = tt(d + rel)
    y = np.zeros((len(t), 2))
    for j, nm in enumerate(notes):
        f = hz(nm)
        for ch, det in ((0, -1), (1, 1)):
            s = np.zeros_like(t)
            for dt in (0.0, 0.0028 * det, -0.0017 * det):
                for k in range(1, 5):
                    s += (0.45 ** (k - 1)) * np.sin(2 * np.pi * f * (1 + dt) * k * t + 0.9 * k + ch + j)
            y[:, ch] += s
    env = np.clip(t / att, 0, 1) ** 2
    env *= np.where(t > d, np.exp(-(t - d) / (rel / 3.5)), 1.0)
    slow = 1 + 0.06 * np.sin(2 * np.pi * 0.11 * t + 0.4)          # slow breathing swell, not a rhythm
    y = lp(y * (env * slow)[:, None], cutoff)
    return y * gain / max(1, len(notes) ** 0.5)


def ep_note(f, d=3.0, bright=1.0):
    """Felt-piano-like tone: soft attack, gentle inharmonic partials, long decay."""
    t = tt(d)
    y = np.zeros_like(t)
    for k, amp, dk in ((1, 1.0, 1.1), (2, 0.32 * bright, 2.2), (3, 0.12 * bright, 3.6), (4.02, 0.05, 6.0)):
        y += amp * np.sin(2 * np.pi * f * k * t) * np.exp(-t * dk)
    y *= np.clip(t / 0.012, 0, 1)
    return fade(lp(y, 3500) * 0.22, 0.002, 0.3)


def glass(f, d=2.4):
    t = tt(d)
    y = np.zeros_like(t)
    for ratio, amp, dk in ((1, 1.0, 1.4), (2.01, 0.35, 2.4), (3.98, 0.12, 4.0)):
        y += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * dk)
    return fade(y * np.clip(t / 0.02, 0, 1) * 0.12, 0.002, 0.3)


def soft_thud(f=72, d=0.45, paper=0.5):
    t = tt(d)
    y = np.sin(2 * np.pi * (f * t + 18 * (1 - np.exp(-t * 25)) / 25)) * np.exp(-t * 11)
    y += paper * bp(noise(d), 300, 2400) * np.exp(-t * 38) * 0.6
    return fade(lp(y, 1800) * 0.7, 0.001, 0.05)


def air(d, f0, f1, gain=0.25):
    x = noise(d)
    u = np.linspace(0, 1, len(x))
    y = np.zeros_like(x)
    seg = 2400
    for i in range(0, len(x), seg):
        fc = f0 * (f1 / f0) ** u[i]
        y[i:i + seg] = bp(x[max(0, i - 600):i + seg], fc * 0.7, fc * 1.4)[-len(x[i:i + seg]):]
    env = np.sin(np.pi * u) ** 1.5
    return fade(y * env * gain, 0.01, 0.05)


def page_flip(d=0.5):
    x = noise(d)
    u = np.linspace(0, 1, len(x))
    env = np.sin(np.pi * u) ** 2 * (1 + 0.6 * np.sin(2 * np.pi * 7 * u))
    return fade(bp(x, 1500, 6000) * env * 0.05, 0.005, 0.05)


def reverb(x, secs=2.6, wet=0.3):
    n = int(secs * SR)
    t = np.arange(n) / SR
    out = x * (1 - wet)
    for ch in range(2):
        ir = lp(RNG.normal(0, 1, n) * np.exp(-t / (secs / 5)), 4500)
        ir /= np.sqrt((ir ** 2).sum())
        out[:, ch] += fftconvolve(x[:, ch], ir)[:len(x)] * wet * 1.5
    return out


# ------------------------------------------------------------------ score + sfx (english07: temptation bundling)
def tick(d=0.06):
    t = tt(d)
    y = bp(noise(d), 1800, 5200) * np.exp(-t * 140) * 0.8
    return fade(y * 0.5, 0.0005, 0.01)


def lock_click(d=0.12):
    """A small padlock snapping shut: two quick metallic ticks."""
    t = tt(d)
    y = bp(noise(d), 2500, 7500) * (np.exp(-t * 180) + 0.7 * np.exp(-np.maximum(0, t - 0.035) * 220) * (t > 0.035))
    return fade(y * 0.35, 0.0003, 0.01)


def step(d=0.16):
    """A soft footstep on a hard floor (sneaker)."""
    t = tt(d)
    y = lp(noise(d), 900) * np.exp(-t * 38) + 0.4 * np.sin(2 * np.pi * 95 * t) * np.exp(-t * 30)
    return fade(y * 0.12, 0.002, 0.04)


def rustle(d=0.9):
    """Laces pulled: soft band-passed friction bursts."""
    x = noise(d)
    u = np.linspace(0, 1, len(x))
    env = np.abs(np.sin(2 * np.pi * 3.2 * u)) ** 2 * np.sin(np.pi * u)
    return fade(bp(x, 1500, 6000) * env * 0.035, 0.01, 0.05)


def music(T, S):
    buf = np.zeros((N, 2))
    # the lock (curious) -> the idea -> the study -> picking -> the walk (settled, a little brighter)
    plan = [
        (0.0, S["s2"] + 0.4, ["D3", "A3", "E4", "F#4"], 900, 1.0),                          # Dadd9: a new rule
        (S["s2"] - 0.2, T["morph"] + 0.3, ["G2", "D3", "F#3", "B3", "A4"], 1500, 1.0),      # Gmaj9: temptation bundling
        (T["morph"] - 0.2, S["s3"] + 0.3, ["E2", "B2", "G3", "D4"], 1100, 0.9),             # Em7: the study, the boost fades
        (S["s3"] - 0.2, T["unlock"] + 0.2, ["A2", "E3", "C#4", "B3"], 1500, 1.0),            # Aadd9: pick a treat, set the rule
        (T["unlock"], DUR + 1, ["D3", "A3", "C#4", "F#4", "E5"], 2100, 1.0),                 # Dmaj9: now playing, the walk
    ]
    for a, b, notes, cut, g in plan:
        place(buf, pad_chord(notes, b - a, cutoff=cut, gain=0.055 * g), a)
    # felt-piano notes only on beats: want + putting off, the choice, the unlock, lace up, lock-up
    for t0, nm, pan in ((T["want"] + 0.1, "D5", -0.25), (T["off"] + 0.1, "A4", -0.25), (T["choose"], "F#5", 0.2),
                        (T["unlock"] + 0.05, "D5", 0.2), (T["unlock"] + 0.3, "A5", 0.2), (T["laceB"], "F#5", 0.1),
                        (T["lockA"] + 0.1, "F#5", 0.1), (T["lockA"] + 0.5, "D6", -0.1)):
        place(buf, ep_note(hz(nm), 3.0), t0, 0.8, pan)
    return buf


def sfx(T, S):
    buf = np.zeros((N, 2))
    place(buf, lock_click(), T["lock"], 0.8, 0.1)                                   # the lock snaps onto Play
    for k in range(3):                                                               # the lock jiggles (no play)
        place(buf, tick(), T["tapTry"] + 0.06 + k * 0.13, 0.35, 0.1)
    for a in (T["tile1"], T["tile2"], T["tile3"], T["choose"]):                     # thumb taps on the tiles
        place(buf, tick(), a, 0.4, 0.15)
    place(buf, step(), T["stepA"] + 0.3, 0.9, 0.2); place(buf, step(), T["stepA"] + 0.85, 0.9, 0.25)   # stepping into the shoes
    place(buf, lock_click(), T["unlock"], 0.6, 0.25)                                 # unlock
    place(buf, glass(hz("A5"), 1.2), T["unlock"] + 0.08, 0.22, 0.25)
    place(buf, rustle(T["laceB"] - T["laceA"] - 0.4), T["laceA"] + 0.35, 0.9, 0.2)  # lacing up
    # footsteps on the walk: one per half stride (0.31 m) at the scene's walking speed
    v, r = 0.26, 0.6
    def dist(t):
        d = t - T["walkA"]
        return 0 if d <= 0 else v * (d * d / (2 * r) if d < r else d - r / 2)
    k, t = 1, T["walkA"]
    while t < DUR - 0.2:
        while dist(t) < k * 0.31 and t < DUR:
            t += 0.01
        if t < DUR - 0.2:
            place(buf, step(), t, 0.7, 0.3 if k % 2 else 0.15)
        k += 1
    return buf


def duck_env(narr):
    env = np.convolve(np.abs(narr), np.ones(int(0.04 * SR)) / int(0.04 * SR), mode="same")
    on = (env > 0.02).astype(float)
    dec = 120
    o = on[::dec]
    sm = np.zeros_like(o)
    v = 0.0
    a_up, a_dn = 1 - math.exp(-dec / (0.08 * SR)), 1 - math.exp(-dec / (0.45 * SR))
    for i, x in enumerate(o):
        v += (x - v) * (a_up if x > v else a_dn)
        sm[i] = v
    return np.interp(np.arange(len(narr)), np.arange(len(sm)) * dec, sm)


def measure(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    txt = r.stderr
    i = txt.rfind("Integrated loudness:")
    lufs = float(txt[i:].split("I:")[1].split("LUFS")[0])
    j = txt.rfind("True peak:")
    tp = float(txt[j:].split("Peak:")[1].split("dBFS")[0])
    return lufs, tp


def main():
    tl, T, S = load()
    narr, sr = sf.read(os.path.join(GEN, "narration.wav"), dtype="float64")
    assert sr == SR
    narr = narr[:N] if len(narr) >= N else np.pad(narr, (0, N - len(narr)))
    mus = reverb(music(T, S), 3.0, 0.35)
    fx = reverb(sfx(T, S), 1.4, 0.2)
    duck = duck_env(narr)
    gain_duck = 10 ** (-8 * duck / 20)                     # music -8 dB under the voice
    bed = mus * gain_duck[:, None] + fx * (10 ** (-3 * duck / 20))[:, None]
    tail = np.ones(N)
    a = int(29.2 * SR)
    tail[a:] = np.linspace(1, 0, N - a) ** 1.5
    bed *= tail[:, None]
    head = np.clip(np.arange(N) / (0.02 * SR), 0, 1)     # 20 ms fade-in, no click on frame 0
    bed *= head[:, None]
    voice = hp(np.stack([narr, narr], 1), 75)
    mix = voice + bed * BED_GAIN
    tmp = os.path.join(GEN, "_mix_tmp.wav")
    sf.write(tmp, mix.astype(np.float32), SR, subtype="FLOAT")
    lufs, _ = measure(tmp)
    g = 10 ** ((-16.0 - lufs) / 20)
    mix *= g
    thr, ceil = 10 ** (-4.0 / 20), 10 ** (-1.5 / 20)
    over = np.abs(mix) > thr
    mix[over] = np.sign(mix[over]) * (thr + (ceil - thr) * np.tanh((np.abs(mix[over]) - thr) / (ceil - thr)))
    out = os.path.join(GEN, "mix.wav")
    sf.write(out, mix.astype(np.float32), SR, subtype="FLOAT")
    # stems for QA: voice-only and bed-only at the same master gain
    sf.write(os.path.join(GEN, "_voice_stem.wav"), (voice * g).astype(np.float32), SR, subtype="FLOAT")
    sf.write(os.path.join(GEN, "_bed_stem.wav"), (bed * BED_GAIN * g).astype(np.float32), SR, subtype="FLOAT")
    os.remove(tmp)
    lufs2, tp2 = measure(out)
    lv, _ = measure(os.path.join(GEN, "_voice_stem.wav"))
    lb, _ = measure(os.path.join(GEN, "_bed_stem.wav"))
    stats = dict(integrated_lufs=round(lufs2, 2), true_peak_dbtp=round(tp2, 2), sample_peak=round(float(np.abs(mix).max()), 4),
                 limited_samples=int(over.sum()), voice_stem_lufs=round(lv, 2), bed_stem_lufs=round(lb, 2),
                 voice_minus_bed_db=round(lv - lb, 2), music_duck_db=-8, master_gain_db=round(20 * math.log10(g), 2))
    with open(os.path.join(GEN, "audio_stats.json"), "w") as fh:
        json.dump(stats, fh, indent=2)
    print(json.dumps(stats))


if __name__ == "__main__":
    main()
