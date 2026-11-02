# 12 — Production round `production-30s-2026-11-02`: 30 s knowledge challenge 01

Output folder: `videos/recall/production/30s/2026-11-02/` · deliverable `recall-30s-production-01.mp4`.
Format rules: 11. Earlier deliverables preserved: `output/recall-30s.mp4`, `education/pilot-01/…mp4` (untouched);
06 15 s test still not started (07).

## Brief (user-approved, essentials)
- ONE new ready-to-post 30.000 s educational video (no trims of 10/15 s, no app campaign). Genre (locked): knowledge
  challenges viewers can try answering. Exact skill: Microgame Frenzy STYLE.md (read-only).
- Episode: "Can you beat this fifth-grade science question?" Lime/off-white knowledge game show; question → action →
  reveal in a physical miniature water tank with a steel ball and a hollow hull; real 2 s prediction pause;
  displacement markers; physically correct up/down forces; passive (not an executable game); no fake testimonial;
  verify Archimedes' principle.
- Voice: agreed "Meshline" Kokoro config af_bella 0.7 + am_puck 0.3, speed ≈0.98, en-us, cached model. Quiet
  original music, event-linked SFX, voice up front, −14 to −16 LUFS, true peak ≤ −1 dBTP; one ASR + timing pass.
- 1080×1920, 30 fps, 900 frames, H.264 yuv420p, AAC 48 kHz stereo, exactly 30 s. Captions upper-centre, text ink
  y 350–470, margins ≥ 80 px, ≤ 2 short lines; top 0–300 px clear; essentials away from the bottom overlay region.
- Storyboard: hook 0–3, setup 3–8, mechanism 8–23, takeaway 23–29, end 29–30.
- Save 11 + 12, publishing-caption.txt with sources; push; attach the MP4; no automation.

## Final script (narration; voice af_bella 0.7 + am_puck 0.3, speed 0.98, en-us)
| id | text | start–end (s) | w/s |
|---|---|---|---|
| l01 | A steel ball sinks. | 0.40–1.51 | 3.60 |
| l02 | A steel ship floats. | 1.85–3.00 | 3.49 |
| l03 | Same material. So what changes? | 3.30–5.41 | 2.37 |
| l04 | Make your guess. | 5.60–6.39 | 3.82 |
| — | *(2.0 s silent guess: fuse 6.5–8.5)* | | |
| l05 | Here's the answer: the ship's hollow shape displaces much more water for its weight. | 8.65–13.41 | 2.94 |
| l06 | The water pushes upward. | 13.75–14.97 | 3.28 |
| l07 | When that buoyant force balances the ship's weight, it floats. | 15.30–18.41 | 3.21 |
| l08 | Fill the hull with water, and the situation changes. | 18.65–21.77 | 2.89 |
| l09 | It's not that the steel became lighter. | 22.60–24.35 | 3.99 |
| l10 | The shape changed the balance. | 24.85–26.18 | 3.77 |
65 words, 20.44 s of speech, 2.17 words/s overall. Edits vs the draft (minimal): "Here is" → "Here's"; "So what
changes?" as its own sentence; "It is not that steel became lighter" → "It's not that the steel became lighter"
(natural rhythm; same meaning). Physics wording kept: "displaces much more water for its weight" is accurate (OpenStax).
On-screen takeaway (26.4–30 s): "A hollow shape displaces more water for its weight."
Per-line ASR (faster-whisper base.en) matched every line; word times in `audio/narration/words.json`.

## Source → claim mapping
See `production/30s/2026-11-02/docs/SOURCES.md` (S1 OpenStax CP2e §11.7; S2 Table 11.1; S3 OpenStax UP1 §14.4;
S4 Gard 2012; S5 Texas TEKS §112.7(b)(6)(A) for the grade-5 framing). Key numbers: steel 7.8 × water ⇒ floating
ship displaces 7.8× the ball's water; computed level rise 0.00695 vs 0.0542 (ratio 7.80).

