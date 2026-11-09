"""Write publishing-caption.txt from script.json, so the post copy always matches the final spoken transcript.

Layout: the hook line; the explanation lines (l02-l05) as one paragraph; the CTA (l06); one illustration note; sources;
hashtags.
Usage: python3 make_caption.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, "script.json")))
L = {l["id"]: l["text"] for l in S["lines"]}
SOURCES = [
    ("US10185162B2, Single lens glare-reducing eyewear without causing LCD screen blackout", "https://patents.google.com/patent/US10185162B2/en"),
    ("US7633583B2, Controlling polarization for liquid crystal displays", "https://patents.google.com/patent/US7633583B2/en"),
    ("HyperPhysics (Georgia State University), Polarization by Reflection", "http://hyperphysics.phy-astr.gsu.edu/hbase/phyopt/polref.html"),
    ("HyperPhysics (Georgia State University), Classification of Polarization", "http://hyperphysics.phy-astr.gsu.edu/hbase/phyopt/polclas.html"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05")),
    L["l06"],
    "The animation illustrates the idea; the direction of a screen's filter varies by phone.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #physics",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
