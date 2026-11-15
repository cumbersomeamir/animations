# Licence and provenance notes — Recall english-16

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, wave-fronts, pulses, overlay (incl. the frame-0 title), thumbnail, audio and QA code (`web/`, `audio/mix.py`, `qa/`, `make_caption.py`) | written in this session, adapted from this app's own `2026-11-02-feedback-round` and `2026-11-15-english-15` (renderer with the explicit composite, legs, frame-0 title, thumbnail step, x 100–900 / y 230–1500 caption checks). `buildCafe` / `buildPerson`, the English voice setup, the caption treatment, renderer, mux, score engine and loudness chain are reused | original, Recall project |
| Café set, performer, lime phone | the same original low-poly set, character and phone as feedback round 01 (`buildPhone` gains an option to hide the holding fingertips for the giant phone); legs and shoes added at runtime as in E13; index fingers added at runtime for the payoff | original |
| Head cross-section, outer ear, cochlea, wave-fronts, bone pulses, voice-note / recorder screen | procedural geometry and canvas drawing in code | original; simplified anatomy; generic, unbranded; no imported images or models |
| Music and SFX (incl. the synthesised hum) | synthesised in `audio/mix.py` (numpy/scipy) | original |
| **English narration** | Kokoro-82M v1.0 ONNX (cached model.onnx, sha256 8fbea51e…34cb) with the established Recall voice blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; newly generated for this script | Apache-2.0 model and voices. No cloned or celebrity voice |
| English ASR check | faster-whisper 1.2.1 with Whisper base.en, local CPU | MIT; used for QA only |
| three.js 0.186.1 | npm registry | MIT |
| @fontsource/fredoka 5.3.0 | npm registry | SIL OFL 1.1 |
| Playwright 1.63 + Chromium | preinstalled, not vendored | Apache-2.0 / BSD |
| FFmpeg 6.1.1 (libx264, AAC) and headless Chromium (source text checks) | system tools | tool use |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark, used in the end pill and the thumbnail |
| Facts | Stenfelt 2011; Reinfeldt et al. 2010; Orepic et al. 2023; Stenfelt & Reinfeldt 2007; Denk et al. 2023 — see `docs/SOURCES.md` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
