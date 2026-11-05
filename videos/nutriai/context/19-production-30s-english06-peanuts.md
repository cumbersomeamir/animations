# 19 — Production 30 s, batch 2026-11-06-english-06: peanuts vs peanut butter, the same 30 g (English)

Output: `videos/nutriai/production/30s/2026-11-06-english-06/nutriai-30s-english06-01.mp4`. QA + hash: `production/30s/2026-11-06-english-06/QA.md`. Sources: `.../SOURCES.md`. Publishing caption (English, matches the final transcript): `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks
- Repo `cumbersomeamir/animations`, branch `claude-video/nutriai`, in sync with origin at `46a58de` (feedback-05 paneer) before edits; account per session context (info@tensorblue.com). No render/ffmpeg/TTS process was running.
- Topic history: peanuts / peanut butter had not been covered (episodes: mango, guava, pomegranate, papaya, orange, chickpeas, paneer; oats cancelled). The requested topic was used.
- Language override applied: **English narration and English captions only**; no Hindi audio or text reused.

## Kept from the accepted recipe (reference the code, not a library; no Three.js)
- Renderer: `production/30s/2026-11-03-round-02/source/render.mjs` (English papaya episode) copied with the food geometry swapped; unchanged: burin swell/taper, hatch families, multiply washes under the ink, roundels on arcs with leaders, balance vignette, burnish transitions, ivory plate + ruled border + cut title ("PLATE VIII · PEANUTS & PEANUT BUTTER"), English captions (Inter Display Black 58 px, baselines 401 / 455, line 1 ink, line 2 leaf-dark), CTA seal with `assets/icon.png`, camera keys, stop motion 15 drawings/s.
- Voice: the approved Meshline/Recall character — Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 (cached model) — with the verified CalMeter phoneme override `kˈælmˌiːtɚ`. Audio: the accepted quiet `mix.py` (chord bed + air, no beat, event foley, ducking, loudnorm −15 LUFS / −1.5 dBTP).

## Episode-specific choices (this episode only)
- **Immediate hook:** a balance with 30 g of peanuts and a 30 g spoonful of peanut butter is level by ~0.5 s; "? kcal" tags and pulse rings on "Which has more calories?".
- **Food cutaway:** a cracked peanut pod (shell section with reticulated fibres, a whole red-skinned kernel, a split kernel with its germ and fat droplets), with "≈ 50 % fat by weight (USDA)".
- **Real labelled product:** an engraved jar carries the actual ingredient list of SKIPPY Creamy Peanut Butter (Hormel Foods), USDA FoodData Central branded record 2674433; sugar, hydrogenated vegetable oil and salt are underlined and circled as they are spoken. The brand name is kept off the plate (the label text is shown, not the logo); it is named here and in `SOURCES.md`.
- **Portion vs heaped spoon:** USDA's peanut-butter measure is "2 tbsp = 32 g", so a level tablespoon ≈ 16 g; a level spoon balances a 16 g weight, then the spoon is heaped and tips the beam ("heaped spoon: more than 16 g", "weigh one heaped spoonful once"). No weight is claimed for a heaped spoon.
- **Motion fix:** the first export had four 0.8–1.3 s still holds; purposeful motion was added (beam settle, "? kcal" + pulse rings, sodium count-up and bar hatch, dotted level line and "extra above level", slower bookend re-cut of the cutaway under the CTA).

## Final script (64 words; Kokoro Meshline blend)
| Take | Start | Text |
|---|---|---|
| T0 | 0.25 s | Same thirty grams: peanuts or peanut butter. Which has more calories? |
| T1 | 5.10 s | Almost a tie, because peanuts are already about half fat by weight. |
| T2 | 9.70 s | The jar adds sugar, hydrogenated oil and salt; sodium jumps from two milligrams to about one hundred forty. |
| T3 | 18.30 s | Thirty grams is about two level tablespoons. A heaped spoon holds more, so weigh one once. |
| T4 | 26.40 s | Track your food and nutrition with CalMeter. |

Draft → final: the first T1 also spoke "about one hundred seventy-six versus one hundred seventy-eight" (7.2 s, speech total 27.4 s); the numbers stay on screen and T1 was shortened. ASR timing pass (faster-whisper base.en): verbatim except the accepted "calmetre" reading of the CalMeter override.

## Source-to-claim mapping (retrieved 2026-11-06)
| Claim | Value | Source |
|---|---|---|
| 30 g peanuts ≈ 176 kcal | 587 kcal/100 g × 0.30 = 176.1 | USDA FDC **173806** "Peanuts, all types, dry-roasted, without salt" (SR Legacy, NDB 16390) |
| 30 g peanut butter ≈ 178 kcal | 190 kcal / 32 g × 30 = 178.1 | USDA FDC **2674433** (Branded): SKIPPY Creamy Peanut Butter, Hormel Foods, GTIN 0037600110754, serving 32 g (2 Tbsp), 190 kcal, fat 16 g, sugars 3 g, sodium 150 mg |
| peanuts are already about half fat by weight | 49.7 g / 100 g | FDC 173806 |
| the jar adds sugar, hydrogenated oil and salt | ingredients "ROASTED PEANUTS, SUGAR, HYDROGENATED VEGETABLE OIL (COTTONSEED, SOYBEAN AND RAPESEED OIL) TO PREVENT SEPARATION, SALT" | FDC 2674433 |
| sodium: about 2 mg vs about 140 mg per 30 g | 6 mg/100 g × 0.30 = 1.8; 150 mg / 32 g × 30 = 140.6 | FDC 173806; FDC 2674433 |
| 30 g ≈ two level tablespoons; level tablespoon ≈ 16 g | "2 tbsp = 32 g" | USDA SR28 WEIGHT, NDB 16398 "Peanut butter, smooth style, without salt" (FDC 172470) |
| generic USDA peanut butter (cross-check, not on screen) | 598 kcal, 51.4 g fat, 10.5 g sugars / 100 g | FDC 172470 |

## Storyboard (30 fps; `production/30s/2026-11-06-english-06/source/timeline.json`)
| Beat | Time | Plate action | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–4.6 s | Balance cut; peanut kernels drop on the left pan, a spoonful of peanut butter on the right; level; "30 g / 30 g"; "? kcal" and pulse rings | Same 30 grams: / peanuts or peanut butter? → Which has / more calories? | burin, patter, thud |
| The tie | 4.5–9.2 s | Burnish to the cracked-pod cutaway; roundels "176 kcal / 30 g · PEANUTS" ≈ "178 kcal / 30 g · PEANUT BUTTER"; fat droplets glow; "≈ 50 % fat by weight (USDA)" | Almost a tie: 176 vs 178 / peanuts are ~half fat | ticks |
| The jar | 9.3–17.7 s | Burnish to the engraved jar with the real label; SUGAR, HYDROGENATED VEGETABLE OIL, SALT underlined and circled as spoken; sodium bars: 2 mg vs ≈ 141 mg (count-up, hatch) | The jar adds sugar, / hydrogenated oil and salt → Sodium per 30 g: / 2 mg → about 140 mg | ticks, page |
| Spoons | 17.7–25.5 s | Balance: a level spoon balances 16 g; the spoon is heaped and tips the beam; dotted level line, "extra above level"; "1 level tablespoon ≈ 16 g · 2 level ≈ 32 g, close to 30 g · heaped spoon: more than 16 g · weigh one heaped spoonful once" | 30 g ≈ 2 level / tablespoons (16 g each) → A heaped spoon holds more: / weigh one once | clink, thud |
| CTA | 25.5–30 s | The cutaway is re-cut above the engraved CalMeter seal (approved icon, cut wordmark, rule, milled edge) | Track your food and nutrition / with CalMeter | pencil, bed fades |
