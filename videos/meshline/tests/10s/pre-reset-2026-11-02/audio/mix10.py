"""10s transit-map mix: reuses this app's own original synth helpers (education/pilot-01/audio/mix.py).
Felt-tip pen glides under drawing tips, plucks on stops, a thump when the tower capsule lands, gate ticks,
a soft pad, and the Meshline-blend narration with ducking + limiter."""
import json, sys, wave, importlib.util
from pathlib import Path
import numpy as np
spec = importlib.util.spec_from_file_location("m", str(Path(__file__).resolve().parents[4] / "education/pilot-01/audio/mix.py")); M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
SR = M.SR
cue = json.loads(Path(sys.argv[1]).read_text()); nar = Path(sys.argv[2]); out = Path(sys.argv[3]); N = int(10 * SR)
fx = np.zeros((2, N)); mus = np.zeros((2, N))
for e in cue["events"]:
    ty = e["type"]
    if ty == "pen": s = M.bp(M.noise(1.2), 1800, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * M.T(1.2))) * np.sin(np.pi * M.T(1.2) / 1.2) * 0.25
    elif ty == "stop": s = M.marimba(M.midi(79), 0.35, 0.5)
    elif ty.startswith("bar"): s = M.bell(M.midi([84, 88, 91, 96][int(ty[3])]), 0.35, 0.4)
    elif ty == "land": t = M.T(0.3); s = M.add(np.sin(2 * np.pi * np.cumsum(70 + 100 * np.exp(-t * 30)) / SR) * M.dec(len(t), 12) * 0.8, M.bell(M.midi(72), 0.6, 0.3))
    elif ty == "gate": s = M.hp(M.noise(0.01), 2000) * M.dec(int(0.01 * SR), 300) * 0.7
    elif ty == "sig": s = M.bell(M.midi(98), 0.3, 0.2)
    M.place(fx, s, e["t"], e["gain"], 0.0)
M.place(mus, M.pad([M.midi(n) for n in (50, 57, 62, 65)], 4.5, 0.4, 0.8, 1500), 0.0, 0.3)
M.place(mus, M.pad([M.midi(n) for n in (55, 59, 62, 65)], 3.2, 0.5, 0.8, 1500), 4.3, 0.3)
M.place(mus, M.pad([M.midi(n) for n in (50, 57, 62, 64, 69)], 2.8, 0.5, 1.2, 1800), 7.2, 0.32)
vo = np.zeros((2, N)); env = np.zeros(N); meta = json.loads((nar / "narration_meta.json").read_text())
for ln in meta["lines"]:
    x = M.hp(M.read_wav(nar / ln["file"]), 90); x = M.compress(x); x /= np.max(np.abs(x)) + 1e-9
    M.place(vo, x, ln["start"], 1.0); i0 = int(ln["start"] * SR); env[i0:i0 + len(x)] = 1
from scipy.signal import lfilter
k = np.exp(-1 / (0.3 * SR)); sm = np.clip(lfilter([1 - k], [1, -k], env), 0, 1)
mix = M.reverb(mus, 1.2, 0.2) * 0.6 * (1 - 0.85 * sm) + M.reverb(fx, 0.6, 0.1) * 0.6 * (1 - 0.7 * sm) + 1.6 * M.reverb(vo, 0.4, 0.05)
mix *= np.minimum(1, (N - np.arange(N)) / (0.25 * SR)); mix = M.hp(mix, 25); mix *= 0.13 / np.sqrt(np.mean(mix ** 2)); mix = M.limiter(mix, 0.68)
i0, i1 = int(0.3 * SR), int(7.67 * SR); v = 1.6 * np.sqrt(np.mean(M.bp(vo[0, i0:i1], 300, 4000) ** 2)); b = np.sqrt(np.mean(M.bp((0.6 * mus * (1 - 0.85 * sm) + 0.6 * fx * (1 - 0.7 * sm))[0, i0:i1], 300, 4000) ** 2))
print("voice/bed speech band dB", round(20 * np.log10(v / b), 1))
with wave.open(str(out), "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).T.copy().tobytes())
