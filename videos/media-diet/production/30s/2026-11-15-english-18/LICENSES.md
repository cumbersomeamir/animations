# Licences & provenance — Media Diet 30 s English episode 17 ("No joints. Just tension.")

| element | origin | licence / status |
|---|---|---|
| Paper-diorama code (`src/`, `build/`) | written in this session for Media Diet; renderer core, paper stock, lights, table/hills backdrop, English caption overlay (accepted Space Grotesk treatment), vignette, caption auto-fit, label helper and sign copied from the accepted english-12…17 `src/film.js` | original work for the app owner |
| Set pieces (generic paper hoverboard — pink shell, two rotors of 12 red/blue magnet blocks — not a replica of the creator's board; brushed copper plate with a neutral RoomEnvironment reflection map on the copper material only, schematic eddy-current loops and arrows, paper 6 kg weight, paving slabs, labels) | three.js primitives + procedural canvas textures | original; no third-party images, footage, photos or logos (none of the creator's footage or photos) |
| App icon `../../../assets/icon.png` | approved app asset (context/03-assets.json) | Media Diet's own asset, used only on the paper sign |
| three.js 0.170.0 (linked from education/pilot-01/node_modules) | renderer, EffectComposer, BokehPass, OutputPass, PMREMGenerator | MIT |
| Fonts: Space Grotesk 5.2.10, Inter 5.2.8, IBM Plex Mono 5.2.7 (@fontsource, linked) | npm | SIL OFL 1.1 / MIT |
| Voice: kokoro-onnx 0.6.1 + Kokoro-82M v1.0 (cached), approved English blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us | local, offline | MIT / Apache-2.0; stock voices, no imitation of any person |
| Music + foley | synthesized in `build/audio.py` (accepted recipe, re-timed for this episode) | original; no samples |
| QA ASR: faster-whisper 1.1.1 + Systran/faster-whisper-medium (cached) | QA only | MIT |
| Playwright + Chromium (pre-installed), FFmpeg 6.1.1 | tools | Apache-2.0 / BSD / LGPL-GPL |

No paid APIs, Blender, secrets, third-party scripts or social publishing. Facts, calculations and assumptions: SOURCES.md.
