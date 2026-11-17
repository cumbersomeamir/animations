# QA: meshline-30s-english18-01.mp4 (batch 2026-11-15-english-18)

**SHA-256:** `3b5950838589f3ccb697e93b170eeaabbd2faf39efc0724c469dc878f4153394`
**Thumbnail:** `meshline-30s-english18-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("THE BRIDGE / WALKED AWAY"), sha256 `a5d8481400d1a05aaf61c8e41f271b0d82af29d5eacccb23e83ab5f3b38b4c8b`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s), after one fix (see below) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.1 LUFS**, LRA 2.9 LU, **true peak −2.9 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +20.7 to +26.3 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en) | All 7 lines match, apart from punctuation and US spelling | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.05; **normalised WER 0.025**. base.en hears "requests" for "request" and drops the CTA's first word "For" (heard by whisper-small on earlier batches with the same CTA line). The decoded audio PCM sha256 `c2016fc8…` is the scored take. | `qa/asr_final.json` |
| First frame | Frame 0 (brightened, per the brief): a mesh route; the bridge phone glowing coral, already walking away; the broken coral link with ✕; a coral stuck message at "you"; enlarged labels ("you", "bridge", "friend"); "THE BRIDGE / WALKED AWAY". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds | Chunks start at the ASR time of their anchor word (−0.05 s); 12 chunks, no overlap. Ink x 140–859, y 360–468; plate x 106–894. Inside x 100–900 and y 230–1500. | `captions.json`, `qa/caption_bounds.json` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically) | `src/route.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b28.00.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** the bridge walks off (footsteps); the A–bridge link is coral with ✕; the message is stuck at "you"; instrument "route to your friend: stuck".
- **Chain:** "a minute ago": the bridge rewinds into place and the route you → A → bridge → C → friend glows blue. Then "phones move": the bridge walks away again.
- **Hellos:** closer view; hello rings pulse from A and the coral bridge. "hello?" → "2 missed" → "link lost"; instrument ✓ ✓ ✗ ✗ "link lost".
- **Stale:** the old route turns grey dashed ("stale"); a coral route-error envelope travels back to you ("break reported").
- **Rediscover:** route-request rings spread phone by phone ("route request"; instrument "searching…"). A reply envelope returns friend → F → E → you ("reply"); a fresh blue path inks you → E → F → friend ("fresh path").
- **Snapshot:** the message travels the fresh path ✓ at the friend; the old route is labelled "a minute ago", the new one "now".
- **CTA:** paper veil, slow push, icon and wordmark.

## Defects found and fixed
1. **Hidden labels:** the bottom labels ("a minute ago", "phones move", "route request", "reply", "fresh path", "now") sat behind the instrument; raised.
2. **Crop:** the hello beat's zoom cropped the friend at the right edge; reframed.
3. **Brightness:** per the brief, the frame-zero hook is brighter (bridge glow, bigger coral stuck message) and the route-request rings are stronger. Only the essential labels were enlarged.
4. **Freeze:** the freeze detector flagged the CTA (26.8–29.7 s); a slow camera push was added. No route motion runs under the logo, so no app relay is implied.

## Honest limits
- **No human listen-through was performed.** "Listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only.
- AODV (an Experimental RFC) is used as one documented example; other mesh designs detect breaks and find routes differently.
