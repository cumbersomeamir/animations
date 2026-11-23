# QA: meshline-30s-english24-01.mp4 (batch 2026-11-23-english-24)

**SHA-256:** `d5e777b2f64410e96fc4307dfa25999d211c5b647a1d112899938f61c52366d8`
**Thumbnail:** `meshline-30s-english24-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("ONE BAR. / MORE DRAIN?"), sha256 `d4ccb5636e9ba663f1ef0545d7955e77fc5e87f54817d5cc27bea1e718c755af`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.0 LUFS**, LRA 4.1 LU, **true peak −4.2 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +20.2 to +27.0 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en) | All 7 lines match apart from punctuation and "50%" for "fifty percent", after one rewrite: "resent" was heard as "recent", so the line now says "sent again" | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.027 with base.en and whisper-small; the only difference is "50%" for the spoken "fifty percent", so the **number-normalised WER is 0.0**. Decoded audio PCM sha256 `c0ca8f6a…` is the scored take. | `qa/asr_final.json`, `qa/asr_crosscheck_small.json` |
| First frame | Frame 0: a close-up of a phone showing one signal bar, "41%" and "sending…". Transmit rings pulse around it and a data burst is just leaving. Title "ONE BAR. / MORE DRAIN?". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds | Chunks start at the ASR time of their anchor word (−0.05 s); 12 chunks, no overlap. Ink y 332–440 and plate y 306–458 (inside y 280–460); ink x 166–833, plate x 133–867 (inside x 100–900). | `captions.json`, `qa/caption_bounds.json` |
| Right-side / bottom controls | Instrument plate x 96–864, with values right-aligned at 830. The weak phone sits at about 760 px in wide shots; "sent again" and "higher power" are right-aligned left of the lane. | frames, `src/drain.mjs` |
| Framing | No camera key shows the sheet's left, right **or top** edge (checked numerically after one fix, below) | `src/drain.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b26.40.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** the battery percentage ticks down (41 → 38%, labelled "sped up") while the one-bar phone keeps sending; "?".
- **Same download:** the camera pulls out to one tower, a "strong signal" phone near it and a "weak signal" phone far below, both marked "same download". The instrument "energy for the same download" starts filling.
- **Rate:** the strong lane sends short, quick bursts ("fast rate", done ✓). The weak lane sends long bursts ("slow rate / longer on air").
- **Resend and power:** a weak-lane burst turns coral, ✕ "lost", then is "sent again". The weak phone's rings grow and thicken: "higher power".
- **Measured:** the weak lane finishes ✓; the bars settle at 1× vs "+52%" ("one study, 3G").
- **Payoff:** close-up on the weak phone: "big upload: waiting". The bars climb to four ("stronger signal"), and the upload goes in one short burst: "sent on a strong signal" ✓.
- **CTA (feedback "call to action needed"):** veil and push; icon and wordmark plus a "Download free · Android" button; spoken "Download Meshline for private nearby messages, even offline."

## Defects found and fixed
1. **Frame zero:** it showed the tower behind the title and a small phone; it is now a tight close-up of the phone, with the data burst kept clear of the title.
2. **Clipped labels:** the payoff labels were cut at the left edge and "sent again" ran into the right-side zone; both were repositioned. The waiting label was moved off the waiting burst.
3. **Sheet edge:** wide shots showed the sheet's top edge as a dark band; the world and camera moved down 3 cells.
4. **Clutter:** the tower sat behind the caption in the payoff close-up; it is hidden there, and the strong phone is hidden in that close-up too.
5. **ASR:** "resent" was heard as "recent"; the line now says "sent again".

## Honest limits
- **No human watch-through or listen-through was performed.** "Watching" means every cut and 1 frame per second inspected as stills; "listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only. The schedules and power step are illustrative; only the final ratio (+52%) is measured (3G, 2013).
