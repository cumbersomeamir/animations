# QA — tableverse-30s-english17-01.mp4 ("The Robot That Packs in Tens", 4 × 30 = 12 tens = 120)

File: `videos/tableverse/production/30s/2026-11-15-english-17/tableverse-30s-english17-01.mp4` · checked 2026-11-15
sha256 `b7f6fd402c25f901c14ac802afde336f76ae43f27baf34e0472d338f42247005`. Thumbnail:
`tableverse-30s-english17-01-thumbnail.png` (sha256 e16be156…ed048) = frame 0 rendered losslessly (mean difference
vs the decoded MP4 frame 0: 1.7 / 2.7 / 3.7 per RGB channel out of 255, i.e. H.264 compression only).

## Topic decision (see context/14)
The brief's 6 × 4 = 3 × 4 doubled is english15-01's strategy (six fact = three fact doubled). As the brief allows,
a fresh alternate in the same genre: the robot mini-story with the brief's 3 × 4 = 12 fact, teaching multiplication
by a multiple of ten (4 × 30 = 12 tens = 120), not covered before. Hook words "TOO MANY TO COUNT?" instead of
"DOUBLE THE ROBOT!" (no doubling in this story).

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −15.4 LUFS integrated, LRA 4.5 LU, true peak −1.5 dBTP | pass |
| stem balance | music subtle | stems as mixed: VO −16.6 LUFS, SFX −26.1 LUFS, music −27.9 LUFS (both ducked further under speech) | pass |

## First frame
- Frame 0 is the finished hook image: 120 loose cookies (4 × 30), the robot with dizzy spiral eyes, sweat and steam
  counting one by one (orange ring + bubble "3"), card "4 × 30 = ?", headline "TOO MANY TO COUNT?" (4 words) — no
  logo, fade, black or empty setup. Hook audio from 0.07 s; the promised shortcut arrives at 3.5 s ("packs them in
  tens") and the answer at 20.4 s ("one hundred twenty"), the method at 21.7 s.

## Narration and captions (evidence: asr_words.txt, asr_windows.txt; faster-whisper base.en, run locally on the final MP4)
- Machine transcript of the delivered MP4 (no human listening was performed in this session):
  "four rows of 30 cookies, too many to count one by one, so the robot packs them in tens. Ten, twenty, thirty, one
  row is three tens, four rows, three tens in each. How many tens in all? Twelve tens. Ten tens make one hundred. Two
  more tens make one hundred twenty. Four times three is twelve, so four times thirty is twelve tens. [Ten tens.] Play
  and learn tables with table verse." → matches the script, English only.
- "[Ten tens.]" is an ASR hallucination in the 25.5–27.7 s gap (music + chime, no narration): the VO stem peak in
  25.55–27.75 s is 0.00000, and window ASR of 25.3–27.7 s cut from the MP4 returns no words.
- Window ASR confirms the counts and CTA: 5.6–8.2 s → "10 | 20 | 30"; 16.0–17.4 s → "12 | tens"; 27.4–30 s →
  "Play and learn tables with Tableverse." Each clip was also transcribed in isolation before mixing (all exact).
- Clip placement is frame-exact; whole-file first-word offsets −0.31…+0.21 s; no VO overlaps; last word ends 29.80 s.
- Caption/VO sync: "Ten!/Twenty!/Thirty!" land on the frame each tube fills; card faces change on "one hundred
  twenty" (f611), "twelve" (f676) and "twelve tens" (f737); "120" never appears before it is said. Captions ≤ 2
  lines inside x 100–900 / y 240–396.

## Picture (evidence: contact_sheet.png; frames/ — 53 beat and transition frames, 540×960 JPG)
- Sequence: headline folds (f84–98) → light bulb (f108) → tubes 1–3 fill (f156–224) → row 1 glows (f256) → rows 2–4
  packed while the robot zooms (f286–354) → question + pause → tags 1–12 (f440–484) → crate pops up (f506–520) → ten
  tubes into the crate (f522–550), "100" (f548) → "20" (f586) → card 4 × 30 = 120 (f604–618) → tubes hop back
  (f650–680), crate folds (f690–704) → cards 4 × 3 = 12, 4 × 30 = 120 → dance, glow (f766–808) → page turn → CTA.
- Counting accuracy: 120 cookies in every frame (loose cookies + 10 slices per filled tube); each tube shows exactly 10
  full slices; the crate holds exactly 10 tubes; 2 tubes stay on the tray during "two more tens"; no cookies
  elsewhere (background shelves hold none).
- Safe areas: headline text from y ≈ 230; captions y 240–396; cookies/tubes x ≈ 188–852, y ≈ 638–1100; crate
  x 572–868, y 1196–1440; "20" tag x 856–924; CTA wordmark and "on Google Play" badge left clear (robot rolls aside).
- Readability at full resolution: headline 84 px, card 74 px, captions 54 px, tags 32 px, "100"/"20" 36/34 px.

## Issues found and fixed before delivery
1. Brief's doubling repeated english15-01 → tens strategy (documented above).
2. The robot's pointing arm flipped down for targets up-left (angle wrap) → fixed; arms moved in front of the head
   with wider shoulders (raised arms were hidden behind the head).
3. A belly gauge read as a frowning second face → replaced with a speaker grille.
4. Robot too small for the hook → enlarged (×1.25); steam puffs made visible.
5. Tube end caps half-covered the first and last cookie slices (a full tube looked like ~9) → narrower caps and new
   slice spacing; all ten slices visible.
6. Robot covered the "on Google Play" badge on the end card → it rolls aside during the page turn.
7. Whole-file ASR heard "Lay" for "Play": the end-card pop landed on the P → pop/page rustle moved earlier, VO at
   27.80 s; re-check hears "Play".
After the fixes the film was fully re-rendered and every check above run on the final file.

## Content and claims
- Facts: CCSS 3.NBT.A.3, 2.NBT.A.1a, 3.OA.B.5, 3.OA.A.1 — official PDF, quoted in context/14. Measured facts =
  arithmetic; bakery, robot, tubes and crate are illustrative; no "twice as fast" claim.
- No timed quiz, score, pressure or learning guarantee; the pause is untimed.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Known limitations
- Listening check is machine-based (ASR + loudness/peak meters + stem inspection); I did not personally listen.
- The maths differs from the brief (tens instead of doubling) by the no-repeat rule; the frame-0 words differ for
  truthfulness.
- No user review folder exists in this cloud session; the MP4 and thumbnail are attached and pushed.