## Storyboard (final; cue times in timeline.json, 120 BPM)
| time | segment | picture | sound |
|---|---|---|---|
| 0.0–3.0 | hook | WATCH! slam already in progress; Kip drops the ball in the BALL chamber (splash, sinks, ✗ SINKS 1.5 s) and lowers the ship into the SHIP chamber (bobs, ✓ FLOATS 2.5 s); Q1 · GRADE 5 SCIENCE badge | brass stab, whoosh, plop/splash, clunk, stamp thuds/ding |
| 3.0–8.5 | setup + guess | stamps fly out; "steel = steel" tags; Kip shrugs; GUESS! slam; chips A "Steel gets lighter" / B "The shape"; **2.0 s fuse with 4 knots on beats**, Kip thinking | groove → heartbeat + fuse ticks only (silence before the biggest hit) |
| 8.5–18.5 | mechanism | ANSWER! (biggest stab + crash), chip B ✓; lime glow on the ship's displaced volume + dashed circle on the ball; start line + **1× vs ≈8×** level marks; push arrows (ball tiny = 1/7.8, ship = weight); ship weight arrow + "=" at "balances" | shimmer, ticks, whoosh, ding |
| 18.5–22.5 | mechanism (twist) | FILL IT! slam; Kip pulls the lime plug; water jets in, the ship rides lower (chamber level holds), floods over the rim, sinks (✗ SINKS 21.5 s); level falls to the ball's 1× | pop, gurgle, rush, bubbles, clunk |
| 22.5–26.5 | takeaway | weight arrows pressing on both pieces, "=" and "same weight"; Kip shakes head; "The shape changed the balance." | thunks, ding, chime |
| 26.5–29.0 | takeaway (replay) | REPLAY! rewind: ship refloats; final ✗ SINKS / ✓ FLOATS, ≈8× mark; TAKEAWAY chip; Kip thumbs-up | rewind zip, stamps, hop |
| 29.0–30.0 | end | button chord; small Recall signature (icon + name) in the UI row; held frame | button chord rings out |

## QA (final exported file — details in `production/30s/2026-11-02/qa/QA.md`)
- `videos/recall/production/30s/2026-11-02/recall-30s-production-01.mp4`, sha256 d0261d676523589dbb9d577b19a7e02d47d092a2a380d77001081383a36c0077,
  10 590 379 bytes; H.264 High yuv420p 1080×1920 30/1, **900 frames**, video/audio/container **30.000000 s**,
  AAC LC 48 kHz stereo; full decode clean; **−14.6 LUFS**, **true peak −1.5 dBTP**, 0 clipped samples.
- One ASR pass on the final mix = script (WER 0.0). Caption ink y 353.5–466.5, x 221–859, ≤ 2 lines; top 300 px clear
  in all frames; Kip's helmet ≥ 618 px and tank floor ≤ 1490 px under camera moves. 24/24 automated checks pass.
- Fixes: weight arrows above resting pieces; stamps and labels; slam burst capped; l08 foley lowered; helmet tip under
  the UI row in 10 frames → hops/push-in reduced and frames 254–277 + 839–852 re-rendered (seams verified); GUESS! tag
  fly-out hidden behind chips.
- Limits: audio judged by measurement + ASR only (cannot listen); social UI not simulated; the grade-5 framing rests
  on Texas TEKS only.

## Progress / state
- 2026-11-02: verified repo/branch; read the skill doc (read-only) and the sources; narration + word timings;
  scene/overlay/physics/mix built; stills checked; render 1 (28 min, 3 workers) → QA found 10 frames over the UI-row
  limit → patched → final export verified; committed and pushed to `claude-video/recall`.
- Exact commands: `cd videos/recall/production/30s/2026-11-02 && WORKERS=3 ./build.sh`; patch:
  `node render.mjs --pngdir build/patch --from 254 --to 277` and `--from 839 --to 852`, copy PNGs + merge layout
  entries into build/frames, `./mux.sh`, `audio/.venv/bin/python qa/qa.py`. A clean `./build.sh` now reproduces the
  final in one pass because the fixes are in the source.
- Next: on request, the next knowledge challenge in the same format (11); no automation created.
