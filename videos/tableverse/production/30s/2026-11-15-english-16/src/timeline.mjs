// "Pack in Sevens" (63 ÷ 7 = 9, and back: 9 × 7 = 63) — frames @ 30 fps; 900 frames = 30.000 s.
// Frame 0 is the finished hook image (also the thumbnail): pack 1 (a clear lid over the first row of seven) is
// closed and the mouse is pulling pack 2 shut by a ribbon; card "63 ÷ 7 = ?", headline "HOW MANY PACKS?" —
// no intro, no fade, no empty setup.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 100, name: 'Frame 0: 63 star cookies, pack 1 closed, the mouse pulling pack 2 shut; "HOW MANY PACKS?"; card 63 ÷ 7 = ?' },
  { id: 'S2-one-pack', from: 100, to: 176, name: 'Pack 1 glows; numbers 1–7 across it' },
  { id: 'S3-guess', from: 176, to: 262, name: 'Can you guess how many packs? quiet pause' },
  { id: 'S4-pack', from: 262, to: 428, name: 'The mouse closes packs 2–9 down the tray, counting 2…9' },
  { id: 'S5-result', from: 428, to: 546, name: 'Nine packs glow; card flips to 63 ÷ 7 = 9' },
  { id: 'S6-unpack', from: 546, to: 646, name: 'Lids open in a wave (tags stay); card flips to 9 × 7 = 63' },
  { id: 'S7-takeaway', from: 646, to: 810, name: '? × 7 = 63; tags 1–9 counted; 9 × 7 = 63; rows re-pack (reversible)' },
  { id: 'S8-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

export const HEADLINE_OUT = [84, 98];
export const ONE_GLOW = 102; // pack 1 (closed from frame 0) glows on "That's one pack"
export const NUMS = [130, 4]; // numbers 1..7 across row 1
export const NUMS_OUT = 172;
export const PAUSE = [216, 258];
export const WRAP_AT = (r) => 262 + (r - 1) * 20; // zero-based row r (1..8 = packs 2..9) closes; count word on the same frame
export const ALL_GLOW = 430;
export const UNPACK = [556, 4]; // lids open in a wave: start, stagger
export const REPACK = [748, 4]; // lids close again in a wave
export const CARD_FLIPS = [
  [511, 1], // 63 ÷ 7 = ?  -> 63 ÷ 7 = 9 (swap on "nine")
  [603, 2], // -> 9 × 7 = 63 (swap on "sixty-three")
  [672, 3], // -> ? × 7 = 63 (on "what times seven")
  [742, 2], // -> 9 × 7 = 63
];
export const ROW_TAGS = [690, 3]; // rows tagged 1..9 while the question is asked (count the groups of seven)
export const ROW_TAGS_OUT = 800;
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

export const VO = {
  v01: 2, v02: 100, v03: 176,
  c2: WRAP_AT(1), c3: WRAP_AT(2), c4: WRAP_AT(3), c5: WRAP_AT(4), c6: WRAP_AT(5), c7: WRAP_AT(6), c8: WRAP_AT(7), c9: WRAP_AT(8),
  v05: 428, v06: 546, v07: 646, v08: 832,
};

// v01 is carried on screen by the frame-0 headline + card; captions start with v02
const counts = [2, 3, 4, 5, 6, 7, 8, 9];
export const CAPTIONS = [
  [["That's one pack."], 100, 128],
  [["That's one pack.", '7 cookies in each.'], 128, 170],
  [['Can you guess', 'how many packs?'], 176, 258],
  ...counts.map((n, i) => [['Packs:', counts.slice(0, i + 1).join(', ') + (n === 9 ? '!' : '')], WRAP_AT(i + 1), i === 7 ? 424 : WRAP_AT(i + 2)]),
  [['9 packs!'], 428, 466],
  [['9 packs!', 'So 63 ÷ 7 is…'], 466, 518],
  [['9 packs!', 'So 63 ÷ 7 = 9.'], 518, 542],
  [['Now unpack them:'], 546, 600],
  [['Now unpack them:', '9 sevens make 63.'], 600, 640],
  [['To divide, ask:'], 646, 680],
  [['To divide, ask:', 'what times 7 makes 63?'], 680, 806],
  [['Play and learn tables', 'with TableVerse.'], 832, 900],
];

export function sfxEvents() {
  const ev = [];
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  ev.push(['light', ONE_GLOW, { step: 0 }]);
  for (let c = 0; c < 7; c++) ev.push(['tick', NUMS[0] + c * NUMS[1], { pitch: 1.3 + c * 0.05 }]);
  for (let r = 1; r <= 8; r++) ev.push(['slide', WRAP_AT(r) - 12, { dur: 8 }], ['flap', WRAP_AT(r) - 4, { pitch: 0.9 + r * 0.03 }], ['light', WRAP_AT(r), { step: Math.min(4, Math.floor(r / 2)) }]);
  ev.push(['chime', ALL_GLOW, { step: 2 }]);
  for (const [f0] of CARD_FLIPS) ev.push(['flap', f0, { pitch: 1.1 }]);
  ev.push(['sparkle', 520, {}]);
  for (let r = 0; r < 9; r += 2) ev.push(['flap', UNPACK[0] + r * UNPACK[1], { pitch: 1.2 - r * 0.03 }]);
  for (let r = 0; r < 9; r++) ev.push(['tick', ROW_TAGS[0] + r * ROW_TAGS[1], { pitch: 1 + r * 0.05 }]);
  for (let r = 0; r < 9; r += 2) ev.push(['flap', REPACK[0] + r * REPACK[1], { pitch: 0.95 + r * 0.03 }]);
  ev.push(['click', REPACK[0] + 8 * REPACK[1] + 12, { soft: true }]);
  ev.push(['page', PAGE_TURN[0], { dur: PAGE_TURN[1] - PAGE_TURN[0] }], ['pop', CTA_POP + 2, { pitch: 0.75 }], ['sparkle', CTA_POP + 6, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, captions: CAPTIONS, sfx: sfxEvents(), pause: PAUSE };
}
