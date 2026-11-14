# QA — ideaverse-30s-english14-01.mp4 (English, batch 2026-11-14-english-14)
sha256 da6bc6d29a810a35f351ed0bf0bb3491159148b562f845616822b8c537f48eae · thumbnail `ideaverse-30s-english14-01-thumbnail.png`
(1080x1920 PNG, sha256 7615cefd00b9247b846f3570bce90e0591496a63d0d89ccae6aed7dc623971db) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, true peak −1.4 dBFS; music ducked under voice; the cable crunch
  and stings sit in pauses between words.

## Captions (2026-11-11 safe area)
- English only, ≤ 2 lines; pill x 101..899 / y 344..520, text ink x 138..862 / y 373..497 → SPEC PASS (text and pill inside
  x 100..900, y 230..1500). Fonts 54–60 px. Top 300 px: scene only (easel frame edge, wall-monitor icon, DOCKET antenna).

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All six lines MATCH (also exact in small.en before render); every recognised word inside its caption window.
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, thumbnail, top-band-strips.png)
- Hook: the vacuum swerves round the sock and rolls onto the white cable → STUCK!, "Why?"; camera view: frustum + SHOE ✓ /
  SOCK ✓ / CORD? boxes on the words, TRAINED TO NAME; laser: red line rises over the sock with many points, push-in to the
  cable: one point → FEW POINTS; card: DEPENDS ON MODEL (j7 ✓✓, j6 ✓✗ highlighted, no camera ✗✗) → CHECK YOURS; DOCKET gathers
  the cable, FIRST MAPPING RUN → AVOIDANCE OFF; CTA.
- Fixed during review: dark cable invisible on the dark floor → light cable; laser too thin → glowing tube + registered points;
  hook/payoff framing (DOCKET cut off) → re-framed; SHOE ✓ tag clipped → camera widened (frames 136–287 re-rendered);
  EXAMPLE tag of the idle background easel sat in the top 300 px → removed from the idle card (frames 0–287 re-rendered).
- Known minor: ~2 frames at 14.37 s show the card's column headers before its title fades in.

## Content
- Sources and claim types in context/29 (iRobot support table; eufy support pages; IEEE Spectrum). Model-specific claims
  only from manufacturers' own pages; no ranking of brands; no Ideaverse robot feature implied.

## Preservation
- All earlier MP4s re-hashed unchanged.
