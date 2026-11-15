# QA — ideaverse-30s-english17-01.mp4 (English, batch 2026-11-15-english-17 / batch17)
sha256 3b16f0c9233643afcd01b03ddfaa496241fac3fa515f82f1e70ffde0432b98f0 · thumbnail `ideaverse-30s-english17-01-thumbnail.png`
(1080x1920 PNG, sha256 b25318bfda9cfbc8cec3dc2cf83959087be0b48e184df6e42a8348c73a51696a) · evidence in `qa/`
(regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, true peak −1.9 dBFS; music ducked under voice; chimes sit in
  pauses after "How?", "already took.", "sharper frame." and "yourself."; capture ticks are quiet.

## Captions (2026-11-11 safe area)
- English only, ≤ 2 lines, 60 px; pill x 138..862 / y 344..520, text ink x 178..825 / y 373..497 → SPEC PASS (inside
  x 100..900, y 230..1500). Top 300 px: scene only (DOCKET's antenna, the easel corner) — qa/top-band-strips.png.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH; every recognised word inside a caption that shows it (qa/asr-narration.txt).
- Fixed: the first QA pass found "but your" (1.09–1.17 s) still under the first caption → its boundary moved from 1.25 s
  to 1.05 s; frames 28–47 re-rendered (only those changed), re-encoded and re-checked.
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, key frames, thumbnail)
- Frame 0: DOCKET holds a phone with a sharp mid-air jump, an amber touch dot on the shutter, BEFORE YOU CLICKED (no fade-in,
  no logo). Ring: new frames written as it turns, NOW at the front, older frames dim; the press sends the latest frames
  into one landing photo; card: 7 frames around the press, ±1.5 s, scan and ✓ on the mid-air frame; phone: touch dot drags
  back to the jump, "Use this frame", ✓; CTA.
- Fixed during review (stills before the full render): card frames rendered empty (missing translate); result card too
  large; phone hid DOCKET's face → lowered; mitten hands could not reach the screen precisely → both hands hold the phone
  and touches are drawn as an on-screen touch dot; hook shutter sat under the label → moved up; ✓ hidden by a hand → moved.
- Known minor: the ±1.5 s card is empty for ~0.15 s after its cut (11.0 s) before the first frame appears.
- Process note: the session worker restarted after the frame render finished; all 900 frames were intact and the build
  continued from encoding.

## Content
- Sources and claim types in context/32 (Google Research Night Sight + Top Shot posts; Pixel Camera Help; Apple Live Photos
  support). The buffer mechanism and the Top Shot model are told apart; no Ideaverse camera feature is implied.

## Preservation
- All 22 earlier MP4s re-hashed unchanged.
