// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–3.7 hook · 3.7–7.3 escalation · 7.3–21.9 explanation + proof · 21.9–27.2 payoff · 27.2–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook (card): a noisy room flows into a hearing aid from frame 0 (crowd swell 0–0.75); "which voice" 1.87–2.25 → WHICH VOICE?
    which: 1.9,
    // B · two-shot: "an AI chip" 4.82–5.5 → chip + hologram; "pulls speech out of noise" 5.72–6.86 → speech up, noise down
    cut1: 3.7, chip: 4.85, pull: 5.75,
    // C · grid: "slice sound into tiny bits of pitch and time" 8.5–11.12 → mixture cut into tiles; "keep the bits that look like speech" 11.74–13.16 → mask
    cut2: 7.3, slice: [8.5, 10.9], axes: 9.9, keep: [11.8, 13.0],
    // D · "Clatter fades." 14.0–14.46 → last noise falls away; "Voices stay." 14.9–15.5 → voice tiles glow
    clatter: 14.0, stay: 14.9,
    // E · "a second voice is speech too" 16.44–17.88 → amber voice; "talk at once … their bits overlap" 18.3–20.76 → split tiles
    second: 16.45, once: 18.6, overlap: 20.2, push: [18.4, 19.6],
    // F · two-shot: "take turns" 23.4–24.06 → tiles move into turns; "one voice at a time" 24.62–25.66 → ✓
    cut4: 21.9, turns: [23.3, 24.3], ok: 24.7,
    cta: 27.15,
  },
  narration: [
    { id: 's1', t: 0.75 }, { id: 's2', t: 4.0 }, { id: 's3', t: 7.6 }, { id: 's4', t: 14.0 }, { id: 's5', t: 16.3 }, { id: 's6', t: 22.0 }, { id: 's7', t: 27.3 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.7, t1: 1.7, lines: [[['In a ', 0], ['noisy room,', 2]]] },
    { t0: 1.7, t1: 3.7, lines: [[['which voice', 1], [' should', 0]], [['a hearing aid keep?', 0]]] },
    { t0: 3.75, t1: 5.55, lines: [[['Some new ones have', 0]], [['an ', 0], ['AI chip', 1]]] },
    { t0: 5.55, t1: 7.3, lines: [[['that pulls ', 0], ['speech', 1]], [['out of ', 0], ['noise.', 2]]] },
    { t0: 7.55, t1: 11.4, lines: [[['The idea: slice sound into', 0]], [['tiny bits of ', 0], ['pitch and time,', 1]]] },
    { t0: 11.4, t1: 13.9, lines: [[['and keep the bits', 0]], [['that look like ', 0], ['speech.', 1]]] },
    { t0: 13.95, t1: 16.2, lines: [[['Clatter fades.', 2], [' Voices stay.', 1]]] },
    { t0: 16.25, t1: 18.1, lines: [[['But a ', 0], ['second voice', 2]], [['is speech too,', 0]]] },
    { t0: 18.1, t1: 19.95, lines: [[['and when two people', 0]], [['talk ', 0], ['at once,', 2]]] },
    { t0: 19.95, t1: 21.8, lines: [[['their bits ', 0], ['overlap.', 2]]] },
    { t0: 21.95, t1: 24.35, lines: [[['So around someone with', 0]], [['hearing aids, ', 0], ['take turns:', 1]]] },
    { t0: 24.35, t1: 27.0, lines: [[['one voice at a time.', 1]]] },
    { t0: 27.2, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
