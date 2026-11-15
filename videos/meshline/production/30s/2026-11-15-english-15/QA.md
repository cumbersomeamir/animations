# QA: meshline-30s-english15-01.mp4 (batch 2026-11-15-english-15)

**SHA-256:** `c5ee6defda4f6c164d64ced9a8b908530529a8b64293edba96c065564f315d46`
**Thumbnail:** `meshline-30s-english15-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("SAME CHANNEL. / WHO TALKS?" + mid-air clash), sha256 `881d34d15ee7afe0666ba84bf6922ac1ef8f14d4ab6eb18e5bfe8384999fe81e`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.2 LUFS**, LRA 3.1 LU, **true peak −3.4 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +20.7 to +28.8 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en, whisper-small cross-check) | All lines match. The first draft "If two send at once" was heard as "If two Senate wants" and was reworded to "When two transmit together". | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.039; **normalised WER 0.013**. The only difference: base.en hears the CTA's first word "For" as "Get"; whisper-small hears "For". The decoded audio PCM sha256 `407bb363…` is identical across the later video-only rebuilds. | `qa/asr_final.json` |
| First frame | Frame 0 is the composed subject: a 15-router building on one channel, overlapping coverage rings, in-flight messages and a coral mid-air clash, plus 4 words "SAME CHANNEL. / WHO TALKS?". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s. | `qa/boundaries/b00.00.png` |
| Caption sync | Each chunk starts at the ASR time of its first word (−0.05 s). The first chunk starts at 0.55 s so the frame-zero words hand over without overlapping. 13 chunks, no handoff overlap. | `captions.json`, `src/air.mjs` |
| Caption bounds | Ink x 140–859, y 360–468; plate x 106–894, y 334–486. Inside x 100–900 and y 230–1500, at most 2 lines. | `qa/caption_bounds.json` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically); the sheet is 40 G tall | `src/air.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b28.00.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 24 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** building of 15 routers, all pulsing on "1 channel"; messages cross flats and some burst coral mid-air; "?". Instrument: a live shared-air-time lane (blue = one sender, coral = collision).
- **Collision:** close on two neighbours; both radiate at once, their waves turn coral and fizz between them: "scrambled", ✕.
- **Listen + backoff:** "listen first", then counters 5, 2, 7. B counts to 0 and goes ("GO"); A and C freeze with pause marks ("wait") while the air is busy, then resume.
- **Clash + doubling:** "same pick": A and C count 3-2-1 together, collide ✕; their ranges stretch "0–15 → 0–31" ("×2 range"); new picks 12 and 27.
- **Many neighbours:** the whole building shows frozen counters with one "GO" at a time: "more waiting", then "the air is busy". The building's internet line draws in with "internet ✓". The instrument is hidden here.
- **Payoff:** channel lanes: three busy "2.4 GHz" lanes, then six "5 GHz" lanes; a stuck message moves to a free lane and flows: "quieter", "more room".
- **CTA:** paper veil, icon and wordmark.

## Defects found and fixed
1. **Framing:** the stadium/full-bars framing repeats 01/11; reframed to "one channel, many routers" while keeping the requested mechanism.
2. **ASR:** a line was misheard; reworded.
3. **First frame:** frame 0 lacked a readable surprise. It now opens closer, with brighter rings, bigger messages and a mid-air clash placed between flats (not on a router).
4. **Internet line:** it showed faintly in every beat; now it appears only in its beat. Its label sat behind the instrument, so the instrument hides there.
5. **Lanes beat:** recentred, with bigger lane labels and a stronger veil on the building.
6. **"More waiting" beat:** zoom 0.95 showed the sheet's left edge and hid the label behind the caption; reframed.

## Honest limits
- **No human listen-through was performed.** "Listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only.
- Counter values and timings are illustrative. Real Wi-Fi uses several access classes and many more slots.
