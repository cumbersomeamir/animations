# Licences & provenance — production 30s-02

| element | origin | licence / status |
|---|---|---|
| Film code (`src/`, `build/`) | written in this session for Media Diet | original work for the app owner |
| All drawings (bench, evidence case, generic over-ear headphones, ear-cup cutaway, waveform chart, board) | original Canvas-2D code | original; generic headphone drawn by code; not modelled on any specific product |
| Source tags (Apple Support, Sony Help Guide, Bose) | short citations on screen and in end credits; no quotes, logos or product images | factual attribution; no affiliation implied |
| App icon `../../../assets/icon.png` | approved app asset (context/03-assets.json, sha256 fc55d915…0878) | Media Diet's own asset, used only in the end signature |
| Fonts: Space Grotesk 5.2.10, Inter 5.2.8, IBM Plex Mono 5.2.7, Source Serif 4 5.2.9 (@fontsource, npm) | official npm registry | SIL OFL 1.1 (fonts), MIT (packages) |
| Voice engine kokoro-onnx 0.6.1 (PyPI) + espeakng-loader 0.2.4 / phonemizer 3.4.0 | official PyPI | MIT / GPL-3.0 (espeak-ng library, tool only) / GPL-3.0 (tool only) |
| Voice model Kokoro-82M v1.0 ONNX export + voices-v1.0.bin (github.com/thewh1teagle/kokoro-onnx release model-files-v1.0) | downloaded, not committed (sha256 in context/11) | weights Apache-2.0 (hexgrad/Kokoro-82M); blend af_bella 0.7 + am_puck 0.3 is a stock-voice mix, not an imitation of any person or character |
| Narration takes `audio/narration/*.wav` | generated in this session (cached model reused from production 01) | our output (Apache-2.0 model) |
| Music, foley and the demonstration layer (rumble, bursts, leak hiss) | synthesized in `build/audio.py` | original; no samples |
| ASR for QA: faster-whisper 1.1.1 + Systran/faster-whisper-base.en | QA only, not in the deliverable | MIT (both) |
| Playwright 1.63 + Chromium (pre-installed), FFmpeg 6.1.1, NumPy, Pillow | tools | Apache-2.0 / BSD / LGPL-GPL / BSD / HPND |

The Visual Investigation STYLE.md was read as art direction only (not copied into the repo, no code from that repository).
No paid APIs, subscriptions, secrets, Blender or third-party scripts were used.
