# QA: meshline-30s-hindi03-01.mp4 (2026-11-03, Hindi batch 03)

**SHA-256:** `3fcc05cb73dfe1cc81e11edb270b6870ffb780331d081179bc57ea813207650a`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo, stream language tag `hin` | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−14.6 LUFS**, LRA 3.7 LU, **true peak −3.7 dBTP** | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +20.4 to +25.6 dB on all 7 lines | `qa/voice_balance.json` |
| Hindi intelligibility, per line (faster-whisper **medium**, language=hi, local) | Weighted CER **0.079**. Every word was recognised; whisper writes loanwords in Latin script, so they are mapped back before scoring. | `asr_words.json`, `asr_hi.py` |
| Hindi intelligibility, **final MP4** (whisper-medium) | CER **0.124**. Segment times match the caption chunks within about 0.2 s. | `qa/asr_final.json` |
| Captions: script, glyphs | All captions are Devanagari (Noto Sans Devanagari Bold), with conjuncts, matras and nukta shaped correctly and no tofu boxes. The Latin wordmark and "·" fall back to Inter. | `qa/contact-sheet.png`, `qa/boundary-sheet.png` |
| Caption bounds (pixel-exact ink) | 11 chunks; ink y 353–482 (inside the brief's upper band 340–520), x 252–828 (inside 90–990); at most 2 lines with ≥ 11 px between lines; no handoff overlap | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 26 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Pronunciation / words / numbers
- There are no dates, numbers or currency in the narration.
- Loanwords are written the way Hindi speakers say them: एयरप्लेन, मोबाइल, नेटवर्क, वाई-फ़ाई, ब्लूटूथ, ईयरबड्स, इंटरनेट, ऑफ़लाइन, डाउनलोड.
- The brand name is spoken and captioned as मेशलाइन. The on-screen wordmark stays the official Latin "Meshline".
- Residual ASR differences on the final MP4 are accent-level rather than wrong words:
  - The voice softens retroflex consonants: टावर→"तावर", काटता→"कातता", नेटवर्क→"निट्वरक".
  - ऑ is heard as आ/औ.
  - ASR dropped the word यानी at the start of l6.
- Choosing the voice (first draft, whisper-small, CER): hf_alpha 0.201, **hf_beta 0.169**, blend 0.7 hf_alpha + 0.3 hm_omega 0.207. hf_beta was the clearest, and also the fastest, which fits the 30 s timing.

## Visual and accuracy review
- **Mechanism, shown physically:**
  - Hook: the phone gets an "✈ ऑन" tag, yet the earbuds' Bluetooth link keeps pulsing (coral "?").
  - The pen inks the "मोबाइल नेटवर्क" line to the tower with data pulses, then it is cut (coral ×, "जुड़ाव कटा") as the instrument's mobile toggle flips off.
  - The Wi-Fi line to the router is inked. Wi-Fi and Bluetooth go grey/dashed and their toggles turn off, then both re-ink and turn back on.
  - Close-up: a pen-drawn "सीधा रेडियो लिंक" to a nearby phone, with an envelope crossing directly.
  - Wide: the "सीमित पहुँच" reach circle, a far phone "पहुँच से बाहर" behind a coral gap, and a message going phone → Wi-Fi router → "इंटरनेट".
  - Takeaway: the mobile line highlighted coral against the active Wi-Fi/Bluetooth lines with looping tokens, and the matching instrument columns highlighted.
  - CTA: icon and wordmark in the safe area.
- **Claims:** mapped in `research/claims.md`. Nothing about Meshline's radio, range or relay. The CTA is supported by the listing.

## Defects found and fixed
1. Two Devanagari caption lines touched inside the tight Latin band 350–470 (top matras against below-base signs; line gap −5 to 0 px). Captions moved to the brief's upper safe band 340–520 at 50 px, with baselines 398/468 and line gaps ≥ 11 px.
2. Latin text and "·"/"✕" rendered as tofu boxes in the Devanagari font. Fixed with font fallback lists ('HBold, EBold'), and the × is drawn as strokes.
3. In the l4 close-up, the tower and its line sat in the top zone behind the captions. The tower layer now veils in close-ups, and a paper veil covers the caption band only during that shot. An earlier version of this veil also showed as a dark band in the hook, so it is now limited to l4.
4. The earbud sound arcs peeked above the instrument during the tower shot. The arcs overwrote alpha instead of multiplying it; this is fixed, and the earbuds veil during that shot.
5. The "सीमित पहुँच" label overlapped "ईयरबड्स". It moved to the reach circle's upper-left edge.

## Remaining limits (honest)
- **No human listening was possible in this environment.** Intelligibility rests on two independent local ASR passes (whisper-small, whisper-medium) and level metrics. A native Hindi speaker should listen before posting.
- The Kokoro Hindi voices are a mid-quality model: retroflex consonants are softer than in natural speech. It is still the only Hindi-capable voice available here under a commercial-friendly licence (see `LICENSE-NOTES.md`).
- Captions use the 340–520 band rather than the tighter Latin 350–470.
- Wide-shot map labels are small, about 20–24 px.
- The camera is 2D only, with no depth of field.
