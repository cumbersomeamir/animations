# 15 — Production 30 s, round 02 (2026-11-03): "What is inside 100 grams of raw papaya flesh?"

Output: `videos/nutriai/production/30s/2026-11-03-round-02/nutriai-30s-round02-01.mp4`. QA + hash: `production/30s/2026-11-03-round-02/QA.md`. Sources: `.../SOURCES.md`. Publishing copy: `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks (before work)
- No generation was active (no render/ffmpeg/TTS process; branch equal to origin at `69b3571`, the completed pomegranate episode). Nothing to finish or checkpoint first.
- Topic history: papaya had not been covered (episodes: mango #01, guava #02, pomegranate #03; oats round cancelled and never published). The proposed topic was used as given.

## Brief (user, round 02, 3 November 2026)
One new 30.000 s English educational video for CalMeter: 100 g of raw papaya edible flesh; peel/seeds separated; large cutaway; verified kcal / fibre / vitamin C; nutrient functions from NIH; one useful portion takeaway; final spoken + visible CTA "Track your food and nutrition with CalMeter." Keep the approved style, renderer, caption treatment, voice, pacing; no redesign or context rewrite.

## Sheet feedback implemented (specific adjustments only)
| Feedback | What changed in this episode |
|---|---|
| Keep exact approved Copperplate Engraving, ivory `#F4EEDC`, deep ink `#16201A`, vivid food washes, large cutaway | Renderer is `production/30s/2026-11-03/source/render.mjs` (pomegranate, itself the guava batch-02 renderer) with only the food geometry swapped. Same burin, hatch families, ring-clipped washes, roundels, balance, camera, captions, title/plate, stop motion |
| Remove repetitive generic disclaimers ("not a cure", "fruits differ", database caveats) | None in script or plate |
| Brief per-100 g edible-flesh basis | One basis line: "Per 100 g raw papaya flesh · USDA FoodData Central FDC 169926" |
| Clear final spoken + visible CTA | Spoken "Track your food and nutrition with CalMeter." in the last 3.25 s (26.75–29.08 s); caption "Track your food and nutrition / with CalMeter"; an engraved CalMeter seal (approved `assets/icon.png`) + cut wordmark inside the plate (y 1294–1410) |
| No sidebar / bottom overlap | The small bottom signature used in earlier episodes (y ≈ 1600) is replaced by the in-plate CTA seal; the credit line is dropped; all plate text stays left of x 950 and above y 1540 |
| Scenes move with narration, no static holds | Every line has its own scene action; takeaway and CTA got extra purposeful motion after a QA defect (see QA.md) |

## Final script (67 words)
| Take | Start | Text |
|---|---|---|
| T0 | 0.25 s | Seeds out, skin off: what's in a hundred grams of papaya flesh? |
| T1 | 4.80 s | Forty-three calories, one point seven grams of fibre, and sixty-one milligrams of vitamin C. |
| T2 | 11.75 s | It's eighty-eight percent water, and water has no calories. |
| T3 | 15.65 s | Fibre aids digestion, and vitamin C helps your body absorb iron. |
| T4 | 21.00 s | A cup of papaya cubes is about a hundred forty-five grams, or sixty-two calories. |
| T5 | 26.75 s | Track your food and nutrition with CalMeter. |

Draft → final: the first draft ran 28.5 s of speech, so T1 dropped "About", T2 became "eighty-eight percent water" (was "mostly water, eighty-eight grams in every hundred") and T4 lost a colon pause. "CalMeter" uses the phoneme override `kˈælmˌiːtɚ`. One ASR timing pass (`qa/asr-takes.txt`): verbatim (casing/homophone differences only).

