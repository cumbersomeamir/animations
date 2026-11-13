# English-13 30 s #01 — license and rights notes

| Item | Source | License / basis | Use |
|---|---|---|---|
| Fold-up storage boxes, flat-pack parcel, bid coins, hex key, "=" sign, check mark, aura, studio sweep, lights, camera, captions, labels | Original procedural code in `src/` (Three.js geometry/textures built at render time) | Original work for Werbens | Rendered video + thumbnail |
| "IKEA" in narration/captions | Brand name used descriptively in an educational, sourced example (the company's own positioning statement; the study's name and materials). No IKEA logo, product design, packaging or typeface is reproduced; the props are generic Werbens-coloured illustrations | Nominative/descriptive reference with citation | Rendered video, caption |
| Werbens logo | `videos/werbens/assets/brand/app-werbens-logo.svg` — verbatim copy of https://app.werbens.com/app/werbens-logo.svg (byte-identical on the 2026-11-13 re-check) | Werbens brand asset | CTA tile face + thumbnail (unchanged image) |
| Wordmark + label font | Space Grotesk 700 (latin) via `@fontsource/space-grotesk` 5.3.0 (`fonts/LICENSE-SpaceGrotesk-OFL.txt`) — as used by app.werbens.com | SIL OFL 1.1 | "Werbens" wordmark, big labels, thumbnail headline |
| Caption fonts | Inter / Inter Display (`fonts/Inter*.otf`, `fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | English captions |
| Narration | Kokoro-82M v1.0 ONNX q8 (cached) via kokoro-js 1.2.1; original style blend of the bundled voices af_bella 0.7 + am_puck 0.3 (accepted Meshline/Recall voice) | Apache-2.0 | Local synthesis; no imitation of a person/character, no recycled audio |
| Word timing + QA speech recognition | Whisper base.en (onnx-community, cached) via @huggingface/transformers 3.7.6 | MIT / Apache-2.0 | Caption timing, intelligibility check |
| Research | Norton, Mochon & Ariely (2012) JCP + HBS working paper 11-091; IKEA concept and flat-pack history pages — cited, short quotes | Citation / short quotation | Script accuracy, publishing copy |
| Score + foley | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| 3D library | three 0.180.0 (npm) | MIT | Rendering (from `node_modules`, not committed) |
| Tools | System Playwright + Chromium (SwiftShader); FFmpeg 6.1.1 | Apache-2.0 / BSD; LGPL/GPL | Not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media, voice cloning or third-party scripts were used.
