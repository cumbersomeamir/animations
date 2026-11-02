# License & provenance notes — Education Pilot 01

| Element | Origin | License / status |
|---|---|---|
| All 3D geometry, characters (Tally, courier, recipient), diorama, props, textures, captions layout | Written in this repo (`src/`) — procedural three.js primitives | Original work for Help (Tensorblue). No third-party models/textures/footage. |
| Music cue (96 BPM, D major) | Composed & synthesized in `audio/mix.py` (numpy) | Original, code-generated; no samples or loops. |
| Sound effects (beeps, whooshes, ticks, thumps, paper, chime) | Synthesized in `audio/mix.py` from noise/sine primitives (fixed seed) | Original, code-generated. |
| Narration voice (Tally) | Piper TTS voice `en_US-ljspeech-medium` from [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices) (repo license MIT; model card: dataset **LJ Speech, public domain**), synthesized locally, then pitch −1 semitone (formants preserved) + EQ/compression via FFmpeg rubberband | Voice model MIT / public-domain training data. Not a clone or imitation of any actor or named character. Takes used are committed in `audio/generated/voice/` (Piper sampling is stochastic). Model SHA-256 `6f52a751…b87f22`. |
| piper-tts 1.3.0 (PyPI) | Synthesis tool | GPL-3.0-or-later (tool only; not distributed with the video). |
| three.js 0.170.0 (npm) | Renderer library | MIT. |
| Playwright 1.63.0 + bundled Chromium headless shell | Pre-installed in the environment; used to drive frame capture | Apache-2.0 / BSD (tooling only). |
| FFmpeg 6.1.1 (libx264, AAC, rubberband, loudnorm) | System package | LGPL/GPL build (tooling only). |
| Inter / Inter Display fonts (`fonts/`) | Debian `fonts-inter` 4.0+ds-1 | SIL OFL 1.1 — license text in `fonts/OFL-1.1-Inter.txt`. |
| App icon (`../../assets/icon.png`) | Approved asset per `context/03-assets.json` (SHA-256 `0646d82d…eebd4`) | App's own asset, used only as the small end signature. |
| Vosk 0.3.45 + `vosk-model-small-en-us-0.15` | QA-only offline speech recognition (intelligibility check), kept in scratch, not committed | Apache-2.0. |

No paid APIs, subscriptions, credentials, Blender, or unreviewed third-party scripts were used. The reference Instagram accounts
were not accessed and nothing from them was used.
