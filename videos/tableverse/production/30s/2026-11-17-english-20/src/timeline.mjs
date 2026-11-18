// "More Boxes, More Cookies?" (4 × 6 = 8 × 3 = 24: double the boxes, halve each box, same total) — frames @ 30 fps;
// 900 = 30.000 s. Frame 0 is the finished hook image (also the thumbnail): four boxes of six star cookies, the sneaky
// mouse with a giant saw, card "4 × 6 = 24", headline "MORE BOXES, MORE COOKIES?" — no intro, no fade, no empty setup.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 104, name: 'Frame 0: 4 boxes x 6 cookies, sneaky mouse with a saw; "MORE BOXES, MORE COOKIES?"; card 4 × 6 = 24' },
  { id: 'S2-boxes', from: 104, to: 182, name: 'Four boxes of six bounce in turn; twenty-four cookies' },
  { id: 'S3-saw', from: 182, to: 320, name: 'Out comes the saw! Leap, saw, zip x4: every box splits in half; halves slide apart' },
  { id: 'S4-question', from: 320, to: 438, name: 'Eight boxes! More cookies? drumroll pause; let\'s count in threes; card 8 × 3 = ?' },
  { id: 'S5-count', from: 438, to: 592, name: 'Count in threes: 3 ... 24, each small box hops' },
  { id: 'S6-take', from: 592, to: 692, name: 'Still 24! the mouse\'s jaw drops, dizzy flop; halves rejoin as four sixes; card 8 × 3 = 24' },
  { id: 'S7-takeaway', from: 692, to: 810, name: 'Double the boxes, halve each box: same total; card 8 × 3 = 4 × 6; mouse laughs and winks' },
  { id: 'S8-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

export const HEADLINE_OUT = [100, 114];
export const BOX_BOUNCE = [108, 6]; // "Four boxes": box k hops at 108 + 6k
export const CARD_GLOW = 142; // "twenty-four"
export const SAW_UP = [182, 196, 210]; // crouch, swing the saw up, glint (after the word "saw")
export const TIPTOE = [40, 96]; // "This sneaky mouse thinks so!": tiptoe steps, saw tap + glint at TAP
export const TAP = 66;
export const LEAP = [214, 228]; // big leap from the counter to box 0
export const SPLIT = [240, 18]; // box k splits at 240 + 18k ("Zip!" VO 4 frames before)
export const HOP = 8; // frames per hop between boxes
export const JUMP_DOWN = [294, 306];
export const SPREAD = [300, 322]; // halves slide apart into 8 boxes
export const PAUSE = [366, 398];
// count k (0..7): row k>>1, side k&1 (left, right); spacing follows the spoken numbers (longer words, longer gaps)
export const COUNTS = [438, 457, 476, 495, 514, 534, 553, 575];
export const TAKE = 602; // "Still twenty-four!"
export const FLOP = [644, 656];
export const SIT_UP = [728, 750];
export const JOIN = [652, 670]; // halves slide together: four sixes
export const PAIRS = [668, 7]; // pair glow r at 660 + 8r ("four sixes")
export const APART = [712, 740]; // "double the boxes, halve each box"
export const ALL_GLOW = 770; // "same total!"
export const WINK = 798;
export const CARD_FLIPS = [
  [318, 1], // 4 × 6 = 24 -> 8 × 3 = ? (swap f325, "Eight boxes")
  [598, 3], // count -> 8 × 3 = 24 (swap f605, "Still twenty-four")
  [696, 4], // -> 8 × 3 = 4 × 6 (swap f703, "Double the boxes")
];
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

export const VO = {
  v01: 2, v02: 104, v03: 182, z1: 236, z2: 254, z3: 272, z4: 290, v05: 320, v06: 398,
  c03: 438, c06: 457, c09: 476, c12: 495, c15: 514, c18: 534, c21: 553, c24: 575, v07: 600, v08: 698, v09: 838,
};
// the four "Zip!" placements reuse one narration clip
export const VO_CLIP = { z1: 'zip', z2: 'zip', z3: 'zip', z4: 'zip' };

// v01 is carried on screen by the frame-0 headline + card; captions start with v02.
// A caption whose first line extends the previous one (same start) updates in place without re-popping.
export const CAPTIONS = [
  [['4 boxes of 6:', '24 cookies.'], 104, 178],
  [['Out comes the saw!'], 182, 230],
  [['Zip!'], 236, 254],
  [['Zip! Zip!'], 254, 272],
  [['Zip! Zip! Zip!'], 272, 290],
  [['Zip! Zip! Zip! Zip!'], 290, 316],
  [['8 boxes!', 'More cookies?'], 320, 396],
  [["Let's count in 3s!"], 398, 596],
  [['Still 24!'], 600, 640],
  [['Still 24!', '8 threes = 4 sixes!'], 640, 694],
  [['Double the boxes,', 'cut each in half: same total!'], 698, 806],
  [['Play and learn tables', 'with TableVerse.'], 838, 900],
];

export const splitAt = (k) => SPLIT[0] + k * SPLIT[1];
export const landAt = (k) => (k === 0 ? LEAP[1] : splitAt(k - 1) + HOP);
export const countAt = (k) => COUNTS[k];

export function sfxEvents() {
  const ev = [];
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  for (let k = 0; k < 4; k++) ev.push(['tick', BOX_BOUNCE[0] + k * BOX_BOUNCE[1], { pitch: 1 + k * 0.06 }]);
  ev.push(['chime', CARD_GLOW, { step: 0 }]);
  for (let t = TIPTOE[0]; t < TIPTOE[1]; t += 9) ev.push(['tick', t, { pitch: 0.7 }]);
  ev.push(['glint', TAP, {}]);
  ev.push(['glint', SAW_UP[2] + 2, {}]); // kept clear of "Out comes the saw!"
  ev.push(['boing', LEAP[0], { pitch: 1.0 }]);
  for (let k = 0; k < 4; k++) {
    if (k > 0) ev.push(['boing', splitAt(k - 1) + 5, { pitch: 1.25 + 0.08 * k, soft: true }]);
    // the rasp stops as "Zip!" starts, so the word stays clear
    ev.push(['saw', landAt(k) + 1, { dur: splitAt(k) - 4 - landAt(k) - 1 }]);
    ev.push(['crack', splitAt(k), { pitch: 1 + 0.05 * k }]);
  }
  ev.push(['boing', JUMP_DOWN[0], { pitch: 0.9 }], ['thud', JUMP_DOWN[1], {}], ['whoosh', SPREAD[0], { dur: 22 }]);
  for (const [f0] of CARD_FLIPS) ev.push(['flap', f0, { pitch: 1.1 }]);
  ev.push(['drumroll', PAUSE[0], { dur: PAUSE[1] - PAUSE[0] + 34 }]);
  for (let k = 0; k < 8; k++) ev.push(['pop', countAt(k), { pitch: 0.9 + k * 0.06 }]);
  ev.push(['chime', COUNTS[7] + 4, { step: 1 }]);
  ev.push(['take', TAKE, {}], ['whirl', TAKE + 18, { dur: FLOP[0] - TAKE - 14 }], ['slidedown', FLOP[0] - 4, {}], ['thud', FLOP[1], { soft: true }]);
  ev.push(['slide', JOIN[0], { dur: JOIN[1] - JOIN[0] }]);
  for (let r = 0; r < 4; r++) ev.push(['light', PAIRS[0] + r * PAIRS[1], { step: r }]);
  ev.push(['slide', APART[0], { dur: APART[1] - APART[0] }], ['sparkle', ALL_GLOW, {}], ['swing', SIT_UP[0], { pitch: 0.8 }], ['glint', WINK, {}]);
  // page rustle and end-card pop finish before "Play" (approved english-17 correction)
  ev.push(['page', PAGE_TURN[0], { dur: 18 }], ['pop', PAGE_TURN[0] + 12, { pitch: 0.75 }], ['sparkle', PAGE_TURN[0] + 16, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, vo_clip: VO_CLIP, captions: CAPTIONS, sfx: sfxEvents(), pause: PAUSE };
}
