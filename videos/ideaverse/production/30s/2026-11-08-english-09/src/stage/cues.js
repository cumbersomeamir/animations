// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: "dog" typed into the search bar (0.15–0.5), the messy grid reshuffles (0.6–1.25); "called dog" 1.32–1.84 → file-name rings
    type: [0.15, 0.5], shuffle: [0.6, 1.25], names: 1.5, chipNames: 1.85,
    // two-shot: "So how did search find him?" 2.44–3.78
    cut1: 2.3, point: 2.6, how: 3.2,
    // B · "looks at each picture" 5.52–6.28 → scan; "tags what it sees" 6.6–7.32 → tag chips; "dog, beach, cake" 7.95 / 8.22 / 8.74
    cut2: 4.6, flip1: 4.65, scan: [5.45, 5.75, 6.05], tags: [6.6, 6.85, 7.1], main: [7.95, 8.25, 8.75],
    // C · "matches your word" 10.54–11.34 → query + link to the tag; "not only file names" 12.66–13.54 → file name, no match
    query: [10.35, 10.7], link: [10.85, 11.45], nameX: 12.7,
    // D · results for "dog"; "this goat" 15.87 → ring; "tagged as a dog" 16.39–17.29 → chip; then "it's a goat"
    flip2: 14.65, push: [14.95, 15.75], ringGoat: 15.85, chipGoat: 16.4, goat: 17.3,
    // E · phone search: "a receipt" 20.96, "a beach" 21.64, "a cake" 22.18; found 23.1
    cut4: 18.45, field: 18.8, qReceipt: [20.9, 21.2], qBeach: [21.58, 21.8], qCake: [22.12, 22.34], found: 23.1,
    cta: 25.4,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 4.8 }, { id: 's3', t: 10.3 }, { id: 's4', t: 14.75 }, { id: 's5', t: 18.6 }, { id: 's6', t: 26.6 },
  ],
  // English captions; parts: [text, colour] 0 white · 1 mint · 2 amber ; each caption ≤ 2 lines
  captions: [
    { t0: 0.15, t1: 2.3, lines: [[['None of these photos', 0]], [['is called ', 0], ['dog.', 2]]] },
    { t0: 2.3, t1: 4.6, lines: [[['So how did search', 0]], [['find him?', 2]]] },
    { t0: 4.65, t1: 6.4, lines: [[['Your photos app looks', 0]], [['at each picture', 1]]] },
    { t0: 6.4, t1: 7.62, lines: [[['and ', 0], ['tags', 1], [' what it sees:', 0]]] },
    { t0: 7.62, t1: 10.2, lines: [[['dog, beach, cake.', 1]]] },
    { t0: 10.25, t1: 12.3, lines: [[['Search matches your word', 0]], [['to those ', 0], ['tags,', 1]]] },
    { t0: 12.3, t1: 14.6, lines: [[['not only ', 0], ['file names.', 2]]] },
    { t0: 14.65, t1: 15.65, lines: [[['Mistakes happen:', 2]]] },
    { t0: 15.65, t1: 18.4, lines: [[['this ', 0], ['goat', 2], [' got tagged', 0]], [['as a dog.', 0]]] },
    { t0: 18.45, t1: 20.65, lines: [[['So ', 0], ['search for what was', 1]], [['in a lost photo:', 0]]] },
    { t0: 20.65, t1: 23.7, lines: [[['a ', 0], ['receipt', 1], [', a ', 0], ['beach', 1], [', a ', 0], ['cake.', 1]]] },
    { t0: 26.3, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app', 1]]], cta: true },
  ],
};
export default CUES;
