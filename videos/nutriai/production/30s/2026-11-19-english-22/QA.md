# QA: CalMeter English 30 s english-22, what's really inside a pineapple, "MORE THAN SWEET" (batch 22, 2026-11-19)

**Final output:** `videos/nutriai/production/30s/2026-11-19-english-22/nutriai-30s-english22-01.mp4`
sha256 `23977ea7e6e06c1eb790f20a07cbe2a6e2fbef1b90f7ecbbcc95306a593deef2` · 19301424 bytes · status: final.
**Thumbnail (first-frame composition):** `nutriai-30s-english22-thumbnail.png` (1080×1920 RGB, sha256 `59e87e5224570fab2e11da0df750f68a221f6385d37808a290c39c8120f7fc29`): the frame-0 theatre full bleed, "MORE THAN" (yellow) / "SWEET" (white) up to 205 px; text ink x 138–938, y 356–677 (a thumbnail has no caption band). **Exported first frame:** `qa/first-frame.png`.
Topic: the requested mango was production #01 → pineapple (see `SOURCES.md`, `context/37`).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 3.0 LU, true peak −1.4 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 black events; 0 freeze events at the default threshold and 0 at the stricter n = 0.003 scan (a first export froze in the CTA; fixed, see below) |
| First frame | Full-frame tiny theatre: velvet side curtains and valance in the foreground, spotlights, floorboards; a pineapple mascot (eyes, smile, waving arms, spiky crown) with its belly doors open on a glowing golden world; headline "MORE THAN SWEET" (3 words). Narration starts at 0.15 s; the headline exits at 2.5–2.9 s |
| Story timing | Hook 0–3.0 s; superhook 3.2–5.8 s (crown pops off, the peel falls away in strips, the core slides out; zoom-dive into the gold); build 6.05–20.9 s (the mascot walks a braided fibre path, "1.4 g FIBRE", "AIDS DIGESTION"; velvet curtain change; the vitamin C star rises through a trapdoor, "48 mg"; whip to "COLLAGEN" with the helix weaving to skin and a blood vessel, then "+ IRON" into a cell); payoff 21.3–26.0 s (a measuring cup fills with chunks inside a ring that fills to 88 %, "1 CUP ≈ 80 mg"); CTA 27.1–28.7 s (curtains close, the mascot bows, confetti, CalMeter seal) |
| Brief / feedback | one headline at a time plus the current caption; three numbers (1.4 g, 48 mg, 80 mg); captions 80 px (fit ≥ 60); five distinct scenes joined by a zoom-dive, a velvet curtain change and two whip-pans; foreground depth (curtains, valance, juice sacs, floorboards); squash/bounce, shakes, kinetic numbers, flowing particles; CTA "Track your nutrition with CalMeter." |
| Captions (`qa/text-bounds.txt`) | 1 020 caption runs, **0** outside x 100–900 / y 280–460 (ink x 127–873, y 291–459); ≤ 2 lines |
| Headlines / CTA | 800 label runs and 114 CTA runs, 0 outside x 100–940 / y 480–1450 (kept off the right-side and bottom platform controls); CTA wordmark x 424–802, y 1308–1371 |
| Narration / caption sync (`qa/sync.txt`) | 20 of 23 caption lines within ±0.25 s by base.en word timestamps; the other 3 checked on the voice stem/word list ("and step inside." 4.73 s vs 4.73 s; "48 mg of vitamin C." 13.13 s vs onset 13.28 s; "Track your nutrition" 27.10 s vs onset 27.14 s) → **23 of 23** within ±0.25 s |
| Intelligibility | small.en (`qa/asr-final-small.txt`): "Sweet, sure, but what's really inside a pineapple? Skip the crown, peel and core, and step inside. First, a fiber path, 1.4 grams per hundred, and fiber aids digestion. Next, the star, 48 milligrams of vitamin C. Your body uses it to make collagen for skin and blood vessels, and to absorb iron. One cup of chunks, about 80 milligrams, nearly a full day's vitamin C. Track your nutrition with Cal Meter." (verbatim). base.en (`qa/asr-final-mp4.txt`): same words ("1 .4", brand "calmetre"). Take pass: `qa/asr-takes.txt` |
| Audio balance (`qa/audio-balance.txt`, `qa/spectrogram.png`) | median voice-to-background 15.9 dB while speaking; background between lines median −36 dBFS; no clipping; no foley on a spoken number |
| Visual review | every 6th frame of the whole video (5 per second, 150 frames) inspected on sheets, then the changed regions again on the final encode; `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 0, 92, 106, 121, 130, 150, 159, 168, 236, 309, 336, 346, 356, 394, 454, 460, 466, 504, 545, 589, 622, 628, 634, 680, 740, 806, 812, 840, 899) |
| Facts | USDA SR Legacy FDC 169124 (+ variety records), SR28 refuse and cup weight, MedlinePlus, 21 CFR 101.9; see `SOURCES.md` |

## Issues found and fixed
1. Topic: mango was production #01 → pineapple (never covered).
2. Voice: speech ran 26.6 s → T1, T2, T5 tightened (24.3 s); "Then the star" was heard as "than the star" → "Next, the star" (verbatim on both models). New CTA take for the new wording, same voice and CalMeter phoneme override.
3. Stills: frame-0 mascot too small → enlarged and the stage lowered; fibre path and walker too thin/small → thicker braid, bigger walker; collagen/iron scene sparse → bigger helix, skin, vessel, cell and iron beads; the walker collided with "AIDS DIGESTION" → walk ends lower.
4. Bounds: "MORE THAN", "AIDS DIGESTION" and "1 CUP ≈ 80 mg" grazed the label zone during pop + push-in → fitted; final 0 outside.
5. Freeze: the end card froze 0.8 s (strict scan: more) once the curtains closed → drifting spotlight, falling confetti (below the caption band), the mascot bobbing and waving between bows; now 0 events.
6. Transition bug: the zoom-dive translated to y 1335 but back by 1240, shifting the zoom and ghosting the mascot's face over the golden world → fixed, outgoing scene fades sooner. A flow-particle glow showed at the path start before the path existed → hidden until the path is drawn.
7. Sync: "and step inside." moved to its spoken "and" (4.73 s); the helix sprinkle moved off "Your body" and lowered.

## Remaining limits (honest)
- Vitamin C varies by variety; the "all varieties" USDA average is used (notes and publishing caption say so). "Nearly a full day's" = 88 % of the US Daily Value.
- The fibre path, star, helix, skin, vessel, cell and iron are symbols; the ring is drawn to 88 %.
- Machine checks only: ASR, voice-stem onsets, audio-level analysis, spectrogram and frame sheets. No human watched or listened to the video.
