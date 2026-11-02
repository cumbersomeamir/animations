# Werbens · Education pilot 01 — "Same cookies, different box"

15-second educational short: *why identical products can feel different in different packaging.*
Final file: `werbens-education-pilot-01.mp4` (1080×1920, 30 fps, H.264 + AAC, 15.000 s).

- Brief + storyboard: `../../context/09-educational-pilot-01.md` · strategy: `../../context/08-educational-strategy.md`
- Progress / provenance / QA state: `../../context/10-educational-progress.md` · QA report: `QA.md`
- Research + claim mapping: `sources.md` · licenses: `LICENSES.md` · cast bible + model sheet: `character/`

## Build
```bash
bash build.sh
```
Steps: `npm ci` → `src/tts.mjs` (Kokoro narration) → `src/words.mjs` (Whisper word timing → `src/words.json`) →
`src/audio.mjs` (score + SFX + mix) → `src/render.mjs --video` (deterministic Three.js in headless Chromium) → mux → `qa.sh` →
`src/asr_mix.mjs` → model sheet. Preview any frame: `node src/render.mjs --stills 4.4,10.6` or open `src/scene.html?t=4.4`
(`?play` for a live loop) through the render server.

## Layout
`src/scene.html|scene.js` scene + HUD · `src/rig/` reusable character rig + cast · `src/props.js` stage, table, boxes, cookies,
bubble, lamp, particles · `src/timeline.js` shared timing/captions/SFX cue sheet · `src/lib/anim.js` deterministic easing/keys ·
`qa/` metadata, contact sheets, boundary frames, loudness, ASR.
