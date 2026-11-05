# QA — Media Diet · Hindi episode feedback-05 · "Android screen-share privacy now blanks login and payment fields in Chrome"

**File:** `videos/media-diet/production/30s/2026-11-05-feedback-05/media-diet-30s-feedback05-01.mp4`
**SHA-256:** `ff8d7b8806d0ff9e9cba72cd6ebe27a67ae7db9c4ed9ac40ab27fae299c9cc72` · 16,319,114 bytes · 4352 kb/s · audio stream tagged `hin`
Style: Layered Tech Cutaway, accepted recipe unchanged (context/11). Build: `bash build/build.sh` (two parallel frame workers, then audio, encode, QA).

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−14.9 LUFS** integrated, true peak **−2.1 dBTP** | qa/loudness.txt |
| captions (Devanagari, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **362–493**, x 232–845, 880 frames with captions | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (top 300 px and bottom clear; all text x 90–990) | qa/text-bounds.json |
| caption ↔ speech (narration stem used in the mix) | **8/8 cues OK**: each cue appears 0.10–0.11 s before its speech and stays 0.07–0.35 s after | qa/caption-sync.json |
| Hindi intelligibility (Whisper medium, hi) | full pass CER **0.088**; per-line slices CER **0.102**; every line heard, date "14 अक्टूबर" and "पंद्रह" exact | qa/asr.json |
| music quiet beneath speech (stems, per line) | speech −15.4…−16.3 dB RMS; music −30…−35 dB; foley −36…−50 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 6 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### Hindi ASR (final export, Whisper medium, per-line slices)
| line | spoken | Whisper | CER |
|---|---|---|---|
| V1 | स्क्रीन शेयर पर कोई आपका पासवर्ड देख ले? | स्क्रीन शेयर पर कोई आपका पासवर्ट देखले. | 0.03 |
| V2 | चौदह अक्टूबर से गूगल ने ऐंड्रॉइड पर नया बचाव शुरू किया। | 14 अक्तूबर से गूगल ने अंड्रोईड पर नया बचाव शुरू किया | 0.18 |
| V3 | लाइव स्क्रीन शेयर में, क्रोम के लॉगिन और पेमेंट हिस्से अब अपने-आप छिप जाते हैं। | लाइव स्क्रीन शेयर में ख्रोम के लॉगिन और पेमेंट हिस्से अब अपने आप चिप जाते हैं. | 0.03 |
| V4 | सामने वाले को स्क्रीन दिखती है, पर वहाँ खाली पर्दा। | सामने वाले को स्क्रीन दिक्ती है पर वहां खाली पर्दा. | 0.05 |
| V5 | यह ऐंड्रॉइड पंद्रह और ऊपर के फ़ोनों में आ रहा है। | यह है अंड्रोईड पंद्रह और उपर के फोनों में आ रहा है। | 0.16 |
| V6 | अपना वर्ज़न देखें: सेटिंग्स, अबाउट फ़ोन, ऐंड्रॉइड वर्ज़न। | अपना वर्जन देखें सेटिंग्स अबावट फोन अंड्रोई वर्जन | 0.12 |
| V7 | टेक्नोलॉजी समझनी हो, तो मीडिआ डाइट फ़ॉलो करें। | तेक्नोलोजी समझनी हो तो मीदिया डाइट फालो करें | 0.17 |
Remaining differences are Whisper spellings (digits for "चौदह", अंड्रोईड, छ/च in "छिप" — the isolated take was heard as "छिप").
**I cannot listen to audio in this environment;** ASR + stem levels + per-take phoneme checks are the proxy. Please listen once before posting.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Accepted look retained | Same paper stock, key light, restrained bokeh, palette, table + hills, vignette, Devanagari caption band, calendar, "?" tag, Media Diet sign. |
| Immediate hook | Frame 0 already shows the threat: the viewer's monitor mirrors the phone's login page; password dots fill from 0.6 s while a paper eyeball perched on the monitor stares down at them. |
| Scene progression (6 cuts) | S1 hook · S2 calendar → 14 अक्टूबर, shield drops onto the phone · S3 phone + monitor: login shutter, then payment shutter, on the viewer's copy only · S4 eyeball searches blank panels, half-closes, "?" · S5 version blocks: 15/16/17 rise with shields, 13/14 tip back · S6 Settings → About phone → Android version 15 ✓ · S7 hero + sign (CTA). |
| No static pages | Every shot has object action on its line; eased camera moves only, no bobbing. |
| Accuracy | Date and eligibility spoken ("14 अक्टूबर से", "पंद्रह और ऊपर", "आ रहा है" = rolling out); generic page/settings glyphs; no Google/Chrome UI or logos. |

## Fixes during this round (each fixed once)
1. Pre-render wording (ASR on each take): "नए फ़ोनों" heard as "नहीं फोनों" → "पंद्रह और ऊपर"; "छिपते" → "छिप जाते हैं"; script trimmed to fit a 3.96 s CTA.
2. Staging (stills): the watcher eyeball only showed its back when standing in front of the monitor → perched on the monitor like a webcam, gazing down; hook/S4 recomposed below the caption band; "?" moved clear of the captions; set re-laid so phone and monitor stack in the portrait frame; version blocks moved out from behind the calendar.
3. Audio (first encode): "पंद्रह" was masked by a version-block thud in the mix (heard as "बंद्रह") → thud removed and event foley dipped under speech (`fx *= 1 − 0.5·voice-envelope`); re-encoded from the same frames; the word is now recognised in both passes.

## Remaining limitations (honest)
- Stock synthetic Hindi voice (approved Kokoro Hindi setup; Meshline/Recall cache not present in this container).
- Staged rollout: "rolling out this month to Android 15+ devices" — not every Android 15+ phone may show it yet; the narration says "आ रहा है".
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed to the branch.
