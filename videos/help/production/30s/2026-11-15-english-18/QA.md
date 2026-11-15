# QA — `help-30s-english18-01.mp4` (2026-11-15, batch 18) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `198bd1a31888e452fff08ad137bfafed2ea36e6a2aa3e14bfff06b2a82ab466e`, 14.9 MB. Thumbnail `help-30s-english18-thumbnail.png` (1080×1920 PNG, SHA-256 `6530d8f459e70306290fda5af52e33bee3fe6e1d9d475a55839baf5042aadc9b`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the split-roof hook at full lamp level: one sun; a dark roof with a glowing hot room under it and a white roof whose rays bounce away, each home with its resident; "SAME SUN. TWO ROOFS." (4 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Loudness | **−15.1 LUFS**, LRA 3.1 LU, **true peak −1.6 dBTP**; SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98 — synthesized fresh; no Hindi. Voice-only spelling "Mahilaa" (Kokoro mˈæhɪlˌɑː, first-syllable stress) for Mahila; "Ahmedabad" kept (ˈɑːmɪdɐbˌɑːd) | `src/script.json` (`tts`) |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the final mix recognises every English word; differences: "sun" → "son" (homophone), "plan" → "play lan" (split), Indian names not in its vocabulary ("Ahmedabad" → "ahmed abad", "Mahila" → "mahala"). One rewrite after an isolated ASR test: "the right coating" (heard "coding") → "suitable paint" | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–2.89 s · escalation 3.20–6.26 s · question 6.55–7.94 s · proof 8.30–20.44 s · payoff 21.30–25.17 s · CTA 27.10–29.67 s | `src/cues.json` |
| Captions | 12 cards from ASR word times (script-to-ASR alignment for the Indian names), no overlaps; every spoken word in exactly one card. Zone: ink **x 122–878, y 376–496** → **0 violations** in 24 checked frames | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | One idea per beat; labels 1–3 words (SAME SUN. TWO ROOFS., SOAKS UP HEAT → HEAT INSIDE, WHITE PAINT?, REFLECTS MORE → LESS HEAT IN, AHMEDABAD → LOW-INCOME HOMES (+ MAHILA HOUSING TRUST), HEAT ACTION PLAN, RESULTS VARY → PAINT + LABOUR → PRACTICAL TO FUND, LUCKNOW). The split-roof stage (A–D) is one continuous scene with camera moves; its labels are drawn in screen space so zooming never hides them | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Current Play listing icon (re-downloaded 2026-11-15) is byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4) | context 31 |

## Defects found and fixed (before the single full render)
- Zoomed beats hid their plaques (world-space y 700 fell outside the frame at 1.3×) → screen-space plaques on the zooming stage.
- The white roof read as pale grey under the multiplied hide texture → solid bright fill; the dark roof now glows hot while absorbing; rays longer and bolder
  (the split must read on a phone at frame 0).
- Payoff: the paint can's label was covered by the helper → props spaced out.

## Remaining limits
- No human listening pass (ASR + loudness only).
- No temperature drop is stated (per brief). EPA's page gives a range for non-air-conditioned homes and the Climate Group's Telangana case study gives
  another; both are noted in context 31 only. "Results vary" is said in the payoff.
- The heat-action-plan line is a reported statement (MHT's programme manager in Down To Earth); NRDC's own pages on the Ahmedabad programme
  refused automated fetches (403).
- Visuals are illustrative (fictional homes and residents); scene changes use the established slide + lamp dip.
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
