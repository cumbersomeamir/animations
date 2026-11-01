# Courtlens — 15 s diagram-animation style test

**Deliverable:** `courtlens-15s-test.mp4` (15.000 s, 1080×1920, 30 fps, H.264 + AAC). QA: `QA.md`, evidence in `qa/`.
Brief: `../../context/06-style-test.md`. Progress, provenance and choices: `../../context/07-test-progress.md`.
Storyboard: `docs/storyboard.md`.

Skill applied: iart-ai explainer-video-skills / `diagram-animation` (SKILL.md + references/diagram-and-chart-recipes.md,
read-only). Implementation is original code; no skill scripts were executed.

| Path | Role |
|---|---|
| `src/diagram.html` | The composition: inline SVG, one paused GSAP master timeline, `window.seek(t)` / `?t=N` freeze, cue export. Open it in a browser to preview it live. |
| `tools/capture.js` | Playwright Chromium frame capture (`video`, `stills`, `cues` modes) → FFmpeg libx264 |
| `audio/narration.py` | Local Kokoro-82M narration (voice bf_emma) + faster-whisper intelligibility/word timing |
| `audio/score15.py` | Original synthesised music + SFX from the timeline's cue sheet, plus VO mix |
| `tools/build.sh` | Full reproducible pipeline; `tools/qa.sh` QA evidence; `tools/sheet.sh` freeze-frame contact sheets |
| `timeline.json` | Narration lines and start times |

Dependencies (pinned): gsap 3.15.0 (GSAP Standard no-charge licence), @fontsource/jetbrains-mono 5.2.8 and
@fontsource/inter 5.2.8 (OFL). Python deps come from `../../project/requirements.txt`. Playwright/Chromium were preinstalled.
