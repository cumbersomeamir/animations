# 26 — Production 30 s, english-12 (2026-11-11): popcorn: big bowl, small kernels (English)

Output: `videos/nutriai/production/30s/2026-11-11-english-12/nutriai-30s-english12-01.mp4` and thumbnail `.../nutriai-30s-english12-thumbnail.png`. QA + hashes: `.../QA.md`. Sources: `.../SOURCES.md` (+ `research/`). Publishing caption: `.../publishing-caption.txt`. Rules: `25-feedback-rules-2026-11-11.md` (first episode built to them).

## Pre-checks
- Repo `cumbersomeamir/animations`, branch `claude-video/nutriai`, in sync with origin at `78bec1c` (english-11 potato) before edits; account per session context (info@tensorblue.com). No render/ffmpeg/TTS/ASR process was running; nothing older was unfinished.
- Topic history: popcorn had never been covered (mango, guava, pomegranate, papaya, orange, chickpeas ×2, paneer, peanuts, egg + oil, raisins, avocado, potato + butter; oats cancelled). The proposed topic was used.
- Design inspection (actual assets, not guessed): `production/30s/2026-11-06-english-07/qa/contact-sheet.png` (egg) and `production/30s/2026-11-08-english-09/qa/transitions.png` (avocado) show one large hero food per scene, real transformations (knife cut, pour, fry; balance, morphing jars) and big roundel numbers; english-10/11 had moved to tables, ledgers and many small labels. No "dragonfruit" episode or asset exists in this app's history, so nothing was taken from it.
- No engagement was inferred from any promoted post.

## What changed from english-11 (only these)
- Composition: back to one big hero per scene (bursting kernel → bowl on a scale → one cut-open kernel → the same bowl taking oil, butter, sugar → plain vs topped), large one-word labels shown one at a time, kcal in a big roundel, grams on a big scale display.
- No plate rules, plate title or on-screen source line (sources stay in the notes); the ivory card has a soft drop shadow for depth; warm glow behind the burst; soft shadows under objects.
- Motion: burst flashes and rays, popcorn rain, steam and pressure arrows, hull halves flying, foam growth, pour and sprinkle, roundel pops with scale bounce, camera kicks on impacts, slow push-ins through the toppings and payoff scenes.
- Captions: 64 px auto-fit, centred on x 500 inside x 100–900, rise-in; English only.
- Sound: added original synthesized pop, popping run, pour and sprinkle to `mix.py`; bed, ducking and loudness unchanged.
- Kept: engraving burin, washes, burnish transitions, ivory paper, palette, Meshline voice, cached CTA take, CalMeter seal.

## Final script (81 words; Kokoro Meshline blend)
| Take | Start | Beat | Text |
|---|---|---|---|
| T0 | 0.20 s | hook | Three cups of popcorn: just twenty-four grams. |
| T1 | 2.95 s | super hook | So how does a kernel get so big? |
| T2 | 4.75 s | mechanism | Inside, a drop of water turns to steam, bursts the hull, and puffs the starch into a light foam. |
| T3 | 11.05 s | proof | So three cups, air-popped: about ninety calories. |
| T4 | 14.15 s | build-up | Popped in oil, one sixty-five; with a tablespoon of butter, two sixty-five; a tablespoon of sugar, over three hundred. |
| T5 | 22.25 s | payoff | Same bowl, more than triple: count the grams and the toppings, not the size. |
| T6 | 27.10 s | CTA | Track your food and nutrition with CalMeter. |

## Facts (measured / calculated / illustrative)
- Measured: air-popped 1 cup = 8 g, 385 kcal/100 g (USDA FNDDS FDC 2708219; SR Legacy 167959 agrees: 8 g, 387 kcal); oil-popped 1 cup = 11 g, 498 kcal/100 g (FNDDS 2708221); butter 717 kcal/100 g, 1 tbsp = 14.2 g (SR 173410); sugar 387 kcal/100 g, 1 cup = 200 g (SR 169655); popping near 180 °C, pressure-vessel rupture, starch foam eight times less dense (Virot & Ponomarenko 2015).
- Calculated: 3 cups air-popped = 24 g ≈ 92 kcal; oil-popped 33 g ≈ 164; + 1 tbsp butter ≈ 266 (47 g); + 1 tbsp sugar ≈ 315 (60 g); 3.4×.
- Illustrative: one tablespoon each of butter and sugar as the topping amounts.

## Storyboard (30 fps; `production/30s/2026-11-11-english-12/source/timeline.json`)
| Beat | Time | Plate action | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–2.9 s | Kernel bursts at frame 0 over a bowl; popcorn rains in; "3 CUPS"; scale counts to 24 g | 3 cups of popcorn: / just 24 g | popping, tick |
| Super hook | 2.9–4.6 s | One kernel lifts out and grows; big red "?" | So how does a kernel / get so big? | tick |
| Mechanism | 4.3–10.8 s | Burnish to one big cut-open kernel: WATER drop → HEAT ≈ 180 °C with steam and pressure arrows, cracks → POP! hull halves fly → LIGHT FOAM grows → 8× LESS DENSE | Inside, a drop of water / turns to steam, · bursts the hull, / and puffs the starch · into a light foam | page, drip, pop, popping |
| Proof | 10.8–14.1 s | Burnish to the bowl on the scale: AIR-POPPED, 24 g, roundel ≈ 90 kcal | So 3 cups, air-popped: / ≈ 90 kcal | page, tick |
| Build-up | 14.1–22.0 s | Same 3-cup bowl: + OIL (33 g, ≈ 165), + BUTTER poured from a tablespoon (47 g, ≈ 265), + SUGAR sprinkled (60 g, 300+) | Popped in oil: ≈ 165 kcal / + 1 tbsp butter: ≈ 265 · + 1 tbsp sugar: / over 300 | pour, tick, pour, tick, sprinkle, tick |
| Payoff | 22.0–26.8 s | Burnish to plain vs topped bowls: ≈ 90 / 24 g vs 300+ / 60 g, ×3+ arrow, scales glow, "SAME SIZE" | Same bowl, / more than triple: · count grams + toppings, / not the size | page, tick, pencil |
| CTA | 26.9–30 s | CalMeter seal + wordmark under the bowls; wordmark shine; slow push-in | Track your food and nutrition / with CalMeter | pencil, bed fades |
