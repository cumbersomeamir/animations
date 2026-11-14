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
    ("OpenStax, College Physics 2e, 15.5 Applications of Thermodynamics: Heat Pumps and Refrigerators", "https://openstax.org/books/college-physics-2e/pages/15-5-applications-of-thermodynamics-heat-pumps-and-refrigerators"),
    ("University of Illinois Physics Van, Open Refrigerator", "https://van.physics.illinois.edu/ask/listing/1790"),
    ("Energy Education (University of Calgary), Refrigerator", "https://energyeducation.ca/encyclopedia/Refrigerator"),
    ("Energy Education (University of Calgary), Air conditioner", "https://energyeducation.ca/encyclopedia/Air_conditioner"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07")),
    L["l08"],
    "The animation illustrates the idea; the room warms only slightly, and the heat bits and fluid colours are illustrative.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #physics #kitchenscience",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
