// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-21 brief): 0–4.6 hook (a green wave through a tiny city; "never drives a car … cut your stops") ·
// 4.6–16.1 build (anonymous driving trends → stops pile up → a timing suggestion an engineer accepts → more green, a green
// wave) · 16.1–21.45 measured proof with scope (one Boston crossing, pilot) · 21.45–26.85 payoff (results vary; report a
// light that always stops you) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: the tiny city in green-wave timing; "cut your stops at red lights" 2.74–4.12
    cut1: 4.6,
    // B · top-down, the old timing: "reads anonymous Maps driving trends" 5.61–7.79 → stop dots pile up, columns rise at 7.4;
    //     "Where cars keep stopping" 8.58–9.64 → the worst crossing pulses
    dots: [5.6, 7.4], cols: [7.35, 8.0], worst: 9.1,
    // C · phone: "it suggests new timing to city engineers" 10.1–11.9 → a suggestion card; the engineer taps Accept
    cut2: 9.95, rec: 9.8, tap: 11.62,
    // D · side view: "A little more green" 12.95–13.43 → crossing 2 turns green early (+6 s); "turn green in a wave" 14.03–15.57
    cut3: 12.55, wave: 13.0, waveLbl: 14.5,
    // E · card: "In Boston's pilot" 16.3 · "one crossing saw 33% fewer unnecessary stops" 17.64–20.98 → bar shrinks, −33%
    cut4: 16.1, pilot: 16.3, num: [18.45, 18.9], bar: [18.5, 19.3], src: 19.6,
    // F · phone: "Results vary." 21.65–22.31; "report it to your city" 24.59–25.41 → report a light's timing, sent
    cut5: 21.45, form: 22.75, send: 24.6, sent: 24.85,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 4.75 }, { id: 's3', t: 8.5 }, { id: 's4', t: 12.75 }, { id: 's5', t: 16.2 }, { id: 's6', t: 21.65 }, { id: 's7', t: 27.2 },
  ],
  // caption band (2026-11-19 brief): pill y ≈ 282..458, x 100..900 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 2.1, lines: [[['This AI never', 0]], [['drives a car,', 1]]] },
    { t0: 2.1, t1: 4.55, lines: [[['yet it can cut your', 0]], [['stops at ', 0], ['red lights.', 2]]] },
    { t0: 4.65, t1: 5.55, lines: [[['Google’s ', 0], ['Green Light', 1]]] },
    { t0: 5.55, t1: 8.4, lines: [[['reads anonymous', 0]], [['Maps driving trends.', 1]]] },
    { t0: 8.45, t1: 9.95, lines: [[['Where cars keep', 0]], [['stopping,', 2]]] },
    { t0: 9.95, t1: 12.55, lines: [[['it suggests ', 0], ['new timing', 1]], [['to city engineers.', 0]]] },
    { t0: 12.6, t1: 13.7, lines: [[['A little more ', 0], ['green,', 1]]] },
    { t0: 13.7, t1: 16.1, lines: [[['or lights that turn', 0]], [['green in a wave.', 1]]] },
    { t0: 16.15, t1: 17.5, lines: [[['In Boston’s pilot,', 0]]] },
    { t0: 17.5, t1: 21.4, lines: [[['one crossing saw ', 0], ['33%', 1]], [['fewer unnecessary stops.', 0]]] },
    { t0: 21.5, t1: 22.6, lines: [[['Results vary.', 2]]] },
    { t0: 22.6, t1: 24.5, lines: [[['If one light', 0]], [['always stops you,', 0]]] },
    { t0: 24.5, t1: 26.0, lines: [[['report it', 1]], [['to your city.', 0]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
