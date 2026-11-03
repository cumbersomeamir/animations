// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json.
// Beat times are tied to measured word onsets (see narration.js WORD_FIX and the envelope segments in context/16).
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 2.9 }, { id: "setup", t0: 2.9, t1: 7.2 }, { id: "cover", t0: 7.2, t1: 11.0 },
  { id: "asset", t0: 11.0, t1: 15.8 }, { id: "contrast", t0: 15.8, t1: 19.6 }, { id: "takeaway", t0: 19.6, t1: 25.85 }, { id: "cta", t0: 25.85, t1: 30 },
];
// fictional bakery touchpoints (world x); the brand is invented and labelled on screen
export const ITEMS = { logo: { x: -0.85, label: "LOGO" }, bag: { x: 0, label: "BAG" }, sign: { x: 0.85, label: "SIGN" } };
export const NAME = "PLIMM";
export const T = {
  // hook: one arch drops (near-impact slow motion), then repeats into a rhythmic row
  heroDrop: [-0.35, 0.72], repeat1: 1.2, repeat2: 1.55, repeat3: 2.08, rowOut: [2.62, 3.05], heroUp: [2.62, 3.3],
  // setup: three blank touchpoints land; the arch stamps each one on its word
  itemDrop: { logo: [2.95, 3.55], bag: [3.15, 3.75], sign: [3.35, 3.95] }, chip: [3.5, 9.25],
  stamp: { logo: 5.32, bag: 5.9, sign: 6.43 }, stampPark: [6.6, 7.1],
  // cover the name: grey covers slide over the names; arches pulse; recall lines point to the (recalled) bakery
  cover: { logo: 7.45, bag: 7.6, sign: 7.75 }, coverDur: 0.32, archPulse: 8.68, recall: [9.5, 10.9],
  // the asset: push in on the bag, the arch lifts off, label, cover peels, link line draws, arch returns
  push: [10.9, 11.6], lift: [11.35, 11.9], assetNote: 12.5, peel: [14.0, 14.35], link: [14.75, 15.25], back: [15.35, 15.8],
  // contrast: shapes swap on every item (flip), link attempts snap
  swap: { logo: 16.05, bag: 16.45, sign: 16.85 }, swapDur: 0.32, inconsistent: 17.0, tryLink: [17.95, 18.45], snap: 18.5,
  // takeaway: pick one asset, stamp it consistently, test with the name hidden
  oddOut: [19.8, 20.3], pick: [19.85, 20.55], restamp: { logo: 21.1, bag: 21.55, sign: 22.0 }, restampPark: [22.15, 22.6],
  cover2: { logo: 22.6, bag: 22.72, sign: 22.84 }, testNote: 22.75, testLines: [23.5, 24.6], reveal: [24.75, 25.15],
  // CTA: touchpoints slide off; official Werbens icon tile lands; official lockup on "Werbens"
  ctaClear: [25.6, 26.15], tile: [25.95, 26.33], lockup: 26.9,
};
export const CAPTIONS = [
  { line: "L1", from: 0, to: 7, br: 4 },
  { line: "L2", from: 0, to: 4 }, { line: "L2", from: 4, to: 12, br: 9 },
  { line: "L3", from: 0, to: 3 }, { line: "L3", from: 3, to: 12, br: 8 },
  { line: "L4", from: 0, to: 7, br: 3 }, { line: "L4", from: 7, to: 12 },
  { line: "L5", from: 0, to: 5 }, { line: "L5", from: 5, to: 11, br: 9 },
  { line: "L6", from: 0, to: 3 }, { line: "L6", from: 3, to: 6 }, { line: "L6", from: 6, to: 14, br: 10 },
  { line: "L7", from: 0, to: 7, br: 3 },
];
export const HIGHLIGHT = ["shape", "arch", "name", "distinctive", "asset", "link", "consistently", "test", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off narration word onsets where possible
const it = ["logo", "bag", "sign"];
export const SFX = [
  { t: 0.0, type: "fallAir", dur: 0.5, gain: 0.12 }, { t: T.heroDrop[1], type: "thud", size: 0.9, gain: 0.5 },
  { t: T.repeat1, type: "clack", gain: 0.24, pan: -0.3 }, { t: T.repeat2, type: "clack", gain: 0.24, pan: 0.3 },
  { t: T.repeat3 - 0.04, type: "clack", gain: 0.2, pan: -0.6 }, { t: T.repeat3 + 0.06, type: "clack", gain: 0.2, pan: 0.6 },
  { t: T.rowOut[0], type: "sink", gain: 0.12 }, { t: T.heroUp[0] + 0.05, type: "whoosh", dur: 0.4, gain: 0.1 },
  ...it.map((k, i) => ({ t: T.itemDrop[k][1], type: "thud", size: 1.1 + i * 0.05, gain: 0.42, pan: (i - 1) * 0.4 })),
  { t: T.chip[0] - 0.02, type: "tag", gain: 0.12 },
  ...it.map((k, i) => ({ t: T.stamp[k], type: "stamp", gain: 0.4, pan: (i - 1) * 0.4 })),
  ...it.map((k, i) => ({ t: T.cover[k] + T.coverDur - 0.03, type: "card", gain: 0.2, pan: (i - 1) * 0.4 })),
  { t: T.archPulse - 0.06, type: "glow", gain: 0.12 }, { t: T.recall[0], type: "chime", gain: 0.14 },
  { t: T.push[0], type: "whoosh", dur: 0.6, gain: 0.08 }, { t: T.lift[0], type: "pop", gain: 0.22 },
  { t: T.assetNote - 0.08, type: "tag", gain: 0.14 }, { t: T.peel[0], type: "peel", dur: 0.35, gain: 0.18 },
  { t: T.link[0], type: "zip", dur: 0.5, gain: 0.14 }, { t: T.back[1] - 0.04, type: "clack", gain: 0.22 },
  ...it.map((k, i) => ({ t: T.swap[k], type: "flip", gain: 0.2, pan: (i - 1) * 0.4 })),
  { t: T.inconsistent - 0.05, type: "tag", gain: 0.12 }, { t: T.tryLink[0], type: "zip", dur: 0.42, gain: 0.1 }, { t: T.snap, type: "snap", gain: 0.3 },
  { t: T.oddOut[0], type: "sink", gain: 0.14 }, { t: T.pick[1] - 0.04, type: "thud", size: 0.9, gain: 0.36 },
  ...it.map((k, i) => ({ t: T.restamp[k], type: "stamp", gain: 0.36, pan: (i - 1) * 0.4 })),
  ...it.map((k, i) => ({ t: T.cover2[k] + T.coverDur - 0.03, type: "card", gain: 0.16, pan: (i - 1) * 0.4 })),
  { t: T.testNote - 0.06, type: "tag", gain: 0.12 }, { t: T.testLines[0], type: "zip", dur: 0.5, gain: 0.1 }, { t: T.reveal[0], type: "peel", dur: 0.3, gain: 0.14 },
  { t: T.ctaClear[0], type: "slide", dur: 0.5, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
