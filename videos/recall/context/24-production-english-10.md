# 24 — English-10 (2026-11-09 batch): "Sunglasses on, and your phone goes black. Turn it, and it's back. Why?"

**Output:** `videos/recall/production/30s/2026-11-09-english-10/recall-30s-english10-01.mp4`

**Format:** 11. **Style:** 15, kept as most recently accepted in E06–E09 (same café, performer, lime phone, giant mechanism
set, lime/paper/ink palette, Fredoka caption pill, English voice). **Language:** English narration and captions only.
Previous MP4s are preserved, and no automation was created.

## Request essentials (user; facts about the brief)
- Batch 2026-11-09-english-10. One new 30 s English educational episode. Suggested topic: why a QR code still scans when part
  of it is covered (redundant information and error correction, an original working QR example, damage-tolerance levels as
  opposed to a universal promise). No quiz. If the topic was already covered, choose another fresh, equally useful one in the
  same genre.
- Keep the most recently accepted style, palette, character, scene grammar and voice; first second visibly intriguing;
  concrete payoff; one short truthful CTA in the last 3–4 s; no long disclaimer; music quiet under speech; primary sources
  cited; publishing caption = final transcript, correct app identity, no editing instructions, no other app names. Finish all
  already accepted earlier jobs in order first; do not cancel or duplicate them.
