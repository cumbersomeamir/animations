# 40 · English episode 25 (30 s) — "We hit an asteroid. Here's the scar." (ESA Hera at Dimorphos; the recoil behind DART's push)

Output: `videos/media-diet/production/30s/2026-11-27-english-25/media-diet-30s-english25-01.mp4` (30.000 s, 1080×1920, 30 fps,
H.264 yuv420p + AAC). Thumbnail `…/thumbnail-english25-01.jpg` = frame 0. Batch 25 (authorised 27 Nov 2026). Start check: remote tip
68323bc (batch 24 delivered); no batch-25 folder, commit or checkpoint anywhere — not a duplicate. Session user videos2@tensorblue.com
(CLAUDE.md lists info@tensorblue.com; noted, unchanged).

## Brief (verbatim essentials)
"Explain a dramatic physical mechanism behind a verified primary-source space, telescope or chip announcement from the last 72 hours, or
the latest clearly dated relevant story. Avoid outages, robot recovery and charging. Preserve old work and stream render frames if disk is
tight. Check actual prior topics and use an unrelated subject in the same genre if already covered. Keep the approved format, latest
feedback, branding, voice and music." 30.000 s 1080×1920 H.264 yuv420p AAC, English voiceover and captions; strong first frame; one
concrete mechanism with purposeful motion; spare readable safe-zone text; app-relevant CTA; verify facts from primary sources; render, QA
and push the MP4 and first-frame thumbnail. No social publishing, Blender or paid APIs.

## Subject (actual), topic-history check and feedback applied
ESA's release of 25 Nov 2026 (Hera's first close views): the 151 m moonlet Dimorphos — hit by NASA's DART on 26 Sep 2022 at 6.1 km/s
(579 kg) — has one face flattened into a stadium-sized crater spanning its width and is tumbling chaotically; hundreds of metre-sized
boulders orbit the pair; DART shortened its orbit by 33 minutes, much more than predicted. Mechanism (peer-reviewed): ejecta recoil —
the rubble blasted back out of the crater pushed the asteroid like rocket exhaust; momentum enhancement β = 3.61 (+0.19/−0.25) at
2.4 g/cm³ (2.2–4.9 for any plausible density), so the rubble carried more momentum than DART itself. Candidate B (FCC authorises
SpaceX's 1 million satellites, 25 Nov) rejected: regulatory, mechanism speculative. No prior episode covered asteroids or momentum
transfer (space episodes so far: Starship catch, Voyager's signal); new question, setting (paper deep-space diorama) and mechanism.
Feedback applied: a dramatic, widely shared image (an asteroid scarred by a human-made impact) + one surprising, verified physical
"why" (the asteroid's own rubble did most of the pushing) + a useful payoff (good news for planetary defence).

## Story and pacing
frame 0 / thumbnail: illustration of Hera's view — Dimorphos with its flattened, dark crater face and rim, boulders drifting around it
+ "WE HIT AN ASTEROID. / HERE'S THE SCAR." + chip "illustration of ESA Hera's view · 25 Nov 2026" → 2.3–6.05 s a paper Hera photographs
the moonlet; a paper stadium pops in beside the crater ("stadium-sized crater" + "ESA Hera · Dimorphos (151 m) · released 25 Nov 2026")
→ 6.05–9.23 s flashback: DART streaks in and strikes the still-round moonlet; flash; first rubble ("6.1 km/s" + "NASA DART · 579 kg ·
26 Sep 2022") → 9.23–13.2 s Dimorphos circles Didymos; the path tightens ("orbit: 33 min shorter" + "gap exaggerated") → 13.2–16.85 s
slow-motion plume of rubble thrown back out of the crater, exhaust-like glow, the asteroid recoils the other way ("rubble recoil") →
16.85–20.9 s pushes add up: DART's arrow (1×) + the rubble's (≈2.6×) = ≈3.6× ("≈ 3.6 × the push" + "β = 3.61 (Cheng et al., Nature
2023; density 2.4 g/cm³)") → 20.9–23.05 s paper bars, DART vs RUBBLE ("the rubble did most of it" + "β 2.2–4.9 for any plausible
density") → 23.05–25.9 s planetary-defence illustration: a probe nudges a generic incoming asteroid off its course past a paper Earth
("planetary defense" + "illustration · Didymos and Dimorphos pose no threat") → 25.9–30 s CTA.

## Narration = captions (approved English voice) — 80 words, 25.8 s of speech
| id | start (s) | line |
|---|---|---|
| V1 | 0.05 | We hit an asteroid. Here's the scar. (hook; caption from frame 0, in capitals) |
| V2 | 2.40 | A European probe just found a stadium-sized crater on it. |
| V3 | 6.15 | A NASA probe had hit it at six kilometers per second. |
| V4 | 9.33 | Its orbit got 33 minutes shorter, far more than predicted. |
| V5 | 13.30 | Why? The blast threw rubble backward, like rocket exhaust. |
| V6 | 16.95 | That recoil multiplied the push about three and a half times. |
| V7 | 21.00 | So the rubble did most of the pushing. Good news for planetary defense. |
| V8 | 26.00 | Follow Media Diet for the physics behind the headlines. (CTA, ends 29.12) |
Every take checked by Whisper medium: "Hera" was heard as "Hira" and "NASA's" lost its "s", so both names are on screen only; "3.6"
was read as "three, six", so the narration says "about three and a half times" (β = 3.61 shown on screen).

## Operational (disk)
The container restarted on 27 Nov with the root disk at ~17 MB free. A `git fetch` into the disk checkout ran out of space and left 43
unreachable, partially fetched objects (17.4 MB) plus a temp file; only those were removed (verified unreachable and created by that
failed fetch), restoring the pre-fetch state; `git fsck --connectivity-only` clean; no cache or prior work touched. As for batch 24, the
episode is produced entirely in RAM (/dev/shm, 16 GB): a sparse partial clone at /dev/shm/repo25 (context, assets, this folder), frames,
audio, encode (CRF 20), QA and Git push from that clone; Chromium temp files in RAM. The disk checkout stays at 62dc6a7 (behind).

## QA / limits
Pending — filled in after the render (details will be in the output folder's QA.md).
