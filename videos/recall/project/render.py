"""Recall - 30 s portrait stickman film. Deterministic vector renderer (pycairo -> raw frames -> FFmpeg).

  .venv/bin/python render.py --stills 0.5 3.3 ...   # PNG stills to ../qa/stills
  .venv/bin/python render.py --video out.mp4         # silent H.264 video (audio muxed by build.sh)
"""
import argparse
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import cairo

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from anim import (Track, arc, bezier, clamp, hash01, in_quad, in_out_cubic, lerp, out_back, out_cubic,  # noqa: E402
                  out_elastic, out_quad, pulse, seg, shake)
from props import (FLOOR, FONT_BLACK, FONT_BOLD, FONT_SEMI, INK, LAV, LIME, PAGE, background, bell, card,  # noqa: E402
                   desk, font, hexc, mix, moon, puff, recall_tile, ring, rrect, sheet, soft_shadow, sparkle,
                   speed_lines, star, sun, text_w, textbook)
from rig import BASE, PoseTrack, draw_stickman, joints  # noqa: E402
from timeline import DURATION, FPS, H, T, W  # noqa: E402

ICON_PATH = os.path.join(HERE, "..", "assets", "icon.png")
STAND_Y = 1192.0
TILE_X, TILE_SIZE = 830.0, 290.0
TILE_Y = FLOOR - TILE_SIZE / 2
NIGHT = hexc("#D6D1E4")

# =============================================================================
# Student performance: keyframed acting + procedural overlays
# =============================================================================
std = dict(f1=None, f2=None)
STUDENT = PoseTrack([
    # --- hook: pacing while reading ------------------------------------------------
    (0.00, dict(hip=(470, STAND_Y), lean=0.05, tilt=0.2, facing=1, h1=(70, 64), h2=(56, 72),
                f1=(498, FLOOR), f2=(442, FLOOR), look=(0.6, 0.7), mouth=0.15, brow=0.1)),
    (1.25, dict(hip=(560, STAND_Y), tilt=-0.18, look=(-0.4, -1), eyes=1.45, browup=7, open=0.3,
                h1=(58, 108), h2=(46, 114), f1=(588, FLOOR), f2=(532, FLOOR)), "lin"),
    (1.78, dict(facing=0.0, tilt=0.0, look=(0, 0), eyes=1.0, browup=0, blink=0.5, brow=0.55, open=0.0,
                mouth=-0.3), "oc"),
    (2.22, dict()),
    (2.42, dict(facing=0.6, h1=(-95, -55), look=(0.8, -0.8), brow=0.8, blink=0.0, mouth=-0.1, eyes=1.1), "oq"),
    (2.62, dict(hip=(565, 1222), lean=0.3, h1=(-75, 30), h2=(-85, 20), look=(1, -1), facing=1.0)),
    (3.00, dict(hip=(570, 1242), lean=0.42), "ioq"),
    # --- chase -----------------------------------------------------------------------
    (3.35, dict(hip=(770, 935), lean=0.18, h1=(33, -140), h2=(-80, 40), f1=(735, 1120), f2=(700, 1095),
                eyes=1.25, open=0.2), "oq"),
    (3.47, dict(hip=(782, 948), open=0.75, eyes=1.55, browup=8, h1=(20, -120)), "oq"),
    (3.75, dict(hip=(800, 1245), lean=0.15, f1=(828, FLOOR), f2=(772, FLOOR), h1=(40, 60), h2=(-50, 60),
                open=0.3), "iq"),
    (3.92, dict(hip=(800, STAND_Y), lean=-0.1, facing=-1, look=(-1, 0.6), eyes=1.2, open=0.0, browup=0,
                brow=0.9, mouth=-0.2), "oc"),
    (4.10, dict(hip=(790, 1238), lean=-0.5, h1=(70, 40), h2=(80, 30)), "ioq"),
    (4.27, dict(hip=(690, 1180), lean=-1.2, h1=(-150, -10), h2=(-145, 15), f1=(870, 1250), f2=(880, 1290),
                eyes=1.3, open=0.45), "oq"),
    (4.45, dict(hip=(608, 1334), lean=-1.5708, h1=(-150, 6), h2=(-146, 22), f1=(800, 1342), f2=(792, 1326),
                eyes=1.0, blink=1.0, open=0.0, mouth=-0.5, brow=-0.3), "iq"),
    (4.55, dict(hip=(612, 1320)), "oq"),
    (4.70, dict(hip=(608, 1334), blink=0.55), "iq"),
    (5.60, dict()),
    (6.00, dict(hip=(530, 1360), lean=0.08, facing=0.35, f1=(662, 1378), f2=(640, FLOOR), h1=(36, 118),
                h2=(-24, 124), tilt=0.15, blink=0.3, brow=-0.6, mouth=-0.35, look=(0.3, -0.6)), "ioc"),
    (6.35, dict(look=(1, -0.3), tilt=-0.1, facing=0.6)),
    (6.75, dict(lean=0.3, tilt=0.32, look=(0, 1), brow=-0.9, mouth=-0.6, facing=0.2, blink=0.35), "ioc"),
    (7.00, dict()),
    # --- arrive -----------------------------------------------------------------------
    (7.15, dict(tilt=-0.35, lean=0.0, facing=0.8, look=(0.7, -1), eyes=1.35, browup=6, open=0.3, brow=0,
                blink=0.0, mouth=0.0), "oc"),
    (7.50, dict()),
    (7.68, dict(hip=(520, 1080), lean=-0.15, h1=(40, -150), h2=(-40, -140), f1=(540, 1270), f2=(500, 1280),
                eyes=1.7, open=0.85, browup=12, tilt=-0.1), "oq"),
    (7.85, dict(hip=(470, STAND_Y), f1=(495, FLOOR), f2=(445, FLOOR), h1=(30, 130), h2=(-25, 135), lean=0.0),
     "iq"),
    (8.05, dict(eyes=1.15, open=0.0, browup=5, mouth=0.45, tilt=-0.12, look=(1, 0), brow=-0.2, lean=0.08,
                facing=1.0), "oc"),
    (8.50, dict(tilt=0.1, mouth=0.65, eyes=1.0)),
    (8.85, dict(hip=(462, 1222), lean=0.85, facing=1, H1=(528, 1425), H2=(552, 1432), hw1=1, hw2=1,
                look=(0.6, 1), mouth=0.3, tilt=0.1, browup=0), "ioc"),
    (9.00, dict()),
    (9.30, dict(hip=(470, STAND_Y), lean=0.0, facing=1, H1=(532, 1082), H2=(548, 1094), look=(1, 0), tilt=0.0),
     "ioc"),
    (9.52, dict(hip=(465, 1206), lean=-0.22, H1=(430, 985), H2=(446, 975), eyes=1.2, mouth=0.5), "ioc"),
    (9.66, dict(hip=(500, 1196), lean=0.3, H1=(640, 1060), H2=(625, 1075), f1=(560, FLOOR), open=0.45), "oq"),
    (9.92, dict(h1=(60, 80), h2=(40, 90), hw1=0, hw2=0, lean=0.1, open=0.2)),
    (10.15, dict(lean=-0.12, tilt=-0.1, blink=0.35, mouth=0.7, open=0.0, h1=(70, -10), h2=(55, 40),
                 hip=(495, STAND_Y), f1=(540, FLOOR), f2=(462, FLOOR))),
    (10.90, dict()),
    (11.05, dict(lean=0.05, blink=0.0, eyes=1.3, open=0.3), "oq"),
    (11.30, dict(hip=(485, STAND_Y), lean=0.15, H1=(535, 1075), H2=(552, 1068), hw1=1, hw2=1, mouth=0.85,
                 eyes=1.15, open=0.0, look=(1, 0.2))),
    (12.00, dict()),
    # --- practice ---------------------------------------------------------------------
    (12.30, dict(hw1=0, hw2=0, h1=(60, -70), h2=(-40, -60), look=(0.4, -1), eyes=1.35, open=0.4, browup=6,
                 lean=-0.05, tilt=-0.15), "ob"),
    (13.40, dict(hip=(485, STAND_Y), f1=(513, FLOOR), f2=(457, FLOOR))),
    (14.10, dict(hip=(560, STAND_Y), facing=0.3, h1=(30, 110), h2=(-25, 115), open=0.0, mouth=0.5,
                 look=(0, -1), f1=(588, FLOOR), f2=(532, FLOOR), lean=0.0, tilt=0.0, eyes=1.1, browup=0), "lin"),
    (14.50, dict(hip=(560, 1208), H1=(510, 1062), H2=(615, 1062), hw1=1, hw2=1, brow=0.6, mouth=0.35,
                 look=(0, -0.6)), "ioc"),
    (17.40, dict()),
    (17.55, dict(hip=(560, 1150), hw1=0, hw2=0, h1=(25, -155), h2=(-30, 110), open=0.55, mouth=1.0, eyes=1.2,
                 brow=-0.2, f1=(588, 1350), f2=(532, 1352)), "ob"),
    (17.75, dict(hip=(560, STAND_Y), f1=(588, FLOOR), f2=(532, FLOOR)), "iq"),
    (18.00, dict(h1=(30, 110), h2=(-25, 115), open=0.0, mouth=0.6, facing=-1, look=(-1, 0))),
    # --- review -----------------------------------------------------------------------
    (18.60, dict(hip=(455, STAND_Y), f1=(427, FLOOR), f2=(483, FLOOR), open=0.18, mouth=0.3), "lin"),
    (18.78, dict(h1=(15, -150), h2=(-15, -150), open=0.7, blink=1.0, tilt=-0.12)),
    (19.20, dict()),
    (19.38, dict(facing=1, h1=(30, 110), h2=(-25, 115), open=0.3, blink=0.0, eyes=1.5, browup=8, look=(1, -0.3),
                 tilt=0.0), "ob"),
    (19.45, dict()),
    (19.82, dict(hip=(620, STAND_Y), f1=(648, FLOOR), f2=(592, FLOOR), lean=0.1), "ioq"),
    (19.88, dict(H1=(682, 1215), hw1=1, eyes=1.0, browup=0, open=0.0, mouth=0.6, look=(0, -1)), "oq"),
    (20.15, dict(hw1=0, h1=(30, 110), look=(0, -1), mouth=0.9, lean=0.0)),
    (20.25, dict(facing=-1, look=(-1, 0))),
    (21.10, dict(hip=(455, STAND_Y), f1=(427, FLOOR), f2=(483, FLOOR)), "ioq"),
    (21.30, dict(h1=(-12, -72), h2=(14, -74), ep1=(1.0, -0.3), ep2=(-1.0, -0.3), lean=-0.05, blink=0.4,
                 mouth=0.5, open=0.15, facing=-0.6)),
    (21.90, dict()),
    (22.03, dict(facing=1, h1=(30, 110), h2=(-25, 115), ep1=(-0.4, 1.0), ep2=(-0.4, 1.0), open=0.3, blink=0.0,
                 eyes=1.5, browup=8, look=(1, -0.3)), "ob"),
    (22.05, dict()),
    (22.38, dict(hip=(620, STAND_Y), f1=(648, FLOOR), f2=(592, FLOOR)), "ioq"),
    (22.43, dict(H1=(682, 1215), hw1=1, eyes=1.0, browup=0, open=0.0, mouth=0.7, look=(0, -1)), "oq"),
    (22.70, dict(hw1=0, h1=(30, 110))),
    (22.98, dict(hip=(628, 1194), lean=0.1, H1=(698, 1104), hw1=1, h2=(-30, 92), ep2=(1.0, 0.2),
                 f1=(598, FLOOR), f2=(652, FLOOR), blink=0.3, mouth=0.8, look=(-0.3, 0), facing=0.6)),
    (24.00, dict()),
    # --- payoff -----------------------------------------------------------------------
    (24.28, dict(hip=(540, STAND_Y), lean=0.0, facing=0.0, H1=(500, 1100), H2=(580, 1100), hw1=1, hw2=1,
                 ep2=(-0.4, 1.0), f1=(568, FLOOR), f2=(512, FLOOR), look=(0.8, -0.6), eyes=1.3, blink=0.0,
                 open=0.3, mouth=0.6)),
    (24.40, dict(look=(0, 0), open=0.0, mouth=0.8)),
    (25.95, dict()),
    (26.05, dict(hip=(540, 1214)), "ioc"),
    (26.25, dict(hip=(540, 1122), hw1=0, hw2=0, h1=(80, -140), h2=(-80, -140), f1=(560, 1305), f2=(520, 1308),
                 open=0.6, mouth=1.0, eyes=1.2), "oq"),
    (26.45, dict(hip=(540, STAND_Y), f1=(568, FLOOR), f2=(512, FLOOR)), "iq"),
    (26.62, dict(h1=(60, -150), h2=(-60, -150), look=(0, -1), open=0.3)),
    # --- end: spring onto the icon --------------------------------------------------
    (27.05, dict(hip=(540, 1232), h1=(50, 40), h2=(-50, 40), look=(0.3, -1), eyes=1.2, open=0.0), "ioc"),
    (27.30, dict(hip=(670, 500), lean=0.0, h1=(70, -110), h2=(-70, -100), f1=(690, 690), f2=(655, 690),
                 scale=0.9, facing=0.2), "oq"),
    (27.45, dict(hip=(688, 574), f1=(762, 690), f2=(736, 700), h1=(50, 110), h2=(-34, 100), look=(0, 0),
                 eyes=1.1, mouth=1.0), "iq"),
    (27.62, dict(h1=(70, -120), facing=0.1), "oc"),
    (30.00, dict()),
])

