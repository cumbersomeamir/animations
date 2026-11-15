"""Write publishing-caption.txt from script.json, so the post copy always matches the final spoken transcript.

Layout: the hook line; the explanation and payoff lines (l02-l08) as one paragraph; the CTA (l09); one illustration note;
sources; hashtags.
Usage: python3 make_caption.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, "script.json")))
L = {l["id"]: l["text"] for l in S["lines"]}
SOURCES = [
    ("OpenStax, College Physics 2e, 14.7 Radiation", "https://openstax.org/books/college-physics-2e/pages/14-7-radiation"),
    ("University of Illinois Physics Van, The Effectiveness of a Thermos", "https://van.physics.illinois.edu/ask/listing/1851"),
    ("HyperPhysics (Georgia State University), Vacuum Flask", "https://hyperphysics.gsu.edu/hbase/thermo/vacfla.html"),
    ("Royal Institution, James Dewar's vacuum flask", "https://www.rigb.org/node/3131"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07", "l08")),
    L["l09"],
    "The flask is drawn as a cutaway with a widened gap; the heat arrows are illustrations, not measurements.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #physics",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
