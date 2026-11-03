# QA: meshline-30s-round02-01.mp4 (2026-11-03, round 02)

**SHA-256:** `365aa20ed90fa09179b06c15957f16873a613322014cd3ce98de4674b950f64c`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−14.3 LUFS**, LRA 2.3 LU, **true peak −3.3 dBTP** | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +19.3 to +22.0 dB on all 7 lines | `qa/voice_balance.json` |
| ASR on the **final MP4** (faster-whisper base.en, local) | **WER 0.0**. Every word is transcribed verbatim, including "Bluetooth", "interference" and "Meshline". | `qa/asr_final.json` |
| Narration / caption timing | Captions start at the ASR word time of each chunk's first word (−0.05 s). Twelve chunks, no handoff overlap. | `asr_words.json`, `captions.json` |
| Caption bounds (pixel-exact ink) | 12 chunks; ink y 360–468, x 194–884 (inside x 90–990, at most 2 lines) | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 28 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Visual and accuracy review
- **Mechanism, shown physically:**
  - Hook: radio pulses alternate between two phones in one printed room. The camera pulls back, and one pulse fades long before "another city" (friend's phone, coral "?").
  - Direct link: "Bluetooth radios" arcs, then a pen-drawn dashed "direct radio link". An envelope crosses straight between the phones while the router dims ("no internet needed").
  - Finite reach: a "radio reach" bubble ("limited"). Signal bars weaken along a radius ("distance"). The walls flash and the reach beyond them is cut back ("walls"). Coral static wobbles and shrinks the outline ("interference"). The local link stays inside the reach.
  - Far friend: wide shot with a coral measuring line from the reach edge, "far beyond radio reach".
  - Route: the pen draws home router → routers in a dashed "internet" zone → city router → friend. The envelope hops router to router and each router lights.
  - Takeaway: "close by: direct link" and "far away: network route", with looping tokens on each and the matching instrument row highlighted. The CTA signature appears in the safe area.
- **Instrument (screen space, y 1418–1574):** a path panel. "nearby: phone - - - phone, direct radio". "far away: phone ●●●●● phone, ? → via routers". Its dots fill as the message hops.
- **Claims:** generic principles only, mapped in `research/claims.md`. Nothing about Meshline's radio or range. The CTA is supported by the listing.

## Defects found and fixed
1. During the 15.6 s pull-back the far city appeared behind the caption plate and clipped at the right edge. Its paper veil now also depends on the city's on-screen position (fully in frame, below y 500). The pull-back moved earlier (14.6–15.9 s), so the city appears as "another city" is spoken.
2. The "distance" label touched the last signal-bar glyph, so it moved left.
3. The beat-2 message envelope crossed the "direct radio link" label (b08.10). The envelope now rides lower over the link and the label sits higher.

## Remaining limits (honest)
- There was no human listening; this relies on ASR and level metrics.
- The camera is 2D only, with no depth of field.
- In the wide shots, sheet labels are small (about 21–26 px), and the upper-left of the sheet is empty by design: it is the distance between the room and the city.
- The reach bubble is illustrative, not a measured range.
