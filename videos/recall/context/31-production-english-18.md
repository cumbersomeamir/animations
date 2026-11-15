# 31 — English-18 (2026-11-15 batch 18): "A mirror for heat" (why a thermos has shiny walls inside)

**Output:** `videos/recall/production/30s/2026-11-15-english-18/recall-30s-english18-01.mp4` + separate vertical thumbnail
`recall-30s-english18-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 and 2026-11-15 batch notes (marketing structure, thumbnail, captions/labels x 100–900,
y 230–1500, frame 0 = thumbnail). **Style:** 15, unchanged (same performer with the E13 legs, café, palette, Fredoka caption pill,
English voice). **Language:** English narration and captions only. Previous MP4s are preserved, and no automation was created.

## Request essentials (user; facts about the brief)
- "NEXT EDUCATIONAL EPISODE … next batch18 on 15 November 2026": same rules as E13–E17 plus "FIRST FRAME IS CRITICAL".
- Topic: "Why a thermos has shiny walls inside" — vacuum reduces conduction/convection across the gap; reflective walls reduce
  radiative transfer; the lid is still a heat path; clear exploded flask and heat arrows used only for explanation; no quizzes;
  hook "A MIRROR FOR HEAT". "All batch17 delivered. Create ONE batch18 episode." Mid-turn the user wrote "Try again" after the
  session worker restarted; the already-finished build was re-verified and the episode completed.

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/recall` at ef9b1ce (E17 final), equal to the remote;
  no running jobs. CLAUDE.md names the assigned account amir@tensorblue.com.
- **Topic history:** no earlier episode explains vacuum flasks or the three heat-transfer routes; E15 only mentioned that "an
  insulated cup stays dry" as an example of condensation. The topic was kept.

## Final script (83 words, 27.18 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | A mirror for heat. | 0.94 |
| l02 | 1.20 | That's the shiny wall inside a thermos. Why does it need one? | 3.54 |
| l03 | 5.00 | Heat escapes three ways: through solids, through air, and as infrared light. | 4.19 |
| l04 | 9.45 | A thermos has two walls with a vacuum between them. | 2.64 |
| l05 | 12.35 | With almost no air there, heat can barely conduct or flow across. | 3.85 |
| l06 | 16.45 | But infrared crosses a vacuum, like sunlight through space. | 3.39 |
| l07 | 20.10 | So the walls are shiny, bouncing it back. | 2.21 |
| l08 | 22.60 | That leaves the top as the weak spot, so keep the lid on. | 3.14 |
| l09 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

## Sources (quotes, claim map and facts-vs-assumptions in the output folder's `docs/SOURCES.md`)
- **OpenStax College Physics 2e §14.7:** empty space has no "possibility of heat transfer by convection or conduction"; "no
  medium is required for electromagnetic waves"; "The radiation you feel is mostly infrared"; a silver surface is "a poor absorber
  and a poor radiator", a white one "reflects all radiation, like a mirror".
- **U. Illinois Physics Van:** "In a thermos bottle the air is pumped out between two vessels. That reduces convection. In
  addition, the surfaces are silvered. That reduces radiation heat transfer."
- **HyperPhysics (GSU):** the flask blocks heat "through the walls or through the open top".
- **Royal Institution:** Dewar's 1892 flask, "glass flasks fitted one inside the other and sealed at the neck with a partial
  vacuum between them", later improved "by narrowing the neck even further and putting a silvered coating on the outside to
  minimise heat loss".
- **NIST RP385 (1931):** residual gas still carried about a quarter of the heat across a silvered Dewar's vacuum (hence "almost",
  "barely").
- Britannica (bot check) and two OpenStax-derived course sites (HTTP 403) were not retried or circumvented and are not cited.
- **Facts vs assumptions:** the three routes, the vacuum, the silvering and the top as a heat path are stated by the sources; the
  share of loss through the top is not quantified; the widened gap, arrow counts/speeds and the zig-zag bounce are illustrative.

