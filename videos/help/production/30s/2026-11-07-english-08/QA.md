# QA — `help-30s-english08-01.mp4` (english-08, 2026-11-07) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `455326f9ef5628e409edd14f70efd62ba69a7e187f8f4ae56a09cb8aecec4e3b`, 13.6 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.1 LUFS**, LRA 2.4 LU, **true peak −1.7 dBTP**; music ducked deeper under speech this episode | `qa/loudness.txt` |
| Voice | Approved Meshline character, synthesized fresh: Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 (no Hindi audio, no imitation) | `audio/voice/sentences.json` |
| Intelligibility ("listening") | **ASR-only limitation:** I cannot hear audio. Offline English ASR (Vosk small-en-us-0.15, QA-only): voice track recognises all 76 words. Final mix: 75/76 — the hook's "tin" is heard as "ten" (vowel confusion of the small model; "tins" and "tinned" later are recognised, the caption reads "tin" and the tin is on screen). Takes were re-worded after ASR tests ("tin goes in" → "tinned food goes in"; "in date" → "within its date"). | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Narration ↔ captions | 8 lines at 0.35 / 3.50 / 6.95 / 8.70 / 12.40 / 16.45 / 21.60 / 26.05 s; 15 cards from ASR word times (hyphen-aligned), no overlaps; assert: every spoken word in exactly one card; CTA caption 25.89–29.70 s | `src/captions.json`, `tools_captions.py` |
| Caption bounds | 15 cards, 30 frames measured in-page: ink **x 100–980, y 376–496** (rule x 90–990, y 340–520) → **0 violations**; ≤ 2 lines; y < 300 clear | `qa/caption-bounds.json` |
| Picture / transitions | Hook: doors already swinging at f0, salad and tin hop onto the table by 0.7 s, "?" at 1.7 s. Labels read with a magnifier; USE BY = SAFETY (shield, fast clock) and BEST BEFORE = QUALITY (star, months calendar) are demonstrated on the items; the food-bank shelf fills with long-life food, "FRESH ✗", TODAY → BEST BEFORE "MONTHS LEFT"; the tin goes into the food-bank bag ("SEALED ✓", "WELL IN DATE ✓"), the salad back into the fridge; CTA. Every scene boundary keeps its anchor props. | `qa/contact-sheet.png`, `qa/scene-transitions.png` |

## Defects found and fixed (one fix round)
- Script/ASR (before render): "solid pot" (clipped lead-in) → line starts at 0.35 s, "fresh salad"; "the tin goes in" → "the tinned food goes in"; "in date" → "within its date".
- Final mix: music only ~11 dB under the hook line and ASR lost "a tin" → deeper music duck (0.55 → 0.72); "a" recovered, "tin"/"ten" remains a
  model limitation (diagnostic remix also showed the opening gong was not the cause). Picture unchanged (MD5 of the copied video stream identical).

## Remaining limits
- No human listening pass (English ASR + loudness only).
- Food-bank date rules vary by food bank; the script says "often" / "some" and the takeaway is "well within its date".
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.
