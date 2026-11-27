# Media Diet · 30 s English episode 25 — "We hit an asteroid. Here's the scar."

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama (context/11) under the approved
feedback rules (context/26 incl. the 17 Nov addendum). Story: ESA's Hera (images released 25 Nov 2026) finds a stadium-sized crater on the
moonlet Dimorphos, hit by NASA's DART in 2022 at 6.1 km/s; its orbit shortened by 33 minutes, far more than predicted. Mechanism: the
impact threw rubble backward like rocket exhaust, and that recoil multiplied the push about 3.6× (Cheng et al., Nature 2023) — the
rubble did most of the pushing. Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md` (copy of
`../../../context/40-production-30s-english25-01.md`); candidates, facts and what is not claimed: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english25-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 CRF 20 + AAC, audio tagged `eng`) |
| `thumbnail-english25-01.jpg` | separate vertical thumbnail (1080×1920, JPEG): frame 0 ("WE HIT AN ASTEROID. / HERE'S THE SCAR.") |
| `publishing-caption.txt` | caption matching the final narration, with the dated release and measured numbers |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | candidates, facts · provenance · verification (contact sheets/frames as JPEG) |
| `src/film.js` · `src/timeline.json` · `src/data/` | three.js paper diorama and timing |
| `audio/narration/` · `build/` | committed Kokoro English takes · build, render, audio, QA scripts |

Produced in RAM because the container's disk is full (see context/40 "Operational"): sparse partial clone at `/dev/shm/repo25`,
`node_modules/three`, `@fontsource/*`, `.cache/models` and `.cache/venv` symlinked read-only to the existing copies on disk.
Rebuild: `bash build/build.sh`; `SKIP_FRAMES=1` reuses `frames/`. Parallel render with Chromium temp files in RAM:
`TMPDIR=/dev/shm/md-e25/tmp bash build/render_chunks.sh 0 60 120 180 240` (and 300…540, 600…840 in two more shells).
Thumbnail: `node build/thumb.mjs /dev/shm/md-e25/thumbnail-english25-01.png`, then `ffmpeg -i … -q:v 2 thumbnail-english25-01.jpg`.
