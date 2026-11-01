"""Stickman rig: hip/torso/head chain with 2-bone IK limbs and an expressive face."""
import math

from anim import Track

INK = (0x20 / 255, 0x25 / 255, 0x1B / 255)
PAGE = (0xF8 / 255, 0xFA / 255, 0xF3 / 255)

TORSO, NECK, HEAD_R = 150.0, 14.0, 44.0
UPPER, FORE = 84.0, 80.0
THIGH, SHIN = 102.0, 98.0
LW = 13.0

BASE = {
    "hip": (540.0, 1185.0), "lean": 0.0, "tilt": 0.0, "scale": 1.0,
    "h1": (24.0, 150.0), "h2": (-20.0, 150.0),          # hands, relative to shoulder
    "f1": (568.0, 1380.0), "f2": (512.0, 1380.0),       # feet, world
    "H1": (0.0, 0.0), "H2": (0.0, 0.0), "hw1": 0.0, "hw2": 0.0,  # optional world hand targets + blend
    "ep1": (-0.4, 1.0), "ep2": (-0.4, 1.0),             # elbow pole (x mirrored by facing)
    "kp": 1.0,                                          # knee pole forward multiplier
    "facing": 1.0, "blink": 0.0, "eyes": 1.0, "brow": 0.0, "browup": 0.0,
    "mouth": 0.3, "open": 0.0, "look": (0.0, 0.0), "alpha": 1.0,
}


def pose(**kw):
    p = dict(BASE)
    p.update(kw)
    return p


def PoseTrack(keys):
    """Track of pose dicts; the first key is completed from BASE."""
    first = dict(BASE)
    first.update(keys[0][1])
    keys = [(keys[0][0], first) + tuple(keys[0][2:])] + list(keys[1:])
    return Track(keys)


def _rot(v, a):
    c, s = math.cos(a), math.sin(a)
    return v[0] * c - v[1] * s, v[0] * s + v[1] * c


def _ik(root, target, a, b, pole):
    dx, dy = target[0] - root[0], target[1] - root[1]
    d = math.hypot(dx, dy)
    d = max(abs(a - b) + 1e-3, min(a + b - 1e-3, d))
    base = math.atan2(dy, dx)
    off = math.acos(max(-1.0, min(1.0, (a * a + d * d - b * b) / (2 * a * d))))
    c1 = (root[0] + a * math.cos(base + off), root[1] + a * math.sin(base + off))
    c2 = (root[0] + a * math.cos(base - off), root[1] + a * math.sin(base - off))
    mid = (root[0] + dx / 2, root[1] + dy / 2)
    s1 = (c1[0] - mid[0]) * pole[0] + (c1[1] - mid[1]) * pole[1]
    s2 = (c2[0] - mid[0]) * pole[0] + (c2[1] - mid[1]) * pole[1]
    joint = c1 if s1 >= s2 else c2
    # end point (clamped reach)
    ux, uy = (dx / (math.hypot(dx, dy) or 1)), (dy / (math.hypot(dx, dy) or 1))
    end = (root[0] + ux * d, root[1] + uy * d)
    return joint, end


def joints(p):
    """World positions of every joint for pose p (used for prop attachment)."""
    sc = p["scale"]
    hip = p["hip"]
    lean = p["lean"]
    sh = _rot((0, -TORSO * sc), lean)
    shoulder = (hip[0] + sh[0], hip[1] + sh[1])
    nk = _rot((0, -(TORSO + NECK) * sc), lean)
    neck = (hip[0] + nk[0], hip[1] + nk[1])
    hd = _rot((0, -HEAD_R * sc), lean + p["tilt"])
    head = (neck[0] + hd[0], neck[1] + hd[1])
    s = 1.0 if p["facing"] >= 0 else -1.0
    out = {"hip": hip, "shoulder": shoulder, "neck": neck, "head": head}
    for k in ("1", "2"):
        h = p["h" + k]
        w = p["hw" + k]
        Hw = p["H" + k]
        tgt = (shoulder[0] + h[0] * sc, shoulder[1] + h[1] * sc)
        if w > 0:
            tgt = (tgt[0] + (Hw[0] - tgt[0]) * w, tgt[1] + (Hw[1] - tgt[1]) * w)
        ep = p["ep" + k]
        el, hand = _ik(shoulder, tgt, UPPER * sc, FORE * sc, (ep[0] * s, ep[1]))
        out["elbow" + k], out["hand" + k] = el, hand
        f = p["f" + k]
        kn, foot = _ik(hip, f, THIGH * sc, SHIN * sc, (s * p["kp"], -0.25))
        out["knee" + k], out["foot" + k] = kn, foot
    return out


