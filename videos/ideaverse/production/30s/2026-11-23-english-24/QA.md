# QA — ideaverse-30s-english24-01.mp4 (English, batch 2026-11-23-english-24 / batch24)
sha256 ae8236f5e661d23a94ddcf08ebe030086cef85a0642c54dd3e96d3a4aa77dff6 · thumbnail `ideaverse-30s-english24-01-thumbnail.png`
(1080x1920 PNG, sha256 a6113bcc43fb246e11c4d9ae48c13c16c7dbc05698187bad9d53db4d5dc64b5c) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 (≈1.83 Mb/s) · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo ≈194 kb/s ·
  faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, LRA 4.1 LU, true peak −1.4 dBFS; music ducked under voice; quick ticks as
  the clock races, "?" notes after "Why does it stop?", a rising glide + chime as the shield closes, hour ticks and a low glide on
  the aging card, quick ticks for the 14 nights and rising ticks for the three checks, slow ticks while it holds, a rising glide as
  it fills, a gentle 7:00 alarm, the long-press swell, the Charge Now tap and chimes.

## Captions (2026-11-19 brief band ≈ y 280–460, horizontal safe margins)
- English only, ≤ 2 lines, 52–60 px; pill x 101..899 / y 282..458, text ink x 140..860 / y 310..435 → SPEC PASS. Above the band
  (y 0..270): scene only (window, sky, DOCKET's antenna), no text — qa/top-band-strips.png. Labels centred, above y ≈ 1500.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All eight lines MATCH ("80 %" ↔ "eighty percent" via the checker's number map); every recognised word inside a caption that
  shows it (qa/asr-narration.txt).
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, qa/fix-check.png, key frames, thumbnail)
- Frame 0: a nightstand at night — alarm clock 1:10, the phone on a stand at 80%, a starry window; WHY STUCK / AT 80%? (no fade-in,
  no logo). The clock races to 3:40 while the battery stays at 80%. Close-up: a shield closes over the 80% ring (NOT BROKEN).
  Card: 100% battery, HOURS AT FULL 0 → 8 h, BATTERY AGING bar grows (FULL = FASTER AGING). Card: ON THE PHONE; 14 nights of
  plug-in bars; "usually unplugged"; ✓ 14+ DAYS · ✓ 9+ CHARGES, 5 H+ · ✓ SAME PLACE (LEARNS YOUR ROUTINE). The night: ring amber
  with a pause sign while the clock runs (HOLDS AT 80%), then 80 → 100% by 6:55, dawn in the window, the 7:00 alarm (FULL WHEN YOU
  WAKE). DOCKET's phone: "Charging paused · at 80% · full by 6:55" → touch and hold → Charge Now → "Charging now 81%" (NEED IT NOW?
  → CHARGE NOW). CTA "Download the / [icon] Ideaverse app.".
- Fixed during review: hook and night shots framed too low with the clock cut at the edge (reframed), small payoff text (enlarged)
  — before the full render; after the full render: the routine card showed bare axes for 0.7 s after its cut (ON THE PHONE chip
  from the cut, nights start building at 10.0 s) and ASR put "then" just before its caption (boundary 23.8 → 23.6 s) — frames
  283–375 and 700–722 re-rendered, score re-mixed (night ticks follow the cue).
- Session note: the container restarted after the full render; all 900 frames were verified intact (PIL verify, none missing)
  and reused.

## Content
- Sources and claim types in context/39 (Apple Support 108055: on-device machine learning, ≥14 days and ≥9 charges of 5 h+ in a
  location, delay past 80%, touch and hold → Charge Now; Apple Batteries — Maximizing Performance: defer to 100% until shortly
  before you need it). Times, timers, bars and screens are illustrations (EXAMPLE; generic, not Apple's UI); no Ideaverse battery
  feature implied.

## Preservation
- All 29 earlier MP4s (incl. english20-01 … english23-01) re-hashed unchanged.
