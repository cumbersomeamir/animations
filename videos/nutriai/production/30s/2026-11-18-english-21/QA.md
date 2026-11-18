# QA: CalMeter English 30 s english-21, one coconut, two foods: coconut water vs coconut meat, "WATER OR MEAT?" (batch 21, 2026-11-18)

**Final output:** `videos/nutriai/production/30s/2026-11-18-english-21/nutriai-30s-english21-01.mp4`
sha256 `df208971436e393f4436873d1204bd97bfcd83e30a80cd6cd3b023a10414ce4a` · 17265465 bytes · status: final (2026-11-18).
**Thumbnail:** `nutriai-30s-english21-thumbnail.png` (1080×1920 RGB, sha256 `54ecb92a78fcf8d73853e3ece1274c17858e54f667e83d234cd72ee97ba84d9f`): the frame-0 composition full bleed, "WATER OR" (yellow) / "MEAT?" (white) up to 210 px outlined, over the cracked coconut character (water-filled half with a face, lid flying off, splash, palm fronds); text ink x 119–956, y 423–787 (`qa/text-bounds-thumbnail.txt`; a thumbnail has no caption band, so it is checked against x 100–980 / y 230–1500).
**First frame:** `qa/first-frame.png`.
Topic: the requested roasted vs cooked chickpeas was english-10 → coconut water vs coconut meat (see `SOURCES.md`, `context/36`).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.9 LU, true peak −1.5 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 black events; 0 freeze events at the default threshold and 0 at the stricter n = 0.003 scan |
| First frame | Full-frame coral scene, no logo, fade or empty setup: a cracked coconut character (half full of water, eyes and smile), the lid flying off, water splashing, palm fronds in the foreground; frame-0 text = "WATER OR MEAT?" (3 words, a question). Narration starts at 0.15 s; the headline exits at 1.5–1.9 s as the second caption begins |
| Story timing | Hook 0–3.5 s; superhook 3.75–8.0 s (the coconut cracks, its water pours into a glass on a scale, 206 g, ≈ 40 kcal; its meat chunks fly into a bowl, 397 g, ≈ 1,400 kcal); proof 8.35–14.0 s (a glass of coconut water fills a scale to 100 g; a bracket marks 95 % water; JUST 19 kcal); proof 14.25–18.9 s (a meat chunk lands on a scale, 100 g; water drops squeeze into one beaker, ½ WATER; fat drops into another, ⅓ FAT; 354 kcal); payoff 19.2–26.0 s (a calorie balance: a 45 g piece tips it, ≈ 160 kcal; glasses land one by one until it levels at 3½); CTA 27.1–29.4 s |
| Feedback applied (context/34) | captions 84 px (fit ≥ 66 px; measured ink y 333–521); numbers 116–150 px, smallest sublabel 56 px; five full-bleed colour scenes joined by whip-pans (motion blur + speed lines); turning rays, drifting bokeh and swaying palm fronds for depth; squash-and-stretch landings, impact shakes, crack burst, pouring stream, squeezing chunk, tipping balance; kinetic numbers; playful characters (coconut, glass, meat chunk) |
| Captions (`qa/text-bounds.txt`) | 1 055 caption runs, **0** outside x 100–900 / y 230–1500 (ink x 130–870, y 333–521); ≤ 2 lines |
| Plate labels | 2 711 runs, 0 outside x 100–980 / y 480–1500 (ink x 109–967, y 527–1478); CTA wordmark x 427–805, y 1388–1451 |
| Narration / caption sync (`qa/sync.txt`) | 23 of 26 caption lines within ±0.25 s by base.en word timestamps on the final MP4; the other 3 checked on the voice stem/take: "354 kcal." caption 17.60 s vs voice onset 17.52 s (small.en 17.64 s); "Track your food" 27.10 s vs voice onset 27.14 s (both ASR models place it before any voice exists, i.e. drift after the pause); "and nutrition" 27.73 s vs 27.74 s from the take → **26 of 26** within ±0.25 s |
| Intelligibility | small.en, text only (`qa/asr-final-small.txt`): "One coconut, two foods, which part packs the calories. It's water, about 40 calories. It's meat, about 1,400. Per 100 grams, coconut water is 95% water, just 19 calories. The meat is only half water, and a third of it is fat, 354. So one small piece, 45 grams, is about 160, as much as three and a half glasses of coconut water. Track your food and nutrition with Cal Meter." (verbatim apart from the "Its/It's" homophone and the question read as a statement). base.en with VAD (`qa/asr-final-mp4.txt`): same words, "3 .5 glasses", brand "cow meter" (the known base.en reading of the cached CTA take). Take-level pass: `qa/asr-takes.txt`. No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 98, 104, 112, 120, 140, 190, 212, 238, 246, 256, 320, 384, 412, 420, 432, 455, 505, 532, 564, 572, 590, 660, 712, 740, 812, 899: every whip-pan and every number pop); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA SR Legacy FDC 170174 and 170169 (cross-check 174831), SR28 household weights; calculations in `research/coconut-calculations.txt`; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states fresh water/raw meat of a mature coconut and that a glass = 1 cup (240 g) |

## Issues found and fixed
1. Topic overlap: the requested chickpea comparison was english-10 → coconut water vs meat (never covered).
2. Stills: the flying lid crossed the caption zone → new exit path; "WATER"/"MEAT" tags collided with the scales and "kcal" touched the glass → label stack and scales re-laid; the straw poked into the number label → shorter straw; the "95%" marker was an arbitrary line → a bracket over the water column above the thin sugar band; the meat chunk read as a thin arch → chunkier slab, bigger face; balance contents were tiny → larger piece and glasses; "≈ 1,400" collided with the cup → cup lifts before the meat flies.
3. Bounds: the hook headline's exit overshoot, two scale readouts during the 1,400 kick, "≈ 1,400", "95%", "½ WATER", "⅓ FAT", "≈ 160" and three "100 g" readouts grazed the margins under the push-in + kicks → moved/fitted; final 0 outside. Thumbnail headline 2 px past x 100 → fitted.
4. Sync: "354 kcal." was placed 0.2 s before the voice onset (its take timestamp had collapsed) → moved to 17.60 s; the QA aligner now treats ASR "It's" as "Its".
5. Foley: tick, juice and clinks moved/lowered so none sits on a spoken number.

## Remaining limits (honest)
- "One coconut" uses USDA's typical per-coconut household weights (206 g water; 397 g meat of a medium coconut); they are separate averages, so "about 40" and "about 1,400" describe a typical mature coconut, not one measured nut. Coconuts vary.
- "Half water" (47 %) and "a third fat" (33.5 %) are rounded; the glass is 1 US cup (240 g); 3½ glasses is 3.49.
- Packaged coconut waters differ (unsweetened ready-to-drink 18 kcal/100 g in USDA; sweetened products not covered).
- Beakers, droplets, characters and the calorie balance are symbols, not to scale.
- Narration and caption timing are checked by ASR and the voice stem only; frames by machine-rendered sheets. No human watched or listened.
