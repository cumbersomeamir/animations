# TableVerse — "Nine Hides Inside Ten" (9 × 8 = 10 × 8 − 8) · batch 2026-11-14 · english-14 · 01

Deliverables (this folder):
- `tableverse-30s-english14-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english14-01-thumbnail.png` — separate vertical thumbnail, words "9 × 8?" / "THINK 10!".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`, incl. the 2026-11-13 update).
Brief, episode history, script, fact sources: `context/11-episode-nine-hides-inside-ten.md`. QA: `qa/QA.md`.
Code base: copied from the approved english-13 project (perspective hinge renderer, book, lamp, baker, CTA card),
with a new cookie sheet (10 × 8), a backward-folding hinged row, a flip card and a new music sequence.

## Scene table (frames @ 30 fps)
| frames | beat | on screen | VO |
|---|---|---|---|
| 0–58 | hook | cookie sheet springs up, 80 cookies pop row by row, flip card "9 × 8 = ?" rises | "Where is nine times eight hiding?" |
| 58–112 | super hook | push-in; the card flips to "10 × 8 = ?" | "Inside ten times eight!" |
| 112–226 | count | row tags 1–10, numbers 1–8 across row 1; card flips to "10 × 8 = 80"; sheet glows once | "Here are ten rows of eight cookies. Ten rows of eight make eighty." |
| 226–414 | question | card flips back to "9 × 8 = ?"; question; untimed 1.5 s pause with a slow lean-in; row 10 lights, hinge pins appear | "But nine times eight needs only nine rows. Can you spot the extra row?" |
| 414–566 | fold + proof | baker pulls the tab; row 10 drops on its hinge strip and folds back (greyed, visible); flap "80 − 8"; nine rows glow; flap "80 − 8 = 72" | "Fold it away. Eighty, take away one row of eight. Seventy-two are left." |
| 566–800 | payoff + takeaway | card flips to "9 × 8 = 72"; row 10 unfolds (start with ten) and folds back (take one group away); flap "10 × 8 − 8" | "So nine times eight is seventy-two. For a nine fact, start with ten, then take one group away." |
| 800–900 | CTA | page turns to the TableVerse card (verified icon, wordmark, on Google Play); baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-14-english-14
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 3           # -> build/video.mp4
node src/render.mjs --thumb tableverse-30s-english14-01-thumbnail.png
bash qa/run_qa.sh <python-with-faster-whisper>    # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). The baker puppet and craft
  primitives are reused from the approved 2026-11-02 / 2026-11-13 episodes (same repo). App icon = verified asset
  `videos/tableverse/assets/icon.png` (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; cached model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS Mathematics, Grade 3, 3.OA.A.3, 3.OA.B.5, 3.NBT.A.3, 3.OA.D.9 (official PDF) — see context/11.
