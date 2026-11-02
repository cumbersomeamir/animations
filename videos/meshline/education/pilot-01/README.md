# Meshline lessons, Pilot 01: Why your phone struggles at a crowded concert

**Output:** `meshline-education-pilot-01.mp4`. 15.000 s, 1080x1920, 30 fps, H.264 High + AAC LC 48 kHz stereo.

One concept: **bars measure signal strength; speed depends on how much of the tower's shared capacity is free.** In a packed crowd, data waits its turn.

| File | What |
|---|---|
| `src/core.mjs` | Palette (sampled from the icon), easing and keyframes, deterministic noise, pinhole-camera projector |
| `src/cast.mjs` | Reusable rig for Bix and Dot |
| `src/pilot.mjs` | The lesson: glass city, crowd, radio paths, FIFO queue at the tower (illustrative μ = 4/s), props, camera, captions, cue sheet |
| `src/sheet.mjs` | Model sheet → `character/model-sheet.png` |
| `src/render.mjs` | CLI: `--cues`, `--still`, `--video [--workers N]` |
| `audio/voice.py`, `audio/narration.json` | Bix's narration (local Kokoro, blended voice); WAVs in `audio/narration/` |
| `audio/mix.py` | Original score + action-timed SFX + narration mix (ducking, limiter, speech-band check) |
| `storyboard.md`, `research/claims.md`, `character/README.md`, `LICENSE-NOTES.md`, `QA.md` | Docs |
| `qa/` | ffprobe, decode log, loudness, black/freeze, contact and boundary sheets, waveform, cues, voice balance, sha256 |

## Build
```bash
npm ci
```
```bash
PY=/path/to/python-with-numpy-scipy scripts/build.sh
```
```bash
scripts/qa.sh
```
To regenerate the narration (optional; the committed WAVs are used otherwise), set `REGEN_VO=1 KOKORO_DIR=…` with `model.onnx` and the voice `.bin` files from `onnx-community/Kokoro-82M-v1.0-ONNX` (Apache-2.0).
Dependencies: Node 22, `@napi-rs/canvas` 1.0.11, FFmpeg 6.1, Python with numpy and scipy (versions in `../../project/audio/requirements.txt`).
Fonts are Inter, from `../../project/fonts` (OFL).
