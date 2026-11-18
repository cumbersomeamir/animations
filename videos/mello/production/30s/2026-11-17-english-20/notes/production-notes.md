# Production notes: mello-30s-english20-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- **Live feedback "No, match the colors of the published app, soothing audio also add":** this is applied with the store-sampled palette from `context/22` and an original soothing pad and air bed under the voice (13 dB).
- Topic: affect labeling, as requested. It is distinct from feedback-01's cognitive defusion of a thought (`context/30`).
- Sources: Lieberman et al. 2011 and 2007 (PubMed abstracts); Kircanski et al. 2012 as background only.

## Retained (approved setup)
The source is a copy of `../../2026-11-17-english-19/project/` (renderer, audit, audio chain). The scene is spliced onto the english15 room scene. Reused unchanged:
- `render.mjs` (with the caption-zone audit), the room, the faceless performer rig, the camera helper and caption mechanics (x 100–900).
- The dark in-app card and labels.
- The narrator (synthesized fresh), the soothing air bed and the master chain.
- Indoor caption colours.

## New for this episode
- **The tense message:** a phone screen floating beside him (an avatar "S", "9:41 PM", the bubble "We need to talk.", "Read"), plus a small phone in his hand.
- **The feeling as a storm:** a spiky icosahedron storm, its spikes driven by 16 fixed directions, recomputed per frame.
  - It sits deep violet over his head, and a translucent ghost of it swells for "worse?".
  - From 21.3 s it softens: the spikes retract, it shrinks, and it turns lilac. It never disappears.
- **Cards (direction only, no values):**
  - "IN THE STUDIES": an image icon with an "angry" tag, then a gold distress arrow down;
  - "SIMILAR DROPS IN DISTRESS": naming, reframing and distraction arrows.
- **The brain:** two translucent lilac halves, with a gold amygdala and a glow that dims after the "anxious" tag appears.
- **Sound:**
  - a soft chime as the message lands;
  - a low uneasy swell under the storm that eases as the feeling is named;
  - ticks for the arrows, a soft tap for the tag;
  - felt-piano notes over the soothing air bed.

## Fix log
1. **First stills (17 Nov, before the session break):**
   - The storm was huge and sat behind the opening caption.
   - The ghost storm was a wireframe (distracting lines) and overlapped the caption.
   - The brain was too close, with its labels in the caption band and the bottom zone.
   - The tags and the message screen reached the right rail and bottom zones.
   - Fixes (18 Nov):
     - the storm moved above his head and was scaled down (radius ~0.17), with cameras reframed so it sits below the caption band;
     - the ghost became a soft translucent shape (1.35×);
     - the message screen became a compact, legible bubble and was raised to y 1.72;
     - the brain camera moved back to 3.2 m, with labels above and below it;
     - the tags moved inward.
2. ASR was exact on the first takes (all 8 lines).

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-17-english-20/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english20-01-thumbnail.png
```

## Known limitations
- I can't listen to audio. The narration is verified only by a per-line ASR round-trip, and the bed only by level measurements. Someone should give it a listen.
- The evidence is lab studies with pictures; the tense-message moment is an application, not something tested. The card arrows show direction only.
