# Production notes: mello-30s-english07-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Sources: Milkman, Minson & Volpp (2014, *Management Science*; PubMed abstract, PMC4381662) and Kirgios et al. (2020, OBHDP; abstract). Details are in `context/17-episode-temptation-bundling.md`.
- Topic swap: the suggested implementation intentions already exist in this app (hindi04-01), so a fresh subject in the same genre was chosen, as the batch instructs.

## Retained (latest accepted setup)
The source is a copy of `../2026-11-06-english-06/project/` (English page, captions and audit). Reused unchanged:
- `render.mjs`: headless Chromium + three.js 0.170.0 + ffmpeg. three.js is the renderer here, not the visual style.
- The accepted room, desk, lamp, mug, pencil, notebook, plant, stool, performer rig and camera helper.
- The English caption treatment: Instrument Serif, lavender highlighter. The lock-up reads "On Google Play".
- The accepted English voice (Kokoro 0.7 af_bella + 0.3 am_puck, en-us, 0.98), synthesized fresh. The audio synth and master chain are unchanged.
- From english06: the card helpers, the per-object crucial-text audit and the projected-sphere head check.

## New for this episode
- **Props:**
  - a phone with a stylised podcast player and a "Pick one treat" screen (original canvas UI);
  - white walking shoes with lavender soles;
  - lavender headphones.
- **In-scene text:**
  - the drawn padlock and "walks only" tag;
  - the bundle card ("temptation bundling", "want: podcast" + "putting off: a walk", "only together"), which turns into the schematic "gym visits" chart ("more often", "the boost faded");
  - the status card ("walks only" → "now playing").
- **Choreography:** the performer stands up, steps into the shoes, laces up and walks: pelvis path, IK feet, simple gait.
- **Sound:**
  - lock click and jiggle, tile taps, steps into the shoes;
  - the unlock with a soft chime, laces pulled, footsteps matched to the gait;
  - felt-piano notes on want + putting off, the choice, the unlock, lace up and the lock-up.
- **Bed:** `BED_GAIN` 0.48, so the music sits 13.3 dB under the voice.

## Fix log
1. The script came in at 20.4 s of speech, so the closing line "Want the next episode? Lace up." was added. Final: 74 words, CTA at 26.30 s. Narration ASR: CER 0 on all 7 lines.
2. **S1:**
   - The "walks only" tag was oversized, clipped and in the caption band.
   - The reaching arm hid the lock.
   - Final: no reach (the lock jiggles on its own), a small tag placed between the phone and the caption band, and a closer camera.
3. **S2:**
   - Card text was too small, so all sizes were raised.
   - The chart labels "more often" and "the boost faded" collided. They are now separated, and the legend moved top-right.
4. **S3:**
   - The phone was held edge-on (rotation sign); it now faces the performer and camera.
   - The thumb covered the chosen "Podcast" tile; the phone now sits above the hand.
   - The phone top reached the caption band; the aim was raised.
5. **S4:**
   - The standing head was behind the captions and the status card was in the top 300 px.
   - Final: a wider view (d 5.65→5.45, aim 0.9 m) keeps the head below the band and the shoes above the bottom zone. The status card sits beside the head and fades before the lace-up bend.
6. **S5:** the walker's head overlapped the lock-up; the aim was raised to 1.25–1.32 m.
7. **Mix:** 0.34 (the english06 value) gave 16.3 dB voice-over-music for this denser narration, so it was set to 0.48 (13.3 dB).
8. Audit before the first full render: 300 samples, 0 issues.
9. Render 1 review: cut detection showed a jump at frame 573, two frames before the S3→S4 cut. There the phone snapped back to the desk and its screen reset to the player. The phone-in-hand state is now tied exactly to the S3 shot (changes only on cuts), and the video was rendered a second and final time.

## Commands
One-time setup: shared Mello venv and the hash-checked Kokoro model.

```bash
cd videos/mello/project && ./setup.sh
```

Full build, including the English ASR check:

```bash
cd videos/mello/production/30s/2026-11-06-english-07/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh
```

## Known limitations
- I can't listen to audio, so intelligibility was verified only by a per-line English ASR round-trip. Someone should give it a listen.
- The walk is a simple procedural gait, and feet slide slightly at the start.
- The S4 status card text is small (about 30 px). The captions carry the full message.
