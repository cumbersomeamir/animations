"""30 s soundtrack for production #02: Kokoro narration placed per audio/script.json + original quiet felt-piano/glass music,
light-table hum/starter clicks, page-turn swishes, slide-swap glass scrape + clack, hard-cut click, stamp thumps, pen strokes, ticks, bells.
Synthesis helpers reused from this app's education/pilot-01/audio/build_audio.py. Two-pass loudnorm to -15 LUFS / TP -1.5.
Outputs build/mix.wav (48 kHz stereo, exactly 30 s)."""
import sys, json, wave, subprocess
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parents[2] / "education/pilot-01/audio"))
import build_audio as B
SR, DUR = 48000, 30.0
N = int(SR * DUR)
CUES = json.loads((ROOT / "src/cues.json").read_text())
def at(buf, t, x, g=1.0):
    i = int(round(t * SR)); m = min(len(x), N - i)
    if m > 0: buf[i:i + m] += x[:m] * g
def readwav(p):
    with wave.open(str(p)) as w: return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
def writewav(p, x):
    x = np.clip(x, -1, 1); x = x[:, None] if x.ndim == 1 else x
    with wave.open(str(p), "wb") as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
(ROOT / "build").mkdir(exist_ok=True)
V = np.zeros(N)
for s in json.loads((ROOT / "audio/script.json").read_text())["sentences"]:
    tmp = ROOT / f"build/{s['id']}_48.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(ROOT / f"audio/narration/{s['id']}.wav"), "-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=90", "-ar", "48000", "-ac", "1", str(tmp)], check=True)
    x = readwav(tmp); at(V, s["start"], x / (np.abs(x).max() + 1e-9) * 0.85)
t = np.arange(N) / SR
M = np.zeros(N); S = np.zeros(N)
S += (np.sin(2 * np.pi * 100 * t) + 0.35 * np.sin(2 * np.pi * 200 * t)) * 0.007 * np.clip((t - 0.15) / 0.4, 0, 1)
for x_, g in [(0.12, 0.3), (0.18, 0.16), (0.26, 0.22)]: at(S, x_, B.click(3200, 0.02, 1.0), g)
for x_, d in CUES["glide"]: at(S, x_, B.sweep_noise(d, 900, 3800, q=1.3), 0.09)            # page turns / pull back
for x_ in CUES["slide"]: at(S, x_, B.sweep_noise(0.5, 2500, 1200, q=2.5), 0.07); at(S, x_ + 0.52, B.click(2400, 0.04, 1.0), 0.3); at(S, x_ + 0.525, B.bell(3300, 0.25), 0.1)
for x_ in CUES["cut"]: at(S, x_, B.click(3000, 0.025, 1.0), 0.35); at(S, x_, B.thump(140, 80, 0.12, 0.25))
for x_ in CUES["land"]: at(S, x_, B.click(2600, 0.04, 1.0), 0.26); at(S, x_ + 0.004, B.bell(3400, 0.3), 0.1)
for x_ in CUES["stamp"]: at(S, x_, B.thump(120, 60, 0.16, 0.45))
for x_, d in CUES["pen"]: at(S, x_, B.sweep_noise(d, 3000, 5200, q=3.0) * (0.6 + 0.4 * np.sin(np.linspace(0, 40, int(d * SR)))), 0.03)
for x_ in CUES["tick"]: at(S, x_, B.click(5200, 0.015, 1.0), 0.14)
prog = [(0.4, [64, 67, 71]), (4.0, [60, 64, 67]), (7.6, [62, 65, 69]), (11.2, [59, 62, 67]), (14.8, [57, 60, 64]), (18.4, [65, 69, 72]), (22.0, [60, 64, 67]), (25.6, [62, 67, 71]), (28.4, [60, 64, 72])]
for t0, ch in prog:
    for j, m in enumerate(ch): at(M, t0 + j * 0.4, B.pluck(B.midi(m), 2.2, 0.35), 0.4)
    at(M, t0, B.pluck(B.midi(ch[0] - 12), 2.4, 0.25), 0.3); at(M, t0, B.pad([B.midi(n) for n in ch], 3.9, a=1.0, r=1.2), 0.8)
for x_, f in CUES["bell"]: at(M, x_, B.bell(f, 1.4), 0.2)
# music scene: a short rising motif under "even music" (original)
for j, m in enumerate([72, 76, 79, 84]): at(M, CUES["T"]["music"] + 0.1 + j * 0.16, B.pluck(B.midi(m), 1.0, 0.6), 0.35)
at(M, 28.9, B.bell(B.midi(84), 1.1), 0.25)
act = np.convolve((np.abs(V) > 0.02).astype(float), np.ones(9600) / 9600, mode="same")
M *= 1 - 0.68 * np.clip(act * 3, 0, 1)
mix = V + M * 0.8 + S
fade = np.minimum(1, t / 0.02) * np.clip((N - np.arange(N)) / (0.6 * SR), 0, 1)
mix = np.stack([mix * fade, mix * fade], 1); mix *= 0.5 / np.abs(mix).max()
writewav(ROOT / "build/mix_raw.wav", mix)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(ROOT / "build/mix_raw.wav"), "-af", "loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
af = f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(ROOT / "build/mix_raw.wav"), "-af", af + ",aresample=48000", "-ac", "2", "-t", "30", str(ROOT / "build/mix.wav")], check=True)
print("mix done", j["input_i"])
