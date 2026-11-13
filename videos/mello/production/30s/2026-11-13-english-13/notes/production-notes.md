# Production notes: mello-30s-english13-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- Palette: store-sampled values from `context/22` (stage target #EDE8FE, ink #191632, violet #633BFE, lilac #E6D2FC, deep violet #5B45A3, dark UI #060513, gold #FEC357). The pink elephant (#F4A7C8) comes from the brief.
- Sources: Wegner et al. 1987; Wegner 1994; Abramowitz et al. 2001; Wang et al. 2020 (PubMed abstracts). Details and the measured / theory / illustrative split are in `context/23-episode-ironic-thought-suppression.md`.

## Retained (approved setup)
The source is a copy of `../2026-11-11-english-12/project/`. Reused unchanged:
- `render.mjs` (headless Chromium + three.js 0.170.0 + ffmpeg), the room, desk, stool, plant, rig and camera helper.
- Caption mechanics inside x 100–900 and the audit.
- The dark in-app card, the note card, the narrator (Kokoro English blend, synthesized fresh), the soothing ambience and the master chain.

## New for this episode
- **Props:** an original pink elephant built from primitives that slides, tips off the desk, vanishes in a pink puff and springs back. A lilac "checking" cone from the performer's head. A warm task light. The desk lamp is hidden and the mug moved so the elephant has a clear run.
- **In-scene text:** card "DON'T THINK OF A / white bear" (bear and bell icons); labels "checking", "rebound", "noticed"; note "ONE JOB / Draft the intro".
- **Choreography:**
  - seated at the desk;
  - pushes the elephant right, then left;
  - looks round as the beam finds it;
  - a small nod;
  - writes.
- **Sound:**
  - the slide, the fall thuds, round "pops" when it reappears, small bells on the card;
  - the checking sweep and a chime when it is found;
  - the rebound pop and a falling tone as it shrinks;
  - pencil scratches;
  - felt-piano notes on the beats over a soothing air bed;
  - `BED_GAIN` 0.38 puts the bed 13.3 dB under the voice.
- **Thumbnail:** `thumbnail.mjs`, "DON'T PICTURE THIS.".

## Fix log
1. Script: 66 words, CTA at 26.80 s; narration ASR CER 0 on all 8 lines.
2. Cross-desk shots put the head behind the captions; the targets were raised (y 1.2–1.3) so the head sits below the band.
3. The moved desk lamp blocked the elephant in S2; the lamp was hidden. The old contact shadows were moved or hidden.
4. The S3 card was too large and reached the band and the right rail; it was lowered and the camera pulled back (d 3.55 → 3.45).
5. The beam was invisible (additive on a light stage) and the hiding elephant was occluded by the desk. The beam became a normal-blended violet, and the elephant moved to the visible side of the plant.
6. The "noticed" corner and label were off-frame or in the right rail; they moved inside the frame.
7. The horizon line in the cross-desk shots was removed by matching the background to the far floor (#F0E9F5).
8. Pre-render audit: 300 samples, 0 issues.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-13-english-13/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english13-01-thumbnail.png
```

## Known limitations
- I can't listen to audio; the narration is verified only by a per-line ASR round-trip, and the soothing bed only by level measurements. Someone should give it a listen.
- The elephant, bell count, beam and rebound size are illustrative. "Draft the intro" is an example task.
