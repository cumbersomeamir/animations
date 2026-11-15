# QA: meshline-30s-english17-01.mp4 (batch 2026-11-15-english-17)

**SHA-256:** `7c3afa1eaa68f90eb66d61c781da7dd68c5ca39b3b8d825cb068261160b43d99`
**Thumbnail:** `meshline-30s-english17-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("THE AIR / IS FULL" over a flooded mesh), sha256 `a537298fffe65408c90e91a7d92fb87c1b0f8bea40aae520df9857b82b305f41`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.3 LUFS**, LRA 3.4 LU, **true peak −3.7 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +19.2 to +25.4 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en, whisper-small cross-check) | All lines match. The first draft "Copies bounce…" was heard as "Cop is bounced" and was reworded to "Repeats bounce…". | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.026; **normalised WER 0.013**. The only miss: base.en drops the CTA's first word "For"; whisper-small hears it. The decoded audio PCM sha256 `06210075…` is identical across the last two video-only rebuilds. | `qa/asr_final.json` |
| First frame | Frame 0: a 14-device mesh full of moving message copies (coral = bouncing back), glowing devices and a "111" transmission counter, plus "THE AIR / IS FULL". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds | Chunks start at the ASR time of their anchor word (−0.05 s); 13 chunks, no overlap. Ink x 140–859, y 360–468; plate x 106–894. Inside x 100–900 and y 230–1500. | `captions.json`, `qa/caption_bounds.json` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically) | `src/flood.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b28.00.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 24 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** a flooded mesh with the counter at 111 "transmissions of one message".
- **Naive flood:** restart from one sender. Round by round every device repeats ("every device repeats"); copies heading back to devices that already had it turn coral ("bouncing back"). The counter climbs 1 → 2 → 7 → 26 → 111; the last round keeps cycling ("each copy costs airtime").
- **Hop count:** copies carry a badge 3 → 2 → 1 → 0 ("hop count"). The 3 farthest devices get a 0 and stop ("0 · stop", "at zero, it stops").
- **Seen it:** devices tick what they have relayed; coral duplicates arrive and are struck out ("seen it? drop it"). Counter "11 vs 111 without".
- **Retry:** zoom on the sender: "no reply yet". Retries are sent after a timer ring that waits 1, 2, then 4 units ("wait longer"; instrument "retry timer ×2"); a reply arrives ✓.
- **CTA:** paper veil, icon and wordmark.

## Defects found and fixed
1. **Topic scope:** ack/retry was partly covered before, so it is now one beat, and the core is flood control (new).
2. **ASR:** line 3 was misheard; reworded.
3. **Length:** the narration ran 27.5 s of speech; trimmed to 26.1 s.
4. **Readability:** message copies were too small to read on a phone and coral copies didn't read as coral. They are now larger with coral-tinted bodies, and the hop badges are enlarged.
5. **Dead air:** gaps between flood rounds left the map empty; rounds are now continuous and the last one cycles.
6. **Retry beat:** "seen" ticks lingered into it (now faded), and its labels collided with devices and the timer ring (moved under the sender).

## Honest limits
- **No human listen-through was performed.** "Listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only.
- The mesh, the 111 vs 11 counts and the retry timings come from a toy simulation (`src/flood.mjs`), not from measurements.
