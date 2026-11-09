# QA: CalMeter English 30 s english-11, a medium baked potato, then butter (2026-11-09)

**Final output:** `videos/nutriai/production/30s/2026-11-09-english-11/nutriai-30s-english11-01.mp4`
sha256 `9992c9846de4949ab231ade77722816fed4c245d595ed839d86e359d21650748` · 15630766 bytes · status: final (2026-11-09).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.8 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003): small-area-motion stretches of 0.8–1.3 s at 3.7, 14.1, 14.9 and 22.5 s |
| Opening | The potato splits open from frame 2 with steam (open by 0.7 s); "? kcal" at 0.5 s; the camera settles from a 1.18× loupe over 3.3 s (`qa/transitions.png`, frames 0/12/30) |
| Captions (`qa/text-bounds.txt`) | 602 caption runs, **0** outside x 90–990 / y 340–520 (ink x 131–949, y 359–468); ≤ 2 lines; blocks never overlap; no text above y 300; all English |
| Plate text | 6 475 runs: 0 above y 480, 0 off-frame, 0 right of x 950, 0 left of x 90, lowest y 1566 |
| Narration / caption sync (`qa/sync.txt`) | 13 of 15 caption lines within ±0.08 s of the spoken word; the first line (+0.30 s) and "Track your food" (+0.50 s) are Whisper segment-start drift (takes placed at 0.30 and 26.30 s, where the lines appear) |
| Intelligibility | ASR on the export (faster-whisper base.en, VAD segmentation, `qa/asr-final-mp4.txt`): "A baked potato, about 160 calories, with a tablespoon of butter, 260. The potato brings 37 grams of carbs, 4 of fiber, and over 900 milligrams of potassium. The butter brings about 100 calories, almost all from fat. A pat adds about 35, 2 tablespoons, about 200. The potato stays the same. Log the topping, too. Track your food and nutrition with cow meter." small.en on 26–30 s (`qa/asr-cta-small.txt`): "Track your food and nutrition with Cal Meter." The CTA take is the cached accepted take (MD5 858783ce…, same as english-06 to 10). No human listening test here |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 12, 30, 110, 130, 170, 190, 230, 330, 450, 500, 526, 560, 620, 680, 740, 800, 880) |
| Facts | USDA FDC 170093 and 173410, SR28 portion weights; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states the edible weights, no editing instructions |

## Issues found and fixed
1. First voice pass ran 27.6 s (no room for a 3–4 s CTA) → three lines tightened to 23.9 s, all re-checked verbatim by ASR.
2. Stills: butter drips read as stray squares → removed (the pool stays in the opening); the fat note was rephrased to "≈ 100 of the butter's 102 kcal come from its fat".
3. First export: a 1.5 s hold at 1.8 s → the kcal figure counts up, the butter spoon glides in from 2.1 s, and the opening camera settle lasts 3.3 s instead of 1.9 s (count and spoon alone were too small to register). Final export: 0 events.
4. Sync check: four lines ("≈ 160 kcal", "with 1 tbsp of butter", "≈ 260 kcal", "log the topping too") moved 0.1–0.23 s to their words, with their reveals and sounds; the first caption now says "A baked potato," as spoken (medium · 173 g stays on the plate).

## Remaining limits (honest)
- base.en hears the brand as "cow meter" on the full mix; small.en hears "Cal Meter". Intelligibility checked by ASR only.
- Values are for one USDA medium potato (173 g) and salted butter by standard measures; real potatoes and spoonfuls vary, so every value carries "≈".
- Stop motion at 15 drawings/s; burnish transitions show the next scene's engraving before its wash (as in earlier episodes).
