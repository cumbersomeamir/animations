# QA: meshline-30s-english21-01.mp4 (batch 2026-11-18-english-21)

**SHA-256:** `ef433d2c7ac8e7c85e7b132ca46a61e1b9e7acf4de822eccef50dc80575d8b03`
**Thumbnail:** `meshline-30s-english21-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("SAME SIX DIGITS. / WHY?"), sha256 `34dfd9eb0a297603fca4f256cfaa1c0f4eecf37ea49d4d1904401d1200361453`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.0 LUFS**, LRA 2.9 LU, **true peak −4.3 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +19.9 to +24.8 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en) | All 7 lines match apart from punctuation. On the isolated l1, base.en repeated "Why?"; it does not do so on the final MP4. | `asr_words.json` |
| ASR on the **final MP4** | **WER 0.0** with whisper base.en; **normalised WER 0.0** with whisper-small (cross-check). Decoded audio PCM sha256 `1c84921d…` is the scored take. | `qa/asr_final.json`, `qa/asr_crosscheck_small.json` |
| First frame | Frame 0: two large phones, "you" and "friend", both showing "482 / 913" on a "pair?" prompt, joined by a live dashed line; title "SAME SIX DIGITS. / WHY?". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds | Chunks start at the ASR time of their anchor word (−0.05 s); 14 chunks, no overlap. Ink x 142–858, y 360–468; plate x 108–892. Inside x 100–900 and y 230–1500. | `captions.json`, `qa/caption_bounds.json` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically); both phones stay inside the frame up to z 1.18 | `src/pair.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b26.60.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** the same digits on both screens; the digits pulse on "same six digits"; "?".
- **Superhook:** a masked coral "middleman" rises onto the line; speech tags "I'm your friend" / "I'm you".
- **Keys:** the middleman leaves; a "public key" token crosses each way; padlocks marked "shared secret" appear over both phones.
- **Check:** the screens roll and settle on the same six digits; the instrument "compare the two screens" reads "match" ✓.
- **Middleman case:** it returns; both real keys go in, and coral keys come out ("its own keys"); the screens roll to different coral values; "numbers differ" ✕ and the readout says "no match".
- **Payoff:** a clean pairing again; "Pair" buttons appear; tap ripples on both; "same number: pair" ✓.
- **CTA (feedback "call to action needed" applied):** veil and push; icon and wordmark plus a "Download free · Android" button; spoken "Download Meshline for private nearby messages, even offline."

## Defects found and fixed
1. **Scale:** the phones and digits were enlarged for a stronger first frame.
2. **Overlaps:** the "I'm your friend" tag touched the left phone, and the travelling "its own key" label was clipped by the phone; the tags were moved and narrowed, and the label is now a static "its own keys" above the middleman.
3. **Premature readout:** the instrument showed the six digits before the phones computed them; it now rolls until the check settles.
4. **Captions:** two chunks were wider than x 100–900; they were re-split.

## Honest limits
- **No human listen-through was performed.** "Listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only. The digits are made-up examples. Commitments, random values and the Just Works / Passkey models are omitted (noted in `research/claims.md`).
