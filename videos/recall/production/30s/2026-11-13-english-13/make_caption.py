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
    ("OpenStax, College Physics 2e, 4.7 Further Applications of Newton's Laws of Motion (Example: What Does the Bathroom Scale Read in an Elevator?)", "https://openstax.org/books/college-physics-2e/pages/4-7-further-applications-of-newtons-laws-of-motion"),
    ("OpenStax, University Physics Volume 1, 5.4 Mass and Weight", "https://openstax.org/books/university-physics-volume-1/pages/5-4-mass-and-weight"),
    ("NIST, SI Units: Mass (mass vs weight)", "https://www.nist.gov/pml/weights-and-measures/si-units-mass"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07")),
    L["l08"],
    "Readings follow a textbook example (75 kg rider, 1.20 m/s²); the slowing reading assumes the same rate, and the ride is sped up for the animation.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #physics #science",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
