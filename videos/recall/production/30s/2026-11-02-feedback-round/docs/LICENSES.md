# Licence and provenance notes — Recall feedback-round 01

| item | origin | licence / status |
|---|---|---|
| Scene, characters, props, choreography, overlay, audio and QA code (`web/`, `audio/mix.py`, `qrdata/make_qr.py`, `qa/qa.py`) | written in this session. `render.mjs`, `mux.sh`, `build.sh`, `audio/tts.py`, the loudness/limiter code in `audio/mix.py` and the `qa/qa.py` skeleton are adapted from this app's own `2026-11-02-batch-02` | original, Recall project |
| Café set, phone, table card, giant QR, low-poly person | procedural geometry and canvas textures generated in code | original. No image or 3D-model files were imported. The person is an original character |
| QR matrix | generated with segno 1.6.6 (BSD-3-Clause) from our own text "HELLO FROM RECALL" | generated data. "QR Code" is a registered trademark of DENSO WAVE INCORPORATED |
| zxing-cpp 2.3.0 (QA decode only) | PyPI | Apache-2.0 |
| Music and SFX | synthesised in `audio/mix.py` (numpy/scipy) | original |
| Narration | Kokoro-82M v1.0 ONNX run locally with kokoro-onnx 0.6.1, using the cached model from `education/pilot-01/audio/.cache/kokoro`. Voice blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us | Apache-2.0 model and voice packs. The generated audio is ours. No imitation of a named person or character |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/fredoka 5.3.0 | npm registry | SIL OFL 1.1 |
| Playwright 1.63 + Chromium | preinstalled, not vendored | Apache-2.0 / BSD |
| FFmpeg 6.1.1 (libx264, AAC) | system tool | tool use |
| faster-whisper + Whisper base.en (ASR QA only) | PyPI / Hugging Face cache | MIT |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark. Used as the logo printed in the QR and on the end pill |
| Style reference (agentpoly CAPTCHA short, Instagram) | named by the user as craft reference. I did not view it | not copied. No character, set, script, plot, audio or footage from it was used |
| Facts | DENSO WAVE qrcode.com pages, cited in `docs/SOURCES.md` and `publishing-caption.txt` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
