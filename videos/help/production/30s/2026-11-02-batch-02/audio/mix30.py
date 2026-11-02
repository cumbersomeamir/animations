"""30 s soundtrack (batch-02, adapted from production 30s-01): Kokoro narration placed on src/cues.json voiceStarts (voice upfront), quiet original plucked cue +
percussion-first accents (clapper, frame drum, small gong) and gesture SFX on the same cues the picture uses.
Reuses synth primitives from education/pilot-01/audio/mix.py. Output: build/voice_track.wav, build/mix.wav
(48 kHz stereo, exactly 1,440,000 samples, target -15 LUFS integrated, true peak <= -1.5 dBTP)."""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np
R = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(R.parents[2] / "education/pilot-01/audio"))
import mix as m  # noqa: E402
SR, N = 48000, 1440000
CU = json.loads((R / "src/cues.json").read_text()); C = CU["cues"]
SEN = json.loads((R / "audio/voice/sentences.json").read_text())["sentences"]
B = R / "build"; B.mkdir(exist_ok=True)
def rd(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ar", str(SR), "-ac", "1", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, "<i2").astype(np.float32) / 32768
def wr(p, x):
    x = np.atleast_2d(x)
    with wave.open(str(p), "wb") as w:
        w.setnchannels(x.shape[0]); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x.T, -1, 1) * 32767).astype("<i2").tobytes())
v = np.zeros(N, np.float32); spans = []
for st, s in zip(CU["voiceStarts"], SEN):
    x = rd(R / s["file"]); a = int(st * SR); v[a:a + len(x)] += x[: N - a]; spans.append((st, st + len(x) / SR))
for (a0, a1), (b0, _) in zip(spans, spans[1:]): assert a1 + 0.2 <= b0, f"voice overlap {a1} {b0}"
wr(B / "voice_track.wav", v)
# ---- music: quiet, 80 BPM, D major -> B minor (questions) -> G -> D (resolve); thins under the cold-weather beat
mus = np.zeros((2, N), np.float32); beat = 60 / 80; e8 = beat / 2
secs = [(0, 3.0, [("B", 3), ("D", 4), ("F#", 4)], ("B", 1), 0.4), (3.0, 8.0, [("D", 4), ("F#", 4), ("A", 4)], ("D", 2), 0.6),
        (8.0, 15.25, [("G", 3), ("B", 3), ("D", 4)], ("G", 1), 0.9), (15.25, 18.9, [("E", 4), ("G", 4), ("B", 4)], ("E", 2), 0.4),
        (18.9, 23.3, [("A", 3), ("D", 4), ("E", 4)], ("A", 1), 0.7), (23.3, 30.0, [("D", 4), ("F#", 4), ("A", 4)], ("D", 2), 0.8)]
for a, b, ch, bs, dens in secs:
    tt = a
    while tt < b - 0.05: m.place(mus, m.felt_bass(m.hz(*bs), min(2 * beat, b - tt) + 0.3), tt, 0.13); tt += 2 * beat
    m.place(mus, m.pad([m.hz(*n) for n in ch], b - a + 0.8, a=0.4, r=0.8), a, 0.07)
    k = int(np.ceil(a / e8))
    while k * e8 < b - 0.02 and k * e8 < 29.0:
        if dens >= 0.8 or k % 2 == 0:
            n, o = ch[[0, 2, 1, 2][k % 4]]; m.place(mus, m.mallet(m.hz(n, o + 1), 0.8, 0.75 if k % 2 == 0 else 0.5), k * e8, 0.055, pan=(-0.3 if k % 2 else 0.3))
        k += 1
for i, (n, o) in enumerate([("D", 4), ("A", 4), ("F#", 5)]): m.place(mus, m.mallet(m.hz(n, o + 1), 1.6, 0.7), 28.5 + i * 0.07, 0.06, -0.2 + i * 0.2)
fade = np.ones(N, np.float32); fade[-int(1.0 * SR):] = np.linspace(1, 0, int(1.0 * SR)) ** 1.6; fade[:int(0.4 * SR)] = np.linspace(0, 1, int(0.4 * SR)); mus *= fade
# ---- percussion + SFX (event-linked)
def gong(f=110, dur=2.5):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 1.4), (2.76, 0.5, 2.2), (5.4, 0.25, 3.5), (8.93, 0.12, 6)])
    return (x * np.minimum(1, t / 0.004)).astype(np.float32)
