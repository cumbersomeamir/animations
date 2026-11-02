# 12 — Production 30 s #01: "What is actually in 100 grams of mango?" (round production-30s-2026-11-02)

Output: `videos/nutriai/production/30s/2026-11-02/nutriai-30s-production-01.mp4`. QA and hash: `production/30s/2026-11-02/QA.md`. Format rules: `11-production-format.md`.

## Brief (as approved)
One new ready-to-post 30.000 s educational video (not a trim, not an app campaign). Locked genre: ingredient-by-ingredient nutrient and calorie breakdowns. Exact skill: Copperplate Engraving (lemo-opuscar `styles/engraving/STYLE.md`), used as read-only art direction with original code. Begin with a recognisable, appetising mango, weigh the edible flesh, contour-engrave a cutaway, magnify the measured facts. Leaf green / black engraved natural-history plate. USDA FDC 169910, all values and preparation verified; no health cures. Kokoro Meshline voice (af_bella 0.7 + am_puck 0.3, speed 0.98, en-us). Captions upper centre, ink y 350–470, x margins ≥ 80, max 2 short lines. 1080×1920, 30 fps, 900 frames, H.264 yuv420p, AAC 48 kHz stereo, −14 to −16 LUFS, TP ≤ −1 dBTP.

## Final script (draft kept verbatim; it fits 30 s naturally: about 24.0 s of speech)
1. (0.30 s) What is inside a hundred grams of mango?
2. (3.10 s) We mean raw edible flesh, with the skin and stone removed.
3. (7.70 s) That portion has about sixty calories, fifteen grams of carbohydrate, and one point six grams of fibre.
4. (15.40 s) It also contains about thirty-six milligrams of vitamin C.
5. (20.00 s) These are food-database averages, not an exact reading of every mango.
6. (25.40 s) Start with the portion, then understand the nutrients.

ASR timing pass (faster-whisper base.en, one pass per take; `production/30s/2026-11-02/qa/asr-takes.txt`): all six sentences transcribed verbatim (numbers as digits, "fiber" US spelling).

## Source-to-claim mapping
Primary: USDA FoodData Central, SR Legacy, "Mangos, raw", **FDC ID 169910** (NDB 9176), per 100 g **edible portion**. https://fdc.nal.usda.gov/food-details/169910/nutrients. Bulk file `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` (sha256 789240d4…96bc7) and CSV `FoodData_Central_sr_legacy_food_csv_2018-04.zip` (sha256 b80817…6fd0), retrieved 2026-11-02. Refuse confirmed in USDA SR28 `FOOD_DES.txt` (sr28asc.zip, sha256 8308fd1d…ee70a, https://www.ars.usda.gov/ARSUserFiles/80400535/DATA/SR/sr28/dnload/sr28asc.zip): NDB 09176 "Mangos, raw", refuse description **"Seeds and skin"**, refuse 29 %.

| Claim (voice / screen) | Value | Source field | Note |
|---|---|---|---|
| raw edible flesh, skin and stone removed | edible portion | FDC basis per 100 g edible portion; SR28 refuse "Seeds and skin" (29 %) | "stone" = the seed |
| about sixty calories / "60 kcal" | 60 kcal (250 kJ) | Energy (208) | as published |
| fifteen grams of carbohydrate / "15 g carbs" | 15.0 g | Carbohydrate, by difference (205) | as published |
| one point six grams of fibre / "1.6 g fibre" | 1.6 g | Fiber, total dietary (291) | part of carbohydrate-by-difference |
| about thirty-six milligrams of vitamin C / "About 36 mg" | 36.4 mg | Vitamin C, total ascorbic acid (401), 302 data points | rounded to 36 |
| food-database averages, not every mango | means of analysed samples | FDC data points per nutrient (e.g. vitamin C n = 302) | caveat, no number shown |
| "100 g" balance figure | 100 g edible portion | portion basis | illustrative engraving |

Not claimed: health effects, daily values, comparisons, sugars, variety-specific values.

## Storyboard (30 fps; `source/timeline.json`)
| Beat | Frames (s) | Plate action | Caption | SFX / music |
|---|---|---|---|---|
| Hook | 0–90 (0–3) | Loupe on the burin: the whole mango's outline is cut, then three hatch families sweep along its form; the leaf and stem are engraved; log-zoom pull-out to the plate; hand-coloured wash blooms (golden, red blush, green shoulder). Title "PLATE I / MANGO · RAW EDIBLE FLESH" cut letter by letter | What's inside / 100 g of mango? | burin micro-scratches; dry harpsichord; plip + held chord at the wash |
| Setup | 90–240 (3–8) | One heavy cut along the fruit → burnisher sweeps the whole fruit out while the cutaway is re-cut (skin band, contour hatching, radial fibres, stone); leaders "SKIN removed", "STONE removed"; flesh-only wash; Fig. 2 balance: flesh cubes level against a 100 g weight | Raw edible flesh / skin & stone removed | scrape, rub, burin, plip, ting, clink |
| Mechanism | 240–690 (8–23) | Fig. 2 flies to the top-left margin as the portion reference; four roundels scribed on the flesh and flown to the margins on the spoken numbers, values cut on landing: 60 kcal (rays), 15 g carbohydrate (grains), 1.6 g fibre (fibres), 36 mg vitamin C (stipple); leaders back to the flesh; gentle push-in | 60 kcal · 15 g carbs / 1.6 g fibre → About 36 mg / vitamin C | ting per roundel (rising pitch) |
| Takeaway | 600–870 (20–29) | Bracket + legend cut: "Database averages · USDA FoodData Central FDC 169910"; on "Start with the portion" the Fig. 2 roundel glows and the camera leans in, then the roundels glow in turn; pull-back to the finished plate | Food-database averages / not every mango → Start with the portion, / then the nutrients | letters ticks, plip, held chord |
| End | 866–900 (28.9–30) | Credit "del. et sculp. NutriAI" cut; tiny NutriAI signature under the plate | (last caption holds) | final plucked chord, fade |

## Adaptations of STYLE.md
Kept: lines-only tone, swell/taper law, form-following hatch families with tone thresholds, upper-left light, plate mark + ruled border, roundels flown on an eased arc with log-linear growth and leaders, hand-colour washes blooming from one point (colour only on the taught part), printmaking transitions (cut, burnish and re-cut, letters cut), loupe camera, harpsichord + burin foley, −15 LUFS. Changed for this brief and app: dark leaf-green paper with pale ink instead of cream paper and black ink; Inter / Inter Display (app font) instead of Bodoni/Pinyon; subtitles as upper-centre captions instead of a bottom script slip; no copper/burin tool render (lightweight budget); Kokoro narrator instead of a curator recording.

## QA
See `production/30s/2026-11-02/QA.md` (final values, contact sheet, transitions, caption bounds, ASR, loudness, limits).
