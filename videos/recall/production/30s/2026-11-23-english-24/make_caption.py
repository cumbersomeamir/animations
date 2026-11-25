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
    ("HyperPhysics (Georgia State University), Microwave Ovens", "http://hyperphysics.phy-astr.gsu.edu/hbase/Waves/mwoven.html"),
    ("NASA Science, Microwaves", "https://science.nasa.gov/ems/06_microwaves/"),
    ("NASA Science, Visible Light", "https://science.nasa.gov/ems/09_visiblelight/"),
    ("U.S. FDA, Microwave Oven Radiation", "https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-oven-radiation"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07")),
    L["l08"],
    "The giant door is a simplified model: hole and microwave sizes are drawn to scale with each other; light is drawn as rays, not to scale.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #physics",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
