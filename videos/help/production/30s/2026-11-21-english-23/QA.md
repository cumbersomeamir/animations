# QA — `help-30s-english23-01.mp4` (2026-11-21, batch 23) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `105172870ef95a9ca62f9e08d75085616e13adff93952445f5cf2fb8f706dbf8`, 14.8 MB (14,844,253 bytes). Thumbnail `help-30s-english23-thumbnail.png` (1080×1920 PNG, SHA-256 `b981e418f462cfc98d185c1b3a7facf5f01ee779dfd3aea3018b3653b3a4e358`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames** (counted); audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | full decode to null output, exit 0, **0 error lines**; 900 video frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook at full lamp level (no fade, no logo): a wheelchair gift-wrapped in green and yellow with a bow, wheels showing, beside an upright measuring tape; plaque "A GIFT THAT DOESN'T FIT" (5 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Thumbnail | = frame 0 (plaque hidden) + "A GIFT THAT / DOESN'T FIT." + Help badge | `help-30s-english23-thumbnail.png` |
| Loudness | **−15.0 LUFS**, LRA 1.9 LU, **true peak −1.6 dBTP** (below the −1.5 limit); SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice / soundtrack | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98, synthesized fresh; established original pad + mallet motif + percussion accents, ducked under the voice; no Hindi. 86 words, 26.1 s of speech, ~0.45 s between sentences. Voice-only spellings: "W H O" (caption "WHO"), "program" (caption "programme") | `src/script.json`, `audio/mix30.py` |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the audio decoded from the final MP4 recognises the script; differences are homophones/weak forms only: "too" → "to", "and" → "a" (before "check back"), "W H O" spelled out (as intended) | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–2.23 s · superhook (too wide / too deep) 2.65–6.88 s · question 7.30–8.54 s · proof 8.95–21.20 s (WHO assess then fit; seat as wide as the hips; two fingers behind the knee; train and check back) · payoff 21.68–26.67 s · CTA 27.10–29.67 s | `src/cues.json`, `build/mix_info.json` |
| Captions | 14 cards from ASR word times (script-to-ASR alignment for "WHO"), no overlaps; every spoken word in exactly one card. Zone (2026-11-19 brief, kept): ink **x 126–874, y 316–436** → **0 violations** in 28 checked frames (rule x 100–900, y 280–460) | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | Contact sheet (frame 0 + every second) and every scene cut (−0.3 / 0 / +0.3 s) inspected on the final file. One headline at a time: A GIFT THAT DOESN'T FIT → TOO WIDE → TOO DEEP → WHAT MAKES IT FIT? → WHO: ASSESS FIRST → THEN FIT THE CHAIR → SEAT = HIP WIDTH → BEHIND THE KNEE → TWO FINGERS OF SPACE → TRAIN THE USER → CHECK BACK LATER → BEFORE YOU GIVE → ASK FIRST → SIZE + CONDITION → LUCKNOW. Vital elements kept left of x 900 (the knee magnifier spans x 560–880) | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Play listing re-downloaded 2026-11-22 ("Updated on Sep 15, 2026"): =s512 icon byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); the CTA draws that file. The listing links no App Store page | context 36 |

## Defects found and fixed
- First take: "Hip width sets the seat width" was heard as "have websites the seat with", and "follow up" as "fall low up" → nine alternatives tested in isolation; chosen "The seat should be as wide as the hips." and "Then train the user, and check back later."; "So before" avoided (batch-22 lesson). "WHO" voiced as letters.
- Stills pass: the wrapped chair crowded the tape and a stray dashed line crossed it → smaller gift, line removed; the front-to-side switch overlapped for 0.4 s → 0.2 s; the knee zoom put the torso under the headline and the gap was invisible (fitted seat depth equal to the thigh) → full-body view at normal scale with a magnifier lens on the knee, fitted seat depth shortened to leave a visible two-finger gap, fingers slide into the gap; the SIZE / CONDITION slip overlapped the gift → moved right.
- All QA above was run on the final file.

## Remaining limits
- No human listening pass and no real-time viewing (ASR + loudness + frame sheets only).
- The video shows WHO's basic-level sizing for a user without postural support needs; people who need postural support need an intermediate-level assessment (WHO WSTP). It is general information, not medical advice.
- India's ADIP scheme (assessment camps before distribution, implemented with ALIMCO and others) is in the notes only: the scheme document covers 1 Apr 2022 – 31 Mar 2026 and its continuation after that date was not confirmed, so it is not named in the video.
- People and chairs are illustrative; the proportions are exaggerated so the two-finger gap is visible; no beneficiary is shown or invented; no cure is promised. Help does not supply wheelchairs or medical devices.
- Two 0.3 s scene fades overlap their neighbours, and a 0.3 s blur-in at 26.6 s overlaps the payoff with the CTA (the established CTA transition).
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
