'use strict';
// Courtlens 30 s portrait film — all scenes, camera and SFX cue sheet.
const { clamp, lerp, prog, TAU, deg, E, kf, rng, noise1, wobble, mix } = require('./lib');
const C = require('./palette');
const D = require('./draw');
const R = require('./rig');

const W = 1080, H = 1920;
const BEAT = 0.6; // 100 BPM music grid used to place key impacts

// ---------------------------------------------------------------- timing (seconds)
const T = {
  // S1 hook
  throwRel: 0.52, land1: 0.86, toppleStart: 1.5, breakApart: 1.82, stormStart: 2.2, flip: 3.38, s1End: 3.7,
  // S2 maze
  s2Start: 3.3, heroLand: 3.95, run1: 4.22, slam1: 4.8, bonk: 4.86, fallLand: 5.08, getUp: 5.5, run2: 5.85,
  slam2: 6.6, zoomOut: 6.9, zoomOutEnd: 7.8, tags: [7.2, 7.5, 7.8, 8.1], despair: 8.3,
  // S3 reveal
  phoneOut: 8.95, phoneHigh: 9.3, iconPop: 9.45, ring: 9.8, ringEnd: 11.25, panel: 11.45, rowsIn: 11.85,
  rowsFly: 12.85, s3End: 13.6,
  // S4 trail (hop landings on the beat)
  hops: [14.0, 14.6, 15.2, 15.8], hopDur: 0.6, flagUp: 16.75, flagPlant: 17.05,
  // S5 assistant + verification
  aiIn: 17.75, ask: 18.35, typing: 19.0, answer: 20.2, record: 21.3, lensOut: 21.6, sweep: 21.95, sweepEnd: 22.95,
  links: 22.75, stamp: 23.35, thumbs: 23.55,
  // S6 end card
  wipe: 24.55, iconDrop: 25.0, iconLand: 25.5, wordmark: 25.8, chips: 26.45, advocates: 26.9, cta: 27.5,
  walkIn: 27.25, tap: 28.45, end: 30.0,
};

const cues = []; // filled by cueSheet()

// ---------------------------------------------------------------- shared helpers
function shake(t, t0, amp, dur = 0.35, seed = 1) {
  if (t < t0 || t > t0 + dur) return [0, 0];
  const k = 1 - (t - t0) / dur;
  return [noise1(t * 40, seed) * amp * k * k, noise1(t * 40, seed + 9) * amp * k * k];
}

function paperBg(ctx) {
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 100, W * 0.5, H * 0.5, H * 0.75);
  g.addColorStop(0, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(203,188,156,0.25)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// ============================================================== S1 — the mountain
const FOLDER_COLORS = [C.navy2, C.sky, '#F3E3B8', C.navy, '#CFE3EF', C.navy2, '#F3E3B8', C.sky, C.navy, '#CFE3EF', C.navy2, '#F3E3B8', C.sky, C.navy, '#CFE3EF', C.navy2, '#F3E3B8'];
const FOLDER_LABELS = ['ORDER', '', 'HEARING', '', 'NOTICE', '', 'CASE', 'PETITION', '', 'ORDER', '', 'REPLY', '', 'NOTICE', '', 'HEARING', 'APPEAL'];
const S1 = { G: 1500, SX: 730, fw: 330, fh: 52, n: 16, heroX: 285, heroS: 1.25 };

function stackRest(i) {
  const r = rng(100 + i);
  return { x: S1.SX + (r() - 0.5) * 34, y: S1.G - (i + 0.5) * S1.fh * 0.97, a: (r() - 0.5) * 0.07 };
}

// whole-stack sway angle (radians, + = clockwise / top to the right)
function stackAngle(t) {
  const idle = Math.sin(t * 5.2) * deg(0.9);
  if (t < T.land1) return idle;
  const sway = (tt) => {
    const u = clamp((tt - T.land1) / (T.toppleStart - T.land1));
    return deg(1.5 + 8 * u) * Math.sin(TAU * 1.55 * (tt - T.land1)) * (tt >= T.land1 ? 1 : 0);
  };
  if (t < T.toppleStart) return sway(t) + idle * (1 - prog(t, T.land1, T.land1 + 0.3));
  const a0 = sway(T.toppleStart);
  return lerp(a0, deg(-26), E.inQuad(prog(t, T.toppleStart, T.breakApart)));
}

// Ballistic folders after break-apart (deterministic, integrated from breakApart).
const FALL = [];
function buildFall() {
  const dt = 1 / 240;
  const pivot = [S1.SX, S1.G];
  const aB = deg(-26), aPrev = stackAngle(T.breakApart - 0.02);
  const omega = (aB - aPrev) / 0.02;
  for (let i = 0; i <= S1.n; i++) {
    const r = rng(500 + i);
    const rest = i < S1.n ? stackRest(i) : { x: S1.SX + 6, y: S1.G - (S1.n + 0.5) * S1.fh * 0.97, a: 0.04 };
    const dx = rest.x - pivot[0], dy = rest.y - pivot[1];
    const ca = Math.cos(aB), sa = Math.sin(aB);
    let x = pivot[0] + dx * ca - dy * sa, y = pivot[1] + dx * sa + dy * ca;
    let a = rest.a + aB;
    // tangential velocity from rotation + scatter
    let vx = -dy * omega * -1 * 0.9 * -1 + (-320 - r() * 520) * (0.4 + (i / S1.n) * 0.8);
    let vy = dx * omega * 0.9 - 120 - r() * 380;
    let va = (r() - 0.5) * 9 - 2;
    const track = [];
    let hits = [];
    let t = T.breakApart;
    const delay = (S1.n - i) * 0.018;
    for (let k = 0; k < 240 * 2.2; k++) {
      track.push([x, y, a]);
      if (t > T.breakApart + delay) {
        vy += 2900 * dt;
        x += vx * dt; y += vy * dt; a += va * dt;
        const floor = S1.G - S1.fh * 0.42;
        if (y > floor) {
          if (vy > 260) hits.push({ t: t, x, v: vy });
          y = floor; vy *= -0.32; vx *= 0.55; va *= 0.4;
          // settle flat-ish
          a = lerp(a, Math.round(a / Math.PI) * Math.PI, 0.5);
        }
        if (x < -300 || x > W + 300) { vx *= 1; }
      }
      t += dt;
    }
    FALL.push({ track, hits, dt });
  }
}

function folderAt(i, t) {
  // returns {x,y,a}
  if (t < T.breakApart) {
    let rest;
    if (i < S1.n) rest = stackRest(i);
    else {
      // thrown folder
      if (t < T.land1) {
        const h0 = throwHand(t);
        const k = prog(t, T.throwRel, T.land1);
        const top = { x: S1.SX + 6, y: S1.G - (S1.n + 0.5) * S1.fh * 0.97 };
        if (t < T.throwRel) return { x: h0.x, y: h0.y - 20, a: -0.15 + Math.sin(t * 8) * 0.05 };
        const hr = throwHand(T.throwRel);
        const x = lerp(hr.x, top.x, E.outQuad(k));
        const y = lerp(hr.y - 20, top.y, k) - Math.sin(Math.PI * k) * 260;
        return { x, y, a: lerp(-0.4, 0.04, k) + Math.sin(k * Math.PI) * 0.9 };
      }
      rest = { x: S1.SX + 6, y: S1.G - (S1.n + 0.5) * S1.fh * 0.97, a: 0.04 };
    }
    // sway with height-dependent lag (jelly)
    const lag = i * 0.011;
    const ang = stackAngle(Math.max(0, t - lag));
    const dx = rest.x - S1.SX, dy = rest.y - S1.G;
    // landing squash ripple
    const sq = t > T.land1 ? wobble(t, T.land1, 7, 9, 5) * (i / S1.n) : 0;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    return { x: S1.SX + dx * ca - (dy + sq) * sa, y: S1.G + dx * sa + (dy + sq) * ca, a: rest.a + ang };
  }
  const f = FALL[i];
  const k = Math.min(f.track.length - 1, Math.floor((t - T.breakApart) / f.dt));
  const [x, y, a] = f.track[k];
  return { x, y, a };
}

function heroS1Pose(t) {
  const P = (n, o) => R.pose(n, Object.assign({ s: S1.heroS, f: 1 }, o));
  const keys = [
    [0.0, P('windUp', { lean: deg(-6), aL: [deg(150), deg(26)], aR: [deg(160), deg(22)], lL: [deg(-14), deg(22)], lR: [deg(12), deg(22)], face: R.FACES.determined })],
    [0.42, P('windUp', { face: R.FACES.effort }), E.inOutSine],
    [0.56, P('throwThrough', { face: R.FACES.effort }), E.inCubic],
    [0.82, P('throwThrough', { lean: deg(14), face: R.FACES.neutral }), E.outCubic],
    [1.12, P('stand', { face: Object.assign({}, R.FACES.curious, { look: 1 }) }), E.inOutCubic],
    [1.45, P('recoil', { face: R.FACES.worry }), E.inOutCubic],
    [1.72, P('recoil', { lean: deg(-18), face: R.FACES.shock }), E.outCubic],
    [1.95, P('duck', { face: Object.assign({}, R.FACES.shock, { eye: 0.2 }) }), E.outBack],
    [3.7, P('duck', { face: Object.assign({}, R.FACES.shock, { eye: 0.2 }) })],
  ];
  const p = kf(t, keys);
  p.x = S1.heroX + kf(t, [[0, 0], [0.56, 10], [0.82, 22], [1.12, 10], [1.72, -40, E.outCubic], [1.95, -50]]);
  p.y = S1.G - R.hipAbove(p);
  // anticipation bounce at the very start (immediate motion in frame 0)
  p.y += Math.sin(clamp(t / 0.42) * Math.PI * 2) * -6 * (t < 0.42 ? 1 : 0);
  p.face = Object.assign({}, p.face, { blink: t > 1.0 && t < 1.07 ? 1 : 0 });
  return p;
}
function throwHand(t) {
  const p = heroS1Pose(t);
  const a = R.handWorld(p, 'R');
  const b = R.handWorld(p, 'L');
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// paper sheets bursting from the collapse
function burstSheets(ctx, t) {
  if (t < T.breakApart) return;
  const r0 = rng(77);
  for (let j = 0; j < 22; j++) {
    const st = T.breakApart + r0() * 0.35;
    const life = 1.6;
    const u = (t - st) / life;
    if (u <= 0 || u >= 1) { r0(); r0(); r0(); r0(); continue; }
    const vx = (r0() - 0.6) * 900, vy = -700 - r0() * 700, spin = (r0() - 0.5) * 8;
    const ox = S1.SX + (r0() - 0.5) * 120;
    const tt = t - st;
    const x = ox + vx * tt + Math.sin(tt * 6 + j) * 40;
    const y = 1000 + vy * tt + 0.5 * 900 * tt * tt;
    D.sheet(ctx, x, y, 96, 124, spin * tt, { seed: j, lines: 5, lw: 2.5, scaleX: Math.cos(tt * 7 + j) });
  }
}

// sheets flying at the camera — transition into the maze
function storm(ctx, t) {
  if (t < T.stormStart || t > T.flip + 0.45) return;
  const r0 = rng(901);
  const items = [];
  for (let j = 0; j < 46; j++) {
    const st = T.stormStart + j * 0.022;
    const dur = 0.95 + r0() * 0.25;
    const px = r0(), py = r0(), rot = (r0() - 0.5) * 1.2, sp = (r0() - 0.5) * 3;
    const u = (t - st) / dur;
    if (u <= 0 || u >= 1) continue;
    const sc = 0.25 * Math.exp(Math.log(26) * E.inQuad(u));
    const sx = 540 + (px - 0.5) * 760 * (0.4 + sc * 0.9);
    const sy = 1000 + (py - 0.5) * 900 * (0.4 + sc * 0.9);
    items.push({ sc, sx, sy, rot: rot + sp * u, j });
  }
  items.sort((a, b) => a.sc - b.sc);
  for (const it of items) D.sheet(ctx, it.sx, it.sy, 150 * it.sc, 196 * it.sc, it.rot, { seed: it.j, lines: 6, lw: Math.max(2, 3 * Math.min(it.sc, 4)), shadow: it.sc < 6 });
  // the last giant page that covers the frame, then flips away upward
  if (t > T.flip - 0.3) {
    const u = prog(t, T.flip - 0.3, T.flip);
    const v = prog(t, T.flip, T.flip + 0.4);
    const sc = lerp(1.2, 14, E.inQuad(u));
    const y = 1000 - E.inCubic(v) * 2600;
    const rot = -0.2 + u * 0.2 - v * 0.6;
    if (v < 1) D.sheet(ctx, 560, y, 160 * sc, 210 * sc, rot, { seed: 3, lines: 7, lw: 6, title: 'CASE FILE', titleSize: 15 * sc, shadow: true });
  }
}

function scene1(ctx, t) {
  const [sx, sy] = [shake(t, T.land1, 10, 0.3, 2), shake(t, T.breakApart, 22, 0.55, 5)].reduce((a, b) => [a[0] + b[0], a[1] + b[1]]);
  ctx.save();
  ctx.translate(sx, sy);
  // slow push-in for energy
  const z = 1.06 + t * 0.02;
  ctx.translate(560, 1260); ctx.scale(z, z); ctx.translate(-560, -1260);
  // floor
  ctx.fillStyle = C.paperDeep;
  ctx.fillRect(-200, S1.G, W + 400, 800);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-100, S1.G); ctx.lineTo(W + 100, S1.G); ctx.stroke();
  // wall clock (story: time pressure) — hands spin faster as the stack wobbles
  const cx = 250, cy = 760, spin = t * 1.5 + Math.max(0, t - T.land1) * 4;
  ctx.fillStyle = C.sheet; ctx.lineWidth = 6; ctx.strokeStyle = C.ink;
  ctx.beginPath(); ctx.arc(cx, cy, 70, 0, TAU); ctx.fill(); ctx.stroke();
  for (let k = 0; k < 12; k++) { const a = k * TAU / 12; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 54, cy + Math.sin(a) * 54); ctx.lineTo(cx + Math.cos(a) * 62, cy + Math.sin(a) * 62); ctx.stroke(); }
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(spin - 1.57) * 44, cy + Math.sin(spin - 1.57) * 44); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = C.goldDeep; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(spin * 6 - 1.57) * 56, cy + Math.sin(spin * 6 - 1.57) * 56); ctx.stroke();
  // hero
  const hp = heroS1Pose(t);
  R.contactShadow(ctx, hp.x, S1.G, hp.s);
  // stack (bottom → top), thrown folder index n
  const order = [];
  for (let i = 0; i <= S1.n; i++) order.push(i);
  const drawFolder = (i) => {
    const q = folderAt(i, t);
    D.folder(ctx, q.x, q.y, S1.fw, S1.fh, q.a, FOLDER_COLORS[i % FOLDER_COLORS.length], { label: FOLDER_LABELS[i] || '', tab: i % 3 === 0 ? C.gold : C.sheet });
  };
  // hero behind the falling folders after the collapse
  R.drawAdvocate(ctx, hp);
  for (const i of order) if (!(i === S1.n && t < T.throwRel)) drawFolder(i);
  if (t < T.throwRel) drawFolder(S1.n); // folder in hands drawn in front
  // landing burst + motion lines
  D.burst(ctx, S1.SX + 6, S1.G - (S1.n + 1) * S1.fh * 0.97, 60, 150, 10, prog(t, T.land1, T.land1 + 0.3), C.ink, 7);
  burstSheets(ctx, t);
  ctx.restore();
  storm(ctx, t);
}

