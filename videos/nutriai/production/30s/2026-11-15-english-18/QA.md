# QA: CalMeter English 30 s english-18, what's really inside a passion fruit, "JEWELS YOU CAN EAT" (2026-11-15, batch 18)

**Final output:** `videos/nutriai/production/30s/2026-11-15-english-18/nutriai-30s-english18-01.mp4`
sha256 `99695057dd692ea1abede9353deaa4b5988904837016a0e6c629d124b98c3864` · 13251758 bytes · status: final (2026-11-15).
**Thumbnail:** `nutriai-30s-english18-thumbnail.png` (1080×1920 RGB, sha256 `fc91a2a3…75aa`): the frame-0 composition full bleed, "JEWELS" (210 px, yellow) / "YOU CAN EAT" (118 px, white), outlined, over two passion fruit halves with floating seed sacs; text inside x 102–975, y 356–689.
Topic: the requested pomegranate was already production #03; passion fruit chosen (see `SOURCES.md`). Built to `context/25-feedback-rules-2026-11-11.md` incl. the 2026-11-15 first-frame and full-frame addenda.

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.5 LU, true peak −1.5 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 black events; 0 freeze events at the default threshold and 0 at the stricter n = 0.003 scan |
| First frame | Full-frame purple scene (no card, logo, fade or empty setup): two passion fruit halves full of golden seed sacs, sacs floating between them, sparkles; text on frame 0 = "JEWELS", "YOU CAN EAT" (4 words). Narration starts at 0.15 s with the same words; the headline carries them and fades as captions start at "what's" (1.35 s), so caption and headline never repeat each other |
| Format (feedback 2026-11-15) | No cream card or boxed diagram anywhere: five full-bleed backgrounds (purple hook, amber shell, coral energy, green fibre, violet payoff), one big engraved hero per scene, one nutrient reveal at a time, outlined white/yellow labels 72–172 px, white outlined captions, white CTA wordmark |
| Story timing | Hook 0–3.1 s; portion 3.5–7.9 s (half the fruit is shell: the pulp is scooped onto a scale, 18 g, "½ SHELL", "PULP"); energy 8.4–13.3 s (100 g bowl: 97 kcal; a spoonful = 1 fruit: ≈ 17 kcal); fibre 13.8–19.6 s (giant seed-sac close-up "SEEDS TOO"; 10 g fibre / 100 g; an apple rolls in, 2.4 g, "× 4"); payoff 20.6–26.4 s (whole fruit, ≈ 17 kcal and ≈ 2 g fibre per fruit; the fruit splits into pulp and empty shell, "LOG THE PULP"); CTA 27.1–29.4 s |
| Captions (`qa/text-bounds.txt`) | 509 caption runs, **0** outside x 100–900 / y 230–1500 (ink x 131–869, y 356–494); ≤ 2 lines; 64 px auto-fit centred on x 500 |
| Plate labels | 1 211 runs, 0 outside x 100–980 / y 480–1500 (ink x 126–942, y 558–1471); CTA wordmark x 434–797, y 1336–1402 |
| Narration / caption sync (`qa/sync.txt`) | 17 of 18 caption lines within ±0.25 s of the spoken word (14 within ±0.10 s), using base.en word timestamps; "Track your food…" +0.38 s is ASR drift after the pause (the voice track is silent until 27.10 s, when take and caption start together) |
| Intelligibility | small.en, text only (`qa/asr-final-small.txt`): "Jewels you can eat. What's really inside a passion fruit? About half is shell. One fruit gives just 18 grams of pulp and seeds. Per hundred grams, that's 97 calories, so one fruit has about 17. The seeds are eaten too, and the pulp carries 10 grams of fiber per hundred. Four times an apple. So one fruit adds about 17 calories and 2 grams of fiber. Log the pulp, not the shell. Track your food and nutrition with Calmeter." It then appends "For more information, visit www.calmeter.com", a Whisper hallucination over the closing music (the voice track is silent from 29.4 s; nothing is spoken there). small.en with word timestamps raised an alignment IndexError on this file (with and without VAD), hence the text-only run. base.en with VAD (`qa/asr-final-mp4.txt`): same words except "Jewels" heard as "Jules" and the brand as "cow meter". No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 30, 70, 104, 160, 190, 246, 300, 360, 392, 430, 490, 552, 580, 604, 660, 700, 752, 830, 890); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA SR Legacy FDC 169108 and 171688, SR28 refuse and household weight; calculations in `research/passion-fruit-calculations.txt`; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states purple passion fruit, raw, and 1 fruit without shell = 18 g |

## Issues found and fixed
1. Topic overlap: pomegranate was production #03 → passion fruit with the same hook words and story criteria.
2. Narration ran 23.3 s and left a long silence before the CTA → the payoff line states both per-fruit values (17 kcal, 2 g fibre) and the takeaway.
3. Frame 0 left empty space above and below → halves, floating sacs and headline enlarged; the payoff fruit enlarged and raised clear of the CTA seal.
4. "½ SHELL" crossed x 100 during a camera push-in → moved inward and slightly smaller.
5. The caption and the frame-0 headline would have repeated "Jewels you can eat" → the headline carries those words and captions begin at "what's".

## Remaining limits (honest)
- "One fruit" is USDA's household passion fruit (18 g edible); fruits vary.
- The fibre comparison is per 100 g (an apple serving is far larger than one passion fruit); the narration says "per hundred".
- The seed-sac close-up, bowls and spoon are drawings, not to scale with each other.
- Narration and caption timing are checked by ASR only; frames by machine-rendered sheets. No human watched or listened.
