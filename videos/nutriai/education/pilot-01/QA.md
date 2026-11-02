# QA: NutriAI Education Pilot 01 (mango)

Deliverable: `videos/nutriai/education/pilot-01/nutriai-education-pilot-01.mp4`, 5.6 MB, sha256 `df50f7aa48e99842a947fed415b122c2550768004fa5a48015abc05bd5092015`. Status: **final render, all checks passed** (2026-11-02).

## Automated checks (`source/qa/qa.py` → `qa/qa-results.json`, `qa/ffprobe.json`, `qa/decode.log`)
| Check | Result |
|---|---|
| Duration | container 15.000000 s · video 15.000000 s · audio 15.000000 s |
| Video | H.264 High, 1080×1920, yuv420p, 30/1 fps, **450 frames counted** |
| Audio | AAC, 48 kHz, stereo |
| Full decode (`ffmpeg -v error … -f null -`) | exit 0, 0 error lines |
| Loudness (EBU R128) | −14.0 LUFS integrated, LRA 2.7 LU, true peak −1.5 dBFS; astats peak −1.45 dB, no clipped samples |
| Black / freeze | blackdetect: none ≥ 0.25 s · freezedetect (n = 0.002, ≥ 0.6 s): none |
| Text safe area | 3 506 text runs over 434 frames (device-space bounds, transform-aware): **0** outside x 60–1020 / y 100–1800 |
| Smallest text | 27 px source line on a dark backing; captions 82 px, labels 46/32 px |
| Lip-sync | `build/audio/mouth.json` used by the render is byte-identical to the envelope of the delivered voice (cached takes) |
| Shader / page errors | none (render aborts on GLSL/page errors) |

## Audio / intelligibility
- Speech recognition on the **delivered MP4** (faster-whisper small.en, `qa/asr-final-mp4.txt`): "what's inside a hundred grams of mango just the flesh mostly water 15 grams of carbs with some fiber 60 calories 36 milligrams of vitamin C just over half a cup". Verbatim match to the script.
- Pace: 5 lines, about 11.3 s of speech in 15 s, gaps 0.4–1.1 s. Voice starts at 0.80 s (after the slam) and ends at 14.36 s.
- SFX land on their frames from `timeline.json` (slam thud + pan clang 0.47 s, chop slice 3.20 s, cube patter 3.60 s, level ding 5.20 s, carb thunk 7.07 s, stamp 9.67 s, sparkle 11.13 s, cup ding 13.47 s). Music and SFX are ducked under the voice.

## Visual review (`qa/contact-sheet.png` every 0.5 s, `qa/scene-boundaries.png` first/last frames of each beat, plus representative stills)
- Continuity: one continuous stage and camera path, no hard cuts. Beat boundaries at 78/160/390 are mid-motion (camera push, column fill, column → cup), not jumps.
- Performer: Gram performs every mechanism (launched by the beam, leaps, chops, rebalances, ducks the carb block, stomps the stamp, inspects with the magnifier, thumbs-up), with blinks, breathing and lip-sync.
- Fruit hero: natural golden-orange skin with red blush and green shoulder; glossy orange flesh on the cut and the cubes.
- Readability: captions sit on a top scrim; labels on dark pills with leader lines; source line on a dark backing.

## Educational accuracy (see `SOURCES.md` claim map)
- One entry only: USDA FDC 169910 "Mangos, raw", per 100 g edible portion; skin and seed explicitly excluded on screen and in the voice.
- Values shown: water 83.5 g, carbs 15.0 g (fibre 1.6 g), other 1.6 g (protein 0.82 + fat 0.38 + ash 0.36), 60 kcal, vitamin C 36 mg (36.4), 100 g ≈ 0.6 cup (165 g per cup). Column layers drawn to true proportion.
- "Mostly from carbs" is derived from the same record's calorie factors (54 of 60 kcal). No health claims, no daily-value percentages, no comparisons.
- The app appears only as a small "NutriAI" signature from 13.3 s. No UI, no store CTA.

## Issues found and fixed during QA (chronological)
1. Pale "bun" mango: vertex colours were written as sRGB into a linear attribute. Converted; colours and shape reworked.
2. Balance cropped in portrait: smaller balance, new camera path.
3. Flesh cubes invisible: InstancedMesh frustum-culled with a stale bound (`frustumCulled = false`).
4. Floating lime rim before the column appeared: rim tied to glass fade.
5. Stamp / caption / label collisions: re-sequenced; vitamin C moved to a caption swap with a magnifier lens.
6. Cup glass invisible (transparent texture zeroed alpha) and graduations past the right safe edge: tinted glass, overlay graduations on the left.
7. Freeze 12.0–12.87 s: breathing/sway, magnifier sway, slow push-in.
8. Caption overlap at 5.5 s, off-frame tags, kcal label past x = 1020: staggered, clamped, moved.
9. QA logger ignored canvas transforms: fixed (false positives removed, real ones fixed).
10. Opening line masked by the slam ("mango" heard as "mega"/"mago"): voice moved after the slam, SFX/music ducked, and verified takes selected (6 + 5 candidates, kept ones both ASR models transcribe verbatim).
11. 60 kcal stamp re-grew while fading at 13 s: fade decoupled from the slam-in scale.

## Known limitations (honest)
- The mango, cut and cubes are procedural (stylised-realistic), not photographic; cube count and size are illustrative (12–13 cubes of about 2 cm ≈ 100 g).
- The balance's motion is cartoon-timed. The physics direction is correct (heavier side down; levels at 100 g vs 100 g; weight at the pivot adds no torque).
- Lip-sync is amplitude-driven (open/close), not phoneme-accurate.
- The Instagram references were not viewed; style decisions are original.
