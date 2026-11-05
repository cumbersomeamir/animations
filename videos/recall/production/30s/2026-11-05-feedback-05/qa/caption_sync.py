"""Caption ↔ speech alignment for the Hindi narration.

Each caption group's words are located in the narration by aligning script tokens to the Hindi ASR word timings of
the clean narration WAVs (audio/narration/words.json, Whisper medium) with a fuzzy sequence match, then shifted by
each line's start in timeline.json. Reports, per caption group: first/last spoken word times and the lead/lag of the
caption window. Pass: caption appears no later than 0.15 s after its first word and no earlier than 0.6 s before it,
and stays up until its last word has started.
Usage: audio/.venv/bin/python qa/caption_sync.py
"""
import difflib
import json
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "audio"))
from asr_words import norm  # noqa: E402

TL = json.load(open(os.path.join(ROOT, "timeline.json")))
W = json.load(open(os.path.join(ROOT, "audio", "narration", "words.json")))
SCRIPT = json.load(open(os.path.join(ROOT, "script.json")))
start = {n["id"]: n["start"] for n in TL["narration"]}

def toks(s):
    return [w for w in re.split(r"[\s;,।?!]+", unicodedata.normalize("NFC", s)) if w]

# script tokens with absolute times
timed = []
for line, wl in zip(SCRIPT["lines"], W["lines"]):
    st = toks(line["text"]); aw = wl["words"]
    a = [norm(x) for x in st]; b = [norm(x["w"]) for x in aw]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    t_of = [None] * len(st)
    for i, j, n in sm.get_matching_blocks():
        for k in range(n): t_of[i + k] = aw[j + k]["start"]
    # fill unmatched tokens by interpolation between neighbours
    known = [(i, t) for i, t in enumerate(t_of) if t is not None]
    for i in range(len(st)):
        if t_of[i] is None:
            prev = max([k for k in known if k[0] < i], default=(0, 0.0), key=lambda k: k[0])
            nxt = min([k for k in known if k[0] > i], default=(len(st), wl["duration"]), key=lambda k: k[0])
            t_of[i] = prev[1] + (nxt[1] - prev[1]) * (i - prev[0]) / max(1, nxt[0] - prev[0])
    timed += [(w, start[line["id"]] + t) for w, t in zip(st, t_of)]

rows, pos, ok = [], 0, True
for c in TL["captions"]:
    words = toks(" ".join("".join(seg[0] for seg in ln) for ln in c["lines"]))
    # find this caption's words in the spoken sequence (on-screen-only captions have no VO match)
    seq = [norm(w) for w, _ in timed]
    hit = None
    for i in range(pos, len(seq) - len(words) + 1):
        if all(seq[i + k] == norm(words[k]) for k in range(len(words))):
            hit = i; break
    if hit is None:
        rows.append({"caption": " / ".join("".join(s[0] for s in ln) for ln in c["lines"]), "start": c["start"], "end": c["end"], "spoken": False})
        continue
    t0, t1 = timed[hit][1], timed[hit + len(words) - 1][1]
    lead = round(t0 - c["start"], 2)
    good = -0.15 <= lead <= 0.6 and c["end"] >= t1
    ok &= good
    rows.append({"caption": " / ".join("".join(s[0] for s in ln) for ln in c["lines"]), "start": c["start"], "end": c["end"],
                 "first_word_s": round(t0, 2), "last_word_s": round(t1, 2), "caption_lead_s": lead, "ok": good, "spoken": True})
    pos = hit + len(words)
json.dump({"ok": bool(ok), "rows": rows}, open(os.path.join(HERE, "caption_sync.json"), "w"), ensure_ascii=False, indent=1)
for r in rows: print(r)
print("caption_sync_ok", ok)
sys.exit(0 if ok else 1)
