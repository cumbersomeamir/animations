# Sources: CalMeter English 30 s english-14 (edamame vs green peas), retrieved 2026-11-14

Topic note: the requested "peanuts vs green peas" overlapped english-06 (peanuts vs peanut butter, whose spoken central fact was "peanuts are already about half fat by weight" with a fat-droplet peanut cutaway). Per the batch rule, the brief's idea (two legumes that seem alike but differ in fat, protein, energy and water, per 100 g, consistent preparation, snack takeaway) was kept with edamame in place of peanuts. Neither edamame nor green peas had been covered.

1. USDA FoodData Central, SR Legacy, "Edamame, frozen, prepared", **FDC ID 168411** (NDB 11212), per 100 g: 121 kcal, protein 11.9 g, fat 5.2 g, water 72.8 g, carbohydrate 8.91 g, fibre 5.2 g (analytical n = 2); SR28 "1 cup = 155 g". https://fdc.nal.usda.gov/food-details/168411/nutrients . Extract `research/fdc-168411-key-values.json`.
2. USDA FoodData Central, SR Legacy, "Peas, green, frozen, cooked, boiled, drained, without salt", **FDC ID 170017** (NDB 11313), per 100 g: 78 kcal, protein 5.15 g (n = 11), fat 0.27 g (n = 11), water 79.5 g, carbohydrate 14.3 g, fibre 4.5 g; SR28 "1/2 cup = 80 g". https://fdc.nal.usda.gov/food-details/170017/nutrients . Extract `research/fdc-170017-key-values.json`.
3. Cross-check: "Soybeans, green, cooked, boiled, drained, without salt", FDC 169283: 141 kcal, 12.4 g protein, 6.4 g fat / 100 g.
4. Why they differ (mature seeds, USDA SR Legacy): "Soybeans, mature seeds, raw", FDC 174270: 36.5 g protein, 19.9 g fat, 30.2 g carbohydrate / 100 g; "Peas, green, split, mature seeds, raw", FDC 172428: 23.1 g protein, 3.89 g fat, 61.6 g carbohydrate / 100 g.
5. Edamame are immature (young) soybeans: South Dakota State University Extension, https://extension.sdstate.edu/edamame-harvest-and-storage ; ATTRA/NCAT (USDA-funded), archived https://webarchive.library.unt.edu/eot2008/20081204184055/http://attra.ncat.org/attra-pub/edamame.html . Notes `research/edamame-definition-sources.md`.
Bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). USDA data are public domain (CC0). Calculations: `research/legume-calculations.txt`.

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| green peas and edamame look like twins | framing | both green seeds shelled from pods | — |
| edamame are young soybeans | reliable (extension) | harvested at R6, immature green seeds | 5 |
| which store protein and oil; peas store mostly carbs | measured (mature seeds) | soybean 36.5 g protein + 19.9 g fat vs split pea 61.6 g carbohydrate, 3.9 g fat / 100 g | 4 |
| per 100 g cooked: 12 g protein vs 5 | measured | 11.9 vs 5.15 g | 1, 2 |
| 5 g fat vs almost none | measured | 5.2 vs 0.27 g | 1, 2 |
| 121 kcal vs 78 | measured | 121 vs 78 | 1, 2 |
| a cup of edamame: about double the protein of a cup of peas (18 g vs 8 g) | calculated | 18.4 vs 8.2 g = 2.24× | 1, 2 |
| for about 60 more kcal (≈ 188 vs ≈ 125) | calculated | 187.6 − 124.8 = 62.8 kcal | 1, 2 |

Preparation basis: both cooked from frozen by boiling without salt (USDA "prepared" / "cooked, boiled, drained"); edamame shelled (cup measure of beans). Water is shown via composition only (72.8 vs 79.5 g / 100 g, kept in the notes; the video's labels stay on protein, fat and energy).
Not claimed: health effects, weight-loss outcomes, brand, price or allergy statements.
Composition per `context/25-feedback-rules-2026-11-11.md`; art direction (read-only): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
