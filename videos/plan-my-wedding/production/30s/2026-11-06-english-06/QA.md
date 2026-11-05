# QA: plan-my-wedding-30s-english06-01.mp4

Full record (transcript, storyboard, sources, style notes, publishing caption): `../../../context/12-episode-2026-11-06-english06-01.md`.

| Check | Result |
|---|---|
| Format | 30.000 s; H.264 High 1080x1920 yuv420p 30 fps (900 frames); AAC 48 kHz stereo 30.000 s |
| Decode / loudness | full decode clean; −16.0 LUFS, −1.5 dBTP; music ducked under the voice |
| Language | English narration and English captions only |
| Voice / listening | approved Kokoro blend (0.7 af_bella + 0.3 am_puck, speed 0.98), local; ASR only: Whisper large-v3-turbo transcript of the final MP4 matches the script word for word |
| Captions | ≤2 lines; strip y≈357–493, x 90–990; each opens at its VO line start; top 300 px clear |
| Hook / CTA | RSVP cards moving on frame 0; one CTA sentence at 26.17–29.60 s |
| Claims | fictional example spoken and tagged; arithmetic checked; no portion formula, prices or universal rules; CTA supported by the listing |

## Defects found and fixed
1. "yeses" heard as "Yessies" → rephrased.
2. Vendor tray header overlapped the children's counter → tray moved down.
3. Hook pile and labels too small → cards 1.6×, labels 72 px.
4. Tray counters showed "0" before their tokens → hidden until the count starts, with units added.

## Known limitations
- Code-rendered paper with intentional 12 fps stepping.
- No human listen; ASR is the proxy.
