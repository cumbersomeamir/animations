"""Write publishing-caption.txt from script.json, so the post copy always matches the final spoken transcript.

Layout: the hook line; the explanation and payoff lines (l02-l06) as one paragraph; the CTA (l07); one illustration note;
sources; hashtags.
Usage: python3 make_caption.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, "script.json")))
L = {l["id"]: l["text"] for l in S["lines"]}
SOURCES = [
    ("OpenStax, College Physics 2e, 25.3 The Law of Refraction", "https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction"),
    ("OpenStax, University Physics Volume 3, 2.3 Images Formed by Refraction", "https://openstax.org/books/university-physics-volume-3/pages/2-3-images-formed-by-refraction"),
    ("schoolphysics, Real and apparent depth", "https://schoolphysics.co.uk/age11-14/Light/text/Real_and_apparent_depth/index.html"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06")),
    L["l07"],
    "The light path is drawn with Snell's law for water; the glass, mower and pool are illustrations. About three quarters applies when looking straight down.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #physics",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
