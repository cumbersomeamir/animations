# QA: CalMeter English 30 s english-19, what's really inside a kiwi, "WHAT'S INSIDE?" (2026-11-17, batch 19)

**Final output:** `videos/nutriai/production/30s/2026-11-17-english-19/nutriai-30s-english19-01.mp4`
sha256 `68a6e548eedaa111c574e38ef89d75ffa6ee8fdbe8b9dfd2bcc4aa3f33327830` · 12813850 bytes · status: final (2026-11-17).
**Thumbnail:** `nutriai-30s-english19-thumbnail.png` (1080×1920 RGB, sha256 `999e8cbb…477b`): the frame-0 composition full bleed, "WHAT'S" (yellow) / "INSIDE?" (white), 200 px outlined, over a fuzzy whole kiwi beside a cut half; text inside x 130–946, y 360–734.
Topic: the requested guava was already production #02; green kiwi chosen (see `SOURCES.md`). Built to `context/25-feedback-rules-2026-11-11.md` incl. the 2026-11-15 first-frame and full-frame addenda.

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.1 LUFS integrated, LRA 2.4 LU, true peak −1.4 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 black events; 0 freeze events at the default threshold and 0 at the stricter n = 0.003 scan |
| First frame | Full-frame raspberry scene (no card, logo, fade or empty setup): a fuzzy brown kiwi beside a big cut half (green sunburst, black seed ring, cream core), sparkles; text on frame 0 = "WHAT'S INSIDE?" (2 words). Narration starts at 0.15 s; the headline fades at 1.7 s as the caption "what's really inside a kiwi?" appears |
| Format | Five full-bleed bright scenes (raspberry hook, sky 100 g, violet vitamin C, orange one kiwi, teal payoff); one big engraved hero and one nutrient reveal at a time; outlined white/yellow labels 50–200 px; white outlined captions; white CTA wordmark; no cream card or boxed diagram |
| Story timing | Hook 0–3.1 s; 100 g 3.5–8.9 s (five slices drop onto a scale, 100 g; 61 kcal; 3 g fibre); vitamin C 9.4–14.8 s (tubes fill beside a kiwi slice and an orange slice: 93 mg vs 53 mg); one kiwi 15.9–20.2 s (a peeled kiwi lands on a scale, 69 g, ≈ 42 kcal); payoff 20.7–25.7 s (a daily-value ring fills around a turning slice to ≈ 70 %, "US DAILY VALUE", "LOG THE GRAMS"); CTA 27.1–29.4 s |
| Captions (`qa/text-bounds.txt`) | 517 caption runs, **0** outside x 100–900 / y 230–1500 (ink x 134–866, y 356–494); ≤ 2 lines; 64 px auto-fit centred on x 500 |
| Plate labels | 1 057 runs, 0 outside x 100–980 / y 480–1500 (ink x 165–914, y 561–1490); CTA wordmark x 434–797, y 1336–1402 |
| Narration / caption sync (`qa/sync.txt`) | 16 of 17 caption lines within ±0.25 s (13 within ±0.10 s), base.en word timestamps; "Track your food…" +0.50 s is ASR drift after the pause (the voice track is silent until 27.10 s, when take and caption start together) |
| Intelligibility | small.en, text only (`qa/asr-final-small.txt`): "Fuzzy brown outside, what's really inside a kiwi? A hundred grams of the green flesh has just 61 calories and three grams of fiber. Its standout is vitamin C, 93 milligrams, more than an orange's 53. One peeled kiwi is about 69 grams, about 42 calories, and about 70% of the daily value for vitamin C. Log the grams you eat. Track your food and nutrition with Cal Meter." (verbatim; no trailing hallucination). small.en with word timestamps raised an alignment IndexError on this file, hence text only. base.en with VAD (`qa/asr-final-mp4.txt`): same words ("It's standout"; brand heard as "cow meter"). No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 30, 60, 100, 140, 200, 250, 276, 320, 380, 440, 462, 500, 560, 604, 620, 660, 740, 830, 890); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA SR Legacy FDC 168153 and 169097, SR28 refuse and household weight, 21 CFR 101.9(c)(8)(iv); calculations in `research/kiwi-calculations.txt`; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states green kiwi, raw, peeled and that the daily value is the US DV (90 mg) |

## Issues found and fixed
1. Topic overlap: guava was production #02 → green kiwi (same genre: calories, fibre, vitamin C per 100 g).
2. Stills: a "PEELED" label collided with the scale → removed (the narration and the readout carry it); the daily-value ring label settles on "≈ 70%" to match the spoken "about seventy" (exact 71 %).
3. Captions: "of the daily value for vitamin C." was auto-shrunk → split into two lines.
4. Bounds: "KIWI" / "ORANGE" reached y 1515 at the pop-in peak with a camera kick → tubes, slices and labels moved up.
5. Accuracy: the daily value is the US Daily Value (21 CFR 101.9) → on-screen label "VITAMIN C · US DAILY VALUE"; notes and publishing caption say so.

## Remaining limits (honest)
- "One kiwi" is USDA's 2-inch fruit (69 g edible); fruits vary. Values are USDA averages for raw green kiwi.
- The narration says "the daily value"; the on-screen label and the notes specify the US Daily Value (90 mg); other countries use different reference intakes.
- The vitamin C tubes are a milligram scale (93 vs 53 of one height), not volumes; slices, peeled kiwi and ring are drawings.
- Narration and caption timing are checked by ASR only; frames by machine-rendered sheets. No human watched or listened.
