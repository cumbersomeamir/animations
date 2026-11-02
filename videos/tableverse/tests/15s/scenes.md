# TableVerse — "Six sevens" (15 s ManimCE style test)

Planned with **manim-composer** (scenes.md structure, 3b1b style principles, narrative patterns, visual
techniques), implemented with **manimce-best-practices** (Scene/MovingCameraScene, VGroup layout,
LaggedStart/Succession, Transform family, ValueTracker + updaters, rate functions, manim.cfg + CLI).

## Overview
- **Topic**: one multiplication fact, 6 × 7 = 42, explained by groups of objects rearranging.
- **Hook**: the equation "6 × 7" bursts into 42 loose dots — too many to count at a glance.
- **Target Audience**: children practising times tables (app is Rated 3+, Education) and their parents; no prerequisites beyond counting.
- **Estimated Length**: exactly 15.0 s (450 frames @ 30 fps, 1080×1920).
- **Key Insight ("aha")**: regroup the chaos into 6 groups of 7, line the groups up as rows, then cut every row into 5 + 2 — two easy facts (30 and 12) add up to the hard one (42).

## Narrative Arc
Mystery → Investigation → Resolution (narrative-patterns #1) combined with Two Perspectives → Unity (#3):
the same 42 dots are seen as *groups*, then as an *array*, then as *two easy blocks*; the blocks snap back
together and the answer lands in the opening equation, which then hands off to the app.

Rhythm: fast-fast-SLOW (visual-techniques): quick burst + grouping, slower split/count, quick CTA.

---

## Scene 1: Burst (0.00–2.40 s)
**Purpose**: strong opening; pose the question.
### Visual Elements
- Equation parts `6` (cyan) `×` (white) `7` (lilac) built as separate `Text` mobjects in a `VGroup`.
- 42 `Dot`s (lilac fill, purple stroke) hidden at the equation's centre; faint violet math grid behind.
### Content
Frame 0 already shows the big "6 × 7". The equation lifts to the top while the 42 dots burst out of it on
arcs (`LaggedStart` of `MoveToTarget`/`.animate` with `path_arc`); "= ?" writes in; dots wobble
(`there_and_back` shifts) — a jumble.
### Narration Notes
"Six times seven?" — curious, light.
### Technical Notes
`LaggedStart(..., lag_ratio≈0.02)`, `rate_func=ease_out_back` for the burst; `Write` for "= ?".

## Scene 2: Groups (2.40–5.20 s)
**Purpose**: first perspective — 6 groups of 7.
### Visual Elements
- 6 hexagonal "flowers" (1 centre + 6 around) in a 2 × 3 layout; cyan `Circle` ring per group (orbit-ring motif from the icon); small "7" tags.
### Content
Dots fly into the flowers (`LaggedStart`, `path_arc`), rings `Create` around them, then each group is
`Indicate`d in turn while its "7" tag pops (one tick per group).
### Narration Notes
"Six groups of seven."  Caption: "Six groups of seven".

## Scene 3: Rows (5.20–7.00 s)
**Purpose**: transform, don't replace — the groups become rows.
### Content
Each flower unrolls into a row of 7 (dots move on arcs); each ring morphs into a row capsule
(`ReplacementTransform(Circle → RoundedRectangle)`); tags slide to the row ends. Result: a 6 × 7 array.
Caption: "Line them up".

## Scene 4: Split (7.00–10.20 s)
**Purpose**: the investigation — cut 7 into 5 + 2.
### Content
A dashed cyan cut line draws down between columns 5 and 6 (`Create`). Left block stays lilac, right block
recolours orange and both slide apart. Labels "6 × 5" / "6 × 2" write above; braces grow below; a
column-by-column `LaggedStart` wave counts each block and "30" / "12" pop under the braces.
### Narration Notes
"Split seven into five and two." … "Thirty, plus twelve…"   Caption: "Split 7 into 5 + 2".
### Technical Notes
`DashedLine`, `Brace` (path-based, no LaTeX) + `Text` labels; recolour via `.animate.set_fill`.

## Scene 5: Resolution (10.20–12.00 s)
**Purpose**: aha moment, celebrated.
### Content
Blocks snap back together; "30" and "12" glide into "30 + 12", which morphs into "42"
(`TransformMatchingShapes`); "42" flies up and replaces the "?" in the opening equation; `Circumscribe` in
yellow; the array ripples (`LaggedStart` of scale `there_and_back`).
### Narration Notes
"…forty-two!"   Caption: "30 + 12 = 42".

## Scene 6: App ending (12.00–15.00 s)
**Purpose**: readable app + Google Play ending.
### Content
The 42 dots swirl into a tilted orbit ellipse (the icon's ring motif), the verified app icon scales in at the
centre of the orbit (`FadeIn(scale=…)`), "TableVerse" writes in (yellow→orange gradient), the verbatim listing
line fades up, and a pill "Explore on Google Play" draws its border then fills. The orbit keeps turning
(`ValueTracker` + updater, depth-sorted around the icon) through the hold.
### Narration Notes
"TableVerse. Explore on Google Play."

---

## Transitions & Flow
One continuous population of 42 dots carries the whole film (burst → groups → rows → blocks → orbit), so
every transition is a motivated transform of the same objects. The opening equation persists at the top and
receives the answer.

## Color Palette (sampled from the verified icon; overrides the skill's default blue/green/yellow)
- Background: `#160A64` deep violet (icon pixel 2,2); grid lines `#390CD6` violet (308,50) at low opacity.
- Counted objects / "7": `#D198FA` lilac (236,230) with `#911FF9` purple stroke (250,152).
- Groups / "6" / cut line: `#06F2F9` cyan (66,314) — the icon's orbit ring.
- Second block / "2", "12": `#F86F03` orange (362,222).
- Result / "42", wordmark: `#F9E30E` yellow (406,54) → orange gradient.
- Neutral operators and captions: white.

## Mathematical Content
6 × 7 = ?, 6 groups of 7, 7 = 5 + 2, 6 × 5 = 30, 6 × 2 = 12, 30 + 12 = 42, 6 × 7 = 42.

## Implementation Order
Palette/config → grid + equation → dots/burst → flowers → rows → split → resolution → CTA → cue log for audio
→ narration (Kokoro) → procedural sound → mux → QA.
