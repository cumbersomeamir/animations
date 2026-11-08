# QA: courtlens-30s-english08-01.mp4 (English)

File: `videos/courtlens/production/30s/2026-11-07-english-08/courtlens-30s-english08-01.mp4`
sha256 `2cd33c985432adf8f64a678df308691a3a87597de8e9e0807ee20759a4ce7ef9`

Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −16.4 LUFS integrated, LRA 2.7 LU, true peak −2.4 dBFS (voice-forward, quiet bed; within 0.5 dB of the series level) |
| Narration placement | 7/7 English lines at planned start +3 ms (similarity 0.94–0.97) |
| CTA | "Follow Courtlens for everyday Indian law explained." 26.24 → 29.19 s = final 3.76 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Captions | 11 English chunks, ≤ 2 lines, non-overlapping, inside y 340–520 / x 90–990 |

## English audio/caption timing check (ASR-only; limitation stated)
- No direct listening is possible here. The proxy is a local faster-whisper "medium" (language=en).
- **Final mix** (per-line windows, music + SFX included): full WER **0.013**. Every line is word-perfect except the
  ASR spelling "Courtlands" for the brand, as in earlier accepted episodes. "TDR" is heard as TDR.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames)
- **First second / hook:**
  - 0.55 s: the board lands showing "ON TIME"
  - 0.85–1.55 s: the split-flap tiles scramble (visible at 1.10 s, "LATES5IV8LY") and settle on "LATE 4H 10M"
  - the ticket pill turns red; the line prints "Running 4h 10m late · expected 22:10"
- **Claim and rule:**
  - the "CANCEL NOW? Refund: ₹0" sign drops; dashed line to "₹1,450 gone?"
  - the rule card "INDIA · RAILWAY REFUND RULES" reveals its lines on the words
  - the tag flips to "Full fare back"; chips highlight "full fare back" and "no cancellation charge"
- **Payoff:** "TDR: LATE 3H+ · ₹1,450 back, full fare" against the phone "Cancel ticket? Refund ₹0" and "USUAL CANCEL ·
  1 hour before · refund ₹0", plus a "Refund: ₹0" sticker.
- **Action:** the e-ticket and running-status screenshot go into the envelope, written "TDR · train late". Three
  ticks: "Don't press Cancel", "File TDR: 'train late'", "Before it actually leaves". Then the icon CTA.
- **Known accepted transitions:**
  - about 15.3–15.9 s: the sign exits sideways during the split morph
  - about 25.9–26.4 s: the closed envelope fades while dropping
  Both are unchanged accepted-engine behaviour.

## Defects found and fixed
- Stills review before the render:
  - The board's "18:00" collided with "EXPRESS · 3A", so the board now shows "EXPRESS" at a smaller size.
  - The rule card's first line moved to 7.95 s.
  - "now 22:10" became "expected 22:10".
- TTS: "T.D.R." made the voice end the sentence (an awkward 1 s break). It became plain "TDR", and l6 was reworded.
- Process: a worker restart killed the first render at 596/900 frames. Frames were re-rendered cleanly from scratch
  (deterministic), and all checks were re-run on the new file.
