# English-24 30 s #01 — license and rights notes

| Item | Source | License / basis | Use |
|---|---|---|---|
| Original illustrative miniature store (entrance posts, arrow path, pop-up living room / bedroom / dining room from flat cut-outs, flat-pack racks and packs, lone sofa on a plinth, plain size/price tag with icons only, cart, shopper and people pawns, imagined (ghost) shopper, ghost room; no IKEA logo, colours, products or store photos; no numbers), studio sweep, lights, camera, captions, headline, labels | Original procedural code in `src/` (Three.js geometry/textures built at render time) | Original work for Werbens | Rendered video + thumbnail |
| Werbens logo | `videos/werbens/assets/brand/app-werbens-logo.svg` — verbatim copy of https://app.werbens.com/app/werbens-logo.svg (byte-identical on the 2026-11-23 re-check) | Werbens brand asset | CTA tile face + thumbnail (unchanged image) |
| Wordmark + label font | Space Grotesk 700 (latin) via `@fontsource/space-grotesk` 5.3.0 (`fonts/LICENSE-SpaceGrotesk-OFL.txt`) — as used by app.werbens.com | SIL OFL 1.1 | "Werbens" wordmark, frame-0 headline, big labels, thumbnail |
| Caption + tag fonts | Inter / Inter Display (`fonts/Inter*.otf`, `fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | English captions, chip text |
| Narration | Kokoro-82M v1.0 ONNX q8 (cached) via kokoro-js 1.2.1; original style blend of the bundled voices af_bella 0.7 + am_puck 0.3 (accepted Meshline/Recall voice) | Apache-2.0 | Local synthesis; no imitation of a person/character, no recycled audio |
| Word timing + QA speech recognition | Whisper base.en (onnx-community, cached) via @huggingface/transformers 3.7.6 | MIT / Apache-2.0 | Caption timing, intelligibility check |
| Research | IKEA customer-service pages (NZ "How to shop at IKEA Sylvia Park", AU "What is the layout of an IKEA store?", IN "What are the ways to shop at IKEA?") — cited, short quotes, no IKEA assets used; Escalas (2004) Journal of Advertising and Elder & Krishna (2012) JCR (OpenAlex/IDEAS abstracts) — cited, short quotes | Citation / short quotation | Script accuracy, publishing copy |
| Score + foley | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| 3D library | three 0.180.0 (npm) | MIT | Rendering (from `node_modules`, not committed) |
| Tools | System Playwright + Chromium (SwiftShader); FFmpeg 6.1.1 | Apache-2.0 / BSD; LGPL/GPL | Not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media, voice cloning or third-party scripts were used.