# walk windows: (t0, t1, stride, bob, run)
WALKS = [(0.0, 1.25, 56, 5, False), (13.4, 14.1, 56, 5, False), (18.0, 18.6, 56, 6, False),
         (19.45, 19.82, 90, 10, True), (20.25, 21.1, 56, 6, False), (22.05, 22.38, 90, 10, True)]
BLINKS = [2.0, 8.3, 12.6, 14.05, 16.0, 20.7, 23.3, 25.4, 28.7, 29.6]


def student_pose(t):
    p = dict(STUDENT(t))
    hx, hy = p["hip"]
    # procedural walking
    for (t0, t1, stride, bob, run) in WALKS:
        if t0 <= t <= t1:
            x0 = STUDENT(t0)["hip"][0]
            dist = abs(hx - x0)
            d = 1 if STUDENT(t1)["hip"][0] >= x0 else -1
            ph = dist / (2 * stride)
            feet = []
            for off in (0.0, 0.5):
                f = (ph + off) % 1.0
                if f < 0.5:
                    rel, lift = stride / 2 - stride * 2 * f, 0.0
                else:
                    g = (f - 0.5) * 2
                    rel, lift = -stride / 2 + stride * g, math.sin(math.pi * g) * (34 if run else 22)
                feet.append((hx + d * rel, FLOOR - lift))
            blend = min(seg(t, t0, t0 + 0.1), 1 - seg(t, t1 - 0.12, t1))
            p["f1"] = lerp(p["f1"], feet[0], blend)
            p["f2"] = lerp(p["f2"], feet[1], blend)
            hy -= abs(math.sin(ph * 2 * math.pi)) * bob * blend
            if run:
                p["lean"] += 0.28 * d * blend
                sw = math.sin(ph * 2 * math.pi) * 60 * blend
                p["h1"] = (p["h1"][0] + sw * d, p["h1"][1] - 30 * blend)
                p["h2"] = (p["h2"][0] - sw * d, p["h2"][1] - 30 * blend)
    # reading nod
    if t < 1.2:
        p["tilt"] += 0.05 * math.sin(t * 2 * math.pi * 1.6)
    # card-pop head jolts
    for tp in T["pop"][1:]:
        p["tilt"] -= 0.12 * pulse(t, tp, 0.18)
    # breathing when upright
    if p["lean"] > -0.6:
        hy += 2.0 * math.sin(t * 2 * math.pi * 0.45)
    # dazed leg twitch
    if 5.0 < t < 5.35:
        k = math.sin((t - 5.0) * 40) * 6
        p["f1"] = (p["f1"][0], p["f1"][1] - abs(k))
    # hand rubbing (anticipation)
    if 11.3 < t < 12.0:
        r = math.sin(t * 2 * math.pi * 5) * 9
        p["H1"] = (p["H1"][0] + r, p["H1"][1])
        p["H2"] = (p["H2"][0] - r, p["H2"][1])
    # practice catches
    for i, ti in enumerate(T["practice"]):
        c = catch_point(i)
        k = "1" if i % 2 == 0 else "2"
        a = out_back(seg(t, ti, ti + 0.25)) * (1 - seg(t, ti + 0.5, ti + 0.64))
        if a > 0:
            p["H" + k] = lerp(p["H" + k], c, clamp(a, 0, 1.15))
            hy += 12 * pulse(t, ti + 0.2, 0.35)
            p["lean"] += (-0.07 if i % 2 == 0 else 0.07) * pulse(t, ti, 0.6)
    # payoff catches: hands pop up as each card is tossed to its slot
    for i, tc in enumerate(T["catch"]):
        u = pulse(t, tc + 0.25, 0.35)
        if u > 0 and t < 26.0:
            p["H1"] = (p["H1"][0], p["H1"][1] - 70 * u)
            p["H2"] = (p["H2"][0], p["H2"][1] - 70 * u)
        hy += 10 * pulse(t, tc - 0.05, 0.25)
    # waving on the icon
    if t > 27.62:
        w = math.sin((t - 27.62) * 2 * math.pi * 1.9) * min(1, (t - 27.62) * 4)
        p["h1"] = (p["h1"][0] + 38 * w, p["h1"][1] + 8 * abs(w))
        p["tilt"] += 0.05 * w
    # auto blinks
    for b in BLINKS:
        p["blink"] = max(p["blink"], pulse(t, b, 0.14))
    p["hip"] = (hx, hy)
    return p


