// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/22).
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.3 }, { id: "snacks", t0: 3.3, t1: 7.1 }, { id: "premium", t0: 7.1, t1: 11.5 }, { id: "anchor", t0: 11.5, t1: 14.6 },
  { id: "study", t0: 14.6, t1: 21.3 }, { id: "lesson", t0: 21.3, t1: 25.75 }, { id: "cta", t0: 25.75, t1: 30 },
];
// menu rows on the fictional café board: [id, name, price, board-local y, slam time]
export const ROWS = [["premium", "Chef's platter", "₹1,200", 1.03, 7.69], ["sandwich", "Club sandwich", "₹320", 0.78, 3.6], ["muffin", "Muffin", "₹150", 0.53, 3.88], ["brownie", "Brownie", "₹150", 0.29, 4.25]];
export const T = {
  // hook: the sandwich halves are already falling on frame 0; a ₹320 price flag spears in on "320-rupee"; "?" on "expensive"
  sw: [[-0.12, 0.2], [0.0, 0.32]], flag: 0.56, q: [2.42, 3.3],
  // snacks: pull back to the menu board; the sandwich row pops in, then the snack rows slam on "150-rupee snacks"; gauge → PRICEY
  reveal: [2.95, 4.0], gauge: 5.75, pricey: 6.3, illus: [5.8, 11.55],
  // premium: the ₹1,200 platter row slams in directly above the sandwich; the sandwich row pulses on "above"; gauge → FAIR
  above: 9.5, fair: 10.8,
  // anchor: an anchor drops onto the premium row on "anchoring"; the high price glows; a reference line to ₹320 on "sets the reference"
  anchor: [11.91, 12.15], high: 12.84, ref: [13.45, 13.95], refOut: 18.4,
  // study: source note; the premium row glows on "extreme price"; would-pay arrows rise on the moderate rows on "raised"
  cite: [15.05, 21.3], extreme: 16.9, arrows: [18.6, 19.15], items: 20.48,
  // lesson: the gauge sinks; the real platter slides onto its stand on "real", hops on "premium", moves next to the sandwich on
  // "next to it"; a fake "WAS ₹500" sticker slaps on on "fake", an X stamps it on "was", it falls away on "price"
  gaugeOut: [21.3, 21.7], platterIn: [22.25, 22.6], premiumHop: 22.55, nextTo: [23.3, 23.75], fake: 24.48, xStamp: 24.78, fakeOut: [25.05, 25.65],
  // CTA: board + props slide off; app.werbens.com logo tile lands; wordmark on "Werbens"
  ctaClear: [25.75, 26.2], tile: [25.9, 26.28], lockup: 26.75,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 5, br: 3 },
  { line: "L2", from: 0, to: 3 }, { line: "L2", from: 3, to: 7 },
  { line: "L3", from: 0, to: 6, br: 3 }, { line: "L3", from: 6, to: 11 },
  { line: "L4", from: 0, to: 2 }, { line: "L4", from: 2, to: 8, br: 5 },
  { line: "L5", from: 0, to: 4 }, { line: "L5", from: 4, to: 10, br: 7 }, { line: "L5", from: 10, to: 17, br: 13 },
  { line: "L6", from: 0, to: 9, br: 5 }, { line: "L6", from: 9, to: 15, br: 12 },
  { line: "L7", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["320rupee", "expensive", "150rupee", "pricey", "1200rupee", "fair", "anchoring", "reference", "2006", "extreme", "raised", "real", "premium", "fake", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: T.sw[0][1], type: "thud", size: 0.75, gain: 0.26, pan: -0.25 }, { t: T.sw[1][1], type: "thud", size: 0.7, gain: 0.24, pan: -0.15 },
  { t: T.flag + 0.16, type: "clack", gain: 0.16 }, { t: T.flag + 0.18, type: "tag", gain: 0.1 }, { t: T.q[0] + 0.05, type: "tag", gain: 0.12 },
  { t: T.reveal[0], type: "whoosh", dur: 0.7, gain: 0.07 },
  ...ROWS.filter((r) => r[4] > 0).map((r) => ({ t: r[4] + 0.17, type: r[0] === "premium" ? "stamp" : "card", gain: r[0] === "premium" ? 0.3 : 0.2, pan: 0.05 })),
  { t: T.gauge, type: "pop", gain: 0.16, pan: 0.25 }, { t: T.pricey - 0.02, type: "zip", dur: 0.28, gain: 0.07, pan: 0.25 }, { t: T.pricey + 0.25, type: "tick", freq: 1318, gain: 0.08, pan: 0.25 },
  { t: T.above + 0.02, type: "tag", gain: 0.08 }, { t: T.fair - 0.02, type: "zip", dur: 0.28, gain: 0.07, pan: 0.25 }, { t: T.fair + 0.25, type: "tick", freq: 1760, gain: 0.08, pan: 0.25 },
  { t: T.anchor[0] - 0.05, type: "fallAir", dur: 0.3, gain: 0.1, pan: -0.3 }, { t: T.anchor[1], type: "clank", gain: 0.24, pan: -0.3 },
  { t: T.high + 0.02, type: "glow", gain: 0.08 }, { t: T.ref[0], type: "zip", dur: 0.5, gain: 0.08 },
  { t: T.cite[0] + 0.05, type: "tag", gain: 0.1 }, { t: T.extreme + 0.03, type: "glow", gain: 0.08 }, { t: T.arrows[0], type: "riser", dur: 0.6, gain: 0.08 }, { t: T.items + 0.05, type: "tick", freq: 1568, gain: 0.08 },
  { t: T.gaugeOut[0], type: "sink", gain: 0.1, pan: 0.25 }, { t: T.platterIn[0], type: "slide", dur: 0.4, gain: 0.12, pan: 0.3 }, { t: T.platterIn[1], type: "settle", gain: 0.2, pan: 0.2 },
  { t: T.nextTo[0], type: "slide", dur: 0.4, gain: 0.1 },
  { t: T.fake + 0.17, type: "card", gain: 0.2, pan: 0.2 }, { t: T.xStamp + 0.12, type: "stamp", gain: 0.3, pan: 0.2 }, { t: T.fakeOut[0] + 0.05, type: "peel", dur: 0.5, gain: 0.12, pan: 0.3 },
  { t: T.ctaClear[0], type: "slide", dur: 0.45, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
