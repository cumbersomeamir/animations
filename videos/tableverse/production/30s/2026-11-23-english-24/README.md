# TableVerse — "How Far Around?" (perimeter of a square: 4 × 8 = 32 hops) · batch 2026-11-23 · english-24 · 01

Deliverables (this folder):
- `tableverse-30s-english24-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english24-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): the little star
  at the corner of a big square rooftop above an enchanted vertical city, headline "HOW FAR AROUND?".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`) with the entertainment-first feedback
(`context/17`) and the format rules set in batch 22 (`context/20`): captions centred at y 372, one headline (frame 0
only), the only equation is the payoff sign, hard cuts on the 100 bpm beat grid, stage drawn at camera scale with 2×
textures, music ducked −11 dB under speech. Brief, topic decision (perimeter instead of the covered three groups of four),
script, sources: `context/22-episode-how-far-around.md`. QA: `qa/QA.md`.
Code base: the approved english-23 renderer, book, lamp, bunting, captions, CTA card and baker (folded flat in close
shots); the approved english-20 mouse (`src/mouse.mjs`) as the race starter with a chequered flag; new: cut-paper star
character (`src/star.mjs`), vertical-city page and towers, square roof garden with 32 hop stones, the measured-side
"ribbon" that rotates about the square's centre onto the other sides, equal-side ticks, speed lap with afterimages,
payoff sign, perimeter light, tiny-lift cameo; music in B major.

## Shot / scene table (frames @ 30 fps; cuts on the beat)
| frames | shot | on screen | VO |
|---|---|---|---|
| 0–54 | close (frame 0 = thumbnail) | the star at the roof corner shading its eyes; headline folds (f38–52) | "How far around?…" |
| 54–126 | cut: wide | the square roof on the vertical city; the mouse raises the start flag | "…This little star wants to hop one lap of the roof!" |
| 126–252 | cut: tracking | eight hops along the top side (f137–200), hop arcs; the side glows | "One side is eight hops." |
| 252–342 | cut: close → pull back | flops at the corner, tired puffs; pull back to the long way round | "Oof! Does it have to count every side?" |
| 342–450 | cut: wide | the measured side swings round the centre onto the right, bottom, left sides (f364–414); equal-side ticks (f432) | "No! It's a square, so all four sides are the same." |
| 450–600 | wide | cartwheel speed lap (f438–534), sides light as they finish; confetti + flag (f540) | "Eight! Sixteen! Twenty-four! Thirty-two!" |
| 600–810 | wide | sign 4 × 8 = 32 (f618); a light runs round the edge (f690–750); the sides pulse (f736–772); wink (f794) | "Four times eight is thirty-two hops." "The distance around is the perimeter: four times one side!" |
| 810–900 | wide | page turns to the TableVerse card; baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-23-english-24
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt   # + faster-whisper for qa ASR
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4 (~90 s on 4 cores)
node src/render.mjs --thumb tableverse-30s-english24-01-thumbnail.png   # = frame 0
ASR_CACHE=<model cache> bash qa/run_qa.sh <python-with-faster-whisper>   # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). Baker, mouse, craft primitives,
  book, bunting, lamp, captions and CTA card reused from the approved earlier TableVerse episodes (same repo); star, city,
  roof, ribbon, ticks, sign and foreground are new. App icon = verified asset `videos/tableverse/assets/icon.png`
  (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: Oak National Academy Y4 perimeter lessons; CCSS 3.MD.D.8, 4.MD.A.3, 3.OA.C.7; England NC KS1–2 (Y3–Y4) — see
  context/22.
