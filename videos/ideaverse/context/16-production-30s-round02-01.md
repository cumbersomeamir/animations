# 16 — Production 30s round02-01: "How your phone reads text from a photo"

Round: 2026-11-03 (round-02, user-approved). Workspace: `production/30s/2026-11-03-round-02/`.
Deliverable: `production/30s/2026-11-03-round-02/ideaverse-30s-round02-01.mp4`.
Style: accepted pilot-01 DOCKET newsroom via the feedback-round renderer (context/11). Topic history checked: OCR /
photo text / Lens / Live Text not covered before (episodes: three-layer prompt, hidden webpage instruction, voice
note to-do list, spam filters).

## Sheet feedback implemented
- Kept the exact accepted 15 s-pilot DOCKET newsroom/filing-cabinet style and the latest feedback-round renderer
  (src copied from 2026-11-02-feedback-round; only props + choreography new).
- CTA spoken and visible: "Download the Ideaverse app." Icon: current official Play icon (context/03-assets.json).
- Everyday AI, no LLM jargon; illustrative phone screen labelled EXAMPLE (not Lens/Apple/Ideaverse UI); no claim
  that Ideaverse has Lens/Live Text features.

## Script (Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; cached) — 66 words
| id | start (s) | line |
|---|---|---|
| s1 | 0.30 | How does your phone read the words in a photo? |
| s2 | 3.00 | First, it finds where the text is. Then it recognizes each letter and word, matching their shapes to patterns it learned from many examples. |
| s3 | 12.15 | The photo becomes real text: tap to copy a bus time, or translate a menu into your language. |
| s4 | 19.00 | Poor focus can cause misreads, so double-check times and prices. |
| s5 | 26.40 | Download the Ideaverse app. |

## Facts → sources (accessed 2026-11-03)
| claim | source |
|---|---|
| phones copy and translate text in photos (menus, signs) | Google Lens, https://lens.google/ — "Use your camera to instantly translate menus, signs, handwriting, or anything else in over 100 languages. Or, copy text to your phone or computer." · Google Photos Help, "Get info about your photos & surroundings" (Android), https://support.google.com/photos/answer/7539151 — "To copy text, tap and select the words you'd like to copy." · Apple Support, "Copy and translate text from photos on your iPhone or iPad", https://support.apple.com/en-us/120004 — "You can use Live Text to copy text in photos or videos, translate languages…"; "Tap Copy." |
| first it finds where the text is, then recognizes letters and words | Apple Developer, "Recognizing Text in Images" (Vision), https://developer.apple.com/documentation/vision/recognizing-text-in-images — fast path "uses the framework's character-detection capabilities to find individual characters, and then uses a small machine learning model to recognize individual characters and words"; accurate path "uses a neural network to find text in terms of strings and lines, and then performs further analysis to find individual words and sentences." · Google ML Kit, "Text recognition v2", https://developers.google.com/ml-kit/vision/text-recognition/v2 — "segments text into blocks, lines, elements and symbols" (element ≈ word, symbol ≈ character). |
| matching shapes to patterns learned from many examples | Apple Vision (machine learning model / neural network, above) · Tesseract docs, "How to train LSTM/neural net Tesseract", https://tesseract-ocr.github.io/tessdoc/tess5/TrainingTesseract-5.html — the Latin model "has been trained on about 400000 textlines spanning about 4500 fonts" (shown in the video as many styles of one character; no number stated). |
| poor focus can cause misreads → double-check | Google ML Kit, "Recognize text in images with ML Kit on Android", https://developers.google.com/ml-kit/vision/text-recognition/v2/android — "Poor image focus can affect text recognition accuracy." · Apple Vision: language correction "to minimize the potential for misreadings"; each result has "a confidence score". |
| Ideaverse | Name + current Play icon only. No claim that Ideaverse provides OCR, Lens or Live Text. |

## Storyboard (creative decisions; times = narration words)
1. 0–2.8 hook: DOCKET photographs a fictional BUS 42 timetable board (flash at 1.45), turns the phone to us.
2. 2.8–5.4 phone insert: photo; mint boxes find the block, the lines, then amber boxes the times ("finds where the text is").
3. 5.4–11.0 recognise: a blurry "8" tile lifts out of the photo into the cabinet's NUMBERS drawer; candidate cards
   3 B 6 8 0 S 9 rise; the tile hops along them while the MATCH meter climbs; "8" matches (HIGH), the tile turns crisp,
   and 8 learned styles of "8" fan out ("patterns it learned from many examples").
4. 11.0–14.0 insert: tile returns; the photo becomes selectable real text.
5. 14.0–16.2: DOCKET taps 08:15 → Copy → Copied; the time chip flies into DOCKET's NOTES drawer; a menu card pops from SOURCES.
6. 16.2–18.5 insert: menu photo, three Spanish lines flip to English (ES → EN).
7. 18.5–23.3 board: a blurry photo reads "06:15 ?" (amber); DOCKET points at the board (08:15 ringed), the phone
   flips to 08:15 ✓, then FARE 2.20 ✓ ("times and prices").
8. 25.6–30 CTA: DOCKET to camera, wave; "Download the Ideaverse app" + icon chip.

## QA / status — DELIVERED 2026-11-03
- Output: production/30s/2026-11-03-round-02/ideaverse-30s-round02-01.mp4 (QA.md in that folder).
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean.
- −15.0 LUFS, TP −1.5 dBFS. ASR: all 5 lines match; every word inside its caption. Caption pill x 118..962, y 344..520;
  top band text-free.
