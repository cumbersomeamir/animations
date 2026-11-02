"""30 s soundtrack for feedback-round #01. Voice upfront; music is subtle and NON-repetitive (slow pads plus sparse,
non-periodic felt-piano phrases, no looping arpeggio). SFX are tied to on-screen actions: burr sticks, page turns, slide swaps,
hard cut, loupe landing, loop catches, weaving, stamp, press (soft crunch), grip, pull (hook-and-loop rip), strap close/open, ticks, CTA chime.
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
rng = np.random.default_rng(1941)
def at(buf, t, x, g=1.0):
    i = int(round(t * SR)); m = min(len(x), N - i)
    if m > 0: buf[i:i + m] += x[:m] * g
def readwav(p):
    with wave.open(str(p)) as w: return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
def writewav(p, x):
    x = np.clip(x, -1, 1); x = x[:, None] if x.ndim == 1 else x
    with wave.open(str(p), "wb") as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def crackle(dur, rate0, rate1, f_lo=1500, f_hi=7000):  # hook-and-loop "rip": dense random micro-clicks, band-passed
    n = int(dur * SR); x = np.zeros(n); tt = 0.0
    while tt < dur:
        i = int(tt * SR); g = B.click(rng.uniform(2500, 6000), 0.006, rng.uniform(0.4, 1.0)); x[i:i + len(g)] += g[:max(0, min(len(g), n - i))]
        tt += 1.0 / lerp(rate0, rate1, tt / dur) * rng.uniform(0.5, 1.5)
    from scipy import signal
    return signal.sosfilt(signal.butter(2, [f_lo, f_hi], btype="band", fs=SR, output="sos"), x) * np.hanning(n) ** 0.3
lerp = lambda a, b, t: a + (b - a) * t
(ROOT / "build").mkdir(exist_ok=True)
V = np.zeros(N)
for s in json.loads((ROOT / "audio/script.json").read_text())["sentences"]:
    tmp = ROOT / f"build/{s['id']}_48.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(ROOT / f"audio/narration/{s['id']}.wav"), "-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=90", "-ar", "48000", "-ac", "1", str(tmp)], check=True)
    x = readwav(tmp); at(V, s["start"], x / (np.abs(x).max() + 1e-9) * 0.85)
t = np.arange(N) / SR
M = np.zeros(N); S = np.zeros(N)
S += (np.sin(2 * np.pi * 100 * t) + 0.3 * np.sin(2 * np.pi * 200 * t)) * 0.005 * np.clip((t - 0.1) / 0.4, 0, 1)
for x_, g in [(0.08, 0.25), (0.14, 0.15), (0.2, 0.2)]: at(S, x_, B.click(3200, 0.02, 1.0), g)
for x_ in Q["stick"]: at(S, x_, crackle(0.12, 400, 200), 0.18); at(S, x_, B.thump(200, 110, 0.08, 0.2))
for a, b in Q["turn"]: at(S, a, B.sweep_noise(b - a + 0.1, 900, 3800, q=1.3), 0.09)
for x_ in Q["swap"]: at(S, x_, B.sweep_noise(0.5, 2500, 1200, q=2.5), 0.06); at(S, x_ + 0.5, B.click(2400, 0.04, 1.0), 0.28)
for x_ in Q["cut"]: at(S, x_, B.click(3000, 0.025, 1.0), 0.32); at(S, x_, B.thump(140, 80, 0.12, 0.22))
for x_ in Q["land"]: at(S, x_, B.click(2600, 0.04, 1.0), 0.24); at(S, x_ + 0.004, B.bell(3400, 0.3), 0.08)
c0, c1 = Q["catch"]
for k in range(5): at(S, c0 + (c1 - c0) * (0.1 + 0.18 * k), B.click(1800, 0.03, 1.0), 0.12)
for x_, d in Q["weave"]: at(S, x_, B.sweep_noise(d, 1200, 2600, q=3) * (0.5 + 0.5 * np.sign(np.sin(np.linspace(0, 60, int(d * SR))))), 0.03)
for x_ in Q["stamp"]: at(S, x_, B.thump(120, 60, 0.16, 0.4))
p0, p1 = Q["press"]; at(S, p1 - 0.05, crackle(0.18, 900, 300, 800, 5000), 0.22); at(S, p1 - 0.05, B.thump(160, 90, 0.12, 0.3))
at(S, Q["grip"], B.click(5200, 0.015, 1.0), 0.12)
u0, u1 = Q["pull"]; d = u1 - u0
at(S, u0 + 0.15, B.sweep_noise(0.9 * d * 0.6, 600, 1500, q=2) * np.linspace(0.2, 1, int(0.9 * d * 0.6 * SR)), 0.04)  # strain
at(S, u0 + 0.6 * d, crackle(0.55, 1800, 500), 0.42)                                                                     # the rip
for x_ in Q["strap"]: at(S, x_, crackle(0.15, 1200, 400, 800, 5000), 0.2)
for x_ in Q["strapOpen"]: at(S, x_, crackle(0.3, 1500, 500), 0.22)
for x_ in Q["tick"]: at(S, x_, B.click(5200, 0.015, 1.0), 0.12)
# subtle music: long pads, a few sparse non-periodic notes (no loop)
for t0, ch, dur in [(0.2, [52, 59, 64], 6.0), (5.8, [55, 62, 67], 4.0), (9.4, [57, 64, 69], 6.2), (15.4, [53, 60, 65], 4.4), (19.8, [55, 62, 71], 5.6), (25.6, [52, 59, 64, 71], 4.4)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=1.4, r=1.6), 0.9)
for x_, m in [(0.5, 76), (3.9, 71), (8.1, 74), (12.9, 79), (16.6, 76), (21.2, 74), (23.9, 79), (26.0, 83), (28.3, 76)]:
    at(M, x_, B.pluck(B.midi(m), 2.0, 0.3), 0.22)
at(M, Q["cta"], B.bell(B.midi(88), 1.4), 0.22)
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
