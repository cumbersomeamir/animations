# TableVerse — "The Robot That Packs in Tens" (4 × 30 = 12 tens = 120) · batch 2026-11-15 · english-17 · 01

Deliverables (this folder):
- `tableverse-30s-english17-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english17-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): 120 loose
  cookies, the overwhelmed robot counting one by one, "4 × 30 = ?", headline "TOO MANY TO COUNT?".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`, incl. the 2026-11-13 update).
Brief, topic decision (tens instead of the already-covered doubling), script, sources:
`context/14-episode-robot-packs-in-tens.md`. QA: `qa/QA.md`. Code base: copied from the approved english-16 project
(perspective hinge renderer, book, lamp, flip card, captions, CTA card) with a new original cut-paper robot puppet
(`src/robot.mjs`: wheels, screen face, antenna bulb, two-segment arms on split pins), chocolate-chip cookies, clear
ten-tubes, a pop-up hundred crate, and a new music sequence (key of A).

## Scene table (frames @ 30 fps)
| frames | beat | on screen | VO |
|---|---|---|---|
| 0–104 | hook (frame 0 = thumbnail) | 120 loose cookies; dizzy robot counts one by one (ring + number); card "4 × 30 = ?"; "TOO MANY TO COUNT?" folds away (f84–98) | "Four rows of thirty cookies! Too many to count one by one?" |
| 104–156 | super hook | antenna light bulb | "So the robot packs them in tens." |
| 156–284 | tens | ten cookies hop into each tube (10 slices) — tubes 1–3 of row 1; row 1 glows | "Ten! Twenty! Thirty! One row is three tens." |
| 284–362 | top speed | robot zooms; rows 2–4 packed | "Four rows, three tens in each." |
| 362–520 | count | question + untimed 1.4 s pause (lean-in, head scratch); tags 1–12 | "How many tens in all? … Twelve tens!" |
| 520–646 | hundred | crate pops up; ten tubes jump in ("100"); last two tubes "20"; card "4 × 30 = 120" on "one hundred twenty" (f611) | "Ten tens make one hundred. Two more tens make one hundred twenty." |
| 646–810 | takeaway | tubes hop back into 4 rows of 3; card "4 × 3 = 12" (f676) → "4 × 30 = 120" (f737); robot dance | "Four times three is twelve, so four times thirty is twelve tens." |
| 810–900 | CTA | page turns to the TableVerse card; robot rolls aside and waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-15-english-17
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4
node src/render.mjs --thumb tableverse-30s-english17-01-thumbnail.png   # = frame 0
bash qa/run_qa.sh <python-with-faster-whisper>    # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). Craft primitives are reused
  from the approved earlier TableVerse episodes (same repo); the robot, cookies, tubes and crate are new for this
  episode. App icon = verified asset `videos/tableverse/assets/icon.png` (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; cached model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS Mathematics 3.NBT.A.3, 2.NBT.A.1a, 3.OA.B.5, 3.OA.A.1 (official PDF) — see context/14.
