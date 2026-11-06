// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · the note lands (0–0.9); "Snap a photo" 2.0–2.5
    snap: 2.15,
    // B/C · the instruction ("Turn this" 5.38, "checklist" 6.04, "aisle" 7.46; "skip crossed-out" 9.15, "flag… can't read" 10.57–11.6)
    type: [5.38, 6.3, 7.9, 9.1, 10.3, 10.5, 11.9], chips: [7.5, 9.4, 10.6],
    // D · on the note ("bread" 12.88, "gone" 14.2, "six eggs" 15.44, "eight" 16.12, "flagged" 16.84) then the checklist
    ringBread: 12.85, chipBread: 14.15, ringEggs: 15.4, chipEggs: 16.1, flip1: 16.85, groups: [17.15, 17.4, 17.65], skip: 17.9,
    // E · check against the photo ("check" 19.18, "photo" 20.26, "fix" 21.08, "wrong" 22.0) → zoom, "it's a 6", fixed
    flip2: 19.15, match: 19.5, zoom: 21.0, seen: 22.6, fix: 23.3,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 3.7 }, { id: 's3', t: 8.65 }, { id: 's4', t: 12.6 }, { id: 's5', t: 18.2 }, { id: 's6', t: 26.6 },
  ],
  // English captions; parts: [text, colour] 0 white · 1 mint · 2 amber ; each caption ≤ 2 lines
  captions: [
    { t0: 0.15, t1: 3.55, lines: [[['A messy ', 0], ['handwritten', 2], [' shopping list?', 0]], [['Snap a photo', 1], [' of it.', 0]]] },
    { t0: 3.6, t1: 5.3, lines: [[['Ask an ', 0], ['AI app:', 1]]] },
    { t0: 5.3, t1: 8.55, lines: [[['turn this into a ', 0], ['checklist', 1]], [['grouped by ', 0], ['supermarket aisle.', 1]]] },
    { t0: 8.6, t1: 12.4, lines: [[['Add: ', 0], ['skip crossed-out items,', 1]], [['and ', 0], ['flag', 2], [' anything you can’t read.', 0]]] },
    { t0: 12.45, t1: 15.1, lines: [[['Here, ', 0], ['bread', 2], [' was crossed out,', 0]], [['so it is gone.', 0]]] },
    { t0: 15.1, t1: 18.1, lines: [[['And is that a six or an eight?', 0]], [['It gets ', 0], ['flagged.', 2]]] },
    { t0: 18.15, t1: 20.75, lines: [[['Before you shop, ', 0], ['check the list', 1]], [['against your photo,', 0]]] },
    { t0: 20.75, t1: 23.3, lines: [[['and ', 0], ['fix anything', 1]], [['it got wrong.', 0]]] },
    { t0: 26.3, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app', 1]]], cta: true },
  ],
};
export default CUES;
