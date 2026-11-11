# QA: CalMeter English 30 s english-12, popcorn: big bowl, small kernels (2026-11-11)

**Final output:** `videos/nutriai/production/30s/2026-11-11-english-12/nutriai-30s-english12-01.mp4`
sha256 `071b0eaf8e5f96a70222f2022226f219ac2a184cea897ac5cc24b290a852b6f9` · 20748286 bytes · status: final (2026-11-11).
**Thumbnail:** `nutriai-30s-english12-thumbnail.png` (1080×1920 RGB): "BIG BOWL. / SMALL KERNELS." over a bursting kernel and an overflowing bowl on a scale reading 24 g; words inside x 150–929, y 339–581.
Built to the approved feedback rules of 2026-11-11 (`context/25-feedback-rules-2026-11-11.md`).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.9 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter scan (n = 0.003): one 0.87 s stretch at 5.1 s (the cut-open kernel before "WATER") |
| Story timing | Hook 0–2.9 s (kernel bursts at frame 0, bowl fills, 24 g); super hook 3.0–4.6 s ("how does a kernel get so big?"); mechanism 4.8–10.9 s; proof 11.1–14.1 s; toppings 14.2–22.1 s; payoff 22.3–26.7 s; CTA 27.1–29.4 s |
| Captions (`qa/text-bounds.txt`) | 608 caption runs, **0** outside the new zone x 100–900 / y 230–1500 (ink x 134–866, y 356–494); ≤ 2 lines; 64 px auto-fit; centred on x 500; blocks never overlap; no text above y 230 |
| Plate labels | 2 153 runs: 0 above y 480, 0 off-frame, 0 right of x 980, 0 left of x 100, lowest y 1450; one brief label at a time (WATER, HEAT ≈ 180 °C, POP!, LIGHT FOAM, 8× LESS DENSE, AIR-POPPED, + OIL, + BUTTER, + SUGAR, ×3+, SAME SIZE) |
| Narration / caption sync (`qa/sync.txt`) | 20 of 21 caption lines within ±0.20 s of the spoken word (18 within ±0.10 s); "Track your food…" (+0.80 s) is Whisper stretching "Track" over the pause (take placed at 27.10 s; "your" at 27.24 s) |
| Intelligibility | ASR on the export (faster-whisper base.en, VAD, `qa/asr-final-mp4.txt`): "Three cups of popcorn, just 24 grams, so how does a kernel get so big? Inside, a drop of water turns to steam, bursts the hull, and puffs the starch into a light foam. So three cups air popped, about 90 calories, popped in oil 165, with a tablespoon of butter 265, a tablespoon of sugar over 300. Same bowl more than triple. Count the grams and the toppings, not the size. Track your food and nutrition with calmetre." small.en on 26.8–30 s (`qa/asr-cta-small.txt`): "Track your food and nutrition with Cal Meter." The CTA take is the cached accepted take (MD5 858783ce…). No human listening test was performed |
| Visual review | `qa/contact-sheet.png` (every 1 s + last frame), `qa/transitions.png` (frames 0, 8, 30, 100, 130, 170, 205, 230, 250, 310, 330, 390, 440, 500, 550, 600, 640, 668, 700, 780, 840, 890); machine-rendered frames inspected, not a human watch-through |
| Facts | USDA FNDDS FDC 2708219 and 2708221, SR Legacy 173410, 169655 (cross-check 167959), SR28 weights; Virot & Ponomarenko 2015; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, states portions, no editing instructions |

## Issues found and fixed
1. First voice pass ran 30.5 s → five lines tightened (sentence stops replaced by commas) to 25.9 s; all takes re-checked verbatim.
2. Stills: frame 0 showed an empty bowl reading "0 g" → the bowl starts 30 % full under the bursting kernel and the scale stays blank until it is switched on; the kernel and burst were enlarged.
3. Stills: the cut-open kernel was too small and "WATER" showed for 0.5 s → kernel 33 % larger; WATER now holds 5.4–6.7 s, then "HEAT ≈ 180 °C"; the foam now starts at the burst (no empty frame between POP and foam).
4. Thumbnail: burst rays crossed the words and "SMALL KERNELS." reached x 1015 → burst moved down, words resized inside x 150–929.
5. First export: four holds of 0.9–1.2 s (11.5, 12.6, 23.1, 24.5 s) → slow linear push-ins through the toppings scene and through payoff + CTA, with an eased pull-back at the transition. Final export: 0 events.
6. Bounds: captions centred at x 540 reached x 920 → centred on the caption window (x 500) with a 740 px fit; "+ BUTTER"/"+ SUGAR" started at x 56 → moved inside x 100.
7. Sync: "Inside, a drop of water" (−0.27 s) and "≈ 90 kcal" (−0.43 s) moved to their words (with the 90 kcal roundel and its tick).

## Remaining limits (honest)
- Topping amounts (one tablespoon each of butter and sugar) are illustrative; real bowls vary. The oil-popped value is USDA's survey food with its own 11 g cup.
- The cut-open kernel is a diagram: hull, starch, a water drop, steam, a pressure burst and foam; proportions are not to scale except the stated 8× density change.
- Narration and caption timing are checked by ASR only; frames by machine-rendered sheets. No human watched or listened.
- Stop motion at 15 drawings/s, as in earlier episodes.
