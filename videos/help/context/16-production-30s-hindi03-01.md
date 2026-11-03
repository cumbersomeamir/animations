# 16 — hindi-03 (2026-11-03) 30 s #01 — Hindi: unrequested goods in disaster relief + donor checklist

**Status: DONE.** `videos/help/production/30s/2026-11-03-hindi-03/help-30s-hindi03-01.mp4` · SHA-256 `649520e96e9aac9190844fea7065a35dae2e65d3bcde83c64ad9081114293061`.

## Language correction (latest user instruction, overrides older language rules)
All narration and captions in natural Hindi (Devanagari). Voice = Kokoro-82M native Hindi voices (hf_alpha 0.7 + hm_omega 0.3, lang `hi`,
speed 0.98) — the English Meshline voice was not used. Font = Noto Sans Devanagari (OFL). Rules recorded in `11-production-format.md`.

## Topic check (why the scope was narrowed)
Proposed: "Why cash and donated goods solve different problems in disaster relief…". Episode 30s-02 (batch-02) already covered cash vs
goods in a disaster (market working vs disrupted) and "check what a trusted local organisation requests". To avoid a repeat, this episode
keeps the **uncovered** parts of the proposal: unrequested goods consume the same storage, transport and people relief needs; trusted
organisations can say what is needed now; a 3-step donor checklist. Cash is not re-argued; Help is not described as providing cash transfers.

## Sheet feedback implemented
Accepted hands-reveal style, renderer primitives, caption treatment, pacing and the yellow-hat helper kept; scope/CTA rules from
`11` (2026-11-03) applied; Play icon = `assets/icon.png` (byte-identical, re-verified 2026-11-03 for round-02, same listing today);
CTA in Hindi: "हेल्प ऐप डाउनलोड करें, ज़रूरी सामान दान करें।" (verified listing: donate essentials).

## Final script (Hindi; ~57 words; 25.6 s of speech)
| # | Start–end (s) | Hindi | English meaning |
|---|---|---|---|
| 1 | 0.20–4.21 | आपदा के बाद भेजा गया हर सामान मदद नहीं बनता। | After a disaster, not every item sent becomes help. |
| 2 | 4.55–8.39 | बिना माँगा सामान भी रखना और पहुँचाना पड़ता है। | Unrequested goods also have to be stored and delivered. |
| 3 | 8.75–13.64 | इसमें वही गोदाम, गाड़ियाँ और लोग लगते हैं, जो राहत के लिए चाहिए। | That uses the same warehouses, vehicles and people relief needs. |
| 4 | 14.00–18.09 | भरोसेमंद संस्थाएँ बता सकती हैं कि अभी क्या चाहिए। | Trusted organisations can say what is needed right now. |
| 5 | 18.45–23.54 | दान से पहले: संस्था की जाँच करें, ज़रूरत पूछें, सही मदद चुनें। | Before donating: check the organisation, ask the need, choose suitable help. |
| 6 | 25.85–29.54 | हेल्प ऐप डाउनलोड करें, ज़रूरी सामान दान करें। | Download the Help app, donate essentials. |
Pronunciation edits after Hindi ASR tests: "ढोना" (heard "धोना") and "बाँटना" → "पहुँचाना"; "संस्था जाँचें" → "संस्था की जाँच करें". No dates or
currency are spoken.

## Sources (accessed 2026-11-03)
- **F1** FEMA, "Volunteer and Donate" (last updated 20 Apr 2026), https://www.fema.gov/disaster/recover/volunteer-donate : "Sending the wrong items
  or too many can overwhelm communities already facing challenges." · "…avoids creating extra problems like overwhelming supply lines in or near
  disaster areas." · "Only donate items requested by relief organizations." · "Needs can change quickly, so always check with local sources before
  donating." · "Giving money to trusted disaster relief organizations is usually the fastest and most effective way to help."
