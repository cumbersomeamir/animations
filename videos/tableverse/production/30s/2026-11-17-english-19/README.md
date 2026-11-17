# TableVerse — "Seven or Zero?" (7 × 1 = 7, 7 × 0 = 0) · batch 2026-11-17 · english-19 · 01

Deliverables (this folder):
- `tableverse-30s-english19-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english19-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): seven boxes
  with one star cookie each, the hungry mouse at its hole, "7 × 0 = ?", headline "SEVEN OR ZERO?".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`, incl. the 2026-11-13 update).
Brief, topic decision (× 1 / × 0 instead of the already-covered "ten groups minus one"), script, sources:
`context/16-episode-seven-or-zero.md`. QA: `qa/QA.md`. Code base: the approved english-18 renderer, book, lamp, flip
card, captions and CTA card; the approved english-16 mouse (`src/mouse.mjs`, now with belly / sleepy eyes / chewing
mouth options) and baker (`src/baker.mjs`); approved star cookies (`src/craft.mjs`) with new bitten stages; new
cut-paper gift boxes with hinged fronts, shelves and a mouse hole; bakery floor props restored; music in E major.

## Scene table (frames @ 30 fps)
| frames | beat | on screen | VO |
|---|---|---|---|
| 0–136 | hook (frame 0 = thumbnail) | 7 boxes × 1 cookie, hungry mouse at its hole; card "7 × 0 = ?"; headline folds away (f118–132) | "Seven times zero: is it seven, or zero? Let's ask a hungry mouse!" |
| 136–242 | ones | "1" badges pop on boxes 1–7 (f146–182); card "7 × 1 = 7" (f217) | "Seven boxes, one cookie in each. Seven ones make seven." |
| 242–384 | chomp | the mouse leaps out and hops box to box (top row left→right, bottom row right→left), three bites per cookie, badges turn to 0 (f263–365), back home f368 | "Then the mouse eats the cookie in every box!" |
| 384–520 | question | card back to "7 × 0 = ?" (f449); untimed 1.4 s pause, lean-in | "Now each box has zero cookies. How many in all?" |
| 520–596 | payoff | card "7 × 0 = 0" on "Zero!" (f520); 0 badges pulse in turn | "Zero! Seven zeros make zero." |
| 596–810 | takeaway | box fronts fold down in a wave: every box empty (f604–640); card "any × 0 = 0" (f677); mouse naps; fronts close (f786–810) | "Zero in every group means zero in all. Any number times zero is zero." |
| 810–900 | CTA | page turns to the TableVerse card; baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-17-english-19
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4
node src/render.mjs --thumb tableverse-30s-english19-01-thumbnail.png   # = frame 0
bash qa/run_qa.sh <python-with-faster-whisper>    # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). Mouse, baker, star cookie and
  craft primitives are reused from the approved earlier TableVerse episodes (same repo); boxes, shelves, mouse hole and
  bitten-cookie stages are new. App icon = verified asset `videos/tableverse/assets/icon.png` (sha256 0ad7f267…9561),
  end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; cached model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS Mathematics 3.OA.A.1, 3.OA.D.9, Glossary Table 3 (official PDF) — see context/16.
