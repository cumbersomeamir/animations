# 30 — English-17 (2026-11-15 batch 17): "That hole is on purpose" (why a tiny hole in an airplane window matters)

**Output:** `videos/recall/production/30s/2026-11-15-english-17/recall-30s-english17-01.mp4` + separate vertical thumbnail
`recall-30s-english17-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 and 2026-11-15 batch notes (marketing structure, thumbnail, captions/labels x 100–900,
y 230–1500, frame 0 = thumbnail). **Style:** 15, unchanged (same performer, palette, Fredoka caption pill, English voice); a new
everyday place (an airliner window seat). **Language:** English narration and captions only. Previous MP4s are preserved, and no
automation was created.

## Request essentials (user; facts about the brief)
- "NEXT EDUCATIONAL EPISODE … next batch17 on 15 November 2026": same rules as E13–E16 plus "FIRST FRAME IS CRITICAL".
- Topic: "Why a tiny hole in an airplane window matters" — passenger window layers and breather-hole pressure equalisation;
  reliable engineering sources; no exaggeration; educational 3D cutaway and simple pressure dots; "Frame0 glowing hole: THAT HOLE
  IS ON PURPOSE"; not a quiz. "All batch16 delivered. Create ONE batch17 episode."

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/recall` at 3f39af1 (E16 final), equal to the remote;
  no running jobs. CLAUDE.md names the assigned account amir@tensorblue.com.
- **Topic history:** no earlier episode covers aircraft, windows or cabin pressure; the topic was kept.
- **Title words:** the brief's frame-0 words "THAT HOLE IS ON PURPOSE" (5 words) were used as given; the first-frame rule allows
  2–5 words (the older thumbnail rule says 2–4), and the user named these words explicitly.

## Final script (83 words, 24.51 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | That hole is on purpose. | 1.22 |
| l02 | 1.55 | It decides which layer holds the cabin in. | 2.19 |
| l03 | 4.65 | Up high, cabin air pushes out much harder than the thin air outside. | 3.69 |
| l04 | 8.75 | The thick outer layer takes that push. | 1.73 |
| l05 | 10.90 | The hole lets cabin air into the gap behind the middle layer. | 3.10 |
| l06 | 14.45 | Equal pressure on both sides means that layer carries no load. It's the backup. | 4.89 |
| l07 | 20.60 | See fog between the layers? That's moist cabin air that came in through the hole. | 4.41 |
| l08 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

- Iteration: "pane" was transcribed as "pain" (a homophone, not a pronunciation fault) and "Fog between" as "fogged" → "layer"
  and "See fog …".

## Sources (quotes, claim map and facts-vs-assumptions in the output folder's `docs/SOURCES.md`)
- **FAA AC 25.775-1 (2003):** cabin windows are "typically multi-paned construction consisting of two structural panes (a main
  load bearing pane and a fail-safe pane), inner facing panes …", "separated by an air gap"; "the fail-safe pane is not loaded
  unless the main pane has failed".
- **US Patent 5,988,566 (Airbus):** "the strong outer window pane takes up the cabin interior pressure in normal operating
  condition"; the gap is "connected to the interior of the cabin through a small diameter bore so as to provide a pressure
  equalization"; the auxiliary pane takes the load if the main pane breaks; the connection "facilitates fogging … when moist
  air enters into the space between the panes".
- **AviationPros (trade):** vent holes equalise the window's dead airspace with the cabin; the inner panel is "a crucial backup".
- eCFR (bot check) was not retried or circumvented and is not cited.
- **Facts vs assumptions:** layer roles, the equalising hole and the backup are stated by the sources; "three layers" is typical,
  not universal; the popular "the hole prevents fog" claim is **not** used (the patent says the connection lets moist air in);
  dot densities, layer thicknesses and the enlarged hole marker are illustrative; no pressure numbers.

## CTA
Same verified wording as E13–E16 (listing-based): "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** an oval window on a cream sidewall at sunset over a sea of pink clouds, shade partly down, the hole in
  the middle layer glowing lime; title "THAT HOLE IS / ON PURPOSE" above the window. No logo, fade or empty set.
