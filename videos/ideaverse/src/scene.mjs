// Ideaverse 30s promo — choreography, simulation and frame drawing.
// All timing is in frames @30fps. Every SFX is emitted from the same code that animates it.
import { loadImage, GlobalFonts } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clamp, lerp, inv, smooth, E, track, poseTrack, rng, noise1, qbez, kick, D2R } from './lib/math.mjs';
import { BASE, solve, drawStick, roundRect, simulateScarf } from './lib/rig.mjs';
import {
  PAL, TILE_COLORS, rgba, mixColor, drawTile, drawBulb, bulbPath, sparkle, heart, drawPhone, PHONE,
  phoneScreenRect, makePicture, makePixelLevels, drawMiniPlanet,
} from './lib/props.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const W = 1080, H = 1920, FPS = 30, N = 900;

GlobalFonts.registerFromPath(path.join(HERE, 'fonts/InterDisplay-ExtraBold.otf'), 'InterXB');
GlobalFonts.registerFromPath(path.join(HERE, 'fonts/InterDisplay-Bold.otf'), 'InterB');
GlobalFonts.registerFromPath(path.join(HERE, 'fonts/Inter-SemiBold.otf'), 'InterSB');

const PLANET = { cx: 540, cy: 3900, r: 2400 };
export const groundAt = (x) => PLANET.cy - Math.sqrt(Math.max(0, PLANET.r ** 2 - (x - PLANET.cx) ** 2));

// ------------------------------------------------------------------ timeline
export const SCENES = [
  { id: 'S1', name: 'Juggle', f0: 0, f1: 96 },
  { id: 'S2', name: 'Buried', f0: 96, f1: 204 },
  { id: 'S3', name: 'All in one', f0: 204, f1: 348 },
  { id: 'S4', name: 'Create', f0: 348, f1: 546 },
  { id: 'S5', name: 'Share', f0: 546, f1: 700 },
  { id: 'S6', name: 'Payoff + CTA', f0: 700, f1: 900 },
];
export const NARRATION = [
  { id: 'n1', f: 8 }, { id: 'n2', f: 40 }, { id: 'n3', f: 166 }, { id: 'n4', f: 246 },
  { id: 'n5', f: 356 }, { id: 'n6', f: 420 }, { id: 'n7', f: 584 }, { id: 'n8', f: 780 },
];
const M = PAL.mint, Wt = PAL.white;
export const CAPTIONS = [
  { f0: 4, f1: 40, lines: [[['One ', Wt], ['idea.', M]]] },
  { f0: 40, f1: 104, lines: [[['Too many ', Wt], ['apps.', PAL.coral]]] },
  { f0: 156, f1: 226, lines: [[['…and your idea', Wt]], [['gets ', Wt], ['buried.', PAL.coral]]] },
  { f0: 240, f1: 344, lines: [[['Meet ', Wt], ['Ideaverse', M]]], sub: 'the all-in-one AI app' },
  { f0: 352, f1: 418, lines: [[['Drop in ', Wt], ['your idea,', M]]] },
  { f0: 418, f1: 540, lines: [[['and create', Wt]], [['an ', Wt], ['image.', M]]] },
  { f0: 578, f1: 700, lines: [[['Share your', Wt]], [['creation.', M]]] },
];

// Key action frames (also drive SFX)
const K = {
  bonk: 50, towerFirst: 112, topple: 150, detach: 154, crash: 158, bulbPop: 180,
  phoneDrop: 204, phoneLand: 222, powerOn: 226, suckStart: 234, powerUp: 312,
  grab: 362, release: 381, splash: 396, genStart: 402, genDone: 465, cardOut: 478, catch1: 500,
  phoneHop0: 504, phoneHop1: 524, throw2: 577, split: 592, heartsBack: 646,
  bulbFull: 722, rise0: 730, rise1: 766, iconIn: 764, word0: 774, sub0: 790, cta0: 802,
};

export const events = [];
const ev = (f, type, gain = 1, extra = {}) => events.push({ f: Math.round(f), type, gain, ...extra });

// ------------------------------------------------------------------ creator pose
function keysFrom(list) {
  let acc = { ...BASE };
  return list.map((k) => { acc = { ...acc, ...k.p }; return { f: k.f, e: k.e, p: { ...acc } }; });
}

const CREATOR_KEYS = keysFrom([
  // S1 juggle
  { f: 0, p: { x: 540, aL: -62, eL: -60, aR: 62, eR: 60, hL: -12, kL: 4, hR: 12, kR: -4, lx: 0, ly: -0.9, mouth: 0.7, eye: 1.05 } },
  { f: 28, p: { mouth: 0.3, brow: -0.4 } },
  { f: 46, p: { mouth: -0.2, brow: -1, open: 0.28, eye: 1.3 } },
  { f: 49, p: {} },
  { f: 51, e: 'outQuad', p: { lean: -17, head: -26, eyeMode: 'x', open: 0.55, mouth: -0.3, sx: 1.12, sy: 0.85, aL: -125, eL: -30, aR: 135, eR: 25, lx: -0.4, ly: 0 } },
  { f: 57, p: { sx: 1, sy: 1, lean: -8, head: -10 } },
  { f: 60, p: { eyeMode: 'dizzy', open: 0, mouth: -0.4, brow: -0.3, eye: 1 } },
  { f: 92, p: { lean: 0, head: 0 } },
  // S2 buried
  { f: 98, p: { eyeMode: 'dot', aL: -14, eL: -8, aR: 14, eR: 8, mouth: 0, brow: 0, lx: 0, ly: 0, hL: -7, kL: 2, hR: 7, kR: -2 } },
  { f: 106, p: { ly: -1, eye: 1.4, open: 0.45, brow: -0.6, head: -6 } },
  { f: 112, e: 'outBack', p: { aL: -168, eL: -4, aR: 168, eR: 4, hL: -14, kL: 8, hR: 14, kR: -8 } },
  { f: 122, p: { eyeMode: 'squint', open: 0.2, mouth: -0.7, brow: 1, eye: 1, head: 0, ly: -0.4 } },
  { f: 150, p: {} },
  { f: 154, e: 'outQuad', p: { sy: 0.84, sx: 1.08, eyeMode: 'x', open: 0.5 } },
  { f: 163, e: 'inQuad', p: { rot: -90, sx: 1, sy: 1, aL: -30, eL: -20, aR: 40, eR: 30, hL: 2, kL: -4, hR: -6, kR: -10, lean: 0, head: 0 } },
  { f: 168, e: 'outQuad', p: { hR: -24, kR: -40 } },
  // S3 all-in-one
  { f: 262, p: { eyeMode: 'dot', open: 0, mouth: -0.1, brow: -0.3, lx: 0.3, ly: 0 } },
  { f: 278, e: 'outCubic', p: { rot: 0, lean: -12, hL: 84, kL: 6, hR: 80, kR: 10, aL: -40, eL: -10, aR: 30, eR: 10, lx: 0.5 } },
  { f: 286, p: { lean: 16, hL: 30, kL: -95, hR: 40, kR: -100, aL: -30, aR: 40, eL: -10, eR: 10, sy: 0.96 } },
  { f: 294, e: 'outBack', p: { lean: 0, hL: -7, kL: 2, hR: 7, kR: -2, aL: -14, eL: -8, aR: 14, eR: 8, sy: 1 } },
  { f: 304, p: { lx: 1, eye: 1.45, open: 0.5, brow: 0.2, mouth: 0.6 } },
  { f: 312, p: {} },
  { f: 330, p: { x: 600 } },
  { f: 340, e: 'outBack', p: { lx: 0.25, open: 0, mouth: 1, eye: 1.1, aR: 112, eR: -62, brow: 0.2 } },
  { f: 348, p: {} },
  // S4 create
  { f: 354, p: { ly: -1, lx: 0.2, head: -8, mouth: 0.4, aR: 14, eR: 8, brow: 0 } },
  { f: 362, e: 'outCubic', p: { aR: 172, eR: 4 } },
  { f: 376, p: { lean: -18, head: 0, lx: 1, ly: -0.2, aR: 210, eR: -40, aL: 70, eL: 30, hL: -28, kL: 8, hR: 26, kR: -22, sx: 0.96, sy: 1.03, brow: 1, mouth: 0.3 } },
  { f: 383, e: 'outQuart', p: { lean: 22, aR: 95, eR: 10, aL: -50, eL: -10, hL: -30, kL: -10, hR: 36, kR: -30, sx: 1.03, sy: 0.98 } },
  { f: 394, p: { lean: 6, aR: 40, eR: 10, aL: -20, eL: -8, hL: -12, kL: 4, hR: 14, kR: -6, sx: 1, sy: 1, brow: 0 } },
  { f: 404, p: { lean: 8, aL: -32, eL: 152, aR: 32, eR: -152, lx: 0.9, eye: 1.3, open: 0.25, mouth: 0.5 } },
  { f: 462, p: {} },
  { f: 467, p: { sy: 0.9, hL: -22, kL: 34, hR: 22, kR: -34, aL: -60, eL: -10, aR: 60, eR: 10, eyeMode: 'happy', open: 0.6, mouth: 1, lean: 0 } },
  { f: 473, e: 'outCubic', p: { lift: 70, sy: 1.05, aL: -160, aR: 160, hL: -12, kL: 20, hR: 12, kR: -20 } },
  { f: 482, e: 'inQuad', p: { lift: 0, sy: 1 } },
  { f: 486, p: { hL: -7, kL: 2, hR: 7, kR: -2, aL: -14, aR: 14 } },
  { f: 494, p: { aR: 128, eR: -24, lx: 0.9, eye: 1.25, eyeMode: 'dot', open: 0.3 } },
  { f: 500, p: { lean: -6, sx: 1.03, sy: 0.97 } },
  { f: 506, p: { lean: 0, aR: 165, eR: -10, sx: 1, sy: 1, mouth: 1, open: 0.4, lx: 0.2 } },
  { f: 512, p: { aL: -82, eL: -34, lx: -0.6 } },
  { f: 526, p: { aL: -38, eL: -64, lx: 0.3 } },
  { f: 534, p: { eyeMode: 'happy', open: 0.3 } },
  // S5 share
  { f: 556, p: { eyeMode: 'dot', lx: 1, eye: 1.1, open: 0, mouth: 0.7 } },
  { f: 568, p: { lean: -16, aR: 220, eR: -30, hL: -24, kL: 6, hR: 22, kR: -18, brow: 0.8 } },
  { f: 576, e: 'outQuart', p: { lean: 20, aR: 110, eR: 0, hL: -28, kL: -8, hR: 30, kR: -26 } },
  { f: 592, p: { lean: 4, aR: 30, eR: 10, hL: -7, kL: 2, hR: 7, kR: -2, brow: 0 } },
  { f: 610, p: { ly: -0.3 } },
  { f: 626, p: { eyeMode: 'happy', mouth: 1, open: 0.45 } },
  { f: 652, p: { aL: -118, eL: -20, aR: 120, eR: 20, lean: -5, ly: -0.5 } },
  { f: 690, p: {} },
  { f: 704, p: { ly: -1, head: -10, aL: -34, eL: -40, aR: 30, eR: 10, eyeMode: 'dot', eye: 1.3, open: 0.3, lean: 0, lx: 0 } },
  // S6 payoff + CTA
  { f: 722, p: { eye: 1.45, open: 0.55, mouth: 0.5 } },
  { f: 738, p: { head: -16, lean: -4 } },
  { f: 768, p: {} },
  { f: 784, e: 'outBack', p: { aR: 140, eR: -14, lx: 0.4, ly: -0.6, head: -6, lean: 2, open: 0, mouth: 1, eye: 1.1 } },
  { f: 899, p: {} },
]);

