// Meshline 30s promo — full timeline. drawFrame(ctx, t) is a pure function of time.
import fs from 'node:fs';
import { W, H, C, K, env, pulse, wobble, clamp, lerp, inv, ease, hexA, mixHex, bounceY, roundRect, noise1, hash, TAU } from './lib.mjs';
import { solve, drawStick, drawGlow, walkPose, BASE_POSE, DIM } from './rig.mjs';

const ICON = JSON.parse(fs.readFileSync(new URL('./iconPath.json', import.meta.url)));
const GROUND = 1450;

// ---------------------------------------------------------------- key times (seconds)
export const T = {
  flicker: 0.30, cracks: [0.55, 0.68, 0.81], dotFall: 0.95,
  cam1: [3.5, 4.6], idea: 6.4, appOpen: 6.7,
  ripples: [7.65, 8.15, 8.65], bFlip: 8.0,
  windup: 10.45, launch: 10.95, snap: 11.5,
  taps1: [12.6, 12.8, 13.0], taps2: [15.0, 15.15, 15.3],
  bubbles: [
    { from: 'A', pop: 13.25, ride: [13.45, 14.45], s: 1 },
    { from: 'B', pop: 15.45, ride: [15.6, 16.5], s: 1 },
    { from: 'A', pop: 16.72, ride: [16.85, 17.35], s: 0.8 },
    { from: 'B', pop: 17.32, ride: [17.45, 17.95], s: 0.8 },
    { from: 'A', pop: 19.0, ride: [19.12, 19.92], s: 0.85 },
    { from: 'B', pop: 20.1, ride: [20.22, 21.02], s: 0.85 },
    { from: 'A', pop: 21.15, ride: [21.27, 22.0], s: 0.85 },
  ],
  bTurn: [18.0, 18.35], walk: [18.35, 22.3], bTurnBack: [22.3, 22.55], stepIn: [22.38, 22.88],
  fiveWind: 22.88, five: 23.15, dive: [23.25, 23.97], end: 24.0,
  wave: [24.35, 24.95], tile: [24.9, 25.3], iconFade: [25.2, 25.5],
  word: 25.2, sub: 25.65, cta: 26.0, mini: 26.4,
};

const CAPTIONS = [
  { text: 'No internet.', in: 1.45, out: 3.55, col: C.coral },
  { text: 'Still nearby.', in: 4.3, out: 7.45, col: C.coral },
  { text: 'Private nearby messaging', in: 8.1, out: 12.2, col: C.mesh },
  { text: 'Send a private message', in: 12.55, out: 17.95, col: C.mesh },
  { text: 'Keep the conversation moving', in: 18.6, out: 23.1, col: C.mesh },
];

// ---------------------------------------------------------------- walking distance (S5)
const V_WALK = 270;
function walkSpeed(t) {
  const [a, b] = T.walk;
  if (t < a || t > b) return 0;
  return V_WALK * Math.min(env(t, a, a + 0.45, 'sine'), 1 - env(t, b - 0.42, b, 'sine'));
}
const SX = []; // cumulative distance sampled at 1/600 s
{ let x = 0; for (let i = 0; i <= 30 * 600; i++) { SX.push(x); x += walkSpeed(i / 600) / 600; } }
export const sx = t => SX[clamp(Math.round(t * 600), 0, SX.length - 1)];
const STRIDE = 46, CYCLE = 4 * STRIDE; // body advance per walk cycle
const B_WALK_OFF = 0.25; // B's steps fall between A's
const blink = (t, times) => { let e = 1; for (const b of times) e = Math.min(e, 1 - pulse(t, b, b + 0.05, b + 0.07, b + 0.13)); return e; };
const taps = (t, times, amp = 9) => times.reduce((a, tt) => a + (t >= tt ? amp * Math.exp(-(t - tt) * 22) * Math.sin(Math.min(1, (t - tt) * 12) * Math.PI) : 0), 0);

// ---------------------------------------------------------------- named poses
const P = o => ({ ...BASE_POSE, ...o });
const POSE = {
  type: P({ hn: [62, 72], tilt: 0.28, smile: 0.35 }),
  startle: P({ lean: -0.16, tilt: -0.4, eye: 1.35, brow: 1, mouthO: 0.55, hn: [40, 50], hf: [-70, 110], smile: 0 }),
  jump: P({ lift: -95, lean: -0.08, tilt: -0.3, hn: [75, -95], hf: [-80, -90], fn: [34, -38], ff: [-30, -22], eye: 1.4, brow: 1, mouthO: 1 }),
  land: P({ crouch: 34, lean: 0.05, tilt: 0.1, hn: [70, 40], hf: [-60, 120], eye: 1.2, brow: 0.6, mouthO: 0.4 }),
  worried: P({ hn: [72, 62], tilt: 0.32, brow: -0.4, browTilt: 1, smile: -0.55, eye: 1.1 }),
  holdUp: P({ hn: [22, -178], tilt: -0.5, lift: -16, fn: [18, -4], ff: [-18, -4], hf: [-28, 165], brow: -0.2, browTilt: 0.8, smile: -0.35 }),
  sigh: P({ hn: [52, 128], hf: [-14, 176], crouch: 12, tilt: 0.38, lean: 0.06, smile: -0.45, eye: 0.55, brow: -0.6 }),
  notice: P({ hn: [60, 105], tilt: -0.04, eye: 1.32, brow: 0.9, smile: 0.05, mouthO: 0.25 }),
  smile: P({ hn: [62, 95], eye: 1, brow: 0.35, smile: 0.85 }),
  idea: P({ hn: [64, 70], hf: [30, -150], eye: 1.3, brow: 1, smile: 0.7, tilt: 0.15 }),
  show: P({ hn: [118, 26], lean: 0.06, smile: 0.8, brow: 0.4 }),
  offer: P({ hn: [128, 34], lean: 0.07, smile: 0.75, brow: 0.3 }),
  windup: P({ hn: [6, 52], lean: -0.14, crouch: 22, tilt: 0.05, smile: 0.5, brow: 0.5 }),
  flick: P({ hn: [168, 4], lean: 0.18, crouch: 6, smile: 0.9, eye: 1.2, brow: 0.6 }),
  link: P({ hn: [140, 28], lean: 0.08, smile: 0.85 }),
  cheer: P({ hn: [140, 28], hf: [70, -160], lift: -30, lean: -0.04, smile: 1, eye: 0.5, mouthO: 0.35 }),
  catch: P({ hn: [162, 12], lean: 0.2, crouch: 8, eye: 1.3, brow: 0.8, mouthO: 0.5 }),
  laugh: P({ hn: [128, 30], lean: -0.13, tilt: -0.2, smile: 1, eye: 0.35, mouthO: 0.5, brow: 0.5 }),
  walkA: P({ hn: [124, 72], smile: 0.8, tilt: 0.05 }),
  walkB: P({ hn: [-122, 108], smile: 0.8, tilt: -0.05, look: 1 }),
  fiveWind: P({ hn: [34, 150], hf: [-40, -150], lean: -0.06, crouch: 14, smile: 0.9, eye: 1.2, brow: 0.6 }),
  five: P({ hn: [34, 150], hf: [124, -112], lean: 0.12, crouch: 0, smile: 1, eye: 0.4, mouthO: 0.45, brow: 0.6 }),
};

