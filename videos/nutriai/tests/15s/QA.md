# QA — NutriAI 15 s shader-glsl style test

**Status: first-pass render, checkpointed.** The test was paused when the educational pilot brief arrived (2026-11-02). This file reports what was checked; nothing here is relabelled as final.

Deliverable: `videos/nutriai/tests/15s/nutriai-15s-test.mp4` (H.264 High 1080×1920 30 fps CRF 22 + AAC 192k, 19.9 MB).
Master frames: `source/build/video-noaudio.mp4` (CRF 16, not committed, regenerable with `source/build.sh`).

## Automated checks (`source/qa/qa.py`, results in `qa/qa-results.json`)
| Check | Result |
|---|---|
| Duration | container 15.000 s; video 15.000 s; audio 15.000 s |
| Video stream | h264 High, 1080×1920, yuv420p, 30/1 fps, 450 frames counted |
| Audio stream | AAC 48 kHz stereo |
| Full decode (`ffmpeg -v error -f null`) | exit 0, 0 error lines (`qa/decode.log`) |
| Loudness | −14.0 LUFS integrated, LRA 2.5 LU, true peak −1.4 dBFS (two-pass loudnorm, linear) |
| Clipping | astats reports no clipped samples; peak −1.40 dB |
| Black / freeze | blackdetect: none ≥ 0.25 s; freezedetect: none ≥ 0.6 s |
| Text safe area | 13 text runs, all inside x 60–1020 px |
| Narration intelligibility | faster-whisper base.en on the narration stem: "Every bite, every sip. Track every meal. Log every glass of water. Nutri AI. Explore on Google Play." |
| Shader compile / page errors | none (render.mjs aborts on GLSL / page errors) |

## Visual review (contact sheet + scene boundaries)
- `qa/contact-sheet.png` (every 0.5 s) and `qa/scene-boundaries.png` (first/last frames of each scene) were inspected.
- Continuity: drop → bloom → ring → melt → glass → vortex → logo → icon tile → end card all flow without hard cuts; captions reveal and dissolve with the liquid treatment.
- Palette: black + icon greens throughout; chromatic aberration reduced after round 1 so fringes stay subtle.
- Claims: meals/water/weight/fasting from the listing description; "Calorie Tracker" from the listing title; ring, labels and glass ticks are abstract motifs, not app UI.

## Known issues (identified, NOT fixed in this render)
1. Last narration chunk ends at 14.885 s, which is tight against the 15.000 s end (planned fix: start it at frames 362/390).
2. The Google Play button pops at frame 398, about 0.07 s after "Explore…" starts; press flash at 424 lands after "Google Play" (planned: 392/418).
3. Scene A fluid is busy at the bottom of frame 30–75; a calmer large-scale pass was planned.
4. A complete real-time watch-through was not done; review was by stills, contact sheets and boundary frames.

These planned fixes were reverted from `timeline.json` so the committed source reproduces this exact render.
