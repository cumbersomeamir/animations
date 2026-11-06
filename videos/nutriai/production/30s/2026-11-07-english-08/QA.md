# QA: CalMeter English 30 s english-08, raisins vs grapes, the same 30 g (2026-11-07)

**Final output:** `videos/nutriai/production/30s/2026-11-07-english-08/nutriai-30s-english08-01.mp4`
sha256 `df2c8ab7cde6b4c513dfa628c0454198e0554ddbfc7c6dc33ddab612725a33ee` · 16317199 bytes · status: final (2026-11-07).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.2 LU, true peak −1.4 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003): small-area-motion stretches at 1.8 s (1.3 s) and 14.7 s (2.0 s) |
| Opening | Frame 0 already shows the balance with the first grape falling; six grapes and a 60-raisin heap land by 0.8 s; "? kcal" over both pans at 0.7 s (`qa/transitions.png`, frames 0/12/24) |
| Captions (`qa/text-bounds.txt`) | 651 caption runs, **0** outside x 90–990 / y 340–520 (ink x 131–949, y 359–468); ≤ 2 lines; blocks never overlap; no text above y 300; all English |
| Plate text | 3 679 runs: 0 above y 480, 0 off-frame, 0 right of x 950, 0 left of x 90, lowest y 1551 |
| Narration / caption sync | ASR word starts on the export vs caption lines: within ±0.10 s for 10 of 14 lines; "30 g of grapes" (+0.30 s), "same weight" (+0.27 s), "Grapes ≈ 80%" (+0.15 s) and "Track your food" (+0.40 s) are Whisper segment-start drift (takes placed at 0.30, 3.36 by take ASR, 5.75 and 26.20 s, where the lines appear) |
| Intelligibility | ASR on the export (faster-whisper base.en, VAD segmentation, `qa/asr-final-mp4.txt`): "30 grams of grapes, 30 grams of raisins, same weight, very different calories. Grapes are about 80 % water, drying removes most of it. So 30 grams of grapes is about 21 calories, raisins about 90, with four times the sugar. Drying adds no sugar. Those raisins started as about 130 grams of grapes. Same sugar, just far less water. Track your food and nutrition with cow meter." small.en on 26–30 s (`qa/asr-cta-small.txt`): "Track your food and nutrition with Cal Meter." The CTA take is byte-identical (MD5 858783ce…) to the accepted english-06/07 CTA. No human listening test here |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 12, 24, 150, 170, 200, 260, 300, 330, 440, 485, 520, 640, 720, 790, 890) |
| Facts | USDA FDC 174683 and 168165, SR28 WEIGHT checked; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, no editing instructions |

## Issues found and fixed
1. First stills: a 2.6 s silent gap before the CTA → a takeaway line "Same sugar, just far less water." (T3b) was added and the takes retimed (0.35–0.65 s gaps).
2. First stills: the dried hero read as a brown star / cookie → oblong raisin with long creases; yellow sugar granules keep the same count from grape to raisin while blue water cells empty.
3. First stills: hook fruit and bar labels too small; "≈ 90 kcal" printed under the sugar block (sugar alone is ≈ 80 kcal) → bigger balance and fruit, a true 60-raisin heap, bars with labels above, kcal moved to the bunch/heap labels.
4. Gauge read "81 %" next to "≈ 80 %" → gauge runs 80 % → 15 %.
5. First export: a 0.9 s hold at 15.8 s and 2.1 s at 27.7 s → four copies of the grapes' sugar box fly down and tile the raisins' sugar bar ("1 2 3 4"); glints over the bunch, a shine across the wordmark and a slow push-in on the CTA. Second export still had 1.0 s + 0.8 s holds in the CTA → the push-in keeps moving to the last frame. Final export: 0 events.
6. "1"–"3" box numbers collided with the "30 g raisins" label → numbers moved under the bar; the 4× arrow fades as the boxes fly.

## Remaining limits (honest)
- base.en hears the brand as "cow meter" on the full mix; small.en hears "Cal Meter"; the CTA audio is the accepted take from earlier episodes. Intelligibility checked by ASR only.
- Grape and raisin values are separate USDA samples; the 130 g mass balance is approximate (shown with ≈).
- Stop motion at 15 drawings/s; burnish transitions show the engraved outline before its wash (as in earlier episodes).
