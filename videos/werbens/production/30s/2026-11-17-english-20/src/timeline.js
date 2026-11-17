// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/36).
// Story structure (context/27 incl. §5 first-frame rule): frame 0 = two price signs on spring scales, 99 hanging high and 100
// hanging low, + "WHY 99, / NOT 100?" · hook 0–3.4 · super hook 3.4–6.3 · proof 6.3–19.5 · payoff 19.5–26.25 · CTA 26.25–30.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.4 }, { id: "super", t0: 3.4, t1: 6.3 }, { id: "proof", t0: 6.3, t1: 19.5 },
  { id: "payoff", t0: 19.5, t1: 26.25 }, { id: "cta", t0: 26.25, t1: 30 },
];
export const T = {
  // frame 0: the spring under "99" barely stretches, the one under "100" stretches far; headline until the first caption
  headline: [0, 0.42], pulse99: 1.61, pulse100: 2.55,
  // super hook: both signs spin round to "3.00"; on "a cent less" the left sign's last two tiles flip to 99; on "the first digit
  // drops" its first tile flips 3 → 2 and its spring jumps up ("FIRST DIGIT")
  spin: [3.4, 3.95], cent: 4.16, drop: 5.37, firstLab: [5.37, 6.5],
  // proof 1 (lab): "FELT SMALLER" on "felt smaller"
  feltLab: [8.17, 9.5],
  // proof 2 (boundary): left flips to 3.59 on "3.59", right to 3.60 on "3.60"; the springs hang level; "NO EFFECT"; both first
  // tiles glow on "same first digit"
  to359: 10.04, to360: 11.28, noLab: [12.49, 13.45], same: [13.48, 14.6],
  // proof 3 (field): lateral move to a shelf with two products (one new); their small tags flip to nine endings; queues of
  // shoppers grow, more for the new item ("MOST FOR NEW")
  toB: [14.75, 15.6], tags9: 16.28, lift: [16.97, 17.6], newMore: [18.27, 19.0], newLab: [18.27, 19.55],
  // payoff (rule): back to the signs; left resets to 3.00, right to 3.60; on "flips" the left's first digit flips (spring jumps,
  // check), the right only changes its last digits (nothing moves) ("ONLY IF IT FLIPS")
  toA: [19.35, 20.1], reset: 19.95, flips: 21.0, ruleLab: [21.0, 22.35],
  // payoff (boundary): the right sign spins back to a round "100" and a gift box rises under it ("FEELS RIGHT")
  roundSpin: [22.6, 23.15], gift: [22.95, 23.6], rightLab: [24.26, 25.9],
  // CTA: the stage sinks; app.werbens.com logo tile pops up; wordmark on "Werbens"
  ctaClear: [26.25, 26.6], tile: [26.38, 26.74], lockup: 27.55,
};
// split-flap digit tiles: per sign, the 4 back-face slots [d0, ".", d1, d2] and their changes over time ([t, digit])
export const FLAPS = {
  L: [[[0, 3], [T.drop, 2], [T.to359, 3], [T.reset, 3], [T.flips + 0.16, 2]], null, [[0, 0], [T.cent, 9], [T.to359 + 0.08, 5], [T.reset + 0.08, 0], [T.flips, 9]], [[0, 0], [T.cent + 0.08, 9], [T.reset + 0.16, 0], [T.flips + 0.08, 9]]],
  R: [[[0, 3]], null, [[0, 0], [T.to360, 6], [T.flips, 5]], [[0, 0], [T.flips + 0.08, 9]]],
};
// how far each spring stretches (perceived size; illustrative, exaggerated for legibility): [t, drop]
export const DROP = {
  L: [[0, 0.028], [T.spin[0], 0.028], [T.spin[1], 0.064], [T.drop + 0.12, 0.064], [T.drop + 0.45, 0.036], [T.to359, 0.036], [T.to359 + 0.35, 0.071], [T.reset, 0.071], [T.reset + 0.3, 0.064], [T.flips + 0.16, 0.064], [T.flips + 0.5, 0.036]],
  R: [[0, 0.074], [T.spin[0], 0.074], [T.spin[1], 0.064], [T.to360, 0.064], [T.to360 + 0.35, 0.071], [T.roundSpin[0], 0.071], [T.roundSpin[1], 0.074]],
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 10, br: 6, t0: 0.42 },
  { line: "L2", from: 0, to: 9, br: 4 },
  { line: "L3", from: 0, to: 7, br: 3 },
  { line: "L4", from: 0, to: 4 }, { line: "L4", from: 4, to: 9, br: 6 },
  { line: "L5", from: 0, to: 7, br: 3 }, { line: "L5", from: 7, to: 11 },
  { line: "L6", from: 0, to: 10, br: 5 },
  { line: "L7", from: 0, to: 9, br: 3 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["99,", "99", "round", "cent", "first", "digit", "drops", "studies", "2.99", "smaller", "3.00", "3.59", "3.60", "effect", "same", "field", "nine", "demand", "new", "flips", "feel-good", "feel", "right", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
const flipTimes = (side) => FLAPS[side].flatMap((s) => (s ? s.slice(1).map(([t]) => t) : []));
export const SFX = [
  { t: T.pulse99, type: "tick", freq: 1568, gain: 0.04, pan: -0.25 }, { t: T.pulse100, type: "tick", freq: 1175, gain: 0.04, pan: 0.25 },
  { t: T.spin[0], type: "whoosh", dur: 0.55, gain: 0.05 },
  ...flipTimes("L").map((t) => ({ t, type: "flip", gain: 0.05, pan: -0.25 })), ...flipTimes("R").map((t) => ({ t, type: "flip", gain: 0.05, pan: 0.25 })),
  { t: T.drop + 0.15, type: "bloop", gain: 0.06, pan: -0.25 }, { t: T.firstLab[0] + 0.05, type: "tag", gain: 0.05 }, { t: T.feltLab[0] + 0.05, type: "tag", gain: 0.06 },
  { t: T.noLab[0] + 0.05, type: "tag", gain: 0.06 }, { t: T.same[0], type: "chime", gain: 0.04 },
  { t: T.toB[0], type: "whoosh", dur: 0.9, gain: 0.04 }, ...[0, 1].map((i) => ({ t: T.tags9 + i * 0.1, type: "flip", gain: 0.045, pan: i ? 0.25 : -0.25 })),
  ...[0, 1].map((i) => ({ t: T.lift[0] + 0.1 + i * 0.12, type: "plop", gain: 0.07, pan: i ? 0.25 : -0.25 })), ...[0, 1].map((i) => ({ t: T.newMore[0] + 0.1 + i * 0.15, type: "plop", gain: 0.07, pan: 0.3 })), { t: T.newLab[0] + 0.05, type: "tag", gain: 0.06 },
  { t: T.toA[0], type: "whoosh", dur: 0.8, gain: 0.04 }, { t: T.flips + 0.3, type: "bloop", gain: 0.06, pan: -0.25 }, { t: T.ruleLab[0] + 0.25, type: "chime", gain: 0.04, pan: -0.25 },
  { t: T.roundSpin[0], type: "whoosh", dur: 0.5, gain: 0.04, pan: 0.25 }, { t: T.gift[0] + 0.3, type: "thud", size: 0.9, gain: 0.12, pan: 0.25 }, { t: T.rightLab[0] + 0.05, type: "shimmer", dur: 0.6, gain: 0.04 },
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
