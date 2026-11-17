# QA — tableverse-30s-english19-01.mp4 ("Seven or Zero?", 7 × 1 = 7, 7 × 0 = 0)

File: `videos/tableverse/production/30s/2026-11-17-english-19/tableverse-30s-english19-01.mp4` · checked 2026-11-17
sha256 `78ffd877c2dc4a6a4df3d209a2b06f94fde1dc8d7a343404a2a8aca80bb7058f`. Thumbnail:
`tableverse-30s-english19-01-thumbnail.png` (sha256 72a20ab3…b70bdd6) = frame 0 rendered losslessly (mean difference
vs the decoded MP4 frame 0: 1.6 / 2.5 / 3.3 per RGB channel out of 255, i.e. H.264 compression only).

## Topic decision (see context/16)
The brief's 9 × 6 = 10 × 6 − 6 is english14-01's strategy (9 × 8 = 10 × 8 − 8). A genuinely different specific topic
in the same genre was chosen: groups of one and groups of zero (7 × 1 = 7, 7 × 0 = 0), not covered before.

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −16.5 LUFS integrated, LRA 4.1 LU, true peak −1.4 dBTP | pass |
| stem balance | music subtle | stems as mixed: VO −17.5 LUFS, SFX −26.1 LUFS, music −26.9 LUFS (both ducked further under speech) | pass |

## First frame
- Frame 0 is the finished hook image: seven boxes with one star cookie each, the hungry mouse peeking from its hole
  with its mouth open, card "7 × 0 = ?", headline "SEVEN OR ZERO?" (3 words) — no logo, fade, black or empty setup.
  Hook audio from 0.07 s; the question is answered at 17.3 s ("Zero!") and generalised at 19.9–24.4 s.

## Narration and captions (evidence: asr_words.txt, asr_windows.txt; faster-whisper base.en, run locally on the final MP4)
- Machine transcript of the delivered MP4 (no human listening was performed in this session):
  "Seven times zero, is it seven or zero? Let's ask a hungry mouse. Seven boxes, one cookie in each. Seven ones make
  seven. Then the mouse eats the cookie in every box. Now each box has zero cookies. How many in all? Zero, seven
  zeros make zero. Zero in every group means zero in all. Any number times zero is zero. [Zero in every group means
  zero. Zero in every group means zero.] Play and learn tables with Tableverse." → matches the script, English only.
- The bracketed repeat is an ASR hallucination in the 24.4–27.8 s nap (music, hinge and sparkle SFX only, no
  narration): the VO stem peak in 24.45–27.80 s is 0.00000, and window ASR of 24.4–27.8 s cut from the MP4 returns only
  "You" (a typical non-speech artefact) — no words from the script.
- Window ASR on cuts from the MP4: 0–4.6 s → "7 times 0, is it 7 or 0? Let's ask a hungry mouse."; 17.0–19.6 s →
  "0, 7 zeros make 0."; 27.5–30 s → "Play and learn tables with Tableverse." Each clip was also transcribed in isolation
  before mixing (all exact).
- Clip placement is frame-exact; whole-file first-word offsets −0.38…+0.23 s; no VO overlaps; last word ends 29.87 s.
- Caption/VO sync: card 7 × 1 = 7 on "make seven" (f217), back to 7 × 0 = ? on "How many" (f449), 7 × 0 = 0 on "Zero!"
  (f520), any × 0 = 0 on "any number times zero" (f677); the answer "7 × 0 = 0" appears only on "Zero!". Captions
  ≤ 2 lines inside x 100–900 / y 240–396.

## Picture (evidence: contact_sheet.png; frames/ — 50 beat and transition frames, 540×960 JPG)
- Sequence: headline folds (f118–132) → "1" badges (f146–182) → card 7 × 1 = 7 → mouse leaps out (f240–254) and eats
  box by box (three bites, crumbs, badge 1 → 0, rounder belly) → home (f368) → card 7 × 0 = ? → pause with lean-in →
  card 7 × 0 = 0, 0 badges pulse → box fronts fold down in a wave revealing empty boxes (f604–640) → card any × 0 = 0 →
  nap with paper "z"s → fronts close (f786–810) → page turn → CTA.
- Counting accuracy: exactly 7 boxes in every frame; exactly one cookie per box until that box's visit; each box's
  badge always matches its contents (1 or 0); no cookies anywhere else (background shelves hold none); the mouse never
  hides the cookie it is eating (it stands beside it, mirrored).
- Safe areas: headline text from y ≈ 230; captions y 240–396; boxes x ≈ 97–903, y ≈ 687–1206; mouse hole x 78–226,
  y 1350–1498; baker and floor props on the floor (y > 1460), decorative only.
- Readability at full resolution: headline 84 px, card 74/68 px, captions 54 px, badges 44 px, cookies ≈ 96 px.

## Issues found and fixed before delivery
1. Brief repeated english14-01's strategy → × 1 / × 0 topic (documented above).
2. Cookies hid behind tall box fronts → shorter boxes, bigger cookies sitting above the rim.
3. Empty lower half of the stage → mouse hole at the bottom of the page (start and nap spot).
4. The mouse covered the cookie it was eating (bites invisible) → it stands beside the cookie, mirrored so its tail
   swings away.
5. The takeaway was static → hinged box fronts fold down in a wave to show that every box is empty.
After the fixes the film was fully re-rendered and every check above run on the final file.

## Content and claims
- Facts: CCSS 3.OA.A.1, 3.OA.D.9, Glossary Table 3 (multiplicative identity) — official PDF, quoted in context/16; the
  zero case follows from the equal-groups meaning (Table 3 names no zero property; noted in context/16).
- Measured facts = arithmetic; mouse, boxes and bakery are illustrative.
- No timed quiz, score, pressure or learning guarantee; the pause is untimed.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Known limitations
- Listening check is machine-based (ASR + loudness/peak meters + stem inspection); I did not personally listen.
- The maths differs from the brief (× 1 / × 0 instead of the repeated "ten groups minus one").
- When the box fronts are folded down, the 0 badges ride on the flaps and are foreshortened (still legible).
- No user review folder exists in this cloud session; the MP4 and thumbnail are attached and pushed.
