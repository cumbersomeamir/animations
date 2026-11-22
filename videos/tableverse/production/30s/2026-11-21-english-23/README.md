# TableVerse — "Is It Time Yet?" (three jumps of five minutes: 3 × 5 = 15) · batch 2026-11-21 · english-23 · 01

Deliverables (this folder):
- `tableverse-30s-english23-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english23-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): the sleepy dragon
  squashed under an absurd giant pillow on the cloud platform, headline "IS IT TIME YET?".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`) with the entertainment-first feedback
(`context/17`) and the format rules set in batch 22 (`context/20`): captions centred at y 372, one headline (frame 0
only), no persistent equation card (the only equation is the payoff sign), hard cuts on the 100 bpm beat grid,
stage drawn at camera scale with 2× page texture, music ducked −11 dB under speech. Brief, topic decision (telling time in
fives instead of the covered equal groups), script, sources: `context/21-episode-is-it-time-yet.md`. QA: `qa/QA.md`.
Code base: the approved english-22 renderer, book, lamp, bunting, captions, CTA card and baker (folded flat in close
shots); the approved english-17/18 robot (`src/robot.mjs`, new conductor-cap option); new: cut-paper sleepy dragon and
giant pillow (`src/dragon.mjs`), enchanted cloud-station page, station clock with jumping big hand and five-minute
wedges, cloud train with a sliding door, payoff sign under the clock, cloud-puff foreground; music in D-flat major.

## Shot / scene table (frames @ 30 fps; cuts on the beat)
| frames | shot | on screen | VO |
|---|---|---|---|
| 0–54 | close (frame 0 = thumbnail) | dragon squashed under the giant pillow, snoring; headline folds (f36–50) | "Is it time yet?…" |
| 54–126 | cut: wide | station: clock at :00, cloud train, conductor robot | "…The cloud train leaves when the big hand reaches three!" |
| 126–162 | cut: close-up dragon | one eye opens, yawn | "Wake up, sleepy dragon!" |
| 162–234 | cut: clock close-up | big hand jumps to 1 (f162), first wedge | "Five minutes. Not yet!" |
| 234–270 | cut: close-up dragon | flops back, snores (music out) | — |
| 270–306 | cut: clock close-up | jump to 2 (f270) | "Ten minutes…" |
| 306–396 | cut: wide | the dragon charges the door with the pillow overhead — jam (f340), bounce; robot wags a finger | "…Still not yet!" |
| 396–432 | cut: clock close-up | jump to 3 (f396) | "Fifteen minutes…" |
| 432–558 | cut: wide | whistle (f448), the pillow squeezes through the door and pops (f486), door shuts, train puffs away (f510–558) | "…All aboard!" |
| 558–810 | cut: clock close-up | three wedges pulse (f574/592/610); sign 3 × 5 = 15 (f650); hand steps 4–7 (f720–774) | "The big hand made three jumps of five minutes." "Three times five is fifteen." "Each number on the clock is five more minutes!" |
| 810–900 | cut: wide | page turns to the TableVerse card; baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-21-english-23
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt   # + faster-whisper for qa ASR
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4 (~80 s on 4 cores)
node src/render.mjs --thumb tableverse-30s-english23-01-thumbnail.png   # = frame 0
ASR_CACHE=<model cache> bash qa/run_qa.sh <python-with-faster-whisper>   # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). Baker, robot, craft primitives,
  book, bunting, lamp, captions and CTA card reused from the approved earlier TableVerse episodes (same repo); dragon,
  pillow, cloud station, clock, train, sign and cloud foreground are new. App icon = verified asset
  `videos/tableverse/assets/icon.png` (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS 2.MD.C.7, 3.MD.A.1, 3.OA.A.1, 3.OA.C.7; England NC KS1–2 (Y2) — see context/21.
