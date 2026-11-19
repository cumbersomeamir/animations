# QA — `help-30s-english22-01.mp4` (2026-11-19, batch 22) — English narration + captions

All checks on the **final exported MP4** (second render, after the 11.67 s cut fix). SHA-256 `4405191782759b8b68769bea14ec7d31240b3983d8d800ea714b4f6035e813df`, 14.3 MB (14,266,557 bytes). Thumbnail `help-30s-english22-thumbnail.png` (1080×1920 PNG, SHA-256 `ab9f796c2f71405bf4cb20196498f99130dfb464e1783a8a0c0976d9876e81c6`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames** (counted); audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | full decode to null output, exit 0, **0 error lines**; 900 video frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook at full lamp level (no fade, no logo): a hospital receipt "TREATMENT ₹0" with a green FREE stamp, and a second stub tucked behind it with a red "₹?" and a bus; plaque "FREE. BUT NOT FREE." (4 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Thumbnail | = frame 0 (plaque hidden) + "FREE. / BUT NOT FREE." + Help badge | `help-30s-english22-thumbnail.png` |
| Loudness | **−15.1 LUFS**, LRA 2.5 LU, **true peak −1.6 dBTP** (below the −1.5 limit); SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice / soundtrack | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98, synthesized fresh; established original pad + mallet motif + percussion accents under the voice (ducked); no Hindi. 78 words, 26.2 s of speech, 0.4 s between sentences | `src/script.json`, `audio/mix30.py` |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the audio decoded from the final MP4 recognises every script word; one extra token "so" before "somewhere" in the whole-track pass (the sentence decoded alone and a 3.6 s window cut from the track both read "or somewhere to stay") | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–2.81 s · superhook (lost wages) 3.20–4.83 s · question 5.20–6.91 s · proof 7.30–21.03 s (NFHS-5 transport barrier, JSSK free transport, charities) · payoff 21.45–26.03 s · CTA 27.10–29.67 s | `src/cues.json`, `build/mix_info.json` |
| Captions | 16 cards from ASR word times, no overlaps; every spoken word in exactly one card. **This brief's zone** (upper captions y 280–460, x 100–900): ink **x 139–861, y 316–436** → **0 violations** in 32 checked frames | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | Contact sheet (frame 0 + every second) and every scene cut (−0.3 / 0 / +0.3 s) inspected on the final file. One headline at a time (1–4 words): FREE. BUT NOT FREE. → + A DAY'S WAGES → WHAT GETS THEM THERE? → INDIA'S POOREST → OVER 1 IN 3 WOMEN → TRANSPORT: BIG PROBLEM → PREGNANT WOMEN → + SICK INFANTS → FREE TRANSPORT → AND HOME AGAIN → SOME CHARITIES → COVER TRAVEL → OR SOMEWHERE TO STAY → BEFORE MORE THINGS → ASK A VERIFIED GROUP → TRAVEL HELP? → LUCKNOW. Vital elements kept left of x 900 | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Play listing re-downloaded 2026-11-19 ("Updated on Sep 15, 2026"): =s512 icon byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); the CTA draws that file. The listing links no App Store page | context 35 |

## Defects found and fixed
- ASR on the first take: "Nor is a lost day's wage" → "nor the last days wage"; "or a place to stay" → "or apply nice to stay"; "So before donating" → "sober for donating" → ten alternatives tested in isolation; chosen: "Nor is losing a day's wages.", "or somewhere to stay", "Before you donate more things, …".
- Captions moved up for this brief's zone (two-line baseline 420 → 360, single 456 → 400): extent now y 316–436 (was 376–496 in earlier episodes).
- Stills pass: the receipt let the hidden stub show through (translucent carved fill) → opaque backing; a redundant "₹0" pill removed; the survey source line overlapped the figure and ran past x 900 → shortened and moved; the van covered the mother and its FREE tag read mirrored on the return → van now arrives, the mother boards, the tag is drawn unmirrored; the payoff sack overlapped the donor → moved; a volunteer added behind the verified desk; the van headline split into PREGNANT WOMEN → + SICK INFANTS.
- First full render: the incoming van slid over the bar chart's RICHEST label at 11.67 s → the van now enters only after its scene has slid in; re-rendered and **all QA above repeated on the final file**.

## Remaining limits
- No human listening pass and no real-time viewing (ASR + loudness + frame sheets only).
- The barrier statistic is NFHS-5 (2019–21), women aged 15–49 reporting "having to take transport" as a big problem for their own treatment; NFHS-6 (2023–24) fact sheets do not report this indicator. The video shows 36.6% (poorest fifth) and 8.7% (richest fifth); narration says "over a third".
- "A day's wages" is the plain meaning of daily-wage work (no pay for a day not worked); no survey figure for lost wages is claimed.
- JSSK covers pregnant women and sick infants (up to 1 year) at public health institutions; national rules, state delivery varies (e.g. NHM lists drop-back after a 48-hour stay for mothers).
- St. Jude India ChildCare Centres (children with cancer) is the documented charity example in the notes; it is not named in the video and no Lucknow centre is claimed.
- People, buildings and amounts are illustrative; "₹?" marks costs that vary; no family is shown or invented. Help does not run transport or medical services.
- A 0.3 s blur-in at 26.6 s overlaps the payoff figures with the CTA figures (the established CTA transition).
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
