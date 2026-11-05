# QA: plan-my-wedding-30s-feedback05-01.mp4

Full record (transcript, gloss, storyboard, sources, style notes, publishing caption): `../../../context/11-episode-2026-11-05-feedback05-01.md`.

| Check | Result |
|---|---|
| Format | 30.000 s; H.264 High 1080x1920 yuv420p 30 fps (900 frames); AAC 48 kHz stereo 30.000 s |
| Decode / loudness | full decode clean; −16.0 LUFS, −1.5 dBTP; music ducked 60 % under the voice |
| Language & glyphs | all narration and captions in Hindi (Devanagari); Noto Serif Devanagari and Hind; no tofu |
| Voice / listening | local Kokoro Hindi voices + misaki/espeak-ng `hi`; ASR only: Whisper large-v3-turbo recovers all 7 sentences from the final MP4 audio |
| Captions | ≤2 lines; strip y≈340–510, x 90–990; each opens at its VO line start; top 300 px clear |
| Hook / CTA | rain cloud on frame 0 and visible rain from 0.12 s; one CTA sentence at 26.41–29.73 s |
| Claims | fictional venue labelled on screen; example decision time labelled "(उदाहरण)"; no rates, laws or DIY electrics; advice matches HSE and NY DOS guidance; CTA supported by the listing |

## Defects found and fixed
1. 72-word draft ran 29.85 s → trimmed to 64 words.
2. "प्लान बी" heard as "प्लान भी" → "बैकअप प्लान".
3. CTA heard as "Plan My Waiting" → G2P respelling "वैडिंग" → "Plan My Wedding" (A/B tested).
4. Wet-chair colour passed as rgb() to a hex-only shader → precomputed hex.
5. Rain too faint for the hook → bolder darker drops from 0.12 s, cloud in frame at t=0.
6. Umbrella overlapping the mandap → moved right; the venue sign folds first.
7. Rain drawn over the board hood while it folded (~13.9 s) → covered zone kept through the fold.

## Known limitations
- Kokoro Hindi voices are author-graded C: intelligible but less natural than its English voices.
- No human listen; ASR is the proxy.
