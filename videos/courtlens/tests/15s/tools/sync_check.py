"""QA: verify SFX onsets land on diagram action cues (run with the project venv python)."""
import json, os, numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
fx, _ = sf.read(os.path.join(ROOT, 'build/audio/sfx.wav')); x = np.abs(fx).mean(axis=1)
cues = json.load(open(os.path.join(ROOT, 'build/cues.json')))['cues']
win = int(0.005 * SR); env = np.convolve(x, np.ones(win) / win, mode='same')
print("Key action -> SFX onset check (onset = first 5 ms window above 4x the preceding 60 ms mean)")
for c in cues:
    if c['type'] not in ('step', 'verified', 'stepVerified', 'cta', 'logo', 'sort', 'arrive'): continue
    i = int(c['t'] * SR); pre = env[max(0, i - int(0.06 * SR)):i].mean() + 1e-9
    seg = env[i:i + int(0.08 * SR)]
    hit = int(np.argmax(seg > pre * 4)) if np.any(seg > pre * 4) else -1
    print(f"{c['type']:13s} cue {c['t']:6.3f}s  onset {'%+.1f ms' % (hit / SR * 1000) if hit >= 0 else 'masked by preceding sound'}")
