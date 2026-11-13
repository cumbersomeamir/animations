# QA: CalMeter English 30 s english-13, rice: water changed the number (2026-11-13)

**Final output:** `videos/nutriai/production/30s/2026-11-13-english-13/nutriai-30s-english13-01.mp4`
sha256 `29da899397de42f74cb2230d89daae8e6c151c811429ae184abe508b66a5e0f7` · 21476001 bytes · status: final (2026-11-13).
**Thumbnail:** `nutriai-30s-english13-thumbnail.png` (1080×1920 RGB, sha256 `864ce787…239b`): "WATER / CHANGED THE / NUMBER" over a 365 → 130 kcal/100 g arrow, a water drop, dry rice and a cooked bowl; words inside x 183–896, y 306–702.
Built to `context/25-feedback-rules-2026-11-11.md`.

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.1 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events at the default threshold and 0 at the stricter n = 0.003 scan |
| Story timing | Hook 0–4.2 s (a water drop splashes between dry and cooked rice at frame 0; 365 vs 130 kcal/100 g); super hook 4.3–5.9 s ("Did cooking burn calories off?" over a pot on a flame); build-up 6.1–12.4 s (50 g dry → pot → loupe on a swelling grain → 140 g cooked); proof 12.6–17.7 s (+ 90 g water, + 0 kcal, ≈ 180 kcal both); payoff 17.8–26.7 s (the mix-up ≈ 511 kcal, ≈ 3× too much; dry with dry, cooked with cooked); CTA 27.1–29.4 s |
| Captions (`qa/text-bounds.txt`) | 622 caption runs, **0** outside x 100–900 / y 230–1500 (ink x 134–866, y 356–494); ≤ 2 lines; 64 px auto-fit centred on x 500; blocks never overlap; nothing above y 230 |
| Plate labels | 2 598 runs: 0 above y 480, 0 off-frame, 0 right of x 980, 0 left of x 100, lowest y 1418; one brief label at a time |
| Narration / caption sync (`qa/sync.txt`) | 21 of 22 caption lines within ±0.17 s of the spoken word (17 within ±0.10 s); "Track your food…" (+0.70 s) is Whisper stretching "Track" over the pause (take placed at 27.10 s) |
| Intelligibility | ASR on the export (faster-whisper base.en, VAD, `qa/asr-final-mp4.txt`): "Rice per 100 grams, 365 dry, 130 cooked, did cooking burn calories off. 50 grams of dry rice soaks up about 90 grams of water and weighs about 140. Water adds weight, not energy. Still about 180 calories spread over more grams. Way it cooked, but log the dry number, and you'd count nearly three times too much. Match the label to the rice on your scale. Dry with dry, cooked with cooked. Track your food and nutrition with calmetre." ("Way" is the homophone of "Weigh".) small.en on 26.8–30 s: "Track your food and nutrition with Cal Meter." The final re-mux decodes to bit-identical audio (MD5 8359a57c…) as the ASR run. No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 6, 60, 110, 130, 160, 185, 232, 262, 300, 380, 420, 490, 535, 575, 640, 675, 760, 790, 840, 890); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA SR Legacy FDC 169756 and 169757 (cross-checks 168877, 168878, FNDDS 2708408); calculations in `research/rice-calculations.txt`; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states the rice and preparation, no editing instructions |

## Issues found and fixed
1. First voice pass ran 29.5 s → three lines tightened to 26.2 s total; all takes re-checked verbatim.
2. Renderer: a name clash (the rice-grain function vs the paper-grain canvas) → renamed.
3. Stills: hook foods and roundels too small with an empty lower plate → enlarged and lowered; the cooked bowl clipped the card edge → moved in; the pot enlarged; the scale read "0 g" while the dish was off it → blank display; a half-second "BOTH ≈ 180 kcal" label removed.
4. Audio: the splash sound sat before frame 0 and broke the mix → its own event at frame 0.
5. Bounds: captions reached x 923 (the reused helper predated the x 500 centring) → re-centred; two labels started at x 58 → moved inward; the DRY tag slid in from off-screen → now enters inside the frame.
6. Thumbnail: sparse cooked rice, a splash ring across the 365 roundel and an empty lower third → denser rice (also in the video), ring removed, foods enlarged.

## Remaining limits (honest)
- The 50 g → ≈ 140 g yield is calculated from USDA's dry and cooked composition (68.4 % water, no solids lost); real pots vary with water amount and method, so it is shown as "≈".
- The loupe and grain swelling are diagrams, not to scale.
- Narration and caption timing are checked by ASR only; frames by machine-rendered sheets. No human watched or listened.
- The water-changes-the-per-100 g idea also underlies english-08 (raisins, water removed) and english-10 (roasted chickpeas, water removed); this episode is the first about water added by cooking, with a different food and a logging takeaway.
