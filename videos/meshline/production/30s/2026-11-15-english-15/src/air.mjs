// Meshline production 30s, batch 2026-11-15-english-15: "One channel, many routers: who talks next?".
// Same Transit-Map world as english-06..14 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). A building of 15 Wi-Fi routers on ONE channel:
// two transmit together and scramble; listen-before-talk with a random backoff count; the lowest goes first while the
// others freeze; equal picks collide and the contention window doubles (ETSI EN 301 893 V2.2.1: q uniform in 0..CW,
// CW = min(CW x 2 + 1, CWmax) on failure; EN 300 328 LBT at 2.4 GHz). The building's internet line is not the
// bottleneck; channels are lanes (Apple router guide), and 5 GHz has far more spectrum. No Meshline transport claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 40 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
CAPS[0].a = Math.max(CAPS[0].a, 0.55);                                       // the frame-zero title words hand over to the first caption
const SCREEN_CY = 1000, CAP_CX = 500;                                      // captions centred in x 100..900 (2026-11-11 brief)
const GREY = '#B5BDB8';
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

// ------------------------------------------------------------------ cached sheet (same stock/tooth/grid/light as batch-02)
let SHEET_IMG = null;
function sheetImage() {
  if (SHEET_IMG) return SHEET_IMG;
  const s = 2, cv = createCanvas(SHEET.w * G * s, SHEET.h * G * s), c = cv.getContext('2d'); c.scale(s, s);
  const w = SHEET.w * G, h = SHEET.h * G;
  c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = hexA(C.ink, 0.01 + 0.025 * hash(i * 3.7)); c.fillRect(hash(i * 1.3) * w, hash(i * 2.9) * h, 1.5, 1.5); }
  c.strokeStyle = hexA(C.ink, 0.03); c.lineWidth = 0.8;
  for (let i = 0; i < 900; i++) { const x = hash(i * 5.1) * w, y = hash(i * 7.3) * h, a = hash(i) * TAU, l = 1.5 + hash(i * 2.2) * 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  c.strokeStyle = hexA(C.blueSoft, 0.05); c.lineWidth = 1;
  for (let x = 1; x < SHEET.w; x++) { c.beginPath(); c.moveTo(x * G, 0); c.lineTo(x * G, h); c.stroke(); }
  for (let y = 1; y < SHEET.h; y++) { c.beginPath(); c.moveTo(0, y * G); c.lineTo(w, y * G); c.stroke(); }
  const lg = c.createLinearGradient(0, 0, w, h); lg.addColorStop(0, 'rgba(247,247,242,0.05)'); lg.addColorStop(1, 'rgba(0,0,0,0.12)'); c.fillStyle = lg; c.fillRect(0, 0, w, h);
  SHEET_IMG = cv; return cv;
}

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / english-06..11)
function strokePath(ctx, pts, d, width, col, shadow = true, dash = null) {
  const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0] * G, pts[0][1] * G); let rem = d; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (rem >= L) { ctx.lineTo(pts[i][0] * G, pts[i][1] * G); rem -= L; } else { const p = at(pts, d); ctx.lineTo(p[0] * G, p[1] * G); break; } } };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  if (shadow) { path(); ctx.save(); ctx.translate(3, 5); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = width; ctx.stroke(); ctx.restore(); }
  path(); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.stroke(); ctx.setLineDash([]);
}
function penTip(ctx, p, col = C.blueSoft) {
  const g = ctx.createRadialGradient(p[0] * G, p[1] * G, 0, p[0] * G, p[1] * G, 0.8 * G); g.addColorStop(0, hexA(col, 0.45)); g.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.8 * G, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.blue; ctx.lineWidth = 0.05 * G; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.11 * G, 0, TAU); ctx.fill(); ctx.stroke();
}
function label(ctx, txt, x, y, size, col = C.ink, align = 'left', font = 'EBold', alpha = 1) {
  if (alpha <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${size * G}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineWidth = 0.1 * G; ctx.strokeStyle = hexA(C.bg, 0.92); ctx.strokeText(txt, x * G, y * G); ctx.fillStyle = col; ctx.fillText(txt, x * G, y * G); ctx.restore();
}
function ring(ctx, p, age, col = C.blueSoft, maxR = 0.6) { if (age < 0 || age > 0.6) return; ctx.strokeStyle = hexA(col, 1 - age / 0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, (0.2 + maxR * age / 0.6) * G, 0, TAU); ctx.stroke(); }
function cross(ctx, p, s, a = 1) {
  if (a <= 0) return; const x = p[0] * G, y = p[1] * G, r = s * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineWidth = 0.1 * G; ctx.lineCap = 'round'; ctx.strokeStyle = C.coral;
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); ctx.restore();
}
function check(ctx, x, y, s, col, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.45, y); ctx.lineTo(x - s * 0.1, y + s * 0.35); ctx.lineTo(x + s * 0.5, y - s * 0.35); ctx.stroke(); ctx.restore();
}
function fizz(ctx, p, t, t0) {
  const k = t - t0; if (k < 0 || k > 0.6) return;
  ctx.strokeStyle = hexA(C.coral, 1 - k / 0.6); ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + hash(i + t0) * 0.6, d0 = (0.2 + k * 0.9) * G, d1 = d0 + 0.18 * G; ctx.beginPath(); ctx.moveTo(p[0] * G + Math.cos(a) * d0, p[1] * G + Math.sin(a) * d0); ctx.lineTo(p[0] * G + Math.cos(a) * d1, p[1] * G + Math.sin(a) * d1); ctx.stroke(); }
}
function envelope(ctx, x, y, s, a = 1, flap = C.blue) {                    // message token
  if (a <= 0) return; const w = s, h = s * 0.68;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 5, w, h, s * 0.08); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, s * 0.08); ctx.fill();
  ctx.strokeStyle = flap; ctx.lineWidth = Math.max(2, s * 0.08); ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - w / 2 + s * 0.08, y - h / 2 + s * 0.08); ctx.lineTo(x, y + h * 0.08); ctx.lineTo(x + w / 2 - s * 0.08, y - h / 2 + s * 0.08); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ the building: 3 x 5 flats, one router each, all on ONE channel
