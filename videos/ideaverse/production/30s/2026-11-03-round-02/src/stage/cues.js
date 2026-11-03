// cues.js — one timeline for picture, lip-sync and score (seconds). Narration placements from the ASR-measured clips
// (narration/words.json); action hits are placed against those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: DOCKET photographs the bus timetable ("photo" 1.74)
    snap: 1.45,
    // B · finding the text ("finds" 3.56, "text" 4.26)
    boxes0: 3.4,
    // C · recognising: a blurry '8' tile is matched against learned patterns ("recognizes" 5.80, "matching" 8.12,
    //     "shapes" 8.64, "patterns" 9.22, "learned" 9.88, "many examples" 10.36)
    tileOut: 5.8, tileAtFan: 6.55, cards0: 6.5, hops: [7.55, 8.1, 8.6, 9.15], match: 9.2, crisp: 9.4, variants: 9.85,
    cardsDown: 10.75, tileBack: 10.8, tileHome: 11.35,
    // D · real text, copy ("real text" 12.99, "Tap" 14.59, "copy" 14.77, "bus time" 15.21)
    realText: 12.2, tap: 14.6, copied: 15.0, chipFly: 15.35,
    // E · translate ("translate" 16.07, "menu" 16.65, "language" 17.29)
    menuOut: 15.9, menuShow: 16.15, trans: [16.4, 16.75, 17.1],
    // F · misread + double-check ("misreads" 20.02, "double-check" 21.22, "times" 21.74, "prices" 22.38)
    blurShow: 18.5, misShow: 19.6, boardTime: 21.6, fixTime: 21.9, boardFare: 22.35, fixFare: 22.6,
  },
  narration: [
    { id: 's1', t: 0.30 }, { id: 's2', t: 3.00 }, { id: 's3', t: 12.15 }, { id: 's4', t: 19.00 }, { id: 's5', t: 26.40 },
  ],
  // parts: [text, colour] 0 white · 1 mint · 2 amber ; each caption ≤ 2 lines
  captions: [
    { t0: 0.25, t1: 2.85, lines: [[['How does your phone read', 0]], [['the words in a ', 0], ['photo?', 1]]] },
    { t0: 2.95, t1: 5.5, lines: [[['First, it finds', 0]], [['where the ', 0], ['text', 1], [' is.', 0]]] },
    { t0: 5.55, t1: 8.05, lines: [[['Then it ', 0], ['recognizes', 1]], [['each letter and word,', 0]]] },
    { t0: 8.05, t1: 9.45, lines: [[['matching their shapes', 0]], [['to ', 0], ['patterns', 1]]] },
    { t0: 9.45, t1: 11.7, lines: [[['it learned from', 0]], [['many examples.', 1]]] },
    { t0: 12.1, t1: 14.3, lines: [[['The photo becomes', 0]], [['real text:', 1]]] },
    { t0: 14.35, t1: 15.62, lines: [[['tap to ', 0], ['copy', 1]], [['a bus time,', 0]]] },
    { t0: 15.62, t1: 18.4, lines: [[['or ', 0], ['translate', 1], [' a menu', 0]], [['into your language.', 0]]] },
    { t0: 18.95, t1: 21.0, lines: [[['Poor focus can', 0]], [['cause ', 0], ['misreads,', 2]]] },
    { t0: 21.0, t1: 25.6, lines: [[['so ', 0], ['double-check', 1]], [['times and prices.', 0]]] },
    { t0: 25.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app', 1]]], cta: true },
  ],
};
export default CUES;
