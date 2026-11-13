# Sources: CalMeter English 30 s english-13 (rice: water changed the number), retrieved 2026-11-13

1. USDA FoodData Central, SR Legacy, "Rice, white, long-grain, regular, raw, unenriched", **FDC ID 169756** (NDB 20444), per 100 g: 365 kcal, water 11.6 g (n = 58), protein 7.13 g (n = 70); SR28 "1 cup = 185 g". https://fdc.nal.usda.gov/food-details/169756/nutrients . Extract `research/fdc-169756-key-values.json`. The enriched raw entry (FDC 168877) has the same energy and water.
2. USDA FoodData Central, SR Legacy, "Rice, white, long-grain, regular, unenriched, cooked without salt", **FDC ID 169757** (NDB 20445), per 100 g: 130 kcal, water 68.4 g (n = 23), protein 2.69 g; SR28 "1 cup = 158 g". https://fdc.nal.usda.gov/food-details/169757/nutrients . Extract `research/fdc-169757-key-values.json`. Enriched cooked (FDC 168878) is the same; FNDDS 2021–2023 "Rice, white, cooked, no added fat" (FDC 2708408) gives 129 kcal, 68.0 g water.
3. SR28 `WEIGHT.txt` / `FOOD_DES.txt` lines for 20044/20045/20444/20445 (`research/sr28-*.txt`); energy factors protein 3.82, fat 8.37, carbohydrate 4.16 kcal/g for both.
Bulk files: `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7), `FoodData_Central_survey_food_json_2024-10-31.zip` (sha256 dfb06ae7ddc397cc…). USDA data are public domain (CC0). Calculations: `research/rice-calculations.txt`.

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| per 100 g: 365 kcal dry, 130 kcal cooked | measured (USDA) | 365; 130 | 1, 2 |
| cooking does not burn the calories off: water adds weight, not energy | calculated from measured data | energy per g of non-water matter 4.13 kcal (raw) vs 4.11 kcal (cooked) | 1, 2 |
| 50 g dry rice soaks up about 90 g of water and weighs about 140 g | calculated (assumes cooking to USDA's 68.4 % water, no solids lost) | dry matter 88.4 vs 31.6 g / 100 g → × 2.80 → 139.9 g; + 89.9 g | 1, 2 |
| still about 180 kcal, spread over more grams | calculated | 50 g × 3.65 = 182.5 kcal; 139.9 g × 1.30 = 181.8 kcal | 1, 2 |
| weigh it cooked but log the dry number: nearly 3× too much (≈ 511 kcal) | calculated | 139.9 g × 3.65 = 510.5 kcal = 2.81 × | 1, 2 |
| dry with dry, cooked with cooked | takeaway | use the label that matches the state you weighed | — |

Assumptions stated: plain long-grain white rice boiled in water (no salt, oil or butter); real batches absorb more or less water depending on method and water amount, so the cooked weight is shown with "≈". Volume is not used (cups differ: 185 g dry vs 158 g cooked per cup).
Not claimed: health effects, weight-loss outcomes, brand or price information.
Composition per `context/25-feedback-rules-2026-11-11.md` (egg/avocado-era: one big hero per scene; large brief labels); art direction (read-only): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
