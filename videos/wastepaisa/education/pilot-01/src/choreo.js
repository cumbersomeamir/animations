// Choreography for pilot 01 as data. Times in seconds; narration timing comes
// from audio/narration/timing.json (L1..L5) and beats are aligned to it.
import { ease } from './lib/anim.js';

export const BEATS = {
  hook: [0.0, 2.45],
  reveal: [2.45, 5.0],
  soak: [5.0, 7.45],
  bond: [7.45, 10.5], // hard cut at 7.45 on the clack
  takeaway: [10.5, 15.0],
};

// Cup events
export const CUP_EVENTS = {
  slideIn: [0.0, 0.55],
  tabPull: 2.42,
  open: [2.5, 3.0],
  glint: [2.85, 3.6],
  pour: [5.2, 6.05],
  dropPaper: [5.9, 6.2], // flight; stain grows after impact (after "drinks soaking")
  stain: [6.2, 7.05],
  dropFilm: [6.0, 6.32], // bead lands on film, then runs down
  bead: [6.32, 7.15],
  close: [7.17, 7.45],
  tug: [8.15, 9.52],
  snap: [9.52, 9.95],
  facilities: [10.95, 11.2, 11.45],
};

// Camera keys: [t, [px,py,pz], [tx,ty,tz], fov, ease]. A hard cut is made by
// two keys 1/100 s apart (7.45 / 7.46), between frames 223 and 224. Tinku performs on the cup's
// right-hand side so he shares the frame with the stained half in the soak beat.
export const CAMERA = [
  [0.0, [-0.35, 3.0, 8.4], [0.22, 1.15, 0.55], 36],
  [2.4, [-0.15, 2.75, 7.4], [0.22, 1.12, 0.55], 36, ease.inOut],
  [3.3, [0.05, 3.45, 9.9], [0.05, 1.1, 0.2], 39, ease.inOutCubic],
  [4.9, [-0.15, 3.4, 9.6], [0.0, 1.1, 0.2], 39, ease.inOut],
  [5.7, [0.55, 3.0, 7.6], [0.35, 1.2, 0.25], 38, ease.inOutCubic],
  [7.45, [0.65, 2.9, 7.3], [0.35, 1.2, 0.25], 38, ease.inOut],
  [7.46, [1.0, 2.05, 5.75], [0.95, 1.12, 0.3], 36, ease.linear],
  [10.35, [1.0, 2.0, 5.45], [1.02, 1.05, 0.36], 36, ease.inOut],
  [11.5, [0.0, 4.7, 8.6], [0.0, 0.95, -0.95], 38, ease.inOutCubic],
  [15.0, [0.0, 4.5, 8.2], [0.0, 0.95, -0.95], 38, ease.inOut],
];

// Tinku root path: [t, x, z, yaw]
export const ROOT = [
  [0.0, 1.95, 1.6, -0.75],
  [0.75, 0.78, 1.28, -0.55, ease.outQuad],
  [2.5, 0.78, 1.28, -0.55],
  [2.85, 1.0, 1.85, -0.35, ease.outQuad],
  [7.45, 1.0, 1.85, -0.35],
  [7.46, 1.42, 0.38, -1.0, ease.linear],
  [9.55, 1.42, 0.38, -1.0],
  [9.85, 1.5, 0.78, -0.75, ease.outQuad],
  [10.6, 1.5, 0.78, -0.75],
  [11.1, 0.92, 1.45, -0.38, ease.inOut],
  [15.0, 0.92, 1.45, -0.38],
];

