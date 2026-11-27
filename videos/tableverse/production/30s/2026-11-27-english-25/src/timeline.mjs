// "When's the Big Boom?" (Big Frog drums every 2 beats, Little Frog every 3 beats: they hit together on 6 because 6 is
// in the twos and the threes, 2 × 3 = 6, and again on 12) — frames @ 30 fps; 900 = 30.000 s.
// The music runs at 100 bpm: one beat = 18 frames; every counted beat, drum hit and cut lands on the beat grid.
// Frame 0 is the finished hook image (also the thumbnail): the two frog drummers on the lily-pad stage, sticks raised,
// eyes on each other; headline "WHEN'S THE BIG BOOM?".
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900;
export const BEAT = 18;

export const SCENES = [
  { id: 'S1-hook', from: 0, to: 54, name: 'Close: two frog drummers, sticks raised; "WHEN\'S THE BIG BOOM?"' },
  { id: 'S2-pond', from: 54, to: 108, name: 'Wide: the dusk pond, the lily-pad stage and the numbered beat track' },
  { id: 'S3-big', from: 108, to: 162, name: 'Close: Big Frog drums every two beats' },
  { id: 'S4-little', from: 162, to: 216, name: 'Close: Little Frog drums every three beats' },
  { id: 'S5-count', from: 216, to: 360, name: 'Wide: beats 1–6 with the firefly; hits on 2, 3, 4 — BOOM together on 6' },
  { id: 'S6-why', from: 360, to: 498, name: 'Beat-track close-up: orange dots under 2, 4, 6; cyan dots under 3, 6' },
  { id: 'S7-payoff', from: 498, to: 604, name: 'Six is in the twos and the threes: sign 2 × 3 = 6' },
  { id: 'S8-twelve', from: 604, to: 810, name: 'Beats 7–12; BOOM together on 12 — the lily-pad stage sinks, the frogs pop up' },
  { id: 'S9-cta', from: 810, to: 900, name: 'Page turns to the TableVerse card' },
];

export const SHOTS = [
  { from: 0, to: 54, z: [1.85, 1.9], f: [[550, 1080], [550, 1084]] },
  { from: 54, to: 108, z: [1.2, 1.23], f: [[522, 1100], [522, 1106]] },
  { from: 108, to: 162, z: [1.9, 1.96], f: [[400, 1050], [400, 1056]] },
  { from: 162, to: 216, z: [1.9, 1.96], f: [[700, 1070], [700, 1076]] },
  { from: 216, to: 360, z: [1.2, 1.23], f: [[522, 1100], [522, 1106]] },
  { from: 360, to: 498, z: [1.6, 1.64], f: [[425, 1150], [432, 1154]] },
  { from: 498, to: 604, z: [1.22, 1.27], f: [[528, 1066], [528, 1072]] },
  { from: 604, to: 810, z: [1.2, 1.23], f: [[522, 1100], [522, 1106]] },
  { from: 810, to: 900, z: [1.0, 1.0], f: [[540, 960], [540, 960]] },
];

export const HEADLINE_OUT = [30, 44]; // after "When's the big boom?"
// demo hits in the two close-ups
export const DEMO_BIG = [126]; // one show-off hit each, on the beat, during the word "drums"
export const DEMO_LITTLE = [180];
// the counted beats: beat k (1..12) lands at beatAt(k)
export const COUNT0 = 234; // beat 1 of the first run (1..6)
export const RUN2 = 666; // beat 7 of the second run (7..12)
export const beatAt = (k) => (k <= 6 ? COUNT0 + BEAT * (k - 1) : RUN2 + BEAT * (k - 7));
export const RINGS_BIG = [[2, 402], [4, 412], [6, 420]]; // "two, four, six"
export const RINGS_LITTLE = [[3, 464], [6, 474]]; // "three, six"
export const BOTH_PULSE = [504, 524]; // "Six is in the twos and the threes"
export const SIGN = [566, 582]; // "two times three is six"
export const SINK = [758, 784]; // the stage sinks after the second big boom
export const POPUP = [788, 806];
export const PAGE_TURN = [810, 834];
export const CTA_POP = 830;

