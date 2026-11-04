# Episode brief 04 (Hindi): "बिल पर 'रिफ़ंड नहीं' लिखा हो, तो क्या खराब सामान का पैसा नहीं मिलेगा?" (INDIA)

Round: 2026-11-04 hindi-04 (user-authorised batch) · Format: `../08-series-format.md` (unchanged) · Output:
`production/30s/2026-11-04-hindi-04/courtlens-30s-hindi04-01.mp4`

## Topic history check and decision [VERIFIED 2026-11-04]
Episode 01 (2026-11-02, English) already covered an **online** seller's "NO REFUNDS" banner on a defective item, under
the E-Commerce Rules 2020. This request is about a **physical shop's printed bill** ("रिफ़ंड नहीं · बिका माल वापस नहीं
होगा"), which rests on a different provision: **CPA 2019 s.2(47)(viii)**. That provision has its own concrete
mechanism: the bill's stated period, or **30 days** if none is stated. It also makes the bill the key evidence, and the
audience is Hindi. Decision: keep the user's topic and make the bill clause and the 30-day window the core, not
repeat episode 01's online/e-commerce framing.

## User directives applied
- All narration and captions in natural Hindi (Devanagari). On-screen labels are Hindi; "Courtlens" is Latin only on
  the icon CTA card.
- Same verified local Hindi voice as hindi-03: Kokoro v1.0 native Hindi voices, blend hf_alpha 0.7 + hm_psi 0.3,
  lang hi, speed 1.05. No English-only TTS, no clone, no paid API.
- Same font setup (Noto Sans Devanagari OFL fallback after Inter) and the accepted renderer, motion and caption band.
  Performer swapped to a leaking kettle. Pacing kept: lines ~0.25 s apart, CTA in the final 3–4 s.
- **Listening limitation (stated plainly):** no way to listen directly in this environment. Intelligibility was
  verified with a local Hindi ASR (faster-whisper "medium", language=hi) on each line and on the final mix, plus
  caption/word alignment.
- Rewordings after the ASR check:
  - "नई केतली" → "केतली तीसरे दिन…" (नई was heard as नहीं, "no kettle")
  - "नो रिफ़ंड" → "रिफ़ंड नहीं"
  - "तीस दिन" → "तीस दिनों"

## Final Hindi script (73 words) [VERIFIED]
"केतली तीसरे दिन लीक हुई; दुकानदार बोला: बिल पर लिखा है, रिफ़ंड नहीं। क्या यह चलेगा? उपभोक्ता कानून में खराब सामान
वापस न लेना, पैसे न लौटाना अनुचित व्यापार प्रथा है, बिल में लिखी अवधि में, वरना तीस दिनों के भीतर। मन बदला हो, तो
वापसी दुकान की नीति पर है। बिल और खराबी की फ़ोटो रखें, लिखित शिकायत दें, फिर 1915 पर कॉल करें। आसान कानून के लिए,
कोर्टलेंस को फ़ॉलो करें।"
(TTS input spells "एक नौ एक पाँच" and "कोर्ट लेंस" for correct pronunciation.)

## Citations [VERIFIED; full text in production notes/LEGAL-SOURCES.md]
- Consumer Protection Act, 2019 (official DoCA PDF):
  - s.2(10) defect
  - s.2(47)(viii) refusing to take back defective goods and refund, within the bill's period or 30 days, is an
    unfair trade practice
  - s.35 complaint to the District Commission
  - s.39(1)(a)–(c) repair, replacement, refund
- NCH contact page (re-checked 2026-11-04): 1915 / 1800-11-4000, 08:00–20:00; WhatsApp/SMS 8800001915.
- Secondary, notes only: an Ernakulam District Commission order on printed "goods once sold will not be taken back"
  notices.

## Reusable Hindi production adjustments (for future Hindi episodes)
- Write numbers that are said digit by digit as words ("एक नौ एक पाँच"). Write the brand as "कोर्ट लेंस" in TTS input.
- Avoid words the voice blurs:
  - aspirated छ (छिपी, छापने)
  - छेड़छाड़
  - बातचीत
  - leading "नई" (heard as नहीं)
  - "नो रिफ़ंड"
- Keep about 70–75 Hindi tokens for 30 s at speed 1.05, with ~0.25 s gaps. Mix gain 3.9 dB gives about −16 LUFS for
  this voice.
- Tools: `src/align.py` gives word times and per-line ASR; `src/asr_check.py` checks the final mix and caption alignment.

## Storyboard
`production/30s/2026-11-04-hindi-04/notes/STORYBOARD.md`. Post copy (Hindi): `notes/PUBLISHING.md`.
