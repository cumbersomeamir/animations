# 14 — Production 30 s (2026-11-03): "What is inside 100 grams of raw pomegranate arils?"

Output: `videos/nutriai/production/30s/2026-11-03/calMeter-30s-pomegranate-01.mp4`. QA + hash: `production/30s/2026-11-03/QA.md`. Sources: `production/30s/2026-11-03/SOURCES.md`. Publishing copy: `production/30s/2026-11-03/publishing-caption.txt`. Format: `11-production-format.md` (batch-02 version, unchanged except the episode list and the public-name line).

The cancelled oats feedback round (2026-11-02) stays cancelled; nothing from it is used or published here.

## Brief (user request, 3 November 2026)
- One new 30.000 s portrait video, public app name **CalMeter**, topic: 100 g of raw pomegranate arils (the edible seeds). Whole engraved pomegranate → opens into ruby arils → peel separated → a weighed 100 g edible portion → large calorie / fibre / nutrient callouts → one takeaway: weigh the edible portion, not the whole fruit.
- Exact USDA raw pomegranate entry; authoritative nutrient-function evidence; per-100 g arils kept distinct from whole fruit and juice. No cure claims, no repeated generic disclaimers, one concise basis label.
- Script 65–75 words, natural English, ending "Track your food and nutrition with CalMeter."
- Style unchanged from accepted guava batch-02; quiet ambient audio with subtle slicing/page sounds; cached Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98. Captions ink y 350–470, x 80–1000, max two lines; top 300 px clear. 1080×1920, 30 fps, H.264 yuv420p + AAC.

## Final script (68 words)
| Take | Start | Text |
|---|---|---|
| T0 | 0.25 s | What's inside a hundred grams of pomegranate arils, the juicy seeds? |
| T1 | 5.10 s | Set the peel and pale membranes aside, then weigh the arils. |
| T2 | 9.15 s | That's about eighty-three calories, four grams of fibre and sixteen micrograms of vitamin K. |
| T3 | 15.60 s | Fibre aids digestion, and vitamin K helps your blood clot. |
| T4 | 20.00 s | Bottled juice is different: it has almost no fibre. |
| T5 | 23.60 s | So weigh the edible portion, not the whole fruit. |
| T6 | 26.80 s | Track your food and nutrition with CalMeter. |

- Pronunciation: "CalMeter" uses the phoneme override `kˈælmˌiːtɚ` (default phonemes are heard as "cow meter"); on-screen spelling stays "CalMeter". "arils" is spoken with Kokoro's dictionary phonemes `ˈæɹəlz`; the caption shows the word.
- One ASR timing pass per take (`production/30s/2026-11-03/qa/asr-takes.txt`): verbatim except the rare word "arils" (base.en "aerols"/"arrows"; small.en heard "arils" in T0) and the homophones "pail"/"AIDS" for "pale"/"aids".

## Source-to-claim mapping (retrieved 2026-11-03)
| Claim | Value | Source |
|---|---|---|
| Basis: 100 g raw arils (seed + juice sacs) | per 100 g edible portion | USDA FoodData Central SR Legacy **FDC 169134** "Pomegranates, raw" (NDB 09286); portion "1 cup arils (seed/juice sacs)" = 87 g confirms the edible portion is the arils |
| Peel and pale membranes are not the eaten part | refuse **"Skin and membrane", 44 %** | USDA SR28 `FOOD_DES` NDB 09286 (*Punica granatum*) |
| about 83 calories | 83 kcal (346 kJ) | FDC 169134 Energy |
| 4 g fibre | 4.0 g (n = 3) | FDC 169134 Fiber, total dietary |
| 16 µg vitamin K | 16.4 µg (n = 3) | FDC 169134 Vitamin K (phylloquinone) |
| Fibre aids digestion | n/a | MedlinePlus (NIH NLM) "Dietary fiber" https://medlineplus.gov/ency/article/002470.htm: "Fiber aids digestion and helps prevent constipation." |
| Vitamin K helps your blood clot | n/a | MedlinePlus (NIH NLM) "Vitamin K" https://medlineplus.gov/ency/article/002407.htm: "The body needs vitamin K to make certain proteins in the liver that cause blood to clot." |
| Bottled juice has almost no fibre | 0.1 g / 100 g (n = 2) | USDA FDC **167787** "Pomegranate juice, bottled" (NDB 09442) |
| Whole fruit outweighs its arils (44 % peel + membrane) | 44 % refuse | SR28 NDB 09286 |

