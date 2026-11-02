# License and provenance notes: pilot 01

| Item | Origin | License / status | Distributed in repo? |
|---|---|---|---|
| Scene, rig, choreography, audio and QA code (`src/`, `audio/*.py`, `tools/`) | Written in this session | Project code (repository terms) | Yes |
| Tinku character design and rig | Original, created in this session | Project asset | Yes |
| Music + SFX (`audio/stems/`) | Synthesized from scratch in `audio/synth.py` (sines, noise, Karplus-Strong; fixed seed); no samples | Original | Yes |
| Narration WAVs (`audio/narration/`) | Generated with Piper TTS 1.8.0 from the `en_US-kristin-medium` voice, then pitch/formant + tin-resonance treatment | See the two rows below | Yes |
| Piper TTS 1.8.0 (PyPI `piper-tts`) | Tool | GPL-3.0-or-later (applies to the tool, not to its generated audio) | No |
| Voice model `en_US-kristin-medium` (Hugging Face `rhasspy/piper-voices`, sha256 `5849957f…a18d4`) | Model card: "trained from scratch", dataset LibriVox recordings, **dataset license: public domain**. Repository license: MIT | Public-domain data / MIT repo | No (downloaded at build time; 63 MB) |
| three.js 0.186.1 (npm) | Library | MIT | No (`npm ci`) |
| Baloo 2 font (`@fontsource/baloo-2` 5.3.0) | Ek Type | SIL Open Font License 1.1 | No (`npm ci`) |
| Inter font (system `/usr/share/fonts/opentype/inter`) | Rasmus Andersson | SIL Open Font License 1.1 | No |
| WastePaisa icon (`videos/wastepaisa/assets/icon.png`) | App's own icon from the saved public listing (approved in `context/03-assets.json`) | App owner's asset, used as a small signature | Already in repo |
| Playwright 1.63 + Chromium (preinstalled), FFmpeg 6.1.1 (system) | Tools | Apache-2.0 / BSD-style / GPL build | No |
| Vosk 0.3.45 + models `vosk-model-small-en-us-0.15`, `vosk-model-en-us-0.22-lgraph` | QA-only offline speech recognition | Apache 2.0 (alphacephei.com/vosk/models) | No |
| numpy, Pillow | Tools | BSD / MIT-CMU | No |

Voice note: the voice is synthetic and comes from a model trained on public-domain LibriVox
readings. It is pitch/formant-shifted (+7 %) with a faint tin-can resonance to make Tinku's
voice. It is not a clone or imitation of any named actor or character.

Not used: no stock footage, stock music, third-party images, other apps' assets or prior
videos. The Instagram references named in the brief were not accessed or copied.
