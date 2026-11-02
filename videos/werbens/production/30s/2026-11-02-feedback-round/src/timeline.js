// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3 }, { id: "setup", t0: 3, t1: 8.2 }, { id: "mechanism", t0: 8.2, t1: 20.6 },
  { id: "takeaway", t0: 20.6, t1: 26.3 }, { id: "cta", t0: 26.3, t1: 30 },
];
// hero objects: illustrative menu (prices invented)
export const MENU = {
  small: { ml: 150, price: 90, letter: "S", name: "SMALL", x: -1.0 },
  large: { ml: 300, price: 160, letter: "L", name: "LARGE", x: -0.1 },
  medium: { ml: 280, price: 155, letter: "M", name: "MEDIUM", x: 0.85 },
};
export const T = {
  // hook: drops with near-impact slow motion
  smallDrop: [-0.6, 0.55], largeDrop: [-0.2, 1.15], mediumShadow: [2.2, 3.5], mediumDrop: [2.62, 3.5],
  menuChip: [0.7, 8.2],
  // setup: size + price comparison
  sizeLines: [4.8, 6.4], priceCompare: [6.7, 8.2],
  // mechanism 1: measuring transform (+20 ml for Rs5) → "obvious upgrade"
  lidsOpen: [8.3, 8.75], glassOn: [8.6, 9.2], extraGlow: [9.6, 10.2], coin: [10.2, 10.62], upgrade: [11.05, 11.6], glassOff: [12.0, 12.5], lidsClose: [12.2, 12.6],
  // mechanism 2: decoy reveal + comparison
  decoyTag: [13.72, 14.0], ghost: [13.75, 14.3], beam: [15.2, 15.9], better: [16.5, 16.9],
  // mechanism 3: suspended ball drops on the decoy, strips the distraction away
  ballHover: [18.4, 19.0], ballImpact: 19.1, ballOut: [19.15, 19.95], flatOut: [19.65, 20.25], regroup: [20.05, 20.75],
  // takeaway: back to the quantity you need; slice off the extra
  glass2: [21.0, 21.6], needRing: [22.3, 22.7], extra2: [22.95, 23.4], blade: [23.8, 24.35], slice: [24.35, 25.2],
  // CTA
  ctaSplit: [25.85, 26.25], tile: [26.0, 26.4], wordmark: 27.0,
};
export const CAPTIONS = [
  { line: "L1", from: 0, to: 8, br: 4 },
  { line: "L2", from: 0, to: 10, br: 5 }, { line: "L2", from: 10, to: 16, br: 13 },
  { line: "L3", from: 0, to: 9, br: 5 },
  { line: "L4", from: 0, to: 3 }, { line: "L4", from: 3, to: 9, br: 6 }, { line: "L4", from: 9, to: 13 },
  { line: "L5", from: 0, to: 3 }, { line: "L5", from: 3, to: 9, br: 6 },
  { line: "L6", from: 0, to: 7, br: 3 },
];
export const HIGHLIGHT = ["bad", "medium", "large", "upgrade", "decoy", "comparison", "extra", "want", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off narration word onsets where possible
export const SFX = [
  { t: 0.0, type: "fallAir", dur: 0.55, gain: 0.14 }, { t: 0.55, type: "cupLand", size: 0.8, gain: 0.5 },
  { t: 1.15, type: "cupLand", size: 1.0, gain: 0.55 },
  { t: 0.62, type: "tag", gain: 0.16 }, { t: 1.22, type: "tag", gain: 0.16 },
  { t: 2.3, type: "riser", dur: 1.1, gain: 0.07 }, { t: 2.62, type: "fallAir", dur: 0.4, gain: 0.1 }, { t: 3.5, type: "cupLand", size: 0.98, gain: 0.55 }, { t: 3.57, type: "tag", gain: 0.16 },
  { t: 4.72, type: "tick", freq: 1319, gain: 0.12 }, { t: 6.58, type: "tick", freq: 1568, gain: 0.12 },
  { t: T.lidsOpen[0], type: "pop", gain: 0.26 }, { t: T.lidsOpen[0] + 0.08, type: "pop", gain: 0.22 },
  { t: T.glassOn[0], type: "shimmer", dur: 0.6, gain: 0.12 }, { t: 9.15, type: "pour", dur: 0.5, gain: 0.12 },
  { t: T.extraGlow[0] - 0.1, type: "glow", gain: 0.16 }, { t: T.coin[0], type: "toss", gain: 0.08 }, { t: T.coin[1], type: "coinDrop", gain: 0.3 },
  { t: T.upgrade[0] - 0.08, type: "bloop", gain: 0.16 }, { t: T.upgrade[0] + 0.34, type: "plink", gain: 0.14 },
  { t: T.lidsClose[0], type: "pop", gain: 0.2 }, { t: T.lidsClose[0] + 0.08, type: "pop", gain: 0.18 },
  { t: T.decoyTag[0] - 0.1, type: "flip", gain: 0.22 }, { t: T.beam[0], type: "glow", gain: 0.12 }, { t: T.better[1] - 0.05, type: "settle", gain: 0.14 },
  { t: T.ballHover[0] - 0.4, type: "creak", dur: 1.0, gain: 0.18 }, { t: T.ballImpact - 0.12, type: "whoosh", dur: 0.14, gain: 0.3 },
  { t: T.ballImpact, type: "squash", gain: 0.62 }, { t: T.flatOut[0] + 0.02, type: "slide", dur: 0.5, gain: 0.16 }, { t: T.regroup[0], type: "slide", dur: 0.6, gain: 0.14 },
  { t: T.glass2[0], type: "shimmer", dur: 0.6, gain: 0.12 }, { t: T.glass2[0] - 0.1, type: "pop", gain: 0.2 },
  { t: T.needRing[0] - 0.12, type: "tick", freq: 1175, gain: 0.1 }, { t: T.extra2[0], type: "glow", gain: 0.11 },
  { t: T.blade[0], type: "slice", dur: T.blade[1] - T.blade[0], gain: 0.3 }, { t: T.slice[1] - 0.05, type: "settle", gain: 0.3 },
  { t: T.ctaSplit[0], type: "slide", dur: 0.35, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
