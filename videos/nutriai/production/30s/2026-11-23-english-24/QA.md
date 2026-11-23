# QA: CalMeter English 30 s english-24, carrots: what does the orange turn into? "ORANGE INTO WHAT?" (batch 24, 2026-11-23)

**Final output:** `videos/nutriai/production/30s/2026-11-23-english-24/nutriai-30s-english24-01.mp4`
sha256 `0009d80e12216af2a4496bbcba4c9998e16a8874ac618cc02c3cdc1608047da1` · 16493058 bytes · status: final.
**Thumbnail (first-frame composition):** `nutriai-30s-english24-thumbnail.png` (1080×1920 RGB, sha256 `f760076f9cd85ca6acb797e279bcd084febe8d9c5761ea3b9a903368d4f62160`): the frame-0 garden full bleed, "ORANGE" (white) / "INTO WHAT?" (yellow) up to 210 px; text ink x 136–938, y 366–727 (a thumbnail has no caption band). **Exported first frame:** `qa/first-frame.png`.
Topic: the requested potato overlapped english-11 and the water/oil mechanisms; batch 23 was milk → carrots and vitamin A (see `SOURCES.md`, `context/39`).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 3.2 LU, true peak −1.5 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 black events; 0 freeze events at the default threshold and 0 at the stricter n = 0.003 scan |
| First frame | Full-frame garden cross-section: a sunrise sky over layered soil with pebbles, roots and a worm; a big glowing carrot mascot (face, arms, leafy top) underground; headline "ORANGE INTO WHAT?" (3 words, a question). Narration starts at 0.15 s; the headline exits at 2.9–3.3 s |
| Story timing | Hook 0–3.0 s; superhook 3.55–5.3 s (the carrot pops out of the soil with flying dirt, lands; a big eye opens in the sky on "eyes"); build 5.6–15.6 s (dive into the carrot's orange: beta-carotene chains, "BETA-CAROTENE"; a friendly enzyme snips each chain into glowing halves, "VITAMIN A"; whip to a night garden: vitamin A flows into an eye, "EYE PIGMENTS", then the garden, fence and cat light up, "SEE IN LOW LIGHT"); proof 16.0–21.1 s (iris out of the pupil to a sunny board: carrot sticks drop, a day battery charges past 90 %, "OVER 90% OF A DAY"); payoff 21.45–25.9 s (the sticks slide away, the carrot mascot lies on the board, the battery settles at 57 %, "1 CARROT OVER HALF A DAY"); CTA 27.1–28.7 s (a soil wave rises, the carrot waves among sprouts, CalMeter seal + white wordmark) |
| Brief / feedback | one headline at a time plus the current caption; two large numbers (90 %, and "half"); captions 80 px (fit ≥ 60); four distinct scenes joined by a zoom-dive, a whip-pan and an iris out of the pupil, plus a soil-wave CTA; depth from soil layers, foreground worm, parallax cells and silhouettes; pop, landing shake, snips, glows, kinetic numbers; CTA "Track your nutrition with CalMeter." |
| Captions (`qa/text-bounds.txt`) | 1 092 caption runs, **0** outside x 100–900 / y 280–460 (ink x 126–874, y 291–459); ≤ 2 lines |
| Headlines / CTA | 871 label runs and 118 CTA runs, 0 outside x 100–940 / y 480–1450; CTA wordmark x 424–802, y 1308–1371 |
| Narration / caption sync (`qa/sync.txt`) | 20 of 25 caption lines within ±0.25 s by base.en word timestamps; the other 5 verified on the voice stem / word list (aligner or ASR artifacts: hyphenated "beta-carotene", a repeated "vitamin", a collapsed timestamp, the line's spoken "A hundred", the post-pause CTA) → **25 of 25** within ±0.25 s. One real defect was found this way and fixed: "covers more than half." was 0.5 s early |
| Intelligibility | small.en (`qa/asr-final-small.txt`): "A carrot's orange isn't just color. What does it turn into? Part of the answer is in your eyes. The orange is beta-carotene, and your body converts it into vitamin A. Vitamin A, in turn, makes pigments in your eyes that help you see in low light. A hundred grams of raw carrot gives more than 90% of a day's vitamin A. And one medium-sized carrot, about 60 grams, covers more than half. Track your nutrition with Cal Meter." (verbatim). base.en (`qa/asr-final-mp4.txt`): same words ("100 grams", brand "calmetre"). Take pass: `qa/asr-takes.txt` |
| Audio balance (`qa/audio-balance.txt`, `qa/spectrogram.png`) | median voice-to-background 15.1 dB while speaking; 8 isolated 50 ms word-edge windows under 6 dB; background between lines median −36.0 dBFS; no clipping; no foley on a spoken number |
| Visual review | every 6th frame of the whole video (5 per second, 150 frames) inspected on sheets, then the changed region again on the final encode; `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 0, 98, 104, 112, 126, 142, 160, 166, 172, 190, 262, 280, 305, 311, 384, 430, 450, 462, 471, 480, 564, 650, 700, 760, 800, 809, 818, 860, 899) |
| Facts | USDA SR Legacy FDC 170393 (cross-check 168568), SR28 medium-carrot weight and refuse, MedlinePlus vitamin A, 21 CFR 101.9; see `SOURCES.md` |

## Issues found and fixed
1. Topic: the potato proposal overlapped english-11 and the water/oil mechanisms → carrots and vitamin A (different from batch 23's milk in question, setting and mechanism).
2. Voice: "Vitamin A makes…" lost the "A" on both ASR models → "Vitamin A, in turn, makes…"; "One medium carrot" was heard as "carat" by base.en → "And one medium-sized carrot…" (both verbatim on base.en and small.en).
3. Stills: frame-0 carrot enlarged; after the pop the carrot hid the sky eye → it hops left, the eye opens on the right; molecules thinner than readable → five larger chains, bigger enzyme; single-line battery headlines auto-shrank → two-line headlines; "OF A DAY" touched the battery and the enzyme brushed "BETA-CAROTENE" → moved.
4. Bounds: four headlines grazed y 480 at the pop peak → lowered; final 0 outside.
5. Sync: "covers more than half." was 0.5 s early (take-level ASR placed "covers" too soon) → retimed to the stem onset; "OVER HALF A DAY" moved onto "half".
6. Dense review: the landed carrot's leaves brushed the second caption line → it lands lower and smaller; the dive zoomed on the frame centre while the carrot stood left → zoom now centred on the carrot.

## Remaining limits (honest)
- Values are USDA averages for raw carrots; vitamin A is given as RAE (USDA's conversion of carotenoids); how much a person converts varies; "a day's" is the US Daily Value.
- The snip of one chain into two halves symbolises conversion; the eye, night garden and battery are illustrations.
- Machine checks only: ASR, voice-stem onsets, audio-level analysis, spectrogram and frame sheets. No human watched or listened to the video.
