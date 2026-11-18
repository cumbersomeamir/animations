// "The Octopus's Square Picnic" (4 × 4 = 16 is a square number) — frames @ 30 fps; 900 = 30.000 s.
// Frame 0 is the finished hook image (also the thumbnail): a mischievous octopus holding up four picnic baskets of four
// oranges over a gingham blanket, card "4 × 4 = ?", headline "A SQUARE OF ORANGES?" — no intro, no fade, no empty setup.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 130, name: 'Frame 0: octopus holds 4 baskets x 4 oranges; "A SQUARE OF ORANGES?"; card 4 × 4 = ?' },
  { id: 'S2-baskets', from: 130, to: 196, name: 'Four baskets, four oranges in each: baskets bounce in turn' },
  { id: 'S3-mess', from: 196, to: 266, name: 'Uh-oh! It tips them all out: oranges roll into two piles on the sand; an empty basket lands on its head' },
  { id: 'S4-tidy', from: 266, to: 352, name: 'Tidy up! The arms carry four oranges into each row, row by row' },
  { id: 'S5-question', from: 352, to: 444, name: 'Four rows of four. Is it a square? quiet pause' },
  { id: 'S6-measure', from: 444, to: 532, name: 'One arm runs along the top (4), one down the side (4): the same both ways; square outline pops' },
  { id: 'S7-count', from: 532, to: 614, name: 'Count by rows: 4, 8, 12, 16' },
  { id: 'S8-payoff', from: 614, to: 810, name: '4 × 4 = 16, a square number; a number times itself makes a square; square dance' },
  { id: 'S9-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

export const HEADLINE_OUT = [120, 134];
export const BASKET_BOUNCE = [134, 8]; // basket k bounces at 134 + 8k
export const TIP = [200, 212]; // the baskets tip over
export const LAUNCH = 204; // orange i leaves its basket at LAUNCH + 2 * (i % 4) + basket
export const FLIGHT = 22; // frames from basket to the sand pile (one bounce on the blanket)
export const HAT_DROP = [214, 234]; // basket 1 flies up and lands on the octopus's head (bonk at the end)
export const ROWS = [282, 298, 314, 330]; // row r: the carry starts (arms reached 6 frames earlier), lands 16 frames later
export const CARRY = 16;
export const PAUSE = [408, 440];
export const ACROSS = [448, 472]; // arm tip runs along the top row (left to right)
export const DOWN = [476, 500]; // arm tip runs down the right-hand column (top to bottom)
export const OUTLINE = 504; // dashed square outline pops round the oranges
export const COUNTS = [532, 550, 568, 588]; // "Four! Eight! Twelve! Sixteen!" row r glows
export const SQUARE_PULSE = [668, 712, 740]; // "square number", "times itself", "makes a square"
export const DANCE = [758, 810];
export const WINK = 798;
export const CARD_FLIPS = [
  [624, 3], // 4 × 4 = ? -> 4 × 4 = 16 (swap f631, "four times four")
];
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

export const VO = { v01: 2, v02: 130, v03: 196, v04: 266, v05: 352, v06: 444, c04: 532, c08: 550, c12: 568, c16: 588, v07: 614, v08: 702, v09: 838 };
export const VO_CLIP = {};

// v01 is carried on screen by the frame-0 headline + card; captions start with v02.
// A caption whose first line extends the previous one (same start) updates in place without re-popping.
export const CAPTIONS = [
  [['4 baskets,', '4 oranges in each.'], 130, 194],
  [['Uh-oh!'], 196, 236],
  [['Uh-oh!', 'What a mess!'], 236, 262],
  [['Tidy up, octopus!'], 266, 300],
  [['Tidy up, octopus!', '4 in every row.'], 300, 346],
  [['4 rows of 4.'], 352, 378],
  [['4 rows of 4.', 'Is it a square?'], 378, 440],
  [['4 across, 4 down.'], 444, 494],
  [['4 across, 4 down.', 'The same both ways!'], 494, 528],
  [['4!'], 532, 550],
  [['4, 8!'], 550, 568],
  [['4, 8, 12!'], 568, 588],
  [['4, 8, 12, 16!'], 588, 610],
  [['4 times 4 is 16.'], 614, 662],
  [['4 times 4 is 16.', "It's a square number!"], 662, 698],
  [['A number times itself', 'makes a square.'], 702, 806],
  [['Play and learn tables', 'with TableVerse.'], 838, 900],
];

export const rowAt = (r) => ROWS[r];

export function sfxEvents() {
  const ev = [];
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  for (let k = 0; k < 4; k++) ev.push(['tick', BASKET_BOUNCE[0] + k * BASKET_BOUNCE[1], { pitch: 1 + k * 0.06 }]);
  ev.push(['swing', TIP[0], { pitch: 0.9 }]);
  // oranges thump on the blanket, then roll onto the sand
  for (let i = 0; i < 16; i++) {
    const b = i >> 2, t0 = LAUNCH + 2 * (i % 4) + b;
    ev.push(['tok', t0 + Math.round(FLIGHT * 0.45), { pitch: 0.8 + 0.03 * i }]);
  }
  ev.push(['roll', LAUNCH + 12, { dur: 22 }]);
  ev.push(['whoosh', HAT_DROP[0], { dur: 14 }], ['bonk', HAT_DROP[1], {}]);
  for (let r = 0; r < 4; r++) { ev.push(['stretch', ROWS[r] - 6, { pitch: 1 + 0.1 * r }]); for (let c = 0; c < 4; c++) ev.push(['plop', ROWS[r] + CARRY + c, { pitch: 0.9 + 0.05 * c }]); }
  ev.push(['hmm', PAUSE[0] + 4, { dur: PAUSE[1] - PAUSE[0] - 6 }]);
  for (let c = 0; c < 4; c++) ev.push(['tick', ACROSS[0] + 3 + c * 6, { pitch: 1.1 + c * 0.08 }]);
  for (let r = 0; r < 4; r++) ev.push(['tick', DOWN[0] + 3 + r * 6, { pitch: 1.1 + r * 0.08 }]);
  ev.push(['stretch', ACROSS[0] - 4, { pitch: 1.3 }], ['stretch', DOWN[0] - 4, { pitch: 1.2 }]);
  ev.push(['chime', OUTLINE, { step: 2 }], ['sparkle', OUTLINE + 2, {}]);
  for (let r = 0; r < 4; r++) ev.push(['pop', COUNTS[r], { pitch: 0.9 + r * 0.1 }]);
  for (const [f0] of CARD_FLIPS) ev.push(['flap', f0, { pitch: 1.1 }]);
  ev.push(['chime', 632, { step: 1 }], ['light', SQUARE_PULSE[0], { step: 2 }], ['light', SQUARE_PULSE[2], { step: 4 }]);
  for (let k = 0; k < 6; k++) ev.push(['tok', DANCE[0] + 2 + k * 8, { pitch: k % 2 ? 1.3 : 1.0 }]);
  ev.push(['glint', WINK, {}]);
  // page rustle and end-card pop finish before "Play" (approved english-17 correction)
  ev.push(['page', PAGE_TURN[0], { dur: 18 }], ['pop', PAGE_TURN[0] + 12, { pitch: 0.75 }], ['sparkle', PAGE_TURN[0] + 16, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, vo_clip: VO_CLIP, captions: CAPTIONS, sfx: sfxEvents(), pause: PAUSE };
}
