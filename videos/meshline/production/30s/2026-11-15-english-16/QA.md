# QA: meshline-30s-english16-01.mp4 (batch 2026-11-15-english-16)

**SHA-256:** `6f408725fa78379813d681fbaaae7d248d1938e3c7768d9aa2b1fdddb4c57a1d`
**Thumbnail:** `meshline-30s-english16-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("1,600 HOPS / A SECOND?" + hop map), sha256 `84cf592bbea7e7665d32bcf81c86fe3b8a54d7d739a2ea4ade51d7a96d426973`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.4 LUFS**, LRA 2.4 LU, **true peak −4.3 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +18.4 to +26.8 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en) | All 7 lines match, apart from digits and punctuation | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.153 (digits: 1,600 / 79 / 2.4 GHz / 20 MHz); **normalised WER 0.0**. The decoded audio PCM sha256 `8ea9fd52…` is the scored take; the last rebuild moved labels only. | `qa/asr_final.json` |
| First frame | Frame 0 is the composed subject: a channel-vs-time hop map with a blue hop route, coral Wi-Fi bursts and two devices tuned to the same channel, plus "1,600 HOPS / A SECOND?". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds | Chunks start at the ASR time of their first word (−0.05 s); 11 chunks, no overlap. Ink x 135–864, y 360–468; plate x 101–899. Inside x 100–900 and y 230–1500. | `captions.json`, `qa/caption_bounds.json` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically) | `src/hops.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b28.00.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 24 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** the hop route races across the map, a stop every slot. Both devices read the same channel number at every hop, joined to the current stop by dashed lines. Instrument: real-time hop counter (~1,600/s) and "the map is slowed down".
- **Crowded band:** three Wi-Fi bands (channels 1/6/11) light up with coral bursts ("Wi-Fi"); short coral blips appear for "other gadgets".
- **Together:** "in sync", then a bracket "79 channels".
- **Brief stops:** a closer view; "625 µs per stop". A hop inside an active burst turns coral with ✕; most hops miss the bursts ("only a few hits"). The instrument is hidden here.
- **Adaptive:** busy bands are hatched once spotted; the route stops landing there ("skip busy channels").
- **Router tip:** one "your Wi-Fi" allocation shrinks from "40 MHz" to "20 MHz"; the freed channels glow blue ("more room"), and new stops use them.
- **CTA:** paper veil, icon and wordmark.

## Defects found and fixed
1. **Topic:** the store-carry-forward topic repeats episode 03; replaced by frequency hopping before scripting.
2. **Length:** the narration ran 28.5 s of speech; trimmed to 26.6 s.
3. **False impression of "a few hops":** solid Wi-Fi bands made most hops look like hits, contradicting the narration. Wi-Fi is now drawn as bursts (about a quarter of the slots), so only a few hops are hit, which is honest about bursty interference.
4. **Framing:** the phones and map were small; enlarged. The l4 zoom cut labels and pushed the "625 µs" bracket off-screen; reframed, with the bracket inside the map's foot.
5. **Jump lines:** they read as transmissions across the Wi-Fi band. Connectors are now thin and the stops (transmissions) are larger.
6. **Hidden labels:** "in sync" sat behind the instrument and "only a few hits" behind the caption plate; both moved.

## Honest limits
- **No human listen-through was performed.** "Listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only.
- The hop sequence and Wi-Fi burst timing are illustrative. Bluetooth LE hops differently (40 × 2 MHz channels, per connection event), so the hook says "Classic Bluetooth".
