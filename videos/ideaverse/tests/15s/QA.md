# QA — Ideaverse 15 s kinetic-reel style test (CHECKPOINT, 2026-11-02)

Status: **encoded and automatically checked; visual fix pass NOT completed.** Checkpointed (not trimmed, not relabelled)
when the user moved to the educational pilot direction (context/08–10).

## Automated checks (qa/)
- ffprobe (qa/ffprobe.json): duration 15.000000 s; H.264 High 1080x1920 yuv420p 30/1; AAC 48 kHz stereo, 15.000 s.
- Decoded video frames: 450 (qa/decoded-video-frames.txt). Full FFmpeg decode: OK, no errors (qa/full-decode.log).
- Loudness (qa/loudness.txt): integrated −13.5 LUFS, peak −1.7 dBFS. Per-section RMS in qa/section-rms.txt.
- Narration ASR (faster-whisper base.en on the mix): all five lines recognised; "Ideaverse" heard as "idea verse".

## Visual review (contact sheet qa/contact-sheet.png, one pass)
- OK: opening has motion on frame 0; bulb → grid → scan → card chain readable; iris / zoom / slats transitions land;
  end card name + CTA legible and held 13.0–15.0 s.
- KNOWN ISSUE (unfixed): hard cut at 12.0 s shows ~2 near-empty mint-flash frames (f360–f362) before the icon grows —
  the skill warns against empty frames on a cut. Fix would be: start the icon at ~60 % scale on the cut, lower the flash.
- Not done: per-transition strips review (generated in qa/transition-*.png but not inspected), full-res text-collision pass.
