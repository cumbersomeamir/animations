# QA: CalMeter production 30 s, "What is inside 100 grams of raw pomegranate arils?" (2026-11-03)

**Final output:** `videos/nutriai/production/30s/2026-11-03/calMeter-30s-pomegranate-01.mp4`
sha256 `861a1d69e4c454a5a3201ae17be54c92f56375416cb6c43661121c08576e8b89` · 23816931 bytes · status: final (2026-11-03).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.7 LU, true peak −1.3 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 events at the batch-02 thresholds (blackdetect ≥ 0.25 s, freezedetect default noise ≥ 0.8 s). A stricter near-static scan (n = 0.003) shows short holds of 0.8–1.4 s: 2.1 s (before the knife cut), 24.1 s and 25.5 s (takeaway balance), 27.1–29.9 s (CTA end hold with the signature and caption) |
| Captions (`qa/text-bounds.txt`) | 632 caption runs, **0** outside x 80–1000 / y 350–470 (ink x 165–915, y 359–468); ≤ 2 lines; blocks never overlap; no text ink above y 300 |
| Plate text through camera moves | 3 444 runs, 0 above y 480, 0 off-frame; lowest plate text y 1538; signature y 1598–1616 |
| Narration / caption sync | ASR word starts on the export vs caption line appearance (`qa/text-bounds.txt`): within ±0.3 s for every line, except line 1 of the opening (shown with the question start, 0.6 s before "100") and two Whisper timestamp drifts at segment boundaries ("Track" stamped 25.98 s although take T6 is placed at 26.80 s) |
| Intelligibility | One ASR pass on the export (faster-whisper base.en, `qa/asr-final-mp4.txt`): verbatim except "arils" → "aerols" (rare word; Kokoro dictionary phonemes ˈæɹəlz; small.en heard "arils" in T0) and "CalMeter" → "calmetre" (the intended CAL-meter sound; small.en hears "Cal Meter"). Per-take pass: `qa/asr-takes.txt` |
| Visual review | `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 88, 96, 174, 240, 268, 384, 540, 604, 664, 702, 770, 899): whole fruit → burnish to the cutaway → peel lifted aside → 100 g weighed → roundels → mechanism → juice vs arils → takeaway balance → CTA |
| Facts | USDA FDC 169134 / 167787, SR28 NDB 09286 and MedlinePlus checked; see `SOURCES.md` |

## Issue found and fixed
1. The "16 µg vitamin K" caption line and roundel arrived 1.1 s after "sixteen" was spoken (they were keyed to "vitamin K"). Moved to frames 378/380 and re-exported; the re-export was checked once (table above).

## Remaining limits (honest)
- Stop motion at 15 drawings/s; roundel flights step visibly, and the juice roundel flies in as a blank disc for a few frames (as in batch-02).
- The CTA end hold (about 2.7 s) is mostly static apart from line boil, the cut credit, the signature fade and the caption. This follows the accepted batch-02 ending.
- The takeaway balance is small (batch-02 scale); its labels are 18–20 px.
- Intelligibility checked by ASR only (no human listening test here).
