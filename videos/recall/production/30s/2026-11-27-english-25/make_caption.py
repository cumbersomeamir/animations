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
    ("G. Sundback, US Patent 1,219,881, Separable fastener (1917)", "https://patents.google.com/patent/US1219881A/en"),
    ("YKK Americas, Pin Lock Sliders vs. Auto Lock Sliders", "https://ykkamericas.com/difference-between-pin-lock-sliders-and-auto-lock-sliders/"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07", "l08")),
    L["l09"],
    "The giant slider and teeth are a simplified model; real sliders and teeth vary by maker, and the drawn lock catch is illustrative.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #engineering #everydayscience",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
