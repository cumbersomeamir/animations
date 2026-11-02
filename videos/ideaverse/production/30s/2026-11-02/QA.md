# QA — ideaverse-30s-production-01.mp4 (2026-11-02)

SHA256 c5ababf6b9e75f3143bbe6067f9824ddf06d798bcde2379a53968176c3cd6bf3 · 8,823,772 bytes. Evidence in qa/.

| check | result |
|---|---|
| duration (format / video / audio) | 30.000000 / 30.000000 / 30.000000 s (qa/ffprobe.json) |
| video | H.264 High, 1080x1920, yuv420p, 30/1, 900 frames; decoded count 900 (qa/decoded-video-frames.txt) |
| audio | AAC-LC 48 kHz stereo, 192 kb/s |
| full FFmpeg decode | OK, no errors (qa/full-decode.log) |
| loudness | −15.0 LUFS integrated, LRA 4.3 LU, true peak −1.5 dBFS (qa/loudness.txt; spec −14…−16, TP ≤ −1) |
| narration ASR + timing (one pass, final MP4) | all 6 lines word-correct; each spoken span lies inside its caption window (qa/asr-narration.txt) |
| caption bounds (every captioned frame, measured) | ink y 356–467 (spec 350–470), x 102–976 (margins ≥ 80) (qa/caption-bounds.txt) |
| top 0–300 px | paper + field dots only (≤ 0.37 % dark pixels) |
| contact sheets | qa/contact-sheet-full.png (every second), qa/contact-sheet-boundaries.png (3/8/23/29 s + last frames) |
| render | 900 frames on 2s (450 prints) in 58 s; mix in < 10 s |

I cannot hear audio: intelligibility was checked with ASR on the final file, loudness/peak meters and the
spectrum (qa/spectrum.png); voice sits upfront (music ducked ~8 dB, SFX ~4 dB under speech).

## Fixed during this round
1. Knocked-out "PROMPT PRESS" / signature text broke up over a 90 % screen → solid strips behind them.
2. CONTEXT line (navy text on navy dots) read as struck-through → solid navy band, paper text.
3. Bill/table numbers too small for phone → 22–23 px mono.
4. STILL CHECK IT stamp covered the checked numbers → moved to the prompt card's lower edge.
5. "Direct" arrows too short to read → three plate-coloured routes from prompt lines into the answer.
6. Caption-bounds measurement initially counted isolated encoder/paper specks and the housing edge → robust
   row/column thresholds; caption ink itself was always inside the spec.

## Remaining limits (honest)
- Kokoro model was not cached in this container; it was downloaded once from Hugging Face (pinned revision).
- The hook (0–3 s) is calm: the vague slip and rolling drum carry it; no camera move (locked-off print by design).
- The end registration mark and press base sit in the bottom overlay zone (décor only).
- The illustrative mismatch ($3.24 vs $3.42) shows why to check; it is not a measurement of any real model.
