# Media Diet · 30 s feedback-round episode — How a warehouse robot finds its way when GPS cannot help inside

Style: **Layered Tech Cutaway** (recipe in `../../../context/11-production-format.md`). Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md`.

| path | what |
|---|---|
| `media-diet-30s-feedback-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC) |
| `publishing-caption.txt` | post caption with sources |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts file · provenance · verification |
| `src/film.js` | three.js paper diorama (warehouse, robot, ray-cast lidar, map sheet, crate, route strips, sign) + caption overlay |
| `src/timeline.json` · `src/data/` | narration starts, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro takes |
| `build/` | `build.sh`, `render.mjs` (parallel ranges), `merge_bounds.py`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py`, `asr_check.py` |

`node_modules` (three from education/pilot-01; fonts from production/30s/2026-11-02) and `.cache/{venv,models}` are links to existing caches.
