# 36 — Batch `2026-11-19-english-22` (batch22) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-19-english-22/tensorblue-30s-english22-01.mp4`, thumbnail `…/tensorblue-30s-english22-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-19-english-22/production-notes.md`. All earlier MP4s are preserved unchanged.

**Process note:** rendered and QA-passed on 19 Nov; the commit happened on 21 Nov at the start of the batch23 brief ("finish any checkpointed prior batch22 work first"). Before committing, the frame-zero phone dot was raised from y≈1555 to y 1454–1466 to keep it clear of the bottom platform controls. That needed one re-render; the audio stream is unchanged (MD5 `58adce2d…`).

## Brief (user-authorised, 19 Nov 2026)
- **Topic:** how a map keeps the blue dot moving inside a tunnel. Research what navigation systems can infer when satellite signals disappear: inertial sensors, dead reckoning and map matching, plus the honest limit that the estimate drifts.
- **Look:** a delightful 3D tunnel and moving dot. No dense research diagram or decorative lines. Any interface must be accurate, or visibly illustrative and consistent, with no fictional buttons.
- **Frame zero:** a phone map entering a dark tunnel while its dot keeps moving; **GPS IS GONE. WHY MOVE?**
- **New layout rules in this brief:**
  - upper captions at about **y 280–460**;
  - **no more than one short headline plus the spoken caption** on screen;
  - vital information kept away from the right-side and bottom platform controls.
- **History check:** not a duplicate. english-16 covered maps **rerouting** (a road graph plus live traffic costs). This episode covers **positioning without satellites** (dead reckoning, sensors, map matching, drift, beacons). No earlier episode covers location estimation.
- **Feedback kept (2026-11-18):** real app behaviour plus an app-builder payoff; toy3d depth; fun physical motion.

## The test (`src/demo/tunnel_sim.py`; Python 3 standard library)
- **What it is:** our own simulation of textbook methods. It is **not any app's code**.
- **Road and car:**
  - a made-up road: 100 m approach, a **600 m tunnel** with a 32° S-bend, 200 m after;
  - the true car drives at 60 km/h and **slows to 45 km/h halfway** through the tunnel.
- **GPS:** one fix per second with 3 m noise outside the tunnel, none inside (seed 20261119).
- **Estimators,** all starting from the last fix and advanced to the moment of entry:

| estimator | at the tunnel exit |
|---|---|
| freeze at the last fix | 598 m behind |
| straight-line dead reckoning (last speed + last heading) | **150 m off the road** (198 m error) |
| + turn (yaw) sensor, 0.15°/s illustrative bias | 92 m error |
| + map matching (continuous projection onto the road ahead) | on the road, **92.5 m ahead** of the slowed car |
| + roadside beacons every 100 m (illustrative spacing) | never more than **32 m** ahead |

- **Accuracy circle:** our model, 4 m + 15 % of the distance since the last fix. It reaches 110 m at the exit, so it contains the car.
- **Timing:** the next fix comes 0.6 s after the exit. The JSON is deterministic (identical SHA-256 on repeat runs).
- **Bugs fixed during the build:**
  - map matching first snapped to 1 m road points, which rounded every step up (200 m ahead);
  - the guesses first started at the fix position without being advanced to the entry time.
- The renderer stops if the headline results change.