// ---------------------------------------------------------------- character A (beanie)
function charA(t) {
  let x;
  if (t < 0.62) x = 250 + 150 * Math.min(t, 0.6) - 40 * env(t, 0.5, 0.62, 'out');
  else x = 300 + 40 * env(t, 0.62, 0.9, 'out');
  // tiny backwards hop on startle
  x -= 24 * env(t, 1.1, 1.4, 'out') - 24 * env(t, 1.9, 2.3);
  const keys = [
    [0, POSE.type], [0.55, POSE.type, 'hold'],
    [0.75, POSE.startle, 'out'], [1.06, POSE.startle],
    [1.13, POSE.land, 'out'], [1.24, POSE.jump, 'out'], [1.42, POSE.land, 'in'],
    [1.62, POSE.worried, 'out'], [2.38, POSE.worried],
    [2.62, POSE.holdUp, 'outBack'], [4.85, POSE.holdUp],
    [5.25, POSE.sigh], [5.38, POSE.sigh],
    [5.55, POSE.notice, 'out'], [5.95, P({ ...POSE.notice, smile: 0.6, mouthO: 0 })],
    [6.3, POSE.smile], [6.45, POSE.idea, 'outBack'], [6.62, P({ ...POSE.type, smile: 0.7, brow: 0.6 })],
    [6.95, POSE.show, 'outBack'], [7.55, POSE.show], [7.7, POSE.offer, 'out'],
    [10.45, POSE.offer], [10.85, POSE.windup, 'out'], [10.95, POSE.flick, 'inBack'],
    [11.5, POSE.link], [11.75, POSE.cheer, 'out'], [12.05, POSE.link, 'inOut'],
    [12.5, P({ ...POSE.link, tilt: 0.22, hn: [122, 40] })], [13.3, P({ ...POSE.link, tilt: 0.22, hn: [122, 40] })],
    [13.6, POSE.link], [16.45, POSE.link],
    [16.62, POSE.laugh, 'out'], [16.95, POSE.link], [18.3, POSE.link],
    [18.6, POSE.walkA], [22.3, POSE.walkA],
    [22.88, POSE.fiveWind, 'out'], [23.1, POSE.five, 'inBack'], [24, POSE.five],
  ];
  const pose = K(t, keys);
  // procedural layers
  pose.crouch += 2.2 * Math.sin(t * TAU * 0.45);
  if (t < 0.6) { const w = walkPose(t * 1.35, 1 - env(t, 0.45, 0.6), 40); Object.assign(pose, { fn: w.fn, ff: w.ff, hf: w.hf }); pose.crouch += w.crouch; }
  // shake the phone
  const sh = pulse(t, 1.62, 1.72, 2.25, 2.38);
  pose.hn = [pose.hn[0] + 34 * Math.sin(t * TAU * 7) * sh, pose.hn[1] + 22 * Math.sin(t * TAU * 7 + 1.3) * sh];
  pose.tilt += 0.08 * Math.sin(t * TAU * 7) * sh;
  // hopping while holding up
  const hop = (a) => -46 * Math.sin(Math.PI * clamp((t - a) / 0.32));
  if (t > 2.6 && t < 3.9) { pose.lift += hop(2.95) + hop(3.42); pose.hn = [pose.hn[0] + 16 * Math.sin(t * TAU * 1.1), pose.hn[1]]; }
  // typing taps
  pose.hn = [pose.hn[0], pose.hn[1] + taps(t, [0.12, 0.26, 0.4, 6.58, ...T.taps1, 18.9, 21.05])];
  // receiving bounces
  pose.hn = [pose.hn[0] + 0, pose.hn[1] + wobble(t, 16.5, 5, 7, 12) + wobble(t, 17.95, 5, 7, 10)];
  pose.eye *= blink(t, [2.15, 4.95, 9.4, 14.2, 19.6, 21.7]);
  // walking (S5)
  let fsA = 1;
  if (t >= T.walk[0] - 0.05 && t <= T.walk[1] + 0.05) {
    const amt = clamp(walkSpeed(t) / V_WALK * 1.4, 0, 1);
    const w = walkPose(sx(t) / CYCLE, amt, STRIDE);
    pose.fn = w.fn; pose.ff = w.ff; pose.crouch += w.crouch; pose.lean += w.lean;
    pose.hn = [pose.hn[0], pose.hn[1] + 5 * Math.cos(sx(t) / CYCLE * TAU * 2)];
  }
  // step in for the high-five
  if (t > T.stepIn[0] && t < T.stepIn[1] + 0.05) {
    const k = inv(...T.stepIn, t);
    const w = walkPose(k * 1.0, Math.sin(Math.PI * k), 44);
    pose.fn = w.fn; pose.ff = w.ff; pose.crouch += w.crouch;
  }
  x += sx(t) + 92 * env(t, ...T.stepIn, 'inOut');
  const phoneColor = t < 0.55 ? C.ink : t < T.appOpen ? C.coral : C.mesh;
  const glyph = t < 0.55 ? 'chat' : t < T.appOpen ? 'x' : 'mesh';
  const flash = pulse(t, 0.55, 0.57, 0.62, 0.8) + pulse(t, T.appOpen, T.appOpen + 0.03, T.appOpen + 0.1, T.appOpen + 0.4) + arrivalFlash(t, 'A');
  const searching = t > 2.5 && t < T.appOpen ? 0.55 + 0.45 * Math.sin(t * TAU * 1.6) : 1;
  return { x, y: GROUND, s: 1, fs: fsA, pose, acc: 'beanie', phoneColor, glyph, glow: (1 + 1.2 * flash) * searching, screen: 0.85 + 0.15 * flash };
}

