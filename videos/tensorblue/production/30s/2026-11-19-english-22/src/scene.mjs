// Tensorblue 30s english-22 · episode 01 — "GPS is gone. Why move?" (how a map keeps the blue dot moving in a tunnel)
// Blue Receipt Theatre kit (`brt.mjs`, unchanged) + 3D stage (`stage3d.mjs`, unchanged) + `toy3d.mjs` (english-20).
// A toy world: a road runs into a navy mountain; inside, a tunnel with a gentle S-bend. A toy car (the truth) drives
// through; a floating blue-dot puck over a translucent accuracy disc (the app's estimate) moves with it. The mountain
// lifts like a lid to show the tunnel. Everything the car and the dot do inside is replayed from our simulation
// (demo/out/tunnel-sim.json): straight-line dead reckoning leaves the road at the bend; a turn sensor + map matching
// keep it on the road; the car slows and the guess drifts ~90 m ahead until the next GPS fix snaps it back;
// beacons re-anchor it. A phone map in the foreground (its own fixed camera) shows only what an app would show:
// the road and the blue dot with its light-blue accuracy circle — no buttons.
// Colours: Tensorblue palette + tensorblue.com's own green-400 (GPS fix), red-500 (off the road, brake lights),
// amber-400 (tunnel lights), cyan-400 (beacons).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, makeBackground } from './brt.mjs';
import { camera, project, floor, mix3 } from './stage3d.mjs';
import { extrude, rrectPts, circlePts, dropShadow, lightPool, squash, fogK, lit } from './toy3d.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the simulation ----------------------------------------------------------------------------------
const SIM = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/tunnel-sim.json'), 'utf8'));
const EX = SIM.at_tunnel_exit;
if (Math.round(EX.mm_dot_ahead_of_car_m / 10) !== 9 || EX.straight_dr_off_road_m < 100 || SIM.road.tunnel_m !== 600 || SIM.beacons_max_ahead_m >= EX.mm_dot_ahead_of_car_m
  || EX.accuracy_circle_m <= EX.mm_dot_ahead_of_car_m) throw new Error('simulation result changed');
const ROWS = SIM.rows_every_0_5s, RD = SIM.road_xy_every_10m;
const T_IN = SIM.road.approach_m, T_OUT = SIM.road.approach_m + SIM.road.tunnel_m, FIRST_FIX = SIM.first_fix_after_exit_t;
function rowAt(st) {                                            // interpolated state at sim time st
  const i = clamp(Math.floor(st / 0.5) - 1, 0, ROWS.length - 2);
  let a = ROWS[i], b = ROWS[i + 1];
  for (let j = Math.max(0, i - 2); j < ROWS.length - 1; j++) if (ROWS[j].t <= st && ROWS[j + 1].t >= st) { a = ROWS[j]; b = ROWS[j + 1]; break; }
  const f = clamp((st - a.t) / (b.t - a.t || 1));
  const L = (p, q) => p + (q - p) * f;
  const r = { t: st, s: L(a.s, b.s), x: L(a.x, b.x), y: L(a.y, b.y), v: L(a.v_kmh, b.v_kmh), tunnel: a.tunnel && b.tunnel, braking: b.v_kmh < a.v_kmh - 0.05 };
  if (a.est && b.est) {
    r.est = {}; for (const k of Object.keys(a.est)) r.est[k] = [L(a.est[k][0], b.est[k][0]), L(a.est[k][1], b.est[k][1])];
    r.mm_s = L(a.mm_s, b.mm_s); r.unc = L(a.unc_m, b.unc_m); r.ahead = L(a.mm_ahead_m, b.mm_ahead_m);
    r.bc_s = Math.abs(b.bc_s - a.bc_s) > 30 ? b.bc_s : L(a.bc_s, b.bc_s); r.bc_unc = b.bc_unc_m < a.bc_unc_m ? b.bc_unc_m : L(a.bc_unc_m, b.bc_unc_m);
  } else if (a.est && f < 0.5) { r.est = a.est; r.mm_s = a.mm_s; r.unc = a.unc_m; r.ahead = a.mm_ahead_m; r.bc_s = a.bc_s; r.bc_unc = a.bc_unc_m; }
  return r;
}
function roadAt(s) { const k = clamp(s / 10, 0, RD.length - 1.001), i = Math.floor(k), f = k - i; const a = RD[i], b = RD[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }
function headAt(s) { const a = roadAt(s - 3), b = roadAt(s + 3); return Math.atan2(b[0] - a[0], b[1] - a[1]); }

// ---- colours / cues ----
const K = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', blueDeep: '#2757A6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF',
  grayDark: '#788396', white: '#FFFFFF', ink: '#030610', amber: '#FFB900', red: '#FB2C36', cyan: '#00D3F2', green: '#05DF72', rock: '#16223A', road: '#1E2B44' };