def head_at(t):
    return joints(student_pose(t))["head"]


# =============================================================================
# Memory cards
# =============================================================================
HOVER = {"A": (840, 690), "B": (230, 745), "C": (600, 735)}
SLOTS = [(290, 760, -0.07), (540, 742, 0.0), (790, 760, 0.07)]
WORDS = ["Lessons", "Practice", "Reviews"]


def bob(t, k, amp=10):
    return (math.sin(t * 2 * math.pi * 0.9 + k * 2.1) * amp * 0.6, math.sin(t * 2 * math.pi * 1.3 + k) * amp)


def escaped_pos(name, t):
    """Positions of the three escaping memory cards (hook + chase)."""
    k = "ABC".index(name)
    tp = T["pop"][k]
    hx, hy = head_at(max(0.0, tp))
    start = (hx + 6, hy - 50)
    hov = HOVER[name]
    if t < tp:
        return None
    if name == "A":
        if t < tp + 1.0:
            x = out_cubic(seg(t, tp, tp + 1.0))
            return bezier(start, (start[0] - 60, start[1] - 260), (hov[0] - 40, hov[1] - 120), hov, x)
        if t < 3.25:
            b = bob(t, 0)
            return hov[0] + b[0], hov[1] + b[1]
        dodge = (690, 585)
        if t < 3.45:
            x = out_cubic(seg(t, 3.25, 3.45))
            b = bob(3.25, 0)
            return lerp((hov[0] + b[0], hov[1] + b[1]), dodge, x)
        if t < 5.75:
            b = bob(t, 0) if t > 3.6 else (0, 0)
            s = seg(t, 3.45, 3.6)
            return dodge[0] + b[0] * s, dodge[1] + b[1] * s
        x = in_quad(seg(t, 5.75, 6.3))
        b = bob(5.75, 0)
        return lerp((dodge[0] + b[0], dodge[1] + b[1]), (1240, 610), x)
    if name == "B":
        if t < tp + 0.8:
            x = out_cubic(seg(t, tp, tp + 0.8))
            return bezier(start, (start[0] + 40, start[1] - 240), (hov[0] + 80, hov[1] - 140), hov, x)
        if t < 3.85:
            b = bob(t, 1)
            return hov[0] + b[0], hov[1] + b[1]
        low = (470, 1215)
        if t < 4.0:
            b = bob(3.85, 1)
            return bezier((hov[0] + b[0], hov[1] + b[1]), (hov[0] + 40, hov[1] + 200), (low[0] - 60, low[1]), low,
                          out_quad(seg(t, 3.85, 4.0)))
        if t < 4.12:
            return low[0] + math.sin(t * 40) * 6, low[1]
        up = (262, 772)
        if t < 4.32:
            return lerp(low, up, out_cubic(seg(t, 4.12, 4.32)))
        if t < 5.85:
            s = seg(t, 4.32, 4.5)
            b = bob(t, 1)
            return up[0] + b[0] * s, up[1] + b[1] * s
        x = in_quad(seg(t, 5.85, 6.4))
        b = bob(5.85, 1)
        return lerp((up[0] + b[0], up[1] + b[1]), (-170, 700), x)
    # C: orbits the head during "Again?", then hovers, exits right
    if t < tp + 0.3:
        x = out_quad(seg(t, tp, tp + 0.3))
        return lerp(start, (start[0] + 20, start[1] - 150), x)
    if t < 2.7:
        hx, hy = head_at(min(t, 2.6))
        ang = -math.pi / 2 + (t - tp - 0.3) * 2 * math.pi * 0.62
        o = (hx + math.cos(ang) * 140, hy - 40 + math.sin(ang) * 75 - 70)
        if t < tp + 0.45:
            o = lerp((start[0] + 20, start[1] - 150), o, seg(t, tp + 0.3, tp + 0.45))
        return o
    if t < 5.95:
        hx, hy = head_at(2.7)
        ang = -math.pi / 2 + (2.7 - tp - 0.3) * 2 * math.pi * 0.62
        o = (hx + math.cos(ang) * 140, hy - 40 + math.sin(ang) * 75 - 70)
        b = bob(t, 2)
        return lerp(o, (hov[0] + b[0], hov[1] + b[1]), in_out_cubic(seg(t, 2.7, 3.2)))
    b = bob(5.95, 2)
    return lerp((hov[0] + b[0], hov[1] + b[1]), (1240, 800), in_quad(seg(t, 5.95, 6.5)))


def payoff_card(k, t):
    """Escaped card k returns (from the side it left), is caught, flipped to lime and slotted."""
    tc = T["catch"][k]
    t0 = tc - 0.5
    if t < t0 or t > 27.05:
        return None
    entry = {0: (1240, 600), 1: (-170, 700), 2: (1240, 820)}[k]
    hand = (540, 1092)
    sx, sy, srot = SLOTS[k]
    st = dict(w=230, h=146, front="lines", back="word", color=LAV, back_color=LIME, label=WORDS[k],
              label_size=46, rot=0.0, flip=0.0, wings=1.0, phase=t * 2 * math.pi * 7 + k, alpha=1.0, scale=0.8,
              glow=0.0)
    if t < tc:
        x = out_quad(seg(t, t0, tc))
        ctrl = (entry[0] * 0.5 + 270, 560)
        pos = bezier(entry, ctrl, (hand[0], hand[1] - 260), hand, x)
        st["rot"] = (0.4 if entry[0] > 540 else -0.4) * (1 - x)
        st["scale"] = 0.8
    elif t < tc + 0.3:
        x = out_cubic(seg(t, tc, tc + 0.22))
        pos = hand
        st["flip"] = x
        st["wings"] = 1 - x
        st["glow"] = pulse(t, tc + 0.05, 0.4)
    elif t < 26.6:
        x = out_back(seg(t, tc + 0.3, tc + 0.6))
        b = bob(t, k, 6)
        pos = lerp(hand, (sx + b[0] * 0.5, sy + b[1]), x)
        st.update(flip=1.0, wings=0.0, rot=srot * x, scale=0.8 + 0.2 * x)
    else:
        x = in_out_cubic(seg(t, 26.6, 27.0))
        b = bob(26.6, k, 6)
        pos = lerp((sx + b[0] * 0.5, sy + b[1]), (540, 760), x)
        st.update(flip=1.0, wings=0.0, rot=srot + x * 1.2 * (k - 1), scale=1.0 - 0.75 * x, alpha=1 - in_quad(x))
    st["x"], st["y"] = pos
    return st


