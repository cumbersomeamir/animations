"""30 s soundtrack: Kokoro narration placed per audio/script.json + original quiet felt-piano/glass music,
light-table hum/starter clicks, loupe clacks, paper glides, pen strokes for drawn lines, label ticks.
Synthesis helpers reused from this app's education/pilot-01/audio/build_audio.py. Loudness: two-pass loudnorm to -15 LUFS, TP -1.5.
Outputs build/vo.wav, build/mix_raw.wav, build/mix.wav (48 kHz stereo, exactly 30 s)."""
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
    src = ROOT / f"audio/narration/{s['id']}.wav"; tmp = ROOT / f"build/{s['id']}_48.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=90", "-ar", "48000", "-ac", "1", str(tmp)], check=True)
    x = readwav(tmp); at(V, s["start"], x / (np.abs(x).max() + 1e-9) * 0.85)
writewav(ROOT / "build/vo.wav", V)
t = np.arange(N) / SR
M = np.zeros(N); S = np.zeros(N)
hum = (np.sin(2 * np.pi * 100 * t) + 0.35 * np.sin(2 * np.pi * 200 * t) + 0.12 * np.sin(2 * np.pi * 300 * t)) * 0.008 * np.clip((t - 0.15) / 0.4, 0, 1)
S += hum
for x_, g in [(0.12, 0.3), (0.18, 0.16), (0.26, 0.22)]: at(S, x_, B.click(3200, 0.02, 1.0), g)
for x_ in CUES["land"]: at(S, x_, B.click(2600, 0.04, 1.0), 0.28); at(S, x_ + 0.004, B.bell(3400, 0.3), 0.12)
for x_, d in CUES["glide"]: at(S, x_, B.sweep_noise(d, 1600, 4000, q=1.6), 0.05)
for x_, d in CUES["pen"]: at(S, x_, B.sweep_noise(d, 3000, 5200, q=3.0) * (0.6 + 0.4 * np.sin(np.linspace(0, 40, int(d * SR)))), 0.035)
for x_ in CUES["tick"]: at(S, x_, B.click(5200, 0.015, 1.0), 0.14)
# quiet felt piano (D major / B minor), glass bells on reveals
prog = [(0.4, [62, 69, 74]), (4.2, [59, 66, 71]), (8.0, [55, 62, 67]), (11.8, [57, 64, 69]), (15.6, [62, 66, 74]), (19.4, [59, 62, 66]), (23.2, [55, 59, 67]), (26.6, [57, 61, 64]), (28.6, [62, 66, 69])]
for t0, ch in prog:
    for j, m in enumerate(ch):
        at(M, t0 + j * 0.42, B.pluck(B.midi(m), 2.2, 0.35), 0.42)
    at(M, t0, B.pluck(B.midi(ch[0] - 12), 2.4, 0.25), 0.3)
    at(M, t0, B.pad([B.midi(n) for n in ch], 4.0, a=1.0, r=1.2), 0.8)
for x_, f in CUES["bell"]: at(M, x_, B.bell(f, 1.4), 0.2)
at(M, 28.9, B.bell(B.midi(86), 1.1), 0.25)
act = np.convolve((np.abs(V) > 0.02).astype(float), np.ones(9600) / 9600, mode="same")
M *= 1 - 0.68 * np.clip(act * 3, 0, 1)      # ~10 dB under voice
mix = V + M * 0.8 + S
fade = np.minimum(1, t / 0.02) * np.clip((N - np.arange(N)) / (0.6 * SR), 0, 1)
mix = np.stack([mix * fade, mix * fade], 1)
mix *= 0.5 / np.abs(mix).max()
writewav(ROOT / "build/mix_raw.wav", mix)
# two-pass loudnorm (linear) to -15 LUFS / TP -1.5
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(ROOT / "build/mix_raw.wav"), "-af", "loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
af = f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(ROOT / "build/mix_raw.wav"), "-af", af + ",aresample=48000", "-ac", "2", "-t", "30", str(ROOT / "build/mix.wav")], check=True)
print("mix done", j["input_i"], "->", "-15 target")
