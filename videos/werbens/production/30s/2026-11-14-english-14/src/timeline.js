// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/30).
// Story structure (context/27): hook 0–3.6 · super hook 3.6–6.1 · build-up + proof 6.1–19.9 · payoff 19.9–26.3 · CTA 26.3–30.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.6 }, { id: "superhook", t0: 3.6, t1: 6.1 }, { id: "reveal", t0: 6.1, t1: 11.5 }, { id: "proof", t0: 11.5, t1: 19.9 },
  { id: "payoff", t0: 19.9, t1: 26.3 }, { id: "cta", t0: 26.3, t1: 30 },
];
export const T = {
  // hook: the two bottles (215 g, 540 g; same brand, same shop) land on frame 0; pack-price tags rise on columns on "£2.30" / "£2.80"
  dropS: [-0.28, 0.06], dropL: [-0.16, 0.18], tagS: 0.33, tagL: 1.17, ask: [1.95, 3.4],
  // super hook: caps glint on "Same brand"; on "switch the unit" both tags flip to their per-100 g faces and the columns re-scale
  same: 3.78, flip: [5.08, 5.62], rescale: [5.3, 6.0],
  // reveal: each per-100 g price pulses as it is read; "ABOUT 2×" on "About double"
  read107: 7.74, read52: 9.34, double: [10.63, 11.55],
  // proof 1: lateral move to a price card; the number grows while the unit fades on "focus on the number, not the unit"
  toCard: [11.35, 12.15], numUp: [12.84, 13.5], unitDim: [13.95, 14.5], cardOut: [14.7, 15.05],
  // proof 2: two snack bars with energy gauges in kcal; on "kilojoules" the gauges re-scale ×4.184 (gap widens); on "raised
  // healthy snack choices" the healthy bar rises on a plinth into the light
  snacks: [14.75, 15.3], kj: [16.03, 16.75], chosen: [17.95, 18.6],
  // payoff: back to the bottles; "SAME UNIT" on "same unit"; on "Sellers" the tags become clear shelf labels (pack price + unit price)
  toBottles: [19.6, 20.5], sameUnit: [22.15, 23.05], shelf: [23.25, 23.85],
  // CTA: stage clears; app.werbens.com logo tile lands; wordmark on "Werbens"
  ctaClear: [26.0, 26.3], tile: [26.17, 26.47], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 3 }, { line: "L1", from: 3, to: 9, br: 5 },
  { line: "L2", from: 0, to: 2 }, { line: "L2", from: 2, to: 6 },
  { line: "L3", from: 0, to: 3 }, { line: "L3", from: 3, to: 6 }, { line: "L3", from: 6, to: 8 },
  { line: "L4", from: 0, to: 10, br: 5 },
  { line: "L5", from: 0, to: 6, br: 4 }, { line: "L5", from: 6, to: 10 },
  { line: "L6", from: 0, to: 8, br: 4 },
  { line: "L7", from: 0, to: 8, br: 5 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["230", "280", "buy", "brand", "unit", "107p", "52p", "double", "number", "kilojoules", "calories", "healthy", "same", "clearly", "one", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: 0, type: "fallAir", dur: 0.24, gain: 0.05 }, { t: T.dropS[1], type: "thud", size: 0.9, gain: 0.26, pan: -0.25 }, { t: T.dropL[1], type: "thud", size: 1.2, gain: 0.3, pan: 0.25 },
  { t: T.tagS + 0.05, type: "riser", dur: 0.35, gain: 0.06, pan: -0.25 }, { t: T.tagS + 0.35, type: "card", gain: 0.12, pan: -0.25 },
  { t: T.tagL + 0.05, type: "riser", dur: 0.35, gain: 0.06, pan: 0.25 }, { t: T.tagL + 0.35, type: "card", gain: 0.12, pan: 0.25 },
  { t: T.same + 0.03, type: "tick", freq: 1568, gain: 0.06 }, { t: T.flip[0], type: "flip", gain: 0.1, pan: -0.2 }, { t: T.flip[0] + 0.08, type: "flip", gain: 0.1, pan: 0.2 },
  { t: T.rescale[0], type: "riser", dur: 0.6, gain: 0.07, pan: -0.25 }, { t: T.rescale[0] + 0.05, type: "sink", gain: 0.06, pan: 0.25 },
  { t: T.read107 + 0.03, type: "tick", freq: 1760, gain: 0.06, pan: -0.25 }, { t: T.read52 + 0.03, type: "tick", freq: 1319, gain: 0.06, pan: 0.25 }, { t: T.double[0] + 0.03, type: "tag", gain: 0.09 },
  { t: T.toCard[0], type: "whoosh", dur: 0.8, gain: 0.05 }, { t: T.numUp[0], type: "riser", dur: 0.6, gain: 0.07 }, { t: T.unitDim[0], type: "sink", gain: 0.06 },
  { t: T.cardOut[0], type: "slide", dur: 0.35, gain: 0.07 }, { t: T.snacks[0] + 0.15, type: "thud", size: 0.7, gain: 0.16, pan: -0.15 }, { t: T.snacks[0] + 0.25, type: "thud", size: 0.7, gain: 0.16, pan: 0.15 },
  { t: T.kj[0], type: "riser", dur: 0.7, gain: 0.08 }, { t: T.chosen[0], type: "riser", dur: 0.5, gain: 0.07, pan: -0.15 }, { t: T.chosen[0] + 0.15, type: "glow", gain: 0.07, pan: -0.15 },
  { t: T.toBottles[0], type: "whoosh", dur: 0.9, gain: 0.05 }, { t: T.sameUnit[0] + 0.03, type: "tag", gain: 0.08 }, { t: T.shelf[0], type: "flip", gain: 0.1 }, { t: T.shelf[0] + 0.1, type: "flip", gain: 0.1 },
  { t: T.ctaClear[0], type: "slide", dur: 0.4, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
