# QA — tableverse-30s-english21-01.mp4 ("The Octopus's Square Picnic", 4 × 4 = 16)

File: `videos/tableverse/production/30s/2026-11-18-english-21/tableverse-30s-english21-01.mp4` · checked 2026-11-18
sha256 `df97c821845d7ee7c7bb31f4ea13cabf2be1fd56adc35ae348c783881d57f21f`. Thumbnail:
`tableverse-30s-english21-01-thumbnail.png` (sha256 06f24d7d…836c57) = frame 0 rendered losslessly (mean difference vs
the decoded MP4 frame 0: 2.2 / 3.7 / 3.7 per RGB channel out of 255, i.e. H.264 compression only; `thumbnail_check.txt`).

## Topic decision (see context/19)
The brief's 7 × 4 = 28 (seven baskets of four) is english18-01 (seven boats of four friends, 4 × 7 = 28). Kept the
mischievous octopus, picnic baskets, four oranges each, visual grouping, clear count and funny payoff; taught square
numbers (4 × 4 = 16, rows = columns), not covered before.

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt, stem_loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −16.1 LUFS integrated, LRA 3.2 LU, true peak −2.2 dBTP | pass |
| stem balance | music subtle | stems as mixed: VO −16.9 LUFS, SFX −26.5 LUFS, music −29.3 LUFS (both ducked further under speech) | pass |

## First frame
Frame 0 is the finished hook image: the octopus holding four picnic baskets (four oranges visible in each) over a
gingham blanket on a paper beach, card "4 × 4 = ?", headline "A SQUARE OF ORANGES?" (4 words) — no logo, fade, black or
empty setup. Hook audio from 0.07 s; answered at 14.8–17.5 s ("…the same both ways!") and 20.5 s ("…a square number!").

## Narration and captions (evidence: asr_words.txt, asr_windows.txt, vo_stem_gaps.txt, caption_bounds.txt; faster-whisper base.en, local)
- Machine transcript of the delivered MP4 (no human listening in this session): "Can 16 oranges make a perfect square?
  Ask this silly octopus. Four baskets, four oranges in each. Oh, it tips them all out. What a mess. Tidy up octopus.
  Four in every row. Four rows of four. Is it a square? Four across, four down. The same both ways. Four, eight, 12, 16.
  Four times four is 16. It's a square number. A number times itself makes a square. [Square.] Play and learn tables
  with table verse." → matches the script, English only.
- "Oh" at 6.5 s: in its own window the ASR hears "Uh oh, it tips them all out. What a mess." (the line was re-spelt
  "Uh oh" because the narrator had read "Uh-oh" as "Oh"; the whole-file pass still writes "Oh").
- "[Square.]" is an ASR hallucination in the 25.2–27.9 s square dance (music + wood toks only): the VO stem peak there is
  0.00000 and window ASR of 25.3–27.9 s cut from the MP4 returns no words.
- Window ASR on cuts from the MP4: hook 0–4.3 s (exact), 6.4–8.8 s "Uh oh, it tips them all out. What a mess.",
  14.6–20.4 s "4 across, 4 down, the same both ways. 4, 8, 12, 16.", 20.3–25.4 s payoff (exact), CTA 27.5–30 s
  "Play and learn tables with Tableverse."
- VO stem digitally silent in every narration-free gap (11.33–11.73, 13.59–14.80 pause, 25.21–27.93 s). Clip placement
  is frame-exact; no VO overlaps; last word ends 29.93 s.
- Caption/VO sync: the card shows only "4 × 4 = ?" until "Four times four" (swap f631, "4 × 4 = 16"); during the count
  the caption grows 4 → 4, 8 → 4, 8, 12 → 4, 8, 12, 16 while the card stays unchanged (one changing number at a time).
  Captions ≤ 2 lines, boxes inside x 206–794, y 240–396 (rule: x 100–900, y 230–1500); camera zooms capped at 1.05 so
  the card stays below the captions.

## Picture (evidence: contact_sheet.png; frames/ — 58 beat and transition frames, 540×960 JPG)
- Sequence: push-in on the waving octopus → headline folds (f120–134) → baskets bounce (f134–158) → tip (f200–212) →
  oranges bounce and roll into two piles (f204–235) → basket hat lands, bonk, dizzy, camera bump (f234) → rows carried in
  four at a time (f276–346) → pause with hat-scratch → top row measured (rings, f448–472) → right column measured
  (f476–500) → dashed square pops (f504) → rows glow 4/8/12/16 → card 4 × 4 = 16 → outline pulses, arms present the square
  → square dance → wink → page turn → CTA.
- Counting accuracy: exactly 16 oranges in every frame: 4 per basket (2 front + 2 raised behind, all visible) → two
  piles of 8 on the sand, none overlapping each other or the octopus → 4 rows × 4 on the blanket. Oranges are drawn
  in front of the arms, so tentacles never hide one; no other oranges anywhere (the sun is yellow, the shells lilac).
  Brief overlaps happen only in flight (f210–232) and are resolved by the time they land.
- Safe areas: headline from y ≈ 210; captions y 240–396; card y 460–560; oranges at rest x 112–968, y 600–1421 (brief flight arcs above the blanket during the tip); octopus head
  y ≈ 1195–1420; baker and floor props on the floor page, decorative only.
- Readability at full resolution: headline 84 px, card 74 px, captions 54 px, oranges 92 px (77 px in the baskets),
  octopus head ≈ 250 px wide.

## Issues found and fixed before delivery
1. Brief repeated english18-01 (seven groups of four = 28) → square numbers (documented above).
2. A messy heap on the blanket would have hidden oranges and blocked the square → the oranges roll off into two piles on
   the sand beside the blanket (non-overlapping), then the arms carry them up row by row.
3. The baskets overlapped each other and hid oranges at frame 0; tipped baskets brushed the card → smaller, spaced
   baskets lower down, back pair of oranges raised.
4. The "across" arm cut through the middle of the square → it runs up the left side and along the top.
5. The measuring glow was too faint on the lilac blanket → yellow rings that stay on while each side is measured.
6. The octopus read small; the dance arms lay flat / hid behind the bigger head → octopus 1.12×, dance arms reach out
   sideways and curl up beside the head.
7. The narrator read "Uh-oh!" as "Oh!" (confirmed on the isolated clip) → re-spelt "Uh oh!", re-checked by ASR.
After the fixes the film was fully re-rendered and every check above was run on the final file.

## Content and claims
- Facts: Oak National Academy "Represent a square number" (definition of square number / square array); England NC
  KS1–2 Y5 (square numbers); CCSS 2.G.A.2, 3.OA.A.3, 3.OA.A.4, 3.OA.D.9 — quoted in context/19.
- Measured facts = arithmetic (4 × 4 = 16). Octopus, beach, baskets and baker are illustrative; no animal fact narrated.
- No timed quiz, score, pressure or learning guarantee; the pause is untimed.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Known limitations
- Listening check is machine-based (ASR + loudness/peak meters + stem inspection); I did not personally listen.
- The maths differs from the brief (square numbers instead of the covered 7 × 4 = 28).
- The whole-file ASR writes "Oh" for "Uh oh"; the windowed ASR hears "Uh oh" correctly.
- No user review folder exists in this cloud session; the MP4 and thumbnail are attached in chat and pushed.