def catch_point(i):
    return (445, 1022) if i % 2 == 0 else (688, 1016)


def lesson_card(i, t):
    td = T["deal"][i]
    if t < td:
        return None
    slot = (270 + 180 * i, 760)
    src = (TILE_X, TILE_Y - 120)
    st = dict(w=150, h=108, front="lesson", back="q", color=PAGE, back_color=LAV, flip=0.0, rot=0.0, scale=1.0,
              alpha=1.0, wings=0.0, phase=0.0, glow=0.0)
    tp = T["practice"][i]
    if t < td + 0.5:
        x = seg(t, td, td + 0.5)
        pos = arc(t, td, td + 0.5, src, slot, 220, out_quad)
        st["rot"] = (1 - out_back(x)) * 2.4
        st["scale"] = 0.3 + 0.7 * out_back(x)
    elif t < tp:
        b = bob(t, i + 3, 7)
        pos = (slot[0] + b[0] * 0.4, slot[1] + b[1])
    else:
        b = bob(tp, i + 3, 7)
        s0 = (slot[0] + b[0] * 0.4, slot[1] + b[1])
        c = catch_point(i)
        if t < tp + 0.32:
            st["flip"] = out_cubic(seg(t, tp, tp + 0.14))
            pos = lerp(s0, c, in_quad(seg(t, tp + 0.12, tp + 0.32)))
        elif t < tp + 0.5:
            pos = c
            x = out_cubic(seg(t, tp + 0.32, tp + 0.46))
            st["flip"] = 1 + x
            if x > 0.5:
                st["front"], st["color"] = "check", LIME
            st["glow"] = pulse(t, tp + 0.32, 0.3)
        elif t < tp + 0.72:
            x = in_quad(seg(t, tp + 0.5, tp + 0.72))
            pos = lerp(c, head_at(t), x)
            st.update(flip=2.0, front="check", color=LIME, scale=1 - 0.8 * x, alpha=1 - x * 0.6)
        else:
            return None
    st["x"], st["y"] = pos
    return st


def review_card(n, t):
    td, tb, tt = (T["drift1"], T["bell1"], T["tap1"]) if n == 0 else (T["drift2"], T["bell2"], T["tap2"])
    if t < td or t > tt + 0.4:
        return None
    off = (150, -190) if n == 0 else (115, -150)
    fade = 1.0
    h0 = head_at(td)
    st = dict(w=120, h=86, front="lines", back="check", color=LIME, back_color=LIME, flip=0.0, rot=0.0,
              wings=0.0, phase=t * 2 * math.pi * 6, alpha=1.0, scale=1.0, glow=0.0)
    if t < tt:
        x = out_quad(seg(t, td, tb))
        b = bob(t, n + 7, 6) if t > tb else (0, 0)
        pos = (h0[0] + off[0] * x + b[0], h0[1] - 40 + off[1] * x + b[1])
        st["scale"] = 0.25 + 0.65 * x
        st["color"] = mix(LIME, LAV, fade * seg(t, td + 0.2, tb))
        st["wings"] = seg(t, td + 0.3, tb) * 0.8
        st["alpha"] = 1.0 - 0.25 * fade * seg(t, td + 0.2, tb)
        st["rot"] = 0.12 * math.sin(t * 5)
    else:
        b = bob(tt, n + 7, 6)
        p0 = (h0[0] + off[0] + b[0], h0[1] - 40 + off[1] + b[1])
        x = out_cubic(seg(t, tt, tt + 0.12))
        st["flip"] = x
        st["color"] = mix(mix(LIME, LAV, fade), LIME, x)
        st["wings"] = 0.8 * (1 - x)
        y = in_quad(seg(t, tt + 0.12, tt + 0.38))
        pos = lerp(p0, head_at(t), y)
        st["scale"] = 0.9 - 0.7 * y
        st["glow"] = x
    st["x"], st["y"] = pos
    return st


def draw_card_state(ctx, st):
    if st is None:
        return
    card(ctx, st["x"], st["y"], w=st.get("w", 140), h=st.get("h", 100), rot=st.get("rot", 0.0),
         flip=st.get("flip", 0.0), front=st.get("front", "lines"), back=st.get("back", "q"),
         color=st.get("color", LAV), back_color=st.get("back_color"), wings=st.get("wings", 0.0),
         phase=st.get("phase", 0.0), alpha=st.get("alpha", 1.0), scale=st.get("scale", 1.0),
         label=st.get("label"), glow=st.get("glow", 0.0), label_size=st.get("label_size", 40))


def velocity(fn, t, *args):
    a = fn(*args, t - 0.02) if args else fn(t - 0.02)
    b = fn(*args, t + 0.02) if args else fn(t + 0.02)
    if a is None or b is None:
        return 0.0, 0.0
    return (b[0] - a[0]) / 0.04, (b[1] - a[1]) / 0.04


# =============================================================================
# Notes, textbook, tile
# =============================================================================
SHEET_FLOOR = [(130, 1428), (205, 1458), (290, 1416), (512, 1446), (545, 1422), (578, 1454), (380, 1440),
               (650, 1462)]
PICKED = [3, 4, 5]
SUCK_ORDER = [0, 1, 2, 6, 7]
TILE_MOUTH = (TILE_X, TILE_Y - 20)


def sheet_state(i, t):
    """Returns (x, y, rot, flip, scale, flat, alpha) or None."""
    tc = T["crash"]
    start = (300 + (i - 4) * 6, 1105)
    end = SHEET_FLOOR[i]
    if t < tc:
        return None
    apex = (start[0] + (end[0] - start[0]) * 0.4 + (hash01(i) - 0.5) * 160, 700 + hash01(i + 9) * 180)
    t_up = tc + 0.3 + hash01(i + 3) * 0.12
    t_land = tc + 0.95 + hash01(i + 5) * 0.45
    spin = (hash01(i + 11) - 0.5) * 9
    if t < t_up:
        x = out_quad(seg(t, tc, t_up))
        pos = lerp(start, apex, x)
        return pos[0], pos[1], spin * x, math.cos(t * 9 + i), 1.0, 0.0, 1.0
    if t < t_land:
        x = seg(t, t_up, t_land)
        sway = math.sin(x * math.pi * 3 + i) * 50 * (1 - x)
        pos = (lerp(apex[0], end[0], x) + sway, lerp(apex[1], end[1], in_quad(x) * 0.6 + x * 0.4))
        flat = seg(x, 0.8, 1.0)
        return pos[0], pos[1], spin * (1 - x) * 0.6 + 0.15 * math.sin(i), lerp(math.cos(t * 7 + i), 1, flat), 1.0, flat, 1.0
    rest = (end[0], end[1], 0.15 * math.sin(i * 1.7), 1.0, 1.0, 1.0, 1.0)
    if i in PICKED:
        if t < T["pickup"]:
            return rest
        j = PICKED.index(i)
        st = student_pose(min(t, T["throw"]))
        jj = joints(st)
        hand = lerp(jj["hand1"], jj["hand2"], 0.5)
        hold = (hand[0] + j * 4, hand[1] - 30 - j * 5)
        if t < T["pickup"] + 0.12:
            x = seg(t, T["pickup"], T["pickup"] + 0.12)
            return lerp(end[0], hold[0], x), lerp(end[1], hold[1], x), lerp(rest[2], 0.1 * j, x), 1.0, 1.0, 1 - x, 1.0
        if t < T["throw"]:
            return hold[0], hold[1], 0.1 * j - 0.05, 1.0, 1.0, 0.0, 1.0
        tl = T["throw"] + 0.32 + j * 0.04
        if t < tl:
            x = seg(t, T["throw"], tl)
            pos = arc(t, T["throw"], tl, hold, TILE_MOUTH, 160 + j * 30)
            return pos[0], pos[1], x * (4 + j), math.cos(x * 8), 1 - 0.85 * in_quad(x), 0.0, 1.0
        return None
    j = SUCK_ORDER.index(i)
    ts = T["suck"][j]
    if t < ts:
        lift = seg(t, ts - 0.35, ts)
        if lift > 0:
            return (end[0] + math.sin(t * 50 + i) * 3 * lift, end[1] - 14 * lift, rest[2], 1.0, 1.0,
                    1 - 0.6 * lift, 1.0)
        return rest
    tl = ts + 0.38
    if t < tl:
        x = in_quad(seg(t, ts, tl))
        mid = ((end[0] + TILE_MOUTH[0]) / 2, min(end[1], TILE_MOUTH[1]) - 200)
        pos = bezier((end[0], end[1] - 14), mid, (TILE_MOUTH[0] - 120, TILE_MOUTH[1] - 60), TILE_MOUTH, x)
        return pos[0], pos[1], x * 7, math.cos(x * 12), 1 - 0.85 * x, 0.4 * (1 - x), 1.0
    return None


