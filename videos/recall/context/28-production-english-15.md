# 28 — English-15 (2026-11-15 batch): "Where's this water from?" (why a cold drink sweats)

**Output:** `videos/recall/production/30s/2026-11-15-english-15/recall-30s-english15-01.mp4` + separate vertical thumbnail
`recall-30s-english15-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 batch note and the 2026-11-15 first-frame note. **Style:** 15, unchanged (same performer
with the E13 legs, café, palette, Fredoka caption pill, English voice). **Language:** English narration and captions only.
Previous MP4s are preserved, and no automation was created.

## Request essentials (user; facts about the brief)
- Next educational episode, batch 15 Nov 2026; same rules as E13–E14 (theory of marketing; pacing 0–3 / 3–5 / 5–21 / 21–27 /
  27–30 s; separate vertical thumbnail with 2–4 large words; one visual idea at a time; brief large labels; captions readable
  within x 100–900, y 230–1500; sequential reveals; no decorative lines; verified claims with facts vs assumptions in notes;
  no invented functionality; no boilerplate warnings; full checks; attach MP4 + thumbnail; honest limits).
- **New: "FIRST FRAME IS CRITICAL"** — no logo intro, fade from black or empty setup; frame zero must be a beautifully composed,
  surprising subject, readable on a phone, with at most 2–5 truthful curiosity words; the first image should work as the
  thumbnail; click-worthy does not mean misleading; hook audio immediately; promise a specific useful answer and deliver it;
  keep the app's approved aesthetic.
- Suggested topic: "Why a microwave heats your food but the plate feels different" (dielectric heating, dish conduction,
  inside-out misconception; first frame a cutaway bowl, "WHAT ACTUALLY HEATS?"). "Read prior episode history and avoid topic
  overlap; if already covered, select a genuinely different same-genre educational story with an equally strong opening."
- Queue after current work; never cancel or overwrite previous output.

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/recall` at e96ff85 (E14 final), equal to the remote;
  no running jobs. CLAUDE.md names the assigned account amir@tensorblue.com.
- **Topic history:** the suggested microwave food-vs-plate subject is **E11** (context 25: dielectric heating of water vs
  conduction into the plate, pottery that heats itself); the inside-out point is also in **R02** (16). Chosen instead: **why a
  cold drink "sweats"** — the water comes from the air (condensation below the dew point). H03 (17) showed an iced glass only
  as a prop for wet screens; no earlier episode explains condensation, dew point or humidity.

## Final script (83 words, 27.33 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | Where's this water from? | 0.99 |
| l02 | 1.35 | It isn't leaking: the drink is orange, but the drops are clear. | 3.37 |
| l03 | 5.05 | The air around you contains invisible water vapor. | 3.04 |
| l04 | 8.40 | Near the icy glass, that air cools below its dew point. | 3.22 |
| l05 | 11.95 | Vapor molecules then stick to the cold glass faster than they escape, forming drops. | 5.19 |
| l06 | 17.45 | More humid air means more vapor, so muggy days mean a sweatier glass. | 4.18 |
| l07 | 21.95 | An insulated cup stays dry: its outer wall doesn't get that cold. | 4.05 |
| l08 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

## Sources (quotes, claim map and facts-vs-assumptions in the output folder's `docs/SOURCES.md`)
- **NOAA, "Sweatin' to the Coldies":** "As air comes in contact with the glass, it is cooled to below the dew point
  temperature, and the water vapor contained in the air condenses onto the glass."; "The greater the moisture, the greater the
  water that can condense."
- **Penn State METEO 101, "Making Do with Dew Points":** dew point definition; dew point as "an absolute measure of the amount of
  water vapor in the air"; a vapor molecule striking the glass "may "stick""; rates of condensation and evaporation.
- **OpenStax College Physics 2e §13.6:** dew forms at or below the dew point; "the rate at which water molecules join together is
  greater than the rate at which they separate"; the vapor "is not held by the air" (hence "contains", not "holds").
- USGS Water Science School returned HTTP 403: not retried or circumvented, not cited.
- **Facts vs assumptions:** condensation and the humidity link are stated by the sources; the insulated-cup payoff is an
  **inference** from the same principle (no source tests cups); molecule sizes, speeds, counts and drop growth are illustrative.

