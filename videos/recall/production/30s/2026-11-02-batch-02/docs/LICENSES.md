# Licence and provenance notes — Recall 30 s production 02

| item | origin | licence / status |
|---|---|---|
| Scene, overlay, physics, audio and QA code | written in this session; parts adapted from this app's own `production/30s/2026-11-02` and `education/pilot-01` | original, Recall project |
| Reused approved assets | `web/anim.js`, `clay.js`, `character.js` (Kip rig) from pilot 01; `set.js` stage, `overlay.js` caption/command/stamp/chip helpers, `render.mjs`, `audio/mix.py` groove + SFX engine, `qa/qa.py` from production 01 | original (same project) |
| Kip the clay explorer | original character (pilot 01 model sheet) | original |
| Balance, steel cube, feather sack, boxes, feathers, textures | procedural, generated in code | original; no image or model files imported |
| Music and SFX | synthesised in `audio/mix.py` (numpy/scipy) | original |
| Narration | Kokoro-82M v1.0 ONNX (onnx-community conversion of hexgrad/Kokoro-82M) run locally with kokoro-onnx 0.6.1; voice blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us; cached model reused (sha256 in context/11) | Apache-2.0 model and voice packs; generated audio is ours; no imitation of a named person or character |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/fredoka 5.3.0, @fontsource/titan-one 5.3.0 | npm registry | SIL OFL 1.1 |
| Inter (QA sheet labels only) | system package | SIL OFL 1.1 |
| Playwright 1.63.0 + Chromium | preinstalled (not vendored) | Apache-2.0 / BSD |
| FFmpeg 6.1.1 (libx264, AAC) | system tool | tool use |
| faster-whisper 1.2.1 + Whisper base.en (ASR QA only) | PyPI / Hugging Face cache | MIT |
| Recall icon | `videos/recall/assets/icon.png` (approved asset, sha256 c059d0e0…2962) | app's own mark; small end signature only |
| Microgame Frenzy STYLE.md | read-only art direction (URL in context/11) | not copied; no code, assets, names, UI or music used |
| Sources (NIST, OpenStax, FAO, IDFL, BIPM) | cited and linked in docs/SOURCES.md and publishing-caption.txt | cited only; OpenStax CC BY-NC-SA 4.0 text not reproduced |

No paid APIs, subscriptions, secrets, Blender or third-party scripts were used.
