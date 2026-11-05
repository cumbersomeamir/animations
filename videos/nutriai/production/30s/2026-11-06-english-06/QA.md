# QA: CalMeter English 30 s english-06, peanuts vs peanut butter (2026-11-06)

**Final output:** `videos/nutriai/production/30s/2026-11-06-english-06/nutriai-30s-english06-01.mp4`
sha256 `4c372aeb6070d1dd3619172870bb38d4353435e19dcb6bc2e88cd5254b542533` · 13803953 bytes · status: final (2026-11-06).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 3.9 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003): small-area-motion stretches of 1.1–2.0 s |
| Opening | The 30 g vs 30 g balance is drawn and loaded by ~0.5 s (frame 16 in `qa/transitions.png`) |
| Captions (`qa/text-bounds.txt`) | 652 caption runs, **0** outside x 90–990 / y 340–520 (ink x 131–949, y 359–468); ≤ 2 lines; blocks never overlap; no text above y 300; all English |
| Plate text | 3 629 runs: 0 above y 480, 0 off-frame, 0 right of x 950, lowest y 1538 |
| Narration / caption sync | ASR word starts on the export vs caption lines: within ±0.1 s for most phrases; +0.27…+0.42 s offsets at "Same", "Almost", "30" and "Track" are Whisper segment-start drift (those takes are placed at 0.25, 5.10, 18.30 and 26.40 s, exactly where their caption lines appear) |
| Intelligibility | ASR on the export (faster-whisper base.en, `qa/asr-final-mp4.txt`): "Same 30 grams, peanuts or peanut butter, which has more calories. Almost a tie, because peanuts are already about half fat by weight. The jar adds sugar, hydrogenated oil and salt. Sodium jumps from two milligrams to about 140. 30 grams is about two level tablespoons. A heaped spoon holds more, so weigh one once. Track your food and nutrition with cow meter." small.en on 26–30 s: "Track your food and nutrition with Cal Meter." (`qa/asr-cta-small-en.txt`); same phoneme override as the accepted English episodes. No human listening test here |
| Visual review | `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 16, 110, 146, 200, 250, 288, 390, 500, 540, 600, 700, 740, 800, 899) |
| Facts | USDA FDC 173806, FDC 2674433 (branded label), SR28 WEIGHT NDB 16398 checked; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, no editing instructions |

## Issues found and fixed
1. Narration first ran 27.4 s; T1 shortened (numbers kept on screen) and re-synthesized before rendering.
2. Stills: the CTA plate was nearly empty; the cutaway is now re-cut above the seal as a bookend.
3. First export: 4 freezedetect events (0.8–1.3 s still holds after each scene's action). Added purposeful motion (beam settle, "? kcal" + pulse rings, sodium count-up + bar hatch, dotted level line + "extra above level", slower bookend re-cut); second export left one hold (23.7 s) → longer beam settle + label; final export: 0 events. Audio unchanged across exports (audio MD5 82624ab24ebe6b13f2aa0fa7c5b259ac).

## Remaining limits (honest)
- Intelligibility checked by ASR only; "CalMeter" is read as the accepted CAL-meter override.
- The heaped spoon's weight is intentionally not stated (it varies); the plate says only "more than 16 g".
- Stop motion at 15 drawings/s; roundel flights step visibly (as in earlier episodes).
