# Licences & provenance — feedback-round episode (warehouse robot / lidar)

| element | origin | licence / status |
|---|---|---|
| Paper-diorama code (`src/`, `build/`) | written in this session for Media Diet | original work for the app owner |
| All set pieces (warehouse, racks, boxes, robot, crate, satellite cut-out, map sheet, path strips, sign) | built from three.js primitives + procedural canvas textures (paper grain, map print) | original; generic robot not modelled on any product; no product images or logos |
| App icon `../../../assets/icon.png` | approved app asset (context/03-assets.json) | Media Diet's own asset, used only on the paper sign |
| three.js 0.170.0 (npm; linked from education/pilot-01/node_modules) | renderer, EffectComposer, BokehPass, OutputPass | MIT |
| Fonts: Space Grotesk 5.2.10, Inter 5.2.8, IBM Plex Mono 5.2.7 (@fontsource, linked from production/30s/2026-11-02) | npm | SIL OFL 1.1 / MIT |
| Voice: kokoro-onnx 0.6.1 + Kokoro-82M v1.0 (cached `.cache/models`, sha256 in context/11), blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us | local, offline | MIT (engine) / Apache-2.0 (weights); stock-voice blend, no imitation of any person/character |
| Music + foley | synthesized in `build/audio.py` | original; no samples |
| QA ASR: faster-whisper 1.1.1 + Systran/faster-whisper-base.en (cached) | QA only | MIT |
| Playwright 1.63 + Chromium (pre-installed), FFmpeg 6.1.1 | tools | Apache-2.0 / BSD / LGPL-GPL |

Reference post (https://www.instagram.com/p/DfOg0TEDoTk/) informed the craft direction only via the user's description;
no frames, characters, story or assets from it are used. No paid APIs, Blender, secrets or third-party scripts.
