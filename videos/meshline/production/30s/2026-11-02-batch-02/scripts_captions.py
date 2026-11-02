"""captions.json from narration timings + word-group chunks. Each chunk names its first word; with asr_words.json the
chunk starts at the ASR start time of that word (searched in order, punctuation-insensitive), else word-proportional."""
import json, os, re
meta = json.load(open('audio/narration/narration_meta.json'))['lines']; src = json.load(open('captions-src.json'))
asr = json.load(open('asr_words.json')) if os.path.exists('asr_words.json') else {}
k = lambda w: re.sub(r"[^a-z]", "", w.lower())
out = []
for i, ln in enumerate(meta):
    chunks = src[ln['id']]; words = ln['text'].split(); nxt = meta[i + 1]['start'] if i + 1 < len(meta) else 30.0
    end = min(ln['end'] + 0.3, nxt - 0.1, 29.9); starts = []; pos = 0; wpos = 0
    for lines, first in chunks:
        aw = asr.get(ln['id'], []); t0 = None
        for j in range(pos, len(aw)):
            if k(aw[j]['w']).startswith(k(first)) or k(first).startswith(k(aw[j]['w']) or '#'):
                t0 = aw[j]['start']; pos = j + 1; break
        if t0 is None:  # proportional fallback
            wi = next((j for j in range(wpos, len(words)) if k(words[j]).startswith(k(first))), 0); wpos = wi + 1
            t0 = ln['duration'] * wi / len(words)
        starts.append(ln['start'] + (t0 if starts else 0) - 0.05)
    for c, (lines, first) in enumerate(chunks):
        a = starts[c]; b = starts[c + 1] - 0.04 if c + 1 < len(chunks) else end
        out.append({'id': f"{ln['id']}{'abc'[c]}", 'a': round(a, 3), 'b': round(b, 3), 'l': lines})
json.dump(out, open('captions.json', 'w'), indent=1)
for c in out: print(c['id'], c['a'], c['b'], ' / '.join(c['l']))
