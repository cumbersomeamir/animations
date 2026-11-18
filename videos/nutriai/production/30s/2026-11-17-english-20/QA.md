# QA: CalMeter English 30 s english-20, pistachios: shell weight vs edible kernels, "HALF IS SHELL?" (batch 20, delivered 2026-11-18)

**Final output:** `videos/nutriai/production/30s/2026-11-17-english-20/nutriai-30s-english20-01.mp4`
sha256 `f9a3bad522f26beecc61c60f56350953a3811eceebb9665cca2862b32228f78f` · 20368499 bytes · status: final (2026-11-18).
**Thumbnail:** `nutriai-30s-english20-thumbnail.png` (1080×1920 RGB, sha256 `5cbb3254fcf2b756ec1f24d7f3647f7c72e178d82226c5f580aca14cd0b8c444`): the frame-0 composition full bleed, "HALF IS" (yellow) / "SHELL?" (white), 210 px outlined, over the grinning in-shell pistachio character and a heap of pistachios; text ink x 133–941, y 389–788 (`qa/text-bounds-thumbnail.txt`; above the y 480 plate line because a thumbnail has no caption band, inside the 230–1500 safe band).
**First frame:** `qa/first-frame.png`.
Folder date: the brief named `2026-11-17-english-20`; the episode was produced on 2026-11-18 in this new continuation session (context/34).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.2 LU, true peak −1.4 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 black events; 0 freeze events at the default threshold and 0 at the stricter n = 0.003 scan |
| First frame | Full-frame violet scene, no logo, fade or empty setup: a big grinning in-shell pistachio (eyes, open shell showing the green kernel), tumbling pistachios and a heap in the foreground; frame-0 text = "HALF IS SHELL?" (3 words, a question; USDA refuse is 47 %). Narration starts at 0.15 s; the headline exits at 1.4–1.7 s as the second caption begins |
| Story timing | Hook 0–2.9 s; superhook 3.2–5.0 s (in-shell pile pours onto a scale, 100 g, trembles, bursts at 4.67 s); proof 5.25–9.3 s (shell halves fly to one scale, 47 g "SHELL"; kernels hop to another, 53 g "KERNELS"); breakdown 9.5–17.0 s (kernel character: ≈ 570 kcal with sparks, 46 g FAT with oil drops into a pool, 21 g PROTEIN with stacking cubes, 10 g FIBRE with strands); payoff 17.35–22.4 s (100 g in shell, shells turn to dashed ghosts, ≈ 300 kcal, "NOT 570" slashed); portion 22.7–26.2 s (49 kernels count into a bowl, 28 g, ≈ 160 kcal, the pistachio peeks in); CTA 27.1–29.4 s |
| Feedback applied (context/34) | captions 84 px (fit ≥ 66 px; measured ink y 333–521), numbers 136–190 px, smallest sublabel 50 px; five full-bleed colour scenes joined by whip-pans (motion blur + speed lines); turning rays and drifting bokeh for depth; squash-and-stretch landings; crack burst with flying shell halves and camera shake; kinetic count-ups with a shine sweep; a playful character in hook, breakdown and CTA |
| Captions (`qa/text-bounds.txt`) | 1 039 caption runs, **0** outside x 100–900 / y 230–1500 (ink x 129–871, y 333–521); ≤ 2 lines |
| Plate labels | 1 968 runs, 0 outside x 100–980 / y 480–1500 (ink x 103–973, y 510–1486); CTA wordmark x 427–805, y 1388–1451 |
| Narration / caption sync (`qa/sync.txt`) | **25 of 25** caption lines within ±0.25 s of the spoken word (base.en word timestamps on the final MP4); largest offsets −0.14 s ("21 g protein,"), −0.13 s ("not 570.") |
| Intelligibility | small.en, text only (`qa/asr-final-small.txt`): "Pistachios in the shell. How much do you really eat? Let's crack open 100 grams. 47 grams of that is shell. Just 53 grams of kernels. Per 100 grams of kernels. About 570 calories. 46 grams of fat. 21 of protein and 10 of fiber. So 100 grams in the shell is about 300 calories, not 570. A handful of 49 kernels. About 160. Track your food and nutrition with Cal Meter." (verbatim). base.en with VAD (`qa/asr-final-mp4.txt`): same words (brand "calmeter"). Take-level pass: `qa/asr-takes.txt`. No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 86, 92, 96, 100, 140, 146, 160, 274, 281, 288, 342, 393, 441, 481, 508, 516, 522, 576, 640, 672, 680, 686, 752, 806, 860, 899: every whip-pan before/during/after and every number pop); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA SR Legacy FDC 170185 (cross-check 170184, 169426), SR28 refuse 47 % "Shells", SR28 household weight 1 oz (49 kernels) = 28.35 g; calculations in `research/pistachio-calculations.txt`; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states roasted, unsalted kernels |

## Issues found and fixed
1. T2 voice: "Forty-seven grams are shell" was heard as "47 grams or shell" → four phrasings generated; "Forty-seven grams of that is shell. Just fifty-three grams of kernels." chosen (verbatim on base.en and small.en). T3/T5 shortened so the content ends before the CTA (speech 25.3 s → 24.4 s).
2. Stills: piles formed towers (layout bug) → mound layout; the hook headline overlapped the character's open lid → character lowered; at the crack the old scale vanished before the two new scales arrived → retimed; shell halves read as slivers → bigger cups with a pale inside.
3. Payoff and portion scenes carried too much text → "ONLY KERNELS COUNT" removed (the ghosted shells show it); "≈ 160 kcal" crowded the heap and the peeking character → bowl group lowered, character moved.
4. Bounds: "KERNELS", "SHELL", "21 g PROTEIN" grazed the margins during pop overshoot + push-in, the sinking scale's readout left the frame, a 2-line caption overshot by ≤ 8 px during its pop → all moved/fitted; final 0 outside.
5. Sync: "and 10 g fibre." appeared 0.45 s late → starts on "and". Number pops moved off the spoken numbers (base.en had split "160" into "160. 60."); after the fix both ASR models read the mix verbatim.
6. Drawing bug: each pistachio's lower-shell outline was translated twice (a stray arc in the thumbnail; lower shells had no outline) → drawn in the shell's own transform; full re-render.

## Remaining limits (honest)
- 47 % shell is USDA's average refuse; individual nuts and lots vary. "About half" in the frame-0 question and "about 300" are rounded.
- Values are USDA averages for dry-roasted, unsalted kernels (raw 560 kcal gives the same rounded story). Salted pistachios differ mainly in sodium (not covered).
- The 49-kernel handful is USDA's 1 oz household measure (28.35 g); SR28's separate "1 kernel = 0.7 g" does not match it and is not used. Kernel size varies.
- Fat drops, protein cubes, fibre strands and the characters are symbols, not to scale; scale readouts show the calculated grams.
- Narration and caption timing are checked by ASR only; frames by machine-rendered sheets. No human watched or listened.
