# QA: courtlens-30s-english09-01.mp4 (English)

File: `videos/courtlens/production/30s/2026-11-08-english-09/courtlens-30s-english09-01.mp4`
sha256 `0988a85a9eb70822b47316e41f377f5ff4347ca57917ab0f6bd3e669124dff33`

Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −15.6 LUFS integrated, LRA 2.4 LU, true peak −2.4 dBFS (voice-forward, quiet bed) |
| Narration placement | 7/7 English lines at planned start +3 ms (similarity 0.94–0.97) |
| CTA | "Follow Courtlens for everyday Indian law explained." 26.26 → 29.21 s = final 3.74 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Captions | 12 English chunks, ≤ 2 lines, non-overlapping, inside y 340–520 / x 90–990 |

## English audio/caption timing check (ASR-only; limitation stated)
- No direct listening is possible here. The proxy is a local faster-whisper "medium" (language=en).
- **Final mix** (per-line windows, music + SFX included): full WER **0.012**. Every line is word-perfect except the
  brand, heard as "Courtlands" (an ASR spelling, as in earlier accepted episodes). "Aadhaar" is sometimes written
  "adhar" by the recogniser, a spelling variant the normaliser maps.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames)
- **First second / hook:**
  - 0.55 s: the DEPOSIT box lands
  - 0.80–1.45 s: the generic "AADHAAR" card hops off the counter into the slot and the padlock snaps red
  - the check-in pill turns "ID kept" and the line prints "Deposit: original Aadhaar till checkout"
- **Rule:**
  - the "FRONT DESK · 'Card stays here'" sign drops; dashed line to "Leave your card?"
  - the rule card "INDIA · UIDAI OFFLINE VERIFICATION RULES" reveals "Hotel checking your Aadhaar? / Verify, don't
    keep:"
  - chips "scan the QR", "no storing" and "mask copies" highlight on the words
  - the tag flips to "Scan & return"
- **Split:** "SHOWING IT · Normal: scan, card comes back" with a "QR scanned" sticker, against the locked box and
  "LEAVING THE ORIGINAL · Not part of the process".
- **Handover:** the hotel-record envelope receives a masked copy ("XXXX XXXX 4821, first 8 digits hidden") and a
  QR-check phone ("Verified · NO CARD KEPT"). Three ticks, then the icon CTA.
- No official emblem or Aadhaar layout is reproduced; the original card shows dots instead of a number.
- **Known accepted transitions:**
  - about 16.7–17.2 s: the sign exits sideways during the split morph
  - about 21.5–21.9 s: the split columns exit sideways
  - about 26.0–26.4 s: the closed envelope fades while dropping
  All are unchanged accepted-engine behaviour.

## Defects found and fixed (stills review before the render)
- The third rule chip overflowed the card edge, so the chip labels were shortened.
- "Room 204 · 1 night" crowded the price, so the title is now "Room 204" with "1 night · check-out 11:00" below it.
- "UIDAI" can't be voiced cleanly by the TTS, so the narration says "Aadhaar's own rules" and the screen shows UIDAI.
