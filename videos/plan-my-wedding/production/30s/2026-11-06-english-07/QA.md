# QA: plan-my-wedding-30s-english07-01.mp4

Full record (transcript, storyboard, sources, style notes, publishing caption): `../../../context/13-episode-2026-11-06-english07-01.md`.

| Check | Result |
|---|---|
| Format | 30.000 s; H.264 High 1080x1920 yuv420p 30 fps (900 frames); AAC 48 kHz stereo 30.000 s |
| Decode / loudness | full decode clean; −16.0 LUFS, −1.5 dBTP; music ducked under the voice |
| Language | English narration and English captions only |
| Voice / listening | approved Kokoro blend (0.7 af_bella + 0.3 am_puck, speed 0.98), local; ASR only: Whisper large-v3-turbo on the final MP4 matches the script |
| Captions | ≤2 lines; strip y≈357–493, x 90–990; each opens at its VO line start; top 300 px clear |
| Hook / CTA | sun already sinking on frame 0; one CTA sentence at 27.04–29.72 s |
| Claims | example times tagged on screen; arithmetic checked (6:00 − 30 − 20 − 30 = 4:40); "check the real sunset for your date and place" backed by NOAA; CTA backed by the listing |

## Defects found and fixed
1. 23.6 s of speech left dead air → line 6 extended with useful, sourced detail; even 0.78 s breaths.
2. Late-start ghost label overlapped the Buffer label → moved to a tag above the timeline.
3. "still daylight" note collided with the couple → became the below-ruler tag "portraits keep their light ✓"; photographer shifted right.

## Known limitations
- Code-rendered paper with intentional 12 fps stepping.
- No human listen; ASR is the proxy.
