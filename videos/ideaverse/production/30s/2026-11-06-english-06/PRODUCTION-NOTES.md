# Production notes — Ideaverse 30s english06-01 (English, lesson style)
Live captions can mishear numbers — check before you act. Batch 2026-11-06-english-06 · record context/21.
- Kept: feedback-05 src (accepted renderer = pilot-01 engine), DOCKET, caption pill (y 344–520), quiet event-linked score,
  −15 LUFS master. Voice: approved English Kokoro blend (af_bella 0.7 + am_puck 0.3, en-us, 0.98).
- New: `stage/livecaption.js` (bus rail + swinging straps, noise squiggles, settings toggles, live-caption typing box,
  said-vs-captioned easel card with clocks, chips, check-with-sender chat, corrected caption), `stage/cues.js`, score events.
- QA: English ASR (`src/tools/asr_check.py`, base.en; spoken numbers compared as words).
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
