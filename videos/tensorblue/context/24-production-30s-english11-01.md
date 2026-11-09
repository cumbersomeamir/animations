# 24 — Batch `2026-11-09-english-11` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-09-english-11/tensorblue-30s-english11-01.mp4`
(copied to `production/30s/2026-11-09-english-11/production-notes.md`). All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 9 Nov 2026)
- **Topic:** why sending a photo on a messaging app can make tiny writing unreadable.
  - Show lossy compression removing image detail, versus sending the original as a document.
  - Cite the documented current behaviour of one real app.
  - Show an enlarged crop.
- **History check:** not a duplicate. The nearest episode is 15 (round 02: a photo blurs when you *zoom* — raster pixels vs vector shapes). That is about display scaling. This one is about an app *re-saving* the photo with lossy compression, so detail is gone before it is ever displayed. The visuals are different: no pixel-grid zoom, and the comparison is a real file pipeline.
- **Earlier jobs:** none running. All accepted episodes through english-10 were already committed and pushed (verified before starting). No analytics were used or invented.
- **Language and voice:** English narration and captions only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached and offline. No Hindi audio. "Meshline/Recall" are other apps; their context was not read.
- **Style:** the most recently accepted Blue Receipt Theatre style kept: `brt.mjs` unchanged, Node + `@napi-rs/canvas`, **not Three.js**. Palette, captions, wipes, English CTA card. No mascot.
- **Real app reference:** WhatsApp is named only for what its Help Center documents. It appears as a plain quoted help-page card with its URL; the app's UI and logo are not imitated. The quality toggle on screen is our own generic drawing.
- **Performance-sheet improvements:** the sheet is not in this container. Written points followed:
  - first second: two copies of the same ticket photo, whose enlarged crops pop in from 0.25 s — one crisp, one smeared;
  - a real demo;
  - takeaway;
  - short CTA.

## The real image demo (`src/demo/photo_demo.py`; Pillow 13.0.0, Tesseract 5.3.4)
**Original "phone photo":** 3024 × 4032, JPEG quality 95, **495,048 bytes**. A fictional "City Hall Concert" ticket on a table, booking code `7KQ2XM` printed at 20 px.

**Lossy re-save (our test settings, *not* any app's):** long edge 1280 px, JPEG quality 60 → **960 × 1280, 32,633 bytes**.

**"Sent as a document":** the original file copied byte for byte — same SHA-256 `00f2be40…`.

**Enlarged crops:** the booking-code area, located automatically from the text's dark pixels, enlarged from both images to 860 px wide with the **same Lanczos filter**. An earlier draft enlarged the re-saved crop with nearest-neighbour; that exaggerated the blockiness, so it was replaced.

**OCR on the crops:**

| copy | OCR read | correct code? |
|---|---|---|
| original | "Booking code 7KQ2XM" | ✓ |
| re-saved | "Bookie code **7KO7H**" | ✕ |

**Calibration, recorded honestly:**
- At 30 px text, the re-saved code was still clearly readable by eye even though OCR failed.
- At 20 px, the re-saved code becomes a smeared guess for both a person and OCR, while the original stays crisp.

The video therefore says "turned the code into a guess", not "erased it". The renderer refuses to render if the OCR results or the byte-identity check change.

## Final script (as spoken; 75 words, 24.7 s of speech incl. CTA)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–3.34 | Same photo, sent twice. Why can't you read this one? |
| L2 | 3.74–6.59 | Chat apps often shrink photos with lossy compression. |
| L3 | 6.84–11.17 | Lossy means detail is discarded for good. Tiny text suffers most. |
| L4 | 11.42–15.79 | WhatsApp's help says shared media is usually compressed, and offers HD. |
| L5 | 16.04–20.80 | In our test, the re-saved copy turned the code into a guess; the original kept it. |
| L6 | 21.05–25.01 | Fine print? Send HD, or attach it as a document, then check it. |
| L7 | 26.15–28.70 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):** WhatsApp's /wˌʌtsˈæps/, HD /ˌAʧdˈi/, lossy /lˈɔsi/, re-save /ɹˌisˈAv/, and the accepted `[Tensorblue](/tˈɛnsəɹblˌu/)`.

**Edits:**
- L2 was shortened for timing.
- L5 first began "Our re-saved copy…". ASR heard "Our" as "A" (confidence 0.056), so it now begins "In our test, …", which is also clearer about whose test it is.

## Source → claim map (primary/official, read 2026-11-09)
| claim | source | what it says |
|---|---|---|
| Lossy compression discards detail for good | **MDN Glossary — Lossy compression** https://developer.mozilla.org/en-US/docs/Glossary/Lossy_compression | "a data-compression method that uses inexact approximations and partial-data discarding to represent content"; "The process of such compression is irreversible; once lossy compression of the content has been performed, the content cannot be restored to its original state"; "widely used in image formats such as JPEG, WebP". |
| Chat apps often shrink photos with lossy compression | MDN (above); WhatsApp Help (below) | "often" is general; the one documented app says media is usually compressed. |
| Tiny text suffers most | demo | In the same re-saved photo, the large "CITY HALL CONCERT" heading stays readable while the 20 px booking code smears, and OCR misreads it. |
| WhatsApp: shared media is usually compressed | **WhatsApp Help Center — How to send media, contacts, or location** (iPhone) https://faq.whatsapp.com/iphone/chats/how-to-send-media/ ; **Can't create or share status** https://faq.whatsapp.com/896930805262380 | "The quality of media uploaded to WhatsApp may be lower than the original version because media files are usually compressed when shared." The status page adds that "You might see blurry, grainy, fuzzy or pixelated photos and videos". |
| WhatsApp offers HD | same page; **About HD photos and videos** https://faq.whatsapp.com/759301289012856/ | "To adjust the quality of an attached photo or video, tap [HD Media] > Standard quality or HD quality before tapping [Send]." "You can't upgrade the quality of an existing photo you've sent, but you can send it again in HD quality." |
| Attaching as a document is possible | WhatsApp send-media page (above) | "Document to select a document of up to 2 GB…"; "For documents, the maximum file size allowed is 2 GB." |
| The original kept it | demo | The original file (copied as-is, same SHA-256) reads `7KQ2XM`. |

