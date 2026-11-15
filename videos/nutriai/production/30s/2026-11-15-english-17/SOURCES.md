# Sources: CalMeter English 30 s english-17 (a huge watermelon wedge vs a few raisins, "SIZE LIES"), retrieved 2026-11-15

Topic note: the requested "Why a watermelon can look huge but contain fewer calories than a tiny snack" was checked against this app's completed episodes (mango, guava, pomegranate, papaya, orange, chickpeas ×2, paneer, peanuts, egg + oil, raisins vs grapes, avocado vs cucumber, potato + butter, popcorn, rice, edamame vs peas, honey vs sugar, dark vs milk chocolate). Watermelon had never been covered, so the requested topic was used. Related ground, kept distinct: english-08 compared raisins with grapes (water removed by drying); english-09 used "water has no calories" with cucumber (100 g avocado ≈ 1 kg cucumber). Here the story is a size illusion with explicit USDA portion weights: one wedge vs one ounce of raisins.

1. USDA FoodData Central, SR Legacy, "Watermelon, raw", **FDC ID 167765** (NDB 09326), per 100 g: 30 kcal, water 91.4 g, sugars 6.2 g; household weights "wedge (approx 1/16 of melon) = 286 g", "cup, diced = 152 g". https://fdc.nal.usda.gov/food-details/167765/nutrients . Extract `research/fdc-167765-watermelon-raw-key-values.json`.
2. USDA FoodData Central, SR Legacy, "Raisins, dark, seedless", **FDC ID 168165** (NDB 09298), per 100 g: 299 kcal, water 15.5 g, sugars 65.2 g; household weights "oz (60 raisins) = 28.35 g", "small box (1.5 oz) = 43 g". https://fdc.nal.usda.gov/food-details/168165/nutrients . Extract `research/fdc-168165-raisins-dark-seedless-key-values.json`.
3. USDA SR28 documentation (sr28_doc.pdf, "Weights and Measures"): "Weights are given for edible material without refuse"; FOOD_DES lists watermelon refuse as "Rind, seeds, and cutting loss", 48 %. So the 286 g wedge is flesh without rind. Extract `research/sr28-weights-refuse-09326-09298.txt`.
4. FAO Food and Nutrition Paper 77, "Food energy – methods of analysis and conversion factors" (2003), chapter 3: "the components of food that provide energy (protein, fat, carbohydrate, alcohol, polyols, organic acids and novel compounds)" are converted with energy factors and summed; water is not an energy-yielding component, so it adds weight and volume but no calories. https://www.fao.org/4/y5022e/y5022e04.htm . Copy archived with english-05: `production/30s/2026-11-05-feedback-05/research/fao-fnp77-chapter3-energy-factors.html`.
Calculations: `research/watermelon-raisin-calculations.txt`. Bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…f96bc7). USDA data are public domain (CC0).

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| neither: both are about 85 (kcal) | calculated from measured values | wedge 286 g × 0.30 = 85.8; 1 oz raisins 28.35 g × 2.99 = 84.8 | 1, 2 |
| the wedge holds 286 g of flesh ("FLESH ONLY") | measured household weight (edible portion) | 286 g | 1, 3 |
| 60 raisins: just 28 g | measured household weight | 1 oz = 28.35 g = 60 raisins | 2 |
| ≈ 10× (weight, on screen) | calculated | 286 / 28.35 = 10.1 | 1, 2 |
| watermelon is 91 % water | measured | 91.4 g / 100 g | 1 |
| water has no calories | standard energy basis | 0 kcal | 4 |
| per 100 g: raisins 299 kcal, watermelon 30 | measured | 299; 30 | 1, 2 |
| × 10 (per 100 g, on screen) | calculated | 299 / 30 = 9.97 | 1, 2 |
| a small handful of raisins counts like a whole wedge | calculated + assumption | "small handful" = the USDA ounce (60 raisins, 28 g) | 1, 2 |
| log grams, not size | takeaway | weigh the portion; size misleads | — |

Assumptions stated: the wedge is USDA's 1/16 of a 15-inch melon, edible flesh only (with rind it would weigh roughly twice as much, 48 % refuse); "a few raisins" and "a small handful" mean the USDA ounce (28.35 g ≈ 60 seedless raisins); hands and wedges vary, which is why the episode says to log grams. Drawings: the raisin piles show fewer raisins than 60 / ≈ 210; the 100 g raisin heap and the 100 g watermelon cube are drawn at similar size (100 g of raisins ≈ 160 mL by USDA cup weight, 100 g of watermelon flesh ≈ 100 mL); water leaving the wedge into a glass is a diagram of the water share, not a procedure.
Not claimed: health effects, hydration claims, sugar or glycaemic judgements, brands or prices; no food is called good or bad.
Composition per `context/25-feedback-rules-2026-11-11.md` and its 2026-11-15 first-frame addendum (frame 0 = thumbnail composition, ≤ 5 truthful words).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
