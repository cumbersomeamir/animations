# Sources: CalMeter English 30 s english-22 (what's really inside a pineapple, "MORE THAN SWEET"), retrieved 2026-11-19

Topic note: batch 22 asked for "What is really inside a mango?" (an original mango mascot opening a miniature juicy world, a fibre path and a vitamin C reveal, per 100 g edible fresh mango and a relatable portion). That precise subject was already covered by production #01 (`context/12-production-30s-01.md`, 2026-11-02: "What is actually in 100 grams of mango?", USDA FDC 169910, 60 kcal, 15 g carbohydrate, 1.6 g fibre, 36 mg vitamin C per 100 g), and also by education pilot 01 (15 s, mango) and the 10 s style test. Per the brief, a genuinely different subject in the same genre was chosen before scripting: the pineapple (never covered). It keeps the brief's structure — a golden fruit mascot that opens like a tiny theatre, a visible fibre path, a vitamin C reveal, what the nutrients do, a relatable portion and the frame-0 words "MORE THAN SWEET". Completed topics checked: mango, guava, pomegranate, papaya, orange, chickpeas ×2, paneer, peanuts vs peanut butter, egg + oil, raisins vs grapes, avocado vs cucumber, potato + butter, popcorn, rice, edamame vs peas, honey vs sugar, dark vs milk chocolate, watermelon vs raisins, passion fruit, kiwi, pistachios, coconut water vs meat.

1. USDA FoodData Central, SR Legacy, "Pineapple, raw, all varieties", **FDC ID 169124** (NDB 09266), per 100 g edible portion: vitamin C 47.8 mg (n = 21), total dietary fibre 1.4 g (n = 6), energy 50 kcal, water 86.0 g. Household weight "cup, chunks = 165 g". https://fdc.nal.usda.gov/food-details/169124/nutrients
2. Variety records (context, not shown): FDC 168193 "Pineapple, raw, traditional varieties" 16.9 mg vitamin C / 100 g; FDC 168194 "Pineapple, raw, extra sweet variety" 56.4 mg.
3. USDA SR28 FOOD_DES: refuse 49 % "8% core, 16% crown, 26% parings" (NDB 09266); SR28 documentation: household weights are edible material without refuse. Extract: `research/sr28-refuse-weights-pineapple.txt`.
4. MedlinePlus (U.S. National Library of Medicine), retrieved 2026-11-19: "Vitamin C" https://medlineplus.gov/ency/article/002404.htm (review date 1/21/2025): vitamin C is used to "Form an important protein called collagen, used to make skin, tendons, ligaments, and blood vessels" and to "Aid in the absorption of iron". "Fiber" https://medlineplus.gov/ency/article/002470.htm (review date 7/22/2026): "Fiber aids digestion and helps prevent constipation." Excerpts: `research/medlineplus-vitamin-c-fiber-excerpts-2026-11-19.txt`.
5. US Daily Value for vitamin C: 90 mg (21 CFR 101.9(c)(8)(iv), eCFR point-in-time 2026-11-01). Excerpt: `research/ecfr-21cfr101.9-vitamin-c-daily-value-2026-11-01.txt`.
Extracts: `research/fdc-169124-168193-168194-pineapple-key-values.json` (from `FoodData_Central_sr_legacy_food_json_2021-10-28.zip`, sha256 789240d4…f96bc7; SR28 `sr28asc.zip` sha256 8308fd1d…ee70a). Calculations: `research/pineapple-calculations.txt`. USDA data public domain; CFR a US government work; MedlinePlus quoted for verification only.

| Claim (spoken / on screen) | Type | Value | Source |
|---|---|---|---|
| "MORE THAN SWEET" (frame 0); what's really inside a pineapple | framing | — | — |
| skip the crown, peel and core ("CROWN", "PEEL", "CORE") | USDA refuse | crown 16 % + parings 26 % + core 8 % = 49 % | 3 |
| a fibre path: 1.4 g per 100 g ("1.4 g FIBRE") | measured | 1.4 g | 1 |
| fibre aids digestion ("AIDS DIGESTION") | authoritative function | verbatim | 4 |
| the star: 48 mg of vitamin C ("48 mg", "VITAMIN C · PER 100 g") | measured | 47.8 mg | 1 |
| your body uses it to make collagen for skin and blood vessels ("COLLAGEN") | authoritative function | verbatim (shortened) | 4 |
| and to absorb iron ("+ IRON") | authoritative function | verbatim | 4 |
| one cup of chunks: about 80 mg ("1 CUP ≈ 80 mg") | household weight + calculated | 165 g × 0.478 = 78.9 mg | 1 |
| nearly a full day's vitamin C (ring drawn to 88 %) | calculated against the US DV | 78.9 / 90 = 88 % | 1, 5 |

Assumptions stated: raw pineapple, USDA "all varieties" average (variety matters: a cup of extra sweet ≈ 93 mg, of traditional ≈ 28 mg); "a day's vitamin C" is the US Daily Value (90 mg); other countries use other reference intakes.
Drawings: the mascot, the golden juice world, the braided fibre path, the vitamin C star, the helix (collagen), skin block, vessel, cell, iron beads, measuring cup and ring are illustrative symbols, not to scale.
Not claimed: immunity, digestion "cures", bromelain or enzyme effects, weight effects, any disease claim; no food is called good or bad.
Composition per `context/25-feedback-rules-2026-11-11.md` (incl. the 2026-11-15 and 2026-11-19 addenda) and the live feedback in `context/34-continuation-2026-11-18.md`.
Licences: original code; original synthesized ambient bed and foley; Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT); faster-whisper (MIT) for QA only; @napi-rs/canvas (MIT); Inter (OFL 1.1); USDA data public domain; the app icon is the app's own approved asset (`assets/icon.png`).
