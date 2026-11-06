# 21 — Production 30 s, batch 2026-11-07-english-08: raisins vs grapes, the same 30 g (English)

Output: `videos/nutriai/production/30s/2026-11-07-english-08/nutriai-30s-english08-01.mp4`. QA + hash: `production/30s/2026-11-07-english-08/QA.md`. Sources: `.../SOURCES.md`. Publishing caption (English, matches the final transcript): `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks
- Repo `cumbersomeamir/animations`, branch `claude-video/nutriai`, in sync with origin (english-07 egg) before edits; account per session context (info@tensorblue.com). No render/ffmpeg/TTS process was running.
- Topic history: grapes / raisins / dried fruit had not been covered (mango, guava, pomegranate, papaya, orange, chickpeas, paneer, peanuts, egg + oil; oats cancelled). The requested topic was used.
- Language: English narration and English captions only.

## Kept from the most recently accepted recipe (no Three.js)
Renderer `production/30s/2026-11-06-english-07/source/render.mjs` copied with the food geometry swapped; unchanged: burin swell/taper, multiply washes under the ink, the english-06 balance, bars, burnish transitions, ivory plate + ruled border + cut title ("PLATE X · GRAPES & RAISINS"), English captions (Inter Display Black 58 px, baselines 401 / 455), CTA seal with `assets/icon.png`, camera keys (plus a slow closing push-in), stop motion 15 drawings/s. Voice: approved Meshline/Recall character (Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98) with the CalMeter phoneme override (CTA take byte-identical to english-06/07); audio: accepted quiet `mix.py`.

## Episode-specific choices
- **Immediate hook:** frame 0 shows a balance with the first grape falling; 6 grapes (30 g) and a heap of 60 raisins (30 g) land by 0.8 s; the beam stays level; "? kcal" over both pans turns into "≈ 21 kcal" vs "≈ 90 kcal".
- **Mechanism:** a grape cutaway shows blue water cells and yellow sugar granules; while it dries, droplets leave, the gauge falls 80 % → 15 % and it becomes a wrinkled raisin with the same number of sugar granules, now crowded together.
- **Per 30 g:** stacked bars water / sugar / other (grapes 24 / 5 / 1 g, raisins 5 / 20 / 6 g), 21 vs 90 kcal; four copies of the grapes' sugar box tile the raisins' sugar bar (4×).
- **Concentrated, not created:** ≈ 130 g of grapes (≈ 27) lose ≈ 100 g water and become the same 30 g of raisins (≈ 60): both ≈ 90 kcal, sugar ≈ 20 g = sugar ≈ 20 g, "same sugar, far less water". No food is called good or bad; no disclaimer beat.
- **Fixes during QA:** see `QA.md` (silent gap filled with the takeaway line, raisin redesign, bigger hook/bars, CTA freeze fixed with a push-in, label collision).

## Final script (69 words; Kokoro Meshline blend)
| Take | Start | Text |
|---|---|---|
| T0 | 0.30 s | Thirty grams of grapes, thirty grams of raisins: same weight, very different calories. |
| T1 | 5.75 s | Grapes are about eighty percent water; drying removes most of it. |
| T2 | 10.30 s | So thirty grams of grapes is about twenty-one calories, raisins about ninety, with four times the sugar. |
| T3 | 17.55 s | Drying adds no sugar: those raisins started as about a hundred thirty grams of grapes. |
| T3b | 23.45 s | Same sugar, just far less water. |
| T4 | 26.20 s | Track your food and nutrition with CalMeter. |

ASR timing pass on the takes (faster-whisper base.en): verbatim (CTA read via the accepted CAL-meter override).

## Source-to-claim mapping (retrieved 2026-11-07)
| Claim | Value | Source |
|---|---|---|
| 30 g grapes ≈ 21 kcal | 69 kcal/100 g × 0.30 = 20.7 | USDA FDC **174683** "Grapes, red or green (European type, such as Thompson seedless), raw" (SR Legacy, NDB 09132) |
| 30 g raisins ≈ 90 kcal | 299 kcal/100 g × 0.30 = 89.7 | USDA FDC **168165** "Raisins, (dark,) seedless" (SR Legacy, NDB 09298) |
| grapes ≈ 80 % water; raisins ≈ 15 % | 80.5 g; 15.5 g per 100 g | FDC 174683; FDC 168165 |
| four times the sugar | 19.56 g vs 4.65 g per 30 g = 4.2× | FDC 168165 (65.2 g/100 g); FDC 174683 (15.5 g/100 g) |
| started as ≈ 130 g grapes; ≈ 100 g water removed | dry matter 25.4 g ÷ 0.195 = 130 g | both |
| drying adds no sugar / same sugar | 130 g grapes 20.2 g sugar, 89.7 kcal; 30 g raisins 19.6 g, 89.7 kcal; 3.54 kcal per g dry matter in both | both |
| ≈ 6 grapes, ≈ 27 grapes, ≈ 60 raisins | 10 grapes = 49 g; 1 oz (60 raisins) = 28.35 g | SR28 WEIGHT |

## Storyboard (30 fps; `production/30s/2026-11-07-english-08/source/timeline.json`)
| Beat | Time | Plate action | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–5.3 s | Balance; 6 grapes vs 60 raisins land; level beam; "? kcal" → "≈ 21 kcal" / "≈ 90 kcal" | 30 g of grapes, / 30 g of raisins: · same weight, / very different calories | pencil, patter, tick |
| Water | 5.3–10.1 s | Burnish to a grape cutaway (water cells, sugar granules); gauge 80 %; drying: droplets leave, shrinks to a creased raisin; gauge 15 % | Grapes ≈ 80% water; / drying removes most of it | page, juice |
| Per 30 g | 10.2–17.1 s | Bars water / sugar / other; 21 kcal, 90 kcal; 4 sugar boxes tile the raisin sugar bar | 30 g grapes ≈ 21 kcal, / raisins ≈ 90, 4× the sugar | ticks |
| Not created | 17.1–25.4 s | ≈ 130 g bunch → arrow "− ≈ 100 g water" → 30 g heap; sugar ≈ 20 g = sugar ≈ 20 g; "same sugar, far less water" | Drying adds no sugar: / from ≈ 130 g of grapes · Same sugar, / just far less water | page, juice, patter |
| CTA | 25.7–30 s | CalMeter seal + wordmark below the bunch and heap; glints, wordmark shine, slow push-in | Track your food and nutrition / with CalMeter | page, pencil, bed fades |
