# 16 · Hindi episode hindi-03 — "iOS 27.2: iPhone AI images get Google's invisible SynthID watermark — how to check"

Round: 2026-11-03, batch "hindi-03" (user-approved new round). Output:
`videos/media-diet/production/30s/2026-11-03-hindi-03/media-diet-30s-hindi03-01.mp4`. Previous MP4s (pilot-01, 30s-01,
30s-02, feedback-01, round02-01) preserved unchanged. No generation was active at the start (branch clean at 3704e6a,
equal to the remote; no render/ffmpeg/voice processes), so nothing needed checkpointing first.

## Brief (as given, condensed)
One new ready-to-post 30 s educational video, now **current technology news**: a genuinely recent, publicly released consumer
update (company, product, date, what changed, who can use it, how), accessible phone/computer feature, released vs announced
and regional/device eligibility distinguished, official release notes cited, one news item with a practical takeaway.
**Latest correction overrides language:** all narration and captions in natural Hindi (Devanagari), a genuinely Hindi-capable
local voice (not the English Kokoro voice), no celebrity clone, no paid API; check pronunciation/words/dates/intelligibility
and speech/caption alignment; Devanagari font with no missing glyphs; if Hindi audio were impossible, state the blocker.
Sheet feedback: Satisfied = Yes — keep the accepted character/stage/cuts/palette/caption treatment/CTA; add only this episode.

