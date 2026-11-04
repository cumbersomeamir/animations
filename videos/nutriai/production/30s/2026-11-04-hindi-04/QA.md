# QA: CalMeter Hindi 30 s #04, "सौ ग्राम उबले हुए चने में क्या है?" (cooked chickpeas, 2026-11-04)

**Final output:** `videos/nutriai/production/30s/2026-11-04-hindi-04/nutriai-30s-hindi04-01.mp4`
sha256 `88483770f2b3adacdd5062faa6668e5f5838442f001563844c922e9917a2da49` · 20108518 bytes · status: final (2026-11-04).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.6 LU, true peak −1.4 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003): small-area-motion stretches of 0.8–1.9 s (labels, weights, seal engraving) |
| Hindi glyphs | Noto Sans Devanagari (vendored, OFL); conjuncts/matras/nukta render correctly in all captions and plate labels (`qa/transitions.png`, `qa/contact-sheet.png`); no missing-glyph boxes |
| Captions (`qa/text-bounds.txt`, bounds from measured ink pixels) | 609 caption runs, **0** outside x 90–990 / y 340–520 (ink x 169–909, y 361–501; line 1 y 361–420, line 2 y 437–501, no overlap); ≤ 2 lines; blocks never overlap; no text above y 300 |
| Plate text | 3 040 runs: 0 above y 480, 0 off-frame, 0 right of x 950, lowest y 1539 |
| Narration / caption sync | Hindi ASR word starts on the export vs caption lines: within ±0.2 s inside every sentence; three larger offsets ("100" at 0.00 s, "164" at 3.64 s, "कैल" at 25.36 s) are Whisper segment-start drift — the per-take pass places them at 0.30 s, 3.25 s and 26.05 s, matching the captions |
| Intelligibility (Hindi) | **ASR only — listening was not possible in this environment.** faster-whisper medium, language hi, per take (`qa/asr-takes.txt`) and on the final mix (`qa/asr-final-mp4.txt`), verbatim: "100 ग्राम उब्ले हुए चने में क्या है? 164 कैलोरी, लगभभग 9 ग्राम प्रोटीन और 7 दश्मलव 6 ग्राम फाइबर। प्रोटीन को शिकाउ की मरम्मत में मदद करता है, फाइबर पाचण में पर 1 कप उब्ले चने का वजन 100 नहीं, करीब 164 ग्राम होता है यानि लगभभग 270 कैलोरी और सारहे 14 ग्राम प्रोटीन कैलमेटर के साथ अपने खाने और पोशन को ट्रैक करे" — every number and claim is recovered; the differences are Whisper spelling variants (उब्ले, लगभभग, दश्मलव, को शिकाउ, पाचण, सारहे, कैलमेटर, पोशन) |
| Visual review | `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 40, 72, 84, 110, 230, 290, 350, 420, 470, 510, 560, 720, 790, 899) |
| Facts | USDA FDC 173757 / SR28 NDB 16057 and MedlinePlus checked; see `SOURCES.md` |

## Issues found and fixed
1. Stills: the cutaway read pale and low-contrast; seed coat, cotyledon and embryo washes deepened and a crossing hatch added to the shaded cotyledon. The per-cup count-up ended on 269 while the voice says "लगभग दो सौ सत्तर"; it now settles on "≈ 270".
2. First export: 2 freezedetect events of 0.8 s in the CTA (26.8 s, 29.0 s). The seal's milled edge is now engraved across the whole CTA and the starch stipple boils a little more. Re-export checked once (table above): 0 events. Audio unchanged between exports (audio stream MD5 5565cb6b5355a6d53d1cbbe2109ba80a).

## Remaining limits (honest)
- Hindi intelligibility judged by ASR, not by a native listener; Kokoro's Hindi voice slightly under-aspirates some consonants, and "कैलमीटर" is transcribed "कैलमेटर".
- "1 कप" is a US cup (≈ 240 ml); Indian katoris vary, which is the point of weighing.
- Stop motion at 15 drawings/s; roundel flights step visibly (as in earlier episodes).
