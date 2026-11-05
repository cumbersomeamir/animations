# Licences & provenance — English episode english-06 (Chrome enhanced autofill from Gmail)

| element | origin | licence / status |
|---|---|---|
| Paper-diorama code (`src/`, `build/`) | written in this session for Media Diet; renderer core, paper stock, lights, table/hills backdrop, English caption overlay (accepted Space Grotesk treatment), vignette, calendar and sign copied from the accepted episodes' `src/film.js` | original work for the app owner |
| Set pieces (inbox, envelopes, magnifier, generic browser window + form, pointer, rail, tickets, U.S. map, device props, toggle and settings cards, source placard) | three.js primitives + procedural canvas textures | original; generic glyphs; no Google/Chrome/Gmail logos, interface or screenshots |
| App icon `../../../assets/icon.png` | approved app asset (context/03-assets.json) | Media Diet's own asset, used only on the paper sign |
| three.js 0.170.0 (linked from education/pilot-01/node_modules) | renderer, EffectComposer, BokehPass, OutputPass | MIT |
| Fonts: Space Grotesk 5.2.10, Inter 5.2.8, IBM Plex Mono 5.2.7 (@fontsource, linked) | npm | SIL OFL 1.1 / MIT |
| Voice: kokoro-onnx 0.6.1 + Kokoro-82M v1.0 (cached), approved English blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us | local, offline | MIT / Apache-2.0; stock voices, no imitation of any person or celebrity |
| Music + foley | synthesized in `build/audio.py` (accepted recipe, re-timed; foley dips under speech) | original; no samples |
| QA ASR: faster-whisper 1.1.1 + Systran/faster-whisper-medium (cached) | QA only | MIT |
| Playwright + Chromium (pre-installed), FFmpeg 6.1.1 | tools | Apache-2.0 / BSD / LGPL-GPL |

No paid APIs, Blender, secrets or third-party scripts. Facts come from the official Google post in SOURCES.md.
