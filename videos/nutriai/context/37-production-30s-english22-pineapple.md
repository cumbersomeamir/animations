# 37 — Production 30 s, english-22 (batch 22, 2026-11-19): what's really inside a pineapple, "MORE THAN SWEET" (English)

Output: `videos/nutriai/production/30s/2026-11-19-english-22/nutriai-30s-english22-01.mp4` and thumbnail `.../nutriai-30s-english22-thumbnail.png`. QA + hashes: `.../QA.md`. Sources: `.../SOURCES.md` (+ `research/`). Publishing caption: `.../publishing-caption.txt`. Rules: `25-feedback-rules-2026-11-11.md` (incl. the 2026-11-19 addendum written with this batch) + `34-continuation-2026-11-18.md`.

## Brief (as received 2026-11-19, summarised)
TOPIC "What is really inside a mango?": an original mango mascot opens a miniature juicy world, a visible fibre path and a vitamin C reveal; sourced per-100 g edible nutrition and a relatable portion; only two or three large numbers; accurate nutrient functions without miracle promises, shame or long disclaimers; frame 0 a mango opening like a tiny golden theatre, "MORE THAN SWEET". If already covered, choose a genuinely different subject and explain. Captions y ≈ 280–460; one short headline plus the current caption; vital information away from the right-side/bottom controls; CTA "Track your nutrition with CalMeter."; output `videos/nutriai/production/30s/2026-11-19-english-22/nutriai-30s-english22-01.mp4`.

## Topic decision
- Mango was production #01 (`12-production-30s-01.md`, 2026-11-02, USDA 169910: 60 kcal, 1.6 g fibre, 36 mg vitamin C), plus education pilot 01 and the 10 s style test → covered.
- Replacement: **pineapple** (never covered). Same brief structure: golden fruit mascot that opens like a theatre (the crown makes the marquee), a fibrous flesh for the fibre path, a strong vitamin C reveal (47.8 mg/100 g), what the nutrients do (MedlinePlus), a relatable portion (1 cup chunks, 165 g), "MORE THAN SWEET".
- Batch 20/21 were complete and pushed before this batch; nothing overwritten.

## Design (playful mascot theatre; scene choreography new, visual identity kept)
1. Theatre (frame 0 = thumbnail): velvet curtains/valance in the foreground, spotlights, floorboards; the pineapple mascot opens its belly doors on a glowing golden world; "MORE THAN SWEET".
2. Crown pops off, the peel falls in strips, the core slides out (one tag at a time: CROWN, PEEL, CORE); zoom-dive into the belly.
3. Golden juice world with parallax juice sacs: a braided fibre path draws itself and the mascot walks it; "1.4 g FIBRE" → "AIDS DIGESTION" (particles flow faster).
4. Velvet curtain change to an inner stage: the vitamin C star rises through a trapdoor; "48 mg · VITAMIN C · PER 100 g".
5. Whip: the star's sparks weave a collagen helix down to skin and a blood vessel ("COLLAGEN"); then iron beads escorted into a cell ("+ IRON").
6. Whip: a measuring cup fills with chunks inside a ring that fills to 88 % ("1 CUP ≈ 80 mg").
7. CTA: the curtains close, the mascot bows with confetti, CalMeter seal + white wordmark.

## Final script (Kokoro Meshline blend)
| Take | Start | Text |
|---|---|---|
| T0 | 0.15 s | Sweet, sure. But what's really inside a pineapple? |
| T1 | 3.20 s | Skip the crown, peel and core, and step inside. |
| T2 | 6.05 s | First, a fibre path: one point four grams per hundred, and fibre aids digestion. |
| T3 | 11.95 s | Next, the star: forty-eight milligrams of vitamin C. |
| T4 | 15.60 s | Your body uses it to make collagen for skin and blood vessels, and to absorb iron. |
| T5 | 21.30 s | One cup of chunks: about eighty milligrams, nearly a full day's vitamin C. |
| T9 | 27.10 s | Track your nutrition with CalMeter. (new take, phonemes `tɹˈæk jʊɹ njuːtɹˈɪʃən wɪð kˈælmˌiːtɚ.`; reuse it for later episodes) |

## Facts
USDA SR Legacy FDC 169124 per 100 g edible: 1.4 g fibre, 47.8 mg vitamin C (varieties: traditional 16.9, extra sweet 56.4); refuse 49 % (crown 16, parings 26, core 8); 1 cup chunks 165 g → 78.9 mg = 88 % of the 90 mg US DV. MedlinePlus: fibre aids digestion; vitamin C forms collagen (skin, tendons, ligaments, blood vessels) and aids iron absorption.

## Engine notes for the next episodes
Shared engine as english-20/21 (labels, kinetic numbers, bgScene, effects, whip compositor) plus, new here: captions 80 px at baselines 352/436 (band 280–460), transition types `dive` and `curtain`, velvet/stage set, CTA with continuous motion (confetti below the caption band) to avoid freeze flags, `qa_bounds.py` zones caption x 100–900 / y 280–460 and labels/CTA x 100–940 / y 480–1450, `audio-balance.txt` voice-to-background check.
