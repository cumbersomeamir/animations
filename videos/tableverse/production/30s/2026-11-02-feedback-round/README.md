# TableVerse — "Four Groups of Three" (30 s, feedback round 2026-11-02, sample 01)

Deliverable: `tableverse-30s-feedback-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC 48 kHz stereo.
Style: **Pop-up Counting Storybook** (recipe: `videos/tableverse/context/08-format-and-style.md`).
Episode brief, narration and fact sources: `videos/tableverse/context/09-episode-four-groups-of-three.md`.
QA: `qa/QA.md` (+ `qa/ffprobe.json`, `qa/contact_sheet.png`, `qa/frames/`, `qa/asr_words.txt`, `qa/loudness.txt`).

## What happens (frames @ 30 fps)
| frames | scene | mechanism on screen | narration |
|---|---|---|---|
| 0–96 | open | cover page flips up on the top hinge; awning, shelf, crate of 12 apples, TOTAL sign and the split-pin baker pop up; four folded baskets pop up one by one | "Our baker has four baskets." |
| 96–160 | need | a "3" tag flips down on each basket; baker points | "Each basket needs three apples." |
| 160–380 | fill | baker tosses apples one at a time along dotted paper tracks: exactly 3 per basket; each full basket glows once; TOTAL flip-card 0→3→6→9→12 | "Let's fill them: three, six, nine, twelve." |
| 380–510 | meaning | group badges 1–4; card "4 groups of 3 = 12", flap unfolds "4 × 3 = 12" | "Four equal groups of three make twelve. That is what four times three means." |
| 510–632 | regroup | card folds away, the same 12 apples lift out, the page turns, three tins pop up and the apples glide in 4 per tin; each full tin glows once; badges 1–3; card "3 groups of 4 = 12" / "3 × 4 = 12" | "Now watch the same apples move: three groups of four still make twelve." |
| 632–722 | same | number badges 1…12 pop on the apples one by one; TOTAL pulses at 12 | "The arrangement changed; the number of apples did not." |
| 722–790 | draw | page turns to a pinned sheet; a paper pencil draws 3 circles with 4 dots each, "3 groups of 4 = 12" | "Try drawing equal groups together." |
| 790–900 | CTA | page turns to the TableVerse card: verified app icon pops up, wordmark letters, "on Google Play"; floor props fold down; baker waves | "Play and learn tables together with TableVerse." |

Captions mirror the narration in the upper safe band (centre y = 430, x within 90–990, ≤ 2 lines).

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-02-feedback-round
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips are committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 3           # -> build/video.mp4
bash qa/run_qa.sh <python-with-faster-whisper>    # mux -> tableverse-30s-feedback-01.mp4 + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). App icon = verified asset
  `videos/tableverse/assets/icon.png` (sha256 0ad7f267…9561), used only on the end card.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98;
  model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5) and voices-v1.0.bin (sha256 bca610b8…bf7d),
  https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 (cached locally, no paid API).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples.
- Facts: CCSS Math 3.OA.A.1 and 3.OA.B.5 (thecorestandards.org, retrieved 2026-11-02) — see context/09.
- Visual reference (craft only, not subject): https://www.instagram.com/p/DfHxCPwTzrp/.
