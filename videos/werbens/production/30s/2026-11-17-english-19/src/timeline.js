// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/35).
// Story structure (context/27 incl. §5 first-frame rule): frame 0 = two identical products, one bare, one fully loaded, + "SAME
// OPTIONS. / BIGGER ORDER?" · hook 0–3.3 · build-up 3.3–6.9 · proof 6.9–18.3 · payoff 18.3–26.25 · CTA 26.25–30.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.3 }, { id: "build", t0: 3.3, t1: 6.9 }, { id: "proof", t0: 6.9, t1: 18.3 },
  { id: "payoff", t0: 18.3, t1: 26.25 }, { id: "cta", t0: 26.25, t1: 30 },
];
export const T = {
  // frame 0: same five option slots on both; left bare (additive start), right fully loaded (subtractive start); the loaded
  // tower glows on "keep more extras … start full"; headline until the first caption
  headline: [0, 0.42], glowFull: [1.4, 2.9],
  // build-up: the left adds two options on "builds up from basic"; the right drops one on "trims down from full"
  addL: [[3.95, 4.3], [4.3, 4.65]], trimR: [5.55, 5.95],
  // proof 1: wider view; "MORE KEPT" on "kept more options"; coins (no currency) stack up on "higher total price" ("HIGHER TOTAL")
  toW: [6.8, 7.7], keptLab: [8.76, 10.15], coinsUp: [10.29, 11.0], totalLab: [10.29, 11.6],
  // proof 2: "price levels" — both coin stacks double; "product types" — both products change shape; the gap holds ("EVERY TYPE")
  priceUp: [12.44, 12.95], morph: [13.25, 13.65], typeLab: [12.44, 13.95], coinsOut: [14.25, 14.65], unmorph: [14.35, 14.7],
  // proof 3 (limitation): the right is full again; a dim, barely interested shopper walks up and backs away on "put them off"
  refull: [14.4, 14.8], pawnIn: [14.6, 15.6], pawnOut: [17.3, 18.1], offLab: [17.3, 18.35],
  // payoff: both reset to their starts on "where a choice starts" and move to their ends on "where it ends" ("START STEERS")
  reset: [18.38, 18.75], ends: [19.56, 20.1], startLab: [18.8, 20.35],
  // takeaway: a committed shopper at the full product; on "every paid extra needs their own yes" the extras turn pending and each
  // one the shopper says yes to lights up with a check; the last one is declined ("THEIR OWN YES")
  committed: [20.73, 21.4], pending: [22.54, 22.9], yes: [22.75, 23.15, 23.55, 23.95], decline: [24.4, 24.8], yesLab: [23.0, 24.95],
  // CTA: the stage sinks; app.werbens.com logo tile pops up; wordmark on "Werbens"
  ctaClear: [26.25, 26.6], tile: [26.38, 26.74], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 10, br: 5, t0: 0.42 },
  { line: "L2", from: 0, to: 5 }, { line: "L2", from: 5, to: 10 },
  { line: "L3", from: 0, to: 3 }, { line: "L3", from: 3, to: 8, br: 5 }, { line: "L3", from: 8, to: 13 },
  { line: "L4", from: 0, to: 6, br: 3 },
  { line: "L5", from: 0, to: 7, br: 4 }, { line: "L5", from: 7, to: 12 },
  { line: "L6", from: 0, to: 8, br: 4 },
  { line: "L7", from: 0, to: 4, br: 2 }, { line: "L7", from: 4, to: 12, br: 8 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["shoppers", "extras", "start", "full", "basic", "trims", "three", "studies", "kept", "more", "options", "higher", "total", "price", "levels", "types", "barely", "off", "choice", "starts", "ends", "committed", "paid", "extra", "yes", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: T.glowFull[0], type: "shimmer", dur: 0.6, gain: 0.04, pan: 0.25 },
  ...T.addL.map(([a, b], i) => ({ t: b - 0.05, type: "clink", gain: 0.07, pan: -0.3 })), { t: T.trimR[0], type: "slide", dur: 0.4, gain: 0.07, pan: 0.35 },
  { t: T.toW[0], type: "whoosh", dur: 0.9, gain: 0.04 }, { t: T.keptLab[0] + 0.03, type: "tag", gain: 0.06 },
  ...Array.from({ length: 6 }, (_, k) => ({ t: T.coinsUp[0] + 0.05 + k * 0.07, type: "coinDrop", gain: 0.035, pan: k % 2 ? 0.3 : -0.3 })), { t: T.totalLab[0] + 0.05, type: "tag", gain: 0.05 },
  ...Array.from({ length: 6 }, (_, k) => ({ t: T.priceUp[0] + 0.05 + k * 0.05, type: "coinDrop", gain: 0.03, pan: k % 2 ? 0.3 : -0.3 })),
  { t: T.morph[0], type: "pop", gain: 0.06 }, { t: T.coinsOut[0], type: "slide", dur: 0.35, gain: 0.04 },
  { t: T.refull[0] + 0.3, type: "clink", gain: 0.06, pan: 0.35 }, ...[0, 1, 2].map((i) => ({ t: T.pawnIn[0] + 0.15 + i * 0.28, type: "tick", freq: 880, gain: 0.03, pan: 0.3 })),
  { t: T.pawnOut[0] + 0.1, type: "sink", gain: 0.05, pan: 0.3 }, { t: T.offLab[0] + 0.05, type: "tag", gain: 0.06 },
  { t: T.reset[0], type: "whoosh", dur: 0.5, gain: 0.04 }, { t: T.ends[0], type: "clink", gain: 0.06, pan: -0.3 }, { t: T.ends[0] + 0.15, type: "slide", dur: 0.35, gain: 0.06, pan: 0.3 }, { t: T.startLab[0] + 0.05, type: "tag", gain: 0.06 },
  { t: T.committed[0] + 0.3, type: "plop", gain: 0.08, pan: 0.3 }, { t: T.pending[0], type: "slide", dur: 0.3, gain: 0.04, pan: 0.3 },
  ...T.yes.map((y, i) => ({ t: y + 0.05, type: "chime", gain: 0.035, pan: 0.3 })), { t: T.decline[0], type: "slide", dur: 0.35, gain: 0.05, pan: 0.35 }, { t: T.yesLab[0] + 0.05, type: "tag", gain: 0.06 },
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
