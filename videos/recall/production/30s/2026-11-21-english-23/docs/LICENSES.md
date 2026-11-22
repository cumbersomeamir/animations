# Licence and provenance notes — Recall english-23

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, particles and rays, overlay (incl. the frame-0 title), thumbnail, audio and QA code (`web/`, `audio/mix.py`, `qa/`, `make_caption.py`, `make_timeline.py`) | written in this session, adapted from this app's own E22 folder (`2026-11-19-english-22`: renderer with the explicit composite, café, performer with E13 legs, caption pill, frame-0 title, thumbnail step, QA scripts, score engine and loudness chain), which itself builds on feedback round 01 and E10–E21 | original, Recall project |
| Café set, performer | the same original low-poly set and character as feedback round 01 (code identical); the coffee cup is hidden; legs/shoes at runtime as in E13 | original |
| Ceiling, smoke alarm, toaster with toast, kettle, broom, giant optical chamber (`web/smoke.js`) | procedural geometry in code | original; generic, unbranded; not any maker's alarm or chamber; no imported images or models |
| Music and SFX (incl. softened alarm beeps, toaster clunk, hiss, shimmer, pings) | synthesised in `audio/mix.py` (numpy/scipy) | original |
| **English narration** | Kokoro-82M v1.0 ONNX (cached model.onnx, sha256 8fbea51e…34cb) with the established Recall voice blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; newly generated for this script | Apache-2.0 model and voices; no cloned or celebrity voice |
| English ASR check | faster-whisper 1.2.1 with Whisper base.en, local CPU | MIT; QA only |
| three.js 0.186.1, @fontsource/fredoka 5.3.0 | npm registry | MIT / SIL OFL 1.1 |
| Playwright 1.63 + Chromium, FFmpeg 6.1.1 | preinstalled system tools | Apache-2.0 / BSD; tool use |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark (end pill, thumbnail) |
| Facts | US EPA (archived), Nebraska State Fire Marshal, USFA — see `docs/SOURCES.md` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
