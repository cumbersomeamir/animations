"""30 s soundtrack for english-15 #01 (Frances Oldham Kelsey and thalidomide) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed per audio/script.json;
subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: page turns, slide swaps, hard cut,
light sweep, door close, cut, underline, whip, gauge, page turn, letters, questions, stamps, timeline, scale tip, chimes, CTA chime. Audio starts at frame 0 (first-frame rule).
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
at(S, Q["sweep"], B.sweep_noise(0.7, 1600, 3600, q=1.6), 0.03)                                                  # light sweep across the bottle
at(S, Q["refuse"], B.thump(110, 60, 0.18, 0.3)); at(S, Q["refuse"] + 0.02, B.sweep_noise(0.35, 3000, 1200, q=2.0), 0.04)   # the "door" closes
at(S, Q["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, Q["cut"], B.thump(140, 80, 0.12, 0.2))                    # hard cut to the label
at(S, Q["underline"], B.sweep_noise(0.4, 1800, 3200, q=1.8), 0.04); at(S, Q["q"], B.bell(1300, 0.6), 0.07)
w0, w1 = Q["whip"]; at(S, w0 - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)                              # whip pan
at(S, Q["name"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
at(S, Q["gauge"], B.click(1800, 0.04, 1.0), 0.12); f0, f1 = Q["fill"]; at(S, f0, B.sweep_noise(f1 - f0, 600, 1100, q=2.0), 0.04)   # gauge fills a little
at(S, Q["thin"], B.thump(100, 70, 0.14, 0.22))
t0_, t1_ = Q["turn"]; at(S, t0_, B.sweep_noise(t1_ - t0_ + 0.1, 900, 3800, q=1.3), 0.09)                       # page turn
for x_ in Q["letters"]: at(S, x_ - 0.5, B.sweep_noise(0.5, 1400, 3000, q=1.6), 0.025); at(S, x_, B.click(1700, 0.04, 1.0), 0.14)   # letters arrive
for x_ in Q["asks"]: at(S, x_, B.sweep_noise(0.6, 3000, 1600, q=1.8), 0.035)                                     # questions go back
at(S, Q["stamp"], B.thump(120, 60, 0.16, 0.35))
pa0, pa1 = Q["push"]; at(S, pa0, B.sweep_noise(pa1 - pa0 + 0.1, 2400, 900, q=1.6), 0.06)
at(S, Q["line"], B.sweep_noise(0.8, 1200, 2600, q=1.6), 0.035); at(S, Q["y1961"], B.click(2400, 0.03, 1.0), 0.16)
at(S, Q["defects"], B.thump(90, 55, 0.22, 0.3)); at(S, Q["bottle"] + 0.35, B.click(1800, 0.05, 1.0), 0.14)
at(S, Q["never"], B.thump(120, 60, 0.16, 0.4))                                                                  # NEVER MARKETED stamp
pb0, pb1 = Q["push2"]; at(S, pb0, B.sweep_noise(pb1 - pb0 + 0.1, 2400, 900, q=1.6), 0.06)
at(S, Q["labels"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
p0, p1 = Q["tip"]; at(S, p0, B.sweep_noise(p1 - p0, 500, 1300, q=1.4), 0.04); at(S, p1, B.thump(110, 70, 0.14, 0.25))   # scale tips to evidence
at(S, Q["ask"], B.bell(B.midi(86), 1.0), 0.16)
c_0, c_1 = Q["cta"]; at(S, c_0, B.sweep_noise(0.4, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
for t0, ch, dur in [(0.0, [50, 57, 62], 6.0), (6.0, [53, 60, 65], 2.6), (8.7, [52, 59, 64], 3.3), (11.9, [55, 62, 67], 4.3), (16.1, [57, 64, 69], 5.6), (21.8, [55, 62, 69], 5.0), (26.7, [52, 59, 64, 71], 3.3)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=0.6, r=1.4), 0.9)
for x_, m in [(0.3, 74), (6.2, 79), (8.9, 71), (12.2, 76), (14.4, 74), (16.4, 79), (19.5, 81), (22.1, 76), (24.8, 83), (27.3, 76)]:
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
