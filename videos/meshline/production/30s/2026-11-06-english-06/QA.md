# QA: meshline-30s-english06-01.mp4 (batch 2026-11-06-english-06)

**SHA-256:** `336c3ff6780c930cdb563063aa51c920a632b8d5fddcf725dfee5f643f8ed5b5`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−14.0 LUFS**, LRA 2.4 LU, **true peak −2.9 dBTP**; music stays quiet under speech | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +17.6 to +24.4 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (faster-whisper base.en) | All 7 lines verbatim, apart from punctuation | `asr_words.json` |
| ASR on the **final MP4** | **WER 0.0**. Every word is transcribed, including "Meshline", "server" and "ticks". | `qa/asr_final.json` |
| Narration / caption timing | Each chunk starts at the ASR time of its first word (−0.05 s); 12 chunks, no handoff overlap. The CTA plays 26.14–29.55 s (the last 3.9 s). | `asr_words.json`, `captions.json` |
| Caption bounds (pixel-exact ink) | Ink y 360–468 (inside 350–470), x 171–909 (inside 90–990), at most 2 lines. The top 300 px are clear. | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 22 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Visual and accuracy review
- **Hook (frames 1–2 s):** the envelope zips from "your phone" up to the server. The receipt tracker shows one tick, the route to "their phone" turns coral ("offline", "phone off"), and a coral "?" appears.
- **Mechanism:**
  - The first leg replays ("internet route", "one tick = at the server").
  - Their phone comes online, the envelope travels down, and the tracker reaches ✓✓.
  - Their phone goes off again: a second message reaches the server ("held · retrying"), and retries fizzle at the offline cut.
  - Clock beat: your own connection is cut, the envelope stays on your phone with a coral clock, and "your connection" is labelled.
- **Direct beat:** the internet routes veil. A "nearby phone" appears with a pen-drawn dashed link, and the envelope hops straight across. The tracker switches to "your phone → nearby phone · no server · limited range". A range ring grows, and their phone is labelled "out of range".
- **CTA:** the official icon and wordmark in the safe area.
- **Claims:** mapped in `research/claims.md`. The video names no other app. The CTA wording comes from the listing.

## Defects found and fixed
1. The caption anchor "the" matched "their", so chunk l4b started 2 s early. English anchors of up to 3 letters now match exactly.
2. Push-in cameras clipped "their phone", "phone off" and "one tick = …" at the right edge (inside the sidebar band), and "your phone" at the left. Cameras were re-framed, and labels moved or shortened.
3. Labels around "your phone" and "nearby phone" collided in the direct beat. The map's "direct link" label was dropped (the instrument carries it), and "nearby phone" is now right of its glyph.
4. "phone off" under their phone touched the instrument plate. It moved to the left of the phone.
5. The routes un-dimmed in the last 0.6 s. They now stay veiled through the CTA.
6. The tracker crossfaded both layouts on top of each other at 20.4 s and briefly showed ✓✓ for the clock message. The swap is now sequential, and the clock state is held during the fade-out.

## Remaining limits (honest)
- No human listening; this relies on ASR and level metrics.
- The camera is 2D only, with no depth of field.
- Tick meanings vary by app. The script says "in many chat apps", and the sources are cited in repo notes only.
