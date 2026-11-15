// "All in Pairs" (4 × 7 = 28 = 14 pairs; 4 × any number is even) — frames @ 30 fps; 900 frames = 30.000 s.
// Frame 0 is the finished hook image (also the thumbnail): seven rowboats with four friends in each bobbing on a
// paper sea, the rescue ship below, Captain Robot in a pirate hat, card "4 × 7 = ?", headline "SEVEN BOATS. ALL IN
// PAIRS?" — no intro, no fade, no empty setup.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 140, name: 'Frame 0: seven boats × four friends, rescue ship, Captain Robot; "SEVEN BOATS. ALL IN PAIRS?"; card 4 × 7 = ?' },
  { id: 'S2-one-boat', from: 140, to: 198, name: 'Boat 1: four friends make two pairs (buddy ropes)' },
  { id: 'S3-question', from: 198, to: 284, name: 'Will anyone be left alone? quiet pause, lean-in' },
  { id: 'S4-count', from: 284, to: 420, name: 'Boats pair up one by one: two, four … fourteen pairs' },
  { id: 'S5-rescue', from: 420, to: 488, name: 'Fourteen pairs climb aboard the ship; nobody is alone' },
  { id: 'S6-payoff', from: 488, to: 612, name: '14 pairs make 28; card 4 × 7 = 28' },
  { id: 'S7-takeaway', from: 612, to: 810, name: 'Every four is two pairs: 4 × any number is even; celebration' },
  { id: 'S8-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

export const HEADLINE_OUT = [124, 138];
export const ROPES0 = [164, 170]; // boat 1's two buddy ropes (on "two pairs")
export const PAUSE = [238, 280];
export const COUNT_AT = (k) => 284 + k * 18; // boat k (0..6) counted; boats 1..6 tie their ropes just before
export const CLIMB = [424, 3, 14]; // pair p (0..13) leaves at 424 + 3p, flight 14 frames
export const GROUPS4 = [624, 6]; // takeaway: each boat's four (two pairs) pulses on deck
export const CARD_FLIPS = [
  [575, 1], // 4 × 7 = ? -> 4 × 7 = 28 (swap on the second "twenty-eight", f582)
  [699, 2], // -> 4 × any = even (swap on "even", f706)
];
export const PARTY = [724, 800];
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

export const VO = {
  v01: 2, v02: 142, v03: 198,
  c2: COUNT_AT(0), c4: COUNT_AT(1), c6: COUNT_AT(2), c8: COUNT_AT(3), c10: COUNT_AT(4), c12: COUNT_AT(5), c14: COUNT_AT(6),
  v05: 420, v06: 488, v07: 612, v08: 836,
};

// v01 is carried on screen by the frame-0 headline + card; captions start with v02.
// A caption whose first line extends the previous one (same start) updates in place without re-popping.
const tot = [2, 4, 6, 8, 10, 12, 14];
export const CAPTIONS = [
  [['Look: 4 friends', 'make 2 pairs.'], 142, 194],
  [['Will anyone be left alone?'], 198, 280],
  ...tot.map((n, i) => [['Pairs:', tot.slice(0, i + 1).join(', ') + (n === 14 ? '!' : '')], COUNT_AT(i), i === 6 ? 414 : COUNT_AT(i + 1)]),
  [['14 pairs.', 'Nobody is alone!'], 420, 484],
  [['14 pairs make 28,'], 488, 548],
  [['14 pairs make 28,', 'so 4 × 7 = 28.'], 548, 606],
  [['Every 4 is 2 pairs,'], 612, 666],
  [['Every 4 is 2 pairs,', 'so 4 × any number is even.'], 666, 806],
  [['Play and learn tables', 'with TableVerse.'], 834, 900],
];

export function sfxEvents() {
  const ev = [];
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  ev.push(['click', ROPES0[0], { soft: true }], ['click', ROPES0[1], { soft: true }], ['light', ROPES0[1] + 2, { step: 0 }]);
  for (let k = 0; k < 7; k++) {
    if (k > 0) ev.push(['click', COUNT_AT(k) - 6, { soft: true }], ['click', COUNT_AT(k) - 2, { soft: true }]);
    ev.push(['light', COUNT_AT(k), { step: Math.min(4, Math.floor(k / 2)) }]);
  }
  for (let p = 0; p < 14; p += 2) ev.push(['pop', CLIMB[0] + p * CLIMB[1] + CLIMB[2], { pitch: 1.0 + p * 0.02 }]);
  ev.push(['whoosh', CLIMB[0], { dur: 50 }], ['chime', 452, { step: 2 }]);
  for (const [f0] of CARD_FLIPS) ev.push(['flap', f0, { pitch: 1.1 }]);
  ev.push(['sparkle', 584, {}]);
  for (let b = 0; b < 7; b++) ev.push(['tick', GROUPS4[0] + b * GROUPS4[1], { pitch: 1 + b * 0.05 }]);
  ev.push(['chime', 708, { step: 1 }], ['sparkle', 730, {}], ['sparkle', 760, {}]);
  // page rustle and end-card pop finish before "Play" (approved english-17 correction)
  ev.push(['page', PAGE_TURN[0], { dur: 18 }], ['pop', PAGE_TURN[0] + 12, { pitch: 0.75 }], ['sparkle', PAGE_TURN[0] + 16, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, captions: CAPTIONS, sfx: sfxEvents(), pause: PAUSE };
}
