# QA — `help-30s-english17-01.mp4` (2026-11-15, batch 17) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `b1463217e515bc69c1d630f426ec9808c2826cc1fc19895e94227a6ddd664fe5`, 13.7 MB. Thumbnail `help-30s-english17-thumbnail.png` (1080×1920 PNG, SHA-256 `aa4636a7600291c2d235c2d4ff204084c0e5181970f91e73e0a374452b5f633a`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook image at full lamp level (no fade, no logo, no empty set-up): close-up of a wheelchair user stopped at one lit step below a door, under "ONE STEP. ZERO ACCESS." (4 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Loudness | **−15.1 LUFS**, LRA 2.2 LU, **true peak −1.7 dBTP**; SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98 — synthesized fresh; no Hindi. Voice-only spellings: "one in twelve" for "1 in 12", "one point eight" for "1.8" | `src/script.json` (`tts`) |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the final mix recognises every word; differences are spelling/homophones only: "centimetre/metre" → US spelling, "may be" → "maybe", "non-slip" → "non slip" | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–2.80 s · question 3.10–4.81 s · proof 5.10–20.66 s (standard → to-scale 1:12 → 15 cm step ≈ 1.8 m ramp → handrails/non-slip/landing) · payoff 21.00–25.84 s · CTA 27.10–29.67 s | `src/cues.json` |
| Captions | 15 cards from ASR word times (script-to-ASR alignment where spellings differ), no overlaps; every spoken word in exactly one card. Zone: ink **x 129–871, y 376–496** → **0 violations** in 30 checked frames | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | One idea per beat; labels 1–3 words (ONE STEP. ZERO ACCESS., HOW GENTLE?, INDIA'S STANDARD → MAX 1 IN 12, GENTLE BY DESIGN, 15 CM STEP → 1.8 M RAMP, HANDRAILS → NON-SLIP → LEVEL LANDING, GIVING A WHEELCHAIR? → CHECK THE DOORSTEP → FUND THE RAMP, LUCKNOW). The 1-in-12 diagram and the 15 cm → 180 cm ramp are drawn to scale (4 px/cm); the house scenes are one continuous stage | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Current Play listing icon (re-downloaded 2026-11-15) is byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4) | context 30 |

## Defects found and fixed (before the single full render)
- Frame 0: the plaque cut through the rider's head and the step read as a patterned band → camera pushed onto the step (1.4×), a warm spot on a
  plain stone step, plaque raised; re-checked frame 0 after each change.
- Ramp scenes: the door sat on the frame edge → house moved left; landing highlight made visible; the donor figure was dropped from the payoff
  (it crowded the ramp) — the labels carry the donor takeaway while the rider rolls up independently.

## Remaining limits
- No human listening pass (ASR + loudness only).
- The 2021 Harmonised Guidelines (MoHUA) could not be read here (host 503; mirrors failed TLS verification or reset — not worked around). The rule is
  taken from the Bureau of Indian Standards' IS 4963:1987 (primary, via Public.Resource.Org) and cross-checked with an October 2021 barrier-free
  reference from the College of Engineering Trivandrum (secondary) that gives 1:12 for 150–750 mm rises.
- 15 cm is an illustrative step height; "about 1.8 metres" is the arithmetic 15 × 12 = 180 cm. Construction details (widths, landing sizes, handrail
  extensions) are not taught — the payoff says "a proper ramp" and the post copy says to use qualified builders.
- Scene changes use the established slide + lamp dip (brief mostly-empty frames at ±0.15 s of a boundary).
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
