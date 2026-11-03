# Round-02 30 s #01 — license and rights notes

| Item | Source | License / basis | Use |
|---|---|---|---|
| Arch, star, circle, triangle, logo tile, bag, sign, covers, studio sweep, camera, captions, labels | Original procedural code in `src/` (Three.js geometry built at render time) | Original work for Werbens | Rendered video |
| "Plimm Bakery" + its arch | Invented for illustration; labelled "Fictional brand" on screen | — | Rendered video |
| Werbens app icon | `videos/werbens/assets/icon.png` — byte-identical to the current Google Play listing icon (checked 2026-11-03) | Werbens brand asset | CTA tile face (unchanged image) |
| Werbens logo mark | `videos/werbens/assets/brand/werbens-site-logo-mark.svg` — inline SVG from the werbens.com header (2026-11-03) | Werbens brand asset | CTA lockup |
| Wordmark font | Fahkwang Bold (latin subset) via `@fontsource/fahkwang` 5.3.0 (`fonts/LICENSE-Fahkwang-OFL.txt`) | SIL OFL 1.1 | "Werbens" in the lockup (as on werbens.com) |
| Research | Ward et al. (2020); Romaniuk (2018); Romaniuk, Sharp & Ehrenberg (2007); Keller (1993) — cited, abstracts quoted briefly | Citation / short quotation | Script accuracy, publishing copy |
| 3D library | three 0.180.0 (npm) | MIT | Rendering (from `node_modules`, not committed) |
| Score + foley | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| Narration | Kokoro-82M v1.0 ONNX q8 via kokoro-js 1.2.1; voice blend af_bella 0.7 + am_puck 0.3 (cached weights reused) | Apache-2.0 | Local synthesis; no imitation of a person/character |
| QA speech recognition | Whisper base.en (onnx-community) via @huggingface/transformers 3.7.6 | Apache-2.0 | QA only |
| Fonts | Inter / Inter Display (`fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | Captions, labels |
| Tools | System Playwright + Chromium (SwiftShader); FFmpeg 6.1.1 | Apache-2.0 / BSD; LGPL/GPL | Not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media or third-party scripts were used. Official listing screenshots
were inspected only to measure colours; none is shown or stored in the repo.
