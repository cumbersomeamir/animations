"""10 s soundtrack: Kokoro narration (offset 0.6 s) + original procedural felt-piano/glass music,
light-table hum and click, loupe clacks, paper sweeps, label ticks. Reuses synthesis helpers from
../../../education/pilot-01/audio/build_audio.py (same app). Output build/mix.wav, 48 kHz stereo, exactly 10 s."""
import sys, wave, subprocess
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parents[2] / "education/pilot-01/audio"))
import build_audio as B
SR, N, VO0 = 48000, 480000, 0.6
def at(buf, t, x, g=1.0):
    i = int(round(t * SR)); m = min(len(x), N - i)
    if m > 0: buf[i:i + m] += x[:m] * g
(ROOT / "build").mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(ROOT / "audio/narration_kokoro.wav"), "-ar", "48000", "-ac", "1", str(ROOT / "build/vo48.wav")], check=True)
with wave.open(str(ROOT / "build/vo48.wav")) as w:
    vo = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
V = np.zeros(N); at(V, VO0, vo / (np.abs(vo).max() + 1e-9) * 0.8)
M = np.zeros(N); S = np.zeros(N)
t = np.arange(N) / SR
hum = (np.sin(2 * np.pi * 100 * t) + 0.35 * np.sin(2 * np.pi * 200 * t) + 0.15 * np.sin(2 * np.pi * 300 * t)) * 0.012
hum *= np.clip((t - 0.12) / 0.3, 0, 1); S += hum
for x_, g in [(0.12, 0.35), (0.18, 0.2), (0.24, 0.25)]: at(S, x_, B.click(3200, 0.02, 1.0), g)   # starter clicks
for x_ in (1.0, 3.05, 3.8): at(S, x_, B.click(2600, 0.04, 1.0), 0.32); at(S, x_ + 0.005, B.bell(3500, 0.3), 0.15)  # loupe on glass
for x_, d in [(0.55, 0.45), (2.75, 0.3), (3.5, 0.3), (4.75, 0.6)]: at(S, x_, B.sweep_noise(d, 1800, 4200, q=1.6), 0.07)  # paper/glide sweeps
for x_ in (1.2, VO0 + 2.3, VO0 + 3.0, VO0 + 4.0): at(S, x_, B.click(5200, 0.015, 1.0), 0.18)  # label ticks
# felt-piano + glass: D major, sparse; glass shimmer on the reveals
for x_, m in [(0.45, 62), (1.25, 69), (2.05, 66), (2.85, 74), (3.6, 73), (4.4, 71), (5.2, 69), (6.4, 62), (7.2, 66), (8.0, 69)]:
    at(M, x_, B.pluck(B.midi(m), 1.6, 0.4), 0.55); at(M, x_, B.pluck(B.midi(m - 12), 1.6, 0.3), 0.3)
at(M, 0.4, B.pad([B.midi(50), B.midi(57), B.midi(62)], 9.4, a=1.2, r=1.5), 1.0)
for x_, f in [(VO0 + 2.3, 1760), (VO0 + 3.0, 2093), (VO0 + 4.1, 2637)]: at(M, x_, B.bell(f, 1.2), 0.25)
at(M, 8.9, B.bell(B.midi(86), 1.1), 0.3)
act = np.convolve((np.abs(V) > 0.02).astype(float), np.ones(4800) / 4800, mode="same")
M *= (1 - 0.68 * np.clip(act * 3, 0, 1))  # ~10 dB duck under voice
mix = np.stack([V + M * 0.8 + S, V + M * 0.8 + S], 1)
mix *= (np.minimum(1, t / 0.02) * np.clip((N - np.arange(N)) / (0.3 * SR), 0, 1))[:, None]
mix *= 10 ** (-1.5 / 20) / np.abs(mix).max()
with wave.open(str(ROOT / "build/mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("mix ok", len(mix) / SR)
