"""TableVerse — "Six sevens": 15 s ManimCE style test (6 x 7 = 42 by regrouping 42 dots).

Planned with manim-composer (../scenes.md), implemented following manimce-best-practices:
Scene/MovingCameraScene structure, VGroup layout, LaggedStart/Succession grouping, Transform family
(ReplacementTransform, TransformMatchingShapes, MoveToTarget with path_arc), ValueTracker + updaters,
rate functions, manim.cfg for project defaults and the `manim` CLI for rendering.

Render (from videos/tableverse/tests/15s; settings come from ./manim.cfg -> 1080x1920, 30 fps):
    manim src/tableverse_15s.py SixSevens
Also writes build/cues.json (timestamps of every on-screen event) for the sound design.

Adaptation notes: no LaTeX toolchain is installed, so equations use Pango `Text` (Fredoka, OFL) instead of
MathTex; all timings are whole frames (F(n)) so the film is exactly 450 frames.
"""
import json
import os

import manimpango
import numpy as np
from manim import *
from scipy.optimize import linear_sum_assignment

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
for _w in (500, 600, 700):
    manimpango.register_font(os.path.join(ROOT, "build", "fonts", f"Fredoka-{_w}.ttf"))
FONT = "Fredoka Light"  # family name embedded in the @fontsource Fredoka subset files (weights 500-700)

# Palette sampled from the verified app icon (pixel coordinates recorded in context/07-test-progress.md)
BG = ManimColor("#160A64")       # deep violet (2,2)
VIOLET = ManimColor("#390CD6")   # violet (308,50)
PURPLE_I = ManimColor("#911FF9")  # purple (250,152)
LILAC = ManimColor("#D198FA")    # lilac (236,230)
ORANGE_I = ManimColor("#F86F03")  # orange (362,222)
YELLOW_I = ManimColor("#F9E30E")  # yellow (406,54)
CYAN_I = ManimColor("#06F2F9")   # cyan orbit ring (66,314)

FPS = 30
TOTAL_FRAMES = 450


def F(n):
    """frames -> seconds, so every run_time sits on the 30 fps grid"""
    return n / FPS


def txt(s, size=64, color=WHITE, weight=BOLD, outline=10):
    t = Text(s, font=FONT, weight=weight, font_size=size, color=color)
    if outline:
        t.set_stroke(BG, width=outline, background=True)
    return t


def lagged_starts(n, lag, run_frames):
    """start offsets (frames) of the n sub-animations of a LaggedStart (manim's lag_ratio maths)"""
    d = run_frames / (1 + lag * (n - 1))
    return [i * lag * d for i in range(n)]


