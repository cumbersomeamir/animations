"""Narration cue plan (skill step 2: everything is anchored to cues).

Planned starts are seconds; real durations come from audio/voice/lines.json after tts15.py,
and cue_start/cue_end/beat() read those so visuals follow the real voice (skill step 8 idea).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FPS, W, H, DURATION = 30, 1080, 1920, 15.0
VOICE, SPEED = "am_michael", 1.0

CUES = [
    {"id": "c0", "start": 1.40, "text": "Read it."},
    {"id": "c1", "start": 2.28, "text": "Forgot it?"},
    {"id": "c2", "start": 3.95, "text": "Meet Recall."},
    {"id": "c3", "start": 5.55, "text": "Turn study material into lessons and practice."},
    {"id": "c4", "start": 9.30, "text": "Then come back for spaced reviews."},
    {"id": "c5", "start": 12.35, "text": "Recall. Explore on Google Play."},
]

_meta = None


def _lines():
    global _meta
    if _meta is None:
        p = os.path.join(HERE, "..", "audio", "voice", "lines.json")
        _meta = {l["id"]: l for l in json.load(open(p))["lines"]} if os.path.exists(p) else {}
    return _meta


def cue_start(i):
    return CUES[i]["start"]


def cue_len(i):
    l = _lines().get(CUES[i]["id"])
    return l["duration"] if l else len(CUES[i]["text"].split()) / 2.6


def cue_end(i):
    return cue_start(i) + cue_len(i)


def beat(i, frac):
    """Time at fraction `frac` through cue i (skill: beat(from, i, frac))."""
    return cue_start(i) + cue_len(i) * frac


def F(t):
    return int(round(t * FPS))
