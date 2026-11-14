"""30 s soundtrack for english-14 #01 (Emily Warren Roebling, the Brooklyn Bridge) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed per audio/script.json;
subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: page turns, slide swaps, hard cut,
print, portrait, cut, tower, path, whip, pressure hiss and bubbles, page turn, dictation, pen scratch, carry, pages, title card, flows, question/answer, chimes, CTA chime.
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
at(S, Q["print"] + 0.05, B.sweep_noise(0.5, 1400, 3000, q=1.6), 0.05)                                           # 1883 print slides in
at(S, Q["wash"] + 0.35, B.click(1800, 0.05, 1.0), 0.16)                                                         # portrait laid down
at(S, Q["chief"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045); at(S, Q["years"], B.thump(120, 60, 0.16, 0.3))
at(S, Q["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, Q["cut"], B.thump(140, 80, 0.12, 0.2))                    # hard cut
at(S, Q["tower"] + 0.3, B.thump(90, 55, 0.2, 0.25))                                                              # tower lands
p0, p1 = Q["path"]; at(S, p0, B.sweep_noise(p1 - p0 + 0.3, 1500, 3200, q=1.8), 0.035)                            # path draws, note travels
at(S, Q["q"], B.bell(1300, 0.6), 0.07)
w0, w1 = Q["whip"]; at(S, w0 - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)                              # whip pan
at(S, Q["bends"], B.thump(110, 60, 0.2, 0.35))
r0, r1 = Q["pressure"]; n = int((r1 - r0) * SR); tt_ = np.arange(n) / SR                                        # pressurized chamber: low hiss + bubbles
xh = B.sweep_noise(r1 - r0, 700, 900, q=0.8); mh = min(len(xh), n); at(S, r0, xh[:mh] * np.minimum(1, np.minimum(tt_[:mh] / 0.3, (r1 - r0 - tt_[:mh]) / 0.3)), 0.03)
for k in range(int((r1 - r0) / 0.24)): at(S, r0 + 0.1 + k * 0.24, B.click(1600 + 300 * (k % 3), 0.02, 1.0), 0.05)
t0_, t1_ = Q["turn"]; at(S, t0_, B.sweep_noise(t1_ - t0_ + 0.1, 900, 3800, q=1.3), 0.09)                       # page turn
d0, d1 = Q["dictate"]
for k in range(int((d1 - d0) / 0.77)): at(S, d0 + k * 0.77, B.sweep_noise(0.35, 600, 1400, q=2.0), 0.03)         # dictation waves
at(S, Q["emily"] + 0.3, B.click(1800, 0.05, 1.0), 0.16); at(S, Q["name"], B.sweep_noise(0.18, 2500, 4200, q=1.6), 0.045)
q0, q1 = Q["write"]
for k in range(int((q1 - q0) / 0.09)): at(S, q0 + k * 0.09, B.sweep_noise(0.07, 3800, 5200, q=2.5), 0.02)       # pen scratch
c0, c1 = Q["carry"]; at(S, c0, B.sweep_noise(c1 - c0, 1200, 3400, q=1.4), 0.035); at(S, Q["land"], B.bell(2200, 0.5), 0.08)
pa0, pa1 = Q["push"]; at(S, pa0, B.sweep_noise(pa1 - pa0 + 0.1, 2400, 900, q=1.6), 0.06)
for x_ in Q["pages"]: at(S, x_ + 0.25, B.click(1900, 0.04, 1.0), 0.14)                                         # study pages laid down
at(S, Q["tower2"], B.sweep_noise(0.6, 500, 1500, q=1.2), 0.05); at(S, Q["tower2"] + 0.45, B.thump(90, 55, 0.2, 0.25))
at(S, Q["tag"], B.thump(120, 60, 0.16, 0.3)); at(S, Q["tag"] + 0.02, B.bell(1700, 0.5), 0.06)                    # title card
pb0, pb1 = Q["push2"]; at(S, pb0, B.sweep_noise(pb1 - pb0 + 0.1, 2400, 900, q=1.6), 0.06)
f0, f1 = Q["flow"]; at(S, f0, B.sweep_noise(0.6, 1500, 3000, q=1.8), 0.035); at(S, f1, B.sweep_noise(0.6, 1500, 3000, q=1.8), 0.035)
at(S, Q["qback"], B.sweep_noise(0.5, 3000, 1500, q=1.8), 0.04); at(S, Q["answer"], B.sweep_noise(0.5, 1500, 3200, q=1.8), 0.04)
at(S, Q["done"], B.bell(B.midi(86), 1.0), 0.16)
c_0, c_1 = Q["cta"]; at(S, c_0, B.sweep_noise(0.4, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
for t0, ch, dur in [(0.15, [50, 57, 62], 4.2), (4.3, [53, 60, 65], 2.3), (6.6, [52, 59, 64], 4.4), (10.95, [55, 62, 67], 6.6), (17.4, [57, 64, 69], 4.4), (21.8, [55, 62, 69], 5.0), (26.7, [52, 59, 64, 71], 3.3)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=1.2, r=1.4), 0.9)
for x_, m in [(0.4, 74), (4.5, 79), (6.9, 71), (11.4, 76), (14.2, 74), (17.7, 79), (19.4, 81), (22.2, 76), (24.6, 83), (27.3, 76)]:
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
