# QA — ideaverse-30s-english08-01.mp4 (English, batch 2026-11-07-english-08)
sha256 b35eee9815c48dd89dc5fbbcd3d137535da2da430cee81c58ba31a0cff69e842 · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical (qa/ffprobe.json, decoded-video-frames.txt, full-decode.log, loudness.txt)
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS integrated, true peak −1.5 dBFS, LRA 4.8 LU; music ducked under voice.

## Captions (qa/caption-geometry.json → caption-bounds.txt, top-band-strips.png)
- English only, ≤ 2 lines, pill x 95..985 / y 344..520, ink x 132..945 / y 373..497 → SPEC PASS (x 90–990, y 340–520).
- No overlay drawn above y 340; top 300 px montage shows only scene elements (DOCKET antenna, easel frame edge) — no text/labels.

## English audio ↔ captions (qa/asr-narration.txt, faster-whisper base.en on the final MP4)
- All six lines MATCH the script; every recognised word falls inside the caption window that shows it.
- Voice: approved Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98 (fresh synthesis; no Hindi or older audio reused).
- Pronunciation: line 1 "A phone lens this tiny…" was heard as "lends" by base.en and small.en → reworded to
  "A tiny phone lens can't really…" (exact in both). small.en also exact on s2–s5.
- Limitation: I cannot listen; intelligibility/timing are verified by ASR only. A human listen is recommended.

## Picture review (qa/contact-sheet-full.png = every second, qa/contact-sheet-transitions.png = frames around every cut)
- 0–0.9 s hook: mint scan line sweeps the photo; background blurs and lights bloom into bokeh from 0.2 s.
- Each beat matches its words: lens ring + TINY LENS; point at photo; "?"; flip to ORIGINAL; AI trace → person mask;
  depth layers near→far + legend; blur by depth + meters, far bar amber, bokeh pulse; close-up rings + chips on hair and
  sunglasses, dashed edge check; edit screen: blur layer lifts off, slider down, portrait OFF → sharp, back ON low; CTA wave + icon.
- Fixed during review: hook phone was off-frame → held in front of DOCKET's chest, camera reframed; close-up chips clipped
  → moved inside the frame; "?" label sat in the top 300 px → moved beside DOCKET's head (re-rendered frames 108–132);
  1-frame caption gap at 14.23 s → caption 5 extended to 14.25 (re-rendered 420–428).
- Known minor: the ON/OFF switch label flips 0.1 s after the photo changes (22.62 s, 24.1 s) — 3–6 frames, left as is.

## Content
- Claims and sources: context/23 (Google Research Pixel 2 portrait-mode post; Apple "Edit Portrait mode photos"; Google
  Photos Help). Photo, mistakes and screens are labelled EXAMPLE. CTA "Download the Ideaverse app" — no Ideaverse feature claim.
- Publishing caption (publishing-caption.txt) = final transcript, Ideaverse only, no editing instructions.

## Preservation
- All 13 earlier MP4s re-hashed unchanged (pilot-01 2886236d…, 15 s test f10ebf29…, production-01 c5ababf6…, 02 8b301679…,
  03 fc6836f0…, feedback-01 3806e0ea…, round02-01 3bc06d64…, hindi03-01 97aef888…, meme-01 669848f7…, hindi04-01 718b32cb…,
  feedback05-01 ea5687f2…, english06-01 030a2de6…, english07-01 b24aad7c…).
