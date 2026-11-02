# Pilot 01 — license notes

| Item | Source | License | Use |
|---|---|---|---|
| Characters (Pip, Quibble), props, stage, animation, captions | Original procedural code in `src/` (this repo) | Original work for Werbens | Rendered in the video |
| Music score and all SFX | Synthesised from oscillators/noise in `src/audio.mjs` | Original work; no samples or third-party audio | Soundtrack |
| Narration voice | Kokoro-82M v1.0 (ONNX q8, `onnx-community/Kokoro-82M-v1.0-ONNX`, rev 1939ad2a) via `kokoro-js` 1.2.1; voice = original 70/30 blend of the bundled `af_bella` and `af_heart` style vectors | Apache-2.0 (model, voices, kokoro-js) | Local synthesis; not an imitation of any named person or character |
| Word timing / intelligibility QA | Whisper base.en (`onnx-community/whisper-base.en_timestamped`) via `@huggingface/transformers` 3.7.6 | Apache-2.0 (HF model card of openai/whisper-base.en; transformers.js Apache-2.0) | QA + caption timing only; not distributed |
| 3D engine | `three` 0.180.0 (npm) | MIT | Rendering |
| Phonemizer | `phonemizer` 1.2.1 (npm, kokoro-js dependency) | Apache-2.0 | G2P for TTS |
| ONNX Runtime | `onnxruntime-node` 1.21.0 / `onnxruntime-web` (transitive) | MIT | Model inference |
| Fonts | Inter / Inter Display (copied from this app's `project/fonts`, see `fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | Captions, labels, prop labels |
| App icon | `videos/werbens/assets/icon.png` (approved asset, public Play listing snapshot, Oct 2026; sha256 b9709c1f…) | Werbens' own brand asset | Small end signature only |
| Headless browser | System Playwright + Chromium (pre-installed in the environment; not redistributed) | Apache-2.0 / BSD | Offline frame capture |
| Encoder | System FFmpeg 6.1.1 (libx264, native AAC) | LGPL/GPL (system tool, not redistributed) | Encoding, QA |

No paid APIs, subscriptions, API keys, Blender, third-party installer scripts or stock media were used.
Model weights are downloaded on first run into `node_modules/@huggingface/transformers/.cache` (gitignored; ~370 MB incl. QA model).
