# 40 — Production 30 s, english-25 (batch 25, 2026-11-27): apples, what's in the peel? "WHAT'S IN THE PEEL?" (English)

Output: `videos/nutriai/production/30s/2026-11-27-english-25/nutriai-30s-english25-01.mp4` and thumbnail `.../nutriai-30s-english25-thumbnail.png`. QA + hashes: `.../QA.md`. Sources: `.../SOURCES.md` (+ `research/`). Publishing caption: `.../publishing-caption.txt`. Rules: `25-feedback-rules-2026-11-11.md` (incl. the 2026-11-19 addendum) + `34-continuation-2026-11-18.md`.

## Brief (as received 2026-11-27, summarised)
Topic "Why a spoon of tahini packs so much energy": playful tactile sesame characters become tahini; compare equal weights with verified data; distinguish serving size from energy density; CalMeter branding and CTA. Read the actual delivered topic history incl. replacements and the latest context/feedback; if the mechanism was covered, choose an unrelated subject in the same genre and record the change. Preserve the visual skill, branding, voice and music; authoritative sources; 30.000 s 1080×1920 H.264/yuv420p + AAC; English voice and captions only; strong truthful frame 0 and thumbnail; hook 0–3 s, proof through 21 s, payoff by 27 s, short CTA; one idea per shot, minimal large text; captions y 280–460; vital content off the bottom/right UI; free tools only; check free disk early; commit/push only new work; no social publishing.

## Pre-check
Remote `claude-video/nutriai` at `d4cf872` (english-24); working tree clean; nothing pending. Disk: 22 GB free of the allowance at the start (no cleanup needed; source `build/` folders and scratchpad intermediates are deletable if space runs short).

## Topic decision
- The tahini mechanism (a seed/nut paste: spoon serving vs per-gram energy density, fat ≈ 9 kcal/g) overlaps actual history: english-06 (peanuts vs peanut butter, the same 30 g, a level vs a heaped spoon), english-15 (honey vs sugar, spoon volume vs weight) and the fat-density episodes english-09 (avocado), english-16 (chocolate), english-20 (pistachios) and english-21 (coconut meat).
- Batch 24's actual subject: carrot vitamin A (a pigment converted by the body; garden, night eye).
- Chosen: **apple peel fibre** — never covered (an apple appeared only as the 2.4 g fibre comparator in english-18). New core question (what goes in the bin with the peel?), new mechanism (fibre concentrated in a thin outer layer that peeling discards), new setting (barbershop → weigh-in stage → skin close-up → digestion slide → kitchen). Equal-weight comparison kept from the brief's spirit: 100 g skin-on vs 100 g peeled.

## Design
1. Hook (frame 0 = thumbnail): a barbershop; the apple mascot in the barber chair eyes a curl of its peel; a moustached barber peeler mid-stroke; a bin on the left; "WHAT'S IN THE PEEL?".
2. "Wait." → the peeler recoils, "!"; "throwing away?" → the camera pushes toward the bin, its lid flips open. "Let's compare" → the peeler whirls round the apple, the peel comes off in one coil and flies into the bin; the peeled apple blushes.
3. Whip to a weigh-in stage: twin scales, 100 g of skin-on wedges and 100 g of peeled wedges; fibre bundles fly into two gauges: "2.4 g" vs "1.3 g".
4. Dive into the skin: a red band packed with a woven fibre mesh over sparser flesh, "IN THE SKIN". Vertical whip to a digestion slide: food blobs glide, swept by fibre brooms, "AIDS DIGESTION".
5. Peel-ribbon wipe to a kitchen: a medium apple and its gauge "4.4 g"; the peeler whirls; the gauge drains while the peel glows green → "2.1 g", "HALF THE FIBRE"; the peel goes into the bin.
6. CTA: a red circle wipe trimmed with a peel ribbon; the apple (skin on) waves inside a turning peel ring; CalMeter seal + white wordmark.

## Final script (Kokoro Meshline blend; CTA = cached english-22/24 take)
| Take | Start | Text |
|---|---|---|
| T0 | 0.15 s | Peeling an apple? Wait. What are you throwing away? |
| T1 | 3.45 s | Let's compare, gram for gram. |
| T2 | 5.55 s | A hundred grams of apple with its skin has two point four grams of fibre. |
| T3 | 10.50 s | The same hundred grams, peeled, has just one point three. |
| T4 | 14.55 s | Much of the fibre sits in that thin skin. |
| T5 | 17.10 s | And fibre aids digestion, helping keep you regular. |
| T6 | 20.90 s | So peel a medium apple, and about half its fibre goes with the peel. |
| T9 | 27.10 s | Track your nutrition with CalMeter. |

## Facts
USDA SR Legacy FDC 171688 apples, raw, with skin: 2.4 g fibre / 100 g (n = 29), medium 3-inch = 182 g → 4.37 g; FDC 171689 without skin: 1.3 g / 100 g (n = 4), medium 3-inch = 161 g → 2.09 g; peeling removes 2.28 g = 52 %; SR28 refuse: skin 13 % of the whole fruit. MedlinePlus Fiber (review 7/22/2026): "Fiber aids digestion and helps prevent constipation"; "Taking the peels off fruits and vegetables reduces the amount of fiber you get from the food."

## Engine notes
Same engine as english-22..24 plus: a vertical whip (`whipV`), a diagonal peel-ribbon wipe, a twisting `ribbon()` (red skin side / cream underside) and a helix `coilPts()` for peel coils, the apple mascot (peel progress, shoulder patch, shy hands-on-cheeks pose), the barber peeler (upright face on a rotated handle), a bin with a hinged lid, wedge "boats", glass fibre gauges drawn to scale, a catmull-rom slide path. New synthesized foley `zip` (peeler whirl). Bed transposed down a major third and 1 dB quieter. QA additions in `source/`: `qa_stem.py` (voice-stem onsets for ASR-flagged lines) and `qa_audio.py` (voice vs background). Lesson: wiggly green "fibre" bits read as worms on fruit; use straight bundles.
