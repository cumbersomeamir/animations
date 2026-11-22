"""Original pycairo re-implementation of the stickman-video skill's engine model and visual grammar.

Reference (read, not executed): nispa/stickman-video assets/engine/stick.tsx + fx.tsx + common.tsx (MIT).
Conventions kept from the skill:
  * angles in degrees, dir(a) = (sin a, cos a): 0 = down, 90 = right, -90 = left, 180 = up
  * upper limbs relative to the torso, forearm/shin relative to the upper limb, legs use the vertical
  * keys are cumulative; SNAP easing (bezier .2,.9,.25,1.15) overshoots, SMOOTH for arcs
  * filled head, white eyes, round-capped strokes, ghost trails when moving fast, draw-on 0..1
  * Slam (3.2 -> .92 -> 1.05 -> 1 with blur), Burst, Dust, SpeedLines, Caption pill, WordBlock,
    fall() with damped bounce, Stamp, Cursor, decaying camera shake on hits
Colours are overridden with the Recall icon palette.
"""
import math

import cairo


def hexc(h, a=1.0):
    h = h.lstrip("#")
    return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255, a)


LIME = hexc("#C7F36B")      # sampled from icon
INK = hexc("#20251B")       # sampled from icon
PAGE = hexc("#F8FAF3")      # sampled from icon
LIME_SHADE = hexc("#A8D44E")  # derived: ground line, dust
LIME_EDGE = hexc("#B9E25C")   # derived: paper vignette edge

F_COMIC, F_TITLE, F_TITLE_XB, F_BODY = "Bangers", "Barlow Condensed Black", "Barlow Condensed ExtraBold", "Inter Bold"


# ---------------------------------------------------------------- easing
def cubic_bezier(x1, y1, x2, y2):
    def bx(t):
        return 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3

    def by(t):
        return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3

    def f(x):
        if x <= 0:
            return 0.0
        if x >= 1:
            return 1.0
        lo, hi = 0.0, 1.0
        for _ in range(40):
            mid = (lo + hi) / 2
            if bx(mid) < x:
                lo = mid
            else:
                hi = mid
        return by((lo + hi) / 2)
    return f


SNAP = cubic_bezier(0.2, 0.9, 0.25, 1.15)
SMOOTH = cubic_bezier(0.45, 0, 0.55, 1)
EASE = cubic_bezier(0.2, 0.9, 0.25, 1)
LIN = lambda t: t  # noqa: E731


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def interp(f, xs, ys):
    """Clamped piecewise-linear interpolate (Remotion interpolate with clamp)."""
    if f <= xs[0]:
        return ys[0]
    for i in range(1, len(xs)):
        if f <= xs[i]:
            t = (f - xs[i - 1]) / (xs[i] - xs[i - 1])
            return ys[i - 1] + (ys[i] - ys[i - 1]) * t
    return ys[-1]


def ease(f, a, b, frm=0.0, to=1.0, e=EASE):
    return frm + (to - frm) * e(clamp((f - a) / (b - a)) if b > a else 1.0)


def rnd(seed):
    x = math.sin(hash_str(seed) * 12.9898) * 43758.5453
    return x - math.floor(x)


def hash_str(s):
    h = 0
    for ch in str(s):
        h = (h * 131 + ord(ch)) % 1000003
    return h + 1


# ---------------------------------------------------------------- figure
STAND = dict(x=540.0, y=1186.0, lean=0.0, head=0.0, la1=-18.0, la2=8.0, ra1=18.0, ra2=-8.0,
             ll1=-12.0, ll2=4.0, rl1=12.0, rl2=-4.0, rot=0.0)

P = dict(
    stand={},
    armsUp=dict(la1=-160, la2=-10, ra1=160, ra2=10),
    cheer=dict(la1=-150, la2=-30, ra1=150, ra2=30, head=-6),
    pointR=dict(ra1=95, ra2=0, la1=-15, la2=10),
    pointL=dict(la1=-95, la2=0, ra1=15, ra2=-10),
    shrug=dict(la1=-55, la2=-100, ra1=55, ra2=100, head=8),
    think=dict(ra1=30, ra2=145, la1=25, la2=80, head=10),
    crouch=dict(ll1=-60, ll2=95, rl1=50, rl2=90, lean=10, la1=-40, la2=-30, ra1=40, ra2=30),
    punchR=dict(lean=14, ra1=92, ra2=0, la1=-40, la2=-110, ll1=-30, ll2=10, rl1=35, rl2=-5),
    kickR=dict(lean=-30, rl1=105, rl2=0, ll1=-10, ll2=5, la1=-100, la2=20, ra1=-20, ra2=-40),
    carry=dict(la1=-160, la2=-30, ra1=160, ra2=30, lean=0, ll1=-15, ll2=15, rl1=15, rl2=-10),
    hold=dict(la1=50, la2=60, ra1=70, ra2=40),
    facepalm=dict(ra1=160, ra2=120, head=20, lean=5),
    sad=dict(lean=12, head=25, la1=-5, la2=0, ra1=5, ra2=0),
    shock=dict(la1=-120, la2=-40, ra1=120, ra2=40, head=-10, lean=-8),
)


