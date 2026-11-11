# QA — ideaverse-30s-english10-01.mp4 (English, batch 2026-11-09-english-10)
sha256 86ec25060ce991002962bda70794f29cffe6bdb44caa529c6ded495807ce57aa · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, true peak −1.5 dBFS, LRA 5.5 LU; music ducked under voice.

## Captions
- English only, ≤ 2 lines, pill x 109..971 / y 344..520, ink x 146..932 / y 373..497 → SPEC PASS (x 90–990, y 340–520).
- Top 300 px: scene only (DOCKET antenna) — no text or labels.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All six lines MATCH (also exact in small.en before render); every recognised word inside its caption window.
- No numbers are spoken; on-screen times/speeds are EXAMPLE values.
- Limitation: I cannot listen; audio is verified by ASR only. A human listen is recommended.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png)
- 0.4 s: the clear road ahead turns red with "jam ahead", ETA 18 → 26 min at 0.95 s; then live speeds → route lit
  "right now"; usual-by-hour chart + "you get there ≈ 6 pm" → predicted jam; push-in to the sudden crash, "ETA 34 min?";
  phone: leave-time picker, 5:30 ≈ 21 min vs 6:00 ≈ 31 min, ✓; CTA.
- Fixed before the full render: crash push-in framed too tight (ETA chip/tag clipped) → camera pulled back; "you get
  there ≈ 6 pm" chip overlapped the EXAMPLE tag → moved above the chart.

## Preservation
- Earlier MP4s unchanged (re-hashed before delivery; list in context/05).
