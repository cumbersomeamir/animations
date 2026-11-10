# QA: plan-my-wedding-30s-english09-01.mp4

Full record (transcript, storyboard, sources, style notes, publishing caption): `../../../context/15-episode-2026-11-08-english09-01.md`.

| Check | Result |
|---|---|
| Format | 30.000 s; H.264 High 1080x1920 yuv420p 30 fps (900 frames); AAC 48 kHz stereo 30.000 s |
| Decode / loudness | Full decode clean; −16.0 LUFS, −1.5 dBTP; music ducked under the voice |
| Language | English narration and English captions only |
| Voice / listening | Approved Kokoro blend (0.7 af_bella + 0.3 am_puck, speed 0.98), run locally. ASR only: Whisper large-v3-turbo on the final MP4 matches the script word for word |
| Captions | ≤2 lines; strip y≈357–493, x 90–990; each opens at its VO line start; top 300 px clear |
| Hook / CTA | Frame 0: vows with sound rings dying after row 3 and "?" on the back rows. One CTA sentence at 26.60–29.28 s |
| Claims | Quote labelled "Made-up quote"; no prices; no universal equipment rule. "In writing" is backed by NY DOS; the checklist CTA is backed by the Play listing |

## Defects found and fixed
1. **Crossed mics.** Raised hand-held mics crossed between the couple. They became clip-on mics plus a "2 mics" tag.
2. **Hidden tag.** The "backup on" tag was hidden behind a guest. It is now drawn in front and moved left.
3. **Missing ✓.** The ✓ glyph does not exist in Jost; "Every row hears" now has a drawn check.
4. **Vanishing bubbles.** The back-row "?" bubbles vanished briefly at 1.4 s. They now pulse instead.

## Known limitations
- Code-rendered paper with intentional 12 fps stepping.
- No human listen; ASR is the proxy.
