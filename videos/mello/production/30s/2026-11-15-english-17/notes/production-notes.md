# Production notes: mello-30s-english17-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- Palette: store-sampled values from `context/22`.
- Topic swap: the proposed implementation-intentions topic is already covered (hindi04-01, `context/14`; shoes by the door in english15). This episode covers undervaluing gratitude (`context/27`).
- Source: Kumar & Epley 2018, read in full from a PDF copy of the published article (DOI matched).

## Retained (approved setup)
The source is a copy of `../2026-11-15-english-16/project/` (renderer, audit, audio chain). The scene is spliced onto the english15 room scene (`../2026-11-15-english-15/project/scene/main.js`). Reused unchanged:
- `render.mjs` (with the 2026-11-15 caption-zone audit), the room, the faceless performer rig, the second rig (`makeRig`/`poseStanding`), the camera helper and caption mechanics (x 100–900).
- The dark in-app card and labels.
- The narrator (synthesized fresh), the soothing air bed and the master chain.
- Indoor caption colours (ink #191632, violet #633BFE key words), as in english15.

## New for this episode
- **The desk faces the camera side:** the stool moves behind it. The writer sits facing the camera; the notebook and mug are hidden.
- **Crumpled drafts:** faceted paper balls (deterministic displaced icosahedra):
  - a cone-shaped heap of 28 on the desk that rises above his head;
  - a few on the right of the desk and some spilled on the floor;
  - one landing at frame 0, and one crumpled and tossed in S2.
- **The writing card:** canvas texture with three modes (blank, a quick scribble, and "Thank you," plus two lines drawn as narrated). The pen follows the writing point.
- **The envelope:** a body, a hinged flap with a gold seal, and a letter that slides out. It is picked up, handed over and opened.
- **The recipient:** the second rig (lighter body, violet hair) takes the envelope, opens it, puts a hand on the chest and glows a little more.
- **Cards:**
  - dark "HOW THE RECIPIENTS FELT": writers' guess (outlined) vs what they felt (gold), Experiment 1 averages to scale;
  - light "THEIR WORDING, OUT OF 10": 7 → 9.3 with a gold ring;
  - labels "writer" and "recipient" above the heads, and a "?" thought bubble.
- **Sound:**
  - paper crinkle (crumple and landing), a soft toss swish;
  - pen scratches while writing, envelope rustles;
  - soft ticks as the bars appear;
  - felt-piano notes on the beats over the soothing air bed;
  - `BED_GAIN` 0.37 puts the bed 12.9 dB under the voice.

## Fix log
1. The first frame 0 was plain (a small figure, a low heap mostly out of frame). The heap became a cone of drafts taller than his head on the desk, with one more draft mid-air, and the camera moved closer.
2. The lamp read as a white flag from the front; it was turned so the shade is seen from the side.
3. S2 framed his head behind the caption, and the toss was unreadable. The camera moved back and left, and the draft now arcs onto the heap.
4. The S6 writing shot needed several camera tries:
   - Over the shoulder, the head and arm filled the frame.
   - Top-down from behind, the card was hidden; a bug also hid the card during S6.
   - Front high angle put the caption over the violet torso.
   - Final: a near-vertical flat-lay rotated by 40°, so the writing arm enters from the side. The other hand rests in his lap, and the card is turned to the camera so "Thank you," reads.
5. Labels: "writer" sat past the left margin and in the bottom zone, and "recipient" touched the right rail and was hidden by desk props. Both now sit above the heads (the writer's fades before the "?" bubble). The writer's sits in the S3 shot that was moved 0.04 m left.
6. ASR was exact on the first takes and on the pre-render mix; no rewording was needed. `BED_GAIN` was lowered from 0.39 to 0.37 (12.5 → 12.9 dB).

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-15-english-17/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english17-01-thumbnail.png
```

## Known limitations
- I can't listen to audio. The narration is verified only by a per-line ASR round-trip, and the soothing bed only by level measurements. Someone should give it a listen.
- The wording numbers come from one experiment (Experiment 4), as labelled. The bars are Experiment 1 averages. The heap, the handover and the bubble are staging.
- In S6 the card is turned toward the camera so the heading reads; from the writer's seat it would be upside down.
