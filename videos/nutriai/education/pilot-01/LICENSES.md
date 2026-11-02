# Licence notes: Education Pilot 01

| Element | Origin | Licence / status |
|---|---|---|
| Animation, character "Gram", props, stage, layouts, overlay design | Original code in `source/web/` written in this session | Original work for NutriAI (Tensorblue AI) |
| 3D engine | `three@0.180.0` from the npm registry | MIT |
| `RoundedBoxGeometry` | three.js examples (`three/examples/jsm`) shipped in the same npm package | MIT |
| Headless browser | Playwright 1.63 + bundled Chromium (pre-installed in the environment) | Apache-2.0 / BSD-style |
| Fonts | Inter / Inter Display (Debian `fonts-inter` 4.0, vendored in `source/fonts/`) | SIL OFL 1.1 (see `LICENSE-Inter-debian-copyright.txt`) |
| Voice | Piper TTS `piper-tts==1.8.0` (GPL-3.0 tool, run locally) with voice `en_US-ljspeech-high` from rhasspy/piper-voices (MIT); training data LJ Speech (public domain). Pitch ×1.14 with preserved formants (FFmpeg rubberband). | Generated audio is original output; no actor/character imitation |
| Music + SFX | Synthesized from oscillators and filtered noise in `source/audio/build_audio.py` | Original (no samples) |
| Nutrition data | USDA FoodData Central SR Legacy FDC 169910 | Public domain (CC0 1.0) |
| App icon (signature) | `videos/nutriai/assets/icon.png`, approved asset in `context/03-assets.json` | NutriAI's own asset |
| Encoding | FFmpeg 6.1 (libx264, native AAC) | GPL/LGPL tool; output unencumbered |

No paid APIs, subscriptions, secrets, Blender, or third-party scripts were used. The referenced Instagram accounts were not accessed and no assets from them were used.
