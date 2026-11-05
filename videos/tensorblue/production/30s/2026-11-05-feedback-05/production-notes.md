# 18 — Batch `2026-11-05-feedback-05` · 30s · episode 01 (Hindi)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-05-feedback-05/tensorblue-30s-feedback05-01.mp4`
(copied to `production/30s/2026-11-05-feedback-05/production-notes.md`). All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 5 Nov 2026)
- **Topic:** how OCR makes a scanned PDF searchable. Show a tiny **fictional** printed document becoming selectable/searchable text with a verified open-source OCR tool. Open on the working result, then image → recognised text → search. One accurate takeaway.
- **Performance snapshot supplied by the user** (30 of 31 reels with displayed plays, 73,991 plays observed, 181 likes observed with 22 of 32 like counts visible, median 123 plays). Treated as a **controlled topic/opening test**: this episode changes the topic (everyday document task) and the opening (the working result, a found search word, inside 1 s) and keeps everything else fixed. It is not causal evidence and not permission to change the style; compare it only against episodes with the same style, voice, length and CTA.
- **History check:** not covered before. The nearest episode, round 02 (raster vs vector), is about how images scale; this one is about turning an image of text into real text. Passwords/passkeys (hindi-03/04) are unrelated.
- **Kept exactly (satisfied design):** Blue Receipt Theatre recipe, accepted renderer (original Node code on `@napi-rs/canvas`, `brt.mjs` unchanged — **not Three.js**), logo, palette, caption placement, wipe compositor, CTA end card, and the accepted Hindi setup (Kokoro-82M Hindi pipeline, `hf_alpha`×0.7 + `hm_omega`×0.3, Mukta, zero tracking, sentence-level Hindi ASR).
- **Brand colours fetched again from https://www.tensorblue.com/ on 2026-11-05:** unchanged — `#030610`, `#3B82F6`, `#FFFFFF`, `#D8E3F5`, `#B7C7DF`; logo `#0A6CFF`; logo SVG byte-identical to `assets/brand/tensorblue-logo.svg`.

## The real OCR demo (nothing private)
`src/demo/make_demo.py` renders an invented "CITY LIBRARY — Return Slip" (Member ID 0042, "Learning Python", due 18 Nov 2026) as a 900×1180 greyscale scan (−0.7° tilt, slight blur, grain; seed 20261105), then runs the real tools:

| step | tool (Ubuntu 24.04 archive) | result |
|---|---|---|
| image-only PDF | img2pdf 0.5.1 (`python3-img2pdf`) → `scan.pdf` | `pdftotext` finds **0 characters** |
| add text layer | **OCRmyPDF 15.2.0** (`ocrmypdf 15.2.0+dfsg1-1`, run as `/usr/bin/python3.12 -m ocrmypdf --output-type pdf -l eng`) with **Tesseract 5.3.4** (`tesseract-ocr 5.3.4-1build5`, `tesseract-ocr-eng 1:4.1.0-2`) → `searchable.pdf` | `pdftotext` returns the full slip text |
| word positions | `tesseract scan.png - -l eng tsv` (level-5 rows) | **23 words**, lowest confidence 95.6 |
| search hit | `pdftotext -bbox` (poppler 24.02.0) on `searchable.pdf` | "Python" box in the PDF text layer drives the highlight |
| layer order | `pikepdf` 8.7.1 content-stream walk of `searchable.pdf` | text drawn first with render mode `Tr 3` (invisible), scan image drawn **after** it → text layer is **beneath** the image |

The Debian launcher `/usr/bin/ocrmypdf` fails under the container's default Python 3.13 (pikepdf ImportError), so the module is run with the distro's Python 3.12. Outputs in `src/demo/out/` (`scan.png`, `scan.pdf`, `searchable.pdf`, `ocr.json`, `searchable_bbox.html`). The video draws the real scan, the real Tesseract boxes and the real recognised lines; "x 392, y 417" is Tesseract's box for "Python" in scan pixels.

