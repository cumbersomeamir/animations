# QA: meshline-30s-production-02.mp4 (batch production-30s-2026-11-02-batch-02)

**SHA-256:** `1fb50fb7bc2a554f9c710a28a8ed45cb377bdbbdb1b26bde92e42afa753ea47c`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None | `qa/black_freeze.txt` |
| Loudness | **−14.6 LUFS** integrated, LRA 3.1 LU, **true peak −2.6 dBTP** (target ≤ −1) | `qa/loudness.txt` |
| Intelligibility (speech-band voice vs bed) | +11.7 to +19.7 dB on all 7 lines | `qa/voice_balance.json` |
| ASR on the **final MP4** (faster-whisper base.en, local) | **WER 0.0** against the final script | `qa/asr_final.json` |
| Caption bounds (pixel-exact ink) | 11 chunks, ink y 360–468, x 154–926; no handoff overlap | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 25 frames at every camera move and caption change | `qa/boundary-sheet.png` |

## Visual and accuracy review
- **Scene changes, each with a purpose:**
  - Internet hub stamped offline, and a voice token fizzles at the router (hook).
  - A direct radio link is inked between RADIO A and RADIO B, and voice packets flow.
  - WEBSITE, MOBILE DATA and ROUTER are stamped "not needed".
  - Channel bullets go from CH 3 to CH 7, which unblocks the packets, and a "usable range" arc is drawn.
  - The glide down shows the hill, buildings and interference; the low path breaks up ("signal weakens").
  - A repeater lands on the hilltop and relays to RADIO C.
  - A printed comparison panel: walkie-talkie vs offline messaging app ("radios + rules vary · check its limits").
  - Pull back to finite coverage rings and the callout "No internet ≠ unlimited range". Small signature.
- **Safe areas:** captions are in screen space. The top 0–320 px and bottom 1640–1920 px are graded. Elements that stop mattering are veiled before they pass under the caption band.
- **Distinguishing from Meshline:** the panel talks about "offline messaging apps" generically. No app radio or range is claimed.

## Defects found and fixed
1. Narration was 28.4 s long with no closing beat → minimal script tightening (67 words), 0.3–0.35 s gaps, ending at 28.99 s.
2. The first framing was too wide (small network) → tighter hook and setup framing, and the panel framing raised away from the bottom zone.
3. The INTERNET hub and the title cartouche passed under the caption plate → paper veil after 9.3 s.
4. The veil didn't dim labels, because `label()` overwrote alpha → it now multiplies the outer alpha.
5. The range arc lingered into the hill beat → fades out at 13.9–14.4 s.
6. The final callout was illegible in the wide shot → enlarged to two lines.
7. Line l5 was masked by repeater SFX (+8.3 dB) → SFX gains lowered (+11.7 dB).

## Remaining limits (honest)
- There was no human listening. Intelligibility rests on ASR WER 0.0 on the final mix plus speech-band levels.
- The camera is 2D only, with no WebGL depth of field. The paper tooth is lighter than in the style reference.
- In the final wide overview, sheet labels are about 15–20 px. The narration and captions carry the message.
- During camera glides, veiled old-network labels pass behind the caption plate for under 1 s, at about 9.4–10.2 s and 20.9–21.7 s.
- Two sources (S4, S5) are Wikipedia. The core claims also rest on primary eCFR text and the Bluetooth SIG. FCC and Ofcom pages were not fetchable.
