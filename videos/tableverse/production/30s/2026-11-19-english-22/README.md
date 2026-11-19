# TableVerse — "Too Many Aliens!" (3 lifts × 4 seats = 12; the 13th is left over) · batch 2026-11-19 · english-22 · 01

Deliverables (this folder):
- `tableverse-30s-english22-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english22-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): close-up of a
  packed lift, the tiny orange alien squashed in the straining doors, headline "TOO MANY ALIENS!".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`) with the entertainment-first feedback
(`context/17`) and this brief's format updates: captions centred at y 372 (band ≈ 294–450), one headline (frame 0
only) and no persistent equation card — the only equation is the payoff sign; hard cuts on the 100 bpm beat grid
(18 frames) between close-ups and wide shots. Brief, topic decision (leftovers instead of the covered 3 groups of 4),
script, sources: `context/20-episode-too-many-aliens.md`. QA: `qa/QA.md`.
Code base: the approved english-21 renderer, book, lamp, bunting, captions, CTA card and baker (folded flat during
close-ups); new: cut-paper alien puppet (`src/alien.mjs`), moon-hotel lobby page, sliding-door lifts with seats and
up/down indicators, shot-based camera with cuts, stage drawn directly at camera scale with 2× cached textures (sharp
close-ups), group outlines, left-over ring, payoff sign, blurred moon-rock foreground; music in A-flat major.

## Shot / scene table (frames @ 30 fps; cuts on the beat)
| frames | shot | on screen | VO |
|---|---|---|---|
| 0–90 | close-up lift 1 (frame 0 = thumbnail) | tiny alien wedged in the doors of a packed lift; pops out (f54), lands (f72); headline folds (f80–94) | "Too many aliens! The little one can't squeeze in!" |
| 90–144 | cut: close-up lift 2 | dash, squeeze, belly-bounce, pop (f120) | "Lift two? Full!" |
| 144–216 | cut: close-up lift 3 | dash, squeeze, antenna caught and stretched (f172–186), twang, lands dizzy (f200) | "Lift three? Full again!" |
| 216–306 | cut: wide → push-in | stomps to the middle, arms crossed, foot taps on the beat, steam | "Why is there never room?" |
| 306–474 | cut: wide | dings: lifts 1–3 open (f324/342/360); each lift's group outline appears on its count (f414/432/450) | "Let's peek inside!" "Each lift has four aliens." "Four! Eight! Twelve!" |
| 474–570 | push-in | seats glow; the tiny alien hops into a pool of light (f510), everyone looks at it | "Twelve seats. But one more alien makes thirteen!" |
| 570–720 | cut: wide | sign 3 × 4 = 12 (f578), groups pulse (f584), left-over ring (f618); doors shut, the twelve ride up, lift 1 comes back | "Three times four is twelve, so one is left over." |
| 720–810 | cut: close-up lift 1 | empty lift opens (f726); the tiny alien zooms in and sprawls (f756), winks (f794) | "The next lift is all yours, little one!" |
| 810–900 | cut: wide | page turns to the TableVerse card; baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-19-english-22
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt   # + faster-whisper for qa ASR
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4 (~70 s on 4 cores)
node src/render.mjs --thumb tableverse-30s-english22-01-thumbnail.png   # = frame 0
ASR_CACHE=<model cache> bash qa/run_qa.sh <python-with-faster-whisper>   # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). Baker, craft primitives, book,
  bunting, lamp, captions and CTA card reused from the approved earlier TableVerse episodes (same repo); aliens, lobby,
  lifts, sign, outlines and moon-rock foreground are new. App icon = verified asset `videos/tableverse/assets/icon.png`
  (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS 3.OA.A.1, 3.OA.C.7, 4.OA.A.3, 4.NBT.B.6; England NC KS1–2 (Y5) — see context/20.