**Deliberately not claimed:**
- WhatsApp's pages do **not** say that documents skip compression, so the video never says so.
- The takeaway offers HD or a document **and** "then check it", meaning zoom in on what arrived.
- The test's resize/quality settings are ours and labelled on screen; no app's real settings are stated.

## Storyboard as built (7 scenes, 6 blue wipes)
| time (s) | scene | what happens |
|---|---|---|
| 0–3.54 | **S1 Hook** | Frame 0: two thumbnails of the same ticket photo ("re-saved photo", "original file") look alike. From 0.25 s their enlarged booking-code crops pop in: one smeared ✕, one crisp ✓. Kinetic "Can't you **read this one?**" |
| 3.54–6.71 | **S2 The shrink** | Wipe →. Original 3024 × 4032 · 495 KB; the copy physically shrinks to 960 × 1280 · 33 KB; pill "our test: 1280 px, JPEG quality 60"; kinetic "Lossy **compression**". |
| 6.71–11.29 | **S3 Lossy** | Wipe ←. Card "lossy compression drops parts of the data — it can't be restored". From the same re-saved photo: the big heading is "still fine", the tiny code is "smeared". Kinetic "Tiny text **suffers most.**" |
| 11.29–15.91 | **S4 One real app** | Wipe ↑. Quoted help card: "WhatsApp Help Center · How to send media — '…media files are usually compressed when shared.' faq.whatsapp.com". A generic Standard/HD toggle flips to HD on "HD". Kinetic "Usually **compressed**". |
| 15.91–20.95 | **S5 Result** | Wipe →. Re-saved crop: the code is outlined on "code", "OCR: 7KO7H" ✕. The original crop arrives on "original": "OCR: 7KQ2XM" ✓, "the original file, copied as-is: same SHA-256". Kinetic "Into a **guess.**" |
| 20.95–25.80 | **S6 Takeaway** | Wipe ←. "Fine print?" → ✓ "Send in HD quality", ✓ "or attach it as a document", then the original crop + magnifier "zoom in on what arrived". Kinetic "Then **check it.**" |
| 25.80–30.0 | **S7 CTA** | Wipe ↑. Accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

## Provenance and licences
New: `src/scene.mjs`, `src/demo/photo_demo.py` + `src/demo/out/` (original.jpg, resaved.jpg, as-document.jpg, both crops, photo-demo.json).

Reused unchanged from english-10: `brt.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`. `mix.py` was reused with only its seed (20261114), heading and a 7-chord scene score changed.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1); JetBrains Mono (Apache-2.0). The ticket text in the demo photo uses DejaVu fonts (free licence) and is rasterised into the image.
- Logo: `assets/brand/tensorblue-logo.svg`.
- Pillow (MIT-CMU) and Tesseract (Apache-2.0) were run locally only.
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, real tickets, personal data or other apps' files. No WhatsApp UI or logo is reproduced.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-09-english-11/tensorblue-30s-english11-01.mp4` · SHA256 `9c3c967e949a071607062e3580774d6e3ee9660d8066e6bdb9cd0bbc1310029d` · 3,133,840 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 2.7 LU, **−1.8 dBTP** |
| captions | ink y 340–520, x 90–990, ≤ 2 lines | all 12 groups pass: ink y 371–488, x 150–929. Each group switches on its spoken word (checked against `voice-timing.json`). |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| hook | intriguing first second | smeared vs crisp crops of the "same photo" by 0.6 s |
| narration (one ASR pass, base.en, narration span) | intelligible | every word heard. WER 7.9 % is tokenisation only: "WhatsApp's" → "What's apps", "re-saved" → "resaved", "Tensorblue" → "tensor blue". |
| caption/speech timing | aligned | mean start drift 0.18 s, max 0.70 s, all on words right after pauses ("Lossy", "In", "and", "Follow"). The voice-track energy shows "Lossy" starting at 6.85 s (silence 6.60–6.80; Kokoro 6.86, Whisper 6.16) and "In" at 16.05 s (Kokoro 16.04), so the cues are right and Whisper starts these words early. |
| audio identity | ASR-checked audio = final audio | The last two fixes were visual only; the audio stream MD5 of the final file equals the ASR-checked export (`a36a33b7…`). |
| scenes | mechanism moves with narration | 7 scenes / 6 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed |

**Fixed during QA (once each):**
- The 30 px test text was still human-readable after re-saving (switched to 20 px with a tight, auto-located crop).
- The re-saved crop had been enlarged with nearest-neighbour (now the same Lanczos filter as the original).
- S1's magnifier sat under the badges.
- S5's SHA line ran past x 950.
- "Our" was misheard by ASR (L5 reworded).
- S5 had a static stretch (code outline on "code" added).
- After the L5 rewording, a caption group was keyed to the wrong "the" and switched early (now the 3rd "the").

**Known limits:**
- I can't listen here; clarity rests on ASR plus loudness/true-peak metering.
- The compression settings are a demonstration, not WhatsApp's.
- Whether a given app's document upload is unaltered is not documented by WhatsApp, hence "then check it".
- There is no Desktop/video-review folder in this cloud container; the MP4 is delivered as the chat attachment and on the branch.
