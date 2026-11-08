# Sources: CalMeter English 30 s english-09 (avocado vs cucumber, 100 g edible portion each), retrieved 2026-11-08

1. USDA FoodData Central, SR Legacy, "Avocados, raw, all commercial varieties", **FDC ID 171705** (NDB 09037), per 100 g: 160 kcal, water 73.2 g (n = 40), fat 14.7 g (n = 35), fibre 6.7 g (n = 27), protein 2.0 g, carbohydrate 8.53 g; fatty acids: saturated 2.13 g, monounsaturated 9.8 g, polyunsaturated 1.82 g; energy factors protein 3.36, fat 8.37, carbohydrate 3.6 kcal/g. https://fdc.nal.usda.gov/food-details/171705/nutrients . Extract: `research/fdc-171705-key-values.json`.
2. USDA FoodData Central, SR Legacy, "Cucumber, with peel, raw", **FDC ID 168409** (NDB 11205), per 100 g: 15 kcal, water 95.2 g, fat 0.11 g, fibre 0.5 g, protein 0.65 g, carbohydrate 3.63 g; energy factors protein 2.44, fat 8.37, carbohydrate 3.57 kcal/g. https://fdc.nal.usda.gov/food-details/168409/nutrients . Extract: `research/fdc-168409-key-values.json`.
3. USDA SR28 `FOOD_DES.txt` / `WEIGHT.txt` (sr28asc.zip): 09037 refuse "Seed and skin" 26 %, "1 avocado = 201 g"; 11205 refuse "Ends" 3 %, "1 cucumber (8-1/4") = 301 g". `research/sr28-FOOD_DES-09037-11205.txt`, `research/sr28-WEIGHT-09037-11205.txt`.
4. FAO Food and Nutrition Paper 77, "Food energy – methods of analysis and conversion factors" (2003), https://www.fao.org/4/y5022e/y5022e04.htm , section 3.5.1 (Atwater general factors: fat 9.0 kcal/g, protein and carbohydrate 4.0 kcal/g); energy comes from protein, fat, carbohydrate (and alcohol), so water gives none. Copy archived with english-05: `production/30s/2026-11-05-feedback-05/research/fao-fnp77-chapter3-energy-factors.html`.
USDA foods from the official bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). Public domain (CC0).

| Claim (spoken / on screen) | Value | Source |
|---|---|---|
| 100 g edible portion each: avocado flesh only, cucumber with peel | USDA values are per 100 g edible portion (refuse: seed and skin; ends) | 1, 2, 3 |
| avocado ≈ 160 kcal, 15 g fat, 7 g fibre | 160 kcal; 14.7 g; 6.7 g | 1 |
| cucumber ≈ 15 kcal, 95 % water | 15 kcal; 95.2 g | 2 |
| about ten times the calories | 160 / 15 = 10.7 | 1, 2 |
| columns in grams: avocado water 73 · fibre 6.7 · other 5 · fat 14.7 g; cucumber water 95 · other 4 · fibre 0.5 · fat 0.1 g | other = 100 − water − fat − fibre (protein, sugars/starch, minerals) | 1, 2 |
| fat packs about 9 kcal a gram; water has none | 9.0 kcal/g general factor (USDA's food-specific fat factor here: 8.37) | 4, 1, 2 |
| avocado: fat ≈ 123 kcal, rest ≈ 37 | 14.7 × 8.37 = 123.0; protein 2.0 × 3.36 + carbohydrate 8.53 × 3.6 = 37.4; total 160.4 | 1 |
| cucumber ≈ 15 kcal in the kcal column | fat 0.9 + protein 1.6 + carbohydrate 13.0 = 15.5 (USDA lists 15) | 2 |
| 100 g avocado ≈ 1 kg cucumber, ≈ 3½ cucumbers, both ≈ 160 kcal | 160 / 15 × 100 g = 1 067 g; 1 067 / 301 g = 3.5 | 1, 2, 3 |
| neither is bad | framing only: no health claim; both shown with what they bring (fibre and fat vs water) | — |

Style art direction (read-only, unchanged): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
