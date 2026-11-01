"""Mello 30 s portrait promo: original stickman animation drawn with skia-python.

Usage:
  python render.py --stills 0.5,4.0,...  (writes PNG stills to generated/stills)
  python render.py --video out.mp4       (renders all 900 frames, silent)
"""
import argparse
import math
import os
import subprocess
import sys

import numpy as np
import skia

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (ASSETS, FONTS, FPS, GEN, H, NFRAMES, W, bump, clamp, ease_in, ease_io,  # noqa: E402
                    ease_out, ease_out_back, hexrgb, lerp, load_timeline, mixrgb, remap, smooth,
                    track)

TL = load_timeline()

# ------------------------------------------------------------------ palette
LAV = hexrgb("#CDB8F4")
LAV_DEEP = hexrgb("#A88FE6")
GOLD = hexrgb("#F7C548")
MINT = hexrgb("#B6D7C2")
CREAM = hexrgb("#F4EFE6")
NAVY = hexrgb("#1A1535")
CORAL = hexrgb("#E8735A")
MUSTARD = hexrgb("#E2A93B")
VIOLET = hexrgb("#8C84B0")
ROSE = hexrgb("#D9668A")

PAPER = dict(night=False, bg_top=hexrgb("#F4EDE1"), bg_bot=hexrgb("#E8DDCB"), ink=hexrgb("#2A2340"),
             head_fill=hexrgb("#F4EDE1"), caption=hexrgb("#2A2340"), hi=hexrgb("#D9573E"))
NIGHT = dict(night=True, bg_top=hexrgb("#110D25"), bg_bot=hexrgb("#2D2459"), ink=CREAM,
             head_fill=hexrgb("#251D4C"), caption=CREAM, hi=LAV)

GROUND = 1560.0

# ------------------------------------------------------------------ resources (lazy per process)
_RES = {}


def res():
    if not _RES:
        _RES["f900"] = skia.Typeface.MakeFromFile(os.path.join(FONTS, "Nunito-900.ttf"))
        _RES["f800"] = skia.Typeface.MakeFromFile(os.path.join(FONTS, "Nunito-800.ttf"))
        _RES["f600"] = skia.Typeface.MakeFromFile(os.path.join(FONTS, "Nunito-600.ttf"))
        _RES["icon"] = skia.Image.MakeFromEncoded(skia.Data.MakeFromFileName(os.path.join(ASSETS, "icon.png")))
        rng = np.random.default_rng(7)
        g = rng.normal(0, 1, (480, 270)).astype(np.float32)
        g = (np.clip(g * 18 + 128, 0, 255)).astype(np.uint8)
        rgba = np.dstack([g, g, g, np.full_like(g, 255)])
        _RES["grain"] = skia.Image.fromarray(rgba, colorType=skia.kRGBA_8888_ColorType)
        srng = np.random.default_rng(11)
        _RES["stars"] = [(srng.uniform(0, W), srng.uniform(0, 1500), srng.uniform(1.2, 3.4), srng.uniform(0, 6.28),
                          srng.uniform(0.6, 2.2)) for _ in range(70)]
        drng = np.random.default_rng(5)
        _RES["dust"] = [(drng.uniform(0, W), drng.uniform(0, H), drng.uniform(1.5, 3.5), drng.uniform(0, 6.28))
                        for _ in range(40)]
    return _RES


def col(rgb, a=1.0):
    return skia.ColorSetARGB(int(round(clamp(a) * 255)), int(rgb[0]), int(rgb[1]), int(rgb[2]))


def fillp(rgb, a=1.0, blur=0.0):
    p = skia.Paint(AntiAlias=True, Color=col(rgb, a))
    if blur:
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    return p


def strokep(rgb, w, a=1.0, blur=0.0):
    p = skia.Paint(AntiAlias=True, Color=col(rgb, a), Style=skia.Paint.kStroke_Style, StrokeWidth=w,
                   StrokeCap=skia.Paint.kRound_Cap, StrokeJoin=skia.Paint.kRound_Join)
    if blur:
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    return p


def font(weight, size):
    f = skia.Font(res()[f"f{weight}"], size)
    f.setSubpixel(True)
    f.setEdging(skia.Font.Edging.kAntiAlias)
    return f


def text_w(f, s):
    return f.measureText(s)


def d(theta):
    r = math.radians(theta)
    return math.sin(r), math.cos(r)


# ------------------------------------------------------------------ global spin phase (integral of speed)
def spin_speed(t):
    base = track(t, [(0.0, 6.5), (5.6, 8.5), (8.0, 8.5), (9.3, 8.0), (10.4, 1.3, ease_out), (21.0, 1.3)])
    return base


_TGRID = np.arange(0, 31.0, 1 / 600)
_SPIN = np.concatenate([[0], np.cumsum([spin_speed(x) / 600 for x in _TGRID[:-1]])])


def spin(t):
    return float(np.interp(t, _TGRID, _SPIN))


# ------------------------------------------------------------------ breath curve
BREATH = [(11.2, 13.6), (13.6, 16.2), (16.2, 18.6), (18.6, 21.2)]  # in, out, in, out


def breath(t):
    """0 = empty lungs, 1 = full."""
    (i1a, i1b), (o1a, o1b), (i2a, i2b), (o2a, o2b) = BREATH
    if t < i1a:
        return 0.0
    if t < i1b:
        return ease_io(remap(t, i1a, i1b))
    if t < o1b:
        return 1 - ease_io(remap(t, o1a, o1b))
    if t < i2b:
        return ease_io(remap(t, i2a, i2b))
    if t < o2b:
        return 1 - ease_io(remap(t, o2a, o2b))
    return 0.0


def breath_label(t):
    (i1a, i1b), (o1a, o1b), (i2a, i2b), (o2a, o2b) = BREATH
    if i1a - 0.3 <= t < o1a or i2a <= t < o2a:
        return "breathe in", (i1a, i1b) if t < o1a else (i2a, i2b)
    if o1a <= t < i2a or o2a <= t < o2b + 0.2:
        return "breathe out", (o1a, o1b) if t < i2a else (o2a, o2b)
    return None, (0.0, 0.0)


# ------------------------------------------------------------------ camera
IMPACTS = [(0.47, 9.0), (2.78, 6.0), (5.82, 16.0), (8.3, 4.0), (22.98, 3.0), (24.36, 3.0)]


def camera(t):
    s = track(t, [(0.0, 1.34), (1.3, 1.18, ease_out), (8.7, 1.18), (10.5, 1.0, ease_io), (11.2, 1.0), (20.4, 1.045),
                   (21.6, 1.0), (30.0, 1.0)])
    ty = track(t, [(25.25, 0.0), (26.65, 420.0, ease_io)])
    sx = sy = 0.0
    for i, (ti, amp) in enumerate(IMPACTS):
        if t >= ti:
            k = math.exp(-(t - ti) * 9.0) * amp
            sx += k * math.sin((t - ti) * 83 + i * 1.7)
            sy += k * math.cos((t - ti) * 71 + i * 2.3)
    return s, (540.0, 1150.0), ty, sx, sy


def cam_matrix(t):
    s, (fx, fy), ty, sx, sy = camera(t)
    m = skia.Matrix()
    m.setTranslate(fx + sx, fy + sy + ty)
    m.preScale(s, s)
    m.preTranslate(-fx, -fy)
    return m


def to_screen(t, x, y):
    s, (fx, fy), ty, sx, sy = camera(t)
    return (x - fx) * s + fx + sx, (y - fy) * s + fy + ty + sy, s


# ------------------------------------------------------------------ stickman rig
BASE = dict(x=540.0, ground=GROUND, lift=0.0, lean=0.0, spine=190.0, tilt=0.0, shup=0.0, neck=24.0,
            sl=-14.0, el=8.0, sr=14.0, er=-8.0, hl=-9.0, kl=3.0, hr=9.0, kr=-3.0,
            eyes=1.0, lookx=0.0, looky=0.0, brow=0.0, mouth=0.25, mopen=0.0, blush=0.0, sweat=0.0, hair=0.0,
            sit=0.0, squash=0.0)


def P(**kw):
    p = dict(BASE)
    p.update(kw)
    return p


def blend(a, b, x):
    return {k: lerp(a[k], b[k], x) for k in a}


def pose_track(t, keys):
    """keys: list of (time, pose_dict[, ease])."""
    if t <= keys[0][0]:
        return dict(keys[0][1])
    for i in range(1, len(keys)):
        if t <= keys[i][0]:
            t0, p0 = keys[i - 1][0], keys[i - 1][1]
            t1, p1 = keys[i][0], keys[i][1]
            ez = keys[i][2] if len(keys[i]) > 2 else ease_io
            return blend(p0, p1, ez(remap(t, t0, t1)))
    return dict(keys[-1][1])


UA, FA, TH, SH, HEAD_R = 112.0, 104.0, 128.0, 124.0, 50.0


