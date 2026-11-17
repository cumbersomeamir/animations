// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–4.6 hook · 4.6–16.85 mechanism (recognize, merge 10+ shots, AI detail) · 16.85–22.05 the limit
// (sky or screen) · 22.05–26.85 payoff (turn it off for what the lens caught) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: crisp moon on the phone, a small soft moon in the real sky; "Where does that detail come from?" 2.96–4.18
    why: 3.3,
    // B · viewfinder: "Scene Optimizer" 6.87–7.77 · "first recognizes the moon" 7.77–9.3 → detection box
    cut1: 4.6, optLbl: 6.85, recog: 8.05,
    // C · card: "more than 10 shots" 10.27–11.15 → 12 noisy shots; "cut the noise" 11.47–12.2 → merge
    cut2: 9.75, shots: [10.2, 11.0], merge: [11.4, 12.25],
    // D · "a deep learning engine" 12.93–13.99 → label; "enhances the details even further" 13.99–16.3 → sweep
    aiLbl: 12.95, sweep: [14.0, 15.5],
    // E · "between the real moon and a picture of it" 19.12–21.7 → a moon on a screen gets the same MOON box
    cut3: 16.85, screenBox: 19.9, skyLbl: 20.0,
    // F · "turn Scene Optimizer off" 23.89–25.35 → toggle; "before you shoot" → the plain capture
    cut4: 22.05, toggle: 24.6, offLbl: 24.0, plain: 25.45,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 4.75 }, { id: 's3', t: 9.85 }, { id: 's4', t: 12.65 }, { id: 's5', t: 16.9 }, { id: 's6', t: 22.15 }, { id: 's7', t: 27.2 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 1.3, lines: [[['A phone shoots', 0]], [['the moon', 1]]] },
    { t0: 1.3, t1: 2.9, lines: [[['with ', 0], ['crisp craters.', 1]]] },
    { t0: 2.9, t1: 4.6, lines: [[['Where does that', 0]], [['detail', 2], [' come from?', 0]]] },
    { t0: 4.7, t1: 6.8, lines: [[['On Samsung', 0]], [['Galaxy phones,', 0]]] },
    { t0: 6.8, t1: 9.7, lines: [[['Scene Optimizer', 1], [' first', 0]], [['recognizes the moon.', 0]]] },
    { t0: 9.8, t1: 11.12, lines: [[['It merges', 0]], [['more than ', 0], ['10 shots', 1]]] },
    { t0: 11.12, t1: 12.6, lines: [[['to cut the noise.', 0]]] },
    { t0: 12.62, t1: 14.8, lines: [[['Then a ', 0], ['deep learning', 2]], [['engine', 2], [' enhances', 0]]] },
    { t0: 14.8, t1: 16.8, lines: [[['the details', 0]], [['even further.', 0]]] },
    { t0: 16.85, t1: 19.05, lines: [[['Samsung says it’s still', 0]], [['reducing confusion', 2]]] },
    { t0: 19.05, t1: 22.0, lines: [[['between the ', 0], ['real moon', 1]], [['and a ', 0], ['picture of it.', 2]]] },
    { t0: 22.1, t1: 23.85, lines: [[['For only what', 0]], [['the lens caught,', 1]]] },
    { t0: 23.85, t1: 26.6, lines: [[['turn ', 0], ['Scene Optimizer off', 2]], [['before you shoot.', 0]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