const BX = [2.6, 6.87, 11.13, 15.4], BY = [9.2, 11.84, 14.48, 17.12, 19.76, 22.4];
const ROUTERS = []; for (let f = 0; f < 5; f++) for (let c = 0; c < 3; c++) ROUTERS.push([(BX[c] + BX[c + 1]) / 2, BY[f] + 1.75]);
const RA = ROUTERS[6], RB = ROUTERS[7], RC = ROUTERS[8];                  // the middle floor: A, B, C
const T = {
  title: 0.6, one: 1.3, who: 2.55,
  tx2: [4.45, 5.3], scr: 5.75,
  listen: 7.9, pick: 9.6, cd0: 9.95, slot: 0.28,
  same: 12.4, clash: 13.6, dbl: 14.4, newpick: 15.2,
  many: 16.7, plan: 19.15,
  lanes: 21.3, quiet: 21.6, g5: 23.2, room: 24.4, cta: 25.84,
};
// l3 countdown: A=5, B=2, C=7. B reaches 0 first and transmits; A and C freeze while the air is busy, then resume.
const CD = { A: 5, B: 2, C: 7 };
const busy3 = [T.cd0 + CD.B * T.slot, T.cd0 + CD.B * T.slot + 0.75];
function counter(name, t) {
  if (t < T.pick || t > 12.0) return null;
  const n0 = CD[name], tB = busy3;
  let elapsed = Math.max(0, t - T.cd0); if (name !== 'B' && t > tB[0]) elapsed -= Math.min(t, tB[1]) - tB[0];
  const n = Math.max(0, n0 - Math.floor(elapsed / T.slot));
  const paused = name !== 'B' && t > tB[0] && t < tB[1];
  return { n, paused, done: name === 'B' && t >= tB[0] };
}
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const LANES_Y = 27.4, LANES_CY = 28.3;
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 16.0, z: 1.08 }], [3.8, { x: 9.0, y: 16.0, z: 1.11 }],            // hook: the whole building on one channel
    [4.3, { x: 6.87, y: 16.0, z: 1.55 }], [6.9, { x: 6.87, y: 16.0, z: 1.6 }],         // two talk at once
    [7.4, { x: 9.0, y: 16.0, z: 1.15 }], [16.1, { x: 9.0, y: 16.0, z: 1.18 }],         // listen, random slots, clash, double
    [16.6, { x: 9.0, y: 16.3, z: 1.01 }], [20.8, { x: 9.0, y: 16.3, z: 1.03 }],        // the whole building waits; internet fine
    [21.3, { x: 9.0, y: LANES_CY, z: 1.12 }], [25.7, { x: 9.0, y: LANES_CY, z: 1.14 }], // lanes: quieter channel, 5 GHz
    [30, { x: 9.0, y: LANES_CY, z: 1.16 }],
  ]);
}

