"""30 s soundtrack for english-17 #01 (Stephanie Kwolek and Kevlar) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed per audio/script.json;
subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: page turns, slide swaps, hard cut,
light sweep, cut, stirring, whip, underline, spinneret and flow, zoom, chains sliding in, pull, load glow, bars growing, page turn, tag, chimes, CTA chime. Audio starts at frame 0 (first-frame rule).
Helpers from this app's education/pilot-01/audio/build_audio.py. Two-pass loudnorm to -15 LUFS / TP -1.5."""
import sys, json, wave, subprocess
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parents[2] / "education/pilot-01/audio"))
import build_audio as B
SR, DUR = 48000, 30.0
N = int(SR * DUR)
Q = json.loads((ROOT / "src/cues.json").read_text())
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
at(S, Q["sweep"], B.sweep_noise(0.7, 1600, 3600, q=1.6), 0.03)                                                  # light sweep across the portrait
at(S, Q["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, Q["cut"], B.thump(140, 80, 0.12, 0.2))                    # hard cut to the cloudy liquid
at(S, Q["cut"] + 0.1, B.sweep_noise(Q["whip"][0] - Q["cut"] - 0.2, 500, 900, q=0.8), 0.018)                     # liquid being stirred
at(S, Q["q"], B.bell(1300, 0.6), 0.07)
w0, w1 = Q["whip"]; at(S, w0 - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)                              # whip pan to the patent
at(S, Q["underline"], B.sweep_noise(0.4, 1800, 3200, q=1.8), 0.04)
at(S, Q["spinneret"] + 0.2, B.click(1500, 0.05, 1.0), 0.12); at(S, Q["spinneret"] + 0.25, B.thump(120, 70, 0.1, 0.18))
f0, f1 = Q["flow"]; at(S, f0, B.sweep_noise(f1 - f0, 1200, 2400, q=1.2), 0.035)                                 # dope flows through the holes
at(S, Q["spun"], B.bell(1500, 0.5), 0.05)
pa0, pa1 = Q["push"]; at(S, pa0, B.sweep_noise(pa1 - pa0 + 0.1, 2400, 900, q=1.6), 0.06)
z0, z1 = Q["zoom"]; at(S, z0, B.sweep_noise(z1 - z0, 600, 4200, q=1.3), 0.06)                                   # zoom inside a strand
for k, tk in enumerate(Q["rods"]): at(S, tk + 0.25, B.click(1900 + 70 * k, 0.015, 1.0), 0.06)                   # chains slide in side by side
at(S, Q["spaghetti"], B.thump(110, 70, 0.14, 0.22))
at(S, Q["tangle"], B.sweep_noise(0.3, 1500, 2600, q=1.8), 0.03); at(S, Q["strike"], B.click(2600, 0.03, 1.0), 0.12)
pb0, pb1 = Q["push2"]; at(S, pb0, B.sweep_noise(pb1 - pb0 + 0.1, 2400, 900, q=1.6), 0.06)
at(S, Q["pull"], B.thump(90, 55, 0.18, 0.3)); at(S, Q["pull"], B.sweep_noise(0.45, 300, 700, q=1.0), 0.04)       # pull
at(S, Q["share"], B.sweep_noise(0.5, 1500, 3200, q=1.8), 0.04); at(S, Q["share"] + 0.3, B.bell(B.midi(81), 0.8), 0.06)
at(S, Q["swap"], B.sweep_noise(0.35, 2600, 1200, q=2.0), 0.05)
g0, g1 = Q["grow"]
for k in range(5): at(S, g0 + (g1 - g0) * k / 5, B.click(2000 + 120 * k, 0.015, 1.0), 0.07)                      # Kevlar bar grows 1x -> 5x
at(S, Q["five"], B.thump(120, 60, 0.14, 0.28))
t0_, t1_ = Q["turn"]; at(S, t0_, B.sweep_noise(t1_ - t0_ + 0.1, 900, 3800, q=1.3), 0.09)                       # page turn
at(S, Q["strong"], B.thump(120, 60, 0.14, 0.22)); at(S, Q["bulletproof"], B.thump(100, 60, 0.14, 0.2))
at(S, Q["tag"], B.click(2200, 0.04, 1.0), 0.14); at(S, Q["tag"] + 0.4, B.bell(B.midi(86), 1.0), 0.15)
c_0, c_1 = Q["cta"]; at(S, c_0, B.sweep_noise(0.4, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
for t0, ch, dur in [(0.0, [50, 57, 62], 3.7), (3.4, [53, 60, 65], 3.3), (6.45, [52, 59, 64], 4.6), (10.85, [55, 62, 67], 5.5), (16.2, [57, 64, 69], 4.7), (20.75, [55, 62, 69], 6.0), (26.7, [52, 59, 64, 71], 3.3)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=0.6, r=1.4), 0.9)
for x_, m in [(0.3, 74), (3.6, 79), (6.6, 71), (9.9, 76), (11.2, 74), (13.4, 79), (16.6, 81), (19.2, 83), (21.2, 74), (23.7, 76), (27.3, 76)]:
    at(M, x_, B.pluck(B.midi(m), 2.0, 0.3), 0.2)
at(M, Q["cta"][1], B.bell(B.midi(88), 1.4), 0.22)
act = np.convolve((np.abs(V) > 0.02).astype(float), np.ones(9600) / 9600, mode="same")
M *= 1 - 0.6 * np.clip(act * 3, 0, 1)
mix = V + M * 0.7 + S
fade = np.minimum(1, t / 0.02) * np.clip((N - np.arange(N)) / (0.5 * SR), 0, 1)
mix = np.stack([mix * fade, mix * fade], 1); mix *= 0.5 / np.abs(mix).max()
writewav(ROOT / "build/mix_raw.wav", mix)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(ROOT / "build/mix_raw.wav"), "-af", "loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
af = f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(ROOT / "build/mix_raw.wav"), "-af", af + ",aresample=48000", "-ac", "2", "-t", "30", str(ROOT / "build/mix.wav")], check=True)
print("mix done", j["input_i"])
