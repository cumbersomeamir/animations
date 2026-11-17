# 32 — English-19 (2026-11-17 batch 19): "Hotter than boiling water" (why a pressure cooker cooks faster)

**Output:** `videos/recall/production/30s/2026-11-17-english-19/recall-30s-english19-01.mp4` + separate vertical thumbnail
`recall-30s-english19-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 and 2026-11-15 batch notes (marketing structure, thumbnail, captions/labels x 100–900,
y 230–1500, frame 0 = thumbnail). **Style:** 15, unchanged (same performer with the E13 legs, café, palette, Fredoka caption pill,
English voice). **Language:** English narration and captions only. Previous MP4s are preserved, and no automation was created.

## Request essentials (user; facts about the brief)
- "NEXT EDUCATIONAL EPISODE … next batch19 on 17 November 2026": same rules as E13–E18 plus "FIRST FRAME IS CRITICAL".
- Suggested topic: "Why induction cooks a pan but not the glass directly" (alternating magnetic field, induced currents in a
  compatible pan, resistance heating, glass may warm from the pan; no quiz, no unsafe demonstration). "Review the actual
  completed conversation history first; if this was already covered select a genuinely different specific topic in the same
  genre." "Create ONE new English episode only."

## Setup confirmation and history check → topic changed (why)
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/recall` at 3a04b02 (E18 final), equal to the remote;
  no running jobs. CLAUDE.md names the assigned account amir@tensorblue.com.
- **Topic history:** the induction subject is **H04** (2026-11-04, context 18): copper coil → rapidly changing magnetic field →
  eddy currents in the iron base heat the pot itself; aluminium or glass vessels often don't heat; magnet test. An English version
  would repeat it. Chosen instead (same kitchen-physics genre): **why a pressure cooker cooks faster** — boiling point rises with
  pressure; the reverse at altitude. No earlier episode covers boiling points, pressure or altitude.

## Final script (77 words, 26.26 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | Hotter than boiling water. | 1.22 |
| l02 | 1.45 | A pressure cooker keeps water liquid above 100 degrees. | 3.43 |
| l03 | 5.10 | Water boils when its vapor pushes as hard as the air above it. | 3.56 |
| l04 | 8.90 | At sea level, that's 100 degrees. | 2.07 |
| l05 | 11.20 | Lock the lid, and steam can't escape, so the pressure rises. | 3.41 |
| l06 | 14.85 | So the water must reach about 120 degrees to boil. | 3.38 |
| l07 | 18.50 | Hotter water cooks food faster. | 1.64 |
| l08 | 20.70 | On a mountain it's the reverse: water boils cooler, so food cooks slower. | 4.27 |
| l09 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

- Iteration: "trapped steam" was transcribed "trap steam" → "steam can't escape, so the pressure rises". Spoken numbers come back
  from ASR as digits ("100", "120"), matching the captions.

## Sources (quotes, claim map and facts-vs-assumptions in the output folder's `docs/SOURCES.md`)
- **OpenStax College Physics 2e §13.5:** "the boiling point of water is 100ºC at 1.00 atm. As the pressure increases, the boiling
  temperature rises steadily …"; "A pressure cooker (or even a covered pot) will cook food faster because the water can exist as a
  liquid at temperatures greater than 100ºC without all boiling away."
- **OpenStax §13.6, Table 13.5:** vapor pressure 1.01×10⁵ Pa at 100 °C, 1.99×10⁵ Pa (≈2 atm) at 120 °C; the bubble mechanism.
- **Penn State Extension:** "water boils hotter under pressure, which allows food to cook faster"; "at 15 pounds of pressure, the
  temperature inside the pressure cooker can reach 250°F".
- **NMSU Extension E-215:** "As atmospheric pressure decreases, water boils at lower temperatures"; about 1 °F per 500 ft; foods
  cooked with moisture need more time.
- USDA FSIS (HTTP 403) was not retried or circumvented and is not cited.
- **Facts vs assumptions:** 100 °C at 1 atm and the pressure–boiling link are textbook; "about 120 °C" assumes a typical ~15 psi
  cooker; the ×2 gauge, the ~90 °C mountain reading (≈10,000 ft), bubbles and steam dots are illustrative.

## CTA
Same verified wording as E13–E18 (listing-based): "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** a half-section pressure cooker on a glowing hob, lid locked, steam jetting from the valve weight, the
  thermometer at about 120 °C (orange zone) and the gauge at 2×; title "HOTTER THAN / BOILING WATER" above. No logo, fade or empty
  set.
- **Escalation:** the performer eyes a hissing café cooker, then a raised brow at the camera.
- **Mechanism set:** an open pot boils at 100 °C when the bubble's vapor push (lime arrows) matches the air push (blue arrows); the
  lid locks, steam stays trapped, the gauge doubles and the bubbles stop until the thermometer reaches about 120 °C; food chunks
  cook faster; the same open pot on a mountain boils at about 90 °C.
- **Safety:** the cooker is never opened under pressure; open-pot scenes use a separate open pot.
- **Dropped during preview review:** a frame-0 title over the dials, dial close-ups under the caption band, faint air-push arrows
  (timed out too early), pale food.

## Skill adjustments learned this round
- Check the episode history first: a suggested topic can match an older episode in another language (H04).
- Keep dials and readouts below the caption band (y > 600 px) in close-ups; reframe instead of shrinking captions.
- Give each explanatory arrow time on screen before the event it explains (release the bubble after "air above it").

## Progress
- 2026-11-17 batch 19 (E19): setup confirmed; topic changed (induction = H04); sources verified (OpenStax ×2, Penn State, NMSU);
  narration generated (one rewording for ASR); timeline and caption sync pre-check OK; cooker section built on E18 tooling; three
  preview passes (fixes above). Mix −14.64 LUFS, −1.6 dBTP, voice +16.8…+19.0 dB over the bed.
- Full render (`WORKERS=3 ./build.sh`, one process): results below.

## QA summary (verification results; details in the output folder's qa/QA.md)
- (pending the full render)

## Publishing caption
`production/30s/2026-11-17-english-19/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l08; l09) + one illustration note + 4 sources + hashtags. App identity: Recall; no other app names.

## Exact commands
`cd videos/recall/production/30s/2026-11-17-english-19 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail →
qa/qa.py → qa/narration_sync.py → qa/caption_sync.py); `TTS=1 ./build.sh` also regenerates the narration; `python3
make_caption.py` regenerates the post copy.

## Next
Only on user request.
