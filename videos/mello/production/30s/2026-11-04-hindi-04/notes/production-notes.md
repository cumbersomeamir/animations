# Production notes: mello-30s-hindi04-01 (Hindi)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Sources: Gollwitzer (1999), full text from KOPS; Gollwitzer & Sheeran (2006), meta-analysis abstract. Details are in `context/14-episode-implementation-intentions-hindi.md`.

## Retained (latest approved setup)
The source is a copy of `../2026-11-03-hindi-03/project/`. Reused unchanged:
- `render.mjs`: headless Chromium + three.js 0.170.0 + ffmpeg. three.js is the renderer here, not the visual style.
- The accepted room at its original depth, desk, lamp, mug, pencil, notebook, plant, performer rig and camera helper (kp / lead / k2 / sine, with a same-frame matrix update).
- Devanagari captions: Tiro Devanagari Hindi as a fallback after Instrument Serif, line-height 1.16, 76/92 px.
- The lock-up ("Google Play पर").
- The Kokoro hf_beta Hindi voice at speed 1.05, the audio synth and master chain, and the Hindi ASR check.

## New for this episode
- **Props:** plate and light silver fork; phone with a scrolling canvas feed and a buzz notification; birch side shelf.
- **In-scene text:** intention card (dissolves); if-then plan card that builds row by row; cue and action rings with the labels "संकेत" and "काम"; a 10-minute ring with the label "10 मिनट".
- **Choreography:** scroll → plate pushed away → phone carried to the shelf → notebook opened and writing → the buzz glance, with the pen pausing.
- **Sound:** plate slide, phone tap and timer tick, page flip, phone buzz. Felt-piano notes on "अगर", "तो", the cue, the action and the lock-up.
- **Bed:** `BED_GAIN` 0.55 keeps the bed about 12.6 dB under the voice.

## Fix log
1. The script timed at 24 s of speech, 73 words. The pauses were set to about 0.55–0.6 s and the CTA placed at 26.30 s.
2. ASR heard "अगर-तो" as "अग्रतो". Rewritten as "अगर… तो…", which ASR now hears as "अगर तो".
3. ASR heard "अध्ययनों" as "अधिनों". Replaced with "शोधों".
4. **S1:** the phone and plate were hidden behind the performer, then the head and intention card crossed the caption band. Final: the phone is held low over the desk, a steep right three-quarter view, and a smaller camera-facing card.
5. **S2:** the plan card was clipped at the left. The aim point was shifted and the card scaled to 0.94; the card now spans x 64–807.
6. **S3:**
   - The head hid the plate (pushed left) and clipped the "संकेत" label. The plate is now pushed back and to the right, the camera views it from the rear-right and pans with the action, and the label sits lower.
   - "काम" and "10 मिनट" overlapped. They are now staggered at the S3/S4 cut.
7. **S4:** the head sat behind the long evidence caption, and the shelf and labels sat in the bottom-right UI zones. Final: the notebook moved beside the shelf, a steep three-quarter view, and the timer label set left of the phone.
8. Final audit before the full render: 300 samples, 0 issues; no head or in-scene text behind caption text in any sample.

## Commands
One-time setup: shared Mello venv and the hash-checked Kokoro model, which includes the Hindi voices.

```bash
cd videos/mello/project && ./setup.sh
```

Full build, including the Hindi ASR check:

```bash
cd videos/mello/production/30s/2026-11-04-hindi-04/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh
```

## Known limitations
- I can't listen to audio, so intelligibility was verified only by a Hindi ASR round-trip, per line, with large-v3-turbo. A native Hindi speaker should give it a listen.
- Kokoro's Hindi voice is a small model, so a few words may sound slightly synthetic (e.g. "माइंडफुल" is heard as "माइनफुल").