// ============================================================== WORLD (S2–S5)
const CELL = 400;
const MAZE = (() => {
  const walls = [];
  const H_ = { 0: [0, 1, 2, 3], 1: [0, 2], 2: [1, 2], 3: [0, 1, 2, 3], 4: [1, 3], 5: [0, 1, 2, 3] };
  const V_ = { 0: [0, 2, 4], 1: [0, 1, 3, 4], 2: [0, 4], 3: [0, 2, 4], 4: [0, 1, 3, 4] };
  const labels = ['ORDER', 'CAUSE LIST', 'HEARING', 'NOTICE', 'AFFIDAVIT', 'PETITION', 'REPLY', 'SUMMONS'];
  let li = 0;
  for (const r of Object.keys(H_)) for (const c of H_[r]) walls.push({ kind: 'h', x: c * CELL + CELL / 2, y: r * CELL, w: CELL + 40, h: 58, label: (li++ % 2 === 0) ? labels[(li >> 1) % labels.length] : '' });
  for (const r of Object.keys(V_)) for (const c of V_[r]) walls.push({ kind: 'v', x: c * CELL, y: r * CELL + CELL / 2, w: 58, h: CELL + 40 });
  // the two walls that slam down in the hero's corridor (row 2)
  walls.push({ kind: 'v', x: 1200, y: 1000, w: 58, h: CELL + 40, slam: T.slam1 });
  walls.push({ kind: 'v', x: 400, y: 1000, w: 58, h: CELL + 40, slam: T.slam2 });
  const r = rng(42);
  walls.forEach((w, i) => { w.rot = (r() - 0.5) * 0.03; w.seed = i + 3; });
  return walls;
})();
const FLOOR_KEEP = MAZE.find((w) => w.kind === 'h' && w.y === 1200 && w.x === 600); // becomes stone 0
const TAGS = [
  { text: 'Next date?', x: 300, y: 220, t: T.tags[0], gx: 360, gy: 640 },
  { text: 'Latest order?', x: 1150, y: 1440, t: T.tags[1], gx: 880, gy: 1040 },
  { text: 'Which court?', x: 1190, y: 600, t: T.tags[2], gx: 960, gy: 520 },
  { text: 'Case status?', x: 380, y: 1820, t: T.tags[3], gx: 340, gy: 1060 },
];

// Tags swarm the despairing advocate (cause: he gives up -> questions crowd in)
function tagPos(g, t) {
  const u = E.inOutCubic(prog(t, T.despair - 0.1, T.despair + 0.55));
  const bob = Math.sin(t * 3.3 + g.x) * 10;
  return { x: lerp(g.x, g.gx, u), y: lerp(g.y, g.gy, u) + bob, sc: lerp(1.9, 1.25, u) };
}
// Trail stones (world). Stone 0 is the kept maze floor.
const STONES = [
  { x: 600, y: 1200, w: CELL + 30, label: '', date: '' },
  { x: 920, y: 930, w: 340, label: 'Filed', date: '12 Jan' },
  { x: 600, y: 660, w: 340, label: 'Hearing', date: '03 Mar' },
  { x: 920, y: 390, w: 340, label: 'Order', date: '21 Apr' },
  { x: 540, y: 120, w: 520, label: 'Next date', date: '18 Jun' },
];
const STONE_H = 70;

function cam(t) {
  const k = [
    [3.3, { cx: 760, cy: 1010, z: 1.35 }],
    [4.25, { cx: 760, cy: 1010, z: 1.35 }],
    [4.9, { cx: 930, cy: 1010, z: 1.38 }, E.inOutSine],
    [5.6, { cx: 900, cy: 1010, z: 1.35 }],
    [6.55, { cx: 660, cy: 1010, z: 1.35 }, E.inOutSine],
    [T.zoomOut, { cx: 640, cy: 1000, z: 1.3 }],
    [T.zoomOutEnd, { cx: 800, cy: 900, z: 0.6 }, E.inOutCubic],
    [8.2, { cx: 800, cy: 900, z: 0.6 }],
    [8.9, { cx: 620, cy: 990, z: 0.95 }, E.inOutCubic],
    [9.75, { cx: 620, cy: 990, z: 0.95 }],
    [10.45, { cx: 800, cy: 930, z: 0.62 }, E.inOutCubic],
    [11.3, { cx: 800, cy: 930, z: 0.62 }],
    [11.85, { cx: 840, cy: 820, z: 1.0 }, E.inOutCubic],
    [12.85, { cx: 840, cy: 820, z: 1.0 }],
    [13.75, { cx: 740, cy: 760, z: 0.86 }, E.inOutCubic],
    [14.6, { cx: 740, cy: 690, z: 0.86 }, E.inOutSine],
    [15.2, { cx: 730, cy: 440, z: 0.86 }, E.inOutSine],
    [15.8, { cx: 720, cy: 190, z: 0.88 }, E.inOutSine],
    [16.4, { cx: 700, cy: -60, z: 0.92 }, E.inOutSine],
    [17.6, { cx: 690, cy: -297, z: 1.12 }, E.inOutCubic],
    [24.6, { cx: 690, cy: -297, z: 1.12 }],
  ];
  const c = kf(t, k);
  const sh = [shake(t, T.slam1, 18, 0.35, 3), shake(t, T.bonk, 10, 0.3, 4), shake(t, T.slam2, 16, 0.35, 6), shake(t, T.heroLand, 8, 0.25, 8), shake(t, T.flagPlant, 6, 0.25, 9), shake(t, T.stamp, 9, 0.3, 11)]
    .reduce((a, b) => [a[0] + b[0], a[1] + b[1]]);
  return { cx: c.cx, cy: c.cy, z: c.z, ox: sh[0], oy: sh[1] };
}
function applyCam(ctx, c) {
  ctx.translate(540 + c.ox, 1100 + c.oy);
  ctx.scale(c.z, c.z);
  ctx.translate(-c.cx, -c.cy);
}
function toScreen(c, x, y) { return { x: 540 + c.ox + (x - c.cx) * c.z, y: 1100 + c.oy + (y - c.cy) * c.z }; }

