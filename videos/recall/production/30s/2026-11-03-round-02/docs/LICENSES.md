# Licence and provenance notes — Recall round 02

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, heat illustration, overlay, audio and QA code (`web/`, `audio/mix.py`, `qa/`) | written in this session, adapted from this app's own `2026-11-02-feedback-round`. `buildCafe` / `buildPerson` (set and performer), `overlay.js` caption treatment, `render.mjs`, `mux.sh`, `build.sh`, `audio/tts.py`, the score engine and loudness chain are reused unchanged | original, Recall project |
| Café set and performer | the same original low-poly set and character as feedback round 01 | original |
| Microwave, bowl, spoon, steam, giant cutaway cavity | procedural geometry and canvas textures generated in code | original; no image or 3D-model files imported; generic appliance with no brand |
| Music and SFX | synthesised in `audio/mix.py` (numpy/scipy) | original |
| Narration | Kokoro-82M v1.0 ONNX run locally with kokoro-onnx 0.6.1, using the cached model from `education/pilot-01/audio/.cache/kokoro` (sha256 re-verified). Voice blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us | Apache-2.0 model and voice packs. The generated audio is ours. No imitation of a named person or character |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/fredoka 5.3.0 | npm registry | SIL OFL 1.1 |
| Playwright 1.63 + Chromium | preinstalled, not vendored | Apache-2.0 / BSD |
| FFmpeg 6.1.1 (libx264, AAC) | system tool | tool use |
| faster-whisper + Whisper base.en (ASR QA only) | PyPI / Hugging Face cache | MIT |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark, used in the end pill |
| Facts | FDA, TU Delft ShowingPhysics (CC BY-NC 4.0, cited, not reproduced), Clemson HGIC; see `docs/SOURCES.md` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
