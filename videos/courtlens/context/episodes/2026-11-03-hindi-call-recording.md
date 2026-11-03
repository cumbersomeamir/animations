# Episode brief 03 (Hindi): "क्या अपनी कॉल रिकॉर्ड करना कानूनी है?" (Recording a call you are part of, INDIA)

Round: 2026-11-03 hindi-03 (user-approved new batch) · Format: `../08-series-format.md` (unchanged) · Output:
`production/30s/2026-11-03-hindi-03/courtlens-30s-hindi03-01.mp4`

## Topic history check [VERIFIED 2026-11-03]
Earlier outputs:
- 2026-11-01 app film
- 2026-11-01 15 s style test
- episode 01 (no refunds vs defective item)
- episode 02 (above-MRP water bottle)

None covers call recording, so the user's topic was used. Primary sources could support a narrowed version, so no
substitute topic was needed.

## User corrections applied (latest overrides older language rules) [USER DIRECTIVE]
- **All narration and captions in natural Hindi (Devanagari).** On-screen labels are Hindi too. The official brand
  name "Courtlens" stays in Latin only on the icon CTA card; captions use कोर्टलेंस.
- **Genuinely Hindi-capable local voice:** Kokoro v1.0's own Hindi voices (hf_alpha, hm_psi) with Hindi
  phonemisation (espeak-ng "hi"), from the already-cached open model (Apache-2.0). No paid API, no cloning of a real
  person, and no English af_bella/am_puck voice fed Hindi text.
  - Blend hf_alpha 0.7 + hm_psi 0.3 keeps the accepted female-lead 0.7/0.3 character.
  - Speed is 1.05 instead of 0.98. Hindi ran slower than English, and 1.05 was the setting tested for clarity.
- **Hindi glyphs:** Noto Sans Devanagari 5.3.0 (OFL, npm @fontsource) is the fallback face behind Inter. Letter-spacing
  is off on Hindi strings so conjuncts and matras shape correctly. Full-resolution frames were checked for missing glyphs.
- **Listening check:** I cannot hear audio directly, so a local Hindi ASR (faster-whisper "medium", language=hi)
  transcribed every line and the final mix as a proxy. Words that came out unclear were rephrased:
  - छेड़छाड़ → "उसमें बदलाव न हो"
  - छिपी → गुप्त
  - छापने → फैलाने
  - आवाज़ → आवाज in the TTS input only
  - कोर्टलेंस → "कोर्ट लेंस" in the TTS input only
  - बातचीत avoided
- **Sheet feedback (Satisfied = Yes):** the accepted feedback-01 renderer, palette, caption band, motion and CTA are
  reused through the round-02 copy. Only performers and copy changed. No context or design rewrite.

## Final Hindi script (74 words, 27.6 s of speech) [VERIFIED]
"फ़ोन पर मकान मालिक ने डिपॉज़िट लौटाने का वादा किया, आपने कॉल रिकॉर्ड की। क्या यह कानूनी है? सुप्रीम कोर्ट कहता है:
गुप्त रिकॉर्डिंग भी सबूत बन सकती है, बशर्ते बात मामले की हो, आवाज़ पहचानी जाए और उसमें बदलाव न हो। पोस्ट करना अलग
मामला है: बिना सहमति निजी बातें फैलाने पर हर्जाने का दावा हो सकता है। मूल फ़ाइल बिना एडिट किए रखें। आसान कानून के
लिए, कोर्टलेंस को फ़ॉलो करें।"

## Citations [VERIFIED; full text in production notes/LEGAL-SOURCES.md]
- Vibhor Garg v. Neha, 2025 INSC 829 (SC, 14 Jul 2025), para 9.5: three-fold test; lack of consent or knowledge
  doesn't bar admissibility (official PDF).
- R.M. Malkani v. State of Maharashtra (1973): relevance, voice identification, accuracy (official PDF).
- R. Rajagopal v. State of TN (SC, 7 Oct 1994), para 26(1): publishing private matters without consent can be
  actionable for damages (judgment text via Indian Kanoon; official host unreachable).
- Deliberately not claimed: a blanket "legal" or "illegal" answer, Telecommunications Act, BSA s.63, fines.

## Storyboard
`production/30s/2026-11-03-hindi-03/notes/STORYBOARD.md`. Post copy (Hindi): `notes/PUBLISHING.md`.
