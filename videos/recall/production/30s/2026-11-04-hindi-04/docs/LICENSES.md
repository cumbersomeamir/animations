# Licence and provenance notes — Recall Hindi 04

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, overlay, audio and QA code (`web/`, `audio/mix.py`, `audio/asr_words.py`, `qa/`) | written in this session, adapted from this app's own `2026-11-02-feedback-round`, `2026-11-03-round-02` and `2026-11-03-hindi-03`. `buildCafe` / `buildPerson`, the Hindi voice setup, the caption treatment, renderer, mux, score engine and loudness chain are reused | original, Recall project |
| Café set, performer | the same original low-poly set and character as feedback round 01 (code identical) | original |
| Induction plate, steel patila, aluminium pan, fridge magnet, steam, giant induction cutaway | procedural geometry in code | original; generic unbranded appliance; no imported images or models |
| Music and SFX | synthesised in `audio/mix.py` (numpy/scipy) | original |
| **Hindi narration** | Kokoro-82M v1.0 ONNX (cached model.onnx, sha256 8fbea51e…34cb) with Kokoro v1.0's **official Hindi voice packs** hf_beta (0.7) + hm_omega (0.3), lang `hi`, speed 0.98 (CTA line 1.05), voice packs reused from Hindi 03 (same sha256). Hindi grapheme-to-phoneme by espeak-ng (bundled with espeakng-loader). Voice packs from onnx-community/Kokoro-82M-v1.0-ONNX, sha256-checked in `audio/fetch_models.sh` | Apache-2.0 model and voices; espeak-ng GPL-3.0 (used as a tool, not distributed here). No English voice was fed Hindi text. No cloned or celebrity voice |
| Hindi ASR check | faster-whisper 1.2.1 with Whisper **medium** (multilingual), Systran conversion, local CPU | MIT; used for QA only |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/baloo-2 5.3.0 (Devanagari + Latin), @fontsource/fredoka 5.3.0 | npm registry | SIL OFL 1.1 |
| Playwright 1.63 + Chromium | preinstalled, not vendored | Apache-2.0 / BSD |
| FFmpeg 6.1.1 (libx264, AAC) | system tool | tool use |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark, used in the end pill |
| Facts | EPRI "Commercial Induction Cooktops" (2024), GE Appliances support; see `docs/SOURCES.md` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
