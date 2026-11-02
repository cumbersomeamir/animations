# 14 · Feedback-round episode — "How a warehouse robot finds its way when GPS cannot help inside"

Round: 2026-11-02 feedback round (user feedback supersedes conflicting earlier format directions; see context/11
"FORMAT UPGRADE"). Output: `videos/media-diet/production/30s/2026-11-02-feedback-round/media-diet-30s-feedback-01.mp4`.
Previous MP4s (pilot-01, 30s-01, 30s-02) preserved unchanged.

## Brief (as given, condensed)
Locked genre: technology news, breakthroughs and interesting explanations of everyday technology. New episode: how a
lidar-equipped warehouse robot measures distances, builds a map, then compares fresh measurements with that map to estimate
its location (SLAM in ordinary words); a moved crate is revealed by fresh measurements and the robot finds a clear path.
Phrase as "a lidar-equipped robot" (others use other sensors). Reliable robotics/manufacturer/university sources; no
invented product news. Visual: **Layered Tech Cutaway** paper miniature (recipe in context/11), lift the roof, unfold a
measured floor-map sheet, match shelf corners, move a crate, show the clear path; ≥ 5 meaningful cuts; one minimal sweep
that is the actual measurement; no presenter mascot; short Media Diet CTA in the final 3–4 s.

## User feedback recorded for future episodes
- Flat investigation cards were too weak → dimensional handcrafted paper world (Layered Tech Cutaway) from now on.
- Captions: ink y 340–520, x 90–990, max 2 lines; y < 300 free of meaningful text; mechanism out of side/bottom UI zones.
- Subtle music without repetitive loops; voice clear; useful steps only, no dense labels or acronym lectures.
- Strong opening, mechanism shown as narrated, clear takeaway, natural brand CTA at the end; brief in-sentence qualifiers.
- Re-render if text is small/obstructed or scenes are static; a contact sheet or a static page with camera bobbing is not a deliverable.

## Draft → final narration (Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98, en-us) — 73 words, 25.2 s of speech
Draft: "GPS struggles inside a warehouse. So how does a robot know where it is? A lidar-equipped robot sends out laser pulses and
measures how long their reflections take to return. Those distances reveal nearby walls and shelves. It builds a map, then
compares new measurements with that map to estimate its position. This is how mapping and localisation work together. Move a
crate, and fresh measurements reveal the obstacle. Follow Media Diet for technology explained."

| id | start | end | final line | edit |
|---|---|---|---|---|
| V1 | 0.25 | 2.35 | GPS struggles inside a warehouse. | unchanged |
| V2 | 2.65 | 4.40 | So how does a robot know where it is? | unchanged |
| V3 | 4.75 | 9.39 | A lidar-equipped robot sends out laser pulses and times their reflections. | timing ("measures how long … take to return" → "times") |
| V4 | 9.70 | 12.58 | Those distances outline nearby walls and shelves. | "reveal" → "outline" (what the scene shows) |
| V5 | 12.90 | 17.65 | It builds a map, then matches fresh measurements to that map to estimate its position. | "compares … with" → "matches … to" (MiR: "find the best match") |
| V6 | 17.95 | 20.16 | Mapping and locating, working together. | plain-words SLAM; shorter |
| V7 | 20.50 | 24.69 | Move a crate, and new measurements reveal it, so the robot can plan around it. | added the clear-path payoff (MiR local planner; Nav2 costmap); "can", not a guarantee |
| V8 | 26.60 | 29.23 | Follow Media Diet for technology explained. | unchanged CTA (final 3.4 s) |

## Sources (checked 2026-11-02; quotes and claim map in the output folder's SOURCES.md)
GPS.gov accuracy (indoor use/blockage degrade GPS) · NOAA "What is LIDAR?" (pulsed laser measures ranges from reflected light) ·
USGS OFR 2025-1017 ("emits laser pulses and records the return time … of the reflected light") · Durrant-Whyte & Bailey 2006
(SLAM: build a map while determining location within it) · MiR250 Technical Guide 2020 (map from scanner + odometry; "compares
the input from the laser scanners with the walls on the map to try to find the best match"; local planner guides around
obstacles not on the map) · Nav2 AMCL (pose in a known map from a 2D laser scanner) · Nav2 costmap_2d (live sensor data).

## Storyboard (as rendered; 8 shots, 7 cuts)
| time | shot | action tied to narration |
|---|---|---|
| 0.0–4.6 | S1 exterior low 3/4 | paper warehouse on a layered table, paper satellite on a wire; signal rings fade at the roof ("GPS struggles"); roof lifts and slides away, camera cranes up, "?" tag pops over the robot ("how does a robot know…"). |
| 4.6–9.6 | S2 interior cutaway | front wall cut to a section stub; one pulse out and back to a shelf with a stopwatch + "1.0 m" ("times their reflections"); then one 360° sweep — dots appear only where rays hit. |
| 9.6–12.8 | S3 oblique overhead | scan points join into cyan outlines of walls and shelves ("outline nearby walls and shelves"). |
| 12.8–17.9 | S4 high 3/4 over the desk | measured map sheet drops and unfolds in two folds ("builds a map"); robot moves, fresh scan; scan points slide from misaligned into alignment on the sheet, magenta threads match three shelf corners ("matches … to that map"); position pin pops ("estimate its position"). |
| 17.9–20.3 | S5 wider desk view | robot advances; pin and scan points move with it ("mapping and locating, working together"). |
| 20.3–22.6 | S6 elevated aisle | cyan route strips laid; a paper crate slides into the route and settles; a fresh sweep hits it — magenta marks ("new measurements reveal it"). |
| 22.6–26.4 | S7 overhead | blocked strips flip away, new strips lay around the crate; robot drives the clear path to the flag ("plan around it"). |
| 26.4–30.0 | S8 hero pull-back | robot at the flag; small paper "Media Diet" sign with the icon hinges up (CTA); music resolves, fade 29.3–30.0. |

## QA summary (final export; full report in the output folder's QA.md)
- SHA-256 `2b713067274a19f9822075edf627c992938686cd849d69ca162fd7a35a7b57e5`
- 900 frames · video 30.000000 s · audio 30.000000 s · container 30.000000 s · H.264 High yuv420p 1080×1920 30/1 · AAC 48 kHz stereo.
- Full decode clean · −15.0 LUFS / −1.9 dBTP · caption ink y 378–488, x 216–865 · 0 safe-area violations in 900 frames.
- One ASR + timing pass: word recall 1.0, every line inside its scripted window.
- Representative and cut-boundary contact sheets inspected; fixes listed in QA.md.

## Limits
- Meshline/Recall voice cache not present here → same cached Kokoro-82M v1.0 + agreed config reused.
- Instagram reference not viewable from this environment (direction taken from the user's description).
- Schematic miniature (one slowed sweep per measurement; robots also use odometry/IMU). No automation created.
