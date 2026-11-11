# Licenses / provenance — production 30s english12-01 (English)
| item | source | license / status |
|---|---|---|
| Renderer, lights, newsroom stage, DOCKET rig, camera system, caption pill (re-centred to the x 100..900 safe area) | copied from `production/30s/2026-11-09-english-11/src` (accepted renderer = `education/pilot-01/src`) | original |
| New props: generic fictional caller "Sam" (plain silhouette avatar — no real person), voice-wave / voice-pattern / two-box cards, call + contacts screens, speech bubble + stamp | original code in `src/stage/voiceclone.js`; labelled EXAMPLE; generic UI, not a real app's | original |
| Phone ring, music + SFX | synthesized in `src/music/score.mjs`, no samples | original |
| English narration | Kokoro-82M (Apache-2.0), onnx-community/Kokoro-82M-v1.0-ONNX @ 1939ad2a… (cached), kokoro-onnx 0.6.1 (MIT); af_bella 0.7 + am_puck 0.3, en-us, 0.98 — the established DOCKET narrator, not a clone of anyone | Apache-2.0 |
| Fonts | @fontsource/space-grotesk, jetbrains-mono, noto-sans-devanagari 5.3.0 (Caveat dependency left in package.json, not used) | SIL OFL 1.1 |
| three.js 0.186.1 | npm | MIT |
| Ideaverse icon | `videos/ideaverse/assets/icon.png` — re-checked 2026-11-11 against the Play listing (pixel-identical) | app's own; CTA only |
| QA only | faster-whisper base.en / small.en | tool |
No paid APIs, no Blender, no voice cloning of any real person, no stock images.