// ---------------------------------------------------------------- character B (bun)
function charB(t) {
  let x = 820;
  const keys = [
    [0, POSE.holdUp], [4.85, POSE.holdUp],
    [5.25, POSE.sigh], [5.42, POSE.sigh],
    [5.6, POSE.notice, 'out'], [5.85, P({ ...POSE.notice, smile: 0.6, mouthO: 0, hf: [70, -160] })],
    [6.55, P({ ...POSE.smile, hf: [70, -160] })], [6.85, P({ ...POSE.smile, brow: 0.6 })],
    [7.9, P({ ...POSE.smile, brow: 0.6 })],
    [8.02, P({ ...POSE.startle, tilt: -0.1 }), 'out'], [8.12, P({ ...POSE.jump, lift: -55, hn: [70, -20] }), 'out'], [8.32, P({ ...POSE.land, crouch: 20 }), 'in'],
    [8.6, P({ ...POSE.worried, smile: 0.2, brow: 0.6, browTilt: 0 })], [8.95, POSE.smile],
    [9.25, POSE.smile], [9.65, POSE.offer, 'outBack'], [10.95, POSE.offer],
    [11.38, POSE.catch, 'out'], [11.5, POSE.catch], [11.62, P({ ...POSE.link, lean: -0.06 }), 'out'],
    [11.8, POSE.cheer, 'out'], [12.1, POSE.link],
    [14.48, POSE.link], [14.62, POSE.laugh, 'out'], [15.0, P({ ...POSE.link, tilt: 0.22, hn: [122, 40] })],
    [15.35, P({ ...POSE.link, tilt: 0.22, hn: [122, 40] })], [15.55, POSE.link], [17.98, POSE.link],
    [18.0, POSE.link], [18.35, POSE.walkB], [22.3, POSE.walkB],
    [22.55, P({ ...POSE.link, hn: [50, 140] })],
    [22.88, POSE.fiveWind, 'out'], [23.1, POSE.five, 'inBack'], [24, POSE.five],
  ];
  const pose = K(t, keys);
  pose.crouch += 2.2 * Math.sin(t * TAU * 0.41 + 1);
  const hop = (a) => -40 * Math.sin(Math.PI * clamp((t - a) / 0.3));
  if (t < 4.9) { pose.lift += hop(3.18) + hop(3.62) + hop(4.25); pose.hn = [pose.hn[0] + 14 * Math.sin(t * TAU * 1.0 + 2), pose.hn[1]]; }
  // wave
  const wv = pulse(t, 5.85, 5.95, 6.45, 6.6);
  pose.hf = [pose.hf[0] + 30 * Math.sin(t * TAU * 3.2) * wv, pose.hf[1]];
  pose.hn = [pose.hn[0], pose.hn[1] + taps(t, [...T.taps2, 20.0, 21.9]) + wobble(t, 14.5, 5, 7, 12) + wobble(t, 17.4, 5, 7, 10)];
  pose.eye *= blink(t, [4.1, 7.15, 10.2, 13.5, 16.1, 20.6]);
  // turn around to walk, then turn back
  const fsB = -1 + 2 * env(t, ...T.bTurn, 'inOut') - 2 * env(t, ...T.bTurnBack, 'inOut');
  if (t >= T.walk[0] - 0.05 && t <= T.walk[1] + 0.05) {
    const amt = clamp(walkSpeed(t) / V_WALK * 1.4, 0, 1);
    const w = walkPose(sx(t) / CYCLE + B_WALK_OFF, amt, STRIDE);
    pose.fn = w.fn; pose.ff = w.ff; pose.crouch += w.crouch; pose.lean += w.lean;
  }
  if (t > T.stepIn[0] && t < T.stepIn[1] + 0.05) {
    const k = inv(...T.stepIn, t);
    const w = walkPose(k * 1.0 + 0.5, Math.sin(Math.PI * k), 44);
    pose.fn = w.fn; pose.ff = w.ff; pose.crouch += w.crouch;
  }
  // shrink the turn squash a bit so the body never collapses to a line
  const fs = Math.sign(fsB || 1) * Math.max(Math.abs(fsB), 0.12);
  x += sx(t) - 92 * env(t, ...T.stepIn, 'inOut');
  const phoneColor = t < T.bFlip ? C.coral : C.mesh;
  const glyph = t < T.bFlip ? 'x' : 'mesh';
  const flash = pulse(t, T.bFlip, T.bFlip + 0.03, T.bFlip + 0.1, T.bFlip + 0.45) + arrivalFlash(t, 'B');
  const searching = t < T.bFlip ? 0.55 + 0.45 * Math.sin(t * TAU * 1.4 + 1) : 1;
  return { x, y: GROUND, s: 1, fs, pose, acc: 'bun', phoneColor, glyph, glow: (1 + 1.2 * flash) * searching, screen: 0.85 + 0.15 * flash };
}

function arrivalFlash(t, who) {
  let f = 0;
  for (const b of T.bubbles) {
    const to = b.from === 'A' ? 'B' : 'A';
    if (to === who) f += pulse(t, b.ride[1], b.ride[1] + 0.03, b.ride[1] + 0.08, b.ride[1] + 0.4);
  }
  return f;
}

// ---------------------------------------------------------------- camera
function camera(t) {
  let c = K(t, [
    [0, { cx: 322, cy: 1012, z: 1.36 }], [3.5, { cx: 338, cy: 1006, z: 1.34 }],
    [4.6, { cx: 580, cy: 1010, z: 1.2 }],
    [7.5, { cx: 580, cy: 1012, z: 1.2 }], [12.0, { cx: 582, cy: 1030, z: 1.28 }],
    [17.9, { cx: 584, cy: 1032, z: 1.3 }], [18.6, { cx: 590, cy: 1016, z: 1.2 }],
    [22.3, { cx: 590, cy: 1016, z: 1.2 }], [23.15, { cx: 580, cy: 1000, z: 1.3 }],
  ]);
  c = { ...c, cx: c.cx + sx(t) };
  // impact shake from the falling sign
  let shx = 0, shy = 0;
  for (const imp of SIGN_IMPACTS) { shy += wobble(t, imp.t, 17, 14, 7 * imp.g); shx += wobble(t, imp.t + 0.01, 13, 14, 4 * imp.g); }
  shy += wobble(t, T.five, 15, 12, 6);
  c.cx += shx; c.cy += shy;
  // dive into the high-five node
  if (t > T.dive[0]) {
    const k = ease.expoIn(inv(...T.dive, t));
    const hp = FIVE_POINT;
    c.cx = lerp(c.cx, hp[0], ease.out(inv(T.dive[0], T.dive[0] + 0.45, t)));
    c.cy = lerp(c.cy, hp[1], ease.out(inv(T.dive[0], T.dive[0] + 0.45, t)));
    c.z = lerp(c.z, 14, k);
  }
  return c;
}
let FIVE_POINT = [0, 0];
{ // contact point of the two far hands at the high-five
  const a = solve(charA(T.five)), b = solve(charB(T.five));
  FIVE_POINT = [(a.M.hF[0] + b.M.hF[0]) / 2, (a.M.hF[1] + b.M.hF[1]) / 2];
}

const setCam = (ctx, c, p = 1) => {
  const cxp = 540 + (c.cx - 540) * p;
  ctx.setTransform(c.z, 0, 0, c.z, 540 - cxp * c.z, 960 - c.cy * c.z);
};

// ---------------------------------------------------------------- the Wi-Fi sign that breaks
const SIGN = { x: 150, dotY: 800, plate: [150, 742, 268, 236] };
const ARCS = [
  { r: 106, crack: T.cracks[0], dx: 78, rock: 0.42 },
  { r: 72, crack: T.cracks[1], dx: 22, rock: -0.38 },
  { r: 38, crack: T.cracks[2], dx: 112, rock: 0.5 },
];
const ARC_W = 18;
const G = 3800;
for (const a of ARCS) {
  a.fall = a.crack + 0.04;
  a.rest = GROUND - ARC_W / 2 - a.r;
  a.b = bounceY(99, a.fall, SIGN.dotY, a.rest, G, 0.3, 2);
}
const DOT = { fall: T.dotFall, r: 13 };
DOT.rest = GROUND - DOT.r;
DOT.b = bounceY(99, DOT.fall, SIGN.dotY, DOT.rest, G, 0.42, 3);
export const SIGN_IMPACTS = [];
ARCS.forEach((a, i) => a.b.impacts.forEach((tt, j) => SIGN_IMPACTS.push({ t: tt, g: [1, 0.3, 0.1][j] ?? 0.05, kind: 'arc', i })));
DOT.b.impacts.forEach((tt, j) => SIGN_IMPACTS.push({ t: tt, g: [0.6, 0.25, 0.1, 0.05][j] ?? 0.04, kind: 'dot' }));

