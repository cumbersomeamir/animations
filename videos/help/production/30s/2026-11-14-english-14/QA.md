# QA — `help-30s-english14-01.mp4` (2026-11-14) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `cbe47f199d217fe837ba1aee14226661ba48250ccff5c5d30d74d41868beccbb`, 14.8 MB. Thumbnail `help-30s-english14-thumbnail.png` (1080×1920 PNG, SHA-256 `a4be671de06ae5e0e31d0e667fb398ac6475c216b13d2e6bf290c1e80129d1e1`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.0 LUFS**, LRA 2.2 LU, **true peak −1.6 dBTP**; music ducked (0.72) under speech; SFX only in pauses (gong, rope-snap click, glide, ticks, logo chime) | `qa/loudness.txt`, `audio/mix30.py` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98 — synthesized fresh; no Hindi; no reused narration | `audio/voice/sentences.json` |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the final mix recognises the script; differences are homophones/near-homophones only: "too"→"to", "their share"→"the share", "subsidised"→"subsidized" (spelling). Four lines were rephrased after isolated ASR tests (a dropped sentence-initial "A"/"And", "at"→"that"). | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.35–2.71 s · escalation 3.15–6.38 s · question 6.85–9.53 s · proof 10.00–20.67 s (5 scene changes) · payoff 21.45–25.34 s · CTA 27.10–29.67 s | `src/cues.json` |
| Captions | 17 cards from ASR word times (one extra ASR token dropped in two sentences), no overlaps; every spoken word in exactly one card. Zone: ink **x 128–872, y 376–496** (rule x 100–900, y 230–1500) → **0 violations** in 34 checked frames; ≤ 2 lines | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | One idea per beat; labels 1–3 words (ONE SHOP ONLY, MOVE FOR WORK → LEFT BEHIND, NEW CARD? → MONTHS → ?, ONE NATION, ONE RATION CARD, SAME CARD → ACROSS INDIA, FINGERPRINT → IT'S YOU, BACK HOME → THEIR SHARE, FAR FROM HOME → TELL THEM → IT TRAVELS, LUCKNOW); no paragraph cards; no maps or decorative lines | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Current Play listing icon (re-downloaded 2026-11-14; listing "Updated on Sep 15, 2026") is byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); no App Store listing found | context 27 |

## Defects found and fixed
- Fingerprint scene: the pressing arm (from above) covered the terminal's screen, and the ✓ landed inside the slide-out → hand now comes from
  the lower right; the scene holds 0.4 s longer (later lines shifted; re-mixed and re-captioned).
- Hook + thumbnail: the gripping fingers covered "RATION" on the card → the hand grips the card's left edge (found on the first full render's
  thumbnail; video re-rendered, all QA repeated on the final file).

## Remaining limits
- No human listening pass (ASR + loudness only).
- Primary source is the Department of Food & Public Distribution / PIB booklet dated April 2023; PIB press pages refused automated fetches (403), so
  no 2025–26 official release was read. Secondary reports describe the system operating in 2024–26; the script states only the mechanism (no counts).
- At ±0.15 s of a scene boundary the stage is briefly mostly empty while one scene slides out and the next slides in (established transition).
- Visuals are illustrative diagrams; the worker and family are fictional. The calendar (JAN → MAY) illustrates "months", not a measured delay.
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
