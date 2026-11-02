# QA: meshline-30s-production-01.mp4 (round production-30s-2026-11-02)

**SHA-256:** `99ac6725f731772bc74b3d3717ba21c965af3f939715f2fd15f9048a5edd8578`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−14.3 LUFS** integrated, LRA 3.5 LU, **true peak −3.4 dBTP** (target ≤ −1) | `qa/loudness.txt` |
| Intelligibility (speech band, voice vs bed) | +12.6 to +19.6 dB on all 7 lines | `qa/voice_balance.json` |
| ASR (faster-whisper base.en, local) on the **final MP4** | **WER 0.0** against the script. Segment timings match the placed lines. | `qa/asr_final.json` |
| Caption bounds (pixel-exact ink bbox) | All 10 chunks: ink y 360–468, x 176–904. No handoff overlaps. | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every camera move and caption change | `qa/boundary-sheet.png` |
| Audio picture | waveform | `qa/waveform.png` |

## Visual and accuracy review
- **Story:** the hook ("sending…" with full bars) → setup (the radio route inks to the tower) → mechanism (a shared-capacity rack with spare slots, then many routes converge, the rack fills and tokens queue on a hollow siding) → metaphor (clear road vs crowded station; your token waits) → takeaway (a printed legend: signal strength full, spare capacity none) → offline coordination (an agreed meeting spot drawn with walking dots) → the whole network.
- **Bars:** all four are fully lit whenever "signal: full" is shown. The label only appears once the fourth bar lands.
- **Safe areas:** captions are screen-space at y 334–486, and there are screen grades over the top 0–320 px and the bottom 1640–1920 px. Labels that would clip at frame edges during camera moves are hidden or veiled.
- **Accuracy:** every claim maps to a source (`research/claims.md`). Metaphors are labelled illustrative and carry no numbers. No Meshline feature claims are made.

## Defects found and fixed during this round
1. The top band held a faint "CELL TOWER" placeholder and the printed stage → placeholder removed, station shot reframed, top grade added.
2. The printed title sat in the bottom overlay zone and too close to the edge → moved below YOUR PHONE, with ≥ 80 px margin.
3. The wide shot put the stage behind the caption → reframed (z 0.78).
4. The meeting-spot beat was cluttered at the edges → a paper veil (style §3).
5. "signal: full" showed dimly while 2–3 bars were lit → it now appears only with all four lit.
6. The "waiting" label clipped at the right edge in two shots → moved inside the siding and hidden during the legend shot.
7. The ASR tool failed on a PyAV API mismatch → audio decoded through the system FFmpeg instead.

## Remaining limits (honest)
- No human listening was possible. Intelligibility rests on the ASR WER of 0.0 on the mixed final audio plus the speech-band levels.
- The camera is 2D (no WebGL depth of field or real tilt). The paper tooth is a lighter version than the style's procedural print pass.
- During the camera move at about 23.0–23.6 s, the "shared capacity" rack label passes briefly under the caption plate. During the pull-back at about 14.4–15.3 s, the printed stage passes behind the caption band. Both are context, not facts.
- In wide shots, secondary sheet labels are about 19–25 px, smaller than the captions. The narration and captions carry the explanation.
- The FCC tips source was not fetchable (403) and is not relied on.
