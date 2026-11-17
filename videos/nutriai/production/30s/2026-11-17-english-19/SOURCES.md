# Sources: CalMeter English 30 s english-19 (what's really inside a kiwi, "WHAT'S INSIDE?"), retrieved 2026-11-17

Topic note: the requested "What is inside a guava?" (per 100 g edible guava: calories, fibre, vitamin C) was already covered by production #02 (`context/13-production-30s-02.md`, 2026-11-02: guava 68 kcal, 5.4 g fibre, 228 mg vitamin C per 100 g); Hindi #03 had already recorded the same overlap. Per the batch rule, a genuinely different specific topic in the same genre (a fun fruit breakdown: calories, fibre, vitamin C per 100 g) was chosen: the green kiwi, never covered (completed topics: mango, guava, pomegranate, papaya, orange, chickpeas ×2, paneer, peanuts, egg + oil, raisins vs grapes, avocado vs cucumber, potato + butter, popcorn, rice, edamame vs peas, honey vs sugar, dark vs milk chocolate, watermelon vs raisins, passion fruit). The brief allowed USDA or IFCT; USDA values were used throughout.

1. USDA FoodData Central, SR Legacy, "Kiwifruit, green, raw", **FDC ID 168153** (NDB 09148), per 100 g edible portion: 61 kcal, total dietary fibre 3.0 g, vitamin C 92.7 mg; household weight "fruit (2-inch dia) = 69 g". https://fdc.nal.usda.gov/food-details/168153/nutrients . Extract `research/fdc-168153-kiwifruit-green-raw-key-values.json`.
2. USDA FoodData Central, SR Legacy, "Oranges, raw, all commercial varieties", **FDC ID 169097** (NDB 09200), per 100 g: vitamin C 53.2 mg. https://fdc.nal.usda.gov/food-details/169097/nutrients . Extract `research/fdc-169097-oranges-raw-key-values.json`.
3. USDA SR28 FOOD_DES / WEIGHT and documentation: kiwi refuse "Skin", 24 %; household weights are edible portions ("Weights are given for edible material without refuse"). Extract `research/sr28-weights-refuse-09148-09200.txt`.
4. US Code of Federal Regulations, 21 CFR 101.9(c)(8)(iv) (eCFR point-in-time 2026-11-01): RDI (Daily Value) for vitamin C 90 mg for adults and children 4 years and older. https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-A/section-101.9 . Excerpt `research/ecfr-21cfr101.9-vitamin-c-daily-value-2026-11-01.txt`.
Calculations: `research/kiwi-calculations.txt`. Bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…f96bc7). USDA data are public domain (CC0); the CFR is a US government work.

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| fuzzy brown outside (skin not counted) | USDA edible portion | skin = 24 % refuse | 3 |
| 100 g of the green flesh: 61 kcal | measured | 61 | 1 |
| 3 g of fibre per 100 g | measured | 3.0 g | 1 |
| vitamin C 93 mg per 100 g | measured | 92.7 mg | 1 |
| more than an orange's 53 | measured | 53.2 mg | 2 |
| one peeled kiwi is about 69 g | measured household weight (edible portion) | 69 g | 1, 3 |
| about 42 kcal per kiwi | calculated | 69 × 0.61 = 42.1 | 1 |
| about 70 % of the (US) daily value for vitamin C ("≈ 70%", "US DAILY VALUE") | calculated against the regulatory DV | 64.0 / 90 = 71 % | 1, 4 |
| log the grams you eat | takeaway | values scale with grams | — |

Assumptions stated: green kiwi, raw, peeled; "one kiwi" is USDA's 2-inch fruit (69 g edible); fruits vary. The daily value is the US Daily Value (90 mg); other countries use other reference intakes. Drawings: the vitamin C tubes are filled to 93 % and 53 % of one height (a milligram scale, not volume); slices, the peeled kiwi and the ring are drawings.
Not claimed: immunity, skin or any health or cure effect; nutrient functions; brands or prices; no food is called good or bad.
Composition per `context/25-feedback-rules-2026-11-11.md` incl. the 2026-11-15 first-frame and full-frame addenda.
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
