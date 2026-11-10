# Production notes — Ideaverse 30s english11-01 (English, lesson style)
How a phone names a song you can only hum: Search a song in the Google app, hum 10–15 s; the hum becomes the melody's
shape and is compared with songs (no perfect pitch needed); the top match can be wrong, so play a few seconds of each.
Batch 2026-11-09-english-11 · record context/26.
- Kept: english-10 src (accepted renderer = pilot-01 engine), DOCKET, newsroom, easel card + phone props, caption pill
  (y 344–520), approved English Kokoro voice, quiet event-linked score, −15 LUFS master.
- New: `stage/humsearch.js` (hook: DOCKET hums an original tune, notes fly onto a staff card, blank lyrics + "?"; phone:
  Search a song tap, listening ring with 10/15 s marks; card: wobbly hum → melody shape → compared with three fictional
  songs, higher pitch with the same shape; likely matches with the top one ringed; phone: play #1 "not it", play #2
  "that's it"), `stage/cues.js` (incl. hum note times shared by picture + score), score events.
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
