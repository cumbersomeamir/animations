# QA — ideaverse-30s-english15-01.mp4 (English, batch 2026-11-15-english-15)
sha256 e6d03c9b445d85fd3d8aa9b6380c33a84bb261ccb457c0e35c183b0cf8d7c35c · thumbnail `ideaverse-30s-english15-01-thumbnail.png`
(1080x1920 PNG, sha256 23c39ecddffd9832d652d5becbd3e1a2ff4b4e7de8d607ff97eddff4a4f5436e) · evidence in `qa/`
(regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, true peak −1.8 dBFS; music ducked under voice; stings sit in
  pauses between words, shutter/capture ticks are quiet.

## Captions (2026-11-11 safe area)
- English only, ≤ 2 lines, 60 px; pill x 172..828 / y 344..520, text ink x 210..789 / y 373..497 → SPEC PASS (inside
  x 100..900, y 230..1500). Top 300 px: scene only (DOCKET's antenna tip; the waving hand in the CTA) — qa/top-band-strips.png.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH; every recognised word inside a caption that shows it (qa/asr-narration.txt).
- Checker fix: each line's listening window now stops before the next line starts (s2 begins 0.25 s after s1 ends, and the
  old fixed +0.45 s window picked up "Night" from s2).
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, key frames, thumbnail)
- Frame 0: dark room (candle, DOCKET's glowing face) + the phone's bright, clean photo of the same scene + IT WAS THIS DARK?
  (no fade-in, no logo). Burst: shutter flash at 4.75 s, 8 dark grainy frames fly out → BURST. GRAIN (brightened frame,
  front frames slide aside) → LINE UP (shaky stack snaps into line) → AVERAGE (grain fades as frames merge) → NEURAL
  NETWORK sweep → ✓. DOCKET waves during a capture → the result shows the arm smeared (MOVING = BLUR). Phone set on books
  (BRACE IT), DOCKET freezes mid-wave (FREEZE), the ring completes → crisp raised arm (SHARP ✓). CTA with lights up.
- Fixed during review (stills before the full render): room too bright → dimmer lights; phone photo too dark → shadows
  lifted in the photo pass; wave pose crossed DOCKET's face / was too small to smear → arm raised and swung; photo close-ups
  reached into the top band → re-framed; burst opening too distant → close on the phone, then pull back; frame cards sat
  behind the label → re-centred; books unlit → screen glow light; hook label covered the photo's table → photo re-framed.
- Known minor: during the burst (≈5.0–5.4 s) a frame card flying toward the camera briefly passes behind the caption pill.

## Content
- Sources and claim types in context/30 (Google Research Night Sight post 2018; Google blog 2023; Pixel Camera Help;
  Apple iPhone User Guide). Mechanism attributed to Pixel's Night Sight only; the phone UI is generic and labelled EXAMPLE;
  grain is simulated; no Ideaverse camera feature implied.

## Preservation
- All 20 earlier MP4s re-hashed unchanged.
