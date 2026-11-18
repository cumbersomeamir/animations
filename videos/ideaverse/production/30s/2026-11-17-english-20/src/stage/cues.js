// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–4.5 hook · 4.5–5.75 superhook ("Your twin's?") · 5.75–19.9 mechanism + proof ·
// 19.9–22 the extra twist (mask mode) · 22–26.85 payoff (passcode / mask mode off) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: twin busts, DOCKET's phone locked; "under one in a million" 3.32–4.4; "Your twin's?" 4.6–5.3 → the twin lights up
    twin: 4.6,
    // B · scan: "maps your face in 3D" 5.96–7.2 → beam + depth colours; "thousands of invisible dots" 7.96–9.4 → dots
    cut1: 5.75, beam: 5.95, depth: [6.6, 7.4], dots: [7.9, 9.3],
    // C · card: "turns that into numbers" 10.84–12.1 → bars; "compares them with yours" 12.78–14.0 → rows meet → ✓
    cut2: 10.1, bars: [10.85, 11.9], compare: [12.8, 13.5], match: 13.55,
    // D · "the odds rise for twins" 15.24–16.6 → twin row; "look-alike siblings" 17.22 · "kids under thirteen" 18.26–19.4 → chips
    twinRow: [15.3, 16.2], close: 16.3, chips: [16.25, 17.25, 18.3],
    // E · "And rise again with mask mode on" 19.95–21.5 → a mask covers the lower face; its dots go out
    cut3: 19.9, mask: [20.55, 21.2],
    // F · "use a passcode" 23.03–23.85 → keypad; "or turn mask mode off" 23.85–25.2 → toggle
    cut4: 22.0, keypad: 22.95, toggle: 24.6, offLbl: 24.45,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 5.9 }, { id: 's3', t: 10.2 }, { id: 's4', t: 14.6 }, { id: 's5', t: 19.95 }, { id: 's6', t: 22.05 }, { id: 's7', t: 27.2 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 1.95, lines: [[['A stranger’s odds', 0]], [['of unlocking your', 0]]] },
    { t0: 1.95, t1: 4.55, lines: [[['Face ID:', 1], [' under', 0]], [['one in a million.', 2]]] },
    { t0: 4.55, t1: 5.8, lines: [[['Your twin’s?', 2]]] },
    { t0: 5.85, t1: 7.74, lines: [[['It maps your face', 0]], [['in ', 0], ['3D', 1]]] },
    { t0: 7.74, t1: 10.08, lines: [[['with thousands of', 0]], [['invisible dots.', 1]]] },
    { t0: 10.08, t1: 12.13, lines: [[['A neural network turns', 0]], [['that into ', 0], ['numbers', 1]]] },
    { t0: 12.13, t1: 14.5, lines: [[['and compares them', 0]], [['with yours.', 1]]] },
    { t0: 14.55, t1: 17.15, lines: [[['Apple says the odds', 0]], [['rise for ', 0], ['twins,', 2]]] },
    { t0: 17.15, t1: 19.85, lines: [[['look-alike siblings', 2]], [['and kids under 13.', 2]]] },
    { t0: 19.9, t1: 21.95, lines: [[['And rise again', 0]], [['with ', 0], ['mask mode', 2], [' on.', 0]]] },
    { t0: 22.0, t1: 23.8, lines: [[['If that’s your home,', 0]], [['use a ', 0], ['passcode,', 1]]] },
    { t0: 23.8, t1: 25.7, lines: [[['or turn ', 0], ['mask mode off.', 1]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
