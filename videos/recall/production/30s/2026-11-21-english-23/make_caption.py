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
    ("US EPA, Photoelectric Technology (archived 2009, End of Term Web Archive)", "https://webarchive.library.unt.edu/eot2008/20090508081844/http://epa.gov/radiation/sources/smoke_photo.html"),
    ("Nebraska State Fire Marshal, Photoelectric smoke alarms", "https://sfm.nebraska.gov/node/319"),
    ("U.S. Fire Administration, Smoke alarms", "https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/smoke-alarms/"),
    ("U.S. Fire Administration, When to test smoke alarms", "https://www.usfa.fema.gov/gallery/pictographs/pictograph04.html"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07", "l08")),
    L["l09"],
    "The chamber is drawn as a simplified, giant model of a photoelectric alarm; real layouts vary, and ionization alarms work differently.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #homesafety",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
