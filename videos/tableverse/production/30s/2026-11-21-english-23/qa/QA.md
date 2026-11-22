# QA — tableverse-30s-english23-01.mp4 ("Is It Time Yet?", three jumps of five minutes: 3 × 5 = 15)

File: `videos/tableverse/production/30s/2026-11-21-english-23/tableverse-30s-english23-01.mp4` · checked 2026-11-22
sha256 `63d6cab83c4af8e823236f5e1d198d6568ee491efd94178d8f07f7cdf3e43b8d`. Thumbnail:
`tableverse-30s-english23-01-thumbnail.png` (sha256 e17c790e…dcfd59b7) = frame 0 rendered losslessly (mean difference vs
the decoded MP4 frame 0: 1.9 / 3.3 / 2.5 per RGB channel out of 255, i.e. H.264 compression only; `thumbnail_check.txt`).

## Topic decision (see context/21)
The proposal (5 carriages × 3 pillows = 15) is equal groups — feedback-01's topic, also counted in batch 22. An unrelated
subject was chosen: the five times table on a clock (each number the big hand passes = 5 more minutes; 3 jumps = 15
minutes). Different core question, setting and mechanism from batch 22's leftovers in the moon hotel.

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt, stem_loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −17.0 LUFS integrated, LRA 3.5 LU, true peak −2.2 dBTP | pass |
| stem balance | soundtrack below a clear voice | stems as mixed: VO −17.1 LUFS, SFX −28.1 LUFS, music −26.8 LUFS (ducked −11 dB under speech; the music level here includes the un-ducked snore and departure moments) | pass |

## First frame
Frame 0 is the finished hook image: the sleepy dragon squashed under an absurd giant pillow on the cloud platform (face
peeking out, snoring), the cloud train behind, headline "IS IT TIME YET?" (4 words) — no logo, fade, black or empty
setup. Hook audio from 0.07 s; the question is answered at 13.3 s ("Fifteen minutes. All aboard!") and explained at
18.7–25.9 s.

## Narration and captions (evidence: asr_words.txt, asr_windows.txt, vo_stem_gaps.txt, caption_bounds.txt; faster-whisper base.en, local)
- Machine transcript of the delivered MP4 (no human listening was possible in this session): "Is it time yet? The
  cloud train leaves when the big hand reaches three. Wake up sleepy dragon. Five minutes, not yet. Ten minutes, still
  not yet. Fifteen minutes, all aboard. The big hand made three jumps of five minutes. Three times five is fifteen. Each
  number on the clock is five more minutes. Play and learn tables with Tableverse." → matches the script exactly, English
  only, no hallucinated words.
- Window ASR on eight cuts from the MP4 (hook, wake + five, ten, fifteen, three jumps, payoff, each number, CTA): every
  window matches the script.
- VO stem digitally silent in every narration-free gap (7 gaps in vo_stem_gaps.txt). Clip placement is frame-exact; no
  VO overlaps (a short gap was widened between "Wake up, sleepy dragon!" and "Five minutes"); last word ends 29.93 s.
- Sync: each big-hand jump lands on its beat just before its spoken number (f162 / f270 / f396); the whistle sits after
  "All aboard!" so it never masks the word; the sign 3 × 5 = 15 appears on "Three times five" (f650).
- Captions: one at a time, ≤ 2 lines, boxes inside x 125–875, y 294–450 (brief: ≈ y 280–460 with side margins); the
  frame-0 headline (x 90–910, y 278–474) folds away before the first caption. Other text: the clock numerals 12, 3, 6, 9
  (part of the clock) and the payoff sign (below the clock, from 21.7 s).

## Picture (evidence: contact_sheet.png; frames/ — 59 cut, beat and transition frames, 540×960 JPG)
- Cuts on the beat at f54, 126, 162, 234, 270, 306, 396, 432, 558, 810; one idea per shot (question / station / wake /
  five / snore / ten / jam / fifteen / boarding / explanation / CTA).
- Clock accuracy: the big hand shows :00, :05, :10, :15 (then :20–:35 in the demonstration); the hour hand moves from 9
  toward 10 in proportion; the yellow wedges match the minutes shown; a fast orange second hand only suggests time
  passing between jumps.
- Characters: the dragon's face is visible in every dragon shot; the pillow never hides the clock; the conductor robot
  and baker are decoration (the baker folds flat for close shots so he never covers the dragon).
- Safe areas: captions/headline in the upper band; clock and sign x ≈ 360–720 (wide) inside the safe width; nothing
  vital at the right edge or bottom (the robot stands at x ≈ 860 as decoration).
- Readability at full resolution: headline 84 px, captions 54 px, clock numerals 46 px (≈ 92 px in close-ups), sign
  70 px (≈ 135 px in the payoff close-up).

## Issues found and fixed before delivery
1. The proposal repeated equal groups (feedback-01, batch 22) → telling time in fives (documented above).
2. Frame 0 in the wide shot made the dragon too small → opens on a close shot of the dragon under the pillow, then cuts on
   the beat to the station when the narration says "big hand".
3. The baker stood in front of the dragon and the dragon's face was cut at the frame edge → the baker folds flat for any
   close shot; the dragon lies further right so its face peeks out; close-ups re-centred.
4. In the jam and boarding shots the clock sat under the two-line captions → those shots use the wide framing.
5. The whistle would have masked "aboard" → moved after the word; a short pause added after "Wake up, sleepy dragon!".
After the fixes the film was fully re-rendered and every check above was run on the final file.

## Content and claims
- Facts: CCSS 2.MD.C.7, 3.MD.A.1, 3.OA.A.1, 3.OA.C.7; England NC KS1–2 Y2 (time to five minutes; minutes in an hour) —
  quoted in context/21. The sign reads 3 × 5 = 15 ("three jumps of five"); the brief's 5 × 3 = 15 is the same product.
- Dragon, train, cloud station, robot conductor and clock are fiction; no real timetable or product claim. No timed quiz,
  score, pressure or learning guarantee.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Checks not performed / limitations
- I could not watch or listen as a person: listening is machine-based (ASR + loudness/peak meters + stem inspection) and
  the picture check is frame-based (contact sheet + 59 sampled frames, not real-time playback).
- The subject differs from the brief's proposal (time in fives instead of the covered equal groups of pillows).
- Not tested on an actual phone or inside a social platform's UI overlay; safe areas were checked by coordinates.
