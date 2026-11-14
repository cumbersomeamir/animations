# QA — tableverse-30s-english14-01.mp4 ("Nine Hides Inside Ten", 9 × 8 = 10 × 8 − 8)

File: `videos/tableverse/production/30s/2026-11-14-english-14/tableverse-30s-english14-01.mp4`
sha256 `0797aa417789397a3da547393d5810f4d07c72a385a11117b35e3d5f3650b74d` · checked 2026-11-14.
Thumbnail: `tableverse-30s-english14-01-thumbnail.png` (1080×1920, sha256 `9ed9ec81…6b1b`), words "9 × 8?" / "THINK 10!".

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p, bt709 tags | pass |
| audio | AAC | AAC LC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −15.6 LUFS integrated, LRA 4.1 LU, true peak −1.5 dBTP | pass |
| stem balance | music subtle | VO −16.8 LUFS, SFX −25.9 LUFS, music −28.1 LUFS before ducking (−7 dB more under speech) | pass |

## Narration and captions (evidence: asr_words.txt; faster-whisper base.en, run locally on the final MP4)
- Machine transcript of the delivered MP4 (no human listening was performed in this session):
  "Where is 9 times 8 hiding? Inside 10 times 8. Here are 10 rows of 8 cookies. 10 rows of 8 make 80. But 9 times 8
  needs only 9 rows. Can you spot the extra row? Fold it away. 80, take away one row of 8. 72 are left. So 9 times 8
  is 72. For a 9 fact, start with 10. Then take one group away. Play and learn tables with Tableverse."
  → matches the script word for word (ASR writes numerals as digits), English only, nothing missing or added.
- Clip placement is frame-exact from `timeline.json`; ASR first-word offsets −0.34…+0.25 s (the larger values are
  Whisper placing a word early after a silence); no VO overlaps (build/vo_spans.json); last word 29.33 s.
- Captions mirror the VO, ≤ 2 lines, inside x 100–900 (box ≤ 800 px centred on x = 500) and y 243–393; "72" is
  never captioned or shown before "Seventy-two are left." (f516).

## Picture (evidence: contact_sheet.png — 1 frame per second; frames/ — 42 beat and transition frames)
- Opening: the cookie sheet is springing up on its hinge from frame 0, rows pop in sequence, the flip card
  "9 × 8 = ?" rises; full sheet + question readable by ~0.5 s.
- One idea at a time: card flips to "10 × 8 = ?" (f64) → row tags 1–10 (f116–152) and numbers 1–8 across row 1
  (f146–174) → "10 × 8 = 80" + one glow (f194–222) → card back to "9 × 8 = ?" (f236) → question + untimed 1.5 s
  pause with a slow lean-in → row 10 marked, hinge pins (f392) → fold (f420–452) → "80 − 8" (f470) →
  "80 − 8 = 72" + nine rows glow (f512–540) → "9 × 8 = 72" (f600–614) → row 10 unfolds/folds again with
  "10 × 8 − 8" (f648–732) → nine rows glow in turn (f752–800) → page turn → TableVerse card.
- Counting accuracy: exactly 80 cookies (10 rows × 8) in every sampled frame; the fold always removes exactly
  row 10 (8 cookies), which stays visible (greyed, dashed orange outline) below the 9 rows; no cookies anywhere else;
  unequal groups are never labelled.
- Depth/lighting: perspective hinges (sheet rise, row fold on an accordion strip, flip card, flap, page turn),
  depth-of-field background, parallax camera moves at beats only, cast shadows, lamp-motivated key light.
- Safe areas: nothing meaningful above y = 230; cookies within x ≈ 176–824, y ≈ 584–1400; flap ends ≤ y 1500;
  right-side UI column (x > 900) holds no information.
- Readability at full resolution: captions 54 px, card 74 px, flap 62 px, row tags 23 px, wordmark 122 px.

## Issues found and fixed before delivery
1. Row 10 folded at −62° collapsed into an unreadable grey sliver → now drops 40 px on a visible hinge strip and
   folds back −48°: separated, greyed, eight cookies still recognisable.
2. Opening flash over-exposed the sheet (~f14) → softened.
3. Narration "leaves seventy-two" was heard as "leave seventy-two" (s + s run together; confirmed by transcribing the
   clip on its own) → line rewritten as "Seventy-two are left." (clip re-checked: "72 are left."), caption, flap flip
   and glow retimed to it.
4. ~2 s near-static hold after the takeaway (24.8–26.7 s) → the nine remaining rows now glow in turn while the baker
   cheers (shows the 72 that stay; no new text).
After each fix the film was fully re-rendered and every check above re-run on the final file.

## Content and claims
- Facts: CCSS 3.OA.A.3, 3.OA.B.5, 3.NBT.A.3, 3.OA.D.9 (official CCSS PDF); subtraction shown as the inverse of
  10 rows = 9 rows + 1 row. See context/11. Measured facts = arithmetic; bakery/sheet/hinge are illustrative.
- No timed quiz, score, pressure or learning guarantee; the noticing pause is untimed and wordless.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Known limitations
- Listening check is machine-based (ASR + loudness/peak meters); I did not personally listen to the audio.
- Visual concept shares the approved hinge-tray mechanism with english-13 by design (same style recipe); the object,
  fold direction, card mechanism, strategy and music are new.
- No user review folder exists in this cloud session; the finished MP4 and thumbnail are attached in the
  conversation and pushed to the branch.