// ---------------- hero in the world
const HS = 1.0; // hero scale in world units
function standOn(p, groundY) { p.y = groundY - R.hipAbove(p); return p; }

function heroWorld(t) {
  const P = (n, o) => R.pose(n, Object.assign({ s: HS, f: 1 }, o));
  const FLOOR = 1200 - 23;
  let p;
  if (t < T.heroLand) {
    // falling in from the paper storm
    const u = prog(t, T.s2Start, T.heroLand);
    p = P('leap', { face: R.FACES.shock, lean: deg(-10), rot: Math.sin(u * 5) * 0.2 });
    p.x = 760; p.y = lerp(300, FLOOR - R.hipAbove(P('squat')), E.inQuad(u));
    return { p, ground: FLOOR, lift: (1 - u) * 400 };
  }
  if (t < T.run1) {
    const u = prog(t, T.heroLand, T.run1);
    p = mix(P('squat', { face: R.FACES.dazed }), P('stand', { face: R.FACES.determined }), E.outBack(u));
    p.x = 760; standOn(p, FLOOR);
    p.y += Math.sin(u * Math.PI) * -10;
    return { p, ground: FLOOR };
  }
  if (t < T.bonk) {
    const u = prog(t, T.run1, T.bonk);
    const rc = R.runCycle((t - T.run1) * 2.6, clamp((t - T.run1) * 6));
    p = P('stand', Object.assign({}, rc, { face: R.FACES.determined }));
    p.x = lerp(760, 1120, E.inQuad(u) * 0.5 + u * 0.5); standOn(p, FLOOR); p.y += rc.bob;
    if (t > T.slam1) p.face = R.FACES.shock;
    return { p, ground: FLOOR };
  }
  if (t < T.getUp) {
    // bonk → fall backwards → dazed sit
    const u = prog(t, T.bonk, T.fallLand);
    const sitP = P('sitDazed', { face: R.FACES.dazed });
    if (t < T.fallLand) {
      p = mix(P('fallBack', { face: R.FACES.shock }), sitP, E.inQuad(u));
      p.rot = -Math.sin(u * Math.PI) * 0.5;
      p.x = lerp(1120, 1010, E.outQuad(u));
      p.y = FLOOR - 70 - Math.sin(u * Math.PI) * 70;
    } else {
      p = sitP;
      p.x = 1010;
      p.y = FLOOR - 70 + wobble(t, T.fallLand, 4, 8, 8);
      p.head = Math.sin((t - T.fallLand) * 9) * 0.15;
    }
    return { p, ground: FLOOR, stars: t > T.fallLand && t < T.getUp + 0.2 };
  }
  if (t < T.run2) {
    const u = prog(t, T.getUp, T.run2);
    p = mix(P('sitDazed', { face: R.FACES.dazed }), P('stand', { f: -1, face: R.FACES.determined }), E.outBack(u));
    p.f = u < 0.5 ? 1 : -1;
    p.x = 1010; standOn(p, FLOOR);
    p.y = lerp(FLOOR - 70, p.y, E.outBack(u));
    p.head = Math.sin(u * 20) * 0.12 * (1 - u);
    return { p, ground: FLOOR };
  }
  if (t < T.slam2 - 0.05) {
    const u = prog(t, T.run2, T.slam2 - 0.05);
    const rc = R.runCycle((t - T.run2) * 2.6, clamp((t - T.run2) * 6));
    p = P('stand', Object.assign({}, rc, { f: -1, face: R.FACES.determined }));
    p.x = lerp(1010, 560, u); standOn(p, FLOOR); p.y += rc.bob;
    return { p, ground: FLOOR };
  }
  if (t < T.zoomOutEnd) {
    const u = prog(t, T.slam2 - 0.05, T.slam2 + 0.35);
    p = mix(P('skid', { f: -1, face: R.FACES.shock }), P('recoil', { f: -1, face: R.FACES.shock }), prog(t, T.slam2 + 0.3, T.slam2 + 0.7));
    p.x = lerp(560, 530, E.outCubic(u)) + wobble(t, T.slam2, 6, 6, 6);
    standOn(p, FLOOR);
    return { p, ground: FLOOR, skid: u };
  }
  if (t < T.phoneOut) {
    // pacing in the box, then despair
    const tt = t - T.zoomOutEnd;
    if (t < T.despair) {
      const ph = tt * 1.9;
      const wc = R.walkCycle(ph, 1);
      const back = Math.sin(clamp(tt / (T.despair - T.zoomOutEnd)) * Math.PI);
      p = P('stand', Object.assign({}, wc, { f: 1, face: R.FACES.worry }));
      p.x = 530 + back * 260;
      p.f = tt < (T.despair - T.zoomOutEnd) / 2 ? 1 : -1;
      standOn(p, FLOOR); p.y += wc.bob;
    } else {
      const u = prog(t, T.despair, T.despair + 0.3);
      p = mix(P('stand', { f: -1, face: R.FACES.worry }), P('despair', { f: 1, face: Object.assign({}, R.FACES.worry, { eye: 0.3 }) }), E.outBack(u));
      p.x = 600; standOn(p, FLOOR);
      p.y += Math.sin(t * 9) * 3 * u;
    }
    return { p, ground: FLOOR };
  }
  if (t < T.s3End) {
    // phone out, raise, hold; then lower
    const keys = [
      [T.phoneOut, P('despair', { face: R.FACES.worry })],
      [T.phoneOut + 0.22, P('phoneUp', { face: R.FACES.idea }), E.outBack],
      [T.phoneHigh + 0.12, P('phoneHigh', { face: R.FACES.idea }), E.outBack],
      [T.ringEnd, P('phoneHigh', { face: R.FACES.grin })],
      [T.panel + 0.2, P('phoneUp', { face: R.FACES.happy }), E.inOutCubic],
      [T.rowsFly + 0.1, P('phoneUp', { face: R.FACES.curious })],
      [T.s3End, P('stand', { face: R.FACES.determined }), E.inOutCubic],
    ];
    p = kf(t, keys);
    p.x = 600; standOn(p, FLOOR);
    return { p, ground: FLOOR, phone: t > T.phoneOut + 0.08 && t < T.s3End - 0.2 };
  }
  // S4 hops
  const hopIdx = T.hops.findIndex((h0) => t < h0 + T.hopDur);
  if (t < T.hops[0]) {
    p = P('stand', { face: R.FACES.determined });
    const st = STONES[0];
    p.x = 600; standOn(p, st.y - STONE_H / 2 + 12 - 12);
    p.face = Object.assign({}, R.FACES.determined, { lookY: -0.6 });
    return { p, ground: st.y - STONE_H / 2 };
  }
  if (hopIdx >= 0) {
    const h0 = T.hops[hopIdx];
    const a = STONES[hopIdx], b = STONES[hopIdx + 1];
    const ax = hopIdx === 0 ? 600 : a.x, bx = hopIdx === 3 ? 470 : b.x;
    const ga = a.y - STONE_H / 2, gb = b.y - STONE_H / 2;
    const dirn = bx > ax ? 1 : -1;
    const tc = h0 + 0.12, tl = h0 + 0.45, te = h0 + T.hopDur;
    if (t < tc) {
      const u = prog(t, h0, tc);
      p = mix(P('stand', { f: dirn, face: R.FACES.determined }), P('crouch', { f: dirn, face: R.FACES.determined }), E.outQuad(u));
      p.x = ax; standOn(p, ga);
    } else if (t < tl) {
      const u = prog(t, tc, tl);
      p = P('leap', { f: dirn, face: R.FACES.grin });
      p.x = lerp(ax, bx, E.inOutSine(u));
      const base = lerp(ga, gb, u) - R.hipAbove(p);
      p.y = base - Math.sin(u * Math.PI) * 150 - (gb < ga ? 0 : 0);
      p.lean = deg(10 - 20 * u);
      return { p, ground: lerp(ga, gb, u), lift: Math.sin(u * Math.PI) * 150 };
    } else {
      const u = prog(t, tl, te);
      p = mix(P('land', { f: dirn, face: R.FACES.happy }), P('stand', { f: dirn, face: R.FACES.happy }), E.outBack(u));
      p.x = bx; standOn(p, gb);
      p.squash = 1 - 0.12 * Math.sin(u * Math.PI) * (1 - u);
    }
    return { p, ground: hopIdx === 0 && t < tc ? ga : (t < tc ? ga : gb) };
  }
  const top = STONES[4], gTop = top.y - STONE_H / 2;
  if (t < T.aiIn) {
    // flag plant
    const keys = [
      [T.hops[3] + T.hopDur, P('stand', { f: -1, face: R.FACES.happy })],
      [T.flagUp, P('wave', { f: -1, face: R.FACES.grin, aR: [deg(165), deg(-10)] }), E.outBack],
      [T.flagPlant, P('plant', { f: -1, face: R.FACES.effort }), E.inCubic],
      [T.flagPlant + 0.35, P('stand', { f: -1, face: R.FACES.happy }), E.outCubic],
    ];
    p = kf(t, keys);
    p.x = 470; standOn(p, gTop);
    return { p, ground: gTop, flagHand: t < T.flagPlant };
  }
  // S5
  const keys = [
    [T.aiIn, P('stand', { f: 1, face: R.FACES.happy })],
    [T.aiIn + 0.35, P('stand', { f: 1, face: Object.assign({}, R.FACES.curious, { lookY: -0.8 }) }), E.inOutCubic],
    [T.ask, P('ask', { face: R.FACES.curious }), E.outBack],
    [T.typing + 0.3, P('stand', { face: Object.assign({}, R.FACES.curious, { lookY: -0.8 }) })],
    [T.answer + 0.45, P('holdCard', { face: R.FACES.happy }), E.outBack],
    [T.record + 0.35, P('holdCard', { face: Object.assign({}, R.FACES.focus, { look: 1 }) })],
    [T.lensOut + 0.25, P('lens', { face: R.FACES.focus }), E.outBack],
    [T.sweepEnd, P('lens', { lean: deg(10), face: R.FACES.focus })],
    [T.stamp, P('lens', { lean: deg(4), face: R.FACES.idea }), E.outCubic],
    [T.thumbs + 0.2, P('thumbsUp', { face: R.FACES.grin }), E.outBack],
    [24.6, P('thumbsUp', { face: R.FACES.grin })],
  ];
  p = kf(t, keys);
  // step forward while sweeping the lens
  p.x = kf(t, [[T.aiIn, 470], [T.sweep, 470], [T.sweepEnd, 690, E.inOutSine], [24.6, 690]]);
  const walking = t > T.sweep && t < T.sweepEnd;
  if (walking) {
    const wc = R.walkCycle((t - T.sweep) * 1.7, 0.8);
    p.lL = wc.lL; p.lR = wc.lR;
  }
  standOn(p, gTop);
  if (t > T.thumbs) p.y += wobble(t, T.thumbs, 3, 5, 5);
  // inverse kinematics: the near hand grips the magnifier handle while the glass follows its path
  if (t > T.lensOut && t < T.thumbs + 0.05) {
    const g = lensGlass(t, p);
    const ik = R.reachIK(p, 'R', g.hx, g.hy);
    const blend = E.outCubic(prog(t, T.lensOut, T.lensOut + 0.25)) * (1 - E.inCubic(prog(t, T.thumbs - 0.15, T.thumbs + 0.05)));
    p.aR = [lerp(p.aR[0], ik[0], blend), lerp(p.aR[1], ik[1], blend)];
  }
  return { p, ground: gTop, lens: t > T.lensOut && t < T.thumbs, card: false };
}