function drawSign(ctx, t) {
  const [px, py, pw, ph] = SIGN.plate;
  // pole
  ctx.strokeStyle = C.line; ctx.lineWidth = 12; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(px, py + ph / 2); ctx.lineTo(px, GROUND); ctx.stroke();
  ctx.fillStyle = C.line; ctx.fillRect(px - 26, GROUND - 10, 52, 10);
  // plate
  roundRect(ctx, px - pw / 2, py - ph / 2, pw, ph, 30);
  ctx.fillStyle = '#161E1B'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.line; ctx.stroke();
  // online glow (flickers out)
  let on = 1;
  if (t > T.flicker) on = (noise1(t * 38) > -0.1 ? 1 : 0.15) * (1 - env(t, 0.5, T.cracks[0]));
  if (t > T.cracks[0]) on = 0;
  if (on > 0) {
    const g = ctx.createRadialGradient(SIGN.x, SIGN.dotY - 40, 0, SIGN.x, SIGN.dotY - 40, 210);
    g.addColorStop(0, hexA(C.ink, 0.16 * on)); g.addColorStop(1, hexA(C.ink, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(SIGN.x, SIGN.dotY - 40, 210, 0, TAU); ctx.fill();
  }
  // mounting screws where pieces were
  ctx.fillStyle = C.line;
  for (const a of ARCS) for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(SIGN.x + s * a.r * 0.707, SIGN.dotY - a.r * 0.707, 4, 0, TAU); ctx.fill(); }
  // pieces
  const lit = t < T.cracks[0] ? (t > T.flicker ? 0.35 + 0.65 * on : 1) : 0;
  const pieceCol = lit > 0 ? mixHex('#58625E', C.ink, lit) : '#7C8682';
  ctx.lineCap = 'round';
  for (const a of ARCS) {
    let cx = SIGN.x, cy = SIGN.dotY, rot = 0;
    if (t >= a.crack && t < a.fall) { cx += (hash(Math.floor(t * 60) + a.r) - 0.5) * 6; cy += 3; }
    if (t >= a.fall) {
      const b = bounceY(t, a.fall, SIGN.dotY, a.rest, G, 0.3, 2);
      cy = b.y;
      const imp = a.b.impacts[0];
      const k = clamp((t - a.fall) / (imp - a.fall));
      rot = Math.PI * ease.inOut(k) * (a.rock > 0 ? 1 : -1);
      cx += a.dx * ease.out(clamp((t - a.fall) / (imp - a.fall + 0.3)));
      if (t > imp) {
        const th = wobble(t, imp, 1.5, 2.2, a.rock);
        rot = Math.PI * Math.sign(a.rock) + th;
        cx += -a.r * th * 0.9;
      }
    }
    // keep the piece above ground while rotating mid-air
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.strokeStyle = t >= a.crack ? '#7C8682' : pieceCol; ctx.lineWidth = ARC_W;
    ctx.beginPath(); ctx.arc(0, 0, a.r, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke();
    ctx.restore();
    // sparks at the crack
    if (t > a.crack && t < a.crack + 0.3) {
      const k = (t - a.crack) / 0.3;
      ctx.strokeStyle = hexA(C.ink, 1 - k); ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI / 2 + (hash(i + a.r) - 0.5) * 2.6;
        const ox = SIGN.x + Math.cos(Math.PI * (i % 2 ? 1.25 : 1.75)) * a.r, oy = SIGN.dotY + Math.sin(Math.PI * 1.25) * a.r;
        const d0 = 10 + 90 * k, d1 = d0 + 18 * (1 - k);
        ctx.beginPath(); ctx.moveTo(ox + Math.cos(ang) * d0, oy + Math.sin(ang) * d0 + 200 * k * k); ctx.lineTo(ox + Math.cos(ang) * d1, oy + Math.sin(ang) * d1 + 200 * k * k); ctx.stroke();
      }
    }
  }
  // dot: falls, bounces and rolls to A's heel
  let dx = SIGN.x, dy = SIGN.dotY;
  if (t >= DOT.fall) {
    dy = bounceY(t, DOT.fall, SIGN.dotY, DOT.rest, G, 0.42, 3).y;
    dx += 150 * ease.out(clamp((t - DOT.fall) / 1.6));
  }
  ctx.fillStyle = t >= T.cracks[0] ? '#7C8682' : pieceCol;
  ctx.beginPath(); ctx.arc(dx, dy, DOT.r, 0, TAU); ctx.fill();
}

// ---------------------------------------------------------------- environment
function drawSky(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bgDeep); g.addColorStop(0.55, C.bg); g.addColorStop(1, '#0E1311');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function buildings(ctx, c, t, p, col, winCol, seed, base, hMin, hMax, wMin, wMax) {
  setCam(ctx, c, p);
  const cxp = 540 + (c.cx - 540) * p;
  const left = cxp - 540 / c.z - 400, right = cxp + 540 / c.z + 400;
  // deterministic building row
  let x = -3000, i = 0;
  while (x < right) {
    const w = wMin + hash(seed + i * 3.1) * (wMax - wMin);
    const h = hMin + hash(seed + i * 7.7) * (hMax - hMin);
    if (x + w > left) {
      ctx.fillStyle = col; ctx.fillRect(x, base - h, w - 8, h + 4);
      ctx.fillStyle = winCol;
      for (let wy = base - h + 30; wy < base - 40; wy += 46) for (let wx = x + 22; wx < x + w - 34; wx += 38) {
        const lit = hash(wx * 0.13 + wy * 0.71 + seed);
        if (lit > 0.82) { ctx.fillStyle = hexA(C.ink, 0.07 + 0.05 * Math.sin(t * 0.7 + lit * 30)); ctx.fillRect(wx, wy, 14, 20); ctx.fillStyle = winCol; }
        else if (lit > 0.3) ctx.fillRect(wx, wy, 14, 20);
      }
    }
    x += w; i++;
  }
}

function drawCafe(ctx, t) {
  // a café with a dead Wi-Fi sign that the pair walks past in S5 (world layer)
  const x0 = 1080, w = 560, top = 1020;
  ctx.fillStyle = '#1A2320'; ctx.fillRect(x0, top, w, GROUND - top);
  ctx.fillStyle = '#212B28'; ctx.fillRect(x0 - 20, top - 40, w + 40, 46);
  // awning stripes
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#26312D' : '#1D2724'; ctx.fillRect(x0 - 20 + i * (w + 40) / 8, top + 6, (w + 40) / 8, 34); }
  // window
  roundRect(ctx, x0 + 50, top + 90, 300, 230, 14); ctx.fillStyle = '#121916'; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 6; ctx.stroke();
  // door
  roundRect(ctx, x0 + 400, top + 120, 110, GROUND - top - 120, 10); ctx.fillStyle = '#121916'; ctx.fill(); ctx.stroke();
  // dead Wi-Fi glyph in the window: coral, flickering, slashed
  const fl = noise1(t * 9) > -0.35 ? 1 : 0.3;
  const gx = x0 + 200, gy = top + 250;
  ctx.globalAlpha = 0.85 * fl;
  ctx.strokeStyle = C.coral; ctx.lineCap = 'round'; ctx.lineWidth = 11;
  for (const r of [28, 56, 84]) { ctx.beginPath(); ctx.arc(gx, gy, r, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke(); }
  ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(gx, gy, 9, 0, TAU); ctx.fill();
  ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(gx - 80, gy - 110); ctx.lineTo(gx + 80, gy + 20); ctx.stroke();
  ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(gx, gy - 40, 0, gx, gy - 40, 220);
  g.addColorStop(0, hexA(C.coral, 0.10 * fl)); g.addColorStop(1, hexA(C.coral, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy - 40, 220, 0, TAU); ctx.fill();
}

function drawStreet(ctx, c, t) {
  setCam(ctx, c, 1);
  const left = c.cx - 540 / c.z - 50, right = c.cx + 540 / c.z + 50;
  // lamps every 900px (light pools)
  for (let lx = Math.floor(left / 900) * 900 + 980 % 900; lx < right + 900; lx += 900) {
    if (lx < 600) continue;
    ctx.strokeStyle = C.line; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(lx, GROUND); ctx.lineTo(lx, 760); ctx.quadraticCurveTo(lx, 720, lx - 50, 720); ctx.stroke();
    ctx.fillStyle = '#C9CEC9'; roundRect(ctx, lx - 90, 712, 50, 18, 8); ctx.fill();
    const g = ctx.createRadialGradient(lx - 65, 740, 0, lx - 65, 900, 520);
    g.addColorStop(0, hexA(C.ink, 0.07)); g.addColorStop(1, hexA(C.ink, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lx - 80, 730); ctx.lineTo(lx - 330, GROUND); ctx.lineTo(lx + 200, GROUND); ctx.lineTo(lx - 50, 730); ctx.fill();
  }
  drawCafe(ctx, t);
  // ground
  ctx.fillStyle = C.ground; ctx.fillRect(left, GROUND, right - left, 1200);
  ctx.fillStyle = C.line; ctx.fillRect(left, GROUND - 2, right - left, 5);
  ctx.fillStyle = '#18201D'; ctx.fillRect(left, GROUND + 92, right - left, 4);
  ctx.strokeStyle = '#18201D'; ctx.lineWidth = 3;
  for (let x = Math.floor(left / 170) * 170; x < right; x += 170) { ctx.beginPath(); ctx.moveTo(x, GROUND + 6); ctx.lineTo(x - 40, GROUND + 90); ctx.stroke(); }
}

function drawStars(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 46; i++) {
    const x = hash(i * 1.7) * W, y = 60 + hash(i * 3.3) * 760;
    const a = 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(t * (0.6 + hash(i) * 1.4) + i));
    ctx.fillStyle = hexA(C.ink, a); ctx.fillRect(x, y, 3, 3);
  }
}

// ---------------------------------------------------------------- the mesh line (icon geometry)
const LINE_N = 90;
const ICON_PTS = (() => {
  const pts = ICON.points; const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const out = [];
  for (let k = 0; k <= LINE_N; k++) {
    const s = (k / LINE_N) * L[L.length - 1];
    let i = 1; while (i < L.length - 1 && L[i] < s) i++;
    const f = (s - L[i - 1]) / (L[i] - L[i - 1] || 1);
    out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]);
  }
  return out;
})();

