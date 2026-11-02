// cues.js — one timeline for picture, lip-sync and score (seconds). Narration placements come from the
// ASR-measured clip lengths (narration/words.json); every action hit is placed against those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: a suspicious envelope flies in, DOCKET catches it
    e1Launch: -0.25, e1Catch: 0.55, skeptic: 1.25, carry: 1.95, onReader: 2.6,
    // B · examples: two clusters of example messages form (3.0 → 5.3)
    minis0: 3.0, miniStep: 0.085, miniDur: 0.55, halos: 4.95,
    // C · patterns: magnifier over the suspicious envelope ("suspicious" 6.23, "repeated" 7.33, "messages" 8.89)
    notesOpen: 5.78, magIn: 6.0, linkFound: 6.3, salesFound: 7.4, flagFound: 8.95, magOut: 10.2, notesClose: 10.55,
    // D · score + sort ("spam score" 11.87, "decides" 13.87, "belongs" 14.77)
    scan: [10.95, 11.75], scoreHigh: 11.85, spamOpen1: 13.2, grab1: 13.3, drop1: 13.8, land1: 14.0, spamClose1: 14.15,
    e3Launch: 13.75, e3Land: 14.2, scoreLow: 14.35, inboxOpen1: 14.5, grab3: 14.55, drop3: 14.98, land3: 15.15, inboxClose1: 15.4,
    // E · mistake ("real message" 16.54, "caught" 17.62, "mistake" 17.80)
    e4Launch: 16.0, e4Land: 16.42, scoreHigh2: 17.25, spamOpen2: 17.5, grab4: 17.55, drop4: 17.98, land4: 18.15, spamClose2: 18.5, puzzled: 18.3,
    // F · recovery ("missing" 21.16, "check" 22.00, "spam folder" 22.24)
    inboxPull: 20.25, inboxClose2: 21.45, spamPull: 22.0, pick4: 22.42, held4: 22.95, stickerFly: 23.25, stickerSlap: 23.5,
    spamClose3: 23.85, inboxOpen3: 24.0, drop4b: 24.45, land4b: 24.62, inboxClose3: 25.3,
    // G · CTA ("Explore" 25.90, "Ideaverse" 27.46)
    ctaTurn: 25.45, wave: 26.15,
  },
  narration: [
    { id: 's1', t: 0.30 }, { id: 's2', t: 2.95 }, { id: 's3', t: 10.85 },
    { id: 's4', t: 16.40 }, { id: 's5', t: 20.00 }, { id: 's6', t: 25.90 },
  ],
  // parts: [text, colour] 0 white · 1 mint · 2 amber ; each caption ≤ 2 lines
  captions: [
    { t0: 0.25, t1: 2.75, lines: [[['Ever wondered how your', 0]], [['inbox ', 1], ['catches ', 0], ['spam?', 2]]] },
    { t0: 2.9, t1: 6.05, lines: [[['AI learns ', 0], ['patterns', 1], [' from', 0]], [['lots of examples', 0]]] },
    { t0: 6.1, t1: 8.75, lines: [[['suspicious links,', 2]], [['repeated sales language,', 2]]] },
    { t0: 8.78, t1: 10.6, lines: [[['and messages ', 0], ['people flag.', 2]]] },
    { t0: 10.8, t1: 12.95, lines: [[['A new email gets', 0]], [['a ', 0], ['spam score,', 2]]] },
    { t0: 13.0, t1: 15.75, lines: [[['then your mail service', 0]], [['decides where it ', 0], ['belongs.', 1]]] },
    { t0: 16.3, t1: 19.7, lines: [[['But a ', 0], ['real message', 1], [' can', 0]], [['be caught by ', 0], ['mistake.', 2]]] },
    { t0: 19.9, t1: 25.65, lines: [[['If something important is missing,', 0]], [['check your ', 0], ['spam folder.', 1]]] },
    { t0: 25.8, t1: 30.2, lines: [[['Explore more ', 0], ['everyday AI', 1]], [['@icon', 0], ['with Ideaverse', 0]]], cta: true },
  ],
};
export default CUES;
