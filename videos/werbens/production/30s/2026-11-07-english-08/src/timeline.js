// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/23).
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.4 }, { id: "study", t0: 3.4, t1: 9.5 }, { id: "demand", t0: 9.5, t1: 14.0 }, { id: "scarcity", t0: 14.0, t1: 17.5 },
  { id: "real", t0: 17.5, t1: 21.5 }, { id: "fake", t0: 21.5, t1: 25.75 }, { id: "cta", t0: 25.75, t1: 30 },
];
export const T = {
  // hook: cookies already raining into both jars on frame 0 (A gets ten, B gets two); B's two hop on "last two"; "?" on "tempting"
  dropA: -0.28, dropStep: 0.12, dropB: [0.05, 0.3], lastTwo: 2.15, q: [2.75, 3.45],
  // study: source chip on "1975"; jar B pulses on "nearly empty"; its podium rises on "rated"; rosette on "desirable"
  cite1: [4.01, 13.95], empty: 6.92, riseB: [7.92, 8.4], rosette: 8.55,
  // demand: A's cookies are taken one by one ("because others wanted them") until two are left; A rises higher on "higher still"
  take: [11.3, 12.65], riseA: [13.16, 13.6], rosetteMove: 13.3,
  // scarcity: an hourglass drops in on "scarcity"; its sand runs on "running out"; glows on "more valuable"
  glass: [14.5, 14.8], sand: [15.42, 16.75], valuable: 16.5, glassOut: [21.3, 21.7],
  // real limits: honest tags slap onto the jars on "stock counts" and "end dates"
  stockTag: 19.48, endTag: 20.52,
  // fake: a full jar slides in on "But"; amber "ONLY 2 LEFT!" tag slaps on on "only 2 left"; turns dark on "dark"; falls on "pattern"
  jarC: [21.73, 22.2], fake: 22.38, dark: 23.7, fakeOut: [24.0, 24.65], cite2: [22.13, 25.65],
  // CTA: jars slide off; app.werbens.com logo tile lands; wordmark on "Werbens"
  ctaClear: [25.75, 26.2], tile: [25.9, 26.28], lockup: 26.75,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 2 }, { line: "L1", from: 2, to: 10, br: 7 },
  { line: "L2", from: 0, to: 4 }, { line: "L2", from: 4, to: 9, br: 7 }, { line: "L2", from: 9, to: 13 },
  { line: "L3", from: 0, to: 4 }, { line: "L3", from: 4, to: 8 }, { line: "L3", from: 8, to: 12 },
  { line: "L4", from: 0, to: 2 }, { line: "L4", from: 2, to: 9, br: 5 },
  { line: "L5", from: 0, to: 4 }, { line: "L5", from: 4, to: 11, br: 7 },
  { line: "L6", from: 0, to: 6 }, { line: "L6", from: 6, to: 10 },
  { line: "L7", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["tempting", "1975", "empty", "desirable", "wanted", "higher", "scarcity", "valuable", "real", "stock", "fake", "dark", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  ...Array.from({ length: 10 }, (_, i) => ({ t: T.dropA + i * T.dropStep + 0.28, type: "clink", gain: 0.1 - i * 0.004, pan: -0.35 })).filter((c) => c.t > 0),
  ...T.dropB.map((t) => ({ t: t + 0.28, type: "clink", gain: 0.12, pan: 0.35 })),
  { t: T.lastTwo + 0.02, type: "tick", freq: 1568, gain: 0.08, pan: 0.35 }, { t: T.q[0] + 0.05, type: "tag", gain: 0.12 },
  { t: T.cite1[0] + 0.05, type: "tag", gain: 0.1 }, { t: T.riseB[0], type: "riser", dur: 0.5, gain: 0.08, pan: 0.35 }, { t: T.rosette, type: "pop", gain: 0.16, pan: 0.35 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: T.take[0] + (i * (T.take[1] - T.take[0])) / 8, type: "toss", gain: 0.05, pan: -0.4 })),
  { t: T.riseA[0], type: "riser", dur: 0.5, gain: 0.08, pan: -0.35 }, { t: T.rosetteMove + 0.25, type: "pop", gain: 0.14, pan: -0.35 },
  { t: T.glass[1], type: "settle", gain: 0.2 }, { t: T.sand[0], type: "pour", dur: 1.2, gain: 0.08 }, { t: T.valuable + 0.03, type: "glow", gain: 0.08 },
  { t: T.stockTag + 0.17, type: "card", gain: 0.18, pan: 0.35 }, { t: T.endTag + 0.17, type: "card", gain: 0.18, pan: -0.35 }, { t: T.glassOut[0], type: "sink", gain: 0.1 },
  { t: T.jarC[0], type: "slide", dur: 0.45, gain: 0.12, pan: 0.2 }, { t: T.jarC[1], type: "clink", gain: 0.12 }, { t: T.fake + 0.17, type: "card", gain: 0.2 },
  { t: T.dark + 0.02, type: "sink", gain: 0.12 }, { t: T.fakeOut[0] + 0.05, type: "peel", dur: 0.5, gain: 0.12 },
  { t: T.ctaClear[0], type: "slide", dur: 0.45, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