def dirv(a):
    r = math.radians(a)
    return math.sin(r), math.cos(r)


def leg_len(scale):
    return (48 * math.cos(math.radians(12)) + 46 * math.cos(math.radians(8))) * scale


def ground_y(scale, ground):
    """Hip y that puts STAND feet on the ground line (skill: groundY(scale))."""
    return ground - leg_len(scale)


def solve(p, s=1.0, facing=1):
    T, UA, FA, TH, SH, R = 78 * s, 40 * s, 38 * s, 48 * s, 46 * s, 24 * s
    body = -p["lean"]
    up = dirv(180 - p["lean"])
    neck = (up[0] * T, up[1] * T)
    hd = dirv(180 - p["lean"] + p["head"])
    headc = (neck[0] + hd[0] * (R + 3), neck[1] + hd[1] * (R + 3))

    def limb(o, a1, a2, L1, L2, ref=body):
        d1 = dirv(ref + a1)
        e = (o[0] + d1[0] * L1, o[1] + d1[1] * L1)
        d2 = dirv(ref + a1 + a2)
        return e, (e[0] + d2[0] * L2, e[1] + d2[1] * L2)

    sh = (neck[0] * 0.92, neck[1] * 0.92)
    lE, lH = limb(sh, p["la1"], p["la2"], UA, FA)
    rE, rH = limb(sh, p["ra1"], p["ra2"], UA, FA)
    lK, lF = limb((0, 0), p["ll1"], p["ll2"], TH, SH, 0)
    rK, rF = limb((0, 0), p["rl1"], p["rl2"], TH, SH, 0)
    c, sn = math.cos(math.radians(p["rot"])), math.sin(math.radians(p["rot"]))

    def tr(v):
        x = v[0] * c - v[1] * sn
        y = v[0] * sn + v[1] * c
        return (p["x"] + x * facing, p["y"] + y)

    return dict(hip=(p["x"], p["y"]), neck=tr(neck), headC=tr(headc), lElbow=tr(lE), lHand=tr(lH),
                rElbow=tr(rE), rHand=tr(rH), lKnee=tr(lK), lFoot=tr(lF), rKnee=tr(rK), rFoot=tr(rF), headR=R)


def _poly_len(pts):
    return sum(math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) for i in range(1, len(pts)))


def _stroke_poly(ctx, pts, prog=1.0):
    if prog <= 0:
        return
    ctx.move_to(*pts[0])
    for q in pts[1:]:
        ctx.line_to(*q)
    if prog < 1:
        L = _poly_len(pts)
        ctx.set_dash([L * prog, L * 2])
    ctx.stroke()
    ctx.set_dash([])


