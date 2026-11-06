# QA: CalMeter English 30 s english-07, boiled egg + a measured teaspoon of oil (2026-11-06)

**Final output:** `videos/nutriai/production/30s/2026-11-06-english-07/nutriai-30s-english07-01.mp4`
sha256 `70817f2c06aa2769727d499b0691d1bfd7cf838ac28663519ee6abc2362916a5` · 13970581 bytes · status: final (2026-11-06).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 5.3 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003): small-area-motion stretches of 0.9–2.2 s |
| Opening | Knife cuts the engraved egg at ~0.7 s; halves part by 1.2 s (`qa/transitions.png`, frames 20/34/48) |
| Captions (`qa/text-bounds.txt`) | 704 caption runs, **0** outside x 90–990 / y 340–520 (ink x 131–949, y 359–468); ≤ 2 lines; blocks never overlap; no text above y 300; all English |
| Plate text | 3 060 runs: 0 above y 480, 0 off-frame, 0 right of x 950, lowest y 1538 |
| Narration / caption sync | ASR word starts on the export vs caption lines: within ±0.07 s for most phrases; "One" (+0.30 s) and "Fry" (+0.42 s) are Whisper segment-start drift (takes placed at 0.30 s and 6.30 s, where the lines appear); line 2 "of oil: up to +40 kcal" appears 0.35 s before "adds" |
| Intelligibility | ASR on the export (faster-whisper base.en with VAD segmentation, `qa/asr-final-mp4.txt`): "One large boiled egg, about 78 calories and 6 grams of protein. Fry it with one measured teaspoon of oil, and that teaspoon adds up to 40 calories. The protein stays about 6 grams. The extra energy comes from the oil, an ingredient of its own. So measure the oil and log it next to the egg instead of guessing. Track your food and nutrition with calmeter." small.en on 26–30 s: "Track your food and nutrition with Cal Meter." No human listening test here |
| Visual review | `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 20, 34, 48, 120, 180, 236, 270, 330, 420, 520, 600, 700, 780, 890) |
| Facts | USDA FDC 173424, 171411, 172336, 173423 and SR28 WEIGHT checked; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, no editing instructions |

## Issues found and fixed
1. Stills: the oil pool read murky olive (multiply over a grey pan) → lighter pan floor and translucent gold oil; the "+ up to 40 kcal" label touched the pan rim → moved up-right inside x 950.
2. First export: a 1.7 s still hold at 28.1 s (end of the CTA) → slower bookend re-cut; second export: a 0.9 s hold at 28.9 s → a glint sweeps the yolk in the final second. Final export: 0 events.
3. Text QA: a "1 tsp" handle label crossed x 950 for two frames while the spoon slid in → it now appears only once the spoon has arrived.
4. ASR on the full mix hit a faster-whisper word-alignment IndexError; re-run with VAD segmentation (same audio, MD5 b047f0c37b439a8e571e77832fa41757) succeeded.

## Remaining limits (honest)
- "Up to 40 kcal" is deliberate: the share of the teaspoon eaten with the egg varies, so no exact fried-egg total is claimed.
- Intelligibility checked by ASR only.
- Stop motion at 15 drawings/s; roundel flights step visibly (as in earlier episodes).