## Final script (Hindi, as spoken; 68 words, speed 1.14)
| id | time (s) | line (caption text) | meaning |
|---|---|---|---|
| L1 | 0.30–3.72 | यह स्कैन पीडीएफ़ है, फिर भी शब्द मिल गया। कैसे? | This is a scanned PDF, yet the word was found. How? |
| L2 | 4.17–7.87 | स्कैन अक्सर सिर्फ़ एक तस्वीर होता है, उसमें टेक्स्ट नहीं। | A scan is often just a picture — no text in it. |
| L3 | 8.17–13.58 | ओसीआर तस्वीर के अक्षर पहचानकर टेक्स्ट बनाता है, हर शब्द की जगह के साथ। | OCR recognises the letters in the picture and makes text, with each word's position. |
| L4 | 13.88–17.35 | यह टेक्स्ट तस्वीर के नीचे एक अदृश्य परत बनता है। | This text becomes an invisible layer beneath the picture. |
| L5 | 17.65–20.21 | अब शब्द चुने और खोजे जा सकते हैं। | Now the words can be selected and searched. |
| L6 | 20.56–24.40 | स्कैन पीडीएफ़ में खोजना है, तो पहले ओसीआर चलाइए। | To search a scanned PDF, run OCR first. (takeaway) |
| L7 | 26.15–29.63 | टेंसरब्लू फ़ॉलो करें, सॉफ़्टवेयर आसान भाषा में। | Follow Tensorblue — software explained simply. (accepted CTA) |

**TTS spellings (captions unchanged):** "ओ सी आर" for ओसीआर and "पी डी एफ़" for पीडीएफ़. espeak-hi runs the unspaced acronyms together (/ˌoːsiˈaːɾ/), which ASR heard as "ओस्यार"/"पीडियफ". After the fix ASR returns "OCR" and "पी दी इफ". CTA spelling "टेन्सर ब्लू" (accepted since batch 03).
**Accuracy fix during QA:** L4 first said "तस्वीर के **ऊपर**" (on top of the picture). The content-stream check above and OCRmyPDF's README ("Places OCR text accurately below the image") show the layer sits **beneath** the image, so L4 now says "के **नीचे**" and scene 4 was restaged to match.

## Source → claim map (primary/official docs, read 2026-11-05)
| claim | source | what it says |
|---|---|---|
| A scan can be just an image with no text; OCR adds searchable text | **OCRmyPDF documentation** https://ocrmypdf.readthedocs.io/en/latest/ ; Introduction https://ocrmypdf.readthedocs.io/en/latest/introduction.html | "OCRmyPDF adds an optical character recognition (OCR) text layer to scanned PDF files, allowing them to be searched." OCR converts images of text "into computer text that can be selected, searched and copied." Also shown by the demo: `scan.pdf` has 0 text characters. |
| OCR recognises the letters and records each word's position | **Tesseract documentation** https://tesseract-ocr.github.io/tessdoc/ ; Command-Line Usage https://tesseract-ocr.github.io/tessdoc/Command-Line-Usage.html | Tesseract is an "open source text recognition (OCR) Engine, available under the Apache 2.0 license"; its hOCR/TSV outputs give word boxes (used for the 23 boxes on screen). |
| The text becomes an invisible layer beneath the picture | **OCRmyPDF README** https://github.com/ocrmypdf/OCRmyPDF ; Tesseract Command-Line Usage | README: "Places OCR text accurately below the image to ease copy / paste". Tesseract: PDF output gives "a pdf with the image and a separate searchable text layer". Demo: text in render mode 3 (invisible), drawn before the image. |
| Now words can be selected and searched | OCRmyPDF docs (above) | "…allowing them to be searched"; "…can be selected, searched and copied". Demo: `pdftotext` on `searchable.pdf` returns the slip text and the box for "Python". |
| OCRmyPDF uses Tesseract; both are open source | OCRmyPDF Introduction; Tesseract docs | OCRmyPDF "uses Tesseract, a widely available open source OCR engine". |

**Not claimed:** no accuracy percentage, speed or language-coverage figure; OCRmyPDF's own docs note that OCR accuracy depends on the scan, so the video says "अक्सर" (often) and shows one clean, real example only. The search bar, selection and terminal card are generic demo UI, not any product's screen.

