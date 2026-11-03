# Sources: CalMeter Hindi 30 s #03 (orange), retrieved 2026-11-03

1. USDA FoodData Central, SR Legacy, "Oranges, raw, all commercial varieties", **FDC ID 169097** (NDB 09200), per 100 g edible portion. https://fdc.nal.usda.gov/food-details/169097/nutrients. Official bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7). Extract: `research/fdc-169097-key-values.json`. Public domain (CC0).
2. USDA FoodData Central, "Orange juice, raw", FDC ID 169098 (NDB 09206): retrieved for comparison only (not used on screen). `research/fdc-169098-key-values.json`.
3. USDA SR28 `FOOD_DES.txt` (https://www.ars.usda.gov/ARSUserFiles/80400535/DATA/SR/sr28/dnload/sr28asc.zip): NDB 09200 refuse **"Peel and seeds", 27 %**, *Citrus sinensis*. `research/sr28-FOOD_DES-09200-09206.txt`.
4. MedlinePlus (U.S. National Library of Medicine, NIH), "Dietary fiber", https://medlineplus.gov/ency/article/002470.htm: "Fiber aids digestion and helps prevent constipation." Archived `research/medlineplus-002470-fiber.html` (sha256 91e305b3…c49).
5. MedlinePlus (NLM, NIH), "Vitamin C", https://medlineplus.gov/ency/article/002404.htm (review date 1/21/2025): vitamin C is used to "Heal wounds and form scar tissue"; lists "Citrus fruits and juices, such as orange" among the highest sources. Archived `research/medlineplus-002404-vitamin-c.html` (sha256 f6f7aec1…7fd89b).

| Claim (Hindi on screen / spoken) | Value | Source |
|---|---|---|
| 100 ग्राम खाने योग्य फाँकें (peel and seeds removed) | basis | 1, 3 |
| 47 कैलोरी | 47 kcal | 1 |
| 2.4 ग्राम फ़ाइबर | 2.4 g | 1 |
| 53 मि.ग्रा. विटामिन सी | 53.2 mg | 1 |
| 87% पानी, पानी में कैलोरी नहीं | 86.8 g / 100 g | 1 |
| 13 ग्राम: मुख्यतः शर्करा + फ़ाइबर | 9.35 g sugars + 2.4 g fibre of 13.2 g | 1 |
| फ़ाइबर पाचन में मदद करता है | n/a | 4 |
| विटामिन सी घाव भरने में मदद करता है | n/a | 5 |
| 1 मध्यम छिला संतरा ≈ 131 ग्राम ≈ 70 मि.ग्रा. विटामिन सी | 131 g; 69.7 mg | 1 (portion "fruit (2-5/8" dia)") |

Style art direction (read-only, unchanged): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT), Hindi voice hf_beta from the same model release; faster-whisper medium (MIT) used for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); Noto Sans Devanagari (OFL 1.1, `source/fonts/OFL.txt`); USDA data public domain; MedlinePlus text quoted for citation only; the app icon is the app's own approved asset (`assets/icon.png`).
