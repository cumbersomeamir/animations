# Licence and provenance notes — Recall english-17

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, air dots, overlay (incl. the frame-0 title), thumbnail, audio and QA code (`web/`, `audio/mix.py`, `qa/`, `make_caption.py`) | written in this session, adapted from this app's own `2026-11-02-feedback-round` and `2026-11-15-english-16` (renderer with the explicit composite, frame-0 title, thumbnail step, x 100–900 / y 230–1500 caption checks). `buildPerson`, the English voice setup, the caption treatment, renderer, mux, score engine and loudness chain are reused | original, Recall project |
| Performer | the same original low-poly character as feedback round 01 (code identical), seated (root lowered; legs not shown) | original |
| Airliner window seat (sidewall, three-layer oval windows, shade, seats, overhead bin), sunset sky and clouds, hole marker, fog, giant window section, air dots, arrows | procedural geometry and canvas drawing in code | original; generic, unbranded (no airline or aircraft type); no imported images or models |
| Music and SFX (incl. synthesised cabin ambience and air hiss) | synthesised in `audio/mix.py` (numpy/scipy) | original |
| **English narration** | Kokoro-82M v1.0 ONNX (cached model.onnx, sha256 8fbea51e…34cb) with the established Recall voice blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; newly generated for this script | Apache-2.0 model and voices. No cloned or celebrity voice |
| English ASR check | faster-whisper 1.2.1 with Whisper base.en, local CPU | MIT; used for QA only |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/fredoka 5.3.0 | npm registry | SIL OFL 1.1 |
| Playwright 1.63 + Chromium | preinstalled, not vendored | Apache-2.0 / BSD |
| FFmpeg 6.1.1 (libx264, AAC), pdftotext and headless Chromium (source text checks) | system tools | tool use |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark, used in the end pill and the thumbnail |
| Facts | FAA AC 25.775-1; US Patent 5,988,566 (Airbus); AviationPros — see `docs/SOURCES.md` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
