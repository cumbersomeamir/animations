// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
const CUES = {
  fps: 30, dur: 30,
  // the original 6-note hum in the hook (score + note dots on the card use the same times)
  hum: [[0.06, 0], [0.22, 2], [0.38, 4], [0.54, 2], [0.7, 5], [0.86, 4]],
  hits: {
    // A · hook: DOCKET hums (0.06–1.0), notes float, dots land on the card; "but no words?" 2.26–2.78 → blank lyrics; "Just hum it" 3.22
    blank: 2.3, nod: 3.25,
    // B · phone: "In the Google app" 4.76; "tap Search a song" 5.54–6.38 → tap; "hum for 10 to 15 seconds" 6.86–8.32 → listening ring
    cut2: 4.5, tap: 5.75, listen: 6.4, ring: [6.9, 8.4],
    // C · "turns your hum into the shape of the melody" 9.48–11.24 → wobbly line → note shape; "compares it with songs" 11.24–12.64; "No perfect pitch needed" 13.54–14.78
    cut3: 9.2, shape: [9.6, 10.9], compare: [11.4, 12.6], pitch: 13.55,
    // D · "the likeliest matches" 16.0–17.2 → results; "the top one can be wrong" 17.72–18.9 → ring
    results: 15.9, push: [16.3, 17.3], wrong: 18.0,
    // E · phone: play #1 (not it), play #2 (that's it)
    cut5: 19.9, play1: 20.7, not1: 21.75, play2: 22.4, yes2: 23.5,
    cta: 25.4,
  },
  narration: [
    { id: 's1', t: 1.1 }, { id: 's2', t: 4.6 }, { id: 's3', t: 9.4 }, { id: 's4', t: 16.0 }, { id: 's5', t: 20.2 }, { id: 's6', t: 26.6 },
  ],
  // English captions; parts: [text, colour] 0 white · 1 mint · 2 amber ; each caption ≤ 2 lines
  captions: [
    { t0: 1.05, t1: 3.0, lines: [[['A tune stuck in your head,', 0]], [['but ', 0], ['no words?', 2]]] },
    { t0: 3.0, t1: 4.5, lines: [[['Just ', 0], ['hum it.', 1]]] },
    { t0: 4.55, t1: 6.6, lines: [[['In the Google app,', 0]], [['tap ', 0], ['Search a song,', 1]]] },
    { t0: 6.6, t1: 9.2, lines: [[['then hum for', 0]], [['10 to 15 seconds.', 1]]] },
    { t0: 9.25, t1: 11.3, lines: [[['It turns your hum into', 0]], [['the ', 0], ['shape of the melody', 1]]] },
    { t0: 11.3, t1: 13.2, lines: [[['and ', 0], ['compares', 1], [' it with songs.', 0]]] },
    { t0: 13.2, t1: 15.8, lines: [[['No perfect pitch', 1], [' needed.', 0]]] },
    { t0: 15.85, t1: 17.45, lines: [[['You get the ', 0], ['likeliest matches,', 1]]] },
    { t0: 17.45, t1: 19.9, lines: [[['and the top one', 0]], [['can be wrong.', 2]]] },
    { t0: 20.0, t1: 23.2, lines: [[['So ', 0], ['play a few seconds', 1], [' of each', 0]], [['before you trust the name.', 0]]] },
    { t0: 26.3, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app', 1]]], cta: true },
  ],
};
export default CUES;
