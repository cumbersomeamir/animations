# QA: meshline-30s-english23-01.mp4 (batch 2026-11-21-english-23)

**SHA-256:** `cbd8e290b46b76efc36aa48075e3045fcba7d5815c984316dc983175f571f3a5`
**Thumbnail:** `meshline-30s-english23-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("NEW ADDRESS. / SAME PHONE."), sha256 `95eb15199ceb6ef4afc25b129bdcd8bc0572dedd2e02244ddf0c97974b94b6d8`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.0 LUFS**, LRA 2.9 LU, **true peak −3.7 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +22.1 to +29.0 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en) | All 7 lines match apart from punctuation and "15" written for "fifteen" | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.013 with base.en and whisper-small; the only difference is "15" for the spoken "fifteen", so the **number-normalised WER is 0.0**. Decoded audio PCM sha256 `02a9054b…` is the scored take. | `qa/asr_final.json`, `qa/asr_crosscheck_small.json` |
| First frame | Frame 0: your phone on a transit-map street with its live address tag ("C2:91:5E…"); two older tags it left behind fade along the line behind it; three scanner posts (shop, café, station) below. Title "NEW ADDRESS. / SAME PHONE.". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds | Chunks start at the ASR time of their anchor word (−0.05 s); 12 chunks, no overlap. Ink y 332–440 and plate y 306–458 (inside y 280–460); ink x 164–834, plate x 132–868 (inside x 100–900). | `captions.json`, `qa/caption_bounds.json` |
| Right-side / bottom controls | Instrument plate x 96–864, with its state text right-aligned at 830. In the walk the camera pans with the phone so its tag ends left of about 890 px; the close-ups centre the phone at about 630–690 px. | frames, `src/rotate.mjs` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically) | `src/rotate.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b26.60.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** the live tag flips like a split-flap card on "changing"; older tags fade behind; "?".
- **Superhook (what-if):** a coral tag "4E:20:B7…" marked "never changes" zips past all three stops. Each scanner flashes and logs the same address; a coral dashed trail joins them: "tracked". The instrument "a stranger's scanner log" shows three identical entries, "same device: tracked".
- **Rotation:** the phone walks the line again while the camera pans with it. The tag flips between stops (at 8.8 s and 12.6 s), and a sped-up timer is labelled "≤ 15 min / sped up". The log fills with three different addresses, "looks like 3 devices", and each scanner shows "new device?".
- **Paired:** close-up. A "paired friend" holds a "shared key"; a copy of the tag travels into the key and resolves to "it's you", while the station scanner shows "stranger: ?".
- **Payoff:** close-up on the phone: the address changes but the name tag "Sam's Phone" (coral, "name: same everywhere") stays the same; it flips to "Phone" ("plain name"). The instrument "what a scanner sees" agrees.
- **CTA (feedback "call to action needed"):** veil and push; icon and wordmark plus a "Download free · Android" button; spoken "Download Meshline for private nearby messages, even offline."

## Defects found and fixed
1. **Scale:** the first wide shots were small; the phones, tags, scanners and line were enlarged and the wide camera moved to z 1.08.
2. **Clutter:** the hook's old tags overlapped the live tag; they were spaced out. The paired close-up overlapped the café label; close-ups now hide stops they don't need.
3. **Edges:** tags clipped at the left edge at the start of both runs (the starts moved right). At the end of the walk the tag reached the right-side controls zone; the walk now ends at x 13.3 and the camera pans with the phone.
4. **Timer label** ran off the right edge; it moved to the left of the tag.

## Honest limits
- **No human watch-through or listen-through was performed.** "Watching" means every cut and 1 frame per second inspected as stills; "listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only. Addresses and the example name are made up; the timer is sped up.
- The 15-minute ceiling is an Android requirement while using Bluetooth LE; other platforms and classic Bluetooth differ (see `research/claims.md`).
