# QA: plan-my-wedding-30s-round02-01.mp4

Script, storyboard, citations and feedback adjustments are in `../../../context/08-episode-2026-11-03-round02-01.md`.

| Check | Result |
|---|---|
| Duration / format | 30.000 s; H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 decoded frames; AAC LC 48 kHz stereo 30.000 s |
| Full decode | `ffmpeg -v error -i … -f null -`: no errors (qa/decode.log empty) |
| Loudness | −16.0 LUFS integrated, true peak −1.5 dBFS (two-pass loudnorm) |
| Narration | 8 lines, 74 words, no overlaps; CTA 26.75–29.29 s (last 3.25 s) |
| Captions | each strip opens at its VO line start; strip y≈357–493 (band 340–520), ≤2 lines, text ≤740 px, inside x 90–990; top 300 px clear |
| Claims | fictional figures, labelled "Illustrative figures only" and "made-up"; one qualification ("Fees vary"); advice matches NY DOS (written quotes, ask about taxes/fees) and CMA209 (headline vs mandatory charges, like-for-like); app CTA matches the listing |

## Defects found and fixed
1. Cost-block labels collided with their amounts → shorter labels ("Extra hours", "Cleaning") and wider blocks.
2. Sign price and sub-line overlapped → taller sign and re-spaced text.
3. S1 halls were small and the tags covered the roofs → larger halls, tags raised to y≈880.
4. Falling blocks and cards passed through the top band and captions → they now drop from below the caption band.
5. The deposit coin covered "Deposit: wait" → the coin starts to the right of the label.

## Known limitations
- Code-rendered paper, with intentional 12 fps stepping.
- The voice blend was checked objectively (levels, no NaN/clipping, timing) but not by listening.
