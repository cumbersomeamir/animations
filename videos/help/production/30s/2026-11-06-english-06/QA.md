# QA — `help-30s-english06-01.mp4` (english-06, 2026-11-06) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `2b6f787b2f737dafd340c33d3ea02ada40fdb64b0d620ea25c7c8f88d397d02d`, 14.6 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.1 LUFS**, LRA 2.2 LU, **true peak −1.6 dBTP**; music well under the voice | `qa/loudness.txt` |
| Voice | Approved Meshline character, synthesized fresh: Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 (no Hindi audio reused, no imitation) | `audio/voice/sentences.json` |
| Intelligibility ("listening") | **ASR-only limitation:** I cannot hear audio. Offline English ASR (Vosk small-en-us-0.15, QA-only) on the final mix recognises **76/77 words**; only "this" heard as "the". Draft hook "Would…" (heard "What…") was re-taken as "Can…". | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Narration ↔ captions | 9 lines at 0.25 / 2.85 / 5.35 / 8.40 / 11.95 / 15.10 / 19.00 / 21.80 / 26.10 s; 18 cards timed from ASR word times, no overlaps; assert: every spoken word in exactly one card; CTA caption 25.95–29.70 s | `src/captions.json`, `tools_captions.py` |
| Caption bounds | 18 cards, 36 frames measured in-page: ink **x 103–977, y 376–496** (rule x 90–990, y 340–520) → **0 violations**; ≤ 2 lines; y < 300 clear | `qa/caption-bounds.json` |
| Picture / transitions | Hook: bag on screen at f0, lands by 0.4 s, "?" at 1.3 s. Each check is demonstrated on the bag (zip teeth part and close; straps tugged, stitches glow, "FRAYED ✗"; big bag overshoots "SMALL CHILD" ✗ → small bag fits ✓; pocket emptied, stain wiped, dried), then the local group's needs board, the receive test and the handover ("A GIFT" vs "A LEFTOVER ✗"), then the CTA. No child drawn; helper and volunteer the same size. | `qa/contact-sheet.png`, `qa/scene-transitions.png` |

## Defects found and fixed (one fix round)
- Stills: arms reaching down covered the step plaques → plaques drawn in front of the arms.
- Stills: the size "too big" beat showed for 0.3 s → retimed to ~0.85 s on "small child … smaller bag".
- Final render 1: near-empty stage at the straps → size change (8.0–8.6 s) → gauge and "3 SIZE" plaque now slide in with the scene; re-rendered (audio unchanged).
- Captions: two word-count slips caught by the coverage assert before render.

## Remaining limits
- No human listening pass (English ASR + loudness only).
- Check-ticks that land inside speech are visual only (deliberate; feedback-05 masking lesson).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.