def rig(p):
    """Compute joints from a pose dict."""
    dyl = TH * d(p["hl"])[1] + SH * d(p["hl"] + p["kl"])[1]
    dyr = TH * d(p["hr"])[1] + SH * d(p["hr"] + p["kr"])[1]
    stand_y = p["ground"] - p["lift"] - max(dyl, dyr) - 6
    sit_y = p["ground"] - p["lift"] - 48
    py = lerp(stand_y, sit_y, p["sit"])
    pel = (p["x"], py)
    up = (math.sin(math.radians(p["lean"])), -math.cos(math.radians(p["lean"])))
    spine = p["spine"] * (1 - 0.12 * p["squash"])
    chest = (pel[0] + up[0] * spine, pel[1] + up[1] * spine)
    ha = p["lean"] + p["tilt"]
    hu = (math.sin(math.radians(ha)), -math.cos(math.radians(ha)))
    head = (chest[0] + hu[0] * (p["neck"] + HEAD_R), chest[1] + hu[1] * (p["neck"] + HEAD_R))
    sh = (chest[0] - up[0] * (12 - p["shup"]), chest[1] - up[1] * (12 - p["shup"]))
    j = dict(pel=pel, chest=chest, head=head, sh=sh, head_ang=ha)
    for side, a, b in (("l", p["sl"], p["el"]), ("r", p["sr"], p["er"])):
        e = (sh[0] + UA * d(a)[0], sh[1] + UA * d(a)[1])
        hnd = (e[0] + FA * d(a + b)[0], e[1] + FA * d(a + b)[1])
        j["elb_" + side], j["hand_" + side] = e, hnd
    for side, a, b in (("l", p["hl"], p["kl"]), ("r", p["hr"], p["kr"])):
        k = (pel[0] + TH * d(a)[0], pel[1] + TH * d(a)[1])
        f = (k[0] + SH * d(a + b)[0], k[1] + SH * d(a + b)[1])
        j["knee_" + side], j["foot_" + side] = k, f
    j["belly"] = (lerp(pel[0], chest[0], 0.45), lerp(pel[1], chest[1], 0.45))
    return j


def draw_stickman(c, p, j, pal, t, phone=None):
    ink = pal["ink"]
    w = 15.0
    body = strokep(ink, w)
    # legs
    for side in ("l", "r"):
        path = skia.Path()
        path.moveTo(*j["pel"])
        path.lineTo(*j["knee_" + side])
        path.lineTo(*j["foot_" + side])
        c.drawPath(path, body)
        fx, fy = j["foot_" + side]
        sgn = -1 if side == "l" else 1
        if p["sit"] < 0.5:
            c.drawLine(fx, fy, fx + sgn * 20, fy + 2, body)
    # torso
    c.drawLine(*j["pel"], *j["chest"], body)
    nk = j["head"]
    ha = math.radians(j["head_ang"])
    neck_end = (nk[0] - math.sin(ha) * HEAD_R, nk[1] + math.cos(ha) * HEAD_R)
    c.drawLine(*j["chest"], *neck_end, body)
    # arms
    for side in ("l", "r"):
        path = skia.Path()
        path.moveTo(*j["sh"])
        path.lineTo(*j["elb_" + side])
        path.lineTo(*j["hand_" + side])
        c.drawPath(path, body)
    if phone is not None:
        draw_phone(c, j["hand_l"], phone, pal, t)
    draw_head(c, p, j, pal, t)


def draw_head(c, p, j, pal, t):
    ink = pal["ink"]
    hx, hy = j["head"]
    c.save()
    c.translate(hx, hy)
    c.rotate(j["head_ang"])
    # hair cowlick (springs up when stressed)
    hair = p["hair"]
    hp = skia.Path()
    if hair < 0.5:
        hp.moveTo(-4, -HEAD_R + 2)
        hp.cubicTo(-10, -HEAD_R - 26, 18, -HEAD_R - 28, 10, -HEAD_R - 10)
        c.drawPath(hp, strokep(ink, 8, 1 - hair * 2))
    if hair > 0:
        wig = math.sin(t * 40) * 3 * hair
        for k, ang in enumerate((-28, 0, 26)):
            a = math.radians(ang)
            x0, y0 = math.sin(a) * HEAD_R * 0.92, -math.cos(a) * HEAD_R * 0.92
            ln = (18 + 14 * hair) * (1.15 if k == 1 else 1)
            x1, y1 = x0 + math.sin(a) * ln + wig, y0 - math.cos(a) * ln
            c.drawLine(x0, y0, x1, y1, strokep(ink, 7, clamp(hair * 1.6)))
    c.drawCircle(0, 0, HEAD_R, fillp(pal["head_fill"]))
    c.drawCircle(0, 0, HEAD_R, strokep(ink, 13))
    lx, ly = p["lookx"] * 9, p["looky"] * 7
    # blush
    if p["blush"] > 0.01:
        for sx in (-27, 27):
            c.drawOval(skia.Rect.MakeXYWH(sx - 10 + lx * 0.5, 9, 20, 10), fillp(hexrgb("#E79AB5"), 0.55 * p["blush"], 2))
    # eyes
    eo = p["eyes"]
    for sx in (-17, 17):
        ex, ey = sx + lx, -5 + ly
        if eo > 0.25:
            r = 6.5 * min(eo, 1.5)
            c.drawOval(skia.Rect.MakeXYWH(ex - r, ey - r * min(eo, 1.0) * (1 if eo <= 1 else 1.1), 2 * r,
                                          2 * r * min(eo, 1.0) * (1 if eo <= 1 else 1.1)), fillp(ink))
            if eo > 1.05:  # wide eyes: ring
                c.drawCircle(ex, ey, r + 4, strokep(ink, 2.5))
        else:
            ap = skia.Path()
            ap.moveTo(ex - 8, ey - 1)
            ap.quadTo(ex, ey + 7, ex + 8, ey - 1)
            c.drawPath(ap, strokep(ink, 4.5))
    # brows (worry: inner ends up)
    b = p["brow"]
    if abs(b) > 0.05:
        for sgn in (-1, 1):
            x_out, x_in = sgn * 27, sgn * 9
            c.drawLine(x_out + lx * 0.6, -21 + ly * 0.5 + 3 * b, x_in + lx * 0.6, -24 + ly * 0.5 - 7 * b,
                       strokep(ink, 4.5, clamp(abs(b) * 1.5)))
    # mouth
    m = p["mouth"]
    mo = p["mopen"]
    mx, my = lx * 0.6, 20 + ly * 0.4
    if mo > 0.05:
        r = 4 + 7 * mo
        c.drawOval(skia.Rect.MakeXYWH(mx - r * 0.8, my - r * 0.6, r * 1.6, r * 1.6), fillp(ink))
    else:
        mp = skia.Path()
        if m < -0.3:  # wobbly stressed mouth
            mp.moveTo(mx - 15, my + 3)
            mp.cubicTo(mx - 7, my - 6 * (-m), mx + 2, my + 8 * (-m), mx + 15, my - 1)
        else:
            mp.moveTo(mx - 14, my)
            mp.quadTo(mx, my + 16 * m, mx + 14, my)
        c.drawPath(mp, strokep(ink, 5))
    # sweat drop
    if p["sweat"] > 0.05:
        sy = -30 + 10 * ((t * 1.3) % 1.0)
        dp = skia.Path()
        dp.moveTo(44, sy - 12)
        dp.cubicTo(52, sy - 2, 52, sy + 8, 44, sy + 8)
        dp.cubicTo(36, sy + 8, 36, sy - 2, 44, sy - 12)
        c.drawPath(dp, fillp(hexrgb("#7FB6E0"), 0.9 * p["sweat"]))
    c.restore()


def draw_phone(c, hand, ph, pal, t):
    """ph: dict(glow, alpha, scale). Stylized phone, not the real app UI."""
    a = ph.get("alpha", 1.0)
    if a <= 0.01:
        return
    s = ph.get("scale", 1.0)
    x, y = hand
    c.save()
    c.translate(x - 4, y - 30)
    c.rotate(ph.get("rot", -8))
    c.scale(s, s)
    glow = ph.get("glow", 0.0)
    if glow > 0:
        c.drawCircle(0, 0, 90, fillp(LAV, 0.45 * glow * a, 30))
    body = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-30, -52, 60, 104), 12, 12)
    c.drawRRect(body, fillp(hexrgb("#2A2340") if not pal["night"] else hexrgb("#3A3170"), a))
    scr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-24, -44, 48, 86), 7, 7)
    scol = mixrgb(hexrgb("#8A86A6") if not pal["night"] else hexrgb("#5C52A0"), LAV, glow)
    c.drawRRect(scr, fillp(scol, a))
    if glow > 0.05:
        c.drawCircle(0, -2, 10 + 4 * math.sin(t * 5), fillp(CREAM, 0.85 * glow * a))
    c.restore()
    if ph.get("hand_over", True):
        c.drawCircle(x, y, 9, fillp(pal["ink"], a))