## Source-to-claim mapping (retrieved 2026-11-03)
| Claim | Value | Source |
|---|---|---|
| Basis: 100 g raw papaya flesh (seeds and skin removed) | per 100 g edible portion | USDA FoodData Central SR Legacy **FDC 169926** "Papayas, raw" (NDB 09226); SR28 `FOOD_DES` refuse **"Seeds and skin", 38 %**, *Carica papaya* |
| 43 calories | 43 kcal (179 kJ) | FDC 169926 Energy |
| 1.7 g fibre | 1.7 g (n = 9) | FDC 169926 Fiber, total dietary |
| 61 mg vitamin C | 60.9 mg (n = 73) | FDC 169926 Vitamin C |
| 88 % water; water has no calories | 88.1 g / 100 g (n = 72) | FDC 169926 Water |
| the other 12 g is mostly sugars + fibre | sugars 7.82 g + fibre 1.7 g of 11.9 g | FDC 169926 |
| Fibre aids digestion | n/a | MedlinePlus (NIH NLM) "Dietary fiber" https://medlineplus.gov/ency/article/002470.htm: "Fiber aids digestion and helps prevent constipation." |
| Vitamin C helps your body absorb iron | n/a | MedlinePlus (NIH NLM) "Vitamin C" https://medlineplus.gov/ency/article/002404.htm: vitamin C is used to "Aid in the absorption of iron" |
| 1 cup of cubes ≈ 145 g ≈ 62 kcal | 145 g; 145 × 43 / 100 = 62.4 | FDC 169926 portion "cup 1" pieces" = 145 g |

## Storyboard (30 fps; `production/30s/2026-11-03-round-02/source/timeline.json`)
| Beat | Time | Plate action | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–1.6 s | Loupe pull-out while the burin cuts a whole elongated papaya (contours, cross-contours, crossing family, stem); green-gold skin wash; red knife line down the long axis | Seeds out, skin off: | burin scratches, slice |
| Open | 0.9–2.1 s | Burnisher sweeps the fruit away; a large long-section is re-cut: green skin band, vivid orange flesh, ragged cavity packed with black seeds in gel sacs | / 100 g of papaya flesh? | page, juice |
| Seeds out | 2.4–3.6 s | The seeds lift out of the cavity on arcs into an engraved dish in the left margin ("SEEDS · not eaten") | (same) | soft patter |
| Skin off | 3.5–4.3 s | The skin band lifts away from the flesh and fades to a ghost ("SKIN · not eaten"); "FLESH · the 100 g" | (same) | fibrous tear |
| Facts | 4.7–11.2 s | Roundels scribed from the flesh on "43", "1.7", "61": 43 kcal / 1.7 g fibre / 61 mg vitamin C; basis line cut | 43 kcal · 1.7 g fibre / 61 mg vitamin C | scribe ticks |
| Mechanism: water | 11.6–15.2 s | Roundels lift off; blue water lines flow through the flesh; a "100 g papaya flesh" bar fills 88 g blue ("88 g water", "0 kcal") vs 12 g orange ("43 kcal", "12 g: mostly sugars + fibre") | 88 % water, / and water has 0 kcal | drip, page |
| Functions | 15.5–20.5 s | Fibre roundel: strands flow (digestion). Vitamin C roundel: iron dots, each met by a vitamin C dot, pass through the gut wall | Fibre aids digestion, / vitamin C helps absorb iron | page |
| Takeaway | 20.8–26.3 s | Balance cut; a measuring cup lands, cubes drop in one by one, the 145 g weight levels the beam; dotted leader from the flesh to the cup; "≈ 62 kcal" and "145 g × 43 kcal / 100 g" cut | 1 cup of cubes ≈ 145 g / ≈ 62 kcal | thud, clink |
| CTA | 26.3–30 s | Balance burnished away; engraved seal with the approved icon, "CalMeter" cut letter by letter, leaf-green rule, milled edge engraved tick by tick | Track your food and nutrition / with CalMeter | pencil, bed fades |

## Retained style (unchanged; reference the code, not a library)
Same recipe as `14-production-30s-pomegranate.md` "Exact retained style": burin swell/taper w·(0.2+0.8·sin(πu)^0.7) with 22 % tapers; three form-following hatch families at tone 0.14 / 0.5 / 0.75, light upper-left; multiply washes under the ink, ring-clipped, blooming from one point; roundels RR 112 flown on arcs with log-linear growth and leaders; balance vignette; plate mark + ruled border + cut title ("PLATE IV · PAPAYA · RAW FLESH"); ivory grain; camera keys; captions Inter Display Black 58 px at baselines 401/455 (line 1 ink, line 2 leaf-dark); stop motion 15 drawings/s. Papaya washes: skin `#FBB646` → `#E5BE48` → `#78A53C`, skin band `#9CC24A`, flesh `#F7A452` → `#EE7428`, seeds `#2E2722` in pale gel, water `#8CC0E6`. Audio: the pomegranate `mix.py` unchanged (quiet chord bed + air, no beat, foley on events, ducking, loudnorm −15 LUFS / −1.5 dBTP).
