// cues.js — one timeline for picture, lip-sync and score (seconds). 120 BPM grid (beat 0.5 s) for the music;
// action hits are placed where the performance needs them and the score follows them.
const CUES = {
  fps: 30, dur: 15, bpm: 120,
  // beats of the lesson
  S: { hook: 0, fluent: 2.4, drawer: 4.7, check: 7.8, mark: 10.4, takeaway: 12.6 },
  hits: {
    launch: -0.3, catch: 0.5, meterMax: 1.0, skeptic: 1.8,
    carry: 2.05, setDown: 2.5, ribbon: [2.65, 4.5], taps: [3.62, 3.88], ribbonBack: 4.5,
    grip: 4.95, yank: 5.3, drawerStop: 5.56, gapGlow: 5.85, lift: [6.35, 6.85], dropChain: 7.5, chainLand: 7.7,
    ownDrawer: 8.0, bookOut: 8.3, bookOpen: 8.6, scan: [8.95, 9.95], noMatch: 9.98, bookClose: 10.15,
    notesOpen: 10.3, stampInHand: 10.52, windUp: 11.0, slam: 11.5, droop: 11.55, stampLift: 11.85,
    turn: 12.4, finger: 12.95, sub: 13.7,
  },
  narration: [
    { id: 'd1', t: 0.2 }, { id: 'd2', t: 2.45 }, { id: 'd3', t: 4.75 },
    { id: 'd4', t: 7.85 }, { id: 'd5', t: 10.25 }, { id: 'd6', t: 12.8 },
  ],
  captions: [
    { t0: 0.15, t1: 2.38, parts: [['This answer sounds ', 0], ['certain.', 1]] },
    { t0: 2.42, t1: 4.68, parts: [['Fluent ', 0], ['≠ ', 1], ['evidence', 0]] },
    { t0: 4.72, t1: 7.78, parts: [['Its support has a ', 0], ['gap', 2]] },
    { t0: 7.82, t1: 10.22, parts: [['Check a ', 0], ['reliable source', 1]] },
    { t0: 10.24, t1: 12.6, parts: [['No match? Label it ', 0], ['unconfirmed', 2]] },
    { t0: 12.75, t1: 15.2, parts: [['Sounding sure ', 0], ["isn't proof.", 1]], big: true, sub: 'Check the source before you trust it.' },
  ],
};
export default CUES;
