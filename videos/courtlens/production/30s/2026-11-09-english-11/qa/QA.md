# QA: courtlens-30s-english11-01.mp4 (English, Tamil Nadu)

File: `videos/courtlens/production/30s/2026-11-09-english-11/courtlens-30s-english11-01.mp4`
sha256 `b3fe05b18d28157b8068a7eb2d30dbf6fc55992299905f6cc49d5b5f61e8a588`

Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −15.9 LUFS integrated, LRA 2.3 LU, true peak −2.4 dBFS (voice-forward, quiet bed) |
| Narration placement | 7/7 English lines at planned start +3 ms (similarity 0.93–0.97) |
| CTA | "Follow Courtlens for everyday Indian law explained." 26.27 → 29.22 s = final 3.73 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Captions | 11 English chunks, ≤ 2 lines, non-overlapping, inside y 340–520 / x 90–990 (the english-11 brief predates the 11 Nov rules) |

## English audio/caption timing check (ASR-only; limitation stated)
- No direct listening is possible here. The proxy is a local faster-whisper "medium" (language=en).
- **Final mix:** full WER **0.013**. Every line is word-perfect except the brand, heard as "Courtlands" (an ASR
  spelling). "Tamil Nadu" and "Rent Authority" are recognised correctly.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames)
- **Hook:** the building lands; the breaker swings and Flat 3B flickers, then goes dark by 1.35 s (dark at 1.0–1.5 s
  in the sheet). The meter shows OFF; the card prints "Landlord: power off until you vacate".
- **Rule:**
  - the sign "LANDLORD · 'Vacate this week'"; dashed line to "Power off to evict?"
  - the rule card "TAMIL NADU · LANDLORDS & TENANTS ACT 2017 · S.20" reveals its lines
  - chips "electricity / water / lifts" highlight on the words; the tag flips to "Court order only" on "Eviction
    needs…"
- **Split:** "EVICTION · S.21 · Only by a Rent Court order" against the right-hand flat, which relights with the
  breaker back ON on "restored" (19.2 s). "RENT AUTHORITY · S.20 · Restore at once; penalty ≤ ₹5,000" and an
  "Inquiry: 1 month" sticker.
- **Evidence:** the rent receipt ("Oct/Nov rent ₹18,000 PAID") and a dated meter photo go into the envelope, written
  "TN Rent Authority". Then the icon CTA.
- **Known accepted transitions:**
  - about 15.2–15.8 s: the sign exits sideways during the split morph
  - about 26.0–26.4 s: the envelope fades while dropping

## Defects found and fixed
- Stills review: on the rent receipt, "November" ran into "₹18,000", so the labels are now "Oct rent" / "Nov rent".
- Process: a worker restart killed the first render at 592/900 frames. It was re-rendered cleanly in full before QA.
- After the full render: −14.5 LUFS was too loud, so the gain went from 7.5 to 6.0 dB. The audio was re-muxed onto the
  same frames, giving −15.9 LUFS. QA and ASR were re-run on the final file.
