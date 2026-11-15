# QA — tableverse-30s-english16-01.mp4 ("Pack in Sevens", 63 ÷ 7 = 9 and 9 × 7 = 63)

File: `videos/tableverse/production/30s/2026-11-15-english-16/tableverse-30s-english16-01.mp4` · checked 2026-11-15
sha256 `a648d835fc14c0ac9e6c3e442dc62345b4dd4fbd724470dec09f09a22ac594f5`. Thumbnail:
`tableverse-30s-english16-01-thumbnail.png` (sha256 116ee5ea…cd15d) = frame 0 rendered losslessly (mean difference
vs the decoded MP4 frame 0: 1.7 / 2.7 / 3.8 per RGB channel out of 255, i.e. H.264 compression only).

## Topic decision (see context/13)
The brief's "ten groups of seven, a creature steals one group, 70 − 7 = 63" is the same strategy english14-01 taught
(9 × 8 = 80 − 8). Kept the creature, nine groups of exactly seven, the reversible story, format and CTA; taught the
not-yet-covered idea in the same picture: 63 ÷ 7 = 9 ⇔ 9 × 7 = 63. Hook words "HOW MANY PACKS?" instead of
"ONE GROUP ESCAPED" (nothing escapes in this story).

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −15.9 LUFS integrated, LRA 3.6 LU, true peak −1.5 dBTP | pass |
| stem balance | music subtle | stems as mixed: VO −17.1 LUFS, SFX −27.1 LUFS, music −28.5 LUFS (both ducked further under speech) | pass |

## First frame
- Frame 0 is the finished hook image: 63 golden star cookies (9 × 7), pack 1 closed with tag "1", the mouse pulling
  pack 2 shut by a ribbon, card "63 ÷ 7 = ?", headline "HOW MANY PACKS?" (3 words) — no logo, fade, black or empty
  setup. Hook audio starts at 0.07 s: "Sixty-three cookies, packed in sevens. How many packs?" → answered at 17.3 s
  ("…divided by seven is nine") and turned into the method at 21.5 s ("what times seven makes sixty-three?").

## Narration and captions (evidence: asr_words.txt, asr_windows.txt; faster-whisper base.en, run locally on the final MP4)
- Machine transcript of the delivered MP4 (no human listening was performed in this session):
  "63 cookies packed in 7s. How many packs? That's 1 pack. 7 cookies in each. Can you guess how many packs? 2, 3, 4,
  5, 6, 7, 8, 9. 9 packs. So 63 divided by 7 is 9. Now unpack them. 9 7s make 63. To divide, ask what times 7 makes
  63. Play and learn tables with table verse." → matches the script ("7s" = "sevens"), English only, nothing missing
  or added.
- The whole-file window check put "Two" and "Play" just outside their ±0.15 s windows; targeted window ASR on cuts
  from the MP4 confirms them: 8.4–9.6 s → "two | three"; 8.4–14.2 s → "2, 3, 4, 5, 6, 7, 8, 9"; 27.4–30 s →
  "Play and learn tables with Tableverse." Each clip was also transcribed in isolation before mixing (all exact).
- Clip placement is frame-exact; first-word offsets −0.28…+0.13 s; no VO overlaps; last word ends 29.73 s.
- Each count word lands on the frame its pack closes (WRAP_AT); card face changes on "nine" (f518) and
  "sixty-three" (f610). 24.5–27.7 s carries no narration on purpose: the child sees the answer (card back to
  9 × 7 = 63, rows pack again) after the question.
- Captions mirror the VO from v02 on (v01 is carried by the frame-0 headline + card), ≤ 2 lines, inside
  x 100–900 / y 240–396.

## Picture (evidence: contact_sheet.png; frames/ — 45 beat and transition frames, 540×960 JPG)
- Sequence: headline folds away (f84–98) → pack 1 glows, badges 1–7 → question + pause with lean-in (mouse holds
  pack 2 half-closed) → packs 2–9 close f262–402 with tags → all nine glow (f430) → card 63 ÷ 7 = 9 (f511–525,
  camera eases toward the card) → lids open in a wave (f556–602), card 9 × 7 = 63 → card ? × 7 = 63, tags 1–9 bounce
  (f690–726) → card 9 × 7 = 63, rows pack again (f748–792) → page turn → TableVerse card.
- Counting accuracy: exactly 63 cookies (9 rows × 7) in every sampled frame; the lids are clear, so no cookie is
  ever hidden; every pack holds exactly seven; no cookies anywhere else (background shelves hold no cookies).
- Safe areas: headline text from y ≈ 230; captions y 240–396; cookies x ≈ 245–819, y ≈ 628–1418; tags x 191–231;
  nothing essential right of x ≈ 845.
- Readability at full resolution: headline 84 px, card 74 px, captions 54 px, badges 30 px, tags 27 px, wordmark 122 px.

## Issues found and fixed before delivery
1. Requested strategy repeated english14-01 → division as the reverse of multiplication (documented above).
2. First wrap design: semi-opaque striped bands hid the cookies once closed (count unreadable) → clear lids with a
   violet rim; all 63 cookies stay visible.
3. Star cookies read as lilac badges (thick icing line) → chubby golden stars with a thin icing line.
4. Mouse too small and partly under the lamp → enlarged (×1.45), lamp moved to the window side; a ribbon to the lid
   makes the pull readable.
5. Frame 0 showed only a half-closed first row (ambiguous) → pack 1 already closed and the mouse pulling pack 2.
6. "Can you guess how many packs?" filled the caption width (accent bar touched the first letter) → two lines.
7. Glow over closed packs washed the cookies out → softer warm glow.
After the fixes the film was fully rendered and every check above run on the final file.

## Content and claims
- Facts: CCSS 3.OA.A.2, 3.OA.A.4, 3.OA.B.6, 3.OA.C.7 — official PDF, quoted in context/13. Measured facts =
  arithmetic; bakery, tray, lids, mouse and baker are illustrative.
- No timed quiz, score, pressure or learning guarantee; the guessing pause is untimed.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Known limitations
- Listening check is machine-based (ASR + loudness/peak meters); I did not personally listen to the audio.
- The idea taught differs from the brief (division instead of 70 − 7) by the no-repeat rule; the hook words differ
  for truthfulness. Everything else follows the brief.
- No user review folder exists in this cloud session; the MP4 and thumbnail are attached and pushed.
