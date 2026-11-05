# Sources: CalMeter Hindi 30 s feedback-05 (plain paneer), retrieved 2026-11-05

1. **Reference food:** Matvaretabellen (Norwegian Food Composition Table, Norwegian Food Safety Authority), **"Cheese, paneer", Food ID 01.301**, per 100 g: energy 325 kcal / 1,348 kJ, protein 26 g, fat 24.5 g (saturated 15.4 g), carbohydrate 0 g, water 50 g; energy distribution fat 67 %, protein 33 %. https://www.matvaretabellen.no/en/cheese-paneer/ . Archived page: `research/matvaretabellen-01.301-cheese-paneer.html` (sha256 03443651…82a6029). The table's source code for these values, **450d**, is "Food Databanks National Capability (2021). FDNC extended dataset based on PHE's McCance and Widdowson's Composition of Foods Integrated Dataset" (UK CoFID), https://quadram.ac.uk/ .
2. FAO Food and Nutrition Paper 77, "Food energy – methods of analysis and conversion factors" (2003), https://www.fao.org/4/y5022e/y5022e04.htm , chapter 3, section 3.5.1 (Atwater general factor system): "The energy values are 17 kJ/g (4.0 kcal/g) for protein, 37 kJ/g (9.0 kcal/g) for fat and 17 kJ/g (4.0 kcal/g) for carbohydrates." Archived `research/fao-fnp77-chapter3-energy-factors.html` (sha256 f773eda5…88c165).
3. Checked and **not used on screen:** USDA FoodData Central, FNDDS 2021–2023 "Cheese, paneer", FDC 2705740 (food code 14110050): 299 kcal, 15.9 g protein, 15.5 g fat, 22.5 g carbohydrate per 100 g; recipe-derived from whole milk + vinegar (official bulk file `FoodData_Central_survey_food_json_2024-10-31.zip`, sha256 dfb06ae7…f3eb). The carbohydrate value is implausible for drained paneer. Extract: `research/fdc-2705740-fndds-paneer-NOT-USED.json`. USDA SR Legacy and Foundation have no paneer entry.

| Claim (Hindi on screen / spoken) | Value | Source |
|---|---|---|
| 26 ग्राम प्रोटीन, 24.5 ग्राम फ़ैट, 325 कैलोरी (प्रति 100 ग्राम) | as listed | 1 |
| दो-तिहाई कैलोरी फ़ैट से | 67 % | 1 |
| फ़ैट से ≈ 220, प्रोटीन ≈ 104 | 24.5 × 9; 26 × 4 | 1, 2 |
| 1 ग्राम फ़ैट ≈ 9 कैलोरी; कम फ़ैट = कम कैलोरी | 9 kcal/g | 2 |
| 200 ग्राम पैक का आधा = 100 ग्राम | arithmetic | — |

Style art direction (read-only, unchanged): https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (engine not cloned/run).
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT), Hindi voice hf_beta; faster-whisper medium (MIT) used for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); Noto Sans Devanagari (OFL 1.1, `source/fonts/OFL.txt`); Matvaretabellen data quoted for citation; the app icon is the app's own approved asset (`assets/icon.png`).
