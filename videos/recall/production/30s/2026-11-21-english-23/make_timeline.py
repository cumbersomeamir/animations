"""Build timeline.json for english-23 from the narration (audio/narration/lines.json + words.json).
Caption groups split at measured word starts, so captions follow the real voice."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
lines = {l["id"]: l for l in json.load(open(os.path.join(HERE, "audio/narration/lines.json")))["lines"]}
words = {l["id"]: l["words"] for l in json.load(open(os.path.join(HERE, "audio/narration/words.json")))["lines"]}
START = {"l01": 0.05, "l02": 1.45, "l03": 5.25, "l04": 8.45, "l05": 12.35, "l06": 16.6, "l07": 18.85, "l08": 22.2, "l09": 26.45}


def at(lid, k):
    """Absolute time of word k of line lid."""
    return round(START[lid] + words[lid][k]["start"], 2)


for lid, s in START.items():   # no overlaps
    nxt = [v for v in START.values() if v > s]
    assert not nxt or s + lines[lid]["duration"] < min(nxt) - 0.15, lid

T = {k: at(*v) for k, v in {"screams": ("l02", 4), "but": ("l02", 5), "light": ("l03", 9), "sensor": ("l04", 6), "so": ("l04", 7),
                             "particles": ("l05", 4), "some": ("l05", 9), "alarm": ("l06", 4), "even": ("l07", 7), "testb": ("l08", 8),
                             "nothing": ("l04", 10)}.items()}
shots = [("hook_alarm", 0, 1.45), ("toast_react", 1.45, T["but"]), ("face_q", T["but"], 5.25), ("giant_open", 5.25, 8.45),
         ("giant_miss", 8.45, 12.35), ("giant_scatter", 12.35, T["some"]), ("giant_hit", T["some"], T["alarm"]), ("alarm_blare", T["alarm"], 18.85),
         ("steam_giant", 18.85, T["even"]), ("react_deadpan", T["even"], 22.2), ("test_wide", 22.2, 24.0), ("test_press", 24.0, 26.45),
         ("cafe_cta", 26.45, 30.0)]
cues = {"toastPop": 1.55, "screams": T["screams"], "lookUp": T["but"] + 0.05, "coverLift": 5.45, "lightTag": T["light"],
        "sensorTag": T["sensor"], "nothing": T["nothing"], "smokeIn": 12.4, "smokeTag": 12.7, "scatter": T["particles"],
        "hit": T["some"], "enough": 16.6, "blare2": T["alarm"], "steamIn": 18.9, "steamTag": 19.1, "deadpan": T["even"] + 0.1,
        "broomUp": 22.45, "press": T["testb"] + 0.08, "smile": 25.0, "cta": 26.45, "smile2": 27.0, "end": 29.0}
C = lambda a, b, *ls, title=False: {"start": a, "end": b, "lines": [list(map(list, l)) for l in ls], **({"title": True} if title else {})}  # noqa: E731
caps = [
    C(0.0, 1.45, [("HOW DOES IT", 0)], [("SEE SMOKE?", 1)], title=True),
    C(1.45, T["but"], [("Burnt toast, and", 0)], [("it ", 0), ("screams.", 1)]),
    C(T["but"], 5.25, [("But what's in that", 0)], [("plastic box?", 1)]),
    C(5.25, 8.45, [("Many alarms hide a small", 0)], [("chamber with a ", 0), ("tiny light.", 1)]),
    C(8.45, T["so"], [("The light aims ", 0), ("away", 1)], [("from the sensor,", 0)]),
    C(T["so"], 12.35, [("so normally it", 0)], [("sees ", 0), ("nothing.", 1)]),
    C(12.35, T["particles"], [("When ", 0), ("smoke", 1), (" drifts in,", 0)]),
    C(T["particles"], T["some"], [("particles ", 0), ("scatter", 1)], [("the light,", 0)]),
    C(T["some"], 16.6, [("and some ", 0), ("hits", 1)], [("the ", 0), ("sensor.", 1)]),
    C(16.6, 18.85, [("Enough light,", 1), (" and", 0)], [("the alarm sounds.", 0)]),
    C(18.85, T["even"], [("Thick ", 0), ("steam", 1), (" can", 0)], [("set it off too,", 0)]),
    C(T["even"], 22.2, [("even with ", 0), ("no fire.", 1)]),
    C(22.2, 26.45, [("So test yours ", 0), ("once a month,", 1)], [("using the ", 0), ("test button.", 1)]),
    C(26.45, 30.0, [("Download ", 0), ("Recall", 1), (" to turn your", 0)], [("study material into lessons.", 0)]),
]
music = [[0, 5.25, [53, 57, 60, 64]], [5.25, 12.35, [50, 53, 57, 60, 64]], [12.35, 16.6, [48, 53, 55, 58]], [16.6, 18.85, [46, 50, 53, 57]],
         [18.85, 22.2, [45, 48, 52, 57]], [22.2, 26.45, [53, 57, 60, 64]], [26.45, 30.0, [46, 50, 53, 55, 62]]]
tl = {"fps": 30, "frames": 900, "duration": 30.0, "language": "en",
      "narration": [{"id": k, "start": v} for k, v in START.items()],
      "shots": [{"id": i, "t0": a, "t1": b} for i, a, b in shots], "cues": cues, "captions": caps, "music_sections": music}
json.dump(tl, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
for s in shots:
    print(f"{s[0]:14s} {s[1]:6.2f}-{s[2]:6.2f} ({s[2] - s[1]:.2f}s)")
print(json.dumps(cues))
