// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–4.5 hook · 4.5–14.1 mechanism (mark hidden in the pixels; a second model finds it after edits) ·
// 14.1–21 the check and its trap (no mark ≠ real) · 21–26.85 payoff (find where it first appeared) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: two framed photos, WHICH ONE IS AI? from frame 0; "made by AI" 2.04 · "hidden inside it" 3.36–4.32 → push in
    ai: 2.0, hidden: 3.35,
    // B · card: "Google's AI hides" 4.65–5.95 → the image builds; "a watermark" 6.03 → zoom box; "in the pixels" 6.79 → marks
    cut1: 4.5, gen: [4.5, 5.6], lens: 6.0, marks: [6.6, 7.3],
    // C · "A second model" 9.11–9.63 → FINDER; "trained with it" 9.63–10.43 → linked; "can still find it" 10.77–11.69 → scan, ✓
    finder: 9.15, together: 9.7, findScan: [10.8, 11.4], found1: 11.45,
    // D · the print: "crops" 11.83 · "filters" 12.57 · "compression" 13.25 → each edit, the mark still found
    cut2: 11.72, crop: 11.85, filter: 12.57, compress: 13.25,
    // E · phone: "That's what Gemini checks for" 14.2–15.54 → checking … WATERMARK FOUND
    cut3: 14.1, found2: 15.0,
    // F · "But no mark" 16.08–16.48 → the other photo: NO WATERMARK; "only means Google's AI didn't make it" → sub-line
    swap: 15.95, nomark: 16.3, notG: 17.3,
    // G · "Another AI could have" 19.26–20.5 → the "real" photo gets an AI-MADE stamp
    cut4: 19.1, other: 19.45,
    // H · card: "no mark isn't proof it's real" 21.0–22.74; "Find where the photo first appeared" 23.3–24.8 → posts, oldest = first
    cut5: 20.9, posts: [23.3, 24.1], first: 24.45,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 4.65 }, { id: 's3', t: 9.05 }, { id: 's4', t: 14.2 }, { id: 's5', t: 16.0 }, { id: 's6', t: 21.0 }, { id: 's7', t: 27.2 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 1.25, lines: [[['Two photos.', 1]]] },
    { t0: 1.25, t1: 2.3, lines: [[['One was made', 0]], [['by ', 0], ['AI,', 2]]] },
    { t0: 2.3, t1: 4.5, lines: [[['and the proof is', 0]], [['hidden inside it.', 1]]] },
    { t0: 4.6, t1: 6.53, lines: [[['Google’s AI hides', 0]], [['a ', 0], ['watermark', 1]]] },
    { t0: 6.53, t1: 8.95, lines: [[['in the ', 0], ['pixels', 1], [' as it', 0]], [['makes the image.', 0]]] },
    { t0: 9.0, t1: 10.5, lines: [[['A ', 0], ['second model,', 1]], [['trained with it,', 0]]] },
    { t0: 10.5, t1: 12.5, lines: [[['can still find it', 0]], [['after ', 0], ['crops,', 1]]] },
    { t0: 12.5, t1: 14.1, lines: [[['filters', 1], [' or', 0]], [['compression.', 1]]] },
    { t0: 14.15, t1: 15.9, lines: [[['That’s what', 0]], [['Gemini', 1], [' checks for.', 0]]] },
    { t0: 15.95, t1: 18.95, lines: [[['But ', 0], ['no mark', 2], [' only means', 0]], [['Google’s AI didn’t make it.', 0]]] },
    { t0: 18.95, t1: 20.85, lines: [[['Another AI', 2]], [['could have.', 0]]] },
    { t0: 20.95, t1: 23.2, lines: [[['So no mark isn’t', 0]], [['proof it’s real.', 2]]] },
    { t0: 23.2, t1: 25.7, lines: [[['Find where the photo', 0]], [['first appeared.', 1]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
