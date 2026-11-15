# QA — `help-30s-english15-01.mp4` (2026-11-15) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `bc2eeb24f39edaf1e8bead553ee67c60105695a747a408018ea1104b3b22cdb8`, 14.0 MB. Thumbnail `help-30s-english15-thumbnail.png` (1080×1920 PNG, SHA-256 `3a75539fc935b58165b06995bded0624ce1801ab07a262c48896b1bf45619716`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook image at full lamp level (no fade from black, no logo, no empty set-up): an empty classroom seat, an open, empty steel lunchbox on the desk, "THE EMPTY SEAT" (3 words); no caption on frame 0 (first card fades in from 0.07 s); narration starts at 0.10 s | `qa/frame-000.png`, `src/cues.json` |
| Loudness | **−15.4 LUFS**, LRA 2.3 LU, **true peak −1.8 dBTP**. The first mux measured −1.4 dBTP (over the −1.5 limit) → audio re-encoded 0.3 dB lower; video stream copied, MD5 unchanged (`qa/video-stream-md5.txt`). SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98 — synthesized fresh; no Hindi; no reused narration | `audio/voice/sentences.json` |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the final mix recognises the script, first word included ("an" at 0.09 s); differences: the name "Asha" → "a shar" (proper noun), "Two" → "to", "in" → "and", "reading" → "re eating", "maths" → "math" | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–3.08 s · escalation 3.40–6.68 s · question 7.00–8.69 s · proof 9.05–21.03 s (3 scene changes) · payoff 21.50–25.50 s · CTA 27.10–29.67 s | `src/cues.json` |
| Captions | 15 cards from ASR word times (one spurious token dropped in three sentences; sentence 2 proportional because of the name), no overlaps; every spoken word in exactly one card. Zone: ink **x 164–836, y 376–496** (rule x 100–900, y 230–1500) → **0 violations** in 30 checked frames | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | One idea per beat; labels 1–3 words (THE EMPTY SEAT, FICTIONAL EXAMPLE → NO LUNCH → STAYS HOME, ? → READY TO LEARN?, MIDDAY MEAL → FREE + HOT → GOVERNMENT SCHOOLS, TWO STUDIES → ATTENDANCE UP → YOUNGEST MOST, YEARS OF MEALS → BETTER LEARNING, NOT ONE LUNCHBOX → THE WHOLE CLASS, LUCKNOW); no paragraph cards; every tick lands before its scene's slide-out | `qa/contact-sheet.png`, `qa/scene-transitions.png` (from the first mux; identical video stream) |
| Icon | Current Play listing icon (re-downloaded 2026-11-15, after the render, before commit; listing "Updated on Sep 15, 2026") is byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); no App Store listing found | context 28 |

## Defects found and fixed
- Frame-0 lunchbox read as a grey block, then as a "laptop" → redrawn as a round steel dabba with a dark, empty inside and the lid leaning against it.
- Distant school in the escalation read as a floating desk → small "SCHOOL" building.
- Three tick badges fell inside their scenes' slide-outs → moved earlier (visual only; no tick sounds on spoken words).
- First caption card started at −0.03 s (visible on frame 0) → clamped to 0.07 s. True peak −1.4 dBTP → audio-only re-encode at −0.3 dB.

## Remaining limits
- No human listening pass (ASR + loudness only).
- The official PM POSHAN pages (pmposhan.education.gov.in, eparlib.sansad.in) dropped every connection from this session (relay "tunnel closed"); the
  programme is described from the peer-reviewed papers (free cooked lunch in government primary schools). The current name and class range are not
  stated in the video.
- The studies are quasi-experimental (staggered roll-out / difference-in-differences) in specific settings; the script says "found" for two local
  attendance studies and "linked to" for learning, with no effect sizes.
- Scene changes use the established slide + lamp dip; at ±0.15 s of a boundary the stage is briefly mostly empty.
- Visuals are illustrative; Asha is fictional; the four filled seats and the year steps are not data.
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
