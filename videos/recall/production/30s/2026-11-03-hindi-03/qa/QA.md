# QA — `recall-30s-hindi03-01.mp4` (Hindi)

- **File:** `videos/recall/production/30s/2026-11-03-hindi-03/recall-30s-hindi03-01.mp4`
- **sha256:** `1f7e882fc5719bbea9bbeeed6866426783a68bd8c5dfc911ce32f981462127dd`
- **Size:** 10,988,644 bytes

**How it was checked:**
- `qa/qa.py` → `qa_report.json`, `ffprobe.json`, contact and boundary sheets
- `qa/narration_sync.py` → `narration_sync.json`
- `qa/caption_sync.py` → `caption_sync.json`

**Result: all 25 automated checks pass, plus narration sync and caption sync, on render run 2.** Run 1 failed one check: Devanagari caption ink reached y 331. The captions were re-centred and all 900 frames re-rendered.

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 63.2 > 12); longest static run 6 frames (limit < 60) |

## Hindi narration and audio
| check | result |
|---|---|
| language / voice | Hindi (Devanagari script), Kokoro v1.0 **official Hindi voices** hf_beta 0.7 + hm_omega 0.3, lang `hi` (espeak-ng Hindi G2P), speed 0.98 (CTA 1.05). No English voice, no cloned voice |
| Hindi ASR, final mix | faster-whisper **medium** (multilingual), language `hi`: **CER 0.092** over the whole script. Transcript: "गीली अंगलियों से स्क्रीन अजीब हरकते क्यों करती है? शीषे के नीचे बारीक इलेक्ट्रोड का जाल विद्युत क्षेत्र बनाता है अंगली बिजली की सुचालक है सपर्ष होते ही वहां क्षेत्र बदलता है और फोन जगा पहचान लेता है पर पानी भी खषेत्र बदलता है बून्दे नकली टज बना सकती है या असली टज छिपा सकती है तो पहले स्क्रीन और अंगलिया सुखा ले कोई भी नया विशाइ AI से सीखने के लिए RECALL डाउनलोड करे" |
| per-line CER (clean narration WAVs) | 0.048 / 0.077 / 0.043 / 0.141 / 0.065 / 0.114 (mean 0.081) |
| what the residual differences are | mostly spelling: उंगली heard as "अंगली", ष/श, nasalisation dropped (हरकतें→हरकते), क्षेत्र split, टच heard as "टज", विषय as "विशाइ". Loanwords come back in Latin script (AI, RECALL). No word is replaced by a different word |
| numbers, dates, currency | none in the script |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.6 dBTP**, LRA 2.3 LU, 0 clipped samples |
| voice over bed (per line) | +15.4 … +17.6 dB (accepted balance; the bed is raised 4 dB because the Hindi voice renders hotter) |
| music | the accepted pad/pluck engine, retimed; no repeating loop |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | ends (s) | on screen |
|---|---|---|---|---|---|---|
| l01 | 0.20 | 0.200 | −0.1 ms | 0.85 | 3.63 | glass_cu → phone_wet (ghost dots) → react |
| l02 | 3.90 | 3.900 | −0.1 ms | 0.84 | 8.21 | giant_layers (glass, grid) → giant_field (arcs) |
| l03 | 8.45 | 8.450 | −0.1 ms | 0.85 | 14.94 | giant_finger (press 10.6, field change 11.0) → giant_locate (ring 13.5) |
| l04 | 15.15 | 15.150 | −0.1 ms | 0.85 | 21.19 | giant_drops → giant_fake (17.6) → giant_masked (film 19.5, lost 20.1) |
| l05 | 21.95 | 21.950 | −0.1 ms | 0.85 | 24.35 | wipe_cu (napkin, dab) → giant_clean (cloth, one clean touch) |
| l06 | 25.80 | 25.800 | −0.1 ms | 0.84 | 29.80 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment (`caption_sync.json`)
Each caption's words were located in the Hindi word timings. All 11 spoken caption groups appear 0.00–0.11 s before their first word (one is 0.01 s after it) and stay up until after their last word. The takeaway "सूखी स्क्रीन, सही टच।" is on screen only, with no VO, by design.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are Devanagari Hindi | yes: no Latin words in any caption (`caption_latin_words` = []) |
| font coverage | `document.fonts.check` true for every caption, label and screen string with Baloo 2 (OFL) Devanagari 600/700. Full-resolution frames show correct conjuncts and matras (स्क्री, स्प, क्षे, र्श) and no missing-glyph boxes |
| caption ink bounds | x 164–907, **y 341–485** (limits x 90–990, y 340–520); ≤ 2 lines; 56 px |
| y < 300 | no meaningful text |
| labels | Hindi, inside x 100–980, y 560–1460; no overlaps with captions or brand |
| readable screen | phone ≈ 60 % of frame width in the POV inserts. Generic sketch app "स्केच" (not Recall's UI) |

## Visual review
**What I checked:**
- `contact_sheet.png` (one frame per second) and `boundaries.png` (first and last frame of all 15 shots, plus each caption start);
- full-resolution frames at 1.6, 11.7, 18.3, 25.4 and 28.0 s.

**Fixed before the final render, from preview stills:**
1. The glass grab and its extended finger.
2. The palm covering the screen in the POV inserts.
3. The phone sitting under the captions.
4. Water drops that read as grey pebbles.
5. The upside-down phone in the wipe shot.
6. Giant water vanishing before the cloth reached it.
7. The Recall pill touching the hair.

## Limits (honest)
- **I cannot listen.** Hindi intelligibility and pronunciation were checked with multilingual ASR (CER), espeak-ng phoneme review of key words, and three wording changes; a native listener has not reviewed the audio. Kokoro's Hindi voices are less natural than its English ones.
- **The CTA line runs 4.0 s,** occupying the final 4.2 s, slightly over the 3–4 s target because the Hindi sentence is longer.
- **"With AI" is the user's wording.** It is not found in the saved listing or the public site text (context 16/17).
- **The touchscreen visuals are illustrations.** The giant cross-section, arcs and signal discs are not an engineering drawing of a specific phone, and the application notes cited cover capacitive touch buttons/keypads.
