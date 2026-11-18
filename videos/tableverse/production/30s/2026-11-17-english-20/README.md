# TableVerse — "More Boxes, More Cookies?" (4 × 6 = 8 × 3 = 24) · batch 2026-11-17 · english-20 · 01

Deliverables (this folder):
- `tableverse-30s-english20-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english20-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): four boxes of six
  star cookies, the sneaky mouse with a giant saw, "4 × 6 = 24", headline "MORE BOXES, MORE COOKIES?".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`, incl. the 2026-11-13 update), with the
2026-11-18 feedback applied: entertainment first (`context/17`). Brief, topic decision (double-and-halve instead of the
already-covered "double a known fact"), script, sources: `context/18-episode-more-boxes-more-cookies.md`. QA: `qa/QA.md`.
Code base: the approved english-19 renderer, book, lamp, flip card, captions, CTA card, baker and mouse
(`src/mouse.mjs` gains comic options: wide / dizzy / sly / wink eyes, gasp / grin mouths, roll, ears-up, paw positions);
new: long cookie boxes that split on a seam, shelves, counter, awning, cut-paper saw, comic SFX, music in G major.

## Scene table (frames @ 30 fps)
| frames | beat | on screen | VO |
|---|---|---|---|
| 0–104 | hook (frame 0 = thumbnail) | 4 boxes × 6 cookies, mouse with saw; card 4 × 6 = 24; tiptoe + saw glint + push-in; headline folds (f100–114) | "More boxes, more cookies? This sneaky mouse thinks so!" |
| 104–182 | boxes | boxes hop in turn (f108–126); card glows (f142) | "Four boxes of six: twenty-four cookies." |
| 182–320 | saw | saw raised (f182–210), super-leap (f214–228), saw + "Zip!" ×4: boxes split (f240/258/276/294), jump down, halves slide apart (f300–331) | "Out comes the saw!" "Zip!" ×4 |
| 320–438 | question | victory jump; card 8 × 3 = ? (f325); drumroll pause f366–398 | "Eight boxes! More cookies?" "Let's count in threes!" |
| 438–600 | count | each small box hops in reading order; the card shows only the running total 3 … 24 | "Three!" … "Twenty-four!" |
| 600–698 | payoff | card 8 × 3 = 24 (f605); the take (eyes pop, dizzy, topples f644–656); halves rejoin as four sixes (f652–676), pairs glow | "Still twenty-four! Eight threes, same as four sixes!" |
| 698–810 | takeaway | card 8 × 3 = 4 × 6 (f703); halves slide apart (f712–746); all 24 glow (f770); mouse sits up, shrugs, laughs, winks (f798) | "Double the boxes, cut each box in half: same total!" |
| 810–900 | CTA | page turns to the TableVerse card; baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-17-english-20
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt   # + faster-whisper for qa ASR
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4 (~6 min on 4 cores)
node src/render.mjs --thumb tableverse-30s-english20-01-thumbnail.png   # = frame 0
ASR_CACHE=<model cache> bash qa/run_qa.sh <python-with-faster-whisper>   # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). Mouse, baker, star cookie and
  craft primitives reused from the approved earlier TableVerse episodes (same repo); boxes, saw, shelves, counter,
  awning and comic expressions are new. App icon = verified asset `videos/tableverse/assets/icon.png`
  (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS Mathematics 3.OA.A.1, 3.OA.B.5, 3.OA.C.7; England National Curriculum Mathematics KS1–2 — see context/18.
