# QA — ideaverse-30s-english18-01.mp4 (English, batch 2026-11-15-english-18 / batch18)
sha256 d4f5e1762a0fa25d496abc551a707d2c6135adb74f301e3a647ead8222c2ba6a · thumbnail `ideaverse-30s-english18-01-thumbnail.png`
(1080x1920 PNG, sha256 5d8b2c786d6888e7f9709ad2d3aee0bff30a1b845190516404ee065726c04dbb) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, true peak −1.9 dBFS; music ducked under voice; the decline beep
  sits at frame 0 (before the first word); chimes sit in pauses after "Why?", "line." and "again.".

## Captions (2026-11-11 safe area)
- English only, ≤ 2 lines, 60 px; pill x 130..870 / y 344..520, text ink x 170..831 / y 373..497 → SPEC PASS (inside
  x 100..900, y 230..1500). Top 300 px: scene only (DOCKET's antenna) — qa/top-band-strips.png.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH; every recognised word inside a caption that shows it (qa/asr-narration.txt).
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, key frames, thumbnail)
- Frame 0: DOCKET (puzzled) with a suitcase at a café counter, the terminal reading DECLINED €24.80, DECLINED ON HOLIDAY?
  (no fade-in, no logo). Card: payment card + clue dots (FRAUD SCORE → HUNDREDS OF CLUES), BANK'S LINE, three clue columns
  each under the line (ALONE: FINE), stacked past the line, red, DECLINED stamp (TOGETHER: TOO HIGH); back at the counter
  (FALSE ALARM); bank alert "Was this you?" → "Yes, it was me" → Card unblocked (CONFIRM IT WAS YOU); APPROVED (PAY AGAIN); CTA.
- Fixed during review: DOCKET first stood on the cashier's side and could not reach the terminal → re-laid out; the card hand
  covered the terminal screen → card taps below it; shop camera too close → pulled back; the CTA showed the terminal → props
  hidden from the CTA; stacked bars barely crossed the line → taller.
- Fixed after the full render: (1) the easel card kept showing the DECLINED chart in the background of the false-alarm,
  phone and CTA shots. Cause: Chromium dropped a redraw consisting only of one full-canvas opaque fill (the card's blank
  state) and kept the old picture; fix: the background is painted as two partial fills; frames 550–899 re-rendered (only
  frames with the easel in view changed). (2) the card was empty for ~0.9 s after the 4.75 s cut → the payment card and
  unlit dot grid now show from the cut; frames 142–179 re-rendered (175+ unchanged).

## Content
- Sources and claim types in context/33 (Visa consumer fraud-prevention page; Visa Protect solutions page; Nationwide and
  U.S. Bank fraud-alert help). The payoff points to the bank's own app (not to replying to texts); no scam procedure, no
  bank or card-network branding; no Ideaverse payment feature implied.

## Preservation
- All 23 earlier MP4s re-hashed unchanged.
