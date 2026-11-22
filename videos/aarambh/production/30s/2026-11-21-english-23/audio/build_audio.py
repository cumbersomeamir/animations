"""30 s soundtrack for english-23 #01 (Inge Lehmann and the inner core) (accepted voice-forward recipe): Kokoro English narration (Meshline blend) placed
per audio/script.json; subtle NON-repetitive music (long pads + sparse notes); SFX tied to on-screen actions: quake rumbles and the "impossible"
station ping, light sweep, hard cut, veiled-core swell, whip, the PKP ray (launch, a falling tone while it is slowed in the core, landing ping),
the quiet band hush, push, drum-seismograph motor ticks, 1929 stamp, the strong arrival's pen scratch and rumble, page turn, 1936 stamp, the
inner-core reveal shimmer, the PKiKP ray (launch, falling tone in the outer core, a bright tink as it reflects at the inner core, landing bell),
the push into the core, crystal tinks, page slide, predicted-arrival ticks, the measured gold arrival, the mismatch ring, the lens reveal, the card
and CTA chimes. Audio starts at frame 0 (first-frame rule). Helpers from this app's education/pilot-01/audio/build_audio.py. Loudnorm -15 LUFS / TP -1.5."""
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
def rumble(dur, f_hi=180):
    n = int(dur * SR); x = B.bandnoise(dur, 30, f_hi); tt = np.arange(n) / SR
    return x / (np.abs(x).max() + 1e-9) * np.minimum(1, tt / 0.03) * np.exp(-tt / (dur / 3))
(ROOT / "build").mkdir(exist_ok=True)
V = np.zeros(N)
for s in json.loads((ROOT / "audio/script.json").read_text())["sentences"]:
    tmp = ROOT / f"build/{s['id']}_48.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(ROOT / f"audio/narration/{s['id']}.wav"), "-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=90", "-ar", "48000", "-ac", "1", str(tmp)], check=True)
    x = readwav(tmp); at(V, s["start"], x / (np.abs(x).max() + 1e-9) * 0.85)
