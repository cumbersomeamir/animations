# Sources: CalMeter production 30 s (pomegranate), retrieved 2026-11-03

1. USDA FoodData Central, SR Legacy, "Pomegranates, raw", **FDC ID 169134** (NDB 09286), per 100 g edible portion (arils). https://fdc.nal.usda.gov/food-details/169134/nutrients. Official bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). Extract: `research/fdc-169134-key-values.json`. Public domain (CC0).
2. USDA FoodData Central, SR Legacy, "Pomegranate juice, bottled", **FDC ID 167787** (NDB 09442): fibre 0.1 g / 100 g. https://fdc.nal.usda.gov/food-details/167787/nutrients. Extract: `research/fdc-167787-key-values.json`.
3. USDA SR28 `FOOD_DES.txt` (https://www.ars.usda.gov/ARSUserFiles/80400535/DATA/SR/sr28/dnload/sr28asc.zip): NDB 09286 refuse **"Skin and membrane", 44 %**, *Punica granatum*. `research/sr28-FOOD_DES-09286-09442.txt`.
4. MedlinePlus (U.S. National Library of Medicine, NIH), "Dietary fiber", https://medlineplus.gov/ency/article/002470.htm: "Fiber aids digestion and helps prevent constipation." Archived `research/medlineplus-002470-fiber.html` (sha256 91e305b3…c49).
5. MedlinePlus (NLM, NIH), "Vitamin K", https://medlineplus.gov/ency/article/002407.htm (review date 1/21/2025): "Vitamin K is known as the clotting vitamin. The body needs vitamin K to make certain proteins in the liver that cause blood to clot." Archived `research/medlineplus-002407-vitamin-k.html` (sha256 07edd73f…c11a).

| Claim | Value | Source |
|---|---|---|
| 100 g raw arils (seed + juice sacs) | basis | 1 (portion "cup arils (seed/juice sacs)" = 87 g), 3 |
| about 83 kcal | 83 kcal | 1 |
| 4 g fibre | 4.0 g | 1 |
| 16 µg vitamin K | 16.4 µg | 1 |
| fibre aids digestion | n/a | 4 |
| vitamin K helps your blood clot | n/a | 5 |
| bottled juice has almost no fibre | 0.1 g / 100 g | 2 |
| peel + membrane = 44 % of the whole fruit | 44 % | 3 |

Style art direction (read-only, unchanged from batch-02): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; MedlinePlus text quoted for citation only; the app icon is the app's own approved asset (`assets/icon.png`).