# ------------------------------------------------------------------ stickman timeline
def stickman_pose(t):
    stand = P()
    phone_look = P(sl=-22, el=-128, sr=14, er=-6, tilt=-9, lookx=-0.6, looky=0.6, mouth=0.15)
    flinch = P(sl=-30, el=-120, sr=150, er=40, shup=16, lift=14, tilt=4, eyes=1.35, mopen=0.8, brow=1.0, hair=1.0,
               lookx=-0.2, looky=-0.6)
    puzzled = P(sl=-26, el=-122, sr=168, er=-118, shup=8, tilt=-6, eyes=1.15, looky=-1.0, lookx=0.3, brow=0.8,
                mouth=-0.5, hair=0.8)
    duck = P(sl=-30, el=-110, sr=120, er=60, hl=-34, kl=56, hr=34, kr=-56, shup=14, tilt=6, eyes=1.2, brow=1.0,
             mouth=-0.6, hair=0.9, lookx=0.8)
    swat_up = P(sl=-28, el=-115, sr=172, er=10, hl=-14, kl=10, hr=14, kr=-10, lean=-6, eyes=1.1, brow=0.9,
                mouth=-0.5, hair=0.9, lookx=1.0)
    swat_hit = P(sl=-28, el=-115, sr=78, er=12, hl=-12, kl=8, hr=20, kr=-12, lean=9, eyes=1.25, brow=1.0,
                 mopen=0.5, hair=1.0, lookx=1.0)
    arm_caught = P(sl=-26, el=-112, sr=62, er=-40, lean=6, eyes=1.25, brow=1.0, mouth=-0.7, hair=1.0, lookx=1.0,
                   looky=0.2)
    wobble_a = P(sl=-24, el=-100, sr=40, er=-30, hl=-4, kl=2, hr=4, kr=-2, lean=-11, eyes=1.25, brow=1.0,
                 mouth=-0.7, hair=1.0, lookx=-0.6, looky=0.8, sweat=0.6)
    wobble_b = P(sl=-24, el=-100, sr=34, er=-26, hl=-4, kl=2, hr=4, kr=-2, lean=11, eyes=1.25, brow=1.0,
                 mouth=-0.7, hair=1.0, lookx=0.6, looky=0.8, sweat=0.8)
    pinned = P(sl=-22, el=-80, sr=8, er=-2, hl=-5, kl=3, hr=5, kr=-3, shup=12, eyes=1.1, brow=1.0, mouth=-0.75,
               hair=0.8, sweat=1.0, looky=0.4)
    hunch = P(sl=-26, el=-78, sr=8, er=-2, hl=-24, kl=40, hr=24, kr=-40, spine=176, neck=14, tilt=7, shup=20,
              eyes=0.9, brow=1.0, mouth=-0.8, hair=0.6, sweat=1.0, looky=0.8, lookx=-0.3)
    hunch_look_phone = dict(hunch, lookx=-1.0, looky=0.9, tilt=-10, eyes=1.0, brow=0.7, sl=-24, el=-96)
    tap_lift = dict(hunch_look_phone, sl=-30, el=-104)
    look_up = dict(hunch, tilt=0, lookx=0.0, looky=-1.0, eyes=1.25, brow=0.3, mopen=0.45, mouth=0.0, sweat=0.4,
                   hair=0.2, sl=-30, el=-104, neck=20)
    soften = dict(look_up, eyes=1.0, mopen=0.0, mouth=0.2, brow=0.0, sweat=0.0, hair=0.0)
    calm_pinned = P(sl=-12, el=0, sr=12, er=0, eyes=0.0, brow=0.0, mouth=0.25, looky=-0.2)
    arms_free = P(sl=-30, el=-6, sr=30, er=6, eyes=0.0, mouth=0.45, looky=-0.2, blush=0.3)
    arms_up = P(sl=-120, el=-16, sr=120, er=16, eyes=0.0, mouth=0.55, looky=-0.4, blush=0.4)
    relaxed = P(sl=-16, el=6, sr=16, er=-6, eyes=0.0, mouth=0.8, blush=0.6)
    content = P(sl=-16, el=6, sr=16, er=-6, eyes=1.0, mouth=0.85, blush=0.6, lookx=0.4, looky=-0.3)

    keys = [
        (0.00, phone_look), (0.42, phone_look), (0.55, flinch, ease_out), (0.9, flinch),
        (1.35, puzzled), (2.05, puzzled), (2.35, duck, ease_out), (2.52, swat_up), (2.74, swat_hit, ease_in),
        (3.05, arm_caught, ease_out), (3.45, arm_caught), (3.75, wobble_a), (4.15, wobble_b), (4.55, wobble_a),
        (5.0, pinned), (5.62, pinned), (5.84, hunch, ease_in), (7.2, hunch), (7.6, hunch_look_phone),
        (8.05, tap_lift), (8.3, hunch_look_phone, ease_in), (8.75, look_up, ease_out), (10.0, look_up),
        (10.8, soften), (11.25, soften), (13.4, calm_pinned), (15.0, calm_pinned), (15.9, arms_free),
        (16.2, arms_free), (18.5, arms_up), (18.7, arms_up), (20.9, relaxed), (21.15, content),
    ]
    if t <= 21.3:
        p = pose_track(t, keys)
    else:
        p = s5_pose(t, content)
    # breathing modifiers
    b = breath(t)
    if 11.0 <= t <= 21.4:
        p["spine"] += 12 * b
        p["shup"] += 14 * b - 5 * (1 - b) * remap(t, 13.6, 14.2)
        p["tilt"] += -5 * b
    # trembling while tangled
    trem = remap(t, 5.8, 6.1) * (1 - remap(t, 9.4, 10.4))
    if trem > 0:
        p["x"] += math.sin(t * 61) * 2.2 * trem
        p["lean"] += math.sin(t * 47) * 1.3 * trem
    # stumble shuffle
    if 3.45 <= t <= 4.9:
        p["x"] += 26 * math.sin((t - 3.45) * 5.4)
        p["lift"] += 16 * abs(math.sin((t - 3.45) * 7.5))
    # flinch hop
    p["lift"] += 22 * bump(t, 0.45, 0.8)
    return p


def s5_pose(t, content):
    stand = dict(content)
    crouch = dict(content, hl=-34, kl=54, hr=34, kr=-54, sl=-34, el=10, sr=34, er=-10, shup=-4, squash=0.6,
                  lookx=0.8, looky=-0.2, eyes=1.0)
    crouch_l = dict(crouch, lookx=-0.8)
    jump = dict(content, hl=-20, kl=30, hr=20, kr=-30, sl=-150, el=-10, sr=150, er=10, lookx=0.7, mouth=0.9)
    jump_l = dict(jump, lookx=-0.7)
    land = dict(content, hl=-30, kl=46, hr=30, kr=-46, sl=-72, el=-6, sr=72, er=6, squash=0.4, mouth=0.9)
    stretch = dict(content, sl=-118, el=-20, sr=118, er=20, eyes=0.0, mouth=0.9, looky=-0.5)
    sit = dict(content, sit=1.0, hl=-72, kl=172, hr=72, kr=-172, sl=-32, el=-14, sr=32, er=14, eyes=0.0,
               mouth=0.75, blush=0.6, looky=0.0, lookx=0.0)
    keys = [
        (21.3, stand), (21.5, dict(stand, squash=0.3)), (21.9, stand, ease_out_back),
        (22.4, crouch), (22.62, crouch, ease_in), (22.8, jump, ease_out), (22.98, land, ease_in),
        (23.25, stand, ease_out), (23.75, dict(crouch_l)), (24.0, crouch_l, ease_in), (24.18, jump_l, ease_out),
        (24.36, land, ease_in), (24.62, stand, ease_out), (24.95, stretch), (25.3, stretch),
        (25.9, sit, ease_io), (30.0, sit),
    ]
    p = pose_track(t, keys)
    # platform travel
    gx = [(21.3, 540.0), (22.62, 540.0), (22.98, 790.0, lambda x: x), (24.02, 790.0), (24.36, 540.0, lambda x: x)]
    p["x"] = track(t, gx)
    ga = platform_top(t, 0)
    if t < 22.62:
        p["ground"] = ga
    elif t < 22.98:
        x = remap(t, 22.62, 22.98)
        p["ground"] = lerp(ga, PLAT[1][1], x)
        p["lift"] += 170 * 4 * x * (1 - x)
    elif t < 24.02:
        p["ground"] = PLAT[1][1]
    elif t < 24.36:
        x = remap(t, 24.02, 24.36)
        p["ground"] = lerp(PLAT[1][1], PLAT[2][1], x)
        p["lift"] += 170 * 4 * x * (1 - x)
    else:
        p["ground"] = PLAT[2][1]
    # seated breathing in the end card
    if t > 25.9:
        bb = 0.5 - 0.5 * math.cos((t - 25.9) * 2 * math.pi / 4.2)
        p["spine"] += 8 * bb
        p["shup"] += 8 * bb
        p["tilt"] += 4 * math.sin((t - 25.9) * 1.3)
        p["blush"] = 0.6 + 0.2 * bb
    return p


# ------------------------------------------------------------------ platforms (scene 5)
PLAT = [(540.0, 1488.0), (792.0, 1318.0), (540.0, 1180.0)]  # (x, top)
PLAT_T = [21.35, 21.95, 23.15]  # appear
PLAT_LIT = [21.5, 22.98, 24.36]


def platform_top(t, i):
    if i == 0:
        return track(t, [(21.35, GROUND + 40), (21.85, PLAT[0][1], ease_out_back)])
    return PLAT[i][1]


