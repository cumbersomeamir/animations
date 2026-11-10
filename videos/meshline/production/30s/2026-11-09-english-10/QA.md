# QA: meshline-30s-english10-01.mp4 (batch 2026-11-09-english-10)

**SHA-256:** `cc71097a9a1e937f5a2530509d2ee6114b2c76f7e54985f4ebd6f185be59f6c9`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−15.1 LUFS**, LRA 3.7 LU, **true peak −2.5 dBTP**; music stays quiet under speech | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +19.0 to +28.6 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (faster-whisper base.en) | All 7 lines verbatim, apart from punctuation | `asr_words.json` |
| ASR on the **final MP4** | **WER 0.0**. The audio stream of the final file is bit-identical to the one scored (decoded PCM sha256 `18763b15…`); the last two rebuilds changed video framing only. | `qa/asr_final.json` |
| Narration / caption timing | Each chunk starts at the ASR time of its first word (−0.05 s); 11 chunks, no handoff overlap. The CTA plays 26.14–29.55 s (the last 3.9 s). | `asr_words.json`, `captions.json` |
| Caption bounds (pixel-exact ink) | Ink y 360–468 (inside 350–470), x 157–921 (inside 90–990), at most 2 lines. The top 300 px are clear. | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 19 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Visual and accuracy review
- **Hook (first second):** close on the phone, which shows a full Wi-Fi fan with a spinning loader ("Wi-Fi: full bars", "page: loading…", coral "?"). The instrument reads "Wi-Fi radio · phone ↔ router · full".
- **Radio link:** the dashed phone ↔ router link is highlighted ("Wi-Fi radio link", "bars = this link").
- **Second link:** the pen draws the solid router ↔ "internet provider" link ("internet link"), then it is cut: coral ×, "down", and the instrument row "internet · router ↔ provider · down". A page request crosses the Wi-Fi link fine and fizzles at the cut ("nothing gets through"), while "bars = this link" stays full.
- **Check:** "another device" joins over Wi-Fi and fails too (spinner and ×). The cut is labelled "the problem is here" and the phone "phone: OK".
- **Fix:** "check cables" (plug) and "restart" (power icon). The link re-inks blue ("back up"), the instrument shows "up ✓", and both devices show ✓.
- **CTA:** icon and wordmark.
- **Claims:** mapped in `research/claims.md` (Android Developers, Google Pixel Help).

## Defects found and fixed
1. The hook was too small to read (the full bars and spinner were tiny). It now opens close on the phone with "Wi-Fi: full bars" / "page: loading…" tags.
2. A stray dot appeared where the second device later connects: a zero-length link was drawn because of a floating-point `outBack(0) > 0`. The link is now drawn only after the device appears.
3. At the hook zoom the cartouche clipped at the right edge and the tags sat on the radio link. The cartouche moved upper-left and the tags below the link.
4. During cables/restart the device labels touched the instrument plate, and "check cables" sat on the second device's Wi-Fi line. The shot was widened and the label moved beside the plug.

## Remaining limits (honest)
- No human listening; this relies on ASR and level metrics.
- The camera is 2D only.
- The router/provider status shown is illustrative; real routers differ.
