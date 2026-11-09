# QA — `help-30s-english10-01.mp4` (english-10, 2026-11-09) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `7accb4f8bbc2f64fee4fe7c8d8926d82d8459ee82b745cc518d89da68c389b26`, 13.2 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.1 LUFS**, LRA 2.4 LU, **true peak −1.7 dBTP**; music ducked (0.72) under speech | `qa/loudness.txt` |
| Voice | Approved Meshline character, synthesized fresh: Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 (no Hindi audio, no imitation) | `audio/voice/sentences.json` |
| Intelligibility ("listening") | **ASR-only limitation:** I cannot hear audio. Offline English ASR (Vosk small-en-us-0.15, QA-only): final mix transcript **identical** to the voice track — all 66 words recognised (homophones/splits only: no/know, too/to, "US" → "u s", a breath token after "toothbrush"). | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Narration ↔ captions | 8 lines at 0.35 / 2.30 / 5.45 / 10.60 / 13.20 / 17.10 / 21.55 / 26.05 s; 14 cards from ASR word times (two sentences proportional), no overlaps; assert: every spoken word in exactly one card; CTA caption 25.89–29.70 s | `src/captions.json`, `tools_captions.py` |
| Caption bounds | 14 cards, 28 frames measured in-page: ink **x 106–974, y 376–495** (rule x 90–990, y 340–520) → **0 violations**; ≤ 2 lines; y < 300 clear | `qa/caption-bounds.json` |
| Picture / transitions | Hook: checkout at f0 — rice scans green ✓ at 0.75 s, soap scans red ✗ at 1.4 s. SNAP card "FOOD ONLY" with food ✓; soap / toothpaste / period pads "NOT FOOD" ✗; FOOD BANK — NEEDED board with "TOILETRIES TOO" rows highlighted; fictional donor puts a sealed toothbrush and deodorant into the FOOD BANK bag; shelf "GAP" filled by toiletries ("FOOD + TOILETRIES"); CTA. No recipients shown. Every scene boundary keeps its anchor props. | `qa/contact-sheet.png`, `qa/scene-transitions.png` |

## Defects found and fixed
- Stills: "FOOD ONLY" card overlapped the SNAP card; not-food items too small; unreadable tiny icons on the board → moved / enlarged / removed.
- Final mix: a paper-rustle SFX on "Soap" masked the /s/ (ASR "so toothpaste") → rustles on spoken words removed; final mix = voice track.
- Render 2: near-empty counter at the B→C hand-off → soap made the scene's anchor. My inline comment in that edit swallowed the rest of the
  line (canvas save/translate), which leaked scene C's props over B and D; caught on the transition sheet, fixed (block comment) and re-rendered.

## Remaining limits
- No human listening pass (English ASR + loudness only).
- The SNAP rule is US-specific and stated as such; food-bank needs vary (the script says "often").
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.
