# Hindi-03 30 s #01 — license and rights notes

| Item | Source | License / basis | Use |
|---|---|---|---|
| Word tiles, packaging hood, tawa, stove ring, plate, dosa, steam, cardboard mock-up, studio sweep, camera, captions, labels | Original procedural code in `src/` (Three.js geometry/textures built at render time) | Original work for Werbens | Rendered video |
| Fictional non-stick tawa + oil-free dosa demo | Invented for illustration; labelled "काल्पनिक प्रोडक्ट" on screen | — | Rendered video |
| Werbens logo | `videos/werbens/assets/brand/app-werbens-logo.svg` — verbatim copy of https://app.werbens.com/app/werbens-logo.svg (2026-11-03) | Werbens brand asset | CTA tile face (unchanged image) |
| Wordmark font | Space Grotesk 700 (latin) via `@fontsource/space-grotesk` 5.3.0 (`fonts/LICENSE-SpaceGrotesk-OFL.txt`) — as used by app.werbens.com | SIL OFL 1.1 | "Werbens" wordmark |
| Devanagari font | Noto Sans Devanagari 700/800 via `@fontsource/noto-sans-devanagari` 5.3.0 (`fonts/LICENSE-NotoSansDevanagari-OFL.txt`) | SIL OFL 1.1 | Hindi captions, labels, tile words |
| Narration | Kokoro-82M v1.0 ONNX q8 (cached) via kokoro-js 1.2.1, bundled Hindi voice pack **hf_alpha** | Apache-2.0 | Local synthesis; no imitation of a person/character |
| Hindi G2P | eSpeak NG 1.51 (Ubuntu package `espeak-ng`), mapping as in misaki 0.7.4 `EspeakG2P` (read, not executed) | GPL-3.0 (tool, not redistributed) / Apache-2.0 | Phonemes only |
| QA speech recognition | Whisper large-v3-turbo (onnx-community) via @huggingface/transformers 3.7.6 | MIT / Apache-2.0 | Hindi intelligibility check only |
| Research | Nelson, Reed & Walling (1976); Paivio & Csapo (1973); FTC v. Colgate-Palmolive (1965); ASCI Code — cited, short quotes | Citation / short quotation | Script accuracy, publishing copy |
| Score + foley | Synthesised in `src/audio.mjs` | Original; no samples | Soundtrack |
| 3D library | three 0.180.0 (npm) | MIT | Rendering (from `node_modules`, not committed) |
| Tools | System Playwright + Chromium (SwiftShader); FFmpeg 6.1.1 | Apache-2.0 / BSD; LGPL/GPL | Not redistributed |

No Blender, paid APIs, subscriptions, secrets, stock media, voice cloning or third-party scripts were used.
