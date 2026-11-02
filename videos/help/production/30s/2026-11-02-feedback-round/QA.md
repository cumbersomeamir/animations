# QA — `help-30s-feedback-01.mp4` (feedback round, format "Hands That Reveal the Hidden Cost")

All checks on the **final exported MP4**. SHA-256 `2d8c0afee3b1233d3586732bfd77e95aca7e9daccedc72af8b34a6ee27e2d1dc`, 17.3 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error bytes**; **900** frames decoded | `qa/full-decode.log` |
| Loudness | **−15.2 LUFS**, LRA 5.5 LU, **true peak −1.6 dBTP**, no clipping; music = soft per-scene pad + scene-change motif only (no loop), ≈14 dB under speech | `qa/loudness.txt` |
| Narration timing | 8 sentences at 0.30 / 3.75 / 7.45 / 10.05 / 16.20 / 19.35 / 26.30 / 28.25 s (`src/cues.json`); each scene starts with its line; CTA "Help someone meet a real need. Explore Help." at 26.30–29.04 (final 3.7 s) | `audio/voice/sentences.json`, `build/mix_info.json` |
| Intelligibility | Could not listen myself. ASR (Vosk small-en-us-0.15): voice track **68/68** words; final mix **67/68** — the first "bulk" heard as "book" (second "bulk" correct) | `qa/asr-voice-track.txt`, `qa/asr-final-mix.txt` |
| Captions | 17 cards from one ASR timing pass, 34 frames measured in-page: ink **x 100–980, y 379–495** (rule y 340–520, x 90–990) → **0 violations**; ≤ 2 lines; no overlaps; y < 300 empty | `qa/caption-bounds.json` |
| Picture | 8 distinct scenes (hands reveal → per-kilo bars → paid-today flip + flash → budget envelope/rent/bills/boom gate → POVERTY PREMIUM plaque → ask/stated need → plank bridge, person takes the sack → CTA). Opening frame already shows both props. Re-render fixes applied: empty first frame, two empty transition frames (16.0 s, 19.0 s), cropped bar labels, cross-shaped barrier → boom gate | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Accuracy | Hedged claims mapped to Orhun & Palazzolo (2019) and Bristol PFRC (2023); no prices, statistics, savings, recipients, testimonials or app capabilities | `../../../context/14-production-30s-feedback-01.md` |

## Remaining limits (honest)
- No human listening pass; ASR + loudness only.
- At two cuts (19.07 s, 26.13–26.17 s) the outgoing piece (plaque / plank) is still visible for ~0.3 s over the incoming figures, under the lamp dip.
- The study evidence is from US household purchase data (toilet paper); the grocery packet/sack is an illustration, stated with "may"/"can".
- The local Desktop/video-review folder is on the user's machine and not reachable from this cloud session — the MP4 is attached in chat and pushed.
