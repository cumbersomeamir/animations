// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/21).
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.85 }, { id: "same", t0: 3.85, t1: 7.4 }, { id: "study", t0: 7.4, t1: 13.6 }, { id: "taste", t0: 13.6, t1: 15.9 },
  { id: "lead", t0: 15.9, t1: 19.6 }, { id: "true", t0: 19.6, t1: 21.4 }, { id: "rest", t0: 21.4, t1: 25.75 }, { id: "cta", t0: 25.75, t1: 30 },
];
export const T = {
  // hook: two identical trays drop in (already falling on frame 0); labels slam on "75%" and "25%"; "?" on "fat"
  drop: [[-0.12, 0.18], [0.02, 0.32]], lab: [0.33, 2.21], q: [3.14, 3.95],
  // same: both trays hop together on "Same tray" ("=" between them); 3+1 blocks on "Same numbers"; frames on "frame";
  // the highlight splits on "changed" (left lifts its three lean blocks, right lifts its one fat block)
  same: 4.03, eq: [4.03, 7.35], bars: 4.91, frames: 6.27, split: 6.6,
  // study: pull back; blocks sink; source note on "1988"; rating tubes rise on "people rated"; left rises on "more favorably"
  barsDown: [7.45, 7.85], cite: [8.07, 13.55], tubes: [9.63, 10.0], fill: [9.98, 10.6], favor: [11.07, 11.75], leanSay: 13.07, illus: [9.75, 15.9],
  // taste: one shared sample plate slides in; a fork takes a bite on "tasting"; the gap narrows on "shrank" (not to zero)
  plate: [13.5, 13.95], forkDown: [14.12, 14.42], forkUp: [14.5, 14.95], gap: [11.8, 15.9], gapSay: 14.95, shrink: [15.16, 15.62],
  tubesOut: [15.85, 16.3], plateOut: [15.85, 16.3],
  // lead: a positive "75% LEAN" card slaps over the right tray's label on "positive"; the "25% FAT" card slides out on "negative"
  swap: 17.0, oldOut: [18.47, 19.05],
  // true: the 3+1 blocks come back (nothing hidden); "75% + 25% = 100%" on "true"
  barsUp: 19.78, trueSay: 20.59, trueNote: [20.59, 23.55],
  // rest: frames glow on "frame"; frames lift away and the sample plate returns on "product"
  glow: 21.67, impress: 22.57, framesOff: [23.7, 24.2], barsDown2: [23.55, 23.95], plateIn2: [23.7, 24.12], restSay: 24.56,
  // CTA: trays + plate slide off; app.werbens.com logo tile lands; wordmark on "Werbens"
  ctaClear: [25.75, 26.2], tile: [25.9, 26.28], lockup: 26.75,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 5 },
  { line: "L2", from: 0, to: 4 }, { line: "L2", from: 4, to: 8 },
  { line: "L3", from: 0, to: 4 }, { line: "L3", from: 4, to: 11, br: 8 }, { line: "L3", from: 11, to: 16 },
  { line: "L4", from: 0, to: 6, br: 3 },
  { line: "L5", from: 0, to: 6, br: 3 }, { line: "L5", from: 6, to: 10 },
  { line: "L6", from: 0, to: 4 },
  { line: "L7", from: 0, to: 5, br: 3 }, { line: "L7", from: 5, to: 10, br: 8 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["75%", "lean", "25%", "fat", "frame", "1988", "favorably", "tasting", "shrank", "positive", "true", "product", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: T.drop[0][1], type: "thud", size: 1.1, gain: 0.32, pan: -0.3 }, { t: T.drop[1][1], type: "thud", size: 1.0, gain: 0.32, pan: 0.3 },
  { t: T.lab[0] + 0.17, type: "stamp", gain: 0.26, pan: -0.3 }, { t: T.lab[1] + 0.17, type: "stamp", gain: 0.26, pan: 0.3 }, { t: T.q[0] + 0.05, type: "tag", gain: 0.12 },
  { t: T.same + 0.28, type: "thud", size: 0.8, gain: 0.18 }, { t: T.eq[0] + 0.05, type: "tag", gain: 0.1 },
  ...[0, 1, 2, 3].map((k) => ({ t: T.bars + 0.1 + k * 0.08, type: "clack", gain: 0.16 - k * 0.01, pan: -0.15 + k * 0.1 })),
  { t: T.frames + 0.18, type: "clank", gain: 0.2 }, { t: T.split, type: "pop", gain: 0.14 },
  { t: T.barsDown[0], type: "sink", gain: 0.1 }, { t: T.cite[0] + 0.05, type: "tag", gain: 0.1 },
  { t: T.tubes[0], type: "whoosh", dur: 0.4, gain: 0.08 }, { t: T.fill[0], type: "pour", dur: 0.6, gain: 0.12 }, { t: T.favor[0] + 0.05, type: "glow", gain: 0.1 },
  { t: T.plate[0], type: "slide", dur: 0.45, gain: 0.12 }, { t: T.forkDown[1], type: "clink", gain: 0.18 }, { t: T.forkUp[0] + 0.05, type: "toss", gain: 0.08 },
  { t: T.shrink[0] + 0.05, type: "sink", gain: 0.1 }, { t: T.tubesOut[0], type: "slide", dur: 0.45, gain: 0.1 },
  { t: T.swap + 0.17, type: "stamp", gain: 0.26, pan: 0.3 }, { t: T.oldOut[0], type: "peel", dur: 0.5, gain: 0.14 }, { t: T.oldOut[1] - 0.1, type: "card", gain: 0.14, pan: 0.4 },
  ...[0, 1, 2, 3].map((k) => ({ t: T.barsUp + 0.12 + k * 0.08, type: "clack", gain: 0.15 - k * 0.01, pan: -0.15 + k * 0.1 })), { t: T.trueSay + 0.05, type: "tick", freq: 1568, gain: 0.1 },
  { t: T.glow, type: "shimmer", dur: 0.6, gain: 0.08 }, { t: T.framesOff[0], type: "whoosh", dur: 0.45, gain: 0.08 }, { t: T.plateIn2[1] - 0.05, type: "settle", gain: 0.18 },
  { t: T.ctaClear[0], type: "slide", dur: 0.45, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