function walkOverlay(p, f, f0, f1, stride = 24) {
  if (f < f0 || f > f1) return;
  const ph = (f - f0) / 10 * Math.PI;
  const k = smooth(f0, f0 + 4, f) * (1 - smooth(f1 - 4, f1, f));
  p.hL += stride * Math.sin(ph) * k; p.hR -= stride * Math.sin(ph) * k;
  p.kL += -30 * Math.max(0, -Math.sin(ph)) * k; p.kR += -30 * Math.max(0, Math.sin(ph)) * k;
  p.aL += -18 * Math.sin(ph) * k; p.aR += -18 * Math.sin(ph) * k;
  p.lift += 6 * Math.abs(Math.sin(ph)) * k;
}

function creatorPose(f) {
  const p = poseTrack(CREATOR_KEYS, f);
  // breathing
  p.lean += 1.2 * Math.sin(f * 0.11);
  // S1 juggle arm pumps, speeding up
  if (f < 50) {
    const sp = lerp(0.3, 0.55, smooth(0, 48, f));
    const ph = f * sp * 2;
    p.aL += 10 * Math.sin(ph); p.aR += 10 * Math.sin(ph + Math.PI);
    p.eL += 8 * Math.sin(ph + 0.6); p.eR += 8 * Math.sin(ph + Math.PI + 0.6);
    p.x += 6 * Math.sin(f * 0.21) * smooth(20, 48, f);
  }
  // S1 stagger after bonk
  if (f >= 57 && f < 98) {
    const k = smooth(57, 62, f) * (1 - smooth(88, 98, f));
    p.lean += 14 * Math.sin((f - 57) * 0.32) * k;
    p.x += 34 * Math.sin((f - 57) * 0.16) * k;
    p.aL += 40 * Math.sin((f - 57) * 0.5) * k - 50 * k; p.aR += 40 * Math.sin((f - 57) * 0.5 + 1.5) * k + 50 * k;
    p.hL += 14 * Math.sin((f - 57) * 0.32) * k; p.hR += 14 * Math.sin((f - 57) * 0.32) * k;
    p.spin = f * 0.4;
  }
  // S2 head shake, then crouch under the growing tower
  if (f >= 98 && f < 108) p.head += 14 * Math.sin((f - 98) * 1.25) * (1 - inv(98, 108, f));
  if (f >= 112 && f < 156) {
    const landed = clamp((f - K.towerFirst) / 5 + 1, 0, 8) / 8;
    const c = landed * (f < 150 ? 1 : 1.2);
    p.hL -= 22 * c; p.kL += 44 * c; p.hR += 22 * c; p.kR -= 44 * c;
    const th = towerTheta(f);
    p.lean += -th * 0.5;
    p.x += Math.sin(f * 0.9) * 2.2 * c; // trembling
  }
  // S2 foot twitch sticking out of the heap
  if (f >= 172 && f < 262) {
    const tw = Math.max(0, Math.sin((f - 172) * 0.7)) * (f % 40 < 14 ? 1 : 0);
    p.kR += -18 * tw;
  }
  if (f >= 290 && f < 302) p.head += 10 * Math.sin((f - 290) * 1.6) * (1 - inv(290, 302, f));
  walkOverlay(p, f, 312, 330, 22);
  // S4 excited bounce while the image resolves
  if (f >= 404 && f < 462) { const b = Math.abs(Math.sin((f - 404) * 0.26)); p.lift += 10 * b; p.kL += 10 * b; p.kR -= 10 * b; }
  // S5 cheering bob
  if (f >= 626 && f < 650) p.lift += 8 * Math.abs(Math.sin((f - 626) * 0.3));
  // S6 wave after pointing
  if (f >= 822) { const k = smooth(822, 832, f); p.aR += 18 * Math.sin((f - 822) * 0.35) * k; p.eR += 26 * Math.sin((f - 822) * 0.35 + 0.8) * k; }
  // blinks
  if (p.eyeMode === 'dot') {
    for (const b of [20, 128, 236, 300, 420, 560, 640, 780, 870]) if (f >= b && f < b + 5) p.blink = Math.sin(((f - b) / 5) * Math.PI);
  }
  return p;
}

function towerTheta(f) {
  if (f < 118) return 0;
  if (f < K.topple) return 10 * smooth(118, 150, f) * Math.sin((f - 118) * 0.33);
  const th0 = 10 * Math.sin((150 - 118) * 0.33);
  return th0 + 1.6 * (f - K.topple) ** 2;
}

// ------------------------------------------------------------------ friends
const FRIENDS = [
  { x: 1185, py: 1420, r: 74, col: PAL.coral, hat: { type: 'beanie', color: PAL.coral }, pcol: '#5A6FA8', ring: null, catchF: 606 },
  { x: 1350, py: 1225, r: 60, col: PAL.amber, hat: { type: 'cap', color: PAL.amber }, pcol: '#7A5FA8', ring: rgba(PAL.amber, 0.7), catchF: 611 },
  { x: 1515, py: 1405, r: 76, col: PAL.lavender, hat: { type: 'bow', color: PAL.lavender }, pcol: '#3F8C8A', ring: null, catchF: 616 },
  { x: 1675, py: 1185, r: 58, col: PAL.sky, hat: { type: 'phones', color: PAL.sky }, pcol: '#8A5F8E', ring: rgba(PAL.sky, 0.6), catchF: 621 },
];
const FS = 0.8;
function friendWorld(i, f) {
  const fr = FRIENDS[i];
  const slide = 520 * (1 - E.outCubic(inv(540, 588 + i * 4, f)));
  const bob = 8 * Math.sin(f * 0.07 + i * 1.7);
  return { x: fr.x + slide, py: fr.py + bob, top: fr.py + bob - fr.r };
}
function friendPose(i, f) {
  const fr = FRIENDS[i], c = fr.catchF, w = friendWorld(i, f);
  const p = { ...BASE, s: FS, x: w.x, y: undefined, lx: -0.7, mouth: 0.4 };
  const keys = keysFrom([
    { f: 0, p: { lx: -0.7, ly: -0.2, mouth: 0.4 } },
    { f: c - 22, p: {} },
    { f: c - 8, p: { aL: -150, eL: -10, aR: 150, eR: 10, lean: -6, eye: 1.3, open: 0.3 } },
    { f: c, p: { lean: -12, sy: 0.93, sx: 1.04 } },
    { f: c + 6, p: { lean: 0, sy: 1, sx: 1, aL: -30, eL: 150, aR: 30, eR: -150, eyeMode: 'happy', open: 0.4, mouth: 1, lx: 0, ly: 0.5 } },
    { f: c + 16, p: { aR: 160, eR: 10, ly: -0.2 } },
    { f: c + 28, p: {} },
    { f: 899, p: {} },
  ]);
  Object.assign(p, poseTrack(keys, f));
  p.s = FS; p.x = w.x;
  if (f > c + 16) { p.aR += 20 * Math.sin((f - c) * 0.4); p.lift = 12 * Math.abs(Math.sin((f - c - 16) * 0.24)); }
  if (f < c - 8) p.lean += 2 * Math.sin(f * 0.1 + i);
  return p;
}
// planet-surface ground for a friend
const friendGround = (i, f) => () => friendWorld(i, f).top;

