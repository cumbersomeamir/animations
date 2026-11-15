// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–3.85 hook · 3.85–12.7 explanation (on-device check, nothing sent) · 12.7–20.85 proof
// (study + the culprit phrase) · 20.85–26.85 payoff (lower the sensitivity → stays asleep) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: the speaker's ring is lit from frame 0 while the TV plays; "wake up?" 2.76–3.38 → DOCKET's head tilt
    why: 2.8,
    // B · x-ray: "a tiny on-device model" 5.12–6.48 → chip glows; "checks short snippets of sound" 6.48–8.12 → snippets
    cut1: 3.85, chip: 5.1, onDevice: 5.55, snip0: 6.3, snipGap: 0.62, snipN: 9,
    // C · "Nothing is sent" 9.55–10.27 → cloud stays dark; "sounds close enough" 10.68–12.11 → the match line
    nothing: 9.55, line: 11.2,
    // D · "Researchers played TV at smart speakers" 12.85–14.83 → 12 show tiles; "every show woke one up" 15.41–16.87 → badges
    cut2: 12.7, tiles: [12.9, 14.4], badges: [15.45, 16.75], all12: 16.4,
    // E · "Maybe I don't like the cold" 17.55–18.73 → that snippet crosses the line (ring lights in the pause), then it is sent
    cut3: 17.3, cold: 18.15, wake: 18.95, sent: [19.25, 20.0],
    // F · "lower its sensitivity" 23.46–24.24 → slider to LESS; resolution: the same phrase stays under the raised line
    cut4: 20.85, slide: [23.45, 24.2], cut5: 25.4, cold2: 25.55, asleep: 26.15,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 4.0 }, { id: 's3', t: 9.55 }, { id: 's4', t: 12.85 }, { id: 's5', t: 17.55 }, { id: 's6', t: 21.0 }, { id: 's7', t: 27.2 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 1.45, lines: [[['Nobody said', 0]], [['the ', 0], ['wake word.', 2]]] },
    { t0: 1.45, t1: 3.85, lines: [[['So why did the speaker', 0]], [['wake up?', 1]]] },
    { t0: 3.95, t1: 4.9, lines: [[['On standby,', 1]]] },
    { t0: 4.9, t1: 6.28, lines: [[['a tiny ', 0], ['on-device', 1]], [['model', 0]]] },
    { t0: 6.28, t1: 7.9, lines: [[['checks short', 0]], [['snippets of sound', 0]]] },
    { t0: 7.9, t1: 9.45, lines: [[['for the ', 0], ['wake word.', 2]]] },
    { t0: 9.5, t1: 10.55, lines: [[['Nothing is sent', 1]]] },
    { t0: 10.55, t1: 12.6, lines: [[['until a snippet', 0]], [['sounds ', 0], ['close enough.', 2]]] },
    { t0: 12.75, t1: 14.9, lines: [[['Researchers played TV', 0]], [['at smart speakers,', 0]]] },
    { t0: 14.9, t1: 17.25, lines: [[['and ', 0], ['every show', 1]], [['woke one up.', 2]]] },
    { t0: 17.45, t1: 19.2, lines: [[['“Maybe I don’t', 2]], [['like the cold”', 2]]] },
    { t0: 19.2, t1: 20.8, lines: [[['woke a ', 0], ['Google speaker.', 1]]] },
    { t0: 20.9, t1: 23.0, lines: [[['So if a Google speaker', 0]], [['wakes too often,', 0]]] },
    { t0: 23.0, t1: 25.55, lines: [[['lower its ', 0], ['sensitivity', 1]], [['in the Home app.', 0]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
