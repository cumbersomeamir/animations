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
    ("NOAA, Learning Lesson: Sweatin' to the Coldies", "https://www.noaa.gov/node/8545"),
    ("Penn State, METEO 101: Making Do with Dew Points", "https://courses.ems.psu.edu/meteo101/node/1947"),
    ("OpenStax, College Physics 2e, 13.6 Humidity, Evaporation, and Boiling", "https://openstax.org/books/college-physics-2e/pages/13-6-humidity-evaporation-and-boiling"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07")),
    L["l08"],
    "The molecules and drops are drawn huge and slowed down; the insulated-cup tip follows from the same principle.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #weather",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
