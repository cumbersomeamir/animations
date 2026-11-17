# Production notes: mello-30s-english18-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- Palette: store-sampled values from `context/22`.
- Topic: the illusion of transparency in public speaking, as requested. Not covered before; hindi03's spotlight effect is a sibling, kept separate (`context/28`).
- Sources:
  - the 1998 PubMed abstract;
  - MacInnis et al. 2010 (full text);
  - Savitsky & Gilovich 2003 (described in MacInnis et al.; its full text could not be fetched).

## Retained (approved setup)
The source is a copy of `../2026-11-15-english-17/project/` (renderer, audit, audio chain). The scene is spliced onto the english15 room scene. Reused unchanged:
- `render.mjs` (with the 2026-11-15 caption-zone audit), the room, the faceless performer rig, the camera helper and caption mechanics (x 100–900).
- The dark in-app card.
- The narrator (synthesized fresh), the soothing air bed and the master chain.
- Indoor caption colours (ink #191632, violet #633BFE key words).

## New for this episode
- **A small talk:** the desk set is hidden. Added:
  - a low stage with a violet lip;
  - a lectern (white, violet stripe);
  - eight seated audience members in two rows: simplified faceless figures in palette lilacs with violet, deep-violet and gold hair, with idle head motion and two nods.
- **The speaker:** the approved rig standing behind the lectern, gripping it with a slight tremble. In S6 he looks up and opens his right hand toward the audience.
- **The thought bubble:** a cloud of soft spheres with two trailing puffs and a pounding violet heart (camera-facing). The heart's phase is integrated from a rate: 1.75 beats/s, slowing to 0.95 between 21.2 and 24.6 s.
  - Visible in S1–S2 and S6.
  - In S5 its opacity follows the camera: full from behind him, gone from the audience's side.
- **The card:** dark "HOW NERVOUS, AFTER CLASS SPEECHES" ("one class study, averages"):
  - three bars to scale (6–42) for speakers felt / they guessed / audience saw;
  - "calm" and "very nervous" at the ends;
  - a gold "≈" on "nearly all of it".
- **Sound:**
  - a soft, muffled heartbeat (low-passed sine knocks, lub-dub), computed from the same heart phase so it matches the picture; it plays only while the heart is on screen and fades with the bubble in S5;
  - an airy swish for the camera swing, ticks for the bars;
  - felt-piano notes on beats over the soothing air bed;
  - `BED_GAIN` 0.50 puts the bed 13.1 dB under the voice.

## Fix log
1. ASR heard "students rated their nerves" as "raided their nerves". "Scored their own nerves" was chosen from four tested phrasings; it is exact on the narration and the mix.
2. A JavaScript precedence error (`-x ** 2`) stopped the first stills; it was parenthesised.
3. The first framing put the bubble in the caption band, made the audience's heads huge, and lost the bubble from behind. The bubble moved beside his head (scale 0.85), and the shots were reframed (frame 0 from 5.3 m, S2 higher). The swing now starts with the bubble centred.
4. The lectern mic looked like it pierced his chest; it was removed.
5. Card labels became "speakers felt / they guessed / audience saw".
6. The S3→S4 cut was on the same card, so S4 moved to a clearly different angle (az −14°, el 6°, closer). Cut frame changes measured on stills are 20–35.
7. The bed was quieter than usual (15.7 dB under), so `BED_GAIN` went from 0.37 to 0.50 (13.1 dB).

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-15-english-18/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english18-01-thumbnail.png
```

## Known limitations
- I can't listen to audio. The narration is verified only by a per-line ASR round-trip, and the bed and heartbeat only by level measurements. Someone should give it a listen.
- Savitsky & Gilovich (2003) could not be read directly; its finding is used only as described in a peer-reviewed paper.
- The bars are one class study's averages; individual speakers vary.
