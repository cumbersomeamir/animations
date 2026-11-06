# Sources: CalMeter English 30 s english-08 (raisins vs grapes, the same 30 g), retrieved 2026-11-07

1. USDA FoodData Central, SR Legacy, "Grapes, red or green (European type, such as Thompson seedless), raw", **FDC ID 174683** (NDB 09132), per 100 g: 69 kcal, water 80.5 g, sugars 15.5 g (n = 8). https://fdc.nal.usda.gov/food-details/174683/nutrients . Extract: `research/fdc-174683-key-values.json`.
2. USDA FoodData Central, SR Legacy, "Raisins, dark, seedless" (SR28 FOOD_DES: "Raisins, seedless"), **FDC ID 168165** (NDB 09298), per 100 g: 299 kcal, water 15.5 g (n = 12), sugars 65.2 g. https://fdc.nal.usda.gov/food-details/168165/nutrients . Extract: `research/fdc-168165-key-values.json`.
3. USDA SR28 `WEIGHT.txt` / `FOOD_DES.txt` (sr28asc.zip): NDB 09132 "10 grapes = 49 g"; NDB 09298 "1 oz (60 raisins) = 28.35 g", "50 raisins = 26 g". `research/sr28-WEIGHT-09132-09298.txt`, `research/sr28-FOOD_DES-09132-09298.txt`.
Both foods from the official bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). Public domain (CC0).

| Claim (spoken / on screen) | Value | Source |
|---|---|---|
| 30 g grapes ≈ 21 kcal | 69 × 0.30 = 20.7 kcal | 1 |
| 30 g raisins ≈ 90 kcal | 299 × 0.30 = 89.7 kcal | 2 |
| grapes about 80 % water; raisin ≈ 15 % | 80.5 g and 15.5 g per 100 g | 1, 2 |
| per 30 g: water 24 g · sugar 5 g (grapes); sugar 20 g · other 6 g (raisins) | 24.15 / 4.65 / 1.2 g; 4.65 / 19.56 / 5.79 g | 1, 2 |
| four times the sugar | 19.56 / 4.65 = 4.2× | 1, 2 |
| those raisins started as about 130 g of grapes; − ≈ 100 g water | dry matter 30 × 0.845 = 25.4 g ÷ 0.195 = 130 g of grapes; 130 − 30 = 100 g water removed | 1, 2 |
| drying adds no sugar; same sugar ≈ 20 g; ≈ 90 kcal each | 130 g grapes: 20.2 g sugar, 89.7 kcal; 30 g raisins: 19.6 g sugar, 89.7 kcal. Per gram of dry matter both are 3.54 kcal; sugar is 79.5 % (grapes) vs 77.2 % (raisins) of dry matter, so the sugar is concentrated, not created | 1, 2 |
| drying removes most of the water | 130 g grapes hold 104.7 g water; 4.65 g remain (≈ 96 % removed) | 1, 2 |
| 30 g ≈ 6 grapes; 130 g ≈ 27 grapes; 30 g ≈ 60 raisins | 4.9 g per grape → 6.1 and 26.5; 60 raisins per 28.35 g → 63 (58 by "50 raisins = 26 g") | 3 |

Scope note (repo only, not spoken): plain raisins; sweetened or sugar-coated dried fruit is a different food. Grape and raisin values are separate USDA samples, so the mass balance is an approximation (shown with ≈).

Style art direction (read-only, unchanged): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
