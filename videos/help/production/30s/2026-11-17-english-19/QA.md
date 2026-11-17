# QA — `help-30s-english19-01.mp4` (2026-11-17, batch 19) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `d691315b9a668f133542f6680e2cb740a13d823078012fe1d435d97b1a56727b`, 13.9 MB. Thumbnail `help-30s-english19-thumbnail.png` (1080×1920 PNG, SHA-256 `3310b7918bf3b87c9912a0213ef7a4e69d6374693bb9812e1235891673e209e1`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook at full lamp level: a steel plate heaped with rice, a few creamier fortified kernels among them, a hand pinching one; "WHY THIS GRAIN?" (3 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Loudness | **−15.0 LUFS**, LRA 1.9 LU, **true peak −1.5 dBTP** (at the limit); SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98 — synthesized fresh; no Hindi. Voice-only spellings: "Naagaaland's" (nˈɑːɡɑːləndz), "vitamin B twelve", "twenty twenty-four" | `src/script.json` (`tts`) |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the final mix recognises the script; differences: "ration" → "rash and" (an earlier take recognised "ration"), "kernel" → "colonel" (homophone), "Nagaland's" → "nah garlands"/"nagaland" (name) | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–3.25 s · escalation + question 3.55–6.25 s · proof 6.55–20.05 s (how it's made, nutrients, lab test) · scale 20.35–23.34 s · payoff 23.64–26.06 s · CTA 27.10–29.67 s | `src/cues.json` |
| Captions | 14 cards from ASR word times (script-to-ASR alignment where needed), no overlaps; every spoken word in exactly one card. Zone: ink **x 124–876, y 376–496** → **0 violations** in 28 checked frames | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | One idea per beat; labels 1–4 words (WHY THIS GRAIN?, VIRAL CLAIM → SO WHAT IS IT?, FORTIFIED KERNEL → RICE FLOUR → + NUTRIENTS → RICE-SHAPED, WHAT IT ADDS, FOOD LAB → VIRAL SAMPLE → NOT PLASTIC, SINCE 2024 → GOVT SCHEMES, DON'T PICK THEM OUT → COOK THEM TOO, LUCKNOW) | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Play listing re-downloaded 2026-11-17 ("Updated on Sep 15, 2026"): icon byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4) | context 32 |

## Defects found and fixed
- First voice draft ran 28.4 s → three lines shortened; the hook re-taken until "grain" and "ration" were recognised in isolation.
- The schemes' labels floated far above their objects → lowered beside them.
- The first full render had an empty frame at 20.2 s (the schemes scene's sack scaled in late) → the sack now anchors the scene from its slide-in;
  re-rendered and all QA repeated on the final file.

## Remaining limits
- No human listening pass (ASR + loudness only).
- The lab test is one documented case (Nagaland, June 2021, reported by Nagaland Post and hosted by FSSAI); FSSAI's own FAQ and the Goa clarification
  could not be fetched (502/403). The expert debate about mandatory fortification is not covered; the video claims only what the kernels are and what
  they contain.
- Visuals are illustrative; scene changes use the established slide + lamp dip.
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
