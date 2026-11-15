# TableVerse — "All in Pairs" (4 × 7 = 28 = 14 pairs; 4 × any number is even) · batch 2026-11-15 · english-18 · 01

Deliverables (this folder):
- `tableverse-30s-english18-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english18-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): seven boats
  of four friends, the rescue ship, Captain Robot, "4 × 7 = ?", headline "SEVEN BOATS. ALL IN PAIRS?".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`, incl. the 2026-11-13 update).
Brief, topic decision (pattern instead of the already-covered 7 × 6 = 30 + 12 split), script, sources:
`context/15-episode-all-in-pairs.md`. QA: `qa/QA.md`. Code base: copied from the approved english-17 project
(perspective hinge renderer, book, lamp, flip card, captions, CTA card, robot puppet) with a cut-paper sea, seven
rowboats, identical sailor friends, waist buddy-rope loops, a rescue ship with a yellow-"×" flag (`src/pirates.mjs`),
a pirate hat for the robot (`src/robot.mjs`, `hat: 'pirate'`), no bakery floor props, and new music (key of E-flat).

## Scene table (frames @ 30 fps)
| frames | beat | on screen | VO |
|---|---|---|---|
| 0–140 | hook (frame 0 = thumbnail) | 7 boats × 4 friends, rescue ship, Captain Robot; card "4 × 7 = ?"; headline folds away (f124–138) | "Seven boats, four friends in each. Can every friend climb aboard with a buddy?" |
| 140–198 | one boat | boat 1's friends step together; two buddy-rope loops (f164, f170) | "Look: four friends make two pairs." |
| 198–284 | question | untimed 1.4 s pause, lean-in, robot scratches its head | "Will anyone be left alone?" |
| 284–420 | count | boats 1–7 counted every 18 frames ("2" badge each; boats 2–7 tie their loops just before) | "Two! Four! Six! Eight! Ten! Twelve! Fourteen!" |
| 420–488 | rescue | 14 roped pairs jump onto the ship (f424–477); empty boats sink away | "Fourteen pairs. Nobody is alone!" |
| 488–612 | payoff | the full ship sails closer to the centre (f490–540); card "4 × 7 = 28" on the second "twenty-eight" (f582) | "Fourteen pairs make twenty-eight, so four times seven is twenty-eight." |
| 612–810 | takeaway | each column of four (two pairs) pulses in turn; card "4 × any = even" on "even" (f706); deck party | "Every four is two pairs, so four times any number is even." |
| 810–900 | CTA | page turns to the TableVerse card; Captain Robot waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-15-english-18
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4
node src/render.mjs --thumb tableverse-30s-english18-01-thumbnail.png   # = frame 0
bash qa/run_qa.sh <python-with-faster-whisper>    # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). Craft primitives and the robot
  puppet are reused from the approved earlier TableVerse episodes (same repo); sea, boats, friends, ship, flag and the
  pirate hat are new for this episode. App icon = verified asset `videos/tableverse/assets/icon.png`
  (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; cached model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS Mathematics 3.OA.D.9, 2.OA.C.3, 3.OA.A.1 (official PDF) — see context/15.
