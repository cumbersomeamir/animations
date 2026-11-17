# QA: meshline-30s-english19-01.mp4 (batch 2026-11-17-english-19)

**SHA-256:** `504cd9325ebab6061f1717b6fc2fa8810bb5a7c20bdccdbe0ae3cda7a9340ae4`
**Thumbnail:** `meshline-30s-english19-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("HEARD NOTHING. / STILL CRASHED."), sha256 `0dea5ba466d54df2556581dbdbebf922ecd10248de3d90aeb6e912c4dd4e04ab`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.1 LUFS**, LRA 2.4 LU, **true peak −3.7 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +18.7 to +27.5 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en) | All 7 lines match apart from punctuation; base.en hears "here" for "hear" in l3 on the isolated line | `asr_words.json` |
| ASR on the **final MP4** | **WER 0.0** with whisper base.en; **normalised WER 0.0** with whisper-small (cross-check). Decoded audio PCM sha256 `5c4f5e4b…` is the scored take. | `qa/asr_final.json`, `qa/asr_crosscheck_small.json` |
| First frame | Frame 0: the collision itself. Both envelopes overlap on the middle phone inside a coral burst; left and right phones lit; the coral dashed "can't hear" line with ✕ between them; instrument "collision"; title "HEARD NOTHING. / STILL CRASHED.". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds | Chunks start at the ASR time of their anchor word (−0.05 s); 13 chunks, no overlap. Ink x 177–821, y 360–468; plate x 144–856. Inside x 100–900 and y 230–1500. | `captions.json`, `qa/caption_bounds.json` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically) | `src/hidden.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b28.00.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** frame 0 is the collision burst at the middle phone. On "hear silence", "silence" bubbles appear over left and right; then both send again and the envelopes collide at the middle on "still collide"; "?".
- **Setup:** "left's reach" and "right's reach" rings; both overlap the middle phone; coral dashed line "can't hear each other".
- **Overlap:** "silence" bubbles, both send, coral burst and "collision"; the lane shows two overlapping coral bars.
- **Where it matters:** "listens here" over left and right; coral ring "clash here" on the middle.
- **Turn-taking (illustrative):** a "request" pill from left; "clear to send" rings spread from the middle over both reaches; the right phone "waits" on a timer ring; left data ✓, then right data ✓; "take turns". The lane shows clean blue bars.
- **CTA:** paper veil, slow push, icon and wordmark; no packets or turn-taking run under the logo.

## Defects found and fixed
1. **Weak first frame:** the first render opened with packets still in flight; frame 0 now shows the collision burst itself, then the hook replays silence → send → collide.
2. **Small glyphs:** phones, envelopes, the "request" pill and the "silence" bubbles were enlarged; the "silence" text overflowed its bubble and was refitted.
3. **Overlap:** "can't hear each other" touched the ✕; moved down. The data checks moved beside the middle phone so they no longer touch "clear to send".
4. **Hook timing:** the hook's send now starts after "hear silence", so "silence" and "collision" are not shown at once.

## Honest limits
- **No human listen-through was performed.** "Listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only. Turn-taking is simplified (no timers, acknowledgements or right-side request shown).
- RTS/CTS is an optional 802.11 mechanism with overhead and is "not always" effective in practice (S1); nothing here is a Meshline feature claim.
