# QA — tableverse-30s-english15-01.mp4 ("Two Equal Groups", 6 × 8 = 24 + 24 = 48)

File: `videos/tableverse/production/30s/2026-11-15-english-15/tableverse-30s-english15-01.mp4` · checked 2026-11-15
sha256 `43b526afaa20e074c810759b7bdf3e900cd0198978d7ee5cd6e9ddc95c5a5c76`. Thumbnail: `tableverse-30s-english15-01-thumbnail.png` =
frame 0 rendered losslessly (mean difference vs the decoded MP4 frame 0: 2.8 / 255, i.e. H.264 compression only).

## Topic decision (see context/12)
Requested fact 6 × 7 = 42 = english13-01's 7 × 6 = 42 (same fact and answer, also split-and-add). Kept the requested
strategy, structure and first frame; changed the fact to 6 × 8 = 48 (not yet covered) to avoid a repeat.

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p, bt709 tags | pass |
| audio | AAC | AAC LC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −15.9 LUFS integrated, LRA 4.5 LU, true peak −1.5 dBTP | pass |
| stem balance | music subtle | VO −17.0 LUFS, SFX −27.2 LUFS, music −27.8 LUFS before ducking (−7 dB more under speech) | pass |

## First frame (new rule)
- Frame 0 is the finished hook image: six-row donut sheet already split into twin groups on its hinge strip,
  card "6 × 8 = ?", headline "SPLIT IT. SOLVE IT." (4 words), baker standing — no logo, fade, black or empty setup.
- Hook audio starts at 0.07 s: "Six times eight? Split it. Solve it." (promise) → delivered by 21.4 s ("So six times
  eight is forty-eight") and the method ("find the three fact, then double it").

## Narration and captions (evidence: asr_words.txt; faster-whisper base.en, run locally on the final MP4)
- Machine transcript of the delivered MP4 (no human listening was performed in this session):
  "Six times eight, split it, solve it. Here are six rows of eight donuts. Split the six rows into two equal groups.
  Are the two groups the same? Yes, three rows of eight in each. Three rows of eight make 24. The other group is
  the same. 24 and 24 make 48. So six times eight is 48. For a six-fact, find the three-fact, then double it. Play
  and learn tables with table verse." → matches the script word for word, English only, nothing missing or added.
- Each clip was also transcribed in isolation before mixing (all exact).
- Clip placement is frame-exact; ASR first-word offsets −0.32…+0.26 s; no VO overlaps; last word 29.60 s.
- Captions mirror the VO from v02 on (v01 is carried on screen by the frame-0 headline + card), ≤ 2 lines, inside
  x 100–900 / y 243–393; "48" is never shown before "forty-eight" is said (card flip and caption at f554–556).

## Picture (evidence: contact_sheet.png; frames/ — 41 beat and transition frames)
- Sequence: headline folds away (f60–74) → halves close (f66–90) → row tags 1–6 + numbers 1–8 → split after row 3
  (f170–204) → question + untimed 1.4 s pause with lean-in → dashed outline of the top group slides down and fits
  the bottom group (f306–336) → "3 × 8 = 24" on each group (f410, f466; one glow each) → card "24 + 24 = 48" (f548)
  → "6 × 8 = 48" (f616) → top group glows on "find the three fact", both + "× 2" on "double it" → the two groups
  close into one sheet (f748–772) → page turn → TableVerse card.
- Counting accuracy: exactly 48 donuts (6 rows × 8) in every sampled frame; three rows in each group; no donuts
  anywhere else; the outline check never hides an object; unequal groups never labelled.
- Safe areas: frame-0 headline text from y ≈ 230; captions y 243–393; donuts x ≈ 172–828, y ≈ 624–1340;
  flaps ≤ y 1450; "× 2" stamp moved to x 746–846 (was on the right edge).
- Readability at full resolution: headline 84 px, card 74 px, flaps 60 px, captions 54 px, wordmark 122 px.

## Issues found and fixed before delivery
1. Requested fact repeated english13-01's 42 → changed to 6 × 8 (documented above).
2. Macarons read as flat purple stripes at phone size → replaced with round donuts (VO line + caption regenerated).
3. Frame-0 headline overlapped the hinge bar → moved into the clear band above it.
4. "× 2" stamp sat on the right edge (into the right-side UI zone) and was small → moved into the gap, enlarged.
After the fixes the film was fully re-rendered and every check above re-run on the final file.

## Content and claims
- Facts: CCSS 3.OA.A.3, 3.OA.B.5 (its own doubling example "3 × 5 = 15, then 15 × 2 = 30"), 3.OA.D.9 — official PDF;
  see context/12. Measured facts = arithmetic; bakery/sheet/hinge illustrative.
- No timed quiz, score, pressure or learning guarantee; the noticing pause is untimed.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Known limitations
- Listening check is machine-based (ASR + loudness/peak meters); I did not personally listen to the audio.
- The fact differs from the brief (6 × 8 instead of 6 × 7) by the no-repeat rule; everything else follows the brief.
- No user review folder exists in this cloud session; the MP4 and thumbnail are attached and pushed.
