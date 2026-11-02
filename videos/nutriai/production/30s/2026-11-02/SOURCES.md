# Sources: production 30 s #01 (mango)

- USDA FoodData Central, SR Legacy, "Mangos, raw", FDC ID 169910 (NDB 9176), per 100 g edible portion. https://fdc.nal.usda.gov/food-details/169910/nutrients. Retrieved 2026-11-02 from the official bulk downloads (`FoodData_Central_sr_legacy_food_json_2021-10-28.zip`, `FoodData_Central_sr_legacy_food_csv_2018-04.zip`). Extract: `research/fdc-169910-key-values.json`, `research/fdc-169910-food_portion.csv`. Public domain (CC0).
- USDA National Nutrient Database for Standard Reference, Release 28, `FOOD_DES.txt` (sr28asc.zip, https://www.ars.usda.gov/ARSUserFiles/80400535/DATA/SR/sr28/dnload/sr28asc.zip, retrieved 2026-11-02): NDB 09176 "Mangos, raw", refuse "Seeds and skin", 29 %. Extract: `research/sr28-FOOD_DES-09176.txt`.

| Claim | Value used | Field |
|---|---|---|
| raw edible flesh, skin and stone removed | edible portion | FDC basis; SR28 refuse "Seeds and skin" |
| about 60 kcal | 60 kcal | Energy (208) |
| 15 g carbohydrate | 15.0 g | Carbohydrate, by difference (205) |
| 1.6 g fibre | 1.6 g | Fiber, total dietary (291) |
| about 36 mg vitamin C | 36.4 mg | Vitamin C, total ascorbic acid (401) |
| food-database averages | means of analysed samples | FDC data points (vitamin C n = 302) |

Style art direction (read-only): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (sha256 0c6816b8b47163d158ae0ea668feecf53dcbef9d1310e27b9e797d9b9e7aac0d); engine not cloned or run.

Licences: original code and synthesized music/SFX; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT), model-files-v1.0; @napi-rs/canvas (MIT); Inter fonts (OFL 1.1); FFmpeg; USDA data public domain; app icon is NutriAI's own approved asset.
