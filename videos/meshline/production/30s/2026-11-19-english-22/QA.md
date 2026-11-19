# QA: meshline-30s-english22-01.mp4 (batch 2026-11-19-english-22)

**SHA-256:** `167542696ac408796c09b5e4a676cb65ec8361dd592f8934bee8a84f42bed0db`
**Thumbnail:** `meshline-30s-english22-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("THE SHORTER / WAY AROUND"), sha256 `7391f3beec84e6482533ee28aa78a9cc894185db71d925512e953fad2a408aa9`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.0 LUFS**, LRA 2.7 LU, **true peak −3.7 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +20.5 to +24.3 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en) | All 7 lines match apart from punctuation (after one rewrite: "Halve each hop" was heard as "Have each hop", so the line now says "Cut each hop in half") | `asr_words.json` |
| ASR on the **final MP4** | **WER 0.0** with whisper base.en; **normalised WER 0.0** with whisper-small (cross-check). Decoded audio PCM sha256 `52cbc3e5…` is the scored take. | `qa/asr_final.json`, `qa/asr_crosscheck_small.json` |
| First frame | Frame 0: a small message envelope at the top of a long jump across the gap between two islands, with a coral dashed line showing it is about to fall short. The relay's dashed "way around" sits below. Title "THE SHORTER / WAY AROUND". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds (2026-11-19 brief) | Chunks start at the ASR time of their anchor word (−0.05 s); 12 chunks, no overlap. The caption band was raised for this brief: ink y 332–440 and plate y 306–458 (inside **y 280–460**); ink x 181–816, plate x 149–851 (inside x 100–900). | `captions.json`, `qa/caption_bounds.json`, `captions_check.mjs` |
| Right-side / bottom controls | The instrument plate is narrowed to x 96–864, and its counts are right-aligned at x 830. The friend phone stays left of x ≈ 870 px; the CTA button is centred at x 500. | frames, `src/hops.mjs` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically) | `src/hops.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b26.60.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** the long jump falls into the gap (fizz). The relay route lights up; the message hops you → relay → friend ✓; "?".
- **Superhook:** signal rings spread from you and fade with distance; "strong" near you, "weak" near the friend.
- **Half the hop:** a ruler marked "one long hop" splits at the relay into "half" and "half". The instrument "signal at the receiver" shows 1× vs a bar growing to "about 4×" (drawn to scale).
- **Weak link:** "weak link"; lost ✕, lost ✕, delivered ✓. The instrument "sends to deliver one message" counts 3 sends.
- **Two strong hops:** solid blue arcs marked "strong"; ✓ at the relay and ✓ at the friend; the readout says 2 sends and "fewer sends".
- **Airtime and payoff:** a busy ring around the relay ("listens, then sends again"). Then a "decent direct link" turns solid and delivers in 1 send, and the readout switches its first row to "decent direct link: 1 send" (fewer).
- **CTA (feedback "call to action needed"):** veil and push; icon and wordmark plus a "Download free · Android" button; spoken "Download Meshline for private nearby messages, even offline."

## Defects found and fixed
1. **Scale:** the first layout was small; the phones, islands, envelopes and labels were enlarged, and the jump arc raised.
2. **Fall point:** the lost message first landed on the relay's islet, which could read as "delivered to the relay"; it now falls into open water past the islet.
3. **Signal comparison:** the in-world bars were tiny and overlapped labels; the comparison moved into the instrument (to scale), and the "about 4×" text no longer overlaps its bar.
4. **ASR:** "Halve" was heard as "Have"; the line now says "Cut each hop in half".

## Honest limits
- **No human watch-through or listen-through was performed.** "Watching" means every cut and 1 frame per second inspected as stills; "listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only. The send counts are an illustrative sample run, not measurements.
- "About four times stronger" is the free-space ratio; real indoor gains vary.
