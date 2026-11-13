# QA: meshline-30s-english13-01.mp4 (batch 2026-11-13-english-13)

**SHA-256:** `a4058778b427a2b1fa08de07322aa4bb8b90990645107e28bde31272c02d7964`
**Thumbnail:** `meshline-30s-english13-01-thumbnail.png`, 1080x1920 RGB, "NO SIM. / STILL / TALKING?", sha256 `1843c9ecf6f470e91712f040696331c2ca1dcc297a3508201a6b0eb0f5def892`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.0 LUFS**, LRA 2.8 LU, **true peak −4.1 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +17.7 to +23.0 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en, whisper-small cross-check) | All lines verbatim, apart from punctuation. Two fixes before the final take: "A SIM isn't a radio" was heard as "SIM is in a radio" (reworded to "is not"), and Kokoro spelled the capitalised "SIM" as "S-I-M" (the TTS text now uses "sim"; captions keep "SIM"). | `asr_words.json` |
| ASR on the **final MP4** | **WER 0.0** (no digits in the script). The last rebuild only swapped a glyph; the decoded audio PCM sha256 `423c67bf…` is identical to the scored take. | `qa/asr_final.json` |
| Caption sync | Each chunk starts at the ASR time of its first word (−0.05 s); 13 chunks, no handoff overlap | `asr_words.json`, `captions.json` |
| Caption bounds | Ink x 154–843, y 360–468; plate x 122–878, y 334–486. Inside x 100–900 and y 230–1500, at most 2 lines, centred at x 500. | `qa/caption_bounds.json` |
| Pacing | Hook 0.25–3.85 s (frame 1 shows both SIM cards leaving the phones). Explanation and proof 4.5–20.9 s across 4 scene changes. Prerequisites/payoff 21.5–25.6 s. CTA 26.2–29.55 s. | `audio/narration/narration_meta.json` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b28.00.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 25 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** two phones; both SIM cards pop out and fade. "no SIM" under each phone. An envelope still hops across the dashed link ✓, then a coral "?". Instrument: "mobile network: no SIM" / "Bluetooth: message ✓".
- **The SIM:** a large SIM card; a radio icon gets ✕ ("not a radio"); "carrier ID + key". Instrument: "needs a SIM".
- **The check:** "carrier network" tower sends "?" to the card, gets ✓ back ("calls · data"). Dashed coral lines to the SIM-less phones end in ✕: "no SIM, no carrier service".
- **Bluetooth:** radio rings around both phones ("Bluetooth radio"); two keys meet in the middle and lock ("paired"); a message hops. Instrument: "phone ↔ phone" → "paired ✓".
- **Constraints:** the right phone drifts away ("limited reach", link thins to coral), then a hatched wall drops ("walls", ✕). Instrument: "nearby only".
- **Prerequisites:** three printed chips, one at a time: "Bluetooth on", "Nearby devices", "No SIM needed". The instrument is hidden here (one readout at a time).
- **CTA:** paper veil, radio glyphs faded, icon and wordmark.

## Defects found and fixed
1. The meaning was reversed in ASR ("SIM is in a radio"); the line was reworded.
2. The TTS spelled "SIM" as letters; fixed with lower-case text for the TTS.
3. The narration first ran 29 s of speech; it was trimmed to 25.2 s (gaps 0.7 s).
4. The ejecting SIMs were tiny and hidden behind the phones in frame 1. They are now larger and drawn in front.
5. The SIM card, tower, keys and chips were small at phone size. They were enlarged and the l3 camera moved closer.
6. The hook cartouche overlapped the flying SIM card; the cartouche moved up.
7. The right sheet edge showed during the range beat; the camera was reframed and the drift shortened.
8. A Bluetooth rune glyph was replaced by a generic radio-wave glyph, so no third-party logo artwork appears (video-only rebuild).

## Honest limits
- **No human listen-through was performed.** "Listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only.
- "ID card" is a metaphor (S2/S1).
- The prerequisites line describes Bluetooth apps on Android 12+ in general (S5). Meshline's own transport and permissions are not stated in the app context, so none are claimed.
