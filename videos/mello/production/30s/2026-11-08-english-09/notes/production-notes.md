# Production notes: mello-30s-english09-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Sources: Redelmeier & Kahneman (1996), Fredrickson & Kahneman (1993), Redelmeier, Katz & Kahneman (2003), all PubMed abstracts. Details are in `context/19-episode-peak-end-rule.md`.

## Retained (latest accepted setup)
The source is a copy of `../2026-11-07-english-08/project/`. Reused unchanged:
- `render.mjs`: headless Chromium + three.js 0.170.0 + ffmpeg. three.js is the renderer here, not the visual style.
- The accepted room, desk, lamp, mug, pencil, notebook, plant, stool, performer rig and camera helper.
- The English caption treatment and the lock-up "On Google Play".
- The accepted English voice (Kokoro 0.7 af_bella + 0.3 am_puck, en-us, 0.98), synthesized fresh. The audio synth and master chain are unchanged.
- The card helpers and per-object audit. The laptop prop comes from english06.

## New for this episode
- **In-scene text:**
  - the "a day out" card: mood line, shuffling queue figures, "40-min queue", a peak star and an end dot, then "the peak-end rule", "peak", "end" and "what you remember";
  - the "discomfort over time" schematic: "standard ending" vs "gentler final minutes" with "in memory" bars, then "endings carry weight";
  - the laptop "Today" list: "Reply to Sam", "Fix the slides", "Send the proposal", then "Done for today" and a lavender loop.
- **Choreography:**
  - the performer watches the card;
  - types, clicks the last task done, closes the lid with the right hand and leans back.
- **Sound:**
  - the queue shuffling forward, a soft chime on the peak, the check click, "Done for today", the lid closing;
  - felt-piano notes on the peak, the end, the labels, the gentler ending, the check, the loop and the lock-up.
- **Bed:** `BED_GAIN` 0.45, so the music sits 13.7 dB under the voice.

## Fix log
1. The script came in at 22.1 s of speech (73 words), with the CTA at 26.30 s. Narration ASR: CER 0 on all 7 lines.
2. **S1:**
   - The camera was so close that the card was clipped at the left and its top reached the caption band. Re-aimed at the card centre at d 2.95→2.8 (az −20→−16), so the card sits within x 110–935 and below the band, clear of the performer's head.
   - The card was empty at frame 0; the line now starts already 16% drawn.
3. **S2:** the "peak" pill overlapped the title pill. The curve was lowered (peak at canvas y 300) so both pills sit under the title.
4. **S3:** the card was too large and touched the band and the left margin. Pulled back (d 3.4→3.2) and re-aimed (y 1.27).
5. **S4:**
   - The laptop screen reached the right rail; the aim shifted right (x 0.11) and pulled back (d 1.6→1.48).
   - The to-do list is audited only in S4 and before the lid starts closing.
6. Final audit before the full render: 300 samples, 0 issues; the card never overlaps the performer's head.

## Commands
One-time setup: shared Mello venv and the hash-checked Kokoro model.

```bash
cd videos/mello/project && ./setup.sh
```

Full build, including the English ASR check:

```bash
cd videos/mello/production/30s/2026-11-08-english-09/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh
```

## Known limitations
- I can't listen to audio, so intelligibility was verified only by a per-line English ASR round-trip. Someone should give it a listen.
- The curves and bars are schematic; they show direction only.
- While closing the lid, the right arm briefly crosses the to-do list. The loop and "Done for today" are visible before that.
