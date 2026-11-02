# QA: meshline-30s-store-forward-01.mp4 (2026-11-03)

**SHA-256:** `9ed0380683c235e840ee61e025a0444fe7b60d3cdc8b82ca43abe0a5a35e05a5`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−14.2 LUFS**, LRA 4.4 LU, **true peak −2.8 dBTP** | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +17.3 to +25.4 dB on all 7 lines | `qa/voice_balance.json` |
| ASR on the **final MP4** (faster-whisper base.en, local) | WER **0.027**. The two misses are the letter "A" in "Station A" (dropped) and "travelling" transcribed with the US spelling "traveling". Everything else is verbatim, including "store and forward". | `qa/asr_final.json` |
| Caption bounds (pixel-exact ink) | 10 chunks; ink y 360–468, x 174–907 (inside x 90–990); no handoff overlap | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Visual and accuracy review
- **Mechanism, shown physically:**
  - The live route A→B is broken (gap ×, "no live route"), and the envelope bounces back.
  - A stores it in its tray with a ticking waiting clock.
  - A travelling relay arrives on its rail, a pen-drawn contact link forms, and the envelope is handed over ("accepted").
  - The relay carries it around the loop while the camera rides along.
  - At B a second contact hands it over ("delivered later").
  - The timeline instrument shows stored → carried → delivered with a "delay" span.
  - A second message waits at A with a coral clock and "no contact yet" (not guaranteed).
  - Takeaway: the broken live route compared with the "route over time" (contact 1 · earlier, contact 2 · later), a looping replay, and the callout "No live route ≠ always lost".
  - CTA signature in the safe area.
- **Claims:** generic principle only, mapped in `research/claims.md`. Labelled "not a product feature". No claim that Meshline implements the Bundle Protocol or guarantees delivery.

## Defects found and fixed
1. ASR heard "Station A stores it and waits" as "Station restores it in weights", and "store-and-forward" as "Doran Forward" → reworded to "Station A holds the message and waits for a contact" and "This is called store and forward". The re-check passed.
2. The caption anchor "A" matched the word "all" → single-letter anchors now match exactly.
3. The tray, clock and cartouche clipped at the left edge, and the takeaway callout collided with the timeline and CTA → layout moved (tray beside A, callout above the live route, cartouche inward and hook-only).
4. The timeline's "stored" label collided with the clock icon → track starts further right.
5. Line l6 ran straight into the CTA → gaps tightened. The CTA plays at 27.00–29.63 s.
6. The empty tray clipped at the edge in the B shot, and the parked relay drifted into the sidebar → tray hidden while empty, relay fades out on exit.
7. Freeze detector: two near-static holds of 2.1–2.3 s in the takeaway and CTA → looping replay of the message riding the assembled route, plus a slow push-in. Now clean.
8. While riding the relay, the A–B row rose under the caption plate → ride camera clamped.

## Remaining limits (honest)
- There was no human listening. Base-model ASR drops the single letter in "Station A", though "Station A" is printed in the caption and on the map.
- The camera is 2D only, with no depth of field.
- The timeline instrument's small labels are about 24 px.
- The faint printed relay rail is visible from the hook onward, slightly before it is introduced.
