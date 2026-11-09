# QA — `help-30s-english11-01.mp4` (english-11, 2026-11-09) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `c1a2440018158bd3089d6423777d75ad81c0072765c119cb9afcdfb5c7ce8120`, 13.5 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.1 LUFS**, LRA 2.8 LU, **true peak −1.5 dBTP**; music ducked (0.72) under speech | `qa/loudness.txt` |
| Voice | Approved Meshline character, synthesized fresh: Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98 (no Hindi audio, no imitation) | `audio/voice/sentences.json` |
| Intelligibility ("listening") | **ASR-only limitation:** I cannot hear audio. Offline English ASR (Vosk small-en-us-0.15, QA-only): final mix transcript **identical** to the voice track — all 65 words recognised (splits/homophones only: "leftover" → "left over", "in a" → "and a"). | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Narration ↔ captions | 7 lines at 0.35 / 3.82 / 8.73 / 11.96 / 17.46 / 21.36 / 26.05 s; 13 cards from ASR word times (line 1 proportional), no overlaps; assert: every spoken word in exactly one card; CTA caption 25.89–29.70 s | `src/captions.json`, `tools_captions.py` |
| Caption bounds | 13 cards, 26 frames measured in-page: ink **x 107–973, y 376–496** (rule x 90–990, y 340–520) → **0 violations**; ≤ 2 lines; y < 300 clear | `qa/caption-bounds.json` |
| Picture / transitions | Hook: a pill bottle is mid-air at f0, tumbles into a DONATIONS bag by 0.35 s, a hand lifts it back out ✗ at 2.6–3.1 s. FOOD BANK "CAN'T ACCEPT" board (MEDICINES ✗, VITAMINS ✗); fictional donor clears a cupboard, medicines and essentials sorted apart; medicines into the PHARMACY "RETURNS" box ("SAFE DISPOSAL"); sealed tin + toiletries into the DONATIONS bag; two-route recap; CTA. No recipients shown. Every scene boundary keeps its anchor props. | `qa/contact-sheet.png`, `qa/scene-transitions.png` |

## Defects found and fixed (before the single full render)
- Stills: "PHARMACY" overflowed its sign; the pale counter read as grey stone; the cupboard items landed only as the scene ended → wider sign,
  pharmacy-green counter, cupboard opens on "clears out".
- Script: first draft ran 25.4 s of speech → the fictional-example line shortened.
- Process: a lint now checks the episode code for mid-line `//` comments with code after them (english-10 bug class) — 0 found.

## Remaining limits
- No human listening pass (English ASR + loudness only).
- The WHO medicine-donation guideline text could not be read from a primary page (403/502), so the script makes no claim about *why* donated
  medicines are refused; it states only the food banks' rules and the NHS disposal advice.
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.
