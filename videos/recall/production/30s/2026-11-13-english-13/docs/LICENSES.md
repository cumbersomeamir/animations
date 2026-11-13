# Licence and provenance notes — Recall english-13

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, arrows, overlay, thumbnail, audio and QA code (`web/`, `audio/mix.py`, `qa/`, `make_caption.py`) | written in this session, adapted from this app's own `2026-11-02-feedback-round` and `2026-11-09-english-11` (renderer with the explicit composite). `buildCafe` / `buildPerson`, the English voice setup, the caption treatment, renderer, mux, score engine and loudness chain are reused | original, Recall project |
| Café set, performer | the same original low-poly set and character as feedback round 01 (code identical); simple legs and shoes are added at runtime in `main.js` (the shared rig is unchanged) | original |
| Elevator car, bathroom scale and its display, floor indicator, shaft with numbered floors, force arrows, payoff graph, thumbnail | procedural geometry and canvas drawing in code | original; generic, unbranded; no imported images or models |
| Music and SFX | synthesised in `audio/mix.py` (numpy/scipy) | original |
| **English narration** | Kokoro-82M v1.0 ONNX (cached model.onnx, sha256 8fbea51e…34cb) with the established Recall voice blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 (same as F01 / R02 / E06–E11); newly generated for this script | Apache-2.0 model and voices. No cloned or celebrity voice |
| English ASR check | faster-whisper 1.2.1 with Whisper base.en, local CPU | MIT; used for QA only |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/fredoka 5.3.0 | npm registry | SIL OFL 1.1 |
| Playwright 1.63 + Chromium | preinstalled, not vendored | Apache-2.0 / BSD |
| FFmpeg 6.1.1 (libx264, AAC) and headless Chromium (source text checks) | system tools | tool use |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark, used in the end pill and the thumbnail |
| Facts | OpenStax *College Physics 2e* §4.7, OpenStax *University Physics Vol. 1* §5.4, NIST "SI Units – Mass"; see `docs/SOURCES.md` | cited only (OpenStax: CC BY 4.0) |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
