# QA — tableverse-30s-english20-01.mp4 ("More Boxes, More Cookies?", 4 × 6 = 8 × 3 = 24)

File: `videos/tableverse/production/30s/2026-11-17-english-20/tableverse-30s-english20-01.mp4` · checked 2026-11-18
sha256 `97237a184b918a4845e1447fec1a9c0cd9eaddcab6197acb5d72dd0083dcda22`. Thumbnail:
`tableverse-30s-english20-01-thumbnail.png` (sha256 8d0d2708…db8f3b) = frame 0 rendered losslessly (mean difference vs
the decoded MP4 frame 0: 2.1 / 2.8 / 4.2 per RGB channel out of 255, i.e. H.264 compression only; `thumbnail_check.txt`).

## Topic decision (see context/18)
The brief's "8 × 3 as twice 4 × 3" is english15-01's doubling strategy (also rejected for batch 17). Kept the mouse,
cookie shop, 4 → 8 boxes, 8 × 3 and the 24-cookie payoff; taught "double the boxes, halve each box: same total"
(8 × 3 = 4 × 6), not covered before.

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt, stem_loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −16.5 LUFS integrated, LRA 2.6 LU, true peak −2.2 dBTP | pass |
| stem balance | music subtle | stems as mixed: VO −17.2 LUFS, SFX −27.5 LUFS, music −29.9 LUFS (both ducked further under speech) | pass |

## First frame
Frame 0 is the finished hook image: four boxes of six star cookies with dashed "cut here" seams, the mouse at the counter
holding a giant saw with a sly grin, card "4 × 6 = 24", headline "MORE BOXES, MORE COOKIES?" (4 words) — no logo, fade,
black or empty setup. Hook audio from 0.07 s; the question is answered at 20.0 s ("Still twenty-four!").

## Narration and captions (evidence: asr_words.txt, asr_windows.txt, vo_stem_gaps.txt, caption_bounds.txt; faster-whisper base.en, local)
- Machine transcript of the delivered MP4 (no human listening in this session): "More boxes, more cookies. This sneaky
  mouse thinks so. Four boxes of six. 24 cookies. Out comes the saw. Zip, zip, zip, zip. Eight boxes, more cookies.
  Let's count in threes. Three, six, nine, 12, 15, 18, 21, 24, still 24. Eight threes, same as four sixes. Double the
  boxes, cut each box in half. Same total. Play and learn tables with table verse." → matches the script, English only,
  no hallucinated words.
- Window ASR on cuts from the MP4: hook 0–3.4 s, "Out comes the saw." 6.0–10.3 s, count 14.4–20.0 s "3, 6, 9, 12, 15,
  18, 21, 24", takeaway 23.1–26.8 s, CTA 27.5–30 s "Play and learn tables with Tableverse." The 7.6–10.4 s zip window
  hears four words (spelled "zep" by the ASR in the mix; the isolated VO stem window reads "zip" ×4).
- VO stem is digitally silent (peak 0.00000) in every narration-free gap (7.07–7.87, 10.12–10.67, 12.21–13.27 drumroll,
  26.58–27.93 s). Clip placement is frame-exact; no VO overlaps; last word ends 29.93 s.
- Caption/VO sync: card 8 × 3 = ? on "Eight boxes" (f325), running total on each spoken number (f438–575), 8 × 3 = 24 on
  "Still" (f605), 8 × 3 = 4 × 6 on "Double the boxes" (f703). Captions ≤ 2 lines, boxes inside x 129–871, y 240–396
  (rule: x 100–900, y 230–1500), never over the flip card (camera zooms were capped so the card stays below y ≈ 400).

## Picture (evidence: contact_sheet.png; frames/ — 55 beat and transition frames, 540×960 JPG)
- Sequence: tiptoe + glint (f40–96) → headline folds (f100–114) → boxes hop (f108–126) → saw up (f182–210) → leap
  (f214–228) → four cuts with sawdust, each box splits on its seam (f240, 258, 276, 294) → jump down, halves slide
  apart (f294–331) → victory jump, card 8 × 3 = ? → drumroll lean-in → count 3…24 (each small box hops) → the take
  (f602–656) → halves rejoin as four sixes (f652–676) → card 8 × 3 = 4 × 6, halves apart again (f712–746), all glow
  (f770) → sit up, shrug, laugh, wink (f728–806) → page turn → CTA.
- Counting accuracy: exactly 24 star cookies in every frame (3 per half box, drawn every frame); 4 boxes of 6 before
  the cuts, 8 boxes of 3 after; no cookies anywhere else. The saw blade briefly overlaps the edge of one cookie while
  sawing (≈ 10 frames per box); every cookie stays visible and countable. The mouse stands behind the box it saws
  (cookies drawn in front of it) and in the centre gap at the counter, clear of the cookies.
- Safe areas: headline from y ≈ 210; captions y 240–396; card y 460–560; boxes x 134–946, y ≈ 590–1355; mouse on the
  counter y ≤ 1474; baker and floor props on the floor page, decorative only.
- Readability at full resolution: headline 84 px, card 74/80 px, captions 54 px, cookies 108 px, mouse ≈ 240 px tall.

## Issues found and fixed before delivery
1. Brief repeated english15-01's doubling strategy → double-and-halve topic (documented above).
2. Mouse too small for the comic beats → 2.0× on the counter (1.6× while "deeper" behind a shelf box).
3. The frame-0 saw handle hid half the mouse's face; the upright saw crowded the bottom-right box → grip at shoulder
   height, blade tilted away from the cookies.
4. The take hid the inner cookies of the bottom row → wider gap between the columns (140 px).
5. Static first 3 s → tiptoe, saw tap + glint, push-in on "This sneaky mouse thinks so!".
6. "halve each box" was heard as "have each box" (homophones in US English) → "cut each box in half".
7. Saw rasp and glint masked "saw" and the "Zip!"s in window ASR → rasp stops when "Zip!" starts; glint after "saw".
8. While sawing the top box the mouse's head and saw handle covered the card → card raised 30 px and mounted in front of
   the shelves; mouse stands lower behind the box; bottom-row push-in reduced.
9. The take punch-in pushed the card into the two-line caption → zoom capped at 1.06.
10. True peak −0.9 dBTP after the first mux → mux gain −1.2 dB (final −2.2 dBTP).
After the fixes the film was fully re-rendered and every check above was run on the final file.

## Content and claims
- Facts: CCSS 3.OA.A.1, 3.OA.B.5 (associative example), 3.OA.C.7; England National Curriculum KS1–2 (Y3 doubling links
  2/4/8 tables; Y6 associative law) — quoted in context/18 with PDF hashes.
- Measured facts = arithmetic (4 × 6 = 8 × 3 = 24). Mouse, saw, shop and baker are illustrative.
- No timed quiz, score, pressure or learning guarantee; the drumroll pause is untimed.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Known limitations
- Listening check is machine-based (ASR + loudness/peak meters + stem inspection); I did not personally listen.
- The maths differs from the brief's wording (double-and-halve instead of the covered "double a known fact").
- No user review folder exists in this cloud session; the MP4 and thumbnail are attached in chat and pushed.