def draw_figure(ctx, pose, color=INK, scale=1.0, facing=1, accessory="none", opacity=1.0, face="eyes",
                label=None, label_t=1.0, draw=1.0, blink=0.0, cap_color=LIME):
    j = solve(pose, scale, facing)
    if opacity <= 0.01:
        return j
    w = 12 * scale
    R = j["headR"]
    hx, hy = j["headC"]
    seg = lambda a, b: clamp((draw - a) / (b - a))  # noqa: E731
    d_head, d_torso, d_arms, d_legs = seg(0, 0.3), seg(0.3, 0.45), seg(0.45, 0.72), seg(0.72, 1)
    ctx.save()
    ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.set_line_join(cairo.LINE_JOIN_ROUND)
    ctx.set_line_width(w)
    ctx.set_source_rgba(*color[:3], opacity)
    _stroke_poly(ctx, [j["lFoot"], j["lKnee"], j["hip"], j["rKnee"], j["rFoot"]], d_legs)
    _stroke_poly(ctx, [j["lHand"], j["lElbow"], j["neck"], j["rElbow"], j["rHand"]], d_arms)
    _stroke_poly(ctx, [j["neck"], j["hip"]], d_torso)
    if draw >= 1:
        ctx.arc(hx, hy, R, 0, 2 * math.pi)
        ctx.fill()
    elif d_head > 0:
        ctx.arc(hx, hy, R - w / 2, -math.pi / 2, -math.pi / 2 + 2 * math.pi * d_head)
        ctx.stroke()
        if d_head >= 1:
            ctx.arc(hx, hy, R, 0, 2 * math.pi)
            ctx.fill()
    ux, uy = (hx - j["neck"][0]) / (R + 3), (hy - j["neck"][1]) / (R + 3)
    ang = math.atan2(uy, ux) + math.pi / 2
    if draw >= 0.999:
        ctx.save()
        ctx.translate(hx, hy)
        ctx.rotate(ang)
        ctx.scale(facing, 1)
        s = scale
        if accessory == "cap":
            ctx.move_to(-R - 1 * s, -5 * s)
            ctx.curve_to(-R, -R - 18 * s, R, -R - 18 * s, R + 1 * s, -5 * s)
            ctx.close_path()
            ctx.set_source_rgba(*cap_color[:3], opacity)
            ctx.fill_preserve()
            ctx.set_source_rgba(*INK[:3], opacity)
            ctx.set_line_width(3 * s)
            ctx.stroke()
            ctx.move_to(R - 2 * s, -7 * s)
            ctx.line_to(R + 17 * s, -6 * s)
            ctx.set_source_rgba(*cap_color[:3], opacity)
            ctx.set_line_width(6 * s)
            ctx.stroke()
        if face != "none":
            ry = 4.6 * s * (1 - clamp(blink))
            for ex in (7 * s, 15 * s):
                if ry < 1.0:
                    ctx.move_to(ex - 3 * s, -3 * s)
                    ctx.line_to(ex + 3 * s, -3 * s)
                    ctx.set_source_rgba(1, 1, 1, opacity)
                    ctx.set_line_width(2 * s)
                    ctx.stroke()
                else:
                    ctx.save()
                    ctx.translate(ex, -3 * s)
                    ctx.scale(3.2 * s, ry)
                    ctx.arc(0, 0, 1, 0, 2 * math.pi)
                    ctx.restore()
                    ctx.set_source_rgba(1, 1, 1, opacity)
                    ctx.fill()
            ctx.set_source_rgba(1, 1, 1, opacity)
            ctx.set_line_width(3 * s)
            if face == "angry":
                ctx.move_to(3 * s, -11 * s); ctx.line_to(19 * s, -7 * s); ctx.stroke()
            elif face == "sad":
                ctx.move_to(3 * s, -8 * s); ctx.line_to(19 * s, -12 * s); ctx.stroke()
            elif face == "happy":
                ctx.set_line_width(2.6 * s)
                ctx.move_to(6 * s, 7 * s); ctx.curve_to(9 * s, 11 * s, 13 * s, 11 * s, 16 * s, 7 * s); ctx.stroke()
            elif face == "shock":
                ctx.arc(11 * s, 9 * s, 3.4 * s, 0, 2 * math.pi); ctx.fill()
        ctx.restore()
    if label and label_t > 0:
        sc = clamp(label_t) * (1 + 0.25 * math.sin(math.pi * clamp(label_t)))
        ctx.save()
        ctx.translate(hx, hy - R - (34 if accessory == "cap" else 16) * scale)
        ctx.scale(sc, sc)
        font(ctx, F_COMIC, 30 * scale)
        tw = ctx.text_extents(label).x_advance
        ctx.move_to(-tw / 2, 0)
        ctx.text_path(label)
        ctx.set_source_rgba(*PAGE[:3], opacity)
        ctx.set_line_width(6 * scale * 0.6)
        ctx.stroke_preserve()
        ctx.set_source_rgba(*INK[:3], opacity)
        ctx.fill()
        ctx.restore()
    ctx.restore()
    return j


def pose_at(f, keys, base=None):
    """keys: [(frame, partial_pose, easing=SNAP), ...] cumulative (skill poseAt)."""
    acc = dict(STAND if base is None else base)
    full = []
    for k in keys:
        acc = {**acc, **k[1]}
        full.append(acc)
    if not keys:
        return acc
    if f <= keys[0][0]:
        return dict(full[0])
    for i in range(1, len(keys)):
        if f <= keys[i][0]:
            a, b = keys[i - 1][0], keys[i][0]
            e = keys[i][2] if len(keys[i]) > 2 else SNAP
            t = e(clamp((f - a) / (b - a)))
            A, B = full[i - 1], full[i]
            return {n: A[n] + (B[n] - A[n]) * t for n in A}
    return dict(full[-1])


