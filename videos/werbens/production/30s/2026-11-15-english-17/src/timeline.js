// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/33).
// Story structure (context/27 incl. §5 first-frame rule): frame 0 = overcrowded shelf unit with one lit bottle + "LESS SELLS /
// MORE?" · hook 0–3.4 · build-up 3.4–7.0 · proof 7.0–18.5 · payoff 18.5–26.3 · CTA 26.3–30.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.4 }, { id: "build", t0: 3.4, t1: 7.0 }, { id: "proof", t0: 7.0, t1: 18.5 },
  { id: "payoff", t0: 18.5, t1: 26.3 }, { id: "cta", t0: 26.3, t1: 30 },
];
export const T = {
  // frame 0: shelf unit crammed with identical bottles, one lit; headline until the first caption. The crowd sinks into the
  // shelves in a wave from the edges in ("empty space"), leaving the one lit bottle ("look more premium")
  headline: [0, 0.42], collapse: [0.5, 2.45], heroUp: [2.2, 3.1],
  // build-up: lateral move to two display plinths; one bottle on each on "bottle"; two more packed tight on "packed tight";
  // two more with room on "given room"
  toB: [3.35, 4.25], same: [3.86, 4.2], packed: [5.37, 5.8], room: [6.03, 6.55],
  // proof 1: value columns rise behind both displays on "seem more valuable" ("MORE VALUABLE")
  cols: [10.39, 11.2], valLab: [10.85, 12.3],
  // proof 2: the roomy display's bottles glint on "more attractive"; a store arch rises behind it on "store more prestigious"
  // ("MORE PRESTIGE")
  glint: [12.7, 13.35], arch: [13.89, 14.6], presLab: [14.45, 15.6],
  // proof 3 (alternatives ruled out): equal counts hop on "scarcity"; the packed bottles straighten on "tidiness" (column
  // unchanged); the packed display widens and its bottles spread on "the space itself" — its column rises to match ("SPACE ITSELF")
  count: [15.79, 16.4], tidy: [16.77, 17.2], spread: [17.47, 18.15], spaceLab: [17.6, 18.85],
  // payoff: back to the shelf unit; the top shelf crowd returns; the lone lit bottle's light pool widens on "look like more"
  // and settles on "no guaranteed sale"
  toA: [18.45, 19.35], crowdBack: [18.45, 19.15], lessGlow: [19.38, 20.1], settle: [20.49, 21.3],
  // layout principle: a light pool spreads around the lone bottle on "room" ("GIVE IT ROOM"); six of the top-shelf crowd sink on
  // "fewer items"; the three left slide apart, each with its own light pool, on "space around each"
  heroRoom: [22.95, 23.5], roomLab: [22.9, 24.6], fewer: [23.67, 24.3], spreadTop: [24.55, 25.2], pools: [24.88, 25.5],
  // CTA: the shelf unit sinks; app.werbens.com logo tile pops up; wordmark on "Werbens"
  ctaClear: [26.25, 26.6], tile: [26.38, 26.74], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 5, br: 3, t0: 0.42 }, { line: "L1", from: 5, to: 10, br: 7 },
  { line: "L2", from: 0, to: 4, br: 2 }, { line: "L2", from: 4, to: 9, br: 6 },
  { line: "L3", from: 0, to: 5, br: 3 }, { line: "L3", from: 5, to: 12, br: 9 },
  { line: "L4", from: 0, to: 4, br: 2 }, { line: "L4", from: 4, to: 9, br: 7 },
  { line: "L5", from: 0, to: 4, br: 2 }, { line: "L5", from: 4, to: 7 },
  { line: "L6", from: 0, to: 5, br: 3 }, { line: "L6", from: 5, to: 10, br: 8 },
  { line: "L7", from: 0, to: 5, br: 3 }, { line: "L7", from: 5, to: 10, br: 7 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["empty", "space", "premium", "bottle", "packed", "room", "lab", "field", "valuable", "attractive", "prestigious", "scarcity", "tidiness", "itself", "less", "guaranteed", "best", "fewer", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  ...Array.from({ length: 9 }, (_, i) => ({ t: T.collapse[0] + 0.1 + i * 0.2, type: "clack", gain: 0.045 - i * 0.002, pan: (i % 2 ? 0.3 : -0.3) * (1 - i / 10) })),
  { t: T.heroUp[0], type: "shimmer", dur: 0.6, gain: 0.05 },
  { t: T.toB[0], type: "whoosh", dur: 0.9, gain: 0.05 }, { t: T.same[0] + 0.12, type: "plop", gain: 0.09, pan: -0.15 }, { t: T.same[0] + 0.17, type: "plop", gain: 0.08, pan: 0.15 },
  ...[0, 1].map((i) => ({ t: T.packed[0] + 0.2 + i * 0.09, type: "clink", gain: 0.06, pan: -0.25 })), { t: T.packed[0] + 0.05, type: "tag", gain: 0.06, pan: -0.25 },
  ...[0, 1].map((i) => ({ t: T.room[0] + 0.25 + i * 0.12, type: "plop", gain: 0.08, pan: 0.25 })), { t: T.room[0] + 0.1, type: "tag", gain: 0.06, pan: 0.25 },
  { t: T.cols[0], type: "riser", dur: 0.6, gain: 0.08 }, { t: T.valLab[0] + 0.03, type: "tag", gain: 0.07 },
  ...[0, 1, 2].map((i) => ({ t: T.glint[0] + i * 0.18, type: "chime", gain: 0.035, pan: 0.15 + i * 0.1 })),
  { t: T.arch[0], type: "riser", dur: 0.5, gain: 0.07, pan: 0.2 }, { t: T.arch[1], type: "thud", size: 0.9, gain: 0.14, pan: 0.2 }, { t: T.presLab[0] + 0.03, type: "tag", gain: 0.06 },
  ...[0, 1, 2].map((i) => ({ t: T.count[0] + 0.05 + i * 0.16, type: "tick", freq: 1568 + i * 196, gain: 0.05 })),
  { t: T.tidy[0] + 0.05, type: "clack", gain: 0.05, pan: -0.25 }, { t: T.spread[0], type: "slide", dur: 0.45, gain: 0.07, pan: -0.25 }, { t: T.spaceLab[0] + 0.25, type: "tag", gain: 0.07 },
  { t: T.toA[0], type: "whoosh", dur: 0.9, gain: 0.05 }, { t: T.lessGlow[0], type: "shimmer", dur: 0.6, gain: 0.045 },
  { t: T.heroRoom[0], type: "glow", gain: 0.05 }, { t: T.roomLab[0] + 0.05, type: "tag", gain: 0.06 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: T.fewer[0] + i * 0.08, type: "clack", gain: 0.04, pan: (i % 2 ? 0.3 : -0.3) })),
  { t: T.spreadTop[0], type: "slide", dur: 0.4, gain: 0.07 }, ...[0, 1, 2].map((i) => ({ t: T.pools[0] + i * 0.12, type: "chime", gain: 0.03, pan: -0.25 + i * 0.25 })),
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
