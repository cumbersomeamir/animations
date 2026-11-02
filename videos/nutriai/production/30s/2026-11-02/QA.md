# QA: NutriAI production 30 s #01, "What is actually in 100 grams of mango?"

**Final output:** `videos/nutriai/production/30s/2026-11-02/nutriai-30s-production-01.mp4`
sha256 `0f89a8b764d1a8c17ed387c82282a606e82a1862f954abea97a822ec2b2235d4` · 23127007 bytes · status: final, all checks passed (2026-11-02).

| Check | Result (on the exported MP4) |
|---|---|
| Streams (`qa/ffprobe.json`) | H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames**, 30.000000 s · AAC LC, 48 kHz, stereo, 30.000000 s · container 30.000000 s |
| Full decode (`qa/decode.log`) | 0 error lines |
| Loudness (`qa/loudness.txt`) | −15.1 LUFS integrated, LRA 3.2 LU, true peak −1.4 dBFS |
| Black / freeze | 0 blackdetect (≥ 0.25 s) and 0 freezedetect (≥ 0.8 s) events |
| Captions (`qa/text-bounds.txt`) | 672 caption runs, **0** outside x 80–1000 / y 350–470; ink extent x 188–892, y 359–468; max 2 lines; blocks never overlap |
| Plate text through camera moves | 7 025 runs, 0 above y 480 or off-frame; lowest essential text y ≈ 1586 |
| Intelligibility | One ASR pass on the final MP4 (faster-whisper base.en, `qa/asr-final-mp4.txt`): verbatim match to the final script. Earlier per-take timing pass: `qa/asr-takes.txt` |
| Visual review | `qa/contact-sheet.png` (every 1 s) and `qa/transitions.png` (beat boundaries 89/90, 239/240, 599/600, 689/690, 869/870, last frame): continuous plate, no hard cuts, mango recognisable at the open and leaf/stem through the cutaway |
| Facts | All four values and the preparation re-verified against FDC 169910 and SR28 refuse; see `SOURCES.md` |

## Issues found and fixed
1. Whole-mango hatch/outline didn't draw (point objects vs arrays): burin accepts both.
2. Takeaway push-in cropped two roundels: push reduced (1.08 → 1.035).
3. "Each mango varies" glyphs collided with the leaf: removed (the caption and legend carry the caveat).
4. Caption descenders at y 471: baselines raised 3 px (now ≤ 468).
5. Credit line cut while the camera was still pushed in ran past x 1040: credits moved after the pull-back (frame 866).
6. B3 push-in brought "PLATE I" to y 478, tight under the captions: push softened (1.06 → 1.04, centre 1060).

## Remaining limits (honest)
- Stop-motion at 15 drawings/s is deliberate; fast moves (roundel flights) step visibly.
- The cutaway is a stylised engraved half-fruit; the whole fruit, stem and leaf keep it identifiable, but the cut face alone reads as an oval with a stone.
- No copper/burin tool shown (lightweight budget); type is the app's Inter, not the style's Bodoni/Pinyon.
- Intelligibility was checked by ASR (two passes total), not by a human listening test in this environment.
- Values are database averages for raw mango; the video says so, and individual fruit differ.
