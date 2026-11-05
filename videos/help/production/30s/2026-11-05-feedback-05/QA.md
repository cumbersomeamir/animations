# QA — `help-30s-feedback05-01.mp4` (feedback-05, 2026-11-05) — Hindi narration + captions

All checks on the **final exported MP4**. SHA-256 `2fb84eb716ea60d4d3f806ee43a7e66d3359dec9c898e8c071ace574e51254cd`, 13.7 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.0 LUFS**, LRA 1.5 LU, **true peak −1.6 dBTP**; music ≈24 dB under the voice during speech | `qa/loudness.txt` |
| Hindi voice | Kokoro-82M native Hindi voices hf_alpha 0.7 + hm_omega 0.3, lang `hi`, speed 0.98 (approved Hindi counterpart of Meshline; no English voice, no imitation) | `audio/voice/sentences.json` |
| Intelligibility ("listening") | **ASR-only limitation:** I cannot hear audio. Offline Hindi ASR (Vosk small-hi-0.22, QA-only): final mix recognises **all 68 words** (spelling variants only: nukta dropped, पूछे/है/मिटाए, रिसेट). Draft "टिकती" (heard "दिखती") was reworded. | `qa/asr-final-mix-hi.txt`, `qa/asr-voice-track-hi.txt` |
| Narration ↔ captions | 7 lines at 0.20 / 4.33 / 9.40 / 14.36 / 18.00 / 23.10 / 25.95 s; 15 cards timed from the Hindi ASR word times, no overlaps; assert: every spoken word in exactly one card; CTA 25.95–29.64 s | `src/captions.json`, `tools_captions.py` |
| Hindi glyphs | Noto Sans Devanagari (OFL); conjuncts, nukta (फ़, ज़), chandrabindu render; no missing-glyph boxes | `qa/contact-sheet.png` |
| Caption bounds | 15 cards, 30 frames measured in-page: ink **x 103–977, y 396–481** (rule x 90–990, y 340–520) → **0 violations**; single lines; y < 300 clear | `qa/caption-bounds.json` |
| Picture / transitions | Hook: phone on stage at f0, lifts and lights by 0.5 s, "दान" tag 1.0 s, checks 1/2/3 pinned by 3.2 s. 7 scenes follow the narration (labelled fictional student → apps fly into the phone, "चलेगा ✓" → battery holds while a clock runs, charger plugs in ⚡ → account row leaves the phone, reset, data wiped to "नमस्ते" → recap ✓✓✓ and handover → CTA). No empty stage at any boundary; helper and student the same size. | `qa/contact-sheet.png`, `qa/scene-transitions.png` |

## Defects found and fixed (one fix round)
- Stills: "दान" tag overlapped the phone's top corner → now hangs on a string beside the phone.
- Final-mix ASR heard "मिटाएँ" as "में ताल". Measured: no SFX and music −24 dB under the word's core; diagnostic remix proved the
  check-tick click at 22.5 s (on the word's last vowel) caused it → that tick lands silently; a soft chime follows at 22.8 s after the line.
  The wipe whoosh and reset glide were also softened. Video stream unchanged (MD5 of the copied H.264 stream identical to the reviewed render).

## Remaining limits
- No human listening pass (Hindi ASR + loudness only). Kokoro Hindi is espeak-based: clear but slightly synthetic prosody.
- The third check tick is silent (deliberate, see above).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.
