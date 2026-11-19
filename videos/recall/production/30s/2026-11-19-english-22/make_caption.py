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
    ("NXP AN3461, Tilt Sensing Using a Three-Axis Accelerometer", "https://www.nxp.com/docs/en/application-note/AN3461.pdf"),
    ("Agliolo Gallitto & Lupo, A mechanical model of the smartphone's accelerometer (arXiv:1507.02224)", "https://arxiv.org/abs/1507.02224"),
    ("Android Developers, Motion sensors", "https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion"),
    ("Apple Support, Rotate the screen on your iPhone or iPod touch", "https://support.apple.com/en-us/118226"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07")),
    L["l08"],
    "The chip is drawn as a simplified, giant model; real layouts vary and the weight's movement is greatly exaggerated.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #technology #science",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
