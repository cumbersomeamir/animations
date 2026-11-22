// "Is It Time Yet?" (the cloud train leaves when the big hand reaches 3: three jumps of five minutes, 5 × 3 = 15) —
// frames @ 30 fps; 900 = 30.000 s. Music at 100 bpm: one beat = 18 frames; clock jumps and cuts land on the beat grid.
// Frame 0 is the finished hook image (also the thumbnail): the sleepy dragon squashed under an absurd giant pillow on
// the cloud-station platform, the station clock and the waiting cloud train, headline "IS IT TIME YET?".
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;
export const BEAT = 18;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 126, name: 'Close: dragon squashed under a giant pillow, "IS IT TIME YET?"; cut to the station: clock at :00, train waiting' },
  { id: 'S2-wake', from: 126, to: 162, name: 'Close-up dragon: one eye opens, yawn' },
  { id: 'S3-five', from: 162, to: 234, name: 'Clock close-up: the big hand jumps to 1 — five minutes, not yet' },
  { id: 'S4-snore', from: 234, to: 270, name: 'Close-up dragon: flops back under the pillow, snores' },
  { id: 'S5-ten', from: 270, to: 306, name: 'Clock close-up: the big hand jumps to 2 — ten minutes' },
  { id: 'S6-jam', from: 306, to: 396, name: 'Wide: the dragon rushes the pillow at the door — jammed! the conductor robot wags a finger' },
  { id: 'S7-fifteen', from: 396, to: 432, name: 'Clock close-up: the big hand jumps to 3 — fifteen minutes' },
  { id: 'S8-board', from: 432, to: 558, name: 'Wide: whistle, the pillow squeezes through the door with a pop, the train puffs away' },
  { id: 'S9-payoff', from: 558, to: 810, name: 'Clock close-up: three jumps of five; sign 5 × 3 = 15; each number is five more minutes' },
  { id: 'S10-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

export const SHOTS = [
  { from: 0, to: 54, z: [1.6, 1.66], f: [[350, 1350], [350, 1356]] }, // frame 0: the dragon squashed under the giant pillow
  { from: 54, to: 126, z: [1.0, 1.08], f: [[540, 960], [500, 1030]] }, // cut on the beat to the station: clock, train, platform
  { from: 126, to: 162, z: [1.85, 1.92], f: [[330, 1330], [330, 1338]] },
  { from: 162, to: 234, z: [2.0, 2.05], f: [[540, 770], [540, 775]] },
  { from: 234, to: 270, z: [1.85, 1.9], f: [[330, 1330], [330, 1336]] },
  { from: 270, to: 306, z: [2.0, 2.05], f: [[540, 770], [540, 775]] },
  { from: 306, to: 396, z: [1.0, 1.05], f: [[540, 975], [540, 990]] },
  { from: 396, to: 432, z: [2.0, 2.05], f: [[540, 770], [540, 775]] },
  { from: 432, to: 558, z: [1.05, 1.0], f: [[540, 990], [540, 965]] },
  { from: 558, to: 810, z: [1.95, 2.05], f: [[540, 800], [540, 810]] },
  { from: 810, to: 900, z: [1.0, 1.0], f: [[540, 960], [540, 960]] },
];

export const HEADLINE_OUT = [36, 50]; // after "Is it time yet?" is spoken
export const TICKS = [162, 270, 396]; // the big hand jumps to 1, 2, 3 (5, 10, 15 minutes)
export const PEEK = 132; // one eye opens
export const YAWN = [140, 160];
export const FLOP = [236, 252]; // back under the pillow
export const RUSH = [312, 338]; // grabs the pillow and rushes to the door
export const JAM = 340; // the pillow jams in the door: boing
export const WAG = [346, 376]; // the conductor wags a finger
export const BOUNCE = [352, 372]; // bounced back onto the platform
export const WHISTLE = 448; // after "All aboard!" so it never masks the word
export const SQUEEZE = [454, 484]; // the pillow squeezes through the door
export const POP = 486;
export const DOOR_SHUT = [494, 508];
export const DEPART = [510, 558]; // the train puffs away to the right
export const WEDGES = [574, 592, 610]; // "three jumps of five minutes": the three filled wedges pulse in turn
export const SIGN = [650, 666]; // payoff sign 5 × 3 = 15 (below the clock)
export const MORE = [720, 738, 756, 774]; // "each number is five more minutes": the hand steps on 4, 5, 6, 7
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

export const VO = { v01: 2, v02: 127, v03: 174, v04: 274, v05: 400, v06: 562, v07: 648, v08: 712, v09: 838 };
export const VO_CLIP = {};

// The headline carries "Is it time yet?"; the rest of v01 gets a caption once it folds away.
export const CAPTIONS = [
  [['The cloud train leaves when', 'the big hand reaches 3!'], 54, 124],
  [['Wake up, sleepy dragon!'], 127, 166],
  [['5 minutes. Not yet!'], 174, 232],
  [['10 minutes.'], 274, 300],
  [['10 minutes.', 'Still not yet!'], 300, 340],
  [['15 minutes.'], 400, 428],
  [['15 minutes.', 'All aboard!'], 428, 468],
  [['3 jumps of 5 minutes.'], 562, 640],
  [['3 times 5 is 15.'], 648, 704],
  [['Each number on the clock', 'is 5 more minutes!'], 712, 806],
  [['Play and learn tables', 'with TableVerse.'], 838, 900],
];

export function sfxEvents() {
  const ev = [];
  // the station clock ticks on every beat until the train leaves; jumps get a spring
  for (let t = 0; t < DEPART[0]; t += BEAT) ev.push(['tick', t, { pitch: (t / BEAT) % 2 ? 0.8 : 1.0 }]);
  for (const t of TICKS) ev.push(['clockjump', t, {}]);
  ev.push(['snore', 4, { dur: 30 }], ['snore', 60, { dur: 30 }], ['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  ev.push(['yawn', YAWN[0], { dur: YAWN[1] - YAWN[0] }], ['flop', FLOP[0] + 8, {}], ['snore', FLOP[1] + 2, { dur: 16 }]);
  ev.push(['whoosh', RUSH[0], { dur: 20 }], ['boing', JAM, { pitch: 0.8 }], ['thud', BOUNCE[1], { soft: true }]);
  for (let k = 0; k < 3; k++) ev.push(['tok', WAG[0] + 4 + k * 9, { pitch: 1.4 }]);
  ev.push(['whistle', WHISTLE, {}], ['squish', SQUEEZE[0] + 4, {}], ['stretch', SQUEEZE[0] + 14, { pitch: 0.7 }], ['cork', POP, {}], ['clunk', DOOR_SHUT[1], { soft: true }]);
  ev.push(['chug', DEPART[0], { dur: DEPART[1] - DEPART[0] + 12 }]);
  for (let k = 0; k < 3; k++) ev.push(['light', WEDGES[k], { step: k }]);
  ev.push(['flap', SIGN[0], { pitch: 0.9 }], ['chime', SIGN[0] + 8, { step: 2 }]);
  for (const t of MORE) ev.push(['tick', t, { pitch: 1.2 }]);
  // page rustle and end-card pop finish before "Play" (approved english-17 correction)
  ev.push(['page', PAGE_TURN[0], { dur: 18 }], ['pop', PAGE_TURN[0] + 12, { pitch: 0.75 }], ['sparkle', PAGE_TURN[0] + 16, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, vo_clip: VO_CLIP, captions: CAPTIONS, sfx: sfxEvents(), pause: [234, 270] };
}