def draw_sheet(ctx, st, i):
    if st is None:
        return
    x, y, rot, flip, scale, flat, alpha = st
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(1, 1 - 0.62 * flat)
    sheet(ctx, 0, 0, rot=rot, flip=flip, scale=scale, alpha=alpha, seed=i)
    ctx.restore()


def closed_book(ctx, x, y, rot=0.0, scale=1.0, flat=0.0):
    ctx.save()
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale * (1 - 0.3 * flat))
    rrect(ctx, -54, -15, 108, 30, 6)
    ctx.set_source_rgba(*LAV); ctx.fill_preserve()
    ctx.set_source_rgba(*INK); ctx.set_line_width(6); ctx.stroke()
    ctx.set_line_width(3)
    for k in range(3):
        ctx.move_to(-40, -6 + k * 6); ctx.line_to(46, -6 + k * 6)
    ctx.set_source_rgba(*INK[:3], 0.5); ctx.stroke()
    ctx.restore()


def textbook_state(t):
    """('held', None) | ('closed', (x, y, rot, scale, flat)) | None"""
    if t < 2.36:
        return ("held", None)
    if t < 2.8:
        st = joints(student_pose(2.36))
        p0 = lerp(st["hand1"], st["hand2"], 0.5)
        pos = arc(t, 2.36, 2.8, p0, (255, 1104), 200)
        return ("closed", (pos[0], pos[1], -seg(t, 2.36, 2.8) * 2 * math.pi * 1.0, 1.0, 0.0))
    if t < T["crash"]:
        return ("closed", (255, 1104 - 6 * pulse(t, 2.8, 0.15), 0.0, 1.0, 0.0))
    if t < 5.25:
        pos = arc(t, T["crash"], 5.25, (255, 1104), (232, 1440), 260, linear_ease)
        return ("closed", (pos[0], pos[1], seg(t, T["crash"], 5.25) * 2 * math.pi * 1.25, 1.0, seg(t, 5.1, 5.25)))
    ts = 10.62
    if t < ts:
        return ("closed", (232, 1440, 0.0, 1.0, 1.0))
    if t < T["gulp"]:
        x = in_quad(seg(t, ts, T["gulp"]))
        pos = bezier((232, 1440), (420, 1100), (TILE_MOUTH[0] - 140, TILE_MOUTH[1] - 80), TILE_MOUTH, x)
        return ("closed", (pos[0], pos[1], x * 9, 1 - 0.8 * x, 1 - x))
    return None


def linear_ease(x):
    return x


def tile_state(t):
    """Returns dict for recall_tile or None. Also 'png' alpha for the real icon crossfade."""
    if t < T["whistle"]:
        return None
    st = dict(x=TILE_X, y=TILE_Y, size=TILE_SIZE, sx=1.0, sy=1.0, rot=0.0, gape=0.0, glow=0.0, shine=-1.0,
              png=0.0, alpha=1.0)
    tl = T["tile_land"]
    if t < tl:
        x = in_quad(seg(t, T["whistle"], tl))
        st["y"] = lerp(-260, TILE_Y, x)
        st["sy"], st["sx"] = 1.12, 0.92
        st["rot"] = 0.06 * math.sin(t * 9)
        return st
    if t < 8.0:
        k = seg(t, tl, 8.0)
        sq = math.exp(-6 * k) * math.cos(k * 16)
        st["sy"] = 1 - 0.3 * sq
        st["sx"] = 1 + 0.22 * sq
    # friendly hop + shine on "Meet Recall"
    hop = pulse(t, 7.95, 0.36)
    st["y"] -= 46 * hop
    st["shine"] = seg(t, 8.05, 8.6) if 8.05 <= t <= 8.6 else -1.0
    # gape open while eating study material
    if T["gape"] - 0.05 <= t <= T["gulp"] + 0.12:
        st["gape"] = out_back(seg(t, T["gape"] - 0.05, T["gape"] + 0.08)) * (1 - seg(t, T["gulp"], T["gulp"] + 0.12))
        st["glow"] = seg(t, 9.95, 10.1) * (1 - seg(t, T["gulp"], T["gulp"] + 0.3))
        st["rot"] = 0.025 * math.sin(t * 22) * st["glow"]
    swallow = [T["throw"] + 0.36] + [s + 0.38 for s in T["suck"]] + [T["gulp"]]
    for s in swallow:
        u = pulse(t, s, 0.18)
        st["sy"] += 0.08 * u
        st["sx"] -= 0.05 * u
    g = pulse(t, T["gulp"], 0.3)
    st["sy"] -= 0.14 * g
    st["sx"] += 0.1 * g
    # processing rumble
    if T["rumble"] <= t < 12.0:
        k = seg(t, T["rumble"], 12.0)
        st["rot"] = 0.03 * math.sin(t * 48) * (0.4 + k)
        st["x"] += 3 * math.sin(t * 61)
        st["glow"] = 0.3 + 0.4 * k
    # dealing lesson cards
    for d in T["deal"]:
        u = pulse(t, d - 0.04, 0.2)
        st["sy"] += 0.1 * u
        st["gape"] = max(st["gape"], 0.5 * u)
        st["glow"] = max(st["glow"], 0.4 * u)
    # review taps
    for tp in (T["tap1"], T["tap2"]):
        u = pulse(t, tp, 0.2)
        st["sy"] -= 0.1 * u
        st["sx"] += 0.06 * u
        st["glow"] = max(st["glow"], pulse(t, tp, 0.5))
    # leap to the centre for the end card
    if t >= T["toss"]:
        x = in_out_cubic(seg(t, T["toss"], T["icon"]))
        pos = arc(t, T["toss"], T["icon"], (TILE_X, TILE_Y), (540, 760), 260, in_out_cubic)
        st["x"], st["y"] = pos
        st["size"] = lerp(TILE_SIZE, 360, x)
        st["rot"] = -2 * math.pi * x
        st["glow"] = 0.6 * x
        if t >= T["icon"]:
            k = seg(t, T["icon"], T["icon"] + 0.35)
            st["size"] = 360 * (1 + 0.14 * math.sin(math.pi * k) * (1 - k))
            st["rot"] = 0.0
            st["png"] = seg(t, T["icon"], T["icon"] + 0.2)
            st["glow"] = 0.6 * (1 - k) + 0.25
        st["shine"] = seg(t, T["shine"], T["shine"] + 0.6) if t >= T["shine"] else -1.0
    return st


