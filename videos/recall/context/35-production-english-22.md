# 35 — English-22 (2026-11-19 batch 22): "Your phone has springs" (how a phone knows which way is down)

**Output:** `videos/recall/production/30s/2026-11-19-english-22/recall-30s-english22-01.mp4` + separate vertical thumbnail
`recall-30s-english22-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 and 2026-11-15 batch notes (marketing structure, thumbnail, captions/labels x 100–900,
y 230–1500, frame 0 = thumbnail). **Style:** 15, unchanged (same performer with the E13 legs, café, palette, lime phone, Fredoka
caption pill, English voice). **Language:** English narration and captions only. Previous MP4s are preserved, and no automation was
created. **Feedback applied:** Satisfied? = "Yes", so the approved visual context, narrator, soundtrack engine and CTA are kept; only
the subject, sets and foley are new.

## Request essentials (user; facts about the brief)
- "NEXT EPISODE — English batch22, authorised 19 November … Finish any checkpointed prior batch20/21 work before this new episode;
  never cancel, overwrite or duplicate old or pending outputs. Submit this brief exactly once as the next episode."
- Topic: "Why a QR code can survive a missing piece" — error correction with a physically assembled code, missing tiles recovered
  from redundancy, clearly separated from a real scannable QR; correction levels and damage distribution; no universal percentage;
  a phone-camera takeaway; first frame "BROKEN. STILL READABLE." "If this precise subject was already covered, choose a genuinely
  different subject in this app's fixed genre before scripting and explain the replacement choice."
- Rules: 30.000 s 1080x1920 H.264/yuv420p + AAC; English narration and captions; approved voice, comfortable pacing; hook 0–3,
  optional superhook 3–5, proof 5–21, payoff 21–27, CTA 27–30; one idea per shot; no more than one short headline plus the current
  caption; upper captions about y 280–460 with side margins; vital information away from the right-side/bottom platform controls;
  sources in the project; no social posting; no operational files in Desktop/video-review; no new or renamed chats. "This brief and
  application-specific decisions must remain in this Code chat for future iterations."

## Order of work and setup
- Batches 20 and 21 were already final and pushed (f94c42c, 2e48f96); nothing was pending. Branch `claude-video/recall` equal to
  the remote at 2e48f96. E22 was made in its own folder; earlier outputs were not changed (only a wrong header comment in the E21
  `build.sh` was corrected).

## Topic check → topic changed (why)
- The QR error-correction subject is **F01** (2026-11-02, context 14: error-correction tiles rebuilding damaged content, real
  level-H code with zxing decode tests, a small logo decodes but a big one or a covered finder corner fails, DENSO WAVE levels
  ~7/15/25/30 %, "a bigger logo isn't always better"); the same QR suggestion was declined for E10. Chosen instead (same "how
  everyday technology works" genre): **how a phone knows which way is down** — the MEMS accelerometer's weight on springs, the
  capacitive fingers, auto-rotate, and rotation lock for reading in bed. Not covered before (E06 was the magnetometer; E10's rotate
  test was polarization).

## Final script (84 words, 25.63 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | Your phone has springs. | 1.11 |
| l02 | 1.40 | Microscopic ones. So how do they know which way is down? | 3.40 |
| l03 | 5.00 | In a chip, a tiny weight hangs on springs. | 2.35 |
| l04 | 7.55 | Gravity tugs on it, so it shifts slightly. | 2.20 |
| l05 | 9.95 | Its fingers move closer to one set of plates, and the chip measures that change. | 4.37 |
| l06 | 14.55 | Turn the phone sideways, and the weight shifts another way, so the screen turns. | 4.32 |
| l07 | 20.45 | Reading in bed on your side? The weight still feels gravity, so lock rotation. | 4.60 |
| l08 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

## Sources (quotes, claim map and facts-vs-assumptions in the output folder's `docs/SOURCES.md`)
- **NXP AN3461** (Tilt Sensing Using a Three-Axis Accelerometer): "The upper proof mass is suspended by the restoring springs";
  a gravitational field "will deflect the proof mass"; the deflection "is measured from the change in capacitance between the
  fingers of the proof mass and the sensing plates"; gravity gives orientation so "a smartphone or tablet display" can switch
  between portrait and landscape — "the first high volume use of accelerometers in consumer products".
- **Agliolo Gallitto & Lupo, arXiv:1507.02224** (Università di Palermo): "all the smartphones are equipped by … the accelerometer,
  which senses the device's orientation to set the display orientation"; a proof mass on springs; one gap grows while the other
  shrinks and a circuit measures both; three orthogonal axes.
- **Android Developers:** the accelerometer measures acceleration on three axes "including the force of gravity"; most Android
  devices have one.
- **Apple Support 118226:** turning the iPhone sideways rotates the screen; Portrait Orientation Lock; some apps don't rotate.
- analog.com (ADXL335 datasheet) did not respond; not pursued further, not cited.
- **Facts vs assumptions:** the mechanism is from S1/S2; the chip drawing is a simplified generic two-axis layout; the drawn
  deflection is greatly exaggerated; "drawn centred, then sagging" is illustrative; the plate glow stands for the capacitance change;
  the phone UI and lock icon are generic. Some phones offer optional extra rotation features (camera-based face detection reported
  in the press for some Android phones; no official page found), so the narration only states what the weight feels.

## CTA
Same verified wording as E13–E21 (listing-based): "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** the whole giant accelerometer die (lime serpentine springs, combs, silicon mass) under "YOUR PHONE /
  HAS SPRINGS". Truthful (accelerometers have micro-machined springs) and unrelated to the QR first frame suggested for F01's topic.
- **Escalation:** POV over the performer's phone as it turns sideways and the app re-lays itself out, then the raised brow.
- **Proof:** giant die — weight on springs → gravity arrow and sag → comb close-up where approached plates glow → the die turns like
  the phone, the weight swings to the new side → back to the real phone, the screen turns (and back).
- **Payoff:** POV lying on one side in bed (rolled room, pillow edge in the foreground): the app flips sideways while a small arrow
  shows gravity; a tap on the rotation-lock icon brings it back upright.
- **Fixed during preview review:** content rotation sign (checked against the gravity arrow in both café and bed POVs), a gravity
  arrow outside the frame, a comb close-up that read as shelves (darker plates, more frontal camera), a frame 0 that was too tight,
  an unreadable bed view (re-aimed along the bed, pillow added), an oversized bed arrow.

## Skill adjustments learned this round
- Verify screen-content rotation against an in-scene reference (a gravity arrow) rather than by reasoning alone.
- For a lying-down POV, put a familiar object (pillow) in the foreground on the gravity side.

## Progress
- 2026-11-19 batch 22 (E22): setup confirmed; topic changed (QR = F01); sources verified (NXP AN3461, Gallitto & Lupo, Android
  Developers, Apple Support); narration generated (per-line ASR matched on the first pass); timeline and caption-sync pre-check OK;
  MEMS die, phone UI and bedroom built on E10/E21 tooling; four preview passes (fixes above). Mix −14.61 LUFS, −1.6 dBTP, voice
  +16.9…+20.8 dB over the bed. Source checkpoint 8b069db pushed before the full render.
- Full render: see QA summary.

## QA summary (verification results; details in the output folder's qa/QA.md)
- (filled in after the full render)

## Publishing caption
`production/30s/2026-11-19-english-22/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l07; l08) + one illustration note + 4 sources + hashtags. App identity: Recall; no other app names.
Not published anywhere (no social posting).

## Exact commands
`cd videos/recall/production/30s/2026-11-19-english-22 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail →
qa/qa.py → qa/narration_sync.py → qa/caption_sync.py); `TTS=1 ./build.sh` also regenerates the narration; `python3
make_caption.py` regenerates the post copy.

## Next
Only on user request.