// ------------------------------------------------------------------ props
function router(ctx, p, t, a = 1, lit = false) {
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 1.05 * G, h = 0.5 * G;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.07 * G; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w * 0.3, y - h / 2); ctx.lineTo(x - w * 0.36, y - h / 2 - 0.32 * G); ctx.moveTo(x + w * 0.3, y - h / 2); ctx.lineTo(x + w * 0.36, y - h / 2 - 0.32 * G); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 5, w, h, 0.12 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.12 * G); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = i === 2 && lit ? C.coral : C.blue; ctx.beginPath(); ctx.arc(x - 0.25 * G + i * 0.25 * G, y, 0.06 * G, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function ringsAt(ctx, p, t, a, phase = 0) {                                // coverage pulses (all the same channel colour)
  if (a <= 0.01) return;
  for (let k = 0; k < 2; k++) { const age = ((t + phase + k * 0.8) % 1.6) / 1.6; ctx.strokeStyle = hexA(C.blueSoft, (t < 4 ? 0.5 : 0.32) * (1 - age) * a); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, (0.6 + 2.4 * age) * G, 0, TAU); ctx.stroke(); }
}
function bubble(ctx, p, txt, col, a = 1, paused = false) {                 // countdown bubble above a router
  if (a <= 0.01) return; const x = p[0] * G, y = (p[1] - 1.25) * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${0.62 * G}px EBold`; const w = Math.max(0.95 * G, ctx.measureText(txt).width + 0.5 * G);
  roundRect(ctx, x - w / 2, y - 0.42 * G, w, 0.84 * G, 0.2 * G); ctx.fillStyle = 'rgba(10,14,12,0.94)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y + 0.03 * G);
  if (paused) { ctx.fillStyle = GREY; for (const dx of [-0.11, 0.11]) ctx.fillRect(x + w / 2 + 0.18 * G + dx * G - 0.05 * G, y - 0.22 * G, 0.1 * G, 0.44 * G); }
  ctx.restore();
}
// hook traffic: a deterministic burst of messages between flats; pairs that overlap in time collide mid-air
const HOOK = [];
for (let i = 0; i < 16; i++) { const a = Math.floor(hash(i * 3.7) * 15), b = (a + 1 + Math.floor(hash(i * 5.1) * 13)) % 15, t0 = -0.6 + i * 0.27 + hash(i * 1.9) * 0.15; HOOK.push({ a, b, t0, t1: t0 + 0.95, hit: i % 3 === 1 }); }

function drawScene(ctx, t) {
  const v = veil(t);
  // building outline, floors and flats
  const bA = 1 - env(t, 21.0, 21.4) * 0.92;
  ctx.save(); ctx.globalAlpha *= bA; ctx.strokeStyle = hexA(C.ink, 0.42); ctx.lineWidth = 0.09 * G;
  ctx.strokeRect(BX[0] * G, BY[0] * G, (BX[3] - BX[0]) * G, (BY[5] - BY[0]) * G);
  ctx.lineWidth = 0.04 * G; ctx.strokeStyle = hexA(C.ink, 0.22);
  for (let f = 1; f < 5; f++) { ctx.beginPath(); ctx.moveTo(BX[0] * G, BY[f] * G); ctx.lineTo(BX[3] * G, BY[f] * G); ctx.stroke(); }
  for (let c = 1; c < 3; c++) { ctx.beginPath(); ctx.moveTo(BX[c] * G, BY[0] * G); ctx.lineTo(BX[c] * G, BY[5] * G); ctx.stroke(); }
  ctx.restore();
  // the building's internet line (fibre to the street)
  const ia = env(t, T.plan - 0.3, T.plan) * (1 - env(t, 21.0, 21.4));
  const pipe = [[9.0, BY[5]], [9.0, BY[5] + 1.3], [16.6, BY[5] + 1.3]];
  if (ia > 0.01) { ctx.save(); ctx.globalAlpha *= ia; strokePath(ctx, pipe, len(pipe) * ease.out(clamp((t - T.plan + 0.3) / 0.5)), 0.34 * G, C.blue); ctx.restore(); }
  label(ctx, 'internet', 12.8, BY[5] + 2.25, 0.6, C.ink, 'center', 'EBold', ia);
  check(ctx, 15.3 * G, (BY[5] + 2.25) * G, 0.55 * G, C.blueSoft, ia);
  // all routers pulse on the same channel; the focus beats dim the rest
  const focus = env(t, 4.1, 4.4) * (1 - env(t, 16.3, 16.7));
  ROUTERS.forEach((p, i) => {
    const mid = i >= 6 && i <= 8, isAB = i === 6 || i === 7;
    const dimmed = focus * (t < 7.2 ? (isAB ? 0 : 0.8) : (mid ? 0 : 0.8));
    ringsAt(ctx, p, t, (1 - dimmed) * (1 - env(t, 21.0, 21.4)) * (1 - v), i * 0.37);
    router(ctx, p, t, (1 - dimmed * 0.85) * (1 - env(t, 21.0, 21.4) * 0.92), false);
  });
  label(ctx, '1 channel', 9.0, BY[0] - 0.7, 0.7, C.blueSoft, 'center', 'EBold', env(t, T.one - 0.1, T.one + 0.2) * (1 - env(t, 4.0, 4.3)));
  // hook: crossing messages; overlapping ones collide in mid-air
  if (t < 4.2) for (const m of HOOK) {
    if (t < m.t0 || t > m.t1 + 0.4) continue;
    const pa = ROUTERS[m.a], pb = ROUTERS[m.b], end = m.hit ? 0.55 : 1, q = Math.min(end, ease.inOut(inv(m.t0, m.t1, t)));
    const x = lerp(pa[0], pb[0], q), y = lerp(pa[1], pb[1], q), stopT = m.t0 + (m.t1 - m.t0) * 0.55;
    if (!(m.hit && t > stopT + 0.05)) envelope(ctx, x * G, y * G, 0.66 * G, (1 - clamp((t - m.t1) / 0.2)) * (1 - env(t, 3.8, 4.1)));
    if (m.hit) fizz(ctx, [lerp(pa[0], pb[0], 0.55), lerp(pa[1], pb[1], 0.55)], t, stopT);
  }
  // frame zero: two messages meet mid-air between neighbouring flats and scramble (coral burst), readable at phone size
  const hc = 1 - env(t, 1.0, 1.4);
  if (hc > 0.01) {
    const P1 = ROUTERS[3], P2 = ROUTERS[4], M = [(P1[0] + P2[0]) / 2, P1[1] - 0.05], q = 0.78 + 0.08 * Math.sin(t * 9);
    const g = ctx.createRadialGradient(M[0] * G, M[1] * G, 0, M[0] * G, M[1] * G, 1.5 * G); g.addColorStop(0, hexA(C.coral, 0.55 * hc)); g.addColorStop(1, hexA(C.coral, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(M[0] * G, M[1] * G, 1.5 * G, 0, TAU); ctx.fill();
    ctx.save(); ctx.globalAlpha *= hc; ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 10; i++) { const an = i / 10 * TAU + 0.2, r0 = (0.55 + 0.1 * Math.sin(t * 7 + i)) * G, r1 = r0 + 0.32 * G; ctx.beginPath(); ctx.moveTo(M[0] * G + Math.cos(an) * r0, M[1] * G + Math.sin(an) * r0); ctx.lineTo(M[0] * G + Math.cos(an) * r1, M[1] * G + Math.sin(an) * r1); ctx.stroke(); }
    ctx.restore();
    envelope(ctx, lerp(P1[0], M[0], q) * G, (M[1] - 0.05) * G, 0.7 * G, hc, C.coral); envelope(ctx, lerp(P2[0], M[0], q) * G, (M[1] + 0.05) * G, 0.7 * G, hc, C.coral);
  }
  label(ctx, '?', 14.2, BY[0] + 0.9, 1.0 * ease.outBack(clamp((t - T.who) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.who) / 0.2) * (1 - env(t, 3.9, 4.2)));
  // l2: A and B transmit together and the signals scramble between them
  if (t > T.tx2[0] - 0.1 && t < 7.2) {
    const k = ease.out(inv(...T.tx2, t)), mx = (RA[0] + RB[0]) / 2;
    for (const [p, dir] of [[RA, 1], [RB, -1]]) for (let j = 0; j < 3; j++) {
      const r = (0.5 + j * 0.5 + k * 1.6) * G; ctx.strokeStyle = hexA(t > T.scr - 0.3 ? C.coral : C.blueSoft, 0.8 * (1 - j * 0.25) * (1 - env(t, 6.6, 7.0)));
      ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, r, dir > 0 ? -0.6 : Math.PI - 0.6, dir > 0 ? 0.6 : Math.PI + 0.6); ctx.stroke();
    }
    fizz(ctx, [mx, RA[1]], t, T.scr - 0.25); fizz(ctx, [mx, RA[1] - 0.4], t, T.scr - 0.1);
    cross(ctx, [mx, RA[1] - 1.2], 0.32, env(t, T.scr - 0.2, T.scr) * (1 - env(t, 6.6, 7.0)));
    label(ctx, 'scrambled', mx, RA[1] + 1.25, 0.6, C.coral, 'center', 'EBold', env(t, T.scr - 0.1, T.scr + 0.15) * (1 - env(t, 6.6, 7.0)));
  }
  // l3: listen, then a random number of slots; the lowest goes first, the others freeze while the air is busy
  const l3a = env(t, 7.4, 7.7) * (1 - env(t, 16.2, 16.6));
  label(ctx, 'listen first', 9.0, BY[2] - 0.15, 0.6, C.ink, 'center', 'EBold', env(t, T.listen - 0.1, T.listen + 0.2) * (1 - env(t, T.pick - 0.2, T.pick)));
  if (l3a > 0 && t < 12.1) {
    for (const [name, p] of [['A', RA], ['B', RB], ['C', RC]]) {
      const c = counter(name, t); if (!c) continue;
      const a = env(t, T.pick, T.pick + 0.2) * (1 - env(t, 11.8, 12.1));
      if (c.done) bubble(ctx, p, 'GO', C.blueSoft, a); else bubble(ctx, p, String(c.n), c.paused ? GREY : C.ink, a, c.paused);
    }
    if (t > busy3[0] && t < busy3[1] + 0.3) { const q = ease.out(inv(busy3[0], busy3[1], t)); for (const dir of [-1, 1]) envelope(ctx, (RB[0] + dir * q * 3.4) * G, RB[1] * G, 0.55 * G, 1 - clamp((t - busy3[1]) / 0.3)); }
    label(ctx, 'wait', RA[0], RA[1] + 1.15, 0.55, GREY, 'center', 'EBold', env(t, busy3[0], busy3[0] + 0.15) * (1 - env(t, busy3[1], busy3[1] + 0.2)));
    label(ctx, 'wait', RC[0], RC[1] + 1.15, 0.55, GREY, 'center', 'EBold', env(t, busy3[0], busy3[0] + 0.15) * (1 - env(t, busy3[1], busy3[1] + 0.2)));
  }
  // l4: A and C pick the same number, reach zero together and clash; each doubles its waiting range
  if (t > 12.0 && t < 16.6) {
    const a = env(t, 12.1, 12.35) * (1 - env(t, 16.2, 16.6));
    const n = Math.max(0, 3 - Math.floor(Math.max(0, t - (T.clash - 3 * 0.3)) / 0.3));
    if (t < T.clash) { bubble(ctx, RA, String(n), C.ink, a); bubble(ctx, RC, String(n), C.ink, a); }
    label(ctx, 'same pick', 9.0, BY[2] - 0.15, 0.6, C.coral, 'center', 'EBold', env(t, T.same, T.same + 0.2) * (1 - env(t, T.clash - 0.1, T.clash + 0.1)));
    if (t >= T.clash && t < T.clash + 0.9) { const q = ease.out(inv(T.clash, T.clash + 0.5, t)); envelope(ctx, lerp(RA[0], 9.0, q) * G, RA[1] * G, 0.55 * G, 1 - clamp((t - T.clash - 0.5) / 0.2)); envelope(ctx, lerp(RC[0], 9.0, q) * G, RC[1] * G, 0.55 * G, 1 - clamp((t - T.clash - 0.5) / 0.2)); }
    fizz(ctx, [9.0, RA[1]], t, T.clash + 0.5); cross(ctx, [9.0, RA[1] - 1.1], 0.32, env(t, T.clash + 0.45, T.clash + 0.6) * (1 - env(t, T.dbl + 0.4, T.dbl + 0.8)));
    const dk = ease.inOut(inv(T.dbl, T.dbl + 0.6, t)), da = env(t, T.dbl - 0.1, T.dbl + 0.1) * a;
    for (const p of [RA, RC]) {
      const w0 = 1.6, w1 = 3.2, w = lerp(w0, w1, dk), y = p[1] + 1.2;
      ctx.save(); ctx.globalAlpha *= da; ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo((p[0] - w / 2) * G, y * G); ctx.lineTo((p[0] + w / 2) * G, y * G);
      for (const x of [p[0] - w / 2, p[0] + w / 2]) { ctx.moveTo(x * G, (y - 0.22) * G); ctx.lineTo(x * G, (y + 0.22) * G); } ctx.stroke(); ctx.restore();
      label(ctx, dk < 0.5 ? '0–15' : '0–31', p[0], y + 0.6, 0.55, C.blueSoft, 'center', 'EBold', da);
    }
    label(ctx, '×2 range', 9.0, RA[1] + 1.2, 0.6, C.blueSoft, 'center', 'EBold', da * env(t, T.dbl + 0.5, T.dbl + 0.7));
    const np = env(t, T.newpick, T.newpick + 0.2) * a; bubble(ctx, RA, '12', C.ink, np); bubble(ctx, RC, '27', C.ink, np);
  }
  // l5: the whole building waits its turn; the internet line is not the bottleneck
  if (t > 16.4 && t < 21.4) {
    const a = env(t, T.many - 0.2, T.many + 0.2) * (1 - env(t, 21.0, 21.4));
    ROUTERS.forEach((p, i) => { const n = 1 + Math.floor(hash(i * 7.7 + Math.floor((t - 16) * 3.6) * 0.0) * 30); const go = Math.floor((t - 16.4) * 1.4) % 15 === i; bubble(ctx, p, go ? 'GO' : String(n), go ? C.blueSoft : GREY, a, !go); });
    label(ctx, 'more waiting', 9.0, BY[0] - 0.75, 0.7, C.coral, 'center', 'EBold', a * env(t, 17.9, 18.2) * (1 - env(t, T.plan - 0.3, T.plan)));
    label(ctx, 'the air is busy', 9.0, BY[0] - 0.75, 0.7, C.coral, 'center', 'EBold', a * env(t, T.plan, T.plan + 0.3));
  }
  // l6: channels are lanes; 2.4 GHz has few, 5 GHz has many more; move to a quiet lane
  const la = env(t, 21.1, 21.5) * (1 - v * 0.6);
  if (la > 0) {
    const lane = (x0, x1, y, busy, a) => { ctx.save(); ctx.globalAlpha *= a; roundRect(ctx, x0 * G, (y - 0.32) * G, (x1 - x0) * G, 0.64 * G, 0.16 * G); ctx.fillStyle = 'rgba(10,14,12,0.9)'; ctx.fill(); ctx.strokeStyle = hexA(busy ? C.coral : C.blueSoft, 0.55); ctx.lineWidth = 2.5; ctx.stroke();
      if (busy) for (let i = 0; i < 6; i++) { const xx = x0 + 0.3 + ((i * 1.05 + t * 1.4) % (x1 - x0 - 0.6)); ctx.fillStyle = hexA(C.ink, 0.55); roundRect(ctx, xx * G, (y - 0.14) * G, 0.38 * G, 0.28 * G, 0.06 * G); ctx.fill(); }
      ctx.restore(); };
    const y24 = LANES_Y - 3.0, y5 = LANES_Y + 0.4;
    label(ctx, '2.4 GHz', 2.4, y24 - 1.0, 0.72, C.ink, 'left', 'EBold', la);
    for (let i = 0; i < 3; i++) lane(2.4, 15.6, y24 + i * 0.8, i !== 2 || t < T.quiet + 0.4, la);
    label(ctx, 'quieter', 15.6, y24 - 1.0, 0.62, C.blueSoft, 'right', 'EBold', la * env(t, T.quiet + 0.3, T.quiet + 0.6) * (1 - env(t, T.g5 - 0.3, T.g5)));
    const g5 = env(t, T.g5 - 0.2, T.g5 + 0.2) * la;
    label(ctx, '5 GHz', 2.4, y5 - 1.0, 0.72, C.ink, 'left', 'EBold', g5);
    for (let i = 0; i < 6; i++) lane(2.4, 15.6, y5 + i * 0.8, i === 1, g5 * clamp((t - T.g5 - i * 0.08) / 0.25));
    label(ctx, 'more room', 9.0, y5 + 5.35, 0.7, C.blueSoft, 'center', 'EBold', la * env(t, T.room - 0.1, T.room + 0.2));
    // a message that was stuck in a busy lane switches to a free one and flows
    const mk = ease.inOut(inv(T.g5 + 0.3, T.room + 0.6, t)), my = lerp(y24 + 0 * 0.8, y5 + 3 * 0.8, ease.inOut(inv(T.g5 + 0.3, T.g5 + 0.9, t)));
    if (t > T.quiet && t < T.cta + 0.4) envelope(ctx, lerp(3.4, 14.6, t < T.g5 + 0.3 ? 0.08 * Math.sin(t * 6) + 0.1 : mk) * G, (t < T.g5 + 0.3 ? y24 : my) * G, 0.55 * G, la * (1 - v));
  }
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(2.7 * G, 7.25 * G, 0.1 * G, 1.2 * G); ctx.restore();
  label(ctx, 'One channel', 3.0, 7.6, 0.5, C.ink, 'left', 'EBold', a);
  label(ctx, '15 routers', 3.0, 8.2, 0.34, GREY, 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument: the shared air-time lane (live)
const AIR = [];                                                           // [t0, t1, collision]
for (const m of HOOK) AIR.push([m.t0 + 0.1, m.t0 + 0.55, m.hit]);
AIR.push([T.tx2[0], T.scr, true], [busy3[0], busy3[1], false], [T.clash, T.clash + 0.5, true]);
for (let i = 0; i < 12; i++) { const s = 16.5 + i * 0.36 + hash(i * 2.3) * 0.08; AIR.push([s, s + 0.26, false]); }
function drawInstrument(ctx, t) {
  const A = (1 - env(t, 18.8, 19.1)) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('shared air time', 132, 1452);
  const X0 = 132, X1 = 940, Y = 1515, WIN = 3.0, px = s => X0 + (X1 - X0) * (1 - (t - s) / WIN);
  roundRect(ctx, X0, Y - 24, X1 - X0, 48, 12); ctx.strokeStyle = hexA(C.ink, 0.2); ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(X0, Y - 24, X1 - X0, 48); ctx.clip();
  let state = 'free';
  for (const [s, e, hit] of AIR) { if (s > t || e < t - WIN) continue; const x0 = Math.max(X0, px(s)), x1 = px(Math.min(e, t)); if (x1 - x0 < 1) continue; roundRect(ctx, x0, Y - 18, x1 - x0, 36, 8); ctx.fillStyle = hit ? hexA(C.coral, 0.9) : C.blue; ctx.fill(); if (s <= t && e >= t) state = hit ? 'collision' : 'busy'; }
  ctx.restore();
  ctx.fillStyle = C.ink; ctx.fillRect(X1 - 2, Y - 28, 3, 56);
  ctx.font = '30px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = state === 'collision' ? C.coral : state === 'busy' ? C.blueSoft : GREY; ctx.fillText(state, X1, 1452);
  ctx.restore();
}
// ------------------------------------------------------------------ captions (screen space; ink in y 350–470, x 100–900)
function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b) continue;
    const a = clamp((t - c.a) / 0.16) * (1 - clamp((t - (c.b - 0.14)) / 0.14));
    ctx.save(); ctx.globalAlpha = a; ctx.font = '52px EBold'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const w = Math.max(...c.l.map(s => ctx.measureText(s).width)) + 64;
    roundRect(ctx, CAP_CX - w / 2, 334, w, c.l.length > 1 ? 152 : 92, 22); ctx.fillStyle = 'rgba(8,12,10,0.86)'; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = C.ink;
    if (c.l.length === 1) ctx.fillText(c.l[0], CAP_CX, 398); else { ctx.fillText(c.l[0], CAP_CX, 398); ctx.fillText(c.l[1], CAP_CX, 458); }
    ctx.restore();
  }
}


// ------------------------------------------------------------------ frame
function drawWorld(ctx, t, cm) {
  const sc = cm.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  drawScene(ctx, t);
  const v = veil(t);                                                         // paper veil for the CTA
  if (v > 0) { ctx.fillStyle = hexA(C.bg, 0.7 * v); ctx.fillRect(0, 0, SHEET.w * G, SHEET.h * G); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
}
// frame-zero title: 4 truthful curiosity words in the caption band, handing over to the first caption at ~0.55 s
function drawTitle(ctx, a, big = false) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const line = (s, y, col, size) => { ctx.font = `${size}px EDisplay`; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(8,11,10,0.95)'; ctx.strokeText(s, 500, y); ctx.fillStyle = col; ctx.fillText(s, 500, y); };
  if (big) { line('SAME CHANNEL.', 360, C.ink, 100); line('WHO TALKS?', 490, C.coral, 120); }
  else { line('SAME CHANNEL.', 390, C.ink, 92); line('WHO TALKS?', 488, C.coral, 92); }
  ctx.restore();
}
export function drawFrame(ctx, t, assets) {
  drawWorld(ctx, t, cam(t));
  drawInstrument(ctx, t);
  drawTitle(ctx, 1 - env(t, 0.3, 0.55));
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '22px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not to scale · generic principle, not a product feature', 96, 1612);
  if (assets.icon) {                                                        // CTA signature: official icon + wordmark in the safe area
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 364, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 364, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 444, 1495); ctx.restore(); }
  }
}

// the separate thumbnail is the frame-zero composition (same words, same scene) plus the signature
export function drawThumb(ctx, assets) {
  drawWorld(ctx, 0.0, cam(0));
  drawTitle(ctx, 1, true);
  if (assets.icon) { ctx.save(); roundRect(ctx, 384, 1640, 72, 72, 16); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 384, 1640, 72, 72); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '50px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 472, 1677); ctx.restore(); }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  for (const m of HOOK) { if (m.t0 > 0 && m.t0 < 3.6) add(m.t0, 'zip', 0.08); if (m.hit) { const s = m.t0 + (m.t1 - m.t0) * 0.55; if (s > 0 && s < 3.8) add(s, 'fizz', 0.12); } }
  add(T.one, 'stamp', 0.18); add(T.who, 'retry', 0.14);
  add(T.tx2[0], 'zip', 0.18); add(T.tx2[0] + 0.05, 'zip', 0.16); add(T.scr - 0.25, 'fizz', 0.24); add(T.scr, 'offline', 0.16);
  add(T.listen, 'sweep', 0.12, { dur: 0.5 }); add(T.pick, 'click', 0.18);
  for (let i = 0; i < 9; i++) { const s = T.cd0 + i * T.slot; if (s < busy3[0] || s > busy3[1]) add(s, 'tick', 0.16); }
  add(busy3[0], 'zip', 0.2); add(busy3[1], 'stop', 0.18);
  add(T.same, 'click', 0.16); for (let i = 0; i < 3; i++) add(T.clash - 0.9 + i * 0.3, 'tick', 0.16); add(T.clash + 0.5, 'fizz', 0.24); add(T.dbl, 'sweep', 0.14, { dur: 0.6 }); add(T.newpick, 'click', 0.16);
  for (let i = 0; i < 8; i++) add(16.8 + i * 0.5, 'tick', 0.1); add(T.plan, 'relay', 0.18);
  add(T.lanes, 'sweep', 0.14, { dur: 0.5 }); add(T.g5, 'land', 0.2); add(T.g5 + 0.3, 'zip', 0.18); add(T.room + 0.6, 'stop', 0.2);
  add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
