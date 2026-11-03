// cues.js — one timeline for picture, lip-sync and score (seconds). Hindi narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper medium, language hi); meme beats placed on those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // hook + punchline ("मोहल्ला बुला लिया!" 3.88–4.89): groceries rain into the cart, then freeze-frame
    rain0: 2.85,
    // escalation ("आटा" 6.42, "तेल" 8.14, "तरबूज़" 9.49) + clipboard knocked away
    atta: 6.45, oil: [7.55, 7.75, 7.95, 8.15], mel: [9.05, 9.3, 9.5], clipHit: 9.72,
    // freeze-frames: [start, end, focal x, focal y] (px) — punchline wide, then DOCKET's deadpan stare
    freeze: [[4.4, 5.38, 620, 1040], [10.2, 10.98, -1, -1]],
    // payoff ("गलती मेरी थी… मैंने बस लिखा था, राशन की लिस्ट" 11.05–14.36): the vague prompt + what it never said
    vagueIns: 11.0, qs: [12.15, 12.6, 13.05, 13.5],
    // fix ("दो लोग" 15.99, "तीन दिन" 16.49, "छह सौ रुपये" 17.33, "घर में चावल-दाल" 18.17)
    empty0: 14.6, fixType: 15.85, chips: [15.99, 16.49, 17.33, 18.17], send2: 19.3, listRows: [19.6, 19.85, 20.1, 20.35], total: 20.7,
    // result + check ("दाम खुद जाँचिए" 22.05–22.7)
    modest0: 21.8, tags0: 22.0, check0: 22.5,
  },
  narration: [
    { id: 'm1', t: 0.15 }, { id: 'm2', t: 2.6 }, { id: 'm3', t: 5.5 }, { id: 'm4', t: 7.1 }, { id: 'm5', t: 8.75 },
    { id: 'm6', t: 11.05 }, { id: 'm7', t: 14.65 }, { id: 'm8', t: 19.55 }, { id: 'm9', t: 23.45 },
  ],
  // meme captions (Hindi, Devanagari; "AI" kept as the user wrote it); parts: [text, colour] 0 white · 1 mint · 2 amber
  captions: [
    { t0: 0.1, t1: 2.55, lines: [[['दो लोगों का राशन', 0]], [['माँगा था…', 0]]] },
    { t0: 2.55, t1: 5.45, lines: [[['AI ने ', 0], ['पूरा मोहल्ला', 2]], [['बुला लिया!', 2]]] },
    { t0: 5.45, t1: 7.05, lines: [[['50 किलो आटा…', 0]]] },
    { t0: 7.05, t1: 8.7, lines: [[['और 20 लीटर तेल…', 0]]] },
    { t0: 8.7, t1: 10.95, lines: [[['और तीन ', 0], ['तरबूज़!', 2]]] },
    { t0: 10.95, t1: 14.6, lines: [[['गलती मेरी थी…', 0]], [['मैंने बस लिखा था, “राशन की लिस्ट”', 0]]] },
    { t0: 14.6, t1: 19.45, lines: [[['अब साफ़ लिखिए: ', 0], ['2 लोग, 3 दिन,', 1]], [['₹600, घर में चावल-दाल', 1]]] },
    { t0: 19.45, t1: 23.4, lines: [[['लिस्ट छोटी और काम की बनी,', 0]], [['फिर भी ', 0], ['दाम खुद जाँचिए', 2]]] },
    { t0: 23.4, t1: 30.2, lines: [[['ऐसे काम के AI तरीके सीखने के लिए', 0]], [['@icon', 0], ['आइडियावर्स ऐप', 1], [' डाउनलोड कीजिए', 0]]], cta: true },
  ],
};
export default CUES;
