# Production notes: mello-30s-english12-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png` (identical to the current store icon).
- Palette sampled from the current Play listing on 2026-11-11 (values and roles in `context/22-episode-unfinished-task-park-it.md`).
- Sources: Masicampo & Baumeister (2011) and Scullin et al. (2018), PubMed abstracts; details and the measured / interpretation / illustrative split are in `context/22`.

## Retained (approved setup)
The source is a copy of `../2026-11-09-english-11/project/`. Reused unchanged:
- `render.mjs` (headless Chromium + three.js 0.170.0 + ffmpeg), the rig, camera helper, room, bed and nightstand, caption mechanics and the oriented-box audit.
- The narrator (Kokoro English blend, synthesized fresh), the audio synth/ducking/master chain, the lock-up and the CTA.

## New for this episode (2026-11-11 rules)
- **Palette:** store-sampled colours (stage, ink, violet, lilac, deep violet, dark UI, gold) instead of the earlier white/lavender #D9BCF5 look.
- **Captions:** inside x 100–900, at most two lines, key words in violet. The audit now checks x 100–900.
- **One idea per shot, large and brief labels:**
  - "intrusions" with "plan";
  - "falling asleep" with "to-do list" and "done list";
  - the note "NEXT STEP / Email Sam / tomorrow, 9:00".
- **Visual metaphor:** an open violet loop with a gold spark (the unfinished task). It orbits the head, cuts across the reading, hangs by the lamp, and lands on "9:00" and closes.
- **Lighting:** a bedside lamp that dims after the loop is parked; the room settles slightly.
- **Sound:**
  - an original soothing evening bed (filtered "air" swells, about 10 dB under the pad), with the pad suspended while the loop is open and resolving when it is parked;
  - soft whooshes for the intrusions, the pencil scratch, a chime when the loop closes, the notebook closing and the lamp click.
  - `BED_GAIN` 0.38: the bed sits 13.1 dB under the voice.
- **Thumbnail:** `thumbnail.mjs` renders the opening scene tighter with "STILL IN YOUR HEAD?" (Instrument Serif, ink + violet).

## Fix log
1. ASR heard "write the next step" as "right…" (homophone). The line became "jot down the next step"; CER 0 on all 8 lines.
2. The palette first rendered the stage at #E6DDF4. The stage tint and the hemisphere light were adjusted (rendered #EAE4F4), and the background was matched to remove the horizon line.
3. The performer read too light against the lavender stage; it was deepened to #8270C4.
4. The over-the-shoulder notebook shot put the head behind the captions and cropped the writing. It was replaced by a front view with a camera-facing note card, and the loop draws on top in S5.
5. A lilac highlight band under violet words looked like a strikethrough; it was removed.
6. In the close reading shot the loop's orbit entered the caption band; it was lowered and tightened.
7. The ambience was inaudible at first (24 dB under the pad) and was raised to about 10 dB under.
8. Pre-render audit: 300 samples, 0 issues.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-11-english-12/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english12-01-thumbnail.png
```

## Known limitations
- I can't listen to audio; intelligibility was verified only by a per-line English ASR round-trip, and "soothing" by design and level measurements. Someone should give it a listen.
- The card visuals are schematic (direction only). "Email Sam, 9:00" is an illustrative example.
- The rendered stage is #EAE4F4 against the store's #EDE8FE (the warm key light limits the blue channel).
