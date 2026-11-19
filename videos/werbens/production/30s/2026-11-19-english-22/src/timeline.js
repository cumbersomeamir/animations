// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/38).
// Story structure (context/27 incl. §5 first-frame rule): frame 0 = a basket with an empty glowing gap pulling in one more
// product + "THE FREE / SHIPPING TRAP" · hook 0–3.3 · super hook 3.3–7.5 · build-up 7.5–11.4 · proof 11.4–21.7 · payoff · CTA.
// Illustrative amounts (made up, no currency): basket 40, shipping 6, free from 50; 40 + 6 = 46; 40 + 10 = 50; 50 − 46 = 4.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.3 }, { id: "super", t0: 3.3, t1: 7.5 }, { id: "build", t0: 7.5, t1: 11.4 }, { id: "proof", t0: 11.4, t1: 21.7 },
  { id: "payoff", t0: 21.7, t1: 26.25 }, { id: "cta", t0: 26.25, t1: 30 },
];
export const T = {
  // frame 0: the item hovers by the glowing gap, tugged in; it edges closer on "add one more thing"; headline until the caption
  headline: [0, 0.42], tug: [2.07, 2.7],
  // super hook: the item drifts back out; "40" tile on "40"; the shipping parcel "+6" slides in on "Shipping costs 6"; the meter's
  // "50" flag lights on "free from 50" and the empty part of the meter (the 10 gap) glows
  back: [3.3, 3.9], t40: 4.27, parcel: [4.85, 5.5], flag: [6.24, 6.9],
  // build-up: "Pay 46 as it is" — the parcel hooks onto the basket, total flips 40 → 46; "or add a 10 item" — the item drops into
  // the gap (its "10" tag shows), the parcel unhooks; "and pay 50" — total flips to 50, the meter fills to the flag, the parcel's
  // tag flips to FREE
  t46: 7.97, addItem: [9.53, 10.05], unhook: [9.7, 10.2], t50: 10.73, fill: [9.85, 10.6], freeTag: 10.9,
  // proof (math): lateral move to two receipt towers built from the same blocks — 40 + 6 = 46 vs 40 + 10 = 50; the 4 difference
  // glows on "Four more"; the item block glows and the fee block dims on "an item instead of a fee" ("ITEM, NOT FEE")
  toB: [11.25, 12.0], build: [11.4, 12.2], four: [11.63, 12.5], swap: [13.09, 13.9], itemLab: [13.0, 14.4],
  // proof (study): lateral move to a retailer counter (orders, fees, profit stacks); extra order baskets stack up on "drove extra
  // sales" ("EXTRA SALES")
  toC: [14.3, 15.1], orders: [17.09, 18.2], salesLab: [17.09, 18.7],
  // proof (limit): the fee parcels pop away on "lost shipping revenue"; the profit coin stack sinks on "unprofitable" ("LOST FEES")
  lose: [19.37, 20.1], sink: [20.72, 21.5], loseLab: [19.2, 21.75],
  // payoff: lateral move to a final basket; an unwanted extra drifts toward the gap and back out on "only what you'd buy anyway";
  // the wanted item gets a check ("ONLY IF WANTED"); the seller's margin stack gets a check on "check the margin"
  toD: [21.8, 22.6], tempt: [22.51, 23.75], keep: 23.42, payLab: [22.66, 24.15], margin: [24.89, 25.5],
  // CTA: the stage sinks; app.werbens.com logo tile pops up; wordmark on "Werbens"
  ctaClear: [26.25, 26.6], tile: [26.38, 26.74], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 10, br: 5, t0: 0.42 },
  { line: "L2", from: 0, to: 4 }, { line: "L2", from: 4, to: 12, br: 7 },
  { line: "L3", from: 0, to: 5 }, { line: "L3", from: 5, to: 13, br: 10 },
  { line: "L4", from: 0, to: 11, br: 5 },
  { line: "L5", from: 0, to: 9, br: 4 },
  { line: "L6", from: 0, to: 8, br: 4 },
  { line: "L7", from: 0, to: 7 }, { line: "L7", from: 7, to: 11 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["free", "shipping", "add", "40.", "6", "50.", "46", "10", "item", "four", "fee.", "retailer's", "threshold", "extra", "sales.", "lost", "revenue", "unprofitable", "anyway.", "margin.", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: T.tug[0], type: "shimmer", dur: 0.5, gain: 0.04, pan: 0.2 },
  { t: T.back[0], type: "slide", dur: 0.4, gain: 0.04, pan: 0.2 }, { t: T.t40 + 0.05, type: "flip", gain: 0.05 },
  { t: T.parcel[0], type: "slide", dur: 0.45, gain: 0.06, pan: -0.25 }, { t: T.parcel[1] - 0.05, type: "thud", size: 0.8, gain: 0.08, pan: -0.25 },
  { t: T.flag[0], type: "chime", gain: 0.04, pan: 0.3 },
  { t: T.t46, type: "flip", gain: 0.05 }, { t: T.addItem[1] - 0.05, type: "plop", gain: 0.09, pan: 0.15 }, { t: T.unhook[0] + 0.05, type: "slide", dur: 0.35, gain: 0.04, pan: -0.25 },
  { t: T.fill[0], type: "riser", dur: 0.6, gain: 0.05, pan: 0.3 }, { t: T.t50, type: "flip", gain: 0.05 }, { t: T.freeTag, type: "flip", gain: 0.05, pan: -0.25 },
  { t: T.toB[0], type: "whoosh", dur: 0.8, gain: 0.04 }, ...[0, 1, 2, 3].map((i) => ({ t: T.build[0] + 0.1 + i * 0.16, type: "clack", gain: 0.045, pan: i % 2 ? 0.25 : -0.25 })),
  { t: T.four[0] + 0.15, type: "chime", gain: 0.04, pan: 0.25 }, { t: T.itemLab[0] + 0.05, type: "tag", gain: 0.05 },
  { t: T.toC[0], type: "whoosh", dur: 0.8, gain: 0.04 }, ...Array.from({ length: 4 }, (_, i) => ({ t: T.orders[0] + 0.08 + i * 0.22, type: "plop", gain: 0.06, pan: -0.25 })), { t: T.salesLab[0] + 0.05, type: "tag", gain: 0.05 },
  ...Array.from({ length: 4 }, (_, i) => ({ t: T.lose[0] + i * 0.15, type: "pop", gain: 0.05, pan: 0.05 })), { t: T.sink[0], type: "sink", gain: 0.06, pan: 0.25 }, { t: T.loseLab[0] + 0.05, type: "tag", gain: 0.05 },
  { t: T.toD[0], type: "whoosh", dur: 0.8, gain: 0.04 }, { t: T.tempt[0] + 0.1, type: "slide", dur: 0.5, gain: 0.04, pan: 0.25 }, { t: T.keep + 0.1, type: "chime", gain: 0.04 }, { t: T.payLab[0] + 0.05, type: "tag", gain: 0.05 },
  { t: T.margin[0] + 0.1, type: "chime", gain: 0.04, pan: 0.25 },
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