// ------------------------------------------------------------------ precompute
let CJ = [];       // creator joints per frame
let SCARF = [];
let TILES = [];    // per frame array of tile states
let TILE_DEF = [];
let BULB = [];     // per frame bulb state
let CARD = [];     // per frame card states
let PHONE_ST = [];
let HEARTS = [];
let FJ = [];       // friend joints per frame
let ICON = null, PIC = null, PIXL = null;
const PIX_LEVELS = [6, 10, 16, 26, 40, 64, 110, 600];

export async function prepare() {
  events.length = 0;
  ICON = await loadImage(path.join(HERE, '../assets/icon.png'));
  PIC = makePicture(600);
  PIXL = makePixelLevels(PIC, PIX_LEVELS);
  CJ = []; for (let f = 0; f < N; f++) CJ.push(solve(creatorPose(f), groundAt));
  FJ = []; for (let f = 0; f < N; f++) FJ.push(FRIENDS.map((_, i) => solve(friendPose(i, f), friendGround(i, f))));
  SCARF = simulateScarf(CJ.map((j) => j.neckPt), { n: 7, seg: 17, wind: (f) => -0.35 + 0.15 * Math.sin(f * 0.05) });
  buildTiles();
  buildPhoneAndCard();
  buildBulbAndHearts();
  buildMiscEvents();
  events.sort((a, b) => a.f - b.f);
}

// ---------- tiles ----------
function buildTiles() {
  const R = rng(1234);
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6];
  TILE_DEF = order.map((icon, i) => ({ id: i, icon, color: TILE_COLORS[(i * 3 + 1) % 4], size: 112 }));
  TILES = Array.from({ length: N }, () => []);
  // juggle phases
  const phases = []; let ph = 0;
  for (let f = 0; f < N; f++) { phases.push(ph); ph += lerp(1 / 34, 1 / 19, smooth(0, 48, f)); }
  const offs = [0, 0.4, 0.8, 0.2, 0.6];
  const jpos = (f, k) => {
    const J = CJ[f];
    const U = phases[f] + offs[k], u = ((U % 1) + 1) % 1;
    const L = [J.haL[0], J.haL[1] - 16], Rr = [J.haR[0], J.haR[1] - 16];
    const cxm = (L[0] + Rr[0]) / 2, half = (Rr[0] - L[0]) / 2;
    if (u < 0.72) { const t = u / 0.72, a = Math.PI * (1 - E.inOutSine(t)); return [cxm + Math.cos(a) * (half + 70 * Math.sin(Math.PI * t)), lerp(L[1], Rr[1], t) - 250 * Math.sin(Math.PI * t), U * 6.5]; }
    const t = (u - 0.72) / 0.28; return [lerp(Rr[0], L[0], t), lerp(Rr[1], L[1], t) + 64 * Math.sin(Math.PI * t), U * 6.5];
  };
  const entry = { 3: [12, 22, [-150, 900]], 4: [22, 32, [1230, 820]] };
  // juggle catch ticks (when a tile reaches the left hand)
  for (let f = 1; f < K.bonk; f++) for (let k = 0; k < 5; k++) {
    if (entry[k] && f < entry[k][1]) continue;
    if (Math.floor(phases[f] + offs[k]) !== Math.floor(phases[f - 1] + offs[k])) ev(f, 'tick', 0.35 + 0.05 * k);
  }
  ev(entry[3][0], 'whoosh', 0.55, { dur: 10, pan: -0.6 }); ev(entry[4][0], 'whoosh', 0.55, { dur: 10, pan: 0.6 });
  ev(30, 'whoosh', 0.5, { dur: 10, pan: -0.6 });
  ev(38, 'whoosh', 0.9, { dur: 12, pan: 0.5 });

  // physics state for S1 tiles
  const phys = {};
  const Gv = 1.25;
  const startPhys = (k, x, y, vx, vy, rot, vr) => { phys[k] = { x, y, vx, vy, rot, vr, rest: false }; };
  const stepPhys = (k, f) => {
    const s = phys[k];
    if (!s.rest) {
      s.vy += Gv; s.x += s.vx; s.y += s.vy; s.rot += s.vr;
      if (s.x < 170) { s.x = 170; s.vx = -s.vx * 0.5; }
      if (s.x > 920) { s.x = 920; s.vx = -s.vx * 0.5; }
      const gy = groundAt(s.x) - 50;
      if (s.y > gy) {
        s.y = gy;
        if (Math.abs(s.vy) > 4) { ev(f, 'clack', clamp(Math.abs(s.vy) / 22, 0.25, 1), { pitch: 0.8 + R() * 0.5 }); s.vy = -s.vy * 0.34; s.vx *= 0.6; s.vr *= 0.45; }
        else { s.vy = 0; s.vx *= 0.5; s.rest = Math.abs(s.vx) < 0.5; }
      }
    } else {
      const tgt = Math.round(s.rot / (Math.PI / 2)) * (Math.PI / 2) + 0.12 * Math.sin(k * 2.1);
      s.rot = lerp(s.rot, tgt, 0.25);
    }
  };
  // tower (S2) geometry
  const towerBase = (f) => { const J = CJ[Math.min(f, K.detach)]; return [(J.haL[0] + J.haR[0]) / 2, (J.haL[1] + J.haR[1]) / 2 - 10]; };
  const jit = Array.from({ length: 8 }, () => [(R() - 0.5) * 22, (R() - 0.5) * 0.22]);
  const towerSlot = (k, f) => {
    const B = towerBase(f), th = towerTheta(f) * D2R;
    const lx = jit[k][0], ly = -(56 + 88 * k);
    return [B[0] + lx * Math.cos(th) - ly * Math.sin(th), B[1] + lx * Math.sin(th) + ly * Math.cos(th), th + jit[k][1]];
  };
  const heapSlots = [[335, 50], [435, 50], [535, 50], [635, 50], [385, 138], [485, 138], [585, 138], [485, 224]];
  const heapMap = [1, 2, 0, 3, 5, 4, 6, 7];
  const heapPos = (k) => { const [x, dy] = heapSlots[heapMap[k]]; return [x + jit[k][0] * 0.5, groundAt(x) - dy, (R() - 0.5) * 0.5]; };
  const heapFinal = Array.from({ length: 8 }, (_, k) => heapPos(k));
  const detachState = Array.from({ length: 8 }, (_, k) => towerSlot(k, K.detach));
  // landing frames
  const land = (k) => K.towerFirst + 5 * k;
  const arrive = (k) => K.crash + 2 * k;
  for (let k = 0; k < 8; k++) { ev(land(k), 'thunk', 0.55 + 0.04 * k, { pitch: 1 + k * 0.06 }); ev(arrive(k), 'clack', 0.75, { pitch: 0.7 + R() * 0.4 }); }
  ev(K.crash, 'crash', 1);
  ev(136, 'creak', 0.6, { dur: 18 });

  // suction order: heap top-down then ground tiles right-to-left
  const suckOrder = [7, 6, 5, 4, 3, 2, 1, 0].map((k) => 7 + k);
  let suckStart = {}; let suckFrom = {};

  for (let f = 0; f < N; f++) {
    const out = TILES[f];
    // ----- S1 juggle tiles (0..5) and bonk tile (6)
    for (let k = 0; k < 7; k++) {
      let st = null;
      if (k === 5) {
        // a sixth tile arrives at f30, he lunges for it and misses
        if (f === 30) startPhys(5, -60, 860, 13, -9, 0, 0.3);
        if (f >= 30 && phys[5]) { stepPhys(5, f); const s5 = phys[5]; st = { x: s5.x, y: s5.y, rot: s5.rot, layer: s5.rest ? 'back' : 'front', blur: s5.rest ? 0 : 0.5 }; }
      } else if (k < 5) {
        if (f < K.bonk) {
          if (entry[k] && f < entry[k][0]) st = null;
          else {
            const [x, y, r] = jpos(f, k);
            if (entry[k] && f < entry[k][1]) {
              const t = E.outCubic(inv(entry[k][0], entry[k][1], f));
              const from = entry[k][2];
              st = { x: lerp(from[0], x, t), y: lerp(from[1], y, t) - 120 * Math.sin(Math.PI * t), rot: r + (1 - t) * 4, layer: 'front', blur: 1 - t };
            } else st = { x, y, rot: r, layer: 'front', blur: 0.4 };
          }
          if (f === K.bonk - 1) {
            const [x0, y0] = jpos(f - 1, k), [x1, y1, r1] = jpos(f, k);
            startPhys(k, x1, y1, (x1 - x0) * 0.7 + (R() - 0.5) * 14, Math.max(-15, (y1 - y0) * 0.4 - 4 - R() * 6), r1, (R() - 0.5) * 0.5);
          }
        } else if (phys[k]) { stepPhys(k, f); const s = phys[k]; st = { x: s.x, y: s.y, rot: s.rot, layer: s.rest ? 'back' : 'front' }; }
      } else {
        // bonk tile
        if (f >= 36 && f <= K.bonk) {
          const J = CJ[K.bonk], C = [J.head[0] + 92, J.head[1] - 6];
          const t = inv(36, K.bonk, f);
          st = { x: lerp(1240, C[0], t), y: lerp(980, C[1], t) - 60 * Math.sin(Math.PI * t), rot: -t * 5, layer: 'front', blur: 1 };
          if (f === K.bonk) startPhys(6, C[0], C[1], 8, -13, -0.5, 0.35);
        } else if (f > K.bonk && phys[6]) { stepPhys(6, f); const s = phys[6]; st = { x: s.x, y: s.y, rot: s.rot, layer: s.rest ? 'back' : 'front' }; }
      }
      if (st) out[k] = st;
    }
    // ----- S2 tower tiles (7..14)
    for (let k = 0; k < 8; k++) {
      const id = 7 + k; let st = null;
      const L = land(k);
      if (f >= L - 16 && f < L) {
        const s = towerSlot(k, f), t = E.inQuad(inv(L - 16, L, f));
        st = { x: lerp(s[0] + (k % 2 ? 60 : -60), s[0], t), y: lerp(-180, s[1], t), rot: s[2] + (1 - t) * 1.5, layer: 'front', blur: 1 };
      } else if (f >= L && f < K.detach) {
        const s = towerSlot(k, f); const b = kick(f, L, 10, 3, 1.2);
        st = { x: s[0], y: s[1] + b, rot: s[2], layer: 'front' };
      } else if (f >= K.detach && f < arrive(k) + 8) {
        const a = arrive(k), P0 = detachState[k], P1 = heapFinal[k];
        if (f < a) {
          const t = E.inQuad(inv(K.detach, a, f));
          const c = [(P0[0] + P1[0]) / 2 + 60, Math.min(P0[1], P1[1]) - 60];
          const q = qbez(P0, c, P1, t);
          st = { x: q[0], y: q[1], rot: lerp(P0[2], P1[2] + Math.PI * (k % 2 ? 1 : -1), t), layer: 'heap', blur: 0.6 };
        } else { const b = Math.abs(kick(f, a, 16, 2.5, 1.4)); st = { x: P1[0], y: P1[1] - b, rot: P1[2] + Math.PI * (k % 2 ? 1 : -1), layer: 'heap' }; }
      } else if (f >= arrive(k) + 8) {
        const P1 = heapFinal[k]; st = { x: P1[0], y: P1[1], rot: P1[2] + Math.PI * (k % 2 ? 1 : -1), layer: 'heap' };
      }
      if (st) out[id] = st;
    }
    // ----- S3 suction (all 15 tiles)
    if (f === K.suckStart) {
      const ground = [0, 1, 2, 3, 4, 5, 6].filter((k) => out[k]).sort((a, b) => out[b].x - out[a].x);
      const all = [...suckOrder, ...ground];
      all.forEach((id, j) => { suckStart[id] = K.suckStart + 4 * j; });
    }
    if (f >= K.suckStart) {
      for (const idS of Object.keys(suckStart)) {
        const id = +idS, s0 = suckStart[id], s1 = s0 + 20;
        if (f < s0) continue;
        if (f === s0) suckFrom[id] = { ...out[id] };
        if (f >= s1) { delete out[id]; continue; }
        const from = suckFrom[id];
        const c = phoneCenterApprox();
        const t = inv(s0, s1, f), te = E.inCubic(t);
        const dx = from.x - c[0], dy = from.y - c[1];
        const r0 = Math.hypot(dx, dy), a0 = Math.atan2(dy, dx);
        const r = r0 * (1 - E.inQuad(t)), a = a0 + (dx < 0 ? -1.1 : 1.1) * E.inOutQuad(t);
        out[id] = { x: c[0] + Math.cos(a) * r, y: Math.max(840, c[1] + Math.sin(a) * r - 50 * Math.sin(Math.PI * t)), rot: from.rot + 9 * te, scale: 1 - 0.82 * te, tint: smooth(0.15, 0.85, t), layer: 'fly', blur: t };
      }
    }
  }
  // events for suction
  const ids = Object.keys(suckStart).map(Number).sort((a, b) => suckStart[a] - suckStart[b]);
  ids.forEach((id, j) => ev(suckStart[id] + 20, 'ping', 0.55, { note: j }));
  ev(K.suckStart, 'suck', 0.8, { dur: 80 });
  SUCK_DONE = suckStart;
}
let SUCK_DONE = {};
const PHONE_X = 840;
const PHONE_CY = () => groundAt(PHONE_X) - PHONE.h / 2;
const phoneCenterApprox = () => [PHONE_X, PHONE_CY() - 20];

