# QA — ideaverse-30s-english19-01.mp4 (English, batch 2026-11-17-english-19 / batch19)
sha256 27b5d76984bda227e5419bf35ababd28cde0fe10f5bc226c566731656bd93146 · thumbnail `ideaverse-30s-english19-01-thumbnail.png`
(1080x1920 PNG, sha256 3f213e795cec0323fb41739fd3c2acc240fef7aed977bbd4ff621b25eba8bd88) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, true peak −2.0 dBFS; music ducked under voice; chimes sit in pauses
  after "come from?", "noise.", "further.", "picture of it." and "shoot.".

## Captions (2026-11-11 safe area)
- English only, ≤ 2 lines, 60 px; pill x 110..890 / y 344..520, text ink x 147..853 / y 373..497 → SPEC PASS (inside
  x 100..900, y 230..1500). Top 300 px: scene only (DOCKET's head and antenna) — qa/top-band-strips.png.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH; every recognised word inside a caption that shows it (qa/asr-narration.txt).
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, key frames, thumbnail)
- Frame 0: DOCKET holds a phone with a crisp, cratered moon; a night window behind shows a small, soft moon; DETAIL FROM
  WHERE? (no fade-in, no logo). Viewfinder: soft grainy moon → MOON box; card: 12 grainy shots merge into a smoother moon,
  then a sweep adds crisp detail (AI DETAIL); a moon picture on a monitor gets the same box (SKY OR SCREEN?); settings
  toggle off (TURN IT OFF) → plain capture (WHAT THE LENS CAUGHT); CTA.
- Fixed during review: DOCKET stood between the camera and the easel in the card shots → off-stage for that section; card
  moon moved up so the label does not cover it; after the full render the card was empty for ~0.45 s after its cut →
  shots start at 9.85 s, frames 291–340 re-rendered (only 292–335 changed) and the score re-mixed (its ticks follow the cue).
- Known minor: in the "sky or screen" close-ups the easel's crisp moon is partly visible at the left edge.

## Content
- Sources and claim types in context/34 (Samsung UK Support page on moon photos: recognition, 10+ frame Super Resolution,
  deep-learning detail enhancement, the picture-vs-real statement, how to switch Scene Optimizer off). Moons are procedural
  drawings; the settings screen is generic (EXAMPLE); no Ideaverse camera feature implied.

## Preservation
- All 24 earlier MP4s re-hashed unchanged.
