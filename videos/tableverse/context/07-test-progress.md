# 07 — 15 s ManimCE style test: progress (SUPERSEDED, not rendered)

Brief: 06-style-test.md. Status: **superseded on 2026-11-02** by the user's "Pop-up Counting Storybook" request
(08 + 09), which explicitly replaces the Manim-only direction for the sample. No 15 s MP4 was produced.

## Facts
- Same verified app facts as 05 (listing sentence, icon hash 0ad7f267…9561).
- Palette sampled from real icon pixels: #160A64 (2,2), #390CD6 (308,50), #911FF9 (250,152), #D198FA (236,230),
  #F86F03 (362,222), #F9E30E (406,54), #06F2F9 (66,314).

## Skill provenance
- Read (git clone, read-only, commit cef0450) https://github.com/adithya-s-k/manim_skill:
  skills/manimce-best-practices/SKILL.md + rules scenes, transform-animations, animation-groups, grouping, timing,
  camera, config, cli, text, colors, updaters, latex; skills/manim-composer/SKILL.md + references
  visual-techniques, narrative-patterns. No repository scripts were executed.
- Adaptations: no LaTeX toolchain → Pango `Text` instead of `MathTex`; Fredoka WOFF2 converted to TTF locally;
  manim-composer's "ask clarifying questions" phase answered by the written brief.

## Work done
- `tests/15s/scenes.md` (composer-format plan, "Six sevens": 6 × 7 = 42 via groups → rows → 5 + 2 split).
- `tests/15s/src/tableverse_15s.py` (MovingCameraScene), `src/prepare_assets.py`, `manim.cfg`, `audio/tts_15s.py`
  + narration clips (Kokoro af_heart).
- Environment: manim 0.19.0, ManimPango 0.7.1 (built after installing libpango1.0-dev), pycairo 1.29.2.

## Render checks
- A 540×960 preview render exceeded the session's background time limit and was stopped before finishing
  (Cairo renderer too slow for this scene as written). Not inspected, not delivered.

## Next step
None unless the user revives the Manim test; if so, profile and simplify the scene (fewer updaters, cached
text) or render at OpenGL, then QA as in 06.
