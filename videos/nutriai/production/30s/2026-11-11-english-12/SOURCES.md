# Sources: CalMeter English 30 s english-12 (popcorn: big bowl, small kernels), retrieved 2026-11-11

1. USDA FoodData Central, Survey (FNDDS 2021–2023), "Popcorn, air-popped, no butter added", **FDC ID 2708219** (food code 54403010): 385 kcal and 14.4 g fibre per 100 g; portion "1 cup, popped" = 8 g. https://fdc.nal.usda.gov/food-details/2708219/nutrients . Extract `research/fdc-2708219-key-values.json`.
2. USDA FoodData Central, Survey (FNDDS 2021–2023), "Popcorn, popped in oil, no butter added", **FDC ID 2708221** (food code 54403045): 498 kcal per 100 g; "1 cup, popped" = 11 g. https://fdc.nal.usda.gov/food-details/2708221/nutrients . Extract `research/fdc-2708221-key-values.json`.
3. USDA FoodData Central, SR Legacy, "Butter, salted", **FDC ID 173410** (NDB 01001): 717 kcal per 100 g; SR28 "1 tbsp = 14.2 g". Extract `research/fdc-173410-key-values.json`.
4. USDA FoodData Central, SR Legacy, "Sugars, granulated", **FDC ID 169655** (NDB 19335): 387 kcal per 100 g; SR28 "1 cup = 200 g", "1 tsp = 4.2 g" → 1 tbsp ≈ 12.5 g (cup ÷ 16). Extract `research/fdc-169655-key-values.json`; weights `research/sr28-WEIGHT-19034-19335-01001.txt`.
5. Cross-check: SR Legacy "Snacks, popcorn, air-popped", FDC 167959 (NDB 19034): 387 kcal per 100 g, "1 cup = 8.0 g" (`research/fdc-167959-key-values.json`).
6. Mechanism: Virot E., Ponomarenko A. (2015) "Popcorn: critical temperature, jump and sound", J. R. Soc. Interface 12: 20141247, https://pmc.ncbi.nlm.nih.gov/articles/PMC4345489 (peer reviewed); corroboration Hoseney et al. (1983) J. Cereal Sci. 1: 43–52. Quotes and notes in `research/popping-mechanism-sources.md`.
Bulk files: `FoodData_Central_survey_food_json_2024-10-31.zip` (sha256 dfb06ae7ddc397cc…), `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). USDA data are public domain (CC0).

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| 3 cups of popcorn: just 24 g | measured portion weight | 3 × 8 g (air-popped) | 1, 5 |
| a drop of water inside turns to steam, bursts the hull | measured mechanism | ~20 mg water per kernel; pressure-vessel rupture | 6 |
| HEAT ≈ 180 °C (label) | measured | critical temperature close to 180 °C (96 % popped at 180 °C, 34 % at 170 °C) | 6 |
| puffs the starch into a light foam; 8× LESS DENSE (label) | measured | radius 3.1 → 6.5 mm; density 1300 → 160 kg/m³ ("eight times less dense") | 6 |
| 3 cups air-popped ≈ 90 kcal | calculated from measured data | 24 g × 3.85 = 92.4 kcal | 1 |
| popped in oil (same 3 cups): ≈ 165 kcal, 33 g | calculated | 33 g × 4.98 = 164.3 kcal | 2 |
| + 1 tbsp butter: ≈ 265 kcal, 47 g | calculated (illustrative topping amount) | + 14.2 g × 7.17 = 101.8 → 266.1 kcal | 2, 3 |
| + 1 tbsp sugar: over 300 kcal, 60 g | calculated (illustrative topping amount) | + 12.5 g × 3.87 = 48.4 → 314.5 kcal | 2, 3, 4 |
| same bowl, more than triple (×3+) | calculated | 314.5 / 92.4 = 3.4 | 1–4 |

Assumptions stated: one tablespoon each of butter and sugar is an illustrative topping amount, not a typical-serving claim; the oil-popped value is USDA's survey food, so the oil is included in its 11 g cup. Volume (3 cups) and mass (grams on the scale) are shown separately; the scale changes while the cup count stays the same.
Not claimed: health effects, weight-loss outcomes, movie-theatre or brand values, a "40–50×" volume expansion (no peer-reviewed source found).
Style art direction (read-only, unchanged): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run). Composition per `context/25-feedback-rules-2026-11-11.md`.
Licences: original code; original synthesized ambient bed and foley (pops, pours, sprinkle added in `source/audio/mix.py`); Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
