"""QA: caption line start vs the ASR word start (base.en, VAD, word timestamps on the final MP4). Writes a table to stdout."""
import ast, json, re, os, sys
here = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(here, 'timeline.json')))
L = open(os.path.join(here, '..', 'qa', 'asr-final-mp4.txt')).read().split('\n')
words = ast.literal_eval(L[1].strip())
norm = lambda w: re.sub(r"[^a-z0-9']", '', w.lower().replace('’', "'"))
alias = {'g': 'grams', 'kcal': 'calories', '100': '100', 'calmeter': 'cal', "it's": 'its'}
toks = [(alias.get(norm(w), norm(w)), s) for w, s, e in words]
p = 0; rows = []
for c in TL['captions']:
    for s, f0 in c['lines']:
        first = s.split()[0]; first = first.split('.')[0] if re.match(r'^[0-9]+\.[0-9]', first) else first; first = norm(first); first = alias.get(first, first)
        j = next((k for k in range(p, min(p + 12, len(toks))) if toks[k][0] == first or toks[k][0].startswith(first)), None)
        if j is None: rows.append((s, f0 / 30, None)); continue
        rows.append((s, f0 / 30, toks[j][1])); p = j + 1
ok = 0
for s, t, a in rows:
    d = None if a is None else t - a
    ok += d is not None and abs(d) <= 0.25
    print(f"{s:28s} caption {t:6.2f}s  speech {('%6.2f' % a) if a is not None else '   n/a'}s  diff {('%+.2f' % d) if d is not None else 'n/a'}")
print(f"{ok} of {len(rows)} caption lines within ±0.25 s of the spoken word (base.en word timestamps)")
