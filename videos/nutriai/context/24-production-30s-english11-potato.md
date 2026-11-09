# 24 — Production 30 s, batch 2026-11-09-english-11: a medium baked potato with skin, then butter (English)

Output: `videos/nutriai/production/30s/2026-11-09-english-11/nutriai-30s-english11-01.mp4`. QA + hash: `production/30s/2026-11-09-english-11/QA.md`. Sources: `.../SOURCES.md`. Publishing caption (English, matches the final transcript): `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks
- Repo `cumbersomeamir/animations`, branch `claude-video/nutriai`, in sync with origin at `2beaad2` (english-10 chickpeas) before edits; account per session context (info@tensorblue.com). No render/ffmpeg/TTS/ASR process was running; no earlier accepted job was unfinished.
- Topic history: potato appears only as an idea in `08-educational-strategy.md` (item 3, raw vs boiled), never produced; "butter" appears only as peanut butter (english-06). The requested topic was used. Its structure (a base food plus an added fat) echoes english-07 (egg + oil), with a different food and portion comparison.
- The Instagram App Performance sheet itself is not in this repo or chat; its approved direction (visible hook in the first second, concrete payoff, one short CTA) was applied as stated in the brief. No analytics are quoted or inferred.
- Language: English narration and English captions only.

## Kept from the most recently accepted recipe (no Three.js)
Shared parts of `production/30s/2026-11-09-english-10/source/render.mjs` (burin, washes, burnish transitions, ivory plate + ruled border + cut title "PLATE XIII · BAKED POTATO, THEN BUTTER", English captions Inter Display Black 58 px at baselines 401 / 455, CTA seal with `assets/icon.png`, wordmark shine, camera with the slow push-in from 23.3 s into the CTA, stop motion 15 drawings/s). Voice: approved Meshline/Recall character (Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98); the CTA is the cached accepted take. Audio: accepted quiet `mix.py`.

## Episode-specific choices
- **Immediate hook:** an engraved russet potato splits open from frame 2 with steam; "? kcal" → "160 kcal" (counted up) under "medium baked potato · 173 g · flesh + skin, no salt"; a tablespoon carrying a butter slab glides in, the butter drops and melts into a gold pool; the figure rolls to ≈ 260 kcal; chip "+ 1 tbsp butter · 14 g · + ≈ 100".
- **What each brings:** a two-column ledger, potato (173 g) vs butter (1 tbsp, 14 g), rows energy / carbs / fibre / potassium / fat with value bars scaled per row; potato rows are boxed as they are spoken (≈ 37 g, ≈ 3.8 g, ≈ 926 mg); butter shows ≈ 102 kcal, 0 g carbs, 0 g fibre, ≈ 3 mg potassium (grey) and ≈ 11.5 g fat (boxed); note "≈ 100 of the butter's 102 kcal come from its fat".
- **Realistic portions:** three stacked kcal bars on the same potato (≈ 160): + 1 pat (5 g) + ≈ 35 → ≈ 195; + 1 tbsp (14 g) + ≈ 100 → ≈ 265; + 2 tbsp (28 g) + ≈ 200 → ≈ 365; "same potato" outlines, then a pencil tick on each topping ("log the topping too"). No food is called good or bad.

## Final script (70 words; Kokoro Meshline blend)
| Take | Start | Text |
|---|---|---|
| T0 | 0.30 s | A baked potato, about a hundred sixty calories; with a tablespoon of butter, two hundred sixty. |
| T1 | 6.55 s | The potato brings thirty-seven grams of carbs, four of fiber, and over nine hundred milligrams of potassium. |
| T2 | 13.85 s | The butter brings about a hundred calories, almost all from fat. |
| T3 | 17.75 s | A pat adds about thirty-five; two tablespoons, about two hundred. |
| T4 | 22.00 s | The potato stays the same; log the topping too. |
| T5 | 26.30 s | Track your food and nutrition with CalMeter. |

ASR timing pass on the takes (faster-whisper base.en): verbatim.

## Source-to-claim mapping (retrieved 2026-11-09)
| Claim | Value | Source |
|---|---|---|
| medium baked potato, flesh + skin, no salt = 173 g ≈ 161 kcal | 93 kcal/100 g × 1.73 | USDA FDC **170093** (SR Legacy, NDB 11674); SR28 WEIGHT "1 potato medium = 173 g" |
| ≈ 37 g carbs, ≈ 3.8 g fibre, ≈ 926 mg potassium | 21.15, 2.2, 535 per 100 g × 1.73 | FDC 170093 |
| 1 tbsp butter (14.2 g) ≈ 102 kcal, 11.5 g fat, 0 carbs/fibre, ≈ 3 mg potassium | 717 kcal, 81.1 g fat, 24 mg K per 100 g | USDA FDC **173410** "Butter, salted" (NDB 01001); SR28 "1 tbsp = 14.2 g" |
| a pat (5 g) ≈ 35 kcal; 2 tbsp ≈ 200 kcal | 35.9; 203.6 | FDC 173410; SR28 "1 pat = 5.0 g" |
| almost all of the butter's energy from fat | 11.5 × 8.79 = 101 of 102 kcal | FDC 173410 energy factors |

## Storyboard (30 fps; `production/30s/2026-11-09-english-11/source/timeline.json`)
| Beat | Time | Plate action | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–6.2 s | Potato splits open with steam; 173 g label; "? kcal" → 160; spoon brings a tablespoon of butter; it melts; ≈ 260 kcal | A baked potato, / ≈ 160 kcal · with 1 tbsp of butter, / ≈ 260 kcal | slice, tick, thud, juice, tick |
| Potato | 6.2–13.7 s | Burnish to the ledger; potato column: ≈ 161 kcal, ≈ 37 g carbs, ≈ 3.8 g fibre, ≈ 926 mg potassium, ≈ 0.2 g fat | The potato: 37 g carbs, / 4 g fibre, · over 900 mg potassium | page, tick |
| Butter | 13.8–17.5 s | Butter column: ≈ 102 kcal, zeros in grey, ≈ 11.5 g fat boxed; "≈ 100 of the butter's 102 kcal come from its fat" | The butter: ≈ 100 kcal, / almost all from fat | tick |
| Portions | 17.5–21.9 s | Burnish to stacked bars: same potato + pat / 1 tbsp / 2 tbsp: ≈ 195 / 265 / 365 kcal | A pat adds ≈ 35 kcal; / 2 tbsp ≈ 200 | page, tick |
| Takeaway | 21.9–25.9 s | "same potato" outlines; a pencil tick on each topping; slow push-in begins | The potato stays the same; / log the topping too | pencil |
| CTA | 25.9–30 s | CalMeter seal + wordmark below the bars; wordmark shine; push-in continues | Track your food and nutrition / with CalMeter | pencil, bed fades |
