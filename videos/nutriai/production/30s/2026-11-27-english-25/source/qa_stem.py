"""QA: speech onsets on the voice stem (build/voice.wav, 10 ms RMS, speech = above -40 dBFS) for caption lines whose ASR word time looks off.
Usage: python qa_stem.py "<caption line>=<search-from seconds>" ...  Prints caption start vs the first speech frame at/after the search point."""
import json, os, sys, wave
import numpy as np
here = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(here, 'timeline.json')))
start = {s: f0 / 30 for c in TL['captions'] for s, f0 in c['lines']}
w = wave.open(os.path.join(here, 'build', 'voice.wav')); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2)[:, 0].astype(np.float32) / 32768
hop = sr // 100; db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop, hop)]))
print('Voice-stem check (build/voice.wav, 10 ms RMS, speech = above -40 dBFS):')
for arg in sys.argv[1:]:
    name, t = arg.rsplit('=', 1); i = int(float(t) * 100); s0 = i
    while i < len(db) and db[i] <= -40: i += 1
    print(f'  {name:24s} caption {start[name]:5.2f}s  stem onset {i / 100:5.2f}s (silence {s0 / 100:.2f}-{i / 100:.2f}s)  diff {start[name] - i / 100:+.2f}')
