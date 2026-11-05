# QA: courtlens-30s-feedback05-01.mp4 (Hindi)

File: `videos/courtlens/production/30s/2026-11-05-feedback-05/courtlens-30s-feedback05-01.mp4`
sha256 `21365cadb22eb7568e7968319a800478ea77e649ed047752738f419b2e2d7ea4`
Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS, single full render)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −15.9 LUFS integrated, LRA 1.6 LU, true peak −2.4 dBFS (voice-forward, quiet bed) |
| Narration placement | 7/7 Hindi lines at planned start +3 ms (similarity 0.98–0.99) |
| CTA | "आसान कानून के लिए, कोर्टलेंस को फ़ॉलो करें" 26.62 → 29.66 s = final 3.38 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Captions | 9 Devanagari chunks, ≤ 2 lines, non-overlapping, inside y 340–520 / x 90–990 |

## Hindi listening check (ASR-only; limitation stated)
- No direct listening is possible here. The proxy is a local faster-whisper "medium" (language=hi).
  - **Lines, before mixing:** mean CER 0.064.
  - **Final mix** (per-line windows): full CER **0.079**. Every word is recognised; differences are spelling-level
    (चेकाउट, कार्थ, उन्चास, बासकेट, स्क्रिन्शोट, कोर्टलेंज).
  - **Number:** "उनचास रुपये" is heard as उन्चास रुप्ये, and the caption shows ₹49. "एक नौ एक पाँच" is heard digit by
    digit, and the caption shows 1915.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).
- A native-speaker listen is recommended for accent naturalness.

## Visual review
- **Hook:** the ₹49 parcel tiptoes in from 1.2 s and drops into the cart at 1.9 s. The checkout pill changes to "2
  आइटम" and the card line becomes a pre-ticked "₹49 दान (पहले से टिक) · कुल ₹1,048", all within the first 2 s.
- The accepted grammar is otherwise unchanged:
  - sign drop and swing
  - dashed line to tag
  - rule card sliding between, with chip highlights and the tag flip on "बास्केट स्नीकिंग"
  - split with morph and the sticker on the opt-in side
  - evidence envelope with receipt + screenshot
  - ticking action card and icon CTA
- Devanagari glyphs shape correctly. The checkbox and ticks are drawn shapes, not glyphs.
- Known, accepted transition: at about 17.0 s the sign exits sideways across the incoming split header for under
  0.3 s. This is unchanged accepted-engine behaviour.

## Defect found and fixed (before the full render)
- The cart's warning sign peeked out under the rule card after the layout change. It moved to the left of the basket.
