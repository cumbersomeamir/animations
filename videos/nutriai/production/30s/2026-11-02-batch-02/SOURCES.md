# Sources: production 30 s #02 (guava), retrieved 2026-11-02

1. USDA FoodData Central, SR Legacy, "Guavas, common, raw", **FDC ID 173044** (NDB 09139), per 100 g edible portion. https://fdc.nal.usda.gov/food-details/173044/nutrients. Official bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). Extract: `research/fdc-173044-key-values.json`. Public domain (CC0).
2. USDA FoodData Central, "Guavas, strawberry, raw", FDC ID 173045 (vitamin C 37 mg / 100 g): supports "other guava types can differ". `research/fdc-173045-strawberry-guava-key-values.json`.
3. USDA SR28 `FOOD_DES.txt` (https://www.ars.usda.gov/ARSUserFiles/80400535/DATA/SR/sr28/dnload/sr28asc.zip, sha256 8308fd1d…ee70a): NDB 09139 refuse **"Skin", 22 %**, *Psidium guajava*. `research/sr28-FOOD_DES-guavas.txt`.
4. MedlinePlus (U.S. National Library of Medicine, NIH), "Dietary fiber", https://medlineplus.gov/ency/article/002470.htm: "Fiber aids digestion and helps prevent constipation." Archived `research/medlineplus-002470-fiber.html` (sha256 91e305b3…fd89b).
5. MedlinePlus (NLM, NIH), "Vitamin C", https://medlineplus.gov/ency/article/002404.htm: "…Form an important protein called collagen…" Archived `research/medlineplus-002404-vitamin-c.html` (sha256 f6f7aec1…7fd89b).

| Claim | Value | Source |
|---|---|---|
| 100 g raw guava (flesh + seeds; skin trimmed) | basis | 1, 3 |
| about 68 kcal | 68 kcal | 1 |
| 5.4 g fibre | 5.4 g | 1 |
| 228 mg vitamin C | 228 mg | 1 |
| reference values; types and fruits differ | 37 mg vs 228 mg; means of samples | 1, 2 |
| fibre aids digestion | n/a | 4 |
| vitamin C helps the body make collagen | n/a | 5 |
| one fruit ≈ 55 g edible, not 100 g | 55 g | 1 (portion "fruit, without refuse") |

Style art direction (read-only): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley (new for this episode, no reused track); Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; MedlinePlus text quoted for citation only; app icon is NutriAI's own asset.
