# Sources: CalMeter English 30 s english-18 (what's really inside a passion fruit, "JEWELS YOU CAN EAT"), retrieved 2026-11-15

Topic note: the requested "What is hiding inside a pomegranate?" (edible arils; per 100 g energy, fibre and portion weight) was already covered by production #03 (`context/14-production-30s-pomegranate.md`, 2026-11-03: 100 g of raw arils, 83 kcal, 4 g fibre, 16 µg vitamin K). Per the batch rule, a genuinely different same-genre topic with the same story criteria and the same hook words was chosen: the purple passion fruit, never covered (completed topics: mango, guava, pomegranate, papaya, orange, chickpeas ×2, paneer, peanuts, egg + oil, raisins vs grapes, avocado vs cucumber, potato + butter, popcorn, rice, edamame vs peas, honey vs sugar, dark vs milk chocolate, watermelon vs raisins). Its edible part is golden seed sacs inside a purple shell; its nutrient angle is fibre, not the vitamin C of the mango, guava, papaya and orange episodes.

1. USDA FoodData Central, SR Legacy, "Passion-fruit, (granadilla), purple, raw", **FDC ID 169108** (NDB 09231), per 100 g edible portion: 97 kcal, total dietary fibre 10.4 g, vitamin C 30 mg, water 72.9 g; household weight "fruit without refuse = 18 g". https://fdc.nal.usda.gov/food-details/169108/nutrients . Extract `research/fdc-169108-passion-fruit-purple-raw-key-values.json`.
2. USDA FoodData Central, SR Legacy, "Apples, raw, with skin", **FDC ID 171688** (NDB 09003), per 100 g: fibre 2.4 g. https://fdc.nal.usda.gov/food-details/171688/nutrients . Extract `research/fdc-171688-apple-raw-with-skin-key-values.json`.
3. USDA SR28 FOOD_DES / WEIGHT and documentation: passion fruit refuse "Shell", 48 %; household weights are edible portions ("Weights are given for edible material without refuse"). Extract `research/sr28-weights-refuse-09231-09003.txt`.
Calculations: `research/passion-fruit-calculations.txt`. Bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…f96bc7). USDA data are public domain (CC0).

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| about half is shell ("½ SHELL") | measured refuse | 48 % | 3 |
| one fruit gives just 18 g of pulp and seeds | measured household weight (edible portion) | 18 g | 1, 3 |
| per 100 g, 97 kcal | measured | 97 | 1 |
| one fruit has about 17 kcal | calculated | 18 × 0.97 = 17.5 | 1 |
| the seeds are eaten too ("SEEDS TOO") | USDA edible portion definition | only the shell is refuse | 3 |
| the pulp carries 10 g of fibre per 100 g | measured | 10.4 g | 1 |
| four times an apple ("× 4", apple 2.4 g) | calculated | 10.4 / 2.4 = 4.3 | 1, 2 |
| one fruit adds about 17 kcal and 2 g of fibre | calculated | 17.5 kcal; 1.87 g | 1 |
| log the pulp, not the shell | takeaway | the shell is about half the fruit's weight and is not eaten | 3 |

Assumptions stated: purple passion fruit, raw; "one fruit" is USDA's household fruit (18 g edible); fruits vary in size. The 100 g bowl and the 18 g spoonful are drawings, not to scale with each other; the seed-sac close-up is enlarged.
Not claimed: health or cure effects, digestion claims, vitamin claims beyond the measured values in the notes, brands or prices; how much of the fibre comes from the seeds is not claimed.
Composition per `context/25-feedback-rules-2026-11-11.md` incl. the 2026-11-15 first-frame and full-frame addenda.
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
