# Media Diet · 30 s English episode (english-08) — text a recipe photo to Alexa for Shopping, the ingredients land in your cart

English narration + English captions. Style: **Layered Tech Cutaway**, accepted recipe unchanged (`../../../context/11-production-format.md`).
Brief/script/storyboard/citations/style notes: `BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/21-production-30s-english08-01.md`).

| path | what |
|---|---|
| `media-diet-30s-english08-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio tagged `eng`) |
| `publishing-caption.txt` | concise caption matching the final narration, with the source |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts file · provenance · verification |
| `src/film.js` | three.js paper diorama (recipe card + phone camera + cart hook, calendar + source placard, text-thread invitation, "Before" search montage, "Now" photo-to-cart, "1 text" vs seven searches, U.S. map invite-only rollout, sign) + English caption overlay |
| `src/timeline.json` · `src/data/` | narration, cues, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro English takes |
| `build/` | `build.sh`, `render.mjs`, `render_chunks.sh` (resumable 60-frame chunks), `merge_bounds.py`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py`, `caption_sync.py`, `asr_check_en.py`, `contact.py` |

Rebuild: `build/render_chunks.sh 0 60 … 840` (or two halves in parallel), then `SKIP_FRAMES=1 bash build/build.sh`
(`REGEN_VOICE=1` re-synthesises narration). `node_modules` and `.cache/{venv,models}` are links to the existing caches.
