"""30 s soundtrack for english-25 #01 (Henrietta Leavitt and the blinking-star ruler) (accepted voice-forward recipe): Kokoro English narration
(Meshline blend) placed per audio/script.json; subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: soft pulses on the
hook star's light-curve peaks, a light sweep over the portrait, a flash on "blink", hard cut, the camera tilt, WEAK and FAR pops, push, her marks on the
cloud's blinking stars, the cloud highlight, the equal-distance lines and arc, SAME DISTANCE, the dive, the stars brightening, dots dropping onto the graph,
the line, the real 1912 figure and its stamp, the lookup arrow, page turn, the star dimming, the tape measure, DISTANCE, push, Hubble's blinking star, the
1923 stamp, the card and arrow, the pull-back, the second tape, ANOTHER GALAXY, page slide, stars popping onto the lesson page, scattered dots, "?",
the slide onto one row, the line, the tick, the card and CTA chimes.
Audio starts at frame 0 (first-frame rule). Helpers from this app's education/pilot-01/audio/build_audio.py. Loudnorm -15 LUFS / TP -1.5."""
import sys, json, wave, subprocess
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parents[2] / "education/pilot-01/audio"))
import build_audio as B
SR, DUR = 48000, 30.0
N = int(SR * DUR)
Q = json.loads((ROOT / "src/cues.json").read_text())
T = Q["T"]
def at(buf, t, x, g=1.0):
    i = int(round(t * SR)); m = min(len(x), N - i)
    if m > 0 and i >= 0: buf[i:i + m] += x[:m] * g
def readwav(p):
    with wave.open(str(p)) as w: return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
def writewav(p, x):
    x = np.clip(x, -1, 1); x = x[:, None] if x.ndim == 1 else x
    with wave.open(str(p), "wb") as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def env(n, a=0.05, r=0.3):
    t_ = np.arange(n) / SR; d = n / SR; return np.minimum(1, t_ / a) * np.clip((d - t_) / r, 0, 1)
def hiss(dur, lo, hi):
    x = B.bandnoise(dur, lo, hi); return x / (np.abs(x).max() + 1e-9) * env(len(x), 0.08, 0.4)
def blip(f, d=0.06):
    n = int(d * SR); t_ = np.arange(n) / SR; return np.sin(2 * np.pi * f * t_) * np.exp(-t_ * 40)
(ROOT / "build").mkdir(exist_ok=True)
V = np.zeros(N)
for s in json.loads((ROOT / "audio/script.json").read_text())["sentences"]:
    tmp = ROOT / f"build/{s['id']}_48.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(ROOT / f"audio/narration/{s['id']}.wav"), "-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=90", "-ar", "48000", "-ac", "1", str(tmp)], check=True)
    x = readwav(tmp); at(V, s["start"], x / (np.abs(x).max() + 1e-9) * 0.85)
