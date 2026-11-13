# TableVerse — "The Missing Row Trick" (7 × 6 = 5 rows + 2 rows) · batch 2026-11-13 · english-13 · 01

Deliverables (this folder):
- `tableverse-30s-english13-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english13-01-thumbnail.png` — separate vertical thumbnail, words "7 × 6?" / "SPLIT IT!".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`, incl. the 2026-11-13 update).
Brief, script, fact sources: `context/10-episode-missing-row-trick.md`. QA: `qa/QA.md`.

## Improvements over the previous episode (user feedback: more depth, purposeful hinges, clarity, hook)
- Every hinge is drawn in real perspective (strip-projected planes): the tray springs up on its base hinge,
  the 2-row panel swings forward on the row-5 hinge and pulls apart on an accordion strip, label flaps rise and
  drop on hinges, the question tag folds down from the bar, the final page turns toward the viewer.
- Depth: blurred bakery background (depth of field), parallaxed camera moves only at story beats (push in on the
  hinge, the fold, the answer), cast shadows that grow with each plane's angle, a hanging lamp motivating the
  warm key light, blurred foreground leaves.
- Clarity: one idea at a time, big numerals (66–122 px), captions limited to the upper band and short, the
  answer is never shown before the narrator says it, every counted cupcake stays visible (the travelling "30"
  routes around the tray).
- Hook: a real question ("7 × 6 feels tricky?") + a real mechanism to wonder about ("a secret hinge").

## Scene table (frames @ 30 fps)
| frames | beat | on screen | VO |
|---|---|---|---|
| 0–62 | hook | tray springs up, rows of cupcakes pop, tag "7 × 6 = ?" folds down | "Seven times six feels tricky?" |
| 62–118 | super hook | push-in; a dashed score line draws across after row 5, brass pins pop | "This tray has a secret hinge." |
| 118–186 | build-up | row tags 1–7, "6" across the top | "Seven rows of six cupcakes." |
| 186–296 | notice | question, quiet 1.3 s pause (no timer), rows 1–5 light up one by one | "Can you find five rows?" |
| 296–352 | fold | baker pulls the tab; panel with rows 6–7 swings forward and apart | "Fold the tray after row five." |
| 352–508 | proof | "5 × 6 = 30" flap rises, upper panel glows; "2 × 6 = 12" flap drops, lower panel glows | "Five rows of six make thirty. Two rows are left. Two sixes make twelve." |
| 508–616 | combine | panel swings back, click; the 30 travels to the lower flap; flap flips to "30 + 12 = 42"; whole tray glows | "Unfold, and add. Thirty plus twelve is forty-two." |
| 616–690 | payoff | tag returns, its "?" flips to 42 | "So seven times six is forty-two." |
| 690–800 | takeaway | hinge opens a little again; flap flips to "5 × 6 + 2 × 6" | "Stuck on a big fact? Split it into facts you know." |
| 800–900 | CTA | page turns to the TableVerse card (verified icon, wordmark, on Google Play); baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-13-english-13
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 3           # -> build/video.mp4
node src/render.mjs --thumb tableverse-30s-english13-01-thumbnail.png
bash qa/run_qa.sh <python-with-faster-whisper>    # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). The baker puppet and craft
  primitives are reused from the approved 2026-11-02 episode (same repo). App icon = verified asset
  `videos/tableverse/assets/icon.png` (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; cached model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS Mathematics, Grade 3, 3.OA.A.3, 3.OA.B.5, 3.OA.C.7 (official PDF, retrieved 2026-11-13) — see context/10.
