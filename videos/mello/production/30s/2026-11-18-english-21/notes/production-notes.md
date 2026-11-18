# Production notes: mello-30s-english21-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- **Live feedback "No, match the colors of the published app, soothing audio also add":** this is applied with the store-sampled palette (`context/22`) and an original soothing pad and air bed under the voice.
- Topic swap: the unfinished-task / next-action-plan topic is english12-01, so this episode covers capitalization, sharing good news (`context/31`).
- Sources: Gable et al. 2004 and Reis et al. 2010 (PubMed abstracts).

## Retained (approved setup)
The source is a copy of `../../2026-11-17-english-20/project/` (renderer, audit, audio chain). The scene is spliced onto the english15 room scene. Reused unchanged:
- `render.mjs` (caption-zone audit), the room with its desk and lamp, the faceless performer rig and the second rig (`makeRig`/`poseStanding`).
- The camera helper, caption mechanics (x 100–900) and the dark in-app card.
- The narrator (synthesized fresh), the soothing air bed and the master chain.

## New for this episode
- **The evening desk:** the desk with the lamp on (warm point light 0.45) and a closed laptop (lilac-grey shell, no logo).
- **The friend:** the second rig, lighter, with gold hair. She is on her phone at first; then she looks up, raises her hands and nods (an enthusiastic response). In S6 she holds her own orb and shares it.
- **The good news:** small gold orbs (an emissive core and a soft glow sprite). They grow when shared, most of all with enthusiasm.
- **The card:** dark "DIARY STUDIES": "kept it" vs "shared it" arrows (direction only), then "beyond the good event itself".
- **Sound:**
  - a soft warm shimmer as an orb grows;
  - ticks for the card;
  - felt-piano notes on each brightening, over the soothing air bed.

## Fix log
1. **First stills:**
   - The orb was pale and small in frame 0, and its large glow sprite washed over the friend in S4–S5.
   - S5 looked at his back, and S6 lost him at the edge.
   - Fixes: a saturated gold core (emissive 0.55–1.0), a tighter glow (3.4–4.6× radius, opacity 0.35–0.65) and a closer frame 0. S5 is reframed from the front-right, and S6 is wider.
2. ASR is exact on the first takes.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-18-english-21/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english21-01-thumbnail.png
```

## Known limitations
- I can't listen to audio. The narration is verified only by a per-line ASR round-trip, and the bed only by level measurements. Someone should give it a listen.
- The diary results are associations. The orb's growth is a metaphor for "perceived value", not a measurement.
