"""Production 30s mix. Original synthesis only, via this app's own helpers (education/pilot-01/audio/mix.py).
Transit-map sound palette (STYLE.md §7): tuned percussion ostinato that gains voices as the network grows,
a two-note station chime motif, a felt-tip glide under drawing tips, plucks on stops, a pop and low thump when
the interchange lands, soft ticks for capacity turnover, dot ticks for the walking path. Voice upfront.
usage: python audio/mix30.py build/cues.json audio/narration build/mix.wav
"""
import json, sys, wave, importlib.util
from pathlib import Path
import numpy as np
from scipy.signal import lfilter
spec = importlib.util.spec_from_file_location("m", str(Path(__file__).resolve().parents[4] / "education/pilot-01/audio/mix.py")); M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
SR = M.SR; DUR = 30.0; N = int(DUR * SR)
cue = json.loads(Path(sys.argv[1]).read_text()); nar = Path(sys.argv[2]); out = Path(sys.argv[3])

def felt(d):  # felt-tip glide: band-limited noise with slight scratch modulation
    t = M.T(d); return M.bp(M.noise(d), 1500, 5500) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / d) ** 0.6 * 0.22

def sfx(e):
    ty = e['type']
    if ty == 'bar': return M.bell(M.midi([84, 88, 91, 96][e['step']]), 0.35, 0.35)
    if ty == 'retry': t = M.T(0.12); return np.sin(2 * np.pi * np.cumsum(520 - 200 * t / 0.12) / SR) * M.dec(len(t), 25) * 0.25
    if ty in ('pen', 'penShort'): return felt(e['dur'])
    if ty == 'land':
        t = M.T(0.35); thump = np.sin(2 * np.pi * np.cumsum(60 + 110 * np.exp(-t * 28)) / SR) * M.dec(len(t), 11) * 0.8
        return M.add(thump, M.marimba(M.midi(74), 0.4, 0.5), M.marimba(M.midi(81), 0.4, 0.3))
    if ty == 'chime':  # two-note station chime motif
        o = np.zeros(int(1.2 * SR)); a = M.bell(M.midi(81), 0.9, 0.45); b = M.bell(M.midi(76), 0.9, 0.4)
        o[:len(a)] += a; i = int(0.22 * SR); o[i:i + len(b)] += b[:len(o) - i]; return o
    if ty == 'slot': return M.hp(M.noise(0.012), 2500) * M.dec(int(0.012 * SR), 250) * 0.6
    if ty == 'stop': return M.marimba(M.midi(86), 0.25, 0.35)
    if ty == 'turn': return M.hp(M.noise(0.008), 3000) * M.dec(int(0.008 * SR), 350) * 0.5
    if ty == 'zip': return M.whooshf(600, 3200, 0.45) * 0.4
    if ty == 'thunk': t = M.T(0.15); return np.sin(2 * np.pi * np.cumsum(140 + 80 * np.exp(-t * 40)) / SR) * M.dec(len(t), 22) * 0.5
    if ty == 'callout': return M.whooshf(2500, 800, 0.35) * 0.25
    if ty == 'dots':
        d = e['dur']; o = np.zeros(int(d * SR) + 2000)
        for k in range(int(d / 0.11)): c = M.hp(M.noise(0.006), 2500) * M.dec(int(0.006 * SR), 400) * 0.35; i = int(k * 0.11 * SR); o[i:i + len(c)] += c
        return o
    raise ValueError(ty)

fx = np.zeros((2, N))
for e in cue['events']: M.place(fx, sfx(e), e['t'], e['gain'], 0.0)
# score: D-major-ish glock/marimba ostinato, quiet; voices added as the network grows (style §7), thins to pad + chime
mus = np.zeros((2, N)); beat = 60 / 96
M.place(mus, M.pad([M.midi(n) for n in (50, 57, 62, 66)], 30.0, 1.5, 2.0, 1300), 0.0, 0.22)
for k in range(int(DUR / (beat / 2))):
    t = k * beat / 2
    if t > 29.2: break
    notes = [74, 78, 81, 78]
    M.place(mus, M.marimba(M.midi(notes[k % 4]), 0.3, 0.10), t, 1.0, -0.3 if k % 2 else 0.3)
    if t > 7.0 and k % 4 == 0: M.place(mus, M.bell(M.midi([86, 85, 83, 81][(k // 4) % 4] + 12), 0.5, 0.06), t, 1.0, 0.2)   # glock voice joins at the station
    if 12.2 < t < 22.6 and k % 2 == 1: M.place(mus, M.marimba(M.midi([62, 66, 69, 66][k % 4]), 0.25, 0.10), t, 1.0, -0.2)     # crowd voice
    if 12.2 < t < 22.6 and k % 4 == 2: M.place(mus, M.hat(0.25), t, 1.0, 0.3)
vo = np.zeros((2, N)); env = np.zeros(N); meta = json.loads((nar / 'narration_meta.json').read_text())
for ln in meta['lines']:
    x = M.hp(M.read_wav(nar / ln['file']), 90); x = x + 0.2 * M.bp(x, 2500, 5000); x = M.compress(x); x /= np.max(np.abs(x)) + 1e-9
    M.place(vo, x, ln['start'], 1.0); i0 = int(ln['start'] * SR); env[i0:i0 + len(x)] = 1
ka, kr = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.35 * SR))
sm = np.clip(np.maximum(lfilter([1 - kr], [1, -kr], env), lfilter([1 - ka], [1, -ka], env)), 0, 1)
musm = M.reverb(mus, 1.4, 0.22) * (1 - 0.7 * sm); fxm = M.reverb(fx, 0.7, 0.12) * (1 - 0.45 * sm); vom = M.reverb(vo, 0.45, 0.05)
mix = musm + fxm + 1.25 * vom
mix *= np.minimum(1, np.arange(N) / (0.01 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.4 * SR))
mix = M.hp(mix, 30)
# soft-clip short transients before the sample-peak limiter (STYLE.md §7 note on inter-sample peaks)
mix = np.tanh(mix * 1.0)
mix *= 0.135 / np.sqrt(np.mean(mix ** 2)); mix = M.limiter(mix, 0.66)
rows = []
for ln in meta['lines']:
    i0, i1 = int(ln['start'] * SR), int((ln['start'] + ln['duration']) * SR)
    v = np.sqrt(np.mean(M.bp(1.25 * vom[0, i0:i1], 300, 4000) ** 2)); b = np.sqrt(np.mean(M.bp((musm + fxm)[0, i0:i1], 300, 4000) ** 2))
    rows.append({'id': ln['id'], 'start': ln['start'], 'end': ln['end'], 'text': ln['text'], 'speech_band_db': round(20 * np.log10(v / b), 1)})
    print(f"  {ln['id']} {ln['start']:5.2f}-{ln['end']:5.2f}s voice/bed {rows[-1]['speech_band_db']:5.1f} dB")
(out.parent / 'voice_balance.json').write_text(json.dumps(rows, indent=1))
with wave.open(str(out), 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).T.copy().tobytes())
print('mix ->', out)
