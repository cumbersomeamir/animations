// "Nine Hides Inside Ten" (9 × 8 = 10 × 8 − 8) — timing in frames @ 30 fps; 900 frames = 30.000 s.
// audio/build_audio.py reads timeline.json written by `node src/render.mjs --timeline`.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 58, name: 'Cookie sheet springs up; flip card asks 9 × 8 = ?' },
  { id: 'S2-superhook', from: 58, to: 112, name: 'Push in: the card flips — 9 × 8 is inside 10 × 8' },
  { id: 'S3-count', from: 112, to: 226, name: 'Row tags 1–10, cookie numbers 1–8 across row 1; card flips to 10 × 8 = 80, sheet glows' },
  { id: 'S4-question', from: 226, to: 414, name: 'Card flips to 9 × 8 = ?; can you spot the extra row? quiet pause; row 10 lights' },
  { id: 'S5-fold', from: 414, to: 458, name: 'Baker pulls the tab; row 10 folds back on its hinge, away from the count' },
  { id: 'S6-proof', from: 458, to: 566, name: 'Flap "80 − 8" drops; the nine rows glow; flap flips to "80 − 8 = 72"' },
  { id: 'S7-payoff', from: 566, to: 800, name: 'Card flips to 9 × 8 = 72; takeaway: start with ten, take one group away (row unfolds and folds again); the nine rows glow in turn' },
  { id: 'S8-cta', from: 800, to: 900, name: 'Page turns to the TableVerse card' },
];

export const TRAY_RISE = [0, 16];
export const ROW_POP = (r) => -4 + r * 1.6; // row r (0..9) pops (row 1 already popping on frame 0)
export const CARD_UP = [0, 20]; // top flip card rises
// top flip card faces: [frame where the flip starts, face index]; flip lasts 14 frames, face swaps half-way
export const CARD_FLIPS = [
  [64, 1], // 9 × 8 = ?  -> 10 × 8 = ?
  [194, 2], // -> 10 × 8 = 80
  [236, 3], // -> 9 × 8 = ?
  [600, 4], // -> 9 × 8 = 72
];
export const ROW_TAGS = [116, 4]; // start, stagger: row tags 1..10
export const ROW_TAGS_OUT = 222;
export const COL_NUMS = [146, 4]; // cookie numbers 1..8 across row 1
export const COL_NUMS_OUT = 222;
export const GLOW_ALL = 204;
export const PAUSE = [348, 392];
export const EXTRA_ROW = 392; // row 10 lights + its tag returns + hinge pins glint
export const TAB_PULL = [416, 446];
export const FOLD = [420, 452];
export const FLAP = 470; // "80 − 8" drops
export const GLOW_NINE = 522;
export const FLAP_FLIP = [512, 528]; // -> "80 − 8 = 72" (face swaps on "Seventy-two")
export const GLOW_CARD = 614;
export const FLAP_FLIP2 = [648, 666]; // -> "10 × 8 − 8"
export const RE_UNFOLD = [662, 686]; // "start with ten"
export const RE_FOLD = [708, 732]; // "take one group away"
export const NINE_SWEEP = 752; // rows 1–9 glow one after another (the 72 that stay), 4 frames apart
export const PAGE_TURN = [800, 824];
export const CTA_POP = 820;

export const VO = { v01: 6, v02: 58, v03: 112, v04: 168, v05: 226, v06: 306, v07: 414, v08: 458, v09: 516, v10: 566, v11: 640, v12: 820 };

// Captions [lines, in, out] — upper band (centre y 318), within x 100–900; a result is never captioned before it is said
export const CAPTIONS = [
  [['Where is 9 × 8 hiding?'], 6, 56],
  [['Inside 10 × 8!'], 58, 108],
  [['10 rows of 8 cookies.'], 112, 164],
  [['10 rows of 8 make 80.'], 168, 220],
  [['But 9 × 8 needs only 9 rows.'], 226, 302],
  [['Can you spot the extra row?'], 306, 410],
  [['Fold it away.'], 414, 454],
  [['80, take away 1 row of 8.'], 458, 516],
  [['80, take away 1 row of 8.', '72 are left.'], 516, 562],
  [['So 9 × 8 = 72.'], 566, 636],
  [['For a 9 fact: start with 10,'], 640, 700],
  [['For a 9 fact: start with 10,', 'then take one group away.'], 700, 798],
  [['Play and learn tables', 'with TableVerse.'], 820, 900],
];

export function sfxEvents() {
  const ev = [];
  ev.push(['rise', TRAY_RISE[0], { dur: 18 }]);
  for (let r = 0; r < 10; r += 2) ev.push(['pop', Math.max(0, Math.round(ROW_POP(r)) + 4), { pitch: 0.9 + r * 0.05 }]);
  ev.push(['flap', CARD_UP[0] + 6, { pitch: 1.0 }]);
  for (const [f0] of CARD_FLIPS) ev.push(['flap', f0, { pitch: 1.1 }]);
  for (let r = 0; r < 10; r++) ev.push(['tick', ROW_TAGS[0] + r * ROW_TAGS[1], { pitch: 1 + r * 0.04 }]);
  for (let c = 0; c < 8; c++) ev.push(['tick', COL_NUMS[0] + c * COL_NUMS[1], { pitch: 1.4 + c * 0.05 }]);
  ev.push(['chime', GLOW_ALL, { step: 0 }]);
  ev.push(['light', EXTRA_ROW, { step: 2 }], ['glint', EXTRA_ROW + 4, {}]);
  ev.push(['slide', TAB_PULL[0], { dur: TAB_PULL[1] - TAB_PULL[0] }], ['hinge', FOLD[0] + 2, { dur: FOLD[1] - FOLD[0] }], ['click', FOLD[1], { soft: true }]);
  ev.push(['flap', FLAP, { pitch: 0.9 }], ['flap', FLAP_FLIP[0], { pitch: 1.1 }], ['chime', GLOW_NINE, { step: 1 }]);
  ev.push(['chime', GLOW_CARD, { step: 2 }], ['sparkle', GLOW_CARD + 2, {}]);
  ev.push(['flap', FLAP_FLIP2[0], { pitch: 1.0 }], ['hinge', RE_UNFOLD[0], { dur: 24, soft: true }], ['hinge', RE_FOLD[0], { dur: 24, soft: true }], ['click', RE_FOLD[1], { soft: true }]);
  for (let r = 0; r < 9; r++) ev.push(['light', NINE_SWEEP + r * 4, { step: Math.min(4, Math.floor(r / 2)) }]);
  ev.push(['page', PAGE_TURN[0], { dur: PAGE_TURN[1] - PAGE_TURN[0] }], ['pop', CTA_POP + 2, { pitch: 0.75 }], ['sparkle', CTA_POP + 6, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, captions: CAPTIONS, sfx: sfxEvents(), pause: PAUSE };
}
