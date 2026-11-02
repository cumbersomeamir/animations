# QA — ideaverse-30s-production-03.mp4 (episode 03)

SHA256 fc6836f0ac9ec08ac6950575153cb91b7ae638db5055194ccd0599e826d85ea6 · 12,962,017 bytes. Evidence in qa/.

| check | result |
|---|---|
| duration (format / video / audio) | 30.000000 / 30.000000 / 30.000000 s (qa/ffprobe.json) |
| video | H.264 High, 1080x1920, yuv420p, 30/1, 900 frames; decoded count 900 |
| audio | AAC-LC 48 kHz stereo, 192 kb/s |
| full FFmpeg decode | OK, no errors |
| loudness | −15.0 LUFS integrated, LRA 4.0 LU, true peak −1.5 dBFS (spec −14…−16, TP ≤ −1) |
| narration ASR + timing (one pass, final MP4) | all 6 lines recognised inside their caption windows; "buy groceries" transcribed "by groceries" (homophone), "organised" as "organized" (spelling) (qa/asr-narration.txt) |
| caption bounds (every captioned frame) | ink y 356–467 (spec 350–470), x 89–990 (margins ≥ 80) |
| top 0–300 px | paper + field dots only |
| content accuracy | checklist matches the note: 3/3 tasks; only the dentist item has a deadline ("next week", as spoken); boxes empty (nothing marked done); unclear item flagged with "ask" |
| contact sheets | qa/contact-sheet-full.png (every second), qa/contact-sheet-boundaries.png (3/8/23/29 s + end) |
| render | 900 frames on 2s in 61 s (production-01 riso engine + press reused); mix < 10 s |

I cannot hear audio; intelligibility was checked with ASR on the final file and loudness/peak meters.

## Fixed during this episode
1. Ribbon word fragments crowded the task scraps → fragments only before the scraps appear.
2. Prompt card sat empty for ~2.5 s → large VOICE INPUT mic + waveform fills it until the prompt prints.
3. "Use only deadlines I mentioned." band overran the card → bands sized from measured text.
4. Shrunken prompt overlapped the checklist → smaller prompt, checklist moved down, rows re-spaced so the
   UNCLEAR tag no longer touches the next row.

## Remaining limits (honest)
- 21.4–22.1 s: during the hand-over to the side-by-side view the shrinking prompt briefly overlaps the cards.
- In the side-by-side view the checklist is scaled to ~53 % (≈26 px text); it is shown large again when torn off.
- Bottom décor (press base, registration mark) sits in the overlay zone; no essential information there.