- **Escalation:** the performer in the window seat leans in, eyes on the hole, then a raised brow to camera.
- **Mechanism set:** a giant section through the window (cabin side warm brown, outside sky blue); cream air dots show density:
  the outside thins during the climb; lime arrows press on the outer layer; a lime ring marks the hole and dots pass both ways;
  equal white arrows on both sides of the middle layer ("no load"); the middle layer outlined as the "backup".
- **Payoff:** back at the window, fog spreads between the layers from the hole; an extreme close-up shows tiny moist-air dots
  drifting in.
- **Dropped during preview review:** a pointing hand (blocky fist), a too-close hook (window filled the frame, grey haze, clouds
  lit from behind), white dots on a cream backdrop, a black void in the section gap, an oversized hole glow; after the full
  render, a label anchored below the hole (clamped past y 1460) and a thumbnail pill next to the hole.

## Skill adjustments learned this round
- Avoid homophones the ASR check cannot separate ("pane"/"pain"); choose an equally accurate synonym ("layer").
- Sky/clouds seen through a window: self-lit (emissive) clouds and a gradient whose horizon sits inside the visible band.
- Transparent section slabs need a back plate behind the cut and contrasting backdrops for the dots.

## Progress
- 2026-11-15 batch 17 (E17): setup confirmed; topic kept; sources verified (FAA AC 25.775-1, Airbus US 5,988,566, AviationPros);
  narration generated (one rewording for ASR homophones); timeline and caption sync pre-check OK; cabin set and section built on
  E16 tooling; four preview passes (fixes above). Mix −14.59 LUFS, −1.6 dBTP, voice +15.7…+19.2 dB over the bed.
- Full render (`WORKERS=3 ./build.sh`, one process): 24/25 checks — `labels_in_central_region` failed (the "moist cabin air" label
  reached y 1461 in frames 722–791 as the camera pushed in). Fix: label anchored above the hole; frames 675–791 re-rendered
  (`node render.mjs --pngdir build/frames --from 675 --to 732` and `--from 733 --to 791`), layout entries merged into
  `layout_600_899.json`, `./mux.sh`, then `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`: all 25 checks, narration
  sync and caption sync pass. Thumbnail pill moved below the window (`node render.mjs --sheet build/sheet`). Sheets and thumbnail
  reviewed. Committed, pushed and attached (MP4 + thumbnail). No further episode; no automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `97c70f905eb469331ee461d26e9eac38ce8ce8e506fdeed229236906b96064e1` (11,079,293 bytes); thumbnail 1080x1920
  PNG sha256 `b6e687ea…63b2`.
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full decode clean.
- Frame 0: sunset window with the glowing hole + 5-word title at full opacity; equals the thumbnail apart from the pill (mean abs
  diff 1.38/255).
- English ASR on the final mix (Whisper base.en): WER 0.0; narration within 0.1 ms; 14 spoken caption groups appear
  0.05–0.07 s before their first word and stay past their last.
- −14.6 LUFS, −1.6 dBTP, 0 clipped samples; voice +15.7…+19.2 dB over the bed.
- Captions English only: title x 203–877, y 372–572; others x 223–858, y 341.5–464.5, ≤ 2 lines; y 0–230 clear; 7 labels, one at
  a time, inside x 110–890, y 561–696, no overlaps; longest static run 15 frames.
- Limits: no human listening (ASR and levels only); "three layers" is typical, visuals illustrative, no pressure numbers; 5-word
  title per the brief; the review folder is not reachable from the cloud.

## Publishing caption
`production/30s/2026-11-15-english-17/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l07; l08) + one illustration note + 2 sources + hashtags. App identity: Recall; no other app names.

## Exact commands
`cd videos/recall/production/30s/2026-11-15-english-17 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail →
qa/qa.py → qa/narration_sync.py → qa/caption_sync.py); `TTS=1 ./build.sh` also regenerates the narration; `python3
make_caption.py` regenerates the post copy.

## Next
Only on user request.
