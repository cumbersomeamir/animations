# QA: meshline-30s-english08-01.mp4 (batch 2026-11-07-english-08)

**SHA-256:** `3a431ac4f95022444e80d9533c0ea96187cbcf203196d1c766757c0af9923c2a`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−15.0 LUFS**, LRA 1.9 LU, **true peak −3.6 dBTP**; music stays quiet under speech | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +21.1 to +24.4 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (faster-whisper base.en) | All 7 lines verbatim, apart from punctuation and "150" written as digits | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.043, all of it from "150" vs "one hundred fifty". With numbers normalised, **WER 0.0**. "Meshline", "latency", "bandwidth" and "milliseconds" are all recognised. | `qa/asr_final.json` |
| Narration / caption timing | Each chunk starts at the ASR time of its first word (−0.05 s); 12 chunks, no handoff overlap. The CTA plays 26.14–29.55 s (the last 3.9 s). | `asr_words.json`, `captions.json` |
| Caption bounds (pixel-exact ink) | Ink y 360–468 (inside 350–470), x 140–938 (inside 90–990), at most 2 lines. The top 300 px are clear. | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 20 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Visual and accuracy review
- **Hook (first second):** one friend, two routes. A text envelope lands on the short ground route ("text: delivered", with a ring), while the call's speech bubble is still climbing the long satellite route ("call audio: still travelling"). The instrument shows the two speakers' bars colliding ("talking over each other").
- **Bandwidth:** packets travel five abreast on both routes, both routes are labelled "100 Mbps" ("same speed number"), and the instrument shows two equal bars.
- **Latency:** one ping per route on a "one way · clock slowed down" stopwatch. The ground ping arrives at ≈ 10 ms ✓ while the satellite ping takes the long way: "36,000 km up", "≈ 260 ms each way", and "width ≠ delay" as the satellite bundle glows.
- **150 ms meter:** "feels instant" vs "lag you notice", with ground ≈ 10 and satellite ≈ 260 (ringed when "conversations stop feeling instant").
- **Takeaway:** two speed-test cards with the same "↓ 100 Mbps" but ping ≈ 20 ms vs 520+ ms, with the ping fields boxed.
- **CTA:** icon and wordmark, with both pings still looping on the map.
- **Claims:** mapped in `research/claims.md` (ITU-T G.114, M-Lab). Meshline appears only in the CTA.

## Defects found and fixed
1. **True peak +0.5 dBTP after AAC encoding.** The dense narration drove the limiter hard, so the target was lowered 1 dB and the ceiling set to 0.6. It is now −15.0 LUFS and −3.6 dBTP.
2. In the l3 push-in, the "via high satellite" label sat near the top zone behind the captions, and the left "100 Mbps" clipped at the edge. The l3 shot was re-framed, top labels now veil whenever they'd fall behind the caption band, and "100 Mbps" moved inside the route.
3. In the l4 satellite shot, the "you" / "friend" / "ground fibre" labels collided with the bottom note. The shot was re-framed so the ground row tucks under the instrument.
4. "≈ 260 ms each way" and "width ≠ delay" sat on the satellite bundle. They moved lower into the open interior.
5. The final-MP4 ASR crashed in faster-whisper's word alignment (an edge case). Final scoring now runs without word timestamps; the per-line timing pass is unchanged.

## Remaining limits (honest)
- No human listening; this relies on ASR and level metrics.
- The camera is 2D only.
- The delay figures are ITU planning values (propagation); real calls add processing and buffering, hence "about" and "520+".
