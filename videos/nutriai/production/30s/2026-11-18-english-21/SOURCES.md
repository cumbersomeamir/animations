# Sources: CalMeter English 30 s english-21 (one coconut, two foods: coconut water vs coconut meat, "WATER OR MEAT?"), retrieved 2026-11-18

Topic note: batch 21 asked for "roasted chickpeas versus cooked chickpeas: same food, water changes calories per gram" with an edible-weight breakdown, a practical portion and a playful original food character. That exact comparison is english-10 (`context/23-production-30s-english10-chickpeas.md`, 2026-11-09: USDA FDC 173757 cooked chickpeas, roasted values from dry matter, the water-removal mechanism and a 30 g snack portion); cooked chickpeas were also Hindi #04, and water-per-gram stories carried english-08 (raisins), english-13 (rice) and english-17 (watermelon). Per the brief ("if already covered, choose a genuinely different subject in this same genre and explain your choice"), the episode keeps the brief's idea — one food, very different calories per gram, explained with sourced edible-weight numbers and a practical portion — with a subject never covered in this app: the two edible parts of one coconut, its water and its meat. Completed topics checked: mango, guava, pomegranate, papaya, orange, chickpeas ×2, paneer, peanuts vs peanut butter, egg + oil, raisins vs grapes, avocado vs cucumber, potato + butter, popcorn, rice, edamame vs peas, honey vs sugar, dark vs milk chocolate, watermelon vs raisins, passion fruit, kiwi, pistachios.

1. USDA FoodData Central, SR Legacy, "Nuts, coconut water (liquid from coconuts)", **FDC ID 170174** (NDB 12119), per 100 g: energy 19 kcal, water 95.0 g (n = 7), carbohydrate by difference 3.71 g, sugars 2.61 g, fat 0.2 g, protein 0.72 g. Household weights: "1 cup = 240 g", "coconut yields = 206 g". https://fdc.nal.usda.gov/food-details/170174/nutrients
2. USDA FoodData Central, SR Legacy, "Nuts, coconut meat, raw", **FDC ID 170169** (NDB 12104), per 100 g: energy 354 kcal, water 47.0 g (n = 15), total lipid (fat) 33.5 g (n = 12), protein 3.33 g, carbohydrate 15.2 g (incl. fibre 9.0 g). Household weights: "medium = 397 g", "piece (2" x 2" x 1/2") = 45 g", "cup, shredded = 80 g". SR28 refuse "Shells (brown), skin, water" 48 %. Calorie factors: fat 8.37, protein 3.47, carbohydrate 4.07. https://fdc.nal.usda.gov/food-details/170169/nutrients
3. Cross-check (not shown): FDC 174831 "Beverages, Coconut water, ready-to-drink, unsweetened": 18 kcal / 100 g.
4. USDA SR28 documentation: household weights "are given for edible material without refuse"; refuse is a percentage of the item as purchased. Extract and excerpts: `research/sr28-refuse-weights-coconut.txt`.
Extracts: `research/fdc-170174-170169-174831-coconut-key-values.json` (from `FoodData_Central_sr_legacy_food_json_2021-10-28.zip`, sha256 789240d4…f96bc7; SR28 `sr28asc.zip` sha256 8308fd1d…ee70a). Calculations: `research/coconut-calculations.txt`. USDA data are public domain (CC0).

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| "WATER OR MEAT?" (frame 0, a question); one coconut, two foods | framing | two edible parts of one coconut | 1, 2 |
| its water: about 40 kcal ("WATER", scale 206 g, "≈ 40 kcal") | household weight + calculated | 206 g × 0.19 = 39 kcal | 1 |
| its meat: about 1,400 ("MEAT", scale 397 g, "≈ 1,400 kcal") | household weight + calculated | 397 g × 3.54 = 1 405 kcal | 2 |
| per 100 g, coconut water is 95 % water ("95% WATER" bracket over the water column) | measured | 95.0 g | 1 |
| just 19 kcal ("JUST 19 kcal") | measured | 19 | 1 |
| the meat is only half water ("½ WATER", beaker 47 %) | measured | 47.0 g | 2 |
| a third of it is fat ("⅓ FAT", beaker 33.5 %) | measured | 33.5 g | 2 |
| 354 kcal per 100 g ("354 kcal") | measured | 354 | 2 |
| one small piece, 45 g, is about 160 ("45 g", "≈ 160 kcal") | household weight + calculated | 45 g × 3.54 = 159 kcal | 2 |
| as much as 3½ glasses of coconut water ("= 3½ GLASSES", calorie balance) | calculated | 1 glass = 1 cup = 240 g = 45.6 kcal; 159.3 / 45.6 = 3.49 | 1, 2 |

Assumptions stated: fresh coconut water and raw coconut meat from a mature (brown) coconut as described by USDA; "one coconut" uses USDA's typical per-coconut household weights (water 206 g, meat of a medium coconut 397 g), which are separate averages, not one measured nut; a glass = 1 US cup (240 g); coconuts vary. Packaged coconut waters can differ (USDA's unsweetened ready-to-drink entry is 18 kcal/100 g; sweetened products are not covered).
Drawings: the coconut character, the glass with a face, the meat chunk, beakers (filled to 47 % and 33.5 % of one height: a gram scale, not volumes), droplets and the calorie balance are illustrative symbols; scale readouts show the USDA or calculated grams. The balance compares calories, not weight (its pivot is labelled "kcal").
Not claimed: hydration, electrolytes, potassium (n = 1 in the record), heart or weight effects, any health or cure effect, saturated-fat judgements, brands or prices. No food is called good or bad.
Composition per `context/25-feedback-rules-2026-11-11.md` (incl. 2026-11-15 addenda) and the 2026-11-18 live feedback in `context/34-continuation-2026-11-18.md`.
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
