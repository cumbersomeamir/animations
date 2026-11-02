// Single source of timing truth, imported by the browser scene AND the Node audio mixer.
// Narration word times come from src/words.json (Kokoro TTS → Whisper word alignment, see words.mjs).
export const FPS = 30;
export const DURATION = 15;
export const FRAMES = FPS * DURATION; // 450

export const SHOTS = [
  { id: "S1 puzzle", t0: 0.0, t1: 2.6 },
  { id: "S2 clue", t0: 2.6, t1: 5.9 },
  { id: "S3 taste", t0: 5.9, t1: 9.3 },
  { id: "S4 x-ray reveal", t0: 9.3, t1: 11.6 },
  { id: "S5 takeaway", t0: 11.6, t1: 15.0 },
];

// Action beats (seconds)
export const T = {
  // S1 — two boxes drop from the fly loft; Pip presents; Quibble judges
  dropPlain: -0.12, landPlain: 0.3, dropLuxe: 0.12, landLuxe: 0.55,
  pipPresent: [0.62, 1.3], pipTurn: 1.3, quibSquint: [0.95, 1.65], quibPoint: 1.95,
  // S2 — weighing the boxes; the expectation bubble
  liftPlain: [2.72, 3.05], bubbleSmall: 3.15, liftLuxe: [3.5, 4.0], tagHeavy: 3.98, tagAngular: 4.22,
  bubbleBig: 4.5, setDown: [5.35, 5.75],
  // S3 — tasting
  lidLuxe: 5.98, grabLuxe: [6.12, 6.36], toMouthLuxe: [6.36, 6.82], biteLuxe: 6.92, delight: [7.1, 7.95],
  lidPlain: 8.0, grabPlain: [8.05, 8.25], toMouthPlain: [8.25, 8.55], bitePlain: 8.62, meh: [8.78, 9.3],
  // S4 — X-ray lamp reveal
  lampSwing: [9.3, 9.6], lampOn: 9.62, xray: [9.66, 9.98], equal: 10.05, glassesSlip: [10.45, 10.75], shock: [10.15, 10.95],
  // S5 — takeaway
  pipRaise: [11.7, 12.2], promiseLink: 12.74, cookieIn: [13.05, 13.45], plop: 13.55, check: 13.9, wink: 14.25, signature: 13.4,
};

// Captions follow the spoken words (word-timed reveal from words.json); hi = highlighted words (lowercase, no punctuation)
export const CAPTIONS = [
  { line: "L1", t0: 0.0, t1: 2.55, hi: ["better"] },
  { line: "L2", part: [0, 4], t0: 2.82, t1: 4.38, hi: ["clue"] },
  { line: "L2", part: [4, 8], t0: 4.38, t1: 5.95, hi: ["expectation"] },
  { line: "L3", t0: 5.98, t1: 8.6, hi: ["tilt", "taste"] },
  { line: "L4", t0: 9.98, t1: 11.55, hi: ["same"] },
  { line: "L5", t0: 11.78, t1: 14.97, hi: ["promise", "inside"] },
];

// Sound cue sheet — every cue is caused by a visible action (synthesised in audio.mjs).
export const SFX = [
  { t: 0.0, type: "fall", dur: 0.28, gain: 0.22, pan: 0.25 },
  { t: T.landPlain, type: "tap", gain: 0.55, pan: 0.25 },
  { t: T.dropLuxe - 0.04, type: "fall", dur: 0.36, gain: 0.26, pan: -0.25 },
  { t: T.landLuxe, type: "thud", gain: 0.95, pan: -0.2 },
  { t: T.landLuxe + 0.03, type: "rattle", gain: 0.3, pan: 0 },
  { t: T.quibSquint[0], type: "squint", gain: 0.3, pan: 0.2 },
  { t: T.quibPoint, type: "point", gain: 0.42, pan: 0.15 },
  { t: 2.6, type: "cut", gain: 0.18 },
  { t: T.liftPlain[0], type: "whoopUp", gain: 0.42, pan: 0.3 },
  { t: T.bubbleSmall, type: "bubble", freq: 520, gain: 0.32, pan: 0.15 },
  { t: T.liftLuxe[0] + 0.05, type: "strain", dur: 0.5, gain: 0.45, pan: -0.25 },
  { t: T.tagHeavy, type: "tag", freq: 880, gain: 0.32, pan: -0.3 },
  { t: T.tagAngular, type: "tag", freq: 1175, gain: 0.32, pan: -0.3 },
  { t: T.bubbleBig - 0.05, type: "inflate", dur: 0.5, gain: 0.42, pan: 0.1 },
  { t: T.bubbleBig + 0.32, type: "sparkle", gain: 0.3, pan: 0.15 },
  { t: T.setDown[1] - 0.04, type: "tap", gain: 0.3, pan: -0.2 },
  { t: T.setDown[1], type: "tap", gain: 0.25, pan: 0.2 },
  { t: 5.9, type: "cut", gain: 0.15 },
  { t: T.lidLuxe, type: "lidPop", freq: 1320, gain: 0.4, pan: -0.15 },
  { t: T.lidLuxe + 0.42, type: "tap", gain: 0.28, pan: -0.35 },
  { t: T.lidLuxe + 0.04, type: "sparkle", gain: 0.22, pan: -0.15 },
  { t: T.biteLuxe, type: "crunch", gain: 0.62, pan: 0.05 },
  { t: T.delight[0] + 0.05, type: "delight", gain: 0.36, pan: 0.1 },
  { t: T.lidPlain, type: "lidPop", freq: 660, gain: 0.3, pan: 0.15 },
  { t: T.bitePlain, type: "crunch", gain: 0.62, pan: 0.05 }, // identical crunch on purpose: same product
  { t: T.meh[0] + 0.02, type: "meh", gain: 0.34, pan: 0.1 },
  { t: T.lampSwing[0], type: "whip", dur: 0.32, gain: 0.4 },
  { t: T.lampOn, type: "clack", gain: 0.6, pan: -0.35 },
  { t: T.lampOn + 0.02, type: "hum", dur: 1.9, gain: 0.2, pan: -0.2 },
  { t: T.equal, type: "ding", gain: 0.5, pan: 0 },
  { t: 9.9, type: "pop", gain: 0.3, pan: 0.3 }, // expectation bubble bursts under the lamp
  { t: T.glassesSlip[0], type: "slide", dur: 0.3, gain: 0.32, pan: 0.25 },
  { t: 11.6, type: "cut", gain: 0.15 },
  { t: T.promiseLink, type: "link", dur: 0.45, gain: 0.32, pan: 0 },
  { t: T.plop, type: "plop", gain: 0.45, pan: -0.1 },
  { t: T.check, type: "check", gain: 0.42, pan: 0 },
  { t: T.wink, type: "wink", gain: 0.26, pan: -0.1 },
];