## Topic research and choice (history: not covered before)
Earlier episodes: internet message (pilot), airplane mode, noise cancelling, warehouse lidar, satellite SOS — no news item.
Checked as of 2026-11-03 (official pages only): iOS 27.1 (23 Oct) is listed only for "iPhone Duo" (not broadly usable);
the latest Pixel Drop found (Sept 2026) puts its headline Scam Detection item in the U.S. first; no official October 2026
WhatsApp post was found. **Chosen:** Apple's iOS 27.2 (released 26 Oct 2026 for iPhone 11 and later) — "Support for SynthID
watermarking to help identify whether an image was generated or modified with generative tools in Photos and Image
Playground" — paired with Google's SynthID Detector, opened to everyone globally in English (blog 7 Oct, updated 29 Oct:
"…including OpenAI, NVIDIA, Kakao, and Apple"). Practical for a Hindi audience facing forwarded AI images: what changed, who
gets it, how to check, and the limit (no mark ≠ real).
- Released vs announced: both are released (Apple's notes + security-release date; Google's "available globally … starting
  today"). DeepMind's model page still says "soon, Apple", so the detector sentence is attributed ("गूगल के मुताबिक़").
- Eligibility: iOS 27.2 installs on iPhone 11+, but the generative tools that make the mark need Apple Intelligence
  (iPhone 15 Pro/Pro Max, all iPhone 16 and later). Image Playground languages include English (India), not Hindi (Apple
  feature-availability page) — stated in the publishing caption, not crammed into the video.

## Language override and how it was applied (specific feedback adjustments)
- **Voice:** the cached Kokoro-82M v1.0 ships native Hindi stock voices (hf_alpha, hf_beta, hm_omega, hm_psi), phonemised by
  espeak-ng's Hindi rules. The English af_bella/am_puck voices were NOT used. Blend **hf_alpha 0.7 + hm_omega 0.3** mirrors the
  accepted 0.7/0.3 female-led blend. Test sentence → Whisper medium (hi) heard all four voices correctly; the blend read best.
- **Speed 1.08 (was 0.98):** the Hindi voice speaks ~2.4 words/s at 0.98, so even 65 Hindi words overran 30 s (75 words =
  31.5 s). ASR tests at 0.98/1.06/1.08/1.10: 1.10 broke the brand name; 1.08 kept full intelligibility and fits.
- **Pronunciation fixes found by ASR before rendering:** "नए मॉडल" was heard as "नहीं model" (meaning risk) → "बाद के"
  (later); "सिंथआईडी" was flapped to "सिन्थाईरी" → spoken text "सिंथ आई डी" (letter names; heard as "Synth ID"), caption keeps
  the standard spelling "सिंथआईडी". Numbers are spoken as Hindi words (छब्बीस, सत्ताईस पॉइंट दो, पंद्रह) and shown as digits.
- **Captions:** Noto Sans Devanagari 700 (OFL, @fontsource 5.3.0) at 48 px in the accepted band; baselines 406/480 (Devanagari
  matras need more line room than Latin) so ink stays inside y 340–520. No currency in this episode.
- Everything else unchanged: paper stock, light rig, palette, table/hills backdrop, vignette, "?" tag, Media Diet sign + CTA
  (in Hindi), accepted audio recipe (pad without loops, event foley, −15 LUFS / −2 dBTP).

## Narration (spoken) vs captions (written) — 66 spoken words, 27.3 s of speech
| id | start–end (s) | spoken (Kokoro input) | caption | meaning |
|---|---|---|---|---|
| V1 | 0.15–2.55 | यह तस्वीर असली है, या एआई की? | same | Is this picture real, or AI's? |
| V2 | 2.82–7.77 | छब्बीस अक्टूबर के ऐपल अपडेट, आईओएस सत्ताईस पॉइंट दो में सुराग है। | 26 अक्टूबर के ऐपल अपडेट, / आईओएस 27.2 में सुराग है। | Apple's 26 October update, iOS 27.2, has a clue. |
| V3 | 8.04–11.64 | आईफ़ोन के एआई टूल से बनी या बदली तस्वीरों में, | same | In pictures made or changed with the iPhone's AI tools, |
| V4 | 11.91–15.71 | गूगल का अदृश्य सिंथ आई डी वॉटरमार्क जुड़ता है, | …सिंथआईडी… | Google's invisible SynthID watermark is added, |
| V5 | 15.98–18.30 | पंद्रह प्रो और बाद के आईफ़ोन पर। | 15 प्रो और बाद के / आईफ़ोन पर। | on the 15 Pro and later iPhones. |
| V6 | 18.58–22.66 | गूगल के मुताबिक़, सिंथ आई डी डिटेक्टर इसे पहचानता है। | …सिंथआईडी… | According to Google, the SynthID Detector recognises it. |
| V7 | 22.94–25.86 | निशान न मिलना, असली होने का सबूत नहीं। | same | Not finding a mark is not proof it is real. |
| V8 | 26.13–29.39 | टेक्नोलॉजी समझनी हो, तो मीडिया डाइट फ़ॉलो करें। | same | Want technology explained? Follow Media Diet. (accepted CTA, final 3.9 s) |

## Sources (checked 2026-11-03; quotes and claim map in the output folder's SOURCES.md)
Apple Support 149076 *About iOS 27 Updates* (published 26 Oct 2026, iOS 27.2 notes) · Apple Support 100100 *Apple security
releases* (iOS 27.2, 26 Oct 2026) · Apple *iOS feature availability* · Google Keyword blog (Pushmeet Kohli, 7 Oct 2026,
updated 29 Oct 2026) · Google DeepMind *SynthID* page. Secondary (context only): MacRumors 26 Oct 2026, Forbes 30 Oct 2026.

## Storyboard (as rendered; 8 shots, 7 cuts)
| time | shot | action tied to narration |
|---|---|---|
| 0.0–2.75 | S1 mystery photo | paper photo print on an easel; "?" tag pops beside it ("असली है, या एआई की?"). |
| 2.75–7.95 | S2 calendar → phone | desk calendar pages flip 24 → 25 → 26 अक्टूबर; camera pans to the paper phone: update ring fills around "27.2", ✓. |
| 7.95–11.8 | S3 AI tools | wand + sparkles on the phone; a new picture unfolds up from flat ("बनी"); a photo's edges unfold outward ("बदली"). |
| 11.8–15.9 | S4 invisible mark | a stamp presses the AI picture — nothing visible changes ("अदृश्य"); a magnifier slides in and reveals a hidden pattern only under the lens ("वॉटरमार्क जुड़ता है"). |
| 15.9–18.5 | S5 which iPhones | row of paper phones tagged 14, 15 (stay down, dim) and 15 प्रो, 16, 17 (stand up, light). |
| 18.5–22.85 | S6 detector | a copy of the AI picture flies into a paper laptop; scan line; result panel shows the pattern + ✓ ("पहचानता है"). |
| 22.85–26.05 | S7 limit | the mystery photo is scanned: hollow "–" result, the "?" tag pops again ("सबूत नहीं"). |
| 26.05–30.0 | S8 hero | pull-back over the desk; paper Media Diet sign hinges up (CTA). |

## QA summary (final export; full report in the output folder's QA.md)
- SHA-256 `a4848025f89e51dd97853bedabeba47b0f1457c7ffbbeb0c716721702b0dea19` · 16,342,177 bytes · audio stream tagged `hin`.
- 900 frames · video 30.000000 s · audio 30.000000 s · container 30.000000 s · H.264 High yuv420p 1080×1920 30/1 · AAC 48 kHz stereo.
- Full decode clean · −15.0 LUFS / −2.0 dBTP · Devanagari caption ink y 362–494, x 265–816 · 0 safe-area violations in 900 frames.
- Hindi Whisper-medium pass on the encoded file: overall CER 0.055, all 8 lines heard inside their windows; dates/numbers exact.
- Full-resolution caption crops: no missing glyphs. Representative and cut-boundary contact sheets inspected: no defects found.

## Limits
- I cannot listen to audio in this environment. Hindi intelligibility, pronunciation and timing were checked by phoneme
  inspection and Whisper-medium (hi) back-transcription of the encoded file; please listen once before posting.
- Kokoro's Hindi voices are stock synthetic voices (no clone); their prosody is plainer than a human Hindi narrator.
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed.
- Schematic miniature (generic devices, invented glyphs; the visible dot pattern illustrates an invisible, software-read mark).
  No automation created.
