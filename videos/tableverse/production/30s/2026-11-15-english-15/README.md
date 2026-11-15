# TableVerse — "Two Equal Groups" (6 × 8 = 24 + 24 = 48) · batch 2026-11-15 · english-15 · 01

Deliverables (this folder):
- `tableverse-30s-english15-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english15-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail):
  split six-row donut sheet, "6 × 8 = ?", headline "SPLIT IT. SOLVE IT.".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`, incl. the 2026-11-13 update).
Brief, topic decision (6 × 8 instead of the already-covered 42), script, sources: `context/12-episode-two-equal-groups.md`.
QA: `qa/QA.md`. Code base: copied from the approved english-14 project (perspective hinge renderer, book, lamp,
baker, flip card, CTA card) with a donut sheet (6 × 8), twin-group split, ghost-outline equality check, a frame-0
headline and a new music sequence (key of D).

## Scene table (frames @ 30 fps)
| frames | beat | on screen | VO |
|---|---|---|---|
| 0–78 | hook (frame 0 = thumbnail) | split six-row sheet, card "6 × 8 = ?", "SPLIT IT. SOLVE IT."; headline folds away; halves close | "Six times eight? Split it. Solve it." |
| 78–146 | array | row tags 1–6, numbers 1–8 across row 1 | "Here are six rows of eight donuts." |
| 146–226 | split | baker pulls the tab; the sheet splits after row 3 | "Split the six rows into two equal groups." |
| 226–402 | same? | question, untimed 1.4 s pause with a slow lean-in, dashed outline of the top group slides down and fits | "Are the two groups the same? … Yes. Three rows of eight in each." |
| 402–590 | proof | flap "3 × 8 = 24" on each group (each glows once); card "24 + 24 = 48" | "Three rows of eight make twenty-four. The other group is the same. Twenty-four and twenty-four make forty-eight." |
| 590–806 | payoff + takeaway | card "6 × 8 = 48"; top group glows, then both + "× 2"; the groups close into one sheet | "So six times eight is forty-eight. For a six fact, find the three fact, then double it." |
| 806–900 | CTA | page turns to the TableVerse card; baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-15-english-15
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 3           # -> build/video.mp4
node src/render.mjs --thumb tableverse-30s-english15-01-thumbnail.png   # = frame 0
bash qa/run_qa.sh <python-with-faster-whisper>    # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). The baker puppet and craft
  primitives are reused from the approved 2026-11-02 / 13 / 14 episodes (same repo). App icon = verified asset
  `videos/tableverse/assets/icon.png` (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; cached model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS Mathematics, Grade 3, 3.OA.A.3, 3.OA.B.5, 3.OA.D.9 (official PDF) — see context/12.
