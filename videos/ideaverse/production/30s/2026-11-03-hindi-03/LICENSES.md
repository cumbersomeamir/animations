# Licenses / provenance — production 30s hindi03-01 (Hindi)

| item | source | license / status |
|---|---|---|
| Renderer, lights, newsroom stage, DOCKET rig, camera system, caption pill | copied from `production/30s/2026-11-03-round-02/src` (accepted feedback-round renderer, itself `education/pilot-01/src`) | original |
| New props: personal-photo easel (illustrated photo), cut-out, fill patches, phone screens, अनुमान meter labels | original code in `src/stage/eraser.js` | original |
| The photo | an original illustration drawn in code (fictional person, park, kite, dustbin), labelled उदाहरण; the phone screen is an illustration, not Google Photos' UI | original |
| Music + SFX | synthesized in `src/music/score.mjs` (accepted engine), no samples | original |
| Hindi narration | Kokoro-82M (hexgrad/Kokoro-82M, Apache-2.0) Hindi voices hm_omega 0.7 + hf_alpha 0.3 from onnx-community/Kokoro-82M-v1.0-ONNX @ 1939ad2a8e416c0acfeecc08a694d14ef25f2231, kokoro-onnx 0.6.1 (MIT), espeak-ng Hindi phonemes (espeakng-loader 0.2.4) | Apache-2.0; audio in `src/narration/wav` |
| Not used | Piper hi_IN pratham / priyamvada (dataset CC BY-NC-SA 4.0, non-commercial), hi_IN rohan (IIT-M IndicTTS licence) | rejected for a promotional video |
| Fonts | @fontsource/noto-sans-devanagari 5.3.0, @fontsource/space-grotesk 5.3.0, @fontsource/jetbrains-mono 5.3.0 | SIL OFL 1.1 |
| three.js 0.186.1 | npm | MIT |
| Ideaverse icon | `videos/ideaverse/assets/icon.png` (current official Play icon, re-checked 2026-11-03) | app's own; CTA chip only |
| QA only | faster-whisper `medium` (multilingual, Hindi ASR) and `base.en` not used here | tool, not shipped |
No paid APIs, no Blender, no voice cloning, no third-party scripts executed.