// ---------------- maze walls
function wallState(w, t) {
  // returns {visible, x, y, rot, scaleX, alpha, card:{...}}
  const s = { x: w.x, y: w.y, rot: w.rot, sx: 1, alpha: 1, settle: 0 };
  if (w.slam !== undefined) {
    const t0 = w.slam - 0.17;
    if (t < t0) return null;
    const u = prog(t, t0, w.slam);
    s.y = w.y - (1 - E.inQuad(u)) * 380;
    s.settle = wobble(t, w.slam, 5, 7, 6);
    s.rot += wobble(t, w.slam, 4, 6, 0.04);
  } else if (t < 3.9) {
    // walls settle in as the storm clears
    s.settle = wobble(t, 3.35 + (w.seed % 7) * 0.03, 4, 6, 10);
  }
  return s;
}

function capture(itemX, itemY) {
  const icon = iconPos();
  const d = Math.hypot(itemX - icon.x, itemY - icon.y);
  return T.ring + ringTimeFor(d);
}
const RING_MAX = 2100;
function ringR(t) { return RING_MAX * E.inOutSine(prog(t, T.ring, T.ringEnd)); }
function ringTimeFor(d) {
  // invert ringR numerically
  let lo = 0, hi = T.ringEnd - T.ring;
  for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (ringR(T.ring + m) < d) lo = m; else hi = m; }
  return hi;
}
function phoneHand() {
  const h = heroWorld(T.ring + 0.2);
  return R.handWorld(h.p, 'R');
}
function iconPos() {
  const ph = phoneHand();
  return { x: ph.x + 10, y: ph.y - 230 };
}

function drawWall(ctx, w, s, t, highlight = 0) {
  const o = { seed: w.seed, lines: w.kind === 'h' ? 2 : 0, lw: 4, ear: false, title: w.label || '', titleSize: 24, titleColor: C.ink, scaleX: s.sx, alpha: s.alpha };
  if (w.kind === 'h') D.sheet(ctx, s.x, s.y + s.settle, w.w, w.h, s.rot, o);
  else {
    D.sheet(ctx, s.x, s.y + s.settle, w.w, w.h, s.rot, Object.assign(o, { lines: 0 }));
    // text lines running vertically for texture
    ctx.save();
    ctx.translate(s.x, s.y + s.settle);
    ctx.rotate(s.rot);
    ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.lineCap = 'round';
    const r = rng(w.seed);
    for (const dx of [-8, 8]) { const L = w.h * (0.5 + r() * 0.3); ctx.beginPath(); ctx.moveTo(dx, -w.h / 2 + 30); ctx.lineTo(dx, -w.h / 2 + 30 + L); ctx.stroke(); }
    ctx.restore();
  }
  if (highlight > 0) {
    ctx.save();
    ctx.globalAlpha = highlight;
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 8;
    ctx.translate(s.x, s.y); ctx.rotate(s.rot);
    D.rrect(ctx, -w.w / 2 - 4, -w.h / 2 - 4, w.w + 8, w.h + 8, 8); ctx.stroke();
    ctx.restore();
  }
}

// Collected item flight: from (x,y) to phone, over [tc, tc+0.62]
function flight(t, tc, x, y, ph) {
  const u = prog(t, tc + 0.12, tc + 0.62);
  const mx = (x + ph.x) / 2 + (x < ph.x ? -160 : 160), my = Math.min(y, ph.y) - 260;
  const e = E.inOutCubic(u);
  const bx = (1 - e) * (1 - e) * x + 2 * (1 - e) * e * mx + e * e * ph.x;
  const by = (1 - e) * (1 - e) * y + 2 * (1 - e) * e * my + e * e * ph.y;
  return { x: bx, y: by, u };
}

// ---------------- illustrative UI panel (stylized, not a real screenshot)
const PANEL = { w: 500, h: 640 };
function panelPos() { const ph = phoneHand(); return { x: ph.x + 400, y: ph.y - 110 }; }
const ROWS = [
  { title: 'Case record', sub: 'Court records', chip: C.gold },
  { title: 'Hearing', sub: 'Case tracking', chip: C.sky },
  { title: 'Order', sub: 'Court records', chip: C.gold },
  { title: 'Next date', sub: 'Case tracking', chip: C.sky },
];
function rowRect(i) { const P = panelPos(); return { x: P.x, y: P.y - PANEL.h / 2 + 170 + i * 104, w: PANEL.w - 56, h: 86 }; }

function drawRow(ctx, x, y, w, h, row, rot = 0, sc = 1, o = {}) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(14,42,82,0.15)';
  D.rrect(ctx, -w / 2 + 4, -h / 2 + 6, w, h, 16); ctx.fill();
  ctx.fillStyle = o.lit ? '#FFF7DF' : C.sheet;
  ctx.strokeStyle = o.lit ? C.gold : C.ink; ctx.lineWidth = o.lit ? 6 : 3.5;
  D.rrect(ctx, -w / 2, -h / 2, w, h, 16); ctx.fill(); ctx.stroke();
  // folder glyph
  ctx.fillStyle = row.chip;
  D.rrect(ctx, -w / 2 + 16, -h / 2 + 18, 46, h - 36, 8); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.font = D.F.sans(800, 30);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(o.label || row.title, -w / 2 + 78, -h * 0.16);
  ctx.fillStyle = '#4E5F78';
  ctx.font = D.F.sans(600, 20);
  ctx.fillText(o.sub || row.sub, -w / 2 + 78, h * 0.22);
  if (o.date) {
    ctx.font = D.F.sans(700, 20);
    const tw = ctx.measureText(o.date).width;
    ctx.fillStyle = C.navy;
    D.rrect(ctx, w / 2 - tw - 44, -16, tw + 26, 32, 16); ctx.fill();
    ctx.fillStyle = C.sheet; ctx.textAlign = 'center';
    ctx.fillText(o.date, w / 2 - tw / 2 - 31, 1);
  } else {
    ctx.fillStyle = row.chip;
    ctx.beginPath(); ctx.arc(w / 2 - 30, 0, 10, 0, TAU); ctx.fill();
  }
  if (o.check > 0) D.check(ctx, -w / 2 + 39, -h / 2 + 2, 22 * E.outBack(clamp(o.check)), clamp(o.check * 1.4), C.gold, C.navy);
  ctx.restore();
}

function drawPanel(ctx, t, icon, hand) {
  const open = E.outBack(prog(t, T.panel, T.panel + 0.45)) * (1 - E.inBack(prog(t, T.rowsFly + 0.15, T.rowsFly + 0.6)));
  if (open <= 0.01) return;
  const P = panelPos(), ph = hand || phoneHand();
  ctx.save();
  ctx.translate(lerp(ph.x, P.x, open), lerp(ph.y, P.y, open));
  ctx.scale(open, open);
  ctx.fillStyle = 'rgba(14,42,82,0.18)';
  D.rrect(ctx, -PANEL.w / 2 + 10, -PANEL.h / 2 + 14, PANEL.w, PANEL.h, 34); ctx.fill();
  ctx.fillStyle = C.navy;
  D.rrect(ctx, -PANEL.w / 2, -PANEL.h / 2, PANEL.w, PANEL.h, 34); ctx.fill();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.stroke();
  // header
  ctx.drawImage(icon, -PANEL.w / 2 + 26, -PANEL.h / 2 + 26, 62, 62);
  ctx.fillStyle = C.ivory; ctx.font = D.F.serif(800, 38); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Courtlens', -PANEL.w / 2 + 104, -PANEL.h / 2 + 58);
  ctx.fillStyle = C.sky; ctx.font = D.F.sans(700, 20);
  ctx.fillText('ILLUSTRATIVE UI', -PANEL.w / 2 + 30, -PANEL.h / 2 + 120);
  // footer AI chip
  ctx.fillStyle = 'rgba(62,198,242,0.18)';
  D.rrect(ctx, -PANEL.w / 2 + 28, PANEL.h / 2 - 86, PANEL.w - 56, 60, 30); ctx.fill();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke();
  D.sparkle(ctx, -PANEL.w / 2 + 62, PANEL.h / 2 - 56, 16, 0, C.gold);
  ctx.fillStyle = C.cyanSoft; ctx.font = D.F.sans(700, 22);
  ctx.fillText('AI assistant', -PANEL.w / 2 + 88, PANEL.h / 2 - 55);
  ctx.restore();
  // rows (drawn in world space so they can fly out)
  for (let i = 0; i < ROWS.length; i++) {
    if (t >= T.rowsFly + i * 0.08) continue;
    const u = E.outBack(prog(t, T.rowsIn + i * 0.15, T.rowsIn + i * 0.15 + 0.3));
    if (u <= 0) continue;
    const rr = rowRect(i);
    const x = lerp(ph.x, P.x, open) + (rr.x - P.x) * open + (1 - u) * 260;
    const y = lerp(ph.y, P.y, open) + (rr.y - P.y) * open;
    ctx.save(); ctx.globalAlpha = clamp(u * 1.5);
    drawRow(ctx, x, y, rr.w * open, rr.h * open, ROWS[i], 0, 1);
    ctx.restore();
  }
}

