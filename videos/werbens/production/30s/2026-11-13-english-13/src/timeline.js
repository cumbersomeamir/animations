// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/29).
// Story structure (context/27): hook 0–3.0 · super hook 3.0–5.0 · build-up (IKEA) 5.0–8.2 · proof 8.2–18.4 · payoff 18.4–26.2 · CTA 26.2–30.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.0 }, { id: "superhook", t0: 3.0, t1: 5.0 }, { id: "build", t0: 5.0, t1: 8.2 }, { id: "proof", t0: 8.2, t1: 18.4 },
  { id: "payoff", t0: 18.4, t1: 26.2 }, { id: "cta", t0: 26.2, t1: 30 },
];
export const T = {
  // hook: two identical boxes land on frame 0; "=" on "Identical"; bid coins stack up on "Why pay more for one?" (taller on the left)
  dropL: [-0.28, 0.06], dropR: [-0.16, 0.18], eq: 0.4, eqOut: [1.62, 1.8], coinsR0: 1.9, coinsL0: 2.12, coinsOut: 2.98,
  // super hook: push in on the left box; on "you built it" it unfolds flat and folds back up while a hex key turns
  replay: [4.12, 4.95], key1: [3.9, 5.2],
  // build-up: IKEA set — a flat pack lands on "IKEA's"; "WE" on "we do our part"; "YOU" on "you do yours": the pack opens into a
  // flat net that folds up into a box
  toIkea: [4.95, 5.6], pack: [5.2, 5.5], we: [6.34, 7.0], you: [7.04, 7.95], open: [7.06, 7.4], fold: [7.3, 7.95],
  // proof: back to the two-box set; coins sink and the left box lies flat; it folds up on "assembled an IKEA box"; tall bid stack
  // on "bid more"; the identical ready-made box is handed in on "handed"; its shorter stack rises
  back: [8.1, 9.2], reset: [8.4, 9.0], build: [10.3, 11.65], key2: [10.1, 11.9], coinsL1: 11.83, hand: [12.95, 13.45], coinsR1: 13.5,
  // twist: two sides drop on "couldn't finish"; the rest fold flat on "took it apart"; the extra coins vanish on "vanished"
  unfinish: [15.62, 16.05], apart: [16.5, 16.95], vanish: 17.64,
  // payoff: the box folds back up on "Effort adds value", the last side snaps in on "success" (check, glow, coins back);
  // the front side drops and is the "real step" (label), snaps up on "finish"; "NOT BUSYWORK"
  refold: [19.6, 20.5], success: 21.22, step: [22.35, 22.75], real: [23.56, 24.95], finish: [24.48, 24.78], busy: [25.1, 26.15],
  // CTA: stage clears; app.werbens.com logo tile lands; wordmark on "Werbens"
  ctaClear: [26.42, 26.68], tile: [26.62, 26.88], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2)
export const CAPTIONS = [
  { line: "L1", from: 0, to: 2 }, { line: "L1", from: 2, to: 7 },
  { line: "L2", from: 0, to: 5, br: 2 },
  { line: "L3", from: 0, to: 2 }, { line: "L3", from: 2, to: 9, br: 6 },
  { line: "L4", from: 0, to: 4 }, { line: "L4", from: 4, to: 10, br: 7 }, { line: "L4", from: 10, to: 17, br: 14 },
  { line: "L5", from: 0, to: 9, br: 5 }, { line: "L5", from: 9, to: 12 },
  { line: "L6", from: 0, to: 8, br: 3 },
  { line: "L7", from: 0, to: 9, br: 4 }, { line: "L7", from: 9, to: 11 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["identical", "more", "built", "we", "yours", "2012", "assembled", "bid", "readymade", "finish", "apart", "vanished", "effort", "value", "success", "real", "step", "busywork", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  { t: 0, type: "fallAir", dur: 0.24, gain: 0.05 }, { t: T.dropL[1], type: "thud", size: 1.1, gain: 0.3, pan: -0.25 }, { t: T.dropR[1], type: "thud", size: 1.1, gain: 0.3, pan: 0.25 },
  { t: T.eq + 0.02, type: "pop", gain: 0.1 }, { t: T.eqOut[0], type: "puff", gain: 0.04 }, { t: T.coinsOut, type: "sink", gain: 0.06 },
  ...[0, 1, 2].map((i) => ({ t: T.coinsR0 + i * 0.09 + 0.08, type: "clink", gain: 0.06, pan: 0.25 })), ...[0, 1, 2, 3, 4].map((i) => ({ t: T.coinsL0 + i * 0.09 + 0.08, type: "clink", gain: 0.06, pan: -0.25 })),
  { t: T.replay[0], type: "flap", gain: 0.12, pan: -0.2 }, { t: T.replay[1] - 0.05, type: "snap", gain: 0.1, pan: -0.2 }, { t: T.key1[0] + 0.1, type: "zip", dur: 0.6, gain: 0.04, pan: -0.2 },
  { t: T.toIkea[0], type: "whoosh", dur: 0.6, gain: 0.05 }, { t: T.pack[1], type: "thud", size: 0.9, gain: 0.22 }, { t: T.we[0] + 0.03, type: "tag", gain: 0.08 },
  { t: T.you[0] + 0.03, type: "tag", gain: 0.08 }, { t: T.open[0], type: "peel", dur: 0.3, gain: 0.06 }, { t: T.fold[1] - 0.04, type: "snap", gain: 0.1 },
  { t: T.back[0], type: "whoosh", dur: 0.9, gain: 0.05 }, { t: T.reset[0] + 0.25, type: "flap", gain: 0.08, pan: -0.2 },
  ...[0, 1, 2, 3].map((i) => ({ t: T.build[0] + 0.12 + i * 0.32, type: "snap", gain: 0.08, pan: -0.2 })), { t: T.key2[0] + 0.1, type: "zip", dur: 0.8, gain: 0.04, pan: -0.2 },
  ...[0, 1, 2, 3, 4].map((i) => ({ t: T.coinsL1 + i * 0.08 + 0.08, type: "clink", gain: 0.06, pan: -0.25 })),
  { t: T.hand[0], type: "slide", dur: 0.5, gain: 0.08, pan: 0.25 }, ...[0, 1, 2].map((i) => ({ t: T.coinsR1 + i * 0.08 + 0.08, type: "clink", gain: 0.06, pan: 0.25 })),
  { t: T.unfinish[0], type: "flap", gain: 0.1, pan: -0.2 }, { t: T.apart[0], type: "flap", gain: 0.1, pan: -0.2 }, { t: T.vanish + 0.02, type: "puff", gain: 0.07, pan: -0.2 },
  ...[0, 1, 2, 3].map((i) => ({ t: T.refold[0] + 0.1 + i * 0.22, type: "snap", gain: 0.07, pan: -0.15 })), { t: T.success, type: "chime", gain: 0.06 },
  ...[0, 1].map((i) => ({ t: T.success + 0.08 + i * 0.08 + 0.08, type: "clink", gain: 0.06, pan: -0.2 })),
  { t: T.step[0], type: "flap", gain: 0.06 }, { t: T.real[0] + 0.03, type: "tag", gain: 0.08 }, { t: T.finish[1] - 0.03, type: "snap", gain: 0.12 }, { t: T.busy[0] + 0.03, type: "tag", gain: 0.08 },
  { t: T.ctaClear[0], type: "slide", dur: 0.4, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