# =============================================================================
# Captions (screen space)
# =============================================================================
CAPTIONS = [
    (0.22, 2.62, [("Read it.", 0.22, ()), ("Forgot it.", 0.92, ()), ("Again?", 1.78, ("Again?",))]),
    (4.75, 6.95, [("Notes everywhere.", 4.75, ()), ("Facts, nowhere.", 5.75, ("nowhere.",))]),
    (7.75, 8.52, [("Meet Recall.", 7.75, ("Recall.",))]),
    (8.55, 11.9, [("Bring your", 8.55, ()), ("study material.", 8.95, ("study", "material."))]),
    (12.85, 17.9, [("Turn it into lessons", 12.85, ("lessons",)), ("and practice.", 13.6, ("practice.",))]),
    (18.45, 23.9, [("Then come back for", 18.45, ()), ("spaced reviews.", 19.25, ("spaced", "reviews."))]),
]
CAP_Y = 250
CAP_MAX_W = 940


def draw_captions(ctx, t):
    for (t0, t1, lines) in CAPTIONS:
        if not (t0 - 0.05 <= t <= t1 + 0.25):
            continue
        out = seg(t, t1, t1 + 0.22)
        size = 96
        font(ctx, FONT_BLACK, size)
        widest = max(text_w(ctx, ln) for ln, _, _ in lines)
        if widest > CAP_MAX_W:
            size = size * CAP_MAX_W / widest
        font(ctx, FONT_BLACK, size)
        lh = size * 1.12
        n = len(lines)
        top = CAP_Y + (3 - n) * lh * 0.0
        for li, (ln, ts, hl) in enumerate(lines):
            words = ln.split(" ")
            space = text_w(ctx, " ")
            total = sum(text_w(ctx, w) for w in words) + space * (len(words) - 1)
            x = 540 - total / 2
            y = top + li * lh + lh * 0.5
            for wi, w in enumerate(words):
                ww = text_w(ctx, w)
                tw = ts + wi * 0.1
                a = seg(t, tw, tw + 0.16)
                if a <= 0:
                    x += ww + space
                    continue
                s = max(1e-3, out_back(a, 2.4))
                alpha = clamp(a * 2) * (1 - out)
                ctx.save()
                ctx.translate(x + ww / 2, y - out * 40)
                ctx.scale(s, s)
                if w in hl:
                    m = out_cubic(seg(t, tw + 0.08, tw + 0.32))
                    if m > 0:
                        ctx.save()
                        ctx.transform(cairo.Matrix(1, 0, -0.12, 1, 0, 0))
                        rrect(ctx, -ww / 2 - 12, -size * 0.36, (ww + 24) * m, size * 0.78, 12)
                        ctx.set_source_rgba(*LIME[:3], alpha)
                        ctx.fill()
                        ctx.restore()
                fe = ctx.font_extents()
                ctx.move_to(-ww / 2, (fe[0] - fe[1]) / 2 * 0.86)
                ctx.set_source_rgba(*INK[:3], alpha)
                ctx.show_text(w)
                ctx.restore()
                x += ww + space


# =============================================================================
# Frame
# =============================================================================
_ICON = None


def icon_surface():
    global _ICON
    if _ICON is None:
        _ICON = cairo.ImageSurface.create_from_png(ICON_PATH)
    return _ICON


def days_at(t):
    keys = Track([(18.0, 0.0), (T["bell1"], 1.0, "ios"), (T["bell2"], 3.0, "ios"), (24.6, 5.2, "ios")])
    return keys(t)


def draw_review_time(ctx, t):
    """Time-lapse: sun/moon arc and a day ruler whose review marks spread further apart."""
    vis = seg(t, 18.0, 18.35) * (1 - seg(t, 24.0, 24.4))
    if vis <= 0:
        return 0.0
    d = days_at(t)
    frac = d % 1.0
    # sky bodies
    u = frac * 2
    if u < 1:
        x = 540 - 640 * math.cos(math.pi * u)
        y = 860 - 230 * math.sin(math.pi * u)
        sun(ctx, x, y, 40, rot=t, alpha=vis * clamp(math.sin(math.pi * u) * 3))
    else:
        u -= 1
        x = 540 - 640 * math.cos(math.pi * u)
        y = 860 - 230 * math.sin(math.pi * u)
        moon(ctx, x, y, 36, alpha=vis * clamp(math.sin(math.pi * u) * 3))
    night = max(0.0, math.sin(math.pi * (frac * 2 - 1))) if frac > 0.5 else 0.0
    # ruler
    px_per_day = 250
    y0 = 1470
    ctx.set_line_cap(1)
    ctx.set_source_rgba(*INK[:3], 0.85 * vis)
    ctx.set_line_width(5)
    ctx.move_to(40, y0); ctx.line_to(1040, y0); ctx.stroke()
    first = math.floor(d - 2.5)
    for k in range(first * 2, int((d + 3) * 2) + 1):
        dd = k / 2
        x = 540 + (dd - d) * px_per_day
        if 40 <= x <= 1040:
            ln = 22 if k % 2 == 0 else 11
            ctx.move_to(x, y0); ctx.line_to(x, y0 - ln)
    ctx.stroke()
    for mday, tb in ((1, T["bell1"]), (3, T["bell2"]), (7, None)):
        x = 540 + (mday - d) * px_per_day
        if -40 <= x <= 1120:
            hit = pulse(t, tb, 0.4) if tb else 0.0
            r = 20 + 10 * hit
            ctx.arc(x, y0 - 2, r, 0, 2 * math.pi)
            ctx.set_source_rgba(*LIME[:3], vis); ctx.fill_preserve()
            ctx.set_source_rgba(*INK[:3], vis); ctx.set_line_width(5); ctx.stroke()
            bell(ctx, x, y0 - 3, size=22, alpha=vis)
    # "now" caret under the student zone
    ctx.move_to(540, y0 + 18); ctx.line_to(526, y0 + 42); ctx.line_to(554, y0 + 42); ctx.close_path()
    ctx.set_source_rgba(*INK[:3], vis); ctx.fill()
    return night * vis


def camera(t):
    zoom = 1.12
    fx, fy = 540.0, 961.0
    zoom += 0.045 * in_out_cubic(seg(t, 0.0, 2.4)) * (1 - in_out_cubic(seg(t, 2.4, 3.0)))
    zoom += 0.035 * pulse(t, T["crash"], 0.5)
    zoom += 0.03 * in_out_cubic(seg(t, 24.0, 25.5)) * (1 - in_out_cubic(seg(t, 26.4, 27.0)))
    dx, dy = 0.0, 0.0
    for (tt, amp, dur) in ((T["land1"], 7, 0.3), (T["crash"], 22, 0.5), (T["tile_land"], 18, 0.45),
                           (T["gulp"], 6, 0.3), (T["icon"], 8, 0.3)):
        sx, sy = shake(t, tt, amp, dur, seed=tt)
        dx += sx; dy += sy
    return zoom, fx, fy, dx, dy


