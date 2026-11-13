# QA — tableverse-30s-english13-01.mp4 ("The Missing Row Trick", 7 × 6 = 5 rows + 2 rows)

File: `videos/tableverse/production/30s/2026-11-13-english-13/tableverse-30s-english13-01.mp4`
sha256 `dd3b84f523234761060d99c4f4bfdbbc506a32493b4268b1d351abd8ca2ebed4` · checked 2026-11-13.
Thumbnail: `tableverse-30s-english13-01-thumbnail.png` (1080×1920, sha256 `ddbc60aa…08c1`), words "7 × 6?" / "SPLIT IT!".

## Technical (evidence: ffprobe.json, video_stream.txt, audio_stream.txt, format_duration.txt, full_decode.log, loudness.txt)
| check | required | measured | result |
|---|---|---|---|
| duration | exactly 30.000 s | format 30.000000 s; video 30.000000 s; audio 30.000000 s | pass |
| frames / rate | 900 @ 30 fps | nb_read_frames=900, r_frame_rate=30/1 | pass |
| video | 1080×1920 H.264 yuv420p | h264 High, 1080×1920, yuv420p, bt709 tags | pass |
| audio | AAC | AAC LC 48 kHz stereo 192 kb/s | pass |
| full decode | no errors | `ffmpeg -v error -i … -f null -` → 0 error lines | pass |
| loudness / clipping | voice clear, no clipping | −16.0 LUFS integrated, LRA 3.1 LU, true peak −1.6 dBTP | pass |
| stem balance | music subtle | VO −16.9 LUFS, SFX −27.2 LUFS, music −28.4 LUFS before ducking (−7 dB more under speech) | pass |

## Narration and captions (evidence: asr_words.txt; faster-whisper base.en, run locally on the final MP4)
- Machine transcript of the delivered MP4 (no human listening was performed in this session):
  "Seven times six feels tricky. This tray has a secret hinge. Seven rows of six cupcakes. Can you find five rows?
  Fold the tray after row five. Five rows of six make thirty. Two rows are left. Two sixes make twelve. Unfold and
  add. Thirty plus twelve is forty-two. So seven times six is forty-two. Stuck on a big fact. Split it into facts
  you know. Play and learn tables with table verse." → matches the script word for word, in order, English only,
  no missing or extra words.
- Clip placement is frame-exact from `timeline.json`; ASR first-word offsets −0.20…+0.26 s except v05 (−0.41 s,
  Whisper places "Fold" early after the 2.4 s quiet stretch). No VO overlaps (build/vo_spans.json); last word 29.33 s.
- Captions mirror the VO, ≤ 2 lines, inside x 100–900 (box ≤ 800 px wide centred on x = 500) and y 243–393;
  a result is never captioned before it is spoken ("30 + 12 = 42" appears at f550, "7 × 6 = 42" at f652).

## Picture (evidence: contact_sheet.png — 1 frame per second; frames/ — 42 transition and beat frames)
- Opening: the tray is springing up on its base hinge from frame 0, cupcake rows pop in sequence, the "7 × 6 = ?"
  tag folds down; full tray + question readable by 0.33 s.
- One idea at a time: hinge reveal (f74–100) → row tags + "6" (f124–190) → question + 1.3 s quiet pause with a slow
  lean-in → rows 1–5 light (f262–290) → fold (f304–342) → "5 × 6 = 30" (f356) → "2 × 6 = 12" (f458) → unfold +
  click (f512–540) → 30 travels, flap flips to "30 + 12 = 42" (f552–594) → tag "?" → 42 (f648–662) → takeaway
  "5 × 6 + 2 × 6" (f704–790) → page turn → TableVerse card (f800–900).
- Counting accuracy: exactly 42 cupcakes (7 × 6) on the tray in every sampled frame; the split is always 5 rows
  over 2 rows; no cupcakes anywhere else; the travelling "30" routes above the tray and down the left margin so no
  counted object is covered; unequal groups are never labelled.
- Depth/lighting: perspective hinges (tray rise, fold, flaps, tag, page turn), depth-of-field background,
  parallaxed camera moves at beats only, cast shadows, lamp-motivated key light, blurred foreground leaves.
- Safe areas: nothing meaningful above y = 230 (bunting only); counted cupcakes within x ≈ 200–812, y ≈ 605–1305
  (≤ 1420 when folded); flaps ≤ y 1500; right-side UI column (x > 900) holds no information.
- Readability at full resolution: captions 54 px, flaps 68–72 px, tag 62–66 px, wordmark 122 px, CTA pill 48 px.

## Issues found and fixed before delivery
1. Opening started on an empty, flat tray → the tray now springs up on its hinge with cupcakes already popping on frame 0.
2. Blurred contact shadow drawn while the tray was still lying back (grey patch f0–4) → only drawn once upright.
3. Question tag and the "6" badge overlapped (f156–176) → tag folds away at f140–156.
4. Row highlights and the "secret hinge" line too faint → stronger fills, thicker score line with a glow trace, larger pins.
5. Travelling "30" chip crossed the top-left cupcakes → explicit route around the tray.
6. Captions revealed "30 + 12 = 42" and "7 × 6 = 42" before the narrator → split captions timed to the spoken result.
7. 6.2–8.7 s looked static in the contact sheet → slow lean-in during the child's pause (no extra labels or hints).
After each fix the film was fully re-rendered; all checks above were re-run on the final file.

## Content and claims
- Facts: arrays (3.OA.A.3) and the distributive strategy (3.OA.B.5: 8 × 7 = 8 × (5 + 2) = 40 + 16 = 56) from the
  official CCSS Mathematics PDF, retrieved 2026-11-13; see context/10. Measured facts = arithmetic; the bakery,
  tray and hinge are illustrative.
- No timed quiz, score, pressure or learning guarantee; the pause is untimed and wordless.
- App claim limited to the CTA "Play and learn tables with TableVerse." + verified icon and "on Google Play".

## Known limitations
- Listening check is machine-based (ASR + loudness/peak meters); I did not personally listen to the audio.
- Whisper renders the brand as "table verse" (two words) — the TTS is fed "Table Verse" by design (context/08).
- No user review folder exists in this cloud session; the finished MP4 and thumbnail are attached in the
  conversation and pushed to the branch.
