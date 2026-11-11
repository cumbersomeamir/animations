// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-11 feedback): 0–3 hook · 3–5 escalation · 5–21 explanation + proof · 21–27 payoff · 27–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook (easel close): ringing + big "SAM" voice wave ✓ familiar (0–1.2); "no longer proof" 1.29–1.95 → stamp NOT PROOF
    ring: [0.0, 0.5], wave: 0.1, ok: 0.55, stamp: 1.35,
    // B · escalation (two-shot): "This sounds like Sam" 3.0–3.78 → call + bubble "Need money, fast!"; "Sam never said it" 4.4–5.2 → NEVER SAID
    cut1: 2.9, bubble: 3.15, never: 4.45,
    // C · "a short clip of Sam talking" 6.16–7.38 → clip plays; "software learns how Sam's voice sounds" 7.82–9.7 → voice pattern
    cut2: 5.6, clip: 6.15, learn: 7.85, pattern: 8.5,
    // D · "says brand-new words in that voice" 10.94–12.68 → typed words → output wave; "a familiar voice feels believable" 13.24–14.82 → SOUNDS LIKE SAM
    flip1: 10.35, type: [10.9, 11.7], out: 12.1, like: 13.3,
    // E · "copies the sound" 16.14–17.06 → SOUND ✓; "not what Sam knows" 17.4–18.5 → KNOWS ✕; "family code word" 18.5–19.92 → lock
    flip2: 15.6, push: [15.7, 16.6], sound: 16.5, knows: 17.5, code: 18.9,
    // F · payoff (phone): urgent call 21.1; "hang up" 23.44 → end; "call back on a number you already know" 24.1–25.84 → saved contact → real Sam
    cut4: 20.6, hang: 23.45, contacts: 23.95, dial: 24.6, real: 25.5,
    cta: 26.6,
  },
  narration: [
    { id: 's1', t: 0.25 }, { id: 's2', t: 3.0 }, { id: 's3', t: 6.0 }, { id: 's4', t: 10.7 }, { id: 's5', t: 16.0 }, { id: 's6', t: 21.0 }, { id: 's7', t: 27.3 },
  ],
  // caption safe area for this episode onward: x 100..900, y 230..1500 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.2, t1: 2.85, lines: [[['A familiar voice', 0]], [['is no longer ', 0], ['proof.', 2]]] },
    { t0: 2.9, t1: 4.1, lines: [[['This sounds like ', 0], ['Sam.', 1]]] },
    { t0: 4.1, t1: 5.6, lines: [[['Sam ', 0], ['never said it.', 2]]] },
    { t0: 5.95, t1: 7.6, lines: [[['From a ', 0], ['short clip', 1]], [['of Sam talking,', 0]]] },
    { t0: 7.6, t1: 10.3, lines: [[['software learns', 0]], [['how Sam’s ', 0], ['voice sounds.', 1]]] },
    { t0: 10.65, t1: 12.95, lines: [[['Then it says ', 0], ['brand-new words', 1]], [['in that voice,', 0]]] },
    { t0: 12.95, t1: 15.5, lines: [[['and a familiar voice', 0]], [['feels ', 0], ['believable.', 2]]] },
    { t0: 15.95, t1: 17.25, lines: [[['But it copies ', 0], ['the sound,', 1]]] },
    { t0: 17.25, t1: 20.5, lines: [[['not ', 0], ['what Sam knows,', 2]], [['like your ', 0], ['family code word.', 1]]] },
    { t0: 20.95, t1: 23.3, lines: [[['So when a call urgently', 0]], [['asks for ', 0], ['money,', 2]]] },
    { t0: 23.3, t1: 26.5, lines: [[['hang up', 2], [' and ', 0], ['call back', 1]], [['on a number you already know.', 0]]] },
    { t0: 26.95, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
