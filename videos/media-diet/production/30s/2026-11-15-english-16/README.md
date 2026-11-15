# Media Diet · 30 s English episode 16 — "Ten fans. No jet fuel."

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama, accepted recipe
(`../../../context/11-production-format.md`) under the approved feedback rules (`../../../context/26-approved-feedback-rules-2026-11-11.md`).
Story: COMAC's 19-seat CE-25A electric airliner made its first crewed flight (14 Nov 2026); why its range stops near 400 km. Frame 0 = the airliner with its ten fans + the hook words (also the thumbnail).
Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/27-production-30s-english16-01.md`); facts,
calculations and assumptions: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english16-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio tagged `eng`) |
| `thumbnail-english16-01.png` | separate vertical thumbnail (1080×1920): frame 0 ("Ten fans. / No jet fuel.") |
| `publishing-caption.txt` | caption matching the final narration, with the event details |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts, calculations, assumptions · provenance · verification |
| `src/film.js` | three.js paper diorama: airliner with ten spinning ducted fans, sunset sky card, clouds and fields, map with 400 km ring and short hops, energy tiles (fuel vs battery), scales, CTA sign; hook caption from frame 0; `window.renderThumb()` = frame 0 |
| `src/timeline.json` · `src/data/` | narration, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro English takes |
| `build/` | `build.sh`, `render.mjs`, `render_chunks.sh` (resumable 60-frame chunks), `merge_bounds.py`, `thumb.mjs`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py` (x 100–900 / y 230–1500 rules), `caption_sync.py`, `asr_check_en.py`, `contact.py` |

Rebuild: `bash build/build.sh` (renders with three chunk workers, then audio, encode, QA); `SKIP_FRAMES=1` reuses `frames/`.
Thumbnail: `node build/thumb.mjs thumbnail-english16-01.png`. `node_modules` and `.cache/{venv,models}` link to the existing caches.
