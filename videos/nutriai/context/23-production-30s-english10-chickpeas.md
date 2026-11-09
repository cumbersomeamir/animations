# 23 — Production 30 s, batch 2026-11-09-english-10: cooked vs dry-roasted chickpeas (English)

Output: `videos/nutriai/production/30s/2026-11-09-english-10/nutriai-30s-english10-01.mp4`. QA + hash: `production/30s/2026-11-09-english-10/QA.md`. Sources and method: `.../SOURCES.md`. Publishing caption (English, matches the final transcript): `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks
- Repo `cumbersomeamir/animations`, branch `claude-video/nutriai`, in sync with origin at `0cb1b29` (english-09 avocado) before edits; account per session context (info@tensorblue.com). No render/ffmpeg/TTS/ASR process was running; no earlier accepted job was unfinished.
- Topic history: Hindi #04 (`17-production-30s-hindi04-chana.md`) covered cooked chickpeas alone (per 100 g and per cup, in Hindi). Roasting, water removal and snack portions were not covered, so the requested comparison was used; the cooked values are the same USDA source.
- The Instagram App Performance sheet itself is not in this repo or chat; its approved direction (visible hook in the first second, concrete payoff, one short CTA) was applied as stated in the brief. No analytics are quoted or inferred.
- Language: English narration and English captions only.

## Kept from the most recently accepted recipe (no Three.js)
Shared parts of `production/30s/2026-11-08-english-09/source/render.mjs` (burin, washes, balance, burnish transitions, ivory plate + ruled border + cut title "PLATE XII · CHICKPEAS: COOKED & ROASTED", English captions Inter Display Black 58 px at baselines 401 / 455, CTA seal with `assets/icon.png`, wordmark shine, camera with the closing push-in, stop motion 15 drawings/s). Chickpea glyph after the Hindi #04 chickpea (round body, curled beak, seam), now with a cooked → roasted parameter (pale gold and glossy → smaller, toasted, cracked). Voice: approved Meshline/Recall character (Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98); the CTA is the cached accepted take. Audio: accepted quiet `mix.py`.

## Episode-specific choices
- **Immediate hook:** frame 0 shows the balance with cooked chickpeas falling; 100 g cooked vs 100 g roasted (about 2.3× as many pieces) land by 0.8 s, beam level; "? kcal" turns into 164 vs ≈ 380 kcal with a "> 2×" seal.
- **Mechanism:** a tray of cooked chickpeas roasts on a kitchen scale under a heating bar: steam and droplets leave, the scale counts 100 g → ≈ 42 g, the water gauge falls 60 % → < 10 %, the chickpeas toast; "164 kcal" and "8.9 g protein" boxes get "same" stamps.
- **Per 100 g:** kcal and protein bars; each roasted bar is built from ≈ 2.3 copies of the cooked bar; "100 g roasted = the chickpeas of ≈ 230 g cooked".
- **Snack portion:** 30 g roasted (dry, no oil) = ≈ 70 g cooked (boiled, no salt): the same chickpeas, paired one by one; both ≈ 115 kcal, ≈ 6 g protein. 30 g follows the usual label serving of roasted chickpea snacks (28–30 g).
- **Preparation labels:** "cooked · boiled, no salt" and "roasted · dry, no oil" on every comparison.

## Final script (75 words; Kokoro Meshline blend)
| Take | Start | Text |
|---|---|---|
| T0 | 0.30 s | A hundred grams of cooked chickpeas, a hundred roasted: more than double the calories. |
| T1 | 5.25 s | Cooked ones are sixty percent water; roasting drives most of it off. |
| T2 | 9.35 s | So a hundred grams shrinks to under half, same calories, same protein. |
| T3 | 13.65 s | Per hundred grams, roasted has about three hundred eighty calories and twenty grams of protein. |
| T4 | 19.30 s | Snack tip: thirty grams roasted is about seventy grams cooked, around a hundred fifteen calories. |
| T5 | 26.30 s | Track your food and nutrition with CalMeter. |

ASR timing pass on the takes (faster-whisper base.en): verbatim.

## Source-to-claim mapping (retrieved 2026-11-09)
| Claim | Value | Source |
|---|---|---|
| cooked (boiled, no salt) 164 kcal, 8.9 g protein, 60 % water per 100 g | 164; 8.86; 60.2 | USDA FDC **173757** (SR Legacy, NDB 16057) |
| roasted (dry, no oil) ≈ 380 kcal, ≈ 20 g protein per 100 g | 379; 20.5 at ≈ 8 % water (371–400; 20.0–21.7 for 3–10 %) | FDC 173757 dry matter, cross-checked with FDC **173756** dried chickpeas (378 kcal, 20.5 g, 7.7 % water) and Foundation FDC 2644282 |
| 100 g cooked → under half (≈ 42 g) | 41–44 g | method |
| 30 g roasted ≈ 70 g cooked ≈ 115 kcal, ≈ 6 g protein | 68–73 g; 111–120 kcal; 6.0–6.5 g | method; serving size from USDA Branded Foods (28 g ×47, 30 g ×22 of 89 products) |

## Storyboard (30 fps; `production/30s/2026-11-09-english-10/source/timeline.json`)
| Beat | Time | Plate action | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–4.9 s | Balance; 100 g cooked vs 100 g roasted land; level; "? kcal" → 164 / ≈ 380; "> 2×" seal | 100 g cooked chickpeas, / 100 g roasted: · more than 2× the calories | pencil, patter, tick |
| Roast | 4.9–13.3 s | Burnish to a tray on a scale; heat, steam, droplets; 100 g → ≈ 42 g; water 60 % → < 10 %; "same" stamps on 164 kcal and 8.9 g | Cooked ≈ 60% water; / roasting drives most of it off · 100 g shrinks to under half, / same kcal, same protein | page, juice, ticks |
| Per 100 g | 13.3–18.9 s | Bars: cooked 164 kcal / 8.9 g; roasted built from ≈ 2.3 copies: ≈ 380 kcal / ≈ 20 g; "= the chickpeas of ≈ 230 g cooked" | Per 100 g roasted: / ≈ 380 kcal, ≈ 20 g protein | page, tick |
| Snack | 18.9–25.9 s | Dishes: 30 g roasted = ≈ 70 g cooked; both ≈ 115 kcal · ≈ 6 g protein; pieces paired one by one; slow push-in | Snack tip: 30 g roasted / ≈ 70 g cooked, ≈ 115 kcal | page, patter |
| CTA | 25.9–30 s | CalMeter seal + wordmark below the dishes; glint over the chickpeas, wordmark shine, push-in continues | Track your food and nutrition / with CalMeter | pencil, bed fades |