def run_cycle(f, speed=0.45, amp=1.0):
    s, c = math.sin(f * speed), math.cos(f * speed)
    return dict(lean=14 * amp, ll1=-45 * s * amp, ll2=(35 + 35 * max(0, -c)) * amp, rl1=45 * s * amp,
                rl2=(35 + 35 * max(0, c)) * amp, la1=50 * s * amp, la2=-70 * amp, ra1=-50 * s * amp, ra2=-70 * amp)


def idle(f, seed=0.0):
    return dict(y=math.sin(f * 0.12 + seed) * 1.6 * 2, la1=math.sin(f * 0.1 + seed) * 2,
                ra1=-math.sin(f * 0.1 + seed) * 2)


def add_pose(p, d, weight=1.0):
    o = dict(p)
    for k, v in d.items():
        o[k] = o[k] + v * weight
    return o


def actor(ctx, f, get_pose, color=INK, scale=1.0, facing=1, trails=True, trail_min=40, **kw):
    """Animated figure with ghost smears when it moves fast (skill Actor)."""
    fc = facing if callable(facing) else (lambda _f: facing)
    now = get_pose(f)
    if trails:
        for d in (3, 2, 1):
            g = get_pose(f - d)
            dist = math.hypot(g["x"] - now["x"], g["y"] - now["y"]) + abs(g["rot"] - now["rot"]) * 1.5
            if dist > trail_min:
                draw_figure(ctx, g, color, scale, fc(f - d), opacity=(0.32 - d * 0.08), face="none",
                            accessory=kw.get("accessory", "none"), cap_color=kw.get("cap_color", LIME))
    return draw_figure(ctx, now, color, scale, fc(f), **kw)


