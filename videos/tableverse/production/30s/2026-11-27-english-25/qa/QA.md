# QA — tableverse-30s-english25-01.mp4 ("When's the Big Boom?", common multiples by rhythm: 2s and 3s meet on 6 = 2 × 3, then 12)

File: `videos/tableverse/production/30s/2026-11-27-english-25/tableverse-30s-english25-01.mp4` · checked 2026-11-27
sha256 `0d824a8dd60d1070568734470ceace90d96ff3712d06ed211a0fd07c54ba4660`. Thumbnail:
`tableverse-30s-english25-01-thumbnail.png` (sha256 41a8fd3f…94d6cb) = frame 0 rendered losslessly (vs the decoded MP4
frame 0: mean difference 4.7 / 5.4 / 2.8 per RGB channel out of 255, PSNR 32.4 dB — H.264 compression of the fine
paper grain and water ripples only; `thumbnail_check.txt`).

## Topic decision (see context/23)
The proposal (three frogs × four beats = 12) is equal groups 3 × 4 = 12 — feedback-01 and batch 22. An unrelated
subject was chosen: common multiples heard as rhythm (every 2 beats and every 3 beats land together on 6 = 2 × 3, then
12). Different core question, setting and mechanism from batch 24 (perimeter of a square on a rooftop). The brief's frog
band, twelve drumbeats and the sinking lily-pad stage are kept.

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt, stem_loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264, 1080×1920, yuv420p | pass |
| audio | AAC | AAC 48 kHz stereo | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −16.5 LUFS integrated, true peak −2.2 dBTP | pass |
| stem balance | soundtrack below a clear voice | stems as mixed: VO −16.9 LUFS, SFX −24.3 LUFS (the drums are the content, still 7 LU under the voice), music −28.4 LUFS (ducked −11 dB under speech) | pass |

## First frame
Frame 0 is the finished hook image: a close shot of both frog drummers on the lily-pad stage, sticks raised, eyes on
each other, the orange and cyan drums in front and the numbered pads below; headline "WHEN'S THE BIG BOOM?" (4 words) —
no logo, fade, black or empty setup. Hook audio from 0.07 s; answered on beat 6 at 10.8 s (BOOM) and explained at
12.1–20.1 s.

## Narration and captions (evidence: asr_words.txt, asr_windows.txt, vo_stem_gaps.txt, caption_bounds.txt; faster-whisper base.en, local)
- Machine transcript of the delivered MP4 (no human listening was possible in this session): "When's the big boom? Two
  frog drummers want to hit together. Big frog drums every two beats. Little frog drums every three beats. One, two,
  three, four, five, six. Why six? Big frog plays two, four, six. Little frog plays three, six. Six is in the twos and
  the threes. Two times three is six, so they boom again on twelve. Play and learn tables with Tableverse." → matches the
  script, English only, no hallucinated words.
- Window ASR on nine cuts from the MP4 (hook, Big Frog, Little Frog, count, why, Little plays, payoff, again, CTA): every
  window matches the script, except that the cut starting before "Why six?" is written by the transcriber as "Y6" — the
  same sounds in one token; the full-file pass hears "Why six?" and the isolated VO stem over the same window gives
  "Why 6?". The effects stem is silent and the music ducked to about −43 dBFS RMS under "Why" (measured), so nothing
  masks the word. Recorded as a transcriber spelling, not a pass of a human listen.
- The six counted numbers are heard in order on the beats (count window: 1, 2, 3, 4, 5, 6 at 0.6 s spacing), although
  Big Frog's drum lands on "Two", "Four" and "Six" — the drums are low and short and the SFX bus is ducked −5 dB under VO.
- VO stem digitally silent in all 15 narration-free gaps (vo_stem_gaps.txt, 2 ms excluded at each clip edge). No clip
  overlaps; last word ends 29.93 s.
- Sync: each drum hit, firefly landing and count lands on the 100 bpm grid (beats at f234 + 18k and f666 + 18k); demo
  hits on the word "drums" (f126, f180); orange dots pulse on "two, four, six" (f402/412/420), cyan on "three, six"
  (f464/474) — word times from Whisper word timestamps of the clips; sign on "two times three" (f566); the music's bars
  start on counted beats 1 and 7.
