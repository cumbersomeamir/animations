# QA — tableverse-30s-feedback-01.mp4 ("Four Groups of Three")

File: `videos/tableverse/production/30s/2026-11-02-feedback-round/tableverse-30s-feedback-01.mp4`
sha256 `0da083fa8f30cf20f8fc620a37ec7db8c13aca539d999d75a0059e1d4f6172fc` · 9.4 MB · checked 2026-11-02.

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p, bt709 tags | pass |
| audio | AAC | AAC LC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness | voice clear, no clipping | −15.5 LUFS integrated, LRA 2.7 LU, true peak −1.5 dBTP | pass |
| stem balance | music subtle | VO −17.1 LUFS, SFX ≈ −23 LUFS, music −28.3 LUFS before ducking (−7 dB more under speech) | pass |

## Narration timing (evidence: asr_words.txt, asr_windows.txt; faster-whisper base.en, local)
- Every clip is placed by frame from `timeline.json`; planned spans in `build/vo_spans.json` (no overlaps; last word ends 29.61 s).
- Long-form ASR of the final MP4 matches the script for all lines with first-word offsets between −0.01 and +0.19 s.
- Two long-form ASR artifacts, investigated:
  1. The isolated counts "three, six" were dropped by the long-form pass. A targeted pass on the final mix
     (6.8–12.8 s) hears "3 | 6 | 9 | 12", and the isolated VO stem hears "Three. Six. Nine. Twelve." → intelligible;
     this was a segmentation artifact in the long-form pass, not masking.
  2. Long-form ASR adds a phrase after the CTA ("Three numbers" / "Thirty hundred stars" on two runs). A targeted pass on
     the final 3.5 s hears only "Play and learn tables together with Tableverse."; after 29.6 s the track is the
     final soft piano chord (peak −26 dBFS) → hallucination over music, no extra speech exists.
- Counts land on the action: "three/six/nine/twelve" start on the glow frames 222/268/314/360, when TOTAL shows 3/6/9/12.

## Picture (evidence: contact_sheet.png — 1 frame per second; frames/ — scene boundaries and transitions)
- Strong opening: frame 0 shows the cut-paper cover; the baker pops up at f4, the cover flips up f10–28 and the bakery
  pops up behind it — motion inside the first second.
- Distinct scenes that show the mechanism while it is narrated: pop-up baskets (f52–82), "3" tags (f108–136),
  12 single apple hops along dotted tracks (f186–368), glow + flip-card total (f222/268/314/360), card + flap
  (f386/452), card folds away, apples lift, page turns, tins pop, apples regroup 4 per tin (f504–622), recount badges
  1–12 (f640–695), drawing page (f742–786), end card (f800–838). No camera wobble; every change is a mechanism.
- Counting accuracy (checked on every 1 s sample and at transitions): 12 apples visible at all times while counted
  (crate 12 → baskets 3/3/3/3 with crate decreasing → hover 12 → tins 4/4/4); TOTAL never disagrees with the baskets;
  no decorative apples anywhere; unequal groups are never labelled.
- Safe areas: no meaningful text above y = 300 (only bunting); captions centred at y = 430, spanning ≤ y 355–505,
  inside x 90–990, max two lines, never overlapping other text; counted objects stay within x ≈ 116–964, y ≈ 940–1450.
- Readability: captions 56 px, card lines 54 px / 78 px, TOTAL 92 px, recount badges 29 px numerals, wordmark 120 px,
  "on Google Play" 46 px.
- Page turns (f19, f541, f731, f797): lifting page foreshortens to the hinge with shading and a cast shadow; the next
  spread is already underneath; hovering apples stay in front during the f530–552 turn.

## Content / claims
- Facts: equal-groups meaning and the 4×3 / 3×4 example match CCSS 3.OA.A.1 and 3.OA.B.5 (context/09).
- App claims: only "TableVerse … on Google Play" and the verbal CTA; no capability, guarantee, statistic, pricing or
  testimonial. Icon = verified asset. No timed quiz or pressure. Reference post used for craft only.

## Issues found and fixed during QA
1. Lifted apples hovered on top of the "4 × 3 = 12" card → the card now folds away just before the lift (f504–514).
2. TOTAL flip-card lagged the glow/"three" by 4 frames → the flip now starts 8 frames early and completes on the glow frame.
3. Recount badges too small for phones → radius 19 → 24 px, numerals 23 → 29 px.
4. Last caption faded out before the end → the CTA caption now holds to the final frame.
5. CTA line did not address the viewer pair → "Play and learn tables together with TableVerse."
6. (earlier, stills) `piece()` cleared shadow state, so only the first part of each puppet cast a layer shadow → restored per piece.
After fixes the film was fully re-rendered (900 frames) and every check above was re-run on the final file.

## Known limitations
- Voice is a local Kokoro blend; pronunciation of "TableVerse" is steered by sending "Table Verse".
- The Meshline/Recall narration files were not accessed (other apps are out of scope); the voice was re-synthesised
  from the stated recipe (af_bella 0.7 + am_puck 0.3, en-us, 0.98).
- This cloud session has no local Desktop/video-review folder; the finished MP4 is attached in the session and pushed.
