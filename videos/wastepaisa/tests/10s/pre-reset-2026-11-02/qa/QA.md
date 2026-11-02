# QA: WastePaisa 10 s style test (S11 paper-cut motion), batch 2026-11-02-pre-reset

File: `videos/wastepaisa/tests/10s/pre-reset-2026-11-02/wastepaisa-10s-test.mp4` · SHA-256 `a7faf0e5e63745f93ca957908c9f62ee96fc85ab82e272f00f52d3e0bc590267`

| Check | Result |
|---|---|
| ffprobe (`ffprobe.txt`) | container **10.000000 s** · H.264 High **1080×1920**, **30/1**, **300 frames** (`-count_frames`) · AAC-LC 48 kHz stereo, `duration_ts` **480000** @ 1/48000 = 10.000 s |
| Full decode (`decode.log`) | `ffmpeg -v error -i … -map 0 -f null -` → exit 0, 0 bytes of errors |
| Loudness |  I: -15.9 LUFS  Peak: -1.5 dBFS (target −16 LUFS / −1.5 dBTP) |
| Cadence | 120 unique deterministic frames at a stepped 12 fps, delivered as 300 frames at 30 fps (FFmpeg `fps=30` repeats frames; intentional stop motion) |
| Captions (`caption-bounds.json`) | y **350–466**, x **172–908** (margins ≥ 172 px), max 2 lines, hard switches with no overlapping handoffs (captions at 0.22–2.92 / 2.97–5.96 / 6.00–10 s) |
| Frames (`contact-frames.png`, decoded from the MP4) | f0, tap f31, tear and pull f90–f107, hop f136, pin f148/f167, takeaway f180, stamp impact f193→f195, end f299 |
| ASR (one pass, Vosk en-us-0.22-lgraph, `asr.json`) | "this cup looks like paper **and** many have a plastic lining check whether your local recycler accepts them": every script word is present; one extra "and" is inserted |
| Voice | Kokoro-82M v1.0 ONNX via kokoro-onnx 0.6.1, **af_bella×0.7 + am_puck×0.3, speed 0.98, en-us** (Meshline blend). Model sha256 7d5df8ec…a6c5, voices bca610b8…f7d (official kokoro-onnx release files, not committed) |

Fixed in QA: stamp impact frame not visible / thud 0.08 s early → stamp moved to step 77; held film strip clipped at the left edge → offset inward.

Limits: no human listening test; one ASR pass only (as budgeted). The lining inside the torn window is a stylised blue band. Tinku sprites are flat renders of the approved 3D rig, so there is no in-between posing beyond sprite swaps and 12 fps hops (intended stop-motion look). The film is illustrative; claims reuse pilot-01 sources S1–S5.
