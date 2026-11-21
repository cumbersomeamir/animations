# Media Diet · 30 s English episode 23 — "Kicked flat. How does it get up?"

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama (context/11) under the approved
feedback rules (context/26 incl. the 17 Nov addendum). Story: a new preprint (ReLoco, 18 Nov 2026) kicked a 64.5 kg Tiangong 3.0 humanoid
47 times; the hidden trick behind getting up is static balance — plant the hands for a wide base, move the centre of mass back over the
feet until the hands carry 0 N, then let go and stand — learned in simulation with a 400 N head lift that faded to zero. On the real robot,
34 falls ended in 34 get-ups (mean 2.64 s); payoff: it proves recovery, not toughness (kick force never measured). Brief/script/storyboard:
`BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/38-production-30s-english23-01.md`); candidates, facts and what is not claimed: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english23-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 CRF 23 + AAC, audio tagged `eng`) |
| `thumbnail-english23-01.jpg` | separate vertical thumbnail (1080×1920, JPEG): frame 0 ("KICKED FLAT. / HOW DOES IT GET UP?") |
| `publishing-caption.txt` | caption matching the final narration, with the dated preprint and hardware counts |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | candidates, facts · provenance · verification (contact sheets/frames as JPEG) |
| `src/film.js` · `src/timeline.json` · `src/data/` | three.js paper diorama and timing |
| `audio/narration/` · `build/` | committed Kokoro English takes · build, render, audio, QA scripts |

Rebuild: `bash build/build.sh`; `SKIP_FRAMES=1` reuses `frames/` (RAM-disk symlink `/dev/shm/md-e23`; recreate after a restart).
Parallel render: `TMPDIR=/dev/shm/md-e23/tmp bash build/render_chunks.sh 0 60 120 180 240` (and 300…540, 600…840 in two more shells);
keep Chromium's temp files on the RAM disk — with little disk free they spike by ~8 MB and a worker died with "Unable to capture screenshot".
Thumbnail: `node build/thumb.mjs thumbnail-english23-01.png`, then `ffmpeg -i thumbnail-english23-01.png -q:v 2 thumbnail-english23-01.jpg` (JPEG kept for disk).
