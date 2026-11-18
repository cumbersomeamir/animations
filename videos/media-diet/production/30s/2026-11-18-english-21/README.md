# Media Diet · 30 s English episode 21 — "This drill has no bit."

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama, accepted recipe
(`../../../context/11-production-format.md`) under the approved feedback rules (`../../../context/26-approved-feedback-rules-2026-11-11.md`,
incl. the 17 Nov addendum). Story: on 17 Nov 2026 Google signed to buy 50 MW from Quaise, whose millimeter-wave "drill" vaporizes rock
instead of grinding it. Why: about 25 °C more per kilometer wrecks bits, but super-hot water carries far more energy; a fusion-style beam
vaporizes rock and gas blows it out. Catch: the first wells still use ordinary drills. Payoff: Earth's heat for data centers day and night.
Frame 0 = the crust cutaway with the glowing beam + the hook words (also the thumbnail).
Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/36-production-30s-english21-01.md`); candidates compared,
facts, estimates and what is not claimed: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english21-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio tagged `eng`) |
| `thumbnail-english21-01.png` | separate vertical thumbnail (1080×1920): frame 0 ("This drill / has no bit.") |
| `publishing-caption.txt` | caption matching the final narration, with the deal details |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | candidates, facts, estimates · provenance · verification |
| `src/film.js` | three.js paper diorama: crust cutaway with strata that glow with depth, derrick, gyrotron truck, beam, vapor and sparks, tri-cone bit, thermometer, water loop, plant, data center and power line, volcano site, day/night sky, CTA sign; hook caption from frame 0; `window.renderThumb()` = frame 0 |
| `src/timeline.json` · `src/data/` | narration, shots, events · cues/lines |
| `audio/narration/` | committed Kokoro English takes |
| `build/` | `build.sh`, `render.mjs`, `render_chunks.sh`, `merge_bounds.py`, `thumb.mjs`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py`, `caption_sync.py`, `asr_check_en.py`, `contact.py` |

Rebuild: `bash build/build.sh`; `SKIP_FRAMES=1` reuses `frames/`. In this session `frames/`, `.cache/stills`, `.cache/qa_frames` and the
intermediate `audio/*.wav` are symlinks to the RAM disk `/dev/shm/md-e21` (recreate the links after a restart).
Thumbnail: `node build/thumb.mjs thumbnail-english21-01.png`.
