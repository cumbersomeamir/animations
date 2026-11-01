// Shared action timeline (seconds). Visual code reads T.*; audio.mjs builds SFX from CUES,
// so every sound is generated from the same number that drives the motion it accompanies.
export const T = {
  // S1 hook: invitation slams, bursts into a thousand details
  cardImpact: 0.28,
  burst: 0.98,
  coupleLand: 1.58,
  stackCatch: 1.92,
  // S2 tangle: cause -> effect chain
  threadsIn: 2.5,
  pencilGrab: 2.86,
  scribble: 3.22,
  write180: 3.6,
  venuePull: 4.45,
  venueStamp: 4.62,
  catererPull: 5.08,
  budgetPull: 5.72,
  wrap: 6.25,
  pencilDrop: 6.7,
  stackDrop: 6.32,
  bIdea: 8.35,
  // S3 one home
  phoneOut: 9.05,
  phoneLand: 9.5,
  vacuum: 9.62,
  freed: 11.0,
  tiles: 11.16,
  diveJump: 12.08,
  zoomIn: 12.15,
  s4: 12.5,
  // S4 inside the planner
  land: 12.78,
  cardsIn: 12.55,
  swipe1: 13.05,
  swipe2: 13.45,
  heartJump: 13.84,
  heartTap: 14.0,
  saved: 14.5,
  stampJump: 14.84,
  stamp: 15.0,
  pan1: 15.6,
  unroll: 15.95,
  tick1: 16.45,
  tick2: 16.85,
  tick3: 17.25,
  lens: 17.65,
  thumbs: 18.7,
  pan2: 19.0,
  fold: 19.95,
  throwT: 20.5,
  split: 20.95,
  rsvp0: 21.3,
  rsvpGap: 0.12,
  jumpOut: 22.33,
  // S5 celebration
  garland: 22.3,
  pillarL: 23.05,
  pillarR: 23.15,
  archTop: 23.35,
  twirl: 24.0,
  bigJump: 25.25,
  bigLand: 25.6,
  // S6 end card
  zoomOut: 26.85,
  title: 27.05,
  button: 27.95,
  press: 28.75,
};

export const BPM = 96;
export const BEAT = 60 / BPM; // 0.625 s, bar = 2.5 s

/** SFX cue list consumed by audio.mjs */
export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: +t.toFixed(3), type, gain, p });
  // S1
  add(0.0, 'whoosh', 0.55, 0.8);
  add(T.cardImpact, 'thud', 1.0, 0.9);
  add(T.cardImpact + 0.01, 'paper', 0.5, 1);
  add(0.62, 'rattle', 0.35, 1);
  add(T.burst, 'pop', 1.0, 0.8);
  add(T.burst + 0.02, 'flutter', 0.9, 1);
  add(T.coupleLand, 'step', 0.6, 1);
  add(T.stackCatch, 'paper', 0.45, 1.2);
  // S2
  for (let i = 0; i < 6; i++) add(T.threadsIn + 0.05 + i * 0.07, 'zip', 0.32, 0.9 + i * 0.08);
  add(T.pencilGrab, 'grab', 0.5, 1);
  add(T.scribble, 'scribble', 0.75, 1);
  add(T.write180, 'write', 0.7, 1);
  add(T.venuePull, 'twang', 0.9, 1.0);
  add(T.venueStamp, 'stamp', 0.85, 1);
  add(T.catererPull, 'twang', 0.9, 1.19);
  add(T.catererPull + 0.12, 'flip', 0.6, 1);
  add(T.budgetPull, 'twang', 0.9, 1.335);
  [0.1, 0.2, 0.31, 0.43].forEach((d, i) => add(T.budgetPull + d, 'coin', 0.55, 1 + i * 0.07));
  add(T.wrap, 'yank', 0.9, 1);
  add(T.wrap + 0.1, 'spin', 0.7, 1);
  add(T.stackDrop, 'flutter', 0.45, 1.3);
  add(T.pencilDrop, 'clatter', 0.6, 1);
  add(7.45, 'squeak', 0.35, 1);
  add(T.bIdea, 'ding', 0.45, 1.5);
  // S3
  add(T.phoneOut, 'whoosh', 0.7, 1.3);
  add(T.phoneLand, 'pop', 0.7, 1.3);
  add(T.vacuum, 'suck', 0.9, 1);
  for (let i = 0; i < 16; i++) add(T.vacuum + 0.42 + i * 0.065, 'plip', 0.3, 1 + i * 0.045);
  add(T.freed, 'boing', 0.7, 1);
  for (let i = 0; i < 4; i++) add(T.tiles + 0.1 + i * 0.13, 'tick', 0.55, 1 + i * 0.12);
  add(T.diveJump, 'jump', 0.5, 1.2);
  add(T.zoomIn, 'dive', 0.8, 1);
  // S4
  add(T.land, 'step', 0.75, 0.9);
  add(T.land + 0.06, 'step', 0.6, 1.1);
  add(T.cardsIn, 'swish', 0.55, 1);
  add(T.swipe1, 'swish', 0.5, 1.15);
  add(T.swipe2, 'swish', 0.5, 1.25);
  add(T.heartJump, 'jump', 0.45, 1.3);
  add(T.heartTap, 'heart', 0.9, 1);
  add(T.saved - 0.38, 'swish', 0.35, 1.5);
  add(T.saved, 'tick', 0.6, 1.4);
  add(T.stampJump, 'jump', 0.4, 1.0);
  add(T.stamp, 'stamp', 1.0, 0.95);
  add(T.pan1, 'swish', 0.5, 0.8);
  add(T.unroll, 'unroll', 0.6, 1);
  [T.tick1, T.tick2, T.tick3].forEach((t, i) => { add(t, 'check', 0.75, 1 + i * 0.12); add(t + 0.5, 'coin', 0.5, 1.1 + i * 0.08); });
  add(T.lens, 'whoosh', 0.35, 1.6);
  add(18.42, 'blink', 0.4, 1);
  add(T.thumbs, 'ding', 0.65, 1.0);
  add(T.pan2, 'swish', 0.5, 0.85);
  add(T.fold, 'paper', 0.55, 1.1);
  add(T.fold + 0.15, 'paper', 0.5, 1.3);
  add(T.throwT, 'throw', 0.8, 1);
  add(T.split, 'sparkle', 0.6, 1);
  for (let i = 0; i < 5; i++) add(T.rsvp0 + i * T.rsvpGap, 'chime', 0.55, [1, 1.122, 1.26, 1.498, 1.682][i]);
  add(T.jumpOut, 'jump', 0.5, 1.1);
  // S5
  add(T.garland, 'swoosh', 0.8, 1);
  add(T.pillarL, 'click', 0.7, 1);
  add(T.pillarR, 'click', 0.7, 1.1);
  add(T.archTop, 'thud', 0.6, 1.3);
  add(T.archTop + 0.12, 'pop', 0.45, 1.6);
  add(T.archTop + 0.22, 'pop', 0.45, 1.8);
  add(T.twirl, 'twirl', 0.6, 1);
  add(T.bigJump, 'jump', 0.5, 1);
  add(T.bigLand, 'thud', 0.55, 1.1);
  add(T.bigLand - 0.18, 'sparkle', 0.55, 1.2);
  // S6
  for (let i = 0; i < 6; i++) add(T.title + i * 0.1, 'tink', 0.3, 1 + i * 0.06);
  add(T.button, 'pop', 0.6, 1.1);
  add(T.press, 'tap', 0.8, 1);
  add(T.press + 0.16, 'sparkle', 0.55, 1.4);
  return c.sort((a, b) => a.t - b.t);
}