// Pose keys. Each key sets only the parameters it lists; a parameter
// interpolates between consecutive keys that mention it. handLW/handRW are
// world-space targets converted to rig space at that key's root transform.
// Authored for a performer on the cup's left; mirror() below moves the
// performance to the right-hand side (x -> -x, left/right parts swapped).
const AUTHORED_POSE_KEYS = [
  { t: 0.0, hop: 0, squash: 1, pitch: 0.05, lean: 0, smile: 0.4, mouthOpen: 0, look: [0.4, 0], browL: 0.2, browR: 0.2, earL: 0.5, earR: 0.5, loupe: 0, lid: 0.08, squint: 0, eyeScale: 1, handL: [0.42, 0.34, 0.0], handR: [-0.42, 0.34, 0.0], twist: 0 },
  // two hops in
  { t: 0.18, hop: 0.24, squash: 1.08, e: ease.outQuad },
  { t: 0.36, hop: 0, squash: 0.86, e: ease.inQuad },
  { t: 0.46, hop: 0, squash: 1.0 },
  { t: 0.6, hop: 0.16, squash: 1.06, e: ease.outQuad },
  { t: 0.75, hop: 0, squash: 0.84, e: ease.inQuad },
  { t: 0.9, squash: 1.0, look: [0.7, 0.05], browL: 0.4, browR: 0.1 },
  // taps on the cup ("Is THIS paper cup")
  { t: 0.78, handL: [0.42, 0.34, 0.0] },
  { t: 0.92, handLW: [-0.27, 0.78, 0.58], e: ease.outCubic },
  { t: 1.02, handLW: [-0.36, 0.8, 0.66], e: ease.outQuad },
  { t: 1.12, handLW: [-0.27, 0.82, 0.58], e: ease.outCubic },
  { t: 1.22, handLW: [-0.36, 0.84, 0.66], e: ease.outQuad },
  { t: 1.45, handL: [0.40, 0.36, 0.14], e: ease.inOut },
  // loupe down, lean in, curious
  { t: 1.3, loupe: 0, pitch: 0.05, lean: 0 },
  { t: 1.62, loupe: 1, pitch: 0.18, lean: -0.1, browL: 0.7, browR: -0.25, smile: 0.1, mouthOpen: 0, look: [0.65, 0.15], e: ease.outBack },
  { t: 2.15, pitch: 0.2, lean: -0.16, earL: 0.7, earR: 0.3 },
  // grab the seam tab and yank (2.25 .. 2.5)
  { t: 2.12, handL: [0.40, 0.36, 0.14] },
  { t: 2.28, handLW: [0.0, 1.45, 0.79], squash: 0.94, e: ease.outCubic },
  { t: 2.47, handLW: [0.0, 0.32, 0.63], pitch: 0.1, squash: 1.0, e: ease.linear },
  // recoil hop back + surprise
  { t: 2.5, hop: 0, loupe: 1, eyeScale: 1, mouthOpen: 0, browL: 0.7, browR: -0.25 },
  { t: 2.68, hop: 0.22, loupe: 0, eyeScale: 1.14, mouthOpen: 0.8, smile: 0.2, browL: 1, browR: 1, earL: 1.0, earR: 1.0, pitch: -0.18, lean: 0, look: [0.6, 0.1], handL: [0.55, 0.62, 0.2], handR: [-0.55, 0.62, 0.2], e: ease.outQuad },
  { t: 2.85, hop: 0, squash: 0.86, e: ease.inQuad },
  { t: 3.0, squash: 1.0, pitch: 0.0 },
  // point at the lining, delighted
  { t: 3.25, eyeScale: 1.05, mouthOpen: 0, smile: 0.9, browL: 0.6, browR: 0.6, handL: [0.55, 0.62, 0.2], look: [0.9, 0.2] },
  { t: 3.55, handLW: [-0.5, 1.2, 1.15], handR: [-0.42, 0.3, 0.05], earL: 0.6, earR: 0.6, e: ease.outBack },
  { t: 4.3, handLW: [-0.48, 1.18, 1.15], look: [0.85, 0.15] },
  { t: 4.55, look: [-0.1, 0.05], pitch: 0.0, smile: 0.9 },
  { t: 4.7, pitch: 0.12, e: ease.outQuad },
  { t: 4.85, pitch: -0.02, e: ease.inOut },
  // pick up beaker (handR) and pour with a stretchy arm
  { t: 4.6, handR: [-0.42, 0.3, 0.05] },
  { t: 4.85, handL: [0.42, 0.34, 0.05], handRW: [-1.78, 0.32, 1.72], look: [-0.5, -0.4], e: ease.inOut },
  { t: 5.15, handRW: [-0.4, 2.05, 0.32], look: [0.6, 0.6], smile: 0.5, browL: 0.4, browR: 0.4, pitch: -0.08, e: ease.outCubic },
  { t: 6.0, handRW: [-0.37, 2.08, 0.32] },
  { t: 6.4, handRW: [-1.78, 0.32, 1.72], e: ease.inOutCubic },
  { t: 6.7, handR: [-0.42, 0.3, 0.05], e: ease.inOut },
  // react: uh-oh at the stain, then "aha" to camera
  { t: 6.2, eyeScale: 1.0, mouthOpen: 0, look: [0.6, 0.6] },
  { t: 6.38, eyeScale: 1.12, mouthOpen: 0.45, smile: -0.2, browL: 0.9, browR: 0.9, look: [0.95, 0.25], earL: 0.2, earR: 0.2, e: ease.outBack },
  { t: 6.72, eyeScale: 1.12, mouthOpen: 0.45, look: [0.95, 0.25] },
  { t: 6.88, eyeScale: 1.0, mouthOpen: 0, smile: 0.9, browL: 0.5, browR: 0.5, look: [-0.15, 0.05], earL: 0.6, earR: 0.6, pitch: 0.0 },
  { t: 6.98, pitch: 0.12, e: ease.outQuad },
  { t: 7.12, pitch: 0.0 },
  // after the cut: 3/4 profile beside the cup, grab the film lip at the rim
  { t: 7.45, handL: [0.42, 0.34, 0.05], handR: [-0.42, 0.3, 0.05], pitch: 0.0, squash: 1.0, look: [-0.15, 0.05], smile: 0.9, mouthOpen: 0 },
  { t: 7.46, handL: [0.42, 0.34, 0.05], handR: [-0.42, 0.3, 0.05], look: [0.3, 0.5], smile: 0.6, browL: 0.5, browR: 0.5, e: ease.linear },
  { t: 7.95, handLW: [-0.66, 1.63, 0.27], handRW: [-0.62, 1.63, 0.17], look: [0.4, 0.6], squash: 1.04, smile: 0.7, e: ease.outBack },
  { t: 8.15, squash: 1.0, pitch: 0.0, lean: 0, lid: 0.08, squint: 0, mouthOpen: 0, mouthWide: 1, smile: 0.7, earL: 0.6, earR: 0.6 },
  // tug-of-war: lean back, strain; the film stretches but the bond holds
  { t: 8.15, handLW: [-0.66, 1.63, 0.27], handRW: [-0.62, 1.63, 0.17] },
  { t: 9.5, handLW: [-1.12, 1.42, 0.5], handRW: [-1.1, 1.42, 0.4], e: ease.inOut },
  { t: 8.6, pitch: -0.32, lean: 0.06, lid: 0.6, squint: 0.75, mouthOpen: 0.28, mouthWide: 1.4, smile: -0.45, browL: -0.7, browR: -0.7, earL: -0.3, earR: -0.3, squash: 0.94, look: [0.3, 0.3] },
  { t: 9.1, lean: -0.06 },
  { t: 9.5, pitch: -0.42, lean: 0.05, squash: 0.92 },
  // slip: tumble backward and land sitting, dazed
  { t: 9.52, hop: 0 },
  { t: 9.7, hop: 0.28, pitch: -0.9, lid: 0.08, squint: 0, mouthOpen: 0.85, mouthWide: 0.9, smile: 0, browL: 1, browR: 1, eyeScale: 1.15, earL: 1.0, earR: 1.0, handL: [0.62, 0.85, -0.1], handR: [-0.62, 0.85, -0.1], squash: 1.06, look: [0.0, 0.3], e: ease.outQuad },
  { t: 9.88, hop: -0.12, pitch: -0.42, squash: 0.84, mouthOpen: 0.3, e: ease.outBounce },
  { t: 10.3, hop: -0.12, pitch: -0.42, squash: 1.0, eyeScale: 1.0, mouthOpen: 0, smile: -0.1, lid: 0.35, look: [-0.2, 0.0], browL: 0.2, browR: -0.2, handL: [0.5, 0.15, 0.1], handR: [-0.5, 0.15, 0.1] },
  { t: 10.6, hop: -0.12, pitch: -0.3, lid: 0.08, smile: 0.4 },
  // get up and look at the facilities
  { t: 10.8, hop: 0.12, pitch: 0.0, lean: 0, squash: 1.0, e: ease.outQuad },
  { t: 10.98, hop: 0, squash: 0.9, look: [-0.4, 0.5], e: ease.inQuad },
  { t: 11.1, squash: 1.0, handL: [0.42, 0.34, 0.05], handR: [-0.42, 0.34, 0.05] },
  { t: 11.25, look: [-0.5, 0.6], browL: 0.5, browR: 0.5, twist: -0.25 },
  { t: 11.55, look: [0.1, 0.8], twist: 0.0 },
  { t: 11.85, look: [0.7, 0.6], twist: 0.25 },
  // shrug ("depends")
  { t: 12.2, twist: 0.0, look: [0.0, 0.0], handL: [0.42, 0.34, 0.05], handR: [-0.42, 0.34, 0.05], smile: 0.4, browL: 0.5, browR: 0.5 },
  { t: 12.5, handL: [0.62, 0.66, 0.22], handR: [-0.62, 0.66, 0.22], browL: 1.0, browR: 1.0, smile: -0.1, mouthWide: 1.2, earL: 0.9, earR: 0.9, lean: 0.1, squash: 0.96, e: ease.outBack },
  { t: 12.95, handL: [0.62, 0.66, 0.22], handR: [-0.62, 0.66, 0.22], lean: -0.08, squash: 0.96 },
  { t: 13.25, handL: [0.42, 0.34, 0.05], handR: [-0.42, 0.34, 0.05], lean: 0, squash: 1.0, mouthWide: 1.0, smile: 0.9, browL: 0.4, browR: 0.4, earL: 0.6, earR: 0.6 },
  // point up to the takeaway, then friendly idle
  { t: 13.45, handL: [0.42, 0.34, 0.05], look: [0.0, 0.0] },
  { t: 13.75, handL: [0.48, 1.05, 0.35], look: [0.3, 0.9], smile: 1.0, e: ease.outBack },
  { t: 14.55, handL: [0.48, 1.05, 0.35], look: [0.1, 0.5] },
  { t: 14.9, handL: [0.44, 0.5, 0.15], look: [0.0, 0.1], e: ease.inOut },
];

