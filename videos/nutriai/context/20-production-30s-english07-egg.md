# 20 — Production 30 s, batch 2026-11-06-english-07: one boiled egg, then fried with a measured teaspoon of oil (English)

Output: `videos/nutriai/production/30s/2026-11-06-english-07/nutriai-30s-english07-01.mp4`. QA + hash: `production/30s/2026-11-06-english-07/QA.md`. Sources: `.../SOURCES.md`. Publishing caption (English, matches the final transcript): `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks
- Repo `cumbersomeamir/animations`, branch `claude-video/nutriai`, in sync with origin at `5c71dff` (english-06 peanuts) before edits; account per session context (info@tensorblue.com). No render/ffmpeg/TTS process was running.
- Topic history: eggs / cooking oil had not been covered (episodes: mango, guava, pomegranate, papaya, orange, chickpeas, paneer, peanuts; oats cancelled). The requested topic was used.
- Language: English narration and English captions only.

## Kept from the most recently accepted recipe (reference the code, not a library; no Three.js)
Renderer `production/30s/2026-11-06-english-06/source/render.mjs` (English peanut episode) copied with the food geometry swapped; unchanged: burin swell/taper, hatch families by tone, multiply washes under the ink, roundels on arcs with leaders, burnish transitions, ivory plate + ruled border + cut title ("PLATE IX · EGG · BOILED, THEN FRIED"), English captions (Inter Display Black 58 px, baselines 401 / 455), CTA seal with `assets/icon.png`, bookend cutaway above the seal, camera keys, stop motion 15 drawings/s. Voice: approved Meshline/Recall character (Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98) with the CalMeter phoneme override; audio: accepted quiet `mix.py`.

## Episode-specific choices
- **Immediate hook:** an engraved whole egg is cut by a knife at ~0.7 s and the halves part; burnish to a large halved boiled-egg cutaway (shell rim, white with cool shade, layered yolk).
- **Oil as an ingredient, not a verdict:** a pan appears; a measuring teaspoon (labelled "1 level tsp oil = 4.5 g") pours a thin golden pool; an egg fries in it; "+ up to 40 kcal". Bars show the mechanism: protein egg 6.3 g "+ 0 g from oil"; energy egg 78 kcal + an oil block "+ up to 40". A generic engraved ingredient ledger (not an app screen) writes "1 large boiled egg · 50 g · 78 kcal" and "+ cooking oil, 1 level tsp · 4.5 g · ≤ 40 kcal", "measured, not guessed". "Up to" is used because not every drop of oil leaves the pan with the egg; no preparation is called good or bad.
- **Fixes during QA:** murky oil (multiply over grey) → translucent gold over a lighter pan floor; label moved inside x 950; still holds at the end of the CTA → slower bookend re-cut plus a yolk glint in the final second; a "1 tsp" handle label now appears only after the spoon arrives.

## Final script (67 words; Kokoro Meshline blend)
| Take | Start | Text |
|---|---|---|
| T0 | 0.30 s | One large boiled egg: about seventy-eight calories and six grams of protein. |
| T1 | 6.30 s | Fry it with one measured teaspoon of oil, and that teaspoon adds up to forty calories. |
| T2 | 12.40 s | The protein stays about six grams; the extra energy comes from the oil, an ingredient of its own. |
| T3 | 20.00 s | So measure the oil, and log it next to the egg instead of guessing. |
| T4 | 26.30 s | Track your food and nutrition with CalMeter. |

ASR timing pass (faster-whisper base.en): verbatim (CTA read via the accepted CAL-meter override).

## Source-to-claim mapping (retrieved 2026-11-06)
| Claim | Value | Source |
|---|---|---|
| one large boiled egg ≈ 78 kcal | 155 kcal/100 g × 50 g = 77.5 | USDA FDC **173424** "Egg, whole, cooked, hard-boiled" (SR Legacy, NDB 01129); SR28 WEIGHT "1 large = 50 g" |
| ≈ 6 g protein (6.3 g) | 12.58 g/100 g × 50 g = 6.29 | FDC 173424 |
| one measured (level) teaspoon of oil = 4.5 g | 4.5 g | SR28 WEIGHT NDB 04044 "Oil, soybean, salad or cooking" (also canola 04582, olive 04053): "1 tsp = 4.5 g" |
| that teaspoon adds up to 40 kcal; 0 g protein | 884 kcal/100 g × 4.5 g = 39.8; protein 0 | USDA FDC **171411** "Oil, soybean, salad or cooking" (canola FDC 172336 also 884 kcal) |
| the protein stays about six grams | frying adds no protein; USDA fried large egg (46 g) also 6.3 g protein | FDC 173423 "Egg, whole, cooked, fried" (cross-check) |

## Storyboard (30 fps; `production/30s/2026-11-06-english-07/source/timeline.json`)
| Beat | Time | Plate action | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–1.9 s | Whole egg engraved fast; knife cuts it; halves part showing white + yolk | One large / boiled egg: | burin, slice |
| Boiled egg | 1.3–5.9 s | Burnish to the halved-egg cutaway; roundels "78 kcal · 1 large egg · 50 g" and "6.3 g protein · white + yolk" | ≈ 78 kcal · 6 g protein / (1 large egg, 50 g) | page, ticks |
| Fry | 5.9–12.2 s | Burnish to the pan; measuring teaspoon pours one level tsp (4.5 g); golden pool spreads; egg fried in it (lacy edge, sizzle bubbles); "+ up to 40 kcal · 1 tsp oil · 884 kcal / 100 g" | Fry it with 1 measured tsp / of oil: up to +40 kcal | pour, sizzle |
| What changes | 12.3–19.5 s | Bars: Protein egg 6.3 g "+ 0 g from oil"; Energy egg 78 kcal + gold oil block "+ up to 40" | Protein stays ≈ 6 g; / the extra energy is the oil | tick |
| Log it | 19.9–25.9 s | Engraved ingredient ledger: egg line, then oil line written; green tick; "measured, not guessed" | Measure the oil, / log it next to the egg | pencil, tick |
| CTA | 25.7–30 s | Halved egg re-cut above the engraved CalMeter seal; yolk glint in the final second | Track your food and nutrition / with CalMeter | pencil, bed fades |
