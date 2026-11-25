# Media Diet · 30 s English episode 24 — "The safety net spread the crash."

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama (context/11) under the approved
feedback rules (context/26 incl. the 17 Nov addendum). Story: Microsoft's post-incident report (20 Nov 2026) on the 12 Nov 2026 outage —
a hidden bug froze busy gateway servers, and the automatic rerouting that normally keeps the service up moved their traffic onto fewer
servers until those froze too: over 80 % of North American servers within two hours, then every region. Payoff: rerouting needs spare
room, so Microsoft plans walled-off server pools. Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md` (copy of
`../../../context/39-production-30s-english24-01.md`); candidates, facts and what is not claimed: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english24-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 CRF 20 + AAC, audio tagged `eng`) |
| `thumbnail-english24-01.jpg` | separate vertical thumbnail (1080×1920, JPEG): frame 0 ("THE SAFETY NET / SPREAD THE CRASH.") |
| `publishing-caption.txt` | caption matching the final narration, with the dated report and its findings |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | candidates, facts · provenance · verification (contact sheets/frames as JPEG) |
| `src/film.js` · `src/timeline.json` · `src/data/` | three.js paper diorama and timing |
| `audio/narration/` · `build/` | committed Kokoro English takes · build, render, audio, QA scripts |

Produced in RAM because the container's disk was full (see context/39 "Operational"): sparse partial clone at `/dev/shm/repo24`,
`node_modules/three`, `@fontsource/*`, `.cache/models` and `.cache/venv` symlinked read-only to the existing copies on disk.
Rebuild: `bash build/build.sh`; `SKIP_FRAMES=1` reuses `frames/`. Parallel render with Chromium temp files in RAM:
`TMPDIR=/dev/shm/md-e24/tmp bash build/render_chunks.sh 0 60 120 180 240` (and 300…540, 600…840 in two more shells).
Thumbnail: `node build/thumb.mjs /dev/shm/md-e24/thumbnail-english24-01.png`, then `ffmpeg -i … -q:v 2 thumbnail-english24-01.jpg`.
