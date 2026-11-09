# QA: CalMeter English 30 s english-10, cooked vs dry-roasted chickpeas (2026-11-09)

**Final output:** `videos/nutriai/production/30s/2026-11-09-english-10/nutriai-30s-english10-01.mp4`
sha256 `5a0d33d0bbd3fa34d2f6353b9d60d3649f9db1aa2e56b704e65425f3b96c0789` · 15524526 bytes · status: final (2026-11-09).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 3.1 LU, true peak −1.4 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003): small-area-motion stretches at 14.0 s (1.1 s) and 22.3 s (1.1 s) |
| Opening | Frame 0 shows the balance with cooked chickpeas falling; the roasted heap lands by 0.8 s; "? kcal" over both pans at 0.8 s (`qa/transitions.png`, frames 0/12/24) |
| Captions (`qa/text-bounds.txt`) | 632 caption runs, **0** outside x 90–990 / y 340–520 (ink x 131–949, y 359–468); ≤ 2 lines; blocks never overlap; no text above y 300; all English |
| Plate text | 4 331 runs: 0 above y 480, 0 off-frame, 0 right of x 950, 0 left of x 90, lowest y 1566 |
| Narration / caption sync (`qa/sync.txt`) | 11 of 13 caption lines within ±0.12 s of the spoken word (most within ±0.08 s); the first line (+0.30 s) and "Track your food" (+0.46 s) are Whisper segment-start drift (takes placed at 0.30 and 26.30 s, where the lines appear) |
| Intelligibility | ASR on the export (faster-whisper base.en, VAD segmentation, `qa/asr-final-mp4.txt`): "A hundred grams of cooked chickpeas, a hundred roasted, more than double the calories. Cooked ones are 60 % water. Roasting drives most of it off, so a hundred grams shrinks to under half. Same calories, same protein. Per hundred grams, roasted has about 380 calories and 20 grams of protein. Snack tip, 30 grams roasted is about 70 grams cooked, around 115 calories. Track your food and nutrition with cow meter." small.en on 26–30 s (`qa/asr-cta-small.txt`): "Track your food and nutrition with Cal Meter." The CTA take is the cached accepted take (MD5 858783ce…, same as english-06 to 09). No human listening test here |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 12, 24, 125, 154, 200, 260, 330, 395, 410, 500, 545, 575, 660, 740, 800, 880) |
| Facts | USDA FDC 173757 and 173756, Foundation FDC 2644282, SR28 weights, Branded Foods serving summary; method and ranges in `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, labels both preparations, no editing instructions |

## Issues found and fixed
1. Stills: the per-100 g bars left the top third of the plate empty → bars moved up and enlarged; a line "100 g roasted = the chickpeas of ≈ 230 g cooked" added below.
2. First export: a 1.4 s hold at 23.6 s (snack dishes) → rings now pair each roasted chickpea with a cooked one, and a slow push-in toward the dishes starts at 23.3 s and runs into the CTA (rings alone were too small to count as motion). Final export: 0 events.
3. ASR on the mix heard "Per a hundred grams" as "For": the page-turn sound of the burnish at 13.3 s masked the "P" → moved to 13.07 s and 4 dB quieter; both base.en and small.en now hear "Per".
4. Sync check: "more than 2× the calories" (+0.23 s) and "Snack tip" (−0.18 s) moved to their words.

## Remaining limits (honest)
- No USDA entry exists for home dry-roasted chickpeas: roasted values are computed from cooked chickpeas by removing water (cross-checked against dried chickpeas) and shown with "≈"; ranges for 3–10 % water are in `SOURCES.md`. Oil-roasted snacks are not covered.
- base.en hears the brand as "cow meter" on the full mix; small.en hears "Cal Meter". Intelligibility checked by ASR only.
- Stop motion at 15 drawings/s; burnish transitions show the next scene's engraving before its wash (as in earlier episodes).
