# QA: meshline-30s-feedback05-01.mp4 (batch 2026-11-05-feedback-05, Hindi)

**SHA-256:** `7ba35b646d94a35f6d446cb823f6afa8db338dca3d8e5189ddce6939e43c5099`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo, stream language tag `hin` | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−14.6 LUFS**, LRA 2.9 LU, **true peak −3.4 dBTP**; music stays quiet under speech | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +22.1 to +25.9 dB on all 7 lines | `qa/voice_balance.json` |
| Hindi intelligibility, per line (faster-whisper **medium**, language=hi, local) | Weighted CER **0.072**; every word recognised | `asr_words.json` |
| Hindi intelligibility, **final MP4** | CER **0.078**. The only word-level miss is "फ़ोन" right after "हेडफ़ोन," in l2, which ASR merged. Segment starts (3.94, 7.70, 11.30, 13.30, 18.84, 22.70 s) fall within ~0.25 s of the caption chunk starts. | `qa/asr_final.json` |
| Narration / caption timing | Each chunk starts at the ASR time of its first word (−0.05 s); 9 chunks, no handoff overlap. The CTA plays 25.99–29.72 s. | `asr_words.json`, `captions.json` |
| Captions | Devanagari (Noto Sans Devanagari Bold, Inter fallback), no tofu boxes. Ink y 353–482 (inside 340–520), x 189–891 (inside 90–990), at most 2 lines with ≥ 11 px between lines. The top 300 px are clear. | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 24 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Pronunciation / words / numbers
- There are no dates, numbers or currency in the narration.
- Loanwords are written the way Hindi speakers say them: हेडफ़ोन, ब्लूटूथ, रेडियो, कंक्रीट, सिग्नल, मोबाइल, टावर, लिंक, ऑफ़लाइन, डाउनलोड.
- The brand is spoken and captioned as मेशलाइन; the on-screen wordmark is the official Latin "Meshline".
- Residual ASR differences are accent-level, as in batches 03–04: the voice softens retroflex consonants (टूटने→"तूटने", टावर→"तावर", जुड़ते→"जुरते").

## Visual and accuracy review
- **Hook:** the problem is visible from frame 1. The headphones are already behind the hatched "मोटी दीवार", the link breaks at the wall with coral sparks, and the waveform shows coral dropouts by 0.4 s.
- **Consistent instrument:** the Bluetooth bars and waveform come from the drawn geometry (distance + wall crossing + noise), so they always match the map:
  - behind the wall: 0–1 bars, choppy audio;
  - after the walk back: 4 bars, solid audio;
  - stepping behind the wall again in l5: Bluetooth drops while the "मोबाइल टावर" row stays at 4 bars. This is the bars ≠ headphone-link demonstration.
- **Claims:** mapped in `research/claims.md`. The test sentence names "दूरी या रुकावट" (distance or obstruction) because the test changes both. The CTA carries the documented scope (nearby, offline).

## Defects found and fixed
1. The "आवाज़ साफ़" stamp covered the phone label. It moved below the headphones, and the phone label moved above the table.
2. The "कम दूरी" tag sat on the headphones. It moved below the table.
3. "सिग्नल बार: यह लिंक" ran into "मोटी दीवार" in the wide shot. It is now right-aligned left of the tower line.
4. Two takeaway tags were moved to match the measured word times ("कम दूरी" 24.06 s, "साफ़ रास्ता" 24.68 s).

## Remaining limits (honest)
- **No human listening was possible here.** Intelligibility rests on local whisper-medium ASR and level metrics. A native Hindi speaker should listen before posting.
- The Kokoro Hindi voice softens retroflex consonants.
- Map labels in the wide shots are about 20–25 px.
- The link-quality formula is illustrative, not measured.
