// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–3.85 hook · 3.85–10.85 mechanism (rolling buffer, shutter picks frames) · 10.85–19.9 proof
// (1.5 s each side; a model suggests the sharpest) · 19.9–26.85 payoff (pick the frame yourself) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: DOCKET's finger on the shutter, the phone already shows the jump; "How?" 3.12
    how: 3.1,
    // B · buffer: "starts shooting" 4.23 → captures begin; one every 0.25 s; "in a loop" 7.06–7.85 → the ring wraps
    cut1: 3.85, cap0: 4.3, capDt: 0.25, capN: 17, shooting: 4.4, loop: 7.05,
    // C · "The shutter" 8.46 → press; "picks frames" 8.96–9.6 → the latest frames fly out; "already took" 9.78–10.3
    press: 8.45, pick: [9.0, 9.7], taken: 9.78,
    // D · card: "Live Photos and Top Shot" 10.95–12.5 → frames appear; "a second and a half" 12.99–13.71 → brackets
    cut2: 10.85, rows: [11.0, 12.4], before: 12.95, after: 13.75, each: 13.0,
    // E · "a model suggest" 16.17–17.25 → scan; "a sharper frame" 17.25–18.25 → ✓ on the mid-air frame
    scan: [16.85, 17.6], best: 17.65, ai: 16.6,
    // F · phone: "pick the jump yourself" 22.66–23.7 → scrub to the jump; tap; saved
    cut3: 19.9, scrub: [22.65, 23.6], pickLbl: 22.7, tap: 24.2, saved: 24.4,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 3.95 }, { id: 's3', t: 8.4 }, { id: 's4', t: 10.95 }, { id: 's5', t: 15.35 }, { id: 's6', t: 20.0 }, { id: 's7', t: 27.2 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 1.05, lines: [[['You pressed', 0]], [['too late,', 2]]] },
    { t0: 1.05, t1: 2.85, lines: [[['but your phone still', 0]], [['caught the ', 0], ['jump.', 1]]] },
    { t0: 2.85, t1: 3.85, lines: [[['How?', 1]]] },
    { t0: 3.9, t1: 4.9, lines: [[['The camera', 0]], [['starts shooting', 1]]] },
    { t0: 4.9, t1: 6.1, lines: [[['when you open it,', 0]]] },
    { t0: 6.1, t1: 8.2, lines: [[['keeping recent frames', 0]], [['in a ', 0], ['loop.', 1]]] },
    { t0: 8.35, t1: 9.55, lines: [[['The shutter just', 0]], [['picks frames', 1]]] },
    { t0: 9.55, t1: 10.85, lines: [[['it ', 0], ['already took.', 2]]] },
    { t0: 10.9, t1: 12.78, lines: [[['Live Photos', 1], [' and', 0]], [['Top Shot', 1]]] },
    { t0: 12.78, t1: 13.82, lines: [[['keep a second', 1]], [['and a half', 1]]] },
    { t0: 13.82, t1: 15.2, lines: [[['on each side.', 0]]] },
    { t0: 15.3, t1: 16.87, lines: [[['Top Shot', 1], [' even has', 0]], [['a model', 0]]] },
    { t0: 16.87, t1: 18.9, lines: [[['suggest a', 0]], [['sharper frame.', 1]]] },
    { t0: 19.95, t1: 20.7, lines: [[['Missed it?', 2]]] },
    { t0: 20.7, t1: 22.2, lines: [[['Open the photo’s', 0]], [['motion frames', 1]]] },
    { t0: 22.2, t1: 24.6, lines: [[['and ', 0], ['pick the jump', 1]], [['yourself.', 0]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
