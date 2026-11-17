// "Seven or Zero?" (7 × 1 = 7, then 7 × 0 = 0: zero in every group makes zero) — frames @ 30 fps; 900 = 30.000 s.
// Frame 0 is the finished hook image (also the thumbnail): seven open boxes with one star cookie in each, a hungry
// mouse eyeing them, card "7 × 0 = ?", headline "SEVEN OR ZERO?" — no intro, no fade, no empty setup.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 136, name: 'Frame 0: seven boxes × one cookie, hungry mouse; "SEVEN OR ZERO?"; card 7 × 0 = ?' },
  { id: 'S2-ones', from: 136, to: 242, name: 'One cookie in each box: badges 1 ×7; card 7 × 1 = 7' },
  { id: 'S3-chomp', from: 242, to: 384, name: 'The mouse hops box to box and eats every cookie; badges flip to 0' },
  { id: 'S4-question', from: 384, to: 520, name: 'Each box has zero; how many in all? card back to 7 × 0 = ?; quiet pause' },
  { id: 'S5-payoff', from: 520, to: 596, name: 'Zero! seven zeros make zero; card 7 × 0 = 0' },
  { id: 'S6-takeaway', from: 596, to: 810, name: 'Box fronts fold down: every box is empty; zero in all; card any × 0 = 0; the full mouse naps' },
  { id: 'S7-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

export const HEADLINE_OUT = [118, 132];
export const ONES = [146, 6]; // "1" badge on box k at 146 + 6k
export const CHOMP = [254, 17]; // mouse lands on box k at 254 + 17k; bites at +2, +5, +8; badge 1 -> 0 at +9
export const HOP = 8; // frames per hop
export const HOME_AT = 368; // after the last box the mouse hops back down to the shelf end
export const PAUSE = [476, 518];
export const ZEROS = [530, 3]; // "seven zeros": the 0 badges pulse in turn
export const CARD_FLIPS = [
  [210, 1], // 7 × 0 = ?  -> 7 × 1 = 7 (swap on "make seven", f217)
  [442, 0], // -> 7 × 0 = ? again (swap on "How many", f449)
  [513, 2], // -> 7 × 0 = 0 (swap on "Zero!", f520)
  [670, 3], // -> any × 0 = 0 (swap on "any number times zero", f677)
];
export const FLAPS_OPEN = [604, 4]; // "zero in every group": box fronts fold down in a wave, showing each box is empty
export const FLAPS_CLOSE = [786, 3];
export const NAP = [736, 806];
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

export const VO = { v01: 2, v02: 136, v03: 198, v04: 242, v05: 384, v06: 520, v07: 596, v08: 836 };

// v01 is carried on screen by the frame-0 headline + card; captions start with v02.
// A caption whose first line extends the previous one (same start) updates in place without re-popping.
export const CAPTIONS = [
  [['7 boxes,', '1 cookie in each.'], 136, 196],
  [['7 ones make 7.'], 198, 238],
  [['The mouse eats the cookie', 'in every box!'], 242, 310],
  [['Each box: 0 cookies.'], 384, 446],
  [['Each box: 0 cookies.', 'How many in all?'], 446, 516],
  [['Zero!'], 520, 530],
  [['Zero!', '7 zeros make 0.'], 530, 590],
  [['0 in every group', 'means 0 in all.'], 596, 674],
  [['Any number × 0 = 0.'], 677, 806],
  [['Play and learn tables', 'with TableVerse.'], 836, 900],
];

export function sfxEvents() {
  const ev = [];
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  for (let k = 0; k < 7; k++) ev.push(['tick', ONES[0] + k * ONES[1], { pitch: 1 + k * 0.05 }]);
  ev.push(['chime', 218, { step: 0 }]);
  for (let k = 0; k < 7; k++) {
    const a = CHOMP[0] + k * CHOMP[1];
    ev.push(['swing', a - HOP, { pitch: 1.2 }]);
    for (const b of [2, 5, 8]) ev.push(['pop', a + b, { pitch: 0.55 + 0.05 * (b / 3) }]);
    ev.push(['tick', a + 9, { pitch: 0.8 }]);
  }
  ev.push(['swing', HOME_AT - HOP, { pitch: 0.9 }], ['click', HOME_AT, { soft: true }]);
  for (const [f0] of CARD_FLIPS) ev.push(['flap', f0, { pitch: 1.1 }]);
  ev.push(['chime', 520, { step: 2 }], ['sparkle', 522, {}]);
  for (let k = 0; k < 7; k++) ev.push(['tick', ZEROS[0] + k * ZEROS[1], { pitch: 1.3 + k * 0.04 }]);
  ev.push(['hinge', FLAPS_OPEN[0], { dur: 36, soft: true }], ['hinge', FLAPS_CLOSE[0], { dur: 30, soft: true }]);
  ev.push(['light', 677, { step: 1 }], ['glint', NAP[0] + 4, {}]);
  // page rustle and end-card pop finish before "Play" (approved english-17 correction)
  ev.push(['page', PAGE_TURN[0], { dur: 18 }], ['pop', PAGE_TURN[0] + 12, { pitch: 0.75 }], ['sparkle', PAGE_TURN[0] + 16, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, captions: CAPTIONS, sfx: sfxEvents(), pause: PAUSE };
}
