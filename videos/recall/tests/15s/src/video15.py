"""Recall 15 s style test - choreography (skill step 4: scenes anchored to narration cues).

  python video15.py --sheet out.png 0-450:30    # contact sheet of frames (skill step 5)
  python video15.py --video out.mp4             # silent H.264
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
from cues import FPS, H, W, F, cue_end, cue_start  # noqa: E402
from engine import (F_COMIC, INK, LIME, LIME_SHADE, P, PAGE, SMOOTH, SNAP, EASE, actor, add_pose, burst,  # noqa: E402
                    caption, clamp, cursor, dust, ease, fall, font, ground_y, idle, interp, pose_at, rrect, shake_at,
                    slam, solve, speed_lines, stamp, title_fall, word_block, paper, _centered_text_path)

ICON = os.path.join(HERE, "..", "..", "..", "assets", "icon.png")
G = 1400.0                      # ground line
S = 2.8                         # figure scale for portrait
HY = ground_y(S, G)             # hip y with feet on the ground
ICON_X, ICON_SIZE = 775.0, 400.0
ICON_Y = G - ICON_SIZE / 2
PILE_X = 130.0
BLOCK_STEP = 100.0
CARD_W, CARD_H = 210, 128

# ---- cue anchors (frames) -----------------------------------------------------------------------
C0, C1, C2, C3, C4, C5 = (F(cue_start(i)) for i in range(6))
LAND = [C0, C0 + 6, C0 + 12]          # word blocks land on the hands ("Read it.")
BLAST = C1                            # "Forgot it?"
ICON_DROP = 104
ICON_LAND = ICON_DROP + 12
TITLE_AT = C2                         # "Meet Recall."
SUCK = [C3 + 6, C3 + 14, C3 + 22]     # blocks spiral into the icon
FIRE = [198, 222, 246]                # practice cards fired
CATCH = [210, 234, 258]
CLOCK1, CLOCK2 = 266, 330
ESCAPE, BELL, REVIEW_SLAM, RCATCH, RPILE, RSTAMP = 300, 302, 304, 314, 326, 328
PIN = 350
CUR_IN, GRAB, THROW, CLICK = 354, 368, 390, 398
TITLE2 = C5 + 2
CTA = C5 + 4
WORDS = ["DATES", "FORMULAS", "VOCAB"]


def pulse(f, a, d):
    x = (f - a) / d
    return math.sin(math.pi * x) if 0 < x < 1 else 0.0


# ---- hero --------------------------------------------------------------------------------------
REST = dict(la1=-18, la2=8, ra1=18, ra2=-8, ll1=-12, ll2=4, rl1=12, rl2=-4, lean=0, head=0)
CROUCH = dict(P["crouch"], y=HY + 45)
LAND_POSE = dict(ll1=-40, ll2=70, rl1=34, rl2=64, y=HY + 32)
HERO_KEYS = [
    (0, dict(x=540, y=HY, **REST)),
    (34, {}),
    (40, dict(P["carry"])),
    (BLAST - 1, {}),
    (BLAST + 5, dict(P["shock"], y=HY)),
    (80, {}),
    (88, dict(P["facepalm"], la1=-18, la2=8)),
    (100, dict(REST, head=-25)),
    (106, dict(CROUCH, head=-10)),
    (111, dict(x=420, y=HY - 160, la1=-120, la2=-40, ra1=120, ra2=40, ll1=-30, ll2=60, rl1=20, rl2=50,
               lean=-8, head=-10), SMOOTH),
    (ICON_LAND, dict(x=300, **LAND_POSE, la1=-60, la2=-30, ra1=60, ra2=30), SMOOTH),
    (124, dict(REST, y=HY)),
    (136, dict(P["pointR"])),
    (152, dict(REST)),
    (164, dict(lean=-12, la1=-30, la2=-20, ra1=110, ra2=60, head=-6)),
    (194, dict(REST)),
    # catch 1: jump catch
    (FIRE[0], dict(CROUCH)),
    (FIRE[0] + 6, {}),
    (CATCH[0], dict(REST, y=HY - 200, **P["armsUp"], ll1=-20, ll2=30, rl1=10, rl2=40), SMOOTH),
    (CATCH[0] + 8, dict(LAND_POSE, la1=40, la2=70, ra1=60, ra2=60)),
    (CATCH[0] + 12, dict(y=HY, ll1=-12, ll2=4, rl1=12, rl2=-4, la1=-120, la2=-20, ra1=-100, ra2=-30, lean=-14)),
    # catch 2: backflip catch
    (FIRE[1] + 4, dict(CROUCH, lean=0)),
    (FIRE[1] + 8, dict(y=HY - 90, **P["armsUp"], ll1=-10, ll2=40, rl1=10, rl2=40)),
    (CATCH[1], dict(y=HY - 280, rot=-180, ll1=-60, ll2=100, rl1=-40, rl2=100), SMOOTH),
    (CATCH[1] + 8, dict(LAND_POSE, rot=-360, la1=40, la2=70, ra1=60, ra2=60), SMOOTH),
    (CATCH[1] + 12, dict(y=HY, ll1=-12, ll2=4, rl1=12, rl2=-4, la1=-120, la2=-20, ra1=-100, ra2=-30, lean=-14)),
    # catch 3: punch-stop
    (FIRE[2], dict(REST, rot=-360, y=HY + 10, lean=-12, ra1=-40, ra2=-70, la1=-30, la2=-60)),
    (FIRE[2] + 8, dict(P["punchR"], y=HY)),
    (CATCH[2] + 6, {}),
    (CATCH[2] + 12, dict(la1=-120, la2=-20, ra1=-100, ra2=-30, lean=-14, ll1=-12, ll2=4, rl1=12, rl2=-4)),
    (272, dict(REST)),
    # review
    (ESCAPE, dict(head=-20)),
    (ESCAPE + 4, dict(CROUCH)),
    (ESCAPE + 8, {}),
    (RCATCH, dict(REST, x=250, y=HY - 220, **P["armsUp"], ll1=-20, ll2=40, rl1=10, rl2=40), SMOOTH),
    (RCATCH + 8, dict(x=290, **LAND_POSE, la1=40, la2=70, ra1=60, ra2=60), SMOOTH),
    (RPILE, dict(y=HY, ll1=-12, ll2=4, rl1=12, rl2=-4, la1=-110, la2=-30, ra1=-90, ra2=-30, lean=-18)),
    (RPILE + 8, dict(REST, x=335)),
    (PIN - 4, dict(P["think"], head=6)),
    (PIN, dict(REST, la1=-95, la2=0, lean=-10, head=10)),
    (PIN + 6, dict(REST)),
    # ending: grab the cursor, throw it at the CTA, cheer
    (CUR_IN + 4, dict(CROUCH)),
    (CUR_IN + 8, {}),
    (GRAB, dict(REST, x=350, y=HY - 210, ra1=165, ra2=10, la1=-60, la2=-30, ll1=-20, ll2=40, rl1=10, rl2=40),
     SMOOTH),
    (GRAB + 8, dict(x=370, **LAND_POSE, ra1=120, ra2=20), SMOOTH),
    (GRAB + 12, dict(y=HY, ll1=-12, ll2=4, rl1=12, rl2=-4, ra1=60, ra2=30)),
    (THROW - 6, dict(lean=-14, ra1=-60, ra2=-80, head=-6)),
    (THROW, dict(lean=16, ra1=60, ra2=0, la1=-40, la2=-60, head=8)),
    (THROW + 8, dict(REST, x=370)),
    (CLICK + 6, dict(P["cheer"])),
    (450, {}),
]


def hero_facing(f):
    return -1 if ESCAPE + 2 <= f < RPILE + 4 else 1


def hero_pose(f):
    p = pose_at(f, HERO_KEYS)
    # knees dip as each word block lands
    for a in LAND:
        p["y"] += 20 * pulse(f, a, 6)
    # idle breathing when grounded
    p = add_pose(p, idle(f, 0.3), 1.0 if abs(p["y"] - HY) < 30 else 0.0)
    # cheering hops at the end
    if f > CLICK + 8:
        p["y"] -= 60 * abs(math.sin((f - CLICK - 8) * 0.22))
    return p


def hero_joints(f):
    return solve(hero_pose(f), S, hero_facing(f))


def draw_progress(f):
    return 1.0 if f >= 28 else 0.18 + 0.82 * SMOOTH(clamp(f / 28))


def pen_point(f):
    """Point the cursor is drawing at (follows head -> torso -> arms -> legs)."""
    d = draw_progress(f)
    j = hero_joints(f)

    def along(pts, t):
        L = [math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) for i in range(1, len(pts))]
        tot = sum(L) * t
        for i, l in enumerate(L):
            if tot <= l:
                k = tot / l if l else 0
                return (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k)
            tot -= l
        return pts[-1]
    if d < 0.3:
        a = -math.pi / 2 + 2 * math.pi * d / 0.3
        R = 24 * S
        return j["headC"][0] + math.cos(a) * R, j["headC"][1] + math.sin(a) * R
    if d < 0.45:
        return along([j["neck"], j["hip"]], (d - 0.3) / 0.15)
    if d < 0.72:
        return along([j["lHand"], j["lElbow"], j["neck"], j["rElbow"], j["rHand"]], (d - 0.45) / 0.27)
    return along([j["lFoot"], j["lKnee"], j["hip"], j["rKnee"], j["rFoot"]], (d - 0.72) / 0.28)


# ---- word blocks (study material) ----------------------------------------------------------------
def stack_base(f):
    j = hero_joints(min(f, BLAST - 1))
    hx = (j["lHand"][0] + j["rHand"][0]) / 2
    hy = min(j["lHand"][1], j["rHand"][1])
    return hx, hy - 56


EXIT = [(-320, 520), (540, -260), (1400, 560)]
ENTRY = [(-320, 640), (560, -260), (1400, 700)]


def block_state(i, f):
    """(x, y, rot, scale) or None."""
    land = LAND[i]
    if f < land - 12:
        return None
    if f < BLAST:
        bx, by = stack_base(f)
        ty = by - i * BLOCK_STEP
        y = fall(f, land - 12, -160, ty, 12) if f < land + 20 else ty
        x = bx + (8 if i == 1 else -6 if i == 2 else 0)
        rot = [-4, 3, -2][i]
        if f >= 56:
            x += 4 * math.sin(f * 2.3 + i * 2)
            rot += 3 * math.sin(f * 1.9 + i)
        return x, y, rot, 1.0
    if f < BLAST + 18:
        bx, by = stack_base(BLAST - 1)
        p0 = (bx, by - i * BLOCK_STEP)
        k = EASE(clamp((f - BLAST) / 18))
        x = p0[0] + (EXIT[i][0] - p0[0]) * k
        y = p0[1] + (EXIT[i][1] - p0[1]) * k - 160 * math.sin(math.pi * k) * (1 if i != 1 else 0)
        return x, y, [-4, 3, -2][i] + [-400, 200, 380][i] * k, 1.0
    a = SUCK[i] - 20
    if a <= f < SUCK[i]:
        k = clamp((f - a) / 20)
        c = (ICON_X, ICON_Y - 30)
        sx, sy = ENTRY[i]
        r0 = math.hypot(sx - c[0], sy - c[1])
        th0 = math.atan2(sy - c[1], sx - c[0])
        r = r0 * (1 - SMOOTH(k))
        th = th0 + 2.4 * k * (1 if i != 2 else -1)
        return c[0] + math.cos(th) * r, c[1] + math.sin(th) * r, 540 * k, 1.15 - 0.95 * k * k
    return None


# ---- practice cards ----------------------------------------------------------------------------
def pile_slot(i):
    return PILE_X + [0, 6, -4][i], G - 64 - i * 40, [-3, 4, -2][i]


def card_hand(f):
    j = hero_joints(f)
    return (j["lHand"][0] + j["rHand"][0]) / 2, (j["lHand"][1] + j["rHand"][1]) / 2 - 30


def practice_card(i, f):
    """dict(x, y, rot, flip, face) or None. flip 0 = '?' side, 1 = lime check side."""
    fi, ci = FIRE[i], CATCH[i]
    if f < fi:
        return None
    src = (ICON_X, ICON_Y - ICON_SIZE / 2 + 20)
    if i == 2:
        jj = hero_joints(ci)
        tgt = (jj["rHand"][0] + 90, jj["rHand"][1])
    else:
        tgt = card_hand(ci)
    if f < ci:
        k = SMOOTH(clamp((f - fi) / (ci - fi)))
        x = src[0] + (tgt[0] - src[0]) * k
        y = src[1] + (tgt[1] - src[1]) * k - 260 * math.sin(math.pi * k)
        return dict(x=x, y=y, rot=-360 * k, flip=0.0, s=0.4 + 0.6 * min(1, k * 2))
    held_until = ci + 8
    if f < held_until:
        if i == 2:
            jj = hero_joints(f)
            pos = (jj["rHand"][0] + 90, jj["rHand"][1])
        else:
            pos = card_hand(f)
        return dict(x=pos[0], y=pos[1], rot=0, flip=clamp((f - ci) / 6), s=1.0)
    land = held_until + 10
    if i == 2 and f >= ESCAPE:
        return review_card(f)
    p0 = (hero_joints(held_until)["rHand"][0] + (90 if i == 2 else 0), card_hand(held_until)[1])
    sx, sy, sr = pile_slot(i)
    if f < land:
        k = clamp((f - held_until) / 10)
        return dict(x=p0[0] + (sx - p0[0]) * k, y=p0[1] + (sy - p0[1]) * k - 160 * math.sin(math.pi * k),
                    rot=sr * k - 100 * (1 - k), flip=1.0, s=1.0)
    twitch = 0.0
    if i == 2 and f >= PIN - 6:
        twitch = 10 * pulse(f, PIN - 6, 6)
    return dict(x=sx, y=sy - twitch, rot=sr, flip=1.0, s=1.0)


def review_card(f):
    sx, sy, sr = pile_slot(2)
    up = (240, 760)
    if f < RCATCH:
        k = SNAP(clamp((f - ESCAPE) / 10))
        flip = 1 - clamp((f - ESCAPE - 2) / 6)       # fades back to "?" while escaping
        wob = 6 * math.sin(f * 1.3)
        return dict(x=sx + (up[0] - sx) * k + wob, y=sy + (up[1] - sy) * k, rot=sr + 20 * math.sin(f * 0.8), flip=flip,
                    s=1.0)
    if f < RCATCH + 10:
        pos = card_hand(f)
        return dict(x=pos[0], y=pos[1], rot=0, flip=clamp((f - RCATCH) / 6), s=1.0)
    if f < RPILE:
        p0 = card_hand(RCATCH + 10)
        k = clamp((f - RCATCH - 10) / (RPILE - RCATCH - 10))
        return dict(x=p0[0] + (sx - p0[0]) * k, y=p0[1] + (sy - p0[1]) * k - 80 * math.sin(math.pi * k), rot=sr * k,
                    flip=1.0, s=1.0)
    twitch = 10 * pulse(f, PIN - 6, 6)
    return dict(x=sx, y=sy - twitch, rot=sr, flip=1.0, s=1.0)


def draw_card(ctx, st):
    if not st:
        return
    w, h = CARD_W, CARD_H
    ctx.save()
    ctx.translate(st["x"], st["y"])
    ctx.rotate(math.radians(st["rot"]))
    sc = st["s"]
    ang = st["flip"] * math.pi
    sx = math.cos(ang)
    ctx.scale(sc * max(0.06, abs(sx)), sc)
    back = sx < 0
    rrect(ctx, -w / 2, -h / 2, w, h, 12)
    ctx.set_source_rgba(*(LIME if back else PAGE)[:3], 1)
    ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], 1)
    ctx.set_line_width(6)
    ctx.stroke()
    if back:
        ctx.set_line_width(13)
        ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        ctx.move_to(-36, 2); ctx.line_to(-10, 29); ctx.line_to(40, -27)
        ctx.stroke()
    else:
        font(ctx, "Barlow Condensed Black", 104)
        _centered_text_path(ctx, "?")
        ctx.fill()
    ctx.restore()


# ---- props ---------------------------------------------------------------------------------------
_ICON = None


def icon_surface():
    global _ICON
    if _ICON is None:
        _ICON = cairo.ImageSurface.create_from_png(ICON)
    return _ICON


def icon_state(f):
    if f < 96:
        return None
    if f < ICON_DROP:
        k = EASE(clamp((f - 96) / 8))
        return dict(x=ICON_X, y=-200 + (250 + 200) * k, sx=1, sy=1, rot=-6 * (1 - k))
    y = fall(f, ICON_DROP, 250, ICON_Y, 12)
    sx = sy = 1.0
    if f >= ICON_LAND:
        k = (f - ICON_LAND) / 12
        if k < 1:
            sq = math.exp(-4 * k) * math.cos(k * 9)
            sy, sx = 1 - 0.2 * sq, 1 + 0.14 * sq
    for a in SUCK:
        g = pulse(f, a - 2, 7)
        sy -= 0.1 * g
        sx += 0.08 * g
    if SUCK[0] - 20 <= f < SUCK[-1]:
        sy += 0.05 * math.sin(f * 0.9)
    for a in FIRE:
        g = pulse(f, a - 3, 7)
        sy += 0.12 * g
        sx -= 0.06 * g
    return dict(x=ICON_X, y=y, sx=sx, sy=sy, rot=0.0)


def draw_icon(ctx, st):
    if not st:
        return
    s = ICON_SIZE
    ctx.save()
    ctx.translate(st["x"], st["y"] + s / 2)
    ctx.rotate(math.radians(st["rot"]))
    ctx.scale(st["sx"], st["sy"])
    ctx.translate(-s / 2, -s)
    ic = icon_surface()
    ctx.save()
    ctx.scale(s / ic.get_width(), s / ic.get_height())
    ctx.set_source_surface(ic, 0, 0)
    ctx.get_source().set_filter(cairo.FILTER_BEST)
    ctx.paint()
    ctx.restore()
    rrect(ctx, 0, 0, s, s, s * 0.218)
    ctx.set_source_rgba(*INK[:3], 1)
    ctx.set_line_width(7)
    ctx.stroke()
    ctx.restore()


def draw_clock(ctx, f):
    for a, spin_from, spin_to, turns in ((CLOCK1, CLOCK1 + 12, ESCAPE, 3.0), (CLOCK2, CLOCK2 + 12, 356, 1.2)):
        end = BELL if a == CLOCK1 else 358
        if f < a or f > end + 8:
            continue
        y = fall(f, a, -200, 410, 12)
        sc = 1.0 - clamp((f - end) / 8)
        if sc <= 0.01:
            continue
        k = clamp((f - spin_from) / (spin_to - spin_from))
        ang = 2 * math.pi * turns * k
        ctx.save()
        ctx.translate(540, y)
        ctx.scale(sc * 1.2, sc * 1.2)
        ctx.arc(0, 0, 118, 0, 2 * math.pi)
        ctx.set_source_rgba(*PAGE[:3], 1)
        ctx.fill_preserve()
        ctx.set_source_rgba(*INK[:3], 1)
        ctx.set_line_width(10)
        ctx.stroke()
        ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.set_line_width(7)
        for q in range(12):
            t = q * math.pi / 6
            r0 = 92 if q % 3 else 82
            ctx.move_to(math.cos(t) * r0, math.sin(t) * r0)
            ctx.line_to(math.cos(t) * 104, math.sin(t) * 104)
        ctx.stroke()
        ctx.set_line_width(12)
        ctx.move_to(0, 0); ctx.line_to(math.sin(ang / 12) * 52, -math.cos(ang / 12) * 52); ctx.stroke()
        ctx.set_line_width(8)
        ctx.move_to(0, 0); ctx.line_to(math.sin(ang) * 84, -math.cos(ang) * 84); ctx.stroke()
        ctx.arc(0, 0, 11, 0, 2 * math.pi)
        ctx.set_source_rgba(*LIME[:3], 1)
        ctx.fill_preserve()
        ctx.set_source_rgba(*INK[:3], 1)
        ctx.set_line_width(5)
        ctx.stroke()
        ctx.restore()


def draw_bell(ctx, f):
    if f < BELL or f > RCATCH + 8:
        return
    sc = SNAP(clamp((f - BELL) / 6)) * (1 - clamp((f - RCATCH) / 8))
    if sc <= 0.01:
        return
    rot = 0.5 * math.sin((f - BELL) * 1.6) * max(0.2, 1 - (f - BELL) / 20)
    x, y = ICON_X, ICON_Y - ICON_SIZE / 2 - 110
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.scale(sc * 1.5, sc * 1.5)
    ctx.set_line_join(cairo.LINE_JOIN_ROUND)
    ctx.arc(math.sin(rot * 3) * 6, 38, 9, 0, 2 * math.pi)
    ctx.set_source_rgba(*INK[:3], 1)
    ctx.fill()
    ctx.move_to(-40, 30)
    ctx.curve_to(-34, 18, -32, -6, -30, -14)
    ctx.curve_to(-26, -40, 26, -40, 30, -14)
    ctx.curve_to(32, -6, 34, 18, 40, 30)
    ctx.close_path()
    ctx.set_source_rgba(*PAGE[:3], 1)
    ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], 1)
    ctx.set_line_width(6)
    ctx.stroke()
    ctx.restore()
    if sc > 0.5:
        ctx.save()
        ctx.set_source_rgba(*INK[:3], 1)
        ctx.set_line_width(7)
        ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        for side in (-1, 1):
            for q in range(2):
                r = 84 + q * 26 + 4 * math.sin(f)
                c = -math.pi / 2 + side * 0.8
                ctx.new_sub_path()
                ctx.arc(x, y, r, c - 0.3, c + 0.3)
                ctx.stroke()
        ctx.restore()


def cursor_state(f):
    """(x, y, pressed, rot) or None."""
    if f < 28:
        px, py = pen_point(f)
        return px, py, True, 0.0
    if f < 42:
        k = EASE(clamp((f - 28) / 12))
        px, py = pen_point(27.99)
        return px + (1250 - px) * k, py + (260 - py) * k, False, 0.0
    if 96 <= f < ICON_DROP + 12:
        ist = icon_state(min(f, ICON_DROP))
        bx, by = ist["x"] + 60, ist["y"] - ICON_SIZE / 2 + 30
        if f >= ICON_DROP:
            k = EASE(clamp((f - ICON_DROP) / 12))
            return bx + (1250 - bx) * k, by + (100 - by) * k, False, 0.0
        return bx, by, True, 0.0
    if CUR_IN <= f < GRAB:
        k = EASE(clamp((f - CUR_IN) / (GRAB - CUR_IN)))
        tj = hero_joints(GRAB)["rHand"]
        return 1250 + (tj[0] - 6 - 1250) * k, 620 + (tj[1] - 8 - 620) * k, False, 0.0
    if GRAB <= f < THROW:
        hj = hero_joints(f)["rHand"]
        return hj[0] - 6, hj[1] - 8, False, 0.0
    if THROW <= f < CLICK:
        hj = hero_joints(THROW)["rHand"]
        tgt = (540, 1515)
        k = SMOOTH(clamp((f - THROW) / (CLICK - THROW)))
        return (hj[0] + (tgt[0] - hj[0]) * k, hj[1] + (tgt[1] - hj[1]) * k - 220 * math.sin(math.pi * k), False,
                -6 * k)
    if CLICK <= f < CLICK + 22:
        if f < CLICK + 6:
            return 540, 1515, True, -0.1
        k = clamp((f - CLICK - 6) / 16)
        return 540 + 800 * k * k, 1515 - 900 * k * k, False, 3 * k
    return None


# ---- frame ---------------------------------------------------------------------------------------
HITS = ([(a, 6) for a in LAND] + [(BLAST, 18), (ICON_LAND, 24)] + [(TITLE_AT + 12 + i * 3, 4) for i in range(6)]
        + [(c, 10) for c in CATCH] + [(CATCH[2], 16), (RCATCH, 10), (RSTAMP, 10), (GRAB, 8), (CLICK, 14)])


def draw_frame(ctx, f):
    sx, sy, sr = shake_at(f, HITS)
    ctx.save()
    ctx.translate(W / 2 + sx, H / 2 + sy)
    ctx.rotate(math.radians(sr))
    ctx.translate(-W / 2, -H / 2)
    paper(ctx, W, H, G)

    # pile (behind everything in the world)
    for i in range(3):
        st = practice_card(i, f)
        if st and f >= CATCH[i] + 18 and not (i == 2 and ESCAPE <= f < RPILE):
            draw_card(ctx, st)
    # icon + suction swirl
    ist = icon_state(f)
    if SUCK[0] - 22 <= f < SUCK[-1] + 4:
        k = clamp((f - SUCK[0] + 22) / 6) * (1 - clamp((f - SUCK[-1]) / 4))
        ctx.save()
        ctx.set_source_rgba(*INK[:3], 0.55 * k)
        ctx.set_line_width(6)
        ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        for q in range(3):
            r = 280 - ((f * 9 + q * 80) % 250)
            a0 = f * 0.35 + q * 2.1
            ctx.new_sub_path()
            ctx.arc(ICON_X, ICON_Y - 30, max(20, r), a0, a0 + 1.6)
            ctx.stroke()
        ctx.restore()
    draw_icon(ctx, ist)
    draw_bell(ctx, f)

    # hero
    label_t = clamp((f - 32) / 8)
    blink = pulse(f, 29, 5) + pulse(f, 182, 5) + pulse(f, 342, 5)
    face = "eyes"
    if BLAST <= f < 100:
        face = "shock" if f < 80 else "sad"
    elif 128 <= f < 150 or f >= CLICK or 214 <= f < 222 or 238 <= f < 246:
        face = "happy"
    elif FIRE[2] <= f < CATCH[2] + 4 or ESCAPE + 4 <= f < RCATCH:
        face = "angry"
    if f >= 150:
        label_t = 1 - clamp((f - 150) / 6)
    actor(ctx, f, hero_pose, INK, S, hero_facing, accessory="cap", face=face, label="YOU" if label_t > 0 else None,
          label_t=label_t, draw=draw_progress(f), blink=blink, trails=f >= 28)

    # word blocks with ghost smears when flying
    for i in range(3):
        st = block_state(i, f)
        if not st:
            continue
        if BLAST <= f < BLAST + 18 or (SUCK[i] - 20 <= f < SUCK[i]):
            for d in (3, 2, 1):
                g = block_state(i, f - d)
                if g:
                    word_block(ctx, g[0], g[1], WORDS[i], r=g[2], s=g[3], alpha=0.32 - d * 0.08)
        word_block(ctx, st[0], st[1], WORDS[i], r=st[2], s=st[3])
    # flying / held practice cards (pile drawn earlier)
    for i in range(3):
        st = practice_card(i, f)
        if st and (f < CATCH[i] + 18 or (i == 2 and ESCAPE <= f < RPILE)):
            if f < CATCH[i]:
                for d in (2, 1):
                    g = practice_card(i, f - d)
                    if g:
                        ctx.push_group()
                        draw_card(ctx, g)
                        ctx.pop_group_to_source()
                        ctx.paint_with_alpha(0.25 - d * 0.08)
            draw_card(ctx, st)

    # impacts
    for a in LAND:
        burst(ctx, stack_base(a)[0], stack_base(a)[1] - LAND.index(a) * BLOCK_STEP + 50, a, f, size=90, n=10)
    bx, by = stack_base(BLAST - 1)
    burst(ctx, bx, by - BLOCK_STEP, BLAST, f, size=260, n=16)
    burst(ctx, ICON_X, G - 10, ICON_LAND, f, size=200)
    dust(ctx, ICON_X, G, ICON_LAND, f, spread=230)
    dust(ctx, 300, G, ICON_LAND, f, spread=90)
    for c in CATCH:
        hx, hy = card_hand(c) if c != CATCH[2] else (hero_joints(c)["rHand"][0] + 40, hero_joints(c)["rHand"][1])
        burst(ctx, hx, hy, c, f, size=150 if c != CATCH[2] else 210, n=14)
        dust(ctx, hero_pose(c + 8)["x"], G, c + 8, f, spread=90)
    for i in range(3):
        sxp, syp, _ = pile_slot(i)
        dust(ctx, sxp, G, CATCH[i] + 18, f, spread=70)
    burst(ctx, *card_hand(RCATCH), RCATCH, f, size=150)
    dust(ctx, 290, G, RCATCH + 8, f, spread=90)
    burst(ctx, *hero_joints(GRAB)["rHand"], GRAB, f, size=130)
    dust(ctx, 370, G, GRAB + 8, f, spread=90)
    speed_lines(ctx, f, BLAST, BLAST + 14, direction=1, y0=500, y1=1000)
    speed_lines(ctx, f, THROW, CLICK, direction=-1, y0=1150, y1=1600)

    # top band: slams, falling titles, clock, stamp
    slam(ctx, f, BLAST + 4, "FORGOT?!", 540, 390, size=190, rotate=-4, out=ICON_DROP - 6)
    if TITLE_AT <= f < 190:
        title_fall(ctx, f, TITLE_AT, "RECALL", 540, 400, size=230, stagger=3, out_at=156)
    draw_clock(ctx, f)
    slam(ctx, f, REVIEW_SLAM, "REVIEW!", 540, 400, size=190, rotate=3, out=CLOCK2 - 6)
    if f >= RSTAMP:
        stamp(ctx, f, RSTAMP, PILE_X + 4, G - 222, "REVIEWED", size=46, r=-9)
    if f >= TITLE2:
        title_fall(ctx, f, TITLE2, "RECALL", 540, 400, size=230, stagger=2)
    sub_at = TITLE2 + 22
    if f >= sub_at:
        k = SNAP(clamp((f - sub_at) / 8))
        font(ctx, "Barlow Condensed ExtraBold", 60)
        ctx.save()
        ctx.translate(540, 575 + (1 - k) * 40)
        _centered_text_path(ctx, "LESSONS · PRACTICE · SPACED REVIEWS")
        ctx.set_source_rgba(*PAGE[:3], clamp(k * 1.5))
        ctx.set_line_width(10)
        ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        ctx.stroke_preserve()
        ctx.set_source_rgba(*INK[:3], clamp(k * 1.5))
        ctx.fill()
        ctx.restore()

    # bottom band captions (skill Caption pills)
    caption(ctx, f, C3 + 3, "Study material → lessons + practice", y=1505, out=262, size=50)
    caption(ctx, f, C4 + 3, "Come back for spaced reviews", y=1505, out=348, size=50)
    punch = 0.12 * pulse(f, CLICK, 8)
    caption(ctx, f, CTA, "Explore on Google Play", y=1515, size=64, punch=punch)
    burst(ctx, 540, 1515, CLICK, f, size=200, n=16)

    # the animator's cursor (on top of everything)
    cs = cursor_state(f)
    if cs:
        cursor(ctx, cs[0], cs[1], scale=3.0, pressed=cs[2], rot=cs[3])
    ctx.restore()


def render_frame(i):
    surf = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
    ctx = cairo.Context(surf)
    draw_frame(ctx, float(i))
    surf.flush()
    return bytes(surf.get_data())


def sheet(out, spec, cols=6, tw=240):
    from PIL import Image, ImageDraw, ImageFont
    frames = []
    for part in spec.split(","):
        if "-" in part:
            rng, step = (part.split(":") + ["30"])[:2]
            a, b = map(int, rng.split("-"))
            frames += list(range(a, b + 1, int(step)))
        else:
            frames.append(int(part))
    th = int(tw * H / W)
    rows = (len(frames) + cols - 1) // cols
    im = Image.new("RGB", (cols * tw, rows * (th + 24)), "white")
    d = ImageDraw.Draw(im)
    fnt = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", 16)
    for n, fr in enumerate(frames):
        surf = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
        draw_frame(cairo.Context(surf), float(fr))
        buf = surf.get_data()
        img = Image.frombuffer("RGBA", (W, H), bytes(buf), "raw", "BGRA", 0, 1).convert("RGB").resize((tw, th))
        x, y = (n % cols) * tw, (n // cols) * (th + 24)
        im.paste(img, (x, y + 24))
        d.text((x + 4, y + 3), f"f{fr} {fr / FPS:.2f}s", fill="black", font=fnt)
    im.save(out)
    print(out, im.size)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheet", nargs=2, metavar=("OUT", "FRAMES"))
    ap.add_argument("--video")
    a = ap.parse_args()
    if a.sheet:
        sheet(a.sheet[0], a.sheet[1])
    if a.video:
        n = int(15 * FPS)
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}", "-r",
               str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
               "-movflags", "+faststart", a.video]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        with Pool(os.cpu_count() or 2) as pool:
            for buf in pool.imap(render_frame, range(n), chunksize=4):
                proc.stdin.write(buf)
        proc.stdin.close()
        sys.exit(proc.wait())


if __name__ == "__main__":
    main()
