# QA: CalMeter Hindi 30 s feedback-05, "सौ ग्राम पनीर में कितना प्रोटीन है?" (plain paneer, 2026-11-05)

**Final output:** `videos/nutriai/production/30s/2026-11-05-feedback-05/nutriai-30s-feedback05-01.mp4`
sha256 `54c910bcb316ea87d79aa55ee6c9f597ba0280de1e681540957118e74fc90a3c` · 21297817 bytes · status: final (2026-11-05).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.9 LU, true peak −1.5 dBFS (voice-forward; quiet bed ducked under speech) |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003): small-area-motion stretches of 1.4–1.7 s (gauge needles, seal engraving) |
| Opening | The knife cuts the block at ~1.1 s and the halves part by 1.7 s (`qa/transitions.png`, frames 20/36/48) |
| Hindi glyphs | Noto Sans Devanagari (vendored, OFL); all captions and plate labels render (conjuncts, matras, nukta फ़); no missing-glyph boxes |
| Captions (`qa/text-bounds.txt`, bounds from measured ink pixels) | 597 caption runs, **0** outside x 90–990 / y 340–520 (ink x 175–903, y 361–501; line 1 y 361–424, line 2 y 437–501, no overlap); ≤ 2 lines; blocks never overlap; no text above y 300 |
| Plate text | 3 430 runs: 0 above y 480, 0 off-frame, 0 right of x 950, lowest y 1540 |
| Narration / caption sync | Hindi ASR word starts on the export vs caption lines (`qa/text-bounds.txt`): within ±0.2 s for the checked phrases, except where a line appears on the word it quotes (line 2 "कम फ़ैट…" on "कम", +0.35 s after "इसलिए") and Whisper segment-start drift ("पैक" stamped 19.92 s; the take is placed at 20.50 s and the caption appears then) |
| Intelligibility (Hindi) | **ASR only — listening was not possible in this environment.** faster-whisper medium, language hi, per take (`qa/asr-takes.txt`) and on the final mix (`qa/asr-final-mp4.txt`), verbatim: "100 g पनीर में कितना प्रोटीन है? एक मानक तालिका में 26 g प्रोटीन, सारह 24 g फैट, 325 केलोरी. इसकी दोतिहाई केलोरी फैट से आती है. हर ग्राम फैट लगभभग 9 केलोरी देता है, इसलिए कम फैट वाले पनीर में केलोरी कम होती है. पैक पर प्रती सो ग्राम का लेबल पढ़ें और अपना हिस्सा तौलें. कैलमीटर के साथ अपने खाने और पोशण को ट्रैक करें." Every number and claim is recovered; "सारह 24" = साढ़े चौबीस, other differences are Whisper spellings |
| Visual review | `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 20, 36, 48, 64, 230, 296, 370, 450, 540, 600, 690, 740, 800, 899) |
| Facts | Matvaretabellen 01.301 (UK CoFID) and FAO FNP 77 checked; USDA FNDDS paneer checked and rejected; see `SOURCES.md` |
| Publishing caption | `publishing-caption.txt` matches the final spoken transcript (numbers as digits), names CalMeter only, no editing instructions |

## Issue found and fixed
1. First export: the "फ़ैट की बूँदें" note reached x ≈ 970 (70 runs right of x 950, the side-rail limit). Moved to x 906; video re-rendered and re-muxed with the same audio (audio MD5 7a14d2b5739385142b00fe86d6c60cf7); streams, decode, loudness, freeze and text bounds re-checked once (table above).

## Remaining limits (honest)
- Hindi intelligibility judged by ASR, not a native listener.
- The comparison panels are qualitative by design (no brand values); the reference values are one table's values, stated as such in the narration.
- Stop motion at 15 drawings/s; roundel flights step visibly (as in earlier episodes).