def draw_frame(ctx, t):
    zoom, fx, fy, dx, dy = camera(t)
    end_k = seg(t, 26.7, 27.2)
    ctx.save()
    ctx.translate(W / 2 + dx, H / 2 + dy)
    ctx.scale(zoom, zoom)
    ctx.translate(-fx, -fy)
    # background + time-lapse tint (computed in a cheap pre-pass)
    d_vis = seg(t, 18.0, 18.35) * (1 - seg(t, 24.0, 24.4))
    night = 0.0
    if d_vis > 0:
        frac = days_at(t) % 1.0
        night = (max(0.0, math.sin(math.pi * (frac * 2 - 1))) if frac > 0.5 else 0.0) * d_vis
    background(ctx, W, H, tint=0.45 * night, floor_alpha=1 - end_k, night=NIGHT)
    draw_review_time(ctx, t)

    jolt = -0.03 * math.exp(-8 * max(0, t - T["crash"])) * math.sin(max(0, t - T["crash"]) * 40) if t > T["crash"] else 0.0
    desk(ctx, jolt=jolt, alpha=1 - end_k, lamp_on=1.0)
    # notes stack on desk before crash
    if t < T["crash"]:
        for k in range(8):
            rrect(ctx, 262 + (k % 3) * 3, 1112 - k * 6, 104, 7, 2)
        ctx.set_source_rgba(*PAGE); ctx.fill_preserve()
        ctx.set_source_rgba(*INK); ctx.set_line_width(3); ctx.stroke()

    tb = textbook_state(t)
    # floor items (behind the student)
    for i in range(8):
        st = sheet_state(i, t)
        if st and st[5] > 0.99:
            draw_sheet(ctx, st, i)
    if tb and tb[0] == "closed" and tb[1][4] > 0.99:
        closed_book(ctx, *tb[1][:3], scale=tb[1][3], flat=1.0)

    sp = student_pose(t)
    j = joints(sp)
    behind_icon = T["icon"] - 0.05 <= t < T["perch"]
    if behind_icon:
        draw_stickman(ctx, sp)
    # Recall tile
    ts = tile_state(t)
    if ts:
        if t < T["tile_land"]:
            k = seg(t, T["whistle"], T["tile_land"])
            soft_shadow(ctx, TILE_X, FLOOR + 6, 60 + 120 * k, 10 + 12 * k, 0.05 + 0.15 * k)
            speed_lines(ctx, TILE_X - 60, ts["y"] - 170, 0, 1, alpha=k, n=3, length=90, gap=60)
        elif t < T["toss"]:
            soft_shadow(ctx, ts["x"], FLOOR + 6, 175 * ts["sx"], 22, 0.16)
        alpha_vec = 1 - ts["png"]
        if alpha_vec > 0:
            recall_tile(ctx, ts["x"], ts["y"], ts["size"], ts["sx"], ts["sy"], ts["rot"], ts["gape"],
                        alpha=alpha_vec, glow=ts["glow"], shine=ts["shine"])
        if ts["png"] > 0:
            s = ts["size"]
            if ts["glow"] > 0:
                g = cairo.RadialGradient(ts["x"], ts["y"], s * 0.3, ts["x"], ts["y"], s * 1.05)
                g.add_color_stop_rgba(0, LIME[0], LIME[1], LIME[2], 0.6 * ts["glow"])
                g.add_color_stop_rgba(1, LIME[0], LIME[1], LIME[2], 0)
                ctx.set_source(g); ctx.arc(ts["x"], ts["y"], s * 1.05, 0, 2 * math.pi); ctx.fill()
            soft_shadow(ctx, ts["x"], ts["y"] + s * 0.56, s * 0.45, 18, 0.12 * ts["png"])
            ic = icon_surface()
            ctx.save()
            ctx.translate(ts["x"] - s / 2, ts["y"] - s / 2)
            ctx.scale(s / ic.get_width(), s / ic.get_height())
            ctx.set_source_surface(ic, 0, 0)
            ctx.get_source().set_filter(cairo.FILTER_BEST)
            ctx.paint_with_alpha(ts["png"])
            ctx.restore()
            if ts["shine"] >= 0:
                ctx.save()
                rrect(ctx, ts["x"] - s / 2, ts["y"] - s / 2, s, s, s * 0.22)
                ctx.clip()
                sxp = ts["x"] - s + ts["shine"] * s * 2.2
                lg = cairo.LinearGradient(sxp - 60, 0, sxp + 60, 0)
                lg.add_color_stop_rgba(0, 1, 1, 1, 0)
                lg.add_color_stop_rgba(0.5, 1, 1, 1, 0.45)
                lg.add_color_stop_rgba(1, 1, 1, 1, 0)
                ctx.set_source(lg); ctx.paint()
                ctx.restore()
        # tile sparks while processing
        if T["rumble"] <= t < 12.1:
            for k in range(6):
                ph = (t * 1.8 + k / 6) % 1.0
                ang = -math.pi / 2 + (hash01(k + math.floor(t * 1.8 + k / 6)) - 0.5) * 1.6
                r = 90 + ph * 140
                sparkle(ctx, TILE_X + math.cos(ang) * r, TILE_Y - 60 + math.sin(ang) * r, 16 * (1 - ph), alpha=1 - ph)
        # landing puffs
        puff(ctx, TILE_X - 150, FLOOR, t - T["tile_land"], 0.55, n=4, spread=120, seed=3, dirn=-1)
        puff(ctx, TILE_X + 150, FLOOR, t - T["tile_land"], 0.55, n=4, spread=120, seed=7, dirn=1)
        # review bells
        for tbell, ttap in ((T["bell1"], T["tap1"]), (T["bell2"], T["tap2"])):
            if tbell <= t <= ttap + 0.25:
                sc = out_back(seg(t, tbell, tbell + 0.2)) * (1 - in_quad(seg(t, ttap, ttap + 0.2)))
                rr = 0.45 * math.sin((t - tbell) * 2 * math.pi * 8) * max(0.3, 1 - (t - tbell) * 0.6)
                bell(ctx, TILE_X, TILE_Y - 225, size=78, rot=rr, scale=sc)
                if sc > 0.5:
                    ctx.set_source_rgba(*INK[:3], sc)
                    ctx.set_line_width(6)
                    for side in (-1, 1):
                        for q in range(2):
                            rad = 70 + q * 22 + 6 * math.sin(t * 30)
                            c = -math.pi / 2 + side * 0.75
                            ctx.new_sub_path()
                            ctx.arc(TILE_X, TILE_Y - 225, rad, c - 0.28, c + 0.28)
                            ctx.stroke()

    # head halo (knowledge kept)
    level = 0.0
    for i, tp in enumerate(T["practice"]):
        level += 0.09 * seg(t, tp + 0.7, tp + 0.9)
    level += 0.2 * seg(t, T["tap1"] + 0.35, T["tap1"] + 0.5) + 0.2 * seg(t, T["tap2"] + 0.35, T["tap2"] + 0.5)
    level *= 1 - seg(t, 26.5, 27.0)
    if level > 0.01:
        hx, hy = j["head"]
        g = cairo.RadialGradient(hx, hy, 30, hx, hy, 120)
        g.add_color_stop_rgba(0, LIME[0], LIME[1], LIME[2], min(0.85, level * 1.4))
        g.add_color_stop_rgba(1, LIME[0], LIME[1], LIME[2], 0)
        ctx.set_source(g); ctx.arc(hx, hy, 120, 0, 2 * math.pi); ctx.fill()

    # student shadow
    if t < 27.1:
        sh_a = 0.14 * (1 - clamp((FLOOR - 40 - max(j["foot1"][1], j["foot2"][1])) / 300))
        soft_shadow(ctx, j["hip"][0], FLOOR + 6, 80, 14, sh_a if sp["lean"] > -1.0 else 0.14)
    # motion lines
    if 3.0 < t < 3.35:
        speed_lines(ctx, j["hip"][0], j["hip"][1], 1, -1.5, alpha=pulse(t, 3.0, 0.35))
    if 4.12 < t < 4.45:
        speed_lines(ctx, j["hip"][0] + 120, j["hip"][1], -1, 0.3, alpha=pulse(t, 4.12, 0.33))
    for r0, r1 in ((19.45, 19.82), (22.05, 22.38)):
        if r0 < t < r1:
            speed_lines(ctx, j["hip"][0] - 30, j["hip"][1] - 60, 1, 0, alpha=pulse(t, r0, r1 - r0), n=3, length=60)

    # held textbook behind near arm
    if tb and tb[0] == "held":
        textbook(ctx, j["hand2"], j["hand1"])
    if not behind_icon:
        draw_stickman(ctx, sp)
    # in-hand / flying notes & textbook
    for i in range(8):
        st = sheet_state(i, t)
        if st and st[5] <= 0.99:
            draw_sheet(ctx, st, i)
    if tb and tb[0] == "closed" and tb[1][4] <= 0.99:
        closed_book(ctx, *tb[1][:3], scale=tb[1][3], flat=tb[1][4])

    # landing / crash dust
    puff(ctx, 800, FLOOR, t - T["land1"], 0.45, n=4, spread=70, seed=11)
    puff(ctx, 560, FLOOR, t - T["crash"], 0.6, n=6, spread=150, seed=21)
    puff(ctx, 470, FLOOR, t - 7.85, 0.35, n=2, spread=50, seed=31)
    # dazed stars
    if T["crash"] + 0.05 < t < 6.3:
        hx, hy = j["head"]
        a = seg(t, T["crash"], T["crash"] + 0.15) * (1 - seg(t, 6.0, 6.3))
        for k in range(3):
            ang = t * 7 + k * 2 * math.pi / 3
            star(ctx, hx + math.cos(ang) * 70, hy - 62 + math.sin(ang) * 20, 15, rot=t * 4, alpha=a)
    # pop bursts at head when cards escape
    for tp in T["pop"]:
        if tp <= t <= tp + 0.3:
            hx, hy = head_at(max(0.0, tp))
            k = seg(t, tp, tp + 0.3)
            ctx.set_source_rgba(*INK[:3], 1 - k)
            ctx.set_line_width(6); ctx.set_line_cap(1)
            for q in range(5):
                ang = -math.pi / 2 + (q - 2) * 0.45
                r0, r1 = 62 + 40 * k, 86 + 60 * k
                ctx.move_to(hx + math.cos(ang) * r0, hy + math.sin(ang) * r0)
                ctx.line_to(hx + math.cos(ang) * r1, hy + math.sin(ang) * r1)
            ctx.stroke()
    # head rings when a card is stored
    for tp in T["practice"]:
        ring(ctx, *head_at(tp + 0.72), t - (tp + 0.72), 0.45, 40, 130)
    for tp in (T["tap1"], T["tap2"]):
        ring(ctx, *head_at(tp + 0.38), t - (tp + 0.38), 0.5, 40, 160)
        if tp <= t <= tp + 0.3:
            k = seg(t, tp, tp + 0.3)
            for q in range(4):
                ang = q * math.pi / 2 + 0.6
                sparkle(ctx, 682 + math.cos(ang) * 60 * k, 1215 + math.sin(ang) * 60 * k, 14 * (1 - k), alpha=1 - k)

    # cards
    for name in "ABC":
        if t < 6.6:
            pos = escaped_pos(name, t)
            if pos:
                v = velocity(escaped_pos, t, name)
                rot = clamp(v[0] * 0.0006, -0.5, 0.5) + 0.06 * math.sin(t * 3 + "ABC".index(name))
                k = "ABC".index(name)
                emerge = seg(t, T["pop"][k], T["pop"][k] + 0.18)
                card(ctx, pos[0], pos[1], rot=rot, wings=emerge, phase=t * 2 * math.pi * 7 + k * 1.3,
                     scale=0.35 + 0.65 * out_back(emerge))
                sp_ = math.hypot(*v)
                if sp_ > 1400:
                    speed_lines(ctx, pos[0], pos[1], v[0], v[1], alpha=clamp((sp_ - 1400) / 1500), n=2, length=60)
    for i in range(4):
        draw_card_state(ctx, lesson_card(i, t))
    for n in range(2):
        draw_card_state(ctx, review_card(n, t))
    pay = [(k, payoff_card(k, t)) for k in range(3)]
    for k, st in pay:  # in-flight first so they pass behind cards already in their slots
        if st and t < T["catch"][k]:
            draw_card_state(ctx, st)
    for k, st in pay:
        if st and t >= T["catch"][k]:
            draw_card_state(ctx, st)
    # converge sparkles at icon pop
    if T["icon"] <= t <= T["icon"] + 0.6:
        k = seg(t, T["icon"], T["icon"] + 0.6)
        for q in range(10):
            ang = q * 2 * math.pi / 10 + 0.3
            r = 200 + 220 * out_cubic(k)
            sparkle(ctx, 540 + math.cos(ang) * r, 760 + math.sin(ang) * r, 22 * (1 - k), alpha=1 - k)
    ctx.restore()

    # end-card typography (screen space)
    draw_end(ctx, t)
    draw_captions(ctx, t)