const SWAP = { handL: 'handR', handR: 'handL', handLW: 'handRW', handRW: 'handLW', browL: 'browR', browR: 'browL', browTiltL: 'browTiltR', browTiltR: 'browTiltL', earL: 'earR', earR: 'earL', footL: 'footR', footR: 'footL' };
const MIRROR_X = new Set(['handL', 'handR', 'handLW', 'handRW', 'footL', 'footR']);
const NEGATE = new Set(['lean', 'twist']);
function mirror(k) {
  const o = {};
  for (const [n, v] of Object.entries(k)) {
    const name = SWAP[n] || n;
    if (MIRROR_X.has(n)) o[name] = [-v[0], v[1], v[2]];
    else if (n === 'look') o[name] = [-v[0], v[1]];
    else if (NEGATE.has(n)) o[name] = -v;
    else o[name] = v;
  }
  return o;
}
export const POSE_KEYS = AUTHORED_POSE_KEYS.map(mirror);

export const BLINKS = [1.0, 3.95, 7.1, 11.05, 12.05, 14.25];
export const ANTENNA = [[0.36, 1.0], [0.75, 1.2], [2.48, 0.8], [2.85, 1.2], [7.46, 0.6], [9.52, 1.4], [9.88, 1.3], [10.98, 0.8], [12.5, 0.7], [13.75, 0.6]];

