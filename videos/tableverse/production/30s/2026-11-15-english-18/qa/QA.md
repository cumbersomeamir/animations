# QA — tableverse-30s-english18-01.mp4 ("All in Pairs", 4 × 7 = 28 = 14 pairs; 4 × any number is even)

File: `videos/tableverse/production/30s/2026-11-15-english-18/tableverse-30s-english18-01.mp4` · checked 2026-11-15
sha256 `dc5bbbbfcdcf19d23ed6ecb240020353b4b96155f412ede3e365ee9dff8e4b19`. Thumbnail:
`tableverse-30s-english18-01-thumbnail.png` (sha256 c5a64f77…bc51cb) = frame 0 rendered losslessly (mean difference
vs the decoded MP4 frame 0: 3.2 / 4.0 / 4.0 per RGB channel out of 255, i.e. H.264 compression of a detailed frame).

## Topic decision (see context/15)
The brief's 7 × 6 = 5 × 6 + 2 × 6 = 30 + 12 = 42 is english13-01 exactly (same fact, split and totals). As the brief
allows, a fresh alternate in the same genre: the pirate rescue with seven boats and the robot companion, teaching the
table pattern "4 × any number is even" (CCSS 3.OA.D.9) through pairs, shown as 4 × 7 = 28 = 14 pairs. Frame-0 words
"SEVEN BOATS. ALL IN PAIRS?".

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −15.8 LUFS integrated, LRA 3.5 LU, true peak −1.5 dBTP | pass |
| stem balance | music subtle | stems as mixed: VO −17.3 LUFS, SFX −27.2 LUFS, music −28.5 LUFS (both ducked further under speech) | pass |

## First frame
- Frame 0 is the finished hook image: seven boats, four friends in each (28, evenly spaced, not yet paired), the empty
  rescue ship, Captain Robot in a pirate hat pointing at boat 1, card "4 × 7 = ?", headline "SEVEN BOATS. ALL IN
  PAIRS?" (5 words) — no logo, fade, black or empty setup. Hook audio from 0.07 s; the question is answered at 14.0 s
  ("Nobody is alone"), the product at 19.4 s and the pattern at 20.4–24.0 s.

## Narration and captions (evidence: asr_words.txt, asr_windows.txt; faster-whisper base.en, run locally on the final MP4)
- Machine transcript of the delivered MP4 (no human listening was performed in this session):
  "Seven boats, four friends in each. Can every friend climb a board with a buddy? Look, four friends make two pairs.
  Will anyone be left alone? Two, four, six, eight, 10, 12, 14. Fourteen pairs, nobody is alone. Fourteen pairs make
  28, so four times seven is 28. Every four is two pairs, so four times any number is even. Play and learn tables
  with Tableverse." → matches the script, English only ("a board" is the ASR spelling; the hook window ASR hears
  "aboard").
- Window ASR on cuts from the MP4: 0–4.8 s → "Seven boats, four friends in each. Can every friend climb aboard with a
  buddy?"; 9.2–13.9 s → "2, 4, 6, 8, 10, 12, 14"; 27.5–30 s → "Play and learn tables with Tableverse." Each clip was
  also transcribed in isolation before mixing (all exact).
- Clip placement is frame-exact; first-word offsets −0.11…+0.23 s; no VO overlaps; last word ends 29.87 s.
- Caption/VO sync: each count word lands on its boat's count frame; card "28" on the second "twenty-eight" (f582),
  "even" on "even" (f706). Captions ≤ 2 lines inside x 100–900 / y 240–396 (all frames checked show them in place;
  the 1 fps contact sheet catches a few instants between captions).

## Picture (evidence: contact_sheet.png; frames/ — 45 beat and transition frames, 540×960 JPG)
- Sequence: headline folds (f124–138) → boat 1 pairs step together, loops tie (f164–176) → pause with lean-in →
  boats 2–7 tie and are counted (f296–392), "2" badges → 14 pairs jump aboard (f424–477) → empty boats sink →
  ship sails closer (f490–540) → card 4 × 7 = 28 → columns of four pulse (f624–676) → card 4 × any = even → party
  (f724–800) → page turn → CTA.
- Counting accuracy: exactly 28 friends in every frame (in boats, in flight or on deck — each drawn once); exactly 4
  per boat; pairs always leave together, tied by their loop; on deck each boat's four stand as one column (two
  pairs), 7 columns; no other people on screen.
- Safe areas: headline text from y ≈ 230; captions y 240–396; boats x ≈ 160–853, y ≈ 605–1170; the enlarged ship
  x ≈ 51–1003 with deck friends x ≈ 142–975 (bandana tips to 987) at y ≈ 850–1000 (well above the right-side
  button band); CTA wordmark and badge clear of Captain Robot.
- Readability at full resolution: headline 84 px, card 74/66 px, captions 54 px, badges 36 px, friends ≈ 46 × 90 px
  in the boats and ≈ 58 × 112 px on the enlarged ship.

## Issues found and fixed before delivery
1. Brief repeated english13-01 (7 × 6 = 30 + 12) → pattern topic (documented above).
2. Friends too small for a phone → enlarged ×1.2; boat seats respaced.
3. Wave crests read as white clouds → low scalloped crests outlined only on top.
4. Seven empty boats cluttered the second half → each sinks away once its friends are aboard.
5. The 28 rescued friends were a cramped strip at the bottom → the ship sails to the centre and comes closer; the deck
   was rearranged into 7 columns of four (two pairs each) so "every four is two pairs" is visible.
6. Buddy ropes between hands were too small to read → pairs step together and a rope loop circles each pair's waists.
7. Deck friends reached x ≈ 984 → ship shifted left (faces end ≈ 975).
After the fixes the film was fully re-rendered and every check above run on the final file.

## Content and claims
- Facts: CCSS 3.OA.D.9, 2.OA.C.3, 3.OA.A.1 — official PDF, quoted in context/15. Measured facts = arithmetic; pirates,
  boats, ship and Captain Robot are illustrative.
- No timed quiz, score, pressure or learning guarantee; the pause is untimed.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Known limitations
- Listening check is machine-based (ASR + loudness/peak meters); I did not personally listen to the audio.
- The maths differs from the brief (pattern instead of the repeated 5 + 2 split); the second hook phrase differs
  ("ALL IN PAIRS?" instead of "ONE RESCUE.").
- On deck the back-row loops are hidden behind the front row and the front-row loops behind the rail; pairs read by
  position (side by side, one column per boat).
- No user review folder exists in this cloud session; the MP4 and thumbnail are attached and pushed.
