# 39 — Production 30 s, english-24 (batch 24, 2026-11-23): carrots, what does the orange turn into? "ORANGE INTO WHAT?" (English)

Output: `videos/nutriai/production/30s/2026-11-23-english-24/nutriai-30s-english24-01.mp4` and thumbnail `.../nutriai-30s-english24-thumbnail.png`. QA + hashes: `.../QA.md`. Sources: `.../SOURCES.md` (+ `research/`). Publishing caption: `.../publishing-caption.txt`. Rules: `25-feedback-rules-2026-11-11.md` (incl. the 2026-11-19 addendum) + `34-continuation-2026-11-18.md`.

## Brief (as received 2026-11-23, summarised)
TOPIC "The same potato: boiled, baked and fried": playful food characters compare equivalent edible potato portions; water loss changes density and oil adds energy; sourced composition, a simple weighed example, at most two large numbers; no diet guarantees, moralising or disclaimer clutter. Read all prior topic records including batch 23's actual subject; different core question, visual setting and mechanism; if covered, choose an unrelated subject in the fixed genre (not another version) and record why. Use the current remote branch and latest production context; batch 23 complete; generate only english-24. CTA "Track your nutrition with CalMeter."; captions y 280–460; one headline plus caption; vital info off the right/bottom controls.

## Pre-check
Remote `claude-video/nutriai` at `6149353` (english-23); nothing pending or checkpointed.

## Topic decision
- The potato proposal overlaps actual history: potato = english-11 (a medium baked potato + butter toppings); water loss concentrating energy = english-08 (raisins), english-10 (roasted chickpeas), english-13 (rice), english-17 (watermelon); added oil/fat = english-07 (egg + oil), english-11 (butter), english-12 (popcorn).
- Batch 23's actual subject: milk calcium (skimming; a mineral for bones; dairy world).
- Chosen: **carrots and vitamin A** — never covered. New core question (what does a colour become?), new mechanism (a plant pigment, beta-carotene, converted by the body into vitamin A, which makes eye pigments for low light), new setting (garden cross-section → pigment world → night garden → sunny board). Two large numbers: "over 90 %" (100 g) and "over half" (one carrot).

## Design
1. Hook (frame 0 = thumbnail): garden cross-section; a big glowing carrot mascot underground, a worm buddy; "ORANGE INTO WHAT?".
2. The carrot pops out with flying dirt and lands; a big eye opens in the sky on "eyes".
3. Zoom-dive into the carrot: beta-carotene chains ("BETA-CAROTENE"); a friendly enzyme snips each into glowing halves ("VITAMIN A").
4. Whip to a dim night garden: vitamin A flows into an eye ("EYE PIGMENTS"); the garden, fence and cat light up ("SEE IN LOW LIGHT").
5. Iris out of the pupil to a sunny board: sticks drop, the day battery charges past 90 % ("OVER 90% OF A DAY"); the sticks slide away, the carrot lies on the board, the battery settles at 57 % ("1 CARROT OVER HALF A DAY").
6. CTA: a soil wave rises; the carrot waves among sprouts; CalMeter seal + white wordmark.

## Final script (Kokoro Meshline blend; CTA = cached english-22 take)
| Take | Start | Text |
|---|---|---|
| T0 | 0.15 s | A carrot's orange isn't just colour. What does it turn into? |
| T1 | 3.55 s | Part of the answer is in your eyes. |
| T2 | 5.60 s | The orange is beta-carotene, and your body converts it into vitamin A. |
| T3 | 10.70 s | Vitamin A, in turn, makes pigments in your eyes that help you see in low light. |
| T4 | 16.00 s | A hundred grams of raw carrot gives more than ninety percent of a day's vitamin A. |
| T5 | 21.45 s | And one medium-sized carrot, about sixty grams, covers more than half. |
| T9 | 27.10 s | Track your nutrition with CalMeter. |

## Facts
USDA SR Legacy FDC 170393 raw carrots: 835 µg RAE vitamin A, 8,280 µg beta-carotene per 100 g; medium = 61 g edible → 509 µg; US DV 900 µg RAE → 92.8 % and 56.6 %. MedlinePlus vitamin A: carotenoids are plant pigments the body converts into vitamin A; vitamin A produces retinal pigments and promotes good eyesight, especially in low light.

## Engine notes
Same engine as english-22/23 plus an `iris` transition (the next scene opens out of the eye's pupil) and a soil-wave CTA; new characters: carrot mascot (tapered root, leafy top, face, arms), worm, beta-carotene chain with a snip-to-vitamin-A state, enzyme helper, big eye with a glowing retina, night garden silhouettes that gain colour, day battery. QA note: when take-level ASR word times look odd, confirm caption timing against the voice stem (this caught a 0.5 s early caption here).
