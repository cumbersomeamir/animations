// cues.js — one timeline for picture, lip-sync and score (seconds). Hindi narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper medium, language hi); action hits are placed against those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook ("कचरे का डिब्बा" 2.27)
    point: 2.2,
    // B · select ("टैप" 6.67, "गोला बनाकर चुनें" 7.79–9.0)
    tap: 6.62, circle0: 7.75, circle1: 8.85,
    // C · AI fills ("फिर एआई" 9.35, "अनुमान" 9.99, "वहाँ क्या दिखता" 12.61, "भर देता है" 14.51)
    lift: 9.55, fill0: 11.3, fill1: 14.7,
    // D · check ("ज़ूम" 18.21, "किनारे" 18.87, "परछाइयाँ" 19.77, "जाँचें" 20.43)
    edges: 18.85, shadowRing: 19.75, shadowFix: 20.45,
    // E · free / paid ("सब्सक्रिप्शन नहीं लगता" 21.79–23.2, "फ़ोन" 24.57)
    freeShow: 21.05, subOk: 22.7, devOk: 24.6,
  },
  narration: [
    { id: 'h1', t: 0.25 }, { id: 'h2', t: 3.55 }, { id: 'h3', t: 9.35 }, { id: 'h4', t: 15.65 }, { id: 'h5', t: 21.15 }, { id: 'h6', t: 26.3 },
  ],
  // Hindi captions (Devanagari), word-aligned with the narration; parts: [text, colour] 0 white · 1 mint · 2 amber
  captions: [
    { t0: 0.2, t1: 3.45, lines: [[['फ़ोटो अच्छी है, पर', 0]], [['पीछे ', 0], ['कचरे का डिब्बा?', 2]]] },
    { t0: 3.5, t1: 6.6, lines: [[['गूगल फ़ोटोज़ के', 0]], [['मैजिक इरेज़र', 1], [' में', 0]]] },
    { t0: 6.6, t1: 9.3, lines: [[['उस पर ', 0], ['टैप', 1], [' करें, या', 0]], [['गोला बनाकर ', 1], ['चुनें।', 0]]] },
    { t0: 9.3, t1: 12.55, lines: [[['फिर ', 0], ['एआई अनुमान', 1], [' लगाता है', 0]], [['कि वह न होता तो', 0]]] },
    { t0: 12.55, t1: 15.5, lines: [[['वहाँ क्या दिखता,', 0]], [['और जगह ', 0], ['भर देता है।', 1]]] },
    { t0: 15.6, t1: 17.8, lines: [[['भरा हिस्सा', 0]], [['बस ', 0], ['अनुमान', 2], [' है,', 0]]] },
    { t0: 17.8, t1: 21.0, lines: [[['इसलिए ', 0], ['ज़ूम', 1], [' करके', 0]], [['किनारे और परछाइयाँ जाँचें।', 0]]] },
    { t0: 21.05, t1: 23.7, lines: [[['इसके लिए', 0]], [['सब्सक्रिप्शन नहीं लगता,', 1]]] },
    { t0: 23.7, t1: 26.0, lines: [[['बस आपका फ़ोन', 0]], [['इसे चला सके।', 0]]] },
    { t0: 26.1, t1: 30.2, lines: [[['@icon', 0], ['आइडियावर्स ऐप', 1]], [['डाउनलोड कीजिए', 0]]], cta: true },
  ],
};
export default CUES;
