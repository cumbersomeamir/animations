# QA — `help-30s-communityfridge-01.mp4` (2026-11-11) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `13a2097849eef2bd8c66d61344c02b56eae15bbeee37fc0d90b1ec02349060fb`, 13.7 MB. Thumbnail `help-30s-communityfridge-thumbnail.png` (1080×1920 PNG, SHA-256 `3e057d844db4d36eeb839821fcd8a01e5613f7caa5b44fd0e29c4b60cf51c63f`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.1 LUFS**, LRA 1.8 LU, **true peak −1.6 dBTP**; music ducked (0.72) under speech, no broadband SFX on words | `qa/loudness.txt` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98 — synthesized fresh; no Hindi | `audio/voice/sentences.json` |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the final mix recognises every scripted word; differences are homophones/splits only: "two"→"to", "UK's"→"u k's", "safe"→"save" (end of the question; the "SAFE?" label carries it, and "safe" is recognised in the payoff), plus one breath token. | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.25–3.48 s · escalation 3.75–6.35 s · question 6.65–9.24 s · proof 9.55–20.34 s (3 scene changes) · payoff 21.00–25.73 s · CTA 27.10–29.67 s | `src/cues.json` |
| Captions | 14 cards from ASR word times (two lines proportional), no overlaps; every spoken word in exactly one card. NEW zone: ink **x 122–878, y 376–496** (rule x 100–900, y 230–1500) → **0 violations**; ≤ 2 lines | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | One idea per beat; labels 1–3 words (NO CASHIER, TWO PROBLEMS, WASTE / NEED, STOCKED? / SAFE?, UK NETWORK, SURPLUS IN, HOST → VOLUNTEERS → SAFETY RULES revealed in turn, NOT ONE PHOTO → SAFE + SUITABLE → EVERY DAY, LUCKNOW); no paragraph cards; every scene boundary keeps its anchor props | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Current Play listing icon (re-downloaded 2026-11-11, listing "Updated on Sep 15, 2026") is byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); no App Store listing found | context 25 |

## Defects found and fixed (before the single full render)
- Hook labels clipped by the opening zoom → placed lower; "COMMUNITY FRIDGE" sign overflow → smaller type; empty stage at the real-model beat →
  central fridge + plaque arrive with the scene; thumbnail duplicated the in-scene label and its badge rendered dark → earlier frame, solid badge.

## Remaining limits
- No human listening pass (ASR + loudness only).
- Hubbub's own pages and the LGA case study refused automated fetches (403); the model is sourced from ChangeX (Hubbub partner page), Freedge and
  the City of Boston toolkit. Specific operating rules (temperature checks, accepted foods) are not claimed.
- Visuals are illustrative diagrams (no real photographs of the initiative were licensed or used).
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
