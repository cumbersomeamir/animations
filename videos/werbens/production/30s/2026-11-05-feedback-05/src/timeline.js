// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words_hi.mjs + pinned phrase spans in narration.js). Beats sit on the measured Hindi word onsets (context/20).
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.3 }, { id: "clutter", t0: 3.3, t1: 7.8 }, { id: "photo", t0: 7.8, t1: 11.3 }, { id: "price", t0: 11.3, t1: 14.3 },
  { id: "action", t0: 14.3, t1: 17.0 }, { id: "research", t0: 17.0, t1: 22.3 }, { id: "rule", t0: 22.3, t1: 25.75 }, { id: "cta", t0: 25.75, t1: 30 },
];
// clutter stickers: [text, x, y (board-local, 0 = bottom), w, h, rotation, colour key, slam time]
export const STICKERS = [
  ["शाही", -0.2, 0.98, 0.5, 0.2, -0.12, "amber", 0.05], ["लाजवाब", 0.22, 0.78, 0.56, 0.2, 0.1, "teal", 0.45], ["प्रीमियम", -0.12, 0.52, 0.62, 0.2, 0.06, "ink", 1.3],
  ["बेस्ट", 0.27, 1.08, 0.36, 0.18, 0.18, "mint", 1.85], ["स्पेशल", 0.2, 0.3, 0.46, 0.18, -0.14, "amber", 2.1], ["★★★★★", -0.22, 0.22, 0.5, 0.16, 0.08, "white", 2.25],
  ["जायकेदार", -0.18, 0.75, 0.52, 0.18, -0.2, "mint", 5.85], ["धमाकेदार", 0.18, 0.55, 0.54, 0.18, 0.15, "white", 6.05], ["!!!", 0.3, 0.98, 0.24, 0.18, -0.08, "amber", 6.2],
];
export const T = {
  // hook: stickers slam onto the ad from the first frame; "?" on "पर बिक क्या रहा है"
  q: [2.45, 7.7],
  // clutter: chip names the fictional restaurant ad; more stickers on "शब्द बहुत"; wobble on "जानकारी कम"
  chip: [3.55, 11.2], clutterWobble: 6.65,
  // photo: stickers peel off on "अब"; three numbered slots; the thali slides onto its stand; shutter → the photo panel shows it
  peel: [7.85, 8.75], slots: [8.4, 25.75], thaliIn: [9.25, 9.95], shot: 10.5,
  // price + action
  price: 12.05, priceSay: 12.72, button: 15.28, press: 15.95,
  // research: a cluttered copy slides in beside the clean ad; gaze paths (illustrative) wander vs go 1→2→3
  compareIn: [17.2, 17.95], gaze: [18.4, 21.6], brandDim: 20.3, compareOut: [22.35, 22.95],
  // rule: badges on "एक प्रोडक्ट" / "एक कीमत" / "एक काम"
  rule1: 23.66, rule2: 24.31, rule3: 25.1,
  // CTA: ad + thali slide off; app.werbens.com logo tile lands; wordmark on "वर्बेन्स"
  ctaClear: [25.75, 26.2], tile: [25.95, 26.33], lockup: 27.2,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 8, br: 3 },
  { line: "L2", from: 0, to: 5 }, { line: "L2", from: 5, to: 9 },
  { line: "L3", from: 0, to: 4 }, { line: "L3", from: 4, to: 9 },
  { line: "L4", from: 0, to: 7, br: 3 },
  { line: "L5", from: 0, to: 7, br: 4 },
  { line: "L6", from: 0, to: 4 }, { line: "L6", from: 4, to: 13, br: 7 },
  { line: "L7", from: 0, to: 9, br: 3 },
  { line: "L8", from: 0, to: 9, br: 5 },
];
export const HIGHLIGHT = ["शाही", "लाजवाब", "प्रीमियम", "फ़ोटो", "कीमत", "काम", "ऑर्डर", "ब्रांड", "प्रोडक्ट", "वर्बेन्स"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  ...STICKERS.map((s, i) => ({ t: s[7] + 0.17, type: "card", gain: i < 6 ? 0.22 : 0.18, pan: s[1] * 1.5 })),
  { t: T.q[0] + 0.05, type: "tag", gain: 0.12 }, { t: T.chip[0] + 0.1, type: "tag", gain: 0.1 }, { t: T.clutterWobble, type: "clatter", gain: 0.12 },
  { t: T.peel[0], type: "peel", dur: 0.6, gain: 0.18 }, { t: T.peel[1] - 0.2, type: "clatter", gain: 0.2 },
  { t: T.slots[0] + 0.05, type: "tick", freq: 1568, gain: 0.1 }, { t: T.thaliIn[1] - 0.05, type: "clink", gain: 0.22 }, { t: T.shot, type: "shutter", gain: 0.22 },
  { t: T.price - 0.03, type: "stamp", gain: 0.34 }, { t: T.button - 0.03, type: "pop", gain: 0.2 }, { t: T.press, type: "clack", gain: 0.24 }, { t: T.press + 0.05, type: "beep", gain: 0.08 },
  { t: T.compareIn[0], type: "slide", dur: 0.7, gain: 0.12 }, { t: T.gaze[0], type: "zip", dur: 0.5, gain: 0.08 }, { t: T.brandDim, type: "sink", gain: 0.1 },
  { t: T.compareOut[0], type: "slide", dur: 0.55, gain: 0.12 },
  { t: T.rule1 - 0.05, type: "tag", gain: 0.12 }, { t: T.rule2 - 0.05, type: "tag", gain: 0.12 }, { t: T.rule3 - 0.05, type: "tag", gain: 0.12 },
  { t: T.ctaClear[0], type: "slide", dur: 0.45, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
