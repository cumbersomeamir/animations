# QA — ideaverse-30s-english22-01.mp4 (English, batch 2026-11-19-english-22 / batch22)
sha256 4ba2ea80a70edba6a3bccecee8e60c926180b43280cbf2bef2278d073fe7a7a5 · thumbnail `ideaverse-30s-english22-01-thumbnail.png`
(1080x1920 PNG, sha256 ececae6c045296a1cf8dad98598fc8ec91bbccd4cd505fcc0f119a9d9558be44) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 (≈1.76 Mb/s) · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo ≈194 kb/s ·
  faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, LRA 4.9 LU, true peak −2.3 dBFS; music ducked under voice; pops on
  "one ball" / "two places", "?" notes after "two places.", tile ticks, a whoosh as both frames slide in, a soft chime on the
  blend, a whoosh + thud on the fast bounce, low notes on the ✗ and on AI-MADE, a chime after "original frames.".

## Captions (2026-11-19 brief: upper band ≈ y 280–460, horizontal safe margins)
- English only, ≤ 2 lines, 60 px; pill x 162..838 / y 282..458, text ink x 199..800 / y 311..435 → SPEC PASS (checker updated
  to the new band: pill y 270..470, ink inside x 100..900 / y 280..460). Above the band (y 0..270): scene only (DOCKET's
  antenna) — qa/top-band-strips.png. Labels stay centred, above y ≈ 1500, away from the right-side controls.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All eight lines MATCH; every recognised word inside a caption that shows it (qa/asr-narration.txt).
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, qa/fix-check.png, key frames, thumbnail)
- Frame 0: one coral ball frozen twice, see-through, in a gridded video frame with brackets; A FRAME THAT / NEVER HAPPENED
  (no fade-in, no logo). Phone: Slow-mo · AI timeline, made-up frames pop in (AI SLOW-MO). Card: REAL 1 / ? / REAL 2 (TWO REAL
  FRAMES); arrows on the ball's pixels, dots on the still floor (MOTION GUESS); both frames slide to the middle and blend into
  one ball, AI-MADE (MOVED + BLENDED). 3D: the ball drops out of frame and back; dashed guess arrow → ✗ (GUESS FAILS); both
  ghosts appear = the hook frame (BOTH BALLS). Card: REAL 1 ✓ / AI-MADE ! / REAL 2 ✓ (NEVER HAPPENED). Phone: smooth playback
  (SMOOTH ≠ PROOF) → Original, frame 1 → frame 2 (CHECK THE ORIGINAL). CTA "Download the / [icon] Ideaverse app.".
- Fixed during review: dim, solid-looking ghosts (gridded backdrop + self-light so the see-through reads), a tiny one-line hook
  headline (now two lines), small card balls (before the full render); after the full render: the card was empty for 2 frames
  after the 5.15 s cut (REAL 1 now fades in from 4.95 s) and the easel poked into the left edge of the phone shots (hidden
  there) — frames 98–170 and 620–805 re-rendered, score re-mixed; the thumbnail repeated the headline (pill hidden there).

## Content
- Sources and claim types in context/37 (Samsung Newsroom + CamCyclopedia on Instant Slow-mo / AI FRC; Super SloMo CVPR 2018;
  FILM ECCV 2022; Quadratic Video Interpolation NeurIPS 2019). The doubled ball illustrates a documented failure type; it is
  drawn, not a recording. Phone screens are generic (EXAMPLE); no Ideaverse video feature implied.

## Preservation
- All 27 earlier MP4s (incl. english20-01 and english21-01) re-hashed unchanged.
