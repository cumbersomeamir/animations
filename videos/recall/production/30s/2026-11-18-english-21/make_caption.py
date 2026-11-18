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
    ("J. Walker, Boiling and the Leidenfrost Effect (Fundamentals of Physics essay)", "https://physics.csuchico.edu/ayars/427/handouts/Leidenfrost_Walker.pdf"),
    ("Mathijssen et al., Culinary fluid mechanics and other currents in food science (arXiv:2201.12128)", "https://arxiv.org/abs/2201.12128"),
    ("Brown University, Study reveals final fate of levitating Leidenfrost droplets", "https://www.brown.edu/news/2019-05-06/leidenfrost"),
    ("Emory University, New method reveals minimum heat for levitating drops", "https://news.emory.edu/features/2021/09/new-method-reveals-minimum-heat-levitating-drops"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06")),
    L["l07"],
    "The steam layer is drawn far thicker than the real ~0.1 mm so you can see it; the heat tint, drop sizes and paths are illustrations. Test on an empty, dry pan only.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #cooking",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
