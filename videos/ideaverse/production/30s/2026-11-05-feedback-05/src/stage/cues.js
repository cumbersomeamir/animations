// cues.js — one timeline for picture, lip-sync and score (seconds). Hindi narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper medium, language hi); action hits placed on those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: wall of text scrolls (0–1.7), the buried deadline lights up ("फ़ीस की आख़िरी तारीख़" 2.0–3.4), stamp ("छूट गई" 3.5)
    buried: 2.0, missed: 2.95,
    // B · paste the notice ("नोटिस… एआई ऐप में डालिए" 4.9–7.2)
    paste: 5.3,
    // C · the instruction ("तारीख़ें" 8.3, "पैसे" 9.0, "ज़रूरी काम" 9.78, "असली लाइन" 13.06; "साफ़ न…" 15.1, "पता नहीं" 18.2)
    type: [8.3, 10.9, 11.4, 13.9, 14.6, 18.2], chips: [8.35, 9.05, 9.85, 13.1, 18.25], send: 18.75,
    // D · the AI's checklist on the easel card (flip 17.1 → rows)
    flip1: 17.1, rows: [17.45, 17.85, 18.25, 18.6],
    // E · cross-check on the original ("हर पॉइंट" 19.73, "असली लाइन से मिलाइए" 20.71–22.0, "पता नहीं वाली बात" 22.61, "स्कूल से पूछिए" 23.85)
    flip2: 19.4, badges: [19.9, 20.6, 21.3], unclear: 22.6, ask: 23.3,
  },
  narration: [
    { id: 'h1', t: 0.2 }, { id: 'h2', t: 4.4 }, { id: 'h3', t: 8.3 }, { id: 'h4', t: 14.5 }, { id: 'h5', t: 19.45 }, { id: 'h6', t: 26.3 },
  ],
  // Hindi captions (Devanagari), word-aligned; parts: [text, colour] 0 white · 1 mint · 2 amber
  captions: [
    { t0: 0.15, t1: 4.3, lines: [[['पूरा नोटिस पढ़ा… फिर भी', 0]], [['फ़ीस की ', 0], ['आख़िरी तारीख़ छूट गई!', 2]]] },
    { t0: 4.35, t1: 8.2, lines: [[['लंबा नोटिस किसी ', 0], ['एआई ऐप', 1], [' में', 0]], [['डालिए, और लिखिए:', 0]]] },
    { t0: 8.25, t1: 11.4, lines: [[['तारीख़ें, पैसे', 1], [' और ', 0], ['ज़रूरी काम', 1]], [['अलग करो,', 0]]] },
    { t0: 11.4, t1: 14.45, lines: [[['हर एक के साथ', 0]], [['नोटिस की ', 0], ['असली लाइन', 1], [' लिखो।', 0]]] },
    { t0: 14.5, t1: 17.95, lines: [[['जो बात साफ़ न लिखी हो,', 0]], [['उस पर ', 0], ['अंदाज़ा मत लगाओ,', 2]]] },
    { t0: 17.95, t1: 19.4, lines: [[['“पता नहीं”', 2], [' लिखो।', 0]]] },
    { t0: 19.4, t1: 22.4, lines: [[['फिर हर पॉइंट को', 0]], [['असली लाइन से मिलाइए,', 1]]] },
    { t0: 22.4, t1: 25.3, lines: [[['और ', 0], ['“पता नहीं”', 2], [' वाली बात', 0]], [['स्कूल से पूछिए।', 1]]] },
    { t0: 26.0, t1: 30.2, lines: [[['@icon', 0], ['आइडियावर्स ऐप', 1]], [['डाउनलोड कीजिए', 0]]], cta: true },
  ],
};
export default CUES;
