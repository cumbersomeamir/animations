// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/34).
// Story structure (context/27 incl. §5 first-frame rule): frame 0 = two identical glasses of sparkling water, one loud, +
// "SAME DRINK. / DIFFERENT FIZZ?" · hook 0–3.3 · build-up 3.3–6.9 · proof 6.9–18.6 · payoff 18.6–26.25 · CTA 26.25–30.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.3 }, { id: "build", t0: 3.3, t1: 6.9 }, { id: "proof", t0: 6.9, t1: 18.6 },
  { id: "payoff", t0: 18.6, t1: 26.25 }, { id: "cta", t0: 26.25, t1: 30 },
];
export const T = {
  // frame 0: same water, same bubbles; the right glass's coaster and sound bars are loud; headline until the first caption
  headline: [0, 0.42],
  // build-up: "SAME WATER" on "water"; on "only the sound changes" the left glass goes quiet, the right louder
  sameLab: [3.87, 5.1], quiet: [5.5, 6.1],
  // proof 1 (lab): pull back to show the rating sliders; the right sound turned up on "turning the fizz up"; its slider moves
  // toward FIZZY on "seem more carbonated" ("SEEMS FIZZIER")
  toS: [6.9, 7.8], sliders: [7.3, 7.9], up: [8.23, 8.9], rate: [9.74, 10.6], fizzLab: [10.1, 11.4],
  // proof 2 (ear): sounds and sliders equalise; the right glass lifts toward the viewer ("closer to the ear"); its slider moves
  // up on "seemed fizzier" ("CLOSER, FIZZIER"); it returns
  equal: [11.3, 11.8], lift: [11.73, 12.6], closeRate: [13.53, 14.2], closeLab: [13.5, 14.65], back: [14.45, 15.1],
  // proof 3 (mouth): straws drop into both glasses; the right sound pumps on "sound changed nothing" but the sliders end level
  // ("NO CHANGE"); both glasses' bubbles shimmer on "touch and tingle took over"
  straws: [15.05, 15.6], pump: [15.63, 16.3], mouthRate: [16.4, 17.0], noLab: [16.0, 17.25], tingle: [17.21, 18.3],
  // payoff: straws out; on "sound sets the promise" the right slider moves ahead again ("BEFORE THE SIP"); then both glasses
  // get sound on "hear the fizz" and real fizz on "make the drink deliver it" ("THEN DELIVER")
  strawsOut: [18.55, 19.15], promise: [19.46, 20.3], sipLab: [20.28, 21.6], hear: [22.4, 22.9], deliver: [24.13, 24.85], delLab: [23.9, 25.45],
  // CTA: the stage sinks; app.werbens.com logo tile pops up; wordmark on "Werbens"
  ctaClear: [26.25, 26.6], tile: [26.38, 26.74], lockup: 27.55,
};
// piecewise-linear keyframe tracks shared by the scene (bars, coasters, sliders, bubbles) and the audio (fizz bed)
export const track = (ks, t) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; const u = (t - a) / (b - a), s = u * u * (3 - 2 * u); return va + (vb - va) * s; } return ks[ks.length - 1][1]; };
// sound level of each glass (0..1): bars, coaster glow and the fizz loudness/brightness in the mix
export const LEVEL = {
  L: [[0, 0.3], [5.5, 0.3], [6.1, 0.12], [11.3, 0.12], [11.8, 0.45], [14.6, 0.45], [15.1, 0.15], [22.4, 0.15], [22.9, 0.85], [26.25, 0.85], [26.6, 0]],
  R: [[0, 0.75], [5.5, 0.75], [6.1, 0.92], [8.23, 0.92], [8.9, 1.0], [11.3, 1.0], [11.8, 0.45], [12.0, 0.45], [12.7, 0.85], [14.6, 0.85], [15.1, 0.7], [15.63, 0.7], [16.3, 1.0], [18.55, 1.0], [19.15, 0.85], [22.4, 0.85], [22.9, 0.9], [26.25, 0.9], [26.6, 0]],
};
// real carbonation (identical in both glasses): bubble count/speed multiplier — only the payoff's "deliver" raises it
export const BUBBLES = [[0, 1], [24.13, 1], [24.85, 1.65], [26.25, 1.65], [26.6, 0]];
// perceived-fizz rating sliders (0 = flat, 1 = fizzy), direction only
export const KNOB = {
  L: [[0, 0.45], [16.4, 0.45], [17.0, 0.62], [19.0, 0.62], [19.6, 0.45], [24.13, 0.45], [24.85, 0.88]],
  R: [[0, 0.45], [9.74, 0.45], [10.6, 0.82], [11.3, 0.82], [11.8, 0.45], [13.53, 0.45], [14.2, 0.8], [16.4, 0.8], [17.0, 0.62], [19.46, 0.62], [20.3, 0.84], [24.13, 0.84], [24.85, 0.9]],
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 3, t0: 0.42 }, { line: "L1", from: 3, to: 9, br: 6 },
  { line: "L2", from: 0, to: 4, br: 2 }, { line: "L2", from: 4, to: 8 },
  { line: "L3", from: 0, to: 3 }, { line: "L3", from: 3, to: 7 }, { line: "L3", from: 7, to: 13, br: 10 },
  { line: "L4", from: 0, to: 5, br: 2 }, { line: "L4", from: 5, to: 10, br: 8 },
  { line: "L5", from: 0, to: 4 }, { line: "L5", from: 4, to: 7 }, { line: "L5", from: 7, to: 12, br: 10 },
  { line: "L6", from: 0, to: 5, br: 3 }, { line: "L6", from: 5, to: 9 },
  { line: "L7", from: 0, to: 5, br: 3 }, { line: "L7", from: 5, to: 11, br: 8 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["sound", "same", "drink", "fizzier", "water", "glasses", "lab", "fizz", "carbonated", "closer", "ear", "mouth", "nothing", "touch", "tingle", "promise", "sip", "hear", "deliver", "werbens"];

// event-linked foley (synthesised in audio.mjs); the continuous fizz bed per glass is built from LEVEL/BUBBLES in audio.mjs
export const SFX = [
  { t: T.sameLab[0] + 0.03, type: "tag", gain: 0.06 }, { t: T.quiet[0], type: "slide", dur: 0.4, gain: 0.05, pan: 0.2 },
  { t: T.toS[0], type: "whoosh", dur: 0.9, gain: 0.04 }, ...[0, 1].map((i) => ({ t: T.sliders[0] + 0.15 + i * 0.12, type: "tick", freq: 1318 + i * 330, gain: 0.04, pan: i ? 0.3 : -0.3 })),
  { t: T.up[0], type: "riser", dur: 0.6, gain: 0.06, pan: 0.3 }, { t: T.rate[0] + 0.05, type: "slide", dur: 0.6, gain: 0.06, pan: 0.3 }, { t: T.fizzLab[0] + 0.03, type: "tag", gain: 0.06 },
  { t: T.lift[0], type: "whoosh", dur: 0.8, gain: 0.04, pan: 0.3 }, { t: T.closeRate[0], type: "slide", dur: 0.5, gain: 0.06, pan: 0.3 }, { t: T.closeLab[0] + 0.03, type: "tag", gain: 0.06 },
  { t: T.back[0] + 0.45, type: "cupLand", size: 0.9, gain: 0.08, pan: 0.3 },
  ...[0, 1].map((i) => ({ t: T.straws[0] + 0.3 + i * 0.1, type: "clink", gain: 0.05, pan: i ? 0.3 : -0.3 })), { t: T.noLab[0] + 0.03, type: "tag", gain: 0.06 },
  { t: T.tingle[0], type: "shimmer", dur: 0.7, gain: 0.04 },
  { t: T.strawsOut[0], type: "slide", dur: 0.35, gain: 0.04 }, { t: T.promise[0], type: "slide", dur: 0.5, gain: 0.05, pan: 0.3 }, { t: T.sipLab[0] + 0.03, type: "tag", gain: 0.06 },
  { t: T.deliver[0], type: "riser", dur: 0.6, gain: 0.06 }, { t: T.delLab[0] + 0.03, type: "tag", gain: 0.06 },
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
