# QA: meshline-30s-hindi04-01.mp4 (2026-11-04, Hindi batch 04)

**SHA-256:** `5239f66af914a1454115cdd74cae91c6a0f5e3a4e9f2ceea2c81f79006326a25`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo, stream language tag `hin` | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−14.5 LUFS**, LRA 2.5 LU, **true peak −3.6 dBTP** | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +22.0 to +26.4 dB on all 7 lines | `qa/voice_balance.json` |
| Hindi intelligibility, per line (faster-whisper **medium**, language=hi, local) | Weighted CER **0.095**. Every word was recognised; whisper writes "GPS" in Latin script, which is mapped back before scoring. | `asr_words.json` |
| Hindi intelligibility, **final MP4** (whisper-medium) | CER **0.092**. All words are present, and segment starts (4.36, 7.60, 10.12, 12.66, 14.62, 17.52, 22.36, 26.00 s) fall within about 0.1 s of the caption chunk starts | `qa/asr_final.json` |
| Narration / caption timing | Each chunk starts at the ASR time of its first word (−0.05 s); 10 chunks, no handoff overlap. The CTA plays 26.00–29.73 s (the last 4 s). | `asr_words.json`, `captions.json` |
| Captions: script, glyphs | Devanagari (Noto Sans Devanagari Bold) with conjuncts, matras and nukta shaped correctly and no tofu boxes. "→", "·" and the Latin wordmark fall back to Inter. | `qa/contact-sheet.png`, `qa/boundary-sheet.png` |
| Caption bounds (pixel-exact ink) | Ink y 353–482 (inside the upper band 340–520), x 189–891 (inside 90–990); at most 2 lines with ≥ 11 px between lines | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 26 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Pronunciation / words / numbers
- There are no dates, numbers or currency in the narration.
- Loanwords are written the way Hindi speakers say them: जीपीएस, सैटेलाइट, मोबाइल, डेटा, मैप, इंटरनेट, वाई-फ़ाई, सेव, ऑफ़लाइन, डाउनलोड.
- The brand is spoken and captioned as मेशलाइन; the on-screen wordmark stays the official Latin "Meshline".
- Residual ASR differences are accent-level rather than wrong words. As in batch 03, the voice softens retroflex and flap consonants:
  - सड़कें→"सर्के", नक्शा→"नक्षा", ज़रूरी→"जरूडी";
  - l6 ("सैटेलाइट जगह बताते हैं, सेव नक्शा सड़कें") was the least clear line, at CER 0.22, though still recognisable.

## Visual and accuracy review
- **Mechanism, shown physically:**
  - Hook: a "डेटा बंद" tag and "?" on a phone whose blue location halo sits on blank tiles.
  - Satellites send dashed one-way rays with arrowheads and downward-only pulses. Fix circles lock onto "आपकी जगह".
  - The blank tiles turn coral ("सड़कें नहीं"), and tiles from "इंटरनेट" fizzle at a coral × while data is off.
  - A Wi-Fi router replaces the ×, tiles stream in and print streets, the pen draws the route to "मंज़िल", the "सेव इलाका" frame covers the whole route, and a "✓ ऑफ़लाइन जाँचा" stamp appears.
  - Takeaway "सैटेलाइट → जगह / सेव नक्शा → सड़कें" while the phone travels the route.
  - CTA signature in the safe area.
- **Instrument (screen space, y 1418–1574):** three rows that change with the narration:
  - मोबाइल डेटा: बंद;
  - जगह: from "…" to "सैटेलाइट सिग्नल से ✓";
  - सड़कें: from "नक्शा: इंटरनेट से ?" to "सेव नक्शे से ✓".
- **Claims:** mapped in `research/claims.md`. There is no Meshline map or GPS claim. The CTA states the real scope (nearby, offline), which the listing supports.

## Defects found and fixed
1. The caption anchor "सेव" matched the ASR word "से", so chunk l5b started 3 s early (17.87 instead of 20.75). Short words now must match exactly.
2. In the instrument's row 2, "नक्शा: इंटरनेट से ?" crossfaded on top of "सेव नक्शे से ✓" at 21.0 s. They now swap in sequence.
3. The "ऑफ़लाइन जाँचा" stamp text overflowed its pill, and the pill touched the instrument plate. The pill is now sized from the measured text and moved up.

## Remaining limits (honest)
- **No human listening was possible in this environment.** Intelligibility rests on local whisper-medium ASR and level metrics. A native Hindi speaker should listen before posting.
- The Kokoro Hindi voice softens retroflex consonants.
- Wide-shot map labels are about 20–25 px.
- The camera is 2D only. Three satellites are drawn as an illustration.
