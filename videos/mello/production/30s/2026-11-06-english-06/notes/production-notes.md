# Production notes: mello-30s-english06-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Sources: Bruk, Scholl & Bless (2018, JPSP; PubMed abstract) and (2022, PSPB; open-access full text, Study 3 = confessing a mistake to one's boss). Details are in `context/16-episode-beautiful-mess-effect.md`.
- Topic swap: the suggested spotlight effect already exists in this app (hindi03-01), so a fresh subject in the same genre was chosen, as the batch instructs.

## Retained (latest approved setup)
The source is a copy of `../2026-11-05-feedback-05/project/`, with the English page (`scene/index.html`) from `../2026-11-03-round-02/project/`. Reused unchanged:
- `render.mjs`: headless Chromium + three.js 0.170.0 + ffmpeg. three.js is the renderer here, not the visual style.
- The accepted room, desk, lamp, mug, pencil, notebook, plant, stool, performer rig and camera helper.
- The English caption treatment: Instrument Serif, line-height 0.94, lavender highlighter. The lock-up reads "On Google Play".
- The accepted English voice (Kokoro 0.7 af_bella + 0.3 am_puck, en-us, 0.98), synthesized fresh. The audio synth and master chain are unchanged.

## New for this episode
- **Props:**
  - a laptop with a stylised mail screen (original canvas UI);
  - a second birch desk with a laptop and a mug;
  - one colleague (the hindi-03 faceless room-mate figure, lighter lilac-gray).
- **In-scene text:**
  - the mail ("Team (12)", "Q3_report_OLD.pdf" with a warm ring, the "Sent to Team (12)" toast);
  - the navy inner-critic card "“They'll think I'm careless.”", which turns into two schematic sliders (harsher ↔ kinder) and the "the beautiful mess effect" pill;
  - the correction ("Sorry, wrong file. Here's the right one.", "Q3_report_FINAL.pdf");
  - the colleague's inbox and their reply "Thanks for flagging!".
- **Sound:**
  - trackpad clicks and soft send sweeps;
  - key clicks while the correction and the reply are typed, and the colleague typing at their own work;
  - a soft chime when the correction arrives;
  - felt-piano notes on the mistake, the comparison, the name, the fix sent, the reply and the lock-up.
- **Bed:** `BED_GAIN` 0.34, so the music sits 13.0 dB under the voice.
- **QA:**
  - English per-line ASR check (large-v3-turbo, `language="en"`);
  - each crucial text object (card, both screens) audited on its own;
  - projected-sphere head boxes, and a colleague-head check.

## Fix log
1. The first script had 17.6 s of speech, so the concrete action line ("So own it in one plain line, and send the fix.") was added. Final: 74 words, CTA at 26.30 s. Narration ASR: CER 0 on all 8 lines.
2. **S1:**
   - The laptop screen reached the right rail. Re-aimed (target x 0.07, d 1.65→1.5).
   - The head-in-hands moment touched the start of the caption; azimuth 30→27 keeps it out.
   - The Send button and toast cross-faded on top of each other. The button now leaves before the toast arrives.
3. **S2:**
   - The quote was too small, then overflowed the card. Now two lines at 156 px.
   - The performer's head hid the card's "kinder" end. The card was narrowed (0.7 m), moved left and placed below the caption band. The only remaining contact is the empty bottom-right corner of the navy card during the quote, not its text.
4. **S3:** the laptop screen was too large and reached the caption band. Pulled back and re-aimed (d 1.5→1.36, target y 0.99).
5. **S4:**
   - Over-the-shoulder views put the performer's background laptop and arm, or the colleague's head, behind the caption.
   - Final: a high view (el 49→47) onto the colleague's laptop with their typing hands. The colleague's mug moved to the front of the desk.
6. **S5:** the colleague was cut at the frame edge. Widened (target x 0.7, d 7.0→8.6) so both desks fit.
7. **Mix:** `BED_GAIN` 0.5 gave only 9.6 dB voice-over-music with the sparser English narration. 0.34 gives 13.0 dB.
8. Final audit before the full render: 300 samples, 0 issues.

## Commands
One-time setup: shared Mello venv and the hash-checked Kokoro model.

```bash
cd videos/mello/project && ./setup.sh
```

Full build, including the English ASR check:

```bash
cd videos/mello/production/30s/2026-11-06-english-06/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh
```

## Known limitations
- I can't listen to audio, so intelligibility was verified only by a per-line English ASR round-trip. Someone should give it a listen.
- In S4 the colleague is shown by their laptop and typing hands, not their head. Every framing that showed their head put it, or the performer's laptop, behind the caption.
- The sliders are schematic and show direction only. The measured difference is modest (4.92 vs 4.65 on a 1–7 scale in the 2022 mistake study).
