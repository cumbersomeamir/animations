// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: blur sweeps across the photo (0.05–0.8); cut; "tiny phone lens" 0.26–1.34 → ring on the lens; "like this" 2.78–3.22; "So how?" 3.66
    sweep: [0.05, 0.8], cut1: 0.9, lens: 1.0, point: 2.2, how: 3.66,
    // B · "Portrait mode" 4.6, "AI" 5.6, "find the person" 6.34–7.06 → trace + mask; "how far away" 8.0–9.2 → depth layers near→far
    cut2: 4.4, flip1: 4.7, trace: [5.65, 6.75], mask: 6.55, depth: [7.7, 8.35, 8.95], legend: 8.0,
    // C · "adds the blur" 11.38–12.16 → blur by depth; "Farther" 12.64 → far bar; "blurrier" 13.1 → bokeh pulse
    undepth: 10.45, blur: [11.4, 12.3], meters: 11.45, far: 12.64, bokeh: 13.1,
    // D · close-up: "Frizzy hair" 14.55 · "sunglasses" 15.25 · "check the edges" 16.99–17.59
    cut3: 14.25, ringHair: 14.6, chipHair: 14.95, ringGlass: 15.28, chipGlass: 15.62, edges: [16.95, 17.75],
    // E · phone edit screen: "added later" 20.04–20.7 → blur layer lifts off; "turn it down" 21.52–22.22; "or off" 22.62; then back on, low
    cut4: 18.6, layer: [20.0, 20.95], down: [21.5, 22.2], off: 22.62, on2: 24.1,
    cta: 25.4,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 4.6 }, { id: 's3', t: 11.0 }, { id: 's4', t: 14.55 }, { id: 's5', t: 19.2 }, { id: 's6', t: 26.6 },
  ],
  // English captions; parts: [text, colour] 0 white · 1 mint · 2 amber ; each caption ≤ 2 lines
  captions: [
    { t0: 0.15, t1: 3.38, lines: [[['A tiny ', 0], ['phone lens', 1], [' can’t really', 0]], [['blur a background', 0], [' like this.', 0]]] },
    { t0: 3.38, t1: 4.42, lines: [[['So how?', 2]]] },
    { t0: 4.45, t1: 7.32, lines: [[['Portrait mode', 1], [' uses ', 0], ['AI', 1]], [['to find the person,', 0]]] },
    { t0: 7.32, t1: 10.6, lines: [[['then estimates ', 0], ['how far away', 1]], [['everything else is.', 0]]] },
    { t0: 10.6, t1: 14.25, lines: [[['Then software ', 0], ['adds the blur:', 1]], [['farther means blurrier.', 0]]] },
    { t0: 14.25, t1: 16.72, lines: [[['Frizzy hair', 2], [' or ', 0], ['sunglasses', 2]], [['can fool it,', 0]]] },
    { t0: 16.72, t1: 18.75, lines: [[['so ', 0], ['check the edges.', 1]]] },
    { t0: 18.8, t1: 20.87, lines: [[['And since the blur', 0]], [['is ', 0], ['added later,', 1]]] },
    { t0: 20.87, t1: 23.95, lines: [[['you can often ', 0], ['turn it down,', 1]], [['or ', 0], ['off', 1], [', afterwards.', 0]]] },
    { t0: 26.3, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app', 1]]], cta: true },
  ],
};
export default CUES;
