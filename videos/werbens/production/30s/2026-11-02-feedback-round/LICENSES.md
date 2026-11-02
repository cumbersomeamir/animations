# Feedback round 30 s #01 — license and rights notes

| Item | Source | License / basis | Use |
|---|---|---|---|
| Cups, lids, sleeves, measuring glass, liquid bands, coin, cutting ring, ball, studio sweep, icon tile slab, camera, captions, labels | Original procedural code in `src/` (Three.js geometry built at render time) | Original work for Werbens | Rendered video |
| Coffee menu (150 ml Rs90 · 280 ml Rs155 · 280→300 ml) | Invented for illustration (brief); labelled "Illustrative menu" on screen | — | Rendered video |
| Reference posts (Instagram DegdItcojM7, De167Hmhesj, DfKtydOo3hP, DeOBTsOIedf) | Named in the brief as staging references; **not viewed, downloaded, traced or copied** | — | Staging principles only (described in the brief) |
| Research | Huber, Payne & Puto (1982); Huber & Puto (1983); Frederick, Lee & Baskin (2014) — cited, abstracts quoted briefly | Citation / short quotation | Script accuracy, publishing copy |
| 3D library | three 0.180.0 (npm) | MIT | Rendering (bundled from `node_modules`, not committed) |
| Score + foley | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| Narration | Kokoro-82M v1.0 ONNX q8 via kokoro-js 1.2.1; voice blend af_bella 0.7 + am_puck 0.3 (cached weights reused) | Apache-2.0 | Local synthesis; no imitation of a person/character |
| QA speech recognition | Whisper base.en (onnx-community) via @huggingface/transformers 3.7.6 | Apache-2.0 | QA only |
| Fonts | Inter / Inter Display (`fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | Captions, labels, coin/sleeve letters |
| App icon | `videos/werbens/assets/icon.png` (approved asset) | Werbens brand asset | CTA tile face |
| Tools | System Playwright + Chromium (SwiftShader); FFmpeg 6.1.1 | Apache-2.0 / BSD; LGPL/GPL | Not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media or third-party scripts were used.
