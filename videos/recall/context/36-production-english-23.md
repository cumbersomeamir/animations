# 36 — English-23 (2026-11-21 batch 23): "How does it see smoke?" (how a smoke alarm detects smoke)

**Output:** `videos/recall/production/30s/2026-11-21-english-23/recall-30s-english23-01.mp4` + separate vertical thumbnail
`recall-30s-english23-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 and 2026-11-15 batch notes (marketing structure, thumbnail, captions/labels x 100–900,
y 230–1500, frame 0 = thumbnail). **Style:** 15, unchanged (same performer with the E13 legs, café, palette, Fredoka caption pill,
English voice, score engine and CTA). **Language:** English narration and captions only. Previous MP4s are preserved; no automation.
**Feedback applied:** Satisfied? = "Yes", so the approved visual context, narrator, soundtrack engine and CTA are kept; the subject,
sets (café ceiling, toaster, kettle, giant optical chamber), choreography and foley are new.

## Request essentials (user; facts about the brief)
- "NEXT EPISODE — English batch23, authorised 21 November … Preserve the separate batch22 workflow and all prior files; this recovered
  session should create ONLY the new batch23 episode. never cancel, overwrite or duplicate old or pending outputs."
- Suggested topic: "An induction hob makes the pan into the heater" (induction, eddy currents, magnetic cookware, coil/pan cutaway,
  glass heated by the pan; no touch-safe or universal-compatibility claims; frame 0 "WHERE IS THE HEATER?"). "If this proposal was
  already covered, choose an unrelated subject inside the fixed genre, not another version of that topic, and record why." The batch must
  differ from batch 22 in core question, visual setting and mechanism.
- Rules: 30.000 s 1080x1920 H.264/yuv420p + AAC; English narration and captions; approved voice, comfortable pacing; hook 0–3,
  superhook 3–5, proof 5–21, payoff 21–27, CTA 27–30; one idea per shot; ≤ one short headline + the current caption; upper captions
  about y 280–460 with side margins; vital information away from right/bottom platform controls; sources in the project, not in the
  narration; no social posting; no operational files in Desktop/video-review; no new or renamed chats.
- Account recovery: inspect the current remote branch and all records (esp. english20–22) before scripting; preserve old uncommitted
  work separately; integrate remote history without dropping commits; render ONLY english23.

## Order of work and setup (facts)
- Local branch was at 93c706f with uncommitted 15 s style-test work; the remote had 59 newer commits (Hindi 03/04, feedback-05,
  english-06…22). Local work was backed up, the branch fast-forwarded to a3c098a (no commits dropped), and the 15 s test was
  committed as found with an honest UNFINISHED status (07 addendum, `tests/15s/STATUS.md`).
- **E22 (batch 22) is a separate workflow:** its source is checkpointed (8b069db, a3c098a) but its MP4 was not on the branch at
  this time; nothing in `2026-11-19-english-22/` was changed or rendered here. E23 lives in its own folder.

## Topic check → topic changed (why)
Induction is **H04** (2026-11-04, context 18: how the pan, not the cooktop, heats on induction), and the same induction suggestion
was already declined for E19 (context 32). Chosen instead (same "how everyday technology works" genre, unrelated subject):
**how a smoke alarm "sees" smoke** — photoelectric chamber, light aimed away from the sensor, smoke scattering light onto it — with
the monthly test-button takeaway. Different from E22 in question (smoke vs orientation), setting (café ceiling + giant optical
chamber vs MEMS die + bedroom) and mechanism (light scattering vs spring mass + capacitance). Not covered before (E08 infrared remote
and E20 refraction are other optical effects).

## Final script (87 words, 25.6 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matched every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | How does it see smoke? | 1.10 |
| l02 | 1.45 | Burnt toast, and it screams. But what's in that plastic box? | 3.49 |
| l03 | 5.25 | Many alarms hide a small chamber with a tiny light. | 2.91 |
| l04 | 8.45 | The light aims away from the sensor, so normally it sees nothing. | 3.60 |
| l05 | 12.35 | When smoke drifts in, particles scatter the light, and some hits the sensor. | 3.99 |
| l06 | 16.60 | Enough light, and the alarm sounds. | 1.82 |
| l07 | 18.85 | Thick steam can set it off too, even with no fire. | 2.95 |
| l08 | 22.20 | So test yours once a month, using the test button. | 2.86 |
| l09 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

## Sources (quotes, claim map, facts vs assumptions in the output folder's `docs/SOURCES.md`; read 2026-11-22)
- **US EPA, "Photoelectric Technology"** (archived 2009, End of Term Web Archive): "the LED beam moves in a straight line, through
  the chamber without striking the photo cell. When smoke enters the chamber, smoke particles deflect some of the light rays,
  scattering them in all directions. Some of it reaches the photocell. When enough light rays hit the photocell, they activate it."
- **Nebraska State Fire Marshal, "Photoelectric smoke alarms":** "aim a light source into a sensing chamber at an angle away from the
  sensor"; "Smoke enters the chamber, reflecting light onto the light sensor; triggering the alarm(NFPA)."
- **USFA "Smoke alarms":** two basic types, ionization and photoelectric ("many alarms"); an alarm may sound "while you're cooking or
  taking a shower with lots of steam"; "Test the alarm monthly." **USFA pictograph:** "Test smoke alarms at least once a month using
  the test button."
- **Facts vs assumptions:** the chamber is a simplified generic model (EPA describes a T-shaped chamber); particles hugely exaggerated;
  the sensor glow stands for the photocell signal; steam droplets scattering light is an illustration (USFA only states steam can set
  alarms off); ionization alarms are not explained ("many", not "all"); the broom is a gag; beeps are synthesised, not recorded.

## CTA
Same verified wording as E13–E22 (listing-based): "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** low angle under the ceiling alarm with the first toast smoke curling into it, title "HOW DOES IT / SEE
  SMOKE?" (= the spoken l01). Truthful and immediately readable.
- **Proof:** the alarm's cover lifts off a giant cut-away chamber; the LED beam crosses into a light trap while the sensor sits at 90°
  at the back, dark; smoke drifts in from the side and sprays rays; lime hit rays reach the sensor, which glows; cut to the real alarm.
- **Limit:** steam droplets in the chamber, then the performer's deadpan under a blaring alarm beside the kettle, with a beat of silence.
- **Payoff:** the performer presses the test button with a broom handle; three short test beeps; smile. **CTA:** café, broom lowered.
- **Fixed during preview review (4 passes):** alarm visually "mounted" on the pendant-lamp cord (moved); invisible café smoke (darker,
  denser, softer puffs; capped under the ceiling — it had been placed above the ceiling plane); toast seen edge-on (toaster turned);
  black-on-black chamber (lighter floor/vanes, off-white sensor housing, interior light); sensor lens facing away from all cameras
  (moved to the back, facing the beam's middle); brown steam (separate unlit white particles); 1-px rays (instanced cylinders);
  oversized sensor halo; murky frame 0 (plume timed to arrive at frame 0); broom crossing the Recall pill (lowered at the CTA).

## Skill adjustments learned this round
- Check particle systems against fixed geometry (ceiling planes) — a constant offset hid the smoke above the ceiling.
- Put the mechanism's key part (the sensor) facing the cameras; re-route the particle flow instead of turning the cameras around.

## Progress
- 2026-11-22: setup and recovery (above); topic changed (induction = H04); sources verified; narration generated (ASR matched every
  word); timeline generator; café ceiling/alarm, toaster, kettle, broom, giant chamber built on E22 tooling; four preview passes;
  mix −14.6 LUFS, −1.6 dBTP, voice +16.8…+18.2 dB over the bed. Source checkpoint pushed before the full render.
- 2026-11-22: two full renders (6.5 min each, 3 workers); final render passes all checks (QA summary).

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 bcb9b9e5…ac79, 11,627,383 bytes; H.264 High 1080x1920 yuv420p 30 fps, 900 frames, video/audio/container 30.000 s;
  AAC 48 kHz stereo; full decode clean; −14.6 LUFS, −1.6 dBTP, 0 clipped samples; ASR WER 0.0; narration starts within 0.1 ms of plan;
  all 14 caption groups lead their first word by 0.00–0.05 s; caption ink x 206–874, y 342–572; y 0–230 clear; no overlaps; longest
  static run 1.6 s; frame 0 = thumbnail (mean abs diff 1.39/255 outside the pill rows).
- Render 1 passed 25/25 checks but failed caption sync for one group (split at "some" instead of "and"); visual review also found big
  foreground particles in giant_hit and leftover steam over the alarm at 21.8–24 s. All three fixed; render 2 passes everything.
- Not verified: listening by ear and real-time viewing (frames, metrics and ASR only).

## Publishing caption
`production/30s/2026-11-21-english-23/publishing-caption.txt`, generated by `make_caption.py` from `script.json` (exact transcript +
one illustration note + 4 sources + hashtags). App identity: Recall; no other app names. Not published anywhere.

## Exact commands
`cd videos/recall/production/30s/2026-11-21-english-23 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail → qa/qa.py →
qa/narration_sync.py → qa/caption_sync.py); `TTS=1 ./build.sh` also regenerates the narration, word timings and timeline;
`python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
