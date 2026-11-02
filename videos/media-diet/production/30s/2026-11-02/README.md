# Media Diet · 30 s production 01 — What airplane mode actually switches off

| path | what |
|---|---|
| `media-diet-30s-production-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC) |
| `publishing-caption.txt` | post caption with source links |
| `SOURCES.md` | facts file: claim → source → verbatim wording; inferences listed separately |
| `QA.md`, `qa/` | verification evidence |
| `LICENSES.md` | provenance and licences |
| `src/` | Canvas-2D film (`film.js`), `timeline.json` (layouts, events, narration), `data/cues.json` |
| `audio/narration/` | committed Kokoro takes (build inputs) |
| `build/` | `build.sh` (full build), `voice.py`, `cues.py`, `audio.py`, `render.mjs`, `qa.sh`, `bounds_check.py`, `asr_check.py` |

Format rules: `../../../context/11-production-format.md`. Brief/script/storyboard/QA summary: `../../../context/12-production-30s-01.md`.
Rebuild: `bash build/build.sh` (≈ 5 min on 4 CPU cores; `REGEN_VOICE=1` re-voices).
