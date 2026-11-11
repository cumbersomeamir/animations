# Production notes: mello-30s-english10-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Source: Lally et al. (2010), *EJSP* 40(6), abstract. Details and the measured / estimated / illustrative split are in `context/20-episode-habit-formation-time.md`.
- Topic swap: implementation intentions was already covered (hindi04-01), so this batch uses habit formation time and one missed day; the brief's evening cue (bag down → walk) is kept as the demonstration.

## Retained (latest accepted setup)
The source is a copy of `../2026-11-08-english-09/project/`. Reused unchanged:
- `render.mjs` (headless Chromium + three.js 0.170.0 + ffmpeg), the room, desk, lamp, mug, pencil, notebook, plant, stool, performer rig and camera helper.
- The standing/walking rig and footsteps from english07.
- The English caption treatment, the lock-up "On Google Play", the accepted English voice (synthesized fresh) and the audio synth/master chain.

## New for this episode
- **In-scene text:** "21 days?" calendar + "not quite"; "one study", "same context", "after breakfast", "one new daily action", "e.g. a walk", "day N of 84 · 12 weeks"; "automaticity", "18 days", "254 (estimated)", "fast at first", "then levels off"; the week strip M–S with "one missed day"; "same cue → walk".
- **Choreography:** the performer watches the card, stands with the work bag, sets it down on the desk (the cue), turns and walks.
- **Sound:** ticks as squares cross off, a soft stamp, ticks as the week fills (the missed day is silent), the bag set down, footsteps; felt-piano notes on the beats. `BED_GAIN` 0.40 (13.0 dB under the voice).

## Fix log
1. Script: 73 words, CTA at 26.30 s; narration ASR CER 0 on all 7 lines (numbers mapped from digits).
2. S2: the study card was small; the camera moved closer (d 4.0→3.35, az −30→−25).
3. S3: "18 days" and "fast at first" overlapped the curves; the plateau was lowered and the labels moved clear; "study ends" removed.
4. S4: the week strip was unreadably small next to the head; it is now camera-facing at a fixed screen spot (820 px wide, centre y 690) and the shot aims higher so the head sits below it.
5. S4: "same cue → walk" was half hidden by the bag and then in the right rail; it now uses the same screen spot after the week strip leaves.
6. S5: the camera pans further right to follow the walk.
7. Pre-render audit: 300 samples, 0 issues.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-09-english-10/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh
```

## Known limitations
- I can't listen to audio; intelligibility was verified only by a per-line English ASR round-trip. Someone should give it a listen.
- The curves, calendar and week strip are schematic; "e.g. a walk" is an illustrative example of an activity behaviour.
