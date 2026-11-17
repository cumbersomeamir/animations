# Production notes: mello-30s-english19-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- Palette: store-sampled values from `context/22`.
- Topic swap: if-then plans are already covered (hindi04-01; swapped in english10 and english17; shoes by the door in english15). This episode covers the fresh start effect (`context/29`).
- Sources: Dai, Milkman & Riis 2015 (PMC full text) and the 2014 paper's title and citation from its reference list.

## Retained (approved setup)
The source is a copy of `../../2026-11-15-english-18/project/` (renderer, audit, audio chain). The scene is spliced onto the english15 room scene. Reused unchanged:
- `render.mjs` (with the 2026-11-15 caption-zone audit), the room, the faceless performer rig, the camera helper and caption mechanics (x 100–900).
- The dark in-app card.
- The narrator (synthesized fresh), the soothing air bed and the master chain.
- Indoor caption colours.

## New for this episode
- **A giant standing calendar** (1.0 × 1.3 m page on an easel with a deep-violet top bar). Its pages are canvas textures:
  - SUNDAY 7 with crossed-out slip-ups;
  - MONDAY 1 with a gold sunrise;
  - SUMMER BREAK, DAY 1;
  - a month grid (today the 10th ringed).
- **Page swings:** a door-style swing hinged on the left edge, opening toward a front-right camera. Mid-swing at frame 0; MONDAY → SUMMER BREAK in S5.
- **The drifting page:** Sunday's page drifts away into the back of the room and fades (S6).
- **The DAY 1 tag:** a gold tag the performer sets on the coming Monday (S7).
- **The card:** dark, two stages:
  - "ONE STUDY": a March week strip with THU 20 ringed;
  - "WHO PICKED MARCH 20": "third Thursday" 7% (outline) vs "first day of spring" 26% (gold), bars to scale out of 30%.
- **Audit:** an invisible "pageText" plane over the page's text area (top 0.98 m) is the calendar's crucial box. It is excluded in S6, where the calendar is background.
- **Sound:**
  - paper rustles for the page swings, a soft swish as the old page drifts;
  - ticks for the strip and bars, a soft tap for the tag;
  - felt-piano notes on beats over the soothing air bed;
  - `BED_GAIN` 0.44 puts the bed 12.9 dB under the voice.

## Fix log
1. The first calendar was framed too high; its headers collided with the captions. Shots were lowered and reframed.
2. An up-flip (hinged at the top) was nearly edge-on from the front and did not read. It became a door-style swing; the page then hid the new page from a left camera, so the hinge moved to the left edge with a front-right camera.
3. The performer stands right of the calendar in S1–S6 and left in S7, to reach the Monday column.
4. The drifting page left the frame and went into the caption band. Its path now runs back-left and slightly down, and S6 is framed from the front-right.
5. The calendar was hidden in the card shots for a clean background.
6. Audit (pre-render): the page's text area was 1–15 px past the left margin in S2/S5 and 8 px into the right rail early in S7. The cameras were nudged 0.03–0.04 m.
7. `BED_GAIN` went from 0.50 to 0.44 (11.8 → 12.9 dB). ASR is exact on the narration and on the mix ("20th" normalised).
8. Render 1 (sha256 `2ff4ef92…`, superseded and overwritten at the same path) passed 15 of 16 checks. `cuts_on_plan` failed: the S3→S4 cut (frame 237) changed the frame by only 8.8 (it needs more than 10), because both shots were the same card on a plain background, only 5° apart.
   - S4 now looks up at the card from a low angle (el −5°, az −30°→−24°); the cut contrast measured on stills is 19.4.
   - S4's target moved to x 0.17 to keep the card clear of the right rail (dark card x 82–894).
   - The performer is hidden during the two card shots (his head peeked in at the frame edge).
   - Render 2 is the final.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-17-english-19/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english19-01-thumbnail.png
```

## Known limitations
- I can't listen to audio. The narration is verified only by a per-line ASR round-trip, and the bed only by level measurements. Someone should give it a listen.
- The studies measured reminder sign-ups (1A, 1B), engagement and motivation, not goal achievement; the script says only "chose it".
- The calendar, its pages, the slip-up marks and the DAY 1 tag are staging.
