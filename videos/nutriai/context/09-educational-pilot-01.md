# 09 — Educational Pilot 01: "What's inside 100 g of raw mango flesh?"

## Brief (as assigned, 2026-11-02)
- NEW 15 s educational pilot, not an app advertisement. One useful explanation even if the viewer never downloads the app. Question/physical puzzle → mechanism demonstrated → concise takeaway. No feature tour, no forced Google Play CTA, no slogans, no unverified product claims; a small unobtrusive app signature only; never imply the scene is app UI or experiment data.
- Niche: ingredient-by-ingredient calories and nutrient education. Topic: nutrients in 100 g of raw mango flesh, from ONE authoritative food database entry with its preparation and portion; real values, honest rounding, edible portion, not whole-fruit weight; no health-cure claims.
- Visual identity: realistic appetising fruit hero, labelled nutrient layers, measured portions; black / leaf green; subtle original ingredient guide only if useful.
- Character: original recognisable recurring performer with model sheet, reusable rig, expressions/poses, original licensed synthetic voice; performs the mechanism. References (battysticky, breakingbreach) are quality references only, not copied, not claimed as viewed.
- Deliver: exactly 15.000 s, 1080×1920, H.264, 30 fps, AAC; `videos/nutriai/education/pilot-01/nutriai-education-pilot-01.mp4` + source, reproducible build, storyboard, character sheet, sources (dated) + claim mapping, license notes, contact sheets, ffprobe, QA.md. Full decode, inspect, fix, rerender; commit/push to `claude-video/nutriai`.

## Concept
**Gram**, a living 100 g calibration weight, is the measuring instrument. Because Gram *is* 100 g, balancing him against food on a two-pan (Roberval) balance measures exactly 100 g. Every episode starts from that physical fact.

## Storyboard (30 fps; source of truth `education/pilot-01/source/timeline.json`)
| Beat | Frames (s) | Physical action (cause → effect) | On screen | Voice (Gram) | SFX |
|---|---|---|---|---|---|
| B1 Puzzle | 0–78 (0–2.6) | A whole mango falls into frame and slams onto the right pan → the beam flips → Gram (on the left pan) is launched, flails, lands; he shrugs at the fruit | "INGREDIENT 101 · MANGO / What's inside 100 g of mango?" | "What's inside a hundred grams of mango?" (0.20 s) | riser, whoosh, thud + pan clang + boing, landing clank |
| B2 Measure the edible part | 78–160 (2.6–5.3) | Camera pushes in. Gram leaps to the pivot (no torque there), winds up and chops → the fruit splits: cheeks fall open flesh-up, the seed slab flies off ("seed: not counted"), flesh pops out as cubes onto the pan, the empty skins fly off ("skin: not counted"); Gram hops back to his pan → the beam swings and settles level → "= 100 g" | "MEASURE THE EDIBLE PART / Just the flesh / no skin · no seed" | "Just the flesh." (3.47 s) | hop, swish + juicy slice, whoosh ×2, cube patter, clank + creak, ding |
| B3 Open the 100 g | 160–390 (5.3–13.0) | The cubes melt into a glass column drawn in **true proportion to 100 g**: water fills to 83.5 % ("WATER 83.5 g"); a 15.0 g carb block drops in and Gram ducks ("Carbs 15.0 g, incl. fibre 1.6 g", fibre threads appear); a 1.6 g sliver caps it ("Other 1.6 g: protein · fat · minerals"); Gram stomps → a pulse runs along the beam → sparks rise from the carb layer → "60 kcal" stamp; Gram raises a magnifier → a lens on the column finds a few orange specks: vitamin C 36 mg (0.036 g, too small to show as a layer) | "WHAT 100 g OF FLESH IS MADE OF / Mostly water" → "TOO SMALL TO STACK: 0.036 g / Vitamin C 36 mg"; source line appears | "Mostly water." (5.53) "Fifteen grams of carbs, with some fibre." (6.67) "Sixty calories." (9.33) "Thirty-six milligrams of vitamin C." (10.73) | pour/bubbles, thunk, zip, tick, rise, stamp, sparkle |
| B4 Takeaway | 390–450 (13.0–15.0) | The column collapses; 12 cubes drop into a glass measuring cup and stack to a glowing line just above ½ cup; Gram winks + thumbs-up | "TAKEAWAY / 100 g ≈ just over ½ cup of pieces", cup graduations, "≈ 60 kcal · 100 g of flesh ≈ 0.6 cup", small NutriAI signature | "Just over half a cup." (13.20–14.39) | patter, ding, pop; music resolves |

Camera: wide → push-in on the cut → wide for the level → raised wide for the column → slight push to the cup.

## Numbers used (all per 100 g edible portion, USDA FDC 169910 "Mangos, raw"; details in `education/pilot-01/SOURCES.md`)
Water 83.5 g · carbohydrate 15.0 g (fibre 1.6 g) · protein 0.82 + fat 0.38 + ash 0.36 = 1.56 ≈ 1.6 g · energy 60 kcal · vitamin C 36.4 mg (shown 36 mg) · 1 cup pieces = 165 g → 100 g ≈ 0.61 cup ("just over ½ cup").
"Mostly from carbs": USDA's own calorie factors for this food (carb 3.6, protein 3.36, fat 8.37 kcal/g) give 54.0 + 2.8 + 3.2 kcal: about 90 % of the 60 kcal comes from carbohydrate.
