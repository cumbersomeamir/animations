# 19 — Production 30s hindi04-01 (Hindi): "कपड़े के लेबल की फ़ोटो से धुलाई के निशान समझें" (understand washing symbols from a photo of the clothing label)

Round 2026-11-04 hindi-04 (user-approved). Workspace `production/30s/2026-11-04-hindi-04/` · deliverable `ideaverse-30s-hindi04-01.mp4`.
Style: accepted pilot-01 DOCKET lesson style (hindi-03 renderer), NOT the meme format. Topic history checked: no laundry
or care-label episode before (topics so far: prompts, prompt injection, voice-note to-do, spam filters, photo OCR,
Magic Eraser, shopping-list meme).

## Script (Kokoro Hindi hm_omega 0.7 + hf_alpha 0.3, lang hi, speed 1.1) — 62 words, ~25.2 s speech
| id | t (s) | line | meaning |
|---|---|---|---|
| h1 | 0.25 | अंदाज़े से धोया… और महँगी शर्ट सिकुड़ गई! | Washed it by guessing… and the expensive shirt shrank! |
| h2 | 3.75 | पहले कपड़े के लेबल की साफ़, सीधी फ़ोटो लीजिए। | First take a clear, straight photo of the clothing label. |
| h3 | 7.45 | फिर किसी एआई ऐप से पूछिए: इन निशानों का मतलब हिंदी में बताओ। | Then ask an AI app: tell me what these symbols mean, in Hindi. |
| h4 | 12.50 | जैसे, टब में तीस यानी तीस डिग्री तक पानी, और नीचे लाइन यानी हल्की धुलाई। | E.g. 30 in the tub = water up to 30 °C, a line below = gentle wash. |
| h5 | 18.40 | पर एआई चूक सकता है, इसलिए जवाब लेबल से मिलाइए, और शक हो तो ब्रांड की वेबसाइट देखिए। | AI can slip, so match the answer to the label, and if unsure check the brand's website. |
| h6 | 26.20 | आइडियावर्स ऐप डाउनलोड कीजिए। | Download the Ideaverse app. |
Wording changes after Hindi ASR: "केयर लेबल" (heard "केर") → "कपड़े के लेबल"; CTA shortened to fit the last 3.8 s.

## Facts → sources (accessed 2026-11-04)
| claim | source |
|---|---|
| number in the wash tub = maximum water temperature (°C) | GINETEX, "Care symbols" (ISO 3758:2023), https://www.ginetex.net/article/care-symbols — "The numbers in the wash tub specify the maximum washing temperatures in degrees celsius which must not be exceeded." |
| one bar under the tub = milder/gentle cycle | GINETEX (same page): "One bar below the wash tub characterises a milder cycle with reduced mechanical action (e.g. mild washing process)." |
| on-screen only: crossed triangle = no bleach; crossed square-circle = no tumble dry; iron with one dot = low heat | GINETEX (same page): bleach triangle; "Do not tumble dry"; "Iron at low temperature without steam … maximum sole plate temperature of 120 °C". |
| follow the label, not a guess | GINETEX (ironing): "The maximum temperature must be selected solely on the basis of the care label and not according to the fibre content." |
| AI apps accept a photo and answer questions about it | OpenAI Help, "ChatGPT Image Inputs FAQ", https://help.openai.com/en/articles/8400551-image-inputs-for-chatgpt-faq ("Ambiguous or unclear images … results may be less accurate" → clear photo); Google, "Upload & analyze files in Gemini Apps", https://support.google.com/gemini/answer/14903178 |
| AI can make mistakes → cross-check | OpenAI FAQ (above, accuracy limits); symbol systems differ by region (US labels may use dots in the tub instead of numbers — ASTM D5489 / FTC Care Labeling Rule), so check the label and the brand. |
| Ideaverse | Name + current Play icon in the CTA only; no claim that Ideaverse reads images. |

## Storyboard
1. 0–3.6 wide: DOCKET opens the washer, pulls out a blue shirt, holds it up — it shrinks to a third (puzzled "?").
2. 3.6–7.3 phone insert: viewfinder; the label is tilted and blurry, then straightens + sharpens ("साफ़ ✓", "clear ✓"), shutter flash.
3. 7.3–12.3 phone insert: chat — the photo, then the question typed in Hindi.
4. 12.3–18.3 label close-up: amber ring on "30" + chip "30°C तक" ("up to 30 °C"); flat ring on the bar + chip "हल्की धुलाई" ("gentle wash").
5. 18.3–21.95 two-shot by the easel: the AI answer list on the phone; ✓ appears on each label symbol ("मिलाइए", "match it").
6. 21.95–25.3 phone insert: brand care page (illustrative) with the same symbols → "लेबल से मेल ✓" ("matches the label ✓").
7. 25.3–30 CTA: DOCKET waves; "[icon] आइडियावर्स ऐप / डाउनलोड कीजिए" ("download the Ideaverse app").
All screens/labels are examples (उदाहरण); no real brand or app UI.

## QA / status — DELIVERED 2026-11-04
- Output: production/30s/2026-11-04-hindi-04/ideaverse-30s-hindi04-01.mp4 (QA.md in that folder).
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −14.9 LUFS.
- Hindi ASR: all lines recognised (CER ≤ 0.20), every word inside its caption; captions in spec; top band text-free.
- ASR-only limitation recorded (no listening); native-speaker listen recommended.
