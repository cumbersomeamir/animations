// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/26).
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 2.4 }, { id: "study", t0: 2.4, t1: 9.2 }, { id: "review", t0: 9.2, t1: 13.8 }, { id: "depends", t0: 13.8, t1: 18.0 },
  { id: "sort", t0: 18.0, t1: 25.75 }, { id: "cta", t0: 25.75, t1: 30 },
];
export const T = {
  // hook: 24 pots already raining onto the big stand on frame 0; "24" tag on "jams"; six pots onto the small stand on "just 6"
  rain24: [-0.3, 1.05], tag24: 0.92, rain6: [1.6, 2.05], tag6: 2.02, reveal: [1.2, 2.4],
  // study: source chip on "2000"; a basket slides in on "shoppers"; it moves to the six-jam table on "table of 6 jams" and a pot
  // hops in on "six"; the big stand dims a touch on "than from 24"
  cite1: [2.92, 9.0], basket: [4.27, 4.7], toSix: [6.28, 6.9], hop: 7.05, dim24: 7.98, basketOut: [8.9, 9.3],
  // review: source chip on "review"; the balance scale drops in already tipped toward 6; it levels on "nearly zero"
  cite2: [9.66, 13.8], scaleIn: [9.6, 9.95], level: [12.57, 13.2],
  // depends: source chip on "It depends"; the scale tips again on "overload grows"; the 24 pots jumble on "hard to compare"
  cite3: [14.03, 17.95], tipAgain: [15.42, 15.9], jumble: [16.43, 16.95], scaleOut: [17.9, 18.3],
  // sort: on "Group your options" the pots sort into three colour groups, one per tier; blank signs on "say who each one is for";
  // sign text on "for kids" / "for cheese boards" / "for baking"
  group: [19.95, 20.75], signs: 20.88, words: [23.25, 23.87, 24.75],
  // CTA: stands slide off; app.werbens.com logo tile lands; wordmark on "Werbens"
  ctaClear: [25.75, 26.2], tile: [25.9, 26.28], lockup: 26.75,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 5, br: 2 },
  { line: "L2", from: 0, to: 9, br: 4 }, { line: "L2", from: 9, to: 19, br: 15 },
  { line: "L3", from: 0, to: 6, br: 4 }, { line: "L3", from: 6, to: 12, br: 9 },
  { line: "L4", from: 0, to: 2 }, { line: "L4", from: 2, to: 10, br: 6 },
  { line: "L5", from: 0, to: 4 }, { line: "L5", from: 4, to: 14, br: 7 },
  { line: "L6", from: 0, to: 8, br: 3 },
  { line: "L7", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["24", "6", "2000", "buy", "50", "zero", "depends", "overload", "compare", "easy", "group", "kids", "cheese", "boards", "baking", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  ...Array.from({ length: 24 }, (_, i) => ({ t: T.rain24[0] + (i * (T.rain24[1] - T.rain24[0])) / 23 + 0.2, type: "clink", gain: 0.05, pan: -0.25 + (i % 8) * 0.04 })).filter((c) => c.t > 0),
  { t: T.tag24 + 0.17, type: "card", gain: 0.16, pan: -0.2 }, ...Array.from({ length: 6 }, (_, i) => ({ t: T.rain6[0] + i * 0.09 + 0.2, type: "clink", gain: 0.07, pan: 0.35 })), { t: T.tag6 + 0.17, type: "card", gain: 0.16, pan: 0.35 },
  { t: T.reveal[0], type: "whoosh", dur: 0.7, gain: 0.06 }, { t: T.cite1[0] + 0.05, type: "tag", gain: 0.1 },
  { t: T.basket[0], type: "slide", dur: 0.4, gain: 0.1 }, { t: T.toSix[0], type: "slide", dur: 0.5, gain: 0.1, pan: 0.3 }, { t: T.hop + 0.25, type: "plop", gain: 0.16, pan: 0.3 },
  { t: T.dim24 + 0.02, type: "sink", gain: 0.07, pan: -0.2 }, { t: T.basketOut[0], type: "slide", dur: 0.4, gain: 0.08 },
  { t: T.cite2[0] + 0.05, type: "tag", gain: 0.1 }, { t: T.scaleIn[1], type: "clank", gain: 0.2 }, { t: T.level[0] + 0.05, type: "creak", dur: 0.55, gain: 0.07 }, { t: T.level[1] - 0.05, type: "tick", freq: 1568, gain: 0.08 },
  { t: T.cite3[0] + 0.05, type: "tag", gain: 0.1 }, { t: T.tipAgain[0], type: "creak", dur: 0.45, gain: 0.07 }, { t: T.jumble[0], type: "clatter", gain: 0.16, pan: -0.2 },
  { t: T.scaleOut[0], type: "sink", gain: 0.08 }, { t: T.group[0], type: "roll", dur: 0.75, gain: 0.12, pan: -0.2 }, { t: T.group[1], type: "settle", gain: 0.16, pan: -0.2 },
  { t: T.signs, type: "tag", gain: 0.1 }, ...T.words.map((t) => ({ t: t + 0.05, type: "tick", freq: 1760, gain: 0.08, pan: -0.2 })),
  { t: T.ctaClear[0], type: "slide", dur: 0.45, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