def draw_platforms(c, t, pal):
    if t < 21.2:
        return
    for i, (x, top) in enumerate(PLAT):
        a = ease_out_back(remap(t, PLAT_T[i], PLAT_T[i] + 0.45))
        if a <= 0.01:
            continue
        top = platform_top(t, i)
        lit = smooth(remap(t, PLAT_LIT[i], PLAT_LIT[i] + 0.25))
        wdt, hgt = 250 * a, 44
        c.save()
        c.translate(x, top + hgt / 2)
        c.drawOval(skia.Rect.MakeXYWH(-wdt * 0.62, 10, wdt * 1.24, 44), fillp(MINT if lit else LAV, 0.25 + 0.3 * lit, 22))
        rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-wdt / 2, -hgt / 2, wdt, hgt), 22, 22)
        c.drawRRect(rr, fillp(mixrgb(hexrgb("#4A3F8C"), MINT, lit * 0.85)))
        c.drawRRect(rr, strokep(mixrgb(LAV, CREAM, lit), 4))
        # feature glyph on the platform face
        c.save()
        c.translate(0, 0)
        gcol = mixrgb(CREAM, NAVY, lit)
        gp = strokep(gcol, 4.5, a)
        if i == 0:  # wave / relaxation
            pth = skia.Path()
            pth.moveTo(-26, 2)
            pth.cubicTo(-16, -10, -8, -10, 0, 2)
            pth.cubicTo(8, 14, 16, 14, 26, 2)
            c.drawPath(pth, gp)
        elif i == 1:  # flag / challenge
            c.drawLine(-12, 13, -12, -14, gp)
            fp = skia.Path()
            fp.moveTo(-12, -14)
            fp.lineTo(16, -8)
            fp.lineTo(-12, -1)
            c.drawPath(fp, fillp(gcol, a))
        else:  # rising bars / progress
            for k, hh in enumerate((10, 18, 26)):
                c.drawLine(-16 + k * 16, 12, -16 + k * 16, 12 - hh, strokep(gcol, 7, a))
        c.restore()
        c.restore()
        if lit > 0:
            draw_burst(c, x, top, t, PLAT_LIT[i], 10, 150, GOLD, seed=40 + i, dur=0.8)


# ------------------------------------------------------------------ sparkles
def sparkle_path(r):
    p = skia.Path()
    k = r * 0.22
    p.moveTo(0, -r)
    p.quadTo(k, -k, r, 0)
    p.quadTo(k, k, 0, r)
    p.quadTo(-k, k, -r, 0)
    p.quadTo(-k, -k, 0, -r)
    p.close()
    return p


def draw_sparkle(c, x, y, r, rgb, a=1.0, rot=0.0):
    if a <= 0.01 or r <= 0.3:
        return
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.drawPath(sparkle_path(r * 1.6), fillp(rgb, a * 0.35, r * 0.6))
    c.drawPath(sparkle_path(r), fillp(rgb, a))
    c.restore()


def draw_burst(c, x, y, t, t0, n, radius, rgb, seed=0, dur=0.9):
    if t < t0 or t > t0 + dur:
        return
    rng = np.random.default_rng(seed)
    x01 = remap(t, t0, t0 + dur)
    for k in range(n):
        ang = 2 * math.pi * k / n + rng.uniform(-0.3, 0.3)
        dist = radius * rng.uniform(0.5, 1.0) * ease_out(x01)
        sz = rng.uniform(7, 15) * (1 - x01) * min(1, x01 * 6)
        draw_sparkle(c, x + math.cos(ang) * dist, y + math.sin(ang) * dist - 20 * x01, sz,
                     rgb, 1 - x01 ** 2, rot=k * 17)


# ------------------------------------------------------------------ threads
THREADS = [
    dict(rgb=CORAL, tag="clock"),
    dict(rgb=MUSTARD, tag="q"),
    dict(rgb=VIOLET, tag="mail"),
    dict(rgb=ROSE, tag="bell"),
]
RELEASE = [(13.75, 15.3), (14.05, 15.6), (18.7, 20.3), (19.0, 20.6)]


def thread_state(i, t, j):
    """Return orbit parameters, approach info and draw window for thread i at time t."""
    head, belly, pel = j["head"], j["belly"], j["pel"]
    ball_c = (belly[0], belly[1] + 6)
    knees = ((j["knee_l"][0] + j["knee_r"][0]) / 2, (j["knee_l"][1] + j["knee_r"][1]) / 2)
    fore_r = ((j["elb_r"][0] + j["hand_r"][0]) / 2, (j["elb_r"][1] + j["hand_r"][1]) / 2)
    tight = 1.0 - 0.13 * smooth(remap(t, 5.45, 5.85))
    pulse = 1.0 - 0.025 * max(0.0, math.sin(t * math.pi * 4)) * (remap(t, 5.9, 6.2) * (1 - remap(t, 8.3, 9.0)))
    loosen = 1.0 + 0.06 * breath(t) + 0.10 * smooth(remap(t, 13.8, 15.4))
    st = dict(w=9.0, alpha=1.0, lav=0.0, rel=0.0)
    if i == 0:
        m = smooth(remap(t, 3.3, 5.3))
        cx, cy = lerp(head[0], ball_c[0], m), lerp(head[1] - 6, ball_c[1] - 34, m)
        st.update(rx=lerp(92, 168, m), ry=lerp(26, 70, m), tilt=lerp(-10, -16, m), turns=lerp(1.6, 4.4, m),
                  prec=lerp(0, 46, m), spread=lerp(0, 170, m), phase=0.0, wob=0.05)
        st["approach"] = dict(a=(-140.0, 300.0), ctrl=(260.0, 560.0), t0=-0.32, t1=0.45, t2=1.05, tail=440)
    elif i == 1:
        m = smooth(remap(t, 3.5, 5.4))
        cx, cy = lerp(head[0], ball_c[0], m), lerp(head[1] - 20, ball_c[1] - 10, m)
        st.update(rx=lerp(80, 152, m), ry=lerp(34, 64, m), tilt=lerp(18, 20, m), turns=lerp(1.4, 4.0, m),
                  prec=lerp(0, -52, m), spread=lerp(0, 150, m), phase=1.7, wob=0.06)
        st["approach"] = dict(a=(head[0] + 10, head[1] - HEAD_R), ctrl=(head[0] + 150, head[1] - 330),
                              t0=1.02, t1=1.38, t2=1.95, tail=360)
    elif i == 2:
        m1 = smooth(remap(t, 2.74, 2.95))
        m = smooth(remap(t, 3.7, 5.5))
        bx, by = fore_r
        cx, cy = lerp(bx, ball_c[0], m), lerp(by, ball_c[1] + 10, m)
        fa = math.degrees(math.atan2(j["hand_r"][1] - j["elb_r"][1], j["hand_r"][0] - j["elb_r"][0]))
        st.update(rx=lerp(lerp(70, 50, m1), 176, m), ry=lerp(18, 76, m), tilt=lerp(fa + 90 - 90, 8, m),
                  turns=lerp(2.2, 4.2, m), prec=lerp(0, 34, m), spread=lerp(0, 130, m), phase=0.6, wob=0.05)
        st["tilt"] = lerp(fa, 8, m)
        st["rx"], st["ry"] = lerp(22, 176, m), lerp(lerp(70, 48, m1), 76, m)
        st["tilt"] = lerp(fa, 8, m) if m < 1 else 8
        st["approach"] = dict(a=(1240.0, 820.0), ctrl=(900.0, 760.0), t0=2.05, t1=2.74, t2=3.25, tail=420)
        st["fore"] = 1 - m
    else:
        m = smooth(remap(t, 4.2, 5.6))
        cx, cy = lerp(knees[0], ball_c[0], m), lerp(knees[1], ball_c[1] + 40, m)
        st.update(rx=lerp(64, 160, m), ry=lerp(20, 62, m), tilt=lerp(-4, -6, m), turns=lerp(2.0, 3.8, m),
                  prec=lerp(0, -30, m), spread=lerp(10, 120, m), phase=2.6, wob=0.06)
        st["approach"] = dict(a=(-160.0, 1660.0), ctrl=(220.0, 1660.0), t0=2.95, t1=3.45, t2=3.95, tail=420)
    k = tight * pulse
    if i < 2:
        k *= loosen
    else:
        k *= 1.0 + 0.04 * breath(t) + 0.12 * smooth(remap(t, 14.0, 15.6)) + 0.06 * breath(t) * (t > 16)
    st["rx"] *= k
    st["ry"] *= k
    st["c"] = (cx, cy)
    # release on exhales
    ra, rb = RELEASE[i]
    r = remap(t, ra, rb)
    if r > 0:
        er = ease_out(r)
        st["rx"] *= 1 + 1.7 * er
        st["ry"] *= 1 + 2.2 * er
        st["alpha"] = 1 - smooth(remap(r, 0.25, 0.95))
        st["w"] *= 1 - 0.55 * er
        st["lav"] = smooth(remap(r, 0.0, 0.5))
        st["wob"] += 0.12 * er
        st["rel"] = r
    return st


