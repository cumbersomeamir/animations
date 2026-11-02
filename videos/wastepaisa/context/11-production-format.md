# 11 · Production format (durable rules for WastePaisa production videos)

Recorded 2026-11-02 for production round `production-30s-2026-11-02`. This is durable context for
future rounds. **No automation has been created.**

## Channel genre (locked)
Recycling explainers: material composition, sorting and potential scrap value. Each video teaches one
material fact that is useful without the app. Never claim payouts, prices, rates, "guaranteed profit"
or a monthly allowance; any value talk needs a checked, dated source and must stay non-promissory.

## Art-direction skill (exact)
- Skill: **Paper-cut Motion**, https://github.com/imMamdouhaboammar/motion-graphics-skills/blob/main/skills/paper-cut-motion/SKILL.md
  plus its `references/stop-motion-craft.md`. Read-only art direction. The repo's `scripts/` builder
  was **not** cloned or run; all code is original Canvas2D.
- Rules applied: 12 fps quantised time (`floor(t*12)/12`), stepped motion and no smooth morphing.
  One light from the upper left, with consistent directional shadows (bigger offsets when lifted).
  Pushpins and masking tape. Hard-cut drops in one frame with a tap sound. Stamps snap in one frame,
  tilted −3° to +5°. Replace sheets by covering or removing them. Labels are short printed strips.
  Seeded imperfections only, so seeking is deterministic. Sound only at contact points.
- Adaptations: the skill's red string becomes **copper wire** (scrap-shop identity). Camera moves are
  limited to stepped 12 fps pushes in the hook and takeaway (the skill gives no camera rule and warns
  against smooth moves). A quiet music bed is added under contact SFX, as the brief requires.

## Recurring scene and performer
- **Tinku**, the approved tin-can creature with an open lid, from `education/pilot-01/src/rig/tinku.js`,
  rendered as transparent pose sprites (look, tap, wow, point, pull, pin, shrug) with a white paper-cut
  edge and lifted shadow. Never redesign him. Add poses only from the same rig.
- **Tinku's scrap shop**: dark cardboard pegboard wall, kraft backing sheet, cork **sorting board**,
  counter, "sorted scrap" crate (carries the subtle app signature), copper coil, printed material tags.
- Evidence hierarchy per episode: 1 anchor object, 3–6 evidence pieces, at most about 4 connectors,
  and 1 resolution piece (for example, a final tag).

## Video spec
1080×1920 portrait · 30 fps delivery (stepped 12 fps source; FFmpeg `fps=30` repeats frames) · H.264
High yuv420p (`-preset veryfast -crf 16`) · AAC-LC 48 kHz stereo 192 kb/s · exact duration (30.000 s =
900 frames) · `-movflags +faststart`.

## Story structure (30 s)
Hook 0–3 s · visible setup 3–8 s · mechanism/story 8–23 s · takeaway 23–29 s · quiet end 29–30 s
(caption off, resolution piece held, music resolves).

## Caption and safe areas
- Captions are upper-centre typed strips: **text ink y 350–470**, horizontal margins ≥ 80 px (in practice
  ≥ 195 px), at most 2 short lines, split into word groups, hard switches with no overlap. Baloo 2
  ExtraBold 56 px, ink #2a1a10 on cream #f6ead6, key words in orange ink #c95a0c.
- **y 0–300 is kept clear** (nothing but wall texture). The app signature lives on the crate, not at the top.
- Essential visuals stay within x ≈ 60–1020 and y ≈ 500–1450 at every camera zoom. They stay out of the
  bottom overlay band (y > 1450) and the right-side UI column (x > 1020 at mid height).
  Check this at the maximum zoom.

## Palette (from the app icon + approved direction)
Icon orange #E8741C (ink #C95A0C) · icon green #1F6B3A · cream #F6EAD6 / paper #F3E5CC · cardboard
#A8743F / #7A5129 · wall #4A3121 · kraft #6E4A2C · cork #B98B55 · plastic film #DFF1F6 / #B2DEEE ·
copper #C47A42 · coffee #5B3420.

## Audio configuration
- Voice: **Kokoro-82M v1.0 ONNX** via `kokoro-onnx` 0.6.1, blend **af_bella 0.7 + am_puck 0.3**, speed
  **0.98**, `en-us`. Model files from the official kokoro-onnx release `model-files-v1.0`
  (kokoro-v1.0.onnx sha256 7d5df8ec…a6c5, voices-v1.0.bin bca610b8…f7d), cached locally and not committed.
  Never substitute Piper. No celebrity or character imitation.
- Music: quiet original numpy cue (96 BPM, D major) reusing `education/pilot-01/audio/synth.py` instruments.
  SFX play only on contact (pins, taps, tears, tape, landings, drops, stamps).
- Mix: voice upfront (×1.3), music ducked 12 dB and SFX 7 dB under speech. Two-pass loudnorm to
  **−15 LUFS, −1.5 dBTP** (the accepted window is −14 to −16 LUFS with true peak ≤ −1 dBTP).

## QA checklist (every production round)
ffprobe (duration, streams, frame count), a whole FFmpeg decode, caption ink bounds logged per step, a full
contact sheet plus transition frames decoded from the export, one ASR and timing pass, a loudness and true-peak
measurement, a claim-to-source map, and provenance/licence notes. Fix major defects, then re-check the final export.