const T = {
  gps: VW('L1', 'gps'), tunnel: VW('L1', 'tunnel'), why: VW('L1', 'why'), moving: VW('L1', 'moving'),
  guessing: VW('L2', 'guessing'), purpose: VW('L2', 'purpose'),
  keeps3: VW('L3', 'keeps'), speed: VW('L3', 'speed'), heading: VW('L3', 'heading'), dead: VW('L3', 'dead'),
  sensors: VW('L4', 'sensors'), curves: VW('L4', 'curves'), map4: VW('L4', 'map'), road: VW('L4', 'road'),
  drift: VW('L5', 'drift'), simulation: VW('L5', 'simulation'), ninety: VW('L5', 'ninety'), ahead: VW('L5', 'ahead'),
  tunnels6: VW('L6', 'tunnels'), waze: VW('L6', 'waze'), beacons: VW('L6', 'beacons'), location: VW('L6', 'location'),
  building: VW('L7', 'building'), grow: VW('L7', 'grow'), circle: VW('L7', 'circle'), snap: VW('L7', 'snap'), gps7: VW('L7', 'gps'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.08;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, VL('L2').t0 - 0.12, VL('L3').t0 - 0.1, VL('L4').t0 - 0.1, VL('L5').t0 - 0.1, VL('L6').t0 - 0.12, VL('L7').t0 - 0.12, CTA_AT, 30.01];
const SH = { hook: 0, guess: 1, dr: 2, mm: 3, drift: 4, beacons: 5, payoff: 6, cta: 7 };
const SNAP5 = VL('L5').t1 - 0.4;
export const CUES = { ...T, scenes: SHOTS };
const shotAt = (t) => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1]) i++; return i; };
const wShot = (t) => Math.min(shotAt(t), SH.payoff);   // the world under the CTA wipe keeps the payoff shot

// sim-time maps (video t → simulation seconds), keyed so story beats land on the words
const SIMMAP = {
  [SH.hook]: (t) => 6.0 + (t - T.tunnel) * 1.6,                                   // the car enters on "tunnel"
  [SH.guess]: (t) => 6.0 + (t - T.tunnel) * 1.6,
  [SH.dr]: (t) => 8 + (t - SHOTS[SH.dr]) * (14 / (SHOTS[SH.mm] - SHOTS[SH.dr])),
  [SH.mm]: (t) => 12 + (t - SHOTS[SH.mm]) * 3.8,
  [SH.drift]: (t) => Math.min(49.5, 24 + (t - SHOTS[SH.drift]) * ((FIRST_FIX - 24) / (SNAP5 - SHOTS[SH.drift]))),   // the next GPS fix lands just after "ahead"
  [SH.beacons]: (t) => 5.5 + (t - SHOTS[SH.beacons]) * 10.4,
  [SH.payoff]: (t) => { const t0 = SHOTS[SH.payoff] + 0.15, ts = T.snap + 0.05; return t < ts ? 4 + (t - t0) * ((FIRST_FIX - 4) / (ts - t0)) : Math.min(63, FIRST_FIX + (t - ts) * 4.5); },   // snap on "snap", then keep driving gently
};

// ---- world mapping: 1 unit = 40 m; forward = -z ----
const SC = 1 / 40;
const Wp = (xm, ym, h = 0) => [xm * SC, h, -ym * SC];
const roadW = (s, h = 0) => { const [x, y] = roadAt(s); return Wp(x, y, h); };

// ================================= toys =================================
const CIRC = circlePts(1, 32), PH_PTS = rrectPts(1.04, 2.0, 0.15, 6);
const CAR_PTS = [[-0.27, 0.02], [0.27, 0.02], [0.285, 0.085], [0.21, 0.112], [-0.24, 0.112], [-0.285, 0.09]], CAB_PTS = [[0.14, 0.11], [0.06, 0.19], [-0.13, 0.19], [-0.21, 0.11]], CAR_K = 1.3;
const carTex = (() => { const cv = createCanvas(280, 100), g = cv.getContext('2d'); g.fillStyle = K.white; g.fillRect(0, 0, 280, 100);
  // side windows (blue) on the car's silhouette: texture spans u -0.28..0.28 (280 px), v 0..0.2 (100 px)
  g.fillStyle = K.blue; g.beginPath(); g.moveTo(140 + 0.075 * 500, 100 - 0.18 * 500); g.lineTo(140 - 0.115 * 500, 100 - 0.18 * 500); g.lineTo(140 - 0.18 * 500, 100 - 0.12 * 500); g.lineTo(140 + 0.13 * 500, 100 - 0.12 * 500); g.closePath(); g.fill();
  g.fillStyle = K.white; g.fillRect(140 - 0.02 * 500, 100 - 0.19 * 500, 8, 40); return cv; })();
// base items (walls, accuracy discs) are drawn first in order; everything else is sorted far → near
function paint(ctx, cam, L) { for (const d of L) if (d.base) d.f(ctx); const R = L.filter((d) => !d.base); R.sort((a, b) => project(cam, b.p).z - project(cam, a.p).z); for (const d of R) d.f(ctx); }
function mixHex(a, b, t) { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.closePath(); }

