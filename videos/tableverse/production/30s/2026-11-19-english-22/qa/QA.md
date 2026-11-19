# QA — tableverse-30s-english22-01.mp4 ("Too Many Aliens!", 3 × 4 = 12 seats, 1 left over)

File: `videos/tableverse/production/30s/2026-11-19-english-22/tableverse-30s-english22-01.mp4` · checked 2026-11-19
sha256 `13ddac27c48d047c017b94ec7feba5fd5b7e51ea8e1558ab21d6245a57aac856`. Thumbnail:
`tableverse-30s-english22-01-thumbnail.png` (sha256 86941e63…e89bf8) = frame 0 rendered losslessly (mean difference vs
the decoded MP4 frame 0: 1.7 / 4.0 / 3.3 per RGB channel out of 255, i.e. H.264 compression only; `thumbnail_check.txt`).

## Topic decision (see context/20)
The brief's maths (three lifts of four = 3 × 4 = 12, equal groups) is feedback-01's "three groups of four still make
twelve". Kept the moon hotel, three lifts of four seats, the squashed impatient tiny alien, "TOO MANY ALIENS!", twelve
aliens counted once and 3 × 4 = 12 only at the payoff; the tiny alien is the thirteenth, so the new idea is the leftover.

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt, stem_loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −16.5 LUFS integrated, LRA 3.4 LU, true peak −2.2 dBTP | pass |
| stem balance | soundtrack below a clear voice | stems as mixed: VO −16.9 LUFS, SFX −27.8 LUFS, music −28.7 LUFS; music ducked −11 dB and SFX −5 dB under speech | pass |

## First frame
Frame 0 is the finished hook image: a close-up of lift 1 packed with four squished aliens, the tiny orange alien wedged
in the straining doors, headline "TOO MANY ALIENS!" (3 words) — no logo, fade, black or empty setup. Hook audio from
0.07 s. The question it raises ("Why is there never room?") is answered at 15.8–21.9 s (12 seats, 13 aliens, 1 left over).

## Narration and captions (evidence: asr_words.txt, asr_windows.txt, vo_stem_gaps.txt, caption_bounds.txt; faster-whisper base.en, local)
- Machine transcript of the delivered MP4 (no human listening was possible in this session): "Too many aliens, the
  little one can't squeeze in. Lift two, full. Lift three, full again. Why is there never room? Let's peek inside. Each
  lift has four aliens. Four, eight, 12, 12 seats, but one more alien makes 13. Three times four is 12, so one is left
  over. The next lift is all yours, little one. Play and learn tables with Tableverse." → matches the script exactly,
  English only, no hallucinated words.
- Window ASR on nine cuts from the MP4 (hook, lifts 2–3, question, peek + count, "Each lift has four aliens", thirteen,
  payoff, resolution, CTA): every window matches the script.
- Fixed before delivery: "Four aliens in each lift." ended on a "lift" that ASR heard as "left" in context (even on the
  clean VO stem) → re-written "Each lift has four aliens." (heard correctly alone, in context and in the mix). Music
  ducking was also deepened (−7 → −11 dB) so the voice sits clearly on top.
- VO stem digitally silent in every narration-free gap (8 gaps listed in vo_stem_gaps.txt). Clip placement is
  frame-exact; no VO overlaps; last word ends 29.93 s.
- Captions: one at a time, ≤ 2 lines, boxes inside x 156–844, y 294–450 (brief: ≈ y 280–460 with side margins); the
  frame-0 headline sits in the same band (x 90–910, y 278–474) and folds away before the first caption. The only other
  text is the payoff sign "3 × 4 = 12" (y 560–668), which appears at 19.3 s, after the count, as the brief asks.

## Picture (evidence: contact_sheet.png; frames/ — 68 cut, beat and transition frames, 540×960 JPG)
- Cuts on the beat at f90, 144, 216, 306, 570, 720, 810 (plus push-ins at 216–306 and 474–570); each shot holds one
  idea (lift 1 / lift 2 / lift 3 / question / reveal + count / thirteen / payoff / resolution / CTA).
- Counting accuracy: exactly 12 identical lilac guests (4 per lift) — all visible whenever the doors are open — plus
  the one orange tiny alien = 13; no other aliens anywhere. The guests are counted once, by lifts (4, 8, 12), each
  group outline appearing on its spoken number; "3 × 4 = 12" appears only at the payoff. Lift 1 comes back empty
  after its four rode up (doors closed in between).
- Safe areas: captions/headline in the upper band; counted aliens x ≈ 114–886, y ≈ 1030–1300 (wide shots); the tiny
  alien at x ≈ 300–785, y ≤ 1462; nothing vital at the right edge or bottom (baker and floor props are decoration, and
  the baker folds flat during the close-ups).
- Sharpness: the stage is drawn straight onto each frame at camera scale (no 1× page buffer except during the page
  turn), with 2× cached lobby / lift / door textures, so the 2× close-ups stay crisp.
- Readability at full resolution: headline 84 px, captions 54 px, sign 78 px; guests ≈ 92 px wide in wide shots,
  ≈ 185 px in close-ups.

## Issues found and fixed before delivery
1. Brief repeated feedback-01's 3 groups of 4 = 12 → leftovers (documented above).
2. First "close-ups" were only 1.4× and the page was rasterised at 1× before zooming (soft) → stage drawn directly at
   camera scale, 2× textures, 2.0× close-ups.
3. Frame 0 did not read as "absurdly full" (doors hid the crowd) → lower ceiling, doors open wider, squished faces,
   bent antennae.
4. The pop-up baker loomed over the close-ups → folds flat during close-ups, stands in wide shots.
5. The count was hard to follow → a dashed group outline builds on each spoken number.
6. "…in each lift." heard as "left" → "Each lift has four aliens."; music ducked deeper under speech.
After the fixes the film was fully re-rendered and every check above was run on the final file.

## Content and claims
- Facts: CCSS 3.OA.A.1, 3.OA.C.7, 4.OA.A.3, 4.NBT.B.6; England NC KS1–2 Y5 (interpret remainders) — quoted in context/20.
- Measured facts = arithmetic (3 × 4 = 12; 13 = 12 + 1). Moon hotel, lifts and aliens are fiction; no claim about the real
  Moon. No timed quiz, score, pressure or learning guarantee.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Checks not performed / limitations
- I could not watch or listen as a person: the listening check is machine-based (ASR + loudness/peak meters + stem
  inspection) and the picture check is frame-based (contact sheet + 68 sampled frames, not real-time playback).
- The maths differs from the brief's wording (leftovers instead of the covered plain 3 groups of 4).
- Not tested on an actual phone or inside a social platform's UI overlay; safe areas were checked by coordinates.
