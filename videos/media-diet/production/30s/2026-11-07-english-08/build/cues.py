"""Caption cue timing: split each narration line into its scripted cue groups, snapping cue boundaries to the
nearest real pause (>= 90 ms below -38 dBFS) in the committed narration WAV. Writes src/data/cues.json."""
import json, os, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
SR = 48000
out = []
for line in TL['narration']:
    with wave.open(os.path.join(ROOT, 'audio', 'narration', f"{line['id']}.wav")) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    dur = len(a) / SR
    win = int(0.01 * SR); rms = np.array([np.sqrt(np.mean(a[i:i + win] ** 2)) for i in range(0, len(a) - win, win)])
    quiet = rms < 10 ** (-38 / 20)
    pauses = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) >= 9 and i > 5 and j < len(quiet) - 5: pauses.append(((i + j) / 2) * 0.01)
            i = j
        else: i += 1
    texts = [' '.join(c) for c in line['cues']]
    total = sum(len(t) for t in texts); acc = 0; starts = [0.0]
    for t in texts[:-1]:
        acc += len(t); est = dur * acc / total
        snap = min(pauses, key=lambda p: abs(p - est)) if pauses else est
        starts.append(snap if abs(snap - est) < 0.6 else est)
    for k, c in enumerate(line['cues']):
        t_in = line['start'] + starts[k] - (0.08 if k == 0 else 0.0)
        t_out = line['start'] + (starts[k + 1] if k + 1 < len(starts) else dur + 0.3)
        out.append({'line': line['id'], 'lines': c, 'in': round(t_in, 3), 'out': round(t_out, 3)})
    print(line['id'], f"dur {dur:.2f}", 'pauses', [round(p, 2) for p in pauses], 'cue starts', [round(s, 2) for s in starts])
# a cue never overlaps the next one
for a_, b_ in zip(out, out[1:]): a_['out'] = round(min(a_['out'], b_['in'] - 0.02), 3)
json.dump(out, open(os.path.join(ROOT, 'src', 'data', 'cues.json'), 'w'), indent=1)
for c in out: print(f"{c['in']:6.2f}-{c['out']:6.2f}  {' / '.join(c['lines'])}")
