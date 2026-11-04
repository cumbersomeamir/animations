# QA: courtlens-30s-hindi04-01.mp4 (Hindi)

File: `videos/courtlens/production/30s/2026-11-04-hindi-04/courtlens-30s-hindi04-01.mp4`
sha256 `3e2b194f1725f8c0165d1ce7ca4ebc3c3f92cfcfac9bcd1860bf203054ac4f57`
Machine-readable: `qa_report.json` (`src/qa.py`) and `asr_check.json` (`src/asr_check.py`). Sheets decoded from the
final MP4: `contact-sheet-1fps.jpg`, `transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS, first full render)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −15.8 LUFS integrated, LRA 1.6 LU, true peak −2.4 dBFS |
| Narration placement | 7/7 Hindi lines at planned start +3 ms (cross-correlation similarity 0.98–0.99) |
| CTA | "आसान कानून के लिए, कोर्टलेंस को फ़ॉलो करें" 26.75 → 29.79 s = final 3.25 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Captions | 10 Devanagari chunks, ≤ 2 lines, non-overlapping, inside y 340–520 / x 90–990 |

## Hindi listening check (ASR-only; limitation stated)
- I can't listen to audio directly in this environment. As a proxy, a local faster-whisper "medium" (language=hi)
  transcribed every line and the final mixed MP4.
  - **Lines, before mixing:** mean CER 0.053.
  - **Final mix** (music + SFX, per-line windows): full-script CER **0.063**. Every word is recognised; differences
    are spelling-level (दुकांदार, अवधी, नीती, रिफनड, नलेना).
  - **Numbers:** "तीस दिनों" is heard as "तीस दिनों"; "एक नौ एक पाँच" is heard digit by digit, as intended for 1915.
  - **Brand:** heard as "कोर्टलेंस".
- **Caption alignment:** all recognised words fall inside the caption on screen at that moment (`words_outside_captions = []`).
- Draft fixes found by this check before rendering:
  - "नई केतली" was heard as "नहीं केतली" ("no kettle"), so the line now starts with "केतली"
  - "नो रिफ़ंड" was heard as "रिफन", so it became "रिफ़ंड नहीं"
- An accent/naturalness judgement needs a native-speaker listen before posting.

## Visual review
- Accepted grammar intact: card spring, object emerging and landing, sign drop and swing, dashed line to tag, rule card
  sliding between, chip highlights, tag flip, split stage, morph, sticker, envelope, ticking action card, icon CTA.
- Hindi glyphs checked at full resolution (Noto Sans Devanagari fallback): conjuncts, nukta and matras correct; no
  missing-glyph boxes.
- Each scene action lands on its words (see `../notes/STORYBOARD.md`). The momentary blank caption at 23.00 s is the
  next caption's fade-in frame, not a gap.

## Defects found and fixed (before the single full render)
1. "नई" heard as "नहीं" → line reworded (see above).
2. Result card "मरम्मत, बदला, रिफ़ंड": "बदला" can read as "revenge", so it became "मरम्मत, बदली या रिफ़ंड", matching s.39(1)(a)–(c).

## Checkpoints
- Ernakulam District Commission order (printed "goods once sold…" notices) is secondary, notes only. The e-Daakhil
  URL was not re-verified. Neither is used on screen.
