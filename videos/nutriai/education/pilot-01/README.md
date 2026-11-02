# NutriAI Education Pilot 01: "What's inside 100 g of raw mango flesh?"

**Video:** `nutriai-education-pilot-01.mp4` (15.000 s, 1080×1920, 30 fps, H.264 High + AAC 48 kHz stereo)

A recurring performer, **Gram** (a living 100 g calibration weight), measures exactly 100 g of mango flesh on a balance against himself, discards skin and seed, and opens the 100 g into a true-proportion column: water 83.5 g, carbs 15.0 g (fibre 1.6 g), protein/fat/minerals 1.6 g. He stamps 60 kcal and finds 36 mg of vitamin C with a magnifier. Takeaway: 100 g is just over ½ cup of pieces. All values come from USDA FoodData Central FDC 169910 "Mangos, raw" (see `SOURCES.md`).

| Path | What |
|---|---|
| `nutriai-education-pilot-01.mp4` | final render |
| `QA.md`, `qa/` | QA report, ffprobe JSON, decode log, contact sheet, beat-boundary sheet, waveform, `qa-results.json` |
| `SOURCES.md`, `research/` | dated source, extracted USDA record, claim-to-source map |
| `LICENSES.md` | licence of every dependency, font, voice and data source |
| `character/` | Gram model sheet + rig notes |
| `source/` | reproducible project: `timeline.json` (single source of timing), `web/` (Three.js scene, rig, director, overlay, `?t=` seek harness, model-sheet page), `render.mjs`, `audio/build_audio.py` + cached `voice-takes/`, `build.sh`, `qa/qa.py` |
| `../../context/08–10` | strategy, pilot brief/storyboard, progress log |

Rebuild: see `source/build.sh` (needs node 22, the pre-installed Playwright Chromium, FFmpeg with librubberband, and a Python venv with `audio/requirements.txt`; the Piper voice model is only needed if a cached take is deleted).