# ---------------------------------------------------------------- text helpers
def font(ctx, face, size):
    ctx.select_font_face(face, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(size)


def text_w(ctx, s):
    return ctx.text_extents(s).x_advance


def _centered_text_path(ctx, s):
    e = ctx.text_extents(s)
    ctx.move_to(-e.x_advance / 2, -(e.y_bearing + e.height / 2))
    ctx.text_path(s)


def rrect(ctx, x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -math.pi / 2, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    ctx.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
    ctx.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
    ctx.close_path()


# ---------------------------------------------------------------- fx
def shake_at(f, hits, power=18, length=12):
    x = y = r = 0.0
    for h, pw in hits:
        d = f - h
        if 0 <= d < length:
            k = (1 - d / length) ** 2 * (pw if pw else power)
            x += (rnd(f"sx{h}-{d}") - 0.5) * 2 * k
            y += (rnd(f"sy{h}-{d}") - 0.5) * 2 * k
            r += (rnd(f"sr{h}-{d}") - 0.5) * k * 0.08
    return x, y, r


def paper(ctx, W, H, ground):
    g = cairo.RadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, H * 0.62)
    g.add_color_stop_rgba(0, *LIME[:3], 1)
    g.add_color_stop_rgba(0.55, *LIME[:3], 1)
    g.add_color_stop_rgba(1, *LIME_EDGE[:3], 1)
    ctx.set_source(g)
    ctx.paint()
    ctx.set_source_rgba(*LIME_SHADE[:3], 0.9)
    ctx.set_line_width(6)
    ctx.move_to(-100, ground)
    ctx.line_to(W + 100, ground)
    ctx.stroke()


def burst(ctx, x, y, at, f, color=INK, size=160, n=14):
    d = f - at
    if d < 0 or d > 14:
        return
    t = d / 14
    r0, r1 = size * (0.25 + t * 0.9), size * (0.45 + t * 1.25)
    ctx.save()
    if d < 3:
        ctx.arc(x, y, size * 0.55, 0, 2 * math.pi)
        ctx.set_source_rgba(*PAGE[:3], 1 - t)
        ctx.fill_preserve()
        ctx.set_source_rgba(*color[:3], 1 - t)
        ctx.set_line_width(8)
        ctx.stroke()
    ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.set_source_rgba(*color[:3], 1 - t)
    ctx.set_line_width(10 * (1 - t) + 2)
    for i in range(n):
        a = i / n * math.pi * 2 + rnd(f"b{at}{i}") * 0.3
        k = 0.7 + rnd(f"bl{at}{i}") * 0.6
        ctx.move_to(x + math.cos(a) * r0, y + math.sin(a) * r0)
        ctx.line_to(x + math.cos(a) * r1 * k, y + math.sin(a) * r1 * k)
        ctx.stroke()
    ctx.restore()


def dust(ctx, x, y, at, f, spread=120, color=INK, n=8, size=1.0, alpha=1.0):
    d = f - at
    if d < 0 or d > 22:
        return
    t = d / 22
    ctx.save()
    ctx.set_line_width(5)
    for i in range(n):
        side = 1 if i % 2 == 0 else -1
        k = 0.4 + rnd(f"d{at}{i}") * 0.8
        ctx.new_sub_path()
        ctx.arc(x + side * spread * k * math.sqrt(t), y - 30 * k * t - 6, (10 + 18 * k) * (0.6 + t) * size, 0, 2 * math.pi)
        ctx.set_source_rgba(*PAGE[:3], (1 - t) * 0.55 * alpha)
        ctx.fill_preserve()
        ctx.set_source_rgba(*color[:3], (1 - t) * 0.8 * alpha)
        ctx.stroke()
    ctx.restore()


def speed_lines(ctx, f, frm, to, direction=1, color=PAGE, W=1080, y0=600, y1=1400):
    if f < frm or f > to:
        return
    o = interp(f, [frm, frm + 4, to - 4, to], [0, 1, 1, 0])
    ctx.save()
    ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    for i in range(14):
        y = y0 + rnd(f"sl{i}") * (y1 - y0)
        ln = 160 + rnd(f"sll{i}") * 360
        x = ((rnd(f"slx{i}") * 1600 - f * 90 * direction) % 1600) - 260
        ctx.set_source_rgba(*color[:3], 0.75 * o)
        ctx.set_line_width(4 + rnd(f"slw{i}") * 6)
        ctx.move_to(x, y)
        ctx.line_to(x + ln, y)
        ctx.stroke()
    ctx.restore()


def slam(ctx, f, at, text, x, y, size=120, color=INK, face=F_COMIC, rotate=0.0, out=None, stroke=PAGE,
         stroke_w=10, spacing=0):
    d = f - at
    if d < 0:
        return
    s = interp(d, [0, 5, 9, 13], [3.2, 0.92, 1.05, 1])
    o = interp(d, [0, 3], [0, 1])
    if out is not None:
        o *= interp(f, [out, out + 8], [1, 0])
    if o <= 0.01:
        return
    blur = interp(d, [0, 5], [8, 0])
    font(ctx, face, size)
    copies = [(0, 0, 1.0)] if blur < 0.3 else [(math.cos(a) * blur * 1.5, math.sin(a) * blur * 1.5, 0.22)
                                               for a in [i * math.pi / 4 for i in range(8)]]
    for dx, dy, al in copies:
        ctx.save()
        ctx.translate(x + dx, y + dy)
        ctx.rotate(math.radians(rotate))
        ctx.scale(s, s)
        _centered_text_path(ctx, text)
        if stroke is not None:
            ctx.set_source_rgba(*stroke[:3], o * al)
            ctx.set_line_width(stroke_w)
            ctx.set_line_join(cairo.LINE_JOIN_ROUND)
            ctx.stroke_preserve()
        ctx.set_source_rgba(*color[:3], o * al)
        ctx.fill()
        ctx.restore()


def caption(ctx, f, at, text, x=540, y=1480, out=None, bg=INK, color=PAGE, size=44, face=F_BODY, punch=0.0):
    d = f - at
    if d < 0:
        return None
    t = ease(f, at, at + 10)
    o = t
    if out is not None:
        o *= interp(f, [out, out + 8], [1, 0])
    if o <= 0.01:
        return None
    font(ctx, face, size)
    tw = text_w(ctx, text)
    pw, ph = tw + 60, size + 28 + 10
    ctx.save()
    ctx.translate(x, y + (1 - t) * 40)
    s = 1 + punch
    ctx.scale(s, s)
    rrect(ctx, -pw / 2, -ph / 2 + 8, pw, ph, 14)
    ctx.set_source_rgba(0, 0, 0, 0.12 * o)
    ctx.fill()
    rrect(ctx, -pw / 2, -ph / 2, pw, ph, 14)
    ctx.set_source_rgba(*bg[:3], o)
    ctx.fill()
    _centered_text_path(ctx, text)
    ctx.set_source_rgba(*color[:3], o)
    ctx.fill()
    ctx.restore()
    return (x - pw / 2, y - ph / 2, pw, ph)


def word_block(ctx, x, y, text, r=0.0, s=1.0, size=54, bg=PAGE, color=INK, alpha=1.0, flip=1.0):
    w = len(text) * size * 0.56 + 50
    h = size + 34
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(math.radians(r))
    ctx.scale(s * max(0.05, abs(flip)), s)
    rrect(ctx, -w / 2, -h / 2, w, h, 10)
    ctx.set_source_rgba(*bg[:3], alpha)
    ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha)
    ctx.set_line_width(6)
    ctx.stroke()
    font(ctx, F_TITLE, size)
    _centered_text_path(ctx, text)
    ctx.set_source_rgba(*color[:3], alpha)
    ctx.fill()
    ctx.restore()
    return w, h


