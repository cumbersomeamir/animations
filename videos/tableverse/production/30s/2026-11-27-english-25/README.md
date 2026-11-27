# TableVerse — "When's the Big Boom?" (common multiples by rhythm: 2s and 3s meet on 6 = 2 × 3, then 12) · batch 2026-11-27 · english-25 · 01

Deliverables (this folder):
- `tableverse-30s-english25-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english25-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): two frog drummers
  on a lily-pad stage in a dusk pond, sticks raised, headline "WHEN'S THE BIG BOOM?".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`) with the entertainment-first feedback
(`context/17`) and the format rules set in batch 22 (`context/20`): captions centred at y 372, one headline (frame 0
only), the only equation is the payoff sign, hard cuts on the 100 bpm beat grid, stage drawn at camera scale with 2×
textures, music ducked −11 dB under speech. Brief, topic decision (common multiples instead of the covered three groups
of four), script, sources: `context/23-episode-whens-the-big-boom.md`. QA: `qa/QA.md`.
Code base: the approved english-24 renderer, book, lamp, bunting, captions, CTA card and baker (folded flat in close
shots); new: cut-paper frog drummers and drums (`src/frog.mjs`), dusk-pond page, lily-pad stage with lotus, paper wave
the stage sinks behind, twelve numbered lily pads with a hopping firefly (one pad per beat), orange/cyan hit-dot rows and
the glowing "together" column, BOOM starburst and splash, payoff sign, pond foreground; drum, boom, splash and gurgle
foley; music in F-sharp major with bars starting on counted beat 1.

## Shot / scene table (frames @ 30 fps; cuts on the beat)
| frames | shot | on screen | VO |
|---|---|---|---|
| 0–54 | close (frame 0 = thumbnail) | both frogs, sticks up, eyeing each other; headline folds (f30–44) | "When's the big boom?…" |
| 54–108 | cut: wide | the dusk pond, the stage, the twelve numbered pads, firefly | "…Two frog drummers want to hit together!" |
| 108–162 | cut: close | Big Frog's show-off hit (f126) with sound arcs | "Big Frog drums every two beats." |
| 162–216 | cut: close | Little Frog's hit (f180) | "Little Frog drums every three beats." |
| 216–360 | cut: wide | firefly lands on pads 1–6 on the beats (f234–324); hits on 2, 3, 4; BOOM on 6: starburst, leap, splash | "One! … Six!" |
| 360–498 | cut: beat-line close | orange dots pulse under 2, 4, 6 (f402/412/420); cyan under 3, 6 (f464/474) | "Why six? Big Frog plays two, four, six." "Little Frog plays three, six." |
| 498–604 | cut: medium | column under 6 pulses (f504/524); sign 2 × 3 = 6 drops (f566) | "Six is in the twos and the threes: two times three is six!" |
| 604–810 | cut: wide | dashed dots wait under pad 12 (f616); beats 7–12 (f666–756), BOOM on 12; the stage sinks (f758–784), pops up (f788–806) | "So they boom again on twelve!" |
| 810–900 | wide | page turns to the TableVerse card; baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-27-english-25
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt   # + faster-whisper for qa ASR
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4 (~65 s on 4 cores)
node src/render.mjs --thumb tableverse-30s-english25-01-thumbnail.png   # = frame 0
ASR_CACHE=<model cache> bash qa/run_qa.sh <python-with-faster-whisper>   # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). Baker, craft primitives, book,
  bunting, lamp, captions and CTA card reused from the approved earlier TableVerse episodes (same repo); frogs, drums,
  pond, stage, pads, firefly, dots, sign and foreground are new. App icon = verified asset
  `videos/tableverse/assets/icon.png` (sha256 0ad7f267…9561), end card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS 4.OA.B.4; England NC KS1–2 (Years 2, 5, 6) — see context/23.
