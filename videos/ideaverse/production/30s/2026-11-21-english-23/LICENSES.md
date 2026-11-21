# Licenses / provenance — production 30s english23-01 (English)
| item | source | license / status |
|---|---|---|
| Renderer, lights, newsroom stage, DOCKET rig, camera system, caption pill (x 100..900 safe area) | copied from `production/30s/2026-11-19-english-22/src` (accepted renderer = `education/pilot-01/src`) | original |
| New props: a tiny night city (ground canvas with roads and markings, procedural buildings with window textures, three traffic signals with lamps, coloured stop bars, cars), a deterministic traffic simulation, trend dots + heat, the green-wave band, the Boston result card, generic engineer / report phone screens | original code in `src/stage/greenwave.js`; phone UI is generic (EXAMPLE) | original |
| Ticks, glides, chimes, whooshes, music + SFX | synthesized in `src/music/score.mjs`, no samples | original |
| English narration | Kokoro-82M (Apache-2.0), onnx-community/Kokoro-82M-v1.0-ONNX @ 1939ad2a… (cached), kokoro-onnx 0.6.1 (MIT); af_bella 0.7 + am_puck 0.3, en-us, 0.98 — the established DOCKET narrator | Apache-2.0 |
| Fonts | @fontsource/space-grotesk, jetbrains-mono, noto-sans-devanagari 5.3.0 (Caveat dependency left in package.json, not used) | SIL OFL 1.1 |
| three.js 0.186.1 | npm | MIT |
| Ideaverse icon | `videos/ideaverse/assets/icon.png` — re-checked 2026-11-21 (english-23) against the Play listing (pixel-identical) | app's own; CTA only |
| QA only | faster-whisper base.en / small.en | tool |
No paid APIs, no Blender, no stock images, footage or sounds, no manufacturer logos or UI. No Google, Google Maps or City of Boston logo or interface is reproduced; "Green Light" and "Boston" appear only in narration, captions and the result card text.
