# QA — `help-30s-english13-01.mp4` (2026-11-13) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `ec4d5ded9706b9aebb4da1fd34915ce88c68c5a47a02a731fcac9489dcf8b538`, 14.1 MB. Thumbnail `help-30s-english13-thumbnail.png` (1080×1920 PNG, SHA-256 `7c8ac40aac9a0d06ceb0e1b6a051d045037a66983bcf8e99bb7652956596b4e2`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.0 LUFS**, LRA 3.2 LU, **true peak −1.5 dBTP** (at the −1.5 limit); music ducked (0.72) under speech; SFX only in pauses (gong, clap, tin thump, glide, ticks, logo chime) except one soft low tin thump at 2.1 s | `qa/loudness.txt`, `audio/mix30.py` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98 — synthesized fresh; no Hindi; no reused narration | `audio/voice/sentences.json` |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the final mix recognises every scripted word; differences are homophones only: "No"→"know", "too"→"two". Two lines were rephrased after isolated ASR tests ("But won't…" lost "But"; "And they skip food…" lost "And" and heard "skip food" as "skip through"). | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.35–2.77 s · escalation 3.20–5.75 s · question 6.15–7.67 s · proof 8.15–19.75 s (3 scene changes) · payoff 20.95–25.68 s · CTA 27.10–29.67 s | `src/cues.json` |
| Captions | 17 cards from ASR word times, no overlaps; every spoken word in exactly one card. Zone: ink **x 123–877, y 376–496** (rule x 100–900, y 230–1500) → **0 violations** in 34 checked frames; ≤ 2 lines | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | One idea per beat; labels 1–3 words (LIKE A SHOP, NO PACKED BAGS → PEOPLE PICK, ? → TOO MUCH?, THE OPPOSITE → TOO LITTLE, SKIP IT → LESS WASTE, CONNECTICUT TRIAL → FOOD SECURITY, NOT A LUXURY → FOOD THAT FITS → RESPECT, LUCKNOW); no paragraph cards; no decorative lines (the only dashed shapes are the "missing food" outlines in the basket) | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Current Play listing icon (re-downloaded 2026-11-13; listing "Updated on Sep 15, 2026") is byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); no App Store listing found | context 26 |

## Defects found and fixed (before the single full render)
- Hook label overlapped the "FOOD BANK" sign under the opening zoom → label raised (y 750), shelf moved right; shelf "swing" removed (read as wobbling furniture).
- Trial scene opened on an empty stage for ~1.5 s → pedestals and the "CONNECTICUT TRIAL" plaque now arrive with the scene; right group moved off the frame edge.
- "Less waste" tick fell inside the scene's slide-out → tick moved earlier (visual only; its SFX removed).
- Right-hand shelf in the "too little" scene clipped by the frame → moved left.

## Remaining limits
- No human listening pass (ASR + loudness only). True peak sits exactly at the −1.5 dBTP limit.
- Scene boundaries use the established slide + lamp-dip: at ±0.15 s of a boundary (e.g. 14.93 s, 20.5 s) the stage is briefly mostly empty while one scene leaves and the next arrives.
- The Freshplace result belongs to the whole programme (choice pantry + coaching + referrals) in one randomised trial; the script says "choice plus coaching" and shows no effect size.
- Visuals are illustrative diagrams; no real photographs of Freshplace or other pantries were used. The NUTS jar is an illustrative example of food someone can't eat.
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