// ---------- phone + card ----------
function buildPhoneAndCard() {
  PHONE_ST = []; CARD = [];
  for (let f = 0; f < N; f++) {
    let ph = null;
    const cy = PHONE_CY();
    if (f >= K.phoneDrop && f < K.phoneLand) {
      const t = E.inQuad(inv(K.phoneDrop, K.phoneLand, f));
      ph = { x: PHONE_X - 30 * (1 - t), y: lerp(-420, cy, t), s: 1, rot: 0.45 * (1 - t) * Math.cos(t * 6), sx: 0.94, sy: 1.08, glow: 0 };
    } else if (f >= K.phoneLand && f < K.phoneHop0) {
      const sq = kick(f, K.phoneLand, 0.13, 3.5, 1.1);
      let glow = smooth(K.powerOn, K.powerOn + 10, f);
      // pulse at each absorbed tile + power up
      for (const id in SUCK_DONE) { const a = SUCK_DONE[id] + 20; if (f >= a) glow += 0.5 * Math.exp(-(f - a) / 3); }
      glow += 0.8 * Math.exp(-Math.max(0, f - K.powerUp) / 6) * (f >= K.powerUp ? 1 : 0);
      glow += 0.7 * Math.exp(-Math.max(0, f - K.splash) / 5) * (f >= K.splash ? 1 : 0);
      glow += 0.7 * Math.exp(-Math.max(0, f - K.genDone) / 6) * (f >= K.genDone ? 1 : 0);
      ph = { x: PHONE_X, y: cy, s: 1, rot: 0, sx: 1 + sq * 0.6, sy: 1 - sq, glow: Math.min(1.6, glow) };
    } else if (f >= K.phoneHop0) {
      const J = CJ[f];
      const hand = [J.haL[0] + 4, J.haL[1] - 34];
      if (f < K.phoneHop1) {
        const t = inv(K.phoneHop0, K.phoneHop1, f);
        const squashT = inv(K.phoneHop0, K.phoneHop0 + 4, f);
        const tt = E.inOutQuad(inv(K.phoneHop0 + 3, K.phoneHop1, f));
        const P0 = [PHONE_X, cy], P1 = hand;
        const q = qbez(P0, [(P0[0] + P1[0]) / 2, Math.min(P0[1], P1[1]) - 200], P1, tt);
        ph = { x: q[0], y: q[1], s: lerp(1, 0.22, E.outQuad(tt)), rot: -tt * Math.PI * 2, sx: 1 + 0.12 * Math.sin(squashT * Math.PI), sy: 1 - 0.15 * Math.sin(squashT * Math.PI), glow: 0.6 };
      } else {
        const b = kick(f, K.phoneHop1, 0.12, 3, 1.3);
        ph = { x: hand[0], y: hand[1], s: 0.22, rot: 0.15 + J.p.lean * D2R * 0.5, sx: 1 + b, sy: 1 - b, glow: 0.5 + 0.2 * Math.sin(f * 0.2) };
      }
    }
    PHONE_ST.push(ph);
    // card
    const cards = [];
    const J = CJ[f];
    const held = (j) => [j.haR[0] + 6, j.haR[1] - 70];
    if (f >= K.cardOut && f < K.catch1) {
      const t = inv(K.cardOut, K.catch1, f), te = E.inOutQuad(t);
      const P0 = [PHONE_X, PHONE_CY() - 20], P1 = held(CJ[K.catch1]);
      const q = qbez(P0, [(P0[0] + P1[0]) / 2 + 40, Math.min(P0[1], P1[1]) - 320], P1, te);
      cards.push({ x: q[0], y: q[1], size: lerp(200, 150, te), rot: lerp(0, -0.12, te), flip: Math.cos(te * Math.PI * 2), alpha: 1 });
    } else if (f >= K.catch1 && f < K.throw2) {
      const h = held(J); const b = kick(f, K.catch1, 8, 3, 1.3);
      cards.push({ x: h[0], y: h[1] + b, size: 150, rot: -0.1 + 0.08 * Math.sin(f * 0.13), flip: 1, alpha: 1 });
    } else if (f >= K.throw2 && f < K.split) {
      const t = inv(K.throw2, K.split, f), te = E.outQuad(t);
      const P0 = held(CJ[K.throw2]), P1 = [1010, 650];
      const q = qbez(P0, [P0[0] + 120, P1[1] - 140], P1, te);
      cards.push({ x: q[0], y: q[1], size: 150, rot: te * Math.PI * 2, flip: 1, alpha: 1, blur: 1 - t });
    } else if (f >= K.split) {
      FRIENDS.forEach((fr, i) => {
        const c = fr.catchF; const Fj = FJ[f][i];
        const hands = [(Fj.haL[0] + Fj.haR[0]) / 2, (Fj.haL[1] + Fj.haR[1]) / 2 - 10];
        if (f < c) {
          const t = E.inOutQuad(inv(K.split, c, f));
          const P1 = [(FJ[c][i].haL[0] + FJ[c][i].haR[0]) / 2, (FJ[c][i].haL[1] + FJ[c][i].haR[1]) / 2 - 10];
          const q = qbez([1010, 650], [lerp(1010, P1[0], 0.5), 560 + i * 20], P1, t);
          cards.push({ x: q[0], y: q[1], size: lerp(150, 110, t), rot: t * Math.PI * (i % 2 ? 2 : -2), flip: 1, alpha: 1, blur: 0.6 });
        } else if (f < c + 120) {
          const hold = f < c + 16 ? hands : [Fj.haL[0] + 4, Fj.haL[1] - 46];
          cards.push({ x: hold[0], y: hold[1], size: 110, rot: 0.06 * Math.sin(f * 0.2 + i), flip: 1, alpha: 1 - smooth(c + 90, c + 120, f) });
        }
      });
    }
    CARD.push(cards);
  }
  ev(K.phoneDrop, 'fall', 0.7, { dur: 18 });
  ev(K.phoneLand, 'thud', 1);
  ev(K.powerOn, 'powerOn', 0.8);
  ev(K.powerUp, 'chime', 0.8);
  ev(K.cardOut, 'whoosh', 0.6, { dur: 14 });
  ev(K.catch1, 'catch', 0.8);
  ev(K.phoneHop0 + 3, 'boing', 0.7);
  ev(K.phoneHop1, 'pop', 0.6, { pitch: 0.8 });
  ev(K.throw2 - 3, 'whoosh', 0.8, { dur: 14 });
  ev(K.split, 'shing', 0.8);
  FRIENDS.forEach((fr, i) => ev(fr.catchF, 'catch', 0.6, { pitch: 1 + i * 0.08 }));
}

