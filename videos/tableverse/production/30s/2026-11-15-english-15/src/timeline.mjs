// "Two Equal Groups" (6 × 8 = 3 × 8 + 3 × 8 = 24 + 24 = 48) — frames @ 30 fps; 900 frames = 30.000 s.
// Frame 0 is the finished hook image (also the thumbnail): the six-row sheet already split into twin halves,
// card "6 × 8 = ?", headline "SPLIT IT. SOLVE IT." — no intro, no fade, no empty setup.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 78, name: 'Frame 0: split six-row sheet + "SPLIT IT. SOLVE IT."; headline folds away, halves close' },
  { id: 'S2-array', from: 78, to: 146, name: 'Six rows of eight donuts: row tags 1–6, numbers 1–8' },
  { id: 'S3-split', from: 146, to: 226, name: 'Baker pulls the tab: the sheet splits after row 3 into two groups' },
  { id: 'S4-same', from: 226, to: 402, name: 'Are the two groups the same? quiet pause; a ghost outline of the top half slides down and fits' },
  { id: 'S5-proof', from: 402, to: 590, name: '3 × 8 = 24 on each half; card flips to 24 + 24 = 48' },
  { id: 'S6-payoff', from: 590, to: 806, name: '6 × 8 = 48; find the three fact, then double it; halves close into one sheet' },
  { id: 'S7-cta', from: 806, to: 900, name: 'Page turns to the TableVerse card' },
];

export const HEADLINE_OUT = [60, 74];
export const CLOSE1 = [66, 90]; // halves come together (gap closes)
export const ROW_TAGS = [92, 5];
export const ROW_TAGS_OUT = 140;
export const COL_NUMS = [110, 4];
export const COL_NUMS_OUT = 140;
export const HINGE_SHOW = 150;
export const SPLIT = [170, 204]; // tab pulled: lower half drops on its hinge strip
export const PAUSE = [264, 306];
export const GHOST = [306, 336]; // outline of the top half slides down onto the bottom half
export const MATCH = 336;
export const FLAP_TOP = 410;
export const GLOW_TOP = 428; // "twenty-four"
export const FLAP_BOT = 466;
export const GLOW_BOT = 482; // "the same"
export const CARD_FLIPS = [
  [548, 1], // 6 × 8 = ?  -> 24 + 24 = 48 (face swaps on "forty-eight")
  [616, 2], // -> 6 × 8 = 48
];
export const GLOW_BOTH = 556;
export const GLOW_CARD = 623;
export const FIND_THREE = 684; // top flap glows on "find the three fact"
export const DOUBLE_IT = 718; // both halves + flaps glow on "double it"
export const CLOSE2 = [748, 772]; // the two equal groups close into one sheet of 48
export const PAGE_TURN = [806, 830];
export const CTA_POP = 826;

export const VO = { v01: 2, v02: 78, v03: 146, v04: 226, v05: 340, v06: 402, v07: 460, v08: 510, v09: 590, v10: 656, v11: 828 };

// v01 is carried on screen by the frame-0 headline + card; captions start with v02
export const CAPTIONS = [
  [['6 rows of 8 donuts.'], 78, 140],
  [['Split the 6 rows into', '2 equal groups.'], 146, 222],
  [['Are the 2 groups the same?'], 226, 336],
  [['Yes: 3 rows of 8 in each.'], 340, 396],
  [['3 rows of 8 make 24.'], 402, 456],
  [['The other group is the same.'], 460, 506],
  [['24 and 24 make…'], 510, 554],
  [['24 and 24 make 48.'], 554, 586],
  [['So 6 × 8 = 48.'], 590, 650],
  [['For a 6 fact: find the 3 fact,'], 656, 716],
  [['For a 6 fact: find the 3 fact,', 'then double it.'], 716, 804],
  [['Play and learn tables', 'with TableVerse.'], 828, 900],
];

export function sfxEvents() {
  const ev = [];
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  ev.push(['hinge', CLOSE1[0], { dur: 24, soft: true }], ['click', CLOSE1[1], {}]);
  for (let r = 0; r < 6; r++) ev.push(['tick', ROW_TAGS[0] + r * ROW_TAGS[1], { pitch: 1 + r * 0.05 }]);
  for (let c = 0; c < 8; c++) ev.push(['tick', COL_NUMS[0] + c * COL_NUMS[1], { pitch: 1.4 + c * 0.05 }]);
  ev.push(['glint', HINGE_SHOW, {}]);
  ev.push(['slide', SPLIT[0] - 4, { dur: 30 }], ['hinge', SPLIT[0], { dur: SPLIT[1] - SPLIT[0] }]);
  ev.push(['whoosh', GHOST[0], { dur: GHOST[1] - GHOST[0] }], ['click', MATCH, { soft: true }], ['light', MATCH + 2, { step: 3 }]);
  ev.push(['flap', FLAP_TOP, { pitch: 0.95 }], ['chime', GLOW_TOP, { step: 0 }]);
  ev.push(['flap', FLAP_BOT, { pitch: 0.9 }], ['chime', GLOW_BOT, { step: 0 }]);
  for (const [f0] of CARD_FLIPS) ev.push(['flap', f0, { pitch: 1.1 }]);
  ev.push(['chime', GLOW_BOTH, { step: 2 }], ['sparkle', GLOW_CARD, {}]);
  ev.push(['light', FIND_THREE, { step: 1 }], ['chime', DOUBLE_IT, { step: 1 }]);
  ev.push(['hinge', CLOSE2[0], { dur: 24, soft: true }], ['click', CLOSE2[1], {}]);
  ev.push(['page', PAGE_TURN[0], { dur: PAGE_TURN[1] - PAGE_TURN[0] }], ['pop', CTA_POP + 2, { pitch: 0.75 }], ['sparkle', CTA_POP + 6, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, captions: CAPTIONS, sfx: sfxEvents(), pause: PAUSE };
}
