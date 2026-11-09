// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/25).
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 2.0 }, { id: "two", t0: 2.0, t1: 4.9 }, { id: "compare", t0: 4.9, t1: 9.9 }, { id: "w3c", t0: 9.9, t1: 16.3 },
  { id: "formula", t0: 16.3, t1: 22.8 }, { id: "fix", t0: 22.8, t1: 25.75 }, { id: "cta", t0: 25.75, t1: 30 },
];
export const T = {
  // hook: the "Learn more" button is already going down on frame 0; door A swings open onto fog; a big "?" on "about what?"
  pressA: 0.12, openA: [0.3, 0.85], qBig: 1.14, closeA: [2.0, 2.45],
  // two: pull back; both buttons pulse on "two buttons"; the FICTIONAL MEAL KIT sign drops on "fictional meal kit"
  reveal: [1.75, 2.9], pulseA: 2.42, pulseB: 2.58, sign: 3.27,
  // compare: A pulses on "'Learn more'"; a "?" cloud over door A on "hides"; B pulses on "'See the 3 plans'"; three preview
  // cards pop over B on "says it"; B is pressed on "tap", door B opens, the three plan cards slide out
  sayA: 5.08, cloud: 5.66, sayB: 7.47, preview: 8.35, pressB: 9.16, openB: [9.3, 9.85], cardsOut: [9.55, 10.2],
  // w3c: a "Links on this page" list slides in; three identical "Learn more" rows; W3C chip; rows flip to specific text on
  // "link's purpose … clear from its text"
  list: [10.0, 10.5], rows: [10.4, 10.62, 10.84], cite: [12.06, 16.2], flips: [14.35, 15.0, 15.39], listOut: [17.75, 18.15],
  // formula: tile pairs snap together: VERB + WHAT THEY'LL GET (on "a verb plus what they'll get"), Compare + 3 plans, Book + a 15-minute call
  f1: [18.3, 18.93], f2: [20.03, 20.48], f3: [21.35, 21.55], formOut: [22.75, 23.15],
  // fix: back to the doors; A's label flips to "Compare 3 plans" on "No guessing"; the "?" cloud pops on "what comes next"
  fixA: 23.49, pop: 24.16,
  // CTA: everything slides off; app.werbens.com logo tile lands; wordmark on "Werbens"
  ctaClear: [25.75, 26.2], tile: [25.9, 26.28], lockup: 26.75,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 4 },
  { line: "L2", from: 0, to: 10, br: 5 },
  { line: "L3", from: 0, to: 6, br: 3 }, { line: "L3", from: 6, to: 14, br: 10 },
  { line: "L4", from: 0, to: 6, br: 3 }, { line: "L4", from: 6, to: 16, br: 11 },
  { line: "L5", from: 0, to: 5 }, { line: "L5", from: 5, to: 11, br: 7 }, { line: "L5", from: 11, to: 21, br: 15 },
  { line: "L6", from: 0, to: 5 },
  { line: "L7", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["what", "two", "fictional", "hides", "3", "before", "w3c", "purpose", "clear", "text", "verb", "get", "compare", "book", "guessing", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: T.pressA, type: "clack", gain: 0.22, pan: -0.25 }, { t: T.openA[0], type: "creak", dur: 0.55, gain: 0.08, pan: -0.25 }, { t: T.qBig, type: "pop", gain: 0.14, pan: -0.25 },
  { t: T.closeA[1] - 0.05, type: "thud", size: 0.8, gain: 0.16, pan: -0.25 }, { t: T.reveal[0], type: "whoosh", dur: 0.7, gain: 0.06 },
  { t: T.pulseA + 0.02, type: "tick", freq: 1318, gain: 0.07, pan: -0.25 }, { t: T.pulseB + 0.02, type: "tick", freq: 1568, gain: 0.07, pan: 0.25 }, { t: T.sign + 0.17, type: "stamp", gain: 0.22 },
  { t: T.cloud, type: "puff", gain: 0.12, pan: -0.25 }, { t: T.preview, type: "plink", gain: 0.1, pan: 0.25 },
  { t: T.pressB, type: "clack", gain: 0.22, pan: 0.25 }, { t: T.openB[0], type: "creak", dur: 0.5, gain: 0.08, pan: 0.25 }, { t: T.cardsOut[0], type: "slide", dur: 0.5, gain: 0.1, pan: 0.25 },
  { t: T.list[0], type: "slide", dur: 0.45, gain: 0.12 }, ...T.rows.map((t) => ({ t: t + 0.12, type: "card", gain: 0.12 })), { t: T.cite[0] + 0.05, type: "tag", gain: 0.1 },
  ...T.flips.map((t) => ({ t, type: "flip", gain: 0.14 })), { t: T.listOut[0], type: "slide", dur: 0.4, gain: 0.1 },
  ...[T.f1, T.f2, T.f3].flatMap(([a, b]) => [{ t: a + 0.12, type: "card", gain: 0.14 }, { t: b + 0.12, type: "snap", gain: 0.14 }]),
  { t: T.formOut[0], type: "slide", dur: 0.4, gain: 0.1 }, { t: T.fixA, type: "flip", gain: 0.14, pan: -0.25 }, { t: T.pop, type: "puff", gain: 0.12, pan: -0.25 },
  { t: T.ctaClear[0], type: "slide", dur: 0.45, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
