# English-10 30 s #01 — license and rights notes

| Item | Source | License / basis | Use |
|---|---|---|---|
| Two doors under a sign, buttons on pedestals, "?" cloud, plan cards, "Links on this page" list with flipping rows, formula tiles, studio sweep, camera, captions, labels | Original procedural code in `src/` (Three.js geometry/textures built at render time) | Original work for Werbens | Rendered video |
| Meal kit service, plans, buttons and links | Invented for illustration (the sign reads "FICTIONAL MEAL KIT"); no prices, no results | — | Rendered video |
| Werbens logo | `videos/werbens/assets/brand/app-werbens-logo.svg` — verbatim copy of https://app.werbens.com/app/werbens-logo.svg (2026-11-03; byte-identical on re-check) | Werbens brand asset | CTA tile face (unchanged image) |
| Wordmark font | Space Grotesk 700 (latin) via `@fontsource/space-grotesk` 5.3.0 (`fonts/LICENSE-SpaceGrotesk-OFL.txt`) — as used by app.werbens.com | SIL OFL 1.1 | "Werbens" wordmark |
| Caption + label fonts | Inter / Inter Display (`fonts/Inter*.otf`, `fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | English captions, labels, tag text |
| Narration | Kokoro-82M v1.0 ONNX q8 (cached) via kokoro-js 1.2.1; original style blend of the bundled voices af_bella 0.7 + am_puck 0.3 (accepted Meshline/Recall voice) | Apache-2.0 | Local synthesis; no imitation of a person/character, no recycled Hindi audio |
| Word timing + QA speech recognition | Whisper base.en (onnx-community, cached) via @huggingface/transformers 3.7.6 | MIT / Apache-2.0 | Caption timing, intelligibility check |
| Research | W3C WCAG 2.2 (SC 2.4.4, 2.4.9, Understanding 2.4.4) and Technique F84 — cited, short quotes | W3C Document License / citation | Script accuracy, publishing copy |
| Score + foley | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| 3D library | three 0.180.0 (npm) | MIT | Rendering (from `node_modules`, not committed) |
| Tools | System Playwright + Chromium (SwiftShader); FFmpeg 6.1.1 | Apache-2.0 / BSD; LGPL/GPL | Not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media, voice cloning or third-party scripts were used.
