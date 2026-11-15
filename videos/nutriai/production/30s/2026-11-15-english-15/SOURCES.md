# Sources: CalMeter English 30 s english-15 (a tablespoon of honey vs a tablespoon of sugar), retrieved 2026-11-15

Topic note: the requested "Why an avocado is a very different kind of fruit" (avocado vs apple: fat, water, fibre, energy per 100 g) overlapped english-09 (avocado vs cucumber: 160 kcal, 15 g fat, 7 g fibre per 100 g; "fat packs about nine calories a gram"; "neither is bad"). Per the batch rule, a genuinely different same-genre story with an equally strong opening was chosen: honey vs sugar by the spoon. Honey had never been covered.

1. USDA FoodData Central, SR Legacy, "Honey", **FDC ID 169640** (NDB 19296), per 100 g: 304 kcal, water 17.1 g (n = 509), sugars 82.1 g (fructose 40.9, glucose 35.8); SR28 "1 tbsp = 21 g", "1 cup = 339 g". https://fdc.nal.usda.gov/food-details/169640/nutrients . Extract `research/fdc-169640-key-values.json`.
2. USDA FoodData Central, SR Legacy, "Sugars, granulated", **FDC ID 169655** (NDB 19335), per 100 g: 387 kcal, sucrose 99.8 g, water 0.02 g; SR28 "1 tsp = 4.2 g", "1 cup = 200 g". https://fdc.nal.usda.gov/food-details/169655/nutrients . Extract `research/fdc-169655-key-values.json`.
3. SR28 `WEIGHT.txt` / `FOOD_DES.txt` lines (`research/sr28-*-19296-19335.txt`). Calculations: `research/spoon-calculations.txt`.
Bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). USDA data are public domain (CC0).

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| gram for gram, honey is lower: 304 vs 387 kcal per 100 g | measured | 304; 387 | 1, 2 |
| honey is partly water (≈ 17 %) | measured | 17.1 g / 100 g | 1 |
| spoons measure volume; thick honey fills every gap, sugar crystals trap air | calculated from USDA weights | honey 339 g per cup (1.43 g/mL) vs sugar 200 g per cup (0.85 g/mL bulk) → 1.7× | 1, 2 |
| a tablespoon of honey weighs 21 g; sugar about 12.5 g | measured (honey) / calculated (sugar: cup ÷ 16; 3 tsp = 12.6 g) | 21; 12.5 | 1, 2 |
| per spoon: honey about 64 kcal, sugar 48 | calculated | 21 × 3.04 = 63.8; 12.5 × 3.87 = 48.4 | 1, 2 |
| + ≈ 15 (on screen) | calculated | 15.4 kcal | 1, 2 |
| log the spoon you use | takeaway | compare and log what is actually spooned | — |

Assumptions stated: level tablespoons; granulated white sugar (USDA's cup weight implies 12.5 g per tablespoon); a heaped spoon holds more of either. "Air gaps" refers to the space between crystals in a measured volume (bulk density), shown as a diagram.
Not claimed: health effects, glycaemic claims, "natural vs refined" judgements, brands or prices; no food is called better or worse.
Composition per `context/25-feedback-rules-2026-11-11.md` and the 2026-11-15 first-frame rule (frame 0 = thumbnail composition, ≤ 5 truthful words); art direction (read-only): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
