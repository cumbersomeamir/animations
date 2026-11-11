# Media Diet · 30 s English episode 12 — "Why is 500 km/h so hard?"

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama, accepted recipe
(`../../../context/11-production-format.md`) under the approved feedback rules (`../../../context/26-approved-feedback-rules-2026-11-11.md`).
Story: BYD's YANGWANG U9 Xtreme reached 503.17 km/h in a single-direction run (1 Nov 2026, FIA-recognised 6 Nov 2026).
Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/27-production-30s-english12-01.md`); facts,
calculations and assumptions: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english12-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio tagged `eng`) |
| `thumbnail-english12-01.png` | separate vertical thumbnail (1080×1920): "500 KM/H / WHY HARD?" |
| `publishing-caption.txt` | caption matching the final narration, with the record details |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts, calculations, assumptions · provenance · verification |
| `src/film.js` | three.js paper diorama: desert straight + generic paper hypercar (reconstruction), speedometer, air flow + drag arrow, instanced cube lab (v² → v³, 4³ vs 5³, +1 % slabs), motor/battery cutaway, thermometer, one-way road diagram, CTA sign; captions + one large label at a time; `window.renderThumb()` for the thumbnail |
| `src/timeline.json` · `src/data/` | narration, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro English takes |
| `build/` | `build.sh`, `render.mjs`, `render_chunks.sh` (resumable 60-frame chunks), `merge_bounds.py`, `thumb.mjs`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py` (x 100–900 / y 230–1500 rules), `caption_sync.py`, `asr_check_en.py`, `contact.py` |

Rebuild: `bash build/build.sh` (renders with three chunk workers, then audio, encode, QA); `SKIP_FRAMES=1` reuses `frames/`.
Thumbnail: `node build/thumb.mjs thumbnail-english12-01.png`. `node_modules` and `.cache/{venv,models}` link to the existing caches.
