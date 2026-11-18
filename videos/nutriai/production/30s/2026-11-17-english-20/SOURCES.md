# Sources: CalMeter English 30 s english-20 (pistachios: shell weight vs edible kernels, "HALF IS SHELL?"), retrieved 2026-11-18

Topic note: batch 20 asked for pistachios (shell weight versus edible weight, nutrient breakdown per 100 g of edible kernels, a practical portion comparison). Pistachios had never been covered in this app (completed topics: mango, guava, pomegranate, papaya, orange, chickpeas ×2, paneer, peanuts vs peanut butter, egg + oil, raisins vs grapes, avocado vs cucumber, potato + butter, popcorn, rice, edamame vs peas, honey vs sugar, dark vs milk chocolate, watermelon vs raisins, passion fruit, kiwi), so the requested topic was used. Peanuts (english-06) are a legume with a different story (peanut butter); nothing from it is reused.

1. USDA FoodData Central, SR Legacy, "Nuts, pistachio nuts, dry roasted, without salt added", **FDC ID 170185** (NDB 12152), per 100 g edible portion (kernels): energy 572 kcal, total lipid (fat) 45.8 g (n = 17), protein 21.0 g (n = 14), total dietary fibre 10.3 g (n = 20), carbohydrate by difference 28.3 g, water 1.85 g. Household weight "1 oz (49 kernels) = 28.35 g". https://fdc.nal.usda.gov/food-details/170185/nutrients
2. USDA FoodData Central, SR Legacy, "Nuts, pistachio nuts, raw", **FDC ID 170184** (NDB 12151), per 100 g: 560 kcal, fat 45.3 g, protein 20.2 g, fibre 10.6 g (cross-check: raw and roasted give the same rounded story). "Nuts, pistachio nuts, dry roasted, with salt added" **FDC ID 169426** (NDB 12652): 569 kcal, sodium 428 mg (salted in-shell pistachios differ mainly in sodium; not narrated). https://fdc.nal.usda.gov/food-details/170184/nutrients
3. USDA SR28 FOOD_DES: refuse description **"Shells", refuse 47 %** for NDB 12151, 12152 and 12652. SR28 documentation: refuse is "expressed as a percentage of the total weight of the item as purchased" and is "used to compute the weight of the edible portion"; household weights "are given for edible material without refuse". Extract and verbatim excerpts: `research/sr28-refuse-weights-pistachio.txt`.
Extracts: `research/fdc-170185-170184-169426-pistachio-key-values.json` (from `FoodData_Central_sr_legacy_food_json_2021-10-28.zip`, sha256 789240d4…f96bc7; SR28 `sr28asc.zip` sha256 8308fd1d…ee70a). Calculations: `research/pistachio-calculations.txt`. USDA data are public domain (CC0).

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| "HALF IS SHELL?" (frame 0, a question) | USDA refuse | shells = 47 % of in-shell weight ("about half") | 3 |
| 47 g of 100 g in shell is shell; just 53 g of kernels ("SHELL" 47 g, "KERNELS" 53 g) | calculated from refuse | 100 × 0.47 = 47; 100 − 47 = 53 | 3 |
| per 100 g of kernels: about 570 kcal ("≈ 570 kcal", "ROASTED · NO SALT") | measured | 572 (raw 560) | 1, 2 |
| 46 g of fat ("46 g FAT") | measured | 45.8 g | 1 |
| 21 g of protein ("21 g PROTEIN") | measured | 21.0 g | 1 |
| 10 g of fibre ("10 g FIBRE") | measured | 10.3 g | 1 |
| 100 g in the shell is about 300 kcal, not 570 ("≈ 300 kcal", "NOT 570") | calculated | 53 g × 5.72 = 303 kcal (raw 297); logging the in-shell weight as kernels would give 572 | 1, 3 |
| a handful of 49 kernels: about 160 kcal ("49 KERNELS", scale "28 g", "≈ 160 kcal") | measured household weight + calculated | 1 oz = 49 kernels = 28.35 g; × 5.72 = 162 kcal (raw 159) | 1 |

Assumptions stated: pistachios, dry-roasted, no salt (values per 100 g of edible kernels); "about half" and 47/53 use the USDA average refuse; shell share and kernel size vary between nuts and lots; the 49-kernel handful is USDA's 1 oz measure. SR28 also lists "1 kernel = 0.7 g", which does not agree with 49 kernels per ounce (0.58 g each); only the ounce measure is used.
Drawings: the pistachio with eyes, the kernel character, flying shell halves, oil drops (fat), cubes (protein) and green strands (fibre) are illustrative symbols, not to scale; scale readouts show the calculated grams.
Not claimed: heart, weight-loss or any health or cure effect; nutrient functions; brands or prices; that shells are harmful; that salted pistachios have the same sodium. No food is called good or bad.
Composition per `context/25-feedback-rules-2026-11-11.md` (incl. the 2026-11-15 addenda) and the 2026-11-18 live feedback recorded in `context/34-continuation-2026-11-18.md`.
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