export const VO = {
  v01: 2, v02: 110, v03: 168,
  n1: beatAt(1), n2: beatAt(2), n3: beatAt(3), n4: beatAt(4), n5: beatAt(5), n6: beatAt(6),
  v04: 364, v05: 446, v06: 500, v07: 610, v08: 838,
};
export const VO_CLIP = {};

// The headline carries "When's the big boom?"; the rest of v01 gets a caption once it folds away.
export const CAPTIONS = [
  [['Two frog drummers want', 'to hit together!'], 44, 104],
  [['Big Frog drums', 'every 2 beats.'], 110, 162],
  [['Little Frog drums', 'every 3 beats.'], 168, 228],
  [['1!'], beatAt(1), beatAt(2)],
  [['1, 2!'], beatAt(2), beatAt(3)],
  [['1, 2, 3!'], beatAt(3), beatAt(4)],
  [['1, 2, 3, 4!'], beatAt(4), beatAt(5)],
  [['1, 2, 3, 4, 5!'], beatAt(5), beatAt(6)],
  [['1, 2, 3, 4, 5, 6!'], beatAt(6), 356],
  [['Why 6? Big Frog plays 2, 4, 6.'], 364, 440],
  [['Little Frog plays 3, 6.'], 446, 494],
  [['6 is in the twos and threes:', '2 times 3 is 6!'], 500, 600],
  [['So they boom again on 12!'], 610, 760],
  [['Play and learn tables', 'with TableVerse.'], 838, 900],
];

// who hits on beat k
export const bigHits = (k) => k % 2 === 0;
export const littleHits = (k) => k % 3 === 0;

export function sfxEvents() {
  const ev = [];
  ev.push(['flap', HEADLINE_OUT[0], { pitch: 1.0 }]);
  for (const t of DEMO_BIG) ev.push(['bigdrum', t, {}]);
  for (const t of DEMO_LITTLE) ev.push(['smalldrum', t, {}]);
  for (let k = 1; k <= 12; k++) {
    const t = beatAt(k);
    ev.push(['beat', t, { pitch: 1 + 0.03 * k }]); // the firefly lands on pad k: soft click on every beat
    if (bigHits(k) && littleHits(k)) ev.push(['boom', t, {}], ['splash', t + 4, {}]);
    else if (bigHits(k)) ev.push(['bigdrum', t, {}]);
    else if (littleHits(k)) ev.push(['smalldrum', t, {}]);
  }
  for (const [, t] of RINGS_BIG) ev.push(['pop', t, { pitch: 0.9 }]);
  for (const [, t] of RINGS_LITTLE) ev.push(['pop', t, { pitch: 1.3 }]);
  ev.push(['light', BOTH_PULSE[0], { step: 2 }], ['flap', SIGN[0], { pitch: 0.9 }], ['chime', SIGN[0] + 8, { step: 2 }]);
  ev.push(['gurgle', SINK[0] + 4, { dur: SINK[1] - SINK[0] + 6 }], ['boing', POPUP[0], { pitch: 1.4, soft: true }], ['splash', POPUP[0] + 2, {}]);
  // page rustle and end-card pop finish before "Play" (approved english-17 correction)
  ev.push(['page', PAGE_TURN[0], { dur: 18 }], ['pop', PAGE_TURN[0] + 12, { pitch: 0.75 }], ['sparkle', PAGE_TURN[0] + 16, {}]);
  return ev;
}

export function timelineJSON() {
  return { fps: FPS, frames: FRAMES, width: W, height: H, scenes: SCENES, vo: VO, vo_clip: VO_CLIP, captions: CAPTIONS, sfx: sfxEvents(), pause: [0, 0] };
}
