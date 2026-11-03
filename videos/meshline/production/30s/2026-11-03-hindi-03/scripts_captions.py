"""captions.json from narration timings + word-group chunks (Hindi). Each chunk names its first word; with asr_words.json the
chunk starts at the ASR start time of that word (searched in order). Whisper may write loanwords in Latin script, so words are
compared after mapping known loanwords back to Devanagari and stripping nukta/vowel-length variants; else word-proportional."""
import json, os, re, unicodedata, difflib
meta = json.load(open('audio/narration/narration_meta.json'))['lines']; src = json.load(open('captions-src.json'))
asr = json.load(open('asr_words.json')) if os.path.exists('asr_words.json') else {}
LOAN = {'wi': 'वाई', 'bluetooth': 'ब्लूटूथ', 'ear': 'ईयरबड्स', 'phone': 'फोन', 'radio': 'रेडियो', 'offline': 'ऑफलाइन', 'meshline': 'मेशलाइन', 'pass': 'पास'}
def k(w):
    w = LOAN.get(re.sub(r"[^a-z]", '', w.lower()), w)
    w = unicodedata.normalize('NFD', w).replace('\u093c', '').translate({0x940: 0x93f, 0x942: 0x941, 0x908: 0x907, 0x90a: 0x909, 0x901: 0x902})
    return re.sub(r"[^\u0900-\u097F]", '', w).replace('\u0964', '')
out = []
for i, ln in enumerate(meta):
    chunks = src[ln['id']]; words = ln['text'].split(); nxt = meta[i + 1]['start'] if i + 1 < len(meta) else 30.0
    end = min(ln['end'] + 0.3, nxt - 0.1, 29.9); starts = []; pos = 0; wpos = 0
    for lines, first in chunks:
        aw = asr.get(ln['id'], []); t0 = None; kf = k(first)
        for j in range(pos, len(aw)):
            kw = k(aw[j]['w'])
            if kw and (kw[:2] == kf[:2] or difflib.SequenceMatcher(a=kw, b=kf).ratio() >= 0.6):
                t0 = aw[j]['start']; pos = j + 1; break
        if t0 is None:
            wi = next((j for j in range(wpos, len(words)) if k(words[j])[:2] == kf[:2]), 0); wpos = wi + 1
            t0 = ln['duration'] * wi / len(words)
        starts.append(ln['start'] + (t0 if starts else 0) - 0.05)
    for c, (lines, first) in enumerate(chunks):
        a = starts[c]; b = starts[c + 1] - 0.04 if c + 1 < len(chunks) else end
        out.append({'id': f"{ln['id']}{'abc'[c]}", 'a': round(a, 3), 'b': round(b, 3), 'l': lines})
json.dump(out, open('captions.json', 'w'), indent=1, ensure_ascii=False)
for c in out: print(c['id'], c['a'], c['b'], ' / '.join(c['l']))