t = np.arange(N) / SR
M = np.zeros(N); S = np.zeros(N)
# hook: quake pulses (the epicentre pulses every 1/0.55 s), the "impossible" station ping, light sweep over the portrait
for k in range(3): at(S, k / 0.55, B.thump(70, 38, 0.6, 0.5)); at(S, k / 0.55, rumble(1.0), 0.05)
at(S, Q["ping0"], B.bell(B.midi(88), 1.2), 0.1); at(S, Q["ping0"] + 0.25, B.bell(B.midi(88), 0.8), 0.04)
at(S, Q["sweep"], B.sweep_noise(0.7, 1600, 3600, q=1.6), 0.03)
# super hook: hard cut, the veiled core swells, "?" bell
at(S, T["cut"], B.click(3000, 0.025, 1.0), 0.3); at(S, T["cut"], B.thump(140, 80, 0.12, 0.2))
at(S, T["cut"] + 0.05, B.chirp(55, 46, 1.35, 1.0), 0.09); at(S, Q["veilQ"], B.bell(B.midi(77), 1.4), 0.07)
w0, w1 = T["whip"]; at(S, w0 - 0.05, B.sweep_noise(0.35, 800, 5200, q=1.1), 0.08)
# one PKP ray: launch, a falling tone while slowed in the core, exit, landing ping beyond the band
r0, r1 = Q["ray3"]; c0, c1 = Q["ray3Core"]
at(S, r0, B.thump(80, 40, 0.5, 0.45)); at(S, r0, rumble(0.8), 0.05)
at(S, r0, B.chirp(620, 560, c0 - r0, 1.0), 0.035); at(S, c0, B.thump(160, 90, 0.12, 0.25)); at(S, c0, B.chirp(520, 330, c1 - c0, 1.0), 0.04)
at(S, c1, B.chirp(360, 420, r1 - c1, 1.0), 0.03); at(S, r1, B.bell(B.midi(81), 1.0), 0.08)
at(S, Q["band"], B.bandnoise(1.0, 120, 600) * np.hanning(int(1.0 * SR)), 0.025); at(S, Q["band"] + 0.35, B.thump(60, 45, 0.3, 0.2))
p0, p1 = T["push"]; at(S, p0, B.sweep_noise(p1 - p0 + 0.1, 2400, 900, q=1.6), 0.06)
# the drum seismograph: motor ticks, the 1929 stamp, the strong arrival scratching across the paper
tk = p1
while tk < T["turn"][0]: at(S, tk, B.click(1500, 0.012, 1.0), 0.018); tk += 0.13
at(S, Q["stamp1929"] + 0.1, B.thump(150, 80, 0.1, 0.35)); at(S, Q["stamp1929"] + 0.1, B.click(900, 0.04, 1.0), 0.1)
sc = B.bandnoise(1.4, 1800, 5200); env = np.exp(-np.arange(len(sc)) / SR * 1.7) * np.abs(np.sin(np.arange(len(sc)) / SR * 26 * np.pi)) ** 0.5
at(S, Q["rec"], sc / (np.abs(sc).max() + 1e-9) * env, 0.05); at(S, Q["rec"], rumble(1.4), 0.09); at(S, Q["rec"], B.thump(70, 40, 0.5, 0.4))
u0, u1 = T["turn"]; at(S, u0, B.sweep_noise(u1 - u0 + 0.1, 900, 3800, q=1.3), 0.09)
at(S, Q["por1936"] + 0.1, B.thump(150, 80, 0.1, 0.3)); at(S, Q["por1936"] + 0.12, B.bell(B.midi(84), 0.9), 0.05)
# the inner core appears
at(S, Q["unveil"], B.sweep_noise(0.6, 900, 4800, q=2.0), 0.05); [at(S, Q["unveil"] + 0.05 + 0.07 * k, B.tink(1.0), 0.03) for k in range(4)]
# one PKiKP ray: launch, slowed in the outer core, a bright tink as it reflects at the inner core, landing bell inside the band
r0, r1 = Q["ray5"]; o0, o1 = Q["ray5Outer"]; bo = Q["ray5Bounce"]
at(S, r0, B.thump(80, 40, 0.5, 0.45)); at(S, r0, B.chirp(620, 560, o0 - r0, 1.0), 0.035); at(S, o0, B.chirp(520, 380, bo - o0, 1.0), 0.04)
at(S, bo, B.tink(1.0), 0.12); at(S, bo, B.bell(B.midi(91), 0.8), 0.06); at(S, bo, B.chirp(380, 470, o1 - bo, 1.0), 0.035)
at(S, r1, B.bell(B.midi(84), 1.2), 0.1); at(S, r1 + 0.18, B.bell(B.midi(88), 1.0), 0.05)
z0, z1 = T["zoom"]; at(S, z0, B.sweep_noise(z1 - z0 + 0.1, 400, 2200, q=1.4), 0.07)
s0, s1 = Q["solid"]; [at(S, s0 + k * (s1 - s0) / 5, B.tink(1.0), 0.05 + 0.01 * k) for k in range(6)]
d0, d1 = T["slide"]; at(S, d0, B.sweep_noise(d1 - d0 + 0.1, 2500, 1200, q=2.5), 0.06); at(S, d1, B.click(2000, 0.03, 1.0), 0.1)
# lesson page: predicted arrivals tick onto the pins; the measured gold arrival lands in the gap; the mismatch ring; the lens reveal; the card
q0, q1 = Q["pred"]
for k, i in enumerate([0, 1, 2, 6, 7, 8]): at(S, q0 + i * 0.05 + 0.4, B.click(1700 + 60 * k, 0.015, 1.0), 0.05)
at(S, Q["meas"], B.sweep_noise(0.5, 1200, 3000, q=2.0), 0.04); at(S, Q["meas"] + 0.5, B.bell(B.midi(86), 1.0), 0.09)
at(S, Q["ring"], B.thump(120, 90, 0.2, 0.3)); at(S, Q["ring"], B.bell(B.midi(74), 1.0), 0.05)
at(S, Q["lens"], B.sweep_noise(0.6, 700, 4200, q=1.8), 0.06); [at(S, Q["lens"] + 0.3 + 0.06 * k, B.tink(1.0), 0.03) for k in range(3)]
at(S, Q["card"], B.click(2200, 0.04, 1.0), 0.14); at(S, Q["card"] + 0.3, B.bell(B.midi(86), 1.0), 0.13)
c_0, c_1 = T["cta"]; at(S, c_0, B.sweep_noise(0.4, 2500, 1200, q=2.5), 0.06); at(S, c_1, B.click(2400, 0.04, 1.0), 0.25)
# music: long pads plus a few sparse, non-periodic notes (no loops)
for t0, ch, dur in [(0.0, [45, 52, 57], 4.1), (3.9, [41, 48, 53], 1.7), (5.4, [43, 50, 55], 4.4), (9.7, [48, 55, 60], 4.3), (13.9, [45, 52, 60], 5.8), (19.6, [41, 48, 57], 2.4), (21.7, [43, 50, 59], 5.2), (26.7, [48, 55, 60, 67], 3.3)]:
    at(M, t0, B.pad([B.midi(n) for n in ch], dur, a=0.6, r=1.4), 0.9)
for x_, m in [(0.4, 69), (2.9, 72), (5.7, 74), (7.4, 71), (9.9, 76), (11.6, 72), (14.3, 69), (16.4, 76), (17.9, 74), (20.1, 79), (22.3, 74), (24.0, 76), (25.6, 79), (27.3, 72)]:
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
