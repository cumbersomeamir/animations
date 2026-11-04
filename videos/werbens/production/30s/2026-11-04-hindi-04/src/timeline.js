// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words_hi.mjs). Beats sit on the measured Hindi word onsets listed in context/19.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.7 }, { id: "before", t0: 3.7, t1: 8.6 }, { id: "pass", t0: 8.6, t1: 12.8 }, { id: "split", t0: 12.8, t1: 15.9 },
  { id: "proof", t0: 15.9, t1: 19.6 }, { id: "rules", t0: 19.6, t1: 25.35 }, { id: "cta", t0: 25.35, t1: 30 },
];
export const ADJ = ["प्रीमियम", "क्वालिटी"]; // the adjectives that do not clean anything
export const T = {
  // hook: "प्रीमियम" drops onto the fluffy sweater before the first caption; "क्वालिटी" slides in at floor level; lint puffs and settles back
  adjDrop: [[-0.45, 0.72], [1.0, 1.55]], puff: 2.62,
  // before: words slide off on "एक"; the fictional roller rolls in; chip; viewfinder + "पहले" label; shutter on "दिखाइए"
  wordsOff: [3.85, 4.5], rollerIn: [4.2, 5.2], chip: [4.0, 12.6], frame: [5.9, 25.3], before: 5.98, shot1: 7.72,
  // pass: frame pulses on "फ़्रेम" and "रोशनी"; one roller pass over the right half on "एक बार रोलर चलाइए"
  pulseFrame: 9.38, pulseLight: 10.13, rollerOn: [10.4, 10.85], pass: [10.85, 12.35], rollerOff: [12.35, 12.9],
  // split: same frame shows both halves; labels on "पहले" and "बाद"; shutter on "ख़ुद"
  divider: 12.95, labelBefore: 13.03, labelAfter: 13.71, shot2: 14.5,
  // proof: the roller lifts and turns its sticky sheet to camera; "सबूत" on the word
  lift: [15.7, 16.55], proofNote: 18.5, lower: [19.2, 19.9],
  // rules: three notes on their words; a "beauty" filter pane slides over the after-half on "फ़िल्टर" and is pulled away on "नहीं"
  rule1: 21.77, rule2: 22.56, rule3: 23.4, filterIn: [23.4, 23.75], filterOut: [23.95, 24.4],
  // CTA: props slide off; app.werbens.com logo tile lands; wordmark on "वर्बेन्स"
  ctaClear: [25.35, 25.85], tile: [25.58, 25.98], lockup: 26.15,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 8, br: 5 },
  { line: "L2", from: 0, to: 5 }, { line: "L2", from: 5, to: 12, br: 9 },
  { line: "L3", from: 0, to: 10, br: 6 },
  { line: "L4", from: 0, to: 8, br: 4 },
  { line: "L5", from: 0, to: 10, br: 7 },
  { line: "L6", from: 0, to: 5 }, { line: "L6", from: 5, to: 12, br: 9 },
  { line: "L7", from: 0, to: 9, br: 4 },
];
export const HIGHLIGHT = ["प्रीमियम", "क्वालिटी", "पहले", "फ़्रेम", "बाद", "सबूत", "एंगल", "रोशनी", "फ़िल्टर", "वर्बेन्स"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: 0.0, type: "fallAir", dur: 0.45, gain: 0.1 }, { t: T.adjDrop[0][1], type: "thud", size: 1.0, gain: 0.4 },
  { t: T.adjDrop[1][0] + 0.05, type: "slide", dur: 0.5, gain: 0.12 }, { t: T.adjDrop[1][1], type: "thud", size: 0.95, gain: 0.32 },
  { t: T.puff, type: "puff", gain: 0.18 },
  { t: T.wordsOff[0] + 0.05, type: "slide", dur: 0.5, gain: 0.12 }, { t: T.rollerIn[0], type: "roll", dur: 1.0, gain: 0.1 },
  { t: T.chip[0] + 0.12, type: "tag", gain: 0.1 }, { t: T.frame[0], type: "tick", freq: 1568, gain: 0.1 }, { t: T.before + 0.1, type: "tag", gain: 0.12 },
  { t: T.shot1 + 0.05, type: "shutter", gain: 0.22 },
  { t: T.pulseFrame + 0.05, type: "tick", freq: 1319, gain: 0.08 }, { t: T.pulseLight + 0.05, type: "tick", freq: 1568, gain: 0.08 },
  { t: T.rollerOn[1] - 0.05, type: "thud", size: 1.4, gain: 0.16 }, { t: T.pass[0], type: "roll", dur: T.pass[1] - T.pass[0], gain: 0.2 },
  { t: T.divider, type: "glow", gain: 0.1 }, { t: T.labelBefore + 0.08, type: "tag", gain: 0.12 }, { t: T.labelAfter + 0.08, type: "tag", gain: 0.12 }, { t: T.shot2, type: "shutter", gain: 0.2 },
  { t: T.lift[0], type: "whoosh", dur: 0.5, gain: 0.1 }, { t: T.proofNote + 0.05, type: "chime", gain: 0.14 },
  { t: T.rule1 + 0.08, type: "tag", gain: 0.12 }, { t: T.rule2 + 0.08, type: "tag", gain: 0.12 }, { t: T.rule3 + 0.08, type: "tag", gain: 0.12 },
  { t: T.filterIn[0] + 0.05, type: "whoosh", dur: 0.3, gain: 0.1 }, { t: T.filterOut[0], type: "flap", gain: 0.18 },
  { t: T.ctaClear[0], type: "slide", dur: 0.5, gain: 0.12 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
