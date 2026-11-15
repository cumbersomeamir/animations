// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/32).
// Story structure (context/27 incl. §5 first-frame rule): frame 0 = composed three-plan stage + "THE OPTION / YOU WON'T BUY" ·
// hook 0–3.5 · build-up 3.5–10.5 · proof 10.5–19.5 · payoff 19.5–26.65 · CTA 26.65–30.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.5 }, { id: "build", t0: 3.5, t1: 10.5 }, { id: "proof", t0: 10.5, t1: 19.5 },
  { id: "payoff", t0: 19.5, t1: 26.65 }, { id: "cta", t0: 26.65, t1: 30 },
];
export const T = {
  // frame 0: three made-up plans; shoppers crowd the middle; the tall Premium has one shopper; headline until the first caption
  headline: [0, 0.42], premiumGlow: [0.9, 2.4],
  // build-up: Premium sinks away on "two made-up plans" and the shoppers re-split between Basic and Plus; "MADE-UP PLANS";
  // Premium rises again on "Add a more expensive Premium" and the shoppers move toward Plus on "Plus becomes the middle choice"
  premiumOut: [4.24, 4.9], split: [5.3, 6.1], madeUp: [4.41, 5.95], premiumIn: [7.85, 8.45], toMiddle: [8.9, 9.9],
  // neighbours: Basic and Premium lean in toward Plus on "neighbors"; Plus pulses on "not alone"
  lean: [12.23, 12.9], alone: 12.84,
  // proof: lateral move to the study diagram; middle bar rises on "gained appeal" ("MIDDLE GAINS"); extremes sink on
  // "extremes lost it" ("EXTREMES LOSE")
  toBars: [13.3, 14.2], middleUp: [15.79, 16.45], gainsLab: [15.79, 16.9], extremesDown: [17.0, 17.6], loseLab: [17.0, 18.6],
  // payoff: back to the plans; a ripple through the menu on "reshapes the whole menu"; each tier gets its own real customer on
  // "build every tier for a real customer" ("REAL CUSTOMERS")
  toPlans: [18.6, 19.6], reshape: [20.92, 21.9], realCust: [24.06, 25.1], realLab: [24.83, 26.45],
  // CTA: the stage parts; app.werbens.com logo tile pops up between; wordmark on "Werbens"
  ctaClear: [26.45, 26.8], tile: [26.48, 26.84], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 5, br: 3, t0: 0.42 }, { line: "L1", from: 5, to: 11, br: 7 },
  { line: "L2", from: 0, to: 5, br: 3 }, { line: "L2", from: 5, to: 8 },
  { line: "L3", from: 0, to: 5, br: 3 }, { line: "L3", from: 5, to: 11, br: 8 },
  { line: "L4", from: 0, to: 8, br: 4 },
  { line: "L5", from: 0, to: 7, br: 3 }, { line: "L5", from: 7, to: 10 },
  { line: "L6", from: 0, to: 8, br: 4 },
  { line: "L7", from: 0, to: 3 }, { line: "L7", from: 3, to: 13, br: 8 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["skip", "pick", "madeup", "basic", "plus", "premium", "middle", "neighbors", "alone", "appeal", "extremes", "reshapes", "honestly", "real", "customer", "bait", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: T.premiumGlow[0] + 0.05, type: "glow", gain: 0.05, pan: 0.25 },
  { t: T.premiumOut[0], type: "sink", gain: 0.08, pan: 0.25 }, ...Array.from({ length: 6 }, (_, i) => ({ t: T.split[0] + 0.05 + i * 0.07, type: "clack", gain: 0.05, pan: -0.25 })),
  { t: T.madeUp[0] + 0.03, type: "tag", gain: 0.08 }, { t: T.premiumIn[0], type: "riser", dur: 0.55, gain: 0.08, pan: 0.25 }, { t: T.premiumIn[1], type: "thud", size: 1.0, gain: 0.18, pan: 0.25 },
  ...Array.from({ length: 5 }, (_, i) => ({ t: T.toMiddle[0] + 0.05 + i * 0.12, type: "clack", gain: 0.05, pan: -0.15 })),
  { t: T.lean[0], type: "slide", dur: 0.35, gain: 0.06 }, { t: T.alone + 0.05, type: "tick", freq: 1568, gain: 0.05 },
  { t: T.toBars[0], type: "whoosh", dur: 0.9, gain: 0.05 }, { t: T.middleUp[0], type: "riser", dur: 0.55, gain: 0.08 }, { t: T.gainsLab[0] + 0.03, type: "tag", gain: 0.07 },
  { t: T.extremesDown[0], type: "sink", gain: 0.07, pan: -0.2 }, { t: T.extremesDown[0] + 0.08, type: "sink", gain: 0.07, pan: 0.2 }, { t: T.loseLab[0] + 0.12, type: "tag", gain: 0.06 },
  { t: T.toPlans[0], type: "whoosh", dur: 0.9, gain: 0.05 }, ...[0, 1, 2].map((i) => ({ t: T.reshape[0] + i * 0.12, type: "clack", gain: 0.05, pan: -0.25 + i * 0.25 })),
  ...[0, 1, 2].map((i) => ({ t: T.realCust[0] + i * 0.2 + 0.3, type: "plop", gain: 0.1, pan: -0.25 + i * 0.25 })), { t: T.realLab[0] + 0.03, type: "tag", gain: 0.07 },
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
