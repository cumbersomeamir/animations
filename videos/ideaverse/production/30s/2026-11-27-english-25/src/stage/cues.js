// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-27 brief): 0–4.35 hook (a snatch; the screen locks itself; "How?") · 4.35–21.3 build + proof (AI + motion
// sensors · grab-then-run/bike/drive pattern · the lock · may not trigger with steady Wi-Fi/Bluetooth) · 21.3–26.85 payoff
// (check it's on: Settings › Google › All services › Theft protection) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: "A thief grabs your phone" 0.46 → the glove yanks it; "runs" 1.46 → it races off; "locks itself" 2.38 → lock
    grab: 0.42, yank: [0.45, 1.1], lock1: 2.4, exit: [2.9, 4.0], how: 3.62,
    // B · card: "uses AI" 6.25 → AI chip; "the motion sensors" 7.37–7.99 → motion axes wiggle
    cut1: 4.35, ai: 6.25, motion: 7.4,
    // C · card: "jolt of a grab" 9.67–10.43 → spike; "running" 11.19 · "biking" 11.81 · "driving away" 12.45
    cut2: 8.6, trace: [8.8, 10.1], spike: 10.15, runs: [11.2, 11.82, 12.45],
    // D · 3D: "That pattern locks the screen" 14.09–14.81 → lock slam on the running phone
    cut3: 13.55, lock2: 14.15,
    // E · card: "To avoid false alarms" 16.0–17.1 · "it may not trigger" 17.78–18.36 · "steady Wi-Fi" 18.88 · "Bluetooth" 19.84
    cut4: 15.75, wifi: 18.85, bt: 19.85, nolock: 17.9,
    // F · DOCKET's phone: "Check it's on" 21.4 · Settings 22.42 · Google 22.7 · All services 23.22 · Theft protection 23.94
    cut5: 21.3, rows: [22.42, 22.7, 23.22, 23.94], toggle: 24.75,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 4.45 }, { id: 's3', t: 8.75 }, { id: 's4', t: 13.65 }, { id: 's5', t: 15.9 }, { id: 's6', t: 21.4 }, { id: 's7', t: 27.2 },
  ],
  // caption band (2026-11-19 brief): pill y ≈ 282..458, x 100..900 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 1.85, lines: [[['A thief ', 0], ['grabs', 2]], [['your phone and runs.', 0]]] },
    { t0: 1.85, t1: 4.3, lines: [[['The screen ', 0], ['locks itself.', 1]], [['How?', 2]]] },
    { t0: 4.4, t1: 5.75, lines: [[['Android’s Theft', 1]], [['Detection Lock', 1]]] },
    { t0: 5.75, t1: 8.55, lines: [[['uses ', 0], ['AI', 1], [' and the', 0]], [['motion sensors.', 1]]] },
    { t0: 8.6, t1: 10.75, lines: [[['It recognizes the', 0]], [['jolt', 2], [' of a grab,', 0]]] },
    { t0: 10.75, t1: 13.5, lines: [[['then ', 0], ['running, biking', 1]], [['or driving away.', 1]]] },
    { t0: 13.55, t1: 15.75, lines: [[['That pattern ', 0], ['locks', 1]], [['the screen in a moment.', 0]]] },
    { t0: 15.8, t1: 17.55, lines: [[['To avoid', 0]], [['false alarms,', 2]]] },
    { t0: 17.55, t1: 18.3, lines: [[['it may ', 0], ['not trigger', 2]]] },
    { t0: 18.3, t1: 21.2, lines: [[['with a steady ', 0], ['Wi-Fi', 1]], [['or ', 0], ['Bluetooth', 1], [' connection.', 0]]] },
    { t0: 21.3, t1: 22.3, lines: [[['Check it’s on:', 2]]] },
    { t0: 22.3, t1: 23.85, lines: [[['Settings, Google,', 0]], [['All services,', 0]]] },
    { t0: 23.85, t1: 25.6, lines: [[['Theft protection.', 1]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
