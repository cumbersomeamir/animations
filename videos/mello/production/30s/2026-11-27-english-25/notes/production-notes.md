# Production notes: mello-30s-english25-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- **Live feedback "No, match the colors of the published app, soothing audio also add":** applied with the store-sampled palette (`context/22`) and an original soothing pad, felt-piano and air bed under the voice.
- **Topic swap:** a when-then implementation intention (the brief's proposal) is hindi04-01 (`context/14`), and was swapped out in english10/17/19. This episode covers the mid-goal slump and the small-area trick (`context/35`, "Topic decision").
- **Sources:**
  - Bonezzi et al. 2011 and Touré-Tillery & Fishbach 2012 (PubMed abstracts);
  - Koo & Fishbach 2012 (abstract via Crossref);
  - Emanuel 2019 (PMC full text, for the study details).

## Retained (approved setup)
The source is a copy of `../../2026-11-23-english-24/project/` (renderer, audit, audio chain, `no_jump_between_cuts`, the hyphen-tolerant ASR normaliser). The scene is spliced onto the english15 room scene. Reused unchanged:
- `render.mjs` (safe-zone audit, caption band x 100–900, y 280–460), the room, the approved faceless performer and `poseStanding`.
- The camera helper, caption mechanics and the dark in-app card.
- The narrator (synthesized fresh), the soothing air bed and the master chain.

## New for this episode
- **The progress tube:** a lilac glass tube on a deep-violet base and a lilac plinth (0.42 m, so the whole tube sits above the bottom zone). It has ten slots with thin rings and a gold ring at halfway.
- **Balls:** ten gold balls dropped from his left hand. They follow a per-shot schedule (`schedule`/`tubeState`); each falls under constant acceleration and settles with a small bounce.
- **The counter tag:** a dark card beside the tube top. It reads "N done" early and "N left" past halfway, with a short flip at the switch, and retires when the tube is full (the tube glows gold).
- **The card:**
  - "ONE STUDY / proofreading nine articles: typos caught": nine page icons with U-shaped bars (gold at the start and end, lilac in the middle; direction only);
  - "OTHER STUDIES / watching the smaller number": a progress bar at 20% done (ringed) → 80% done with "20% left" ringed (the paper's own example).
- **Sound:**
  - Dm7 → Fmaj7 → Am7 → Cadd9, with felt notes on the focus switch and the tag flips;
  - SFX: a soft air sigh on "sag", card ticks, a glassy clink on each landing (rising slightly as the tube fills), a flick on the tag switch, a chime when full;
  - `audio.py` mirrors the scene's drop schedule (`landings`), so each clink lands with its ball.
  - `BED_GAIN` 0.43 (13.0 dB under the voice).

## Fix log (stills and audit before the full render)
1. **Geometry:** for frame 0 to show the whole half-full tube *and* keep his head below the caption band, the tube stands on a plinth and the wide shots sit at about 4–4.6 m (head top ≥ 480 px, lowest ball above y 1540).
2. **First stills:**
   - The two long proof captions were auto-shrunk to fit; they are now split at word boundaries into three segments each.
   - The tag grew from 0.2 to 0.24 m, still left of the right rail.
   - In S5 the floor-to-wall seam showed as a grey band behind his shoulder; the camera elevation went from 8° to 15°.
3. **Cut check on stills:** S6→S7 changed by only 9.9 (S7 opened almost where S6 ended). S7 now opens from the left (az −20, el 12, 3.7 m): 15.2. All cuts: 15.4 / 24.5 / 22.1 / 60.3 / 20.2 / 15.2. In-shot motion: 0.4 (ball rush), 0.2 (tag flip), 1.3 (full glow).
4. **Safe-zone audit:** 0 issues in 300 samples, before and after the S7 change.
5. **ASR:** exact on all 7 lines, on the first takes and on the mix.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-27-english-25/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english25-01-thumbnail.png
```

## Known limitations
- I can't listen to audio. The narration is verified only by a per-line ASR round-trip, and the bed only by level measurements. Someone should give it a listen.
- ASR punctuates the hook "Stuck halfway through." with a full stop; whether it sounds like a question needs a human ear.
- Koo & Fishbach 2012 was read as an abstract; the Bonezzi study details come from Emanuel 2019's description. No effect sizes are shown.
- The tube, balls, counts and the U-shaped bars are illustrations.
