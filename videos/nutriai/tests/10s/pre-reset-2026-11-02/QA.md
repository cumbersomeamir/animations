# QA: NutriAI 10 s style test, batch 2026-11-02-pre-reset (S02 Copperplate Engraving)

Output: `videos/nutriai/tests/10s/pre-reset-2026-11-02/nutriai-10s-test.mp4`, sha256 `463756a3ddfbd0c851dece24f2963b4c116b054393a6978f127df13988f3801c`, 9.65 MB.

| Check | Result |
|---|---|
| ffprobe (`qa-ffprobe.json`) | container 10.000000 s; H.264 High 1080×1920, 30/1 fps, **300 frames**, 10.000 s; AAC LC 48 kHz stereo, 10.000 s |
| Full decode (`ffmpeg -v error -f null`) | 0 error lines |
| Loudness | two-pass loudnorm to −14 LUFS / −1.5 dBTP (linear) |
| Captions | 2 lines, upper centre; measured ink bbox x 173–905 (margins ≥ 80 px), y 330–459; no handoff overlap (line 2 joins line 1) |
| Representative / transition frames | `qa/contact-sheet.png` (0.3, 1.2, 2.2, 2.9, 3.2, 4.9, 7.0, 9.9 s): outline cut → contour hatching → seed/fibres → wash → leaders → roundel glide → values |
| Narration | Kokoro-82M ONNX (kokoro-onnx, official model-files-v1.0), blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us. One ASR check (faster-whisper base.en): "100 grams of mango flesh, 60 calories, and about 36 milligrams of vitamin C." (verbatim) |
| Facts | Reused verified record: USDA FoodData Central FDC 169910 "Mangos, raw", per 100 g edible portion: energy 60 kcal; vitamin C 36.4 mg (≈36 mg). See `../../../education/pilot-01/SOURCES.md`. No health claims. |

Design: original Canvas2D code (no third-party engine). The public engraving STYLE.md was used as art direction only: tone from lines (no fills), swelling/tapering burin strokes (w·(0.2+0.8·sin(πu)^0.7)), hatching that follows the form (inset contours + radial flesh fibres + parallel seed hatching, families switched by tone threshold), upper-left light, plate mark + ruled border, double-ruled roundel on a ruled-machine ground, colour as a transparent wash laid under the ink after the print. Adapted to the brief: dark leaf-green plate with pale ink, Inter (app font) instead of Bodoni/Pinyon, upper-centre captions instead of bottom script subtitles. Stop motion: 150 drawings at 15 fps, each held 2 frames, with deterministic line boil. One camera drift (slow push + rise).

Unresolved limits (honest):
- Caption line 1 ascenders start at y 330, about 20 px above the ~350 target (still in the safe zone, clear of the top UI).
- Inset-contour hatching is uniform in spacing; there is no cross-hatching family in the flesh and no deckled subtitle slip.
- The mango is drawn as an engraved cut section with a wash; the earlier 3D mango still was not composited in.
- Kokoro ASR check done once only (no listening test).
