// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/37).
// Story structure (context/27 incl. §5 first-frame rule): frame 0 = ice-cream stand, the better sundae (1 coin) vs a FREE scoop
// with most shoppers + "FREE BEATS / BETTER?" · hook 0–3.4 · super hook 3.4–7.4 · proof 7.4–22.2 · payoff 22.2–26.25 · CTA.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.4 }, { id: "super", t0: 3.4, t1: 7.4 }, { id: "proof", t0: 7.4, t1: 22.2 },
  { id: "payoff", t0: 22.2, t1: 26.25 }, { id: "cta", t0: 26.25, t1: 30 },
];
export const T = {
  // frame 0: the result (better sundae 1 coin, small scoop FREE, shoppers 3 / 7); headline until the first caption; the sundae
  // glows on "the better treat"
  headline: [0, 0.42], better: [2.25, 3.2],
  // super hook: rewind to before the cut — sundae 2 coins, scoop 1 coin, shoppers 7 / 3 ("ONE COIN APART"; the sundae's extra
  // coin glows); "cut both by one coin" — one coin pops off each stack; the scoop's tag flips to FREE
  rewind: [3.45, 4.3], apartLab: [4.37, 5.5], cutA: 5.83, cutB: 6.6, freeFlip: 6.95,
  // build-up: the sundae's one extra coin glows again ("SAME GAP"); the FREE chip pops on "now free"
  sameLab: [7.85, 9.1], nowFree: 9.71,
  // proof 1: shoppers hop from the sundae to the free scoop on "chose the free one" ("FREE WINS"); the sundae dims on "fewer"
  hop: [12.02, 13.0], winLab: [12.49, 13.75], fewer: [13.76, 14.6],
  // proof 2: a value halo grows around the free scoop on "seemed to add value" ("ADDS VALUE")
  value: [16.72, 17.6], valueLab: [17.07, 18.2],
  // proof 3 (limit, scene change): lateral move to a second stand — a FREE scoop and a FREE practical item (battery); many
  // shoppers hop to the scoop on "strongest for treats" ("TREATS PULL MOST"), only one to the battery on "weaker for practical"
  toB: [18.15, 19.0], treatHop: [19.64, 20.4], limLab: [19.53, 21.0], practHop: [20.81, 21.4],
  // payoff: the battery's FREE chip flips back to a coin; the scoop's FREE chip glows ("FREE FOR TREATS"); shoppers bounce on
  // "where it pulls hardest"
  repriced: [23.17, 23.6], payLab: [23.17, 24.9], hardest: 25.13,
  // CTA: the stage sinks; app.werbens.com logo tile pops up; wordmark on "Werbens"
  ctaClear: [26.25, 26.6], tile: [26.38, 26.74], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 10, br: 5, t0: 0.42 },
  { line: "L2", from: 0, to: 5 }, { line: "L2", from: 5, to: 11 },
  { line: "L3", from: 0, to: 10, br: 5 },
  { line: "L4", from: 0, to: 8, br: 2 }, { line: "L4", from: 8, to: 14 },
  { line: "L5", from: 0, to: 10, br: 5 },
  { line: "L6", from: 0, to: 6 }, { line: "L6", from: 6, to: 10 },
  { line: "L7", from: 0, to: 11, br: 7 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["free", "free.", "better", "treat?", "scoops,", "coin", "coin.", "gap", "same,", "experiments,", "more", "fewer", "add", "value.", "strongest", "treats,", "weaker", "practical", "enjoy,", "pulls", "hardest.", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: T.better[0], type: "shimmer", dur: 0.6, gain: 0.04, pan: -0.25 },
  { t: T.rewind[0], type: "whoosh", dur: 0.6, gain: 0.04 }, ...Array.from({ length: 4 }, (_, i) => ({ t: T.rewind[0] + 0.15 + i * 0.12, type: "clack", gain: 0.04, pan: -0.2 })),
  { t: T.apartLab[0] + 0.05, type: "tag", gain: 0.05 },
  { t: T.cutA, type: "coinDrop", gain: 0.06, pan: -0.25 }, { t: T.cutB, type: "coinDrop", gain: 0.06, pan: 0.25 }, { t: T.freeFlip, type: "flip", gain: 0.05, pan: 0.25 },
  { t: T.sameLab[0] + 0.05, type: "tag", gain: 0.05 }, { t: T.nowFree + 0.05, type: "chime", gain: 0.05, pan: 0.25 },
  ...Array.from({ length: 4 }, (_, i) => ({ t: T.hop[0] + 0.1 + i * 0.12, type: "plop", gain: 0.06, pan: 0.1 + i * 0.06 })), { t: T.winLab[0] + 0.05, type: "tag", gain: 0.06 },
  { t: T.fewer[0], type: "sink", gain: 0.05, pan: -0.25 },
  { t: T.value[0], type: "riser", dur: 0.6, gain: 0.06, pan: 0.25 }, { t: T.valueLab[0] + 0.05, type: "tag", gain: 0.05 },
  { t: T.toB[0], type: "whoosh", dur: 0.85, gain: 0.04 },
  ...Array.from({ length: 4 }, (_, i) => ({ t: T.treatHop[0] + 0.1 + i * 0.12, type: "plop", gain: 0.06, pan: -0.25 })), { t: T.limLab[0] + 0.05, type: "tag", gain: 0.06 },
  { t: T.practHop[0] + 0.1, type: "plop", gain: 0.05, pan: 0.25 },
  { t: T.repriced[0], type: "flip", gain: 0.05, pan: 0.25 }, { t: T.repriced[0] + 0.15, type: "coinDrop", gain: 0.05, pan: 0.25 }, { t: T.payLab[0] + 0.05, type: "chime", gain: 0.04, pan: -0.25 },
  { t: T.hardest, type: "shimmer", dur: 0.5, gain: 0.04, pan: -0.25 },
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
