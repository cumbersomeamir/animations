# QA: CalMeter English 30 s english-09, avocado vs cucumber, 100 g each (2026-11-08)

**Final output:** `videos/nutriai/production/30s/2026-11-08-english-09/nutriai-30s-english09-01.mp4`
sha256 `380a1cee9bf491a8e057f6e6b33f55dba2e4b8e41c4047a160bc31071ffc4e08` · 15036271 bytes · status: final (2026-11-08).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 3.3 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003): small-area-motion stretches of 0.8–1.4 s at 2.3, 14.1, 22.6–25.8 s |
| Opening | Frame 0 shows the balance with the avocado half falling; the cucumber piece lands at 0.7 s; "? kcal" over both pans at 0.8 s (`qa/transitions.png`, frames 0/10/24) |
| Captions (`qa/text-bounds.txt`) | 611 caption runs, **0** outside x 90–990 / y 340–520 (ink x 131–949, y 359–468); ≤ 2 lines; blocks never overlap; no text above y 300; all English |
| Plate text | 3 867 runs: 0 above y 480, 0 off-frame, 0 right of x 950, 0 left of x 90, lowest y 1547 |
| Narration / caption sync | ASR word starts on the export vs caption lines: within ±0.10 s for 12 of 16 lines; "100 g avocado," (+0.30 s), "Fat ≈ 9 kcal" (−0.15 s), "Neither is bad" (−0.19 s) and "Track your food" (+0.48 s) are Whisper segment-start drift (zero-length or stretched first words; takes placed at 0.30, 15.35, 18.75 and 26.30 s, where the lines appear). Three lines were moved 0.1–0.5 s earlier after the first check |
| Intelligibility | ASR on the export (faster-whisper base.en, VAD segmentation, `qa/asr-final-mp4.txt`): "100 grams of avocado, 100 of cucumber. Same weight, about 10 times the calories. Avocado, about 160 calories, 15 grams of fat, 7 of fiber. Cucumber, about 15 calories, and 95 % water. Fat packs about 9 calories a gram. Water has none. Neither is bad. Calorie for calorie, 100 grams of avocado equals about a kilo of cucumber. Track your food and nutrition with cow meter." small.en on 26–30 s (`qa/asr-cta-small.txt`): "Track your food and nutrition with Cal Meter." The CTA take is the cached accepted take (MD5 858783ce…, same as english-06/07/08). The final re-mux decodes to bit-identical audio (MD5 345a178e…) as the ASR run. No human listening test here |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 10, 24, 140, 180, 230, 300, 350, 420, 480, 500, 545, 560, 620, 730, 800, 880) |
| Facts | USDA FDC 171705 and 168409, SR28 refuse and weights, FAO FNP 77; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, no editing instructions |

## Issues found and fixed
1. First voice pass ran 28.9 s (no room for gaps and a 3–4 s CTA) → lines tightened to 24.8 s, all re-checked verbatim by ASR.
2. Stills: the gram→kcal morph overflowed the plate because water collapsed after fat grew → water and fat now morph together (column height falls 440 → 400 px for avocado).
3. Stills: the "≈ 10×" badge appeared only as the scene left → moved to the "ten times" word.
4. First export: the right half of the plate was empty for ~4 s while the avocado column built → a dashed "100 g cucumber · ? kcal" jar waits there until its turn.
5. Sync check: "and 95% water", "water has none" and "≈ 1 kg of cucumber" appeared 0.11–0.5 s after their words → moved earlier.

## Remaining limits (honest)
- base.en hears the brand as "cow meter" on the full mix; small.en hears "Cal Meter"; the CTA audio is the accepted cached take. Intelligibility checked by ASR only.
- "Fat packs about nine calories a gram" uses the general factor; USDA computes these foods with a fat factor of 8.37 (both shown in `SOURCES.md`).
- Stop motion at 15 drawings/s; burnish transitions show the next scene's engraving before its wash (as in earlier episodes).
