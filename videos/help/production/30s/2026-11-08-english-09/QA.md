# QA — `help-30s-english09-01.mp4` (english-09, 2026-11-08) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `62971dbf735d8b15c077fff7cb4b4b82a8ff56b74da28bf3b8fd9e760592b972`, 13.8 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.1 LUFS**, LRA 3.2 LU, **true peak −1.7 dBTP**; music ducked (0.72) under speech | `qa/loudness.txt` |
| Voice | Approved Meshline character, synthesized fresh: Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 (no Hindi audio, no imitation) | `audio/voice/sentences.json` |
| Intelligibility ("listening") | **ASR-only limitation:** I cannot hear audio. Offline English ASR (Vosk small-en-us-0.15, QA-only): final mix transcript **identical** to the voice track — all 68 words recognised (homophones only: wear/where, two/to, sole/soul, matched/match). Draft phrases misheard in tests ("one shoe alone", "unworn") were re-worded before the final takes. | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Narration ↔ captions | 7 lines at 0.35 / 3.65 / 7.55 / 11.35 / 16.35 / 20.30 / 26.05 s; 14 cards from ASR word times, no overlaps; assert: every spoken word in exactly one card; CTA caption 25.89–29.70 s | `src/captions.json`, `tools_captions.py` |
| Caption bounds | 14 cards, 28 frames measured in-page: ink **x 155–925, y 376–496** (rule x 90–990, y 340–520) → **0 violations**; ≤ 2 lines; y < 300 clear | `qa/caption-bounds.json` |
| Picture / transitions | Hook: a sparkling yellow sneaker is in frame at f0, lands by 0.35 s, a flex at 0.85 s cracks the sole at 1.05 s and it crumbles from 1.35 s; "?" at 2.3 s. Fictional collection (size cubbies, volunteer at the "SHOE COLLECTION" desk, donor with a box); PAIR (lace ties two shoes ✓, "ONE SHOE" ✗); SOLE (good sole flexes ✓, "YEARS IN A BOX" shoe cracks ✗, "EVEN IF NEVER WORN"); SIZE ("SIZE 5" inside matched to "ASKED FOR SIZE 5" ✓); recap ✓✓✓ and the tied pair into "DONATIONS"; CTA. No recipients shown. Every scene boundary keeps its anchor props. | `qa/contact-sheet.png`, `qa/scene-transitions.png` |

## Defects found and fixed
- Stills: the "brand new" shoe read as grey stone (pale fill under the hide pattern) and as a block → saturated yellow upper, collar opening and toe line; fixed before the single full render.
- Script: two key phrases misheard in ASR tests → re-worded before synthesis of the final takes.

## Remaining limits
- No human listening pass (English ASR + loudness only).
- Ticks inside speech are visual only (deliberate; tick sounds sit in pauses).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.