def fall(f, at, y0, y1, dur=12):
    if f < at:
        return y0
    t = (f - at) / dur
    if t < 1:
        return y0 + (y1 - y0) * t * t
    b = f - at - dur
    return y1 - abs(math.sin(b * 0.45)) * 40 * math.exp(-b * 0.25)


def stamp(ctx, f, at, x, y, text, color=INK, size=56, r=-12):
    d = f - at
    if d < 0:
        return
    s = interp(d, [0, 4, 7], [2.4, 0.94, 1])
    o = interp(d, [0, 2], [0, 1])
    if o <= 0.01:
        return
    font(ctx, F_TITLE, size)
    tw = text_w(ctx, text)
    w, h = tw + 44, size + 26
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(math.radians(r))
    ctx.scale(s, s)
    ctx.set_source_rgba(*color[:3], 0.92 * o)
    rrect(ctx, -w / 2, -h / 2, w, h, 8)
    ctx.set_line_width(7)
    ctx.stroke()
    rrect(ctx, -w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 5)
    ctx.set_line_width(3)
    ctx.stroke()
    _centered_text_path(ctx, text)
    ctx.fill()
    ctx.restore()


def cursor(ctx, x, y, scale=3.2, pressed=False, rot=0.0):
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    k = scale * (0.88 if pressed else 1)
    ctx.scale(k, k)
    pts = [(0, 0), (0, 34), (8, 26), (14, 40), (20, 37), (14, 24), (25, 24)]
    ctx.move_to(*pts[0])
    for q in pts[1:]:
        ctx.line_to(*q)
    ctx.close_path()
    ctx.set_source_rgba(1, 1, 1, 1)
    ctx.fill_preserve()
    ctx.set_source_rgba(0, 0, 0, 1)
    ctx.set_line_width(2.4)
    ctx.set_line_join(cairo.LINE_JOIN_ROUND)
    ctx.stroke()
    ctx.restore()


def title_fall(ctx, f, at, text, x, y, size=200, stagger=3, dur=12, out_at=None, face=F_TITLE, color=INK):
    """Physical title: letters fall one by one and land with dust (skill cold-open recipe)."""
    font(ctx, face, size)
    widths = [text_w(ctx, ch) for ch in text]
    total = sum(widths) + 8 * (len(text) - 1)
    cx = x - total / 2
    lands = []
    for i, ch in enumerate(text):
        a = at + i * stagger
        yy = fall(f, a, -260, y, dur)
        lands.append(a + dur)
        o = 1.0 if f >= a else 0.0
        if out_at is not None and f >= out_at + i * 2:
            k = (f - out_at - i * 2) / 10
            yy -= 900 * k * k
            o *= clamp(1 - k)
        if o > 0:
            ctx.save()
            ctx.translate(cx + widths[i] / 2, yy)
            ctx.rotate(math.radians((rnd(f"tr{i}") - 0.5) * 8))
            _centered_text_path(ctx, ch)
            ctx.set_source_rgba(*PAGE[:3], o)
            ctx.set_line_width(12)
            ctx.set_line_join(cairo.LINE_JOIN_ROUND)
            ctx.stroke_preserve()
            ctx.set_source_rgba(*color[:3], o)
            ctx.fill()
            ctx.restore()
            dust(ctx, cx + widths[i] / 2, y + size * 0.4, a + dur, f, spread=60, n=4, size=0.6, alpha=0.6)
        cx += widths[i] + 8
    return lands