// Captions keyed to narration lines. [hl] marks orange highlight words.
export const CAPTIONS = {
  L1: 'Is this paper cup [hl]just paper?[/hl]',
  L2: 'Many have a [hl]thin plastic lining[/hl]',
  L3: 'It stops liquid [hl]soaking into[/hl] the paper',
  L4: 'But bonded layers are [hl]hard to separate[/hl]',
  L5: 'So recycling depends on [hl]local facilities[/hl]',
};
export const END_CARD = {
  t: 13.62,
  main: '[hl]Not just paper:[/hl] paper + plastic lining',
  sub: 'Check what your local recycling accepts.',
};

// Callout chips: [id, label, class, tIn, tOut, anchorId, dx, dy]
export const CHIPS = [
  ['paper', 'PAPER', '', 3.05, 5.05, 'paperL', -110, -290],
  ['film', 'THIN PLASTIC LINING', 'film', 3.4, 5.05, 'filmTop', 150, -360],
  ['soak', 'BARE PAPER SOAKS', '', 6.42, 7.2, 'stain', -60, -300],
  ['block', 'FILM BLOCKS', 'film', 6.58, 7.2, 'bead', -190, 170],
  ['bond', 'BONDED', 'bond', 7.72, 9.52, 'rimBond', -170, -230],
];
// Small notes: [text, tIn, tOut, x, y]
export const NOTES = [
  ['Exploded view · thickness not to scale', 2.95, 7.2, 540, 1700],
  ['Some cups use other barrier coatings', 3.95, 5.05, 540, 1752],
  ['Illustration · acceptance varies by area', 11.6, 15.5, 540, 1740],
];
