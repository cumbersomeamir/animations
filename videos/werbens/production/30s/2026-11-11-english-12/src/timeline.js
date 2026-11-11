// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/28).
// Story structure (context/27): hook 0–2.3 · super hook 2.3–4.3 · build-up 4.3–12.4 · proof 12.4–21.1 · payoff 21.1–26.7 · CTA 26.7–30.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 2.3 }, { id: "superhook", t0: 2.3, t1: 4.3 }, { id: "build", t0: 4.3, t1: 12.4 }, { id: "proof", t0: 12.4, t1: 21.1 },
  { id: "payoff", t0: 21.1, t1: 26.55 }, { id: "cta", t0: 26.55, t1: 30 },
];
export const T = {
  // hook: two identical plain tubs land on frame 0; "=" between them on "Same product"; on "New perception" the right tub
  // gets a teal sleeve + mint lid, rises on a plinth and catches a spotlight while the left one stays plain
  dropL: [-0.3, 0.05], dropR: [-0.2, 0.16], eq: 0.42, eqOut: [1.16, 1.36], dress: [1.3, 1.85], lift: [1.38, 1.8], spot: [1.42, 2.0],
  // super hook: push in on the dressed tub; it pulses on "one"; a "?" on "expensive"
  one: 3.15, q: [3.55, 4.4],
  // build-up: the dressed tub slides away, the plain tub takes centre; "1960"; the sleeve on "gave a luxury brand", plinth +
  // spotlight on "luxury"; a blank name band glows on "made-up name"; the name writes on at "Häagen-Dazs"
  swap: [4.25, 4.95], y1960: [4.8, 6.55], dress2: [6.72, 7.25], lift2: [7.2, 7.62], spot2: [7.24, 7.85], band: 8.1, name: [9.3, 9.9],
  // "Then backed it with a rich recipe": lid pops on "backed"; a dense scoop rises on "rich" and settles
  lidOff: [10.9, 11.35], scoop: [11.5, 11.98],
  // proof: camera travels to two identical cups ("But can a name change the taste?"); they hop on "Coke" / "Pepsi"; "≈" on
  // "chemically nearly identical"; one cup gets the brand sleeve on "knowing one drink's brand"; on "shifted preferences" the
  // branded cup rises on a plinth into the light (the hook's "new perception" grammar; direction only, no study values)
  toCups: [12.55, 13.75], hopCoke: 14.33, hopPepsi: 14.85, approx: [15.6, 17.45], wrap: [18.55, 19.15], shift: [19.82, 20.5],
  // payoff: back to the dressed tub; an aura on "shapes expectations"; the spoon arrives "before the first bite" and takes the
  // bite on "bite"; "SIGNAL IT" on "Signal a real strength", "DELIVER IT" on "then deliver it"
  back: [20.95, 21.6], aura: [21.89, 22.6], spoonIn: [23.2, 23.88], bite: 23.92, spoonUp: [24.05, 24.5], signal: [24.58, 25.86], sheen: [24.62, 25.3],
  deliver: [25.92, 26.62], present: [25.95, 26.4],
  // CTA: stage clears; app.werbens.com logo tile lands; wordmark on "Werbens"
  ctaClear: [26.38, 26.68], tile: [26.6, 26.86], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 4, br: 2 },
  { line: "L2", from: 0, to: 6, br: 4 },
  { line: "L3", from: 0, to: 5, br: 2 }, { line: "L3", from: 5, to: 12, br: 9 }, { line: "L3", from: 12, to: 13 },
  { line: "L4", from: 0, to: 7, br: 3 },
  { line: "L5", from: 0, to: 7, br: 4 },
  { line: "L6", from: 0, to: 3 }, { line: "L6", from: 3, to: 7, br: 5 },
  { line: "L7", from: 0, to: 4 }, { line: "L7", from: 4, to: 10, br: 8 },
  { line: "L8", from: 0, to: 4, br: 3 }, { line: "L8", from: 4, to: 8 },
  { line: "L9", from: 0, to: 4 }, { line: "L9", from: 4, to: 7 },
  { line: "L10", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["perception", "expensive", "1960", "luxury", "madeup", "haagendazs", "rich", "taste", "identical", "knowing", "shifted", "expectations", "bite", "strength", "deliver", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: 0, type: "fallAir", dur: 0.26, gain: 0.05 }, { t: T.dropL[1], type: "cupLand", size: 1.0, gain: 0.32, pan: -0.25 }, { t: T.dropR[1], type: "cupLand", size: 1.0, gain: 0.32, pan: 0.25 },
  { t: T.eq + 0.02, type: "pop", gain: 0.1 }, { t: T.eqOut[0], type: "puff", gain: 0.05 },
  { t: T.dress[0], type: "zip", dur: 0.5, gain: 0.07, pan: 0.25 }, { t: T.lift[0], type: "riser", dur: 0.42, gain: 0.08, pan: 0.25 }, { t: T.spot[0] + 0.05, type: "glow", gain: 0.07, pan: 0.25 },
  { t: T.one, type: "tick", freq: 1568, gain: 0.05, pan: 0.2 }, { t: T.q[0] + 0.03, type: "tag", gain: 0.1 },
  { t: T.swap[0], type: "slide", dur: 0.65, gain: 0.1 }, { t: T.y1960[0] + 0.02, type: "card", gain: 0.12 },
  { t: T.dress2[0], type: "zip", dur: 0.5, gain: 0.07 }, { t: T.lift2[0], type: "riser", dur: 0.42, gain: 0.08 }, { t: T.spot2[0] + 0.05, type: "glow", gain: 0.07 },
  { t: T.band, type: "tick", freq: 1760, gain: 0.06 }, { t: T.name[0] + 0.02, type: "shimmer", dur: 0.6, gain: 0.05 },
  { t: T.lidOff[0], type: "pop", gain: 0.14 }, { t: T.lidOff[1], type: "settle", gain: 0.1, pan: -0.3 }, { t: T.scoop[1], type: "plop", gain: 0.2 },
  { t: T.toCups[0], type: "whoosh", dur: 1.1, gain: 0.05 }, { t: T.hopCoke, type: "thud", size: 0.8, gain: 0.16, pan: -0.15 }, { t: T.hopPepsi, type: "thud", size: 0.8, gain: 0.16, pan: 0.15 },
  { t: T.approx[0] + 0.03, type: "tag", gain: 0.08 }, { t: T.wrap[0], type: "zip", dur: 0.5, gain: 0.07, pan: 0.15 },
  { t: T.shift[0] + 0.05, type: "riser", dur: 0.5, gain: 0.08, pan: 0.15 }, { t: T.shift[0] + 0.15, type: "glow", gain: 0.06, pan: 0.15 },
  { t: T.back[0], type: "whoosh", dur: 0.85, gain: 0.05 }, { t: T.aura[0] + 0.02, type: "glow", gain: 0.07 },
  { t: T.spoonIn[0], type: "slide", dur: 0.6, gain: 0.06, pan: 0.3 }, { t: T.bite + 0.02, type: "squash", gain: 0.06 }, { t: T.spoonUp[0], type: "toss", gain: 0.04, pan: 0.2 },
  { t: T.signal[0] + 0.03, type: "tag", gain: 0.09 }, { t: T.sheen[0] + 0.05, type: "shimmer", dur: 0.55, gain: 0.04 }, { t: T.deliver[0] + 0.03, type: "tag", gain: 0.09 }, { t: T.present[0] + 0.05, type: "pop", gain: 0.08, pan: 0.15 },
  { t: T.ctaClear[0], type: "slide", dur: 0.45, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
