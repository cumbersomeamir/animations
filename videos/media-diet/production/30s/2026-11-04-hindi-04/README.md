# Media Diet · 30 s Hindi episode (hindi-04) — Google Play Store (2 Nov 2026) now reminds you if Play Protect stays off

Hindi narration + Devanagari captions. Style: **Layered Tech Cutaway**, accepted recipe unchanged (`../../../context/11-production-format.md`),
built on the accepted hindi-03 renderer/caption setup. Brief/script/storyboard/citations: `BRIEF-SCRIPT-STORYBOARD.md`
(copy of `../../../context/17-production-30s-hindi04-01.md`).

| path | what |
|---|---|
| `media-diet-30s-hindi04-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio tagged `hin`) |
| `publishing-caption.txt` | Hindi post caption with the exact Play Protect path and sources |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts file (incl. candidates not chosen) · provenance · verification |
| `src/film.js` | three.js paper diorama (big paper phone, Play Protect switch, calendar, update ring, clock, reminder card, conveyor + shield gate, radar, harmful app → warning → disabled → bin, settings sheet, sign) + Devanagari caption overlay |
| `src/timeline.json` · `src/data/` | spoken Hindi text and caption text, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro Hindi takes |
| `build/` | `build.sh`, `render.mjs`, `merge_bounds.py`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py`, `asr_check_hi.py`, `contact.py` |

Rebuild: `bash build/build.sh` (`REGEN_VOICE=1` re-synthesises narration; `SKIP_FRAMES=1` reuses `frames/`). `node_modules` and
`.cache/{venv,models}` are links to the existing caches (Noto Sans Devanagari from the hindi-03 install; build.sh reinstalls it if missing).
