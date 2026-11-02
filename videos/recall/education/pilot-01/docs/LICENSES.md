# Licence notes — Educational Pilot 01

| item | origin | licence / status |
|---|---|---|
| All scene code (`web/*.js`, `render.mjs`), audio code (`audio/*.py`), QA code | written in this session | original, Recall project |
| Kip the clay explorer (design, rig, model sheet) | created in this session | original character for Recall |
| 3D models, clay textures, water, toy ship, props | generated procedurally in code | original; no image/model assets imported |
| Music | synthesised in `audio/mix.py` (numpy/scipy) | original |
| Sound effects | synthesised in `audio/mix.py` | original |
| Narration | Kokoro-82M v1.0 ONNX (onnx-community conversion of hexgrad/Kokoro-82M), run locally via `kokoro-onnx` 0.6.1; style = 0.6 af_heart + 0.4 bf_emma | Apache-2.0 model and voice packs; generated audio is ours; no named-person/character imitation |
| three.js 0.186.1 | npm registry | MIT |
| Fredoka font (`@fontsource/fredoka` 5.3.0) | npm registry | SIL OFL 1.1 |
| Inter font (QA contact-sheet labels only) | system package | SIL OFL 1.1 |
| Playwright 1.63.0 + Chromium | preinstalled in the environment (not vendored) | Apache-2.0 / BSD |
| FFmpeg 6.1.1 with libx264, AAC | system tool | LGPL/GPL tool use; output not encumbered |
| faster-whisper 1.2.1 + Whisper base.en (QA only) | PyPI / Hugging Face (Systran) | MIT |
| Recall icon (`videos/recall/assets/icon.png`) | saved public Google Play listing snapshot, Oct 2026 (approved asset, sha256 c059d0e0…2962) | app's own mark; used only as the small end signature |

No paid APIs, subscriptions, secrets, Blender or third-party installer scripts were used. The user's Instagram
references were not accessed and no character, script, logo, asset, voice or palette was taken from them.