// the road: a ribbon drawn first (it is the base; the floor is flat)
function roadRibbon(ctx, cam) {
  const half = 0.24, segs = [];
  for (let s = 0; s < 900; s += 10) {
    const p0 = roadW(s, 0.012), p1 = roadW(s + 10, 0.012), h0 = headAt(s), h1 = headAt(s + 10);
    const n0 = [Math.cos(h0) * half, 0, Math.sin(h0) * half], n1 = [Math.cos(h1) * half, 0, Math.sin(h1) * half];
    const q = [[p0[0] - n0[0], p0[1], p0[2] - n0[2]], [p0[0] + n0[0], p0[1], p0[2] + n0[2]], [p1[0] + n1[0], p1[1], p1[2] + n1[2]], [p1[0] - n1[0], p1[1], p1[2] - n1[2]]];
    const sp = q.map((v) => project(cam, v)); if (sp.some((v) => v.z < 0.25)) continue;
    segs.push({ sp, z: (sp[0].z + sp[2].z) / 2, s });
  }
  segs.sort((a, b) => b.z - a.z);
  for (const g of segs) {
    const f = fogK(cam, roadW(g.s + 5));
    ctx.fillStyle = lit(K.road, 1.0, f); poly(ctx, g.sp); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();
  }
}
// tunnel side walls (one quad per 10 m, sorted with the rest so the car can pass in front of the far wall)
function walls(L, cam, alpha) {
  if (alpha <= 0.01) return;
  for (let s = T_IN; s < T_OUT; s += 10) for (const side of [-1, 1]) {
    const h0 = headAt(s), h1 = headAt(s + 10), off = 0.3, hh = 0.36;
    const a = roadW(s), b = roadW(s + 10);
    const A = [a[0] + side * Math.cos(h0) * off, 0, a[2] + side * Math.sin(h0) * off], B = [b[0] + side * Math.cos(h1) * off, 0, b[2] + side * Math.sin(h1) * off];
    const q = [A, B, [B[0], hh, B[2]], [A[0], hh, A[2]]];
    L.push({ base: true, z: 0, p: [(A[0] + B[0]) / 2, 0.15, (A[2] + B[2]) / 2], f: (ctx) => {
      const sp = q.map((v) => project(cam, v)); if (sp.some((v) => v.z < 0.25)) return;
      const f = fogK(cam, [(A[0] + B[0]) / 2, 0.15, (A[2] + B[2]) / 2]);
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = lit(side < 0 ? '#22304A' : '#1A2740', 1, f); poly(ctx, sp); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.stroke();
      ctx.fillStyle = `rgba(255,185,0,${0.55 * (1 - f)})`;                                   // a small amber tunnel lamp on each wall section
      const m = project(cam, [(A[0] + B[0]) / 2, hh * 0.78, (A[2] + B[2]) / 2]); ctx.beginPath(); ctx.arc(m.x, m.y, Math.max(1.5, 0.018 * cam.focal / m.z), 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } });
  }
}
// arch ribs: read as a tunnel when the mountain is lifted
const RIB_PTS = (() => { const p = []; const R = 0.36, r = 0.3; for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; p.push([R * Math.cos(a), R * Math.sin(a)]); } p.push([-R, 0], [-r, 0]); for (let i = 12; i >= 0; i--) { const a = (i / 12) * Math.PI; p.push([r * Math.cos(a), r * Math.sin(a)]); } p.push([r, 0]); return p; })();
function ribs(L, cam, alpha) {
  if (alpha <= 0.01) return;
  for (let s = T_IN + 40; s < T_OUT; s += 110) { const p = roadW(s); L.push({ p: [p[0], 0.2, p[2]], f: (ctx) => extrude(ctx, cam, { p, yaw: -headAt(s), pts: RIB_PTS, depth: 0.05, color: K.gray, side: K.grayDark, alpha, gloss: 0.15 }) }); }
}
// the mountain: a ridge profile extruded across the road, with a portal arch on its near face
// the mountain: a hill cross-section extruded along the tunnel, so from the road it reads as a mountain with a portal
const HILL = [[-2.35, 0], [-1.95, 0.32], [-1.35, 0.78], [-0.65, 1.12], [0.05, 1.3], [0.75, 1.22], [1.45, 0.92], [2.0, 0.5], [2.35, 0]];
const M_Z0 = -2.5, M_Z1 = -17.6, M_X = 0.75;
function mountain(L, cam, lift, alpha) {
  if (alpha <= 0.01) return;
  const p = [M_X, lift, (M_Z0 + M_Z1) / 2], depth = M_Z0 - M_Z1;
  L.push({ p: [M_X, 0.6 + lift, (M_Z0 + M_Z1) / 2], f: (ctx) => extrude(ctx, cam, { p, pts: HILL, depth, color: '#22314F', side: '#2B3B5E', alpha, gloss: 0.08, ambient: 0.5 }) });
  // portal: stone arch + dark mouth on the mountain's front face
  const e = roadW(T_IN), q = [e[0], lift, M_Z0 + 0.03];
  L.push({ p: [q[0], 0.3 + lift, q[2] + 0.2], f: (ctx) => {
    extrude(ctx, cam, { p: q, pts: RIB_PTS.map(([u, v]) => [u * 1.3, v * 1.3]), depth: 0.12, color: K.gray, side: K.grayDark, alpha, gloss: 0.2 });
    extrude(ctx, cam, { p: [q[0], q[1], q[2] - 0.02], pts: [[-0.39, 0], [0.39, 0], ...Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI; return [0.39 * Math.cos(a), 0.39 * Math.sin(a)]; })], depth: 0.04, color: '#02040A', side: '#02040A', alpha, gloss: 0, noFog: true });
  } });
}
// the toy car (truth)
function car(L, cam, s, o = {}) {
  const { hidden = false, braking = false, bounce = 0 } = o; if (hidden) return;
  const p = roadW(s, 0.0), h = headAt(s), [sx, sy] = squash(bounce);
  L.push({ p: [p[0], 0.1, p[2]], f: (ctx) => {
    dropShadow(ctx, cam, [p[0], 0, p[2]], 0.32, 0.16, 0.6);
    for (const [u, w] of [[0.17, 0.14], [-0.18, 0.14], [0.17, -0.14], [-0.18, -0.14]]) extrude(ctx, cam, { p: [p[0] + Math.sin(h) * u * CAR_K + Math.cos(h) * w, 0.065, p[2] - Math.cos(h) * u * CAR_K + Math.sin(h) * w], yaw: Math.PI / 2 - h, sx: 0.07, sy: 0.07, pts: CIRC, depth: 0.05, color: '#0A1222', side: '#050816', gloss: 0 });
    extrude(ctx, cam, { p, yaw: Math.PI / 2 - h, sx: sx * CAR_K, sy: sy * CAR_K, sz: CAR_K, pts: CAR_PTS, depth: 0.2, color: K.white, side: K.pale, gloss: 0.3, ambient: 0.62 });
    extrude(ctx, cam, { p, yaw: Math.PI / 2 - h, sx: sx * CAR_K, sy: sy * CAR_K, sz: CAR_K, pts: CAB_PTS, depth: 0.16, color: K.blue, side: K.blueDeep, gloss: 0.45, ambient: 0.6 });
    if (braking) for (const w of [-0.09, 0.09]) extrude(ctx, cam, { p: [p[0] - Math.sin(h) * 0.375 + Math.cos(h) * w, 0.1, p[2] + Math.cos(h) * 0.375 + Math.sin(h) * w], yaw: -h, pts: rrectPts(0.07, 0.04, 0.012, 2), depth: 0.02, color: K.red, side: K.red, noFog: true, gloss: 0 });
  } });
}
// the blue dot (the app's estimate): a floating puck over a translucent accuracy disc on the road
function dot(L, cam, pos, o = {}) {
  const { unc = 0, alpha = 1, tint = null, bounce = 0, arrow = null, ghost = false } = o; if (alpha <= 0.01) return;
  const [x, , z] = pos, [sx, sy] = squash(bounce), y = 0.55 + 0.03 * Math.sin(pos[3] || 0);
  L.push({ base: true, p: [x, 0.05, z], f: (ctx) => {
    if (unc > 0) {   // accuracy disc on the road (radius from the simulation's uncertainty model)
      const r = unc * SC, pts = CIRC.map(([u, v]) => project(cam, [x + u * r, 0.02, z + v * r])); if (!pts.some((p) => p.z < 0.25)) {
        ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = 'rgba(59,130,246,0.20)'; poly(ctx, pts); ctx.fill(); ctx.strokeStyle = 'rgba(59,130,246,0.75)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }
    }
    lightPool(ctx, cam, [x, 0.02, z], 0.45, tint ? '251,44,54' : '59,130,246', 0.35 * alpha);
  } });
  L.push({ p: [x, y, z], f: (ctx) => {
    const col = tint || K.blue;
    extrude(ctx, cam, { p: [x, y, z], pitch: -1.15, sx: 0.17 * sx, sy: 0.17 * sy, pts: CIRC, depth: 0.05, color: K.white, side: K.gray, alpha: ghost ? alpha * 0.6 : alpha, gloss: 0.3, noFog: true });
    extrude(ctx, cam, { p: [x, y + 0.012, z + 0.006], pitch: -1.15, sx: 0.12 * sx, sy: 0.12 * sy, pts: CIRC, depth: 0.07, color: col, side: mixHex(col, '#000000', 0.35), alpha: ghost ? alpha * 0.6 : alpha, gloss: 0.35, noFog: true });
    if (arrow != null) extrude(ctx, cam, { p: [x + Math.sin(arrow) * 0.24, y, z - Math.cos(arrow) * 0.24], pitch: -Math.PI / 2, roll: -arrow, pts: [[-0.08, -0.04], [0.08, -0.04], [0, 0.1]], depth: 0.04, color: col, side: mixHex(col, '#000000', 0.35), alpha, noFog: true });
  } });
}
function fixPin(L, cam, pos, k) {   // a GPS fix landing: a green pin that pops and fades
  if (k <= 0 || k >= 1) return;
  const a = 1 - easeIn(k), sc = 0.09 * back(Math.min(1, k * 4));
  L.push({ p: [pos[0], 0.3, pos[2]], f: (ctx) => extrude(ctx, cam, { p: [pos[0], 0.32 + 0.12 * k, pos[2]], pitch: -1.0, sx: sc, sy: sc, pts: CIRC, depth: 0.04, color: K.green, side: '#03A855', alpha: a, gloss: 0.3, noFog: true }) });
}
function beacon(L, cam, s, hit) {   // a roadside beacon on the left wall
  const h = headAt(s), p = roadW(s), q = [p[0] - Math.cos(h) * 0.26, 0.3, p[2] - Math.sin(h) * 0.26], [sx, sy] = squash(hit * 0.8);
  L.push({ p: q, f: (ctx) => { if (hit > 0) lightPool(ctx, cam, [q[0] + Math.cos(h) * 0.15, 0.02, q[2]], 0.5, '0,211,242', 0.45 * hit);
    extrude(ctx, cam, { p: q, yaw: Math.PI / 2 - h, sx: sx * (1 + 0.25 * hit), sy: sy * (1 + 0.25 * hit), pts: rrectPts(0.22, 0.15, 0.04, 2), depth: 0.08, color: hit > 0.05 ? K.cyan : '#7FD9E8', side: hit > 0.05 ? '#0097AD' : K.grayDark, gloss: 0.35, ambient: 0.8, noFog: true }); } });
}

// ================================= the phone (foreground, its own fixed camera) =================================
const MAP_W = 520, MAP_H = 1020, MAPC = createCanvas(MAP_W, MAP_H), MG = MAPC.getContext('2d');
function drawMap(dotXY, headDeg, unc, dotOn = true, ppmIn = 1.05, cyIn = 470) {   // heading-up map: road, the tunnel section, the blue dot and its accuracy circle
  const g = MG, ppm = ppmIn, cx = MAP_W / 2, cy = cyIn, hr = (headDeg * Math.PI) / 180;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0E1A2E'; g.fillRect(0, 0, MAP_W, MAP_H);
  const P = (xm, ym) => { const dx = xm - dotXY[0], dy = ym - dotXY[1]; const rx = dx * Math.cos(hr) - dy * Math.sin(hr), ry = dx * Math.sin(hr) + dy * Math.cos(hr); return [cx + rx * ppm, cy - ry * ppm]; };
  g.fillStyle = '#132238'; for (const [bx, by, bw, bh] of [[-160, 60, 90, 60], [70, 150, 70, 110], [-150, 330, 80, 90], [80, 420, 90, 70], [-140, 640, 70, 80], [90, 720, 80, 100]]) { const c = P(bx, by); rr(g, c[0] - bw / 2, c[1] - bh / 2, bw, bh, 14); g.fill(); }
  const strokeRoad = (s0, s1, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); for (let s = s0; s <= s1; s += 10) { const [x, y] = roadAt(s); const c = P(x, y); if (s === s0) g.moveTo(c[0], c[1]); else g.lineTo(c[0], c[1]); } g.stroke(); };
  strokeRoad(0, 900, K.gray, 40 * Math.min(1.4, ppm));
  strokeRoad(T_IN, T_OUT, '#4A5A76', 35 * Math.min(1.4, ppm));                                   // the tunnel section: the road shaded darker
  if (unc > 0) { g.fillStyle = 'rgba(59,130,246,0.22)'; g.beginPath(); g.arc(cx, cy, Math.max(18, unc * ppm), 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(59,130,246,0.8)'; g.lineWidth = 3; g.stroke(); }
  if (dotOn) { g.fillStyle = K.white; g.beginPath(); g.arc(cx, cy, 22, 0, Math.PI * 2); g.fill(); g.fillStyle = K.blue; g.beginPath(); g.arc(cx, cy, 16, 0, Math.PI * 2); g.fill(); }
  return MAPC;
}
function phoneFG(ctx, t, est, k, hero = 0) {   // k: appear 0..1; hero: 0 hook size, 1 payoff size
  if (k <= 0.01) return;
  const cam = camera([0, 0, lerp(5.3, 3.9, hero)], [0, 0, 0], 28, 540, lerp(1610, 1230, hero) + (1 - easeOut(k)) * 560);
  extrude(ctx, cam, { p: [0, -0.15, 0], yaw: 0.12, pitch: -0.22, roll: -0.02, pts: PH_PTS, depth: 0.11, color: '#101B30', side: '#0A1222', tex: drawMap(est.xy, est.head, est.unc, est.on !== false, lerp(1.7, 1.25, hero), lerp(205, 470, hero)), texW: 0.94, texH: 1.84, gloss: 0.16, edge: 'rgba(216,227,245,0.35)', noFog: true, alpha: clamp(k * 1.5) });
}

// ================================= cameras =================================
const mixCam = (A, B, k) => ({ eye: mix3(A.eye, B.eye, k), at: mix3(A.at, B.at, k) });
function rot(h, v) { return [v[0] * Math.cos(h) - v[2] * Math.sin(h), v[1], v[0] * Math.sin(h) + v[2] * Math.cos(h)]; }   // offsets turn with the road (forward = -z)
function followH(p, h, off, look) { const o = rot(h, off), l = rot(h, look); return { eye: [p[0] + o[0], off[1], p[2] + o[2]], at: [p[0] + l[0], look[1], p[2] + l[2]] }; }
const HOOK_A = { eye: [0.45, 1.5, 2.6], at: [0.1, 0.05, -3.6] }, HOOK_B = { eye: [0.4, 1.42, 2.2], at: [0.1, 0.08, -3.6] };
const CRANE = { eye: [3.8, 6.8, 1.4], at: [1.0, 0, -8.4] };
function camAt(t, st) {
  const i = wShot(t), r = rowAt(st), h = headAt(r.s), carP = roadW(r.s);
  let c, fov = 44;
  if (i === SH.hook) { c = mixCam(HOOK_A, HOOK_B, ease(ev(t, 0.2, SHOTS[SH.guess] - 0.2))); fov = 40; }
  else if (i === SH.guess) { c = mixCam(HOOK_B, CRANE, ease(ev(t, SHOTS[i] + 0.1, 1.3))); fov = lerp(40, 44, ease(ev(t, SHOTS[i] + 0.1, 1.3))); }
  else if (i === SH.dr) { const g = r.est ? Wp(r.est.straight[0], r.est.straight[1]) : carP, m = mix3(carP, g, 0.5); c = followH(m, headAt(r.s + 60) * 0.5, [0.7, 2.2, 3.0], [0, 0.1, -1.6]); fov = 48; }
  else if (i === SH.mm || i === SH.beacons) { const hh = headAt(r.s + 60); c = followH(carP, hh * 0.6, [0.55, 1.75, 2.5], [-0.05, 0.15, -2.1]); fov = 46; }
  else if (i === SH.drift) { const e = r.est ? roadW(r.mm_s) : carP, m = mix3(carP, e, 0.5); c = followH(m, headAt(r.s) * 0.5, [2.4, 2.9, 2.2], [0, 0.0, -0.4]); fov = 46; }
  else c = { eye: [2.0, 4.1, 2.6], at: [0.5, 0.2, -6.2] };
  return camera(c.eye, c.at, fov);
}

// ================================= the world =================================
const FLOOR = { x: 1, y: -0.6, z: -10, w: 60, h: 0.6, d: 60, colors: { top: '#0A1426', front: K.surface2, left: K.surface2, right: K.surface2 }, color: K.surface2 };
function horizonFog(ctx, cam) {
  const far = project(cam, [cam.eye[0] + cam.f[0] * 22, 0, cam.eye[2] + cam.f[2] * 22]), mid = project(cam, [cam.eye[0] + cam.f[0] * 11, 0, cam.eye[2] + cam.f[2] * 11]);
  if (far.z < 0.2 || mid.z < 0.2) return;
  const g = ctx.createLinearGradient(0, far.y - 60, 0, mid.y); g.addColorStop(0, 'rgba(3,6,16,1)'); g.addColorStop(1, 'rgba(3,6,16,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, mid.y));
}
// which estimate the dot shows in each shot
function estimateFor(i, r) {
  const st = r.t;
  if (!r.est || !r.tunnel) return { s: r.s, xy: [r.x, r.y], unc: 4, gps: true };
  if (i === SH.dr) { const [x, y] = r.est.straight; return { xy: [x, y], unc: r.unc, straight: true }; }
  if (i === SH.beacons) return { s: r.bc_s, xy: roadAt(r.bc_s), unc: r.bc_unc };
  return { s: r.mm_s, xy: r.est.mm_xy, unc: r.unc };
}
function world(ctx, t) {
  const i = wShot(t), st = SIMMAP[i](t), r = rowAt(st), cam = camAt(t, st);
  floor(ctx, cam, FLOOR, { at: [0.8, 0, -8], radius: 9, strength: 0.16 });
  horizonFog(ctx, cam);
  roadRibbon(ctx, cam);
  const lift = i === SH.hook ? 0 : i === SH.guess ? easeIn(ev(t, T.guessing - 0.35, 0.9)) * 6 : 99;
  const mAlpha = i === SH.hook ? 1 : i === SH.guess ? 1 - ev(t, T.guessing + 0.1, 0.5) : 0;
  const inside = mAlpha < 0.98;
  const L = [];
  mountain(L, cam, lift, mAlpha);
  walls(L, cam, inside ? 1 : 0); ribs(L, cam, inside ? 1 : 0);
  if (i === SH.beacons || i === SH.payoff) SIM.beacons_s.forEach((b, j) => { const tHit = SIM.beacon_hits_t[j]; beacon(L, cam, b, i === SH.beacons ? clamp(1 - Math.abs(st - tHit) / 2.5) * (st >= tHit - 0.3 ? 1 : 0) : 0); });
  // the car: hidden inside the closed mountain
  const carHidden = !inside && r.s > T_IN + 6 && r.s < T_OUT;
  car(L, cam, r.s, { hidden: carHidden, braking: r.braking && i === SH.drift });
  // GPS fixes outside the tunnel (green pins)
  for (const ft of SIM.fix_times_s) { const k = (st - ft) / 1.4; if (k > 0 && k < 1) { const rr2 = rowAt(ft); fixPin(L, cam, roadW(rr2.s, 0), k); } }
  // the estimate (blue dot)
  const e = estimateFor(i, r);
  if (!(i === SH.hook && carHidden && false)) {
    const pos = e.s != null ? roadW(e.s) : Wp(e.xy[0], e.xy[1]);
    const off = e.straight ? Math.min(...RD.map(([x, y]) => Math.hypot(x - e.xy[0], y - e.xy[1]))) : 0;
    const tint = e.straight && off > 12 ? K.red : null;
    pos[3] = t * 6;
    let snapK = i === SH.drift ? ev(t, SNAP5, 0.12) * (1 - ev(t, SNAP5 + 0.12, 0.25)) : 0;
    if (i === SH.beacons) for (const ht of SIM.beacon_hits_t) { const d = st - ht; if (d >= 0 && d < 2.6) snapK = Math.max(snapK, (1 - d / 2.6) * 0.9); }
    dot(L, cam, pos, { unc: e.gps ? 4 : e.unc, tint, arrow: i === SH.dr && r.est ? SIM_HEAD0 : null, bounce: snapK });
  }
  paint(ctx, cam, L);
  return { cam, r, e, i, st };
}
const SIM_HEAD0 = 0;   // the straight guess keeps the heading it had at the last fix (straight ahead, 0 rad)

// ================================= headlines (one at a time) =================================
function headlines(ctx, t, info) {
  const i = shotAt(t);
  if (t < T.why + 1.1) {
    const k = 1 - ev(t, SHOTS[SH.guess] - 0.3, 0.25);
    ctx.save(); ctx.shadowColor = 'rgba(3,6,16,0.95)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 4;   // keeps the words crisp over the mountain
    text(ctx, 'GPS IS GONE.', 540, 586, { size: 100, font: 'IDXB', alpha: k });
    text(ctx, 'WHY MOVE?', 540, 694, { size: 100, font: 'IDXB', color: K.blue, alpha: k });
    ctx.restore();
  }
  kword(ctx, "IT'S GUESSING.", 540, 620, 96, t, T.guessing - 0.08, { t1: SHOTS[SH.dr] - 0.2 });
  kword(ctx, 'DEAD RECKONING', 540, 620, 90, t, T.dead - 0.08, { t1: SHOTS[SH.mm] - 0.15, color: K.white });
  kword(ctx, 'MAP MATCHING', 540, 620, 96, t, T.map4 - 0.08, { t1: SHOTS[SH.drift] - 0.15, color: K.white });
  if (i === SH.drift && info.r.est) {   // a live counter: how far the guess is ahead of the car (from the simulation)
    const k = ev(t, T.drift - 0.1, 0.3) * (1 - ev(t, SNAP5 - 0.12, 0.12));
    const ahead = Math.max(0, Math.round(info.r.ahead));
    if (k > 0) { text(ctx, `+${ahead} m`, 540, 640, { size: 120, font: 'IDXB', color: ahead > 50 ? K.red : K.white, alpha: k }); text(ctx, 'DOT AHEAD OF CAR', 540, 700, { size: 40, font: 'IDXB', color: K.gray, alpha: k }); }
  }
  if (i === SH.drift && !info.r.est && t > SNAP5 - 0.1) { const k = ev(t, SNAP5, 0.15) * (1 - ev(t, SHOTS[SH.beacons] - 0.2, 0.15)); text(ctx, 'GPS IS BACK', 540, 640, { size: 100, font: 'IDXB', color: K.green, alpha: k }); }
  kword(ctx, 'WAZE BEACONS', 540, 620, 96, t, T.waze - 0.1, { t1: SHOTS[SH.payoff] - 0.15, color: K.cyan });
  kword(ctx, 'GROW THE CIRCLE.', 540, 620, 88, t, T.grow - 0.08, { t1: T.snap - 0.15 });
  kword(ctx, 'SNAP BACK.', 540, 620, 104, t, T.snap + 0.2, { t1: CTA_AT, color: K.green });
}

// ---- captions (upper safe band y 280-460, per the 2026-11-19 brief) ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['No GPS in this tunnel.'] },
  { t0: T.why, lines: ['Why is the dot', 'still moving?'] },
  { t0: VL('L2').t0, lines: ['Your map is guessing,', 'on purpose.'] },
  { t0: VL('L3').t0, lines: ['It keeps your last', 'speed and heading.'] },
  { t0: VW('L3', "that's"), lines: ["That's dead reckoning."] },
  { t0: VL('L4').t0, lines: ['Sensors can', 'catch curves,'] },
  { t0: VW('L4', 'and'), lines: ['and map matching', 'keeps it on the road.'] },
  { t0: VL('L5').t0, lines: ['But guesses drift.'] },
  { t0: VW('L5', 'in'), lines: ['In our simulation, the dot', 'ran ninety meters ahead.'] },
  { t0: VL('L6').t0, lines: ['Some tunnels add', 'Waze beacons,'] },
  { t0: VW('L6', 'so'), lines: ['so phones still', 'get location.'] },
  { t0: VL('L7').t0, lines: ['Building a map?'] },
  { t0: T.grow, lines: ['Grow the blue circle', 'while guessing,'] },
  { t0: VW('L7', 'then'), lines: ['then snap back to GPS.'], tEnd: VL('L8').t0 - 0.05 },
  { t0: VL('L8').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.7 },
];
for (const c of CAPS) c.t0 -= 0.06;
for (let i = 0; i < CAPS.length; i++) if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0;
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 54, CAPTION_LH = 64, CAPTION_TOP = 284, CAPTION_BOTTOM = 456, CAPTION_MAXW = 760, CAPTION_CX = 500;
const CAPTION_PAD = 8;
export function captionLayout(ctx, cap) {
  ctx.save(); ctx.font = `${CAPTION_SIZE}px InterSB`; const ms = cap.lines.map((s) => ctx.measureText(s)); ctx.restore();
  for (let i = 0; i < ms.length; i++) if (ms[i].width > CAPTION_MAXW) throw new Error('caption too wide: ' + cap.lines[i]);
  const asc = Math.max(...ms.map((m) => m.actualBoundingBoxAscent)), desc = Math.max(...ms.map((m) => m.actualBoundingBoxDescent));
  const blockH = asc + (cap.lines.length - 1) * CAPTION_LH + desc;
  const top = CAPTION_TOP + CAPTION_PAD + (CAPTION_BOTTOM - CAPTION_TOP - 2 * CAPTION_PAD - blockH) / 2;
  return cap.lines.map((s, i) => ({ text: s, baseline: top + asc + i * CAPTION_LH }));
}
function drawCaption(ctx, t) {
  const cap = CAPS.find((c) => t >= c.t0 && t < c.tEnd); if (!cap) return;
  const a = clamp((t - cap.t0) / 0.1) * clamp((cap.tEnd - t) / 0.12);
  for (const L of captionLayout(ctx, cap)) text(ctx, L.text, CAPTION_CX, L.baseline, { size: CAPTION_SIZE, font: 'InterSB', alpha: a });
}

// ---- CTA — the accepted English end card, unchanged ----
function cta(ctx, t) {
  const lk = back(ev(t, CTA_AT + 0.05, 0.5));
  if (lk > 0) {
    const h = 300 * lk, w = h * 200 / 260;
    shadow(ctx, 540, 1020, 120 * lk, 18, 0.5);
    ctx.save(); ctx.globalAlpha = clamp(lk); ctx.drawImage(LOGO, 540 - w / 2, 690 + (300 - h), w, h); ctx.restore();
  }
  const size = 128, w1 = textW(ctx, 'Tensor', size, 'IDXB', -2), w2 = textW(ctx, 'blue', size, 'IDXB', -2);
  const x0 = 540 - (w1 + w2) / 2;
  kword(ctx, 'Tensor', x0, 1160, size, t, T.tb - 0.1, { align: 'left' });
  kword(ctx, 'blue', x0 + w1, 1160, size, t, T.tb - 0.02, { align: 'left', color: C.blue });
  kword(ctx, 'software explained simply', 540, 1250, 50, t, T.tb + 0.5, { font: 'IDB', color: C.gray });
  const fk = back(ev(t, T.follow - 0.05, 0.35));
  if (fk > 0) {
    ctx.save(); ctx.translate(540, 1370); ctx.scale(fk, fk); ctx.translate(-540, -1370);
    ctx.fillStyle = C.blue; rr(ctx, 540 - 150, 1370 - 50, 300, 100, 50); ctx.fill();
    text(ctx, 'Follow', 540, 1388, { size: 50, font: 'IDXB' });
    ctx.restore();
  }
}

// ---- SFX ----
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.0, 'blip', { hi: true }); add(T.tunnel - 0.05, 'drop');
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(T.guessing - 0.3, 'slide'); add(T.guessing + 0.2, 'pop');
  add(T.dead - 0.08, 'type'); add(T.map4 - 0.08, 'type'); add(T.waze - 0.1, 'type'); add(T.grow - 0.08, 'type');
  // straight guess hits the wall (first moment it is clearly off the road)
  for (let t = SHOTS[SH.dr]; t < SHOTS[SH.mm]; t += 1 / 30) { const r = rowAt(SIMMAP[SH.dr](t)); if (r.est) { const [x, y] = r.est.straight; const off = Math.min(...RD.map(([a, b]) => Math.hypot(a - x, b - y))); if (off > 12) { add(t, 'reject'); break; } } }
  add(T.road - 0.1, 'slot');                                                                             // snapped onto the road
  for (let t = SHOTS[SH.drift]; t < SHOTS[SH.beacons]; t += 1 / 30) { const r = rowAt(SIMMAP[SH.drift](t)); if (r.braking) { add(t, 'slide', { soft: true }); break; } }
  add(SNAP5, 'match');                                                                                  // GPS back: snap
  SIM.beacon_hits_t.forEach((ht) => { const tv = SHOTS[SH.beacons] + (ht - 5.5) / 10.4; if (tv > SHOTS[SH.beacons] && tv < SHOTS[SH.payoff]) add(tv, 'hop', { hi: true }); });
  add(T.snap + 0.05, 'match'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e.sort((a, b) => a.t - b.t);
}

// ---- frame ----
const STAGE_TOP = 480, WIPE = 0.5;
export { STAGE_TOP };
const bg = makeBackground();
function wipeBetween(ctx, t, tw, drawA, drawB) {
  const k = (t - (tw - WIPE / 2)) / WIPE;
  if (k < 0) { drawA(); return; }
  if (k >= 1) { drawB(); return; }
  const e = ease(k), band = 220, edge = lerp(H + band, STAGE_TOP - band, e);
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, Math.max(0, edge - STAGE_TOP)); ctx.clip(); drawA(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, edge + band, W, H); ctx.clip(); drawB(); ctx.restore();
  ctx.fillStyle = C.blue; ctx.fillRect(0, edge, W, band);
}
function scene(ctx, t) {
  const info = world(ctx, t);
  const i = info.i;
  // the phone map in the foreground: hook and payoff only (it shows only what an app shows: road, dot, accuracy circle)
  if (i === SH.hook || i === SH.guess || i === SH.payoff) {
    const k = i === SH.hook ? 1 : i === SH.guess ? 1 - ev(t, T.guessing - 0.3, 0.45) : ev(t, SHOTS[SH.payoff] + 0.05, 0.4);
    const r = info.r, e = estimateFor(SH.mm, r), on = true;
    const unc = r.est && r.tunnel ? r.unc : 4;
    phoneFG(ctx, t, { xy: e.xy, head: (headAt(e.s ?? r.s) * 180) / Math.PI, unc, on }, k, i === SH.payoff ? 1 : 0);
  }
  headlines(ctx, t, info);
}
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  if (t < CTA_AT - WIPE / 2) scene(ctx, t);
  else wipeBetween(ctx, t, CTA_AT, () => scene(ctx, t), () => cta(ctx, t));
  ctx.restore();
  if (!process.env.NO_CAPTION) drawCaption(ctx, t);
}

// ---- thumbnail: frame zero + the wordmark ----
export function drawThumbnail(ctx) {
  const prev = process.env.NO_CAPTION; process.env.NO_CAPTION = '1';
  drawFrame(ctx, 0);
  if (prev === undefined) delete process.env.NO_CAPTION; else process.env.NO_CAPTION = prev;
  const wT = textW(ctx, 'Tensor', 48, 'IDXB'), wB = textW(ctx, 'blue', 48, 'IDXB'), x0 = 540 - (54 + 16 + wT + wB) / 2;
  ctx.drawImage(LOGO, x0, 330, 54, 70);
  text(ctx, 'Tensor', x0 + 70, 382, { size: 48, font: 'IDXB', align: 'left' });
  text(ctx, 'blue', x0 + 70 + wT, 382, { size: 48, font: 'IDXB', color: C.blue, align: 'left' });
}
