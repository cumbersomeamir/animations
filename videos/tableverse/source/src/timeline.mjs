// Single source of truth for timing (frames @ 30 fps). The audio builder reads the JSON
// dump of this file (timeline.json), so picture, narration and SFX stay locked together.

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const FRAMES = 900; // 30.0 s

// Scene boundaries (frames)
export const SCENES = [
  { id: 'S1-hook', name: 'Hook: 7x8 crashes down, brain freeze', from: 0, to: 106 },
  { id: 'S2-story', name: 'Story: buddy thaws kid, block becomes 8 rows of 7 sleepy stars', from: 106, to: 302 },
  { id: 'S3-practice', name: 'Practice: 8 trampoline bounces wake each row, counting in sevens', from: 302, to: 555 },
  { id: 'S4-challenge', name: 'Challenge: smash 7x3, 7x5, then the giant 7x8 = 56', from: 555, to: 706 },
  { id: 'S5-celebrate', name: 'Celebrate: high five, stars swirl into an orbit ring', from: 706, to: 795 },
  { id: 'S6-cta', name: 'CTA: TableVerse icon, wordmark, Explore on Google Play', from: 795, to: 900 },
];

// --- S1 hook
export const BLOCK_LAND = 16;
export const QMARK_POP = 24;
export const FREEZE_START = 46;
export const FREEZE_END = 76;
// --- S2 story
export const BUDDY_IN = 106;
export const BUDDY_ARRIVE = 128;
export const KNOCK1 = 134;
export const KNOCK2 = 142;
export const ICE_SHATTER = 150;
export const BUDDY_TO_BLOCK = 166;
export const BUDDY_OVER_BLOCK = 182;
export const STOMP = 192;
export const STARS_SETTLED = 238;
export const SLEEP_START = 240;
export const TRAMP_CARRY = 250;
export const TRAMP_DROP = 266;
export const TRAMP_LAND = 272;
export const WALK_START = 258;
export const WALK_END = 288;
export const HOP_ON_LAND = 300;
// --- S3 practice: apex k (1..8) at 300 + 30k, i.e. every 2 beats at 120 bpm
export const APEX = [330, 360, 390, 420, 450, 480, 510, 540];
export const HALF_AIR = 13; // frames from takeoff to apex (and apex to landing)
export const LAND8 = APEX[7] + HALF_AIR; // 553
// --- S4 challenge
export const B1_HIT = 600;
export const B2_HIT = 630;
export const B3_IN = 634;
export const B3_HOVER = 664;
export const CROUCH_BIG = 645;
export const TAKEOFF_BIG = 662;
export const HIT_BIG = 675;
export const FLIP_LAND = 700;
// --- S5 celebrate
export const BUDDY_FLY_IN = 704;
export const HIGH_FIVE = 735;
export const ORBIT_BURST = 745;
// --- S6 CTA
export const CTA_START = 795;
export const CTA_SETTLE = 815;
export const ICON_POP = 810;
export const WORD_POP = 818;
export const TAG_IN = 830;
export const PILL_POP = 842;

export const COUNT = [7, 14, 21, 28, 35, 42, 49, 56];

// Narration placement: clip id -> start frame (clips in audio/narration/<id>.wav)
export const VO = {
  q1: 20,
  freeze: 62,
  story: 158,
  sleepy: 246,
  n7: APEX[0] + 1,
  n14: APEX[1] + 1,
  n21: APEX[2] + 1,
  n28: APEX[3] + 1,
  n35: APEX[4] + 1,
  n42: APEX[5] + 1,
  n49: APEX[6] + 1,
  n56: APEX[7] + 1,
  challenge: 567,
  q2: 636,
  a56: 678,
  keep: 740,
  cta: 816,
};

// On-screen captions (sound-off support) [text, in, out]
export const CAPTIONS = [
  ['Seven times eight?', 20, 58],
  ['Brain freeze!', 62, 104],
  ['Times tables become stories', 158, 242],
  ['8 rows of 7 sleepy stars', 246, 310],
  ['A fun challenge!', 566, 632],
  ['Keep practising your tables', 740, 794],
];

