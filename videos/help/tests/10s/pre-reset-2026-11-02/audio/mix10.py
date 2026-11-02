"""10 s soundtrack: Kokoro narration + original plucked cue + percussion/gesture SFX (reuses synth primitives
from education/pilot-01/audio/mix.py). Output build/mix.wav: 48 kHz stereo, exactly 480000 samples, -16 LUFS / -2 dBTP."""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np
R = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(R.parents[2] / "education/pilot-01/audio"))
import mix as m  # noqa: E402  (synth primitives: mallet, pad, felt_bass, s_* sfx, place, fft_filter)
SR, N = 48000, 480000
T = json.loads((R / "src/timing.json").read_text()); PH = json.loads((R / "audio/voice/phrases.json").read_text())["phrases"]
def rd(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ar", str(SR), "-ac", "1", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, "<i2").astype(np.float32) / 32768
v = np.zeros(N, np.float32)
for st, ph in zip(T["voiceStarts"], PH):
    x = rd(R / ph["file"]); s = int(st * SR); v[s:s + len(x)] += x[: N - s]
mus = np.zeros((2, N), np.float32); sfx = np.zeros((2, N), np.float32)
beat = 60 / 84; e8 = beat / 2
secs = [(0, 2.0, [("D", 4), ("F#", 4), ("A", 4)], ("D", 2)), (2.0, 4.0, [("B", 3), ("D", 4), ("F#", 4)], ("B", 1)),
        (4.0, 6.0, [("G", 3), ("B", 3), ("D", 4)], ("G", 1)), (6.0, 10.0, [("D", 4), ("F#", 4), ("A", 4)], ("D", 2))]
for a, b, ch, bs in secs:
    m.place(mus, m.felt_bass(m.hz(*bs), b - a + 0.3), a, 0.16)
    m.place(mus, m.pad([m.hz(*n) for n in ch], b - a + 0.8, a=0.3, r=0.8), a, 0.08)
    k = int(np.ceil(a / e8))
    while k * e8 < b - 0.02 and k * e8 < 9.0:
        n, o = ch[[0, 2, 1, 2][k % 4]]; m.place(mus, m.mallet(m.hz(n, o + 1), 0.8, 0.8 if k % 2 == 0 else 0.55), k * e8, 0.07, pan=(-0.3 if k % 2 else 0.3)); k += 1
fade = np.ones(N, np.float32); fade[-int(0.9 * SR):] = np.linspace(1, 0, int(0.9 * SR)) ** 1.5; mus *= fade
# percussion-first accents + gesture SFX on the picture's cue times
clap = lambda: m.s_click(0.05, 5000) * 2.0 + m.s_thump(380, 0.06, 0.2)[: int(0.05 * SR)]
for t, fn, gn, pn in [(0.15, lambda: m.s_paper(0.08), 0.10, -0.3), (0.75, lambda: m.s_whoosh(0.4, 600, 1800, 1.0), 0.06, 0),
                      (1.15, clap, 0.20, 0.2), (1.2, lambda: m.s_glide(420, 330, 0.3, 0.05, 6), 0.06, 0.2),
                      (2.15, clap, 0.20, -0.3), (2.95, clap, 0.18, 0.3), (2.2, lambda: m.s_whoosh(0.3, 1500, 500, 0.9), 0.05, 0),
                      (3.4, lambda: m.s_thump(180, 0.12, 0.3), 0.10, -0.3), (4.05, lambda: m.s_whoosh(0.45, 400, 2000, 1.0), 0.08, -0.2),
                      (4.6, lambda: m.s_paper(0.08), 0.10, -0.2), (5.9, lambda: m.s_paper(0.12), 0.12, 0.3), (5.95, lambda: m.s_thump(120, 0.3, 0.4), 0.18, 0.1),
                      (6.0, lambda: m.s_tick(1568, 0.4), 0.14, 0), (6.07, lambda: m.s_tick(2093, 0.3), 0.07, 0), (8.5, m.s_chime, 0.06, 0)]:
    m.place(sfx, fn(), t, gn, pn)
win = int(0.03 * SR); env = np.convolve(np.abs(v), np.ones(win) / win, "same"); act = np.convolve((env > 0.01).astype(np.float32), np.ones(int(.18 * SR)) / int(.18 * SR), "same")
mix = np.stack([v, v]) * 0.92 + mus * (1 - 0.5 * np.clip(act * 1.5, 0, 1)) * 0.75 + sfx
mix = mix / (np.abs(mix).max() + 1e-9) * 0.7
B = R / "build"; B.mkdir(exist_ok=True); pre = B / "mix_pre.wav"
with wave.open(str(pre), "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix.T * 32767).astype("<i2").tobytes())
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(pre), "-af", "loudnorm=I=-16:TP=-2.0:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1])
af = (f"loudnorm=I=-16:TP=-2.0:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000,alimiter=limit=0.79:level=false,atrim=end_sample={N},apad=whole_len={N}")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(pre), "-af", af, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(B / "mix.wav")], check=True)
print("ok", js["input_i"])
