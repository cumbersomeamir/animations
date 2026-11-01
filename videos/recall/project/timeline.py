"""Single source of truth for timing: scenes, narration cues and SFX events.

Both render.py (visuals) and audio.py (soundtrack/SFX/narration mix) import this,
so sound stays locked to the action that causes it.
"""
FPS = 30
DURATION = 30.0
W, H = 1080, 1920

VOICE = "af_heart"
VOICE_SPEED = 1.0

# Scene boundaries (seconds)
SCENES = [
    ("hook",     0.0,  2.6),   # cards burst out of the student's head
    ("chase",    2.6,  7.0),   # leap, miss, faceplant, notes scatter
    ("arrive",   7.0, 12.0),   # Recall book drops in, student feeds notes in
    ("practice", 12.0, 18.0),  # book deals small lesson cards, student practises them
    ("review",   18.0, 24.0),  # time passes, a card drifts, review bell, catch
    ("payoff",   24.0, 27.0),  # escaped cards flock back, fanned in hand
    ("end",      27.0, 30.0),  # Recall icon + Explore on Google Play
]

NARRATION = [
    {"id": "n1a", "start": 0.22, "text": "Read it."},
    {"id": "n1b", "start": 0.92, "text": "Forgot it."},
    {"id": "n1c", "start": 1.78, "text": "Again?"},
    {"id": "n2", "start": 4.75, "text": "Notes everywhere. Facts, nowhere."},
    {"id": "n3", "start": 7.75, "text": "Meet Recall. Bring your study material."},
    {"id": "n4", "start": 12.85, "text": "Turn it into lessons and practice."},
    {"id": "n5", "start": 18.45, "text": "Then come back for spaced reviews."},
    {"id": "n6a", "start": 24.35, "text": "Lessons."},
    {"id": "n6b", "start": 25.05, "text": "Practice."},
    {"id": "n6c", "start": 25.75, "text": "Reviews."},
    {"id": "n7", "start": 27.25, "text": "Recall. Explore on Google Play."},
]

# Named action beats (seconds). Visuals and SFX both read these.
T = dict(
    pop=[-0.15, 0.45, 1.0],          # memory cards burst out of head
    look_up=1.25, again=1.78,
    launch=3.0, grab=3.35, land1=3.75,
    swoop=3.85, dive=4.1, crash=4.45,
    sit_up=5.6, cards_exit=5.75, slump=6.4,
    whistle=7.0, tile_land=7.5, tile_hop=7.85,
    pickup=9.0, throw=9.6, gape=9.62, suck=[10.0, 10.15, 10.3, 10.45, 10.6], gulp=10.95,
    rumble=11.1,
    deal=[12.05, 12.25, 12.45, 12.65],
    practice=[14.7, 15.42, 16.14, 16.86], fistpump=17.55,
    drift1=18.6, bell1=19.35, tap1=19.85,
    drift2=21.2, bell2=22.0, tap2=22.4,
    lean=22.75,
    return_=24.0, catch=[24.4, 25.1, 25.8], hop=26.0, toss=26.6,
    icon=27.05, perch=27.45, word=27.55, tagline=27.85, cta=28.2, shine=28.85,
)
