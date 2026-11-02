# Production 30 s #01 — license notes

| Item | Source | License | Use |
|---|---|---|---|
| Workspace UI, pixel mascot, stage illustration, cursor, camera, captions | Original code in `src/` | Original work for Werbens | Rendered video |
| Art direction | "Living Screencast" STYLE.md, lemomo-ai/lemo-opuscar (`styles/living-screencast/STYLE.md`, sha256 02e8e552… fetched 2026-11-02; repo LICENSE: MIT, © 2026 LemoLab) | MIT (text read only) | Style rules applied as direction; no code, assets, characters, UI, music or footage copied; nothing executed |
| Score, foley, 8-bit mascot sounds | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| Narration voice | Kokoro-82M v1.0 ONNX q8 via kokoro-js 1.2.1; style blend af_bella 0.7 + am_puck 0.3 (bundled voices) | Apache-2.0 | Local synthesis; not an imitation of any person or character |
| Timing / intelligibility QA | Whisper base.en (`onnx-community/whisper-base.en_timestamped`) via @huggingface/transformers 3.7.6 | Apache-2.0 | QA only, not distributed |
| Fonts | Inter / Inter Display (this app's `project/fonts`, see `fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | UI text, captions |
| App icon | `videos/werbens/assets/icon.png` (approved asset; public Play listing snapshot, Oct 2026) | Werbens brand asset | Subtle status-bar signature |
| Headless browser / encoder | System Playwright + Chromium; system FFmpeg 6.1.1 (libx264, AAC) | Apache-2.0 / BSD; LGPL/GPL | Tools only, not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media or third-party scripts were used.
