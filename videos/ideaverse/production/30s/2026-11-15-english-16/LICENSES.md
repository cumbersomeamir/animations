# Licenses / provenance — production 30s english16-01 (English)
| item | source | license / status |
|---|---|---|
| Renderer, lights, newsroom stage, DOCKET rig, camera system, caption pill (x 100..900 safe area) | copied from `production/30s/2026-11-15-english-15/src` (accepted renderer = `education/pilot-01/src`) | original |
| New props: TV on a cabinet (generic show + subtitles), side table, a generic smart speaker (fabric puck + light ring, x-ray chip), sound-snippet tiles, illustrative match meter + wake line, cloud glyph, 12-show card, settings phone | original code in `src/stage/wakeword.js`; phone UI labelled EXAMPLE | original |
| Wake chime (original two-note), TV murmur, ticks, music + SFX | synthesized in `src/music/score.mjs`, no samples | original |
| English narration | Kokoro-82M (Apache-2.0), onnx-community/Kokoro-82M-v1.0-ONNX @ 1939ad2a… (cached), kokoro-onnx 0.6.1 (MIT); af_bella 0.7 + am_puck 0.3, en-us, 0.98 — the established DOCKET narrator | Apache-2.0 |
| Fonts | @fontsource/space-grotesk, jetbrains-mono, noto-sans-devanagari 5.3.0 (Caveat dependency left in package.json, not used) | SIL OFL 1.1 |
| three.js 0.186.1 | npm | MIT |
| Ideaverse icon | `videos/ideaverse/assets/icon.png` — re-checked 2026-11-15 (english-16) against the Play listing (pixel-identical) | app's own; CTA only |
| QA only | faster-whisper base.en / small.en | tool |
No paid APIs, no Blender, no stock images or sounds, no manufacturer logos or UI. "Google" / "Home app" appear only in the narration and captions; no real wake phrase is spoken.
