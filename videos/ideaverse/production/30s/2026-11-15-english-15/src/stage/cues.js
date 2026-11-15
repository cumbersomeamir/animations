// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–3.7 hook · 3.7–7.3 escalation (burst) · 7.3–20.6 explanation + proof + limit · 20.6–26.85 payoff · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: dark room, bright phone photo from frame 0; "almost too dark to see" 1.54–2.51; "How?" 3.11
    how: 3.1,
    // B · burst: "Night Sight" 3.85; "takes a burst" 4.77–5.61 → frames fly out of the phone; "not one photo" 6.15–6.73
    cut1: 3.7, shutter: 4.75, burst: [4.85, 6.2], burstLbl: 5.45,
    // C · "The grain differs in every frame" 7.56–9.22 → frame brightens (grain), flips; "lining them up" 9.76–10.6 → align;
    //     "averaging cancels it out" 10.78–12.12 → frames merge, grain fades
    cut2: 7.35, grain: 7.55, flips: [8.2, 8.6, 9.0], stack: [9.2, 9.8], align: [9.8, 10.55], avg: [10.75, 12.05],
    // D · "A neural network" 12.81–13.41 → label; "cleans up what's left" 13.85–14.87 → sweep
    nn: 12.8, sweep: [13.8, 14.85], clean: 14.95,
    // E · "anything that moves" 16.56–17.24 (DOCKET waves, burst ring); "won't line up" 17.24–17.98; "It blurs" 18.4–18.86 → blurred result
    cut4: 15.6, ring2: [16.4, 18.2], blur: 18.35,
    // F · "So brace the phone" 21.04–21.82 → phone set on books; "ask people to freeze" 22.38–23.36 → DOCKET freezes;
    //     "until it's done" 23.36–24.22 → ring completes → sharp result
    cut5: 20.65, brace: [20.8, 21.6], braceLbl: 21.1, freeze: 23.1, ring3: [23.2, 24.25], sharp: 24.35,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.25 }, { id: 's2', t: 3.85 }, { id: 's3', t: 7.5 }, { id: 's4', t: 12.75 }, { id: 's5', t: 16.5 }, { id: 's6', t: 20.9 }, { id: 's7', t: 27.2 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.2, t1: 1.27, lines: [[['Your phone can', 0]], [['shoot a room', 0]]] },
    { t0: 1.27, t1: 2.85, lines: [[['almost ', 0], ['too dark', 2]], [['to see.', 0]]] },
    { t0: 2.85, t1: 3.7, lines: [[['How?', 1]]] },
    { t0: 3.78, t1: 4.76, lines: [[['Night Sight,', 1]], [['on a Pixel,', 0]]] },
    { t0: 4.76, t1: 7.3, lines: [[['takes a ', 0], ['burst,', 1]], [['not one photo.', 0]]] },
    { t0: 7.42, t1: 9.5, lines: [[['The ', 0], ['grain', 2], [' differs', 0]], [['in every frame,', 0]]] },
    { t0: 9.5, t1: 10.58, lines: [[['so ', 0], ['lining them up', 1]]] },
    { t0: 10.58, t1: 12.6, lines: [[['and ', 0], ['averaging', 1]], [['cancels it out.', 0]]] },
    { t0: 12.66, t1: 13.4, lines: [[['A ', 0], ['neural network', 1]]] },
    { t0: 13.4, t1: 15.5, lines: [[['then cleans up', 0]], [['what’s left.', 0]]] },
    { t0: 16.42, t1: 17.22, lines: [[['But anything', 0]], [['that ', 0], ['moves', 2]]] },
    { t0: 17.22, t1: 18.36, lines: [[['won’t line up.', 0]]] },
    { t0: 18.36, t1: 20.55, lines: [[['It ', 0], ['blurs.', 2]]] },
    { t0: 20.82, t1: 21.8, lines: [[['So ', 0], ['brace the phone,', 1]]] },
    { t0: 21.8, t1: 23.35, lines: [[['and ask people', 0]], [['to ', 0], ['freeze', 1]]] },
    { t0: 23.35, t1: 24.8, lines: [[['until it’s done.', 0]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
