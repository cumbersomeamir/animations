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
    ("US20110047672A1, Glove with conductive fingertips", "https://patents.google.com/patent/US20110047672A1/en"),
    ("US20130104285A1, Knit Gloves with Conductive Finger Pads", "https://patents.google.com/patent/US20130104285A1/en"),
    ("US7163733B2, Touch screen having spacer dots with channels (resistive)", "https://patents.google.com/patent/US7163733B2/en"),
    ("Texas Instruments TSC2046 resistive touch screen controller (datasheet)", "https://www.ti.com/lit/ds/symlink/tsc2046.pdf"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05")),
    L["l06"],
    "The animation illustrates the idea, not a specific phone or glove.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #technology #science",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
