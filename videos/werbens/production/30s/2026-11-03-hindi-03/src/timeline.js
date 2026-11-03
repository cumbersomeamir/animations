// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words_hi.mjs). Beats sit on the measured Hindi word onsets listed in context/18.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.3 }, { id: "words", t0: 3.3, t1: 6.8 }, { id: "reveal", t0: 6.8, t1: 9.6 }, { id: "demo", t0: 9.6, t1: 14.3 },
  { id: "memory", t0: 14.3, t1: 17.6 }, { id: "technique", t0: 17.6, t1: 23.0 }, { id: "real", t0: 23.0, t1: 25.35 }, { id: "cta", t0: 25.35, t1: 30 },
];
// stage layout (world x): fictional product hood → tawa on a stove ring; plate on the left
export const POS = { tawa: 0.25, plate: -0.72, hood: 0.2 };
export const ADJ = ["शानदार", "मज़बूत", "बेहतरीन"]; // the adjectives that hide the product
export const T = {
  // hook: "शानदार" drops in front of the covered product (near-impact slow motion); on "साबित" it wobbles + "?"
  // tile 0 drops before the first caption; tiles 1–2 fly in from the sides (never through the caption band)
  adjDrop: [[-0.45, 0.75], [3.3, 3.75], [3.9, 4.35]], doubt: 2.16, q: [2.3, 6.75], wallWobble: 5.55,
  // reveal: the word wall topples aside on "अब", the hood tips back, the tawa is revealed
  topple: [6.9, 7.65], hoodOff: [7.1, 7.9], chip: [7.3, 13.9], tagTawa: 7.97, plateIn: [8.4, 8.9],
  // demo: no oil, batter spreads + browns, tawa tilts, dosa slides off onto the plate, tawa settles
  oil: [9.9, 12.3], batter: [10.5, 11.2], cook: [10.95, 11.55], tilt: [11.75, 12.35], slide: [12.45, 13.25], drop: [13.25, 13.62], untilt: [13.55, 14.15],
  // memory: push in on the result; the fallen adjectives sink and fade; the demo stays
  push: [14.3, 15.5], forget: [15.3, 16.6], glow: 16.42,
  // technique: the adjective on the tag lights up, question note, viewfinder + record, the same test is shown again
  wide: [17.5, 18.4], adjHi: 18.86, askNote: 19.6, frame: [20.3, 22.95], replayBatter: [21.6, 21.9], replayTilt: [21.92, 22.15], replaySlide: [22.15, 22.55], replayDrop: [22.55, 22.8], replayUntilt: [22.75, 23.1],
  // real test only: a cardboard mock-up dosa pops up, then falls flat on "असली" (it is fake); the real plate is the test
  fakeUp: [22.95, 23.3], fakeFall: [23.9, 24.35], fakeNote: 24.0, realNote: 24.55,
  // CTA: props slide off; app.werbens.com logo tile lands; wordmark on "वर्बेन्स"
  ctaClear: [25.35, 25.85], tile: [25.58, 25.98], lockup: 26.15,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 7, br: 4 }, { line: "L2", from: 0, to: 7, br: 4 }, { line: "L3", from: 0, to: 6, br: 3 },
  { line: "L4", from: 0, to: 5 }, { line: "L4", from: 5, to: 12, br: 7 },
  { line: "L5", from: 0, to: 8, br: 4 },
  { line: "L6", from: 0, to: 6, br: 3 }, { line: "L6", from: 6, to: 11 }, { line: "L6", from: 11, to: 14 },
  { line: "L7", from: 0, to: 5 }, { line: "L8", from: 0, to: 9, br: 4 },
];
export const HIGHLIGHT = ["शानदार", "मज़बूत", "बेहतरीन", "डोसा", "याद", "कैमरे", "दिखाइए", "असली", "वर्बेन्स"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: 0.0, type: "fallAir", dur: 0.45, gain: 0.1 }, { t: T.adjDrop[0][1], type: "thud", size: 1.0, gain: 0.45 },
  { t: T.doubt + 0.05, type: "hollow", gain: 0.2 }, { t: T.q[0], type: "tag", gain: 0.12 },
  { t: T.adjDrop[1][1], type: "thud", size: 0.95, gain: 0.4, pan: -0.1 }, { t: T.adjDrop[2][1], type: "thud", size: 0.9, gain: 0.4, pan: 0.1 },
  { t: T.wallWobble, type: "hollow", gain: 0.16 },
  { t: T.topple[0] + 0.05, type: "whoosh", dur: 0.4, gain: 0.12 }, { t: T.topple[1] - 0.1, type: "clatter", gain: 0.3 },
  { t: T.hoodOff[0] + 0.05, type: "pop", gain: 0.2 }, { t: T.hoodOff[1] - 0.15, type: "thud", size: 1.2, gain: 0.25 },
  { t: T.chip[0] + 0.1, type: "tag", gain: 0.1 }, { t: T.tagTawa + 0.05, type: "tag", gain: 0.12 }, { t: T.plateIn[1] - 0.05, type: "clink", gain: 0.22 },
  { t: T.oil[0], type: "tag", gain: 0.12 }, { t: T.batter[0] - 0.05, type: "pour", dur: 0.7, gain: 0.16 }, { t: T.cook[0], type: "sizzle", dur: 1.3, gain: 0.07 },
  { t: T.tilt[0], type: "creak", dur: 0.55, gain: 0.1 }, { t: T.slide[0], type: "slide", dur: 0.8, gain: 0.18 }, { t: T.drop[1] - 0.03, type: "plop", gain: 0.34 },
  { t: T.untilt[1] - 0.1, type: "clank", gain: 0.2 },
  { t: T.forget[0], type: "sink", gain: 0.1 }, { t: T.glow - 0.05, type: "glow", gain: 0.12 },
  { t: T.adjHi - 0.05, type: "tag", gain: 0.1 }, { t: T.askNote, type: "tag", gain: 0.12 }, { t: T.frame[0], type: "shutter", gain: 0.24 }, { t: T.frame[0] + 0.15, type: "beep", gain: 0.1 },
  { t: T.replayBatter[0], type: "pour", dur: 0.3, gain: 0.1 }, { t: T.replaySlide[0], type: "slide", dur: 0.4, gain: 0.14 }, { t: T.replayDrop[1] - 0.03, type: "plop", gain: 0.28 },
  { t: T.fakeUp[0], type: "pop", gain: 0.16 }, { t: T.fakeFall[1] - 0.04, type: "flap", gain: 0.3 }, { t: T.fakeNote + 0.05, type: "tag", gain: 0.12 }, { t: T.realNote, type: "chime", gain: 0.14 },
  { t: T.ctaClear[0], type: "slide", dur: 0.5, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
