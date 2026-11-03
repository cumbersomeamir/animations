# Licences & provenance — Hindi episode hindi-03 (iOS 27.2 · SynthID watermark)

| element | origin | licence / status |
|---|---|---|
| Paper-diorama code (`src/`, `build/`) | written in this session for Media Diet; renderer core, paper stock, lights, table/hills backdrop, caption overlay, vignette, "?" tag and sign copied unchanged from the accepted feedback-round `src/film.js` | original work for the app owner |
| Set pieces (desk mat, easels, printed pictures, calendar, phone prop, sparkles, stamp, magnifier, phone row, laptop, picture copies, sign) | three.js primitives + procedural canvas textures | original; generic devices and invented screen glyphs; no Apple/Google logos, product images, interface or screenshots |
| App icon `../../../assets/icon.png` | approved app asset (context/03-assets.json) | Media Diet's own asset, used only on the paper sign |
| three.js 0.170.0 (linked from education/pilot-01/node_modules) | renderer, EffectComposer, BokehPass, OutputPass | MIT |
| Fonts: Space Grotesk 5.2.10, Inter 5.2.8, IBM Plex Mono 5.2.7 (@fontsource, linked); **Noto Sans Devanagari 5.3.0** (@fontsource, installed into `.cache/npmfont`, linked) | npm | SIL OFL 1.1 / MIT |
| Voice: kokoro-onnx 0.6.1 + Kokoro-82M v1.0 (cached `.cache/models`), **native Hindi stock voices hf_alpha 0.7 + hm_omega 0.3**, speed 1.08, lang `hi` (espeak-ng Hindi phonemes via espeakng-loader 0.2.4 / phonemizer 3.4.0) | local, offline | MIT (engine) / Apache-2.0 (weights) / GPL-3.0 (espeak-ng data, used as a library); stock-voice blend, not a clone of any person or celebrity |
| Music + foley | synthesized in `build/audio.py` (accepted recipe, re-timed) | original; no samples |
| QA ASR: faster-whisper 1.1.1 + Systran/faster-whisper-medium (multilingual, cached) | QA only | MIT |
| Playwright + Chromium (pre-installed), FFmpeg 6.1.1 | tools | Apache-2.0 / BSD / LGPL-GPL |

No paid APIs, Blender, secrets or third-party scripts. Facts come from the official Apple and Google pages in SOURCES.md.
