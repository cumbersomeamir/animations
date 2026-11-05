# QA — `recall-30s-feedback05-01.mp4` (Hindi)

- **File:** `videos/recall/production/30s/2026-11-05-feedback-05/recall-30s-feedback05-01.mp4`
- **sha256:** `db4bbc78bcfe680f90b30fe308501c80010e0623e923e45518668aa301cf22e9`
- **Size:** 8,330,597 bytes

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`, `ffprobe.json`, `narration_sync.json` and `caption_sync.json`.

**Result: on the first full render (9 m 49 s), all 25 automated checks pass, and so do narration sync and caption sync.** Caption sync was also run before rendering and fixed one late caption.

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 15.3 > 12, from the dark wave panel); longest static run 7 frames (limit < 60) |

## Hindi narration and audio
| check | result |
|---|---|
| language / voice | Hindi in Devanagari, using Kokoro v1.0 official Hindi voices hf_beta 0.7 + hm_omega 0.3, lang `hi`, speed 0.98 (CTA 1.05). The diegetic "अरे, सुनो!" uses official Hindi voice hm_psi. No English voice and no cloned voice |
| Hindi ASR, final mix | faster-whisper medium (multilingual), language `hi`: **CER 0.076**. Transcript: "अरे सुनो। हेडफोन ने ऐसी की गुंज दबा दी, पर दोस्त की आवाज क्यों सुनाई दी? बाहर का माईक शोर सुनता है, और स्पीकर उसकी उल्टी लहर बजा कर उसे घटाता है. पर उल्टी लहर ज़रा देर से बनती है, धीमी गुंज में चल जाता है, आवाजों की तेज लहरों में नहीं. तो ये प्लेन त्रेन या ऐसी की गुंज में सब से ज्यादा मदद करते हैं. कोई भी नया विषय AI से सीखने के लिए, रिकाल डाउनलोड करें." |
| what the residual differences are | spelling only: एसी heard as "ऐसी" (the same spoken sound as the abbreviation AC), nasal marks (गूंज → गुंज), ट्रेन → त्रेन. "अरे सुनो" (the diegetic call) is also recognised |
| numbers, dates, currency | none |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.5 dBTP**, LRA 3.0 LU, 0 clipped samples |
| voice over bed | +15.9 … +17.7 dB per line (music quiet under speech) |
| hook demonstration | AC drone audible 0–0.45 s, then about 15 dB lower once ANC is on; "अरे, सुनो!" at 0.75 s stays clear |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 1.55 | 1.550 | −0.1 ms | 0.84 | react (puzzled, touches the cup) → giant_cup |
| l02 | 6.00 | 6.000 | −0.1 ms | 0.84 | giant_cup (mic glows 7.1) → giant_anti (driver 8.4, opposite wave 9.3, sum 10.7) |
| l03 | 11.70 | 11.700 | −0.1 ms | 0.85 | giant_delay ("देर" band 12.6) → giant_slow (14.0) → giant_fast (15.95) |
| l04 | 18.80 | 18.800 | −0.1 ms | 0.86 | giant_sources (plane 19.1, train 19.66, AC 20.22; hums flatten 21.5) |
| l05 | 25.80 | 25.800 | −0.1 ms | 0.84 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 10 spoken caption groups appear 0.03–0.13 s before their first spoken word and stay until their last.
- The takeaway "एक-सी गूंज पर सबसे ज़्यादा असर।" is on-screen only (no VO).
- The speech bubble "अरे, सुनो!" covers the diegetic call at 0.75–1.55 s.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are Devanagari Hindi | yes: no Latin words (`caption_latin_words` = []) |
| font coverage | `document.fonts.check` true for every caption, label and the speech bubble (Baloo 2 Devanagari) |
| caption ink bounds | x 164–907, **y 342–484** (limits x 90–990, y 340–520); ≤ 2 lines |
| y < 300 | no meaningful text |
| labels / bubble | inside x 100–980, y 560–1460; no overlaps with captions or brand |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 11 shots, plus each caption start).

**Fixed before the render (from preview stills):**
1. The hook framing: the AC moved closer behind the performer so the face, cup and AC hum share the frame.
2. The react framing.
3. The giant cup's part rotations, which needed a rebuild.
4. The framing of the plane/train/AC sources, with the wave lanes hidden in that shot.
5. The "देर" band: it is now visible, and the wave clock slows with a crest phase-locked in view (including a sign fix).

**Soft spot:** at 3.75–6 s the giant cup sits mostly off-frame left while the noise wave enters the panel. It comes fully into view when "माइक" is spoken.

## Limits (honest)
- I cannot listen. Hindi intelligibility was checked by multilingual ASR and one homophone fix; no native speaker has listened yet.
- The waves are illustrative: one sourced reason (delay versus frequency) is isolated. Real ANC also uses feedback microphones, adaptive filtering and passive sealing.
- "With AI" in the CTA is the user's wording and is not found in the saved listing or public site text.
- The performance snapshot is the user's data. No causal claim is made from it.