- "The user approved improvements from the Instagram App Performance sheet": the sheet was not provided in this chat; the
  improvements named in the brief were applied. No sheet data is stored here.

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/recall`. Earlier jobs: E09 was finished, committed
  and pushed first (fdafdb5, remote verified); **no running jobs** before E10 started.
- **Topic history:** the suggested QR subject is **F01** (context 14: "Why QR codes can still scan with a logo in the middle",
  with error-correction tiles and the no-fixed-percentage caveat). It is a duplicate, so a fresh subject was chosen: **why a
  phone screen can look black through polarized sunglasses, why turning the phone brings it back, and a rotate test for
  polarized lenses.** "polariz" and "sunglass" appear in no earlier context or episode.

## Final script (74 words, 24.97 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.45 | Sunglasses on, and your phone goes black. Turn it, and it's back. Why? | 4.09 |
| l02 | 4.95 | Many screens give off light that vibrates one way, set by a filter. | 3.93 |
| l03 | 9.30 | Polarized sunglasses filter one direction too, cutting glare off water and roads. | 5.04 |
| l04 | 14.80 | When the filters cross, the light is blocked; turn the phone, and it passes. | 3.96 |
| l05 | 19.20 | So just rotate the phone. And if it darkens, your sunglasses are polarized. | 4.66 |
| l06 | 26.35 | Download Recall for learning any new subject with AI. | 3.29 |

- Generated fresh with the cached Kokoro model (sha256 8fbea51e…34cb) and the established English Recall blend; no Hindi or
  earlier audio reused.
- Wording for truthfulness: "Many screens" (the sources speak of LCDs; no share claim); the test is stated one way only
  ("if it darkens, … polarized").

## Sources (quotes and claim map in the output folder's `docs/SOURCES.md`)
- **US10185162B2** "Single lens glare-reducing eyewear without causing LCD screen blackout": "Light from an LCD screen is
  usually linearly polarized."; "LCD screens use a pair of crossed linear polarizers."; polarized sunglasses use "a
  linear-polarizing filter embedded in a lens system"; "To reduce glare caused by horizontally-polarized reflections, some
  sunglasses use a vertical-polarizing film."; sunglasses "tend to blackout the LCD screen when the transmission axis … is
  orthogonal to linearly-polarized light from the LCD screen".
- **US7633583B2** "Controlling polarization for liquid crystal displays": "Polarized sunglasses usually have a vertical
  transmission in order to block out the strong horizontally polarized" (glare); "appears black to viewers wearing polarized
  sunglasses"; brightness "will bear a factor of cos θ".
- **HyperPhysics "Polarization by Reflection"** (GSU): reflected light is polarized "parallel to the plane of the surface from
  which it is reflecting"; "At other angles the reflected light is partially polarized."
- **HyperPhysics "Classification of Polarization"**: linear polarization; "natural light is generally unpolarized".
- **Inferences (stated in SOURCES.md):** water and roads are horizontal reflecting surfaces; only a polarizing lens changes
  the screen's brightness with angle, so darkening on rotation means polarized.
- Not usable: Edmund Optics and OU Health (Cloudflare challenge), AAO (HTTP 403). No bot check circumvented.

## Product-fact check (CTA)
Same CTA as 16–23. "with AI" is the user's wording and is not confirmed in the saved listing or public site text (context 16).
No learning guarantee.

## Creative decisions (choices, not facts)
- **Same café, performer and lime phone as F01/E06–E09** (`buildCafe` / `buildPerson` / `buildPhone` byte-identical). New:
  original low-poly sunglasses (worn, and held for the test), an original "Field notes" reading page.
- **Opening = demonstration in POV:** a sunglass lens (tint + rim) drops over the view at 0.35 s and the bright page turns
  black; at 2.7 s the phone turns sideways and is bright again.
- **Mechanism set:** filters as slotted "picket fence" panels (see-through), waves as ribbons: gold = ordinary light in every
  direction, lime = one direction after the screen filter, coral = glare vibrating sideways. Three stations: light panel +
  horizontal-slot screen filter; giant vertical-slot lens over water with the sun (mirror geometry), glare stopped; a giant
  phone behind the lens, crossed (blocked) then turned 90° (passes toward the viewer).
- **Payoff:** POV rotate (dark → bright), then a top-down test: one lens held over the flat phone and turned 90°, the screen
  under it darkens ("darkens = polarized"); on-screen takeaway "Rotate the phone. / Darkens? Polarized lenses." (no VO).
- **Brightness model:** Malus (cos²) between the screen filter and a vertical lens axis; illustrative (the caption note says
  a screen's filter direction varies by phone).
- **Audio:** accepted score engine retimed; slide/tick/thunk for the lens, swishes for rotations, hum and clunk for the
  panel and filter, sun shimmer and glints, bonk for blocked glare, thud/fizzle for crossed, shimmer + rising beeps for
  passing, down-sweep for the test, chime for the takeaway; English bed gains 0.5/0.6.

## Skill adjustments learned this round
- Portrait frames are narrow: lay a light path toward the camera from a high front three-quarter view (back → front = top →
  bottom of the frame) instead of across the frame; check framing with a quick projection script before rendering stills.
- Ribbons are flat bands: a vibration plane seen edge-on disappears. Pick a camera that sees every vibration direction in
  the shot at ≥ ~0.6 of full length.
- `Shape.getPoints()` on a closed path repeats the first point; drop it before a closed `CatmullRomCurve3`, or the tube
  draws a stray loop (seen as a long bar under the test lenses).
- Same-colour waves vanish against a same-colour light source (paper on a cream panel): give unpolarized light its own
  colour (gold).

## Progress
- 2026-11-09 batch: E09 finished first (fdafdb5). Topic changed (QR = F01); sources verified; narration generated and
  ASR-checked; timeline and caption sync pre-check OK (leads 0.05–0.10 s); scene built from E09 tooling (explicit composite
  renderer kept).
- Preview stills reviewed and fixed:
  - giant shots re-laid for portrait (high front three-quarter cameras; see-through filters; panel/phone moved back; sun
    placed with mirror geometry and in frame);
  - unpolarized light made gold (was invisible against the panel);
  - test close-up: one lens centred over the screen and rotated about it, only that lens darkens, hand holds the far hinge;
    rim spline loop fixed; the phone's in-hand fingertip blocks hidden while it lies flat; rotation moved to 21.3 s so the
    clear view is seen first;
  - POV camera pulls back as the phone turns sideways.
- Mix −14.59 LUFS, −1.6 dBTP, voice +15.5…+17.3 dB over the bed.
- Full render (`WORKERS=3 ./build.sh`, one process): all 25 checks, narration sync and caption sync passed, but the hook
  had a near-still stretch (0.63–2.57 s, 59 frames: black phone held steady). Fixed with a slow push-in, a small puzzled
  shake before the turn and a lens sheen; frames 0–107 re-rendered, re-muxed, layout log merged, all QA re-run (longest
  still run 11 frames). Committed, pushed and attached. No further episode; no automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `bba454f18f84de22e3a6dcd50b56ce3307594e2216e700404b24a9898c18231d` (9,305,894 bytes).
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full decode clean.
- English ASR on the final mix (Whisper base.en): WER 0.014 (only "too" → "two"); narration within 0.2 ms; 11 spoken caption
  groups appear 0.05–0.10 s before their first word and stay past their last.
- −14.6 LUFS, −1.4 dBTP (MP4), 0 clipped samples; voice +15.5…+17.3 dB over the bed.
- Captions English only, ink x 175–905, y 341.5–464.5, ≤ 2 lines; nothing above y 300; 9 labels inside x 110–974,
  y 570–1455; no overlaps; longest static run 11 frames.
- Limits: ASR-only listening check; illustrative giant set and brightness model; screen filter direction varies by phone;
  the rotate test is stated one way only; "with AI" is the user's wording.

## Publishing caption
`production/30s/2026-11-09-english-10/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l05; l06) + one illustration note + 4 sources + hashtags. App identity: Recall; no other app
names; no editing instructions.

## Exact commands
`cd videos/recall/production/30s/2026-11-09-english-10 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → qa/qa.py →
qa/narration_sync.py → qa/caption_sync.py); `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