t = np.arange(N) / SR
M = np.zeros(N); S = np.zeros(N)
# hook: soft pulses on the hook star's light-curve peaks; a light sweep over the portrait; a flash on "blink"
for p in Q["hookPulses"]: at(S, p, B.thump(330, 200, 0.18, 0.5), 0.6); at(S, p + 0.01, B.bell(B.midi(81), 0.6), 0.02)
at(S, Q["sweep"], B.sweep_noise(0.7, 1600, 3600, q=1.6), 0.03)
at(S, Q["blink"], B.bell(B.midi(86), 1.0), 0.06); at(S, Q["blink"], B.sweep_noise(0.4, 2500, 5200, q=2.0), 0.03)
# the problem: hard cut; the camera tilts up into a map; WEAK and FAR
at(S, T["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, T["cut"], B.thump(140, 80, 0.12, 0.2))
o0, o1 = Q["orb"]; at(S, o0, B.sweep_noise(o1 - o0 + 0.15, 500, 2600, q=1.2), 0.07)
at(S, Q["weak"], blip(520, 0.12), 0.06); at(S, Q["far"], blip(880, 0.12), 0.06); at(S, Q["far"] + 0.05, B.bell(B.midi(76), 1.0), 0.04)
p0, p1 = T["push"]; at(S, p0, B.sweep_noise(p1 - p0 + 0.1, 2400, 900, q=1.6), 0.06)
# the cloud: her marks ring the blinking stars; the cloud lights up; equal-distance lines and arc; SAME DISTANCE
for k, m in enumerate(Q["marks"]): at(S, m + 0.08, B.click(1500 + 110 * k, 0.02, 1.0), 0.06); at(S, m + 0.1, B.bell(B.midi(84 + (k % 3) * 2), 0.5), 0.015)
at(S, Q["cloudHi"], B.sweep_noise(0.9, 1200, 4200, q=2.0), 0.04)
at(S, Q["eq"], B.chirp(300, 520, 0.5, 1.0), 0.03); at(S, Q["arc"], B.sweep_noise(0.55, 900, 2600, q=1.8), 0.05)
at(S, Q["same"], B.click(2000, 0.03, 1.0), 0.1); at(S, Q["same"] + 0.05, B.bell(B.midi(79), 1.0), 0.05)
d0, d1 = T["dive"]; at(S, d0, B.sweep_noise(d1 - d0 + 0.2, 2000, 300, q=1.2), 0.07); at(S, d1, B.thump(180, 90, 0.15, 0.25))
# the pattern: the stars brighten; dots drop onto the graph; the line; the real 1912 figure and its stamp; the lookup arrow
at(S, Q["bri"], B.chirp(400, 800, 0.4, 1.0), 0.025)
for k, d in enumerate(Q["drops"]): at(S, d, blip(700 + 140 * k, 0.07), 0.07)
at(S, Q["line"], B.sweep_noise(0.32, 1500, 4500, q=2.0), 0.05)
at(S, Q["figIn"], B.thump(200, 110, 0.12, 0.25)); at(S, Q["figIn"], B.sweep_noise(0.3, 3000, 1200, q=2.0), 0.04)
at(S, Q["stamp12"] + 0.1, B.thump(150, 80, 0.1, 0.35)); at(S, Q["stamp12"] + 0.12, B.click(900, 0.04, 1.0), 0.1)
l0, l1, l2 = Q["look"]; at(S, l0, B.chirp(400, 700, l1 - l0, 1.0), 0.03); at(S, l1, B.chirp(700, 900, l2 - l1, 1.0), 0.03); at(S, l2, B.bell(B.midi(84), 1.0), 0.06)
u0, u1 = T["turn"]; at(S, u0, B.sweep_noise(u1 - u0 + 0.1, 900, 3800, q=1.3), 0.09)
# distance: the star dims to how faint it looks; a tape measure zips out to it; DISTANCE
at(S, Q["faint"], B.chirp(760, 380, 0.6, 1.0), 0.035)
at(S, Q["dist"], B.bandnoise(0.6, 2000, 6000) * env(int(0.6 * SR), 0.03, 0.15), 0.035)
for k in range(10): at(S, Q["dist"] + k * 0.06, B.click(2600 - 90 * k, 0.012, 1.0), 0.035)
at(S, Q["distPill"], B.click(2000, 0.03, 1.0), 0.1); at(S, Q["distPill"] + 0.05, B.bell(B.midi(81), 1.0), 0.05)
q0 = T["push2"][0]; at(S, q0, B.sweep_noise(0.35, 2400, 900, q=1.6), 0.06)
# Andromeda: Hubble's star blinks; the 1923 stamp; her rule's card and arrow; the pull-back; the second tape; ANOTHER GALAXY
for k in range(4): at(S, Q["hub"] + 0.18 + k * 0.9, B.bell(B.midi(88), 0.5), 0.025)
at(S, Q["hub"], B.click(1800, 0.03, 1.0), 0.07)
at(S, Q["used"] + 0.1, B.thump(150, 80, 0.1, 0.35)); at(S, Q["used"] + 0.12, B.click(900, 0.04, 1.0), 0.09)
at(S, Q["rule"], B.sweep_noise(0.35, 3000, 1400, q=2.0), 0.04); at(S, Q["rule"] + 0.3, B.chirp(500, 900, 0.3, 1.0), 0.025)
pl0, pl1 = Q["pull"]; at(S, pl0, B.sweep_noise(pl1 - pl0 + 0.3, 3500, 500, q=1.0), 0.08); at(S, pl1, B.thump(90, 50, 0.4, 0.3))
at(S, Q["mwTape"], B.bandnoise(0.65, 2000, 6000) * env(int(0.65 * SR), 0.03, 0.15), 0.03)
for k in range(10): at(S, Q["mwTape"] + k * 0.065, B.click(2500 - 80 * k, 0.012, 1.0), 0.03)
at(S, Q["gal"], B.bell(B.midi(86), 1.4), 0.09); at(S, Q["gal"] + 0.1, B.click(2000, 0.03, 1.0), 0.08)
s0, s1 = T["slide"]; at(S, s0, B.sweep_noise(s1 - s0 + 0.1, 2500, 1200, q=2.5), 0.06); at(S, s1, B.click(2000, 0.03, 1.0), 0.1)
# lesson: stars pop onto the page; scattered dots; "?"; the slide onto one row; the line; the tick; the card
for k, m in enumerate(Q["pop"]): at(S, m + 0.05, B.click(1400 + 150 * k, 0.02, 1.0), 0.06)
for k in range(5): at(S, Q["pat"] + k * 0.07 + 0.05, blip(900 + 90 * ((k * 3) % 5), 0.06), 0.05)
at(S, Q["pat"] + 0.45, blip(200, 0.25), 0.06)
at(S, Q["cmp"], B.sweep_noise(0.6, 900, 2400, q=1.6), 0.06); at(S, Q["cmp"] + 0.5, B.chirp(500, 900, 0.35, 1.0), 0.03)
for k, m in enumerate([76, 79, 84]): at(S, Q["ok"] + k * 0.1, B.bell(B.midi(m), 1.0), 0.07)
at(S, Q["card"], B.click(2200, 0.04, 1.0), 0.14); at(S, Q["card"] + 0.3, B.bell(B.midi(86), 1.0), 0.12)
c_0, c_1 = T["cta"]; at(S, c_0, B.sweep_noise(0.4, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
# music: long pads plus a few sparse, non-periodic notes (no loops)
for t0, ch, dur in [(0.0, [50, 57, 62], 4.4), (4.2, [46, 53, 58], 3.0), (7.0, [48, 55, 60], 5.0), (11.9, [53, 60, 65], 3.8), (15.6, [52, 59, 64], 2.7), (18.1, [55, 62, 69], 4.3), (22.3, [50, 57, 62], 4.5), (26.7, [55, 62, 67, 74], 3.3)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=0.6, r=1.4), 0.9)
for x_, m in [(0.4, 74), (2.5, 77), (4.9, 70), (7.4, 74), (9.1, 77), (10.9, 79), (12.6, 76), (14.6, 79), (16.4, 81), (18.6, 76), (20.6, 81), (22.9, 74), (24.4, 77), (25.9, 81), (27.4, 79)]:
    at(M, x_, B.pluck(B.midi(m), 2.0, 0.3), 0.2)
at(M, T["cta"][1], B.bell(B.midi(88), 1.4), 0.22)
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
