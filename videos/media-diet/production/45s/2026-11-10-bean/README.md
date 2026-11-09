# Media Diet · 45 s English physics special — how many people would actually move Chicago's Bean seven inches?

English narration + English captions. Style: **Layered Tech Cutaway**, accepted recipe (`../../../context/11-production-format.md`),
opening with 3.5 s of the user's real event footage. Brief/script/storyboard/citations/assumptions: `BRIEF-SCRIPT-STORYBOARD.md`
(copy of `../../../context/25-production-45s-bean-01.md`); facts + calculations: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-bean-45s-01.mp4` | final film (45.000 s, 1350 frames, 1080×1920, H.264 + AAC, audio tagged `eng`) |
| `publishing-caption.txt` | caption matching the final narration, with the event date, sources and model note |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts, assumptions, calculations · provenance · verification |
| `src/film.js` | real footage (S1) + three.js paper diorama: chrome Bean on a plaza, schematic supports, IMAGINARY LOOSE BEAN model page with force arrows, crowd tiles, caveats, 0.178 m slider, real anchored Bean with support reaction, CTA sign; English captions + equation cards |
| `src/timeline.json` · `src/data/` | narration, cues, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro English takes |
| `build/` | `build.sh`, `render.mjs`, `render_chunks.sh` (resumable 60-frame chunks, clamped to the timeline), `merge_bounds.py`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py`, `caption_sync.py`, `asr_check_en.py`, `contact.py` |

Rebuild: `bash build/build.sh` (extracts the 105 footage frames into `.cache/footage/` if missing, renders with three chunk workers,
then audio, encode, QA). `SKIP_FRAMES=1` reuses `frames/`. `node_modules` and `.cache/{venv,models}` link to the existing caches.
