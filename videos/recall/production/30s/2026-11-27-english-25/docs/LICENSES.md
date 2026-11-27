# Licence and provenance notes — Recall english-25

| item | origin | licence / status |
|---|---|---|
| Scene, props, choreography, overlay (incl. the frame-0 title), thumbnail, audio and QA code (`web/`, `audio/mix.py`, `qa/`, `make_caption.py`, `make_timeline.py`) | written in this session, adapted from this app's own E24 folder (`2026-11-23-english-24`, from E23/E22: renderer with the explicit composite, café, performer with E13 legs, caption pill, frame-0 title, thumbnail step, QA scripts, score engine and loudness chain) and E10's ribbon | original, Recall project |
| Café set, performer | the same original low-poly set and character as feedback round 01 (code identical); the coffee cup is hidden; legs/shoes at runtime as in E13 | original |
| Pencil case, giant zipper cut-away (teeth with bumps and hollows, tapes, slider with Y channel, wedge, cover, pull tab, lock catch), nest demo (`web/zip.js`) | procedural geometry in code | original; generic, unbranded; not any maker's slider; no imported images or models |
| Music and SFX (incl. zipper ratchets, cover whoosh, ticks, nesting clacks, strain thunk, lock click) | synthesised in `audio/mix.py` (numpy/scipy) | original |
| **English narration** | Kokoro-82M v1.0 ONNX (cached model.onnx, sha256 8fbea51e…34cb) with the established Recall voice blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; newly generated for this script | Apache-2.0 model and voices; no cloned or celebrity voice |
| English ASR check | faster-whisper 1.2.1 with Whisper base.en, local CPU | MIT; QA only |
| three.js 0.186.1, @fontsource/fredoka 5.3.0 | npm registry | MIT / SIL OFL 1.1 |
| Playwright 1.63 + Chromium, FFmpeg 6.1.1 | preinstalled system tools | Apache-2.0 / BSD; tool use |
| Recall icon | `videos/recall/assets/icon.png`, approved asset (sha256 c059d0e0…2962) | the app's own mark (end pill, thumbnail) |
| Facts | US Patent 1,219,881 (Sundback, via Google Patents), YKK Americas — see `docs/SOURCES.md` | cited only |

No paid APIs, subscriptions, secrets, Blender or unreviewed third-party scripts were used.
