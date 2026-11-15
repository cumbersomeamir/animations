# QA: CalMeter English 30 s english-16, dark vs milk chocolate, "MORE CALORIES?" (2026-11-15, batch 16)

**Final output:** `videos/nutriai/production/30s/2026-11-15-english-16/nutriai-30s-english16-01.mp4`
sha256 `53d698c5f5d55027c395496bf636de9f409f4d8bf5a2def739f142181da24222` · 21064744 bytes · status: final (2026-11-15).
**Thumbnail:** `nutriai-30s-english16-thumbnail.png` (1080×1920 RGB, sha256 `c6b000f8…5e19`): the frame-0 composition, "MORE / CALORIES?" over a snapped dark bar ("DARK 70–85%") and a snapped milk bar ("MILK"); text inside x 144–936, y 337–1500.
Topic: the requested grapes vs raisins was already english-08; dark vs milk chocolate chosen (see `SOURCES.md`). Built to `context/25-feedback-rules-2026-11-11.md` incl. the 2026-11-15 first-frame addendum.

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.1 LUFS integrated, LRA 2.1 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 black events; 0 freeze events at the default threshold and 0 at the stricter n = 0.003 scan |
| First frame | Frame 0 is the full composition (no logo, no fade, no empty setup): two big chocolate bars, each with a snapped square hanging between them and crumbs falling. Text on frame 0 = "MORE CALORIES?", "DARK", "70–85%", "MILK" (4 words + the cacao band). Narration starts at 0.15 s with the question |
| Story timing | Hook 0–3.4 s (question; "? kcal" roundels on "calories"); escalation 3.7–7.9 s (answer: 598 vs 535 kcal / 100 g, dark bar hops); build-up 8.4–12.4 s (the open question: less than half the sugar, 6 vs 13 sugar cubes tumble, 24 g vs 52 g); proof 12.9–20.9 s (cacao pod splits, cocoa butter pours into blocks 43 g vs 30 g; 1 gram: fat 9 energy coins vs sugar 4); payoff 21.4–26.6 s (30 g pieces land on scales, ≈ 180 vs ≈ 160 kcal, LOG THE GRAMS); CTA 27.1–29.4 s |
| Captions (`qa/text-bounds.txt`) | 573 caption runs, **0** outside x 100–900 / y 230–1500 (ink x 130–870, y 356–494); ≤ 2 lines; 64 px auto-fit centred on x 500; blocks never overlap; nothing above y 230 |
| Plate labels | 2 541 runs, 0 outside x 100–980 / y 480–1500 (ink x 124–956, y 576–1472); CTA wordmark x 434–797, y 1335–1402 |
| Narration / caption sync (`qa/sync.txt`) | 19 of 20 caption lines within ±0.21 s of the spoken word (12 within ±0.10 s); "Track your food…" shows +0.64 s, but the voice-only track is silent until 27.10 s, when the CTA take and its caption start together: Whisper stretches "Track" back over the pause (base.en reports a 0.94 s "Track") |
| Intelligibility | ASR on the export, small.en with word timestamps (`qa/asr-final-small.txt`): "Dark chocolate or milk chocolate, which has more calories. Dark does 598 per 100 grams, milk 535. Yet it has less than half the sugar, 24 grams against 52. More cacao means more cocoa butter, 43 grams of fat against 30. And fat has 9 calories a gram, sugar only 4. 30 grams each, about 180 versus 160. Log the grams, not the shade. Track your food and nutrition with CalMeter." (verbatim, brand included). base.en with VAD (`qa/asr-final-mp4.txt`): same words, numbers written "5 .98" / "5 .35", brand heard as "cow meter". No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 10, 80, 112, 140, 204, 246, 280, 352, 378, 400, 440, 510, 530, 560, 620, 634, 690, 760, 890); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA SR Legacy FDC 170273 and 167587; 21 CFR 163.111; FAO FNP 77 factors; calculations in `research/chocolate-calculations.txt`; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states "Dark = 70–85% cacao; plain bars, per 100 g", no editing instructions |

## Issues found and fixed
1. Topic overlap: grapes vs raisins was english-08 (and water removal also carried english-10 and english-13) → dark vs milk chocolate, never covered, with a hook that works as a thumbnail.
2. First voice pass ran 28.3 s before the CTA and base.en heard "sugar four" as "sugar for" → the story was reordered (answer and per-100 g totals first, sugar as the open question, cocoa butter and 9 vs 4 kcal as the proof); takes now 25.2 s and both models hear "only four".
3. Stills: the cacao pod's stalk floated free when the pod split → attached to the lower half; hook and per-100 g bars enlarged (1.08× / 1.0×) to fill the card; thumbnail composition scaled 1.18× and lowered.
4. Contact sheet: the sugar scene sat almost empty from 8.0 to 9.5 s (cubes only began on "twenty-four") → the cubes now tumble in on "less than half the sugar" (dark 8.7 s, milk 9.7 s) and the roundels pop on the numbers.

## Remaining limits (honest)
- "Dark" means the USDA 70–85 % cacao band (on the wrapper and in the notes); a 50 % dark bar has nearly as much sugar as milk chocolate, though every USDA dark band still has more energy per 100 g than milk chocolate.
- 9 and 4 kcal per gram are general conversion factors (USDA energy values use food-specific factors); the 30 g piece is illustrative.
- Sugar cubes (≈ 4 g units), butter blocks scaled to grams and energy coins are diagrams, not to scale with the bars.
- Narration and caption timing are checked by ASR only; frames by machine-rendered sheets. No human watched or listened.
