"""30 s soundtrack (english-06, adapted from feedback-05; same accepted quiet voice-forward treatment; Hindi Kokoro voice; voice upfront, no repeating music loop; adapted from production 30s-01/02): Kokoro Meshline English narration placed on src/cues.json voiceStarts (voice upfront), quiet original plucked cue +
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
# ---- music (feedback round): NO repeating arpeggio loop. Soft sustained pad per scene, one felt-bass note and a
# two-note mallet "reveal" motif only at scene changes; stays well under the voice.
mus = np.zeros((2, N), np.float32)
SC = list(CU["scenes"].values())
chords = [[("D", 4), ("A", 4)], [("F#", 3), ("D", 4)], [("B", 3), ("F#", 4)], [("G", 3), ("D", 4)], [("E", 3), ("B", 3)], [("A", 3), ("E", 4)], [("D", 4), ("F#", 4)], [("G", 3), ("B", 3)], [("D", 4), ("A", 4)]]
bass = [("D", 2), ("F#", 1), ("B", 1), ("G", 1), ("E", 2), ("A", 1), ("D", 2), ("G", 1), ("D", 2)]
motif = [[("A", 4), ("D", 5)], [("D", 5), ("F#", 5)], [("F#", 4), ("B", 4)], [("D", 5), ("G", 5)], [("B", 4), ("E", 5)], [("E", 5), ("A", 5)], [("F#", 4), ("A", 4)], [("B", 4), ("D", 5)], [("A", 4), ("F#", 5)]]
for i, (a0, b0) in enumerate(SC):
    m.place(mus, m.pad([m.hz(*n) for n in chords[i]], b0 - a0 + 0.9, a=0.5, r=0.9), a0, 0.075)
    m.place(mus, m.felt_bass(m.hz(*bass[i]), min(2.4, b0 - a0) + 0.3), a0, 0.11)
    for j, (n, o) in enumerate(motif[i]): m.place(mus, m.mallet(m.hz(n, o), 0.9, 0.7), a0 + 0.06 + j * 0.22, 0.045, pan=-0.2 + 0.4 * j)
fade = np.ones(N, np.float32); fade[-int(1.0 * SR):] = np.linspace(1, 0, int(1.0 * SR)) ** 1.6; fade[:int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR)); mus *= fade
# ---- percussion + SFX (event-linked)
def gong(f=110, dur=2.5):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 1.4), (2.76, 0.5, 2.2), (5.4, 0.25, 3.5), (8.93, 0.12, 6)])
    return (x * np.minimum(1, t / 0.004)).astype(np.float32)
clap = lambda: m.s_click(0.05, 5000) * 2.0 + m.s_thump(380, 0.06, 0.2)[: int(0.05 * SR)]
drum = lambda: m.s_thump(95, 0.35, 0.3)
sfx = np.zeros((2, N), np.float32)
water = lambda d: m.s_whoosh(d, 220, 900, 1.4)
coin = lambda f=2637: m.s_tick(f, 0.18)
card = lambda: m.s_paper(0.09)
coin = lambda f=2637: m.s_tick(f, 0.18)
ev = [(0.05, lambda: gong(98, 2.4), 0.05, 0), (C["drop"] + 0.05, lambda: m.s_whoosh(0.3, 500, 1400, 1.0), 0.05, 0), (C["land"], lambda: m.s_thump(130, 0.22, 0.7), 0.20, 0), (C["q"], clap, 0.11, 0.2),
      (C["plaque1"], lambda: m.s_paper(0.12), 0.11, 0), (C["zipOpen"], lambda: m.s_glide(900, 1500, 0.38, 0, 6), 0.035, 0.1), (C["zipClose"], lambda: m.s_glide(1500, 900, 0.38, 0, 6), 0.035, -0.1),
      (C["plaque2"], lambda: m.s_paper(0.12), 0.11, 0), (C["tug"] + 0.3, lambda: m.s_thump(200, 0.12, 0.5), 0.12, 0), (C["hold"], lambda: m.s_tick(1568, 0.3), 0.07, 0), (C["fray"], lambda: m.s_paper(0.08), 0.07, 0.4),
      (C["plaque3"], lambda: m.s_paper(0.12), 0.11, 0), (C["bigIn"], lambda: m.s_whoosh(0.4, 400, 1200, 1.0), 0.05, 0.2), (C["marker"], clap, 0.10, -0.2), (C["over"], lambda: m.s_glide(600, 380, 0.4, 0, 3), 0.04, 0.2),
      (C["swap"], lambda: m.s_whoosh(0.5, 500, 1300, 1.0), 0.05, 0), (C["swap"] + 0.45, lambda: m.s_thump(170, 0.12, 0.5), 0.10, 0),
      (C["plaque4"], lambda: m.s_paper(0.12), 0.11, 0), (C["pocket"], lambda: m.s_paper(0.09), 0.09, 0), (C["itemsOut"] + 0.4, lambda: m.s_thump(260, 0.08, 0.4), 0.07, 0.3),
      (C["wipe"], lambda: m.s_whoosh(0.45, 300, 900, 1.0), 0.035, 0), (C["dry"] + 0.3, lambda: m.s_glide(500, 640, 0.6, 0, 3), 0.03, 0),
      (C["ask"], clap, 0.11, -0.3), (C["board"], lambda: m.s_paper(0.12), 0.10, 0.2), (C["rowBags"], lambda: m.s_tick(2093, 0.18), 0.05, 0.2), (C["rowAges"], lambda: m.s_tick(2349, 0.18), 0.05, 0.2),
      (C["testQ"] - 0.4, lambda: m.s_paper(0.12), 0.09, 0), (C["turn"], lambda: m.s_whoosh(0.5, 600, 1500, 1.0), 0.035, 0),
      (C["give"], lambda: m.s_whoosh(0.5, 500, 1300, 1.0), 0.05, 0.2), (C["give"] + 0.55, lambda: m.s_thump(150, 0.12, 0.5), 0.10, 0.3), (C["ready"], lambda: m.s_paper(0.08), 0.08, 0.2),
      (C["leftover"] + 0.75, lambda: m.s_thump(110, 0.15, 0.5), 0.07, 0.4),
      (C["logo"], m.s_chime, 0.045, 0)]
# check ticks sound only when they fall in a pause between sentences (lesson from feedback-05: a click on a word's vowel
# hurt intelligibility); ticks that land inside speech (tick3, tick4, match, yes) are visual only.
for tt in (C["tick1"], C["tick2"]): ev.append((tt, lambda: m.s_tick(1976, 0.35), 0.06, 0.2))
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
