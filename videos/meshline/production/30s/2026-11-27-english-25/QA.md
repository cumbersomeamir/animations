# QA: meshline-30s-english25-01.mp4 (batch 2026-11-27-english-25)

**SHA-256:** `f40fcc89e5479d68568739c1e2c9e77df0f2033f5a9d21d2ecf308e0730f9f4a`
**Thumbnail:** `meshline-30s-english25-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("SEND SLOWER. / REACH FARTHER."), sha256 `f325618c840f717972474d105d70b9523c58b6dd02d10f6c0cb5b23dc54d7782`

| Check | Result | Evidence |
|---|---|---|
| Disk | Checked first: 25 GB free; no temporary space needed | `df -h` |
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.2 LUFS**, LRA 4.5 LU, **true peak −4.2 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +19.9 to +25.2 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en) | All 7 lines match apart from punctuation and "long-range" hyphenation | `asr_words.json` |
| ASR on the **final MP4** | **WER 0.0** with base.en and **0.0** normalised with whisper-small (cross-check). Decoded audio PCM sha256 `e5faa9f6…` is the scored take. | `qa/asr_final.json`, `qa/asr_crosscheck_small.json` |
| First frame | Frame 0: a sender and a far receiver with two symbol lanes. Fast dots turn coral and die out past a ✕; slow 8-symbol groups reach the receiver ✓. Title "SEND SLOWER. / REACH FARTHER.". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds | Chunks start at the ASR time of their anchor word (−0.05 s); 13 chunks, no overlap. Ink y 332–440 and plate y 306–458 (inside y 280–460); ink x 144–855, plate x 111–889 (inside x 100–900). | `captions.json`, `qa/caption_bounds.json` |
| Right-side / bottom controls | The receiver sits at about 720 px (wide) and 670 px (payoff close-up). The strip and labels end left of about 890 px; the instrument plate is x 96–864, values right-aligned at 830. | frames, `src/coded.mjs` |
| Framing | No camera key shows the sheet's left, right or top edge (checked numerically) | `src/coded.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b26.40.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** fast dots die out mid-way (coral, ✕); slow groups arrive (✓).
- **Noise:** a signal curve draws out and sinks toward a speckled "noise" band. "fast mode needs" is a dashed line; where the curve crosses it, a coral marker reads "lost in noise".
- **Eight symbols:** close-up: a "1 bit" token splits into "8 symbols" (the strip is hidden).
- **Fix errors:** a group with two coral (corrupted) symbols still decodes "→ 1" ("errors fixed"). A lower line "long range needs less" appears, and the crossing marker slides from 1× out to 4× the distance.
- **Cost / gain:** the instrument "data rate" shows 1 Mb/s vs a bar shrinking to 125 kb/s ("Bluetooth LE 1M vs LE Coded (S=8)"). Reach brackets show 1× and "about 4×".
- **Payoff:** close-up on the receiver: a short "on my way" bubble arrives ✓ while a video's progress bar crawls ("video: crawls").
- **CTA:** veil and push; icon and wordmark plus a "Download free · Android" button; spoken "Download Meshline for private nearby messages, even offline."

## Defects found and fixed
1. **Scale and frame zero:** the first wide shots and frame zero were small; the layout moved left (receiver at x 11.4), the hook pushed in to z 1.25, and the phones, symbols and labels were enlarged.
2. **Barcode lane:** the 8-symbol groups ran together; they are now spaced as separate groups.
3. **Close-up clutter:** the strip and huge labels crowded the bit close-up; they are hidden there.
4. **Overlaps:** "slow" against "sender"; the decoded group on the fast lane; reach brackets against the phone labels; the message bubble under the phone. All were repositioned.

## Honest limits
- **No human watch-through or listen-through was performed.** "Watching" means every cut and 1 frame per second inspected as stills; "listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only. The strip and corrupted symbols are illustrative; only the ratios (8× slower, about 4× range) come from the Bluetooth SIG source.
