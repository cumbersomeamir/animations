# Production notes — Ideaverse 30s english08-01 (English, lesson style)
How a phone fakes background blur (portrait mode): AI person mask + depth estimate → software blur by distance;
mistakes at frizzy hair / sunglasses; blur can be turned down or off afterwards. Batch 2026-11-07-english-08 · record context/23.
- Kept: english-07 src (accepted renderer = pilot-01 engine), DOCKET, newsroom, easel card + phone props, caption pill
  (y 344–520), approved English Kokoro voice, quiet event-linked score, −15 LUFS master.
- New: `stage/portrait.js` (blur sweep hook, lens ring + "TINY LENS", flip to ORIGINAL, AI trace → person mask, depth
  layers near→far + legend, per-depth blur + meters + bokeh, close-up rings on the two mistakes + dashed edge check,
  phone edit screen: blur layer lifts off, slider down, portrait effect off/on), `stage/cues.js`, score events.
- renderAt now positions the camera before the stage (the "?" label billboards to the same frame's camera).
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