## CTA
Same verified wording as E13–E17 (listing-based): "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** a half-section of a flask on an oak counter with silver walls and orange infrared arrows zig-zagging in
  the gap; title "A MIRROR / FOR HEAT" (the brief's 4 words) over the dark café wall. No logo, fade or empty set.
- **Escalation:** the performer peeks into the steaming café flask, then looks up with one raised brow at "Why does it need one?".
- **Mechanism set (assembled step by step):** the bare inner bottle loses heat three ways (an arrow into the counter, warm-air
  loops, infrared arrows); the outer wall slides down and the gap's air is pumped out; conduction arrows stop at the empty gap;
  infrared crosses it; the walls turn to mirrors (a chrome matcap) and the infrared zig-zags between them; heat streams out of the
  open top until the lid clicks on.
- **Dropped during preview review:** infrared drawn inside the coffee (wrong place), a black shadow blob from the parked lid, orange
  coffee, thin arrows, a react framing that cut the face and later put the caption over the eyes, the lid behind the frame-0 title.

## Skill adjustments learned this round
- Draw radiation where it physically travels (across the gap), and widen gaps when needed, saying so in the notes.
- Hidden or parked props still cast shadows: hide them or disable `castShadow`.
- Never put a `//` comment inside a one-line statement group; a syntax error only shows as a renderer page error/timeout.

## Progress
- 2026-11-15 batch 18 (E18): setup confirmed; topic kept; sources verified (OpenStax, U. Illinois, HyperPhysics, Royal Institution,
  NIST); narration generated (ASR exact first time); timeline and caption sync pre-check OK; flask section built on E17/E15
  tooling; four preview passes (fixes above). Mix −14.56 LUFS, −1.6 dBTP, voice +15.9…+20.8 dB over the bed.
- Full render (`WORKERS=3 ./build.sh`): finished (the session worker restarted afterwards; the outputs were re-verified with an
  independent ffprobe frame count and full decode). 24/25 checks — `labels_in_central_region` failed ("solids" reached y 1463 in
  frames 202–224). Fix: label anchor raised; frames 198–228 re-rendered (`node render.mjs --pngdir build/frames --from 198 --to 228
  --physics build/physics.json`; a first attempt failed on a syntax slip from an inline comment, fixed), layout entries merged into
  `layout_0_299.json`, `./mux.sh`, then `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`: all 25 checks, narration sync and
  caption sync pass. Sheets and thumbnail reviewed. Committed, pushed and attached (MP4 + thumbnail). No further episode; no
  automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `4dbba22a206be61c290ca5ce41e4dbc0a0a306c25cfde34692c83b078e830d29` (7,217,283 bytes); thumbnail 1080x1920
  PNG sha256 `2b7da932…3714`.
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full decode clean.
- Frame 0: mirror-walled flask section + 4-word title at full opacity; equals the thumbnail apart from the pill (mean abs diff
  1.45/255).
- English ASR on the final mix (Whisper base.en): WER 0.0; narration within 0.2 ms; 16 spoken caption groups appear 0.05–0.07 s
  before their first word and stay past their last.
- −14.6 LUFS, −1.5 dBTP, 0 clipped samples; voice +15.9…+20.8 dB over the bed.
- Captions English only: title x 246–834, y 355–592; others x 223–858, y 341.5–464.5, ≤ 2 lines; y 0–230 clear; 7 labels, one at
  a time, inside x 110–890, y 561–1352, no overlaps; longest static run 42 frames.
- Limits: no human listening (ASR and levels only); gap and arrows illustrative, no heat-loss numbers; the review folder is not
  reachable from the cloud.

## Publishing caption
`production/30s/2026-11-15-english-18/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l08; l09) + one illustration note + 4 sources + hashtags. App identity: Recall; no other app names.

## Exact commands
`cd videos/recall/production/30s/2026-11-15-english-18 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail →
qa/qa.py → qa/narration_sync.py → qa/caption_sync.py); `TTS=1 ./build.sh` also regenerates the narration; `python3
make_caption.py` regenerates the post copy.

## Next
Only on user request.