function mapIcon(P0, P1) {
  const E0 = ICON_PTS[0], E1 = ICON_PTS[LINE_N];
  const vx = E1[0] - E0[0], vy = E1[1] - E0[1];
  const ux = P1[0] - P0[0], uy = P1[1] - P0[1];
  const k = Math.hypot(ux, uy) / Math.hypot(vx, vy);
  const rot = Math.atan2(uy, ux) - Math.atan2(vy, vx);
  const cs = Math.cos(rot) * k, sn = Math.sin(rot) * k;
  return ICON_PTS.map(([x, y]) => { const dx = x - E0[0], dy = y - E0[1]; return [P0[0] + dx * cs - dy * sn, P0[1] + dx * sn + dy * cs]; });
}

function bubbleState(t) {
  // which bubble is riding (for sag) — returns list of {u, w}
  const out = [];
  for (const b of T.bubbles) {
    if (t >= b.ride[0] && t <= b.ride[1]) {
      const k = ease.inOut(inv(...b.ride, t));
      out.push({ u: b.from === 'A' ? k : 1 - k, w: b.s, b });
    }
  }
  return out;
}

function linePoints(t, P0, P1) {
  let pts = mapIcon(P0, P1);
  const riders = bubbleState(t);
  const launchK = t < T.snap ? ease.out(inv(T.launch, T.snap, t)) : 1;
  pts = pts.map(([x, y], i) => {
    const u = i / LINE_N;
    let dy = 8 * Math.sin(Math.PI * u); // slack
    for (const r of riders) dy += 34 * r.w * Math.pow(Math.sin(Math.PI * r.u), 0.6) * Math.exp(-Math.pow((u - r.u) / 0.2, 2));
    dy += wobble(t, T.snap, 3.1, 4.2, 30) * Math.sin(Math.PI * u);
    dy += wobble(t, T.five, 4, 6, 14) * Math.sin(Math.PI * u);
    if (t < T.snap) dy -= 150 * (1 - launchK) * Math.sin(Math.PI * u); // thrown arc settles into place
    return [x, y + dy];
  });
  return pts;
}

function linkEnds(gA, gB) {
  const top = g => [g.M.phone[0] + Math.sin(g.M.phoneAng) * 40, g.M.phone[1] - Math.cos(g.M.phoneAng) * 40];
  return [top(gA), top(gB)];
}

function strokePts(ctx, pts, n = pts.length) {
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i < n; i++) ctx.lineTo(...pts[i]);
}

function drawLink(ctx, t, gA, gB) {
  const [P0, P1] = linkEnds(gA, gB);
  // dotted preview hint before the throw
  if (t > 9.3 && t < T.launch + 0.05) {
    const pts = mapIcon(P0, P1).map(([x, y], i) => [x, y + 8 * Math.sin(Math.PI * i / LINE_N)]);
    const a = (0.25 + 0.25 * Math.sin((t - 9.3) * TAU * 2)) * env(t, 9.3, 9.7) * (1 - env(t, T.launch - 0.1, T.launch + 0.05));
    ctx.save(); ctx.setLineDash([2, 26]); ctx.lineDashOffset = -t * 60; ctx.lineCap = 'round';
    ctx.strokeStyle = hexA(C.meshLight, a); ctx.lineWidth = 10; strokePts(ctx, pts); ctx.stroke(); ctx.restore();
  }
  if (t < T.launch) return null;
  const pts = linePoints(t, P0, P1);
  const grow = t < T.snap ? ease.out(inv(T.launch, T.snap - 0.04, t)) : 1;
  const n = Math.max(2, Math.round(grow * LINE_N) + 1);
  // soft glow under the line
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = hexA(C.mesh, 0.22); ctx.lineWidth = 46; strokePts(ctx, pts, n); ctx.stroke();
  ctx.strokeStyle = C.mesh; ctx.lineWidth = 21; strokePts(ctx, pts, n); ctx.stroke();
  // travelling tip spark while launching
  if (t < T.snap) {
    const tip = pts[n - 1];
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(tip[0], tip[1], 11, 0, TAU); ctx.fill();
  }
  // node at the centre (icon motif) + pass-through pulse
  if (t >= T.snap) {
    const mid = pts[LINE_N / 2];
    let pk = 0; for (const r of bubbleState(t)) pk += Math.exp(-Math.pow((r.u - 0.5) / 0.07, 2));
    const nr = 15 * ease.outBack(env(t, T.snap, T.snap + 0.3, 'linear')) * (1 + 0.35 * pk);
    ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(mid[0], mid[1], nr + 6, 0, TAU); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(mid[0], mid[1], nr, 0, TAU); ctx.fill();
    // snap ring burst at B's phone
    const k = inv(T.snap, T.snap + 0.5, t);
    if (k < 1) {
      ctx.strokeStyle = hexA(C.meshLight, 1 - k); ctx.lineWidth = 8 * (1 - k) + 1;
      ctx.beginPath(); ctx.arc(P1[0], P1[1], 20 + 110 * ease.out(k), 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(mid[0], mid[1], 20 + 70 * ease.out(k), 0, TAU); ctx.stroke();
    }
  }
  return pts;
}

// ---------------------------------------------------------------- message bubbles
function drawBubble(ctx, x, y, s, from, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = alpha;
  const w = 132, h = 84;
  const fill = from === 'A' ? C.ink : C.mesh;
  const ink = from === 'A' ? '#2A3430' : C.ink;
  roundRect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = fill; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-10, h / 2 - 2); ctx.lineTo(0, h / 2 + 16); ctx.lineTo(12, h / 2 - 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-40, -12); ctx.lineTo(28, -12); ctx.moveTo(-40, 14); ctx.lineTo(4, 14); ctx.stroke();
  // privacy badge (stylised lock)
  ctx.fillStyle = from === 'A' ? C.mesh : C.ink;
  ctx.beginPath(); ctx.arc(w / 2 - 8, -h / 2 + 8, 22, 0, TAU); ctx.fill();
  ctx.fillStyle = from === 'A' ? C.ink : C.mesh; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 4;
  roundRect(ctx, w / 2 - 17, -h / 2 + 7, 18, 13, 3); ctx.fill();
  ctx.beginPath(); ctx.arc(w / 2 - 8, -h / 2 + 7, 6, Math.PI, 0); ctx.stroke();
  ctx.restore();
}

