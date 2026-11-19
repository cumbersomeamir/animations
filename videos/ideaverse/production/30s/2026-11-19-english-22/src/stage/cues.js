// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-19 brief): 0–3.3 hook · 3.3–5.15 superhook (AI slow motion made it up) · 5.15–20.7 build + proof (two real
// frames, motion guess, move + blend; a fast bounce breaks the guess → both balls; real vs made up) · 20.7–26.85 payoff
// (smooth isn't proof; step through the original frames) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: one ball frozen in two places; "one ball" 1.74 · "two places" 2.0–2.66
    one: 1.7, two: 2.0,
    // B · phone: "AI slow motion made it up" 3.35–4.75 → made-up frames pop in between the real ones
    cut1: 3.28, aiTiles: [4.2, 4.75],
    // C · card: "two real frames" 5.53–6.49 → REAL 1, REAL 2; "guesses how each pixel moved" 6.85–8.31 → motion arrows
    cut2: 5.15, slotA: 5.2, slotB: 5.6, slotN: 6.0, arrows: [6.85, 8.0],
    // D · "moves both frames to the middle" 9.14–10.74 → both slide in; "blends" 11.18 → one ball; "a new one" 12.08 → AI-MADE
    move: [9.15, 10.45], blend: [11.15, 11.6], newTag: 12.05,
    // E · 3D: "a fast bounce" 13.17–13.71 → the ball drops out of frame and back; "that guess" 14.21 → arrow; "fail" 14.69 → ✗;
    //     "the blend shows both balls" 15.55–16.73 → both ghosts
    cut3: 12.85, bounce: [13.1, 13.75], guess: 14.2, fail: 14.68, both: [15.55, 16.2],
    // F · card: "Neither real frame shows this." 17.45–18.81 → REAL ✓ / AI-MADE
    cut4: 17.3, realOk: 17.65, madeUp: 18.2,
    // G · phone: "Smooth isn't proof." 20.85–21.79 → smooth playback; "step through the original frames" 23.73–24.97 → ORIGINAL, 1 → 2
    cut5: 20.7, orig: 23.7, step2: 24.45,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 3.35 }, { id: 's3', t: 5.25 }, { id: 's4', t: 8.9 }, { id: 's5', t: 12.95 }, { id: 's6', t: 17.45 }, { id: 's7', t: 20.85 }, { id: 's8', t: 27.2 },
  ],
  // caption band (2026-11-19 brief): pill y ≈ 282..458, x 100..900 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 1.45, lines: [[['This frame', 0]], [['never happened:', 2]]] },
    { t0: 1.45, t1: 3.25, lines: [[['one ball,', 0]], [['two places.', 2]]] },
    { t0: 3.28, t1: 5.1, lines: [[['AI slow motion', 1]], [['made it up.', 0]]] },
    { t0: 5.15, t1: 6.45, lines: [[['It takes two', 0]], [['real frames', 1]]] },
    { t0: 6.45, t1: 8.85, lines: [[['and guesses how', 0]], [['each pixel moved.', 1]]] },
    { t0: 8.85, t1: 10.76, lines: [[['Then it moves both', 0]], [['frames to the ', 0], ['middle', 1]]] },
    { t0: 10.76, t1: 12.8, lines: [[['and ', 0], ['blends', 1], [' them', 0]], [['into a new one.', 0]]] },
    { t0: 12.85, t1: 14.1, lines: [[['But on a', 0]], [['fast bounce,', 2]]] },
    { t0: 14.1, t1: 15.3, lines: [[['that guess', 0]], [['can fail,', 2]]] },
    { t0: 15.3, t1: 17.3, lines: [[['and the blend shows', 0]], [['both balls.', 2]]] },
    { t0: 17.35, t1: 19.2, lines: [[['Neither real frame', 1]], [['shows this.', 0]]] },
    { t0: 20.75, t1: 22.25, lines: [[['Smooth isn’t proof.', 2]]] },
    { t0: 22.25, t1: 23.65, lines: [[['To judge a', 0]], [['real moment,', 0]]] },
    { t0: 23.65, t1: 25.7, lines: [[['step through the', 0]], [['original frames.', 1]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
