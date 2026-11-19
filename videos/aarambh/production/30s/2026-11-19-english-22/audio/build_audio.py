"""30 s soundtrack for english-22 #01 (Elizebeth Friedman, codebreaker) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed per audio/script.json;
subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: light sweep, faint radio hiss and three soft code beeps in the
narration pause, gold chime as the letters are read, hard cut, lock rattle, whip, swap-box clicks, tile rain, flip chime, push, slips landing, counter ticks,
push, rotor set, key presses and rotor steps, three rising chimes as Q X M read E, page turn, locks springing open and shutting, new keys, card chime, CTA chime.
Audio starts at frame 0 (first-frame rule). Helpers from this app's education/pilot-01/audio/build_audio.py. Two-pass loudnorm to -15 LUFS / TP -1.5."""
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
hs = B.bandnoise(2.6, 1800, 4200); at(S, 0.0, hs / (np.abs(hs).max() + 1e-9) * np.linspace(1, 0, len(hs)) ** 2, 0.02)   # faint radio hiss under the opening
def beep(f, d):
    n = int(d * SR); x = np.sin(2 * np.pi * f * np.arange(n) / SR); return x * np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.005 * SR))
for o, d in [(0.0, 0.05), (0.1, 0.05), (0.2, 0.14)]: at(S, Q["beeps"] + o, beep(880, d), 0.05)                 # dit-dit-dah in the narration pause
at(S, Q["read"], B.bell(B.midi(84), 0.9), 0.06)                                                                 # letters turn gold as she reads them
at(S, Q["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, Q["cut"], B.thump(140, 80, 0.12, 0.2))                    # hard cut to the padlock
for k in range(3): at(S, Q["keyq"] + k * 0.07, B.click(1200 + 250 * k, 0.02, 1.0), 0.08)                        # the lock rattles
w0, w1 = Q["whip"]; at(S, w0 - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)                              # whip pan to the swap box
for p in Q["pass"]:
    at(S, p + Q["PD"] * 0.4, B.click(1800, 0.03, 1.0), 0.09); at(S, p + Q["PD"] * 0.55, B.click(2600, 0.02, 1.0), 0.07)   # E goes in, Q comes out
    at(S, p + Q["PD"] + 0.5, B.click(1300, 0.02, 1.0), 0.07)                                                   # the Q tile lands on its column
r0, r1 = Q["rain"]
for k in range(11): at(S, r0 + k * 0.045 + 0.3, B.click(1250 + 70 * k, 0.015, 1.0), 0.05)                      # the other coded letters rain in
at(S, Q["flip"], B.bell(B.midi(84), 1.0), 0.08)                                                                 # the top Q flips to E
pa0, pa1 = Q["push"]; at(S, pa0, B.sweep_noise(pa1 - pa0 + 0.1, 2400, 900, q=1.6), 0.06)
for tl in Q["land"]: at(S, tl, B.sweep_noise(0.09, 2600, 1200, q=1.2), 0.035)                                  # slips land on the pile
c0, c1 = Q["count"]
for k in range(10): at(S, c0 + (c1 - c0) * (k / 10) ** 0.8, B.click(1900 + 70 * k, 0.012, 1.0), 0.06)          # the count runs to 12,000
at(S, Q["plus"], B.pluck(B.midi(79), 1.0, 0.5), 0.12)
pb0, pb1 = Q["push2"]; at(S, pb0, B.sweep_noise(pb1 - pb0 + 0.1, 2400, 900, q=1.6), 0.06)
at(S, pb1, B.thump(110, 60, 0.18, 0.3))                                                                         # the rotor settles
for k in Q["press"]:
    at(S, k - 0.03, B.click(2200, 0.02, 1.0), 0.11); at(S, k + 0.12, B.thump(220, 130, 0.06, 0.3)); at(S, k + 0.13, B.click(900, 0.04, 1.0), 0.08)   # key press, rotor steps
for i, m in enumerate([79, 83, 86]): at(S, Q["broke"] + i * 0.14 + 0.16, B.bell(B.midi(m), 0.9), 0.06)           # Q X M each read E
t0_, t1_ = Q["turn"]; at(S, t0_, B.sweep_noise(t1_ - t0_ + 0.1, 900, 3800, q=1.3), 0.09)                       # page turn
for o in Q["open"]: at(S, o + 0.12, B.click(1600, 0.03, 1.0), 0.1)                                              # one key opens every lock
at(S, Q["open"][2] + 0.35, B.bell(620, 0.5), 0.035)
for k in range(3): at(S, Q["shut"] + k * 0.02, B.click(1100, 0.03, 1.0), 0.08)
at(S, Q["shut"], B.thump(150, 80, 0.1, 0.25))                                                                    # locks snap shut
for i in range(3): at(S, Q["newk"] + i * 0.1 + 0.2, B.tink(1.0), 0.04)                                          # a different key for each lock
at(S, Q["card"], B.click(2200, 0.04, 1.0), 0.14); at(S, Q["card"] + 0.35, B.bell(B.midi(86), 1.0), 0.15)
c_0, c_1 = Q["cta"]; at(S, c_0, B.sweep_noise(0.4, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
for t0, ch, dur in [(0.0, [50, 57, 62], 5.4), (5.2, [48, 55, 60], 1.7), (6.75, [52, 59, 64], 4.7), (11.3, [53, 60, 65], 3.4), (14.5, [55, 62, 67], 2.5), (16.9, [50, 57, 62], 4.0), (20.8, [57, 64, 69], 6.0), (26.7, [52, 59, 64, 71], 3.3)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=0.6, r=1.4), 0.9)
for x_, m in [(0.3, 74), (3.0, 79), (5.4, 72), (7.0, 76), (9.6, 79), (11.5, 81), (12.6, 74), (14.7, 77), (16.6, 72), (19.1, 74), (21.2, 76), (23.0, 74), (25.1, 79), (27.3, 76)]:
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
