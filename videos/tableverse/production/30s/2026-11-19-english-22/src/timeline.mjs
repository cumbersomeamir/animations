// "Too Many Aliens!" (3 lifts × 4 seats = 12; the 13th alien is left over) — frames @ 30 fps; 900 = 30.000 s.
// Music at 100 bpm: one beat = 18 frames; cuts, dings and taps land on the beat grid.
// Frame 0 is the finished hook image (also the thumbnail): a close-up of an absurdly full lift with the tiny orange
// alien squashed in the doors, headline "TOO MANY ALIENS!" — no intro, no fade, no empty setup.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;
export const BEAT = 18;

export const SCENES = [
  { id: 'S1-lift1', from: 0, to: 90, name: 'Close-up: tiny alien squashed in the full lift 1; "TOO MANY ALIENS!"; pops out' },
  { id: 'S2-lift2', from: 90, to: 144, name: 'Cut: lift 2 — full! belly-bounce, pops out' },
  { id: 'S3-lift3', from: 144, to: 216, name: 'Cut: lift 3 — full again! doors catch its antenna, twang, lands on its bottom' },
  { id: 'S4-question', from: 216, to: 306, name: 'Cut wide: three closed lifts; the tiny alien taps its foot: why is there never room?' },
  { id: 'S5-reveal', from: 306, to: 474, name: 'Ding, ding, ding: all three lifts open; four aliens in each; count 4, 8, 12' },
  { id: 'S6-thirteen', from: 474, to: 570, name: 'Push-in: twelve seats; one more alien makes thirteen (spotlight)' },
  { id: 'S7-payoff', from: 570, to: 720, name: 'Wide: sign 3 × 4 = 12; groups outlined; one left over; lifts go up and lift 1 comes back empty' },
  { id: 'S8-gag', from: 720, to: 810, name: 'Close-up lift 1: the next lift is all yours — the tiny alien sprawls across the seats, winks' },
  { id: 'S9-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

// shots: hard cuts on the beat; z = zoom, f = focus point (world) kept at the screen centre
export const SHOTS = [
  { from: 0, to: 90, z: [2.0, 2.08], f: [[215, 1130], [215, 1142]] },
  { from: 90, to: 144, z: [2.0, 2.06], f: [[500, 1130], [500, 1140]] },
  { from: 144, to: 216, z: [2.0, 2.08], f: [[785, 1130], [785, 1142]] },
  { from: 216, to: 306, z: [1.0, 1.55], f: [[540, 960], [520, 1330]] },
  { from: 306, to: 474, z: [1.0, 1.0], f: [[540, 960], [540, 960]] },
  { from: 474, to: 570, z: [1.0, 1.5], f: [[540, 960], [510, 1330]] },
  { from: 570, to: 720, z: [1.0, 1.0], f: [[540, 960], [540, 960]] },
  { from: 720, to: 810, z: [2.0, 2.08], f: [[215, 1130], [215, 1142]] },
  { from: 810, to: 900, z: [1.0, 1.0], f: [[540, 960], [540, 960]] },
];

export const HEADLINE_OUT = [80, 94];
export const POP1 = 54; // the tiny alien pops out of lift 1
export const LAND1 = 72;
export const DOORS1_SHUT = [56, 66];
export const DASH2 = [92, 104], SQUEEZE2 = [104, 116], POP2 = 120, LAND2 = 134;
export const DASH3 = [146, 158], SQUEEZE3 = [158, 172], STRETCH3 = [172, 186], LAND3 = 200;
export const STOMP = [222, 246]; // gets up and stomps to the middle
export const TAPS = [252, 270, 288]; // foot taps on the beat
export const DINGS = [324, 342, 360]; // lifts 1, 2, 3 open
export const COUNTS = [414, 432, 450]; // "Four! Eight! Twelve!" lift k glows
export const SEATS_GLOW = 478; // "Twelve seats."
export const HOP13 = 510; // tiny hops into the spotlight: "one more alien makes thirteen"
export const SIGN = [578, 596]; // payoff sign drops: 3 × 4 = 12
export const GROUPS = 584; // dashed outlines round each lift's four
export const LEFTOVER = 618; // ring round the tiny alien: "one is left over"
export const DOORS_SHUT = [666, 684]; // all three close on the twelve
export const UP = [684, 708]; // up-arrows flash: they ride up
export const DOWN1 = [708, 726]; // lift 1 comes back down
export const OPEN1 = 726; // empty lift 1 opens
export const ZOOM_IN = [738, 754]; // tiny zooms in
export const SPRAWL = 756;
export const WINK = 794;
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

export const VO = { v01: 2, v02: 94, v03: 148, v04: 222, v05: 306, v06: 364, c04: 414, c08: 432, c12: 450, v07: 474, v08: 576, v09: 720, v10: 838 };
export const VO_CLIP = {};

// The headline carries v01 on screen; captions start with v02. A caption whose first line extends the previous one
// (same start) updates in place without re-popping.
export const CAPTIONS = [
  [['Lift 2? Full!'], 94, 140],
  [['Lift 3? Full again!'], 148, 214],
  [['Why is there never room?'], 222, 304],
  [["Let's peek inside!"], 306, 362],
  [['Each lift has 4 aliens.'], 364, 410],
  [['4!'], 414, 432],
  [['4, 8!'], 432, 450],
  [['4, 8, 12!'], 450, 470],
  [['12 seats.'], 474, 500],
  [['12 seats.', 'One more alien makes 13!'], 500, 566],
  [['3 times 4 is 12,'], 576, 610],
  [['3 times 4 is 12,', 'so 1 is left over.'], 610, 660],
  [['The next lift is all yours,', 'little one!'], 720, 806],
  [['Play and learn tables', 'with TableVerse.'], 838, 900],
];

export function sfxEvents() {
  const ev = [];
  // hook: doors straining, the pop, the landing, the doors slamming
  ev.push(['squeak', 6, { dur: 40 }], ['boing', POP1, { pitch: 1.1 }], ['thud', LAND1, { soft: true }], ['clunk', DOORS1_SHUT[1], {}]);
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  ev.push(['whoosh', DASH2[0], { dur: 12 }], ['squish', SQUEEZE2[0] + 2, {}], ['clunk', SQUEEZE2[1], {}], ['boing', POP2, { pitch: 1.3 }], ['thud', LAND2, { soft: true }]);
  ev.push(['whoosh', DASH3[0], { dur: 12 }], ['squish', SQUEEZE3[0] + 2, {}], ['clunk', SQUEEZE3[1], {}], ['stretch', STRETCH3[0] + 2, { pitch: 0.8 }], ['twang', STRETCH3[1], {}], ['thud', LAND3, {}]);
  for (const t of TAPS) ev.push(['tok', t, { pitch: 0.75 }]);
  ev.push(['tok', STOMP[0] + 6, { pitch: 0.6 }], ['tok', STOMP[0] + 14, { pitch: 0.65 }]);
  for (let k = 0; k < 3; k++) ev.push(['ding', DINGS[k], { step: k }], ['slide', DINGS[k] + 1, { dur: 14 }]);
  for (let k = 0; k < 3; k++) ev.push(['pop', COUNTS[k], { pitch: 0.9 + k * 0.12 }]);
  ev.push(['light', SEATS_GLOW, { step: 1 }], ['boing', HOP13, { pitch: 1.5, soft: true }], ['sparkle', HOP13 + 6, {}]);
  ev.push(['flap', SIGN[0], { pitch: 0.9 }], ['chime', SIGN[0] + 8, { step: 2 }], ['light', LEFTOVER, { step: 4 }]);
  ev.push(['slide', DOORS_SHUT[0], { dur: 16 }], ['clunk', DOORS_SHUT[1], { soft: true }], ['whoosh', UP[0], { dur: 22 }], ['ding', DOWN1[1] - 2, { step: 0 }], ['slide', OPEN1, { dur: 14 }]);
  ev.push(['whoosh', ZOOM_IN[0], { dur: 14 }], ['squish', SPRAWL, {}], ['glint', WINK, {}]);
  // page rustle and end-card pop finish before "Play" (approved english-17 correction)
  ev.push(['page', PAGE_TURN[0], { dur: 18 }], ['pop', PAGE_TURN[0] + 12, { pitch: 0.75 }], ['sparkle', PAGE_TURN[0] + 16, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, vo_clip: VO_CLIP, captions: CAPTIONS, sfx: sfxEvents(), pause: [252, 306] };
}
