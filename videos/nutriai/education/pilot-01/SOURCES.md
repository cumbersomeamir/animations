# Sources and claim-to-source map: Education Pilot 01 (mango)

## Primary (only nutrition source used)
**U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, SR Legacy: "Mangos, raw", FDC ID 169910 (NDB 9176), food category "Fruits and Fruit Juices", publication date 2019-04-01.**
- Web page: https://fdc.nal.usda.gov/food-details/169910/nutrients
- Retrieved 2026-11-02 from the official bulk release `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_json_2021-10-28.zip, sha256 789240d42d51640b931782310403c415eb4aa03383d8f0a52f6315db80f96bc7). The API (`api.nal.usda.gov`, public DEMO_KEY) returned HTTP 429 (shared rate limit), so the bulk file was used instead.
- Extracted record: `research/usda-fdc-169910-mangos-raw.json` (sha256 8600e5c6…b77b8b); key values: `research/key-values.json`.
- Basis: values are per 100 g of the **edible portion** (raw flesh). The record's household portions: "1 cup pieces" = 165 g; "1 fruit without refuse" = 336 g.
- Licence: USDA FoodData Central data are public domain (CC0 1.0), per the FDC site.

## Claim-to-source map
| On-screen / spoken claim | Value used | Source field (FDC 169910, per 100 g) | Rounding / derivation |
|---|---|---|---|
| "100 g of mango … just the flesh / no skin · no seed" | edible portion | FDC basis "per 100 g edible portion"; portion "fruit without refuse" | Skin and seed are refuse and excluded |
| "Mostly water", "WATER 83.5 g" | 83.5 g | Water (255) = 83.5 g | as published |
| "Carbs 15.0 g", "Fifteen grams of carbs" | 15.0 g | Carbohydrate, by difference (205) = 15.0 g | as published |
| "incl. fibre 1.6 g", "with some fibre" | 1.6 g | Fiber, total dietary (291) = 1.6 g | as published; fibre is part of carbohydrate-by-difference |
| "Other 1.6 g: protein · fat · minerals" | 1.56 g | Protein (203) 0.82 + Total lipid (204) 0.38 + Ash (207) 0.36 | sum rounded to 1.6 g; layers 83.5 + 15.0 + 1.6 = 100.1 (rounding) |
| "60 kcal", "Sixty calories" | 60 kcal | Energy (208) = 60 kcal (250 kJ) | as published |
| "per 100 g · mostly from carbs" | ≈ 90 % | Record's calorie conversion factors: carbohydrate 3.6, protein 3.36, fat 8.37 kcal/g | 15.0×3.6 = 54.0; 0.82×3.36 = 2.8; 0.38×8.37 = 3.2 → 54/60 ≈ 90 % |
| "Vitamin C 36 mg", "Thirty-six milligrams of vitamin C" | 36.4 mg | Vitamin C, total ascorbic acid (401) = 36.4 mg | rounded to 36 mg |
| "= 0.036 g", "too small to stack" | 0.0364 g | same | unit conversion (1 g = 1000 mg); visual point: it is invisible at the column's scale |
| "100 g ≈ just over ½ cup of pieces", "≈ 0.6 cup" | 0.61 cup | Portion "1 cup pieces" = 165 g | 100 / 165 = 0.606 |
| Column layer heights | 83.5 % / 15.0 % / 1.6 % | as above | drawn to true proportion of 100 g |

Not claimed: health outcomes, daily-value percentages, comparisons with other fruits, variety-specific values (FDC also lists Ataulfo and Tommy Atkins Foundation entries, not used), sugar figures (sugars 13.7 g appear in the record but were left out to keep one concept and avoid implying sugars + fibre must equal carbohydrate-by-difference).

## Non-nutrition references
- Skill docs read: `.claude/skills/animation-direction/SKILL.md` (local) and iart-ai/webgl-animation-skills `skills/shader-glsl/SKILL.md` + `references/glsl-cookbook.md` (read 2026-11-01, see `context/07-test-progress.md`).
- Style references named by the user (instagram.com/battysticky, instagram.com/breakingbreach) were **not accessed**; nothing was copied from them.
