# Licences & provenance — Hindi episode hindi-04 (Play Protect reminder)

| element | origin | licence / status |
|---|---|---|
| Paper-diorama code (`src/`, `build/`) | written in this session for Media Diet; renderer core, paper stock, lights, table/hills backdrop, Devanagari caption overlay, vignette, calendar, "?" tag and sign copied from the accepted hindi-03 / feedback-round `src/film.js` | original work for the app owner |
| Set pieces (big paper phone, printed screen, switch knob, app tiles, conveyor, shield gate, radar, warning tag, bin, clock, reminder card, settings sheet) | three.js primitives + procedural canvas textures | original; generic glyphs; no Google/Play logos, icons, interface or screenshots |
| App icon `../../../assets/icon.png` | approved app asset (context/03-assets.json) | Media Diet's own asset, used only on the paper sign |
| three.js 0.170.0 (linked from education/pilot-01/node_modules) | renderer, EffectComposer, BokehPass, OutputPass | MIT |
| Fonts: Space Grotesk 5.2.10, Inter 5.2.8, IBM Plex Mono 5.2.7, Noto Sans Devanagari 5.3.0 (@fontsource, linked) | npm | SIL OFL 1.1 / MIT |
| Voice: kokoro-onnx 0.6.1 + Kokoro-82M v1.0 (cached), native Hindi stock voices hf_alpha 0.7 + hm_omega 0.3, speed 1.08, lang `hi` (espeak-ng Hindi phonemes) | local, offline | MIT / Apache-2.0 / GPL-3.0 (espeak-ng data as a library); stock voices, not a clone of any person |
| Music + foley | synthesized in `build/audio.py` (accepted recipe, re-timed) | original; no samples |
| QA ASR: faster-whisper 1.1.1 + Systran/faster-whisper-medium (cached) | QA only | MIT |
| Playwright + Chromium (pre-installed), FFmpeg 6.1.1 | tools | Apache-2.0 / BSD / LGPL-GPL |

No paid APIs, Blender, secrets or third-party scripts. Facts come from the official Google pages in SOURCES.md.