def draw_end(ctx, t):
    if t < T["word"]:
        return
    a = seg(t, T["word"], T["word"] + 0.25)
    s = max(1e-3, out_back(a, 2.0))
    font(ctx, FONT_BLACK, 132)
    ww = text_w(ctx, "Recall")
    ctx.save()
    ctx.translate(540, 1040)
    ctx.scale(s, s)
    fe = ctx.font_extents()
    ctx.move_to(-ww / 2, (fe[0] - fe[1]) / 2 * 0.86)
    ctx.set_source_rgba(*INK[:3], clamp(a * 2))
    ctx.show_text("Recall")
    ctx.restore()
    if t >= T["tagline"]:
        a2 = out_cubic(seg(t, T["tagline"], T["tagline"] + 0.3))
        font(ctx, FONT_SEMI, 50)
        line = "Lessons, practice & spaced reviews"
        tw = text_w(ctx, line)
        fe = ctx.font_extents()
        ctx.move_to(540 - tw / 2, 1132 + (1 - a2) * 20 + (fe[0] - fe[1]) / 2 * 0.86)
        ctx.set_source_rgba(*INK[:3], 0.78 * a2)
        ctx.show_text(line)
    if t >= T["cta"]:
        a3 = seg(t, T["cta"], T["cta"] + 0.3)
        s3 = max(1e-3, out_back(a3, 2.2))
        font(ctx, FONT_BOLD, 54)
        label = "Explore on Google Play"
        tw = text_w(ctx, label)
        pw, ph = tw + 120, 128
        ctx.save()
        ctx.translate(540, 1300)
        ctx.scale(s3, s3)
        rrect(ctx, -pw / 2, -ph / 2 + 8, pw, ph, ph / 2)
        ctx.set_source_rgba(*INK[:3], 0.18 * clamp(a3 * 2)); ctx.fill()
        rrect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2)
        ctx.set_source_rgba(*INK[:3], clamp(a3 * 2)); ctx.fill()
        fe = ctx.font_extents()
        ctx.move_to(-tw / 2, (fe[0] - fe[1]) / 2 * 0.86)
        ctx.set_source_rgba(*LIME[:3], clamp(a3 * 2))
        ctx.show_text(label)
        # shine sweep on the button
        if T["shine"] <= t <= T["shine"] + 0.6:
            k = seg(t, T["shine"], T["shine"] + 0.6)
            rrect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2)
            ctx.clip()
            sxp = -pw / 2 - 80 + k * (pw + 160)
            lg = cairo.LinearGradient(sxp - 50, 0, sxp + 50, 0)
            lg.add_color_stop_rgba(0, 1, 1, 1, 0)
            lg.add_color_stop_rgba(0.5, 1, 1, 1, 0.28)
            lg.add_color_stop_rgba(1, 1, 1, 1, 0)
            ctx.set_source(lg); ctx.paint()
        ctx.restore()


# =============================================================================
# Output
# =============================================================================
def render_frame(i):
    t = i / FPS
    surf = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
    ctx = cairo.Context(surf)
    ctx.set_antialias(cairo.ANTIALIAS_BEST)
    draw_frame(ctx, t)
    surf.flush()
    return bytes(surf.get_data())


def save_still(t, path):
    surf = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
    ctx = cairo.Context(surf)
    draw_frame(ctx, t)
    surf.write_to_png(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stills", nargs="*", type=float)
    ap.add_argument("--stills-dir", default=os.path.join(HERE, "..", "qa", "stills"))
    ap.add_argument("--video")
    ap.add_argument("--workers", type=int, default=os.cpu_count() or 2)
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--end", type=float, default=DURATION)
    a = ap.parse_args()
    if a.stills:
        os.makedirs(a.stills_dir, exist_ok=True)
        for t in a.stills:
            p = os.path.join(a.stills_dir, f"t{t:05.2f}.png")
            save_still(t, p)
            print(p)
    if a.video:
        n0, n1 = int(round(a.start * FPS)), int(round(a.end * FPS))
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}",
               "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-tune", "animation",
               "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.video]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        with Pool(a.workers) as pool:
            for k, buf in enumerate(pool.imap(render_frame, range(n0, n1), chunksize=4)):
                proc.stdin.write(buf)
                if k % 60 == 0:
                    print(f"frame {n0 + k}/{n1}", flush=True)
        proc.stdin.close()
        proc.wait()
        if proc.returncode:
            sys.exit(proc.returncode)
        print("wrote", a.video)


if __name__ == "__main__":
    main()
