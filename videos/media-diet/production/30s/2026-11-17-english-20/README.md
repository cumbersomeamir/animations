# Media Diet · 30 s English episode 20 — "24 hours to say hello."

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama, accepted recipe
(`../../../context/11-production-format.md`) under the approved feedback rules (`../../../context/26-approved-feedback-rules-2026-11-11.md`,
incl. the 17 Nov addendum). Story: on 18 Nov 2026 Voyager 1 reaches one light-day from Earth (NASA); how we still hear its fridge-bulb
radio — inverse-square spreading leaves less than 10⁻¹⁸ W at Earth (estimate), a narrow beam plus 70 m dishes catch it, while its nuclear
power drops ~4 W a year. Takeaway: bigger ears beat a louder voice. Frame 0 = paper Voyager + the hook words (also the thumbnail).
Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/35-production-30s-english20-01.md`); candidates compared,
facts, estimates and what is not claimed: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english20-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio tagged `eng`) |
| `thumbnail-english20-01.png` | separate vertical thumbnail (1080×1920): frame 0 ("24 hours / to say hello.") |
| `publishing-caption.txt` | caption matching the final narration, with the NASA date |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | candidates, facts, estimates · provenance · verification |
| `src/film.js` | three.js paper diorama on a raised "space stage": Voyager model, Earth, radio rings and 24-hour dial, inverse-square rig, beam footprint and cone, 70 m dish, RTG glow and gauge, big vs small dish, CTA sign; hook caption from frame 0; `window.renderThumb()` = frame 0 |
| `src/timeline.json` · `src/data/` | narration, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro English takes |
| `build/` | `build.sh`, `render.mjs`, `render_chunks.sh`, `merge_bounds.py`, `thumb.mjs`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py`, `caption_sync.py`, `asr_check_en.py`, `contact.py` |

Rebuild: `bash build/build.sh`; `SKIP_FRAMES=1` reuses `frames/`. In this session `frames/`, `.cache/stills`, `.cache/qa_frames` and the
intermediate `audio/*.wav` are symlinks to the RAM disk `/dev/shm/md-e20` (disk allowance nearly full; recreate the links after a restart).
Thumbnail: `node build/thumb.mjs thumbnail-english20-01.png`.
