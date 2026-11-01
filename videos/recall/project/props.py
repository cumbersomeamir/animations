"""Vector props for the Recall stickman film (all original drawings)."""
import math

import cairo

from anim import hash01

def hexc(h, a=1.0):
    h = h.lstrip("#")
    return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255, a)


INK = hexc("#20251B")
PAGE = hexc("#F8FAF3")
LIME = hexc("#C7F36B")
LIME_D = hexc("#9DCC3C")
LAV = hexc("#B597E7")
LAV_D = hexc("#8F6CCB")
PAPER = hexc("#F4F2E9")
FLOOR_FILL = hexc("#EAE7DC")
GRID = hexc("#E2DED1")

FLOOR = 1380.0

FONT_BLACK = "Inter Display Black"
FONT_BOLD = "Inter Display Bold"
FONT_SEMI = "Inter Display SemiBold"


def mix(c1, c2, t):
    return tuple(a + (b - a) * t for a, b in zip(c1, c2))


def rrect(ctx, x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -math.pi / 2, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    ctx.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
    ctx.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
    ctx.close_path()


def font(ctx, face, size):
    ctx.select_font_face(face, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(size)


def text_w(ctx, s):
    return ctx.text_extents(s).x_advance


def text_center(ctx, s, x, y, color=INK):
    """Draw s centred horizontally at x with baseline-ish optical centre at y."""
    ext = ctx.text_extents(s)
    fe = ctx.font_extents()
    ctx.set_source_rgba(*color)
    ctx.move_to(x - ext.x_advance / 2, y + (fe[0] - fe[1]) / 2 * 0.86)
    ctx.show_text(s)


def soft_shadow(ctx, x, y, rx, ry, a=0.13):
    if a <= 0:
        return
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(rx, ry)
    g = cairo.RadialGradient(0, 0, 0, 0, 0, 1)
    g.add_color_stop_rgba(0, INK[0], INK[1], INK[2], a)
    g.add_color_stop_rgba(1, INK[0], INK[1], INK[2], 0)
    ctx.set_source(g)
    ctx.arc(0, 0, 1, 0, 2 * math.pi)
    ctx.fill()
    ctx.restore()


# --- background ----------------------------------------------------------
def background(ctx, W, H, tint=0.0, floor_alpha=1.0, night=None):
    base = PAPER if night is None else mix(PAPER, night, tint)
    ctx.save(); ctx.identity_matrix()
    ctx.set_source_rgba(*base)
    ctx.paint()
    ctx.restore()
    # notebook dot grid
    ctx.set_source_rgba(*mix(GRID, base, 0.15))
    step = 60
    for gy in range(30, int(FLOOR) - 20, step):
        for gx in range(-210, W + 240, step):
            ctx.rectangle(gx - 2, gy - 2, 4, 4)
    ctx.fill()
    if floor_alpha > 0:
        fl = FLOOR_FILL if night is None else mix(FLOOR_FILL, night, tint * 0.8)
        ctx.set_source_rgba(*fl[:3], floor_alpha)
        ctx.rectangle(-200, FLOOR, W + 400, H - FLOOR + 400)
        ctx.fill()
        ctx.set_source_rgba(*INK[:3], 0.06 * floor_alpha)
        ctx.set_line_width(3)
        for k, fy in enumerate((1440, 1530, 1650)):
            ctx.move_to(-200, fy); ctx.line_to(W + 200, fy)
        ctx.stroke()
        ctx.set_source_rgba(*INK[:3], floor_alpha)
        ctx.set_line_width(7)
        ctx.set_line_cap(1)
        ctx.move_to(-20, FLOOR)
        for i in range(1, 23):
            x = i * 52 - 20
            ctx.line_to(x, FLOOR + math.sin(i * 1.7) * 1.4)
        ctx.stroke()


# --- furniture -----------------------------------------------------------
def desk(ctx, jolt=0.0, alpha=1.0, lamp_on=1.0):
    if alpha <= 0:
        return
    ctx.save()
    ctx.translate(235, FLOOR)
    ctx.rotate(jolt)
    ctx.translate(-235, -FLOOR)
    ctx.set_line_join(1); ctx.set_line_cap(1)
    # lamp glow
    if lamp_on > 0:
        g = cairo.RadialGradient(150, 1020, 10, 150, 1080, 230)
        g.add_color_stop_rgba(0, LIME[0], LIME[1], LIME[2], 0.38 * alpha * lamp_on)
        g.add_color_stop_rgba(1, LIME[0], LIME[1], LIME[2], 0)
        ctx.set_source(g)
        ctx.move_to(118, 1010); ctx.line_to(30, 1128); ctx.line_to(300, 1128); ctx.line_to(182, 1010); ctx.close_path()
        ctx.fill()
    ctx.set_source_rgba(*INK[:3], alpha)
    ctx.set_line_width(10)
    # legs
    ctx.move_to(95, 1140); ctx.line_to(95, FLOOR); ctx.stroke()
    ctx.move_to(380, 1140); ctx.line_to(380, FLOOR); ctx.stroke()
    ctx.move_to(95, 1250); ctx.line_to(380, 1250); ctx.set_line_width(6); ctx.stroke()
    # top
    rrect(ctx, 60, 1124, 350, 26, 8)
    ctx.set_source_rgba(*PAGE[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(8); ctx.stroke()
    # lamp
    ctx.set_line_width(9)
    ctx.move_to(110, 1124); ctx.line_to(170, 1124); ctx.stroke()
    ctx.move_to(140, 1124); ctx.line_to(118, 1050); ctx.line_to(160, 1000); ctx.stroke()
    ctx.move_to(122, 1018); ctx.line_to(186, 992); ctx.line_to(196, 1022); ctx.line_to(140, 1046); ctx.close_path()
    ctx.set_source_rgba(*LIME[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(7); ctx.stroke()
    # mug
    rrect(ctx, 200, 1080, 40, 44, 6)
    ctx.set_source_rgba(*PAGE[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(6); ctx.stroke()
    ctx.arc(244, 1100, 11, -math.pi / 2, math.pi / 2); ctx.stroke()
    ctx.restore()


def stool(ctx, x=600, alpha=1.0, dx=0.0, rot=0.0):
    if alpha <= 0:
        return
    ctx.save()
    ctx.translate(x + dx, FLOOR)
    ctx.rotate(rot)
    ctx.set_source_rgba(*INK[:3], alpha)
    ctx.set_line_cap(1)
    ctx.set_line_width(9)
    ctx.move_to(-40, -132); ctx.line_to(-50, 0); ctx.stroke()
    ctx.move_to(40, -132); ctx.line_to(50, 0); ctx.stroke()
    ctx.set_line_width(6)
    ctx.move_to(-45, -55); ctx.line_to(45, -55); ctx.stroke()
    rrect(ctx, -62, -146, 124, 20, 8)
    ctx.set_source_rgba(*LAV[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(7); ctx.stroke()
    ctx.restore()


def textbook(ctx, a, b, open_amt=1.0, alpha=1.0):
    """Open textbook held between hand points a and b."""
    if alpha <= 0:
        return
    cx, cy = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    w = 120
    ctx.save()
    ctx.translate(cx, cy - 12)
    ctx.rotate(ang)
    ctx.set_line_join(1)
    h = 78
    # cover
    rrect(ctx, -w / 2 - 6, -h / 2 - 2, w + 12, h + 10, 6)
    ctx.set_source_rgba(*LAV[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(6); ctx.stroke()
    # pages
    for side in (-1, 1):
        ctx.move_to(0, -h / 2 + 6)
        ctx.curve_to(side * w * 0.2, -h / 2 - 2, side * w * 0.4, -h / 2, side * w / 2, -h / 2 + 2)
        ctx.line_to(side * w / 2, h / 2)
        ctx.curve_to(side * w * 0.3, h / 2 - 4, side * 0.1 * w, h / 2, 0, h / 2 + 4)
        ctx.close_path()
        ctx.set_source_rgba(*PAGE[:3], alpha); ctx.fill_preserve()
        ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(5); ctx.stroke()
        ctx.set_line_width(3)
        for i in range(4):
            yy = -h / 2 + 18 + i * 13
            ctx.move_to(side * 10, yy); ctx.line_to(side * (w / 2 - 12) * (0.7 + 0.3 * hash01(i + side)), yy)
        ctx.stroke()
    ctx.restore()


# --- paper sheets --------------------------------------------------------
def sheet(ctx, x, y, rot=0.0, flip=1.0, scale=1.0, alpha=1.0, seed=0):
    if alpha <= 0.01 or scale <= 0.01:
        return
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.scale(scale * max(0.08, abs(flip)), scale)
    w, h = 92, 118
    ctx.set_line_join(1)
    ctx.move_to(-w / 2, -h / 2); ctx.line_to(w / 2 - 22, -h / 2); ctx.line_to(w / 2, -h / 2 + 22)
    ctx.line_to(w / 2, h / 2); ctx.line_to(-w / 2, h / 2); ctx.close_path()
    ctx.set_source_rgba(*PAGE[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(5); ctx.stroke()
    ctx.move_to(w / 2 - 22, -h / 2); ctx.line_to(w / 2 - 22, -h / 2 + 22); ctx.line_to(w / 2, -h / 2 + 22); ctx.stroke()
    ctx.set_line_width(4)
    for i in range(5):
        yy = -h / 2 + 34 + i * 15
        ln = (w - 30) * (0.55 + 0.45 * hash01(seed * 7 + i))
        ctx.move_to(-w / 2 + 14, yy); ctx.line_to(-w / 2 + 14 + ln, yy)
    ctx.set_source_rgba(*INK[:3], alpha * 0.55)
    ctx.stroke()
    ctx.restore()


# --- memory cards --------------------------------------------------------
def card(ctx, x, y, w=140, h=100, rot=0.0, flip=0.0, front="lines", back="q",
         color=LAV, back_color=None, wings=0.0, phase=0.0, alpha=1.0, scale=1.0,
         label=None, glow=0.0, label_size=40):
    """A memory card. flip in [0,1]: 0 shows the front, 1 shows the back."""
    if alpha <= 0.01 or scale <= 0.01:
        return
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.scale(scale, scale)
    if glow > 0:
        g = cairo.RadialGradient(0, 0, 10, 0, 0, w * 1.1)
        g.add_color_stop_rgba(0, LIME[0], LIME[1], LIME[2], 0.55 * glow * alpha)
        g.add_color_stop_rgba(1, LIME[0], LIME[1], LIME[2], 0)
        ctx.set_source(g)
        ctx.arc(0, 0, w * 1.1, 0, 2 * math.pi)
        ctx.fill()
    # wings (behind the card)
    if wings > 0.01:
        flap = math.sin(phase) * 0.75
        for side in (-1, 1):
            ctx.save()
            ctx.translate(side * (w / 2 - 10), -h / 2 + 22)
            ctx.rotate(side * (-0.25 - flap))
            ctx.scale(side * wings, wings)
            ctx.move_to(0, 0)
            ctx.curve_to(20, -46, 66, -58, 84, -40)
            ctx.curve_to(70, -30, 76, -16, 60, -10)
            ctx.curve_to(50, -2, 34, 8, 0, 14)
            ctx.close_path()
            ctx.set_source_rgba(*PAGE[:3], alpha); ctx.fill_preserve()
            ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(5); ctx.set_line_join(1); ctx.stroke()
            ctx.set_line_width(3)
            ctx.move_to(16, -12); ctx.curve_to(30, -26, 48, -34, 64, -36); ctx.stroke()
            ctx.restore()
    ang = flip * math.pi
    sx = math.cos(ang)
    showing_back = sx < 0
    ctx.scale(max(0.04, abs(sx)), 1)
    fill = (back_color or color) if showing_back else color
    rrect(ctx, -w / 2, -h / 2, w, h, 14)
    ctx.set_source_rgba(*fill[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(6); ctx.stroke()
    kind = back if showing_back else front
    ctx.set_source_rgba(*INK[:3], alpha)
    ctx.set_line_cap(1)
    if kind == "lines":
        ctx.set_line_width(5)
        for i in range(3):
            yy = -h / 2 + 28 + i * 22
            ln = (w - 44) * (1.0 if i < 2 else 0.6)
            ctx.move_to(-w / 2 + 22, yy); ctx.line_to(-w / 2 + 22 + ln, yy)
        ctx.stroke()
    elif kind == "lesson":
        ctx.save()
        rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.clip()
        ctx.rectangle(-w / 2, -h / 2, w, 28)
        ctx.set_source_rgba(*LIME[:3], alpha); ctx.fill()
        ctx.restore()
        ctx.set_source_rgba(*INK[:3], alpha)
        ctx.set_line_width(5)
        ctx.move_to(-w / 2, -h / 2 + 28); ctx.line_to(w / 2, -h / 2 + 28); ctx.stroke()
        ctx.set_line_width(4.5)
        for i in range(3):
            yy = -h / 2 + 50 + i * 18
            ln = (w - 40) * (1.0 if i < 2 else 0.55)
            ctx.move_to(-w / 2 + 20, yy); ctx.line_to(-w / 2 + 20 + ln, yy)
        ctx.stroke()
    elif kind == "q":
        font(ctx, FONT_BLACK, h * 0.62)
        text_center(ctx, "?", 0, 2, (INK[0], INK[1], INK[2], alpha))
    elif kind == "check":
        ctx.set_line_width(12); ctx.set_line_join(1)
        ctx.move_to(-w * 0.18, 0); ctx.line_to(-w * 0.04, h * 0.18); ctx.line_to(w * 0.22, -h * 0.2)
        ctx.stroke()
    elif kind == "word" and label:
        font(ctx, FONT_BLACK, label_size)
        text_center(ctx, label, 0, 0, (INK[0], INK[1], INK[2], alpha))
    ctx.restore()


# --- the Recall tile (stylised app-icon prop) ----------------------------
def _book_half(ctx, side):
    # coordinates in 512 icon space, centred on (256, 256)
    s = side
    ctx.move_to(0, -88)
    ctx.curve_to(s * -14, -110, s * -36, -116, s * -62, -116)
    ctx.line_to(s * -146, -116)
    ctx.curve_to(s * -152, -116, s * -156, -112, s * -156, -106)
    ctx.line_to(s * -156, 106)
    ctx.curve_to(s * -156, 112, s * -152, 116, s * -146, 116)
    ctx.line_to(s * -64, 116)
    ctx.curve_to(s * -36, 116, s * -12, 124, 0, 142)
    ctx.close_path()


def recall_tile(ctx, x, y, size=300, sx=1.0, sy=1.0, rot=0.0, gape=0.0, alpha=1.0, glow=0.0, shine=-1.0):
    """Vector re-drawing of the Recall icon used as an animated prop.

    gape opens the two pages like a mouth (0 closed .. 1 wide).
    The pivot is the tile's bottom centre so squash/stretch stays grounded.
    """
    if alpha <= 0.01:
        return
    ctx.save()
    ctx.translate(x, y + size / 2)
    ctx.rotate(rot)
    ctx.scale(sx, sy)
    ctx.translate(0, -size / 2)
    if glow > 0:
        g = cairo.RadialGradient(0, 0, size * 0.3, 0, 0, size * 1.05)
        g.add_color_stop_rgba(0, LIME[0], LIME[1], LIME[2], 0.6 * glow * alpha)
        g.add_color_stop_rgba(1, LIME[0], LIME[1], LIME[2], 0)
        ctx.set_source(g)
        ctx.arc(0, 0, size * 1.05, 0, 2 * math.pi)
        ctx.fill()
    k = size / 512
    rrect(ctx, -size / 2, -size / 2, size, size, 112 * k)
    ctx.set_source_rgba(*LIME[:3], alpha); ctx.fill_preserve()
    ctx.save(); ctx.clip()
    if shine >= 0:
        sxp = -size + shine * size * 2.2
        lg = cairo.LinearGradient(sxp - 60, 0, sxp + 60, 0)
        lg.add_color_stop_rgba(0, 1, 1, 1, 0)
        lg.add_color_stop_rgba(0.5, 1, 1, 1, 0.45 * alpha)
        lg.add_color_stop_rgba(1, 1, 1, 1, 0)
        ctx.set_source(lg); ctx.paint()
    ctx.restore()
    ctx.new_path()
    ctx.scale(k, k)
    ctx.set_line_join(1); ctx.set_line_cap(1)
    for side in (-1, 1):
        ctx.save()
        ctx.translate(0, 142)
        ctx.rotate(-side * gape * 0.55)
        ctx.translate(0, -142)
        _book_half(ctx, side)
        ctx.set_source_rgba(*PAGE[:3], alpha); ctx.fill_preserve()
        ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(22); ctx.stroke()
        ctx.restore()
    if gape < 0.15:
        ctx.move_to(0, -88); ctx.line_to(0, 140)
        ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(22); ctx.stroke()
    ctx.restore()


# --- small fx ------------------------------------------------------------
def star(ctx, x, y, r, rot=0.0, fill=LIME, alpha=1.0, points=5):
    ctx.save()
    ctx.translate(x, y); ctx.rotate(rot)
    for i in range(points * 2):
        rr = r if i % 2 == 0 else r * 0.45
        a = i * math.pi / points - math.pi / 2
        (ctx.move_to if i == 0 else ctx.line_to)(math.cos(a) * rr, math.sin(a) * rr)
    ctx.close_path()
    ctx.set_source_rgba(*fill[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(4); ctx.set_line_join(1); ctx.stroke()
    ctx.restore()


def sparkle(ctx, x, y, r, alpha=1.0, fill=LIME):
    if r <= 0.5 or alpha <= 0.01:
        return
    ctx.save()
    ctx.translate(x, y)
    ctx.move_to(0, -r)
    ctx.curve_to(r * 0.12, -r * 0.12, r * 0.12, -r * 0.12, r, 0)
    ctx.curve_to(r * 0.12, r * 0.12, r * 0.12, r * 0.12, 0, r)
    ctx.curve_to(-r * 0.12, r * 0.12, -r * 0.12, r * 0.12, -r, 0)
    ctx.curve_to(-r * 0.12, -r * 0.12, -r * 0.12, -r * 0.12, 0, -r)
    ctx.close_path()
    ctx.set_source_rgba(*fill[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(max(2, r * 0.12)); ctx.stroke()
    ctx.restore()


def puff(ctx, x, y, t, dur=0.5, n=4, spread=90, seed=0, dirn=0):
    """Dust puffs expanding along the floor; t is time since impact."""
    if t < 0 or t > dur:
        return
    k = t / dur
    for i in range(n):
        side = (-1 if i % 2 == 0 else 1) if dirn == 0 else dirn
        d = spread * (0.4 + 0.6 * hash01(seed + i)) * (1 - (1 - k) ** 2)
        px = x + side * d * (0.6 + 0.2 * (i // 2))
        py = y - 14 - 30 * k * hash01(seed + i * 3)
        r = (12 + 16 * hash01(seed + i * 5)) * (0.5 + 0.8 * k)
        ctx.arc(px, py, r, 0, 2 * math.pi)
        ctx.set_source_rgba(*PAGE[:3], 1 - k); ctx.fill_preserve()
        ctx.set_source_rgba(*INK[:3], (1 - k) * 0.9); ctx.set_line_width(4); ctx.stroke()


def ring(ctx, x, y, t, dur=0.5, r0=40, r1=120, color=LIME, width=10):
    if t < 0 or t > dur:
        return
    k = t / dur
    ctx.arc(x, y, r0 + (r1 - r0) * (1 - (1 - k) ** 3), 0, 2 * math.pi)
    ctx.set_source_rgba(*color[:3], 1 - k)
    ctx.set_line_width(width * (1 - k * 0.6))
    ctx.stroke()


def speed_lines(ctx, x, y, dx, dy, alpha=1.0, n=3, length=70, gap=26):
    if alpha <= 0.01:
        return
    d = math.hypot(dx, dy) or 1
    ux, uy = dx / d, dy / d
    nx, ny = -uy, ux
    ctx.set_source_rgba(*INK[:3], alpha * 0.8)
    ctx.set_line_width(6); ctx.set_line_cap(1)
    for i in range(n):
        o = (i - (n - 1) / 2) * gap
        sx, sy = x - ux * 40 + nx * o, y - uy * 40 + ny * o
        L = length * (0.7 + 0.3 * (i % 2))
        ctx.move_to(sx, sy); ctx.line_to(sx - ux * L, sy - uy * L)
    ctx.stroke()


def bell(ctx, x, y, size=70, rot=0.0, alpha=1.0, scale=1.0):
    if alpha <= 0.01 or scale <= 0.01:
        return
    ctx.save()
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale * size / 70, scale * size / 70)
    ctx.set_line_join(1); ctx.set_line_cap(1)
    # clapper
    ctx.arc(0 + math.sin(rot * 3) * 6, 38, 9, 0, 2 * math.pi)
    ctx.set_source_rgba(*INK[:3], alpha); ctx.fill()
    ctx.move_to(-40, 30)
    ctx.curve_to(-34, 18, -32, -6, -30, -14)
    ctx.curve_to(-26, -40, 26, -40, 30, -14)
    ctx.curve_to(32, -6, 34, 18, 40, 30)
    ctx.close_path()
    ctx.set_source_rgba(*LIME[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(6); ctx.stroke()
    ctx.arc(0, -40, 8, 0, 2 * math.pi); ctx.stroke()
    ctx.restore()


def sun(ctx, x, y, r=46, rot=0.0, alpha=1.0):
    if alpha <= 0.01:
        return
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(6); ctx.set_line_cap(1)
    for i in range(8):
        a = i * math.pi / 4
        ctx.move_to(math.cos(a) * (r + 12), math.sin(a) * (r + 12))
        ctx.line_to(math.cos(a) * (r + 30), math.sin(a) * (r + 30))
    ctx.stroke()
    ctx.arc(0, 0, r, 0, 2 * math.pi)
    ctx.set_source_rgba(*LIME[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.stroke()
    ctx.restore()


def moon(ctx, x, y, r=40, alpha=1.0):
    if alpha <= 0.01:
        return
    ctx.save(); ctx.translate(x, y)
    ctx.arc(0, 0, r, 0, 2 * math.pi)
    ctx.arc_negative(r * 0.55, -r * 0.3, r * 0.85, 2 * math.pi, 0)
    ctx.set_fill_rule(cairo.FILL_RULE_EVEN_ODD)
    ctx.set_source_rgba(*LAV[:3], alpha); ctx.fill_preserve()
    ctx.set_source_rgba(*INK[:3], alpha); ctx.set_line_width(6); ctx.stroke()
    ctx.restore()
