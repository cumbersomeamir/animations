# QA — Media Diet · Hindi episode hindi-03 · "iOS 27.2: iPhone AI images get Google's invisible SynthID watermark — how to check"

**File:** `videos/media-diet/production/30s/2026-11-03-hindi-03/media-diet-30s-hindi03-01.mp4`
**SHA-256:** `a4848025f89e51dd97853bedabeba47b0f1457c7ffbbeb0c716721702b0dea19` · 16,342,177 bytes · 4358 kb/s · audio stream tagged `hin`
Style: Layered Tech Cutaway, accepted recipe unchanged (context/11). Build: `bash build/build.sh` (two parallel frame workers, then audio, encode, QA).

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.0 LUFS** integrated, true peak **−2.0 dBTP** | qa/loudness.txt |
| captions (Devanagari, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **362–494**, x 265–816, Noto Sans Devanagari 700 at 48 px, 883 frames with captions | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (no text y < 300 or > 1600; all text x 90–990) | qa/text-bounds.json |
| Hindi intelligibility + timing (Whisper medium, language hi, on the encoded file) | overall CER **0.055** (Devanagari-normalised; brand names Whisper writes in Latin mapped back); **all 8 lines heard inside their scripted windows** | qa/asr.json |
| glyph rendering | full-resolution caption crops checked: conjuncts (स्व, क्ट, न्स), nukta (ज़, फ़, क़), matras, anusvara and danda render; no missing-glyph boxes | stills + contact sheets |
| contact sheets | representative (1 frame/s) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### Hindi ASR pass (final export, Whisper medium)
| line | scripted window (s) | heard (s) | Whisper transcript | CER |
|---|---|---|---|---|
| V1 | 0.15–2.55 | 0.00–2.58 | यह तस्वीर असली है या AI की? | 0.00 |
| V2 | 2.82–7.77 | 2.84–7.82 | 26 अक्टूबर के Apple Update iOS 27.2 में सुराग है | 0.00 |
| V3 | 8.04–11.64 | 7.82–11.66 | iPhone के AI तूल से बनी या बदली तस्वीरों | 0.11 |
| V4 | 11.91–15.71 | 11.66–15.88 | में Google का अद्रिश्य सीन्थ ID Watermark जुरता है | 0.28 |
| V5 | 15.98–18.30 | 15.88–18.52 | 15 Pro और बाद के iPhone पर | 0.00 |
| V6 | 18.58–22.66 | 18.52–22.82 | Google के मुताबिक सीन्थ ID डिटेक्टर इसे पहचानता है | 0.07 |
| V7 | 22.94–25.86 | 22.82–26.12 | निशान ना मिलना असली होने का सबूत नहीं | 0.03 |
| V8 | 26.13–29.39 | 26.12–29.36 | टेक्नोलजी समझनी हो तो Media Diet फालो करे | 0.08 |
Remaining differences are Whisper spelling variants (तूल/टूल, अद्रिश्य/अदृश्य, जुरता/जुड़ता for the ड़ flap, फालो करे/फ़ॉलो करें)
plus V3's last word "में" landing in V4's half of the pause. Dates and numbers came back exactly ("26 अक्टूबर", "iOS 27.2", "15 Pro").
**I cannot listen to audio in this environment;** this back-transcription plus the phoneme checks below are the proxy.
Please listen once before posting.

### Pronunciation checks before rendering (espeak-ng Hindi phonemes + Whisper on test takes)
- "नए मॉडल" was heard as "नहीं model" → replaced by "बाद के" (now heard exactly).
- "सिंथआईडी" was flapped to "सिन्थाईरी" → spoken as "सिंथ आई डी" (heard as "सीन्थ ID"); caption keeps "सिंथआईडी".
- Numbers spoken as Hindi words (छब्बीस अक्टूबर, आईओएस सत्ताईस पॉइंट दो, पंद्रह प्रो); no currency in this episode.
- Speed 1.10 broke the brand name; 1.08 kept it intact and fits 30 s.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Accepted look retained | Same paper stock, key light (−11, 10, −4), restrained bokeh, ACES, brand palette, table + paper hills, vignette, caption band, "?" tag, paper Media Diet sign. |
| Scene progression (7 cuts) | S1 mystery photo + "?" · S2 calendar flips to 26 अक्टूबर, phone update ring around 27.2 → ✓ · S3 wand + sparkles, a picture unfolds up (made), a photo's edges unfold (changed) · S4 stamp presses with no visible change; magnifier reveals the hidden pattern only under the lens · S5 phones 14/15 stay down, 15 प्रो/16/17 stand up and light · S6 picture copy flies into the laptop detector, scan, pattern + ✓ · S7 mystery photo scanned, hollow "–", "?" returns · S8 hero + Media Diet sign (CTA). |
| No static pages | Every shot has an object action on its line; eased camera moves only, no bobbing. |
| Text | Hindi captions only, plus printed props (calendar date/month, 27.2 on the phone, phone-row tags, sign). No source links on screen. |
| Accuracy | Released update with Apple's date; device list from Apple's notes; detector claim attributed to Google; "no mark ≠ real" qualifier in its own sentence; generic devices/glyphs, no Apple/Google UI or logos. |

## Fixes during this round
1. Voice timing: 75 words at 0.98 ran 31.5 s → script tightened to 66 spoken words and speed 1.08 (ASR-tested).
2. Wording/pronunciation: "नए" → "बाद के"; "सिंथ आई डी" as the spoken form (see above).
3. Framing (stills): laptop under the S3 camera → props re-laid; phone row too small/blocked → moved to the open front-right with its own set-up; "?" tag overlapping the caption band → lowered; CTA sign cut at the edge → recentred.
4. Devanagari line spacing: baselines 406/480 (instead of 414/478) so matras of the two lines never touch; ink stays in y 362–494.
5. QA script: the Hindi ASR pass now splits words at pause centres (the first version's ±0.35 s overlap counted the previous line's last word).

## Remaining limitations (honest)
- Kokoro's Hindi voices are stock synthetic voices (no cloning); prosody is plainer than a human Hindi narrator.
- The visible dot pattern illustrates an invisible, software-read watermark; it is not what SynthID looks like.
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed to the branch.