// ---------- bulb + hearts ----------
function buildBulbAndHearts() {
  BULB = []; HEARTS = [];
  const R = rng(99);
  // hearts: 3 per friend
  const H = [];
  FRIENDS.forEach((fr, i) => {
    for (let m = 0; m < 3; m++) {
      const h = i * 3 + m;
      H.push({ i, born: fr.catchF + 7 + 3 * m, launch: K.heartsBack + 3 * h, arrive: K.heartsBack + 3 * h + 36, dx: (m - 1) * 34 + (R() - 0.5) * 10, rise: 70 + R() * 50, wob: R() * 6 });
    }
  });
  H.forEach((h) => { ev(h.born, 'pop', 0.45, { pitch: 1.1 + (h.i * 3 + (h.born % 3)) * 0.04 }); ev(h.arrive, 'ping', 0.4, { note: 4 + (H.indexOf(h) % 8), soft: 1 }); });
  ev(K.heartsBack, 'whoosh', 0.5, { dur: 30 });
  for (let f = 0; f < N; f++) {
    const hs = [];
    for (const h of H) {
      if (f < h.born || f >= h.arrive) continue;
      const Fj = FJ[Math.min(f, h.launch)][h.i];
      const base = [Fj.head[0] + h.dx, Fj.head[1] - 70];
      const up = E.outCubic(inv(h.born, h.born + 18, f));
      const pFloat = [base[0] + 6 * Math.sin(f * 0.2 + h.wob), base[1] - h.rise * up];
      if (f < h.launch) hs.push({ x: pFloat[0], y: pFloat[1], r: 26 * E.outBack(inv(h.born, h.born + 8, f)), rot: 0.2 * Math.sin(f * 0.15 + h.wob) });
      else {
        const t = E.inOutQuad(inv(h.launch, h.arrive, f));
        const L = FJ[h.launch][h.i]; const P0 = [L.head[0] + h.dx, L.head[1] - 70 - h.rise];
        const T = CJ[h.arrive].above(70);
        const q = qbez(P0, [lerp(P0[0], T[0], 0.5), Math.min(P0[1], T[1]) - 380], T, t);
        hs.push({ x: q[0], y: q[1], r: lerp(26, 16, t), rot: t * 2, blur: 0.5 });
      }
    }
    HEARTS.push(hs);
    // bulb
    let b = null;
    const J = CJ[f];
    const above = J.above(58);
    if (f < K.towerFirst) {
      let on = 1;
      if (f >= K.bonk && f < K.bonk + 12) on = 0.35 + 0.65 * ((f % 3) ? 1 : 0);
      b = { x: above[0], y: above[1] + 3 * Math.sin(f * 0.15), r: 30, on, sy: 1, rot: 0.08 * Math.sin(f * 0.1), layer: 'creator' };
      if (f >= K.bonk && f < K.bonk + 10) b.x += 6 * Math.sin(f * 2.3);
    } else if (f < K.bulbPop) {
      const sq = smooth(K.towerFirst - 2, K.towerFirst + 2, f);
      const a = J.above(lerp(58, 26, sq));
      b = { x: a[0], y: a[1], r: 30, on: lerp(1, 0.6, sq), sy: lerp(1, 0.62, sq), rot: (180 - J.headA) * D2R, layer: 'creator' };
    } else if (f < K.grab) {
      const P0 = [490, groundAt(490) - 150], P1 = [560, 1150];
      const t = E.outBack(inv(K.bulbPop, K.bulbPop + 12, f));
      let on = 0.55;
      if (f >= 186 && f < 210) on = [0.7, 0.15, 0.6, 0.1, 0.5, 0.05, 0.35, 0.05][Math.floor((f - 186) / 3)];
      else if (f >= 210) on = 0.08;
      let pos = [lerp(P0[0], P1[0], t), lerp(P0[1], P1[1], t) + 8 * Math.sin(f * 0.1)];
      const droop = smooth(196, 214, f);
      let rot = 0.5 * droop + 0.05 * Math.sin(f * 0.1);
      // follow creator once he is up
      const follow = smooth(296, 322, f);
      const ab = J.above(64);
      pos = [lerp(pos[0], ab[0], follow), lerp(pos[1] + 40 * droop, ab[1], follow)];
      rot = lerp(rot, 0.25, follow);
      if (f >= 338) on = 0.08 + 0.06 * Math.sin(f * 0.4);
      b = { x: pos[0], y: pos[1], r: 30, on, sy: 1, rot, layer: f >= K.bulbPop ? 'front' : 'creator' };
    } else if (f < K.release) {
      b = { x: J.haR[0], y: J.haR[1] - 30, r: 30, on: 0.15 + 0.5 * smooth(K.release - 8, K.release, f), sy: 1, rot: 0, layer: 'front' };
    } else if (f < K.splash) {
      const P0 = [CJ[K.release].haR[0], CJ[K.release].haR[1] - 30], P1 = phoneCenterApprox();
      const t = inv(K.release, K.splash, f);
      const q = qbez(P0, [(P0[0] + P1[0]) / 2, Math.min(P0[1], P1[1]) - 330], P1, t);
      b = { x: q[0], y: q[1], r: lerp(30, 22, t), on: 0.75, sy: 1, rot: t * Math.PI * 3, layer: 'front', blur: 1 };
    } else {
      // hearts rebuild the bulb above the creator
      const arrived = H.filter((h) => f >= h.arrive).length;
      if (arrived > 0 && f < K.rise0) {
        const last = Math.max(...H.filter((h) => f >= h.arrive).map((h) => h.arrive));
        const pulse = 0.18 * Math.exp(-(f - last) / 4);
        const full = f >= K.bulbFull ? 0.25 * Math.exp(-(f - K.bulbFull) / 6) : 0;
        const a = J.above(70);
        const dip = 18 * Math.sin(Math.PI * inv(K.rise0 - 10, K.rise0, f));
        b = { x: a[0], y: a[1] + dip, r: 30 * (0.5 + 0.5 * arrived / 12) * (1 + pulse + full), on: 0.3 + 0.7 * arrived / 12, sy: 1, rot: 0.05 * Math.sin(f * 0.2), layer: 'front' };
      } else if (f >= K.rise0) {
        const A = CJ[K.rise0].above(70);
        const t = E.inOutCubic(inv(K.rise0, K.rise1, f));
        const T = worldFromScreen(f, [540, 545]);
        const x = lerp(A[0], T[0], t), y = lerp(A[1], T[1], t) - 80 * Math.sin(Math.PI * t);
        b = { x, y, r: lerp(30, 66, t), on: 1, sy: 1, rot: -0.25 * t, layer: 'front', ring: smooth(K.rise0 + 14, K.rise1, f), fade: 1 - smooth(K.iconIn, K.iconIn + 10, f) };
      }
    }
    BULB.push(b);
  }
  ev(K.bulbPop, 'pop', 0.8, { pitch: 0.9 });
  ev(186, 'buzz', 0.55, { dur: 24 });
  ev(K.grab, 'pluck', 0.6);
  ev(366, 'stretch', 0.5, { dur: 14 });
  ev(K.release - 1, 'whoosh', 0.9, { dur: 12 });
  ev(K.splash, 'bloop', 1);
  ev(K.genStart, 'riser', 0.7, { dur: K.genDone - K.genStart });
  ev(K.genDone, 'ding', 1);
  ev(K.bulbFull, 'shine', 0.8);
  ev(K.rise0, 'riseWhoosh', 0.8, { dur: K.rise1 - K.rise0 });
  ev(K.iconIn + 2, 'reveal', 1);
}