def thread_geometry(i, t, st):
    sp = spin(t)
    turns = st["turns"]
    n = max(int(turns * 64), 8)
    u = np.linspace(0, 1, n + 1)
    dirn = 1 if i % 2 == 0 else -1
    a = st["phase"] + dirn * sp * (1.0 + 0.12 * i) + 2 * np.pi * turns * u * dirn
    tilt = np.radians(st["tilt"] + st["prec"] * u)
    wob = 1 + st["wob"] * np.sin(3 * a + i * 1.3 + t * 2.1)
    lx = st["rx"] * wob * np.cos(a)
    ly = st["ry"] * wob * np.sin(a)
    cx, cy = st["c"]
    dy = st["spread"] * (u - 0.5)
    x = cx + lx * np.cos(tilt) - ly * np.sin(tilt)
    y = cy + dy + lx * np.sin(tilt) + ly * np.cos(tilt)
    z = np.sin(a) * dirn
    orbit = np.stack([x, y], 1)
    ap = st["approach"]
    # quadratic approach from ap.a via ctrl to orbit start (reversed: orbit starts where approach ends)
    p0 = np.array(ap["a"])
    p1 = np.array(ap["ctrl"])
    p2 = orbit[0]
    v = np.linspace(0, 1, 48)[:, None]
    approach = (1 - v) ** 2 * p0 + 2 * (1 - v) * v * p1 + v ** 2 * p2
    pts = np.concatenate([approach[:-1], orbit])
    zs = np.concatenate([np.ones(len(approach) - 1), z])
    seg = np.hypot(np.diff(pts[:, 0]), np.diff(pts[:, 1]))
    s = np.concatenate([[0], np.cumsum(seg)])
    alen = s[len(approach) - 1]
    total = s[-1]
    # travel window
    if t < ap["t1"]:
        x01 = remap(t, ap["t0"], ap["t1"])
        s1 = alen * x01
    else:
        s1 = alen + (total - alen) * ease_out(remap(t, ap["t1"], ap["t2"]))
    s0 = max(0.0, s1 - ap["tail"]) if t < ap["t1"] else max(0.0, alen * ease_in(remap(t, ap["t1"], ap["t1"] + 0.45)),
                                                              s1 - ap["tail"] - (total - alen))
    if t >= ap["t1"]:
        s0 = alen * ease_io(remap(t, ap["t1"], ap["t1"] + 0.5))
    return pts, zs, s, s0, s1


def draw_thread_pass(c, pts, zs, s, s0, s1, rgb, w, alpha, front):
    if s1 - s0 < 1 or alpha <= 0.01:
        return
    i0 = int(np.searchsorted(s, s0))
    i1 = int(np.searchsorted(s, s1))
    i0 = max(i0, 1)
    i1 = min(i1, len(s) - 1)

    def lerp_pt(sv):
        k = int(np.clip(np.searchsorted(s, sv), 1, len(s) - 1))
        f = (sv - s[k - 1]) / max(s[k] - s[k - 1], 1e-6)
        return pts[k - 1] + (pts[k] - pts[k - 1]) * f

    seq = [(lerp_pt(s0), zs[i0 - 1])] + [(pts[k], zs[k]) for k in range(i0, i1)] + [(lerp_pt(s1), zs[min(i1, len(zs) - 1)])]
    paint = strokep(rgb, w, alpha if front else alpha * 0.8)
    path = skia.Path()
    drawing = False
    for k in range(len(seq) - 1):
        (pa, za), (pb, zb) = seq[k], seq[k + 1]
        isf = (za + zb) >= 0
        if isf == front:
            if not drawing:
                path.moveTo(float(pa[0]), float(pa[1]))
                drawing = True
            path.lineTo(float(pb[0]), float(pb[1]))
        else:
            drawing = False
    c.drawPath(path, paint)


def draw_tag(c, x, y, kind, rgb, scale, alpha):
    if alpha <= 0.01 or scale <= 0.01:
        return
    c.save()
    c.translate(x, y)
    c.scale(scale * 1.25, scale * 1.25)
    c.drawCircle(0, 0, 24, fillp(rgb, alpha))
    c.drawCircle(0, 0, 24, strokep(hexrgb("#2A2340"), 3.5, alpha * 0.9))
    wc = CREAM
    pp = strokep(wc, 3.6, alpha)
    if kind == "clock":
        c.drawCircle(0, 0, 13, pp)
        c.drawLine(0, 0, 0, -8, pp)
        c.drawLine(0, 0, 6, 3, pp)
    elif kind == "mail":
        c.drawRect(skia.Rect.MakeXYWH(-13, -9, 26, 18), pp)
        mp = skia.Path()
        mp.moveTo(-13, -9)
        mp.lineTo(0, 2)
        mp.lineTo(13, -9)
        c.drawPath(mp, pp)
    elif kind == "bell":
        bp = skia.Path()
        bp.moveTo(-12, 8)
        bp.cubicTo(-10, 4, -10, -12, 0, -12)
        bp.cubicTo(10, -12, 10, 4, 12, 8)
        bp.close()
        c.drawPath(bp, fillp(wc, alpha))
        c.drawCircle(0, 11, 3.5, fillp(wc, alpha))
    else:
        f = font(900, 34)
        c.drawString("?", -text_w(f, "?") / 2, 12, f, fillp(wc, alpha))
    c.restore()


def thread_frames(t, j):
    out = []
    for i, th in enumerate(THREADS):
        st = thread_state(i, t, j)
        if t < st["approach"]["t0"]:
            continue
        pts, zs, s, s0, s1 = thread_geometry(i, t, st)
        rgb = mixrgb(th["rgb"], LAV, st["lav"])
        out.append((i, th, st, pts, zs, s, s0, s1, rgb))
    return out


def draw_threads(c, t, frames, front, pal):
    for (i, th, st, pts, zs, s, s0, s1, rgb) in frames:
        if st["alpha"] <= 0.01 and st["rel"] >= 1:
            continue
        draw_thread_pass(c, pts, zs, s, s0, s1, rgb, st["w"], st["alpha"], front)
        if front:
            # tag at the leading end
            k = int(np.clip(np.searchsorted(s, s1), 1, len(s) - 1))
            hx, hy = pts[k]
            rel = st["rel"]
            sc = 1.0 + 0.5 * ease_out(remap(rel, 0.0, 0.3))
            ta = (1 - smooth(remap(rel, 0.15, 0.35))) * min(1.0, (s1 - s0) / 40)
            draw_tag(c, float(hx), float(hy), th["tag"], th["rgb"], sc * (1 + 0.06 * math.sin(t * 9 + i)), ta)
            if rel > 0:
                # dissolve into sparkles along the widening loops
                n = 18
                for q in range(n):
                    kk = int((q + 0.5) / n * (len(pts) - 1))
                    if s[kk] < s0 or s[kk] > s1:
                        continue
                    px, py = pts[kk]
                    a = bump(rel, 0.12 + q * 0.012, 0.95)
                    draw_sparkle(c, float(px), float(py) - 70 * rel, 6 + 6 * a, GOLD if q % 3 == 0 else LAV, a,
                                 rot=q * 23 + t * 40)
                draw_burst(c, float(hx), float(hy), t, RELEASE[i][0] + 0.25, 8, 90, GOLD, seed=100 + i, dur=0.7)


# ------------------------------------------------------------------ Mello character (original vector take on the icon)
def buddy_path(t):
    w1 = math.sin(t * 5.0) * 4
    w2 = math.sin(t * 5.0 + 1.1) * 5
    w3 = math.sin(t * 5.0 + 2.2) * 5
    p = skia.Path()
    p.moveTo(-28, -78)
    p.cubicTo(30, -86, 78, -56, 98 + w1, -26)
    p.quadTo(140 + w1, -18, 120 + w2, 4)
    p.quadTo(144 + w2, 20, 112 + w3, 34)
    p.quadTo(128 + w3, 58, 86, 60)
    p.cubicTo(40, 78, -30, 74, -70, 50)
    p.cubicTo(-106, 28, -108, -30, -84, -54)
    p.cubicTo(-68, -70, -50, -77, -28, -78)
    p.close()
    return p


def draw_buddy(c, x, y, s, t, sx=1.0, sy=1.0, rot=0.0, alpha=1.0, glow=1.0, blink=True, mood=1.0):
    if alpha <= 0.01 or s <= 0.01:
        return
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.scale(s * sx, s * sy)
    if glow > 0:
        c.drawCircle(10, 0, 150, fillp(LAV, 0.22 * glow * alpha, 60))
    bp = buddy_path(t)
    shader = skia.GradientShader.MakeLinear([skia.Point(-60, -80), skia.Point(80, 70)],
                                            [col(hexrgb("#E2D6FB"), alpha), col(hexrgb("#BBA5F0"), alpha)])
    paint = skia.Paint(AntiAlias=True, Shader=shader)
    c.drawPath(bp, paint)
    # little arm, waving
    arm_a = -35 + 18 * math.sin(t * 6.0)
    c.save()
    c.translate(-92, 2)
    c.rotate(arm_a)
    c.drawOval(skia.Rect.MakeXYWH(-30, -12, 36, 24), fillp(hexrgb("#D4C5F8"), alpha))
    c.restore()
    # face
    face = col(hexrgb("#1B1636"), alpha)
    bl = 1.0
    if blink:
        ph = (t % 3.1)
        if ph < 0.12:
            bl = 0.15
    for ex in (-52, -4):
        c.drawOval(skia.Rect.MakeXYWH(ex - 7, -14 - 8 * bl, 14, 16 * bl), skia.Paint(AntiAlias=True, Color=face))
    mp = skia.Path()
    mp.moveTo(-38, 8)
    mp.quadTo(-28, 8 + 12 * mood, -18, 8)
    c.drawPath(mp, strokep(hexrgb("#1B1636"), 5, alpha))
    c.drawOval(skia.Rect.MakeXYWH(-70, 0, 16, 9), fillp(hexrgb("#F2A7C8"), 0.6 * alpha, 2))
    c.drawOval(skia.Rect.MakeXYWH(4, 0, 16, 9), fillp(hexrgb("#F2A7C8"), 0.6 * alpha, 2))
    c.restore()
    # forehead sparkle (as on the icon)
    draw_sparkle(c, x + (-60 * s * sx), y + (-44 * s * sy), 11 * s * (1 + 0.15 * math.sin(t * 4)), GOLD, alpha,
                 rot=t * 20)


