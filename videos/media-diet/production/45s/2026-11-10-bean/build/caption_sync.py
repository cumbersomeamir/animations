"""Caption/speech alignment from the narration stem actually used in the mix (audio/narration.wav): for every caption cue,
find speech (10 ms RMS above -40 dBFS) inside the cue and check that the cue appears no later than 0.15 s after speech starts
and stays up until speech ends. Writes qa/caption-sync.json."""
import json, os, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
w = wave.open(os.path.join(ROOT, 'audio', 'narration.wav')); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, w.getnchannels()).mean(1) / 32768
win = sr // 100; rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode='same')); on = rms > 10 ** (-40 / 20)
cues = json.load(open(os.path.join(ROOT, 'src', 'data', 'cues.json'))); out = []
for c in cues:
    i0, i1 = int(c['in'] * sr), int(c['out'] * sr); idx = np.where(on[i0:i1])[0]
    sp0, sp1 = (i0 + idx[0]) / sr, (i0 + idx[-1]) / sr
    before = np.where(on[max(0, i0 - int(0.6 * sr)):i0])[0]   # speech of this cue must not start before the cue appears
    ok = bool(c['in'] <= sp0 + 0.15 and c['out'] >= sp1 and (len(before) == 0 or c['in'] - (max(0, i0 - int(0.6 * sr)) + before[-1]) / sr > 0.0))
    out.append({'line': c['line'], 'text': ' / '.join(c['lines']), 'cue': [c['in'], c['out']], 'speech': [round(sp0, 3), round(sp1, 3)], 'lead_s': round(sp0 - c['in'], 3), 'tail_s': round(c['out'] - sp1, 3), 'ok': ok})
json.dump(out, open(os.path.join(ROOT, 'qa', 'caption-sync.json'), 'w'), ensure_ascii=False, indent=1)
print(f"caption sync: {sum(o['ok'] for o in out)}/{len(out)} cues OK (cue appears ≤0.15 s after speech starts and stays until speech ends)")
for o in out: print(f"  {o['line']} cue {o['cue']} speech {o['speech']} lead {o['lead_s']} tail {o['tail_s']} {'OK' if o['ok'] else 'FAIL'}")
