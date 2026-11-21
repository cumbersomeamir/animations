# QA: CalMeter English 30 s english-23, does skim milk lose its calcium? "LESS CALCIUM?" (batch 23, 2026-11-21)

**Final output:** `videos/nutriai/production/30s/2026-11-21-english-23/nutriai-30s-english23-01.mp4`
sha256 `a6520df4c497ee53396e26b5e25caeb26ceb21dba1a997b42e0e6371d38fa829` · 17107538 bytes · status: final.
**Thumbnail (first-frame composition):** `nutriai-30s-english23-thumbnail.png` (1080×1920 RGB, sha256 `c02512e689024aedb89f02e5f324744ccb9202067ca1b5b5605437d1e414e37f`): the frame-0 scene full bleed, "LESS" (white) / "CALCIUM?" (yellow) up to 200 px; text ink x 137–939, y 342–708 (a thumbnail has no caption band). **Exported first frame:** `qa/first-frame.png`.
Topic: the requested popcorn was english-12 and batch 22 was the pineapple → milk calcium (see `SOURCES.md`, `context/38`).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.1 LUFS integrated, LRA 4.3 LU, true peak −1.4 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 black events; 0 freeze events at the default threshold and 0 at the stricter n = 0.003 scan |
| First frame | Full-frame vivid mint scene: a big glass of milk with a cream layer and glowing calcium crystals, a giant spoon lifting the cream, the worried SKIM carton mascot waving beside it; headline "LESS CALCIUM?" (2 words, a question). Narration starts at 0.15 s; the headline exits at 2.8–3.1 s |
| Story timing | Hook 0–3.3 s; superhook 3.85–5.0 s (milk wave → "Let's skim a glass"); proof 5.6–9.5 s (fat globules rise into a cream layer, the spoon scoops it off, "CREAM LIFTS OFF"; crystals stay and glow, "CALCIUM STAYS", the SKIM carton relieved); proof 10.4–16.0 s (whip; two cups with crystal towers: "WHOLE ≈ 280 mg", then "SKIM ≈ 300 mg"); 17.0–20.2 s (whip; crystals stream into a bone and a tooth, the bone's mineral lattice glows, "BONES & TEETH"); payoff 22.0–24.9 s (milk wave; a cup pours into a five-slice day dial that fills past one slice, "OVER A FIFTH", cartons cheer); CTA 27.1–28.7 s (green wave, both cartons wave, CalMeter seal + white wordmark) |
| Brief / feedback | one headline at a time plus the current caption; two numbers (280 mg, 300 mg); captions 80 px (fit ≥ 60); five distinct scenes joined by two milk waves and two whip-pans plus a green-wave CTA; depth from bokeh, rays, foreground splash glows and big heroes; kinetic numbers, bounces, shakes; CTA "Track your nutrition with CalMeter." |
| Captions (`qa/text-bounds.txt`) | 1 053 caption runs, **0** outside x 100–900 / y 280–460 (ink x 126–874, y 291–459); ≤ 2 lines |
| Headlines / CTA | 663 label runs and 118 CTA runs, 0 outside x 100–940 / y 480–1450; CTA wordmark x 424–802, y 1308–1371. Carton tags "WHOLE"/"SKIM" are packaging art on the characters (logged as `art`) |
| Narration / caption sync (`qa/sync.txt`) | 21 of 22 caption lines within ±0.25 s by base.en word timestamps; "Track your nutrition" checked on the voice stem (caption 27.10 s, onset 27.14 s) → **22 of 22** within ±0.25 s |
| Intelligibility | small.en (`qa/asr-final-small.txt`): "Skim milk loses its fat. Does it lose its calcium too? Let's skim a glass and see. The cream rises and is lifted off, but the calcium stays in the milk. A cup of whole milk has about 280 milligrams of calcium. Skim has about 300. Calcium helps build and maintain healthy bones and teeth. So either cup gives more than a fifth of a day's calcium. Track your nutrition with Cal Meter." (verbatim). base.en (`qa/asr-final-mp4.txt`): same words (brand "calmetre"). Take pass: `qa/asr-takes.txt` (all takes verbatim on both models first time) |
| Audio balance (`qa/audio-balance.txt`, `qa/spectrogram.png`) | median voice-to-background 15.3 dB while speaking; 7 isolated 50 ms word-edge windows under 6 dB; background between lines median −35.7 dBFS; no clipping; no foley on a spoken number |
| Visual review | every 6th frame of the whole video (5 per second, 150 frames) inspected on sheets, then the changed regions again on the final encode; `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 0, 98, 104, 113, 122, 190, 206, 216, 251, 296, 302, 308, 358, 440, 458, 482, 488, 494, 569, 589, 630, 639, 648, 705, 800, 809, 818, 860, 899) |
| Facts | USDA SR Legacy FDC 171265, 171269, 170859, SR28 cup weights, MedlinePlus calcium, 21 CFR 101.9; see `SOURCES.md` |

## Issues found and fixed
1. Topic: popcorn was english-12 → milk calcium (unrelated to batch 22's pineapple in question, setting and mechanism).
2. Stills: cups scene undersized with thin towers → bigger cups, two-wide crystal towers drawn at one row per 40 mg; bone geometry read as a dumbbell → proper double-knob bone (outline-then-fill union); bone/tooth/glass enlarged; day-dial fill lacked contrast → darker dial, bright fill; payoff headline auto-shrank → "OVER A FIFTH".
3. Dense review: a sliver of the spoon showed at the right edge before it entered → starts further off-screen; the skim glass sat still during the setup → gentle bob; "WHOLE ≈ 280 mg" lingered 0.4 s into "Skim has about 300." → fades before it; CTA cartons enlarged; payoff hold given sparkles.
4. Bounds: "LESS" grazed y 480 during its exit pop → headline lowered 10 px; final 0 outside.

## Remaining limits (honest)
- Values are USDA averages for plain fluid milk (whole with vitamin D, skim with A and D); "about 280/300" are rounded; "more than a fifth" = 21–23 % of the US Daily Value.
- "The calcium stays in the milk" summarises the USDA data (skim ≥ whole per 100 g; cream lower); the rising cream and the spoon are an illustration of skimming, not the industrial separator.
- Machine checks only: ASR, voice-stem onsets, audio-level analysis, spectrogram and frame sheets. No human watched or listened to the video.
