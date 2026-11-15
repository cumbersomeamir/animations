# Sources: CalMeter English 30 s english-16 (dark vs milk chocolate, "MORE CALORIES?"), retrieved 2026-11-15

Topic note: the requested "Why dried grapes pack so much into a handful" (grapes vs raisins; water removed concentrates energy per gram; 100 g and realistic portions; hook "SAME FRUIT, DIFFERENT HANDFUL") was already covered by english-08 (`context/21-production-30s-english08-raisins.md`: raisins vs grapes, the same 30 g, ≈ 21 vs ≈ 90 kcal, grapes ≈ 80 % water, "drying removes most of it", ≈ 130 g grapes → 30 g raisins). The water-removal mechanism also carried english-10 (cooked vs dry-roasted chickpeas) and english-13 (rice). Per the batch rule, a genuinely different same-genre story with an equally strong opening was chosen: dark vs milk chocolate. Chocolate had never been covered.

1. USDA FoodData Central, SR Legacy, "Chocolate, dark, 70-85% cacao solids", **FDC ID 170273** (NDB 19904), per 100 g: 598 kcal, total fat 42.6 g, sugars 24.0 g, carbohydrate 45.9 g, fibre 10.9 g, protein 7.79 g; portions "1 oz = 28.35 g", "1 bar = 101 g". https://fdc.nal.usda.gov/food-details/170273/nutrients . Extract `research/fdc-170273-dark-chocolate-70-85-key-values.json`.
2. USDA FoodData Central, SR Legacy, "Candies, milk chocolate", **FDC ID 167587** (NDB 19120), per 100 g: 535 kcal, total fat 29.7 g, sugars 51.5 g, carbohydrate 59.4 g, fibre 3.4 g, protein 7.65 g; portions "bar (1.55 oz) = 44 g". https://fdc.nal.usda.gov/food-details/167587/nutrients . Extract `research/fdc-167587-milk-chocolate-key-values.json`.
3. Context (not narrated): the other USDA dark bands, FDC 170271 (45–59 % cacao: 546 kcal, 47.9 g sugars, 31.3 g fat) and FDC 170272 (60–69 %: 579 kcal, 36.7 g sugars, 38.3 g fat): energy and fat rise and sugar falls as cacao rises; every dark band is above milk chocolate's 535 kcal. `research/sr-legacy-chocolate-cacao-bands.json`.
4. US Code of Federal Regulations, 21 CFR 163.111 "Chocolate liquor" (eCFR point-in-time 2026-11-01): chocolate liquor is prepared by finely grinding cacao nibs and "contains not less than 50 percent nor more than 60 percent by weight of cacao fat". https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-163/subpart-B/section-163.111 . Copy `research/ecfr-21cfr163.111-chocolate-liquor-2026-11-01.xml` (the eCFR page links an amendment, 91 FR 65069 of 13 Oct 2026, which was not reviewed; the claim used is the definition and fat range above).
5. FAO Food and Nutrition Paper 77, "Food energy – methods of analysis and conversion factors" (2003), section 3.5.1, Atwater general factors: fat 9.0 kcal/g, protein and carbohydrate 4.0 kcal/g. https://www.fao.org/4/y5022e/y5022e04.htm . Copy archived with english-05: `production/30s/2026-11-05-feedback-05/research/fao-fnp77-chapter3-energy-factors.html`.
Calculations: `research/chocolate-calculations.txt`. Bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…f96bc7). USDA data are public domain (CC0); the CFR is a US government work.

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| dark has more calories: 598 vs 535 kcal per 100 g | measured | 598; 535 | 1, 2 |
| "70–85%" on the dark wrapper (which dark chocolate) | USDA category | 70–85 % cacao solids | 1 |
| less than half the sugar: 24 g vs 52 g per 100 g | measured | 24.0; 51.5 (ratio 0.47) | 1, 2 |
| more cacao means more cocoa butter | regulation + measured trend | cacao nibs ground to liquor carry 50–60 % cacao fat; USDA fat rises 31.3 → 38.3 → 42.6 g across the 45–85 % bands | 4, 3 |
| 43 g of fat vs 30 g per 100 g | measured | 42.6; 29.7 | 1, 2 |
| fat has 9 kcal a gram, sugar 4 | standard conversion factors (estimate) | 9.0; 4.0 kcal/g | 5 |
| (why it adds up) extra fat outweighs less sugar | calculated | +12.9 g × 9 − 13.5 g × 4 ≈ +63 kcal = USDA gap 63 kcal | 1, 2, 5 |
| 30 g each: about 180 vs 160 kcal | calculated | 179.4; 160.5 | 1, 2 |
| log the grams, not the shade | takeaway | the portion weight drives the total | — |

Assumptions stated: "dark" means the USDA 70–85 % cacao band (shown on the wrapper; lower-cacao dark bars have more sugar, but all USDA dark bands still exceed milk chocolate per 100 g); plain bars without fillings; 30 g is an illustrative piece (USDA's household measure for the dark item is 1 oz = 28.35 g). Sugar cubes are drawn as ≈ 4 g units (6 vs ≈ 13), the butter blocks are scaled to grams of fat, and the energy coins count kcal per gram: diagrams, not measurements.
Not claimed: health effects, antioxidants/flavanols, "healthier" or "better" choices, caffeine, brands or prices; no food is called good or bad.
Composition per `context/25-feedback-rules-2026-11-11.md` and its 2026-11-15 first-frame addendum (frame 0 = thumbnail composition, ≤ 5 truthful words).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
