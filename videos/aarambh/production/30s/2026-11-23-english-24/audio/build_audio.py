"""30 s soundtrack for english-24 #01 (Tu Youyou and the temperature clue) (accepted voice-forward recipe): Kokoro English narration (Meshline blend)
placed per audio/script.json; subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: a burner hiss and soft boiling under
the opening, the sparks blinking out, a light sweep, the clue glow, hard cut, more sparks going out, the "?" bell, whip, the flame roaring and the sparks
crackling apart, push, the highlighter on the old page, the herb dipping into water, wringing and drips, the NO BOILING stamp, page turn, ice clinks and a
falling tone as the thermometer drops, the ether tag, the dive into the drop, the 1971 stamp, the parasites clearing, push, crystal tinks, the Nobel bell
and stamp, page slide, step ticks, the travelling pulse, the fail buzz, the spotlight, the flip, the success chime, the card and CTA chimes.
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
# hook: a quiet burner hiss and soft boiling; the sparks blink out; a light sweep over the portrait; the clue glows on the thermometer
at(S, 0.0, hiss(T["cut"], 300, 2400), 0.018)
for k in range(10): at(S, 0.15 + k * 0.4 + 0.13 * np.sin(k * 3.1), B.click(900 + 90 * (k % 4), 0.02, 1.0), 0.02)
for k in range(8): at(S, Q["fail"] + k * 0.2, blip(1400 - 110 * k), 0.035)
at(S, Q["fail"], B.chirp(520, 300, 1.2, 1.0), 0.02)
at(S, Q["sweep"], B.sweep_noise(0.7, 1600, 3600, q=1.6), 0.03)
at(S, Q["clue"], B.bell(B.midi(79), 1.0), 0.06)
# super hook: hard cut, the last sparks going out, "?" bell
at(S, T["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, T["cut"], B.thump(140, 80, 0.12, 0.2))
for k in range(6): at(S, T["cut"] + 0.1 + k * 0.16, blip(1200 - 120 * k), 0.035)
at(S, T["whip"][0] - 0.55, B.bell(B.midi(74), 1.2), 0.06)
at(S, T["whip"][0] - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)
# heat: the flame roars, boiling, the sparks crackle apart
at(S, Q["heat"] - 0.1, hiss(1.0, 150, 1800) * np.linspace(0.4, 1, int(1.0 * SR)), 0.09); at(S, Q["heat"], B.thump(90, 50, 0.3, 0.3))
for k in range(14): at(S, Q["heat"] + 0.05 + k * 0.04, B.click(2500 + 300 * (k % 5), 0.012, 1.0), 0.04)
for k in range(8): at(S, Q["heat"] - 0.2 + k * 0.09, B.click(600 + 80 * k, 0.03, 1.0), 0.03)
p0, p1 = T["push"]; at(S, p0, B.sweep_noise(p1 - p0 + 0.1, 2400, 900, q=1.6), 0.06)
# the ancient page: a highlighter stroke; the herb dips into cold water; wringing and drips; the stamp
h0, h1 = Q["highlight"]; at(S, h0, B.bandnoise(h1 - h0, 1500, 5000) * env(int((h1 - h0) * SR), 0.05, 0.2), 0.03)
at(S, Q["soak"] + 0.25, B.thump(220, 110, 0.15, 0.25)); at(S, Q["soak"] + 0.25, B.sweep_noise(0.5, 900, 300, q=1.5), 0.05)
at(S, Q["wring"], B.chirp(300, 420, 0.5, 1.0), 0.03)
for k in range(8): at(S, Q["wring"] + 0.25 + k * 0.12, blip(1800 - 60 * k, 0.05), 0.04)
at(S, Q["noboil"] + 0.1, B.thump(150, 80, 0.1, 0.35)); at(S, Q["noboil"] + 0.1, B.click(900, 0.04, 1.0), 0.1)
u0, u1 = T["turn"]; at(S, u0, B.sweep_noise(u1 - u0 + 0.1, 900, 3800, q=1.3), 0.09)
# cool extraction: ice clinks, a falling tone as the thermometer drops, the ether tag
for k in range(4): at(S, T["turn"][1] + 0.2 + k * 0.35, B.tink(1.0), 0.03)
at(S, Q["cool"], B.chirp(700, 380, 0.6, 1.0), 0.035); at(S, Q["ether"], B.click(2000, 0.03, 1.0), 0.08)
# the dive into the drop; the 1971 stamp; the parasites clear
d0, d1 = T["dive"]; at(S, d0, B.sweep_noise(d1 - d0 + 0.2, 2000, 300, q=1.2), 0.07); at(S, d1, B.thump(180, 90, 0.15, 0.25))
at(S, Q["y1971"] + 0.1, B.thump(150, 80, 0.1, 0.3)); at(S, Q["y1971"] + 0.12, B.click(900, 0.04, 1.0), 0.08)
at(S, Q["clear"], B.sweep_noise(1.1, 1200, 4200, q=2.0), 0.05)
for k in range(5): at(S, Q["clear"] + 0.15 + k * 0.18, B.bell(B.midi(84 + 2 * (k % 3)), 0.7), 0.03)
q0 = T["push2"][0]; at(S, q0, B.sweep_noise(0.35, 2400, 900, q=1.6), 0.06)
# artemisinin crystals; the Nobel Prize
for k in range(7): at(S, Q["art"] - 0.2 + k * 0.13, B.tink(1.0), 0.035)
at(S, Q["nobel"], B.bell(B.midi(86), 1.4), 0.1); at(S, Q["nobel"] + 0.25, B.thump(150, 80, 0.1, 0.3))
s0, s1 = T["slide"]; at(S, s0, B.sweep_noise(s1 - s0 + 0.1, 2500, 1200, q=2.5), 0.06); at(S, s1, B.click(2000, 0.03, 1.0), 0.1)
# lesson: four step tiles, a travelling pulse, the fail buzz, the spotlight sweep and stop, the flip, the success chime, the card
for k in range(4): at(S, Q["tiles"] + k * 0.12 + 0.1, B.click(1500 + 120 * k, 0.02, 1.0), 0.07)
at(S, Q["run"], B.chirp(400, 600, Q["fail2"] - Q["run"], 1.0), 0.03)
at(S, Q["fail2"], B.thump(110, 70, 0.25, 0.35)); at(S, Q["fail2"] + 0.02, blip(220, 0.25), 0.07); at(S, Q["fail2"] + 0.2, blip(185, 0.25), 0.07)
sp0, sp1 = Q["spot"]; at(S, sp0, B.sweep_noise(sp1 - sp0 + 0.1, 3000, 1200, q=2.0), 0.05); at(S, sp1, B.click(2400, 0.03, 1.0), 0.1)
at(S, Q["flip"], B.sweep_noise(0.3, 1500, 4000, q=2.0), 0.05); at(S, Q["flip"] + 0.2, B.click(1800, 0.03, 1.0), 0.08)
for k, m in enumerate([76, 79, 84]): at(S, Q["ok"] + k * 0.1, B.bell(B.midi(m), 1.0), 0.07)
at(S, Q["card"], B.click(2200, 0.04, 1.0), 0.14); at(S, Q["card"] + 0.3, B.bell(B.midi(86), 1.0), 0.12)
c_0, c_1 = T["cta"]; at(S, c_0, B.sweep_noise(0.4, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
# music: long pads plus a few sparse, non-periodic notes (no loops)
for t0, ch, dur in [(0.0, [50, 57, 62], 4.5), (4.3, [46, 53, 58], 1.3), (5.5, [48, 55, 60], 1.4), (6.9, [53, 60, 65], 4.7), (11.5, [55, 62, 67], 2.9), (14.3, [52, 59, 64], 3.6), (17.9, [57, 64, 69], 3.9), (21.8, [50, 57, 62], 5.0), (26.7, [55, 62, 67, 74], 3.3)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=0.6, r=1.4), 0.9)
for x_, m in [(0.4, 74), (2.6, 72), (5.0, 70), (7.3, 77), (9.0, 74), (11.0, 79), (12.6, 76), (15.0, 79), (16.8, 81), (18.6, 76), (20.4, 81), (22.6, 74), (24.2, 77), (25.8, 81), (27.4, 79)]:
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