def draw_stickman(ctx, p, hair=True):
    j = joints(p)
    sc = p["scale"]
    a = p["alpha"]
    if a <= 0.01:
        return j
    ctx.save()
    ctx.set_line_cap(1)  # round
    ctx.set_line_join(1)
    ctx.set_source_rgba(*INK, a)
    ctx.set_line_width(LW * sc)
    # far limbs first
    for k in ("2", "1"):
        ctx.move_to(*j["hip"]); ctx.line_to(*j["knee" + k]); ctx.line_to(*j["foot" + k]); ctx.stroke()
    ctx.move_to(*j["shoulder"]); ctx.line_to(*j["elbow2"]); ctx.line_to(*j["hand2"]); ctx.stroke()
    # torso
    ctx.move_to(*j["hip"]); ctx.line_to(*j["neck"]); ctx.stroke()
    # near arm
    ctx.move_to(*j["shoulder"]); ctx.line_to(*j["elbow1"]); ctx.line_to(*j["hand1"]); ctx.stroke()
    # hands
    for k in ("1", "2"):
        ctx.arc(*j["hand" + k], 8.5 * sc, 0, 2 * math.pi); ctx.fill()
    # head
    hx, hy = j["head"]
    ctx.translate(hx, hy)
    ctx.rotate(p["lean"] + p["tilt"])
    ctx.scale(sc, sc)
    r = HEAD_R
    ctx.arc(0, 0, r, 0, 2 * math.pi)
    ctx.set_source_rgba(*PAGE, a); ctx.fill_preserve()
    ctx.set_source_rgba(*INK, a); ctx.set_line_width(11); ctx.stroke()
    f = max(-1.0, min(1.0, p["facing"]))
    if hair:
        # cowlick tuft, leaning away from facing direction
        ctx.set_line_width(8)
        for i, (ox, ln, ang) in enumerate(((-10, 20, -0.5), (2, 26, -0.15), (13, 18, 0.25))):
            bx = ox - f * 6
            by = -math.sqrt(max(0, r * r - bx * bx)) + 4
            ex, ey = bx + math.sin(ang - f * 0.35) * ln, by - math.cos(ang - f * 0.35) * ln
            ctx.move_to(bx, by)
            ctx.curve_to(bx, by - ln * 0.5, ex - f * 4, ey + 6, ex, ey)
            ctx.stroke()
    # face
    fx = f * 15
    sp = 15 * (1 - 0.32 * abs(f))
    lx, ly = p["look"]
    eyes = p["eyes"]
    blink = max(0.0, min(1.0, p["blink"]))
    for side in (-1, 1):
        ex = fx + side * sp + lx * 3.5
        ey = -3 + ly * 3.5
        ry = 6.8 * eyes * (1 - blink)
        if ry < 1.2:
            ctx.set_line_width(4)
            ctx.move_to(ex - 5, ey); ctx.line_to(ex + 5, ey); ctx.stroke()
        else:
            ctx.save(); ctx.translate(ex, ey); ctx.scale(5.6 * eyes, ry)
            ctx.arc(0, 0, 1, 0, 2 * math.pi); ctx.restore(); ctx.fill()
        # brow: inner end down when brow>0 (determined), up when <0 (worried)
        by = -19 - p["browup"] - (eyes - 1) * 6
        inner = -side  # direction toward face centre
        tilt = p["brow"] * 0.45
        bx0, bx1 = ex - inner * 7, ex + inner * 7
        ctx.set_line_width(4.5)
        ctx.move_to(bx0, by - math.sin(tilt) * 4)
        ctx.line_to(bx1, by + math.sin(tilt) * 4)
        ctx.stroke()
    mx, my = fx + f * 3, 17
    op = p["open"]
    if op > 0.06:
        ctx.save(); ctx.translate(mx, my + op * 3); ctx.scale(7 + op * 3, 2 + op * 9)
        ctx.arc(0, 0, 1, 0, 2 * math.pi); ctx.restore(); ctx.fill()
    else:
        m = p["mouth"]
        ctx.set_line_width(4.5)
        ctx.move_to(mx - 10, my - m * 3)
        ctx.curve_to(mx - 4, my + m * 7, mx + 4, my + m * 7, mx + 10, my - m * 3)
        ctx.stroke()
    ctx.restore()
    return j
