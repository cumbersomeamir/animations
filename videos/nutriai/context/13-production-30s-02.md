# 13 — Production 30 s #02: "What is inside 100 grams of guava?" (batch production-30s-2026-11-02-batch-02)

Output: `videos/nutriai/production/30s/2026-11-02-batch-02/nutriai-30s-production-02.mp4`. QA + hash: `production/30s/2026-11-02-batch-02/QA.md`. Format: `11-production-format.md` (updated with this batch's feedback).

## Brief (as approved) and user feedback captured
- One new 30.000 s English educational video in the locked genre (ingredient nutrient and calorie breakdowns), Copperplate Engraving style (lemo-opuscar `styles/engraving/STYLE.md`, art direction only). Topic: 100 g of guava. Previous #01 (mango) is preserved, not regenerated.
- **Feedback (overrides earlier style details):** bright guava coral flesh, clear leaf green, **ivory ground and deep-ink labels**, **higher contrast**, **larger cutaway**. **Replace the previous music completely**: voice-forward, subtle fruit-slicing / page SFX, a very quiet original warm ambient bed, no repetitive beat, no reused track. Verify USDA raw common guava per 100 g and NIH vitamin C; no disease claims.
- Voice: Kokoro Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us (cached model). Captions upper centre, ink y 350–470, margins ≥ 80 px, max 2 short lines. 1080×1920, 30 fps, 900 frames, H.264 yuv420p, AAC 48 kHz stereo, −14 to −16 LUFS, TP ≤ −1 dBTP.

## Final script (70 words; draft tightened for researched accuracy and timing)
| Take | Start | Text |
|---|---|---|
| T0 | 0.25 s | What's inside a hundred grams of raw guava? |
| T1 | 3.00 s | About sixty-eight calories, five point four grams of fibre, and two hundred twenty-eight milligrams of vitamin C. |
| T2 | 10.70 s | Fibre aids digestion, and vitamin C helps the body make collagen. |
| T3 | 16.00 s | These are reference values; other guava types and individual fruits can differ. |
| T4 | 21.10 s | Guava is a useful food, not a cure. |
| T5 | 23.80 s | Weigh the portion you actually eat: one fruit is not automatically a hundred grams. |

Edits from the draft and why: fibre "five" became "five point four" (USDA 5.4 g). "Variety and ripeness can change the numbers" became "other guava types and individual fruits can differ": USDA's strawberry guava shows type matters and the record's values are averages, but no checked source for ripeness was retrieved, so ripeness was dropped. "Fibre contributes to normal digestion" became "Fibre aids digestion" (MedlinePlus wording). "Vitamin C supports normal body functions" became "helps the body make collagen" (specific, MedlinePlus). A hook question was added for 0–3 s.
ASR timing pass (one per take, faster-whisper base.en): verbatim except "Weigh" → "Way" (homophone; caption shows "Weigh").

## Source-to-claim mapping (retrieved 2026-11-02)
| Claim | Value | Source |
|---|---|---|
| 100 g raw guava (edible flesh + seeds; skin trimmed) | basis | USDA FoodData Central SR Legacy **FDC 173044** "Guavas, common, raw" (NDB 09139), per 100 g edible portion; SR28 `FOOD_DES` refuse **"Skin", 22 %**, *Psidium guajava* |
| about 68 calories | 68 kcal (285 kJ) | FDC 173044 Energy |
| 5.4 g fibre | 5.4 g | FDC 173044 Fiber, total dietary |
| 228 mg vitamin C | 228 mg (SR28 228.3) | FDC 173044 Vitamin C, total ascorbic acid (n = 2) |
| reference values; other guava types and fruits differ | strawberry guava 37 mg vitamin C | FDC 173045 "Guavas, strawberry, raw"; values are means of analysed samples |
| fibre aids digestion | n/a | MedlinePlus (NIH NLM) "Dietary fiber" https://medlineplus.gov/ency/article/002470.htm: "Fiber aids digestion and helps prevent constipation" |
| vitamin C helps the body make collagen | n/a | MedlinePlus (NIH NLM) "Vitamin C" https://medlineplus.gov/ency/article/002404.htm: "Form an important protein called collagen…" |
| a useful food, not a cure | framing | no therapeutic claim made |
| one fruit ≈ 55 g edible, not 100 g | 55 g | FDC 173044 portion "fruit, without refuse" = 55 g |

NIH ODS fact sheets returned HTTP 403 to this environment; MedlinePlus (also NIH) was used and archived in `research/`.

## Storyboard (30 fps; `source/timeline.json`)
| Beat | Time | Plate action (ivory sheet, deep ink, coral + leaf-green washes) | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–3 s | Loupe pull-out as the burin cuts a whole guava (meridians, parallels, crossing family, calyx crown, stem, leaf); clear leaf-green skin wash blooms | What's inside / 100 g of raw guava? | pencil micro-scratches, ambient bed fades in |
| Setup | 2.4–5 s | One red knife line down the fruit; burnisher sweeps the whole fruit out while a **large cutaway** is re-cut: green skin band, light-coral flesh ring, bright coral seed pulp with cream seeds; notes "SKIN trimmed (refuse in USDA)" / "FLESH + SEEDS (the 100 g)" | 68 kcal · 5.4 g fibre / 228 mg vitamin C | slice, page, juice drips |
| Facts | 3–10 s | Three roundels scribed on the flesh and flown under the cutaway on "68", "5.4", "228"; leaders back to the flesh | (same block) | scribe ticks |
| Mechanism | 10.7–16 s | Fibre roundel enlarges, its strands flow (digestion); then vitamin C roundel enlarges and its stipple gathers into a three-strand helix (collagen) | Fibre aids digestion / vitamin C helps make collagen | page |
| Variation | 16–21 s | Three small engraved fruits cut in the margin (two common guavas of different size, one red strawberry guava); legend "Reference values · USDA FDC 173044" | Reference values / types & fruits differ | page |
| Takeaway | 21–29 s | Cutaway pulses (a food); roundels burnished away; balance cut: one whole guava (USDA ≈ 55 g edible) vs a 100 g weight; beam tips to the weight | A useful food, / not a cure → Weigh your portion / 1 fruit ≈ 55 g, not 100 g | page, thud, creak |
| End | 28.7–30 s | Credit "del. et sculp. NutriAI", tiny signature | (holds, fades) | bed fades |

## QA
See `production/30s/2026-11-02-batch-02/QA.md`.
