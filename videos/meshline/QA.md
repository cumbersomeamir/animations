# QA: videos/meshline/output/meshline-30s.mp4

## Verification evidence (final render)
| Check | Result | Evidence |
|---|---|---|
| Container/codec | H.264 High, yuv420p, 1080x1920, 30/1 fps; AAC LC 48 kHz stereo ~202 kb/s | `qa/ffprobe.json`, `qa/ffprobe-summary.txt` |
| Duration | 30.000 s (format and both streams) | `qa/ffprobe-summary.txt` |
| Frame count | 900 decoded frames | `qa/frames.txt` |
| Full decode | `ffmpeg -v error -i … -f null -` → no errors | `qa/decode.log` |
| Black/freeze | No black segment ≥0.25 s, no freeze ≥1.2 s | `qa/black_freeze.txt` |
| Loudness | −15.7 LUFS integrated, LRA 4.7 LU, true peak −1.6 dBTP (no clipping) | `qa/loudness.txt`, `qa/astats.txt` |
| Narration vs bed (300–4000 Hz) | +11.0 to +24.0 dB on every line | `qa/voice_balance.json` |
| Contact sheet | 1 frame/s, all 30 s | `qa/contact-sheet.png` |
| Scene boundaries | 22 boundary frames (hook, reveal, flip, launch, snap, walk, high-five, dive, iris, end) | `qa/boundary-sheet.png` |
| Audio picture | Waveform and spectrogram | `qa/waveform.png`, `qa/spectrogram.png` |
| SHA-256 | `dbffaa2f8fb6dfe8e5f87f59a378b4964b41bf1933631c2ee81cfabe69c415e8` | `qa/sha256.txt` |

## Assessment
- **Action continuity:** every beat is physically caused. The sign breaks → pieces fall, bounce and rock → A jumps and the camera shakes on each impact. A ring touches B → B's phone flips. The flick → the line flies and snaps. A bubble's weight → the line sags. The high-five → the node → the logo. The B turn uses a brief squash; checked frame by frame across 17.95–18.4 s.
- **Clipped text / overlap:** captions wrap within 900 px, are top-safe (y≈250–440) and never collide with characters, which start below y≈850. End card elements are separated: tile, wordmark, subline, CTA and mini pair.
- **Pacing:** 6 beats of 3.5–6 s. The opening sign break starts at 0.30 s, so there is motion from frame 0. The message exchange accelerates (1.0 s → 0.5 s rides) before the walk.
- **Narration sync:** each line starts with its caption (±0.1 s). "No internet?" was moved after the crash clatter so it is not masked. CTA pill pops at 26.0 s on "Explore on Google Play".
- **Audio clipping:** a look-ahead limiter holds samples at ≤ −3.1 dBFS pre-AAC, and true peak after AAC is −1.6 dBTP.
- **Feature claims:** only listing-backed claims (see `storyboard.md`). Phones are stylised glyph screens, not product UI. "Google Play" appears as text only, with no logo.
- **CTA legibility:** 50 px semibold white on `#3157FF` pill. "Meshline" is 132 px ExtraBold on charcoal. Both are held on screen from 26.0 s to 30.0 s, and the final fade is limited to 30 % so the CTA stays readable.

## Defects found and fixed during review
1. Mid-video camera was too wide (empty lower third) → reframed to z 1.2–1.3.
2. High-five was cramped and heads overlapped → step-in reduced and arms reach forward.
3. Bubbles overlapped faces while walking → phones held further from heads.
4. A's beanie covered the eyes → beanie raised and eyes enlarged.
5. Cheer arm read as "hand on head" → fist pump moved forward.
6. Audio true peak was +1.7 dBTP after AAC → replaced soft-clip/normalise with a look-ahead limiter at a −3.1 dBFS ceiling.
7. Narration was buried (−1.3 dB broadband) → voice compressor, deeper ducking, quieter SFX under lines, snare entry delayed.
8. White-out lasted about 10 frames → faster iris (about 4 frames).
9. Footsteps flammed → B's walk phase offset set to a quarter cycle.

## Known limitations
- The narration is synthetic: local Kokoro-82M, voice `af_heart`, Apache-2.0. Its pronunciation of "Meshline" was checked at the phoneme level (`mˈɛʃlaɪn`), not by listening.
- Fonts are system Inter (OFL-1.1), copied into `project/fonts` so the build is reproducible.
