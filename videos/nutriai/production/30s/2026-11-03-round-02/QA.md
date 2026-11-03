# QA: CalMeter round-02 30 s, "What is inside 100 grams of raw papaya flesh?" (2026-11-03)

**Final output:** `videos/nutriai/production/30s/2026-11-03-round-02/nutriai-30s-round02-01.mp4`
sha256 `3b593cbc0f45d4ecd82e864094fec5c43d3e17f655721186e0b0ab6f2022a544` · 17971822 bytes · status: final (2026-11-03).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.1 LUFS integrated, LRA 2.7 LU, true peak −1.5 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003) lists small-area-motion stretches of 1.1–2.1 s in the takeaway and CTA (cubes, leader, cut lettering, seal edge) |
| Captions (`qa/text-bounds.txt`) | 671 caption runs, **0** outside x 90–990 / y 350–470 (ink x 131–949, y 359–468); ≤ 2 lines; blocks never overlap; no text above y 300 |
| Plate text | 3 571 runs: 0 above y 480, 0 off-frame, 0 right of x 950, lowest y 1538; CTA wordmark x 440–782, y 1323–1380 (inside the plate) |
| Narration / caption sync | ASR word starts on the export vs caption lines (`qa/text-bounds.txt`): within ±0.3 s for every phrase; "Seeds" and "Track" stamps are Whisper segment-start drift (takes placed at 0.25 s and 26.75 s); "with CalMeter" line appears with "CalMeter" (+0.35 s after "with") |
| Intelligibility | One ASR pass on the export (faster-whisper base.en, `qa/asr-final-mp4.txt`): verbatim except "CalMeter" → "cow meter"; small.en on the CTA segment hears "Track your food and nutrition with Cal Meter." (`qa/asr-cta-small-en.txt`). Same take and phonemes as the accepted pomegranate CTA |
| Visual review | `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 22, 36, 84, 108, 150, 346, 384, 460, 560, 620, 700, 798, 860, 899) |
| Facts | USDA FDC 169926 / SR28 NDB 09226 and MedlinePlus checked; see `SOURCES.md` |

## Issues found and fixed
1. First render: the narration ran 28.5 s; three lines tightened (see context/15) and re-synthesized before any frame was rendered.
2. Stills: an algebraic section outline exploded sideways; the cutaway outline is now derived from the whole fruit's silhouette (bisection table). The first papaya shape read like an avocado; it was made longer and pear-shaped with a ragged seed cavity.
3. Stills: seeds started flying before the cavity was fully cut (cavity reveal shortened, seeds-out moved to frame 72); the peeled skin wash ignored the fade (alpha fixed); notes moved left of x 950.
4. First export: 4 freezedetect events (22.8–30 s, takeaway + CTA). Added purposeful motion: cubes drop one by one, balance settles with a damped sway, dotted leader flesh → cup, "≈ 62 kcal" and "145 g × 43 kcal / 100 g" cut letter by letter, CalMeter seal edge engraved tick by tick. Re-export checked once (table above): 0 events.

## Remaining limits (honest)
- Stop motion at 15 drawings/s; roundel flights step visibly; a roundel flies in as a blank disc for a few frames (as in earlier episodes).
- The takeaway balance is at the accepted batch-02 scale (labels 19–26 px).
- Intelligibility checked by ASR only (no human listening test here).
