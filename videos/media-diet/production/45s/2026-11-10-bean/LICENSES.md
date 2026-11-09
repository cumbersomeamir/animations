# Licences & provenance — Media Diet 45 s Bean physics special

| element | origin | licence / status |
|---|---|---|
| Opening footage (0–3.5 s) | user-supplied event video committed on this branch, `../../../assets/user-footage/2026-11-10-chicago-bean.mp4`, frames 180–284; baked label kept; original audio not used | supplied by the app owner for this episode |
| Paper-diorama code (`src/`, `build/`) | written in this session for Media Diet; renderer core, paper stock, lights, table/hills backdrop, English caption overlay (accepted Space Grotesk treatment), vignette and sign copied from the accepted episodes' `src/film.js` | original work for the app owner |
| Set pieces (chrome Bean built from a deformed sphere with a stylised environment map, paper plaza, generic skyline cards and trees, schematic rings/posts/slab, ruler, model block with Bean silhouette on graph paper, force arrows, crowd tiles of 100, person tokens, labels and equation cards) | three.js primitives + procedural canvas textures | original; generic shapes; not an engineering drawing; no third-party images or logos |
| App icon `../../../assets/icon.png` | approved app asset (context/03-assets.json) | Media Diet's own asset, used only on the paper sign |
| three.js 0.170.0 (linked from education/pilot-01/node_modules) | renderer, EffectComposer, BokehPass, OutputPass, PMREMGenerator | MIT |
| Fonts: Space Grotesk 5.2.10, Inter 5.2.8, IBM Plex Mono 5.2.7 (@fontsource, linked) | npm | SIL OFL 1.1 / MIT |
| Voice: kokoro-onnx 0.6.1 + Kokoro-82M v1.0 (cached), approved English blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us | local, offline | MIT / Apache-2.0; stock voices, no imitation of any person or celebrity |
| Music + foley + crowd bed | synthesized in `build/audio.py` (accepted recipe, re-timed for 45 s) | original; no samples; no audio from the source video |
| QA ASR: faster-whisper 1.1.1 + Systran/faster-whisper-medium (cached) | QA only | MIT |
| Playwright + Chromium (pre-installed), FFmpeg 6.1.1 | tools | Apache-2.0 / BSD / LGPL-GPL |

No paid APIs, Blender, secrets, third-party scripts or social publishing. Facts and quotes: SOURCES.md.
