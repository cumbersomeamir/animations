"""Write publishing-caption.txt from script.json, so the post copy always matches the final spoken transcript.

Layout: the hook line; the explanation and payoff lines (l02-l09) as one paragraph; the CTA (l10); one illustration note;
sources; hashtags.
Usage: python3 make_caption.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, "script.json")))
L = {l["id"]: l["text"] for l in S["lines"]}
SOURCES = [
    ("Stenfelt (2011), Acoustic and physiologic aspects of bone conduction hearing, Adv Otorhinolaryngol 71", "https://doi.org/10.1159/000323574"),
    ("Reinfeldt et al. (2010), Hearing one's own voice during phoneme vocalization: transmission by air and bone conduction, JASA 128", "https://doi.org/10.1121/1.3458855"),
    ("Orepic et al. (2023), Bone conduction facilitates self-other voice discrimination, R Soc Open Sci 10", "https://doi.org/10.1098/rsos.221561"),
    ("Denk et al. (2023), Occlusion and coupling effects with different earmold designs, Int J Audiol 62", "https://doi.org/10.1080/14992027.2022.2039966"),
]
text = "\n\n".join([
    L["l01"],
    " ".join(L[k] for k in ("l02", "l03", "l04", "l05", "l06", "l07", "l08", "l09")),
    L["l10"],
    "The head cross-section is simplified and the sound paths are drawn slowed down; the hum in the payoff is a sound illustration.",
    "Sources:\n" + "\n".join(f"{t}: {u}" for t, u in SOURCES),
    "#howitworks #science #hearing",
]) + "\n"
open(os.path.join(HERE, "publishing-caption.txt"), "w").write(text)
print(text)
