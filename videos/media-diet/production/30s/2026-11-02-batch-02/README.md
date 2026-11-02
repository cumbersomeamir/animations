# Media Diet · 30 s production 02 — How noise cancelling headphones create quiet

| path | what |
|---|---|
| `media-diet-30s-production-02.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC) |
| `publishing-caption.txt` | post caption with source links |
| `SOURCES.md` | facts file (claim → source → verbatim wording; inferences separate) |
| `QA.md`, `qa/` | verification evidence |
| `LICENSES.md` | provenance / licences |
| `BRIEF-SCRIPT-STORYBOARD.md` | copy of context/13 (brief, feedback, final script, storyboard, QA summary) |
| `src/` | Canvas-2D film (`film.js`), `timeline.json`, `data/cues.json` |
| `audio/narration/` | committed Kokoro takes |
| `build/` | `build.sh`, `voice.py`, `cues.py`, `audio.py`, `render.mjs`, `qa.sh`, `bounds_check.py`, `asr_check.py` |

`node_modules`, `.cache/venv` and `.cache/models` are symlinks to production 01's caches (see context/11). Rebuild: `bash build/build.sh`.
