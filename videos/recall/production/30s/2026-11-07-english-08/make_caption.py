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
    ("NASA Science, Infrared Waves", "https://science.nasa.gov/ems/07_infraredwaves"),
    ("Samsung Support, How do I test my Samsung TV remote control?", "https://www.samsung.com/ae/support/tv-audio-video/how-to-test-the-samsung-tv-remote-control/"),
    ("Vishay TSOP382/TSOP384, IR Receiver Modules for Remote Control Systems (datasheet)", "https://www.vishay.com/docs/82491/tsop382.pdf"),
    ("US8237121B2, image sensors respond to visible and near-infrared light", "https://patents.google.com/patent/US8237121B2/en"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04")),
    L["l05"],
    "The animation illustrates the idea. Some remotes use Bluetooth instead of infrared and won't flash.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #technology #science",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
