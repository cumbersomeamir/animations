# Production notes — Ideaverse 30s english15-01 (English, lesson style, 2026-11-11 rules + first-frame rule)
How a phone photographs a room almost too dark to see: Night Sight (Pixel) takes a burst; each frame's grain is random, so
lining the frames up and averaging cancels it; a neural network cleans up the rest; anything that moves won't line up and
blurs. Payoff: brace the phone and ask people to freeze until the capture is done. Record context/30.
Proposed topic (camera menu translation) replaced: it repeats round02-01 (photo OCR + Spanish menu → English insert).
- Beats: 0–3.7 hook (dark room, candle, DOCKET's glowing face; the phone shows a bright clean photo; IT WAS THIS DARK? from
  frame 0) · 3.7–7.35 burst (shutter flash; 8 dark grainy frames fly out → BURST) · 7.35–12.6 GRAIN (brightened frame;
  front frames slide aside) → LINE UP (shaky stack snaps into line) → AVERAGE (frames merge, grain fades as each is added)
  · 12.6–15.6 NEURAL NETWORK sweep → ✓ · 15.6–20.65 DOCKET waves during the capture → smeared arm → MOVING = BLUR ·
  20.65–26.85 phone set on books (BRACE IT), DOCKET freezes mid-wave (FREEZE), ring completes → SHARP ✓ · CTA (lights up).
- The phone "photos" are renders of the same scene from the phone's position with the room lit (shadows lifted); the grain
  is simulated (seeded Gaussian); the averages and the motion smear are computed exactly from those renders.
- Generic phone UI (moon chip, shutter, capture ring) labelled EXAMPLE; not Pixel's or Apple's UI; no Ideaverse feature.
- Thumbnail: `render.mjs --thumb` (frame-0 scene, camera raised + "IT WAS / THIS DARK?").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