## Final script (as spoken; 81 words, 29.55 s incl. CTA; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–3.38 | No GPS in this tunnel. Why is the dot still moving? |
| L2 | 3.63–5.28 | Your map is guessing, on purpose. |
| L3 | 5.53–8.55 | It keeps your last speed and heading. That's dead reckoning. |
| L4 | 8.80–12.28 | Sensors can catch curves, and map matching keeps it on the road. |
| L5 | 12.53–16.90 | But guesses drift. In our simulation, the dot ran ninety meters ahead. |
| L6 | 17.15–20.73 | Some tunnels add Waze beacons, so phones still get location. |
| L7 | 21.03–25.47 | Building a map? Grow the blue circle while guessing, then snap back to GPS. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation:**
- "Waze" is not in the misaki lexicon, so it is overridden as `[Waze](/wˈAz/)` ("ways", the brand's own pronunciation).
- "GPS" /ʤˌipˌiˈɛs/ and "dead reckoning" phonemise normally.
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

**Edits:** the draft ran 30.1 s of speech; it was cut to 81 words. "Sensors catch curves" became "Sensors **can** catch curves", because not every device does.

## Source → claim map (read 2026-11-19; raw pages, quotes verbatim)
| claim | kind | source and what it says |
|---|---|---|
| Your map is guessing; it keeps your last speed and heading: dead reckoning | documented definition | **Bowditch, The American Practical Navigator (NGA Pub. 9), 2019 ed., ch. 9** (chapter copy at thenauticalalmanac.com; official home https://msi.nga.mil/Publications/APN): "Dead reckoning (DR) is a method for determining the estimated position of a vessel by advancing from a known fix of position along the vessel's ordered course and speed." |
| Sensors can catch curves | documented (systems may fuse sensors) | **Android CDD, automotive requirements** [7.3/A-0-1]: "MAY dead reckon Location by fusing GPS/GNSS with additional sensors." **HERE SDK docs:** using "the vehicle's GNSS and movement sensor data… can improve location accuracy and availability… especially in urban canyons and tunnels." |
| Map matching keeps it on the road | documented method + our test | **Newson & Krumm, ACM SIGSPATIAL GIS 2009 (Microsoft Research):** an HMM that finds "the most likely road route" and "accounts for measurement noise and the layout of the road network." Test: the matched guess stays on the road. |
| But guesses drift | documented | Bowditch ch. 9: "the DR plot, not having been reset to a fix, will accumulate time-dependent errors. Over time that error may become so significant that the DR will no longer show the ship's position with acceptable accuracy." |
| In our simulation, the dot ran ninety meters ahead | measured on our model | 92.5 m at the exit (above) |
| Some tunnels add Waze beacons, so phones still get location | documented | **Waze Beacons Program** (support.google.com/waze/partners/answer/7298984): "provides seamless navigation to drivers underground where GPS signals don't reach, ensuring location services"; cities include New York City, Chicago, Paris, Rio, Brussels, Oslo, Sydney, Boston and Mexico City. **How Waze Beacons work** (…/answer/9416071): beacons "are installed in tunnels, where GPS signal is lost… a one-way signal to a user's phone… enables Waze to continue routing drivers"; "Other navigation apps can also use the Waze Beacons program technology for free." |
| Grow the blue circle while guessing | documented UI meaning + API | **Google Maps Help** (answer/2839911): "When Google Maps isn't sure about your location, a light blue circle shows around the blue dot. You could be anywhere within the light blue circle. The smaller the circle, the more certain the app is about your location." **Android `Location.getAccuracy()`:** "the estimated horizontal accuracy radius in meters of this location at the 68th percentile confidence level." |
| …then snap back to GPS | summary of the method + our test | the next fix replaces the guess (snap at the exit) |

**Illustrative, not claims:**
- the mountain, car, puck, tunnel lamps and ribs;
- the beacon spacing (100 m) and the accuracy-circle model;
- the phone map, which shows only a road and the blue dot with its light-blue circle: no buttons, no app name, not any real app's UI.

**Deliberately not claimed:**
- which sensors or algorithms any specific app uses;
- beacon spacing or density figures (only seen in press coverage);
- that a phone's own sensors alone work in every tunnel.
- No Waze or Google logo or UI is reproduced. No Tensorblue product feature is implied.

## Storyboard as built (7 shots + CTA wipe; one headline at a time; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.51 | **1 Hook — frame zero** | Frame 0: a navy mountain with a stone portal. A toy car (white body, blue glass cabin) is at the mouth under a floating blue-dot puck, with a green GPS-fix pin popping. A phone in the foreground shows the map, with the dot (y 1454–1466) on the road entering the darker tunnel section. **GPS IS GONE. / WHY MOVE?** is drawn with a soft shadow. On "tunnel" the car disappears inside; the puck and the phone's dot keep moving. |
| 3.51–5.43 | **2 It's guessing** | The mountain lifts like a lid and fades; the camera cranes up over the tunnel (road, walls, amber lamps, arch ribs). **IT'S GUESSING.** |
| 5.43–8.70 | **3 Dead reckoning** | Chase camera framing the car and the guess. The straight-line guess (last speed + heading) carries on straight at the bend, leaves the road and turns red. **DEAD RECKONING.** |
| 8.70–12.43 | **4 Sensors + map matching** | The same stretch again: the guess turns with the curve and stays on the road; the accuracy disc grows. **MAP MATCHING.** |
| 12.43–17.03 | **5 Drift (our simulation)** | Side view of the second half. The car's brake lights come on; the dot runs ahead and a live counter climbs **+15 m … +89 m** while the disc grows. After "ahead", the first GPS fix lands (green pin), the dot snaps back to the car and **GPS IS BACK** shows. |
| 17.03–20.91 | **6 Waze beacons** | A fresh run: cyan beacon blocks on the tunnel wall light as the car passes, and the dot bounces back into place each time. **WAZE BEACONS.** |
| 20.91–26.60 | **7 Payoff** | The phone map becomes the hero. The light-blue circle grows while guessing (**GROW THE CIRCLE.**) and shrinks at the exit as the dot snaps back (**SNAP BACK.**), then keeps driving. |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card. |

**Thumbnail** (`tensorblue-30s-english22-01-thumbnail.png`): frame zero (without the caption) plus the logo and wordmark. **GPS IS GONE. WHY MOVE?** (5 words).

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/tunnel_sim.py` + `src/demo/out/tunnel-sim.json`;
- `src/proj-check.mjs` (dev helper).

Reused from english-21:
- unchanged: `brt.mjs`, `stage3d.mjs`, `toy3d.mjs`, `render.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`, `transitions.mjs`, `requirements-audio.txt`;
- `qa.mjs`: caption bounds y 280–460, clean top 0–280, no stage pixels in y 280–479;
- `mix.py`: heading, seed 20261125, 8-chord score, and **TP ceiling −3.0 dBTP**. With −1.6 the AAC encode of this peakier narration overshot to +0.5 dBTP; with −3.0 the encoded file measures −3.0 dBTP.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0).
- ASR: faster-whisper base.en (MIT).
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `…/tensorblue-30s-english22-01.mp4` · SHA256 `a8c19c92a537e0a7006763fa7d653f6ce16ffc87d58702d5c3294c0d9ad434c0` · 5,750,946 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | portal + car + puck + phone map + "GPS IS GONE. WHY MOVE?"; narration from 0.10 s, a sound at 0.00 s; phone dot measured at y 1454–1466 |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 30/1, yuv420p, ~1.33 Mb/s, `+faststart` (ftyp, moov, free, mdat) |
| frames / duration | 900 / 30.000 s | silent render checked at 900 frames before muxing; final `nb_read_frames=900`; all streams 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo, ~191 kb/s |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.3 LUFS**, LRA 3.0 LU, **−3.0 dBTP** |
| captions | ink inside x 100–900, **y 280–460**, ≤ 2 lines | all 15 groups pass: ink x 153–844, y 311–428 |
| top / caption band | no stage drawing in y 0–479 | 0 violations in 90 sampled frames |
| text density | ≤ one headline + caption | one kinetic headline per shot, no stacked tags (checked on the 2-fps sheets) |
| narration (one ASR pass on the final audio) | intelligible | Every scripted word heard. 78/81 matched, WER 4.9 %: "ways" for "Waze" (the brand's own pronunciation, p 0.25), "guess is drift" for "guesses drift", numerals, "TensorBlue". Mean start drift 0.08 s, max 0.33 s. |
| audio identity | ASR-checked audio = final audio | audio-stream MD5 `58adce2d…` unchanged across the last three visual-only re-renders |
| watch-through | every second | 2 frames/s of the whole final file (60 frames) viewed, plus `qa/contact-sheet-1fps.png`, `qa/transitions.png` (22 frames decoded from the MP4) and full-res crops of the beacon shot |

**Fixed during QA:**
1. **Hook framing.** The mountain first read as a flat slab; it became a hill cross-section extruded along the tunnel, with a portal.
2. **Phone.** It was too small or too low. Its frame-zero dot moved from y≈1555 to y≈1460.
3. **Chase shots.** The subject sat at the frame edge; the straight-line guess left the frame.
4. **Painting order.** Walls and the accuracy disc painted over the car, and the beacons were hidden. Walls and discs became base layers, and the beacons got bigger.
5. **Hook text.** "WHY MOVE?" was low-contrast over the mountain; a soft shadow fixed it.
6. **Snap and headlines.** The GPS-back snap landed 0.1 s before the cut; one headline left a sliver under the next.
7. **Payoff.** It was static after the snap.
8. **Crash.** A CTA-wipe crash truncated one export at 798 frames. It was caught, fixed, and every later export was checked at 900 frames before muxing.
9. **Audio.** AAC true-peak overshoot (above).

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering; no listening check was performed. "Watched" means frame sheets at 2 fps and full-resolution crops, not real-time playback.
- The simulation is ours, with an illustrative road, speeds, sensor bias, beacon spacing and uncertainty model; it does not measure any app.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