function buildMiscEvents() {
  ev(K.bonk, 'bonk', 1);
  ev(K.bonk + 4, 'twinkle', 0.5);
  ev(K.topple, 'creak', 0.6, { dur: 8 });
  for (const f of [312, 322]) ev(f + 5, 'step', 0.45);
  ev(K.release - 14, 'stretch', 0.3, { dur: 10 });
  ev(472, 'hop', 0.5);
  ev(482, 'step', 0.6);
  ev(K.cta0, 'pop', 0.8, { pitch: 0.7 });
  'Ideaverse'.split('').forEach((_, i) => ev(K.word0 + 2 * i, 'tick', 0.32, { pitch: 1.2 + i * 0.05 }));
  ev(K.sub0, 'swish', 0.4);
  
}

// ------------------------------------------------------------------ camera
const CAM_KEYS = {
  cx: [[0, 540], [104, 540], [146, 540], [180, 520], [204, 520], [228, 660], [348, 660], [372, 720], [398, 720], [436, 790], [470, 790], [496, 700], [546, 700], [580, 1120], [664, 1120], [704, 600], [730, 600], [768, 690, 'inOutCubic'], [899, 690]],
  cy: [[0, 1180], [48, 1170], [104, 1150], [146, 1000], [180, 1250], [204, 1250], [228, 1230], [348, 1230], [372, 1200], [398, 1200], [436, 1220], [470, 1220], [496, 1200], [546, 1200], [580, 1140], [664, 1140], [704, 1160], [730, 1160], [768, 880, 'inOutCubic'], [899, 880]],
  z: [[0, 1.28], [48, 1.38, 'inOutSine'], [104, 1.26], [146, 0.95], [180, 1.3, 'inOutCubic'], [204, 1.3], [228, 1.25], [348, 1.25], [372, 1.3], [398, 1.3], [436, 1.5], [470, 1.5], [496, 1.3], [546, 1.3], [580, 0.66], [664, 0.66], [704, 1.25], [730, 1.25], [768, 1.0, 'inOutCubic'], [899, 1.0]],
};
const SHAKES = [[K.bonk, 16, 7], [K.crash, 20, 9], [K.phoneLand, 22, 8], [K.splash, 8, 5], [K.catch1, 5, 4], [K.genDone, 6, 6]];
export function camera(f) {
  let cx = track(CAM_KEYS.cx, f), cy = track(CAM_KEYS.cy, f), z = track(CAM_KEYS.z, f), rot = 0;
  for (const [f0, amp, dec] of SHAKES) {
    if (f < f0 || f > f0 + dec * 4) continue;
    const a = amp * Math.exp(-(f - f0) / dec);
    cx += a * noise1(f * 0.9, f0); cy += a * noise1(f * 0.9, f0 + 7); rot += a * 0.0012 * noise1(f * 0.7, f0 + 3);
  }
  return { cx, cy, z, rot };
}
function worldFromScreen(f, s) {
  const c = camera(f);
  return [(s[0] - W / 2) / c.z + c.cx, (s[1] - H / 2) / c.z + c.cy];
}

// ------------------------------------------------------------------ background
const STARS = (() => { const R = rng(5); return Array.from({ length: 150 }, () => ({ x: R() * W, y: R() * H, r: 0.8 + R() * 2.2, d: 0.2 + R() * 0.8, ph: R() * 6.28, sp: R() > 0.86 })); })();
function drawBackground(ctx, f, cam) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#141A2B'); g.addColorStop(0.55, '#1B2333'); g.addColorStop(1, '#202A40');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const neb = (x, y, r, col, a) => { const n = ctx.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, rgba(col, a)); n.addColorStop(1, rgba(col, 0)); ctx.fillStyle = n; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); };
  const px = (cam.cx - 540) * 0.08, py = (cam.cy - 1000) * 0.08;
  neb(860 - px, 520 - py, 520, PAL.mint, 0.07);
  neb(160 - px, 1100 - py, 560, PAL.lavender, 0.06);
  for (const s of STARS) {
    let x = s.x - (cam.cx - 540) * 0.25 * s.d, y = s.y - (cam.cy - 1000) * 0.25 * s.d;
    x = ((x % W) + W) % W; y = ((y % H) + H) % H;
    const zz = 1 + (cam.z - 1) * 0.35 * s.d;
    x = (x - W / 2) * zz + W / 2; y = (y - H / 2) * zz + H / 2;
    const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(f * 0.12 + s.ph));
    if (s.sp) sparkle(ctx, x, y, s.r * 3.2 * tw + 2, `rgba(255,255,255,${0.75 * tw})`);
    else { ctx.fillStyle = `rgba(255,255,255,${0.55 * tw})`; ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill(); }
  }
}

function drawPlanet(ctx) {
  const { cx, cy, r } = PLANET;
  ctx.save();
  ctx.fillStyle = rgba(PAL.mint, 0.06); ctx.beginPath(); ctx.arc(cx, cy, r + 26, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createLinearGradient(0, cy - r, 0, cy - r + 600);
  g.addColorStop(0, '#26304A'); g.addColorStop(1, '#141A29');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = rgba(PAL.mint, 0.55); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
  ctx.fillStyle = 'rgba(8,12,22,0.35)';
  for (const [x, d, w] of [[150, 70, 90], [420, 160, 60], [760, 90, 120], [1000, 200, 70], [1300, 120, 100], [1650, 220, 80], [-150, 140, 90]]) {
    ctx.beginPath(); ctx.ellipse(x, groundAt(x) + d, w, w * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function shadow(ctx, x, lift, w = 90, a = 0.35) {
  const gy = groundAt(x);
  const k = 1 / (1 + lift / 120);
  ctx.fillStyle = `rgba(5,8,16,${a * k})`;
  ctx.beginPath(); ctx.ellipse(x, gy + 2, w * k, 13 * k, 0, 0, Math.PI * 2); ctx.fill();
}

// ------------------------------------------------------------------ effects
function impactBurst(ctx, x, y, f, f0, size = 70, col = '#FFE27A') {
  const t = (f - f0) / 9; if (t < 0 || t > 1) return;
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 8 * (1 - t);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + 0.3, r0 = size * (0.4 + t * 0.6), r1 = size * (0.75 + t * 0.7);
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke();
  }
  sparkle(ctx, 0, 0, size * 0.5 * (1 - t), col);
  ctx.restore();
}
function dust(ctx, x, y, f, f0, n = 7, spread = 160, seed = 1) {
  const t = (f - f0) / 22; if (t < 0 || t > 1) return;
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const dir = (i / (n - 1) - 0.5) * 2, sp = 0.6 + R() * 0.6;
    const px = x + dir * spread * E.outCubic(t) * sp, py = y - 20 * E.outCubic(t) * R() - 8;
    ctx.fillStyle = `rgba(190,200,225,${0.4 * (1 - t)})`;
    ctx.beginPath(); ctx.arc(px, py, (14 + R() * 16) * (0.6 + t), 0, Math.PI * 2); ctx.fill();
  }
}
function sweat(ctx, J, f, f0, f1) {
  if (f < f0 || f > f1) return;
  for (let i = 0; i < 2; i++) {
    const t = ((f - f0 + i * 7) % 14) / 14;
    const side = i ? 1 : -1;
    const x = J.head[0] + side * (44 + 30 * t), y = J.head[1] - 30 + 50 * t * t;
    ctx.fillStyle = `rgba(140,210,255,${0.9 * (1 - t)})`;
    ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.quadraticCurveTo(x + 8, y + 2, x, y + 7); ctx.quadraticCurveTo(x - 8, y + 2, x, y - 12); ctx.fill();
  }
}
function dizzyStars(ctx, J, f) {
  if (f < 58 || f > 100) return;
  const a = 1 - smooth(92, 100, f);
  for (let i = 0; i < 3; i++) {
    const ang = f * 0.25 + i * 2.09;
    sparkle(ctx, J.head[0] + Math.cos(ang) * 62, J.head[1] - 52 + Math.sin(ang) * 16, 13, `rgba(255,226,122,${a})`);
  }
}
function swirl(ctx, c, f) {
  const a = smooth(K.suckStart - 6, K.suckStart + 6, f) * (1 - smooth(300, 316, f));
  if (a <= 0) return;
  ctx.save(); ctx.translate(c[0], c[1]);
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const r = 70 + i * 48, rot = -f * (0.18 + i * 0.02) + i;
    ctx.strokeStyle = rgba(PAL.mint, 0.5 * a * (1 - i / 6)); ctx.lineWidth = 7 - i;
    ctx.beginPath(); ctx.arc(0, 0, r, rot, rot + 1.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r, rot + Math.PI, rot + Math.PI + 1.2); ctx.stroke();
  }
  ctx.restore();
}
function ringBurst(ctx, x, y, f, f0, dur, r0, r1, col, w = 8) {
  const t = (f - f0) / dur; if (t < 0 || t > 1) return;
  ctx.strokeStyle = rgba(col, 1 - t); ctx.lineWidth = w * (1 - t) + 1;
  ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, E.outCubic(t)), 0, Math.PI * 2); ctx.stroke();
}
function sparkBurst(ctx, x, y, f, f0, n, rad, seed, col = '#FFFFFF') {
  const t = (f - f0) / 18; if (t < 0 || t > 1) return;
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + R() * 0.4, d = rad * E.outCubic(t) * (0.6 + R() * 0.6);
    sparkle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, (10 + R() * 10) * (1 - t), col.startsWith('#') ? rgba(col, 1 - t * 0.7) : col);
  }
}

