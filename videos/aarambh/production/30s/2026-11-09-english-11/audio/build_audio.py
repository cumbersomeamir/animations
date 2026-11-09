"""30 s soundtrack for english-11 #01 (Gideon Sundback) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed per audio/script.json;
subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: page turns, slide swaps, hard cut,
loupe landings, zipper closing, card, stamps, underlines, figure prints, rows meshing, arrows, zipper opening tooth by tooth, lesson steps, chimes, CTA chime.
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
for x_, g in [(0.08, 0.25), (0.14, 0.15), (0.2, 0.2)]: at(S, x_, B.click(3200, 0.02, 1.0), g)          # table lights flicker on
for a, b in Q["turn"]: at(S, a, B.sweep_noise(b - a + 0.1, 900, 3800, q=1.3), 0.09)
for x_ in Q["swap"]: at(S, x_, B.sweep_noise(0.5, 2500, 1200, q=2.5), 0.06); at(S, x_ + 0.5, B.click(2400, 0.04, 1.0), 0.28)
for x_ in Q["cut"]: at(S, x_, B.click(3000, 0.025, 1.0), 0.32); at(S, x_, B.thump(140, 80, 0.12, 0.22))
for x_ in Q["land"]: at(S, x_, B.click(2600, 0.04, 1.0), 0.24); at(S, x_ + 0.004, B.bell(3400, 0.3), 0.08)
z0, z1 = Q["zip"]                                                                                                # hook: zipper closing (soft rising zip + teeth ticks)
at(S, z0 + 0.05, B.sweep_noise(z1 - z0 - 0.1, 1800, 4200, q=1.4), 0.03)
for k in range(int((z1 - z0) / 0.16)): at(S, z0 + 0.1 + k * 0.16, B.click(3600, 0.012, 1.0), 0.05)
at(S, Q["plate"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.05); at(S, Q["judson"], B.click(1800, 0.05, 1.0), 0.14)
for x_ in Q["stamp"]: at(S, x_, B.thump(120, 60, 0.16, 0.4))
for x_ in Q["underline"]: at(S, x_, B.sweep_noise(0.3, 1800, 3200, q=1.8), 0.04)
for x_ in Q["figs"]: at(S, x_ + 0.3, B.click(1800, 0.05, 1.0), 0.16)                                            # figure prints laid down
at(S, Q["mesh"] + 0.5, B.click(3000, 0.03, 1.0), 0.18)                                                          # rows mesh
at(S, Q["arrows"], B.sweep_noise(0.6, 1200, 2600, q=1.5), 0.04)
for x_ in Q["label"]: at(S, x_, B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
p0, p1 = Q["pull"]; at(S, p0, B.sweep_noise(p1 - p0, 4200, 1600, q=1.4), 0.028)                               # demo: zipper opening
for x_ in Q["ticks"]: at(S, x_, B.click(3300, 0.01, 1.0), 0.06)                                               # tooth by tooth
for x_ in Q["steps"]: at(S, x_, B.click(2600, 0.03, 1.0), 0.14)
at(S, Q["prompt"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
for t0, ch, dur in [(0.2, [52, 59, 64], 4.4), (4.3, [53, 60, 65], 6.6), (10.9, [55, 62, 67], 6.0), (16.9, [57, 64, 69], 4.3), (21.1, [52, 59, 66], 5.0), (26.1, [52, 59, 64, 71], 3.9)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=1.4, r=1.6), 0.9)
for x_, m in [(0.6, 76), (4.6, 71), (7.3, 74), (11.2, 79), (14.1, 76), (17.1, 81), (21.4, 74), (24.2, 79), (26.8, 83), (28.7, 76)]:
    at(M, x_, B.pluck(B.midi(m), 2.0, 0.3), 0.2)
at(M, Q["ok"], B.bell(B.midi(86), 1.2), 0.2); at(M, Q["cta"], B.bell(B.midi(88), 1.4), 0.22)
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
