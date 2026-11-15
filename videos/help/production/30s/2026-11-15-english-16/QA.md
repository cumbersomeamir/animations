# QA — `help-30s-english16-01.mp4` (2026-11-15, batch 16) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `aa258415ebb7acb5d7c6c6a0c29412bbc45e9e9d3ec19268a06f33f6af75b7aa`, 14.0 MB. Thumbnail `help-30s-english16-thumbnail.png` (1080×1920 PNG, SHA-256 `3c183d8c161763931200f085ef8dd52f4b24f8e10e3d1217374d264b0129d816`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook image at full lamp level (no fade, no logo, no empty set-up): a closed door with an "ADDRESS ?" plate and a person holding a PROOF OF ADDRESS form with an empty box, under "NO ADDRESS, NO ACCESS?" (4 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Loudness | **−15.1 LUFS**, LRA 2.6 LU, **true peak −1.6 dBTP**; SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98 — synthesized fresh; no Hindi. Pronunciation-only spellings for the voice (captions keep the official spelling): "Aadhar" (Kokoro phonemes ˈɑːdhɑːɹ, first-syllable stress) for Aadhaar, "tehseeldar" (tˈeɪsiːldˌɑːɹ) for tehsildar, "twenty twenty-four" for 2024; "UIDAI" is not spoken (dotted letters added pauses; the name is on screen) | `src/script.json` (`tts`), `audio/voice/sentences.json` |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15, English vocabulary) recognises every English word on the final mix; it cannot recognise the Indian terms ("Aadhaar" → "odd hard"/"odd her", "tehsildar" → "tasty old are"), so their pronunciation was chosen from Kokoro's phoneme output instead of by ear. Homophones: "councillor" → "counselor", "ask" → "asked" | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–3.59 s · escalation 3.90–8.66 s · question 9.00–10.54 s · proof 10.95–20.61 s · payoff 21.30–25.32 s · CTA 27.10–29.67 s | `src/cues.json` |
| Captions | 13 cards; timing from ASR, with script-to-ASR sequence alignment where Indian terms/numbers split into extra tokens (new in `tools_captions.py`); no overlaps; every spoken word in exactly one card. Zone: ink **x 152–848, y 376–496** → **0 violations** in 26 checked frames | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | One idea per beat; labels 1–3 words (NO ADDRESS, NO ACCESS?, PROOF OF ADDRESS → ASSUMES A HOME, ?, UIDAI LIST, 2024 → CERTIFICATE → STANDARD FORMAT, SIGNED BY → ANY ONE, NOT AUTOMATIC → A REAL ROUTE → ASK THE COUNCILLOR, LUCKNOW); ticks land before slide-outs | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Current Play listing icon (re-downloaded 2026-11-15, before this render) is byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4) | context 29 |

## Defects found and fixed
- First voice take: "For Aadhaar" sounded like "fraud hard" to ASR, "UIDAI's" was read "you-id-eye", "2024" as "two thousand twenty four" →
  pronunciation-only `tts` spellings chosen from Kokoro phonemes; "UIDAI" moved to the screen.
- Hook door: the address plate disappeared into a carved lattice and the multiplied wood rendered almost black → solid wood door, bright plate.
- Payoff door opened onto darkness (frame path filled the doorway) → frame drawn as bars; warm light in the opening.
- Two caption cards ran up to 0.8 s early (proportional fallback) → script-to-ASR sequence alignment.
- Accuracy: "Most proofs of address assume a home" overstated the list (home-linked bills/tenancy papers are 7 of ~18 address proofs) → "Many";
  line re-voiced, video re-rendered, all QA repeated on the final file.

## Remaining limits
- No human listening pass; Indian terms could not be checked by ASR (phoneme-based choice only).
- uidai.gov.in could not be reached (connection resets / 404 / 503). The rules come from the February 2024 Schedule II, read from an official copy
  hosted by the Government of Goa; UIDAI's site reportedly lists a June 2026 revision that could not be read — the script therefore says "2024 list".
- The certificate is proof of **address** only (not identity) and is issued at the official's discretion; the video says "not automatic" and the post
  copy states the scope. Visuals are illustrative; the person is fictional.
- At ±0.15 s of a scene boundary the stage is briefly mostly empty (established slide + lamp-dip transition).
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
