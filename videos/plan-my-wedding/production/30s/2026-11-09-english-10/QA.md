# QA: plan-my-wedding-30s-english10-01.mp4

Full record (transcript, storyboard, sources, style notes, publishing caption): `../../../context/16-episode-2026-11-09-english10-01.md`.

| Check | Result |
|---|---|
| Format | 30.000 s; H.264 High 1080x1920 yuv420p 30 fps (900 frames); AAC 48 kHz stereo 30.000 s |
| Decode / loudness | Full decode clean; −16.0 LUFS, −1.5 dBTP; music ducked under the voice |
| Language | English narration and English captions only |
| Voice / listening | Approved Kokoro blend, run locally. ASR only: per-line and final-audio passes match. The long-form pass doubled one "and"; an isolated re-check of that segment is correct |
| Captions | ≤2 lines; strip y≈357–493, x 90–990; each opens at its VO line start; top 300 px clear |
| Hook / CTA | Frame 0: zoomed-in jam at one serving point ("!" bubbles, flipping hourglass). One CTA sentence at 26.55–29.30 s |
| Claims | Layout labelled "Made-up layout"; no numbers. Congestion/pinch-points backed by HSE; step-free and reach backed by the ADA 2010 Standards (reference only); CTA backed by the Play listing |

## Defects found and fixed
1. **Hook scale.** Tokens were too small and the hook was empty below the jam. Tokens are now 1.3× and the hook zooms in.
2. **Header overlap.** Exit pins covered the walkthrough header. They are now smaller and placed beside the exits.
3. **Label clash.** "to dining tables" clashed with exiting guests; it fades once the queues re-route.
4. **Header behind caption.** The plan header showed behind the opening caption; it now appears after the zoom.

## Known limitations
- Code-rendered paper with intentional 12 fps stepping.
- The 0.7 s queue re-route passes through intermediate positions.
- No human listen; ASR is the proxy.
