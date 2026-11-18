# TableVerse — "The Octopus's Square Picnic" (4 × 4 = 16, a square number) · batch 2026-11-18 · english-21 · 01

Deliverables (this folder):
- `tableverse-30s-english21-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english21-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): the octopus
  holding four picnic baskets of four oranges over a gingham blanket, "4 × 4 = ?", headline "A SQUARE OF ORANGES?".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`, incl. the 2026-11-13 update), with the
2026-11-18 entertainment-first feedback (`context/17`). Brief, topic decision (square numbers instead of the
already-covered 7 × 4 = 28), script, sources: `context/19-episode-octopus-square-picnic.md`. QA: `qa/QA.md`.
Code base: the approved english-20 renderer, book, lamp, flip card, captions, CTA card and baker; new: cut-paper octopus
puppet (`src/octopus.mjs`: eight tapered arms on split pins, idle / reach / bezier poses, expressive eyes), paper
seaside page, gingham blanket, picnic baskets, oranges, measuring rings, dashed square outline; music in C major.

## Scene table (frames @ 30 fps)
| frames | beat | on screen | VO |
|---|---|---|---|
| 0–130 | hook (frame 0 = thumbnail) | octopus holds 4 baskets × 4 oranges, other arms wave; card 4 × 4 = ?; push-in; headline folds (f120–134) | "Can sixteen oranges make a perfect square? Ask this silly octopus!" |
| 130–196 | baskets | baskets bounce in turn (f134–158) | "Four baskets, four oranges in each." |
| 196–266 | mess | baskets tip (f200–212); oranges bounce and roll into two piles on the sand (f204–235); basket 1 spins onto its head, bonk + dizzy (f234) | "Uh oh! It tips them all out. What a mess!" |
| 266–352 | tidy | four arms per row carry the oranges into rows 1–4 (f276–346) | "Tidy up, octopus! Four in every row." |
| 352–444 | question | proud; untimed pause f408–440 with a hat-scratch | "Four rows of four. Is it a square?" |
| 444–532 | measure | arm along the top row (f448–472), arm down the right column (f476–500), rings on measured oranges; square outline pops (f504) | "Four across, four down. The same both ways!" |
| 532–614 | count | rows glow in turn; caption 4 → 4, 8, 12, 16 | "Four! Eight! Twelve! Sixteen!" |
| 614–810 | payoff | card 4 × 4 = 16 (f631); outline pulses (f668, 712, 740); arms present the square; square dance (f758–810), wink (f798) | "Four times four is sixteen. It's a square number!" "A number times itself makes a square." |
| 810–900 | CTA | page turns to the TableVerse card; baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-18-english-21
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt   # + faster-whisper for qa ASR
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4 (~1.5 min on 4 cores)
node src/render.mjs --thumb tableverse-30s-english21-01-thumbnail.png   # = frame 0
ASR_CACHE=<model cache> bash qa/run_qa.sh <python-with-faster-whisper>   # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). Baker, craft primitives, book,
  flip card, captions and CTA card reused from the approved earlier TableVerse episodes (same repo); octopus, beach,
  blanket, baskets, oranges and square outline are new. App icon = verified asset `videos/tableverse/assets/icon.png`
  (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: Oak National Academy "Represent a square number"; England NC KS1–2 (Y5); CCSS 2.G.A.2, 3.OA.A.3, 3.OA.A.4,
  3.OA.D.9 — see context/19.
