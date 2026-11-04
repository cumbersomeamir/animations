# QA — `recall-30s-hindi04-01.mp4` (Hindi)

- **File:** `videos/recall/production/30s/2026-11-04-hindi-04/recall-30s-hindi04-01.mp4`
- **sha256:** `2f6396271dc4eef54901c407fb0a272867b7faeb1a4a1977fc77bee01f5ffd88`
- **Size:** 13,821,221 bytes

**How it was checked:**
- `qa/qa.py` → `qa_report.json`, `ffprobe.json`, contact and boundary sheets
- `qa/narration_sync.py` → `narration_sync.json`
- `qa/caption_sync.py` → `caption_sync.json`

**Result: all 25 automated checks, narration sync and caption sync pass on the first full render.** Caption sync was also run before the render, where it caught and fixed a late caption.

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 43.3 > 12); longest static run 3 frames (limit < 60) |

## Hindi narration and audio
| check | result |
|---|---|
| language / voice | Hindi in Devanagari. Voice: Kokoro v1.0 official Hindi voices hf_beta 0.7 + hm_omega 0.3, lang `hi`, speed 0.98 (CTA 1.05) — the accepted H03 setup. No English voice, no cloned voice |
| Hindi ASR, final mix | faster-whisper medium (multilingual), language `hi`: **CER 0.109**. Transcript: "इंडक्षन पर आग नहीं दिकती, फिर बर्तन गर्म कैसे होता है? नीचे लगी तामे की कुन्डली तेजी से बदलता चुम्बक शेत्र बनाती है यहक शेत्र लोहे वाले तले में भणवर धाराएं बनाता है जिससे तला खुद गर्म होता है अल्यूमिनियम या शीषे के बर्तन अकसर गर्म नहीं होते तो तले पर चुम्बक लगाएं, चिपक जाएं तो बर्तन गर्म हो सकता है कोई भी नया विशाइ AI से सीखने के लिए RECALL डाउन्लोड करे" |
| per-line CER (clean WAVs) | 0.071 / 0.078 / 0.081 / 0.143 / 0.023 / 0.114 (mean 0.085) |
| what the residual differences are | spelling only: क्ष/श, ष/श, nasal marks (तांबे heard as "तामे"/"तामबे", which is the spoken form), aspiration (दिखती→दिकती), and loanwords in Latin script. Every word is recognised; none is replaced by a different word |
| numbers, dates, currency | none |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.5 dBTP**, LRA 2.6 LU, 0 clipped samples |
| voice over bed (per line) | +14.3 … +17.7 dB (accepted balance) |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.20 | 0.200 | −0.1 ms | 0.83 | stove_cu → react (peek) → pot_steam |
| l02 | 4.45 | 4.450 | −0.1 ms | 0.84 | giant_coil (coil glow 5.6) → giant_field (loops 6.4, flips) |
| l03 | 9.20 | 9.200 | −0.1 ms | 0.83 | giant_eddy (pot lands 9.65, rings 11.4) → giant_heat (glow 13.3, bubbles 13.8) |
| l04 | 15.35 | 15.350 | −0.1 ms | 0.84 | giant_alu (pan slides in 15.3–15.75) → alu_real |
| l05 | 19.95 | 19.950 | −0.1 ms | 0.84 | magnet_test (slides off aluminium 21.05; snaps onto steel 21.9) → pot_back |
| l06 | 25.80 | 25.800 | −0.1 ms | 0.84 | cafe_wide (CTA, Recall pill, sip) |

## Caption ↔ speech alignment
All 9 spoken caption groups appear 0.05–0.45 s before their first spoken word and stay up until after their last. The 0.45 s lead is the "जिससे…" caption, which starts on the cut. The takeaway "चुंबक से जांचें, फिर पकाएं।" is on-screen only (no VO), by design.

**Pre-render fix:** "तेज़ी से बदलता…" first appeared 0.48 s after "तेज़ी" was spoken. The caption boundary moved from 6.85 s to 6.30 s.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are Devanagari Hindi | yes: no Latin words (`caption_latin_words` = []) |
| font coverage | `document.fonts.check` true for every caption and label with Baloo 2 Devanagari. Frames show correct conjuncts and matras with no missing-glyph boxes |
| caption ink bounds | x 164–907, **y 342–484** (limits x 90–990, y 340–520); ≤ 2 lines |
| y < 300 | no meaningful text |
| labels | Hindi, inside x 100–980, y 560–1460; no overlaps |

## Visual review
**What I checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 14 shots, plus each caption start).

**Fixed before the render, from preview stills:**
1. The steel rendered black (metalness without an environment map).
2. The opening framing didn't show the plate.
3. The field loops drowned out the eddy rings; the rings were hidden in the translucent liquid.
4. The bubbles were dark.
5. The aluminium shot was cropped, and the caption sat over the face.
6. The palm blocked the magnet test.

**Known soft spot:** a 0.3 s whip-pan between the two vessels (21.35–21.7 s) briefly shows only the plate edge.

## Limits (honest)
- **I cannot listen.** Hindi intelligibility was checked by multilingual ASR, by espeak-ng phoneme review and through three wording changes; no native speaker has listened. Kokoro's Hindi voice is less natural than its English voices.
- **The requested topic was replaced.** The microwave-turntable topic duplicates R02, so a distinct topic was used per the user's rule (context 18).
- **"With AI" is the user's wording** and is not found in the saved listing or public site text.
- **The cutaway is illustrative.**
