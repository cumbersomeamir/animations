"""Write publishing-caption.txt from script.json, so the post copy always matches the final spoken transcript.

Layout: the hook line; the explanation lines (l02-l04) as one paragraph; the CTA; one illustration note; sources; hashtags.
Usage: python3 make_caption.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, "script.json")))
L = {l["id"]: l["text"] for l in S["lines"]}
SOURCES = [
    ("Google Help Center, Find & improve your location's accuracy (Android)", "https://support.google.com/maps/answer/2839911?hl=en&co=GENIE.Platform%3DAndroid"),
    ("Apple Support, compass accuracy and magnets (article 105073)", "https://support.apple.com/en-us/105073"),
    ("Android Developers, Position sensors", "https://developer.android.com/develop/sensors-and-location/sensors/sensors_position"),
    ("NXP AN4248, Implementing a Tilt-Compensated eCompass", "https://www.nxp.com/docs/en/application-note/AN4248.pdf"),
    ("NOAA NCEI, Geomagnetism FAQ", "https://www.ncei.noaa.gov/products/geomagnetism-frequently-asked-questions"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04")),
    L["l05"],
    "The animation illustrates the idea; it is not a measurement of a real phone.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #technology #science",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
