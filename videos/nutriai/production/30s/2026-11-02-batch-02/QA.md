# QA: NutriAI production 30 s #02, "What is inside 100 grams of guava?"

**Final output:** `videos/nutriai/production/30s/2026-11-02-batch-02/nutriai-30s-production-02.mp4`
sha256 `a2e8d8d578b34f99784acccf2f7839eb84187139fdbfa6106ef15415f9d2b751` · 22749421 bytes · status: final, all checks passed (2026-11-02).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC 48 kHz stereo 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.0 LUFS integrated, LRA 2.4 LU, true peak −1.5 dBFS |
| Black / freeze (`qa/black-freeze.txt`) | 0 events (blackdetect ≥ 0.25 s, freezedetect ≥ 0.8 s) |
| Captions (`qa/text-bounds.txt`) | 682 caption runs, **0** outside x 80–1000 / y 350–470 (ink x 116–964, y 359–468); ≤ 2 lines; blocks never overlap |
| Plate text through camera moves | 5 162 runs, 0 above y 480 or off-frame; lowest y ≈ 1534 |
| Intelligibility | One ASR pass on the export (faster-whisper base.en, `qa/asr-final-mp4.txt`): verbatim except "Weigh" heard as the homophone "Way" (caption shows "Weigh"). The final mux reuses the same unchanged `mix-norm.wav` (audio MD5 3798597f1da5de6598681fb3545312b2). Per-take timing pass: `qa/asr-takes.txt` |
| Visual review | `qa/contact-sheet.png` (every 1 s), `qa/transitions.png` (frames 89/90, 239/240, 479/480, 689/690, 869/870, 899): continuous plate, printmaking transitions, guava recognisable (whole fruit + leaf, then large coral cutaway with seeds) |
| Facts | USDA FDC 173044 / SR28 09139 and MedlinePlus checked; see `SOURCES.md` |

## Issues found and fixed
1. Cutaway washes flooded the whole disc and multiplied into muddy olive/brown: ring-clipped washes (skin band / flesh ring / pulp).
2. Leaf overlapped the plate title: re-angled along the shoulder.
3. Payoff balance too faint and small; the single guava had no wash (wash fill was in balance-local coordinates): enlarged balance, solid beam/base, wash fill covers any transform, opaque paper under small figures, labels moved clear of the base.

## Remaining limits (honest)
- Stop motion at 15 drawings/s; roundel flights step visibly (deliberate).
- At about 3.0 s the first roundel flies in as a blank disc for a few frames before its value is cut (the section is still being re-cut).
- USDA vitamin C for common guava rests on n = 2 analyses; the video frames it as a reference value.
- NIH ODS pages were not retrievable (HTTP 403); NIH MedlinePlus pages were used and archived.
- Intelligibility checked by ASR only (no human listening test here).
