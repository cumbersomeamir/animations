# QA — tableverse-30s-english24-01.mp4 ("How Far Around?", perimeter of a square: 4 × 8 = 32 hops)

File: `videos/tableverse/production/30s/2026-11-23-english-24/tableverse-30s-english24-01.mp4` · checked 2026-11-23
sha256 `70cffa76a3a01aaa6dc90cf3d04246c7a541d169b0709e2079e4a008d27a1d80`. Thumbnail:
`tableverse-30s-english24-01-thumbnail.png` (sha256 7a7a08f3…87e82b) = frame 0 rendered losslessly (mean difference vs
the decoded MP4 frame 0: 2.0 / 3.6 / 2.4 per RGB channel out of 255, i.e. H.264 compression only; `thumbnail_check.txt`).

## Topic decision (see context/22)
The proposal (a tiny lift, three trips of four stars = 12) is equal groups 3 × 4 — feedback-01 and batch 22 (three lifts
of four). An unrelated subject was chosen: the perimeter of a square (one side 8 hops, four equal sides, 4 × 8 = 32).
Different core question, setting and mechanism from batch 23 (time in fives on a clock).

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt, stem_loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −16.6 LUFS integrated, LRA 3.2 LU, true peak −2.2 dBTP | pass |
| stem balance | soundtrack below a clear voice | stems as mixed: VO −16.6 LUFS, SFX −29.2 LUFS, music −26.7 LUFS (ducked −11 dB under speech) | pass |

## First frame
Frame 0 is the finished hook image: a close shot of the little star at the corner of the big square roof, shading its
eyes to look along the long edge of hop stones, the mouse starter with its chequered flag below; headline
"HOW FAR AROUND?" (3 words) — no logo, fade, black or empty setup. Hook audio from 0.07 s; answered at 15.2–18.3 s
(8, 16, 24, 32) and explained at 20.6–26.2 s.

## Narration and captions (evidence: asr_words.txt, asr_windows.txt, vo_stem_gaps.txt, caption_bounds.txt; faster-whisper base.en, local)
- Machine transcript of the delivered MP4 (no human listening was possible in this session): "How far around? This little
  star wants to hop one lap of the roof. One side is eight hops. Oof does it have to count every side? No, it's a square.
  So all four sides are the same. Eight, sixteen, twenty-four, thirty-two. Four times eight is thirty-two hops. The
  distance around is the perimeter. Four times one side. Play and learn tables with table verse." → matches the script,
  English only, no hallucinated words.
- Window ASR on eight cuts from the MP4 (hook, one side, oof, square, counts, payoff, perimeter, CTA): every window
  matches the script.
- Fixed before delivery: "Phew!" was heard as "View" → "Oof!" (heard correctly alone and in the mix).
- VO stem digitally silent in every narration-free gap (8 gaps in vo_stem_gaps.txt). Clip placement is frame-exact; no
  VO overlaps; last word ends 29.93 s.
- Sync: hop springs land on each hop (f135–198); each count is spoken as the star reaches the next corner (sides finish at
  f462/486/510/534); the sign appears on "Four times eight" (f618); the sides pulse on "four times one side".
- Captions: one at a time, ≤ 2 lines, boxes inside x 135–865, y 294–450 (brief: ≈ y 280–460 with side margins); the
  frame-0 headline (x 90–910, y 278–474) folds away before the first caption. Other text: the payoff sign only.

## Picture (evidence: contact_sheet.png; frames/ — 56 cut, beat and transition frames, 540×960 JPG)
- Cuts on the beat at f54, 126, 252, 342 (then wide through the lap and payoff) and f810; one idea per shot (question /
  city + start / one side / tired corner / equal sides / lap / payoff / CTA).
- Geometry: the roof is drawn as a true square (620 × 620 px, 8 hop stones per side, 32 around); the measured side is
  rotated exactly 90°, 180°, 270° about the square's centre, so each copy lands on a side of the same length; the
  equal-side ticks follow the usual double-tick convention.
- Safe areas: captions/headline in the upper band; the square x 230–850, y 640–1260; the star stays on the edge (≤ x 850);
  nothing vital at the right edge or bottom (towers, balloons, lift and baker are decoration; the baker folds flat in
  close shots).
- Readability at full resolution: headline 84 px, captions 54 px, sign 70 px; the star ≈ 115 px wide in wide shots,
  ≈ 200 px in close shots.

## Issues found and fixed before delivery
1. The proposal repeated three groups of four (feedback-01, batch 22) → the perimeter of a square (documented above).
2. Frame 0 was crowded (mouse, flag and a balloon around the star) → the mouse moved to a tower balcony with its flag
   flying away from the star; balloons moved clear of the corner.
3. "Phew!" heard as "View" → "Oof!".
After the fixes the film was fully re-rendered and every check above was run on the final file.

## Content and claims
- Facts: Oak National Academy Y4 perimeter lessons (definition; multiply the side length by the number of sides for a
  regular polygon, applied there to a square); CCSS 3.MD.D.8, 4.MD.A.3; England NC KS1–2 Y3–Y4 — quoted in context/22.
  The rule is stated only for a square, as Oak warns against over-generalising it.
- Star, city, mouse starter and lift cameo are fiction; "hops" are a non-standard unit. No timed quiz, score, pressure or
  learning guarantee.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Checks not performed / limitations
- I could not watch or listen as a person: listening is machine-based (ASR + loudness/peak meters + stem inspection) and
  the picture check is frame-based (contact sheet + 56 sampled frames, not real-time playback).
- The subject differs from the brief's proposal (perimeter instead of the covered three groups of four).
- Not tested on an actual phone or inside a social platform's UI overlay; safe areas were checked by coordinates.
