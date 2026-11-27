// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/41).
// Story structure (context/27 incl. §5 first frame, §6 caption band): frame 0 = a tall cooler of name-labelled bottles with a
// search light darting across the names + "FIND YOUR / NAME?" · hook 0–2.95 · super hook 2.95–6.3 · build 6.3–9.9 · proof
// 9.9–20.9 · payoff 20.9–26.2 · CTA 26.2–30. Camera grammar for this episode: the eye's search — darting light, push to the
// labels, diagonal pull-back along a wall of coolers, shelf-by-shelf scan, a name stream in front of the lens, a pull-out of the
// found bottle, a two-shot hand-over.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 2.95 }, { id: "super", t0: 2.95, t1: 6.3 }, { id: "build", t0: 6.3, t1: 9.9 }, { id: "proof", t0: 9.9, t1: 20.9 },
  { id: "payoff", t0: 20.9, t1: 26.2 }, { id: "cta", t0: 26.2, t1: 30 },
];
export const T = {
  // frame 0: names already on every bottle; a search light darts from name to name through the hook ("search the cooler")
  headline: [0, 0.42], scanHook: [0.0, 2.7],
  // super hook: push in to the shelves; labels spin to a plain logo on "Share a Coke", then spin back to names in a wave on
  // "swapped the logo for popular first names"
  toLogo: [2.95, 3.4], swap: [3.75, 5.5],
  // build: diagonal pull-back; five more coolers rise beside it on "150" — 6 × 25 = 150 bottles (150 NAMES)
  pullWall: [6.1, 7.6], coolers: [8.17, 8.95], lab150: [8.17, 9.75],
  // proof 1: back to the first cooler; a shopper (SAM) in front; the search light zigzags shelf by shelf (THE SEARCH)
  search: [10.0, 12.95], searchLab: [11.4, 12.95],
  // proof 2: a stream of name cards rushes past in front of the cooler; SAM's card stops and pops on "grabs attention"; the others
  // keep slipping by (YOUR NAME POPS); then the SAM bottle glows and slides out of the cooler (found)
  stream: [13.4, 17.5], samPop: 15.3, popLab: [15.3, 17.55], foundSam: [17.25, 17.85],
  // proof 3: a friend's name (MIA) glows on "friend's name", slides out on "and it", a ribbon and bow wrap it on "gift" (A GIFT)
  friend: 18.55, pullMia: [19.4, 19.95], gift: 20.2, giftLab: [19.9, 21.3],
  // payoff: two-shot; a find ring pulses round SAM's bottle on "find"; the gift arcs over to the friend on "someone to give it to"
  // (FIND + GIVE)
  payCam: [20.9, 22.0], findMark: 22.3, handOver: [23.13, 23.95], giveLab: [21.6, 25.0],
  // CTA: the stage sinks; app.werbens.com logo tile pops up; wordmark on "Werbens"
  ctaClear: [26.25, 26.6], tile: [26.38, 26.74], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 9, br: 5, t0: 0.42 },
  { line: "L2", from: 0, to: 10, br: 5 },
  { line: "L3", from: 0, to: 6, br: 4 },
  { line: "L4", from: 0, to: 6, br: 3 }, { line: "L4", from: 6, to: 10 },
  { line: "L5", from: 0, to: 5, br: 2 }, { line: "L5", from: 5, to: 11, br: 7 },
  { line: "L6", from: 0, to: 9, br: 4 },
  { line: "L7", from: 0, to: 5, br: 2 }, { line: "L7", from: 5, to: 11, br: 8 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["search", "cooler", "bottle", "share", "coke", "logo", "names", "australia", "150", "name", "attention", "friends", "gift", "find", "give", "werbens", "brands"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  ...[0, 1, 2, 3].map((i) => ({ t: T.scanHook[0] + 0.12 + i * 0.55, type: "tick", freq: 1568 + i * 131, gain: 0.03, pan: -0.3 + i * 0.2 })),
  { t: T.toLogo[0] + 0.05, type: "flip", gain: 0.045 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: T.swap[0] + 0.08 + i * 0.27, type: "card", gain: 0.05, pan: -0.3 + i * 0.12 })),
  { t: T.pullWall[0], type: "whoosh", dur: 0.9, gain: 0.05 },
  ...Array.from({ length: 5 }, (_, i) => ({ t: T.coolers[0] + 0.12 + i * 0.12, type: "thud", size: 1.3, gain: 0.04, pan: -0.4 + i * 0.2 })), { t: T.lab150[0] + 0.1, type: "tag", gain: 0.05 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: T.search[0] + 0.25 + i * 0.45, type: "tick", freq: 1175 + (i % 3) * 147, gain: 0.03, pan: (i % 2 ? 0.25 : -0.25) })), { t: T.searchLab[0] + 0.05, type: "tag", gain: 0.045 },
  { t: T.stream[0], type: "whoosh", dur: 0.7, gain: 0.04 }, { t: T.samPop + 0.02, type: "pop", gain: 0.06 }, { t: T.samPop + 0.12, type: "chime", gain: 0.045 }, { t: T.popLab[0] + 0.25, type: "tag", gain: 0.04 },
  { t: 16.45, type: "whoosh", dur: 0.6, gain: 0.03 }, { t: T.foundSam[0] + 0.05, type: "slide", dur: 0.45, gain: 0.05 }, { t: T.foundSam[0] + 0.05, type: "glow", gain: 0.04 },
  { t: T.friend + 0.05, type: "plink", gain: 0.045 }, { t: T.pullMia[0] + 0.03, type: "slide", dur: 0.45, gain: 0.05 }, { t: T.gift - 0.05, type: "zip", dur: 0.3, gain: 0.045 }, { t: T.gift + 0.25, type: "chime", gain: 0.045 },
  { t: T.giftLab[0] + 0.05, type: "tag", gain: 0.04 },
  { t: T.payCam[0], type: "whoosh", dur: 0.8, gain: 0.04 }, { t: T.findMark + 0.02, type: "tick", freq: 1760, gain: 0.04 }, { t: T.giveLab[0] + 0.1, type: "tag", gain: 0.045 },
  { t: T.handOver[0] + 0.05, type: "toss", gain: 0.05 }, { t: T.handOver[1] - 0.05, type: "plop", gain: 0.05 },
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
