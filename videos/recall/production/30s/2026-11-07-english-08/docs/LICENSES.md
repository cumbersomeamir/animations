# Licence and provenance notes — Recall english-08

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, infrared burst model, overlay, audio and QA code (`web/`, `audio/mix.py`, `qa/`, `make_caption.py`) | written in this session, adapted from this app's own `2026-11-02-feedback-round`, `2026-11-06-english-06` and `2026-11-06-english-07`. `buildCafe` / `buildPerson` / `buildPhone`, the English voice setup, the caption treatment, renderer, mux, score engine and loudness chain are reused | original, Recall project |
| Café set, performer, lime phone | the same original low-poly set, character and phone as feedback round 01 (code identical) | original |
| TV remote, batteries, counter TV, giant spectrum column, giant remote, pulse rings, TV receiver, camera sensor, giant eye, camera-preview and TV screens | procedural geometry and canvas drawing in code | original; generic, unbranded; the camera preview and TV picture are original minimal designs, not any real product's interface; no imported images or models |
| Music and SFX | synthesised in `audio/mix.py` (numpy/scipy) | original |
| **English narration** | Kokoro-82M v1.0 ONNX (cached model.onnx, sha256 8fbea51e…34cb) with the established Recall voice blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 (same as F01 / R02); newly generated for this script (no Hindi or earlier audio reused) | Apache-2.0 model and voices. No cloned or celebrity voice |
| English ASR check | faster-whisper 1.2.1 with Whisper base.en, local CPU | MIT; used for QA only |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/fredoka 5.3.0 | npm registry | SIL OFL 1.1 |
| Playwright 1.63 + Chromium | preinstalled, not vendored | Apache-2.0 / BSD |
| FFmpeg 6.1.1 (libx264, AAC), poppler pdftotext and headless Chromium (source text checks) | system tools | tool use |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark, used in the end pill |
| Facts | NASA Science, Samsung Support, Vishay TSOP382 datasheet, US8237121B2; see `docs/SOURCES.md` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
