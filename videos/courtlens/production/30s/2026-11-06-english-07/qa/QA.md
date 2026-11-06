# QA: courtlens-30s-english07-01.mp4 (English)

File: `videos/courtlens/production/30s/2026-11-06-english-07/courtlens-30s-english07-01.mp4`
sha256 `f89efc47f2468e44e319d8b7f91d5456f76acb3e653626b8aa805e6434d7cab4`

Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −15.9 LUFS integrated, LRA 2.3 LU, true peak −2.3 dBFS (voice-forward, quiet bed) |
| Narration placement | 7/7 English lines at planned start +3 ms (similarity 0.94–0.98) |
| CTA | "Follow Courtlens for everyday Indian law explained." 26.26 → 29.21 s = final 3.74 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Captions | 12 English chunks, ≤ 2 lines, non-overlapping, inside y 340–520 / x 90–990 |

## English audio/caption timing check (ASR-only; limitation stated)
- No direct listening is possible here. The proxy is a local faster-whisper "medium" (language=en).
- **Lines, before mixing:** WER 0.000 on l1–l6. On l7 the brand is heard as "Courtlands", the same ASR spelling as
  in the accepted episodes 02 and 06.
- **Final mix** (per-line windows, music + SFX included):
  - full WER **0.013**
  - "RBI" heard as RBI
  - "two thousand", "three hundred" and "thirty" heard as 2000, 300 and 30, matching the captions
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames)
- **Hook (< 2 s):**
  - 1.00 s: the ATM screen says "Please wait"
  - 1.40 s: the cash tray slides out empty
  - 1.75 s: the screen says "Transaction failed", the alert line prints "Debited ₹2,000 · cash given ₹0", and the
    balance pill turns red (₹12,450 → ₹10,450)
- **Rule:** the RBI rule card slides between. The tag flips from "₹2,000 lost?" to "Back in 5 days" on "credited
  back". Chips highlight on "five days", "a hundred rupees a day" and "without you asking".
- **Payoff:** one "+₹100" chip per late day (day 6, 7, 8), then "3 DAYS LATE · ₹2,000 back + ₹300 extra". An
  "OTHER BANK" ATM slides in on "another bank's ATM".
- **Action:** the ATM slip and SMS screenshot go into the envelope, which is written "cms.rbi.org.in"; three ticks
  follow the words.
- **CTA:** the Courtlens icon with "Follow Courtlens / Everyday Indian law, explained".
- Inter glyphs, including ₹ and •, render correctly. The ✕ box, ticks and warning sign are drawn shapes.
- **Known accepted transitions:**
  - about 16.2–16.9 s: the sign exits sideways during the split morph
  - about 26.0–26.4 s: the closed envelope fades while dropping
  Both are unchanged accepted-engine behaviour.

## Defects found and fixed
- **Stills review before the render:**
  - The ATM slip's "Withdrawal" crowded the amount, so it now reads "Amount".
  - The bubble duplicated the "OTHER BANK" header, so it now reads "Not my bank".
- **Script timing:** the first take was 29.0 s of speech. l3 and l6 were shortened so the CTA keeps the final 3.74 s.
- **After the full render:** −14.4 LUFS was louder than the series level. Gain went from 7.8 to 6.2 dB (build.sh),
  and the audio was re-muxed onto the same 900 frames, giving −15.9 LUFS. All checks were re-run.
