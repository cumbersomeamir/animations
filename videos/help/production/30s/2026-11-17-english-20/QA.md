# QA — `help-30s-english20-01.mp4` (2026-11-17, batch 20) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `c8900740b40451ae245368c4751a392ccaa6684c4cb19fb3e1c650c877533de8`, 13.9 MB (13,934,159 bytes). Thumbnail `help-30s-english20-thumbnail.png` (1080×1920 PNG, SHA-256 `9371d45c2861bb79c0011be6e92c597dcfe46f5410dcb0069af1fe4c455dbfe7`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames** (counted); audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | full decode to null output, exit 0, **0 error lines**; 900 video frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook at full lamp level (no fade, no logo): a needle drawn with a blurred, doubled eye, the thread tip missing it, reading glasses beside it; "THE NEEDLE BLURS" (3 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Thumbnail | = frame 0 (plaque hidden) + "THE NEEDLE / BLURS." + Help badge | `help-30s-english20-thumbnail.png` |
| Loudness | **−15.1 LUFS**, LRA 2.0 LU, **true peak −1.6 dBTP** (below the −1.5 limit, no audio re-encode needed); SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98, synthesized fresh; no Hindi. Voice-only spelling: "prez-bee-opia" for *presbyopia* (phonemes pɹˈɛzbˈiːˈoʊpiə) | `src/script.json` (`tts`) |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the final mix recognises the whole script except: "Assam" → "awesome" (place name outside the small model's vocabulary), "presbyopia" → "press b o b a" (medical term outside the vocabulary; checked by phonemes instead), "tea" → "t" and "eye" → "i" (homophones), "needle's" → "needles" | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–2.95 s · superhook (income) 3.27–5.75 s · question 6.07–7.56 s · proof 7.88–22.39 s (Assam trial result, focusing error, community eye tests) · payoff 22.76–26.12 s · CTA 27.10–29.67 s. 80 words, 26.3 s of speech | `src/cues.json`, `audio/voice/sentences.json` |
| Captions | 17 cards from ASR word times (script-to-ASR alignment for "presbyopia"), no overlaps; every spoken word in exactly one card. Zone: ink **x 193–807, y 376–496** → **0 violations** in 34 checked frames (rule x 100–900, y 230–1500) | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | Contact sheet (frame 0 + every second) and every scene cut (−0.3 / 0 / +0.3 s) inspected. One idea per beat; labels 1–4 words (THE NEEDLE BLURS, COSTS INCOME → ?, ASSAM TRIAL → TEA PICKERS 40+ → ABOUT 1/5 MORE, FOCUSING ERROR → RIGHT LENS, EYE SCREENING → WHICH POWER?, THE TEST → + THE RIGHT PAIR → NOT ANY PAIR, LUCKNOW) | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Play listing re-downloaded 2026-11-17 ("Updated on Sep 15, 2026"): =s512 icon byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); the CTA draws that file. No App Store listing is linked | context 33 |

## Defects found and fixed
- Kokoro read "presbyopia" as pɹɪsbɪˈoʊpiə and ASR heard "frisbee opiate" → voice-only spelling "prez-bee-opia" (caption keeps the real word).
- In the full mix the line "Simple community eye screening …" was recognised as "community ice cream eating" → reworded to "Simple community eye tests find who needs which power." (recognised); scene F/G cues retimed.
- Frame 0's needle read as a dark smear with its eye hidden under the plaque → redrawn lighter (steel), shorter and angled, with the eye clear of the plaque and the thread tip visibly missing it.
- The COSTS INCOME label overlapped the "?" label → COSTS INCOME now ends just before the question.
- After the fixes everything was re-rendered and all QA above was repeated on the final file.

## Remaining limits
- No human listening pass (ASR + loudness only). The ASR cannot confirm "Assam" or "presbyopia"; these were checked by Kokoro phonemes, not by ear.
- The trial result is one randomised trial (PROSPER, Assam, 751 workers aged 40+). The narration says "about a fifth more", which rounds the published 21.7% relative difference; absolute kg figures, cost per pair and WHO global estimates are deliberately not narrated.
- The people, baskets and fill levels are illustrative and fictional; no beneficiary is shown or implied. Help does not run eye tests.
- The Lions Clubs eyeglass-recycling page returned 403 and is not used.
- Scene changes use the established slide + lamp dip, so a few in-between frames are mostly background.
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
