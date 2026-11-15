# TableVerse — "Pack in Sevens" (63 ÷ 7 = 9 and 9 × 7 = 63) · batch 2026-11-15 · english-16 · 01

Deliverables (this folder):
- `tableverse-30s-english16-01.mp4` — 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC, English VO + captions.
- `tableverse-30s-english16-01-thumbnail.png` — frame 0 of the film (the hook image is the thumbnail): 63 star
  cookies, pack 1 closed, the mouse pulling pack 2 shut, "63 ÷ 7 = ?", headline "HOW MANY PACKS?".

Style: approved **Pop-up Counting Storybook** (`context/08-format-and-style.md`, incl. the 2026-11-13 update).
Brief, topic decision (division instead of the already-covered "ten groups minus one"), script, sources:
`context/13-episode-pack-in-sevens.md`. QA: `qa/QA.md`. Code base: copied from the approved english-15 project
(perspective hinge renderer, book, baker, flip card, CTA card) with a new 9 × 7 star-cookie tray, see-through hinged
pack lids, an original cut-paper mouse puppet on split pins (`src/mouse.mjs`) who pulls each lid shut by a ribbon,
the lamp moved to the window side, and a new music sequence (key of B-flat).

## Scene table (frames @ 30 fps)
| frames | beat | on screen | VO |
|---|---|---|---|
| 0–100 | hook (frame 0 = thumbnail) | 63 cookies, pack 1 closed, mouse pulling pack 2; card "63 ÷ 7 = ?"; "HOW MANY PACKS?" folds away (f84–98) | "Sixty-three cookies, packed in sevens. How many packs?" |
| 100–176 | one pack | pack 1 glows; badges 1–7 on its cookies | "That's one pack. Seven cookies in each." |
| 176–262 | guess | question, untimed 1.4 s pause with a slow lean-in; mouse holds pack 2 half-closed | "Can you guess how many packs?" |
| 262–428 | count | the mouse closes packs 2–9, one every 20 frames; tags 2–9 | "Two! Three! … Nine!" |
| 428–546 | payoff | nine packs glow; card flips to "63 ÷ 7 = 9" on "nine" (f518) | "Nine packs! So sixty-three divided by seven is nine." |
| 546–646 | reverse | lids open in a wave (tags stay); card "9 × 7 = 63" on "sixty-three" (f610) | "Now unpack them: nine sevens make sixty-three." |
| 646–810 | takeaway | card "? × 7 = 63"; tags 1–9 bounce in turn; card back to "9 × 7 = 63"; rows pack again | "To divide, ask: what times seven makes sixty-three?" |
| 810–900 | CTA | page turns to the TableVerse card; baker waves | "Play and learn tables with TableVerse." |

## Reproduce
```
cd videos/tableverse/production/30s/2026-11-15-english-16
npm ci                                            # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
/tmp/tts/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>   # optional: clips committed
node src/render.mjs --timeline                    # -> timeline.json (shared by picture + sound)
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt
/tmp/av/bin/python -I audio/build_audio.py        # -> build/mix.wav
node src/render.mjs --video --workers 4           # -> build/video.mp4
node src/render.mjs --thumb tableverse-30s-english16-01-thumbnail.png   # = frame 0
bash qa/run_qa.sh <python-with-faster-whisper>    # mux + QA artefacts
```

## Sources & licences
- Picture: original code in `src/` (own cut-paper renderer on @napi-rs/canvas, MIT). The baker puppet and craft
  primitives are reused from the approved earlier TableVerse episodes (same repo); the mouse and the star cookie are
  new for this episode. App icon = verified asset `videos/tableverse/assets/icon.png` (sha256 0ad7f267…9561), end
  card only.
- Font: Fredoka, SIL Open Font License 1.1 (@fontsource/fredoka).
- Voice: established narrator — Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, blend af_bella 0.7 + am_puck 0.3,
  en-us, speed 0.98; cached model files kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d).
- Music and SFX: synthesised in `audio/build_audio.py` (numpy/scipy), no samples, no loop.
- Facts: CCSS Mathematics, Grade 3, 3.OA.A.2, 3.OA.A.4, 3.OA.B.6, 3.OA.C.7 (official PDF) — see context/13.