## Storyboard as built (7 scenes, 6 blue wipes)
| time (s) | scene | what happens |
|---|---|---|
| 0–3.9 | **S1 Working result** | Frame 0: the scanned slip under a search bar; "Python" types at 0.1 s and is highlighted with "1 मिला" at 0.75 s; kinetic "कैसे?". |
| 3.9–8.0 | **S2 Just a picture** | Wipe →. Small scan labelled "स्कैन पीडीएफ़" beside an empty "टेक्स्ट" panel ("खाली", "0 अक्षर"); a nearest-neighbour zoom of "Pyt" shows it is only pixels ("सिर्फ़ पिक्सेल"). |
| 8.0–13.7 | **S3 Recognition** | Wipe ←. "Tesseract OCR" boxes appear word by word on the real scan; the "पहचाना गया टेक्स्ट" card fills with the recognised lines; pill "Python → x 392, y 417"; kinetic "अक्षर → टेक्स्ट + जगह". |
| 13.7–17.5 | **S4 Invisible layer beneath** | Wipe ↑. Isometric exploded stack: the opaque scan above, the blue text layer below; on "नीचे" the scan lands on top and only a dashed blue edge remains: "अदृश्य टेक्स्ट परत". |
| 17.5–20.4 | **S5 Select + search** | Wipe →. The "Due date" line is selected ("कॉपी: Due date: 18 Nov 2026"); "Python" is searched and highlighted. |
| 20.4–25.8 | **S6 Takeaway** | Wipe ←. Terminal card types the real command `ocrmypdf scan.pdf searchable.pdf` while "स्कैन पीडीएफ़" is spoken; ✓ searchable.pdf, "0 → 23 words"; pill "ओपन-सोर्स: OCRmyPDF + Tesseract"; kinetic "पहले ओसीआर, **फिर सर्च**"; search result again on the chime. |
| 25.8–30.0 | **S7 CTA** | Wipe ↑. Accepted end card: logo, "Tensor**blue**", "सॉफ़्टवेयर, आसान भाषा में", "फ़ॉलो करें". |

## Provenance and licences
New: `src/scene.mjs`, `src/demo/make_demo.py` + `src/demo/out/`. Reused unchanged: `brt.mjs`, `tts.py`, `asr_hi.py`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`; `mix.py` (seed 20261108/heading only). Logo `assets/brand/tensorblue-logo.svg`. Fonts: Inter/Inter Display and Mukta (SIL OFL 1.1); **JetBrains Mono** Bold/Medium for the terminal and recognised-text cards (new in `assets/fonts/jetbrains-mono/`, from Debian `fonts-jetbrains-mono` 2.304+ds-4, Apache-2.0 per its `debian-copyright.txt`); the demo slip is set in DejaVu Serif (`fonts-dejavu-core` 2.37-8, free licence), rasterised into the scan. OCR tools: OCRmyPDF (MPL-2.0) and Tesseract (Apache-2.0), installed from the Ubuntu archive, run locally on the invented slip only. Voice: Kokoro-82M (Apache-2.0), cached `hf_alpha`/`hm_omega`, offline. ASR: `Systran/faster-whisper-medium` (MIT), cached. Music/SFX synthesized. No paid APIs, Blender, secrets, private documents or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-05-feedback-05/tensorblue-30s-feedback05-01.mp4` · SHA256 `bdcf732c7765b418a44c6f4761230c2556538b92c7dc6f4140c46222a98ab928` · 4,238,753 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.0 LUFS**, LRA 2.1 LU, **−1.6 dBTP** |
| captions (Hindi) | ink y 340–520, x 90–990, ≤ 2 lines | all 9 groups pass: ink y 362–495, x 200–880; Mukta, real glyphs |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| hook | visual result in 1–2 s | real slip + search bar on frame 0; "1 मिला" highlight at 0.75 s |
| Hindi recognition (final MP4) | intelligible | faster-whisper medium, `language='hi'`, sentence by sentence: every sentence transcribed, **CER 11.1 %** (per line 0–24 %), 0 low-confidence words. L6's 24 % is mostly the Latin "OCR" that Whisper writes for ओसीआर. WER 33.8 % is mostly spelling (टेक्स्त, पीडी इफ, सोफ्टवेर). |
| caption/speech timing | aligned | estimated Hindi word times vs heard starts: mean 0.10 s; every visual-cue word ≤ 0.25 s; one non-cue word (L3 "तस्वीर") 0.34 s |
| scenes | mechanism moves with narration | 7 scenes / 6 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed; full-res crops of S3/S6 checked |

**Fixed during QA (once each):** the terminal card sat empty for ~1.5 s (typing now starts when the scene opens); "ओसीआर"/"पीडीएफ़" were run together by TTS (spaced spellings); the "on top" layer claim was corrected to "beneath" with scene 4 restaged. Earlier still checks also fixed small page text (crop + 0.8 scale), a weak pixel zoom ("Pyt" crop) and recognised text overflowing its card (mono 25 px).

**Known limits:** listening is not supported in this container — verification is ASR-only plus loudness/true-peak metering; a native Hindi speaker should listen once before posting. OCR output is shown for one clean invented slip; real scans can need cleanup. No Desktop/video-review folder exists in this cloud container; the finished MP4 is delivered as the chat attachment and on the branch.
