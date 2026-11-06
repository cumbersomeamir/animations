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
    ("Apple, Batteries: Why Lithium-ion?", "https://www.apple.com/batteries/why-lithium-ion/"),
    ("Apple, Batteries: Maximizing Performance", "https://www.apple.com/batteries/maximizing-performance/"),
    ("Texas Instruments SLAA287B, Li-Ion Battery Charger Solution Using an MSP430 MCU", "https://www.ti.com/lit/an/slaa287a/slaa287a.pdf"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04")),
    L["l05"],
    "The animation illustrates the idea; real charging speeds vary by device and settings.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #technology #science",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
