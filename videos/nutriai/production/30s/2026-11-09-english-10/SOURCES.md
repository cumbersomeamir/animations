# Sources: CalMeter English 30 s english-10 (cooked vs dry-roasted chickpeas), retrieved 2026-11-09

1. USDA FoodData Central, SR Legacy, "Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt", **FDC ID 173757** (NDB 16057), per 100 g: 164 kcal, water 60.2 g, protein 8.86 g, fat 2.59 g, fibre 7.6 g. https://fdc.nal.usda.gov/food-details/173757/nutrients . Extract: `research/fdc-173757-key-values.json`. SR28 WEIGHT 16057 "1 cup = 164 g" (`research/sr28-WEIGHT-16056-16057.txt`).
2. USDA FoodData Central, SR Legacy, "Chickpeas (garbanzo beans, bengal gram), mature seeds, raw" (dried), **FDC ID 173756** (NDB 16056), per 100 g: 378 kcal, water 7.68 g, protein 20.5 g. https://fdc.nal.usda.gov/food-details/173756/nutrients . Extract: `research/fdc-173756-key-values.json`. Cross-check: USDA Foundation Foods "Chickpeas, (garbanzo beans, bengal gram), dry", **FDC ID 2644282**: water 8.77 g, protein 21.3 g (`research/fdc-2644282-key-values.json`).
3. USDA FoodData Central, Branded Foods bulk download (`brandedDownload.json`, dated 2024-12-13): 89 roasted-chickpea snack products; the usual label servings are 28 g (47) and 30 g (22); 77 of 89 list an oil. `research/branded-roasted-chickpeas-summary.txt`. Used only to choose a realistic snack portion and to justify labelling the preparation "dry, no oil".
SR Legacy file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). Public domain (CC0).

**Method (no USDA entry exists for home dry-roasted chickpeas):** roasting without oil removes water and leaves the rest of the chickpea. Cooked chickpeas (1) hold 39.8 g dry matter per 100 g, with 4.12 kcal and 0.223 g protein per gram of dry matter; dried chickpeas (2) give 4.10 kcal and 0.222 g protein per gram of dry matter, the same within rounding. Roasted values below assume the chickpeas end about as dry as dried chickpeas (≈ 8 % water); the range for 3–10 % water is shown, and every on-screen value carries "≈".

| Claim (spoken / on screen) | Value (range for 3–10 % water) | Source |
|---|---|---|
| cooked = boiled, no salt: 164 kcal, 8.9 g protein per 100 g | 164; 8.86 | 1 |
| cooked ones are 60 % water | 60.2 g / 100 g | 1 |
| roasting drives most of the water off; roasted < 10 % water | to ≈ 8 % (dried chickpeas 7.7–8.8 %) | 2, method |
| 100 g cooked shrinks to under half (≈ 42 g) | 39.8 / 0.92 = 43 g (41–44 g) | 1, method |
| same calories, same protein | dry roasting adds and removes neither; only water leaves | method |
| more than double the calories; roasted ≈ 380 kcal, ≈ 20 g protein per 100 g | 379 kcal, 20.5 g (371–400 kcal, 20.0–21.7 g); 2.3 × cooked (2.26–2.44) | 1, 2, method |
| 100 g roasted = the chickpeas of ≈ 230 g cooked | 92 / 39.8 = 231 g (226–244 g) | 1, method |
| snack tip: 30 g roasted ≈ 70 g cooked, ≈ 115 kcal, ≈ 6 g protein | 69 g (68–73 g); 114 kcal (111–120); 6.2 g (6.0–6.5) | 1, 3, method |
| the same chickpeas, minus water | 30 g roasted comes from ≈ 70 g cooked, piece for piece | method |

Not claimed: oil-roasted or seasoned snacks (their labels are usually higher; the plate names the preparation "dry, no oil").
Style art direction (read-only, unchanged): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
