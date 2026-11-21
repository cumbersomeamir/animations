# 38 — Production 30 s, english-23 (batch 23, 2026-11-21): does skim milk lose its calcium? "LESS CALCIUM?" (English)

Output: `videos/nutriai/production/30s/2026-11-21-english-23/nutriai-30s-english23-01.mp4` and thumbnail `.../nutriai-30s-english23-thumbnail.png`. QA + hashes: `.../QA.md`. Sources: `.../SOURCES.md` (+ `research/`). Publishing caption: `.../publishing-caption.txt`. Rules: `25-feedback-rules-2026-11-11.md` (incl. the 2026-11-19 addendum) + `34-continuation-2026-11-18.md`.

## Brief (as received 2026-11-21, summarised)
TOPIC "How popcorn gets huge without creating more calories": a corn-kernel mascot bursts into a popcorn cloud; expansion adds volume, oil adds energy; sourced plain air-popped nutrition by edible weight and a weighed portion; only two readable numbers; honest oil-vs-plain comparison; no 100 g-vs-cup confusion or weight-loss promises; frame 0 "BIGGER. NOT MORE FOOD."; CTA "Track your nutrition with CalMeter." Read ALL prior topic records including batch 22's actual replacement subject; this batch needs a different core question, visual setting and mechanism; if the proposal was covered, choose an unrelated subject in the fixed genre, not another version of the topic, and record why. Finish checkpointed batch 22 first.

## Order of work
Batch 22 (pineapple) was rendered but not yet committed when this brief arrived → finished first (QA notes, sources, context/37, the 2026-11-19 feedback addendum), committed and pushed at `a50ed37`, attached; then batch 23.

## Topic decision
- Popcorn = english-12 (`26-production-30s-english12-popcorn.md`, 2026-11-11): the same question (a big bowl from small kernels), the same mechanism (steam bursts the hull, starch foam) and the same oil/butter/sugar comparison (3 cups 24 g ≈ 90 kcal air-popped). Covered.
- Batch 22's actual subject: the pineapple (fruit mascot in a theatre; fibre path; vitamin C; a cup of chunks).
- Chosen: **milk calcium, whole vs skim** — never covered (only an idea in `08`). Different core question (does removing fat remove a mineral?), different setting (a vivid dairy world, carton mascots, a glass, a spoon, crystal towers, a bone and a tooth, a day dial; milk-wave transitions), different mechanism (skimming separates fat; calcium stays; calcium builds and maintains bones and teeth). Two numbers only (≈ 280 mg, ≈ 300 mg); the payoff is in words ("over a fifth of a day").

## Design
1. Hook (mint; frame 0 = thumbnail): a giant spoon lifts the cream off a glass of milk full of glowing calcium crystals; the worried SKIM carton beside it; "LESS CALCIUM?".
2. Milk wave → sky: fat globules rise into a cream layer; the spoon scoops it off ("CREAM LIFTS OFF"); the crystals stay and glow ("CALCIUM STAYS"); the SKIM carton pops in relieved.
3. Whip → lavender: WHOLE and SKIM cartons with cups; two-wide crystal towers grow (one row per 40 mg): "WHOLE ≈ 280 mg", then "SKIM ≈ 300 mg" (one headline at a time).
4. Whip → coral: crystals stream from a glass into a bone (its mineral lattice glows) and a tooth (sparkles): "BONES & TEETH".
5. Milk wave → sunny: a cup pours into a five-slice day dial that fills past one slice: "OVER A FIFTH"; both cartons cheer.
6. CTA: a CalMeter-green wave rises; both cartons wave; crystals and bubbles float; seal + white wordmark.

## Final script (Kokoro Meshline blend; CTA = cached english-22 take)
| Take | Start | Text |
|---|---|---|
| T0 | 0.15 s | Skim milk loses its fat. Does it lose its calcium too? |
| T1 | 3.85 s | Let's skim a glass and see. |
| T2 | 5.60 s | The cream rises and is lifted off, but the calcium stays in the milk. |
| T3 | 10.40 s | A cup of whole milk has about two hundred eighty milligrams of calcium. |
| T4 | 14.60 s | Skim has about three hundred. |
| T5 | 17.00 s | Calcium helps build and maintain healthy bones and teeth. |
| T6 | 22.00 s | So either cup gives more than a fifth of a day's calcium. |
| T9 | 27.10 s | Track your nutrition with CalMeter. |

## Facts
USDA SR Legacy: whole milk with vitamin D FDC 171265 (113 mg calcium / 100 g; cup 244 g → 275.7 mg), skim with A and D FDC 171269 (122 mg; cup 245 g → 298.9 mg), heavy cream FDC 170859 (66 mg / 100 g); US DV calcium 1,300 mg → 21.2 % and 23.0 %; MedlinePlus: calcium "helps form and maintain healthy teeth and bones".

## Engine notes
Same engine as english-22 (captions 80 px in y 280–460, label/CTA zone x 100–940 / y 480–1450, kinetic numbers, whips) plus a `wave` transition (liquid wave with a wavy edge and droplets, rising then draining) and a liquid-wave CTA; new characters: milk carton (gable top, band tag, face, arms), milk glass with cream layer and crystals, spoon, calcium crystal, bone (outline-then-fill union), tooth, day dial.
