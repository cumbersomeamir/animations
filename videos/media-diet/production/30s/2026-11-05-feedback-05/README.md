# Media Diet · 30 s Hindi episode (feedback-05) — Android screen-share privacy now blanks login and payment fields in Chrome

Hindi narration + Devanagari captions. Style: **Layered Tech Cutaway**, accepted recipe unchanged (`../../../context/11-production-format.md`),
built on the accepted hindi-03/hindi-04 renderer and caption setup. Brief/script/storyboard/citations/style notes:
`BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/18-production-30s-feedback05-01.md`).

| path | what |
|---|---|
| `media-diet-30s-feedback05-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio tagged `hin`) |
| `publishing-caption.txt` | concise Hindi caption matching the final narration, with sources |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts file (incl. why this item, dated) · provenance · verification |
| `src/film.js` | three.js paper diorama (phone → monitor screen share, eyeball watcher, shutters, calendar, shield, version blocks, Settings path, sign) + Devanagari caption overlay |
| `src/timeline.json` · `src/data/` | spoken Hindi text and caption text, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro Hindi takes |
| `build/` | `build.sh`, `render.mjs`, `merge_bounds.py`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py`, `caption_sync.py`, `asr_check_hi.py`, `contact.py` |

Rebuild: `bash build/build.sh` (`REGEN_VOICE=1` re-synthesises narration; `SKIP_FRAMES=1` reuses `frames/`). `node_modules` and
`.cache/{venv,models}` are links to the existing caches.
