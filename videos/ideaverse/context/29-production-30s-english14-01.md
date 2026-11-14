# 29 — Production 30s english14-01 (English): "Why a robot vacuum dodges a sock but swallows a cable"

Batch 2026-11-14-english-14 ("NEXT EDUCATIONAL EPISODE", Satisfied? feedback retained). Workspace
`production/30s/2026-11-14-english-14/` · deliverables `ideaverse-30s-english14-01.mp4` + `ideaverse-30s-english14-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed clean at 2d80021; no job running).
Style: accepted pilot-01 DOCKET newsroom style via the latest renderer; 2026-11-11 rules (context/11).

## Topic check (history: context/09, 12–28)
- Proposed: robot vacuum avoids a sock but still eats a cable — camera classification vs thin, hard-to-see obstacles;
  perception ≠ understanding. No earlier episode covers robot vacuums or obstacle detection → used as proposed.

## Script (English, 71 words) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.25 | hook + real question | A robot vacuum can dodge a sock, then swallow a cable. Why? |
| s2 | 4.75 | mechanism 1 | A camera spots what it was trained to name: socks, shoes, sometimes cords. |
| s3 | 9.70 | mechanism 2 (proof) | A laser measures shape, but a thin cable lying flat barely registers. |
| s4 | 14.50 | model-specific | And the lists differ by model: one Roomba dodges cords, but not socks. |
| s5 | 19.60 | payoff | So check your model's list, and clear cables before its first mapping run. Some switch avoidance off while learning. |
| s6 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en on first synthesis.

## Facts → sources (accessed 2026-11-14)
| claim | type | source |
|---|---|---|
| a camera spots what it was trained to name (socks, shoes, sometimes cords) | documented | iRobot Support, "Camera, PrecisionVision™, and Obstacle Image Review", https://support.irobot.ca/articles/en_US/Knowledge/31161 — camera robots "see, identify, and automatically avoid objects on the ground"; table of recognised obstacles per model · IEEE Spectrum, "With New Roomba j7, iRobot Wants to Understand Our Homes" (2021), https://spectrum.ieee.org/irobot-roomba-j7 — "iRobot has internally collected and labeled more than a million images from more than a thousand homes"; robots "recognize (if not exactly understand)"; detectors deployed only for "shoes, socks, cords, and poo". |
| a laser measures shape; a thin cable lying flat barely registers | documented (manufacturer, model-specific) | eufy Support, Omni C30 Edge (line-laser), https://service.eufy.com/article-description/How-to-Prevent-the-Omni-C30-Edge-from-Getting-Stuck-on-Cables-Data-Cords-or-Shoelaces — "thin, elongated objects lying flat on the floor, such as cables … provide very sparse point-cloud features"; "may not reliably detect cables with a diameter of less than 3 mm" · eufy Support, S2 — may struggle with "cables, or other objects below 2.5 cm in height"; "Minimum detectable object height: 3.5 cm". |
| the lists differ by model: one Roomba dodges cords but not socks | documented | iRobot table — j5/j7/j9/Combo J9+/10 Max: cords ✓ socks ✓; **j6: cords ✓ socks ✗**; models without a camera: ✗. (The card shows j7, j6 and "no camera".) |
| some switch avoidance off while learning (first mapping run) | documented (model-specific) | iRobot — "PrecisionVision™ on the j series and Combo 10 Max is inactive during a training/mapping run. The floor should be clear of pet waste or cables". |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse robot or vacuum feature. |
Illustrative (not measured): the vacuum, path, sock/shoe/cable, frustum, boxes, the laser line's shape and the number of
"registered points" (drawn to show many vs few, not real sensor data). The 3 mm / 3.5 cm figures stay in notes, not on screen.

## Storyboard (cues.js)
1. 0–4.5 hook (high floor view): the vacuum swerves round a striped sock, then rolls onto a thin white cable; the cable is
   pulled in → STUCK!; "Why?".
2. 4.55–9.5 camera view: an illustrative frustum; boxes + tags SHOE ✓ / SOCK ✓ / CORD? (amber, dashed) on the words;
   TRAINED TO NAME.
3. 9.55–14.3 laser: a red line sweeps across the floor; over the sock it rises with many registered points; push-in to the
   cable: a ~4 mm bump with one point → FEW POINTS.
4. 14.35–21 card: DEPENDS ON MODEL — Roomba j7 ✓✓, Roomba j6 ✓✗ (highlighted, marks on "cords"/"socks"), no camera ✗✗ →
   CHECK YOURS.
5. 21–26.85 DOCKET gathers the cable into a coil; the vacuum starts a FIRST MAPPING RUN (trail) → AVOIDANCE OFF.
6. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the stuck vacuum (3.4 s) + "SOCK: DODGED / CABLE: EATEN".

## QA / status — DELIVERED 2026-11-14
- Output: production/30s/2026-11-14-english-14/ideaverse-30s-english14-01.mp4 · sha256 da6bc6d2…8eae, plus
  ideaverse-30s-english14-01-thumbnail.png ("SOCK: DODGED / CABLE: EATEN"). QA.md in that folder.
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −15.0 LUFS / −1.4 dBTP.
- English ASR on the final MP4: all six lines MATCH, no word outside its caption; caption text inside x 100..900; top band text-free.
- Limitation: ASR-only listening check (no by-ear listen possible here).