// Sound effects [name, frame, params]
export function sfxEvents() {
  const ev = [
    ['whistle', 0, { dur: 16 }],
    ['thud', BLOCK_LAND, { gain: 1.0 }],
    ['dust', BLOCK_LAND + 1, {}],
    ['boing_small', BLOCK_LAND + 3, {}],
    ['pop', QMARK_POP, { pitch: 1.0 }],
    ['freeze', FREEZE_START, { dur: FREEZE_END - FREEZE_START }],
    ['shiver', 84, { dur: 18 }],
    ['whoosh', BUDDY_IN, { dur: 20, up: false }],
    ['sparkle', BUDDY_ARRIVE - 2, { n: 4 }],
    ['knock', KNOCK1, {}],
    ['knock', KNOCK2, {}],
    ['crack', KNOCK2 + 1, {}],
    ['shatter', ICE_SHATTER, { gain: 1.0 }],
    ['whoosh', BUDDY_TO_BLOCK, { dur: 14, up: true }],
    ['stomp', STOMP, {}],
    ['rise', STOMP + 1, { dur: 40 }],
    ['snore', SLEEP_START + 4, {}],
    ['whoosh', TRAMP_CARRY, { dur: 16, up: false }],
    ['boing', TRAMP_LAND, { pitch: 0.8 }],
  ];
  for (let s = 0; s < 4; s++) ev.push(['step', WALK_START + 4 + s * 7.5, {}]);
  ev.push(['boing', HOP_ON_LAND, { pitch: 0.9 }]);
  APEX.forEach((a, i) => {
    ev.push(['boing', a - HALF_AIR - 1, { pitch: 1 + i * 0.06 }]);
    ev.push(['ding', a, { step: i }]);
  });
  ev.push(['boing', LAND8, { pitch: 1.1 }]);
  ev.push(['whoosh', B1_HIT - 24, { dur: 22, up: false }]);
  ev.push(['boing', B1_HIT - HALF_AIR - 1, { pitch: 1.0 }]);
  ev.push(['punch', B1_HIT, {}]);
  ev.push(['chime', B1_HIT + 2, { notes: [72, 76] }]);
  ev.push(['whoosh', B2_HIT - 24, { dur: 22, up: false }]);
  ev.push(['boing', B2_HIT - HALF_AIR - 1, { pitch: 1.05 }]);
  ev.push(['punch', B2_HIT, {}]);
  ev.push(['chime', B2_HIT + 2, { notes: [74, 79] }]);
  ev.push(['rumble', B3_IN, { dur: B3_HOVER - B3_IN }]);
  ev.push(['riser', CROUCH_BIG, { dur: HIT_BIG - CROUCH_BIG }]);
  ev.push(['boing', TAKEOFF_BIG - 1, { pitch: 0.75 }]);
  ev.push(['bighit', HIT_BIG, {}]);
  ev.push(['confetti', HIT_BIG + 2, {}]);
  ev.push(['whoosh', HIT_BIG + 3, { dur: 20, up: true }]);
  ev.push(['boing', FLIP_LAND, { pitch: 1.0 }]);
  ev.push(['whoosh', BUDDY_FLY_IN, { dur: 20, up: false }]);
  ev.push(['clap', HIGH_FIVE, {}]);
  ev.push(['sparkle', HIGH_FIVE + 1, { n: 6 }]);
  ev.push(['rise', ORBIT_BURST, { dur: 30 }]);
  ev.push(['whoosh', CTA_START, { dur: 18, up: true }]);
  ev.push(['boing', CTA_SETTLE, { pitch: 1.2 }]);
  ev.push(['pop', ICON_POP, { pitch: 0.7 }]);
  ev.push(['sparkle', ICON_POP + 2, { n: 8 }]);
  for (let i = 0; i < 10; i++) ev.push(['tick', WORD_POP + i * 2, { pitch: 1 + i * 0.05 }]);
  ev.push(['pop', PILL_POP, { pitch: 1.2 }]);
  return ev;
}

export function timelineJSON() {
  return {
    fps: FPS,
    frames: FRAMES,
    width: W,
    height: H,
    bpm: 120,
    scenes: SCENES,
    music: {
      groove_start: ICE_SHATTER,
      drop_start: CROUCH_BIG,
      hit: HIT_BIG,
      cta: ICON_POP,
      apex: APEX,
    },
    vo: VO,
    captions: CAPTIONS,
    sfx: sfxEvents(),
  };
}
