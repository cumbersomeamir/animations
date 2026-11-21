# QA — ideaverse-30s-english23-01.mp4 (English, batch 2026-11-21-english-23 / batch23)
sha256 09057c0a1a81f8db49956418d592627ee28d9c7d02f8460a2a259066fa16881f · thumbnail `ideaverse-30s-english23-01-thumbnail.png`
(1080x1920 PNG, sha256 0712ddd0204a33016b44bb1eaa06dcb050d1f1b5d3e3cdd4fb0b601662b5d054) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 (≈4.46 Mb/s) · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo ≈194 kb/s ·
  faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, LRA 4.0 LU, true peak −1.9 dBFS; music ducked under voice; ticks as each
  light in the hook's wave turns green, "?" notes after "red lights.", trend-dot ticks + a swelling glide, low notes on the worst
  crossing, Accept tap + chime, ticks + chimes as crossings 2 and 3 turn green, count-up ticks and a falling glide on the result,
  the SEND tap, a chime after "your city.".

## Captions (2026-11-19 brief band ≈ y 280–460, horizontal safe margins)
- English only, ≤ 2 lines, 58–60 px; pill x 101..899 / y 282..458, text ink x 138..860 / y 311..435 → SPEC PASS. Above the band
  (y 0..270): scene only (far city / DOCKET's antenna), no text — qa/top-band-strips.png. Labels centred, above y ≈ 1500.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH ("33 %" ↔ "thirty-three percent" via the checker's number map); every recognised word inside a caption
  that shows it (qa/asr-narration.txt).
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, qa/fix-check.png, key frames, thumbnail)
- Frame 0: a tiny night avenue with three signals; a green band travels with the released cars; AI THAT CHANGES / YOUR COMMUTE
  (no fade-in, no logo). Top-down: red trend dots, red heat at each crossing, the worst pulses (MAPS DRIVING TRENDS → MOST STOPS
  HERE). Phone: engineer view, Crossing 2, Suggestion +6 s green (+ wave) → ACCEPT → ✓ ACCEPTED (ENGINEERS DECIDE). Street
  level: crossing 2 turns green (+6 s GREEN); crossing 3 turns green as the cars arrive (GREEN WAVE). Card: BOSTON PILOT · one
  crossing (Atlantic Ave & Richmond St) · ? → −33% unnecessary stops · BEFORE / AFTER bars · source line (ONE CROSSING, ONE
  PILOT). Phone: Report a problem → Traffic light · Timing: always red when I arrive → SEND → ✓ SENT (RESULTS VARY → REPORT A BAD
  LIGHT). CTA "Download the / [icon] Ideaverse app.".
- Fixed during review: pale facades (window texture split into base + lit-window emissive), a street-level shot blocked by a
  foreground building and then too close to crossing 1 (camera now in the left lane past crossing 1), oversized lamp glows and
  tag (before the full render); after the full render: the result card showed a grey "−0%" and a full-length AFTER bar before
  the number was spoken ("?" placeholder; AFTER bar grows to 67%) and the suggestion card appeared 0.3 s after its cut (now fades
  in from 9.8 s) — frames 298–312 and 483–580 re-rendered, score re-mixed.

## Content
- Sources and claim types in context/38 (Google Research Green Light page + FAQ; Google blog 29 Jul 2024; City of Boston pages,
  incl. the May 2025 announcement: phase 2 pilot, evaluated with INRIX, Atlantic Ave & Richmond St −33% unnecessary stops). Only
  that figure is measured, and it is stated with its scope (Boston's pilot, one crossing). The city, timings, "+6 s" and screens
  are illustrations (EXAMPLE); no Google, Maps or City UI; no Ideaverse traffic feature implied.

## Preservation
- All 28 earlier MP4s (incl. english20-01 … english22-01) re-hashed unchanged.
