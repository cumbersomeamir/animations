# Licence notes: store-and-forward episode (2026-11-03)
- **Visuals:** original Canvas2D code (`src/sf.mjs`). Art direction comes from the Transit Map STYLE.md (lemomo-ai/lemo-opuscar), which was read only; nothing from it was copied or executed.
- **Palette and signature icon:** `videos/meshline/assets/icon.png` (an approved app asset).
- **Fonts:** Inter / Inter Display (OFL-1.1), from `videos/meshline/project/fonts`.
- **Voice:** Kokoro-82M ONNX (Apache-2.0), run locally. Meshline blend 0.7 af_bella + 0.3 am_puck, speed 0.98.
- **Music and SFX:** synthesised from scratch (`audio/mix_sf.py` plus `education/pilot-01/audio/mix.py` helpers). No samples.
- **ASR check:** faster-whisper 1.1.1 (MIT) with the Systran faster-whisper-base.en model (MIT), run locally for QA only.
- **Tools:** `@napi-rs/canvas` 1.0.11 (MIT), FFmpeg 6.1, numpy, scipy.
- **Research pages:** IETF/IRTF RFCs (rfc-editor.org) and NASA (public US government page). Only short attributed quotes appear in `research/claims.md`.
