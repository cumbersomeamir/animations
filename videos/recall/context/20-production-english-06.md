# 20 — English-06 (2026-11-06 batch, produced 2026-11-05): "Why your phone compass points the wrong way near a speaker or a steel desk"

**Output:** `videos/recall/production/30s/2026-11-06-english-06/recall-30s-english06-01.mp4`

**Format:** 11. **Style:** 15 (unchanged). **Language:** English narration and English captions only (language override for this
batch). Previous MP4s are preserved, and no automation was created.

## Request essentials (user; facts about the brief)
- Batch 2026-11-06-english-06. One new 30 s **English** educational episode: why a phone compass points the wrong way near a
  speaker or metal desk — magnetic interference versus GPS location, with a simple visible demonstration and a practical
  move-away / recalibrate takeaway. No quiz.
- Keep the approved educational style, fixed genre and motion-graphics skill (Three.js is the renderer, not the style).
  Immediate visual hook in the first 1–2 s, a concrete demonstration and takeaway, one short truthful CTA in the last 3–4 s.
- Natural English voice-over and English captions, never Hindi; reuse the approved voice character through an
  English-capable local voice; do not recycle Hindi audio. Music quiet under speech. No filler, repeated disclaimers,
  invented features or guarantees. Claims verified with primary sources and cited in repo notes.
- "The user approved improvements from the Instagram App Performance sheet": the sheet itself was not provided in this
  chat; the improvements named in the brief (hook in 1–2 s, concrete demonstration + takeaway, short truthful CTA, quiet
  music) were applied. No sheet data is stored here.
