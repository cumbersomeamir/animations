# Production notes — Ideaverse 30s round02-01
"How your phone reads text from a photo" · round 2026-11-03 (round-02) · branch claude-video/ideaverse

## What was kept (accepted recipe, referenced by source, not re-imagined)
`src/` was copied from `production/30s/2026-11-02-feedback-round/src` (the accepted feedback-round renderer, itself the
education pilot-01 engine): `character/docket.js` unchanged; renderer, ACES tone mapping, PMREM environment, hemisphere +
warm key spot + mint rim + blue fill, fog, floor grid, back wall panels, NEWSROOM sign, fov-44 eased camera system with
impact shakes, numeric arm IK, caption pill (Space Grotesk 700, y 344–520), voice (cached Kokoro af_bella 0.7 + am_puck 0.3,
en-us, 0.98), score engine (quiet pad bed, event-linked notes/SFX, ducking, −15 LUFS master). The MAIL SORTER cabinet
geometry is reused as a "pattern library" (LETTERS / NUMBERS drawers, gauge relabelled MATCH).

## What changed (requested)
- CTA spoken + visible: "Download the Ideaverse app." (final 3.6 s; caption with icon chip).
- Icon: current official Google Play icon (assets/icon.png; provenance context/03-assets.json).

## New in this episode (`src/stage/ocr.js`, `src/stage/cues.js`)
Props: fictional BUS 42 timetable board on a post; an oversized phone whose screen is drawn per state (viewfinder →
photo → text boxes → recognised text → copy → translated menu → blurry misread → corrected), labelled EXAMPLE; a blurry
"8" tile; candidate cards 3 B 6 8 0 S 9; eight learned styles of "8"; a time chip; a Spanish menu card.
Shots (cuts between distinct setups, eased moves within): hook wide (photo + flash) · phone insert (text boxes) ·
medium (tile flies to NUMBERS) · drawer insert (matching + learned styles) · phone insert (real text) · medium (tap,
copy, NOTES, menu out of SOURCES) · phone insert (translation flips) · board two-shot (misread → double-check) · CTA.

## Narration placements / word anchors
s1 0.30 · s2 3.00 ("finds" 3.56, "recognizes" 5.80, "matching" 8.12, "patterns" 9.22, "many examples" 10.36) ·
s3 12.15 ("real text" 12.99, "Tap" 14.59, "translate" 16.07, "menu" 16.65) · s4 19.00 ("misreads" 20.02,
"double-check" 21.22, "times" 21.74, "prices" 22.38) · s5 26.40.

## Claims
Sources in context/16 and publishing-caption.txt (Google Lens, Google Photos Help, Apple Support Live Text, Apple Vision
docs, Google ML Kit docs, Tesseract training docs). The accuracy qualification lives in its own sentence ("Poor focus can
cause misreads…"). No claim that Ideaverse provides OCR/Lens/Live Text; Ideaverse appears only in the CTA.

## Commands
See build.sh (render → encode → caplog → score → loudnorm → mux → qa.sh) and qa.sh.
