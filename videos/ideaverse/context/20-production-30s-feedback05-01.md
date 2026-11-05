# 20 — Production 30s feedback05-01 (Hindi): "लंबा नोटिस → तारीख़ और काम की जाँची हुई लिस्ट" (long notice → a checked list of dates and actions)

Batch 2026-11-05-feedback-05 (user-approved). Workspace `production/30s/2026-11-05-feedback-05/` · deliverable `ideaverse-30s-feedback05-01.mp4`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed before edits).
Style: accepted DOCKET 15 s-pilot lesson style (hindi-04 renderer). Topic history: closest earlier episode is #03 (English,
voice note → to-do list); this one differs in input (a long written notice) and in the key mechanism (quote the original line
for every item, write "पता नहीं" ("don't know") instead of guessing, then cross-check against the source).

## Final transcript (Kokoro Hindi hm_omega 0.7 + hf_alpha 0.3, lang hi, speed 1.1) — 70 words, 25.5 s speech
| id | t (s) | line | meaning |
|---|---|---|---|
| h1 | 0.20 | पूरा नोटिस पढ़ा… फिर भी फ़ीस की आख़िरी तारीख़ छूट गई! | Read the whole notice… and still missed the fee deadline! |
| h2 | 4.40 | लंबा नोटिस किसी एआई ऐप में डालिए, और लिखिए: | Put the long notice into an AI app, and write: |
| h3 | 8.30 | तारीख़ें, पैसे और ज़रूरी काम अलग करो, हर एक के साथ नोटिस की असली लाइन लिखो। | Pull out dates, money and required actions; with each, write the notice's original line. |
| h4 | 14.50 | जो बात साफ़ न लिखी हो, उस पर अंदाज़ा मत लगाओ, पता नहीं लिखो। | If something isn't written clearly, don't guess — write "don't know". |
| h5 | 19.45 | फिर हर पॉइंट को असली लाइन से मिलाइए, और पता नहीं वाली बात स्कूल से पूछिए। | Then match every point to its original line, and ask the school about the "don't know" item. |
| h6 | 26.30 | आइडियावर्स ऐप डाउनलोड कीजिए। | Download the Ideaverse app. |

## Sources (accessed 2026-11-05)
| claim / technique | source |
|---|---|
| ask for word-for-word quotes from the document | Anthropic, "Reduce hallucinations", https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations — "ask Claude to extract word-for-word quotes first before performing its task. This grounds its responses in the actual text" |
| allow "don't know" instead of guessing | same page — "Allow Claude to say 'I don't know': Explicitly give Claude permission to admit uncertainty. This technique can drastically reduce false information." |
| verify each point against its quote | same page — "have Claude verify each claim by finding a supporting quote after it generates a response. If it can't find a quote, it must retract the claim." |
| check unclear items with the issuer | practical advice following from the above (the notice itself says the bus time will be told later) |
| Ideaverse | name + current Play icon in the CTA only; no claim that Ideaverse reads or summarises notices |
The notice, school, dates (14/21 November), fee (₹350) and screens are fictional examples labelled उदाहरण ("example").

## Storyboard
1. 0–3.4 easel close-up: a wall-of-text school notice scrolls fast and stops; the buried line "शुल्क ₹350, 14 नवंबर तक जमा करें" ("fee ₹350, pay by 14 November") lights amber (2.0); a stamp "तारीख़ निकल गई" ("deadline passed") slaps (2.95).
2. 3.4–4.35 wide: DOCKET's puzzled head-shake.
3. 4.35–7.0 phone insert: the long notice pasted into an AI chat (illustrative).
4. 7.0–8.25 wide: DOCKET types.
5. 8.25–17.1 phone insert: instruction typed in three lines; chips pop on the words तारीख़ें · पैसे · ज़रूरी काम · असली लाइन · पता नहीं (dates · money · required actions · original line · don't know).
6. 17.1–19.4 easel card flips to "AI का जवाब" ("the AI's answer"): 1 21 नवंबर — पिकनिक (21 Nov — picnic) · 2 ₹350 — 14 नवंबर तक (₹350 — by 14 Nov) · 3 सहमति-पत्र पर हस्ताक्षर (sign the consent form), each with its quote · ? बस का समय — पता नहीं (bus time — don't know) (amber).
7. 19.4–23.6 card flips back to the notice: matching lines highlight with badges 1·2·3; the vague line gets "?" and the chip "स्कूल से पूछें" ("ask the school").
8. 23.6–25.25 two-shot: DOCKET points at the easel and nods.
9. 25.25–30 CTA: wave; "[icon] आइडियावर्स ऐप / डाउनलोड कीजिए" ("download the Ideaverse app").

## QA / status — DELIVERED 2026-11-05
- Output: production/30s/2026-11-05-feedback-05/ideaverse-30s-feedback05-01.mp4 (QA.md in that folder).
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −14.9 LUFS.
- Hindi ASR: all lines recognised (CER ≤ 0.24); one caption boundary fixed; captions in spec; top band text-free.
- ASR-only limitation recorded; native-speaker listen recommended. Publishing caption = final transcript (publishing-caption.txt).
