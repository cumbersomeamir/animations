# Licenses / provenance — production 30s feedback-01

| item | source | license / status |
|---|---|---|
| Picture: DOCKET rig, newsroom stage, lights, camera system | reused unchanged from `education/pilot-01/src` (original code made for Ideaverse in this session) | original |
| New props: MAIL SORTER cabinet (SPAM SCORE gauge, INBOX/SPAM drawers, reader), envelopes, magnifier, clusters, NOT SPAM sticker, captions | original code in `src/stage/spam.js` | original |
| Example emails | invented for this video (fictional senders, `.example` domains), labelled EXAMPLE | original; no real messages or personal data |
| Music + SFX | synthesized in `src/music/score.mjs` (engine from pilot-01), no samples | original |
| Narration | Kokoro-82M (hexgrad/Kokoro-82M, Apache-2.0) as onnx-community/Kokoro-82M-v1.0-ONNX @ 1939ad2a8e416c0acfeecc08a694d14ef25f2231 (cached copy), run with kokoro-onnx 0.6.1 (MIT); voice blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 | Apache-2.0 model/voices; audio committed in `src/narration/wav` |
| three.js 0.186.1 | npm registry | MIT |
| Fonts | @fontsource/space-grotesk 5.3.0, @fontsource/jetbrains-mono 5.3.0 | SIL OFL 1.1 |
| Ideaverse icon | `videos/ideaverse/assets/icon.png` (app asset) | app's own; CTA chip only |
| Renderer / tools | preinstalled Playwright 1.63.0 + Chromium (SwiftShader WebGL2), FFmpeg | tools only |
| QA only | faster-whisper base.en | tool, not shipped |
No paid APIs, no Blender, no third-party scripts executed.