function drawBubbles(ctx, t, gA, gB, pts) {
  if (!pts) return;
  const [P0, P1] = linkEnds(gA, gB);
  for (const b of T.bubbles) {
    const src = b.from === 'A' ? P0 : P1, dst = b.from === 'A' ? P1 : P0;
    const lift = 58 * b.s;
    if (t >= b.pop && t < b.ride[0]) {
      const k = inv(b.pop, b.ride[0], t);
      const sc = b.s * ease.outBack(clamp(k * 1.3));
      drawBubble(ctx, src[0], src[1] - 10 - (lift - 10) * ease.out(k), sc, b.from);
    } else if (t >= b.ride[0] && t <= b.ride[1]) {
      const k = ease.inOut(inv(...b.ride, t));
      const u = b.from === 'A' ? k : 1 - k;
      const fi = u * LINE_N, i0 = Math.floor(fi), i1 = Math.min(LINE_N, i0 + 1), f = fi - i0;
      const x = lerp(pts[i0][0], pts[i1][0], f), y = lerp(pts[i0][1], pts[i1][1], f);
      const vel = Math.sin(Math.PI * inv(...b.ride, t));
      ctx.save(); ctx.translate(x, y - lift); ctx.rotate((b.from === 'A' ? 1 : -1) * 0.12 * vel); ctx.translate(-x, -(y - lift));
      // speed streaks
      ctx.strokeStyle = hexA(b.from === 'A' ? C.ink : C.meshLight, 0.35 * vel); ctx.lineWidth = 5; ctx.lineCap = 'round';
      const dir = b.from === 'A' ? -1 : 1;
      for (let j = 0; j < 3; j++) { const yy = y - lift - 20 + j * 20; ctx.beginPath(); ctx.moveTo(x + dir * (80 * b.s), yy); ctx.lineTo(x + dir * (80 * b.s + 50 * vel), yy); ctx.stroke(); }
      drawBubble(ctx, x, y - lift, b.s * (1 + 0.06 * vel), b.from);
      ctx.restore();
    } else if (t > b.ride[1] && t < b.ride[1] + 0.16) {
      const k = inv(b.ride[1], b.ride[1] + 0.16, t);
      drawBubble(ctx, dst[0], dst[1] - lift * (1 - k), b.s * (1 - ease.in(k)) * (1 + 0.15 * Math.sin(k * Math.PI)), b.from);
    }
  }
}

// ---------------------------------------------------------------- ripples (nearby discovery)
function drawRipples(ctx, t, gA) {
  const [P0] = linkEnds(gA, gA);
  for (const r0 of T.ripples) {
    const k = inv(r0, r0 + 1.1, t);
    if (t < r0 || k >= 1) continue;
    const r = 520 * ease.out(k);
    ctx.strokeStyle = hexA(C.mesh, Math.pow(1 - k, 1.4) * 0.95); ctx.lineWidth = 12 * (1 - k) + 2;
    ctx.beginPath(); ctx.arc(P0[0], P0[1], r, 0, TAU); ctx.stroke();
  }
}

function drawMarks(ctx, t, gA, gB) {
  // "!!" startle over A, "!" idea over A, motion streaks while shaking
  const mark = (g, txt, a, b, col = C.ink) => {
    if (t < a || t > b) return;
    const k = ease.outBack(clamp((t - a) / 0.22)) * (1 - env(t, b - 0.15, b));
    const [hx, hy] = g.M.head;
    ctx.save(); ctx.translate(hx + 40 * g.fs, hy - 105); ctx.scale(k, k); ctx.rotate(0.12 * g.fs);
    ctx.font = '96px MLDisplay'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore();
  };
  mark(gA, '!!', 1.14, 1.9, C.coral);
  mark(gA, '!', T.idea, 7.05, C.mesh);
  mark(gB, '!', T.bFlip + 0.02, 8.6, C.mesh);
  const sh = pulse(t, 1.62, 1.72, 2.25, 2.38);
  if (sh > 0.05) {
    const [px, py] = gA.M.phone;
    ctx.strokeStyle = hexA(C.ink, 0.6 * sh); ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const s of [-1, 1]) for (let j = 0; j < 3; j++) {
      const ox = px + s * (52 + j * 4), oy = py - 30 + j * 30;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + s * 24, oy - 6); ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------- high-five node + dive
function drawFive(ctx, t) {
  if (t < T.five) return;
  const [hx, hy] = FIVE_POINT;
  const k = inv(T.five, T.five + 0.45, t);
  if (k < 1) {
    ctx.strokeStyle = hexA(C.ink, 1 - k); ctx.lineWidth = 10 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(hx, hy, 18 + 150 * ease.out(k), 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU, d0 = 34 + 90 * ease.out(k), d1 = d0 + 30 * (1 - k);
      ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * d0, hy + Math.sin(a) * d0); ctx.lineTo(hx + Math.cos(a) * d1, hy + Math.sin(a) * d1); ctx.stroke();
    }
  }
  const r = 21 * ease.outBack(clamp((t - T.five) / 0.25));
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(hx, hy, r, 0, TAU); ctx.fill();
}