Not claimed: daily-value percentages, health outcomes, a whole-fruit gram weight (USDA's "1 pomegranate (4" dia) = 282 g" portion is an edible-portion weight, so it is not shown as a whole-fruit weight).

## Storyboard (30 fps; `production/30s/2026-11-03/source/timeline.json`)
| Beat | Time | Plate action (ivory sheet, deep ink, ruby / red / leaf-green washes) | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–2.8 s | Loupe pull-out while the burin cuts a whole pomegranate (meridians, parallels, crossing family, six-sepal crown, narrow leaf); blush-to-crimson skin wash and leaf green bloom | What's inside 100 g / of pomegranate arils? | burin micro-scratches, bed fades in |
| Open | 2.5–4.6 s | Red knife line round the equator; burnisher sweeps the fruit away while a **large equatorial cutaway** is re-cut: red skin band, pale pith, seven membranes, ~300 packed ruby arils with glints and pale seeds | (same) | slice, page, juice drips |
| Peel aside | 5.3–7 s | The peel halves lift apart; membranes fade; notes "PEEL & MEMBRANE · set aside, not eaten" / "ARILS · the part you eat" | Peel & membrane aside, / weigh the arils | fibrous tear |
| 100 g weighed | 6.8–8.7 s | Balance cut under the cutaway; 22 arils fly on arcs to the left pan until the beam levels with the 100 g weight; label "100 g of arils" | (same) | soft patter of arils |
| Facts | 9.3–15 s | Balance burnished away; roundels scribed from the arils and flown in on "83", "4 g", "16": 83 kcal / 4 g fibre / 16 µg vitamin K; leaders back to the arils; basis line "Per 100 g raw arils · USDA FoodData Central FDC 169134" | 83 kcal · 4 g fibre / 16 µg vitamin K | scribe ticks |
| Mechanism | 15.6–19.5 s | Fibre roundel enlarges, strands flow (digestion); vitamin K roundel enlarges, red points draw together and link into a clotting net | Fibre aids digestion / vitamin K helps blood clot | page |
| Juice | 20–23.2 s | Energy and vitamin K roundels lift off; fibre roundel slides left ("4 g fibre · RAW ARILS"); an engraved juice-glass roundel flies in: "0.1 g fibre · BOTTLED JUICE"; "vs" between | Bottled juice: / almost no fibre | glass clink |
| Takeaway | 23.3–26.4 s | Balance re-cut: a whole pomegranate drops on the left pan, its arils on the right; the beam tips to the whole fruit; labels "whole fruit · 44 % peel + membrane" / "edible arils · weigh these" | Weigh the edible portion, / not the whole fruit | thud, patter, creak |
| CTA | 26.8–30 s | Plate holds; credit "del. et sculp. CalMeter" cut; CalMeter signature with the approved icon | Track your food & nutrition / with CalMeter | bed fades |

## Exact retained style (unchanged from accepted guava batch-02)
- Renderer: `production/30s/2026-11-02-batch-02/source/render.mjs` copied to `production/30s/2026-11-03/source/render.mjs`; unchanged: `text()` logger, `burin()` swell/taper stroke w·(0.2+0.8·sin(πu)^0.7) with 22 % tapers, analytic body → three form-following hatch families (tone 0.14 / 0.5 / 0.75, light upper-left), ring-clipped multiply washes blooming from one point, roundels (RR 112, slots y 1362, log-linear growth on arcs, leaders, FIG. labels), balance vignette, grain/laid-line paper, camera keys, caption function, burnish sweep, plate mark + ruled border + cut title, stop motion 15 drawings/s.
- Swapped only the food geometry (pomegranate body with faint facets + crown; peel/pith/septa/aril cutaway; aril heap), added the vitamin K net motif and the juice-glass roundel.
- Palette: paper `#F4EEDC`, ink `#16201A` (secondary 72 %), leaf `#5AB626`, leaf-dark `#2F7A1C`; washes: skin blush `#F6B08E` → red `#DE4A44` → crimson `#A21F2F`, peel band `#B8222E`, pith/membrane `#F3DDA6`, arils ruby `#CF1C40` with pale glints, seeds cream `#FBF1DA`.
- Typography: Inter Display Black 58 px captions (baselines 401 / 455; line 1 ink, line 2 leaf-dark), Inter Bold/SemiBold plate lettering, cut letter by letter.
- Audio: batch-02 `mix.py` (voice-forward; quiet cross-fading chord bed + air, no beat, no repeating figure, transposed down a whole step for this episode; synthesized slice, juice drip, page, pencil, tick, thud, creak, plus new soft tear, aril patter and glass clink); ducking; two-pass loudnorm −15 LUFS / −1.5 dBTP target.

## QA
See `production/30s/2026-11-03/QA.md`.
