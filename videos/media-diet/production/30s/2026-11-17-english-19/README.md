# Media Diet · 30 s English episode 19 — "Tiny label. Big problem."

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama, accepted recipe
(`../../../context/11-production-format.md`) under the approved feedback rules (`../../../context/26-approved-feedback-rules-2026-11-11.md`).
Story: robot arms run by Genesis AI packed and taped a box for TechCrunch (17 Nov 2026), but on a rerun struggled to peel a tiny label.
Why: the thin-film peel law — pulled nearly flat a label needs dozens of times more force than pulled straight up, so the first edge must be
lifted; Genesis learns touch from sensor gloves, yet its hands wear out in weeks. Takeaway: lift a corner, then pull steep.
Frame 0 = the gloved fingertip on the tiny label + the hook words (also the thumbnail).
Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/34-production-30s-english19-01.md`); facts, physics and
what is not claimed: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english19-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio tagged `eng`) |
| `thumbnail-english19-01.png` | separate vertical thumbnail (1080×1920): frame 0 ("Tiny label. / Big problem.") |
| `publishing-caption.txt` | caption matching the final narration, with the demo details |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts, physics, assumptions · provenance · verification |
| `src/film.js` | three.js paper diorama: gloved robot hands with jointed fingers, worker's hand, box with flaps and tape, label strip with a curling label (ribbon), peel cutaway with force arrows, CTA sign; hook caption from frame 0; `window.renderThumb()` = frame 0 |
| `src/timeline.json` · `src/data/` | narration, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro English takes |
| `build/` | `build.sh`, `render.mjs`, `render_chunks.sh` (resumable 60-frame chunks), `merge_bounds.py`, `thumb.mjs`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py` (x 100–900 / y 230–1500 rules), `caption_sync.py`, `asr_check_en.py`, `contact.py` |

Rebuild: `bash build/build.sh` (renders with three chunk workers, then audio, encode, QA); `SKIP_FRAMES=1` reuses `frames/`.
In this session `frames/`, `.cache/stills` and `.cache/qa_frames` are symlinks to the RAM disk `/dev/shm/md-e19` (disk allowance nearly full).
Thumbnail: `node build/thumb.mjs thumbnail-english19-01.png`. `node_modules` and `.cache/{venv,models}` link to the existing caches.