// ---------------------------------------------------------------- captions (screen space)
function wrap(ctx, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > maxW && cur) { lines.push(cur); cur = w; } else cur = n; }
  if (cur) lines.push(cur); return lines;
}
function drawCaptions(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const c of CAPTIONS) {
    if (t < c.in - 0.01 || t > c.out + 0.3) continue;
    ctx.font = '84px MLDisplayB'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const lines = wrap(ctx, c.text, 900);
    const out = env(t, c.out, c.out + 0.28, 'in');
    let wordIdx = 0;
    lines.forEach((ln, li) => {
      const y = 300 + li * 100 - 26 * out;
      const words = ln.split(' ');
      const totalW = ctx.measureText(ln).width;
      let x = 540 - totalW / 2;
      ctx.textAlign = 'left';
      for (const w of words) {
        const k = clamp((t - c.in - wordIdx * 0.07) / 0.32);
        const e = ease.outBack(k);
        ctx.globalAlpha = clamp(k * 2) * (1 - out);
        ctx.fillStyle = C.ink;
        ctx.fillText(w, x, y + 46 * (1 - e));
        x += ctx.measureText(w + ' ').width; wordIdx++;
      }
    });
    ctx.globalAlpha = 1 - out;
    // underline wipe
    const lastW = ctx.measureText(lines[lines.length - 1]).width;
    const uk = ease.out(clamp((t - c.in - 0.25) / 0.45));
    const uy = 300 + (lines.length - 1) * 100 + 34 - 26 * out;
    ctx.fillStyle = c.col; roundRect(ctx, 540 - lastW / 2, uy, Math.max(1, lastW * uk), 12, 6); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function vignette(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(540, 1000, 500, 540, 1000, 1250);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- end card
const LOGO = { cx: 540, cy: 670, size: 500 };
const logoPts = () => {
  const k = LOGO.size / ICON.size, ox = LOGO.cx - LOGO.size / 2, oy = LOGO.cy - LOGO.size / 2;
  return ICON_PTS.map(([x, y]) => [ox + x * k, oy + y * k]);
};
const LOGO_PTS = logoPts();
const LOGO_NODE = [LOGO.cx - LOGO.size / 2 + ICON.node[0] * LOGO.size / ICON.size, LOGO.cy - LOGO.size / 2 + ICON.node[1] * LOGO.size / ICON.size];

function miniPair(ctx, t) {
  const a0 = T.mini;
  if (t < a0) return;
  const appear = ease.outBack(clamp((t - a0) / 0.4));
  const y = 1770;
  ctx.globalAlpha = clamp((t - a0) / 0.2);
  ctx.fillStyle = C.line; roundRect(ctx, 540 - 360 * appear, y, 720 * appear, 5, 2); ctx.fill();
  const s = 0.46;
  const wave = Math.sin((t - a0) * TAU * 1.6);
  const pa = P({ hn: [96, 40], hf: [20 + 26 * wave, -165], smile: 1, eye: 0.6, lift: -10 * Math.abs(Math.sin((t - a0) * TAU * 0.8)) });
  const pb = P({ hn: [96, 40], hf: [20 - 26 * wave, -165], smile: 1, eye: 0.6, lift: -10 * Math.abs(Math.sin((t - a0) * TAU * 0.8 + 1.2)) });
  const gA = solve({ x: 350, y, s: s * appear, fs: 1, pose: pa, acc: 'beanie', phoneColor: C.mesh, glyph: 'mesh', glow: 0.8 });
  const gB = solve({ x: 730, y, s: s * appear, fs: -1, pose: pb, acc: 'bun', phoneColor: C.mesh, glyph: 'mesh', glow: 0.8 });
  drawGlow(ctx, gA); drawGlow(ctx, gB);
  drawStick(ctx, gA); drawStick(ctx, gB);
  const [P0, P1] = linkEnds(gA, gB);
  const pts = mapIcon(P0, P1);
  ctx.strokeStyle = C.mesh; ctx.lineWidth = 9; ctx.lineCap = 'round'; strokePts(ctx, pts); ctx.stroke();
  const mid = pts[LINE_N / 2]; ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(mid[0], mid[1], 10, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(mid[0], mid[1], 6.5, 0, TAU); ctx.fill();
  // little beads keep travelling both ways
  for (let i = 0; i < 4; i++) {
    const ph = ((t - a0 - 0.3) * 0.9 + i * 0.5) % 2;
    if (t - a0 < 0.3 + i * 0.25) continue;
    const u = ph < 1 ? ease.inOut(ph) : 1 - ease.inOut(ph - 1);
    const p = pts[Math.round(u * LINE_N)];
    ctx.fillStyle = (i % 2) ? C.meshLight : C.ink;
    roundRect(ctx, p[0] - 21, p[1] - 44, 42, 28, 9); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawEnd(ctx, t, icon) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // faint mesh field in background: slow drifting dots joined by short lines
  for (let i = 0; i < 26; i++) {
    const x = (hash(i * 2.3) * W + t * 12 * (hash(i) - 0.5) * 2 + W) % W, y = 120 + hash(i * 5.1) * 1700;
    ctx.fillStyle = hexA(C.ink, 0.06); ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill();
  }
  const beat = Math.pow(Math.max(0, Math.cos(((t - 24) % 0.5) / 0.5 * Math.PI)), 8);
  // tile + icon
  const ts = LOGO.size, tx = LOGO.cx - ts / 2, ty = LOGO.cy - ts / 2 + 6 * Math.sin((t - 25.5) * TAU * 0.35) * env(t, 25.5, 26);
  const tileK = ease.inOut(inv(...T.tile, t));
  const fadeK = ease.inOut(inv(...T.iconFade, t));
  if (tileK > 0) {
    ctx.save();
    const g = ctx.createRadialGradient(LOGO.cx, LOGO.cy + 40, 100, LOGO.cx, LOGO.cy + 40, 420);
    g.addColorStop(0, hexA(C.mesh, 0.16 * tileK)); g.addColorStop(1, hexA(C.mesh, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 200, W, 1000);
    roundRect(ctx, tx, ty, ts, ts, 112);
    ctx.lineWidth = 4; ctx.strokeStyle = hexA('#3A4642', tileK);
    ctx.setLineDash([2200 * tileK, 4000]); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  if (fadeK > 0) {
    ctx.save(); roundRect(ctx, tx, ty, ts, ts, 112); ctx.clip();
    ctx.globalAlpha = fadeK; ctx.drawImage(icon, tx, ty, ts, ts); ctx.restore();
  }
  // vector wave growing out of the node (before the icon takes over)
  if (fadeK < 1) {
    const wk = ease.out(inv(...T.wave, t));
    const half = LINE_N / 2, n = Math.round(wk * half);
    const pts = LOGO_PTS.map(([x, y]) => [x, y + (ty - (LOGO.cy - ts / 2))]);
    ctx.globalAlpha = 1 - fadeK;
    ctx.strokeStyle = C.mesh; ctx.lineWidth = ICON.width * LOGO.size / ICON.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (n > 0) {
      ctx.beginPath(); ctx.moveTo(...pts[half]); for (let i = 1; i <= n; i++) ctx.lineTo(...pts[half - i]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(...pts[half]); for (let i = 1; i <= n; i++) ctx.lineTo(...pts[half + i]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // node (stays vector on top, pulses with the beat)
  const nodeR = ICON.nodeR * LOGO.size / ICON.size;
  const ny = LOGO_NODE[1] + (ty - (LOGO.cy - ts / 2));
  if (t >= T.end + 0.42) {
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(LOGO_NODE[0], ny, nodeR * (1 + 0.1 * beat * env(t, 26, 26.3)), 0, TAU); ctx.fill();
  }
  // wordmark
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = '132px MLDisplay';
  const word = 'Meshline';
  const ww = ctx.measureText(word).width;
  let x = 540 - ww / 2;
  for (let i = 0; i < word.length; i++) {
    const k = clamp((t - T.word - i * 0.045) / 0.4);
    ctx.globalAlpha = clamp(k * 2.5);
    ctx.fillStyle = C.ink;
    ctx.fillText(word[i], x, 1078 + 60 * (1 - ease.outBack(k)));
    x += ctx.measureText(word[i]).width;
  }
  ctx.globalAlpha = 1;
  // subline (listing description, shortened)
  ctx.font = '46px MLMed'; ctx.textAlign = 'center';
  const sk = ease.out(clamp((t - T.sub) / 0.45));
  ctx.globalAlpha = sk; ctx.fillStyle = '#A9B1AD';
  ctx.fillText('Private nearby messaging', 540, 1160 + 20 * (1 - sk));
  ctx.globalAlpha = 1;
  // CTA pill
  const ck = clamp((t - T.cta) / 0.45);
  if (ck > 0) {
    ctx.font = '50px MLSemi';
    const label = 'Explore on Google Play';
    const tw = ctx.measureText(label).width;
    const pw = tw + 130, ph = 126;
    const sc = ease.outBack(ck) * (1 + 0.025 * beat * env(t, 26.8, 27.1));
    ctx.save(); ctx.translate(540, 1335); ctx.scale(sc, sc);
    roundRect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fillStyle = C.mesh; ctx.fill();
    // shimmer sweep
    for (const s0 of [27.0, 28.2, 29.2]) {
      const k = inv(s0, s0 + 0.6, t);
      if (k > 0 && k < 1) {
        ctx.save(); roundRect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.clip();
        const sxp = -pw / 2 - 120 + (pw + 240) * ease.inOut(k);
        const g = ctx.createLinearGradient(sxp - 90, 0, sxp + 90, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.28)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); ctx.restore();
      }
    }
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 3);
    ctx.restore();
  }
  miniPair(ctx, t);
  // iris: the high-five node shrinks into the logo node
  if (t < T.end + 0.5) {
    const k = ease.out(inv(T.end, T.end + 0.5, t));
    const r = lerp(1150, nodeR, k);
    const cx = lerp(540, LOGO_NODE[0], k), cy = lerp(960, ny, k);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  }
  // final soft fade
  const fo = env(t, 29.7, 30.0, 'in');
  if (fo > 0) { ctx.fillStyle = hexA(C.bg, fo * 0.3); ctx.fillRect(0, 0, W, H); }
}

function drawShadow(ctx, g) {
  const lift = clamp(-g.p.lift / 120);
  const w = (80 + 30 * Math.abs(g.p.fn[0] - g.p.ff[0]) / 60) * (1 - 0.45 * lift) * g.s;
  ctx.fillStyle = `rgba(0,0,0,${0.5 * (1 - 0.5 * lift)})`;
  ctx.beginPath(); ctx.ellipse(g.ch.x, GROUND + 3, w, 11 * g.s, 0, 0, TAU); ctx.fill();
}

// ---------------------------------------------------------------- frame
export function drawFrame(ctx, t, assets) {
  if (t >= T.end) { drawEnd(ctx, t, assets.icon); return; }
  const c = camera(t);
  drawSky(ctx, t);
  drawStars(ctx, t);
  buildings(ctx, c, t, 0.25, C.bld1, '#18201C', 11, GROUND - 120, 380, 760, 160, 280);
  buildings(ctx, c, t, 0.55, C.bld2, '#1D2622', 29, GROUND - 40, 260, 560, 200, 320);
  drawStreet(ctx, c, t);
  setCam(ctx, c, 1);
  drawSign(ctx, t);
  const a = charA(t), b = charB(t);
  const gA = solve(a), gB = solve(b);
  drawShadow(ctx, gA); drawShadow(ctx, gB);
  if (t > T.snap) { // blue light pool on the pavement once linked
    const mx = (gA.M.phone[0] + gB.M.phone[0]) / 2, k = env(t, T.snap, T.snap + 0.6);
    const g = ctx.createRadialGradient(mx, GROUND + 20, 0, mx, GROUND + 20, 330);
    g.addColorStop(0, hexA(C.mesh, 0.16 * k)); g.addColorStop(1, hexA(C.mesh, 0));
    ctx.fillStyle = g; ctx.save(); ctx.translate(0, GROUND + 20); ctx.scale(1, 0.22); ctx.translate(0, -(GROUND + 20));
    ctx.beginPath(); ctx.arc(mx, GROUND + 20, 330, 0, TAU); ctx.fill(); ctx.restore();
  }
  drawGlow(ctx, gA); drawGlow(ctx, gB);
  drawRipples(ctx, t, gA);
  drawStick(ctx, gB);
  drawStick(ctx, gA);
  const pts = drawLink(ctx, t, gA, gB);
  drawBubbles(ctx, t, gA, gB, pts);
  drawMarks(ctx, t, gA, gB);
  drawFive(ctx, t);
  vignette(ctx);
  drawCaptions(ctx, t);
  // white-out as the camera dives into the node
  if (t > T.dive[0]) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const sxp = 540 + (FIVE_POINT[0] - c.cx) * c.z, syp = 960 + (FIVE_POINT[1] - c.cy) * c.z;
    const r = 21 * c.z * (1 + 7 * ease.in(inv(T.dive[0] + 0.3, T.dive[1], t)));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(sxp, syp, r, 0, TAU); ctx.fill();
  }
}

// ---------------------------------------------------------------- audio cue sheet (consumed by audio/mix.py)
export function events() {
  const ev = [];
  const add = (t, type, gain = 1, pan = 0, extra = {}) => ev.push({ t: +t.toFixed(4), type, gain: +gain.toFixed(3), pan: +pan.toFixed(2), ...extra });
  const scr = wx => clamp((wx - 540) / 540, -1, 1) * 0.6; // rough stereo placement
  add(T.flicker, 'buzz', 0.7, -0.4);
  T.cracks.forEach((t, i) => add(t, 'crack', 0.9 - i * 0.1, -0.5));
  for (const imp of SIGN_IMPACTS) add(imp.t, imp.kind === 'dot' ? 'tink' : 'clunk', imp.g, -0.45, { i: imp.i ?? 3 });
  add(0.6, 'error', 0.8, 0);
  add(1.14, 'boing', 0.55, 0);
  add(1.65, 'rattle', 0.7, -0.1);
  add(2.62, 'whooshUp', 0.45, -0.1);
  [2.95, 3.42].forEach(t => add(t, 'hop', 0.5, -0.2));
  [3.18, 3.62, 4.25].forEach(t => add(t, 'hop', 0.4, 0.4));
  add(T.cam1[0], 'whoosh', 0.55, 0.3);
  add(5.0, 'sigh', 0.5, 0);
  add(5.55, 'notice', 0.6, 0);
  add(5.9, 'wave', 0.4, 0.4);
  add(T.idea, 'idea', 0.7, -0.2);
  add(T.appOpen, 'appOpen', 0.85, -0.2);
  T.ripples.forEach((t, i) => add(t, 'ping', 0.62 - i * 0.1, -0.2));
  add(T.bFlip, 'appOpen', 0.7, 0.35);
  add(T.windup, 'stretch', 0.6, -0.2);
  add(T.launch, 'zip', 0.95, 0);
  add(T.snap, 'snap', 1.0, 0.25);
  [0.12, 0.26, 0.4, 6.58, ...T.taps1, 18.9, 21.05].forEach(t => add(t, 'tap', 0.45, -0.2));
  [...T.taps2, 20.0, 21.9].forEach(t => add(t, 'tap', 0.45, 0.25));
  for (const b of T.bubbles) {
    const p = b.from === 'A' ? -0.25 : 0.25;
    add(b.pop, 'pop', 0.6 * b.s, p);
    add(b.ride[0], 'slide', 0.38 * b.s, p, { dur: b.ride[1] - b.ride[0], dir: b.from === 'A' ? 1 : -1 });
    add(b.ride[1], 'chime', 0.75 * b.s, -p, { hi: b.from === 'A' });
  }
  add(T.bTurn[0], 'swish', 0.4, 0.3);
  // footsteps from the walk cycle (plant = swing phase ends)
  const stepAt = [];
  for (let f = 0; f < 30 * 600; f++) {
    const t0 = f / 600, t1 = (f + 1) / 600;
    for (const [off, pan] of [[0, -0.2], [B_WALK_OFF, 0.2]]) for (const half of [0, 0.5]) {
      const p0 = sx(t0) / CYCLE + off + half, p1 = sx(t1) / CYCLE + off + half;
      if (Math.floor(p0 - 0.25) !== Math.floor(p1 - 0.25) && walkSpeed(t1) > 40) stepAt.push([t1, pan]);
    }
  }
  stepAt.forEach(([t, pan]) => add(t, 'step', 0.26, pan));
  [22.5, 22.72].forEach(t => { add(t, 'step', 0.35, -0.2); add(t + 0.04, 'step', 0.35, 0.2); });
  add(T.bTurnBack[0], 'swish', 0.4, 0.2);
  add(T.fiveWind, 'stretch', 0.5, 0);
  add(T.five, 'clap', 1.0, 0);
  add(T.dive[0] + 0.1, 'riser', 0.8, 0);
  add(T.end, 'impact', 0.9, 0);
  add(T.wave[0], 'logoSweep', 0.7, 0);
  add(T.word, 'sparkle', 0.5, 0);
  add(T.cta, 'pop', 0.7, 0);
  [27.0, 28.2, 29.2].forEach(t => add(t, 'shimmer', 0.35, 0));
  add(T.mini, 'pop', 0.4, 0);
  ev.sort((a, b) => a.t - b.t);
  return { duration: 30, fps: 30, events: ev, captions: CAPTIONS, keyTimes: T };
}
