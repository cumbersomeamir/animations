# Production notes: mello-30s-english16-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- Palette: store-sampled values from `context/22`. The dusk sky follows the store's own first screenshot (a violet dusk landscape).
- Topic swap: the proposed unfinished-task / plan topic is already covered (english12-01), so this episode covers awe walks (`context/26`).
- Sources: Sturm et al. 2022 and Piff et al. 2015 (PubMed abstracts).

## Retained (approved setup)
The source is a copy of `../2026-11-15-english-15/project/`. Reused unchanged:
- `render.mjs` (with the 2026-11-15 caption-zone audit), the faceless performer rig and camera helper, caption mechanics (x 100–900) and the dark in-app card.
- The narrator (synthesized fresh), the soothing air bed and the master chain.

## New for this episode
- **Outdoors:** the room is hidden. Added:
  - a gradient sky dome, two twinkling star layers, a big moon with a halo;
  - a meadow with a gentle hill;
  - a grove of six towering trees and a path;
  - a far band of buildings with lit windows.
- **Lighting:** the key light follows the action (hill → grove).
- **Captions and lock-up:** white with gold key words and a soft shadow, for the dark sky (`scene/index.html`).
- **In-scene text:** card "ONE STUDY", "older adults", "weekly", "15 min", "8 weeks", "awe walk vs ordinary walk"; photo card "week 1/3/5/8", then "daily distress", "awe walkers, over 8 weeks", "week 1", "week 8".
- **Choreography:** he looks up from the hill; he walks the grove path (gait and arm swing) and stops under the tallest tree to look up.
- **Sound:**
  - a soft glide as the camera rises;
  - footsteps on the path until he stops;
  - felt-piano notes on the beats over the soothing air bed;
  - `BED_GAIN` 0.39 puts the bed 13.0 dB under the voice.

## Fix log
1. ASR heard "That's awe" as "That's all", so the line was rephrased. Digits "15" are normalised. CER 0 on all 7 lines.
2. The first skyline was huge and close and swamped the sky; it became a thin, far band on the horizon.
3. The cards stood in front of the performer (a "sign-holder" look); they now hang in the sky among the stars, without him in shot.
4. Frame 0: the figure moved in from the edge and the moon moved below the caption. In S4 the camera turns away from the moon so the gold key words stay legible.
5. S5: the camera now follows the walk (k0 → k1), then a low look up the tallest tree (k2). The moon is hidden here so it never sits behind the lock-up.
6. The photo card touched the right rail; the camera pulled back slightly.
7. Pre-render audit: 300 samples, 0 issues.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-15-english-16/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english16-01-thumbnail.png
```

## Known limitations
- I can't listen to audio; the narration is verified only by a per-line ASR round-trip, and the soothing bed only by level measurements. Someone should give it a listen.
- The selfies and the distress bar are illustrative of the reported direction; they are not data. The study was small (60 healthy older adults).
