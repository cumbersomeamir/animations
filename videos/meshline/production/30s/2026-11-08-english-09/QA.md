# QA: meshline-30s-english09-01.mp4 (batch 2026-11-08-english-09)

**SHA-256:** `e6e5c16bde48cd66a40a4974957ea1b97cc9203328eca8f68e3be4361417a6db`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−15.4 LUFS**, LRA 2.6 LU, **true peak −1.1 dBTP** (within ≤ −1); music stays quiet under speech | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +21.7 to +26.3 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (faster-whisper base.en) | All 7 lines verbatim ("50" as digits), after the l1 rewording | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.014, which is only "50" vs "fifty". With numbers normalised, **WER 0.0**. | `qa/asr_final.json` |
| Narration / caption timing | Each chunk starts at the ASR time of its first word (−0.05 s); 12 chunks, no handoff overlap. The CTA plays 26.14–29.55 s (the last 3.9 s). | `asr_words.json`, `captions.json` |
| Caption bounds (pixel-exact ink) | Ink y 360–468 (inside 350–470), x 166–912 (inside 90–990), at most 2 lines. The top 300 px are clear. | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 20 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Visual and accuracy review
- **Hook (first second):** the instrument reads "speed test ↓ 100 Mbps ✓" next to "call: frozen". A loss burst puffs packets out on the route, the call screen freezes ("frozen" badge, blocky artefacts), and coral × marks fill the arrivals timeline.
- **Steady stream:** evenly spaced packets ("steady stream"), and the ball plays smoothly.
- **Packet loss:** packets puff out ("packet loss"), the picture freezes and then skips when the next packet lands, and the timeline shows × gaps.
- **Jitter:** packets bunch and spread ("jitter: uneven gaps"), the buffer tray fills ("wait to smooth · adds delay"), and the ball plays smoothly but later.
- **Targets (ITU-T Y.1541 class 0):** a 1,000-dot grid with one ringed coral dot ("loss ≤ 1 in 1,000"), and a jitter bar with the 50 ms line.
- **Takeaway:** route labels "bandwidth = width", "latency = length", "stability = even spacing", and a card "bandwidth fine ✓ · latency fine ✓ · loss · jitter check" with the last one boxed.
- **CTA:** icon and wordmark.

## Defects found and fixed
1. ASR heard l1 "Speed test says fast" as "Speed tests as fast". It was reworded to "Your speed test looks fast; …", which is now verbatim.
2. The hook didn't visibly freeze: the random 42 % loss never stalled the picture, and the panel said "call: playing" while the voice asked why it freezes. The hook now uses a short loss burst (90 % for ~2.5 s), so the screen freezes from ~1 s and then skips.
3. The l2 push-in dropped "your call screen" onto the bottom note. The shot was re-framed so the label tucks under the instrument.
4. The targets panel was nearly empty for ~1 s, and the single lost packet in the 1,000-dot grid was too small to see. The grid now arrives with the words, and the lost dot is ringed and labelled "1 lost".

## Remaining limits (honest)
- No human listening; this relies on ASR and level metrics.
- The camera is 2D only.
- True peak −1.1 dBTP meets the ≤ −1 target with a small margin.
- Loss and jitter are exaggerated to be visible.
