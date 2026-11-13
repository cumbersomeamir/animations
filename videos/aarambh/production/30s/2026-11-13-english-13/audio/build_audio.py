"""30 s soundtrack for english-13 #01 (Elisha Otis, the safety brake) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed per audio/script.json;
subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: page turns, slide swaps, hard cut,
winch, axe, chop, catches, clank, whip, rope snap, crash, stamp, zoom, spring, lock, page turn, crowd, chain clicks, chimes, CTA chime.
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
for x_, g in [(0.06, 0.2), (0.12, 0.12)]: at(S, x_, B.click(3200, 0.02, 1.0), g)                            # spotlight on
r0, r1 = Q["rise"]; n = int((r1 - r0) * SR); tt_ = np.arange(n) / SR                                           # winch: soft rising hum + ratchet ticks
at(S, r0, np.sin(2 * np.pi * (90 + 30 * tt_ / (r1 - r0)) * tt_) * np.minimum(1, np.minimum(tt_ / 0.3, (r1 - r0 - tt_) / 0.3)), 0.012)
for k in range(int((r1 - r0) / 0.22)): at(S, r0 + 0.1 + k * 0.22, B.click(2200, 0.015, 1.0), 0.05)
at(S, Q["axe"], B.sweep_noise(0.5, 900, 3200, q=1.2), 0.05)                                                   # axe swing
at(S, Q["cutCable"], B.thump(180, 90, 0.12, 0.3)); at(S, Q["cutCable"], B.click(3800, 0.03, 1.0), 0.3)         # chop
at(S, Q["catch1"], B.click(2600, 0.04, 1.0), 0.28); at(S, Q["catch1"] + 0.01, B.bell(1900, 0.35), 0.06)         # catches bite
at(S, Q["held"], B.thump(120, 60, 0.18, 0.45)); at(S, Q["held"], B.click(2100, 0.05, 1.0), 0.3); at(S, Q["held"] + 0.01, B.bell(1400, 0.6), 0.08)   # clank: HELD
w0, w1 = Q["whip"]; at(S, w0 - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)                              # whip pan
at(S, Q["flaw"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
at(S, Q["fray"], B.sweep_noise(0.3, 3000, 5000, q=2.2), 0.04); at(S, Q["snap1"], B.click(4200, 0.03, 1.0), 0.3)  # rope frays, snaps
at(S, Q["crash"], B.thump(90, 45, 0.3, 0.55)); at(S, Q["crash"], B.sweep_noise(0.6, 1200, 300, q=0.9), 0.07)  # crate hits the floor
p0, p1 = Q["push"]; at(S, p0, B.sweep_noise(p1 - p0 + 0.1, 2400, 900, q=1.6), 0.06)
at(S, Q["stamp"], B.thump(120, 60, 0.16, 0.4)); at(S, Q["hl"], B.sweep_noise(0.3, 1800, 3200, q=1.8), 0.04)
z0, z1 = Q["zoomIn"]; at(S, z0, B.sweep_noise(z1 - z0 + 0.2, 400, 3000, q=1.2), 0.07)                          # zoom into the drawing
at(S, Q["tension"], B.sweep_noise(0.4, 600, 1400, q=2.5), 0.04)                                                 # rope under tension
at(S, Q["snap2"], B.click(4200, 0.03, 1.0), 0.3); at(S, Q["snap2"], B.thump(200, 120, 0.06, 0.15))              # rope snaps
at(S, Q["spring"], B.sweep_noise(0.25, 2400, 5200, q=3.0), 0.05)                                                # spring fires
at(S, Q["lock"], B.thump(130, 70, 0.14, 0.35)); at(S, Q["lock"], B.click(2400, 0.04, 1.0), 0.25); at(S, Q["lock"] + 0.01, B.bell(1700, 0.5), 0.07)
t0_, t1_ = Q["turn"]; at(S, t0_, B.sweep_noise(t1_ - t0_ + 0.1, 900, 3800, q=1.3), 0.09)                       # page turn
at(S, Q["strike"], B.sweep_noise(0.25, 2000, 3600, q=1.8), 0.05); at(S, Q["stamp2"], B.thump(120, 60, 0.16, 0.35))
at(S, Q["axe2"], B.sweep_noise(0.4, 900, 3200, q=1.2), 0.04); at(S, Q["cut2"], B.thump(170, 90, 0.1, 0.22)); at(S, Q["cut2"] + 0.1, B.click(2600, 0.03, 1.0), 0.2)
at(S, Q["brake"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
c0 = Q["cheer"]; at(S, c0, B.sweep_noise(1.6, 700, 1600, q=0.7), 0.035)                                         # crowd murmur (soft)
p20, p21 = Q["push2"]; at(S, p20, B.sweep_noise(p21 - p20 + 0.1, 2400, 900, q=1.6), 0.06)
for x_ in Q["chain"]: at(S, x_, B.click(2600, 0.03, 1.0), 0.14)
c_0, c_1 = Q["cta"]; at(S, c_0, B.sweep_noise(0.5, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
for t0, ch, dur in [(0.15, [50, 57, 62], 3.9), (4.1, [53, 60, 65], 1.0), (5.2, [52, 59, 64], 3.9), (9.1, [55, 62, 67], 6.5), (15.7, [57, 64, 69], 5.7), (21.5, [55, 62, 69], 5.2), (26.6, [52, 59, 64, 71], 3.4)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=1.2, r=1.4), 0.9)
for x_, m in [(0.4, 74), (4.4, 79), (5.6, 71), (9.4, 76), (12.6, 74), (16.0, 79), (19.0, 81), (21.8, 76), (24.6, 83), (27.3, 76)]:
    at(M, x_, B.pluck(B.midi(m), 2.0, 0.3), 0.2)
at(M, Q["chain"][2] + 0.4, B.bell(B.midi(86), 1.2), 0.18); at(M, Q["cta"][1], B.bell(B.midi(88), 1.4), 0.22)
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
