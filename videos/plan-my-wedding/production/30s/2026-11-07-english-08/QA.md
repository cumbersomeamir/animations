# QA: plan-my-wedding-30s-english08-01.mp4

Full record (transcript, storyboard, sources, style notes, publishing caption): `../../../context/14-episode-2026-11-07-english08-01.md`.

| Check | Result |
|---|---|
| Format | 30.000 s; H.264 High 1080x1920 yuv420p 30 fps (900 frames); AAC 48 kHz stereo 30.000 s |
| Decode / loudness | Full decode clean; −16.0 LUFS, −1.5 dBTP; music ducked under the voice |
| Language | English narration and English captions only |
| Voice / listening | Approved Kokoro blend (0.7 af_bella + 0.3 am_puck, speed 0.98), run locally. ASR only: Whisper large-v3-turbo on the final MP4 matches the script word for word |
| Captions | ≤2 lines; strip y≈357–493, x 90–990; each opens at its VO line start; top 300 px clear |
| Hook / CTA | Camera flash and spilling prints on frame 0; one CTA sentence at 26.72–29.68 s |
| Claims | Quote labelled "Made-up quote" on screen; 1 print = 10 photos (20 = 200, 5 gold = 50, 15 grey = 150). "In writing" is backed by NY DOS. CTA "request vendor quotes" is backed by the Play listing |

## Defects found and fixed
1. **Magnifier position.** It covered the counter and read only "150 bas". The fine print moved lower, and the lens now reads "50 fully" and then "150 basic" on the spoken words.
2. **Hook leftovers.** They stayed visible under the opening quote card. The hook now folds toward the grid and fades, and the fold starts earlier (10.85 s).
3. **Frame 0.** It showed only the camera; the flash now fires on frame 0.
4. **Empty space under the questions banner.** Numbered slots now fold in and fill as each question is asked.
5. **"In writing" payoff too brief.** A "Signed quote" line now arrives with question 3; the signature and tag land on the words.

## Known limitations
- Code-rendered paper with intentional 12 fps stepping.
- No human listen; ASR is the proxy.