RING_C = (540.0, 650.0)


def buddy_state(t, j):
    """Position/scale of the Mello character."""
    if t < 8.32:
        return None
    phone = j["hand_l"]
    px, py = phone[0] - 4, phone[1] - 40
    if t < 8.95:
        x01 = remap(t, 8.32, 8.95)
        e = ease_out(x01)
        x = lerp(px, RING_C[0], e) + math.sin(x01 * math.pi) * -60
        y = lerp(py, RING_C[1], e)
        s = 0.15 + 0.85 * ease_out_back(x01)
        st = 1 + 0.35 * math.sin(x01 * math.pi)
        return dict(x=x, y=y, s=s, sx=1 / st ** 0.5, sy=st, rot=-12 * math.sin(x01 * math.pi))
    x, y = RING_C
    s = 1.0
    sx = sy = 1.0
    sq = bump(t, 8.95, 9.2)
    sx, sy = 1 + 0.22 * sq, 1 - 0.18 * sq
    puff = bump(t, 9.05, 9.32)
    s *= 1 + 0.18 * puff
    b = breath(t)
    s *= 1 + 0.16 * b
    y += math.sin(t * 2.2) * 8
    rot = math.sin(t * 1.7) * 4
    if t > 21.0:
        # follow the stickman during the platform hops, then rise to the icon spot
        hx, hy = j["head"]
        fx = track(t, [(21.0, RING_C[0]), (21.8, 290.0), (24.4, 290.0), (25.0, 320.0)])
        fy = track(t, [(21.0, RING_C[1]), (21.8, 990.0), (22.98, 990.0), (23.5, 960.0), (24.4, 960.0),
                       (25.0, 905.0)])
        # a happy loop-the-loop when the third platform lights up
        lp = ease_io(remap(t, 24.4, 25.2))
        fx += 70 * math.sin(lp * 2 * math.pi)
        fy += -70 * (1 - math.cos(lp * 2 * math.pi)) / 2
        x, y = fx, fy + math.sin(t * 2.6) * 10
        turn = math.cos(math.pi * smooth(remap(t, 21.45, 21.75))) if t < 25.0 else \
            -math.cos(math.pi * smooth(remap(t, 25.45, 25.75)))
        sx = turn if abs(turn) > 0.08 else 0.08 * (1 if turn >= 0 else -1)
        if t > 25.6:
            _, _, ty, _, _ = camera(t)
            x01 = ease_io(remap(t, 25.6, 26.25))
            x = lerp(x, 540.0, x01)
            y = lerp(y, 640.0 - ty, x01)
            s = lerp(1.0, 1.75, ease_in(remap(t, 25.95, 26.35)))
            rot = lerp(rot, 0, x01)
        return dict(x=x, y=y, s=s, sx=sx, sy=1.0, rot=rot,
                    alpha=1 - smooth(remap(t, 26.18, 26.32)))
    return dict(x=x, y=y, s=s, sx=sx, sy=sy, rot=rot)


# ------------------------------------------------------------------ calm wave (world swap)
WAVE_T = (9.28, 10.35)


def wave_radius(t):
    return 2400 * smooth(remap(t, WAVE_T[0], WAVE_T[1])) if t >= WAVE_T[0] else 0.0


# ------------------------------------------------------------------ backgrounds
def draw_background(c, t, pal):
    """Screen-space background (no camera)."""
    shader = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, H)], [col(pal["bg_top"]), col(pal["bg_bot"])])
    c.drawRect(skia.Rect.MakeWH(W, H), skia.Paint(Shader=shader))
    r = res()
    if not pal["night"]:
        p = skia.Paint(AntiAlias=True)
        p.setAlphaf(0.07)
        p.setBlendMode(skia.BlendMode.kMultiply)
        c.drawImageRect(r["grain"], skia.Rect.MakeWH(W, H), skia.SamplingOptions(skia.FilterMode.kLinear), p)
        for (x, y, rr, ph) in r["dust"]:
            yy = (y - t * 22) % H
            c.drawCircle(x + 10 * math.sin(t + ph), yy, rr, fillp(hexrgb("#CBBFA8"), 0.5))
    else:
        _, _, ty, _, _ = camera(t)
        for (x, y, rr, ph, sp) in r["stars"]:
            tw = 0.55 + 0.45 * math.sin(t * sp + ph)
            yy = y + ty * 0.25
            if rr > 2.8:
                draw_sparkle(c, x, yy, rr * 2.4, CREAM, 0.75 * tw, rot=0)
            else:
                c.drawCircle(x, yy, rr * 0.8, fillp(CREAM, 0.7 * tw))
        # soft aurora glow behind the ring
        c.drawCircle(540, 760 + ty * 0.25, 520, fillp(hexrgb("#4B3C93"), 0.35, 160))


CLOCK_C = (186.0, 700.0)


def draw_clock_or_moon(c, t, pal):
    x, y = CLOCK_C
    if not pal["night"]:
        ink = pal["ink"]
        ring = 1 + 0.04 * math.sin(t * 30) * (remap(t, 4.0, 5.0) * (1 - remap(t, 8.0, 9.0)))
        r = 78 * ring
        c.drawCircle(x, y, r, fillp(hexrgb("#FBF6EC")))
        c.drawCircle(x, y, r, strokep(ink, 9))
        for k in range(12):
            a = k * math.pi / 6
            c.drawLine(x + math.cos(a) * (r - 18), y + math.sin(a) * (r - 18), x + math.cos(a) * (r - 9),
                       y + math.sin(a) * (r - 9), strokep(ink, 4))
        sp = spin(t)
        a1 = sp * 1.6
        a2 = sp * 0.35
        c.drawLine(x, y, x + math.sin(a1) * (r - 22), y - math.cos(a1) * (r - 22), strokep(CORAL, 6))
        c.drawLine(x, y, x + math.sin(a2) * (r - 38), y - math.cos(a2) * (r - 38), strokep(ink, 8))
        c.drawCircle(x, y, 7, fillp(ink))
        # ringing marks
        rm = remap(t, 3.8, 4.2) * (1 - remap(t, 8.4, 9.0))
        if rm > 0:
            for sgn in (-1, 1):
                for k in range(2):
                    rr = r + 16 + k * 14
                    a0 = -math.pi / 2 + sgn * 0.75
                    c.drawLine(x + math.cos(a0) * rr, y + math.sin(a0) * rr, x + math.cos(a0) * (rr + 10),
                               y + math.sin(a0) * (rr + 10), strokep(ink, 5, rm * (0.5 + 0.5 * math.sin(t * 25))))
    else:
        _, _, ty, _, _ = camera(t)
        yy = y - ty * 0.75  # sky parallax (camera already shifted by ty)
        c.drawCircle(x, yy, 120, fillp(LAV, 0.25, 40))
        m = skia.Path()
        m.addCircle(x, yy, 74)
        cut = skia.Path()
        k = smooth(remap(t, 9.4, 10.6))
        cut.addCircle(x + lerp(160, 34, k), yy - lerp(60, 22, k), 66)
        moon = skia.Op(m, cut, skia.PathOp.kDifference_PathOp)
        c.drawPath(moon, fillp(hexrgb("#F6EBC8")))


def draw_ground(c, t, pal):
    if not pal["night"]:
        p = skia.Path()
        p.moveTo(-200, GROUND + 2)
        for k in range(1, 15):
            x = -200 + k * 110
            p.lineTo(x, GROUND + 2 + 2.5 * math.sin(k * 1.9))
        c.drawPath(p, strokep(pal["ink"], 8))
        # little desk-side stack of papers
        for k in range(4):
            c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(820 + (k % 2) * 6, GROUND - 22 - k * 20, 150, 18), 4, 4),
                        fillp(hexrgb("#FBF6EC")))
            c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(820 + (k % 2) * 6, GROUND - 22 - k * 20, 150, 18), 4, 4),
                        strokep(pal["ink"], 4))
    else:
        hills = skia.Path()
        hills.moveTo(-200, GROUND + 10)
        hills.cubicTo(100, GROUND - 120, 300, GROUND - 60, 540, GROUND - 40)
        hills.cubicTo(780, GROUND - 20, 900, GROUND - 140, 1300, GROUND - 30)
        hills.lineTo(1300, GROUND + 900)
        hills.lineTo(-200, GROUND + 900)
        hills.close()
        c.drawPath(hills, fillp(hexrgb("#211A47")))
        c.drawRect(skia.Rect.MakeXYWH(-300, GROUND, 1700, 900), fillp(hexrgb("#1A1439")))
        c.drawLine(-300, GROUND, 1400, GROUND, strokep(hexrgb("#6A5CB0"), 4, 0.7))
        # grass tufts and drifting fireflies in the foreground
        for k in range(16):
            gx = -20 + k * 74 + 18 * math.sin(k * 2.7)
            sway = 5 * math.sin(t * 1.4 + k)
            for q in (-1, 0, 1):
                gp = skia.Path()
                gp.moveTo(gx + q * 9, GROUND + 2)
                gp.quadTo(gx + q * 12, GROUND - 20, gx + q * 18 + sway, GROUND - 30 - 8 * (q == 0))
                c.drawPath(gp, strokep(hexrgb("#4A3F8C"), 5))
        for k in range(14):
            ph = k * 1.93
            fx = (k * 83 + 40 * math.sin(t * 0.5 + ph)) % 1080
            fy = GROUND + 60 + (k * 37) % 260 + 20 * math.sin(t * 0.8 + ph)
            fa = 0.5 + 0.5 * math.sin(t * 2.2 + ph)
            c.drawCircle(fx, fy, 9, fillp(GOLD, 0.25 * fa, 6))
            c.drawCircle(fx, fy, 3, fillp(GOLD, 0.8 * fa))


