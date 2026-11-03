"""Hindi batch-03 episode mix (airplane mode); same Transit-Map sound palette and quiet voice-forward bed as round 02 / store-and-forward. Original synthesis only, via this app's own helpers (education/pilot-01/audio/mix.py).
Transit-map sound palette (STYLE.md §7): tuned percussion ostinato that gains voices as the network grows,
a two-note station chime motif, a felt-tip glide under drawing tips, plucks on stops, a pop and low thump when
the interchange lands, soft ticks for capacity turnover, dot ticks for the walking path. Voice upfront.
usage: python audio/mix_h3.py build/cues.json audio/narration build/mix.wav
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
    if ty == 'ptt':   # push-to-talk: short squelch burst + key-up beep (radio voice packet leaves)
        sq = M.bp(M.noise(0.07), 900, 4500) * M.dec(int(0.07 * SR), 45) * 0.35
        return M.add(sq, np.pad(np.sin(2 * np.pi * 1450 * M.T(0.05)) * M.dec(int(0.05 * SR), 30) * 0.22, (int(0.06 * SR), 0)))
    if ty == 'pttFail': return M.bp(M.noise(0.18), 1200, 6000) * M.dec(int(0.18 * SR), 14) * 0.3
    if ty == 'fizz':  # signal breaking up
        d = 0.45; x = M.bp(M.noise(d), 1500, 7000); g = (np.sin(2 * np.pi * 37 * M.T(d)) > 0.2).astype(float)
        return x * g * M.dec(len(x), 5) * 0.32
    if ty == 'offline': t = M.T(0.4); return np.sin(2 * np.pi * np.cumsum(330 - 160 * t / 0.4) / SR) * M.dec(len(t), 6) * 0.3
    if ty == 'stamp': t = M.T(0.12); return M.add(np.sin(2 * np.pi * np.cumsum(180 + 120 * np.exp(-t * 40)) / SR) * M.dec(len(t), 30) * 0.45, M.hp(M.noise(0.01), 2000) * 0.4)
    if ty == 'click': return M.add(M.hp(M.noise(0.008), 2500) * M.dec(int(0.008 * SR), 300) * 0.7, np.pad(M.hp(M.noise(0.008), 2500) * M.dec(int(0.008 * SR), 300) * 0.5, (int(0.05 * SR), 0)))
    if ty == 'sweep': return M.whooshf(500, 2500, e['dur']) * 0.3
    if ty == 'relay': return M.bell(M.midi(88), 0.3, 0.25)
    if ty == 'tick':  # soft clock tick while a message waits
        return M.hp(M.noise(0.006), 3500) * M.dec(int(0.006 * SR), 500) * 0.35 + np.sin(2 * np.pi * 2600 * M.T(0.006)) * 0.05
    if ty == 'clacks':  # rail clacks in pairs while the relay travels (style §7)
        d = e['dur']; o = np.zeros(int(d * SR) + 4000); k = 0; tt = 0.0
        while tt < d - 0.1:
            for off in (0.0, 0.09):
                c = M.bp(M.noise(0.025), 600, 3000) * M.dec(int(0.025 * SR), 120) * 0.5; i = int((tt + off) * SR); o[i:i + len(c)] += c
            tt += 0.42; k += 1
        return o * 0.6
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
# quiet bed: two soft sustained pad chords + three sparse glock glints on story turns (no repetitive beat)
mus = np.zeros((2, N))
M.place(mus, M.pad([M.midi(n) for n in (50, 57, 62, 65)], 15.5, 2.5, 3.0, 1100), 0.0, 0.20)
M.place(mus, M.pad([M.midi(n) for n in (53, 57, 60, 64)], 15.0, 3.0, 2.5, 1200), 14.5, 0.20)
for tt, m in ((8.9, 86), (17.5, 89), (26.25, 93)): M.place(mus, M.bell(M.midi(m), 1.2, 0.07), tt, 1.0, 0.0)
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
