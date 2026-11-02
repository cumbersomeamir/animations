# 11 — Production format: Recall knowledge challenges (durable; for future rounds)

Set 2026-11-02 by the user-approved production round `production-30s-2026-11-02`; updated by batch 02
(`production-30s-2026-11-02-batch-02`). Applies to Recall production
videos from now on unless a newer brief overrides it. **No automation has been created** (the user said not to yet).
Relationship to earlier context: 08 (educational strategy, Kip) still holds; this file fixes the production format.

## Channel genre (locked)
Knowledge challenges and educational questions viewers can try answering. Passive video (not an executable game):
pose a question, give a real ~2 s prediction pause, then reveal the mechanism with a physical demonstration and a
short, accurate takeaway. No fake testimonials (e.g. no "perfect-memory child"), no invented health/legal/income claims.

## Exact skill (read-only art direction)
- **Microgame Frenzy**: https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/microgame/STYLE.md
  (module `styles/microgame/STYLE.md`; read in full 2026-11-02; DEMO.md and repo code NOT fetched or run).
- Adopted: command word slams in (~3-frame overshoot), holds, shrinks to a corner tag before the action, and never
  piles up; fuse timer with one knot per beat; ✓/✗ result stamps; frame-within-the-frame (the challenge tank cabinet);
  stage badge; tempo grid + cue table first, with picture hits on cues; host tick on the beat; silence before the biggest
  hit; no fades or blank frames; hard-shadow cards; heavy display face for commands; hero silhouette marks kept;
  instant replay.
- Adapted: one medium (tactile clay) instead of a new art style per game, because the brief requires a continuous,
  coherent scene; the app palette (lime/paper/ink) replaces the skill's saturated party palette; portrait layout
  instead of a 40%-width game screen; passive question format instead of lives/failure rounds; the hero (Kip) does not
  speak, and the narrator is the off-screen host; −14.5 LUFS (inside the brief's −14 to −16) instead of exactly −14.
  Details: `production/30s/2026-11-02/docs/STYLE-ADAPTATION.md`.

## Recurring format (30 s)
| segment | time | rule |
|---|---|---|
| hook | 0–3 s | command already slamming (e.g. WATCH!), physical puzzle happens, ✓/✗ stamps |
| setup | 3–8 s | state what is the same and what is asked; GUESS! command; 2–3 answer chips; **visible think beat: 3.0 s fuse (6 knots on beats) — latest feedback (batch 02); round 01 used 2.0 s** |
| mechanism | 8–23 s | ANSWER! stab after the silence; one demonstrated mechanism with markers and forces; one twist (e.g. FILL IT!) |
| takeaway | 23–29 s | restate in one sentence; REPLAY! of the key state if useful; TAKEAWAY chip |
| end | 29–30 s | button chord, settled frame, small Recall signature; no fade to black |

## Scene language
- Physical clay miniature on a tabletop; lime cabinet frame around the experiment (frame-within-the-frame); sunburst
  home-stage backdrop in ink tones with a soft lime glow (rotates slowly, pulses on the beat).
- Kip (08, model sheet in `education/pilot-01/docs/`) is the silent performer: does the experiment, reacts, ticks on
  the beat. Not a talking mascot.
- Forces: directionally correct; magnitudes from cited values; never show an unbalanced pair on a resting object
  (for resting objects show weight alone, or include the support force).
- Locked frontal camera with beat-locked push-ins ≤ 6 %; safe areas verified per frame.

## Audio configuration
- Narration: Kokoro-82M v1.0 ONNX (Apache-2.0) via kokoro-onnx 0.6.1, the agreed channel voice config the user
  calls "Meshline": blend **af_bella 0.7 + am_puck 0.3**, **speed 0.98**, lang **en-us**. The cached model is reused:
  model.onnx sha256 8fbea51e…34cb, af_bella.bin f69d8362…5c8b, am_puck.bin fcf73c98…74a0. No Piper, no imitation
  of named characters.
- Music: original, synthesised in code, quiet groove (120 BPM in round 01) with brass stabs on commands.
- Mix: voice up front; music ducked ~11 dB and foley ~6 dB under the voice; integrated −14.5 LUFS (accept −16…−14);
  true peak ≤ −1 dBTP (4×-oversampled limiter at −1.6 dBTP).
- One ASR + timing pass (faster-whisper base.en) on the lines and on the final mix; no repeated broad rework.

## Palette (sampled from `assets/icon.png`) and functional colours
lime `#C7F36B` · paper `#F8FAF3` · ink `#20251B` (icon) · hard-shadow `#0E120B` · sunburst rays `#262E1E`/`#2C3623` ·
water `#8ED6C4` · steel `#AEB5BA` · tank backing `#23352F`. Success = lime ✓, fail = ink ✗.

## Safe areas (1080×1920)
| zone | y (px) | content |
|---|---|---|
| top clear | 0–300 | backdrop only; no text, UI or bursts (slam burst radius capped) |
| caption | text ink 350–470 (pill ≈ 324–492) | upper-centre, ≤ 2 short lines, side margins ≥ 80 px, Fredoka 600 auto-fit 54→40 px, key words lime; split word groups at ASR word times |
| UI row | 500–612 | stage badge / TAKEAWAY chip (left), command tag / signature (right); answer chips + fuse during the guess |
| subject | 612–1500 | Kip + experiment; verified per frame (Kip's helmet top ≥ 612, tank floor ≤ 1500) |
| bottom | 1500–1920 | non-essential table only (platform UI overlays) |
Fonts: Fredoka (OFL) for captions and labels, Titan One (OFL) for command words.

## Production pipeline
Three.js (npm, pinned) + preinstalled Playwright/Chromium (SwiftShader, ≈2 s/frame); 3 workers; PNG frames → x264
CRF 17 yuv420p + AAC 192k 48 kHz stereo, `-t` exact duration. Per-frame overlay boxes and safe anchors are logged;
QA checks ffprobe, frame count, full decode, loudness/true peak, ASR, caption ink bounds, top-clear, subject zone and
contact/boundary sheets. Deterministic frames allow patching a frame range rather than a full rerender.

## User feedback log (latest overrides earlier details)
- **Batch 02 (2026-11-02):** "Keep Microgame Frenzy style" with: a physical, labelled measuring prop (kilogram-labelled
  balance); a **three-second visible choose/think beat**; a clear physical payoff (equal balance); a second round that
  flips the condition (same-volume boxes); the video must play independently (no interactive app assumed); word the
  question precisely (**MASS**, not "heavier"/weight) and avoid side effects that distract (no buoyancy in air);
  explanations scientifically precise; fresh storyboard with purposeful transitions — never trim or recolour old output;
  reuse the accepted identity (Kip, palette, stage), no random new characters; research every claim against
  primary/institutional sources and tighten wording where a term cannot be sourced (e.g. "bulk density" → "as a pile,
  their density"); 65–80 words narrated naturally in 30 s.
- **Round 01 (2026-11-02):** knowledge-game show, physical miniature, 2 s prediction pause, displacement markers,
  physically correct forces, no fake testimonial, verify the core principle.

## Episodes produced (do not repeat topics)
| # | topic | output | context |
|---|---|---|---|
| 01 | Can you beat this fifth-grade science question? (steel ball sinks, steel ship floats) | `production/30s/2026-11-02/recall-30s-production-01.mp4` | 12 |
| 02 | Which is heavier: a kilo of steel or feathers? (mass vs volume) | `production/30s/2026-11-02-batch-02/recall-30s-production-02.mp4` | 13 |

