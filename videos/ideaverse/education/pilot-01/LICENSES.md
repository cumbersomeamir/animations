# Licenses and provenance — Pilot 01

| Item | Source | License / status |
|---|---|---|
| All animation, character (DOCKET), props, stage, choreography, camera | Original code in src/ (this session) | Created for Ideaverse; no third-party assets |
| Music + SFX | Synthesized from code in src/music/score.mjs (no samples) | Original |
| Narration voice | Piper TTS `piper-tts` 1.8.0 (PyPI, GPL-3.0 software; output audio not covered) with voice `en_US-ljspeech-high` from huggingface.co/rhasspy/piper-voices (repo license MIT; trained on the LJ Speech dataset, public domain). Processed with FFmpeg (rubberband pitch/formant, comb, EQ, compression) into DOCKET's voice | Usable; selected takes committed in src/narration/wav |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/space-grotesk 5.3.0 | npm registry | SIL OFL 1.1 (font) |
| @fontsource/jetbrains-mono 5.3.0 | npm registry | SIL OFL 1.1 (font) |
| Ideaverse icon | videos/ideaverse/assets/icon.png (approved app asset, 03-assets.json) | App's own asset (signature only) |
| Renderer | Preinstalled Playwright 1.63.0 + Chromium (SwiftShader WebGL2), FFmpeg 6.1.1 | Tools only |
| QA-only | faster-whisper base.en (ASR intelligibility check; not shipped) | Tool only |
| Skill references | kinetic-reel (github.com/tuzhechen2005/opus-video-skills) docs read; no scripts executed or copied | Method reference only |
