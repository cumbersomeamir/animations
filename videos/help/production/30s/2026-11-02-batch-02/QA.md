# QA — `help-30s-production-02.mp4` (batch production-30s-2026-11-02-batch-02)

All checks on the **final exported MP4**. SHA-256 `6461ba4980129694d1bbff8cc6d634dd11df900208c2e9d6a2e11e2a729c7c12`, 16.95 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**, 30.000000 s; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | `ffmpeg -v error -i … -f null -` → exit 0, **0 error bytes**; **900** frames decoded | `qa/full-decode.log` |
| Loudness | **−15.1 LUFS** integrated (target −14…−16), LRA 2.2 LU, **true peak −1.6 dBTP** (≤ −1), sample peak −1.68 dBFS, flat factor 0 (no clipping) | `qa/loudness.txt` |
| Intelligibility | Could not listen myself. One ASR timing pass on the voice track (after one targeted re-take of sentence 1, whose draft wording "do not all need" was heard as "do not only") + one ASR check on the final mix (Vosk small-en-us-0.15): **69/71 words**; "or" heard as "are", "lets" as "let"; "organisation" returned in US spelling | `qa/asr-voice-track.txt`, `qa/asr-final-mix.txt` |
| Caption bounds | 20 cards, 40 frames measured in-page: ink **x 91–989, y 388–452** (rule y 350–470, x ≥ 80) → **0 violations**; single line 56–64 px; no overlaps; top 0–300 px empty | `qa/caption-bounds.json`, `src/captions.json` |
| Picture / transitions | One continuous stage; purposeful scene changes: flood recedes → households + need plaques → shutter opens (OPEN) → box opens into choice tokens → tokens to market → own choices return (ticks) → shutter slams (CLOSED), choices exit, one lamp dims → supply boxes arrive → requests board ticks → identical pile slides aside, plaques glow → lamps dim | `qa/contact-sheet.png`, `qa/beat-boundaries.png` |
| Accuracy | Claim map in `../../../context/13-production-30s-02.md`; no "cash is always best" claim; condition shown (markets working vs disrupted); no statistics, recipients, testimonials, health/legal/income claims; "Illustrative scene" visible | — |

## Remaining limits (honest)
- No human listening pass (ASR + loudness only).
- At the shutter beat the OPEN tag swaps to CLOSED ~0.3 s after the shutter starts falling (2–3 frames of "OPEN" on a half-closed shutter).
- Supply boxes are small at the households' feet; on a phone they read as boxes but not their contents (deliberately generic — no item claims).
- "medicine / transport / rent" are illustrative examples; the IFRC flood press release that lists these was found via search but ifrc.org blocked automated fetching (403), so the on-screen examples rest on the verified IFRC Q&A + shelter manual (see context/13).
- Render took ~17 min (Canvas2D in headless Chromium, many blurred shadow pieces).
