# QA — `help-30s-round02-01.mp4` (round 02, 2026-11-03)

All checks on the **final exported MP4**. SHA-256 `029e11a7f43ef31fd02a61c3599c1777b80b03d19e32543408dd1365ec184e11`, 15.3 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error bytes**; **900** frames decoded | `qa/full-decode.log` |
| Loudness | **−15.1 LUFS**, LRA 3.5 LU, **true peak −1.7 dBTP**; accepted quiet voice-forward mix (per-scene pad + scene-change motif, no loop) | `qa/loudness.txt` |
| Narration timing | 7 lines at 0.25 / 4.15 / 7.65 / 10.05 / 14.75 / 20.25 / 26.40 s; each scene change lands on its line; CTA "Download Help to donate essentials." 26.40–28.24 s (final 3.6 s) | `src/cues.json`, `build/mix_info.json` |
| Intelligibility | Could not listen myself. Vosk small-en ASR on the final mix: all lines recognisable; small-model slips: "while"→"our", "no van"→"know van" (homophone), "bridge it"→"bridget" | `qa/asr-voice-track.txt`, `qa/asr-final-mix.txt` (audio identical to the checked export; only the clock graphic was re-rendered) |
| Captions | 18 cards from the ASR timing pass, 34 frames measured in-page: ink **x 102–978, y 376–496** (rule y 340–520, x 90–990) → **0 violations**; ≤ 2 lines; no overlaps; y < 300 clear | `qa/caption-bounds.json` |
| Picture | 7 scenes moving with narration: hands hold crate + empty bowl and a link forms → TIMING / STORAGE / TRANSPORT plaques snap the link → shop surplus "tonight" (moon + clock) → kitchen cold box FULL, van BUSY drives off, freshness bar drains → hands lay a route: pickup ✓, cold store ✓, van, community kitchen (bowl fills) ✓ → helper asks "?" at an ASK FIRST board (what it accepts ✓ / and when ✓) → CTA with the real app icon | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Fixes applied before final | spinning clock read as a "⊘" then a power icon → hands set to ~10 o'clock; freshness bar moved off the awning | — |
| Accuracy / brand | claims hedged and mapped to FAO + FSSAI; CTA matches the verified Play listing; Play icon re-fetched 2026-11-03 = byte-identical to `assets/icon.png` | `../../../context/15-production-30s-round02-01.md` |

## Remaining limits
- No human listening pass (ASR + loudness only).
- Scene changes overlap under a lamp dip; at 20.0 s and 26.0 s the outgoing set is visible for ~0.3 s while the next slides in.
- The UNEP Food Waste Index page refused automated fetch (403), so no UNEP figures are used anywhere.
- The local Desktop/video-review folder is not reachable from this cloud session; the MP4 is attached in chat and pushed.
