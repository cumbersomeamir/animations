# QA: courtlens-30s-english06-01.mp4 (English)

File: `videos/courtlens/production/30s/2026-11-06-english-06/courtlens-30s-english06-01.mp4`
sha256 `b8c88442376ac02c14867226f279f67c6ae20b425a5c9940dc679ba5e8f50aea`

Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −16.0 LUFS integrated, LRA 2.0 LU, true peak −2.4 dBFS (voice-forward, quiet bed) |
| Narration placement | 7/7 English lines at planned start +3 ms (similarity 0.93–0.96) |
| CTA | "Follow Courtlens for everyday Indian law explained." 26.57 → 29.52 s = final 3.43 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Captions | 12 English chunks, ≤ 2 lines, non-overlapping, inside y 340–520 / x 90–990 |

## English audio/caption timing check (ASR-only; limitation stated)
- No direct listening is possible here. The proxy is a local faster-whisper "medium" (language=en).
- **Lines, before mixing:** WER 0.000 on l1–l6. On l7 the brand is heard as "Courtlands", the same ASR spelling as
  in the accepted round-02.
- **Final mix** (per-line windows, music + SFX included):
  - full WER **0.013**
  - every line word-perfect except that brand spelling
  - "C.C.P.A." heard as "CCPA", "twenty twenty-five" as "2025", "1 9 1 5" as "1915"
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).
- Fixed before the render: "C C P A" was heard as "CCP", so the TTS input now spells "C.C.P.A.".

## Visual review (decoded frames)
- **Hook (< 2 s):** the plate lands at 0.62 s, a red "+10%" table card hops onto it, and at 1.75 s the bill prints
  "+ Service charge 10% ₹100" while the total pill turns from ₹1,050 to ₹1,155.
- **Status and rule:** the rule card "INDIA · CCPA SERVICE CHARGE GUIDELINES, 2022" slides between. The
  "Upheld · Delhi HC, 2025" stamp pops on "upheld". The tag flips from "Must pay ₹100?" to "Not compulsory" on
  "can't". Chips highlight on "default", "compulsory" and "another name".
- **Split:** "VOLUNTARY · Pay it only if you choose" with a "₹100 · optional" sticker, against "PAYABLE · GST 5% on
  food: ₹50 on ₹1,000" with the GST table card.
- **Evidence:** the bill (Service 10% ₹100 in red, GST 5% ₹55, Total ₹1,155) and the payment slip go into the
  envelope; "Complaint · 1915"; three ticks.
- **CTA:** the Courtlens icon with "Follow Courtlens / Everyday Indian law, explained".
- Inter glyphs, including ₹, render correctly; the "+", ticks and crosses are drawn shapes.
- **Known accepted transitions:**
  - at about 15.5–15.9 s the sign exits sideways during the split morph
  - at about 26.3–26.7 s the closed envelope fades while dropping, so the bill shows faintly through the pocket
  Both are unchanged accepted-engine behaviour.

## Defects found and fixed
- Before the full render (stills):
  - The "Upheld" stamp overlapped "Hotels & restaurants". It was moved right and shrunk.
  - The rule card stood half-empty for 6–10 s. Its second line and chips now reveal at 6.30 s and 8.40 s.
- After the full render: loudness was −16.9 LUFS, under the series' level of about −16. The gain was raised 1 dB
  (`volume=7.8dB`), and the audio was re-muxed onto the same 900 frames, giving −16.0 LUFS. All checks were re-run.