// ------------------------------------------------------------------ phone screen contents
function screenContent(f) {
  return (ctx, S) => {
    const cx = S.x + S.w / 2, cy = S.y + S.h / 2;
    const on = smooth(K.powerOn, K.powerOn + 8, f);
    if (on <= 0) return;
    // base glow
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, S.h * 0.7);
    g.addColorStop(0, rgba(PAL.mint, 0.28 * on)); g.addColorStop(1, rgba(PAL.navy, 0));
    ctx.fillStyle = g; ctx.fillRect(S.x, S.y, S.w, S.h);
    const genT = inv(K.genStart, K.genDone, f);
    const showIcon = f < K.splash + 6 || f >= K.cardOut + 14;
    if (showIcon) {
      const pop = f < K.splash ? E.outBackBig(inv(K.powerOn + 2, K.powerOn + 14, f)) : E.outBack(inv(K.cardOut + 14, K.cardOut + 26, f));
      const fadeOut = f >= K.splash ? 1 - inv(K.splash, K.splash + 6, f) : 1;
      const sz = 150 * pop;
      if (sz > 1) {
        ctx.save(); ctx.globalAlpha *= fadeOut;
        roundRect(ctx, cx - sz / 2, cy - sz / 2, sz, sz, sz * 0.22); ctx.clip();
        ctx.drawImage(ICON, cx - sz / 2, cy - sz / 2, sz, sz);
        ctx.restore();
      }
    }
    // splash ripples
    for (let i = 0; i < 3; i++) ringBurst(ctx, cx, cy, f, K.splash + i * 4, 16, 10, 150, PAL.mint, 7);
    // generation: noise resolves into the picture
    if (f >= K.genStart - 2 && f < K.cardOut + 14) {
      const P = Math.min(S.w, S.h) - 16, px = cx - P / 2, py = cy - P / 2;
      const a = smooth(K.genStart - 2, K.genStart + 4, f) * (1 - smooth(K.cardOut, K.cardOut + 6, f));
      ctx.save(); ctx.globalAlpha *= a;
      roundRect(ctx, px, py, P, P, 14); ctx.clip();
      const lv = E.inOutSine(genT) * (PIX_LEVELS.length - 1);
      const i0 = Math.floor(lv), i1 = Math.min(PIX_LEVELS.length - 1, i0 + 1), fr = lv - i0;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(PIXL[i0], px, py, P, P);
      if (fr > 0) { ctx.globalAlpha *= fr; ctx.drawImage(PIXL[i1], px, py, P, P); }
      ctx.imageSmoothingEnabled = true;
      ctx.restore();
      // speckle noise that fades as the image resolves
      const nA = (1 - E.inQuad(genT)) * a;
      if (nA > 0.02) {
        const R = rng(f * 13 + 1);
        for (let i = 0; i < 90; i++) {
          ctx.fillStyle = [PAL.mint, PAL.lavender, PAL.coral, PAL.sky, '#FFFFFF'][i % 5];
          ctx.globalAlpha = nA * (0.25 + R() * 0.5);
          const s = 4 + R() * 12;
          ctx.fillRect(px + R() * P, py + R() * P, s, s);
        }
        ctx.globalAlpha = 1;
      }
      // scan line
      if (genT > 0 && genT < 1) {
        const yy = py + P * ((f - K.genStart) % 20) / 20;
        ctx.fillStyle = rgba(PAL.mintHi, 0.35 * a); ctx.fillRect(px, yy, P, 4);
      }
      // completion shine
      const sh = inv(K.genDone, K.genDone + 10, f);
      if (sh > 0 && sh < 1) {
        ctx.save(); roundRect(ctx, px, py, P, P, 14); ctx.clip();
        const sx = px - P + sh * P * 2.2;
        const lg = ctx.createLinearGradient(sx, py, sx + P * 0.5, py + P);
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.6)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = lg; ctx.fillRect(px, py, P, P);
        ctx.restore();
      }
    }
    // power-on flash
    const fl = Math.max(0, 1 - Math.abs(f - K.powerOn - 1) / 4) + Math.max(0, 1 - Math.abs(f - K.powerUp) / 6) * 0.6;
    if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${0.7 * fl})`; ctx.fillRect(S.x, S.y, S.w, S.h); }
  };
}

function drawCard(ctx, c) {
  ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(c.flip ?? 1, 1); ctx.globalAlpha *= c.alpha ?? 1;
  const s = c.size, pad = s * 0.07;
  ctx.fillStyle = 'rgba(5,8,16,0.35)'; roundRect(ctx, -s / 2 + 5, -s / 2 + 8, s, s * 1.12, s * 0.06); ctx.fill();
  ctx.fillStyle = '#F7F4EE'; roundRect(ctx, -s / 2, -s / 2, s, s * 1.12, s * 0.06); ctx.fill();
  if ((c.flip ?? 1) > 0) ctx.drawImage(PIC, -s / 2 + pad, -s / 2 + pad, s - 2 * pad, s - 2 * pad);
  else { ctx.fillStyle = PAL.mint; roundRect(ctx, -s / 2 + pad, -s / 2 + pad, s - 2 * pad, s - 2 * pad, 6); ctx.fill(); }
  ctx.restore();
}

// ------------------------------------------------------------------ captions + end card
function drawCaption(ctx, f) {
  for (const cap of CAPTIONS) {
    if (f < cap.f0 || f >= cap.f1) continue;
    const tIn = f - cap.f0, outK = smooth(0, 7, cap.f1 - f - 1);
    const size = 88, lh = 104;
    const y0 = 300 - ((cap.lines.length - 1) * lh) / 2;
    ctx.save();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.font = `${size}px InterXB`;
    ctx.shadowColor = 'rgba(4,7,16,0.65)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 5;
    let wi = 0;
    cap.lines.forEach((line, li) => {
      const words = [];
      for (const [t, c] of line) t.split(' ').filter(Boolean).forEach((w) => words.push({ w, c }));
      const sp = ctx.measureText(' ').width;
      const ws = words.map((w) => ctx.measureText(w.w).width);
      const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
      let x = W / 2 - total / 2;
      const y = y0 + li * lh;
      words.forEach((w, i) => {
        const k = clamp((tIn - wi * 3) / 8);
        const sc = 0.55 + 0.45 * E.outBack(k);
        ctx.save();
        ctx.globalAlpha = clamp(k * 2) * outK;
        ctx.translate(x + ws[i] / 2, y + (1 - outK) * -26 + (1 - E.outCubic(k)) * 24);
        ctx.scale(sc, sc);
        ctx.fillStyle = w.c; ctx.fillText(w.w, -ws[i] / 2, 0);
        ctx.restore();
        x += ws[i] + sp; wi++;
      });
    });
    if (cap.sub) {
      const k = clamp((tIn - 10) / 10);
      ctx.font = '52px InterSB'; ctx.textAlign = 'center';
      ctx.globalAlpha = k * outK; ctx.fillStyle = 'rgba(244,247,251,0.92)';
      ctx.fillText(cap.sub, W / 2, y0 + cap.lines.length * lh - 18 + (1 - E.outCubic(k)) * 18);
    }
    ctx.restore();
  }
}

function drawEndCard(ctx, f) {
  if (f < K.iconIn) return;
  // icon (real app asset)
  const k = E.outBack(inv(K.iconIn, K.iconIn + 12, f));
  const sz = 270 * (0.7 + 0.3 * k) * (1 + 0.015 * Math.sin((f - K.iconIn) * 0.12));
  const cx = 540, cy = 545;
  ctx.save();
  ctx.globalAlpha = clamp((f - K.iconIn) / 6);
  const gl = ctx.createRadialGradient(cx, cy, sz * 0.3, cx, cy, sz * 1.2);
  gl.addColorStop(0, rgba(PAL.mint, 0.35)); gl.addColorStop(1, rgba(PAL.mint, 0));
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, sz * 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.fillStyle = PAL.navy; roundRect(ctx, cx - sz / 2, cy - sz / 2, sz, sz, sz * 0.22); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save(); roundRect(ctx, cx - sz / 2, cy - sz / 2, sz, sz, sz * 0.22); ctx.clip();
  ctx.drawImage(ICON, cx - sz / 2, cy - sz / 2, sz, sz);
  // shine sweep
  const sh = inv(K.iconIn + 4, K.iconIn + 20, f);
  if (sh > 0 && sh < 1) {
    const sx = cx - sz + sh * sz * 2.4;
    const lg = ctx.createLinearGradient(sx, cy - sz / 2, sx + sz * 0.4, cy + sz / 2);
    lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.45)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = lg; ctx.fillRect(cx - sz / 2, cy - sz / 2, sz, sz);
  }
  ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = rgba(PAL.mint, 0.6); roundRect(ctx, cx - sz / 2, cy - sz / 2, sz, sz, sz * 0.22); ctx.stroke();
  ctx.restore();
  ringBurst(ctx, cx, cy, f, K.iconIn, 18, 120, 330, PAL.mint, 10);
  sparkBurst(ctx, cx, cy, f, K.iconIn, 12, 300, 11);

  // wordmark (typeset name; not an official logo)
  ctx.save();
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.font = '132px InterXB';
  ctx.shadowColor = 'rgba(4,7,16,0.6)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
  const word = 'Ideaverse';
  const tw = ctx.measureText(word).width;
  const x0 = W / 2 - tw / 2, by = 828;
  for (let i = 0; i < word.length; i++) {
    const lk = clamp((f - K.word0 - 2 * i) / 9);
    if (lk <= 0) continue;
    const xi = x0 + ctx.measureText(word.slice(0, i)).width, wi = ctx.measureText(word[i]).width;
    ctx.save();
    ctx.globalAlpha = clamp(lk * 2);
    ctx.translate(xi + wi / 2, by - 45 + (1 - E.outCubic(lk)) * 50);
    const sc = 0.4 + 0.6 * E.outBackBig(lk); ctx.scale(sc, sc);
    ctx.fillStyle = PAL.white; ctx.fillText(word[i], -wi / 2, 45);
    ctx.restore();
  }
  // subtitle
  const sk = clamp((f - K.sub0) / 10);
  if (sk > 0) {
    ctx.font = '50px InterSB'; ctx.textAlign = 'center'; ctx.globalAlpha = sk;
    ctx.fillStyle = PAL.mint; ctx.fillText('All in One AI App', W / 2, 910 + (1 - E.outCubic(sk)) * 20);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // CTA pill
  const ck = inv(K.cta0, K.cta0 + 12, f);
  if (ck > 0) {
    const s = E.outBackBig(ck) * (1 + 0.025 * Math.sin(Math.max(0, f - K.cta0 - 20) * 0.22) * smooth(K.cta0 + 20, K.cta0 + 30, f));
    const pw = 700, ph = 118, py = 1020;
    ctx.save(); ctx.translate(W / 2, py); ctx.scale(s, s); ctx.globalAlpha = clamp(ck * 3);
    ctx.shadowColor = rgba(PAL.mint, 0.45); ctx.shadowBlur = 36;
    ctx.fillStyle = PAL.mint; roundRect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fill();
    ctx.shadowColor = 'transparent';
    // shine
    const sh = ((f - K.cta0 - 20) % 60) / 26;
    if (f > K.cta0 + 20 && sh < 1) {
      ctx.save(); roundRect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.clip();
      const sx = -pw / 2 - 200 + sh * (pw + 400);
      const lg = ctx.createLinearGradient(sx, 0, sx + 160, 0);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.45)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lg; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); ctx.restore();
    }
    ctx.font = '50px InterB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = PAL.navy; ctx.fillText('Explore on Google Play', 0, 3);
    ctx.restore();
  }
}

// ------------------------------------------------------------------ frame
export function drawFrame(ctx, f) {
  const cam = camera(f);
  drawBackground(ctx, f, cam);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.rotate(cam.rot); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy);

  // friends on mini-planets (S5 only)
  if (f >= 540 && f < 720) {
    FRIENDS.forEach((fr, i) => {
      const w = friendWorld(i, f);
      const a = smooth(540, 560, f) * (1 - smooth(700, 716, f));
      ctx.save(); ctx.globalAlpha = a;
      drawMiniPlanet(ctx, w.x, w.py, fr.r, fr.pcol, fr.ring);
      drawStick(ctx, FJ[f][i], { hat: fr.hat });
      ctx.restore();
    });
  }
  drawPlanet(ctx);
  const tiles = TILES[f];
  const drawT = (id, st) => {
    const d = TILE_DEF[id];
    const col = st.tint ? mixColor(d.color, PAL.mint, st.tint) : d.color;
    drawTile(ctx, st.x, st.y, d.size * (st.scale ?? 1), st.rot, col, d.icon);
  };
  // resting ground tiles behind everyone
  for (const id in tiles) if (tiles[id].layer === 'back') drawT(+id, tiles[id]);
  const J = CJ[f];
  // phone (behind creator when standing on the ground)
  const ph = PHONE_ST[f];
  const phoneInHand = f >= K.phoneHop1;
  const drawPh = () => {
    if (!ph) return;
    if (f >= K.phoneLand && f < K.phoneHop0) shadow(ctx, PHONE_X, 0, 150, 0.4);
    const yOff = (1 - ph.sy) * PHONE.h / 2 * ph.s;
    drawPhone(ctx, ph.x, ph.y + yOff, ph.s, ph.rot, Math.min(1, ph.glow), screenContent(f), ph.sx, ph.sy);
  };
  const phoneHopping = f >= K.phoneHop0 && f < K.phoneHop1;
  if (!phoneInHand && !phoneHopping) drawPh();
  if (f >= K.phoneLand && f < K.phoneLand + 24) dust(ctx, PHONE_X, groundAt(PHONE_X) - 6, f, K.phoneLand, 9, 220, 3);
  swirl(ctx, phoneCenterApprox(), f);
  // creator
  shadow(ctx, J.base[0], J.p.lift, J.p.rot ? 200 : 90);
  const bulb = BULB[f];
  if (bulb && bulb.layer === 'creator' && !(f >= 160 && f < K.bulbPop)) drawBulbState(ctx, bulb, f);
  drawStick(ctx, J, { scarf: SCARF[f], scarfColor: PAL.mint });
  if (phoneInHand) drawPh();
  sweat(ctx, J, f, 34, 50); sweat(ctx, J, f, 124, 152);
  dizzyStars(ctx, J, f);
  impactBurst(ctx, J.head[0] + 50, J.head[1] - 10, f, K.bonk, 80);
  // heap / falling tower tiles cover the creator
  for (const id in tiles) if (tiles[id].layer === 'heap') drawT(+id, tiles[id]);
  if (f >= K.crash && f < K.crash + 24) dust(ctx, 490, groundAt(490) - 10, f, K.crash, 10, 300, 7);
  // reaching hand out of the heap
  if (f >= 188 && f < 236) {
    const t = E.outBack(inv(188, 200, f)) * (1 - E.inBack(inv(222, 236, f)));
    const base = [566, groundAt(566) - 190];
    const tip = [base[0] + 30 * t + 6 * Math.sin(f * 0.5), base[1] - 78 * t];
    ctx.save(); ctx.strokeStyle = PAL.white; ctx.lineCap = 'round'; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(tip[0], tip[1]); ctx.stroke();
    ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(tip[0], tip[1], 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // flying tiles
  for (const id in tiles) if (tiles[id].layer === 'front' || tiles[id].layer === 'fly') drawT(+id, tiles[id]);
  // bulb in front
  if (bulb && bulb.layer === 'front') drawBulbState(ctx, bulb, f);
  // cards
  for (const c of CARD[f]) drawCard(ctx, c);
  if (phoneHopping) drawPh();
  // hearts
  for (const h of HEARTS[f]) heart(ctx, h.x, h.y, h.r, PAL.heart, h.rot);
  // bursts
  sparkBurst(ctx, PHONE_X, PHONE_CY() - 20, f, K.powerUp, 10, 230, 4);
  sparkBurst(ctx, PHONE_X, PHONE_CY() - 20, f, K.genDone, 12, 260, 5);
  ringBurst(ctx, PHONE_X, PHONE_CY() - 20, f, K.powerUp, 16, 80, 300, PAL.mint, 10);
  if (f >= K.split - 1) sparkBurst(ctx, 1010, 650, f, K.split, 10, 140, 6, PAL.mintHi);
  FRIENDS.forEach((fr, i) => { const Fj = FJ[Math.min(f, N - 1)][i]; if (f >= 540 && f < 720) impactBurst(ctx, (Fj.haL[0] + Fj.haR[0]) / 2, (Fj.haL[1] + Fj.haR[1]) / 2 - 20, f, fr.catchF, 50, PAL.amber); });
  if (bulb && f >= K.bulbFull) sparkBurst(ctx, bulb.x, bulb.y, f, K.bulbFull, 8, 120, 9, PAL.mintHi);
  ctx.restore();

  // screen-space overlays
  drawCaption(ctx, f);
  drawEndCard(ctx, f);
}

function drawBulbState(ctx, b, f) {
  if (b.fade !== undefined && b.fade <= 0) return;
  ctx.save();
  if (b.fade !== undefined) ctx.globalAlpha = b.fade;
  if (b.ring) drawRing(ctx, b, 'back');
  drawBulb(ctx, b.x, b.y, b.r, b.on, { rot: b.rot, sy: b.sy });
  if (b.ring) drawRing(ctx, b, 'front');
  ctx.restore();
}
function drawRing(ctx, b, half) {
  const t = b.ring; if (t <= 0) return;
  ctx.save(); ctx.translate(b.x, b.y - b.r * 0.1); ctx.rotate(-0.42);
  ctx.strokeStyle = PAL.mint; ctx.lineWidth = b.r * 0.2; ctx.lineCap = 'round';
  const rx = b.r * 2.0, ry = b.r * 0.55;
  ctx.beginPath();
  if (half === 'back') ctx.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI + Math.PI * Math.min(1, t * 2));
  else if (t > 0.5) ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * Math.min(1, (t - 0.5) * 2));
  ctx.stroke();
  ctx.restore();
}

export function eventsJSON() {
  return { fps: FPS, frames: N, scenes: SCENES, narration: NARRATION, captions: CAPTIONS.map((c) => ({ f0: c.f0, f1: c.f1, text: c.lines.map((l) => l.map((s) => s[0]).join('')).join(' ') + (c.sub ? ' / ' + c.sub : '') })), keyFrames: K, sfx: events };
}
export const _dbg = (f) => ({ ph: PHONE_ST[f], cam: camera(f), haL: CJ[f].haL });
