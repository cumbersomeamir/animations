# Licenses / provenance — production 30s english15-01 (English)
| item | source | license / status |
|---|---|---|
| Renderer, lights, newsroom stage, DOCKET rig, camera system, caption pill (x 100..900 safe area) | copied from `production/30s/2026-11-14-english-14/src` (accepted renderer = `education/pilot-01/src`) | original |
| New props: café table, candle (flame + glow), mug, plant, stool + books, a generic phone (primitive geometry, no brand styling) with an illustrative camera UI, burst frame cards; phone "photos" rendered from this scene; simulated grain + computed averages | original code in `src/stage/nightsight.js`; phone UI labelled EXAMPLE | original |
| Candle crackle, shutter, ticks, music + SFX | synthesized in `src/music/score.mjs`, no samples | original |
| English narration | Kokoro-82M (Apache-2.0), onnx-community/Kokoro-82M-v1.0-ONNX @ 1939ad2a… (cached), kokoro-onnx 0.6.1 (MIT); af_bella 0.7 + am_puck 0.3, en-us, 0.98 — the established DOCKET narrator | Apache-2.0 |
| Fonts | @fontsource/space-grotesk, jetbrains-mono, noto-sans-devanagari 5.3.0 (Caveat dependency left in package.json, not used) | SIL OFL 1.1 |
| three.js 0.186.1 | npm | MIT |
| Ideaverse icon | `videos/ideaverse/assets/icon.png` — re-checked 2026-11-15 against the Play listing (pixel-identical) | app's own; CTA only |
| QA only | faster-whisper base.en / small.en | tool |
No paid APIs, no Blender, no stock images or sounds, no manufacturer logos or UI. "Night Sight" / "Pixel" appear only in the narration and captions.
