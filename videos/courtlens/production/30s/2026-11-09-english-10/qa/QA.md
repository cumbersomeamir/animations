# QA: courtlens-30s-english10-01.mp4 (English)

File: `videos/courtlens/production/30s/2026-11-09-english-10/courtlens-30s-english10-01.mp4`
sha256 `8fe29ca85c95242a0ef6375e15f50c888cc142425c1e347a4c4de57d04187464`

Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −16.0 LUFS integrated, LRA 2.5 LU, true peak −2.3 dBFS (voice-forward, quiet bed) |
| Narration placement | 7/7 English lines at planned start +3 ms (similarity 0.93–0.97) |
| CTA | "Follow Courtlens for everyday Indian law explained." 26.15 → 29.10 s = final 3.85 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Captions | 10 English chunks, ≤ 2 lines, non-overlapping, inside y 340–520 / x 90–990 |

## English audio/caption timing check (ASR-only; limitation stated)
- No direct listening is possible here. The proxy is a local faster-whisper "medium" (language=en).
- **Final mix** (per-line windows, music + SFX included): full WER **0.014**. Every line is word-perfect except the
  brand, heard as "Courtlands" (an ASR spelling, as in earlier accepted episodes). "G S T" is heard as GST and
  "1 9 1 5" as 1915.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames)
- **First second / hook:**
  - 0.50 s: the POS lands showing "Total ₹1,240"
  - 0.70–1.35 s: the receipt prints upward, then stops half-out with a red ✕
  - the screen turns red "Mobile no. required" with a blinking cursor
  - the pill shows "Bill on hold"; the line prints "Bill only if you give your mobile no."
- **Rule:**
  - the "CASHIER · 'Number first'" sign drops; dashed line to "No number, no bill?"
  - the rule card "INDIA · CONSUMER PROTECTION ACT 2019 · GST RULES" reveals "Not issuing a bill for goods sold =
    unfair trade practice"
  - chips "bill is due" and "invoice: no phone field" highlight on the words; the tag flips to "Bill anyway"
- **Split:** "YOUR BILL · Due anyway, no number needed" against the rewards phone ("Join rewards? · optional ·
  Skip"), a "Skip is fine" sticker, and "LOYALTY / E-BILL · Extras: share only if you want".
- **Action:**
  - "Asked for your number?" with the exact polite line
  - the envelope receives the printed bill ("Mobile —") and the "If refused · NCH 1915" slip, visible while "Call
    1915" is spoken
  - "Keep the bill"; then the icon CTA
- **Known accepted transitions:**
  - about 14.0–14.5 s: the sign exits sideways during the split morph
  - about 25.9–26.3 s: the closed envelope fades while dropping
  Both are unchanged accepted-engine behaviour.

## Defects found and fixed
- Stills review:
  - "required" sat on the POS screen border, so it is now one line, "Mobile no. required".
  - The NCH slip was visible for only about 0.3 s, so the envelope now stays open until after "call 1915".
- TTS: "GST" was heard as "GSD", so the input uses "G S T".
- After the full render: −17.3 LUFS was quieter than the series, so the gain went from 6.2 to 7.5 dB (build.sh). The
  audio was re-muxed onto the same 900 frames, giving −16.0 LUFS. QA and ASR were re-run on the final file.