- Publishing caption: matches the final transcript, correct app identity (Recall), no editing instructions, no other app
  names in CTA/copy.

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations` (origin URL verified), branch `claude-video/recall` at 1eb2512 (F05 final),
  tree clean, no active jobs. Git author is session-managed; commit trailers carry this Claude session URL.
- **Topic history:** "compass", "magnetometer" and "calibrat" appear nowhere in this app's context or episode notes; the
  episode table in 11 and contexts 12–19 were checked. H04 (induction) uses magnetic fields for heating, a different
  mechanism. The suggested topic was kept.

## Final script (73 words, 23.95 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matched every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.45 | The dot is right, so why is the arrow wrong next to a speaker? | 3.37 |
| l02 | 4.35 | GPS places the dot. The arrow comes from a tiny compass sensor that feels Earth's magnetic field. | 6.76 |
| l03 | 11.55 | That field is weak. Up close, a speaker's magnet or a steel desk can bend it, and the arrow swings. | 6.03 |
| l04 | 18.65 | Step away from magnets and steel, then calibrate by waving a figure eight. | 4.50 |
| l05 | 26.35 | Download Recall for learning any new subject with AI. | 3.29 |

- Generated fresh with the cached Kokoro model (sha256 8fbea51e…34cb) and the established English "Meshline"/Recall blend;
  no Hindi or earlier audio reused. ASR (faster-whisper base.en) per line: identical text ("eight" transcribed as "8").
- "metal desk" in the brief → "steel desk" in narration: only ferromagnetic metal (iron/steel) has this effect (S5/S6).

## Sources (quotes, claim map and illustration notes in the output folder's `docs/SOURCES.md`)
- **Google Help Center**, "Find & improve your location's accuracy" (Android / iPhone & iPad / Computer): "The blue dot shows
  your location on the map."; "If your blue dot's beam is wide or points in the wrong direction, calibrate your compass.";
  "Make a figure 8 until the beam becomes narrow and points in the right direction."
- **Apple Support 105073**: "The presence of magnets can affect the accuracy of any compass sensor."; keep a compass
  "separated" from a magnet source.
- **Android Developers / AOSP**: phones include a "geomagnetic field sensor" that monitors "the earth's magnetic field";
  the magnetometer is calibrated for soft-iron and hard-iron effects.
- **NXP AN4248 / AN4246** (eCompass application notes): stray fields are "fixed (termed Hard-Iron effects)" or "induced by
  the geomagnetic field (termed Soft-Iron effects)"; "It is quite normal for the Hard-Iron offset to greatly exceed the
  geomagnetic field."; Earth's field 22–67 μT; owners can calibrate "in the street".
- **NOAA NCEI Geomagnetism FAQ**: "roughly between 25,000 - 65,000 nT"; a compass follows the local horizontal field.
- Not usable: Apple iPhone User Guide pages (navigation text only), USGS (404), NXP community mirror (403), ST notes (503).

## Product-fact check (CTA)
Same CTA as 16–19. "with AI" is the user's wording and is not confirmed in the saved listing or public site text (context 16).
No learning guarantee.

## Creative decisions (choices, not facts)
- **Same café, performer and lime phone as F01** (`buildCafe` / `buildPerson` / `buildPhone` byte-identical). New props: a
  small cylindrical Bluetooth speaker on the counter (end rings pulse on the beat), and an original minimal dark north-up
  map on the phone (lime dot, beam, café door; no real app's look).
- **Opening = demonstration:** POV on the phone; the hand dips it next to the speaker and the beam swings ~95° away while the
  dot stays put (0.38–0.7 s). Diegetic speaker music makes the speaker read.
- **Mechanism object:** a giant desk with a grid of compass needles (lime north tips) that shows the local field, a giant phone
  whose compass chip lifts out (exploded view) with its own needle, three GPS satellites beaming to the dot, Earth-field
  streaks that thin out on "weak", a giant speaker (bar-magnet field) and a steel plate (field induced by Earth's field).
  The giant phone's beam is physically consistent (turns opposite to the chip needle on a north-up map).
- **Portrait layout:** the speaker sits west of the phone and the steel plate north-east; "step away" moves the phone south
  (down the frame) to the far corner, where the needles and chip return to north (residual ~1°).
- **Takeaway:** the performer, a few steps along the counter from the speaker, waves a figure 8 (dotted lime trail); the
  beam narrows with a lime check. On-screen takeaway "Away from magnets, then a figure 8." (no VO). Order: step away first
  (calibration does not remove an outside magnet), then calibrate.
- **Comedy:** the performer turns to follow the wrong arrow; a 1 s deadpan stare before the takeaway.
- **Captions:** the accepted Fredoka pill treatment, ink centred at y 403; publishing caption generated from `script.json`.
- **Audio:** accepted score engine retimed; foley locked to each action; English bed gains 0.5/0.6 (as F01/R02).

## Skill adjustments learned this round
- For a portrait frame, lay out a "move away" demonstration along the frame's vertical axis (camera depth), not sideways.
- With dipole-like fields (∝ 1/r³), tune strengths numerically (`QS` solver in `web/choreo.js`) so the near deflection and
  the far residual are both what the narration claims; check them with a node test before rendering.
- Detached background builds (`( … ) &`) are killed with their parent shell; run the build itself as the background task.

## Progress
- 2026-11-05: setup confirmed; topic history clear; sources fetched (3 fetch rounds; NXP PDFs text-extracted locally);
  narration generated and ASR-checked; scene built from F01/F05 tooling; preview stills reviewed and fixed:
  - hook beam direction made consistent with the giant shots, hook POV reframed;
  - react / fig8 / cafe_wide framing (face clear of captions, performer and speaker in frame);
  - giant desk re-laid out for portrait (the phone left the frame when it moved sideways);
  - "step away" tag moved off the phone; speaker end rings pulse.
  - Mix −14.57 LUFS, −1.6 dBTP, voice +14.7…+16.7 dB (hook speaker music lowered from +7.3 dB).
  - Pre-render caption sync: all 11 spoken groups 0.05–0.11 s before their first word.
  - Full render started (`WORKERS=3 ./build.sh`).
- 2026-11-05: full render (13 m 47 s). A first, detached build attempt had kept running alongside it, and the two concurrent
  muxes produced an undecodable MP4. All 900 deterministic PNG frames were verified (decode at 1080x1920; 900 layout
  entries), the MP4 was re-muxed once and all QA re-run: 25/25 checks + narration sync + caption sync pass. Contact and
  boundary sheets reviewed; no re-render needed. Committed, pushed and attached. No further episode; no automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `47c91d7f36b586ed552675d81761046ff411c51cdb87de5883fd06dc6b7468ef` (16,090,083 bytes).
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full decode clean.
- English ASR on the final mix (Whisper base.en): WER 0.0 (exact transcript); narration within 0.2 ms of plan; 11 spoken
  caption groups appear 0.05–0.11 s before their first word and stay past their last.
- −14.6 LUFS, −1.5 dBTP, 0 clipped samples; voice +14.7…+16.7 dB over the bed.
- Captions English only, ink x 175–905, y 341.5–464.5, ≤ 2 lines; nothing above y 300; labels central; no overlaps; longest
  static run 10 frames.
- Limits: ASR-only listening check (I cannot listen); giant desk illustrative (tuned, not measured); steel-desk claim applies
  the sources' soft-iron mechanism to an outside object; "with AI" is the user's wording.

## Publishing caption
`production/30s/2026-11-06-english-06/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l04; l05) + one illustration note + 5 sources + hashtags. App identity: Recall; no other app
names (source publishers only); no editing instructions.

## Exact commands
`cd videos/recall/production/30s/2026-11-06-english-06 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → qa/qa.py →
qa/narration_sync.py → qa/caption_sync.py); `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
