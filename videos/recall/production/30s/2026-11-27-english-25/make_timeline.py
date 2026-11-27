"""Build timeline.json for english-25 from the narration (audio/narration/lines.json + words.json).
Caption groups split at measured word starts (ASR word indices), so captions follow the real voice."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
lines = {l["id"]: l for l in json.load(open(os.path.join(HERE, "audio/narration/lines.json")))["lines"]}
words = {l["id"]: l["words"] for l in json.load(open(os.path.join(HERE, "audio/narration/words.json")))["lines"]}
START = {"l01": 0.05, "l02": 2.15, "l03": 5.82, "l04": 8.7, "l05": 11.98, "l06": 16.5, "l07": 19.03, "l08": 22.25, "l09": 26.45}


def at(lid, k):
    return round(START[lid] + words[lid][k]["start"], 2)


for lid, s in START.items():   # no overlaps, >= 0.15 s gap
    nxt = [v for v in START.values() if v > s]
    assert not nxt or s + lines[lid]["duration"] < min(nxt) - 0.15, lid

T = {k: at(*v) for k, v in {"lock": ("l02", 6), "pull2": ("l02", 7), "back": ("l02", 9), "open2": ("l02", 11), "how": ("l02", 12),
                             "Y": ("l03", 8), "walls": ("l04", 3), "squeeze": ("l04", 4), "bump": ("l05", 4), "hollow": ("l05", 7),
                             "so5": ("l05", 8), "nests": ("l05", 11), "pull6": ("l06", 3), "wedge": ("l07", 2), "splits": ("l07", 6),
                             "hold": ("l08", 3), "until": ("l08", 5), "pull8": ("l08", 7)}.items()}
shots = [("hook_giant", 0, 2.0), ("pouch_react", 2.0, 5.75), ("giant_y", 5.75, 8.7), ("giant_close", 8.7, 11.98),
         ("tooth_parts", 11.98, T["so5"]), ("tooth_nest", T["so5"], 16.5), ("pull_test", 16.5, 19.03), ("giant_open", 19.03, 22.25),
         ("lock_catch", 22.25, 24.0), ("pull_tab", 24.0, 26.45), ("cafe_cta", 26.45, 30.0)]
cues = {"zipClose": 2.3, "lockWord": T["lock"], "zipOpen": T["back"] - 0.1, "how": T["how"], "coverLift": 6.0, "yTag": T["Y"],
        "wallsTag": T["walls"], "squeeze": T["squeeze"], "bumpTag": T["bump"], "hollowTag": T["hollow"], "nest": T["nests"] - 0.25,
        "pullApart": T["pull6"], "wedgeTag": T["wedge"], "split": T["splits"], "catchTag": T["hold"], "tabPull": T["pull8"],
        "cta": 26.45, "smile2": 27.0, "end": 29.0}
C = lambda a, b, *ls, title=False: {"start": a, "end": b, "lines": [list(map(list, l)) for l in ls], **({"title": True} if title else {})}  # noqa: E731
caps = [
    C(0.0, 2.0, [("SAME SLIDER,", 0)], [("OPPOSITE JOBS", 1)], title=True),
    C(2.15, T["pull2"], [("Pull it one way,", 0)], [("the teeth ", 0), ("lock.", 1)]),
    C(T["pull2"], T["how"], [("Pull it back,", 0)], [("they ", 0), ("open.", 1)]),
    C(T["how"], 5.82, [("How?", 1)]),
    C(5.82, 8.7, [("Inside, the slider's channel", 0)], [("is shaped like a ", 0), ("Y.", 1)]),
    C(8.7, 11.98, [("Closing, its ", 0), ("slanted walls", 1)], [("squeeze both rows together.", 0)]),
    C(11.98, T["so5"], [("Each tooth has a ", 0), ("bump", 1)], [("and a ", 0), ("hollow,", 1)]),
    C(T["so5"], 16.5, [("so each bump ", 0), ("nests", 1)], [("in the next hollow.", 0)]),
    C(16.5, 19.03, [("Nested, they ", 0), ("hardly", 1)], [("pull apart sideways.", 0)]),
    C(19.03, 22.25, [("Opening, a ", 0), ("wedge", 1), (" between", 0)], [("the arms splits them apart.", 0)]),
    C(22.25, T["until"], [("And many sliders", 0)], [("hold still", 1)]),
    C(T["until"], 26.45, [("until you ", 0), ("pull the tab.", 1)]),
    C(26.45, 30.0, [("Download ", 0), ("Recall", 1), (" to turn your", 0)], [("study material into lessons.", 0)]),
]
music = [[0, 5.75, [53, 57, 60, 64]], [5.75, 11.98, [50, 53, 57, 60, 64]], [11.98, 16.5, [48, 53, 55, 58]], [16.5, 22.25, [46, 50, 53, 57]],
         [22.25, 26.45, [45, 48, 52, 57]], [26.45, 30.0, [46, 50, 53, 55, 62]]]
tl = {"fps": 30, "frames": 900, "duration": 30.0, "language": "en",
      "narration": [{"id": k, "start": v} for k, v in START.items()],
      "shots": [{"id": i, "t0": a, "t1": b} for i, a, b in shots], "cues": cues, "captions": caps, "music_sections": music}
json.dump(tl, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
for s in shots:
    print(f"{s[0]:12s} {s[1]:6.2f}-{s[2]:6.2f} ({s[2] - s[1]:.2f}s)")
print(json.dumps(cues))
