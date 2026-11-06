# Licence notes: batch 2026-11-06-english-07
- **Visuals:** original Canvas2D code (`src/lanes.mjs`). Art direction comes from the Transit Map STYLE.md (lemomo-ai/lemo-opuscar), which was read only; nothing from it was copied or executed.
  - Phone, internet zone, lane bundle, video tiles, progress bars and speed-test card are generic code-drawn shapes. There is no app UI or screenshot, and no third-party logo or trademark artwork.
- **Palette and signature icon:** `videos/meshline/assets/icon.png` (an approved app asset).
- **Fonts:** Inter / Inter Display (OFL-1.1), from `videos/meshline/project/fonts`.
- **Voice:** Kokoro-82M ONNX (Apache-2.0), approved Meshline English blend 0.7 af_bella + 0.3 am_puck, speed 0.98, en-us, run locally. It imitates no person, and no Hindi audio is reused.
- **Music and SFX:** synthesised from scratch (`audio/mix_e7.py` plus `education/pilot-01/audio/mix.py` helpers). No samples.
- **ASR check:** faster-whisper 1.1.1 (MIT) with Systran faster-whisper-base.en (MIT), local, QA only.
- **Tools:** `@napi-rs/canvas` 1.0.11 (MIT), FFmpeg 6.1, numpy, scipy.
- **Research pages:** FCC (press-release PDF) and Measurement Lab. Only short attributed quotes appear in `research/claims.md`.
