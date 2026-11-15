# QA: CalMeter English 30 s english-15, a tablespoon of honey vs a tablespoon of sugar (2026-11-15)

**Final output:** `videos/nutriai/production/30s/2026-11-15-english-15/nutriai-30s-english15-01.mp4`
sha256 `c93aeef2e0029b9172c1fdbede63821493c750f04416534ab3c1266b393377bb` · 19962492 bytes · status: final (2026-11-15).
**Thumbnail:** `nutriai-30s-english15-thumbnail.png` (1080×1920 RGB, sha256 `bb98f5eb…466e`): the frame-0 composition, "WHICH / SPOON?" over two tablespoons (honey dripping, sugar sparkling), "HONEY" / "SUGAR"; text inside x 169–918, y 352–1501.
Topic: the requested avocado vs apple overlapped english-09; honey vs sugar chosen (see `SOURCES.md`). Built to `context/25-feedback-rules-2026-11-11.md` incl. the 2026-11-15 first-frame addendum.

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.3 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events at the default threshold and 0 at the stricter n = 0.003 scan |
| First frame | Frame 0 is the full composition (no logo, no fade, no empty setup): two tablespoons with a honey drip and sugar sparkles; text on frame 0 = "WHICH SPOON?", "HONEY", "SUGAR" (4 words). Narration starts at 0.15 s with the question |
| Story timing | Hook 0–3.4 s (question; "? kcal" roundels on "calories"); escalation 3.75–5.3 s ("Gram for gram, honey is lower"); build-up 5.6–10.6 s (honey jar with water drops ≈ 17 %, 304 vs 387 kcal / 100 g); twist + proof 11.2–20.7 s (same spoon: honey fills every gap vs sugar crystals trap air; scales 21 g vs 12.5 g); payoff 21.1–26.5 s (≈ 64 vs ≈ 48 kcal per spoon, + ≈ 15, LOG THE SPOON); CTA 27.1–29.4 s |
| Captions (`qa/text-bounds.txt`) | 545 caption runs, **0** outside x 100–900 / y 230–1500 (ink x 132–868, y 356–494); ≤ 2 lines; 64 px auto-fit centred on x 500; blocks never overlap; nothing above y 230 |
| Plate labels | 2 109 runs: 0 above y 480, 0 off-frame, 0 right of x 980, 0 left of x 100, 0 below y 1500 (lowest 1465); one brief label at a time |
| Narration / caption sync (`qa/sync.txt`) | 17 of 18 caption lines within ±0.23 s of the spoken word (15 within ±0.09 s); "Track your food…" (+0.50 s) is Whisper segment-start drift (take placed at 27.10 s) |
| Intelligibility | ASR on the export: small.en, text only (`qa/asr-final-small.txt`): "A tablespoon of honey, or of sugar, which adds more calories. Gram for gram, honey is lower. It's partly water. 304 calories per hundred grams, sugar 387. But spoons measure volume. Thick honey fills every gap. Sugar crystals trap air. A tablespoon of honey weighs 21 grams. Sugar, about 12 and a half. So per spoon, honey about 64 calories, sugar 48. Log the spoon you use. Track your food and nutrition with Cal Meter." It then appends "Subtitling by www.zeoranger.co.uk", a known Whisper hallucination on the closing music where nothing is spoken. base.en with VAD (`qa/asr-final-mp4.txt`): same words except the brand ("cow meter"). small.en with word timestamps crashed in faster-whisper's alignment step on this file (IndexError), hence the text-only run. No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 10, 80, 114, 150, 200, 240, 300, 328, 350, 400, 450, 486, 520, 590, 680, 710, 780, 840, 890); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA SR Legacy FDC 169640 and 169655, SR28 spoon and cup weights; calculations in `research/spoon-calculations.txt`; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states level tablespoons, no editing instructions |

## Issues found and fixed
1. Topic overlap with english-09 (avocado) → honey vs sugar with an equally strong opening.
2. First voice pass ran 28.6 s and base.en heard "Per gram" as "Program" → T1 became "Gram for gram, honey is lower."; three lines tightened (speech 24.6 s).
3. Stills: the two spoons crossed in an X (hook, same-spoon scene, thumbnail) → mirrored pair with handles outward; the honey drip is drawn in plate space so it always falls straight down; the scale showed "13 g" for 12.5 g → one decimal.
4. ASR missed "But" in "But spoons measure volume" (it ran into "…eighty-seven" with 0.3 s between lines, even on the voice-only track) → T3 to T5 moved 0.15–0.2 s later; both models now hear "But".
5. "≈ 17% WATER" touched x 95 during a camera kick → moved inward; page-turn sounds moved before each line start so they never sit on the first word.
6. Sync: "304 kcal per 100 g" appeared 0.55 s after "three hundred four" (the take-level word time was a zero-length guess) → moved with its roundel.

## Remaining limits (honest)
- The sugar tablespoon weight (12.5 g) is derived from USDA's cup weight (cup ÷ 16; 3 × 4.2 g tsp = 12.6 g); heaped spoons hold more of either food.
- The loupes (smooth honey, crystals with air) are diagrams, not to scale.
- Narration and caption timing are checked by ASR only; frames by machine-rendered sheets. No human watched or listened.
