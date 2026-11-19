# Production notes — Ideaverse 30s english22-01 (English, lesson style, 2026-11-19 brief + first-frame rule)
Why AI slow motion can show a ball that was never there: AI slow-mo takes two real frames, guesses how each pixel moved,
moves both frames to the middle and blends them into a new frame; on a fast bounce that guess can fail, and the blend shows
the ball twice. Payoff: smooth isn't proof — to judge a real moment, step through the original frames. Record context/37.
Proposed topic (AI frame interpolation / slow motion) was new → used as briefed.
- Beats: 0–3.28 hook (one coral ball frozen twice, see-through, in one video frame; A FRAME THAT / NEVER HAPPENED from frame 0)
  · 3.28–5.15 DOCKET's phone: slow-mo timeline, made-up frames (amber) pop in between real ones (AI SLOW-MO) · 5.15–12.85
  card: REAL 1 / ? / REAL 2 (TWO REAL FRAMES); motion arrows on the ball, dots elsewhere (MOTION GUESS); both frames slide to
  the middle and blend into one ball (MOVED + BLENDED, AI-MADE) · 12.85–17.3 3D: the real ball drops out of frame and back
  (fast bounce); the straight guess arrow gets ✗ (GUESS FAILS); the blend shows both balls (BOTH BALLS) · 17.3–20.7 card:
  REAL 1 ✓ / AI-MADE ! / REAL 2 ✓ (NEVER HAPPENED) · 20.7–26.85 phone: smooth playback (SMOOTH ≠ PROOF) → Original, frame
  1 → frame 2 (CHECK THE ORIGINAL) · CTA.
- Captions moved to the 2026-11-19 band: pill y 282..458 (CAP_TOP 282), x 100..900; caption_check.py updated to that spec.
- Illustrative: the ball, its positions, the arrows, the timeline and its tile counts, the phone screens (EXAMPLE; generic, not
  Samsung's or any app's UI). The doubled ball is an illustration of a documented failure type, not a recording of one.
- Thumbnail: `render.mjs --thumb` (hook scene + "NEVER / HAPPENED").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin; 8 narration clips), qa.sh (ASRPY=<python with faster-whisper>).
