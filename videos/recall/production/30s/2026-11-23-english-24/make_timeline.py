"""Build timeline.json for english-24 from the narration (audio/narration/lines.json + words.json).
Caption groups split at measured word starts (ASR word indices), so captions follow the real voice."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
lines = {l["id"]: l for l in json.load(open(os.path.join(HERE, "audio/narration/lines.json")))["lines"]}
words = {l["id"]: l["words"] for l in json.load(open(os.path.join(HERE, "audio/narration/words.json")))["lines"]}
START = {"l01": 0.05, "l02": 1.75, "l03": 4.75, "l04": 7.95, "l05": 12.35, "l06": 17.05, "l07": 21.9, "l08": 26.45}


def at(lid, k):
    return round(START[lid] + words[lid][k]["start"], 2)


for lid, s in START.items():   # no overlaps, >= 0.15 s gap
    nxt = [v for v in START.values() if v > s]
    assert not nxt or s + lines[lid]["duration"] < min(nxt) - 0.15, lid

T = {k: at(*v) for k, v in {"so2": ("l02", 3), "twelve": ("l03", 4), "mm": ("l04", 6), "over": ("l04", 8), "net": ("l05", 5),
                             "so5": ("l05", 10), "bounce": ("l05", 12), "k2000": ("l06", 4), "so6": ("l06", 11), "bent": ("l07", 5),
                             "or7": ("l07", 6), "stop": ("l07", 10)}.items()}
shots = [("hook_mesh", 0, 1.6), ("peer_react", 1.6, 4.6), ("giant_wave", 4.6, 7.95), ("giant_holes", 7.95, 12.35),
         ("giant_solid", 12.35, T["so5"]), ("giant_bounce", T["so5"], 17.05), ("light_rays", 17.05, 20.4), ("peer_pov", 20.4, 21.9),
         ("door_gap", 21.9, 23.8), ("unplug", 23.8, 26.45), ("cafe_cta", 26.45, 30.0)]
cues = {"turnToCam": T["so2"] + 0.05, "waveTag": T["twelve"], "mmTag": T["mm"], "over": T["over"], "solidTag": T["net"],
        "bounce": T["bounce"], "lightTag": T["k2000"], "gapTag": T["bent"], "gapOpen": 22.2, "notice": 24.0, "unplug": T["stop"] + 0.1,
        "cta": 26.45, "smile2": 27.0, "end": 29.0}
C = lambda a, b, *ls, title=False: {"start": a, "end": b, "lines": [list(map(list, l)) for l in ls], **({"title": True} if title else {})}  # noqa: E731
caps = [
    C(0.0, 1.6, [("THIS WINDOW", 0)], [("IS A METAL NET", 1)], title=True),   # ends at the hook cut (spoken words end 1.51 s)
    C(1.75, T["so2"], [("Light ", 1), ("gets through.", 0)]),
    C(T["so2"], 4.75, [("So why don't", 0)], [("the ", 0), ("microwaves?", 1)]),
    C(4.75, 7.95, [("Microwaves are waves", 0)], [("about ", 0), ("12 centimeters", 1), (" long.", 0)]),
    C(7.95, T["over"], [("The holes are only about", 0)], [("a ", 0), ("millimeter", 1), (" wide,", 0)]),
    C(T["over"], 12.35, [("over a hundred", 0)], [("times ", 0), ("smaller.", 1)]),
    C(12.35, T["so5"], [("To waves that long, the net", 0)], [("is like ", 0), ("solid metal,", 1)]),
    C(T["so5"], 17.05, [("so they ", 0), ("bounce back", 1)], [("inside.", 0)]),
    C(17.05, T["so6"], [("Light waves are about ", 0), ("2,000", 1)], [("times smaller than the holes,", 0)]),
    C(T["so6"], 21.9, [("so they ", 0), ("slip through.", 1)]),
    C(21.9, T["or7"], [("So if the door is ", 0), ("bent,", 1)]),
    C(T["or7"], 26.45, [("or won't close firmly,", 0)], [("stop using it.", 1)]),
    C(26.45, 30.0, [("Download ", 0), ("Recall", 1), (" to turn your", 0)], [("study material into lessons.", 0)]),
]
music = [[0, 4.6, [53, 57, 60, 64]], [4.6, 12.35, [50, 53, 57, 60, 64]], [12.35, 17.05, [48, 53, 55, 58]], [17.05, 21.9, [46, 50, 53, 57]],
         [21.9, 26.45, [45, 48, 52, 57]], [26.45, 30.0, [46, 50, 53, 55, 62]]]
tl = {"fps": 30, "frames": 900, "duration": 30.0, "language": "en",
      "narration": [{"id": k, "start": v} for k, v in START.items()],
      "shots": [{"id": i, "t0": a, "t1": b} for i, a, b in shots], "cues": cues, "captions": caps, "music_sections": music}
json.dump(tl, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
for s in shots:
    print(f"{s[0]:13s} {s[1]:6.2f}-{s[2]:6.2f} ({s[2] - s[1]:.2f}s)")
print(json.dumps(cues))
