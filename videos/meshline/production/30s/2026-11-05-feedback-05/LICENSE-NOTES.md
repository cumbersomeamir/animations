# Licence notes: batch 2026-11-05-feedback-05
- **Visuals:** original Canvas2D code (`src/wall.mjs`). Art direction comes from the Transit Map STYLE.md (lemomo-ai/lemo-opuscar), which was read only; nothing from it was copied or executed.
  - Floor plan, wall hatch, phone, headphones, router, tower and check stamp are generic code-drawn shapes. There is no OS or app UI, no Bluetooth logo and no trademark artwork; "ब्लूटूथ" appears only as a word.
- **Palette and signature icon:** `videos/meshline/assets/icon.png` (an approved app asset). The Latin "Meshline" wordmark is set in Inter.
- **Fonts:** Noto Sans Devanagari Bold/SemiBold/Medium (OFL-1.1, notofonts; files and `OFL.txt` in `fonts/`), with Inter / Inter Display (OFL-1.1) as the Latin fallback.
- **Voice:** Kokoro-82M ONNX (Apache-2.0), Hindi-trained voice `hf_beta`, local kokoro-onnx 0.6.1. Phonemes come from espeak-ng `hi` (GPL-3.0, a local tool, not redistributed). It imitates no person and is not the English blend.
- **Music and SFX:** synthesised from scratch (`audio/mix_f5.py` plus `education/pilot-01/audio/mix.py` helpers). No samples.
- **ASR checks:** faster-whisper 1.1.1 (MIT) with Systran faster-whisper-medium (MIT), local, for QA only.
- **Tools:** `@napi-rs/canvas` 1.0.11 (MIT), FFmpeg 6.1, numpy, scipy.
- **Research pages:** Bluetooth SIG and T-Mobile. Only short attributed quotes appear in `research/claims.md`.