def draw_plant(c, t, pal):
    x, y = 905.0, GROUND
    if not pal["night"]:
        return  # the papers stand on this spot in the paper world
    perk = smooth(remap(t, 18.8, 20.8))
    pot = skia.Path()
    pot.moveTo(x - 46, y - 74)
    pot.lineTo(x + 46, y - 74)
    pot.lineTo(x + 34, y)
    pot.lineTo(x - 34, y)
    pot.close()
    c.drawPath(pot, fillp(hexrgb("#3A3170")))
    c.drawPath(pot, strokep(CREAM, 6))
    leafc = mixrgb(hexrgb("#7C8F86"), MINT, perk)
    for k, base in enumerate((-40, -12, 14, 40)):
        droop = lerp(1.0, 0.0, perk)
        ang = math.radians(base + (base / abs(base) if base else 1) * 60 * droop + 4 * math.sin(t * 1.5 + k))
        ln = lerp(70, 110, perk)
        ex, ey = x + math.sin(ang) * ln, y - 74 - math.cos(ang) * ln
        cx_, cy_ = x + math.sin(ang * 0.5) * ln * 0.6, y - 74 - ln * 0.8
        lp = skia.Path()
        lp.moveTo(x, y - 74)
        lp.quadTo(cx_, cy_, ex, ey)
        c.drawPath(lp, strokep(leafc, 8))
        c.drawCircle(ex, ey, 11, fillp(leafc))
    if perk > 0.6:
        bloom = ease_out_back(remap(t, 20.4, 21.0))
        draw_sparkle(c, x, y - 74 - 118 * perk, 16 * bloom, GOLD, bloom, rot=t * 10)


# ------------------------------------------------------------------ ring (stylized breathing guide)
def draw_ring(c, t):
    a = smooth(remap(t, 10.3, 10.9)) * (1 - smooth(remap(t, 21.0, 21.5)))
    if a <= 0.01:
        return
    cx, cy = RING_C
    b = breath(t)
    r = 132 + 66 * b
    c.drawCircle(cx, cy, r, fillp(LAV, 0.10 * a))
    c.drawCircle(cx, cy, r, strokep(LAV, 5, 0.85 * a))
    c.drawCircle(cx, cy, r + 26, strokep(LAV, 2, 0.30 * a))
    # draw-on of ring at start
    sweep = 360 * smooth(remap(t, 10.3, 10.9))
    lab, (pa, pb) = breath_label(t)
    if lab:
        prog = remap(t, pa, pb)
        oval = skia.Rect.MakeXYWH(cx - r - 13, cy - r - 13, 2 * r + 26, 2 * r + 26)
        arc = skia.Path()
        arc.addArc(oval, -90, 360 * prog)
        c.drawPath(arc, strokep(GOLD, 6, a))
        ang = math.radians(-90 + 360 * prog)
        c.drawCircle(cx + math.cos(ang) * (r + 13), cy + math.sin(ang) * (r + 13), 9, fillp(GOLD, a))
    elif sweep < 360:
        oval = skia.Rect.MakeXYWH(cx - r, cy - r, 2 * r, 2 * r)
        arc = skia.Path()
        arc.addArc(oval, -90, sweep)
        c.drawPath(arc, strokep(GOLD, 6, a))


def draw_ring_label(c, t):
    lab, _ = breath_label(t)
    a = smooth(remap(t, 10.9, 11.3)) * (1 - smooth(remap(t, 21.0, 21.4)))
    if not lab or a <= 0.01:
        return
    cx, cy = RING_C
    f = font(800, 40)
    txt = lab.upper()
    # letter-spaced label
    sp = 6
    wt = sum(text_w(f, ch) for ch in txt) + sp * (len(txt) - 1)
    x = cx - wt / 2
    y = cy + 132 + 66 + 56
    # crossfade on label switch
    _, (pa, pb) = breath_label(t)
    fa = smooth(remap(t, pa - 0.05, pa + 0.25)) if pa > 11.3 else 1.0
    for ch in txt:
        c.drawString(ch, x, y, f, fillp(CREAM, a * fa * 0.95))
        x += text_w(f, ch) + sp


# ------------------------------------------------------------------ captions
CAPTIONS = [
    # (text with *highlight*, in, out)
    ("Thoughts stuck on a *loop?*", -0.08, 2.28),
    ("When your mind won't stop *spinning,*", 2.36, 4.25),
    ("everything gets *tangled.*", 4.25, 7.95),
    ("Take a *soft pause* with Mello.", 8.5, 11.1),
    ("*Breathe in…*", 11.35, 13.75),
    ("…and slowly, *let it go.*", 13.85, 16.25),
    ("Follow a *calming exercise,*", 16.32, 18.72),
    ("one breath *at a time.*", 18.78, 21.2),
]
CAP_SIZE = 76
CAP_MAXW = 900
CAP_Y = 300


def layout_caption(text, f):
    words = []
    hi = False
    for raw in text.split(" "):
        w = raw
        start_hi = w.startswith("*")
        if start_hi:
            hi = True
            w = w[1:]
        end_hi = w.endswith("*") or w.endswith("*,") or w.endswith("*.") or w.endswith("*?")
        if end_hi:
            w = w.replace("*", "")
        words.append((w, hi))
        if end_hi:
            hi = False
    space = text_w(f, " ")
    lines, cur, cw = [], [], 0.0
    for w, h in words:
        ww = text_w(f, w)
        add = ww if not cur else cw + space + ww
        if cur and add > CAP_MAXW:
            lines.append((cur, cw))
            cur, cw = [(w, h, ww)], ww
        else:
            cur.append((w, h, ww))
            cw = add
    if cur:
        lines.append((cur, cw))
    return lines, space


def draw_captions(c, t, pal):
    f = font(900, CAP_SIZE)
    for text, tin, tout in CAPTIONS:
        if t < tin - 0.01 or t > tout + 0.25:
            continue
        lines, space = layout_caption(text, f)
        out = smooth(remap(t, tout, tout + 0.22))
        lh = CAP_SIZE * 1.18
        y0 = CAP_Y - (len(lines) - 1) * lh / 2
        k = 0
        for li, (words, lw) in enumerate(lines):
            x = 540 - lw / 2
            y = y0 + li * lh - 18 * out
            for (w, hi, ww) in words:
                wi = ease_out_back(remap(t, tin + k * 0.055, tin + k * 0.055 + 0.32))
                a = clamp(remap(t, tin + k * 0.055, tin + k * 0.055 + 0.16)) * (1 - out)
                if a > 0.01:
                    rgb = pal["hi"] if hi else pal["caption"]
                    c.save()
                    c.translate(x + ww / 2, y)
                    sc = 0.7 + 0.3 * wi
                    c.scale(sc, sc)
                    c.translate(0, 26 * (1 - wi))
                    if pal["night"]:
                        c.drawString(w, -ww / 2, 0, f, fillp(NAVY, 0.55 * a, 10))
                    c.drawString(w, -ww / 2, 0, f, fillp(rgb, a))
                    c.restore()
                x += ww + space
                k += 1


CHIPS = [("Guided relaxation", "f1"), ("Wellness challenges", "f2"), ("Progress tools", "f3")]


def draw_chips(c, t):
    if t < 21.3 or t > 25.9:
        return
    f = font(900, 62)
    out = smooth(remap(t, 25.3, 25.7))
    for i, (txt, lid) in enumerate(CHIPS):
        t0 = TL[lid]["start"] - 0.05
        a = clamp(remap(t, t0, t0 + 0.18)) * (1 - out)
        if a <= 0.01:
            continue
        pop = ease_out_back(remap(t, t0, t0 + 0.4))
        y = 250 + i * 104 - 20 * out
        tw = text_w(f, txt)
        total = 74 + tw
        x0 = 540 - total / 2
        c.save()
        c.translate(x0 + 28, y)
        c.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop)
        c.drawCircle(0, 0, 28, fillp(MINT, a))
        ck = skia.Path()
        cp = ease_out(remap(t, t0 + 0.1, t0 + 0.35))
        ck.moveTo(-12, 1)
        ck.lineTo(-12 + 8 * min(1, cp * 2), 1 + 9 * min(1, cp * 2))
        if cp > 0.5:
            ck.lineTo(-4 + 18 * (cp - 0.5) * 2, 10 - 22 * (cp - 0.5) * 2)
        c.drawPath(ck, strokep(NAVY, 6, a))
        c.restore()
        c.drawString(txt, x0 + 74 + 24 * (1 - pop), y + 22, f, fillp(NAVY, 0.5 * a, 10))
        c.drawString(txt, x0 + 74 + 24 * (1 - pop), y + 22, f, fillp(CREAM, a))