- **R1** International Red Cross and Red Crescent Movement, *Q&A sheet for CVA volunteers* (IFRC Cash Hub, Apr 2022; SHA-256 `2e209b8a…b48669c0`),
  https://cash-hub.org/wp-content/uploads/sites/3/2022/04/QA-for-RCRC-Volunteers-on-CVA-for-Ukraine-and-Neighbouring-Countries.pdf : cash reduces
  "the need to import goods and for staff/volunteers to physically distribute them"; digital cash "cut the cost of the transport, storage, and
  distribution of items, such as food or non-food items."
- Tried, not used (blocked to automated fetch): IFRC Disaster Law page on unsolicited donations, OCHA unsolicited in-kind PDF, archived FEMA 2016 page, USAID seminar PDF.

| Claim | Support |
|---|---|
| Not every item sent after a disaster becomes help | F1 (wrong items / too many overwhelm communities) |
| Unrequested goods still have to be stored and delivered | R1 (goods need transport, storage, distribution by staff/volunteers) |
| They use the same warehouses, vehicles and people relief needs | F1 (overwhelming supply lines), R1 (staff/volunteers, transport, storage) |
| Trusted organisations can say what is needed now | F1 (items requested by relief organizations; needs change, check local sources) — "can" |
| Checklist: check the organisation, ask the need, choose suitable help | F1 (trusted organizations; requested items; check local sources) |
| Download the Help app, donate essentials | Verified Play listing |

## Storyboard (6 scenes; cues in output `src/cues.json`)
| Scene | Time | Action |
|---|---|---|
| A Hook | 0–4.4 | Hands let go; a coat, the leftovers bag, a box and a sack drop one by one into a heap; tag "बिना माँगा". |
| B Store & deliver | 4.4–8.6 | A godown (गोदाम) rises; the heap slides inside and the "जगह" (space) bar fills; a truck rolls in and is loaded. |
| C Same resources | 8.6–13.85 | Godown tag "भरा" (full) with a flash; truck "व्यस्त" (busy); a hand keeps shifting boxes; the "ज़रूरी राहत" crate waits by a clock ("इंतज़ार"). |
| D What's needed now | 13.85–18.3 | Hands raise the "भरोसेमंद संस्था — अभी क्या चाहिए" board ✓; rows क्या / कितना / कब tick. |
| E Checklist | 18.3–25.7 | Helper beside three plaques that tick on their words; the requested relief crate is loaded and driven to the neighbour ✓. |
| F CTA | 25.7–30 | Helper + neighbour with essentials; real Help icon + name plaque; lamps dim. |

## Captions (Hindi; one ASR timing pass; no overlaps)
| Time (s) | Card |
|---|---|
| 0.09–1.97 | आपदा के बाद भेजा गया |
| 2.04–4.37 | हर सामान मदद नहीं बनता। |
| 4.44–6.05 | बिना माँगा सामान भी |
| 6.12–8.57 | रखना और पहुँचाना पड़ता है। |
| 8.64–10.88 | इसमें वही गोदाम, गाड़ियाँ और |
| 10.95–11.93 | लोग लगते हैं, |
| 12.00–13.82 | जो राहत के लिए चाहिए। |
| 13.89–16.73 | भरोसेमंद संस्थाएँ बता सकती हैं |
| 16.80–18.26 | कि अभी क्या चाहिए। |
| 18.33–19.49 | दान से पहले: |
| 19.56–21.17 | संस्था की जाँच करें, |
| 21.24–22.37 | ज़रूरत पूछें, |
| 22.44–23.89 | सही मदद चुनें। |
| 25.74–27.65 | हेल्प ऐप डाउनलोड करें, |
| 27.72–29.73 | ज़रूरी सामान दान करें। |

## QA summary
30.000000 s · H.264 High 1080×1920 yuv420p 30/1 · 900 frames · full decode clean · AAC-LC 48 kHz stereo · −15.0 LUFS / −1.7 dBTP · captions
x 146–934, y 396–481, 0 violations · Hindi ASR on final mix recognises the full narration. Details: output `QA.md`.
