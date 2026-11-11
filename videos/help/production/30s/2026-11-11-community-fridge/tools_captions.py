"""Caption cards from script word groups + one ASR timing pass (qa/asr-voice-track.txt, Vosk small-en).
Words are aligned in order to the script; if a sentence's ASR word count differs, that sentence falls back to
character-proportional timing inside its measured voice span. Cards never overlap (>= 2-frame gap)."""
import json, re
from pathlib import Path
from PIL import ImageFont
R = Path(__file__).resolve().parent
CU = json.loads((R / "src/cues.json").read_text()); SEN = json.loads((R / "audio/voice/sentences.json").read_text())["sentences"]
GROUPS = [[5, 5], [5, 5], [10], [3, 5], [7], [6, 6], [6, 8], [5, 2]]   # English words per caption card, per sentence
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
    elif len(span) == sum(ntok): idx = [sum(ntok[:k]) for k in range(len(words))]; times = [span[i][1] for i in idx]; how = "asr (hyphen-aligned)"
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
for c in cards: c.pop("lastWord"); c.pop("sentEnd")
(R / "src/captions.json").write_text(json.dumps({"cards": cards}, indent=1))
for c in cards: print(f"{c['a']:6.2f}-{c['b']:6.2f}  {' / '.join(c['lines'])}   [{c['timing']}]")
