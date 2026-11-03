# Media Diet · 30 s round-02 episode — How emergency satellite messaging reaches help when there is no mobile signal

Style: **Layered Tech Cutaway**, unchanged accepted recipe (`../../../context/11-production-format.md`). Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md`.

| path | what |
|---|---|
| `media-diet-30s-round02-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC) |
| `publishing-caption.txt` | post caption with sources |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts file · provenance · verification |
| `src/film.js` | three.js paper diorama (valley, ridge, tower + houses, phone prop with printed screen, satellite on an arc, dish hut, response centre, route dashes, camp + trailhead, sign) + caption overlay |
| `src/timeline.json` · `src/data/` | narration starts, cues, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro takes |
| `build/` | `build.sh`, `render.mjs` (parallel ranges), `merge_bounds.py`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py`, `asr_check.py`, `contact.py` |

Rebuild: `bash build/build.sh` (add `REGEN_VOICE=1` to re-synthesise narration; `SKIP_FRAMES=1` to reuse `frames/`).
`node_modules` (three from education/pilot-01; fonts from production/30s/2026-11-02) and `.cache/{venv,models}` are links to existing caches.
