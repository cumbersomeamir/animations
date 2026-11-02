# QA — Media Diet · feedback-round episode · "How a warehouse robot finds its way when GPS cannot help inside"

**File:** `videos/media-diet/production/30s/2026-11-02-feedback-round/media-diet-30s-feedback-01.mp4`
**SHA-256:** `2b713067274a19f9822075edf627c992938686cd849d69ca162fd7a35a7b57e5` · 23,916,742 bytes · 6377 kb/s
Style: Layered Tech Cutaway (context/11). Build: `bash build/build.sh` (two parallel frame workers, then audio, encode, QA).

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.0 LUFS** integrated, true peak **−1.9 dBTP** | qa/loudness.txt |
| captions (new rule: ink y 340–520, x 90–990, ≤ 2 lines) | ink y **378–488**, x 216–865, 50 px | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (no text y < 300 or > 1600; all text x 90–990) | qa/text-bounds.json |
| one ASR + timing pass | faster-whisper base.en word recall **1.0**; every line inside its window ("Follow" heard at 26.29 s, p 0.99) | qa/asr.json |
| contact sheets | representative (1 frame/s) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### ASR timing pass
| line | scripted window (s) | heard (s) | transcript |
|---|---|---|---|
| V1 | 0.25–2.35 | 0.0–1.94 | GPS struggles inside a warehouse, |
| V2 | 2.65–4.40 | 2.54–4.2 | so how does a robot know where it is? |
| V3 | 4.75–9.39 | 4.76–8.96 | A LiDAR -equipped robot sends out laser pulses and times their reflections. |
| V4 | 9.70–12.58 | 9.64–12.16 | Those distances outline nearby walls and shelves. |
| V5 | 12.90–17.65 | 12.94–17.42 | It builds a map, then matches fresh measurements to that map to estimate its position, |
| V6 | 17.95–20.16 | 17.94–19.84 | mapping and locating, working together. |
| V7 | 20.50–24.68 | 20.64–24.54 | Move a crate and new measurements reveal it, so the robot can plan around it. |
| V8 | 26.60–29.23 | 26.83–28.73 | media diet for technology explained. |
I cannot listen to audio in this environment; ASR + timing is the proxy. Please listen once before posting.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Dimensional craft | Paper miniature with laminated two-tone walls, visible stacked edges, paper grain and per-card tint, real cast shadows (low warm key from back-left), restrained bokeh. |
| Scene progression (7 cuts, each a different place/angle/action) | S1 exterior low 3/4 + GPS rings fading at the roof → roof lifts, crane up, "?" tag · S2 cutaway interior (front wall cut to a pink-edged section): one pulse out/back with stopwatch "1.0 m", then one 360° scan whose dots land only where rays hit · S3 oblique overhead: the points join into outlines of walls and shelves · S4 high 3/4: map sheet drops and unfolds panel by panel; robot moves; fresh scan; scan points slide into alignment on the sheet; magenta threads match three shelf corners; position pin pops · S5 wider: robot advances, pin and points follow (mapping + locating) · S6 elevated aisle: crate slides into the route; scan hits it (magenta) · S7 overhead: path strips lift away, new strips lay around the crate, robot drives the clear path · S8 hero pull-back: robot at the flag, paper "Media Diet" sign hinges up (CTA). |
| No static pages | Every shot has object action tied to the line being spoken; eased camera moves only, no bobbing. |
| Text | Captions 50 px with a soft dark band; one small readout (stopwatch + distance) only during "times their reflections". |
| Accuracy | "a lidar-equipped robot"; "estimate its position"; "can plan around it"; claims C1–C7 mapped in SOURCES.md (GPS.gov, NOAA, USGS, Durrant-Whyte & Bailey 2006, MiR250 manual, Nav2). |

## Fixes during this round
1. Hinge-lifted roof showed its dark underside over the lens → roof now lifts and slides away (lavender underside).
2. Interior camera started outside the front wall → cutaway: front wall cut to a section stub in S2.
3. Shadows fell away from the camera → key light moved to back-left, lower; grain/bump strengthened; per-card tint.
4. Scan outline hidden under shelf boards from straight overhead → oblique overhead + markers offset just in front of surfaces + thicker ribbons.
5. Doorway rays produced floating dots → ray caster treats the doorway as open (misses produce no marker).
6. Crate hits hidden behind the robot/crate → elevated rear camera and larger standoff (robot stops at z 1.65).
7. Satellite clipped at the right edge → moved inward; S1 frames re-rendered.
8. Render throughput: single worker ≈ 5 s/frame → two parallel workers (≈ 2.3 s/frame overall).

## Remaining limitations (honest)
- Voice: the brief's Meshline/Recall cache is not in this container; the locally cached Kokoro-82M v1.0 with the agreed
  blend/speed/language (same as productions 01–02) was reused.
- The Instagram reference could not be opened here; the craft direction follows the user's written description.
- Schematic miniature: real lidars sweep many times per second and robots also use odometry/IMU; one slowed sweep per
  measurement is shown. The "1.0 m" readout uses a stated schematic scale.
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in chat and pushed to the branch.
