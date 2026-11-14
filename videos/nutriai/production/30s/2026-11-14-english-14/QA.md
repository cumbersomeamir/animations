# QA: CalMeter English 30 s english-14, edamame vs green peas (2026-11-14)

**Final output:** `videos/nutriai/production/30s/2026-11-14-english-14/nutriai-30s-english14-01.mp4`
sha256 `4d3cf8b54a3ac8462d8cdea64d5f2b985f2021a12bb2e26d03138fced976f754` · 20216393 bytes · status: final (2026-11-14).
**Thumbnail:** `nutriai-30s-english14-thumbnail.png` (1080×1920 RGB, sha256 `7f3cad01…5ba9`): "LOOK ALIKE. / NOT ALIKE." over a pea pod ≠ an edamame pod, a pea and a bean; words inside x 117–962, y 347–602.
Topic: the requested peanuts vs green peas overlapped english-06; edamame replaced peanuts (see `SOURCES.md`). Built to `context/25-feedback-rules-2026-11-11.md`.

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.9 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events at the default threshold and 0 at the stricter n = 0.003 scan |
| Story timing | Hook 0–4.0 s (two pods burst open at frame 0; GREEN PEAS = EDAMAME, then ≠); super hook 4.1–5.4 s (one pea, one bean, "?"); build-up 5.6–10.7 s (inside the edamame bean: PROTEIN + OIL; inside the pea: MOSTLY CARBS); proof 10.9–20.0 s (per 100 g cooked: protein cubes 12 vs 5, fat drops 5 vs ≈ 0, 121 vs 78 kcal); payoff 20.2–26.6 s (one cup each: 18 g vs 8 g protein, ≈ 2×, ≈ 188 vs ≈ 125 kcal, + ≈ 60); CTA 27.1–29.4 s |
| Captions (`qa/text-bounds.txt`) | 474 caption runs, **0** outside x 100–900 / y 230–1500 (ink x 132–868, y 356–494); ≤ 2 lines; 64 px auto-fit centred on x 500; blocks never overlap; nothing above y 230 |
| Plate labels | 2 802 runs: 0 above y 480, 0 off-frame, 0 right of x 980, 0 left of x 100, 0 below y 1500 (lowest 1496); one brief label at a time |
| Pronunciation | Kokoro's default "edamame" (ˈɛdɐmˌeɪm, three syllables) was replaced by /ˌɛdəmˈɑːmeɪ/ in all three lines; small.en hears "edamame" and "soybeans" in every take and in the full mix |
| Narration / caption sync (`qa/sync.txt`) | 15 of 16 caption lines within ±0.23 s of the spoken word (14 within ±0.07 s); "Track your food…" (+0.38 s) is Whisper segment-start drift (take placed at 27.10 s) |
| Intelligibility | ASR on the export: small.en (`qa/asr-final-small.txt`) "Green peas and edamame look like twins, their numbers don't. So what's different inside? Edamame are young soybeans which store protein and oil. Peas store mostly carbs. Per 100 grams cooked. 12 grams of protein versus 5. 5 of fat versus almost none. 121 calories against 78. Snack tip. A cup of edamame brings about double the protein of peas for about 60 more calories. Track your food and nutrition with Cal Meter." base.en with VAD (`qa/asr-final-mp4.txt`) is the same except the brand ("cow meter"). No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 8, 50, 90, 125, 140, 170, 215, 268, 290, 325, 400, 470, 545, 604, 640, 690, 745, 800, 850, 890); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA SR Legacy FDC 168411, 170017 (cross-check 169283), mature seeds 174270 and 172428, SR28 cup weights; SDSU Extension and ATTRA for "young soybeans"; calculations in `research/legume-calculations.txt`; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states preparation and cup weights, no editing instructions |

## Issues found and fixed
1. Topic overlap with english-06 (peanuts) → edamame vs green peas, same brief criteria.
2. First voice pass ran 30.0 s and the hook began with "Edamame" (ASR heard "edmame") → hook reordered ("Green peas and edamame…"), lines tightened to 25.7 s; "edamame" phoneme override added.
3. Stills: pods too small and high in the hook and thumbnail; the per-100 g scene cramped → bigger pods, kcal / fat / protein rows with bigger cubes and labels.
4. Bounds: "GREEN PEAS" started at x 71, dish names reached y 1512, "12 g PROTEIN" at x 95 → moved inward; the "PROTEIN + OIL" label now fades before the scene slides.
5. ASR heard "Per hundred grams" as "For": the page-turn sound at 10.7 s masked the "P" → moved to 10.3 s and 4 dB quieter; both models now hear "Per".
6. Sync: five lines (−0.16 to −0.49 s early) moved to their words, with their reveals and sounds.

## Remaining limits (honest)
- USDA's edamame entry rests on two analytical samples (n = 2); the green-soybean entry (FDC 169283) agrees within about 15 %. Values are rounded (≈).
- The water difference (72.8 vs 79.5 g / 100 g) is in the notes but not labelled on screen, to keep one idea per scene (protein, fat, energy).
- The cutaways (oil drops, protein squares, carb granules) are diagrams, not to scale.
- Narration and caption timing are checked by ASR only; frames by machine-rendered sheets. No human watched or listened.
