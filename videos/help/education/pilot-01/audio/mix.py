"""Build the complete soundtrack for Education Pilot 01 (all original, code-generated).

  * Tally's voice: committed Piper takes (audio/generated/voice) -> FFmpeg rubberband
    pitch -1 semitone with formants preserved + gentle EQ (character timbre).
  * Music: original 96 BPM cue in D major composed here (mallet arpeggio, felt bass, pad);
    chord changes land on the shot boundaries from src/timeline.json.
  * SFX: synthesized from noise/sine primitives, placed on the same cue times the
    3D scene uses (src/timeline.json "cues").
  * Ducking, two-pass EBU R128 loudness normalisation (-16 LUFS, -2 dBTP target for AAC headroom).
  * Writes src/generated/lipsync.json (mouth openness per video frame).

Usage: python3 audio/mix.py   (numpy + ffmpeg)
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
TL = json.loads((ROOT / "src" / "timeline.json").read_text())
LINES = json.loads((ROOT / "audio" / "generated" / "voice" / "lines.json").read_text())
SR = 48000
DUR = TL["duration"]
N = int(round(DUR * SR))  # exactly 720000 samples
CUE = TL["cues"]
OUT = ROOT / "build" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(20261102)  # fixed seed: reproducible noise


def read_wav(p):
    with wave.open(str(p)) as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float32) / 32768
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return x, sr


def write_wav(p, x, sr=SR):
    x = np.atleast_2d(x)
    if x.shape[0] < x.shape[1]:
        x = x.T
    with wave.open(str(p), "wb") as w:
        w.setnchannels(x.shape[1])
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


def t2s(t):
    return int(round(t * SR))


def env_adsr(n, a=0.005, d=0.1, s=0.0, r=0.05, sr=SR):
    t = np.arange(n) / sr
    e = np.where(t < a, t / max(a, 1e-6), 1.0)
    dec = np.exp(-(t - a) / max(d, 1e-6))
    e = np.where(t >= a, s + (1 - s) * dec, e)
    rel = np.clip((n / sr - t) / max(r, 1e-6), 0, 1)
    return e * rel


def fft_filter(x, lo=None, hi=None, sr=SR):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / sr)
    m = np.ones_like(f)
    if lo:
        m *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi:
        m *= 1 / np.sqrt(1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, n=len(x)).astype(np.float32)


def sweep_noise(dur, f0, f1, q=1.2):
    """band-limited noise whose centre glides f0->f1 (chunked FFT, overlap-add)"""
    n = t2s(dur)
    out = np.zeros(n + 2048, np.float32)
    hop, win = 512, np.hanning(1024).astype(np.float32)
    for i in range(0, n, hop):
        u = i / max(1, n)
        fc = f0 * (f1 / f0) ** u
        seg = rng.standard_normal(1024).astype(np.float32) * win
        X = np.fft.rfft(seg)
        f = np.fft.rfftfreq(1024, 1 / SR)
        m = np.exp(-0.5 * (np.log(np.maximum(f, 1) / fc) / (0.35 * q)) ** 2)
        out[i:i + 1024] += np.fft.irfft(X * m, n=1024) * win
    return out[:n] / (np.abs(out[:n]).max() + 1e-9)


# ---------------------------------------------------------------- voice
def build_voice():
    v = np.zeros(N, np.float32)
    meta = []
    for m in LINES:
        src = ROOT / m["file"]
        dst = OUT / f"{m['id']}_tally.wav"
        # Tally's timbre: -1 semitone, formants preserved, warm low-mid, gentle presence, light compression
        af = ("aresample=48000,rubberband=pitch=0.9439:formant=preserved:pitchq=quality,"
              "highpass=f=85,equalizer=f=220:t=q:w=1.0:g=2.0,equalizer=f=3200:t=q:w=1.2:g=1.5,"
              "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", af, "-ac", "1", "-ar", str(SR), str(dst)], check=True)
        x, _ = read_wav(dst)
        start = t2s(TL["lines"][m["id"]])
        end = min(N, start + len(x))
        v[start:end] += x[: end - start]
        meta.append({**m, "start": TL["lines"][m["id"]], "end": round(TL["lines"][m["id"]] + len(x) / SR, 3)})
    # check no overlaps
    meta.sort(key=lambda z: z["start"])
    for a, b in zip(meta, meta[1:]):
        assert a["end"] <= b["start"], f"narration overlap {a['id']} {b['id']}"
    return v, meta


# ---------------------------------------------------------------- music
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def hz(name, octave):
    return 440.0 * 2 ** ((NOTE[name] + 12 * (octave + 1) - 69) / 12)


def mallet(f, dur=0.9, vel=1.0):
    n = t2s(dur)
    t = np.arange(n) / SR
    # marimba-like: fundamental + inharmonic overtones with faster decay
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 5.5)
         + 0.32 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 16)
         + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 34))
    click = rng.standard_normal(n).astype(np.float32) * np.exp(-t * 600) * 0.15
    x = (x + click) * np.minimum(1, t / 0.002)
    return (x * vel).astype(np.float32)


def felt_bass(f, dur):
    n = t2s(dur)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3)
    return (x * env_adsr(n, a=0.02, d=0.6, s=0.45, r=0.25)).astype(np.float32)


def pad(freqs, dur, a=0.6, r=0.8):
    n = t2s(dur)
    t = np.arange(n) / SR
    x = np.zeros(n, np.float32)
    for f in freqs:
        for det in (-0.004, 0.004):
            ff = f * (1 + det)
            x += (np.sin(2 * np.pi * ff * t) + 0.18 * np.sin(2 * np.pi * 2 * ff * t)).astype(np.float32)
    e = np.minimum(1, t / a) * np.clip((dur - t) / r, 0, 1)
    return (x * e / (2 * len(freqs))).astype(np.float32)


def place(buf, x, t, gain=1.0, pan=0.0):
    """buf: (2,N). equal-power pan -1..1"""
    s = t2s(t)
    if s >= buf.shape[1]:
        return
    e = min(buf.shape[1], s + len(x))
    if s < 0:
        x, s = x[-s:], 0
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, s:e] += x[: e - s] * gain * l * 1.4142
    buf[1, s:e] += x[: e - s] * gain * r * 1.4142


def build_music():
    m = np.zeros((2, N), np.float32)
    beat = 60 / TL["bpm"]
    e8 = beat / 2
    shots = list(TL["shots"].values())
    # (start, end, chord tones (name, oct), bass, density)
    sections = [
        (shots[0][0], shots[0][1], [("D", 4), ("F#", 4), ("A", 4), ("D", 5)], ("D", 2), 1.0),
        (shots[1][0], shots[1][1], [("B", 3), ("D", 4), ("F#", 4), ("B", 4)], ("B", 1), 1.0),
        (shots[2][0], shots[2][1], [("G", 3), ("B", 3), ("D", 4), ("F#", 4)], ("G", 1), 1.0),
        (shots[3][0], shots[3][1], [("E", 4), ("G", 4), ("B", 4), ("D", 5)], ("E", 2), 0.45),  # the open question
        (shots[4][0], TL["cues"]["musicResolve"], [("G", 3), ("B", 3), ("D", 4), ("E", 4)], ("G", 1), 0.8),
        (TL["cues"]["musicResolve"], DUR, [("D", 4), ("F#", 4), ("A", 4), ("E", 5)], ("D", 2), 0.0),
    ]
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    for si, (a, b, chord, bass, dens) in enumerate(sections):
        # bass on section start + every 2 beats
        tt = a
        while tt < b - 0.05:
            place(m, felt_bass(hz(*bass), min(2 * beat, b - tt) + 0.3), tt, 0.20)
            tt += 2 * beat
        # pad bed
        place(m, pad([hz(*n) for n in chord[:3]], (b - a) + 0.9, a=0.35, r=0.9), a, 0.10 if si != 3 else 0.14)
        # mallet arpeggio on the 8th-note grid (global grid so it stays in time across cuts)
        k0 = int(np.ceil(a / e8 - 1e-6))
        k = k0
        while k * e8 < b - 0.02:
            tt = k * e8
            idx = pattern[k % 8]
            keep = dens >= 1 or (k % 2 == 0 and dens >= 0.4) or (k % 4 == 0)
            if keep:
                vel = 0.85 if k % 2 == 0 else 0.6
                name, octv = chord[idx]
                place(m, mallet(hz(name, octv + 1), 0.8, vel), tt, 0.085, pan=(-0.35 if idx % 2 else 0.35))
            k += 1
    # resolution: final ringing chord + high sparkle
    r = CUE["musicResolve"]
    for i, (n, o) in enumerate([("D", 4), ("A", 4), ("F#", 5), ("E", 5)]):
        place(m, mallet(hz(n, o + 1), 1.4, 0.8), r + i * 0.06, 0.08, pan=-0.3 + i * 0.2)
    m = np.stack([fft_filter(m[0], lo=45, hi=9000), fft_filter(m[1], lo=45, hi=9000)])
    # 2.0 s fade-out tail kept inside the 15 s; tiny fade-in
    fade = np.ones(N, np.float32)
    fade[: t2s(0.02)] = np.linspace(0, 1, t2s(0.02))
    fo = t2s(1.1)
    fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
    return m * fade


# ---------------------------------------------------------------- sfx
def s_tick(f=1568, dur=0.35):
    n = t2s(dur); t = np.arange(n) / SR
    return ((np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 20)) * np.exp(-t * 11)).astype(np.float32)


def s_thump(f=95, dur=0.25, noise=0.4):
    n = t2s(dur); t = np.arange(n) / SR
    fs = f * (1 + 0.6 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(fs) / SR
    nz = fft_filter(rng.standard_normal(n).astype(np.float32), hi=1800) * np.exp(-t * 60) * noise
    return ((np.sin(ph) * np.exp(-t * 18)) + nz).astype(np.float32)


def s_click(dur=0.05, hi=6000):
    n = t2s(dur); t = np.arange(n) / SR
    return (fft_filter(rng.standard_normal(n).astype(np.float32), lo=1500, hi=hi) * np.exp(-t * 180)).astype(np.float32)


def s_whoosh(dur, f0, f1, q=1.0):
    n = t2s(dur); t = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    return (sweep_noise(dur, f0, f1, q) * e).astype(np.float32)


def s_glide(f0, f1, dur, vib=0.0, decay=4.0):
    n = t2s(dur); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur) * (1 + vib * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 4))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.minimum(1, t / 0.01) * np.exp(-t * decay)).astype(np.float32)


def s_paper(dur=0.12):
    n = t2s(dur); t = np.arange(n) / SR
    x = fft_filter(rng.standard_normal(n).astype(np.float32), lo=1800, hi=9000)
    return (x * np.exp(-t * 35) * (1 + 0.6 * np.sin(2 * np.pi * 70 * t))).astype(np.float32)


def s_beep(f, dur=0.07):
    n = t2s(dur); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * env_adsr(n, a=0.003, d=1, s=1, r=0.015)).astype(np.float32)


def s_chime():
    out = np.zeros(t2s(1.2), np.float32)
    for i, f in enumerate([hz("A", 5), hz("D", 6), hz("F#", 6)]):
        x = s_tick(f, 1.0) * 0.6
        s = t2s(i * 0.07)
        out[s:s + len(x)] += x[: len(out) - s]
    return out


def build_sfx():
    s = np.zeros((2, N), np.float32)
    c = CUE
    # REC start beep
    place(s, s_beep(1760, 0.06), 0.04, 0.10, -0.4); place(s, s_beep(2350, 0.06), 0.12, 0.08, -0.4)
    # courier footsteps
    for tt in (c["courierStep1"], c["courierStep2"], c["courierStep2"] + 0.3):
        place(s, s_thump(140, 0.12, 0.8), tt, 0.10, -0.1)
    place(s, s_whoosh(1.2, 300, 1400, 1.2), c["camWhooshA"] - 0.1, 0.10, 0.3)
    # handoff: cardboard settles into recipient's hands
    place(s, s_thump(160, 0.2, 1.0), c["transferEnd"], 0.22, -0.2)
    # everything outside the frame recedes
    place(s, s_glide(180, 90, 0.6, 0, 5) * 0.7, c["dimOn"], 0.16, 0)
    place(s, s_whoosh(0.5, 2500, 600, 0.8), c["dimOn"], 0.06, 0)
    place(s, s_tick(1568), c["inFrameTick"], 0.16, -0.25)
    place(s, s_tick(2093, 0.25), c["inFrameTick"] + 0.07, 0.08, -0.25)
    # release + hop + satchel rustle
    place(s, s_glide(520, 700, 0.35, 0.05, 6), c["release"], 0.08, -0.3)
    place(s, s_thump(120, 0.15, 0.6), 5.95, 0.14, 0.2)
    for k in range(3):
        place(s, s_paper(0.07), c["satchel"] + k * 0.05, 0.07, 0.35)
    # toss, snap, page flips, tick
    toss = c["tagSnap"] - 0.18
    place(s, s_whoosh(0.22, 700, 2600, 0.8), toss, 0.10, 0.2)
    place(s, s_click(0.05) * 2.2 + s_thump(320, 0.05, 0.2)[: t2s(0.05)], c["tagSnap"], 0.22, 0.1)
    for k in range(2):
        place(s, s_paper(0.1), c["tagFlip"] + k * 0.16, 0.12, 0.1)
    place(s, s_tick(1760), c["tagTick"], 0.16, 0.15)
    # pin falls, lands, tick
    place(s, s_glide(1400, 520, 0.36, 0, 1.5), c["pinDrop"], 0.05, -0.45)
    place(s, s_thump(210, 0.18, 0.5) + 0.0, c["pinLand"], 0.22, -0.45)
    place(s, s_glide(300, 620, 0.12, 0, 12), c["pinLand"], 0.06, -0.45)
    place(s, s_tick(1976), c["pinTick"], 0.16, -0.35)
    # clip ends: stop beep + shutter slide
    place(s, s_beep(1320, 0.07), c["recOff"], 0.10, 0); place(s, s_beep(880, 0.11), c["recOff"] + 0.09, 0.10, 0)
    place(s, s_whoosh(0.32, 3000, 900, 0.7), c["shutterDown"], 0.10, 0)
    place(s, s_click(0.04), c["shutterDown"] + 0.34, 0.18, 0)
    place(s, s_whoosh(1.4, 250, 1800, 1.3), c["craneWhoosh"], 0.11, 0)
    place(s, s_thump(85, 0.3, 0.7), c["doorClose"], 0.24, -0.3)
    place(s, s_click(0.03, 4000), c["doorClose"] + 0.02, 0.08, -0.3)
    # the question pops up (springy), cards flutter, head scratch
    place(s, s_glide(260, 620, 0.42, 0.06, 3.5), c["questionPop"] - 0.12, 0.16, -0.1)
    place(s, s_thump(180, 0.12, 0.2), c["questionPop"] + 0.18, 0.10, -0.1)
    for k in range(2):
        for j in range(3):
            place(s, s_paper(0.06), c["cardsFloat"] + k * 0.25 + j * 0.05, 0.06, (-0.5 if k == 0 else 0.5))
    for j in range(5):
        place(s, s_paper(0.04), c["headScratch"] + 0.08 + j * 0.11, 0.035, 0.4)
    # story strip: whoosh + film rattle, clip slots in, tap, wobble, chime
    place(s, s_whoosh(0.6, 400, 2400, 1.0), c["stripWhoosh"], 0.12, 0)
    for j in range(10):
        place(s, s_click(0.02, 5000), c["stripWhoosh"] + 0.12 + j * 0.035, 0.05, -0.2 + j * 0.04)
    place(s, s_whoosh(0.45, 1500, 500, 0.9), c["clipSlot"] - 0.45, 0.07, 0)
    place(s, s_thump(150, 0.2, 0.8), c["clipSlot"], 0.22, 0)
    place(s, s_tick(1568, 0.3), c["clipSlot"] + 0.05, 0.12, 0)
    place(s, s_click(0.03, 3500) * 2, c["tapClip"], 0.12, 0)
    place(s, s_thump(420, 0.08, 0.1), c["wobble"], 0.08, -0.4); place(s, s_thump(380, 0.08, 0.1), c["wobble"] + 0.12, 0.08, 0.4)
    place(s, s_chime(), c["signature"], 0.07, 0)
    return s


# ---------------------------------------------------------------- mix
def main():
    voice, meta = build_voice()
    music = build_music()
    sfx = build_sfx()
    # duck music under voice (smoothed envelope, -6 dB while speaking)
    win = t2s(0.03)
    env = np.convolve(np.abs(voice), np.ones(win) / win, mode="same")
    active = (env > 0.01).astype(np.float32)
    k = t2s(0.18)
    active = np.convolve(active, np.ones(k) / k, mode="same")
    duck = 1 - 0.5 * np.clip(active * 1.5, 0, 1)
    vo = np.stack([voice, voice]) * 0.92
    mix = vo + music * duck * 0.72 + sfx
    write_wav(OUT / "voice.wav", vo)
    write_wav(OUT / "music.wav", music)
    write_wav(OUT / "sfx.wav", sfx)
    pre = OUT / "mix_pre.wav"
    mix = mix / (np.abs(mix).max() + 1e-9) * 0.7
    write_wav(pre, mix)
    # two-pass loudnorm to -16 LUFS / -1.5 dBTP, then hard-trim to exactly N samples
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(pre), "-af", "loudnorm=I=-16:TP=-2.0:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    js = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    af = (f"loudnorm=I=-16:TP=-2.0:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,"
          f"aresample=48000,alimiter=limit=0.79:attack=3:release=50:level=false,atrim=end_sample={N},apad=whole_len={N}")
    final = OUT / "mix.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(pre), "-af", af, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(final)], check=True)
    x, _ = read_wav(final)
    # lip-sync curve from Tally's processed voice (per video frame)
    fps = TL["fps"]
    nf = int(round(DUR * fps))
    hop = SR // fps
    rms = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(nf)])
    lip = np.clip((rms - 0.012) / 0.11, 0, 1) ** 0.7
    sm = np.convolve(lip, [0.25, 0.5, 0.25], mode="same")
    gen = ROOT / "src" / "generated"
    gen.mkdir(parents=True, exist_ok=True)
    (gen / "lipsync.json").write_text(json.dumps([round(float(v), 3) for v in sm]))
    (gen / "lines.json").write_text(json.dumps(meta, indent=2))
    print(json.dumps({"lines": [(m["id"], m["start"], m["end"]) for m in meta], "loudnorm_pass1": {k: js[k] for k in ("input_i", "input_tp")},
                      "final_samples": len(x) if x.ndim == 1 else len(x), "final_seconds": len(x) / SR}, indent=1))


if __name__ == "__main__":
    main()
