# Sources: CalMeter English 30 s english-06 (peanuts vs peanut butter), retrieved 2026-11-06

1. USDA FoodData Central, SR Legacy, "Peanuts, all types, dry-roasted, without salt", **FDC ID 173806** (NDB 16390), per 100 g: 587 kcal, protein 24.4 g, fat 49.7 g, sugars 4.9 g, fibre 8.4 g, sodium 6 mg. https://fdc.nal.usda.gov/food-details/173806/nutrients . Official bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). Extract: `research/fdc-173806-key-values.json`.
2. **Real labelled product:** USDA FoodData Central, Branded Foods, **FDC ID 2674433**: SKIPPY "CREAMY PEANUT BUTTER", brand owner Hormel Foods Corporation, GTIN 0037600110754, modified 10/23/2023, published 11/16/2023. Label: serving 32 g (2 Tbsp): 190 kcal, fat 16 g, saturated fat 3 g, sodium 150 mg, carbohydrate 6 g, fibre 2 g, sugars 3 g, protein 7 g. Ingredients: "ROASTED PEANUTS, SUGAR, HYDROGENATED VEGETABLE OIL (COTTONSEED, SOYBEAN AND RAPESEED OIL) TO PREVENT SEPARATION, SALT". https://fdc.nal.usda.gov/food-details/2674433/nutrients . Official bulk file `FoodData_Central_branded_food_json_2024-10-31.zip` (sha256 1f25a021…4f17). Extract (with the same product's other GTIN record 2657622, which also lists 1.98 g added sugars): `research/fdc-branded-skippy-creamy-2674433.json`.
3. USDA SR28 `WEIGHT.txt` (sr28asc.zip): NDB 16398 "Peanut butter, smooth style, without salt" household measure "2 tbsp = 32 g" (so 1 level tablespoon ≈ 16 g). `research/sr28-WEIGHT-16390-16398.txt`; descriptions `research/sr28-FOOD_DES-16390-16398.txt`.
4. Cross-check (not on screen): USDA FDC **172470** "Peanut butter, smooth style, without salt": 598 kcal, fat 51.4 g, sugars 10.5 g per 100 g. `research/fdc-172470-key-values.json`.

| Claim (spoken / on screen) | Value | Source |
|---|---|---|
| 30 g peanuts ≈ 176 kcal | 176.1 | 1 |
| 30 g peanut butter ≈ 178 kcal | 178.1 | 2 |
| peanuts are about half fat by weight | 49.7 % | 1 |
| the jar adds sugar, hydrogenated oil and salt | ingredient list | 2 |
| sodium 2 mg vs about 140 mg per 30 g | 1.8 mg; 140.6 mg | 1, 2 |
| 30 g ≈ two level tablespoons; 1 level tbsp ≈ 16 g | 2 tbsp = 32 g | 3 |
| a heaped spoon holds more than a level one | definition (no weight claimed) | — |

Style art direction (read-only, unchanged): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the label ingredient list is quoted from the USDA record for education; no brand logo is drawn; the app icon is the app's own approved asset (`assets/icon.png`).