clap = lambda: m.s_click(0.05, 5000) * 2.0 + m.s_thump(380, 0.06, 0.2)[: int(0.05 * SR)]
drum = lambda: m.s_thump(95, 0.35, 0.3)
sfx = np.zeros((2, N), np.float32)
water = lambda d: m.s_whoosh(d, 220, 900, 1.4)
ev = [(0.05, lambda: gong(98, 2.8), 0.06, 0), (0.0, lambda: water(1.6), 0.10, 0), (C["recede"], lambda: water(1.3), 0.07, 0),
      (C["giverIn"], lambda: m.s_whoosh(0.4, 500, 1600, 1.0), 0.05, -0.5),
      (C["house1"], clap, 0.13, 0.0), (C["house2"], clap, 0.13, 0.3), (C["house3"], clap, 0.13, 0.6), (C["sameBoxes"], lambda: m.s_thump(150, 0.15, 0.6), 0.10, -0.5),
      (C["need1"], lambda: m.s_paper(0.08), 0.10, 0.0), (C["need1"] + 0.02, clap, 0.08, 0.0), (C["need2"], lambda: m.s_paper(0.08), 0.10, 0.3), (C["need2"] + 0.02, clap, 0.08, 0.3),
      (C["need3"], lambda: m.s_paper(0.08), 0.10, 0.6), (C["need3"] + 0.02, clap, 0.08, 0.6),
      (C["marketOpen"], lambda: m.s_whoosh(0.5, 2600, 900, 0.8), 0.07, -0.3), (C["marketOpen"] + 0.45, lambda: m.s_click(0.04, 4000), 0.12, -0.3),
      (C["boxOpen"], lambda: m.s_paper(0.14), 0.12, -0.5), (C["boxOpen"] + 0.05, lambda: m.s_thump(260, 0.08, 0.3), 0.08, -0.5),
      (C["tokens"], lambda: m.s_whoosh(0.6, 700, 2400, 1.0), 0.06, 0), (C["tokensLand"], lambda: m.s_tick(1318, 0.25), 0.06, 0.3),
      (C["toMarket"], lambda: m.s_whoosh(0.5, 900, 2000, 1.0), 0.05, -0.2), (C["atMarket"], lambda: m.s_click(0.04, 5000) * 1.5, 0.10, -0.3),
      (C["home"], lambda: m.s_paper(0.1), 0.08, 0.3),
      (C["tick1"], lambda: m.s_tick(1568, 0.35), 0.10, 0.0), (C["tick2"], lambda: m.s_tick(1760, 0.35), 0.10, 0.3), (C["tick3"], lambda: m.s_tick(1976, 0.35), 0.10, 0.6),
      (C["shutter"], lambda: m.s_whoosh(0.4, 1800, 400, 0.8), 0.10, -0.3), (C["shutter"] + 0.38, lambda: m.s_thump(110, 0.3, 0.9), 0.24, -0.3), (C["shutLock"], lambda: m.s_click(0.05, 3000) * 2, 0.12, -0.3),
      (C["supplies"], lambda: m.s_whoosh(0.6, 400, 1500, 1.0), 0.06, 0.2), (C["suppliesLand"], lambda: m.s_thump(140, 0.2, 0.7), 0.14, 0.3),
      (C["board"], clap, 0.14, 0.5), (C["req1"], lambda: m.s_tick(1568, 0.3), 0.08, 0.5), (C["req2"], lambda: m.s_tick(1760, 0.3), 0.08, 0.5), (C["req3"], lambda: m.s_tick(1976, 0.3), 0.08, 0.5),
      (C["glow"], lambda: m.s_chime(), 0.035, 0.3), (C["pileAside"], lambda: m.s_thump(120, 0.25, 0.8), 0.12, -0.5),
      (C["signature"], m.s_chime, 0.04, 0), (28.9, lambda: gong(147, 1.2), 0.035, 0)]
for t, fn, gn, pn in ev: m.place(sfx, fn(), t, gn, pn)
win = int(0.03 * SR); env = np.convolve(np.abs(v), np.ones(win) / win, "same")
act = np.convolve((env > 0.01).astype(np.float32), np.ones(int(.2 * SR)) / int(.2 * SR), "same")
duck = 1 - 0.55 * np.clip(act * 1.5, 0, 1)
mix = np.stack([v, v]) * 0.95 + mus * duck * 0.8 + sfx * (1 - 0.35 * np.clip(act * 1.5, 0, 1))
mix = mix / (np.abs(mix).max() + 1e-9) * 0.7
for name, x in (("music.wav", mus), ("sfx.wav", sfx)): wr(B / name, x)
pre = B / "mix_pre.wav"; wr(pre, mix)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(pre), "-af", "loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1])
af = (f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000,alimiter=limit=0.82:level=false,atrim=end_sample={N},apad=whole_len={N}")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(pre), "-af", af, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(B / "mix.wav")], check=True)
json.dump({"spans": spans, "loudnorm_pass1": {k: js[k] for k in ("input_i", "input_tp")}}, open(B / "mix_info.json", "w"), indent=1)
print("spans", [(round(a, 2), round(b, 2)) for a, b in spans], "pass1", js["input_i"], js["input_tp"])
