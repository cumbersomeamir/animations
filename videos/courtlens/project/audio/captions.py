"""Build per-word caption timings from the ASR word timestamps (build/vo/asr.json).
Script words are aligned to recognised words (difflib on normalised tokens);
unmatched words are interpolated. Output: build/vo/captions.json (absolute times)."""
import difflib, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tl = json.load(open(os.path.join(ROOT, "timeline.json")))
man = {m["id"]: m for m in json.load(open(os.path.join(ROOT, "build", "vo", "manifest.json")))}
asr = {a["id"]: a for a in json.load(open(os.path.join(ROOT, "build", "vo", "asr.json")))}
norm = lambda s: re.sub(r"[^a-z]", "", s.lower())
out = []
for line in tl["narration"]:
    m, a = man[line["id"]], asr[line["id"]]
    text_words = line["text"].split()
    say_words = line.get("say", line["text"]).split()
    # map each text word to the index of its first "say" word
    t2s, j = [], 0
    for w in text_words:
        t2s.append(j)
        nw = norm(w)
        acc = ""
        while j < len(say_words) and len(acc) < len(nw):
            acc += norm(say_words[j]); j += 1
    heard = [(norm(w), s, e) for w, s, e in a["words"]]
    sm = difflib.SequenceMatcher(None, [norm(w) for w in say_words], [h[0] for h in heard])
    say_t = [None] * len(say_words)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            say_t[blk.a + k] = heard[blk.b + k][1]
    # interpolate gaps
    n = len(say_t)
    known = [i for i, v in enumerate(say_t) if v is not None]
    for i in range(n):
        if say_t[i] is None:
            prev = max([k for k in known if k < i], default=None)
            nxt = min([k for k in known if k > i], default=None)
            if prev is None and nxt is None: say_t[i] = m["duration"] * i / n
            elif prev is None: say_t[i] = max(0.0, say_t[nxt] - 0.25 * (nxt - i))
            elif nxt is None: say_t[i] = say_t[prev] + 0.25 * (i - prev)
            else: say_t[i] = say_t[prev] + (say_t[nxt] - say_t[prev]) * (i - prev) / (nxt - prev)
    accents = [norm(x) for x in line.get("accent", [])]
    words = [{"text": w, "start": round(line["start"] + say_t[t2s[i]], 3), "accent": norm(w) in accents} for i, w in enumerate(text_words)]
    out.append({"id": line["id"], "start": line["start"], "end": m["end"], "words": words, "hideCaption": bool(line.get("hideCaption"))})
    print(line["id"], " ".join(f"{w['text']}@{w['start']:.2f}" for w in words))
json.dump(out, open(os.path.join(ROOT, "build", "vo", "captions.json"), "w"), indent=1)
