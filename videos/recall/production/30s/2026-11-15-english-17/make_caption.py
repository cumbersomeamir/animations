"""Write publishing-caption.txt from script.json, so the post copy always matches the final spoken transcript.

Layout: the hook line; the explanation and payoff lines (l02-l07) as one paragraph; the CTA (l08); one illustration note;
sources; hashtags.
Usage: python3 make_caption.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, "script.json")))
L = {l["id"]: l["text"] for l in S["lines"]}
SOURCES = [
    ("FAA Advisory Circular 25.775-1, Windows and Windshields (2003)", "https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_25_775-1.pdf"),
    ("US Patent 5,988,566, Aircraft window construction (Airbus)", "https://patents.google.com/patent/US5988566A/en"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07")),
    L["l08"],
    "Layer thicknesses, the air dots and the hole marker are drawn larger than life; designs vary between aircraft types.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #aviation",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
