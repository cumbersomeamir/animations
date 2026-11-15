// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/31).
// Story structure (context/27 + first-frame rule): frame 0 = composed booth + "TRY BEATS TELL?" · hook 0–3.1 · build-up 3.1–6.4 ·
// proof 6.4–20.2 · payoff 20.2–25.9 · CTA 25.9–30.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.1 }, { id: "build", t0: 3.1, t1: 6.4 }, { id: "proof1", t0: 6.4, t1: 12.7 }, { id: "proof2", t0: 12.7, t1: 20.2 },
  { id: "payoff", t0: 20.2, t1: 25.9 }, { id: "cta", t0: 25.9, t1: 30 },
];
export const T = {
  // frame 0: lit booth, the untouched ad, one sample already lifting off the tray; headline "TRY BEATS TELL?" until the first caption
  headline: [0, 0.42], take: [[-0.6, 0.55], [1.17, 1.75], [2.5, 3.05]], sheen: [1.93, 2.6],
  // build-up: "An ad asks you to believe" → the ad's claim bubble swells, "BELIEVE?"; "a sample lets you check" → a check over a sample
  believe: [4.27, 5.0], check: [5.82, 6.55],
  // proof 1 (Smith & Swinyard 1983): two opinion/purchase pairs — TRIED and AD; opinions rise equal; TRIED's purchase matches,
  // AD's purchase stops short (direction only)
  toBars: [6.9, 7.8], opinions: [8.53, 9.0], buyTried: [10.31, 10.8], buyAd: [11.99, 12.45],
  // proof 2 (Bawa & Shoemaker 2004): new buyers arrive; effects travel across 12 month tiles; two brands vary widely
  toMonths: [12.55, 13.5], buyers: [15.29, 15.9], months: [16.53, 17.65], monthsLab: [16.9, 17.95], varies: [18.57, 19.4], variesLab: [18.81, 19.95],
  // payoff: back to the booth; the tray refills on "let people try" ("LET THEM TRY"); the ad's claim flies onto the sample and becomes a
  // check on "prove your main claim" ("PROVE THE CLAIM")
  toBooth: [20.15, 21.0], refill: [22.3, 22.85], tryLab: [22.3, 23.15], claimFly: [24.02, 24.6], proveLab: [24.02, 25.6],
  // CTA: booth parts; app.werbens.com logo tile pops up between; wordmark on "Werbens"
  ctaClear: [25.95, 26.35], tile: [26.0, 26.38], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 5, br: 3, t0: 0.42 }, { line: "L1", from: 5, to: 11, br: 8 },
  { line: "L2", from: 0, to: 6, br: 3 }, { line: "L2", from: 6, to: 11, br: 8 },
  { line: "L3", from: 0, to: 4 }, { line: "L3", from: 4, to: 9, br: 7 }, { line: "L3", from: 9, to: 14, br: 11 },
  { line: "L4", from: 0, to: 8, br: 4 }, { line: "L4", from: 8, to: 15, br: 10 },
  { line: "L5", from: 0, to: 5, br: 3 },
  { line: "L6", from: 0, to: 9, br: 6 },
  { line: "L7", from: 0, to: 7, br: 4 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["free", "sample", "perfect", "believe", "check", "1983", "trying", "better", "ads", "new", "buyers", "year", "varied", "widely", "taste", "try", "prove", "claim", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  ...T.take.map(([a, b]) => ({ t: (a + b) / 2, type: "pop", gain: 0.07, pan: 0.2 })), { t: T.sheen[0], type: "shimmer", dur: 0.55, gain: 0.04, pan: -0.2 },
  { t: T.believe[0] + 0.03, type: "tag", gain: 0.08, pan: -0.2 }, { t: T.check[0] + 0.03, type: "chime", gain: 0.06, pan: 0.2 },
  { t: T.toBars[0], type: "whoosh", dur: 0.9, gain: 0.05 }, { t: T.opinions[0], type: "riser", dur: 0.45, gain: 0.07 },
  { t: T.buyTried[0], type: "riser", dur: 0.45, gain: 0.07, pan: -0.2 }, { t: T.buyTried[1], type: "settle", gain: 0.1, pan: -0.2 }, { t: T.buyAd[0], type: "riser", dur: 0.4, gain: 0.06, pan: 0.2 }, { t: T.buyAd[1], type: "sink", gain: 0.05, pan: 0.2 },
  { t: T.toMonths[0], type: "whoosh", dur: 0.9, gain: 0.05 }, ...[0, 1, 2, 3, 4].map((i) => ({ t: T.buyers[0] + i * 0.08 + 0.1, type: "clink", gain: 0.05, pan: -0.3 + i * 0.15 })),
  ...Array.from({ length: 12 }, (_, i) => ({ t: T.months[0] + i * 0.085, type: "tick", freq: 1568 + i * 20, gain: 0.035 * (1 - i / 16), pan: -0.4 + i * 0.07 })),
  { t: T.monthsLab[0] + 0.03, type: "tag", gain: 0.07 }, { t: T.varies[0], type: "sink", gain: 0.06, pan: 0.2 }, { t: T.variesLab[0] + 0.03, type: "tag", gain: 0.07 },
  { t: T.toBooth[0], type: "whoosh", dur: 0.85, gain: 0.05 }, ...[0, 1, 2].map((i) => ({ t: T.refill[0] + i * 0.12 + 0.12, type: "plop", gain: 0.1, pan: 0.2 })), { t: T.tryLab[0] + 0.03, type: "tag", gain: 0.07 },
  { t: T.claimFly[0], type: "toss", gain: 0.05, pan: -0.2 }, { t: T.claimFly[1], type: "chime", gain: 0.06, pan: 0.2 },
  { t: T.ctaClear[0], type: "slide", dur: 0.4, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
