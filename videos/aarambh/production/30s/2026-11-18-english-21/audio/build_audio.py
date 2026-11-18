"""30 s soundtrack for english-21 #01 (Vivien Thomas and the blue-baby shunt) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed per audio/script.json;
subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: page turns, slide swaps, hard cut,
light sweep, cut, soft heartbeat, warning bell, shunt growing and joining, pink chime, whip, count clicks, stamp, fading name, page turn, card chime, CTA chime. Audio starts at frame 0 (first-frame rule).
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
at(S, Q["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, Q["cut"], B.thump(140, 80, 0.12, 0.2))                    # hard cut to the circulation
for k in range(4): at(S, Q["cut"] + 0.4 + k * 0.85, B.thump(70, 45, 0.12, 0.16))                                # a soft heartbeat
at(S, Q["warn"], B.bell(700, 0.5), 0.05)                                                                        # the narrowed artery glows
g0, g1 = Q["grow"]; at(S, g0, B.sweep_noise(g1 - g0, 900, 2600, q=1.4), 0.05); at(S, g1, B.click(2200, 0.04, 1.0), 0.14)   # the shunt grows and joins
p0, p1 = Q["pink"]; at(S, p0, B.sweep_noise(p1 - p0, 1800, 3400, q=1.6), 0.025); at(S, p1 - 0.2, B.bell(B.midi(84), 1.0), 0.07)   # the baby turns pink
w0, w1 = Q["whip"]; at(S, w0 - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)                              # whip pan to his hands
c0, c1 = Q["count"]
for k in range(10): at(S, c0 + (c1 - c0) * (k / 10) ** 0.8, B.click(1900 + 70 * k, 0.012, 1.0), 0.06)          # the count runs to about 200
at(S, Q["coach"], B.sweep_noise(0.5, 1200, 2600, q=1.4), 0.04)
pa0, pa1 = Q["push"]; at(S, pa0, B.sweep_noise(pa1 - pa0 + 0.1, 2400, 900, q=1.6), 0.06)
at(S, Q["janitor"] + 0.12, B.thump(120, 60, 0.16, 0.4))                                                         # the stamp lands
pb0, pb1 = Q["push2"]; at(S, pb0, B.sweep_noise(pb1 - pb0 + 0.1, 2400, 900, q=1.6), 0.06)
at(S, Q["slot"], B.click(1500, 0.04, 1.0), 0.1); at(S, Q["gone"], B.sweep_noise(0.8, 900, 400, q=1.0), 0.035)  # his name fades from the slot
t0_, t1_ = Q["turn"]; at(S, t0_, B.sweep_noise(t1_ - t0_ + 0.1, 900, 3800, q=1.3), 0.09)                       # page turn
at(S, Q["card"], B.click(2200, 0.04, 1.0), 0.14); at(S, Q["card"] + 0.35, B.bell(B.midi(86), 1.0), 0.15)
c_0, c_1 = Q["cta"]; at(S, c_0, B.sweep_noise(0.4, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
for t0, ch, dur in [(0.0, [50, 57, 62], 5.4), (5.2, [48, 55, 60], 2.4), (7.4, [52, 59, 64], 4.7), (12.1, [53, 60, 65], 4.7), (16.7, [55, 62, 67], 2.3), (18.9, [50, 57, 62], 3.4), (22.2, [57, 64, 69], 4.6), (26.7, [52, 59, 64, 71], 3.3)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=0.6, r=1.4), 0.9)
for x_, m in [(0.3, 74), (2.9, 79), (5.4, 72), (7.6, 76), (9.9, 79), (11.6, 81), (12.5, 74), (14.6, 77), (17.1, 72), (19.2, 74), (21.2, 76), (22.8, 74), (25.0, 79), (27.3, 76)]:
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
