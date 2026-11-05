# Production notes: mello-30s-feedback05-01 (Hindi)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Sources: Buehler (2019, SPSP; full text), Roy, Christenfeld & McKenzie (2005; PubMed abstract). Kahneman & Tversky (1979) and Buehler, Griffin & Ross (1994) are cited, not read in full. Details are in `context/15-episode-planning-fallacy-hindi.md`.

## Retained (latest approved setup)
The source is a copy of `../2026-11-04-hindi-04/project/`. Reused unchanged:
- `render.mjs`: headless Chromium + three.js 0.170.0 + ffmpeg. three.js is the renderer here, not the visual style.
- The accepted room, desk, lamp, mug, pencil, notebook, plant, stool, performer rig and camera helper.
- Devanagari captions (Tiro Devanagari Hindi after Instrument Serif, line-height 1.16, 76/92 px) and the lock-up ("Google Play पर").
- The Kokoro hf_beta Hindi voice at speed 1.05, the audio synth and master chain, and the Hindi ASR check.

## New for this episode
- **Props:**
  - a flat desk clock with lavender (plan) and warm (overrun) wedges;
  - a task sheet with ink lines that grow;
  - the phone lying on the desk (buzz) and the mug lifted for a sip;
  - a time-log page texture inside the notebook.
- **In-scene text:**
  - "10 मिनट" (struck through) and "1 घंटा" notes at the clock;
  - the thought card "सोचा / असल" with the interruption chips फ़ोन, चाय, ढूँढना;
  - "पिछली बार: 55 मिनट" on the open cover;
  - the calendar card (record pill, 6:00–7:00 grid, dashed "10 मिनट?" guess, "1 घंटा" block, "असल: 58 मिनट ✓").
- **Sound:**
  - clock ticks follow the racing minute hand (one per 5 minutes), with a soft glass chime at the hour;
  - pencil scribbles, phone buzz, mug clink, paper shuffle, page flip;
  - felt-piano notes on imagined, actual, the record, the hour booked, the logged time and the lock-up.
- **Bed:** `BED_GAIN` 0.5, so the music sits about 12.9 dB under the voice ("music quiet beneath speech").
- **QA:**
  - oriented screen boxes for labels and cards;
  - head and clock-dial checks against caption text;
  - no shot exemption for the caption band.

## Fix log
1. The script came in at 21.0 s of speech (74 words). Pauses were set to 0.6–0.66 s, with the CTA at 26.30 s. Narration ASR was CER 0 on 5 of 7 lines on the first pass, so no rewrites were needed.
2. **S1:**
   - The "10 मिनट" note sat in the caption band and the "1 घंटा" note was clipped at the right edge.
   - Later the mug hid the "1 घंटा" note, and both notes ran past the left margin during the push-in.
   - Final: "10 मिनट" left of the dial, "1 घंटा" above its right side.
3. **S2:** the thought card reached x 54. Scaled to 0.92. Its type and bars were enlarged, and the "असल" peach deepened (#E9C18C) for contrast.
4. **S3:**
   - The "पिछली बार" note was oversized and clipped.
   - The pointing arm covered the highlighted row, and the left hand crossed the note.
   - The clock dial sat behind the caption text, and the open cover overlapped the clock.
   - Final: the clock moved to x −0.30, the framing shifted right, the right hand rests below the rows, the left hand stays down, and a smaller note sits on the cover.
5. **S4:**
   - The calendar card reached into the caption band and the right rail, and the arm over-stretched to the notebook.
   - Final: the notebook moved nearer, the card was lowered and scaled to 0.8, and the camera az changed to 24→19 so the head stays beside the card.
6. Final audit before the full render: 300 samples, 0 issues. No head, clock dial or in-scene text is behind caption text.

## Commands
One-time setup: shared Mello venv and the hash-checked Kokoro model, which includes the Hindi voices.

```bash
cd videos/mello/project && ./setup.sh
```

Full build, including the Hindi ASR check:

```bash
cd videos/mello/production/30s/2026-11-05-feedback-05/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh
```

## Known limitations
- I can't listen to audio, so intelligibility was verified only by a per-line Hindi ASR round-trip (large-v3-turbo). A native Hindi speaker should give it a listen.
- Kokoro's Hindi voice is a small model, so a few words may sound slightly synthetic (e.g. "माइंडफुल" is heard as "माइनफुल").
- The S2 chip labels (फ़ोन, चाय, ढूँढना) and the calendar's 6:00/6:30/7:00 times are secondary text, about 30 px on screen. The captions carry the full message.