- Captions: one at a time, ≤ 2 lines, boxes inside x 120–880, y 294–450 (brief: ≈ y 280–460); the frame-0 headline
  folds away before the first caption. The growing count caption updates in place on each beat. The payoff caption was
  condensed to "6 is in the twos and threes:" after the first measurement found the full line (741 px) too wide for
  the 800 px box. Other text: the 2 × 3 = 6 sign and the pad numbers 1–12 only.

## Picture (evidence: contact_sheet.png; frames/ — 62 cut, beat and transition frames, 540×960 JPG)
- Cuts on the beat at f54, 108, 162, 216, 360, 498, 604, 810; one idea per shot (question / pond / Big Frog / Little
  Frog / count / why / payoff / twelve + sink / CTA).
- Mechanism correctness, checked on frames: dots appear under 2, 3, 4, 6 by f324 and under 8, 9, 10, 12 by f756 (orange
  = 2, 4, 6, 8, 10, 12; cyan = 3, 6, 9, 12); the glowing "together" columns are only under 6 and 12; Big Frog's stick
  strikes only on even beats and Little Frog's only on multiples of 3 (stills at f252, 270, 288, 324).
- Safe areas (by coordinates): captions/headline in the upper band; the sign below them (screen y ≈ 530–690); the
  numbered pads and hit dots — the teaching content — end at screen y ≈ 1435 in the wide shots and ≈ 1520 in the
  beat-line close-up (raised from ≈ 1570 before delivery); in the two frog close-ups the pad row reaches y ≈ 1630 but
  is background there (the subject is the drumming frog). Nothing vital at the right edge or bottom (cattails, floor
  props and baker are decoration; the baker folds flat in close shots).
- Readability at full resolution: headline 84 px, captions 54 px, sign 74 px; pad numbers 34 px world (≈ 41 px in wide
  shots, ≈ 55 px in the beat-line close-up); hit dots 40 px world.

## Issues found and fixed before delivery
1. The proposal repeated three groups of four (feedback-01, batch 22) → common multiples by rhythm (documented above).
2. "Little Frog drums…" started right on the end of the previous line → moved 4 frames later.
3. Hit rings drawn around the pads overlapped their neighbours → replaced by two rows of hit dots under the pads (orange
   = Big Frog, cyan = Little Frog) with a glowing column where both meet.
4. The growing count captions faded out and back in on every beat → they now update in place.
5. Wide shots showed too much empty floor; the beat-line close-up wasted its lower third and put the dot rows low in
   the frame → reframed (wide z 1.2; close-up focus moved so the dots end at y ≈ 1520); frame 0 tightened to a close
   two-shot.
6. Drum and boom effects were only ≈ 5 LU under the voice → lowered ≈ 2–3 dB (SFX −24.3 LUFS).
7. The payoff caption line was wider than the caption box → condensed (see above).
After the fixes the film was fully re-rendered and every check above was run on the final file.

## Content and claims
- Facts: CCSS 4.OA.B.4 (a whole number is a multiple of each of its factors); England NC Year 2 (count in steps of 2
  and 3), Year 5–6 (multiples, common multiples) — quoted in context/23. Arithmetic verified: multiples of 2 up to 12 =
  2, 4, 6, 8, 10, 12; of 3 = 3, 6, 9, 12; common = 6, 12; 2 × 3 = 6.
- No claim that multiplying always gives the first shared beat (true here because 2 and 3 share no other factor).
- Frogs, firefly, pond and the sinking stage are fiction. No timed quiz, score, pressure or learning guarantee.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Checks not performed / limitations
- I could not watch or listen as a person: listening is machine-based (ASR + loudness/peak meters + stem inspection) and
  the picture check is frame-based (contact sheet + 62 sampled frames + stills, not real-time playback).
- The subject differs from the brief's proposal (common multiples instead of the covered three groups of four).
- Not tested on an actual phone or inside a social platform's UI overlay; safe areas were checked by coordinates.
