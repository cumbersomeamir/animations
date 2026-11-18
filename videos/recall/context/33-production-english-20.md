# 33 — English-20 (2026-11-17 batch 20): "This straw isn't broken" (why a straw looks broken in water)

**Output:** `videos/recall/production/30s/2026-11-17-english-20/recall-30s-english20-01.mp4` + separate vertical thumbnail
`recall-30s-english20-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 and 2026-11-15 batch notes (marketing structure, thumbnail, captions/labels x 100–900,
y 230–1500, frame 0 = thumbnail). **Style:** 15, unchanged (same performer with the E13 legs, café, palette, Fredoka caption pill,
English voice). **Language:** English narration and captions only. Previous MP4s are preserved, and no automation was created.
**Feedback applied:** the latest Satisfied? answer for Recall is "Yes", so the approved style, palette, narrator, caption treatment
and CTA are kept unchanged; only the subject, sets and foley are new.

## Request essentials (user; facts about the brief)
- "NEXT EPISODE — English batch20": same rules as E13–E19 (hook 0–3, optional superhook 3–5, proof 5–21, payoff 21–27, CTA
  27–30; frame 0 striking, truthful, 2–5 words, no fade/logo; captions in the mobile safe area; sources in the project).
- Suggested topic: "Why noise-cancelling headphones struggle with sudden voices: inverse sound waves, delay and unpredictable
  noise". "If already covered, choose a genuinely different subject in the fixed genre before writing. Do not repeat batch19
  actual subject or any earlier topic." "Use RAM frame caches if disk is tight; do not delete earlier work."
- The other-app notes in the brief (Ideaverse, Aarambh, Werbens, Tensorblue, Mello, CalMeter, WastePaisa) do not apply to Recall.

## Setup confirmation and history check → topic changed (why)
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/recall` at cda59c2 (E19 final), equal to the remote.
  CLAUDE.md names the assigned account amir@tensorblue.com.
- **Topic history:** the noise-cancelling subject is **F05** (2026-11-05, context 19: steady engine hum vs sudden voices); the
  same suggestion was already declined for E08 and E14. Chosen instead (same everyday-science genre): **why a straw looks broken in
  water** — refraction and apparent depth. No earlier episode covers refraction (E10 is polarization); it appeared only as an
  unproduced idea in 08. It is unrelated to E19 (boiling point and pressure).

## Final script (80 words, 24.34 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | This straw isn't broken. | 1.24 |
| l02 | 1.50 | So why does it snap at the water's surface? | 2.01 |
| l03 | 4.75 | Light from the straw speeds up as it leaves the water, and changes direction. | 4.16 |
| l04 | 9.20 | Like a mower rolling from grass to pavement: one side speeds up first. | 4.33 |
| l05 | 13.85 | Your brain traces the light back in a straight line, so the underwater part looks higher. | 4.72 |
| l06 | 20.40 | That's why a pool looks shallower from above: about three quarters of its real depth. | 4.60 |
| l07 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

- Iteration: "onto pavement" was transcribed "on a pavement" → "from grass to pavement".

## Sources (quotes, claim map and facts-vs-assumptions in the output folder's `docs/SOURCES.md`)
- **OpenStax College Physics 2e §25.3 "The Law of Refraction":** refraction = change of a ray's direction; n(fresh water) = 1.333;
  "the direction of the ray moves away from the perpendicular when it speeds up"; the lawn-mower picture ("When going from the
  grass to the footpath, the front wheels can move faster and the mower changes direction"); the broken-pencil take-home experiment.
- **OpenStax University Physics Vol. 3 §2.3:** "If you look at a straight rod partially submerged in water, it appears to bend at
  the surface"; its image "forms a little closer to the surface"; "a fish appears at 3/4 of the real depth when viewed from above."
- **schoolphysics "Real and apparent depth":** ponds and pools "appear shallower than they really are"; refractive index = real
  depth / apparent depth; pools look shallower towards the far end.
- LibreTexts (HTTP 403) was not retried or circumvented and is not cited.
- **Facts vs assumptions:** n = 1.333, bending away from the normal, the bent-rod appearance and 3/4 from above are textbook; the
  giant ray path is computed with Snell's law; the café glass's break offset, mower speeds/angles, pulse speeds (1 : 1.333 ratio),
  eye, ladder and lane rope are illustrative. "About three quarters" holds looking straight down; slanted views look shallower still.

## CTA
Same verified wording as E13–E19 (listing-based): "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** a close-up of the café glass, the lime straw visibly snapped at the waterline (underwater part drawn
  where it appears), title "THIS STRAW / ISN'T BROKEN" above. No logo, fade or empty set.
- **Escalation:** the performer leans in to peer at the glass, then raises a brow at the camera ("So why does it snap…?").
- **Proof:** a giant water tank: light pulses leave the straw tip, crawl through water and speed up in air, turning at the surface
  toward an eye; a lawn mower crosses diagonally from grass to pavement, one wheel first, and turns (heading per Snell's law with
  the same ratio); back in the tank a dashed line continues the eye's ray straight down and a faint ghost straw appears above the
  real tip; a return to the café glass proves it.
- **Payoff:** an outdoor pool; side view with a ghost floor rising to 3/4 depth and real vs apparent depth bars.
- **Dropped or fixed during preview review:** stale E19 labels in the overlay (replacement skipped), the eye out of frame
  (cameras widened), an eye with its iris code swallowed by an inline comment (split onto its own line), the ray drawn through the
  eyeball (now ends at its front), a solid back-line (now dashed), the "looks higher" label beside the real tip (moved next to the
  ghost image).

## Skill adjustments learned this round
- Never put a `//` comment in the middle of a one-line statement (hit again here: it silently removed the iris; carry forward).
- When copying an episode folder, grep the overlay for the previous episode's label text before the first preview.
- `/dev/shm` does not survive a worker restart: use RAM frame caches only when disk is truly short, and commit a source checkpoint
  before long renders.

## Progress
- 2026-11-17/18 batch 20 (E20): setup confirmed; topic changed (noise-cancelling = F05); sources verified (OpenStax ×2,
  schoolphysics); narration generated (one rewording for ASR); timeline and caption sync pre-check OK; ray, mower and pool sets
  built on E19 tooling; six preview passes (fixes above). Mix −14.62 LUFS, −1.6 dBTP, voice +15.5…+19.8 dB over the bed.
- Two worker restarts: the first wiped the `/dev/shm` frame cache before the full build started; a source checkpoint (1dcace6)
  was committed and pushed, and the full build was run with frames on disk (E19's frame set was ~300 MB; ~5.6 GB free).
- Full render: see QA summary.

## QA summary (verification results; details in the output folder's qa/QA.md)
- (filled in after the full render)

## Publishing caption
`production/30s/2026-11-17-english-20/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l06; l07) + one illustration note + 3 sources + hashtags. App identity: Recall; no other app names.

## Exact commands
`cd videos/recall/production/30s/2026-11-17-english-20 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail →
qa/qa.py → qa/narration_sync.py → qa/caption_sync.py); `TTS=1 ./build.sh` also regenerates the narration; `python3
make_caption.py` regenerates the post copy.

## Next
Only on user request.
