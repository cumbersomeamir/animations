// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/39).
// Story structure (context/27 incl. §5 first frame, §6 caption band): frame 0 = one personal music-year card branching into
// hundreds of little share paths + "THE CUSTOMER / BECAME THE CHANNEL" · hook 0–3.3 · super hook 3.3–7.1 · build 7.1–11.1 ·
// proof 11.1–21.3 · payoff 21.3–25.6 · CTA 25.6–30. Camera grammar for this episode: push-in, orbit, crane to top-down, descend.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.3 }, { id: "super", t0: 3.3, t1: 7.1 }, { id: "build", t0: 7.1, t1: 11.1 }, { id: "proof", t0: 11.1, t1: 21.3 },
  { id: "payoff", t0: 21.3, t1: 25.6 }, { id: "cta", t0: 25.6, t1: 30 },
];
export const T = {
  // frame 0: the tree of share paths is mostly grown (level 5 of 6) and keeps growing through the hook; headline until caption
  headline: [0, 0.42], grow0: [0, 2.6],
  // super hook: the paths retract into the card and the card's face empties; camera pushes in; listening discs fly into the card
  // on "turns your listening"; the avatar pops on "your story"
  retract: [3.3, 3.95], faceOut: [3.35, 3.8], discs: [5.0, 6.15], avatar: 6.19,
  // build: song bars grow on "Top songs"; artist discs pop on "top artists"; the minutes ring sweeps on "minutes played"; the share
  // arrow pops and the card turns to the viewer on "ready-to-share card"
  bars: 7.13, artists: 8.07, ring: [8.75, 9.6], arrow: 10.31, turn: [10.0, 10.87],
  // proof 1: a generic ad board slides in on "You're not posting"; it dims and sinks on "an ad"; the card's avatar glows and the
  // card lifts on "You're posting you" ("IT'S YOU")
  adIn: [11.2, 11.75], adOut: [12.12, 12.75], you: 12.86, youLab: [12.86, 14.25],
  // proof 2: friends (pawns) pop up around the card; the card turns slowly to face each of them on "how others see us"; they lean
  // in ("HOW WE LOOK")
  friends: [14.3, 14.85], spin: [15.0, 17.45], lean: [16.37, 17.6], lookLab: [16.37, 17.95],
  // proof 3: crane to top-down; copies of the card travel the share paths, 3 → 9 → 27 → 81 → 243, each carrying the brand tab, on
  // "carries the brand to that person's friends" ("BRAND TRAVELS")
  share: [18.81, 21.0], brand: 19.64, travelLab: [19.6, 21.15],
  // payoff: descend to the card; paths retract and the face empties; the story fills back on "a story about themselves"; the share
  // arrow pulses on "worth sharing" and the first paths grow again ("THEIR STORY")
  reset: [21.3, 21.85], refill: [22.98, 23.6], self: 23.59, storyLab: [23.2, 24.95], worth: 24.25, regrow: [24.3, 25.3],
  // CTA: the stage sinks; app.werbens.com logo tile pops up; wordmark on "Werbens"
  ctaClear: [26.25, 26.6], tile: [26.38, 26.74], lockup: 27.55,
};
// share-tree growth level (0 = only the card, 6 = all six levels); piecewise-linear keys, eased in scene.js
export const GROW = [[0, 5.0], [2.6, 6], [3.3, 6], [3.95, 0], [18.81, 0], [21.0, 5], [21.3, 5], [21.85, 0], [24.3, 0], [25.3, 1.6]];
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 9, br: 5, t0: 0.42 },
  { line: "L2", from: 0, to: 4, br: 2 }, { line: "L2", from: 4, to: 10, br: 7 },
  { line: "L3", from: 0, to: 6, br: 4 }, { line: "L3", from: 6, to: 10 },
  { line: "L4", from: 0, to: 5 }, { line: "L4", from: 5, to: 8 },
  { line: "L5", from: 0, to: 11, br: 5 },
  { line: "L6", from: 0, to: 9, br: 4 },
  { line: "L7", from: 0, to: 8, br: 4 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["brands", "free", "spotify", "wrapped", "story", "songs", "artists", "minutes", "readytoshare", "ad", "you", "share", "others", "card", "brand", "friends", "customers", "themselves", "sharing", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  ...[0, 1, 2].map((i) => ({ t: 0.6 + i * 0.6, type: "plink", gain: 0.03, pan: i % 2 ? 0.3 : -0.3 })),
  { t: T.retract[0], type: "whoosh", dur: 0.6, gain: 0.05 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: T.discs[0] + 0.15 + i * 0.17, type: "tick", freq: 1318 + i * 110, gain: 0.035, pan: -0.3 + i * 0.12 })),
  { t: T.avatar + 0.05, type: "chime", gain: 0.05 },
  ...Array.from({ length: 5 }, (_, i) => ({ t: T.bars + 0.05 + i * 0.08, type: "clack", gain: 0.04, pan: -0.2 + i * 0.1 })),
  ...[0, 1, 2].map((i) => ({ t: T.artists + 0.08 + i * 0.1, type: "plop", gain: 0.06, pan: -0.2 + i * 0.2 })),
  { t: T.ring[0], type: "riser", dur: 0.7, gain: 0.05 }, { t: T.arrow + 0.05, type: "pop", gain: 0.06 }, { t: T.turn[0] + 0.1, type: "slide", dur: 0.5, gain: 0.04 },
  { t: T.adIn[0], type: "slide", dur: 0.45, gain: 0.05, pan: 0.3 }, { t: T.adOut[0] + 0.05, type: "sink", gain: 0.06, pan: 0.3 },
  { t: T.you + 0.05, type: "shimmer", dur: 0.6, gain: 0.05 }, { t: T.youLab[0] + 0.1, type: "tag", gain: 0.05 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: T.friends[0] + i * 0.08, type: "plop", gain: 0.04, pan: -0.3 + i * 0.12 })),
  { t: T.spin[0], type: "slide", dur: 0.8, gain: 0.04 }, { t: T.lookLab[0] + 0.05, type: "tag", gain: 0.05 },
  ...[0, 1, 2, 3].map((i) => ({ t: T.share[0] + 0.05 + i * 0.5, type: "plink", gain: 0.04 - i * 0.005, pan: (i % 2 ? 0.25 : -0.25) })),
  { t: T.brand + 0.1, type: "chime", gain: 0.04 }, { t: T.travelLab[0] + 0.05, type: "tag", gain: 0.05 },
  { t: T.reset[0], type: "whoosh", dur: 0.6, gain: 0.04 },
  ...Array.from({ length: 4 }, (_, i) => ({ t: T.refill[0] + i * 0.12, type: "clack", gain: 0.035, pan: -0.15 + i * 0.1 })),
  { t: T.self + 0.05, type: "chime", gain: 0.05 }, { t: T.storyLab[0] + 0.05, type: "tag", gain: 0.05 }, { t: T.worth + 0.1, type: "pop", gain: 0.05 },
  ...[0, 1, 2].map((i) => ({ t: T.regrow[0] + 0.15 + i * 0.2, type: "plink", gain: 0.035, pan: -0.25 + i * 0.25 })),
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
