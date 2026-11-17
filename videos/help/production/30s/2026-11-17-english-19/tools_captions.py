"""Caption cards from script word groups + one ASR timing pass (qa/asr-voice-track.txt, Vosk small-en).
Words are aligned in order to the script; if a sentence's ASR word count differs, that sentence falls back to
character-proportional timing inside its measured voice span. Cards never overlap (>= 2-frame gap)."""
import difflib, json, re
from pathlib import Path
from PIL import ImageFont
R = Path(__file__).resolve().parent
CU = json.loads((R / "src/cues.json").read_text()); SEN = json.loads((R / "audio/voice/sentences.json").read_text())["sentences"]
GROUPS = [[3, 6], [5], [4], [3, 8], [8], [7, 4], [6], [5, 5], [5, 2]]   # English words per caption card, per sentence
asr = [(w.split("@")[0], float(w.split("@")[1])) for w in (R / "qa/asr-voice-track.txt").read_text().splitlines()[1].split("timed:")[1].split()]
F64 = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf", 56)   # single line allowed down to 56 px
norm = lambda s: re.sub(r"[^a-z']", "", s.lower())
cards, ai = [], 0
for si, (st, s) in enumerate(zip(CU["voiceStarts"], SEN)):
    words = s["say"].split(); end = st + s["dur"]
    # take ASR words that fall inside this sentence's span
    span = [(w, t) for (w, t) in asr if st - 0.15 <= t < end]
    ntok = [len(w.split("-")) for w in words]            # hyphenated words are several ASR tokens
    if len(span) == len(words): times = [t for _, t in span]; how = "asr"
    elif len(span) == len(words) + 1:   # english-14: one extra ASR token (e.g. "india's as one", "share air") -> drop the token that best restores the script
        best = max(range(len(span)), key=lambda j: sum(norm(w) == norm(sw) for (w, _), sw in zip(span[:j] + span[j + 1:], words)))
        times = [t for _, t in span[:best] + span[best + 1:]]; how = f"asr (dropped extra token '{span[best][0]}')"
    elif len(span) == sum(ntok): idx = [sum(ntok[:k]) for k in range(len(words))]; times = [span[i][1] for i in idx]; how = "asr (hyphen-aligned)"
    elif sum(1 for blk in difflib.SequenceMatcher(a=[norm(w) for w in words], b=[norm(w) for w, _ in span], autojunk=False).get_matching_blocks() for _ in range(blk.size)) >= len(words) / 2:
        # english-16: align script words to ASR tokens (Indian terms/numbers split into several tokens); matched words keep ASR times,
        # unmatched words are interpolated by characters between the nearest matched anchors (or the sentence bounds)
        sm = difflib.SequenceMatcher(a=[norm(w) for w in words], b=[norm(w) for w, _ in span], autojunk=False); tm = [None] * len(words); nm = 0
        for blk in sm.get_matching_blocks():
            for q in range(blk.size): tm[blk.a + q] = span[blk.b + q][1]; nm += 1
        cpos = [0]; [cpos.append(cpos[-1] + len(w) + 1) for w in words]
        for q in range(len(words)):
            if tm[q] is not None: continue
            lo = max([j for j in range(q) if tm[j] is not None], default=None); hi = min([j for j in range(q + 1, len(words)) if tm[j] is not None], default=None)
            t0, c0 = (tm[lo], cpos[lo]) if lo is not None else (st + 0.05, 0); t1, c1 = (tm[hi], cpos[hi]) if hi is not None else (end - 0.1, cpos[-1])
            tm[q] = t0 + (t1 - t0) * (cpos[q] - c0) / max(1, c1 - c0)
        times = tm; how = f"asr (aligned {nm}/{len(words)} words)"
    else:
        tot = sum(len(w) + 1 for w in words); acc = 0; times = []
        for w in words: times.append(st + 0.05 + (end - st - 0.1) * acc / tot); acc += len(w) + 1
        how = f"proportional (asr {len(span)} vs {len(words)} words)"
    assert sum(GROUPS[si]) == len(words), (si, sum(GROUPS[si]), len(words))   # every spoken word must appear in a caption
    i = 0
    for n in GROUPS[si]:
        txt = " ".join(words[i:i + n]); lines = [txt]
        if False and F64.getlength(txt) > 900:   # hindi-03: line wrapping is done in-page with the real Devanagari font
            ws = txt.split(); best = min(range(1, len(ws)), key=lambda k: abs(F64.getlength(" ".join(ws[:k])) - F64.getlength(" ".join(ws[k:]))))
            lines = [" ".join(ws[:best]), " ".join(ws[best:])]
        cards.append({"a": round(times[i] - 0.12, 3), "lastWord": times[i + n - 1], "sentEnd": end, "lines": lines, "timing": how}); i += n
for k, c in enumerate(cards):
    nxt = cards[k + 1]["a"] if k + 1 < len(cards) else 29.8
    c["b"] = round(min(nxt - 0.07, max(c["lastWord"] + 0.55, c["sentEnd"] + 0.35)), 3) if k + 1 < len(cards) else 29.7   # CTA card holds to the end
    assert c["b"] > c["a"] + 0.4, c
cards[0]["a"] = max(cards[0]["a"], 0.07)   # 2026-11-15: frame 0 shows only the hook image + its 2-5 words (no caption yet)
for c in cards: c.pop("lastWord"); c.pop("sentEnd")
(R / "src/captions.json").write_text(json.dumps({"cards": cards}, indent=1))
for c in cards: print(f"{c['a']:6.2f}-{c['b']:6.2f}  {' / '.join(c['lines'])}   [{c['timing']}]")
