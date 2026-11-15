// "The Robot That Packs in Tens" (4 × 30 = 4 × 3 tens = 12 tens = 120) — frames @ 30 fps; 900 frames = 30.000 s.
// Frame 0 is the finished hook image (also the thumbnail): 120 loose cookies (4 rows of 30), an overwhelmed robot
// counting them one by one, card "4 × 30 = ?", headline "TOO MANY TO COUNT?" — no intro, no fade, no empty setup.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 104, name: 'Frame 0: overwhelmed robot counting 120 cookies one by one; "TOO MANY TO COUNT?"; card 4 × 30 = ?' },
  { id: 'S2-idea', from: 104, to: 156, name: 'Light-bulb: the robot packs them in tens' },
  { id: 'S3-row', from: 156, to: 284, name: 'Row 1: ten cookies hop into each tube — ten, twenty, thirty; one row is three tens' },
  { id: 'S4-fast', from: 284, to: 362, name: 'Rows 2–4 packed at top speed: four rows, three tens in each' },
  { id: 'S5-count', from: 362, to: 520, name: 'How many tens in all? quiet pause; tubes counted 1–12: twelve tens' },
  { id: 'S6-hundred', from: 520, to: 646, name: 'Ten tubes jump into the hundred crate; two more tens; card 4 × 30 = 120' },
  { id: 'S7-takeaway', from: 646, to: 810, name: 'Tubes hop back: 4 × 3 = 12, so 4 × 30 = 12 tens; robot dance' },
  { id: 'S8-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

export const HEADLINE_OUT = [84, 98];
export const COUNT_HOP = 8; // hook: the robot's counting ring hops one cookie every 8 frames
export const IDEA = 108; // light bulb
export const PACK_AT = (t) => (t < 3 ? 156 + t * 24 : 286 + (t - 3) * 6); // tube t (0..11, row-major) starts packing
export const PACK_LEN = 20; // tube rises, ten cookies hop in, cap clicks
export const ROW1_GLOW = 256; // "one row is three tens"
export const FAST = [284, 356]; // rows 2–4 at top speed
export const PAUSE = [398, 440];
export const TAGS = [440, 4]; // tubes tagged 1..12
export const TAGS_OUT = 520;
export const CRATE_UP = [506, 520]; // the hundred crate pops up on its hinge
export const TO_CRATE = [522, 2, 10]; // tube k (0..9) leaves at 522 + 2k, flight 12 frames
export const HUNDRED = 548; // "one hundred"
export const TWENTY = 586; // "two more tens"
export const BACK = [650, 2, 12]; // tubes hop back into the four rows
export const CRATE_DOWN = [690, 704];
export const CARD_FLIPS = [
  [604, 1], // 4 × 30 = ?  -> 4 × 30 = 120 (swap on "one hundred twenty")
  [669, 2], // -> 4 × 3 = 12 (swap on "twelve")
  [730, 3], // -> 4 × 30 = 120 (swap on "twelve tens")
];
export const DANCE = [766, 808];
export const ALL_GLOW = 772;
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

const done = (t) => PACK_AT(t) + PACK_LEN;
export const VO = {
  v01: 2, v02: 106, c10: done(0), c20: done(1), c30: done(2), v04: 244, v05: 290, v06: 364, v07: 490, v08: 522, v09: 650, v10: 834,
};

// v01 is carried on screen by the frame-0 headline + card; captions start with v02.
// A caption whose first line extends the previous one (same start) updates in place without re-popping.
export const CAPTIONS = [
  [['So the robot packs', 'them in tens.'], 106, 160],
  [['Ten!'], done(0), done(1)],
  [['Ten! Twenty!'], done(1), done(2)],
  [['Ten! Twenty! Thirty!'], done(2), 240],
  [['One row is 3 tens.'], 244, 284],
  [['4 rows, 3 tens in each.'], 290, 358],
  [['How many tens in all?'], 364, 486],
  [['12 tens!'], 490, 518],
  [['10 tens make 100.'], 522, 584],
  [['10 tens make 100.', '2 more tens make…'], 584, 611],
  [['10 tens make 100.', '2 more tens make 120.'], 611, 646],
  [['4 × 3 = 12,'], 650, 703],
  [['4 × 3 = 12,', 'so 4 × 30 = 12 tens.'], 703, 806],
  [['Play and learn tables', 'with TableVerse.'], 832, 900],
];

export function sfxEvents() {
  const ev = [];
  for (let f = 0; f < 96; f += COUNT_HOP) ev.push(['tick', f, { pitch: 0.9 }]);
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  ev.push(['glint', IDEA, {}], ['light', IDEA + 2, { step: 2 }]);
  for (let t = 0; t < 12; t++) {
    const s = PACK_AT(t);
    ev.push(['pop', s, { pitch: 1.1 + (t % 3) * 0.05 }]);
    if (t < 3) for (let k = 0; k < 10; k += 2) ev.push(['tick', s + 6 + k, { pitch: 1.2 + k * 0.04 }]);
    ev.push(['click', s + PACK_LEN - 1, { soft: t >= 3 }]);
  }
  ev.push(['whoosh', FAST[0], { dur: FAST[1] - FAST[0] }]);
  ev.push(['chime', ROW1_GLOW, { step: 0 }]);
  for (let t = 0; t < 12; t++) ev.push(['tick', TAGS[0] + t * TAGS[1], { pitch: 1 + t * 0.04 }]);
  ev.push(['hinge', CRATE_UP[0], { dur: CRATE_UP[1] - CRATE_UP[0], soft: true }]);
  ev.push(['whoosh', TO_CRATE[0], { dur: 30 }], ['chime', HUNDRED, { step: 2 }], ['light', TWENTY, { step: 3 }]);
  for (const [f0] of CARD_FLIPS) ev.push(['flap', f0, { pitch: 1.1 }]);
  ev.push(['sparkle', 612, {}]);
  ev.push(['whoosh', BACK[0], { dur: 30 }], ['hinge', CRATE_DOWN[0], { dur: CRATE_DOWN[1] - CRATE_DOWN[0], soft: true }]);
  ev.push(['chime', ALL_GLOW, { step: 1 }], ['sparkle', ALL_GLOW + 6, {}]);
  // page rustle and end-card pop finish before "Play" (QA: an overlapping pop masked the P)
  ev.push(['page', PAGE_TURN[0], { dur: 18 }], ['pop', PAGE_TURN[0] + 12, { pitch: 0.75 }], ['sparkle', PAGE_TURN[0] + 16, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, captions: CAPTIONS, sfx: sfxEvents(), pause: PAUSE };
}
