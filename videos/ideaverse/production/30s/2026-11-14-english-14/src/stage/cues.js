// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–4.5 hook (+ "Why?") · 4.5–19.4 explanation + proof · 19.4–26.8 payoff · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook (floor): the vacuum swerves round the sock ("dodge a sock" 1.29–2.05), rolls onto the cable ("swallow a cable" 2.37–3.13) → STUCK; "Why?" 3.73
    sockSeen: 1.2, swallow: 2.75, stuck: 3.15, why: 3.75,
    // B · camera view: "trained to name" 5.83–6.49 → label; "Socks" 7.05, "shoes" 7.57, "sometimes cords" 8.17–8.83 → boxes
    cut1: 4.55, trained: 5.85, boxSock: 7.05, boxShoe: 7.57, boxCord: 8.4,
    // C · laser: "measures shape" 10.0–10.76 → sweep; "thin cable lying flat" 11.46–12.76 → push to the cable; "barely registers" → FEW POINTS
    cut2: 9.55, sweep: [9.8, 10.9], push: [11.5, 12.6], few: 12.8,
    // D · card: "differ by model" 14.8–15.78; "One Roomba dodges cords" 16.32–17.5 → ✓; "but not socks" 17.86–18.36 → ✗; "check your model's list" 19.74–20.78
    cut3: 14.35, header: 14.75, rowB: 16.3, cordsB: 17.2, socksB: 18.1, check: 19.75,
    // E · floor: "clear cables" 21.2–21.8 → DOCKET gathers the cable; "first mapping run" 22.5–23.5 → run starts; "switch avoidance off" 24.36–25.56 → AVOIDANCE OFF
    cut4: 21.0, grab: [21.25, 22.7], mapping: 23.1, off: 24.4,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.25 }, { id: 's2', t: 4.75 }, { id: 's3', t: 9.7 }, { id: 's4', t: 14.5 }, { id: 's5', t: 19.6 }, { id: 's6', t: 27.2 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.2, t1: 2.2, lines: [[['A robot vacuum can', 0]], [['dodge a ', 0], ['sock,', 1]]] },
    { t0: 2.2, t1: 3.45, lines: [[['then swallow a ', 0], ['cable.', 2]]] },
    { t0: 3.45, t1: 4.55, lines: [[['Why?', 2]]] },
    { t0: 4.6, t1: 6.77, lines: [[['A camera spots what', 0]], [['it was ', 0], ['trained to name:', 1]]] },
    { t0: 6.77, t1: 9.5, lines: [[['socks, shoes,', 1]], [['sometimes cords.', 2]]] },
    { t0: 9.55, t1: 11.1, lines: [[['A laser ', 1], ['measures shape,', 0]]] },
    { t0: 11.1, t1: 14.3, lines: [[['but a ', 0], ['thin cable', 2], [' lying flat', 0]], [['barely registers.', 0]]] },
    { t0: 14.35, t1: 16.1, lines: [[['And the lists', 0]], [['differ by model:', 1]]] },
    { t0: 16.1, t1: 19.35, lines: [[['one Roomba dodges cords,', 0]], [['but not ', 0], ['socks.', 2]]] },
    { t0: 19.45, t1: 20.92, lines: [[['So ', 0], ['check your model’s list,', 1]]] },
    { t0: 20.92, t1: 23.9, lines: [[['and ', 0], ['clear cables', 1], [' before', 0]], [['its first mapping run.', 0]]] },
    { t0: 23.9, t1: 26.75, lines: [[['Some switch ', 0], ['avoidance off', 2]], [['while learning.', 0]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