// ---------------- stones
function stoneState(i, t) {
  if (i === 0) return { x: STONES[0].x, y: STONES[0].y, rot: 0, sc: 1, a: 1 };
  const st = STONES[i];
  const t0 = T.rowsFly + (i - 1) * 0.08, t1 = t0 + 0.55;
  if (t < t0) return null;
  const rr = rowRect(i - 1);
  const u = prog(t, t0, t1);
  const e = E.inOutCubic(u);
  const mx = (rr.x + st.x) / 2 + 200, my = Math.min(rr.y, st.y) - 220;
  const x = (1 - e) * (1 - e) * rr.x + 2 * (1 - e) * e * mx + e * e * st.x;
  const y = (1 - e) * (1 - e) * rr.y + 2 * (1 - e) * e * my + e * e * st.y;
  const land = wobble(t, t1, 5, 7, 8);
  return { x, y: y + land, rot: Math.sin(u * Math.PI) * 0.5, sc: 1, a: 1, u };
}
function stoneLit(i, t) {
  if (i === 0) return 0;
  return prog(t, T.hops[i - 1] + 0.45, T.hops[i - 1] + 0.75);
}

function drawStone(ctx, i, t) {
  const s = stoneState(i, t);
  if (!s) return;
  const st = STONES[i];
  if (i === 0) {
    // the surviving maze floor, restyled as the first stone
    const w = FLOOR_KEEP;
    drawWall(ctx, w, { x: w.x, y: w.y, rot: w.rot, sx: 1, alpha: 1, settle: 0 }, t);
    return;
  }
  const rr = rowRect(i - 1);
  const k = s.u === undefined ? 1 : E.inOutCubic(s.u);
  const w = lerp(rr.w, st.w, k), h = lerp(rr.h, STONE_H + 16, k);
  drawRow(ctx, s.x, s.y, w, h, ROWS[i - 1], s.rot, 1, { label: st.label, sub: 'Case tracking', date: st.date, lit: stoneLit(i, t) > 0.5, check: stoneLit(i, t) });
}

// ---------------- S5 props (world coords)
const AIB = { x: 975, y: -715 };
function aiState(t) {
  const u = prog(t, T.aiIn, T.aiIn + 0.55);
  if (u <= 0) return null;
  const x = lerp(1500, AIB.x, E.outBack(u)) + Math.sin(t * 2.2) * 10;
  const y = lerp(-1100, AIB.y, E.outCubic(u)) + Math.sin(t * 3.1) * 14;
  const sc = 0.9 + 0.08 * Math.sin(t * 4) * 0;
  return { x, y, sc, rot: Math.sin(t * 2.6) * 0.06 + (1 - u) * 0.5 };
}
const CARD = { x: 650, y: -430, w: 240, h: 170 };
const REC = { x: 905, y: -400, w: 250, h: 330 };
const LENS_R = 92;
// glass path for the verification sweep (card centre -> record lines)
function glassAt(t) {
  const u = E.inOutSine(prog(t, T.sweep, T.sweepEnd));
  return { x: lerp(CARD.x - 10, REC.x - 50, u), y: lerp(CARD.y - 4, REC.y - 36, u) + Math.sin(u * Math.PI) * -30 };
}

