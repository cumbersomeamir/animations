// "Four Groups of Three" — single source of truth for timing (frames @ 30 fps, 900 frames = 30.000 s).
// audio/build_audio.py reads timeline.json (written by `node src/render.mjs --timeline`).
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-open', from: 0, to: 96, name: 'Cover flips up, bakery pops up, four folded baskets pop up' },
  { id: 'S2-need', from: 96, to: 160, name: 'Each basket needs three: tags flip down' },
  { id: 'S3-fill', from: 160, to: 380, name: 'Baker tosses 3 apples into each basket; glow + total 3,6,9,12' },
  { id: 'S4-meaning', from: 380, to: 510, name: '4 groups of 3 = 12, 4 x 3 = 12 card' },
  { id: 'S5-regroup', from: 510, to: 632, name: 'Apples lift, page turns, same 12 apples into 3 tins of 4' },
  { id: 'S6-same', from: 632, to: 722, name: 'Recount 1..12: arrangement changed, number did not' },
  { id: 'S7-draw', from: 722, to: 790, name: 'Page turns to a drawing: 3 equal groups of 4 drawn' },
  { id: 'S8-cta', from: 790, to: 900, name: 'Page turns to TableVerse end card; baker waves' },
];

// page flips (top hinge): [page index that lifts away, start, end]
export const FLIPS = [
  [0, 10, 28],    // cover -> bakery (baskets)
  [1, 530, 552],  // baskets -> pie tins
  [2, 722, 740],  // pie tins -> drawing sheet
  [3, 788, 806],  // drawing sheet -> TableVerse card
];

export const BASKET_POP = [52, 58, 64, 70];
export const TAG_DROP = [108, 114, 120, 126];
export const BASKET_FILL = [186, 232, 278, 324]; // first apple launch per basket; 10 frames between apples
export const APPLE_FLIGHT = 12;
export const GLOW = [222, 268, 314, 360]; // basket complete -> glow once, total 3, 6, 9, 12
export const GROUP_BADGE = [390, 398, 406, 414];
export const CARD1 = 386;
export const CARD1_LINE2 = 452;
export const LIFT = 512; // apples hop out of the baskets and hover
export const REGROUP = 560; // apples glide into tins (4 frames stagger, 18 frame glide)
export const TIN_POP = [548, 552, 556];
export const TIN_GLOW = [592, 608, 624];
export const TIN_BADGE = [612, 618, 624];
export const CARD2 = 600;
export const CARD2_LINE2 = 626;
export const RECOUNT = 640; // badge 1..12 every 5 frames
export const RECOUNT_STEP = 5;
export const DRAW_START = 742;
export const DRAW_END = 786;
export const CTA_POP = 800;

// Narration placement (clip id -> start frame); clips in audio/narration/<id>.wav
export const VO = {
  l01: 30, l02: 96, l03: 160,
  c03: GLOW[0], c06: GLOW[1], c09: GLOW[2], c12: GLOW[3],
  l04: 382, l05: 450, l06: 510, l07: 572, l08: 632, l09: 728, l10: 812,
};

// Captions: [lines[], in, out]; upper safe band y 340-520
export const CAPTIONS = [
  [['Our baker has 4 baskets.'], 30, 94],
  [['Each basket needs 3 apples.'], 96, 158],
  [['Let’s fill them:'], 160, 222],
  [['Let’s fill them:', '3'], 222, 268],
  [['Let’s fill them:', '3, 6'], 268, 314],
  [['Let’s fill them:', '3, 6, 9'], 314, 360],
  [['Let’s fill them:', '3, 6, 9, 12'], 360, 380],
  [['4 equal groups of 3', 'make 12.'], 382, 446],
  [['That is what 4 × 3 means.'], 450, 506],
  [['Now watch the same', 'apples move:'], 510, 568],
  [['3 groups of 4', 'still make 12.'], 572, 628],
  [['The arrangement changed;', 'the number of apples did not.'], 632, 724],
  [['Try drawing equal groups', 'together.'], 728, 800],
  [['Play and learn tables', 'together with TableVerse.'], 812, 900],
];

export function sfxEvents() {
  const ev = [];
  for (const [, a, b] of FLIPS) ev.push(['page', a, { dur: b - a }]);
  ev.push(['pop', 4, { pitch: 0.8 }], ['pop', 14, { pitch: 0.9 }], ['pop', 20, { pitch: 1.0 }]);
  ev.push(['fold', 22, {}], ['fold', 26, {}]);
  BASKET_POP.forEach((f, i) => ev.push(['pop', f, { pitch: 1.0 + i * 0.08 }]));
  TAG_DROP.forEach((f, i) => ev.push(['flap', f, { pitch: 1 + i * 0.05 }]));
  BASKET_FILL.forEach((f0, b) => {
    for (let j = 0; j < 3; j++) {
      ev.push(['toss', f0 + j * 10, {}]);
      ev.push(['tok', f0 + j * 10 + APPLE_FLIGHT, { pitch: 1 + 0.06 * (b * 3 + j) }]);
    }
  });
  GLOW.forEach((f, b) => ev.push(['chime', f, { step: b }], ['card', f + 1, {}]));
  ev.push(['fold', CARD1, {}], ['flap', CARD1_LINE2, { pitch: 1.1 }]);
  GROUP_BADGE.forEach((f, i) => ev.push(['tick', f, { pitch: 1 + i * 0.1 }]));
  ev.push(['lift', LIFT, { dur: 16 }]);
  TIN_POP.forEach((f, i) => ev.push(['pop', f, { pitch: 0.9 + i * 0.1 }]));
  for (let i = 0; i < 12; i++) ev.push(['slide', REGROUP + i * 4, { pitch: 1 + i * 0.03 }], ['tok', REGROUP + i * 4 + 18, { pitch: 1.2 + i * 0.03 }]);
  TIN_GLOW.forEach((f, t) => ev.push(['chime', f, { step: t + 1 }]));
  TIN_BADGE.forEach((f, i) => ev.push(['tick', f, { pitch: 1 + i * 0.1 }]));
  ev.push(['fold', CARD2, {}], ['flap', CARD2_LINE2, { pitch: 1.1 }]);
  for (let i = 0; i < 12; i++) ev.push(['count', RECOUNT + i * RECOUNT_STEP, { step: i }]);
  ev.push(['pencil', DRAW_START, { dur: DRAW_END - DRAW_START }]);
  ev.push(['fold', 792, {}], ['pop', CTA_POP, { pitch: 0.75 }], ['sparkle', CTA_POP + 4, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, flips: FLIPS, vo: VO, captions: CAPTIONS, sfx: sfxEvents() };
}
