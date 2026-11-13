// "The Missing Row Trick" (7 × 6 = 5 rows + 2 rows) — timing in frames @ 30 fps; 900 frames = 30.000 s.
// audio/build_audio.py reads timeline.json written by `node src/render.mjs --timeline`.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 62, name: 'Tray springs up on its hinge, cupcakes pop row by row, tag asks 7 × 6 = ?' },
  { id: 'S2-superhook', from: 62, to: 118, name: 'Push in: dashed score line + brass pins = the secret hinge' },
  { id: 'S3-array', from: 118, to: 186, name: 'Row tags 1–7, then 6 across the top' },
  { id: 'S4-notice', from: 186, to: 296, name: 'Can you find five rows? quiet pause, then rows 1–5 light up' },
  { id: 'S5-fold', from: 296, to: 352, name: 'Baker pulls the tab, tray folds after row 5, 2-row panel swings forward and apart' },
  { id: 'S6-proof', from: 352, to: 508, name: '5 × 6 = 30 flap rises; 2 × 6 = 12 flap drops; each panel glows once' },
  { id: 'S7-combine', from: 508, to: 616, name: 'Unfold, click; 30 travels down; flap flips to 30 + 12 = 42' },
  { id: 'S8-payoff', from: 616, to: 800, name: 'Tag returns, ? flips to 42; takeaway: split into facts you know' },
  { id: 'S9-cta', from: 800, to: 900, name: 'Page turns to the TableVerse card' },
];

// key frames
export const TRAY_RISE = [0, 16];
export const ROW_POP = (r) => -4 + r * 2; // row r (0..6) pops (row 1 already popping on frame 0)
export const TAG_IN = [0, 22];
export const TAG_OUT = [140, 156];
export const HINGE_DRAW = [74, 100];
export const ROW_TAGS = [124, 160]; // row tags 1..7 appear (stagger) and stay until ROW_TAGS_OUT
export const ROW_TAGS_OUT = 182;
export const COL_SIX = [156, 186];
export const PAUSE = [224, 262];
export const ROW_LIGHT = (r) => 262 + r * 6; // rows 1..5 (r = 0..4) light up after the pause
export const TAB_PULL = [300, 330];
export const FOLD = [304, 342]; // panel swings forward and drops
export const LABEL_TOP = 356;
export const GLOW_UPPER = 386;
export const LOWER_FOCUS = 414;
export const LABEL_BOTTOM = 458;
export const GLOW_LOWER = 486;
export const UNFOLD = [512, 540];
export const CLICK = 540;
export const CHIP = [552, 580]; // "30" travels to the lower flap
export const FLAP_FLIP = [576, 594]; // lower flap flips to 30 + 12 = 42
export const GLOW_ALL = 596;
export const TAG_BACK = [604, 622];
export const TAG_FLIP = [648, 662]; // ? -> 42 on "forty-two"
export const TAKEAWAY_OPEN = [700, 724];
export const TAKEAWAY_CLOSE = [770, 790];
export const FLAP_FLIP2 = [704, 722]; // lower flap flips to "7 rows = 5 + 2"
export const PAGE_TURN = [800, 824];
export const CTA_POP = 820;

// Narration placement (clip id -> start frame)
export const VO = { v01: 6, v02: 62, v03: 120, v04: 186, v05: 296, v06: 352, v07: 414, v08: 508, v09: 616, v10: 690, v11: 820 };

// Captions [lines, in, out] — upper band (centre y 318), within x 100–900
export const CAPTIONS = [
  [['7 × 6 feels tricky?'], 6, 60],
  [['This tray has a secret hinge.'], 62, 116],
  [['7 rows of 6 cupcakes.'], 120, 182],
  [['Can you find 5 rows?'], 186, 292],
  [['Fold the tray after row 5.'], 296, 348],
  [['5 rows of 6 make 30.'], 352, 410],
  [['2 rows are left.'], 414, 452],
  [['2 rows are left.', '2 sixes make 12.'], 452, 504],
  [['Unfold and add:'], 508, 550],
  [['Unfold and add:', '30 + 12 = 42.'], 550, 612],
  [['So 7 × 6 = ?'], 616, 652],
  [['So 7 × 6 = 42.'], 652, 686],
  [['Stuck on a big fact?'], 690, 726],
  [['Stuck on a big fact?', 'Split it into facts you know.'], 726, 798],
  [['Play and learn tables', 'with TableVerse.'], 820, 900],
];

export function sfxEvents() {
  const ev = [];
  ev.push(['rise', TRAY_RISE[0], { dur: 18 }]);
  for (let r = 0; r < 7; r++) ev.push(['pop', Math.max(0, ROW_POP(r) + 4), { pitch: 0.9 + r * 0.06 }]);
  ev.push(['swing', TAG_IN[0] + 4, {}]);
  ev.push(['score', HINGE_DRAW[0], { dur: HINGE_DRAW[1] - HINGE_DRAW[0] }], ['glint', HINGE_DRAW[1], {}]);
  for (let r = 0; r < 7; r++) ev.push(['tick', ROW_TAGS[0] + r * 5, { pitch: 1 + r * 0.05 }]);
  ev.push(['tick', COL_SIX[0] + 4, { pitch: 1.5 }]);
  ev.push(['swing', TAG_OUT[0], { up: true }]);
  for (let r = 0; r < 5; r++) ev.push(['light', ROW_LIGHT(r), { step: r }]);
  ev.push(['slide', TAB_PULL[0], { dur: TAB_PULL[1] - TAB_PULL[0] }], ['hinge', FOLD[0] + 2, { dur: FOLD[1] - FOLD[0] }]);
  ev.push(['flap', LABEL_TOP, {}], ['chime', GLOW_UPPER, { step: 0 }]);
  ev.push(['flap', LABEL_BOTTOM, { pitch: 0.9 }], ['chime', GLOW_LOWER, { step: 1 }]);
  ev.push(['hinge', UNFOLD[0], { dur: UNFOLD[1] - UNFOLD[0] }], ['click', CLICK, {}], ['slide', UNFOLD[0] + 2, { dur: 20 }]);
  ev.push(['whoosh', CHIP[0], { dur: CHIP[1] - CHIP[0] }], ['flap', FLAP_FLIP[0], { pitch: 1.1 }], ['chime', GLOW_ALL, { step: 2 }]);
  ev.push(['swing', TAG_BACK[0], {}], ['flap', TAG_FLIP[0], { pitch: 1.2 }], ['sparkle', TAG_FLIP[1], {}]);
  ev.push(['hinge', TAKEAWAY_OPEN[0], { dur: 24, soft: true }], ['flap', FLAP_FLIP2[0], { pitch: 1.0 }], ['hinge', TAKEAWAY_CLOSE[0], { dur: 20, soft: true }], ['click', TAKEAWAY_CLOSE[1], { soft: true }]);
  ev.push(['page', PAGE_TURN[0], { dur: PAGE_TURN[1] - PAGE_TURN[0] }], ['pop', CTA_POP + 2, { pitch: 0.75 }], ['sparkle', CTA_POP + 6, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, captions: CAPTIONS, sfx: sfxEvents(), pause: PAUSE };
}
