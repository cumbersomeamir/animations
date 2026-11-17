"""30 s soundtrack for english-19 #01 (Mary Anning and her first ichthyosaur) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed per audio/script.json;
subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: page turns, slide swaps, hard cut,
light sweeps, cut, plates, whip, chisel taps as the rock comes away, glide, name chime, stone and stamp, ring, page turn, strike, credit chime, CTA chime. Audio starts at frame 0 (first-frame rule).
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
at(S, Q["sweep"], B.sweep_noise(0.7, 1600, 3600, q=1.6), 0.03); at(S, Q["sweep2"], B.sweep_noise(0.7, 1600, 3600, q=1.6), 0.025)   # light sweeps across the prints
at(S, Q["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, Q["cut"], B.thump(140, 80, 0.12, 0.2))                    # hard cut to the skull
at(S, Q["monster"], B.thump(100, 55, 0.16, 0.24)); at(S, Q["croc"], B.click(1700, 0.04, 1.0), 0.12)
at(S, Q["q"], B.bell(1300, 0.6), 0.07)
w0, w1 = Q["whip"]; at(S, w0 - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)                              # whip pan to the dig
at(S, Q["joseph"], B.click(2000, 0.04, 1.0), 0.12); at(S, Q["mary"], B.click(2200, 0.04, 1.0), 0.12)
c0, c1 = Q["chip"]
for k in range(14): at(S, c0 + (c1 - c0) * k / 14 + 0.03 * ((k * 7) % 3), B.click(2600 + 140 * (k % 4), 0.01, 1.0), 0.07)   # chisel taps as the rock comes away
pa0, pa1 = Q["push"]; at(S, pa0, B.sweep_noise(pa1 - pa0 + 0.1, 2400, 900, q=1.6), 0.06)
s0, s1 = Q["swim"]; at(S, s0, B.sweep_noise(s1 - s0, 400, 1100, q=0.9), 0.035)                                  # the animal glides in
at(S, Q["name"], B.bell(B.midi(81), 0.8), 0.06)
at(S, Q["stone"], B.sweep_noise(0.5, 3000, 700, q=1.4), 0.05); at(S, Q["stamp"] + 0.1, B.thump(120, 60, 0.16, 0.36))   # turns to stone; stamp
pb0, pb1 = Q["push2"]; at(S, pb0, B.sweep_noise(pb1 - pb0 + 0.1, 2400, 900, q=1.6), 0.06)
at(S, Q["ring"], B.sweep_noise(0.4, 1800, 3200, q=1.8), 0.04); at(S, Q["ring"] + 0.2, B.bell(B.midi(79), 0.8), 0.05)
at(S, Q["plate"], B.click(2000, 0.04, 1.0), 0.12)
t0_, t1_ = Q["turn"]; at(S, t0_, B.sweep_noise(t1_ - t0_ + 0.1, 900, 3800, q=1.3), 0.09)                       # page turn
at(S, Q["skip"], B.sweep_noise(0.35, 900, 600, q=1.2), 0.04)                                                    # the name is struck out
at(S, Q["credit"], B.click(2200, 0.04, 1.0), 0.14); at(S, Q["credit"] + 0.35, B.bell(B.midi(86), 1.0), 0.15)
c_0, c_1 = Q["cta"]; at(S, c_0, B.sweep_noise(0.4, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
for t0, ch, dur in [(0.0, [50, 57, 62], 4.9), (4.75, [52, 59, 64], 4.7), (9.3, [55, 62, 67], 3.5), (12.7, [53, 60, 65], 4.4), (17.0, [57, 64, 69], 4.9), (21.8, [55, 62, 69], 5.0), (26.7, [52, 59, 64, 71], 3.3)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=0.6, r=1.4), 0.9)
for x_, m in [(0.3, 74), (2.6, 76), (5.0, 79), (7.4, 76), (9.6, 74), (11.4, 79), (13.2, 77), (15.9, 72), (17.5, 81), (19.8, 79), (22.4, 74), (24.8, 76), (27.3, 76)]:
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
