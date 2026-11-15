# Media Diet · 30 s English episode 18 — "Copper isn't magnetic."

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama, accepted recipe
(`../../../context/11-production-format.md`) under the approved feedback rules (`../../../context/26-approved-feedback-rules-2026-11-11.md`).
Story: Jake Rogers' 3D-printed mini hoverboard (YouTube, 13 Nov 2026 UTC) floats over copper, which isn't magnetic. Why: spinning magnets
drive eddy currents whose own field pushes back (Lenz); stop spinning and it drops; the limit is the outward pull on every magnet; the lift
needs motion and metal. Frame 0 = the board hovering over the copper + the hook words (also the thumbnail).
Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/33-production-30s-english18-01.md`); facts, estimates
and what is not claimed: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english18-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio tagged `eng`) |
| `thumbnail-english18-01.png` | separate vertical thumbnail (1080×1920): frame 0 ("Copper isn't / magnetic.") |
| `publishing-caption.txt` | caption matching the final narration, with the demonstration details |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts, estimates, assumptions · provenance · verification |
| `src/film.js` | three.js paper diorama: brushed copper plate (metal reflections on that material only), pink board with two 12-magnet rotors, schematic eddy-current loops, push-back and outward-pull arrows, 6 kg weight, paving, CTA sign; hook caption from frame 0; `window.renderThumb()` = frame 0 |
| `src/timeline.json` · `src/data/` | narration, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro English takes |
| `build/` | `build.sh`, `render.mjs`, `render_chunks.sh` (resumable 60-frame chunks), `merge_bounds.py`, `thumb.mjs`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py` (x 100–900 / y 230–1500 rules), `caption_sync.py`, `asr_check_en.py`, `contact.py` |

Rebuild: `bash build/build.sh` (renders with three chunk workers, then audio, encode, QA); `SKIP_FRAMES=1` reuses `frames/`.
Thumbnail: `node build/thumb.mjs thumbnail-english18-01.png`. `node_modules` and `.cache/{venv,models}` link to the existing caches.
