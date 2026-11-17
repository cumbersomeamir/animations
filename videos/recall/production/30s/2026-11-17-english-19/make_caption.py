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
    ("OpenStax, College Physics 2e, 13.5 Phase Changes", "https://openstax.org/books/college-physics-2e/pages/13-5-phase-changes"),
    ("OpenStax, College Physics 2e, 13.6 Humidity, Evaporation, and Boiling (Table 13.5)", "https://openstax.org/books/college-physics-2e/pages/13-6-humidity-evaporation-and-boiling"),
    ("Penn State Extension, Preparing Meals with Pressure Cookers", "https://extension.psu.edu/preparing-meals-with-pressure-cookers"),
    ("New Mexico State University Extension, High-Altitude Cooking (E-215)", "https://pubs.nmsu.edu/_e/E215/"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07", "l08")),
    L["l09"],
    "The cooker is drawn as a cutaway; bubbles, steam dots and the mountain reading (about 90 °C high up) are illustrations. About 120 °C assumes a cooker at about 15 psi.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #cooking",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
