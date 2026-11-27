# English-25 30 s #01 — license and rights notes

| Item | Source | License / basis | Use |
|---|---|---|---|
| Original illustrative cooler (six cabinets, 150 generic lathe bottles with mint caps), first-name labels from a canvas atlas (illustrative common first names, plain circle-and-dot logo mark on the reverse), search light, name-card stream, shopper pawns with name badges, ribbon and bow; no Coca-Cola logo, red, contour bottle or "You" typeface; no figures; studio sweep, lights, camera, captions, headline, labels | Original procedural code in `src/` (Three.js geometry/textures built at render time) | Original work for Werbens | Rendered video + thumbnail |
| Werbens logo | `videos/werbens/assets/brand/app-werbens-logo.svg` — verbatim copy of https://app.werbens.com/app/werbens-logo.svg (byte-identical on the 2026-11-27 re-check) | Werbens brand asset | CTA tile face + thumbnail (unchanged image) |
| Wordmark + label font | Space Grotesk 700 (latin) via `@fontsource/space-grotesk` 5.3.0 (`fonts/LICENSE-SpaceGrotesk-OFL.txt`) — as used by app.werbens.com | SIL OFL 1.1 | "Werbens" wordmark, frame-0 headline, big labels, thumbnail |
| Caption + tag fonts | Inter / Inter Display (`fonts/Inter*.otf`, `fonts/LICENSE-Inter-OFL.txt`) | SIL OFL 1.1 | English captions, chip text |
| Narration | Kokoro-82M v1.0 ONNX q8 (cached) via kokoro-js 1.2.1; original style blend of the bundled voices af_bella 0.7 + am_puck 0.3 (accepted Meshline/Recall voice) | Apache-2.0 | Local synthesis; no imitation of a person/character, no recycled audio |
| Word timing + QA speech recognition | Whisper base.en (onnx-community, cached) via @huggingface/transformers 3.7.6 | MIT / Apache-2.0 | Caption timing, intelligibility check |
| Research | The Coca-Cola Company: history page "How a Groundbreaking Campaign Got Its Start 'Down Under'" and press releases of 2014-06-10, 2015-04-14 and 2025-03-26 — cited, short quotes, no Coca-Cola assets used; Shapiro, Caldwell & Sorensen (1997) JEP:HPP (OpenAlex abstract) — cited, short quote | Citation / short quotation | Script accuracy, publishing copy |
| Score + foley | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| 3D library | three 0.180.0 (npm) | MIT | Rendering (from `node_modules`, not committed) |
| Tools | System Playwright + Chromium (SwiftShader); FFmpeg 6.1.1 | Apache-2.0 / BSD; LGPL/GPL | Not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media, voice cloning or third-party scripts were used.
