// cues.js — one timeline for picture, lip-sync and score (seconds). Hindi narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper medium, language hi); action hits placed on those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook ("शर्ट सिकुड़ गई" 2.39–3.3)
    shrink: 2.7,
    // B · clear, straight photo ("साफ़" 5.15, "सीधी" 5.71, "फ़ोटो" 6.19)
    align0: 4.9, align1: 5.85, snap: 6.25,
    // C · ask in Hindi ("पूछिए" 9.07, "निशानों…बताओ" 9.87–12.0)
    type0: 9.6, type1: 11.9, ans: [13.55, 16.3, 17.0, 17.35, 17.7],
    // D · explain on the label ("टब" 13.06, "तीस" 13.7, "डिग्री तक पानी" 14.44–15.4, "नीचे लाइन" 16.12–16.8, "हल्की धुलाई" 17.2)
    num: 13.6, deg: 14.5, bar: 16.1, gentle: 17.15,
    // E · cross-check ("मिलाइए" 21.58, "ब्रांड की वेबसाइट" 23.2–24.3)
    match: 20.2, siteShow: 22.1, siteOk: 23.85,
  },
  narration: [
    { id: 'h1', t: 0.25 }, { id: 'h2', t: 3.75 }, { id: 'h3', t: 7.45 }, { id: 'h4', t: 12.5 }, { id: 'h5', t: 18.4 }, { id: 'h6', t: 26.2 },
  ],
  // Hindi captions (Devanagari), word-aligned; parts: [text, colour] 0 white · 1 mint · 2 amber
  captions: [
    { t0: 0.2, t1: 3.65, lines: [[['अंदाज़े से धोया…', 0]], [['और महँगी शर्ट ', 0], ['सिकुड़ गई!', 2]]] },
    { t0: 3.7, t1: 7.35, lines: [[['पहले कपड़े के लेबल की', 0]], [['साफ़, सीधी फ़ोटो', 1], [' लीजिए।', 0]]] },
    { t0: 7.4, t1: 9.75, lines: [[['फिर किसी ', 0], ['एआई ऐप', 1], [' से पूछिए:', 0]]] },
    { t0: 9.75, t1: 12.4, lines: [[['“इन निशानों का मतलब', 0]], [['हिंदी में बताओ”', 1]]] },
    { t0: 12.45, t1: 15.5, lines: [[['जैसे, टब में ', 0], ['30', 2]], [['यानी ', 0], ['30 डिग्री तक पानी,', 1]]] },
    { t0: 15.5, t1: 18.3, lines: [[['और नीचे ', 0], ['लाइन', 2]], [['यानी ', 0], ['हल्की धुलाई।', 1]]] },
    { t0: 18.35, t1: 21.9, lines: [[['पर एआई चूक सकता है,', 0]], [['इसलिए जवाब ', 0], ['लेबल से मिलाइए', 1]]] },
    { t0: 21.9, t1: 25.4, lines: [[['और शक हो तो', 0]], [['ब्रांड की वेबसाइट', 1], [' देखिए।', 0]]] },
    { t0: 25.9, t1: 30.2, lines: [[['@icon', 0], ['आइडियावर्स ऐप', 1]], [['डाउनलोड कीजिए', 0]]], cta: true },
  ],
};
export default CUES;
