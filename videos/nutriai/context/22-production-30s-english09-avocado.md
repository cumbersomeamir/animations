# 22 — Production 30 s, batch 2026-11-08-english-09: avocado vs cucumber, 100 g edible portion each (English)

Output: `videos/nutriai/production/30s/2026-11-08-english-09/nutriai-30s-english09-01.mp4`. QA + hash: `production/30s/2026-11-08-english-09/QA.md`. Sources: `.../SOURCES.md`. Publishing caption (English, matches the final transcript): `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks
- Repo `cumbersomeamir/animations`, branch `claude-video/nutriai`, in sync with origin at `4d458c9` (english-08 raisins) before edits; account per session context (info@tensorblue.com). No render/ffmpeg/TTS/ASR process was running; nothing older to finish.
- Topic history: avocado and cucumber appear only as ideas in `08-educational-strategy.md` (items 4–5), never produced (episodes: mango, guava, pomegranate, papaya, orange, chickpeas, paneer, peanuts, egg + oil, raisins; oats cancelled). The requested topic was used.
- The Instagram App Performance sheet itself is not in this repo or chat; its approved direction was applied as stated in the brief (visible hook in the first second, concrete payoff, one short CTA). No causal claims are drawn from it.
- Language: English narration and English captions only.

## Kept from the most recently accepted recipe (no Three.js)
Renderer `production/30s/2026-11-07-english-08/source/render.mjs` reused for the shared parts (burin, washes, balance, burnish transitions, ivory plate + ruled border + cut title "PLATE XI · AVOCADO & CUCUMBER", English captions Inter Display Black 58 px at baselines 401 / 455, CTA seal with `assets/icon.png`, wordmark shine, camera keys with the slow closing push-in, stop motion 15 drawings/s). Voice: approved Meshline/Recall character (Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98); the CTA is the cached accepted take (byte-identical to english-06/07/08). Audio: accepted quiet `mix.py`.

## Episode-specific choices
- **Immediate hook:** frame 0 shows a balance with a peeled avocado half falling; a 100 g cucumber piece lands at 0.7 s; the beam is level ("same weight"); "? kcal" turns into ≈ 160 vs ≈ 15 kcal with a "≈ 10×" seal.
- **Breakdown in grams:** two equal 100 g jars. Avocado: water 73 · fibre 6.7 · other 5 · fat 14.7 g (fat and fibre outlined as they are spoken). Cucumber: water 95 g, with fat 0.1 · fibre 0.5 · other 4 g on leaders. A dashed "? kcal" cucumber jar waits until its turn.
- **Why:** the same jars turn into kcal — water × 0 (droplets leave), fat × ≈ 9: avocado stays tall (fat ≈ 123 + rest ≈ 37 = 160 kcal), cucumber collapses to 15 kcal; rule chips "1 g fat ≈ 9 kcal", "1 g water = 0".
- **Portion takeaway, neither is bad:** a calorie balance: 100 g avocado tips it until ≈ 1 kg (3½) cucumbers pile on and it levels: "100 g avocado ≈ 160 kcal = ≈ 1 kg cucumber". No food is called good or bad; no disclaimer beat.

## Final script (71 words; Kokoro Meshline blend)
| Take | Start | Text |
|---|---|---|
| T0 | 0.30 s | A hundred grams of avocado, a hundred of cucumber: same weight, about ten times the calories. |
| T1 | 6.30 s | Avocado: about a hundred sixty calories, fifteen grams of fat, seven of fiber. |
| T2 | 11.45 s | Cucumber: about fifteen calories, and ninety-five percent water. |
| T3 | 15.35 s | Fat packs about nine calories a gram; water has none. |
| T4 | 18.75 s | Neither is bad: calorie for calorie, a hundred grams of avocado equals about a kilo of cucumber. |
| T5 | 26.30 s | Track your food and nutrition with CalMeter. |

ASR timing pass on the takes (faster-whisper base.en): verbatim (CTA read via the accepted CAL-meter override).

## Source-to-claim mapping (retrieved 2026-11-08)
| Claim | Value | Source |
|---|---|---|
| avocado ≈ 160 kcal, 15 g fat, 7 g fibre, 73 g water per 100 g flesh | 160; 14.7; 6.7; 73.2 | USDA FDC **171705** "Avocados, raw, all commercial varieties" (SR Legacy, NDB 09037) |
| cucumber ≈ 15 kcal, 95 % water, 0.1 g fat, 0.5 g fibre per 100 g with peel | 15; 95.2; 0.11; 0.5 | USDA FDC **168409** "Cucumber, with peel, raw" (SR Legacy, NDB 11205) |
| about ten times the calories | 10.7× | both |
| fat ≈ 9 kcal/g; water 0 | general Atwater factor 9.0 (USDA fat factor for both foods 8.37) | FAO FNP 77 §3.5.1; FDC conversion factors |
| avocado fat ≈ 123 of 160 kcal | 14.7 × 8.37 | FDC 171705 |
| 100 g avocado ≈ 1 kg (3½) cucumbers in kcal | 1 067 g; 1 cucumber (8¼") = 301 g | FDC 171705, 168409; SR28 WEIGHT 11205 |

## Storyboard (30 fps; `production/30s/2026-11-08-english-09/source/timeline.json`)
| Beat | Time | Plate action | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–5.9 s | Balance; avocado half and cucumber piece land; level beam; "? kcal" → ≈ 160 / ≈ 15 kcal; "≈ 10×" seal | 100 g avocado, / 100 g cucumber: · same weight, / ≈ 10× the calories | pencil, thud, tick |
| Avocado | 5.9–11.2 s | Burnish to two 100 g jars; avocado jar fills (water, fibre, other, fat); "160 kcal"; dashed cucumber jar "? kcal" | Avocado ≈ 160 kcal, / 15 g fat, 7 g fibre | page, tick |
| Cucumber | 11.3–15.2 s | Cucumber piece + slice; its jar fills: water 95 g, tiny fat/fibre/other on leaders; "15 kcal" | Cucumber ≈ 15 kcal, / and 95% water | tick |
| Why | 15.3–18.5 s | Jars turn from grams into kcal: water drains out, fat swells; avocado 160 vs cucumber 15 kcal; "1 g fat ≈ 9 kcal", "1 g water = 0" | Fat ≈ 9 kcal a gram; / water has none | juice |
| Portion | 18.5–25.9 s | Calorie balance: avocado tips it; 3½ cucumbers pile on until level; "100 g avocado ≈ 160 kcal = ≈ 1 kg cucumber" | Neither is bad: / calorie for calorie, · 100 g avocado / ≈ 1 kg of cucumber | page, thud, tick |
| CTA | 25.9–30 s | CalMeter seal + wordmark below the balance; cucumber glint, wordmark shine, slow push-in | Track your food and nutrition / with CalMeter | page, pencil, bed fades |
