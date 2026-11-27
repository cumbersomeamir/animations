# Licence and provenance notes — Recall english-24

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, particles and rays, overlay (incl. the frame-0 title), thumbnail, audio and QA code (`web/`, `audio/mix.py`, `qa/`, `make_caption.py`, `make_timeline.py`) | written in this session, adapted from this app's own E23 folder (`2026-11-21-english-23`, itself from E22: renderer with the explicit composite, café, performer with E13 legs, caption pill, frame-0 title, thumbnail step, QA scripts, score engine and loudness chain) and E10's wave ribbon | original, Recall project |
| Café set, performer | the same original low-poly set and character as feedback round 01 (code identical); the coffee cup is hidden; legs/shoes at runtime as in E13 | original |
| Counter microwave | this app's own round 02 / english-11 builder, extended with a perforated metal screen (canvas texture), a mug and a power strip | original |
| Perforated door screen, mug, power strip + plug, giant door cut-away (sheet, wave ribbons, rulers, light rays, gap) (`web/door.js`) | procedural geometry and canvas textures in code | original; generic, unbranded; no imported images or models |
| Music and SFX (incl. oven hum, ruler ticks, metal thunk, bounce, shimmer, door creak, plug clunk) | synthesised in `audio/mix.py` (numpy/scipy) | original |
| **English narration** | Kokoro-82M v1.0 ONNX (cached model.onnx, sha256 8fbea51e…34cb) with the established Recall voice blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; newly generated for this script | Apache-2.0 model and voices; no cloned or celebrity voice |
| English ASR check | faster-whisper 1.2.1 with Whisper base.en, local CPU | MIT; QA only |
| three.js 0.186.1, @fontsource/fredoka 5.3.0 | npm registry | MIT / SIL OFL 1.1 |
| Playwright 1.63 + Chromium, FFmpeg 6.1.1 | preinstalled system tools | Apache-2.0 / BSD; tool use |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark (end pill, thumbnail) |
| Facts | HyperPhysics (GSU), NASA Science, U.S. FDA, 21 CFR 1030.10 — see `docs/SOURCES.md` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
