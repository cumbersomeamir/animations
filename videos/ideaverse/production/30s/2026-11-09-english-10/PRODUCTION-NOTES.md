# Production notes — Ideaverse 30s english10-01 (English, lesson style)
How a maps app warns of a jam on a road that still looks clear: live speeds from phones on the road + how that road
usually flows at this hour → prediction; a sudden crash can throw it off; set a leave time in advance to compare
estimated journey times. Batch 2026-11-09-english-10 · record context/25.
- Kept: english-09 src (accepted renderer = pilot-01 engine), DOCKET, newsroom, easel card + phone props, caption pill
  (y 344–520), approved English Kokoro voice, quiet event-linked score, −15 LUFS master.
- New: `stage/traffic.js` (map card at 2x: warning on the clear road ahead + ETA jump; phone dots + speed chips → route
  lit "right now"; usual-by-hour chart, 6 pm highlighted → predicted jam; push-in to a sudden crash, ETA "34 min?";
  phone directions: Leave at… picker, 5:30 vs 6:00 estimates, ✓), `stage/cues.js`, score events.
- No numbers are spoken; on-screen times/speeds are illustrative EXAMPLE values.
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
