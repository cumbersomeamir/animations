# QA — Media Diet · Hindi episode hindi-04 · "Google Play Store (2 Nov 2026) now reminds you if Play Protect stays off"

**File:** `videos/media-diet/production/30s/2026-11-04-hindi-04/media-diet-30s-hindi04-01.mp4`
**SHA-256:** `aa815eb04ce787cd2513904d0be77b02ad5307e66720fd28740b30ff350c38d2` · 20,023,902 bytes · 5340 kb/s · audio stream tagged `hin`
Style: Layered Tech Cutaway, accepted recipe unchanged (context/11). Build: `bash build/build.sh` (two parallel frame workers, then audio, encode, QA).

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−14.9 LUFS** integrated, true peak **−2.0 dBTP** | qa/loudness.txt |
| captions (Devanagari, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **362–494**, x 202–875, 878 frames with captions | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (no text y < 300 or > 1600; all text x 90–990) | qa/text-bounds.json |
| caption ↔ speech alignment (narration stem used in the mix) | **9/9 cues OK**: each cue appears 0.10–0.15 s before its speech and stays 0.12–0.35 s after it ends | qa/caption-sync.json |
| Hindi intelligibility (Whisper medium, hi, per-line slices of the final mix) | overall CER **0.065**; every line heard in its own slice | qa/asr.json |
| speech vs background (stems, per line) | speech −15.4…−16.7 dB RMS; music −30…−35 dB; foley −33…−43 dB (voice-forward) | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 6 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### Hindi ASR (final export, Whisper medium, one pass per line slice)
| line | spoken | Whisper | CER |
|---|---|---|---|
| V1 | प्ले प्रोटेक्ट बंद करके भूल गये? | प्ले प्रोटेक्ट बंद करके भूल गये | 0.00 |
| V2 | दो नवंबर के गूगल प्ले स्टोर अपडेट के बाद, | दो नवंबर के Google Play Store अपडेट के बाद | 0.00 |
| V3 | यह कुछ समय बंद रहा, तो ऐंड्रॉइड फ़ोन पर याद दिलाया जाएगा। | यह कुछ समय बंद रहा तो अंड्रूइड फोन पर याद दिलाया जायेगा. | 0.09 |
| V4 | प्ले प्रोटेक्ट ऐप को इंस्टॉल पर जाँचता है, और फ़ोन को समय-समय पर स्कैन करता है। | PlayProtect app को install पर जाजता है और phone को समे-समे पर scan करता है | 0.07 |
| V5 | ख़तरनाक ऐप मिले, तो चेतावनी देता है, और उसे बंद या हटा भी सकता है। | खतरनाक अप मिले तो चेतावनी देता है और उसे बंध या हटा भी सकता है। | 0.04 |
| V6 | चालू रखें: प्ले स्टोर, प्रोफ़ाइल, प्ले प्रोटेक्ट, सेटिंग्स। | चालू रखें प्ले स्टोर प्रोफाईल प्ले प्रोटेक्ट सेटिंग्जू | 0.07 |
| V7 | टेक्नोलॉजी समझनी हो, तो मीडिआ डाइट फ़ॉलो करें। | तेक्नोलोजी समझनी हो तो मीदिया डाइट फालो करें | 0.17 |
The date ("दो नवंबर") and all product names were recognised. A single full-length Whisper pass stalled after ~16 s (a known
long-form decoding drift; it returned nothing for the rest even with `condition_on_previous_text=False`). Per-line slices of
the same final mix were all recognised, and the stems show speech 14–27 dB above music/foley, so this is a recogniser limit,
not missing audio. **I cannot listen to audio in this environment;** ASR + stem levels + phoneme checks are the proxy.
Please listen once before posting.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Accepted look retained | Same paper stock, key light (−11, 10, −4), restrained bokeh, ACES, brand palette, table + hills, vignette, Devanagari caption band, calendar and "?" props, paper Media Diet sign. |
| Scene progression (6 cuts) | S1 switch slides OFF, shield greys, "?" · S2 calendar → 2 नवंबर, update ring around 53.9 → ✓ · S3 clock races, reminder card drops and wiggles · S4 new apps ride the conveyor through the shield gate (curtain lights), camera rises, radar sweeps twice · S5 harmful tile (bug) → warning tag → greyed/disabled → lifted into the bin · S6 settings sheet, four steps light with the words, switch back ON (shield ✓) · S7 hero + Media Diet sign. |
| No static pages | Every shot has object action on its line; eased camera moves only, no bobbing. |
| Text | Hindi captions only, plus printed props (calendar date/month, 53.9). No source links on screen. |
| Accuracy | Released, dated release note; no invented reminder wording or timing; "सकता है" for disable/remove; exact Play Help path; generic glyphs, no Play/Google UI or logos. |

## Fixes during this round (each fixed once)
1. Pronunciation (before rendering, ASR on each take): "एंड्रॉयड" heard as "इंड्रूयर" → spoken "ऐंड्रॉइड"; "मीडिया" flapped → spoken "मीडिआ"; "गए" → spoken "गये". Captions keep the standard spellings.
2. Framing (stills): "?" tag clipped/overlapping the caption band → moved below the band inside the frame; old update ring showing under the reminder card → hidden once the card arrives; bin out of frame during removal → S5 camera widened.
3. Hero (contact sheet): Media Diet sign clipped at the frame edge for ~1.5 s → sign centred and hero camera moved back; frames 779–899 re-rendered and re-encoded.
4. QA tooling: Whisper's single full pass stalls on this mix → added a per-line slice pass for scoring, loanword mapping for Latin-script output, and a deterministic caption ↔ speech-stem alignment check (`build/caption_sync.py`).

## Remaining limitations (honest)
- Stock synthetic Hindi voice (no cloning); prosody is plainer than a human narrator.
- Google has not published the reminder's exact wording or after how long it appears; the film shows a generic card and says "कुछ समय" (a while).
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed to the branch.
