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
    ("U.S. FDA, Microwave Ovens", "https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-ovens"),
    ("HyperPhysics (Georgia State University), Microwave Ovens", "http://hyperphysics.phy-astr.gsu.edu/hbase/Waves/mwoven.html"),
    ("Digitalfire Reference Library (Tony Hansen), Microwave Safe", "https://digitalfire.com/glossary/microwave+safe"),
    ("University of Hawai'i at Manoa CTAHR Cooperative Extension, Microwave Cooking", "https://nutritioncenter.ctahr.hawaii.edu/wp-content/uploads/2022/06/6SeniorsOnlyMicrowaveCooking.pdf"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05")),
    L["l06"],
    "The animation illustrates the idea; the thermal colours are illustrative and the molecules are slowed down enormously.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #kitchenscience",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
