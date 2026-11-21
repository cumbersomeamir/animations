# Media Diet · 30 s English episode 22 — "Five minutes. What's the catch?"

English narration + English captions, approved English voice. Style: **Layered Tech Cutaway** paper diorama (context/11) under the approved
feedback rules (context/26 incl. the 17 Nov addendum). Story: BYD claims 10→70 % in five minutes for its new Tai 9 SUV (launch 19 Nov 2026);
in BYD's own press demo the last 27 % took almost four more minutes. Why a megawatt charger can't just pour energy in: lithium ions plate as
metal when rushed and heat grows with current squared — the battery sets the pace, slower when full or cold. Payoff: five-minute claims mean
the middle of the battery. Brief/script/storyboard: `BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/37-production-30s-english22-01.md`);
candidates, facts and what is not claimed: `SOURCES.md`.

| path | what |
|---|---|
| `media-diet-30s-english22-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 CRF 20 + AAC, audio tagged `eng`) |
| `thumbnail-english22-01.jpg` | separate vertical thumbnail (1080×1920, JPEG): frame 0 ("FIVE MINUTES. / WHAT'S THE CATCH?") |
| `publishing-caption.txt` | caption matching the final narration, with the dated claim and demo |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | candidates, facts · provenance · verification (contact sheets as JPEG) |
| `src/film.js` · `src/timeline.json` · `src/data/` | three.js paper diorama and timing |
| `audio/narration/` · `build/` | committed Kokoro English takes · build, render, audio, QA scripts |

Rebuild: `bash build/build.sh`; `SKIP_FRAMES=1` reuses `frames/` (RAM-disk symlink `/dev/shm/md-e22`; recreate after a restart).
Thumbnail: `node build/thumb.mjs thumbnail-english22-01.png`, then `ffmpeg -i thumbnail-english22-01.png -q:v 2 thumbnail-english22-01.jpg` (JPEG kept for disk).
