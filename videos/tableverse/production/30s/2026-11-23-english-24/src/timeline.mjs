// "How Far Around?" (a square rooftop: one side is 8 hops, all four sides are the same, so the way around is
// 4 × 8 = 32 hops — the perimeter) — frames @ 30 fps; 900 = 30.000 s. Music at 100 bpm: one beat = 18 frames.
// Frame 0 is the finished hook image (also the thumbnail): the little star at the corner of a big square rooftop high
// above an enchanted vertical city, shading its eyes to look along the long edge; headline "HOW FAR AROUND?".
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;
export const BEAT = 18;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 54, name: 'Close: the star at the roof corner looking along the edge; "HOW FAR AROUND?"' },
  { id: 'S2-city', from: 54, to: 126, name: 'Wide: the square rooftop on top of the vertical city; the mouse raises the start flag' },
  { id: 'S3-side', from: 126, to: 252, name: 'Tracking: the star hops the top side, 8 hops; one side is eight hops' },
  { id: 'S4-oof', from: 252, to: 342, name: 'Close: flops at the corner — does it have to count every side? pull back to the long way round' },
  { id: 'S5-square', from: 342, to: 450, name: 'Wide: it is a square — the measured side rotates onto the other three sides; equal-side ticks' },
  { id: 'S6-lap', from: 450, to: 600, name: 'Speed lap: 8, 16, 24, 32; finish with confetti and the flag' },
  { id: 'S7-payoff', from: 600, to: 810, name: 'Sign 4 × 8 = 32; the perimeter glows around; four times one side' },
  { id: 'S8-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

export const SHOTS = [
  { from: 0, to: 54, z: [1.75, 1.8], f: [[330, 760], [334, 764]] },
  { from: 54, to: 126, z: [1.0, 1.05], f: [[540, 960], [540, 980]] },
  { from: 126, to: 252, z: [1.45, 1.45], f: [[300, 820], [800, 820]], track: true },
  { from: 252, to: 342, z: [1.75, 1.05], f: [[790, 760], [540, 980]] },
  { from: 342, to: 450, z: [1.0, 1.02], f: [[540, 980], [540, 985]] },
  { from: 450, to: 600, z: [1.08, 1.0], f: [[540, 990], [540, 975]] },
  { from: 600, to: 810, z: [1.0, 1.06], f: [[540, 975], [540, 990]] },
  { from: 810, to: 900, z: [1.0, 1.0], f: [[540, 960], [540, 960]] },
];

export const HEADLINE_OUT = [38, 52]; // after "How far around?" is spoken
export const FLAG_UP = [70, 120]; // the mouse raises / waves the start flag
export const HOPS = [128, 9]; // hop k (0..7) along the top side lands at 128 + 9 * (k + 1)
export const FLOP = [252, 270]; // flops at the corner
export const PULLBACK = [300, 342];
export const COPIES = [378, 396, 414]; // the measured side swings onto the right, bottom and left sides
export const TICKS = 432; // equal-side ticks pulse together
export const LAP = [438, 534]; // speed lap: one side every 24 frames (side k done at 438 + 24 (k + 1))
export const COUNTS = [456, 480, 504, 528]; // "Eight! Sixteen! Twenty-four! Thirty-two!" (side k completes at LAP[0] + 24 (k + 1) - 18)
export const FINISH = 540; // confetti + flag
export const SIGN = [618, 634]; // payoff sign 4 × 8 = 32 on the roof garden
export const AROUND = [690, 780]; // a light runs all the way around (the perimeter)
export const SIDE_PULSE = [736, 748, 760, 772]; // "four times one side": each side pulses in turn
export const WINK = 794;
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

export const VO = { v01: 2, v02: 204, v03: 256, v04: 342, c08: 456, c16: 480, c24: 504, c32: 528, v05: 618, v06: 690, v07: 838 };
export const VO_CLIP = {};

// The headline carries "How far around?"; the rest of v01 gets a caption once it folds away.
export const CAPTIONS = [
  [['This little star wants to', 'hop one lap of the roof!'], 54, 124],
  [['One side is 8 hops.'], 204, 250],
  [['Oof! Does it have to', 'count every side?'], 256, 336],
  [["No! It's a square:", 'all 4 sides are the same.'], 342, 448],
  [['8!'], 456, 480],
  [['8, 16!'], 480, 504],
  [['8, 16, 24!'], 504, 528],
  [['8, 16, 24, 32!'], 528, 600],
  [['4 times 8 is 32 hops.'], 618, 686],
  [['The distance around is the', 'perimeter: 4 times one side!'], 690, 806],
  [['Play and learn tables', 'with TableVerse.'], 838, 900],
];

export function sfxEvents() {
  const ev = [];
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }], ['swing', FLAG_UP[0], { pitch: 1.2 }], ['tok', FLAG_UP[0] + 10, { pitch: 1.3 }]);
  for (let k = 0; k < 8; k++) ev.push(['hop', HOPS[0] + HOPS[1] * (k + 1) - 2, { pitch: 1 + 0.05 * k }]);
  ev.push(['flop', FLOP[0] + 10, {}], ['puff', FLOP[0] + 14, {}], ['whoosh', PULLBACK[0], { dur: 30 }]);
  for (let k = 0; k < 3; k++) ev.push(['slide', COPIES[k] - 12, { dur: 12 }], ['tick', COPIES[k], { pitch: 1.1 + 0.1 * k }]);
  ev.push(['light', TICKS, { step: 2 }]);
  ev.push(['zoom', LAP[0], { dur: LAP[1] - LAP[0] }]);
  for (let k = 0; k < 4; k++) ev.push(['pop', COUNTS[k] - 4, { pitch: 0.9 + 0.12 * k }]);
  ev.push(['sparkle', FINISH, {}], ['swing', FINISH + 2, { pitch: 1.3 }]);
  ev.push(['flap', SIGN[0], { pitch: 0.9 }], ['chime', SIGN[0] + 8, { step: 2 }]);
  ev.push(['whoosh', AROUND[0], { dur: AROUND[1] - AROUND[0] }]);
  for (let k = 0; k < 4; k++) ev.push(['tick', SIDE_PULSE[k], { pitch: 1.2 + 0.08 * k }]);
  ev.push(['glint', WINK, {}]);
  // page rustle and end-card pop finish before "Play" (approved english-17 correction)
  ev.push(['page', PAGE_TURN[0], { dur: 18 }], ['pop', PAGE_TURN[0] + 12, { pitch: 0.75 }], ['sparkle', PAGE_TURN[0] + 16, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, vo_clip: VO_CLIP, captions: CAPTIONS, sfx: sfxEvents(), pause: [270, 300] };
}
