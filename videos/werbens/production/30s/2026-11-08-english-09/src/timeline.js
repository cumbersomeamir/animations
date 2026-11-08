// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/24).
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.7 }, { id: "study", t0: 3.7, t1: 8.5 }, { id: "race", t0: 8.5, t1: 13.3 }, { id: "effect", t0: 13.3, t1: 18.3 },
  { id: "lesson", t0: 18.3, t1: 25.75 }, { id: "cta", t0: 25.75, t1: 30 },
];
// race: B's remaining eight stamps pop fast (B finishes first); A's eight pop slower (A finishes later)
const RACE0 = 10.95;
export const RACE = { B: Array.from({ length: 8 }, (_, k) => RACE0 + k * 0.19), A: Array.from({ length: 8 }, (_, k) => RACE0 + k * 0.62) };
export const T = {
  // hook: a rubber stamp is already pressing on frame 0 — two free stamps on card B; "8 to go" tags on "eight washes"; "?" on "finished"
  press: [0.14, 0.66], stampOut: [0.95, 1.4], toGo: 1.56, q: [3.13, 3.9], reveal: [1.05, 2.3],
  // study: source chip on "2006"; the eight empty circles on both cards ripple on "both cards needed eight washes"
  cite: [4.25, 13.3], ripple: 6.79,
  // race: B's two free stamps glow on "two free stamps"; stamps pop (B fast, A slow); B's FREE WASH badge on "faster"
  freeGlow: 9.85, badgeB: 12.54,
  // effect: the board slides away (13.3 s); segmented progress rows drop in on "endowed progress effect" (right-aligned: eight empty blocks each);
  // B's two filled blocks glow on "head start"; brackets over the eight remaining on "already begun"
  rowsA: 13.75, rowsB: 14.35, headStart: 15.89, brackets: [17.2, 18.4], rowsOut: [18.35, 18.75],
  // lesson: a new card slides in; the stamp gives it a real WELCOME stamp on "welcome stamp"; a checklist slides in on
  // "checklist"; its first step is ticked on "first step done"
  cardC: [19.0, 19.45], welcome: 21.43, listIn: [22.2, 22.62], tick: 23.61,
  // CTA: board + props slide off; app.werbens.com logo tile lands; wordmark on "Werbens"
  ctaClear: [25.75, 26.2], tile: [25.9, 26.28], lockup: 26.75,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 5, br: 2 }, { line: "L1", from: 5, to: 9 },
  { line: "L2", from: 0, to: 6, br: 3 }, { line: "L2", from: 6, to: 10 },
  { line: "L3", from: 0, to: 8, br: 4 }, { line: "L3", from: 8, to: 14, br: 11 },
  { line: "L4", from: 0, to: 5, br: 3 }, { line: "L4", from: 5, to: 13, br: 9 },
  { line: "L5", from: 0, to: 8, br: 4 }, { line: "L5", from: 8, to: 11 }, { line: "L5", from: 11, to: 18, br: 14 },
  { line: "L6", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["eight", "finished", "2006", "two", "free", "completed", "faster", "endowed", "progress", "head", "start", "begun", "welcome", "checklist", "done", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: T.press[0], type: "stamp", gain: 0.3 }, { t: T.press[1], type: "stamp", gain: 0.3 }, { t: T.stampOut[0], type: "whoosh", dur: 0.4, gain: 0.07 },
  { t: T.toGo + 0.17, type: "card", gain: 0.16, pan: 0.3 }, { t: T.toGo + 0.29, type: "card", gain: 0.14, pan: 0.3 }, { t: T.q[0] + 0.05, type: "tag", gain: 0.12 },
  { t: T.cite[0] + 0.05, type: "tag", gain: 0.1 }, { t: T.ripple, type: "zip", dur: 0.6, gain: 0.07 }, { t: T.freeGlow, type: "glow", gain: 0.08 },
  ...RACE.B.map((t) => ({ t, type: "tick", freq: 1760, gain: 0.07, pan: 0.15 })), ...RACE.A.filter((t) => t < 13.3).map((t) => ({ t, type: "tick", freq: 1318, gain: 0.06, pan: -0.15 })),
  { t: T.badgeB + 0.02, type: "chime", gain: 0.12 },
  ...Array.from({ length: 8 }, (_, k) => ({ t: T.rowsA + k * 0.08 + 0.12, type: "clack", gain: 0.09, pan: -0.2 + k * 0.05 })),
  ...Array.from({ length: 10 }, (_, k) => ({ t: T.rowsB + k * 0.07 + 0.12, type: "clack", gain: 0.09, pan: -0.25 + k * 0.05 })),
  { t: T.headStart + 0.02, type: "pop", gain: 0.12 }, { t: T.brackets[0], type: "zip", dur: 0.4, gain: 0.07 }, { t: T.rowsOut[0], type: "sink", gain: 0.1 },
  { t: T.cardC[0], type: "slide", dur: 0.45, gain: 0.12, pan: -0.25 }, { t: T.welcome - 0.25, type: "whoosh", dur: 0.25, gain: 0.06 }, { t: T.welcome, type: "stamp", gain: 0.32, pan: -0.25 },
  { t: T.listIn[0], type: "slide", dur: 0.42, gain: 0.12, pan: 0.25 }, { t: T.tick + 0.12, type: "tick", freq: 1568, gain: 0.1, pan: 0.25 },
  { t: T.ctaClear[0], type: "slide", dur: 0.45, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