## CTA
Same verified wording as E13–E14 (listing-based): "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** a close shot of a tall glass of iced orange drink beaded with clear condensation on a lime-ringed
  coaster in warm café light, with the title words "WHERE'S THIS / WATER FROM?" (4 words, lime second line). No logo, no fade,
  no empty set; ice clinks on frame 0 and the narrator speaks the title words from 0.05 s.
- **Proof in the hook:** labels "orange drink" vs "clear drops" — the drops cannot be the drink leaking.
- **Mechanism set:** a giant cutaway of the glass wall (frosted pane with bright edges, orange drink and ice behind); red-and-
  white water-vapor molecules zing in the air; a blue cold layer forms next to the glass and slows them; molecules land in
  beads that grow, a few leave again; the humid shot doubles the molecules and the big beads run.
- **Payoff:** the beaded glass next to a dry, double-wall insulated tumbler ("stays dry").
- **Thumbnail:** `node render.mjs --sheet` renders frame 0 with its title plus the Recall pill (no separate camera needed).
- **Audio:** ice clinks and fizz, drips, whooshes, vapor zings, a cold down-sweep, droplet plinks, a low humid swell, lid tick,
  chime.
- Dropped during preview review: a finger-wipe close-up (the hand read as blocky at that scale) and lifting the tumbler.

## Skill adjustments learned this round
- When frame 0 must be the thumbnail, make the first caption a title group (bigger, auto-fitted to x 100–900) and speak the same
  words first, so caption sync still holds.
- Instanced or child meshes inside a positioned group take local positions (the E11 bug recurred: molecules and drops were
  invisible until fixed).
- Thin transparent surfaces (a glass wall) need frost, edge bars and a low opacity, or they vanish in SwiftShader renders.

## Progress
- 2026-11-15 batch (E15): setup confirmed; topic changed (microwave plate = E11); sources verified (NOAA, Penn State, OpenStax;
  USGS 403 not circumvented); narration generated (ASR exact); timeline and caption sync pre-check OK; scene built from E14
  tooling; preview stills reviewed and fixed (finger wipe removed, glass position, molecule/drop local positions, brighter drink
  and beads, readable glass wall, cold layer, framing).
- Mix −14.62 LUFS, −1.6 dBTP, voice +16.4…+20.6 dB over the bed.
- Full render (`WORKERS=3 ./build.sh`, one process): all 25 checks, narration sync and caption sync passed on the first render;
  sheets and thumbnail reviewed (no stale overlays; frame 0 = thumbnail). Committed, pushed and attached (MP4 + thumbnail). No
  further episode; no automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `54f7cd7bbf4376b2fd1e93e6c7be61c633906c7aaedc968363c5d7fe037676aa` (14,525,249 bytes); thumbnail 1080x1920
  PNG sha256 `661b15d5…1b75`.
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full decode clean.
- Frame 0: beaded glass + 4-word title at full opacity; equals the thumbnail apart from the pill (mean abs diff 1.66/255).
- English ASR on the final mix (Whisper base.en): WER 0.0; narration within 0.1 ms; 12 spoken caption groups appear
  0.05–0.10 s before their first word and stay past their last.
- −14.6 LUFS, −1.5 dBTP, 0 clipped samples; voice +16.4…+20.6 dB over the bed.
- Captions English only: title x 203–877, y 379–565; others x 212–869, y 341.5–464.5, ≤ 2 lines; y 0–230 clear; 8 labels
  inside x 110–890, y 566–1459, no overlaps (two sequentially revealed pairs: orange drink/clear drops, cold glass/below dew
  point); longest static run 11 frames.
- Limits: no human listening (ASR and level measurements only); insulated-cup payoff is an inference and visuals are
  illustrative; the review folder is not reachable from the cloud.

## Publishing caption
`production/30s/2026-11-15-english-15/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l07; l08) + one illustration note + 3 sources + hashtags. App identity: Recall; no other app names.

## Exact commands
`cd videos/recall/production/30s/2026-11-15-english-15 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail →
qa/qa.py → qa/narration_sync.py → qa/caption_sync.py); `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
