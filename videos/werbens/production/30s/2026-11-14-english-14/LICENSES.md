# English-14 30 s #01 — license and rights notes

| Item | Source | License / basis | Use |
|---|---|---|---|
| Bottles, price tags + columns, price card, snack bars, energy gauges, kcal/kJ chips, plinth, shelf labels, studio sweep, lights, camera, captions, labels | Original procedural code in `src/` (Three.js geometry/textures built at render time) | Original work for Werbens | Rendered video + thumbnail |
| Prices (£2.30 / 215 g, £2.80 / 540 g; 107p / 52p per 100 g) | UK CMA, Groceries unit pricing: pricing analysis (30 Jan 2024), para. A.34 — snapshot 9 May 2023, unnamed brand and retailer | Open Government Licence v3.0 (CMA publication) — quoted figures with attribution | Narration, tags, caption |
| Werbens logo | `videos/werbens/assets/brand/app-werbens-logo.svg` — verbatim copy of https://app.werbens.com/app/werbens-logo.svg (byte-identical on the 2026-11-14 re-check) | Werbens brand asset | CTA tile face + thumbnail (unchanged image) |
| Wordmark + label font | Space Grotesk 700 (latin) via `@fontsource/space-grotesk` 5.3.0 (`fonts/LICENSE-SpaceGrotesk-OFL.txt`) — as used by app.werbens.com | SIL OFL 1.1 | "Werbens" wordmark, big labels, thumbnail headline |
| Caption + tag fonts | Inter / Inter Display (`fonts/Inter*.otf`, `fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | English captions, tag and card text |
| Narration | Kokoro-82M v1.0 ONNX q8 (cached) via kokoro-js 1.2.1; original style blend of the bundled voices af_bella 0.7 + am_puck 0.3 (accepted Meshline/Recall voice) | Apache-2.0 | Local synthesis; no imitation of a person/character, no recycled audio |
| Word timing + QA speech recognition | Whisper base.en (onnx-community, cached) via @huggingface/transformers 3.7.6 | MIT / Apache-2.0 | Caption timing, intelligibility check |
| Research | Pandelaere, Briers & Lembregts (2011) JCR; CMA unit-pricing review (2023) and pricing analysis (2024) — cited, short quotes | Citation / short quotation; OGL v3.0 | Script accuracy, publishing copy |
| Score + foley | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| 3D library | three 0.180.0 (npm) | MIT | Rendering (from `node_modules`, not committed) |
| Tools | System Playwright + Chromium (SwiftShader); FFmpeg 6.1.1 | Apache-2.0 / BSD; LGPL/GPL | Not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media, voice cloning or third-party scripts were used.
