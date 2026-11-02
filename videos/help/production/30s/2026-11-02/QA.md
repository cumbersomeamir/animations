# QA — `help-30s-production-01.mp4` (round production-30s-2026-11-02)

All checks on the **final exported MP4**. SHA-256 `470743a39e6d7ec540699ee26cd98df33dafae8c2483c2304a41d1da2a2ec80b`, 19.04 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**, 30.000000 s; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | `ffmpeg -v error -i … -f null -` → exit 0, **0 error bytes**; **900** frames decoded | `qa/full-decode.log` |
| Loudness | **−15.2 LUFS** integrated (target −14…−16), LRA 5.1 LU, **true peak −1.5 dBTP** (≤ −1), sample peak −1.59 dBFS, flat factor 0 (no clipping), no silence gaps (> 0.5 s below −50 dB: 0) | `qa/loudness.txt` |
| Intelligibility | Could not listen myself. One ASR timing pass on the voice track + one ASR check on the final mix (Vosk small-en-us-0.15): final mix **66/67 words** — "ask" heard as "asked" (same merge seen in the 10 s test), "its" returned as homophone "it's" | `qa/asr-voice-track.txt`, `qa/asr-final-mix.txt` |
| Caption bounds | 16 cards, 32 frames measured in-page: ink **x 93–987, y 388–452** (rule: y 350–470, x ≥ 80) → **0 violations**; all single-line 56–64 px Inter ExtraBold; cards never overlap (≥ 2-frame gap); top 0–300 px empty | `qa/caption-bounds.json`, `src/captions.json` |
| Picture / transitions | One continuous stage (no cuts); beat boundaries 3.0 / 8.0 / 23.0 / 29.0 s continuous; camera pushes ≤ 1.07 keep the stage clear of captions; lamps dim for the end | `qa/contact-sheet.png` (≈1 s grid, 34 frames), `qa/beat-boundaries.png` |
| Accuracy | Every claim mapped to sources in `../../../context/12-production-30s-01.md`; no statistics, testimonials, impact, health/legal/income claims; "Illustrative scene" visible throughout | — |

## Remaining limits (honest)
- No human listening pass; intelligibility evidence is ASR + loudness only.
- First 0.5 s fades up from dim lamps (by design); the hook's text appears at 0.28 s.
- The wrong-size coat reads clearly only at full size; on small thumbnails it overlaps the neighbour's folded arms.
- Puppet joints are simple IK with rivets; no secondary sleeve pendulums beyond the scarf tassel.
