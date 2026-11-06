# Sources: CalMeter English 30 s english-07 (boiled egg + a measured teaspoon of oil), retrieved 2026-11-06

1. USDA FoodData Central, SR Legacy, "Egg, whole, cooked, hard-boiled", **FDC ID 173424** (NDB 01129), per 100 g: 155 kcal, protein 12.6 g (12.58; n = 14), fat 10.6 g. https://fdc.nal.usda.gov/food-details/173424/nutrients . Extract: `research/fdc-173424-key-values.json`.
2. USDA SR28 `WEIGHT.txt` (sr28asc.zip): NDB 01129 "1 large = 50 g"; NDB 04044 / 04582 "1 tsp = 4.5 g"; NDB 01128 "1 large = 46 g". `research/sr28-WEIGHT-egg-oil.txt`; descriptions `research/sr28-FOOD_DES-egg-oil.txt`.
3. USDA FoodData Central, SR Legacy, "Oil, soybean, salad or cooking", **FDC ID 171411** (NDB 04044), per 100 g: 884 kcal, fat 100 g, protein 0 g. https://fdc.nal.usda.gov/food-details/171411/nutrients . Extract: `research/fdc-171411-key-values.json`. Same energy for "Oil, canola", FDC 172336 (`research/fdc-172336-key-values.json`).
4. Cross-check: USDA FDC **173423** "Egg, whole, cooked, fried" (NDB 01128): 196 kcal, protein 13.6 g per 100 g; 1 large = 46 g → 6.3 g protein, the same protein as the boiled egg. `research/fdc-173423-key-values.json`.
All from the official bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). Public domain (CC0).

| Claim (spoken / on screen) | Value | Source |
|---|---|---|
| one large boiled egg ≈ 78 kcal | 77.5 kcal | 1, 2 |
| ≈ 6 g protein (6.3 g) | 6.29 g | 1, 2 |
| 1 level tsp oil = 4.5 g | 4.5 g | 2 |
| that teaspoon adds up to 40 kcal; + 0 g protein | 39.8 kcal; 0 g | 2, 3 |
| the protein stays about six grams | 6.3 g boiled and fried | 1, 4 |
| "up to": only the oil that ends up eaten counts | wording choice (no claim of how much stays in the pan) | — |

Style art direction (read-only, unchanged): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
