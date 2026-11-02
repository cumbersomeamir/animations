"""Build captions.json from narration timings + word-group chunks. If asr_words.json exists (faster-whisper word
timestamps per line), chunk splits use the real start time of the first word of each chunk; else word-proportional."""
import json, os
meta = json.load(open('audio/narration/narration_meta.json'))['lines']; src = json.load(open('captions-src.json'))
asr = json.load(open('asr_words.json')) if os.path.exists('asr_words.json') else {}
out = []
for i, ln in enumerate(meta):
    chunks = src[ln['id']]; words = ln['text'].split(); nxt = meta[i + 1]['start'] if i + 1 < len(meta) else 30.0
    end = min(ln['end'] + 0.35, nxt - 0.12, 29.85)
    starts = []
    for lines, wi in chunks:
        if wi == 0: starts.append(ln['start'] - 0.05)
        elif ln['id'] in asr and wi < len(asr[ln['id']]): starts.append(ln['start'] + asr[ln['id']][wi]['start'] - 0.06)
        else: starts.append(ln['start'] + ln['duration'] * wi / len(words))
    for k, (lines, wi) in enumerate(chunks):
        a = starts[k]; b = starts[k + 1] - 0.04 if k + 1 < len(chunks) else end
        out.append({'id': f"{ln['id']}{'abc'[k]}", 'a': round(a, 3), 'b': round(b, 3), 'l': lines})
json.dump(out, open('captions.json', 'w'), indent=1)
for c in out: print(c['id'], c['a'], c['b'], ' / '.join(c['l']))
