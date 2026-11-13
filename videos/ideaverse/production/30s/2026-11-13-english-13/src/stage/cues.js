// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 rules): 0–3 hook · 3–6 escalation · 6–19 explanation + proof · 19–27 payoff · 27–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook (dark): dots sweep the face (0.3–1.3); "knows it's you" 2.0–2.88 → lock opens
    sweep0: [0.3, 1.3], unlock: 2.1,
    // B · "a photo of you" 3.56–4.06 → the print slides in; "can't fool it" 4.06–4.76 → lock stays shut (shake); "Why?" 5.02
    cut1: 3.3, print: 3.5, deny: 4.4, why: 5.0,
    // C · "Thousands of invisible dots land on your face" 6.2–8.44 → sweep; "mapping its shape in 3D" 8.9–10.54 → depth colours + orbit
    cut2: 6.0, sweep: [6.3, 8.2], depth: 8.9, orbit: [8.9, 11.4],
    // D · "compares that shape with the face stored at setup" 11.66–13.76 → stored cloud slides in and lines up → MATCH
    stored: 11.7, align: [12.4, 13.4], match: 13.6,
    // E · "A flat photo has no depth" 15.46–16.68 → dots on the print, side view shows a flat sheet; "so it fails" 17.0–17.4 → ✕
    cut3: 15.2, flatDots: [15.4, 16.2], side: [16.0, 17.0], fail: 17.1,
    // F · "Twins, look-alike siblings and kids under 13" 19.4–22.12 → twin + child busts; "more likely to unlock it" 22.12–23.84 → amber unlock
    cut4: 19.2, twin: 19.5, kid: 21.0, likely: 22.7,
    // G · "If that worries you, use a passcode" 24.52–26.48 → passcode on the phone
    cut5: 24.3, code: [25.6, 26.4], ok: 26.5,
    cta: 26.95,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 3.4 }, { id: 's3', t: 6.2 }, { id: 's4', t: 11.6 }, { id: 's5', t: 15.4 }, { id: 's6', t: 19.4 }, { id: 's7', t: 27.4 },
  ],
  // caption safe area: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 3.3, lines: [[['In ', 0], ['total darkness,', 2]], [['Face ID still knows it’s you.', 0]]] },
    { t0: 3.3, t1: 5.9, lines: [[['Yet a ', 0], ['photo', 2], [' of you', 0]], [['can’t fool it. ', 0], ['Why?', 1]]] },
    { t0: 6.15, t1: 8.67, lines: [[['Thousands of ', 0], ['invisible dots', 1]], [['land on your face,', 0]]] },
    { t0: 8.67, t1: 11.4, lines: [[['mapping its shape ', 0], ['in 3D.', 1]]] },
    { t0: 11.5, t1: 14.6, lines: [[['It compares that shape', 0]], [['with the face ', 0], ['stored at setup.', 1]]] },
    { t0: 15.3, t1: 18.6, lines: [[['A flat photo has ', 0], ['no depth,', 2]], [['so it fails.', 0]]] },
    { t0: 19.3, t1: 22.17, lines: [[['Twins', 2], [', look-alike siblings', 0]], [['and kids under 13', 2]]] },
    { t0: 22.17, t1: 24.3, lines: [[['are more likely to unlock it.', 0]]] },
    { t0: 24.3, t1: 26.9, lines: [[['If that worries you,', 0]], [['use a ', 0], ['passcode.', 1]]] },
    { t0: 27.05, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
