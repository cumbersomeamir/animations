// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–4.75 hook · 4.75–18.35 explanation + proof (score, clues, alone vs together) ·
// 18.35–21 the error · 21–26.85 payoff (confirm in the app, pay again) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: the terminal reads DECLINED from frame 0; "Why?" 4.04 → head tilt
    why: 4.0,
    // B · card: "scores each payment for fraud" 5.66–7.6 → the card + clue dots light up; "hundreds of clues" 8.26–9.4
    cut1: 4.75, dots: [5.65, 8.3], scoreLbl: 5.7, clues: 8.26, line: [9.0, 9.6],
    // C · "A new country" 9.95 · "A new shop" 10.87 · "a bigger amount" 11.83 → one column each, each low
    col: [9.95, 10.87, 11.83],
    // D · "Each alone looks fine" 13.75–14.9 → ✓ over each; "Together" 15.51 → stack; "climbs past your bank's line" 16.29–17.9
    fine: 14.2, stack: [15.5, 16.6], over: 16.9, stamp: 17.1,
    // E · "a real payment gets blocked" 19.17–20.6
    cut3: 18.35, falseLbl: 19.3,
    // F · phone: "open your bank's app" 22.1–23.2 · "confirm it was you" 23.24–24.2 → tap "Yes, it was me"
    cut4: 21.0, tap: 23.55, unblock: 23.8, confirmLbl: 23.3,
    // G · "then pay again" 24.32–25.0 → card taps the terminal → APPROVED
    cut5: 24.3, payTap: 24.55, approved: 24.8,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 5.0 }, { id: 's3', t: 9.95 }, { id: 's4', t: 13.75 }, { id: 's5', t: 18.55 }, { id: 's6', t: 21.1 }, { id: 's7', t: 27.2 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 1.9, lines: [[['Your card works', 0]], [['fine at home,', 0]]] },
    { t0: 1.9, t1: 3.95, lines: [[['then gets ', 0], ['declined', 2]], [['on holiday.', 0]]] },
    { t0: 3.95, t1: 4.8, lines: [[['Why?', 1]]] },
    { t0: 4.95, t1: 6.86, lines: [[['Your card network', 0]], [['scores each payment', 1]]] },
    { t0: 6.86, t1: 7.94, lines: [[['for ', 0], ['fraud,', 2]]] },
    { t0: 7.94, t1: 9.85, lines: [[['using', 0]], [['hundreds of clues.', 1]]] },
    { t0: 9.9, t1: 11.8, lines: [[['A new country.', 1]], [['A new shop.', 1]]] },
    { t0: 11.8, t1: 13.6, lines: [[['A bigger amount', 2]], [['than usual.', 0]]] },
    { t0: 13.7, t1: 15.45, lines: [[['Each alone', 0]], [['looks fine.', 1]]] },
    { t0: 15.45, t1: 16.69, lines: [[['Together,', 0]], [['the score climbs', 2]]] },
    { t0: 16.69, t1: 18.35, lines: [[['past your', 0]], [['bank’s line.', 2]]] },
    { t0: 18.5, t1: 20.95, lines: [[['So sometimes a real', 0]], [['payment gets ', 0], ['blocked.', 2]]] },
    { t0: 21.05, t1: 22.05, lines: [[['If that happens,', 0]]] },
    { t0: 22.05, t1: 23.2, lines: [[['open your ', 0], ['bank’s app,', 1]]] },
    { t0: 23.2, t1: 24.3, lines: [[['confirm it was you,', 1]]] },
    { t0: 24.3, t1: 25.6, lines: [[['then ', 0], ['pay again.', 1]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
