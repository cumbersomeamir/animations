# QA: meshline-30s-english14-01.mp4 (batch 2026-11-14-english-14)

**SHA-256:** `9a9802da9e1ff16183d139faee5bfc43d152eed3ab7fe9081c33c48639c05a31`
**Thumbnail:** `meshline-30s-english14-01-thumbnail.png`, 1080x1920 RGB, "DEAD SPOT? / MOVE IT.", sha256 `28f1e93807b4930b1d54095e0179951770e5c579cc3e37f51b3ff495957f3159`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.4 LUFS**, LRA 5.1 LU, **true peak −3.4 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +17.4 to +24.4 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en, whisper-small cross-check) | All 7 lines match. The first draft "Those copies arrive out of step" was heard as "Those cop is arrive our step" and was rewritten as "The echoes arrive out of sync". | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.074; **number-normalised WER 0.0** (2.4 and 12 as digits, "centimeters" US spelling). The decoded audio PCM sha256 `40a0ee46…` is identical across the later video-only rebuilds. | `qa/asr_final.json` |
| Caption sync | Each chunk starts at the ASR time of its first word (−0.05 s); 14 chunks, no handoff overlap | `asr_words.json`, `captions.json` |
| Caption bounds | Ink x 142–856, y 360–468; plate x 109–891, y 334–486. Inside x 100–900 and y 230–1500, at most 2 lines, centred at x 500. | `qa/caption_bounds.json` |
| Pacing | Hook 0.25–4.15 s (frame 1 already shows the phone in a dark spot on the signal map). Explanation and proof 4.7–21.3 s across 4 scene changes. Takeaway 21.8–25.3 s. CTA 25.9–29.55 s. | `audio/narration/narration_meta.json` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically for every key). The sheet was extended to 40 G so its bottom edge never shows. | `src/spots.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b28.00.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 25 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** close on a computed signal map (bright = echoes add, dark = cancel). The phone sits in a dark spot (coral bars, meter "dead spot"), and an envelope fizzles before reaching it. The phone slides a hand's width ("a hand's width" bracket; dashed coral ring and ✕ at the old spot). Its live bars rise, the meter reads "strong", the next envelope arrives ✓, then a coral "?".
- **Paths:** pull out to the room. Dashed paths ink in one by one (direct, ceiling bounce, floor bounce) with travelling dashes ("3 paths"); the walls are emphasised ("walls").
- **Add up / cancel:** the room is veiled. Echo 1 + echo 2 in step = a big wave ("add up"); out of step = a flat coral line ("cancel").
- **Wavelength:** a large travelling sine ("2.4 GHz") with a one-wavelength bracket "≈ 12 cm".
- **Spacing:** back on the map, a coral "weak" ring and a blue "strong" ring: "centimetres apart". The phone returns to the weak spot.
- **Payoff (before vs after):** an envelope stalls at the dead spot; the phone shifts; the next envelope arrives ✓.
- **CTA:** paper veil, icon and wordmark.

## Defects found and fixed
1. **Topic overlap:** the proposed obstruction angle repeats episodes 07, 14 and 15. Switched to multipath dead spots before scripting.
2. **ASR:** line 3 was garbled in ASR; rewritten.
3. **Length:** the narration ran 28 s of speech; trimmed to 26.1 s.
4. **Caption width:** two caption chunks exceeded x 100–900; re-split.
5. **Map edge:** the signal map had a hard rectangular edge; its left edge is now feathered.
6. **Label overlap:** the "3 paths" label sat on a ray; moved.
7. **Answer given away:** the cartouche subtitle "move a little" gave the answer away; changed to "signal map".
8. **Competing text:** the room competed with the add/cancel and wavelength panels; it is now veiled during those beats.
9. **Sheet edges:** the sheet's bottom edge showed under the wavelength strip (sheet extended), and its right edge showed by 8–23 px in four camera keys and the thumbnail (cameras clamped).

## Honest limits
- **No human listen-through was performed.** "Listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only.
- The signal map is an illustrative 2-D model with a fixed geometry. Real rooms are messier, and a small move is not guaranteed to help, for example if a wall or distance is the real cause.
