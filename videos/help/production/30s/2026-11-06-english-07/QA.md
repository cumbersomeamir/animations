# QA — `help-30s-english07-01.mp4` (english-07, 2026-11-06) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `e6038f558780092ef1c0161e5e7a28eb09a205e49c90078642e6d71481110134`, 14.4 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.1 LUFS**, LRA 2.1 LU, **true peak −1.7 dBTP**; music well under the voice | `qa/loudness.txt` |
| Voice | Approved Meshline character, synthesized fresh: Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 (no Hindi audio, no imitation) | `audio/voice/sentences.json` |
| Intelligibility ("listening") | **ASR-only limitation:** I cannot hear audio. Offline English ASR (Vosk small-en-us-0.15, QA-only) on the final mix recognises **all 71 words** (homophones only: its/it's, cheque/check, then/than). | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Narration ↔ captions | 9 lines at 0.25 / 3.75 / 7.20 / 10.45 / 14.55 / 18.05 / 20.70 / 24.10 / 26.05 s; 16 cards from ASR word times (line 6 proportional), no overlaps; assert: every spoken word in exactly one card; CTA caption 25.89–29.70 s | `src/captions.json`, `tools_captions.py` |
| Caption bounds | 16 cards, 32 frames measured in-page: ink **x 112–968, y 376–496** (rule x 90–990, y 340–520) → **0 violations**; ≤ 2 lines; y < 300 clear | `qa/caption-bounds.json` |
| Picture / transitions | Hook: tin pushed in at 0–0.35 s with "CASH NOW!", PAUSE at 2.1 s. Each check is demonstrated (name search with "+ scam/+ complaint" chips → results; ID card number matched in the OFFICIAL REGISTER; CASH/GIFT CARD/WIRE ✗ into a "NO" bin, CARD/CHEQUE ✓, RECORD slip), then "NO RUSH" → give later, directly to a checked group, recap ✓✓✓, CTA. No recipients shown; the collector is only a neutral hand. | `qa/contact-sheet.png`, `qa/scene-transitions.png` |

## Defects found and fixed (one fix round)
- Stills: PAUSE plaque clipped by the hook zoom; "FICTIONAL EXAMPLE" overflowed its plaque.
- Render 1: empty stage at the name → registration hand-off (10.2 s); PAUSE overlapped the "CASH NOW!" card; "CHECKED GROUP" label clipped by its tick
  → ID card + register now slide in with the scene, plaques separated, label widened; re-rendered once (audio unchanged).
- Script: first draft ran 26.9 s of speech → two lines shortened.

## Remaining limits
- No human listening pass (English ASR + loudness only).
- Recap ticks inside speech are visual only (deliberate; tick sounds sit in pauses).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.
