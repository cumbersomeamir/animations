# QA: CalMeter English 30 s english-17, a huge watermelon wedge vs a few raisins, "SIZE LIES" (2026-11-15, batch 17)

**Final output:** `videos/nutriai/production/30s/2026-11-15-english-17/nutriai-30s-english17-01.mp4`
sha256 `275a48652d38d4b5a09f9e0b21ca49316f872ce5d6509054d80dde5cd283ad93` · 20331419 bytes · status: final (2026-11-15).
**Thumbnail:** `nutriai-30s-english17-thumbnail.png` (1080×1920 RGB, sha256 `6d532743…0796`): the frame-0 composition, "SIZE / LIES" (210 px) over the huge wedge and the tiny dish of raisins ("RAISINS"); text inside x 308–963, y 315–1608.
Topic: watermelon never covered; requested topic used (see `SOURCES.md`). Built to `context/25-feedback-rules-2026-11-11.md` incl. the 2026-11-15 first-frame addendum.

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.3 LU, true peak −1.4 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 black events; 0 freeze events at the default threshold and 0 at the stricter n = 0.003 scan |
| First frame | Frame 0 is the full composition (no logo, fade or empty setup): a huge glossy 3D watermelon wedge with rind and seeds beside a tiny dish of raisins. Text on frame 0 = "SIZE LIES", "RAISINS" (3 words). Narration starts at 0.15 s |
| Story timing | Hook 0–4.0 s (question; "? kcal" roundels on "calories"); escalation 4.4–6.3 s (answer: both ≈ 85 kcal, "SAME kcal"); proof 6.6–21.5 s (the wedge lands on a scale, 286 g "FLESH ONLY"; 60 raisins pour onto a scale, 28 g; "≈ 10×"; water leaves the flesh into a glass, "91% WATER", "0 kcal"; per 100 g, raisins pour into a heap and a watermelon cube drops: 299 vs 30, "× 10"); payoff 21.9–26.8 s (a ghost wedge grows behind a 28 g dish of raisins, "= 1 WEDGE", "LOG GRAMS"); CTA 27.1–29.4 s |
| Captions (`qa/text-bounds.txt`) | 591 caption runs, **0** outside x 100–900 / y 230–1500 (ink x 130–870, y 356–494); ≤ 2 lines; 64 px auto-fit centred on x 500; blocks never overlap |
| Plate labels | 1 219 runs, 0 outside x 100–980 / y 480–1500 (ink x 130–951, y 564–1489); CTA wordmark x 434–797, y 1335–1402 |
| Narration / caption sync (`qa/sync.txt`) | all 18 caption lines within ±0.21 s of the spoken word (11 within ±0.10 s), CTA line included |
| Intelligibility | ASR on the export, small.en with word timestamps (`qa/asr-final-small.txt`): "Huge watermelon wedge, tiny raisins, which has more calories. Neither, both are about 85. Yet the wedge holds 286 grams of flesh. 60 raisins, just 28. Watermelon is 91 % water. And water has no calories. Per 100 grams, raisins, 299 calories. Watermelon, 30. So a small handful of raisins counts like a whole wedge. Log grams, not size. Track your food and nutrition with Cal Meter." (verbatim). base.en with VAD (`qa/asr-final-mp4.txt`): same words, brand heard as "cow meter". No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 10, 90, 120, 170, 196, 230, 300, 330, 346, 390, 450, 478, 540, 625, 640, 700, 750, 830, 890); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA SR Legacy FDC 167765 and 168165 with SR28 household weights and refuse; FAO FNP 77; calculations in `research/watermelon-raisin-calculations.txt`; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states the wedge is edible flesh without rind and 1 oz ≈ 60 raisins |

## Issues found and fixed
1. First voice pass ran 27.2 s before the CTA (hook 4.4 s) → shorter hook ("Huge watermelon wedge, tiny raisins: which has more calories?") and per-100 g line; base.en heard "two ninety-nine" as "2 .99", so the line says "two hundred ninety-nine" (both models: 299).
2. Fact check after the first render: USDA household weights are edible portions ("without refuse"; watermelon refuse 48 %, rind and seeds), so the 286 g wedge is flesh only → line 2 re-voiced ("the wedge holds 286 grams of flesh"), a "FLESH ONLY" label added at the scale, later lines moved 0.45–0.55 s.
3. Stills: a looping juice drop under the wedge read as a stray red dot → removed; the tiny raisins were enlarged slightly to stay recognisable; the payoff's ghost wedge looked muddy (stacked translucent faces) → rendered once off-screen and faded as one layer.
4. Bounds: "WATERMELON" (x 95) and "FLESH ONLY" (y 1505) crossed the label window during camera push-ins → moved inward; the thumbnail's "RAISINS" moved inside x 963.
5. Contact sheet: the per-100 g dish sat empty for 1.4 s → raisins now pour in on "per hundred grams"; the "log grams" caption was 0.27 s early → aligned.

## Remaining limits (honest)
- "A few raisins" / "a small handful" is the USDA ounce (28 g ≈ 60 raisins); real handfuls and wedges vary, which is the episode's point.
- The drawn wedge includes its rind, while the 286 g and 85 kcal are for the flesh (labelled "FLESH ONLY" and said in the narration).
- Raisin piles show fewer raisins than the real counts; water leaving the wedge is a diagram.
- Narration and caption timing are checked by ASR only; frames by machine-rendered sheets. No human watched or listened.
