# QA: CalMeter Hindi 30 s #03, "सौ ग्राम संतरे में असल में क्या है?" (orange, 2026-11-03)

**Final output:** `videos/nutriai/production/30s/2026-11-03-hindi-03/nutriai-30s-hindi03-01.mp4`
sha256 `5eae3f7420c42641b48978437740c0f7de21f4f4ea8793594128172095ab6e2a` · 27534511 bytes · status: final (2026-11-03).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.0 LU, true peak −1.4 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s; freezedetect default noise ≥ 0.8 s). Stricter near-static scan (n = 0.003): short small-area-motion stretches of 0.8–1.5 s at 23.0 s and in the CTA |
| Hindi glyphs | Noto Sans Devanagari (vendored); conjuncts, matras, anusvara, nukta verified in a shaping test and in `qa/transitions.png` / `qa/contact-sheet.png`; no missing-glyph boxes |
| Captions (`qa/text-bounds.txt`, bounds from measured ink pixels) | 698 caption runs, **0** outside x 90–990 / y 340–520 (ink x 175–909, y 361–501; line 1 y 361–422, line 2 y 437–501, no overlap); ≤ 2 lines; blocks never overlap; no text above y 300 |
| Plate text | 3 337 runs: 0 above y 480, 0 off-frame, 0 right of x 950, lowest y 1537 |
| Narration / caption sync | Hindi ASR word starts on the export vs caption lines: all 16 checked phrases within ±0.3 s (largest −0.27 s, line 1 of the opening appears with the question start) |
| Intelligibility (Hindi) | faster-whisper medium, language hi, on every take (`qa/asr-takes.txt`) and on the final mix (`qa/asr-final-mp4.txt`): every number and claim recovered — "47 केलोरी, 2.4 ग्राम फाइबर, 53 मिली ग्राम विटामिन सी, 87 प्रतिशत पानी … 131 ग्राम, लगभग 70 मिली ग्राम विटामिन सी, कैल मीतर के साथ अपने खाने और पोशन को ट्रैक करे"; differences are Whisper spelling variants (सो, चिल्का, मद्यम, पोशन). No human listening test was possible here |
| Visual review | `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 40, 70, 98, 126, 200, 318, 410, 500, 560, 620, 740, 772, 850, 899) |
| Facts | USDA FDC 169097 / SR28 NDB 09200 and MedlinePlus checked; see `SOURCES.md` |

## Issues found and fixed
1. Voice timing: a 71-word draft ran about 32–35 s with the Hindi voice; tightened to 67 words, then "छिला हुआ" added to T4 for accuracy (69 words, 26.4 s of speech).
2. Stills: the cutaway read as pale cream with orange grains; vesicles packed denser on a stronger orange ground with pale membranes. The vitamin C (wound) motif was too small; enlarged.
3. First export: 2 freezedetect events in the CTA (26.8–29.8 s) because the juice vesicles had no line boil; the vesicles now boil like every burin stroke. Re-export checked (table above): 0 events. Audio was not re-mixed (same `mix-norm.wav`, audio MD5 4216fc9e68c5869066ade8cf0b758b5f in both exports).

## Remaining limits (honest)
- Kokoro's Hindi voices are smaller-data voices: छ is slightly under-aspirated (heard as "चिल्का" by ASR) and "कैलमीटर" is transcribed "कैल मीतर". Intelligibility was judged by Hindi ASR, not by a native listener.
- Stop motion at 15 drawings/s; roundel flights step visibly (as in earlier episodes).
- Caption ink uses y 361–501 (inside the allowed 340–520, wider than the 350–470 band of English episodes) because Devanagari vowel signs extend above and below the line.