# ------------------------------------------------------------------ end card
def draw_endcard(c, t):
    if t < 25.9:
        return
    # icon (real asset from the saved listing)
    ia = ease_out_back(remap(t, 26.15, 26.6))
    al = clamp(remap(t, 26.15, 26.3))
    cx = 540
    cy = 640 + 8 * math.sin((t - 26.6) * 2.0) * smooth(remap(t, 26.6, 27.2))
    size = 300 * (0.6 + 0.4 * ia)
    if al > 0:
        c.drawCircle(cx, cy, 230, fillp(LAV, 0.28 * al, 70))
        rect = skia.Rect.MakeXYWH(cx - size / 2, cy - size / 2, size, size)
        c.save()
        c.clipRRect(skia.RRect.MakeRectXY(rect, size * 0.22, size * 0.22), True)
        p = skia.Paint(AntiAlias=True)
        p.setAlphaf(al)
        c.drawImageRect(res()["icon"], rect, skia.SamplingOptions(skia.CubicResampler.Mitchell()), p)
        c.restore()
        # three sparkles orbiting the icon
        oa = smooth(remap(t, 26.7, 27.2))
        for k in range(3):
            ang = (t - 26.7) * 1.1 + k * 2.094
            sx_, sy_ = cx + math.cos(ang) * 215, cy + math.sin(ang) * 62
            draw_sparkle(c, sx_, sy_, 10 + 3 * math.sin(t * 5 + k), GOLD if k != 1 else CREAM, oa * (0.6 + 0.4 * math.sin(ang)),
                         rot=t * 30)
    fl = bump(t, 26.1, 26.45)
    if fl > 0:
        c.drawCircle(cx, cy, 120 + 160 * fl, fillp(CREAM, 0.85 * fl, 50))
    draw_burst(c, cx, cy, t, 26.2, 14, 260, GOLD, seed=77, dur=1.0)
    # wordmark
    f = font(900, 150)
    word = "Mello"
    wt = text_w(f, word)
    x = 540 - wt / 2
    for k, ch in enumerate(word):
        t0 = 26.25 + k * 0.06
        e = ease_out_back(remap(t, t0, t0 + 0.38))
        a = clamp(remap(t, t0, t0 + 0.15))
        cw = text_w(f, ch)
        if a > 0:
            c.save()
            c.translate(x + cw / 2, 945)
            c.scale(0.5 + 0.5 * e, 0.5 + 0.5 * e)
            c.translate(0, 40 * (1 - e))
            c.drawString(ch, -cw / 2, 0, f, fillp(CREAM, a))
            c.restore()
        x += cw
    # tagline (listing description wording)
    ft = font(800, 42)
    tag = "Guided relaxation & calming exercises"
    a = smooth(remap(t, 26.6, 26.95))
    c.drawString(tag, 540 - text_w(ft, tag) / 2, 1022 + 12 * (1 - a), ft, fillp(LAV, a))
    # CTA pill
    e = ease_out_back(remap(t, 26.9, 27.35), 2.2)
    a = clamp(remap(t, 26.9, 27.02))
    if a > 0:
        fw, fh = 720, 124
        c.save()
        c.translate(540, 1150)
        pulse = 1 + 0.022 * math.sin((t - 27.35) * 3.4) * smooth(remap(t, 27.35, 27.8))
        c.scale((0.4 + 0.6 * e) * pulse, (0.4 + 0.6 * e) * pulse)
        rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-fw / 2, -fh / 2, fw, fh), fh / 2, fh / 2)
        c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-fw / 2, -fh / 2 + 10, fw, fh), fh / 2, fh / 2),
                    fillp(NAVY, 0.6 * a, 14))
        c.drawRRect(rr, fillp(GOLD, a))
        # shimmer
        for ts in (27.9, 29.0):
            sx = lerp(-fw / 2 - 120, fw / 2 + 120, remap(t, ts, ts + 0.7))
            if ts <= t <= ts + 0.7:
                c.save()
                c.clipRRect(rr, True)
                sh = skia.Path()
                sh.moveTo(sx - 30, -fh)
                sh.lineTo(sx + 30, -fh)
                sh.lineTo(sx - 10, fh)
                sh.lineTo(sx - 70, fh)
                sh.close()
                c.drawPath(sh, fillp(CREAM, 0.55 * a, 6))
                c.restore()
        fc = font(900, 52)
        label = "Explore on Google Play"
        c.drawString(label, -text_w(fc, label) / 2, 18, fc, fillp(NAVY, a))
        c.restore()


# ------------------------------------------------------------------ world
def draw_world(c, t, pal, j, p, frames, bud):
    draw_background(c, t, pal)
    c.save()
    c.concat(cam_matrix(t))
    draw_clock_or_moon(c, t, pal)
    draw_ground(c, t, pal)
    draw_plant(c, t, pal)
    if pal["night"]:
        draw_platforms(c, t, pal)
        draw_ring(c, t)
    draw_threads(c, t, frames, False, pal)
    # phone state
    glow = smooth(remap(t, 7.2, 7.7)) * (0.7 + 0.3 * math.sin(t * 6)) + 0.6 * bump(t, 8.25, 8.7)
    glow *= 1 - smooth(remap(t, 9.5, 10.3))
    phone = dict(glow=clamp(glow), alpha=1 - smooth(remap(t, 10.4, 10.9)), scale=1.0 - 0.3 * smooth(remap(t, 10.4, 10.9)),
                 rot=-8)
    if t < 0.0:
        phone = None
    draw_stickman(c, p, j, pal, t, phone=phone)
    draw_threads(c, t, frames, True, pal)
    # alarm marks at the hook impact
    am = bump(t, 0.45, 1.05)
    if am > 0 and not pal["night"]:
        hx, hy = j["head"]
        for k, ang in enumerate((-60, -20, 20, 60)):
            a = math.radians(ang)
            r0, r1 = 72 + 18 * am, 100 + 26 * am
            c.drawLine(hx + math.sin(a) * r0, hy - math.cos(a) * r0, hx + math.sin(a) * r1, hy - math.cos(a) * r1,
                       strokep(CORAL, 7, am))
    # tap flash
    if 8.28 <= t <= 8.7:
        hx, hy = j["hand_l"]
        x01 = remap(t, 8.28, 8.7)
        c.drawCircle(hx - 4, hy - 30, 30 + 110 * ease_out(x01), strokep(LAV, 8 * (1 - x01), 1 - x01))
    draw_burst(c, j["hand_l"][0], j["hand_l"][1] - 40, t, 8.33, 10, 140, GOLD, seed=3, dur=0.8)
    if bud is not None and pal["night"] or (bud is not None and t < WAVE_T[0] + 0.3):
        draw_buddy(c, bud["x"], bud["y"], bud["s"], t, bud["sx"], bud["sy"], bud["rot"], bud.get("alpha", 1.0),
                   glow=1.0)
        draw_burst(c, RING_C[0], RING_C[1], t, 8.95, 12, 170, GOLD, seed=9, dur=0.9)
    if pal["night"]:
        draw_ring_label(c, t)
    c.restore()


def render_frame(t):
    surface = skia.Surface(W, H)
    c = surface.getCanvas()
    p = stickman_pose(t)
    j = rig(p)
    frames = thread_frames(t, j)
    bud = buddy_state(t, j)
    rw = wave_radius(t)
    if rw <= 0:
        draw_world(c, t, PAPER, j, p, frames, bud)
        draw_captions(c, t, PAPER)
    elif rw >= 2390:
        draw_world(c, t, NIGHT, j, p, frames, bud)
        draw_captions(c, t, NIGHT)
    else:
        draw_world(c, t, PAPER, j, p, frames, bud)
        draw_captions(c, t, PAPER)
        wx, wy, s = to_screen(t, RING_C[0], RING_C[1])
        circ = skia.Path()
        circ.addCircle(wx, wy, rw * s)
        c.save()
        c.clipPath(circ, skia.ClipOp.kIntersect, True)
        draw_world(c, t, NIGHT, j, p, frames, bud)
        draw_captions(c, t, NIGHT)
        c.restore()
        c.drawCircle(wx, wy, rw * s, strokep(LAV, 26, 0.55, 14))
        c.drawCircle(wx, wy, rw * s, strokep(CREAM, 4, 0.8))
    if t >= 21.2:
        draw_chips(c, t)
    draw_endcard(c, t)
    img = surface.makeImageSnapshot()
    return img.toarray(colorType=skia.kRGBA_8888_ColorType)


def frame_bytes(i):
    return render_frame(i / FPS).tobytes()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stills", default="")
    ap.add_argument("--outdir", default=os.path.join(GEN, "stills"))
    ap.add_argument("--video", default="")
    ap.add_argument("--workers", type=int, default=os.cpu_count() or 2)
    args = ap.parse_args()
    if args.stills:
        os.makedirs(args.outdir, exist_ok=True)
        for s in args.stills.split(","):
            t = float(s)
            arr = render_frame(t)
            img = skia.Image.fromarray(arr, colorType=skia.kRGBA_8888_ColorType)
            img.save(os.path.join(args.outdir, f"t{t:05.2f}.png"), skia.kPNG)
        print("stills ->", args.outdir)
    if args.video:
        import multiprocessing as mp
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}",
               "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
               "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", args.video]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        with mp.get_context("fork").Pool(args.workers) as pool:
            for k, buf in enumerate(pool.imap(frame_bytes, range(NFRAMES), chunksize=4)):
                proc.stdin.write(buf)
                if k % 90 == 0:
                    print(f"frame {k}/{NFRAMES}", flush=True)
        proc.stdin.close()
        rc = proc.wait()
        if rc:
            sys.exit(rc)
        print("video ->", args.video)


if __name__ == "__main__":
    main()