class SixSevens(MovingCameraScene):
    def setup(self):
        super().setup()
        self.cues = []

    # ---- sound cue log: frame-accurate timestamps of on-screen events
    def cue(self, name, offset_frames=0.0, **p):
        self.cues.append({"t": round(self.renderer.time + offset_frames / FPS, 4), "name": name, **p})

    def frame(self):
        return round(self.renderer.time * FPS)

    def construct(self):
        rng = np.random.default_rng(7)

        # ------------------------------------------------------------ backdrop: faint violet math grid + glow
        grid = VGroup(
            *[Line([x, -8.5, 0], [x, 8.5, 0]) for x in np.arange(-5, 5.01, 1.0)],
            *[Line([-5, y, 0], [5, y, 0]) for y in np.arange(-9, 9.01, 1.0)],
        ).set_stroke(VIOLET, width=1.6, opacity=0.38)
        glow = VGroup(*[Circle(radius=r).set_fill(VIOLET, opacity=0.045).set_stroke(width=0) for r in np.linspace(1.2, 6.8, 9)])
        glow.move_to(UP * 0.6)
        self.add(glow, grid)

        # ------------------------------------------------------------ top equation layout: 6 × 7 = ?
        t6, tx, t7 = txt("6", 128, CYAN_I), txt("×", 110), txt("7", 128, LILAC)
        teq, tq = txt("=", 110), txt("?", 128, YELLOW_I)
        top = VGroup(t6, tx, t7, teq, tq).arrange(RIGHT, buff=0.32).move_to(UP * 5.75)
        # opening: the same "6 × 7", huge, in the middle of frame 0
        big = VGroup(t6.copy(), tx.copy(), t7.copy())
        big.scale(1.75).move_to(UP * 0.5)
        self.add(big)

        # ------------------------------------------------------------ 42 dots hidden inside the big equation
        def make_dot():
            d = Dot(radius=0.17, color=LILAC)
            d.set_stroke(PURPLE_I, width=3)
            return d

        dots = VGroup(*[make_dot() for _ in range(42)])
        # scatter positions (rejection sampling with minimum spacing)
        pts = []
        while len(pts) < 42:
            p = np.array([rng.uniform(-3.7, 3.7), rng.uniform(-3.9, 3.6), 0.0])
            if all(np.linalg.norm(p - q) > 0.62 for q in pts):
                pts.append(p)
        for d in dots:
            d.move_to(big.get_center() + np.array([rng.uniform(-1.6, 1.6), rng.uniform(-0.4, 0.4), 0]))
            d.scale(0.05)
        self.add(dots)
        self.bring_to_front(big)

        # ============================================================ S1 BURST (f0-72)
        self.cue("vo", 8, id="q")
        for d, p in zip(dots, pts):
            d.generate_target()
            d.target.scale(20).move_to(p)
        order = np.argsort([np.linalg.norm(p) for p in pts])
        burst = LaggedStart(*[MoveToTarget(dots[i], path_arc=(PI / 3) * (1 if pts[i][0] > 0 else -1)) for i in order], lag_ratio=0.02)
        self.cue("whoosh", 0, dur=0.8, up=True)
        for k, s in enumerate(lagged_starts(42, 0.02, 27)):
            if k % 3 == 0:
                self.cue("pop", s + 4, pitch=k / 41)
        self.play(
            AnimationGroup(*[ReplacementTransform(big[i], top[i]) for i in range(3)], run_time=F(27), rate_func=smooth),
            burst,
            run_time=F(27),
        )
        self.cue("write", 0)
        self.play(Write(VGroup(teq, tq)), run_time=F(15))  # f27-42
        wob = [d.animate(rate_func=there_and_back).shift(np.array([rng.uniform(-0.18, 0.18), rng.uniform(-0.18, 0.18), 0])) for d in dots]
        self.cue("wobble", 0)
        self.play(LaggedStart(*wob, lag_ratio=0.01), Wiggle(tq, scale_value=1.25, rotation_angle=0.08 * TAU), run_time=F(24))  # f42-66
        self.wait(F(6))  # f66-72

        # ============================================================ S2 GROUPS (f72-156)
        centers = [np.array([x, y, 0.0]) for y in (2.45, 0.25, -1.95) for x in (-1.95, 1.95)]
        slots = []
        for c in centers:
            slots.append(c)
            slots += [c + 0.55 * np.array([np.cos(a), np.sin(a), 0]) for a in np.arange(6) * TAU / 6 + PI / 2]
        cost = np.array([[np.linalg.norm(d.get_center() - s) for s in slots] for d in dots])
        _, col = linear_sum_assignment(cost)  # minimal-travel assignment of dots to group slots
        group_of = [c // 7 for c in col]
        groups = [VGroup(*[dots[i] for i in range(42) if group_of[i] == g]) for g in range(6)]
        rings = VGroup(*[Circle(radius=0.95).move_to(c).set_stroke(CYAN_I, width=5) for c in centers])
        tags = VGroup(*[txt("7", 52, LILAC, outline=8).move_to(c + np.array([0.78, 0.78, 0])) for c in centers])

        cap1 = txt("Six groups of seven", 50).move_to(DOWN * 4.75)
        self.cue("vo", 6, id="groups")
        self.cue("whoosh", 0, dur=1.0, up=False)
        moves = []
        for i in range(42):
            dots[i].generate_target()
            dots[i].target.move_to(slots[col[i]])
            moves.append(MoveToTarget(dots[i], path_arc=PI / 4))
        self.play(LaggedStart(*moves, lag_ratio=0.015), FadeIn(cap1, shift=UP * 0.3), run_time=F(30))  # f72-102
        for g, s in enumerate(lagged_starts(6, 0.15, 15)):
            self.cue("ring", s, idx=g)
        self.play(LaggedStart(*[Create(r) for r in rings], lag_ratio=0.15), run_time=F(15))  # f102-117
        anims = []
        for g in range(6):
            anims.append(AnimationGroup(Indicate(VGroup(rings[g], groups[g]), color=CYAN_I, scale_factor=1.1), FadeIn(tags[g], scale=1.8)))
        for g, s in enumerate(lagged_starts(6, 0.35, 30)):
            self.cue("tick", s, idx=g)
        self.play(LaggedStart(*anims, lag_ratio=0.35), run_time=F(30))  # f117-147
        self.wait(F(9))  # f147-156

        # ============================================================ S3 ROWS (f156-210)
        col_x = lambda c: (c - 3) * 0.9
        row_y = lambda r: 2.25 - r * 0.9
        array_pos = {}
        for g in range(6):
            members = sorted([i for i in range(42) if group_of[i] == g], key=lambda i: (dots[i].get_center()[0], dots[i].get_center()[1]))
            for c, i in enumerate(members):
                array_pos[i] = (g, c)
        capsules = VGroup(*[RoundedRectangle(width=6.7, height=0.8, corner_radius=0.4).move_to([0, row_y(r), 0]).set_stroke(CYAN_I, width=4) for r in range(6)])
        cap2 = txt("Line them up", 50).move_to(DOWN * 4.75)
        moves = []
        for i in range(42):
            r, c = array_pos[i]
            dots[i].generate_target()
            dots[i].target.move_to([col_x(c), row_y(r), 0])
            moves.append(MoveToTarget(dots[i], path_arc=-PI / 5))
        tag_moves = [tags[r].animate.move_to([-3.85, row_y(r), 0]).scale(0.85) for r in range(6)]
        self.cue("whoosh", 0, dur=1.1, up=True)
        self.cue("click", 30)
        self.play(
            LaggedStart(*moves, lag_ratio=0.01),
            *[ReplacementTransform(rings[r], capsules[r]) for r in range(6)],
            *tag_moves,
            FadeOut(cap1, shift=UP * 0.3), FadeIn(cap2, shift=UP * 0.3),
            run_time=F(36),
        )  # f156-192
        self.play(self.camera.frame.animate.scale(0.96).shift(DOWN * 0.1), run_time=F(18), rate_func=smooth)  # f192-210

        # ============================================================ S4 SPLIT 7 = 5 + 2 (f210-306)
        left = VGroup(*[dots[i] for i in range(42) if array_pos[i][1] <= 4])
        right = VGroup(*[dots[i] for i in range(42) if array_pos[i][1] >= 5])
        cut = DashedLine([1.35, 2.95, 0], [1.35, -2.95, 0], dash_length=0.18, dashed_ratio=0.55).set_stroke(CYAN_I, width=6)
        cap3 = txt("Split 7 into 5 + 2", 50).move_to(DOWN * 4.75)
        self.cue("vo", 0, id="split")
        self.cue("cut", 0, dur=0.6)
        self.play(Create(cut, rate_func=linear), FadeOut(capsules), FadeOut(tags), FadeOut(cap2, shift=UP * 0.3), FadeIn(cap3, shift=UP * 0.3), run_time=F(18))  # f210-228

        lab5 = VGroup(txt("6", 76, CYAN_I), txt("×", 66), txt("5", 76, LILAC)).arrange(RIGHT, buff=0.18)
        lab2 = VGroup(txt("6", 76, CYAN_I), txt("×", 66), txt("2", 76, ORANGE_I)).arrange(RIGHT, buff=0.18)
        lab5.move_to([(col_x(0) + col_x(4)) / 2 - 0.3, 3.1, 0])
        lab2.move_to([(col_x(5) + col_x(6)) / 2 + 0.45, 3.1, 0])
        self.cue("split", 0)
        self.play(
            left.animate.shift(LEFT * 0.3),
            right.animate.shift(RIGHT * 0.45).set_fill(ORANGE_I).set_stroke(YELLOW_I, width=3),
            Write(lab5), Write(lab2),
            run_time=F(24),
        )  # f228-252

        brace_l = Brace(left, DOWN, buff=0.18, color=LILAC)
        brace_r = Brace(right, DOWN, buff=0.18, color=ORANGE_I)
        n30 = txt("30", 84, LILAC).next_to(brace_l, DOWN, buff=0.12)
        n12 = txt("12", 84, ORANGE_I).next_to(brace_r, DOWN, buff=0.12)
        cols_l = [VGroup(*[dots[i] for i in range(42) if array_pos[i][1] == c]) for c in range(5)]
        cols_r = [VGroup(*[dots[i] for i in range(42) if array_pos[i][1] == c]) for c in (5, 6)]
        self.cue("vo", 10, id="sum")
        for c, s in enumerate(lagged_starts(5, 0.3, 12)):
            self.cue("count", s, idx=c, side="L")
        self.play(GrowFromCenter(brace_l), LaggedStart(*[cl.animate(rate_func=there_and_back).scale(1.25) for cl in cols_l], lag_ratio=0.3), run_time=F(12))  # f252-264
        self.cue("pop_num", 0, pitch=0.0)
        self.play(FadeIn(n30, scale=1.8), run_time=F(6))  # f264-270
        self.wait(F(6))  # f270-276
        for c, s in enumerate(lagged_starts(2, 0.3, 10)):
            self.cue("count", s, idx=5 + c, side="R")
        self.play(GrowFromCenter(brace_r), LaggedStart(*[cl.animate(rate_func=there_and_back).scale(1.25) for cl in cols_r], lag_ratio=0.3), run_time=F(10))  # f276-286
        self.cue("pop_num", 0, pitch=0.5)
        self.play(FadeIn(n12, scale=1.8), run_time=F(6))  # f286-292
        self.wait(F(14))  # f292-306

        # ============================================================ S5 RESOLUTION (f306-372)
        plus = txt("+", 84)
        sum_row = VGroup(n30.copy(), plus, n12.copy()).arrange(RIGHT, buff=0.3).move_to(DOWN * 3.35)
        cap4 = txt("30 + 12 = 42", 50).move_to(DOWN * 4.75)
        self.cue("snap", 0)
        self.play(
            left.animate.shift(RIGHT * 0.3), right.animate.shift(LEFT * 0.45),
            FadeOut(cut), FadeOut(brace_l), FadeOut(brace_r), FadeOut(lab5, shift=UP * 0.2), FadeOut(lab2, shift=UP * 0.2),
            n30.animate.move_to(sum_row[0]), n12.animate.move_to(sum_row[2]), FadeIn(plus, scale=0.5),
            FadeOut(cap3, shift=UP * 0.3), FadeIn(cap4, shift=UP * 0.3),
            self.camera.frame.animate.scale(1 / 0.96).shift(UP * 0.1),
            run_time=F(18),
        )  # f306-324
        n42 = txt("42", 120, YELLOW_I).move_to(DOWN * 3.35)
        self.cue("vo", 6, id="answer")
        self.cue("morph", 0)
        self.play(TransformMatchingShapes(VGroup(n30, plus, n12), n42), run_time=F(18))  # f324-342
        top42 = txt("42", 128, YELLOW_I)
        final_top = VGroup(t6.copy(), tx.copy(), t7.copy(), teq.copy(), top42).arrange(RIGHT, buff=0.32).move_to(UP * 5.75)
        self.cue("fly", 0)
        self.cue("land", 14)
        self.play(
            ReplacementTransform(n42, top42.move_to(final_top[4]), path_arc=-PI / 3),
            FadeOut(tq, scale=0.3),
            *[top[i].animate.move_to(final_top[i]) for i in range(4)],
            run_time=F(14),
        )  # f342-356
        top_eq = VGroup(*[top[i] for i in range(4)], top42)
        self.cue("sparkle", 0)
        ripple = [d.animate(rate_func=there_and_back).scale(1.35).set_fill(YELLOW_I) for d in sorted(dots, key=lambda m: -m.get_center()[1] + 0.3 * m.get_center()[0])]
        self.play(Circumscribe(top_eq, color=YELLOW_I, buff=0.2, stroke_width=6), LaggedStart(*ripple, lag_ratio=0.02), run_time=F(16))  # f356-372

        # ============================================================ S6 APP ENDING (f372-450)
        icon = ImageMobject(os.path.join(ROOT, "build", "icon_rounded.png")).set_height(3.3).move_to(UP * 2.55)
        icon.set_z_index(5)
        oc, rx, ry, tilt = np.array([0, 2.55, 0]), 3.15, 0.95, -12 * DEGREES
        phi = ValueTracker(0.0)
        base = np.arange(42) * TAU / 42

        def orbit_point(k, ph):
            a = base[k] + ph
            v = np.array([rx * np.cos(a), ry * np.sin(a), 0])
            c, s = np.cos(tilt), np.sin(tilt)
            return oc + np.array([v[0] * c - v[1] * s, v[0] * s + v[1] * c, 0]), np.sin(a)

        ring = Ellipse(width=2 * rx, height=2 * ry).rotate(tilt).move_to(oc).set_stroke(CYAN_I, width=4, opacity=0.8)
        ring.set_z_index(1)
        # nearest-angle assignment of dots to orbit slots so the swirl reads as one motion
        ang = [np.arctan2(d.get_center()[1] - oc[1], d.get_center()[0]) % TAU for d in dots]
        order = np.argsort(ang)
        slot_of = {int(i): k for k, i in enumerate(order)}
        moves = []
        for i in range(42):
            p, depth = orbit_point(slot_of[i], 0.0)
            dots[i].generate_target()
            dots[i].target.move_to(p).scale(0.8).set_fill(YELLOW_I if slot_of[i] % 3 == 0 else LILAC).set_stroke(PURPLE_I, width=3)
            moves.append(MoveToTarget(dots[i], path_arc=PI / 3))
        self.cue("vo", 4, id="cta")
        self.cue("swirl", 0, dur=0.5)
        self.play(
            LaggedStart(*moves, lag_ratio=0.01),
            FadeOut(top_eq, shift=UP * 0.6), FadeOut(cap4, shift=DOWN * 0.3),
            grid.animate.set_stroke(opacity=0.22),
            run_time=F(14),
        )  # f372-386

        def follow(k):
            def upd(m):
                p, depth = orbit_point(k, phi.get_value())
                m.move_to(p)
                m.set_z_index(6 if depth < 0 else 2)  # lower half of the ellipse is in front of the icon

            return upd

        for i in range(42):
            dots[i].add_updater(follow(slot_of[i]))
        spin = lambda frames: phi.animate(rate_func=linear).increment_value(0.55 * frames / FPS)
        self.cue("icon", 0)
        self.play(FadeIn(icon, scale=0.35), Create(ring), spin(12), run_time=F(12))  # f386-398

        word = txt("TableVerse", 118, YELLOW_I, outline=12)
        for k, ch in enumerate(word):  # fill-only gradient so the dark outline stays intact
            ch.set_fill(interpolate_color(YELLOW_I, ORANGE_I, k / (len(word) - 1)), opacity=1)
        word.move_to(DOWN * 0.45)
        tag1 = txt("Learn multiplication tables through", 40, WHITE, weight=MEDIUM, outline=6)
        tag2 = txt("stories, practice and fun challenges.", 40, WHITE, weight=MEDIUM, outline=6)
        tagline = VGroup(tag1, tag2).arrange(DOWN, buff=0.16).next_to(word, DOWN, buff=0.38)
        if tagline.width > 7.9:
            tagline.scale_to_fit_width(7.9)
        self.cue("write", 0)
        self.play(Write(word), FadeIn(tagline, shift=UP * 0.25), spin(18), run_time=F(18))  # f398-416

        pill = RoundedRectangle(width=6.5, height=1.08, corner_radius=0.54).set_fill(YELLOW_I, opacity=1).set_stroke(WHITE, width=4)
        pill.next_to(tagline, DOWN, buff=0.55)
        cta = txt("Explore on Google Play", 52, BG, outline=0).move_to(pill)
        self.cue("pill", 0)
        self.play(DrawBorderThenFill(pill), FadeIn(cta, scale=0.8), spin(16), run_time=F(16))  # f416-432

        # hold to exactly 450 frames with the orbit still turning
        remaining = TOTAL_FRAMES - self.frame()
        self.play(spin(remaining), VGroup(pill, cta).animate(rate_func=there_and_back).scale(1.05), run_time=F(remaining))
        for d in dots:
            d.clear_updaters()

    def tear_down(self):
        super().tear_down()
        os.makedirs(os.path.join(ROOT, "build"), exist_ok=True)
        with open(os.path.join(ROOT, "build", "cues.json"), "w") as fh:
            json.dump({"fps": FPS, "frames": TOTAL_FRAMES, "end_time": round(self.renderer.time, 4), "cues": self.cues}, fh, indent=2)
