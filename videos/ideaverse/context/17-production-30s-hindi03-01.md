# 17 — Production 30s hindi03-01 (Hindi): "फ़ोटो से अनचाही चीज़ हटाना" — remove a background distraction

Round: 2026-11-03 hindi-03 (user-approved; latest correction: all narration + captions natural Hindi, Devanagari).
Workspace `production/30s/2026-11-03-hindi-03/` · deliverable `ideaverse-30s-hindi03-01.mp4`.
Style: accepted pilot-01 DOCKET newsroom via the feedback-round renderer (src copied from round-02). Topic history
checked: no earlier object-removal / Magic Eraser episode.

## Sheet feedback implemented
- Exact accepted DOCKET newsroom style + renderer, caption treatment, quiet voice-forward audio.
- CTA spoken + visible: "आइडियावर्स ऐप डाउनलोड कीजिए" (Hindi for "Download Ideaverse app") with the current icon.
- Icon re-fetched (unchanged). Real consumer tool named with accurate free/paid distinction (below).
- Hindi voice: Kokoro Hindi voices hm_omega 0.7 + hf_alpha 0.3 (not the English voice); Devanagari font Noto Sans Devanagari.

## Script (Devanagari; 67 words by whitespace) — placements from Hindi ASR word timings
| id | start (s) | line | meaning |
|---|---|---|---|
| h1 | 0.25 | फ़ोटो अच्छी है, पर पीछे कचरे का डिब्बा? | Nice photo — but a dustbin behind? |
| h2 | 3.55 | गूगल फ़ोटोज़ के मैजिक इरेज़र में उस पर टैप करें, या गोला बनाकर चुनें। | In Google Photos' Magic Eraser, tap it or circle it to select. |
| h3 | 9.35 | फिर एआई अनुमान लगाता है कि वह न होता तो वहाँ क्या दिखता, और जगह भर देता है। | Then AI predicts what would show there without it, and fills the space. |
| h4 | 15.65 | भरा हिस्सा बस अनुमान है, इसलिए ज़ूम करके किनारे और परछाइयाँ जाँचें। | The filled part is only a guess, so zoom in and check edges and shadows. |
| h5 | 21.15 | इसके लिए सब्सक्रिप्शन नहीं लगता, बस आपका फ़ोन इसे चला सके। | No subscription needed, as long as your phone can run it. |
| h6 | 26.30 | आइडियावर्स ऐप डाउनलोड कीजिए। | Download the Ideaverse app. |
No dates, numbers or currency are spoken. The phone screen shows "3 GB RAM · Android 8 / iOS 15+" (Google's stated minimum).

## Facts → sources (accessed 2026-11-03)
| claim | source |
|---|---|
| tap, circle or brush to select | Google Photos Help, "Edit your photos" (Android), https://support.google.com/photos/answer/6128850 — "With the tool open, tap, draw a circle around, or brush the area of the photo you want to edit. To remove your selection, tap Erase." |
| AI predicts what would be there and fills it | Google blog, "Photobombs begone with Magic Eraser in Google Photos" (19 Oct 2021), https://blog.google/products-and-platforms/products/photos/magic-eraser/ — "Magic Eraser uses machine learning again to predict what the pixels would look like if the distraction weren't there." |
| filled part is a guess → check edges/shadows | follows from "predict" above (the fill is generated, not recovered); the shadow example is our illustration. |
| no subscription; supported phone needed | Google blog, "Google Photos expands AI editing features to all users" (10 Apr 2024), https://blog.google/products-and-platforms/products/photos/google-photos-editing-features-availability/ — Magic Eraser, Photo Unblur, Portrait light "available to anyone using Google Photos, no subscription required"; footnote "at least 3 GB RAM and Android 8.0/iOS 15 or higher. Feature availability varies by device." · Photos Help (current): "To use most features, you must have at least 3 GB RAM and Android 8.0 and up." |
| paid distinction (publishing copy only) | same 10 Apr 2024 post: "all Google Photos users on Android and iOS will get 10 Magic Editor saves per month. To go beyond this limit, you'll need a Pixel device or a Premium Google One plan (2TB and above)." — Magic Editor is a different tool; current limits not re-confirmed on a 2026 help page, so stated with its date. |
| Ideaverse | Name + current Play icon only; no claim that Ideaverse edits photos or offers Magic Eraser. |

## Storyboard
1. 0–3.45 hook (two-shot): DOCKET beside an invented personal photo (friend flying a kite, dustbin behind), points; amber ring on the dustbin.
2. 3.45–9.3 phone insert (उदाहरण): tap ripple on the dustbin ("टैप"), then a rough mint circle is drawn around it ("गोला बनाकर चुनें").
3. 9.3–15.5 photo close: the dustbin lifts out as a cut-out into the "हटाया गया" drawer, leaving a checkerboard gap;
   24 background patches fly in from the surrounding scene and fill it ("अनुमान… भर देता है").
4. 15.5–21.05 check close-up ("ज़ूम करके"): mint box traces the filled edge ("किनारे"), amber ring on the shadow the first
   selection missed ("परछाइयाँ"), a second selection removes it → mint ring.
5. 21.05–25.6 phone insert: Magic Eraser checklist — सब्सक्रिप्शन: ज़रूरी नहीं ✓, फ़ोन: सपोर्टेड होना चाहिए ✓.
6. 25.6–30 CTA: DOCKET waves; caption "[icon] आइडियावर्स ऐप / डाउनलोड कीजिए".

## Voice selection evidence (ASR = faster-whisper medium, language hi)
- All 4 Kokoro Hindi voices tested on the same sentences; male voices (hm_omega, hm_psi) kept aspirates/retroflexes
  (पीछे, डिब्बा, दिखता, भर) best; blend hm_omega 0.7 + hf_alpha 0.3 transcribed that test sentence exactly.
- Wording changes for clarity: कूड़ेदान → कचरे का डिब्बा; "फ़ोन सपोर्टेड हो" → "आपका फ़ोन इसे चला सके"; "डाउनलोड करें" → "डाउनलोड कीजिए".
- Known limit: Kokoro's Hindi voices are early (model card grade C); ASR sometimes softens aspirates (e.g. "दिकता").

## QA / status
- (filled after render — see the round folder's QA.md)
