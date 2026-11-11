"""30 s soundtrack for english-12 #01 (Grace Hopper, nanoseconds) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed per audio/script.json;
subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: page turns, slide swaps, hard cut,
light pulses, ruler ticks, whip, laps, zoom, tile flips, crossing, shrink, pepper, page turn, path race, chimes, CTA chime.
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
for x_ in Q["pulses"]: at(S, x_, B.sweep_noise(0.7, 1200, 4200, q=1.6), 0.035)                                  # light pulse runs the wire
at(S, Q["title"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
at(S, Q["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, Q["cut"], B.thump(140, 80, 0.12, 0.2))                    # hard cut
at(S, Q["fan"], B.sweep_noise(0.5, 2600, 3600, q=2.0), 0.03); at(S, Q["tag"] + 0.25, B.click(1800, 0.05, 1.0), 0.15)
r0, r1 = Q["ruler"]
for k in range(10): at(S, r0 + (r1 - r0) * k / 10, B.click(2900, 0.012, 1.0), 0.05)                            # ruler ticks
at(S, Q["measure"], B.bell(1800, 0.4), 0.06)
w0, w1 = Q["whip"]; at(S, w0 - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)                              # whip pan
at(S, Q["q"], B.thump(110, 70, 0.14, 0.18)); at(S, Q["earth"], B.sweep_noise(0.6, 600, 1800, q=1.3), 0.05)
l0, l1 = Q["laps"]; n = int((l1 - l0) * SR); tt_ = np.arange(n) / SR                                            # beam circling: soft rising tone
at(S, l0, np.sin(2 * np.pi * (300 + 220 * tt_ / (l1 - l0)) * tt_) * np.minimum(1, np.minimum(tt_ / 0.3, (l1 - l0 - tt_) / 0.3)), 0.01)
for k in range(7): at(S, l0 + (l1 - l0) * (k + 1) / 7.48, B.click(3600, 0.012, 1.0), 0.05)                    # each lap
at(S, Q["km"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
z0, z1 = Q["zoom"]; at(S, z0, B.sweep_noise(z1 - z0 + 0.2, 400, 3000, q=1.2), 0.07)                            # zoom through
for x_ in Q["flips"]: at(S, x_ - 0.09, B.click(2400, 0.03, 1.0), 0.16); at(S, x_ - 0.09, B.sweep_noise(0.12, 3000, 1800, q=2.0), 0.03)
c0, c1 = Q["cross"]; at(S, c0, B.sweep_noise(c1 - c0, 1400, 4400, q=1.8), 0.04); at(S, c1, B.bell(2600, 0.5), 0.07)
p0, p1 = Q["push"]; at(S, p0, B.sweep_noise(p1 - p0 + 0.1, 2400, 900, q=1.6), 0.06)
s0, s1 = Q["shrink"]; at(S, s0, B.sweep_noise(s1 - s0, 3600, 900, q=1.5), 0.03)                                  # shrinking
at(S, Q["pepper"], B.thump(160, 120, 0.1, 0.16)); at(S, Q["pepper"] + 0.02, B.click(4200, 0.015, 1.0), 0.1)
at(S, Q["ps"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
t0_, t1_ = Q["turn"]; at(S, t0_, B.sweep_noise(t1_ - t0_ + 0.1, 900, 3800, q=1.3), 0.09)                       # page turn
at(S, Q["race"], B.sweep_noise(1.0, 1800, 3600, q=1.6), 0.035); at(S, Q["arriveS"], B.bell(2200, 0.5), 0.08)
at(S, Q["payoff"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
c_0, c_1 = Q["cta"]; at(S, c_0, B.sweep_noise(0.5, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
for t0, ch, dur in [(0.15, [52, 59, 64], 3.4), (3.3, [53, 60, 65], 3.0), (6.1, [55, 62, 67], 6.3), (12.3, [57, 64, 69], 4.8), (16.9, [52, 59, 66], 4.6), (21.3, [55, 62, 69], 5.4), (26.6, [52, 59, 64, 71], 3.4)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=1.2, r=1.4), 0.9)
for x_, m in [(0.4, 76), (3.5, 71), (6.3, 74), (9.9, 79), (12.6, 76), (17.1, 81), (19.3, 74), (21.6, 79), (24.4, 83), (27.3, 76)]:
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
