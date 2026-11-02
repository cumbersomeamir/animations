# Production 30 s #02 — license and rights notes

| Item | Source | License / basis | Use |
|---|---|---|---|
| Workspace UI, Pixel Pip, cursor, camera, captions, all drawings (car silhouette, generic loud layout, tool) | Original code in `src/` | Original work for Werbens | Rendered video |
| 1959 layout | **Analytical reconstruction** drawn from scratch for commentary/education: proportions and hierarchy only (small car high in white space, two-word headline beneath, three columns of greeked copy, an empty logo ring). No Volkswagen photo, logo, body copy or figures are reproduced; only the two-word headline "Think small." is quoted, labelled on screen as a reconstruction. | Commentary / analysis | Rendered video |
| Brand names | "Volkswagen", "Doyle Dane Bernbach" named factually in narration/captions | Nominative reference; no endorsement or affiliation implied | Narration, caption |
| Reference image | The Henry Ford collection image THF212470 (1962 printing of the ad), viewed once to verify the layout | Not copied, traced or included | Research only |
| Art direction | Living Screencast STYLE.md, lemomo-ai/lemo-opuscar (repo LICENSE: MIT, © 2026 LemoLab) | MIT (text read only) | Style rules; nothing executed or copied |
| Score, foley, 8-bit mascot sounds | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| Narration | Kokoro-82M v1.0 ONNX q8 via kokoro-js 1.2.1; voice blend af_bella 0.7 + am_puck 0.3 | Apache-2.0 | Local synthesis; no imitation of a person/character |
| QA speech recognition | Whisper base.en (onnx-community) via @huggingface/transformers 3.7.6 | Apache-2.0 | QA only |
| Fonts | Inter / Inter Display (`fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | UI text, captions |
| App icon | `videos/werbens/assets/icon.png` (approved asset) | Werbens brand asset | Subtle status-bar signature |
| Tools | System Playwright + Chromium; FFmpeg 6.1.1 | Apache-2.0 / BSD; LGPL/GPL | Not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media or third-party scripts were used.