function drawAnswerCard(ctx, t, heroP) {
  if (t < T.answer) return;
  const a = aiState(t);
  const u = prog(t, T.answer, T.answer + 0.45);
  const x = lerp(a.x - 40, CARD.x, E.outBack(u));
  const y = lerp(a.y + 40, CARD.y, E.outCubic(u)) + Math.sin(t * 2.4) * 6;
  const sc = lerp(0.2, 1, E.outBack(u));
  ctx.save();
  ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(-0.04 + Math.sin(t * 1.7) * 0.02);
  ctx.fillStyle = 'rgba(14,42,82,0.16)'; D.rrect(ctx, -CARD.w / 2 + 6, -CARD.h / 2 + 8, CARD.w, CARD.h, 18); ctx.fill();
  ctx.fillStyle = C.navy; ctx.strokeStyle = C.cyan; ctx.lineWidth = 5;
  D.rrect(ctx, -CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 18); ctx.fill(); ctx.stroke();
  D.sparkle(ctx, -CARD.w / 2 + 30, -CARD.h / 2 + 30, 15, 0, C.gold);
  ctx.fillStyle = C.cyanSoft; ctx.font = D.F.sans(800, 19); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('AI answer', -CARD.w / 2 + 54, -CARD.h / 2 + 31);
  const lines = [0.86, 0.62, 0.78, 0.5];
  lines.forEach((L, i) => {
    const lit = matchLit(t, i);
    ctx.strokeStyle = lit > 0 ? `rgba(226,179,60,${0.35 + lit * 0.65})` : 'rgba(189,235,250,0.55)';
    ctx.lineWidth = lit > 0 ? 9 : 7; ctx.lineCap = 'round';
    const yy = -CARD.h / 2 + 68 + i * 24;
    ctx.beginPath(); ctx.moveTo(-CARD.w / 2 + 24, yy); ctx.lineTo(-CARD.w / 2 + 24 + (CARD.w - 48) * L, yy); ctx.stroke();
  });
  ctx.restore();
}
function matchLit(t, i) {
  if (i !== 0 && i !== 2) return 0;
  // card lines light as the sweep begins, record lines when the glass arrives
  return Math.max(prog(t, T.sweep + 0.1 + i * 0.08, T.sweep + 0.35 + i * 0.08) * 0.6, prog(t, T.links + i * 0.1, T.links + i * 0.1 + 0.25));
}
function drawRecord(ctx, t) {
  if (t < T.record - 0.3) return;
  const u = prog(t, T.record - 0.3, T.record);
  const y = lerp(-1300, REC.y, E.inQuad(u)) + wobble(t, T.record, 4, 7, 10) + (t > T.record + 0.5 ? Math.sin(t * 2) * 5 : 0);
  const rot = lerp(0.4, 0.05, u) + wobble(t, T.record, 3, 6, 0.06);
  ctx.save();
  ctx.translate(REC.x, y); ctx.rotate(rot);
  D.sheet(ctx, 0, 0, REC.w, REC.h, 0, { seed: 11, lines: 0, lw: 4 });
  ctx.fillStyle = C.ink; ctx.font = D.F.sans(800, 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('OFFICIAL', 0, -REC.h / 2 + 34);
  ctx.fillText('COURT RECORD', 0, -REC.h / 2 + 60);
  const lines = [0.8, 0.66, 0.84, 0.55, 0.72];
  lines.forEach((L, i) => {
    const lit = i === 0 ? matchLit(t, 0) : i === 2 ? matchLit(t, 2) : 0;
    ctx.strokeStyle = lit > 0 ? `rgba(226,179,60,${0.35 + lit * 0.65})` : C.line;
    ctx.lineWidth = lit > 0 ? 9 : 6; ctx.lineCap = 'round';
    const yy = -REC.h / 2 + 100 + i * 28;
    ctx.beginPath(); ctx.moveTo(-REC.w / 2 + 26, yy); ctx.lineTo(-REC.w / 2 + 26 + (REC.w - 52) * L, yy); ctx.stroke();
  });
  D.seal(ctx, REC.w / 2 - 52, REC.h / 2 - 50, 34, t * 0.2);
  ctx.restore();
}
function lineAnchor(which, i, t) {
  if (which === 'card') {
    const u = 1;
    return { x: CARD.x - CARD.w / 2 + 24 + (CARD.w - 48) * [0.86, 0.62, 0.78, 0.5][i] + 10, y: CARD.y - CARD.h / 2 + 68 + i * 24 + Math.sin(t * 2.4) * 6 };
  }
  return { x: REC.x - REC.w / 2 + 20, y: REC.y - REC.h / 2 + 100 + i * 28 + Math.sin(t * 2) * 5 };
}
function drawLinks(ctx, t) {
  for (const i of [0, 2]) {
    const k = prog(t, T.links + i * 0.1, T.links + i * 0.1 + 0.3);
    if (k <= 0) continue;
    const a = lineAnchor('card', i, t), b = lineAnchor('rec', i, t);
    const e = E.outCubic(k);
    ctx.save();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.setLineDash([2, 12]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a.x, a.y);
    ctx.lineTo(lerp(a.x, b.x, e), lerp(a.y, b.y, e));
    ctx.stroke();
    ctx.restore();
  }
}
function lensGlass(t, p) {
  // glass position: rises from the hand at lensOut, then follows the sweep path
  const g = glassAt(t);
  const sh = R.shoulderWorld(p);
  const out = E.outBack(prog(t, T.lensOut, T.lensOut + 0.3));
  const rest = { x: sh.x + 150, y: sh.y - 40 };
  const gx = lerp(rest.x, g.x, prog(t, T.lensOut + 0.1, T.sweep)), gy = lerp(rest.y, g.y, prog(t, T.lensOut + 0.1, T.sweep));
  // handle grip point: along the line from glass toward the shoulder
  const dx = sh.x - gx, dy = sh.y - gy, d = Math.hypot(dx, dy) || 1;
  const reach = LENS_R * 2.1;
  return { x: gx, y: gy, hx: gx + (dx / d) * reach, hy: gy + (dy / d) * reach, k: out };
}

// ---------------- world scene
function worldScene(ctx, t, A) {
  const c = cam(t);
  ctx.save();
  applyCam(ctx, c);
  // world dot grid (parallax reference)
  ctx.fillStyle = 'rgba(14,42,82,0.10)';
  const x0 = Math.floor((c.cx - 540 / c.z - 100) / 100) * 100, x1 = c.cx + 540 / c.z + 100;
  const y0 = Math.floor((c.cy - 1100 / c.z - 100) / 100) * 100, y1 = c.cy + 820 / c.z + 100;
  for (let x = x0; x < x1; x += 100) for (let y = y0; y < y1; y += 100) { ctx.beginPath(); ctx.arc(x, y, 3 / Math.max(0.6, c.z), 0, TAU); ctx.fill(); }

  const hero = heroWorld(t);
  const ph = phoneHand();
  // maze backing (fades as the walls are collected)
  const mb = 1 - prog(t, T.ring + 0.3, T.ringEnd);
  if (mb > 0) { ctx.save(); ctx.globalAlpha = 0.55 * mb; ctx.fillStyle = C.paperDeep; ctx.fillRect(0, 0, 1600, 2000); ctx.restore(); }
  // maze walls + capture
  const icon = iconPos();
  for (const w of MAZE) {
    if (w === FLOOR_KEEP && t > T.ring) continue; // drawn as stone 0
    const s = wallState(w, t);
    if (!s) continue;
    if (t >= T.ring) {
      const tc = capture(w.x, w.y);
      if (t >= tc) {
        const fl = flight(t, tc, w.x, w.y, ph);
        if (fl.u >= 1) continue;
        const flip = prog(t, tc, tc + 0.14);
        const k = E.inOutCubic(fl.u);
        ctx.save();
        if (fl.u <= 0) {
          drawWall(ctx, w, Object.assign({}, s, { sx: Math.cos(flip * Math.PI * 0.5) * 0.85 + 0.15 }), t, 1 - flip * 0.5);
        } else {
          const cw = lerp(w.kind === 'h' ? 160 : 70, 46, k), chh = lerp(w.kind === 'h' ? 70 : 160, 34, k);
          D.sheet(ctx, fl.x, fl.y, cw, chh, w.rot + fl.u * 3, { seed: w.seed, lines: 2, lw: 3, alpha: 1 - Math.pow(fl.u, 4) });
        }
        ctx.restore();
        continue;
      }
    }
    drawWall(ctx, w, s, t);
  }
  // stones (S3 end → S5)
  if (t > T.ring) drawStone(ctx, 0, t);
  for (let i = 1; i < STONES.length; i++) drawStone(ctx, i, t);

  // tags
  for (const g of TAGS) {
    if (t < g.t) continue;
    const pop = E.outBackBig(prog(t, g.t, g.t + 0.3));
    const sw = Math.sin(t * 3 + g.x) * 0.08;
    const tp = tagPos(g, t);
    if (t >= T.ring) {
      const tc = capture(g.gx, g.gy);
      if (t >= tc) {
        const fl = flight(t, tc, tp.x, tp.y, ph);
        if (fl.u >= 1) continue;
        D.tag(ctx, fl.x, fl.y, g.text, (1 - fl.u * 0.8) * tp.sc, sw + fl.u * 4, 1 - Math.pow(fl.u, 4));
        continue;
      }
    }
    D.tag(ctx, tp.x, tp.y, g.text, pop * tp.sc, sw);
  }

  // slam dust + impact bursts
  for (const [ts, x] of [[T.slam1, 1200], [T.slam2, 400]]) {
    D.dust(ctx, x, 1177, prog(t, ts, ts + 0.6), 5 + x, 160);
    D.burst(ctx, x, 1150, 40, 120, 8, prog(t, ts, ts + 0.3), C.ink, 7, 0.3);
  }
  D.burst(ctx, 1176, 900, 20, 90, 9, prog(t, T.bonk, T.bonk + 0.32), C.gold, 9);
  D.dust(ctx, 760, 1177, prog(t, T.heroLand, T.heroLand + 0.5), 9, 120);
  D.dust(ctx, 560, 1177, prog(t, T.slam2 - 0.05, T.slam2 + 0.6), 19, 90);

  // ring sweep
  if (t > T.ring && t < T.ringEnd + 0.2) {
    const rr = ringR(t);
    const a = 1 - prog(t, T.ringEnd - 0.4, T.ringEnd + 0.2);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(62,198,242,0.35)'; ctx.lineWidth = 60;
    ctx.beginPath(); ctx.arc(icon.x, icon.y, Math.max(1, rr - 30), 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(icon.x, icon.y, Math.max(1, rr), 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(icon.x, icon.y, Math.max(1, rr - 22), 0, TAU); ctx.stroke();
    ctx.restore();
  }

  // stars for the dazed hero
  if (hero.stars) { const hw = R.headWorld(hero.p); D.stars(ctx, hw.x, hw.y - 52, t, 58, 3); }
  // flag (S4/S5)
  if (t > T.flagUp) {
    const top = STONES[4];
    if (hero.flagHand) {
      const hw = R.handWorld(hero.p, 'R');
      D.flag(ctx, hw.x, hw.y + 60, 210, 0, t);
    } else {
      const un = E.outBack(prog(t, T.flagPlant, T.flagPlant + 0.5));
      D.flag(ctx, 330, top.y - STONE_H / 2 + 6, 220, un, t);
      D.dust(ctx, 330, top.y - STONE_H / 2, prog(t, T.flagPlant, T.flagPlant + 0.5), 31, 80);
    }
  }
  // S5 props behind hero
  const ai = aiState(t);
  if (t > T.record - 0.3) drawRecord(ctx, t);
  if (t > T.answer) drawAnswerCard(ctx, t, hero.p);
  drawLinks(ctx, t);

  // hero
  const lift = hero.lift || 0;
  R.contactShadow(ctx, hero.p.x, hero.ground, hero.p.s, lift);
  const opts = {};
  if (hero.phone) {
    opts.propR = (cx2, hand, ang) => {
      D.phone(cx2, hand[0] + 4, hand[1] - 34, 62, 112, 0.05, (c3, sw, sh) => {
        const glow = 0.4 + 0.6 * prog(t, T.iconPop, T.iconPop + 0.2);
        c3.fillStyle = `rgba(62,198,242,${0.25 + 0.5 * glow * (0.7 + 0.3 * Math.sin(t * 10))})`;
        c3.fillRect(-sw / 2, -sh / 2, sw, sh);
        c3.drawImage(A.icon, -18, -18, 36, 36);
      });
    };
  }
  R.drawAdvocate(ctx, hero.p, opts);
  if (hero.lens) {
    const g = lensGlass(t, hero.p);
    const hw = R.handWorld(hero.p, 'R');
    const rot = Math.atan2(hw.y - g.y, hw.x - g.x) - Math.PI / 4;
    // gold highlight under the glass where it passes over matching lines
    ctx.save();
    ctx.beginPath(); ctx.arc(g.x, g.y, LENS_R * g.k, 0, TAU); ctx.clip();
    ctx.fillStyle = 'rgba(255,248,225,0.35)'; ctx.fillRect(g.x - 200, g.y - 200, 400, 400);
    ctx.restore();
    D.magnifier(ctx, g.x, g.y, LENS_R * g.k, rot, {});
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(hw.x, hw.y, 10, 0, TAU); ctx.fill();
  }

  // skid streaks
  if (hero.skid !== undefined && hero.skid < 1 && t > T.slam2 - 0.05) {
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.globalAlpha = 1 - hero.skid;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(hero.p.x + 40 + k * 26, 1150 - k * 14); ctx.lineTo(hero.p.x + 100 + k * 30, 1150 - k * 14); ctx.stroke(); }
    ctx.restore();
  }
  // run speed lines
  const running = (t > T.run1 + 0.15 && t < T.bonk) || (t > T.run2 + 0.15 && t < T.slam2 - 0.05);
  if (running) {
    ctx.save(); ctx.strokeStyle = 'rgba(14,42,82,0.35)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const yy = hero.p.y - 120 + k * 60, dx = -hero.p.f * (70 + ((t * 9 + k * 0.37) % 1) * 60);
      ctx.beginPath(); ctx.moveTo(hero.p.x + dx, yy); ctx.lineTo(hero.p.x + dx - hero.p.f * 70, yy); ctx.stroke();
    }
    ctx.restore();
  }

  // icon popping out of the phone
  if (t > T.iconPop && t < T.panel + 0.4) {
    const u = E.outBackBig(prog(t, T.iconPop, T.iconPop + 0.35));
    const out = prog(t, T.panel, T.panel + 0.4);
    const x = lerp(ph.x, icon.x, u), y = lerp(ph.y - 40, icon.y, u);
    const sz = 170 * u * (1 - E.inBack(out)) * (1 + 0.04 * Math.sin(t * 8));
    if (sz > 1) {
      const g = ctx.createRadialGradient(x, y, sz * 0.3, x, y, sz * 1.3);
      g.addColorStop(0, 'rgba(62,198,242,0.45)'); g.addColorStop(1, 'rgba(62,198,242,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, sz * 1.3, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3) * 0.05);
      ctx.drawImage(A.icon, -sz / 2, -sz / 2, sz, sz);
      ctx.restore();
      // beam from phone to icon
      ctx.save(); ctx.globalAlpha = 0.5 * u * (1 - out);
      ctx.fillStyle = C.cyanSoft;
      ctx.beginPath(); ctx.moveTo(ph.x - 20, ph.y - 70); ctx.lineTo(ph.x + 30, ph.y - 70); ctx.lineTo(x + sz * 0.35, y + sz * 0.3); ctx.lineTo(x - sz * 0.35, y + sz * 0.3); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  drawPanel(ctx, t, A.icon, hero.phone ? R.handWorld(hero.p, 'R') : null);

  // AI assistant
  if (ai) {
    const typing = t > T.typing && t < T.answer;
    D.aiBubble(ctx, ai.x, ai.y, ai.sc, t, { dots: typing, look: -1, rot: ai.rot, blink: Math.floor(t * 10) % 31 === 0 });
  }
  // question bubble
  if (t > T.ask - 0.05 && t < T.answer + 0.3) {
    const hw = R.headWorld(hero.p);
    const k = E.outBackBig(prog(t, T.ask, T.ask + 0.3)) * (1 - E.inBack(prog(t, T.answer, T.answer + 0.3)));
    D.speech(ctx, hw.x + 70, hw.y - 170, k, '?', { tailDir: 1 });
  }
  // check stamp on the answer card
  if (t > T.stamp - 0.12) {
    const u = prog(t, T.stamp - 0.12, T.stamp);
    const sc = lerp(2.6, 1, E.inQuad(u)) + wobble(t, T.stamp, 5, 8, 0.12);
    const cx3 = CARD.x + CARD.w / 2 - 20, cy3 = CARD.y - CARD.h / 2 + 10;
    ctx.save(); ctx.globalAlpha = clamp(u * 2);
    D.check(ctx, cx3, cy3, 50 * sc, prog(t, T.stamp, T.stamp + 0.2), C.navy, C.gold);
    ctx.restore();
    D.burst(ctx, cx3, cy3, 60, 140, 12, prog(t, T.stamp, T.stamp + 0.35), C.gold, 7);
  }
  ctx.restore();
}

// ============================================================== S6 — end card
const END = { iconY: 700, iconS: 330, wordY: 1055, chipsY: 1150, advY: 1252, ctaY: 1405, ctaW: 640, ctaH: 118, heroFeet: 1540, footY: 1640 };
function ctaX() { return 600; }

function endScene(ctx, t, A) {
  const wipe = prog(t, T.wipe, T.wipe + 0.55);
  if (wipe <= 0) return;
  const wc = toScreen(cam(T.wipe), CARD.x + CARD.w / 2 - 20, CARD.y - CARD.h / 2 + 10);
  const cx = wc.x, cy = wc.y;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, E.inCubic(wipe) * 2400 + 1, 0, TAU);
  ctx.clip();
  // navy backdrop with soft glow
  ctx.fillStyle = C.navyDeep; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(540, END.iconY, 50, 540, END.iconY + 100, 1000);
  g.addColorStop(0, 'rgba(28,74,134,0.95)'); g.addColorStop(1, 'rgba(8,27,56,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // drifting gold dust
  const r0 = rng(5);
  for (let i = 0; i < 40; i++) {
    const x = r0() * W, y0 = r0() * H, sp = 20 + r0() * 40, sz = 1.5 + r0() * 3;
    const y = ((y0 - (t - T.wipe) * sp) % H + H) % H;
    ctx.fillStyle = `rgba(226,179,60,${0.18 + 0.2 * r0()})`;
    ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
  }
  // icon drop + bounce
  const du = prog(t, T.iconDrop, T.iconLand);
  if (du > 0) {
    const y = lerp(-300, END.iconY, E.inQuad(du));
    const sq = t > T.iconLand ? wobble(t, T.iconLand, 3.2, 5, 0.14) : 0;
    const s = END.iconS;
    // glow ring (like the icon's arc), pulses on landing
    const ringK = prog(t, T.iconLand, T.iconLand + 0.8);
    if (t > T.iconLand) {
    ctx.save();
    ctx.strokeStyle = `rgba(62,198,242,${0.6 * (1 - ringK)})`; ctx.lineWidth = 10 * (1 - ringK) + 2;
    ctx.beginPath(); ctx.arc(540, END.iconY, s * 0.55 + ringK * 240, 0, TAU); ctx.stroke();
    ctx.restore();
    }
    const gl = ctx.createRadialGradient(540, END.iconY, s * 0.2, 540, END.iconY, s * 0.95);
    gl.addColorStop(0, 'rgba(62,198,242,0.35)'); gl.addColorStop(1, 'rgba(62,198,242,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(540, END.iconY, s * 0.95, 0, TAU); ctx.fill();
    ctx.save();
    ctx.translate(540, y + s / 2);
    ctx.scale(1 + sq, 1 - sq);
    ctx.drawImage(A.icon, -s / 2, -s, s, s);
    ctx.restore();
  }
  // wordmark rise with mask
  const wk = E.outCubic(prog(t, T.wordmark, T.wordmark + 0.5));
  if (wk > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, END.wordY - 130, W, 160); ctx.clip();
    ctx.fillStyle = C.ivory; ctx.font = D.F.serif(900, 132); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Courtlens', 540, END.wordY + (1 - wk) * 150);
    ctx.restore();
  }
  // chips: Court records · Case tracking · AI assistant
  const chips = ['Court records', 'Case tracking', 'AI assistant'];
  ctx.font = D.F.sans(700, 31);
  const widths = chips.map((s) => ctx.measureText(s).width + 44);
  const gap = 16;
  const total = widths.reduce((a, b) => a + b, 0) + gap * 2;
  let x = 540 - total / 2;
  chips.forEach((s, i) => {
    const k = E.outBack(prog(t, T.chips + i * 0.16, T.chips + i * 0.16 + 0.35));
    const w = widths[i];
    if (k > 0) {
      ctx.save();
      ctx.translate(x + w / 2, END.chipsY);
      ctx.scale(k, k);
      ctx.fillStyle = i === 2 ? 'rgba(62,198,242,0.16)' : 'rgba(133,187,219,0.14)';
      ctx.strokeStyle = i === 2 ? C.cyan : C.sky; ctx.lineWidth = 3;
      D.rrect(ctx, -w / 2, -30, w, 60, 30); ctx.fill(); ctx.stroke();
      ctx.fillStyle = i === 2 ? C.cyanSoft : '#D6E8F3';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(s, 0, 2);
      ctx.restore();
    }
    x += w + gap;
  });
  // for advocates
  const ak = E.outCubic(prog(t, T.advocates, T.advocates + 0.4));
  if (ak > 0) {
    ctx.save(); ctx.globalAlpha = ak;
    ctx.fillStyle = C.gold; ctx.font = D.F.serifI(600, 54); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('for advocates', 540, END.advY + (1 - ak) * 30);
    ctx.restore();
  }
  // CTA pill
  const ck = E.outBack(prog(t, T.cta, T.cta + 0.4));
  const press = t > T.tap ? 1 - 0.07 * Math.sin(Math.PI * prog(t, T.tap, T.tap + 0.22)) : 1;
  if (ck > 0) {
    const cxp = ctaX();
    ctx.save();
    ctx.translate(cxp, END.ctaY);
    ctx.scale(ck * press, ck * press);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; D.rrect(ctx, -END.ctaW / 2 + 6, -END.ctaH / 2 + 10, END.ctaW, END.ctaH, END.ctaH / 2); ctx.fill();
    ctx.fillStyle = C.gold; D.rrect(ctx, -END.ctaW / 2, -END.ctaH / 2, END.ctaW, END.ctaH, END.ctaH / 2); ctx.fill();
    ctx.strokeStyle = '#F6D57A'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = C.navyDeep; ctx.font = D.F.sans(800, 44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Explore on Google Play', 0, 2);
    ctx.restore();
    // ripple on tap
    const rk = prog(t, T.tap, T.tap + 0.7);
    if (rk > 0 && rk < 1) {
      ctx.save(); ctx.strokeStyle = `rgba(246,213,122,${1 - rk})`; ctx.lineWidth = 6;
      D.rrect(ctx, cxp - END.ctaW / 2 - rk * 40, END.ctaY - END.ctaH / 2 - rk * 40, END.ctaW + rk * 80, END.ctaH + rk * 80, END.ctaH / 2 + rk * 40); ctx.stroke();
      ctx.restore();
    }
  }
  // advocate walks in and taps the CTA
  if (t > T.walkIn) {
    const P = (n, o) => R.pose(n, Object.assign({ s: 0.78, f: 1 }, o));
    const xe = 150;
    let p;
    if (t < T.tap - 0.25) {
      const u = prog(t, T.walkIn, T.tap - 0.3);
      const wc = R.walkCycle((t - T.walkIn) * 1.9, 1 - prog(t, T.tap - 0.45, T.tap - 0.3));
      p = P('stand', Object.assign({}, wc, { face: R.FACES.happy }));
      p.x = lerp(-120, xe, E.outQuad(u));
      p.y = END.heroFeet - R.hipAbove(p) + wc.bob * 0.78;
    } else {
      p = kf(t, [
        [T.tap - 0.25, P('stand', { face: R.FACES.happy })],
        [T.tap, P('tap', { face: R.FACES.grin }), E.outBack],
        [T.tap + 0.35, P('tap', { face: R.FACES.grin })],
        [T.tap + 0.7, P('wave', { face: R.FACES.grin, f: 1 }), E.outBack],
        [30, P('wave', { face: R.FACES.grin, f: 1 })],
      ]);
      if (t > T.tap + 0.7) p.aR = [deg(150 + 14 * Math.sin((t - T.tap) * 9)), deg(30 + 20 * Math.sin((t - T.tap) * 9))];
      p.x = xe;
      p.y = END.heroFeet - R.hipAbove(p);
    }
    // paper-cutout sticker outline so the navy-coated advocate reads on the navy end card
    ctx.save(); ctx.fillStyle = 'rgba(246,238,220,0.18)';
    ctx.beginPath(); ctx.ellipse(p.x, END.heroFeet + 4, 70, 12, 0, 0, TAU); ctx.fill(); ctx.restore();
    R.drawAdvocateSticker(ctx, p, C.ivory, 7);
  }
  // footnote
  const fk = prog(t, T.wordmark + 0.3, T.wordmark + 0.8);
  if (fk > 0) {
    ctx.save(); ctx.globalAlpha = 0.85 * fk;
    ctx.fillStyle = '#B9CFE0'; ctx.font = D.F.sans(500, 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Illustrative visuals, not actual app screens.', 540, END.footY);
    ctx.fillText('Verify information with official court records.', 540, END.footY + 36);
    ctx.restore();
  }
  ctx.restore();
}

// ============================================================== captions
function captions(ctx, t, CAP) {
  if (!CAP) return;
  for (const line of CAP) {
    if (line.hideCaption) continue;
    const hold = 0.55;
    if (t < line.start - 0.05 || t > line.end + hold + 0.25) continue;
    const out = prog(t, line.end + hold, line.end + hold + 0.25);
    ctx.save();
    ctx.font = D.F.serif(800, 66);
    const maxW = 900;
    const words = line.words;
    const space = ctx.measureText(' ').width;
    const ws = words.map((w) => Object.assign({ w: ctx.measureText(w.text).width }, w));
    const totalW = ws.reduce((a2, b2) => a2 + b2.w + space, -space);
    let rows = [ws];
    if (totalW > maxW) {
      // balanced two-line split
      let bestK = 1, bestV = 1e9;
      for (let k = 1; k < ws.length; k++) {
        const l1 = ws.slice(0, k).reduce((a2, b2) => a2 + b2.w + space, -space);
        const l2 = ws.slice(k).reduce((a2, b2) => a2 + b2.w + space, -space);
        const v = Math.max(l1, l2);
        if (v < bestV) { bestV = v; bestK = k; }
      }
      rows = [ws.slice(0, bestK), ws.slice(bestK)];
    }
    const lh = 80;
    const top = 300 - ((rows.length - 1) * lh) / 2;
    // plate behind text for legibility
    const plateW = Math.min(1000, Math.max(...rows.map((r) => r.reduce((a, b) => a + b.w + space, -space))) + 70);
    const pk = E.outCubic(prog(t, line.start - 0.05, line.start + 0.2)) * (1 - out);
    ctx.globalAlpha = pk;
    ctx.fillStyle = 'rgba(242,236,223,0.9)';
    D.rrect(ctx, 540 - plateW / 2, top - 74, plateW, (rows.length - 1) * lh + 106, 28); ctx.fill();
    ctx.strokeStyle = 'rgba(14,42,82,0.18)'; ctx.lineWidth = 3; ctx.stroke();
    rows.forEach((row, ri) => {
      const rw = row.reduce((a, b) => a + b.w + space, -space);
      let x = 540 - rw / 2;
      for (const w of row) {
        const k = E.outBack(prog(t, w.start - 0.06, w.start + 0.16));
        ctx.save();
        ctx.globalAlpha = clamp(k) * (1 - out);
        ctx.fillStyle = w.accent ? C.navy2 : C.ink;
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.translate(x, top + ri * lh + (1 - k) * 26);
        ctx.fillText(w.text, 0, 0);
        if (w.accent) {
          ctx.fillStyle = C.gold;
          ctx.fillRect(0, 12, w.w * clamp(k), 7);
        }
        ctx.restore();
        x += w.w + space;
      }
    });
    ctx.restore();
  }
}

// ============================================================== frame
function frame(ctx, t, A) {
  paperBg(ctx);
  if (t >= T.s2Start) worldScene(ctx, t, A);
  if (t < T.s1End) scene1(ctx, t);
  if (t >= T.wipe) endScene(ctx, t, A);
  if (t < T.wipe + 0.5) captions(ctx, t, A.captions);
  // grain + vignette
  ctx.save();
  ctx.globalAlpha = 0.07;
  const gx = (Math.floor(t * 12) * 137) % 200, gy = (Math.floor(t * 12) * 71) % 200;
  ctx.drawImage(A.grain, -gx, -gy, W + 200 * 2, H + 200 * 2);
  ctx.restore();
  const v = ctx.createRadialGradient(540, 960, 600, 540, 960, 1250);
  v.addColorStop(0, 'rgba(8,27,56,0)'); v.addColorStop(1, 'rgba(8,27,56,0.16)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ============================================================== SFX cue sheet (same timing source)
function cueSheet() {
  const q = [];
  const add = (t, type, o = {}) => q.push(Object.assign({ t: +t.toFixed(3), type }, o));
  // S1
  add(0.0, 'clock_ticks', { dur: 1.8 });
  add(0.3, 'whoosh', { dur: 0.3, gain: 0.35, pitch: 0.8 });
  add(T.throwRel - 0.04, 'whoosh', { dur: 0.32, gain: 0.6, pitch: 1.2 });
  add(T.land1, 'thud', { gain: 0.9 });
  add(1.05, 'creak', { gain: 0.5 }); add(1.37, 'creak', { gain: 0.6, pitch: 0.85 });
  add(T.toppleStart + 0.05, 'creak', { gain: 0.7, pitch: 0.7 });
  add(T.breakApart, 'boom', { gain: 0.9 });
  add(T.breakApart, 'rustle', { dur: 1.1, gain: 0.7 });
  const hits = [];
  FALL.forEach((f) => f.hits.forEach((h) => { if (h.t < 3.2) hits.push(h); }));
  hits.sort((a, b) => a.t - b.t);
  let last = -1;
  for (const h of hits) { if (h.t - last > 0.06) { add(h.t, 'thud_small', { gain: clamp(h.v / 1600, 0.25, 0.7), pan: (h.x - 540) / 600 }); last = h.t; } }
  add(T.stormStart, 'riser', { dur: T.flip - T.stormStart + 0.05, gain: 0.7 });
  add(T.flip, 'page_flip', { gain: 0.9 });
  // S2
  add(T.heroLand, 'thud', { gain: 0.6, pitch: 1.3 });
  const steps = (t0, t1, rate, gain) => { for (let tt = t0; tt < t1; tt += 1 / rate) add(tt, 'step', { gain }); };
  steps(T.run1 + 0.1, T.bonk - 0.05, 5.2, 0.4);
  add(T.slam1, 'slam', { gain: 1.0, pan: 0.4 });
  add(T.bonk, 'bonk', { gain: 0.85 });
  add(T.fallLand, 'thud', { gain: 0.6, pitch: 1.1 });
  add(T.fallLand + 0.05, 'twinkle', { dur: 0.6, gain: 0.35 });
  steps(T.run2 + 0.1, T.slam2 - 0.08, 5.2, 0.4);
  add(T.slam2, 'slam', { gain: 1.0, pan: -0.4 });
  add(T.slam2 - 0.02, 'skid', { gain: 0.5 });
  add(T.zoomOut, 'whoosh', { dur: 0.8, gain: 0.35, pitch: 0.6 });
  T.tags.forEach((tt, i) => add(tt, 'pop', { gain: 0.55, pitch: 1 + i * 0.12, pan: [(-0.5), 0.5, 0.6, -0.4][i] }));
  steps(T.zoomOutEnd + 0.1, T.despair - 0.1, 3.8, 0.18);
  // S3
  add(T.phoneOut + 0.1, 'pop', { gain: 0.4, pitch: 1.6 });
  add(T.iconPop, 'chime', { gain: 0.55 });
  add(T.ring, 'shimmer', { dur: 1.5, gain: 0.5 });
  const arr = [];
  const ph = phoneHand();
  for (const w of MAZE) { if (w === FLOOR_KEEP) continue; arr.push(capture(w.x, w.y) + 0.62); }
  for (const g of TAGS) arr.push(capture(g.gx, g.gy) + 0.62);
  arr.sort((a, b) => a - b);
  arr.forEach((tt, i) => add(tt, 'tick', { gain: 0.22, pitch: 1 + (i / arr.length) * 1.2 }));
  add(T.panel, 'whoosh', { dur: 0.35, gain: 0.4, pitch: 1.4 });
  ROWS.forEach((_, i) => add(T.rowsIn + i * 0.15 + 0.1, 'tick', { gain: 0.4, pitch: 1.4 + i * 0.15 }));
  add(T.rowsFly, 'whoosh', { dur: 0.5, gain: 0.5, pitch: 1.0 });
  for (let i = 1; i < STONES.length; i++) add(T.rowsFly + (i - 1) * 0.08 + 0.55, 'tock', { gain: 0.45, pitch: 0.9 + i * 0.08 });
  // S4
  T.hops.forEach((h0, i) => { add(h0 + 0.1, 'hop', { gain: 0.35 }); add(h0 + 0.45, 'ding', { gain: 0.5, note: [74, 78, 81, 86][i] }); add(h0 + 0.45, 'step', { gain: 0.45 }); });
  add(T.flagUp, 'pop', { gain: 0.35, pitch: 1.2 });
  add(T.flagPlant, 'thunk', { gain: 0.8 });
  add(T.flagPlant + 0.05, 'flutter', { dur: 0.6, gain: 0.35 });
  // S5
  add(T.aiIn, 'whoosh', { dur: 0.5, gain: 0.45, pitch: 1.5 });
  add(T.aiIn + 0.45, 'chime', { gain: 0.45, pitch: 1.25 });
  add(T.ask, 'pop', { gain: 0.55, pitch: 1.1 });
  add(T.typing, 'typing', { dur: T.answer - T.typing, gain: 0.3 });
  add(T.answer, 'pop', { gain: 0.6, pitch: 1.35 });
  add(T.record - 0.3, 'whoosh', { dur: 0.3, gain: 0.4, pitch: 0.9 });
  add(T.record, 'paper_slap', { gain: 0.7 });
  add(T.lensOut, 'pop', { gain: 0.35, pitch: 0.9 });
  add(T.sweep, 'shimmer', { dur: T.sweepEnd - T.sweep, gain: 0.3 });
  add(T.links, 'tick', { gain: 0.5, pitch: 1.6 }); add(T.links + 0.2, 'tick', { gain: 0.5, pitch: 1.9 });
  add(T.stamp, 'stamp', { gain: 0.95 });
  add(T.stamp + 0.08, 'chime', { gain: 0.45, pitch: 1.5 });
  // S6
  add(T.wipe, 'whoosh', { dur: 0.55, gain: 0.6, pitch: 0.7 });
  add(T.iconLand, 'thud', { gain: 0.55, pitch: 1.4 });
  add(T.iconLand, 'sting', { gain: 0.8 });
  add(T.wordmark, 'shimmer', { dur: 0.6, gain: 0.3 });
  [0, 1, 2].forEach((i) => add(T.chips + i * 0.16, 'tick', { gain: 0.35, pitch: 1.3 + i * 0.2 }));
  add(T.cta, 'pop', { gain: 0.5, pitch: 1.0 });
  steps(T.walkIn + 0.15, T.tap - 0.35, 3.8, 0.2);
  add(T.tap, 'click', { gain: 0.8 });
  add(T.tap + 0.05, 'chime', { gain: 0.4, pitch: 2 });
  return q;
}

function init() { if (!FALL.length) buildFall(); }

module.exports = { W, H, T, BEAT, frame, cueSheet, init, heroWorld, STONES };
