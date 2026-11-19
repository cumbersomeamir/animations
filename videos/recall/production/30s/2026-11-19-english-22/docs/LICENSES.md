# Licence and provenance notes — Recall english-22

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, accelerometer motion, overlay (incl. the frame-0 title), thumbnail, audio and QA code (`web/`, `audio/mix.py`, `qa/`, `make_caption.py`) | written in this session, adapted from this app's own `2026-11-02-feedback-round`, `2026-11-15-english-15` (café legs), `2026-11-09-english-10` (phone held in the hand, POV framing), `2026-11-18-english-21` (arrows, preview fixes) and `2026-11-17-english-20` (renderer with the explicit composite, frame-0 title, thumbnail step, x 100–900 / y 230–1500 caption checks, label clamp at y 1410). `buildPerson`, the English voice setup, the caption treatment, renderer, mux, score engine and loudness chain are reused | original, Recall project |
| Café set, performer | the same original low-poly set and character as feedback round 01 (code identical); legs and shoes added at runtime as in E13 | original |
| Giant MEMS accelerometer die (proof mass, serpentine springs, comb fingers, plates, anchors), circuit board, gravity arrows, bedroom, generic reading-app screen and rotation-lock icon (`web/screen.js`) | procedural geometry and canvas drawing in code | original; generic, unbranded; not any vendor's chip layout, UI or icon; no imported images or models |
| Music and SFX (incl. synthesised spring boings, swishes, UI clicks, blips) | synthesised in `audio/mix.py` (numpy/scipy) | original |
| **English narration** | Kokoro-82M v1.0 ONNX (cached model.onnx, sha256 8fbea51e…34cb) with the established Recall voice blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; newly generated for this script | Apache-2.0 model and voices. No cloned or celebrity voice |
| English ASR check | faster-whisper 1.2.1 with Whisper base.en, local CPU | MIT; used for QA only |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/fredoka 5.3.0 | npm registry | SIL OFL 1.1 |
| Playwright 1.63 + Chromium | preinstalled, not vendored | Apache-2.0 / BSD |
| FFmpeg 6.1.1 (libx264, AAC), pdftotext and headless Chromium (source text checks) | system tools | tool use |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark, used in the end pill and the thumbnail |
| Facts | NXP AN3461; Agliolo Gallitto & Lupo, arXiv:1507.02224; Android Developers sensor docs; Apple Support 118226 — see `docs/SOURCES.md` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
