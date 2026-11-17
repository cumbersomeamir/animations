// Meshline production 30s, batch 2026-11-15-english-18: "Why a route that worked a minute ago can fail now".
// Same Transit-Map world as english-06..17 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). A route you -> A -> bridge -> C -> friend breaks when
// the bridge phone walks away: hellos stop arriving (RFC 3561 6.9: link presumed lost after ALLOWED_HELLO_LOSS x
// HELLO_INTERVAL = 2 x 1 s), the route goes stale and a route error is reported back (RERR), then a route request spreads
// (RREQ) and a reply returns along a fresh path (RREP). Generic mesh principle (AODV as one documented design); no Meshline
// routing, relay or delivery claims (listing facts only in the CTA).
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

// ------------------------------------------------------------------ the mesh: you (S) → A → bridge (B) → C → friend (D); alternative via E, F
const P = { S: [2.6, 16.0], A: [6.0, 13.6], B: [9.4, 12.6], C: [12.8, 14.0], D: [15.2, 16.6], E: [6.4, 18.6], F: [11.4, 19.0] };
const RANGE = 5.1, B_HOME = [9.4, 12.6], B_AWAY = [9.9, 8.7], B_MID = [9.6, 10.6];
const OLD = ['S', 'A', 'B', 'C', 'D'], NEW = ['S', 'E', 'F', 'D'];
const T = {
  rewind: [4.6, 5.3], ago: 5.4, move: [6.9, 8.4], hello0: 8.6, miss: 11.4, lost: 12.9,
  stale: 15.0, rerr: [16.4, 17.1], rreq: 18.7, rrep: [20.4, 21.9], fresh: 21.7,
  msg: [23.3, 24.5], snap: 23.8, cta: 25.84,
};
function posB(t) {
  if (t < T.rewind[0]) return [lerp(B_MID[0], B_AWAY[0], ease.inOut(inv(0, 4.2, t))), lerp(B_MID[1], B_AWAY[1], ease.inOut(inv(0, 4.2, t)))];
  if (t < T.move[0]) { const k = ease.inOut(inv(...T.rewind, t)); return [lerp(B_AWAY[0], B_HOME[0], k), lerp(B_AWAY[1], B_HOME[1], k)]; }
  const k = ease.inOut(inv(...T.move, t)); return [lerp(B_HOME[0], B_AWAY[0], k), lerp(B_HOME[1], B_AWAY[1], k)];
}
const pos = (n, t) => (n === 'B' ? posB(t) : P[n]);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const linked = (a, b, t) => dist(pos(a, t), pos(b, t)) <= RANGE;
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 14.2, z: 1.06 }], [4.3, { x: 9.0, y: 14.2, z: 1.09 }],             // hook: the bridge walked away
    [4.7, { x: 9.0, y: 14.4, z: 1.05 }], [8.3, { x: 9.0, y: 14.4, z: 1.07 }],           // a route is a chain; phones move
    [8.8, { x: 8.8, y: 13.2, z: 1.16 }], [14.2, { x: 8.8, y: 13.2, z: 1.19 }],          // hellos missed → link lost
    [14.6, { x: 9.0, y: 14.4, z: 1.05 }], [25.6, { x: 9.0, y: 14.4, z: 1.08 }],         // stale, report, rediscover, snapshot
    [30, { x: 9.0, y: 14.6, z: 1.22 }],                                                    // CTA: slow push under the veil
  ]);
}

// ------------------------------------------------------------------ glyphs
function device(ctx, p, a = 1, lit = 0, col = C.blueSoft) {
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 0.7 * G, h = 1.16 * G;
  ctx.save(); ctx.globalAlpha *= a;
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 1.3 * G); g.addColorStop(0, hexA(col, 0.5 * lit)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 1.3 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 5, w, h, 0.12 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.12 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.06 * G, y - h / 2 + 0.11 * G, w - 0.12 * G, h - 0.22 * G, 0.05 * G); ctx.fill();
  ctx.restore();
}
const pathPts = (names, t) => names.map(n => pos(n, t));

// ------------------------------------------------------------------ scene
function drawScene(ctx, t) {
  const v = veil(t);
  // all radio links currently in range (faint printed rails)
  const names = Object.keys(P);
  ctx.save(); ctx.globalAlpha *= 1 - v * 0.6;
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) if (linked(names[i], names[j], t)) strokePath(ctx, [pos(names[i], t), pos(names[j], t)], 99, 0.06 * G, hexA(C.blueSoft, 0.26), false);
  ctx.restore();
  // the old route S-A-B-C-D: solid while it works; broken/stale once the bridge leaves
  const working = t >= T.rewind[1] && t < T.move[0] + 0.6;
  const staleA = env(t, T.stale - 0.1, T.stale + 0.3);
  const oldPts = pathPts(OLD, t);
  if (working) { strokePath(ctx, oldPts, len(oldPts), 0.26 * G, C.blue); }
  else {
    // the A–B segment snaps (coral gap); the rest fades to a grey dashed "stale" ghost
    ctx.save(); ctx.globalAlpha *= (1 - v) * (t < 4.4 || t > T.move[0] ? 1 : 0);
    const segs = [[0, 1], [2, 3], [3, 4]];
    for (const [i, j] of segs) strokePath(ctx, [oldPts[i], oldPts[j]], 99, (0.2 - 0.08 * staleA) * G, staleA > 0.5 ? hexA(C.ink, 0.35) : hexA(C.blue, 0.85 - 0.5 * staleA), false, staleA > 0.5 ? [12, 10] : null);
    const ab = [oldPts[1], oldPts[2]], cut = env(t, T.lost - 0.1, T.lost + 0.2) + (t < 4.4 ? 1 : 0);
    strokePath(ctx, ab, len(ab), 0.14 * G, hexA(C.coral, 0.85 * Math.max(0.35, cut)), false, [10, 10]);
    if (cut > 0.01) cross(ctx, [(ab[0][0] + ab[1][0]) / 2, (ab[0][1] + ab[1][1]) / 2], 0.3, Math.min(1, cut));
    ctx.restore();
  }
  // footsteps behind the walking bridge
  const walking = (t < 4.2) || (t > T.move[0] && t < T.move[1] + 0.3);
  if (walking || t < 4.4) { const b = posB(t); for (let k = 1; k <= 5; k++) { const q = Math.max(0, t - k * 0.25), pb = posB(t < 4.4 ? Math.max(0, t - k * 0.25) : Math.max(T.move[0], q)); ctx.fillStyle = hexA(C.ink, 0.25 * (1 - k / 6)); ctx.beginPath(); ctx.ellipse(pb[0] * G + (k % 2 ? 6 : -6), (pb[1] + 0.75) * G, 5, 3, 0, 0, TAU); ctx.fill(); } void b; }
  // l3: hello pulses every second; the bridge's hellos no longer reach A
  const ha = env(t, T.hello0 - 0.3, T.hello0) * (1 - env(t, 14.3, 14.6));
  if (ha > 0) for (const n of ['A', 'B']) {
    const c = pos(n, t), ph = ((t - T.hello0) % 1 + 1) % 1, r = (0.6 + RANGE * ph) * G;
    ctx.strokeStyle = hexA(n === 'B' ? C.coral : C.blueSoft, 0.55 * (1 - ph) * ha); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c[0] * G, c[1] * G, r, 0, TAU); ctx.stroke();
  }
  label(ctx, 'hello?', pos('A', t)[0] - 0.2, pos('A', t)[1] - 1.25, 0.6, C.ink, 'center', 'EBold', ha * (1 - env(t, T.miss - 0.2, T.miss)));
  label(ctx, '2 missed', pos('A', t)[0] - 0.2, pos('A', t)[1] - 1.25, 0.62, C.coral, 'center', 'EBold', ha * env(t, T.miss, T.miss + 0.25) * (1 - env(t, T.lost - 0.2, T.lost)));
  label(ctx, 'link lost', pos('A', t)[0] - 0.2, pos('A', t)[1] - 1.25, 0.66, C.coral, 'center', 'EBold', ha * env(t, T.lost, T.lost + 0.2));
  // l4: stale route + route error reported back to you
  label(ctx, 'stale', 11.2, 15.4, 0.7, GREY, 'center', 'EBold', staleA * (1 - env(t, 18.2, 18.5)));
  if (t > T.rerr[0] && t < T.rerr[1] + 0.3) { const q = ease.inOut(inv(...T.rerr, t)), a = pos('A', t), s = pos('S', t); envelope(ctx, lerp(a[0], s[0], q) * G, lerp(a[1], s[1], q) * G, 0.62 * G, 1 - clamp((t - T.rerr[1]) / 0.3), C.coral); }
  label(ctx, 'break reported', 4.3, 12.2, 0.6, C.coral, 'center', 'EBold', env(t, T.rerr[0], T.rerr[0] + 0.2) * (1 - env(t, 18.1, 18.4)));
  // l5: a route request spreads ring by ring; the reply returns along a fresh path
  const RQ = [['S', 0], ['A', 0.5], ['E', 0.5], ['C', 1.0], ['F', 1.0], ['D', 1.45]];
  const qa = env(t, T.rreq - 0.1, T.rreq + 0.1) * (1 - env(t, 21.6, 22.0));
  if (qa > 0) for (const [n, d] of RQ) { const k = (t - T.rreq - d) / 0.7; if (k < 0 || k > 1) continue; const c = pos(n, t); ctx.strokeStyle = hexA(C.blueSoft, 0.95 * (1 - k) * qa); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(c[0] * G, c[1] * G, (0.5 + 3.4 * k) * G, 0, TAU); ctx.stroke(); }
  label(ctx, 'route request', 9.0, 20.15, 0.66, C.blueSoft, 'center', 'EBold', env(t, T.rreq + 0.4, T.rreq + 0.7) * (1 - env(t, T.rrep[0] - 0.2, T.rrep[0])));
  if (t > T.rrep[0] && t < T.rrep[1] + 0.3) { const back = pathPts([...NEW].reverse(), t), q = ease.inOut(inv(...T.rrep, t)), p = at(back, len(back) * q); envelope(ctx, p[0] * G, p[1] * G, 0.62 * G, 1 - clamp((t - T.rrep[1]) / 0.3)); }
  label(ctx, 'reply', 9.0, 20.15, 0.66, C.blueSoft, 'center', 'EBold', env(t, T.rrep[0], T.rrep[0] + 0.2) * (1 - env(t, T.fresh - 0.1, T.fresh + 0.1)));
  const nk = ease.inOut(inv(T.fresh - 0.2, T.fresh + 0.7, t)), newPts = pathPts(NEW, t);
  if (nk > 0) { ctx.save(); ctx.globalAlpha *= 1 - v * 0.6; strokePath(ctx, newPts, len(newPts) * nk, 0.26 * G, C.blue); ctx.restore(); if (nk < 1) penTip(ctx, at(newPts, len(newPts) * nk)); }
  label(ctx, 'fresh path', 9.0, 20.15, 0.7, C.blueSoft, 'center', 'EBold', env(t, T.fresh, T.fresh + 0.25) * (1 - env(t, T.snap - 0.2, T.snap)));
  // l6: the message flows on the new route; old vs new labelled as snapshots in time
  if (t > T.msg[0] && t < T.msg[1] + 0.3) { const q = ease.inOut(inv(...T.msg, t)), p = at(newPts, len(newPts) * q); envelope(ctx, p[0] * G, p[1] * G, 0.62 * G, 1 - clamp((t - T.msg[1]) / 0.3)); }
  check(ctx, (P.D[0] + 0.1) * G, (P.D[1] - 1.15) * G, 0.55 * G, C.blueSoft, env(t, T.msg[1], T.msg[1] + 0.2) * (1 - v));
  label(ctx, 'a minute ago', 11.2, 15.4, 0.6, GREY, 'center', 'EBold', env(t, T.snap, T.snap + 0.25) * (1 - v));
  label(ctx, 'now', 9.0, 20.15, 0.75, C.blueSoft, 'center', 'EBold', env(t, T.snap, T.snap + 0.25) * (1 - v));
  // hook + rewind beats: stuck message at you; "a minute ago" clock during the rewind
  if (t < 4.3) { const bob = Math.abs(Math.sin(t * 5)) * 0.25, s = P.S, a = 1 - env(t, 4.0, 4.3), ex = (s[0] + 1.05 + bob) * G, ey = (s[1] - 0.95) * G, es = 0.9 * G; envelope(ctx, ex, ey, es, a, C.coral); ctx.save(); ctx.globalAlpha *= a * 0.75; ctx.fillStyle = C.coral; roundRect(ctx, ex - es / 2, ey - es * 0.34, es, es * 0.68, es * 0.08); ctx.fill(); ctx.restore(); }
  label(ctx, 'stuck', P.S[0] + 1.0, P.S[1] - 1.8, 0.66, C.coral, 'center', 'EBold', clamp((t - 1.9) / 0.2) * (1 - env(t, 4.0, 4.3)));
  label(ctx, 'a minute ago', 9.0, 20.15, 0.7, GREY, 'center', 'EBold', env(t, T.rewind[0], T.rewind[0] + 0.2) * (1 - env(t, T.move[0] - 0.2, T.move[0])));
  label(ctx, 'phones move', 9.0, 20.15, 0.7, C.ink, 'center', 'EBold', env(t, T.move[0], T.move[0] + 0.2) * (1 - env(t, 8.5, 8.8)));
  // devices + essential labels (enlarged)
  const lit = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  if (t < 4.3) lit.B = 1.0;
  for (const n of names) device(ctx, pos(n, t), 1, (lit[n] + (n === 'B' && ha > 0 ? 0.6 : 0)) * (1 - v), n === 'B' ? C.coral : C.blueSoft);
  label(ctx, 'you', P.S[0], P.S[1] + 1.05, 0.62, C.ink, 'center', 'EBold', 1 - v);
  label(ctx, 'friend', P.D[0], P.D[1] + 1.05, 0.62, C.ink, 'center', 'EBold', 1 - v);
  const bb = posB(t); label(ctx, 'bridge', bb[0] + 0.85, bb[1] - 0.15, 0.62, C.coral, 'left', 'EBold', 1 - v);
}

// ------------------------------------------------------------------ screen-space instrument: your route to the friend (one readout per beat)
function drawInstrument(ctx, t) {
  const A = 1 - env(t, T.cta - 0.3, T.cta + 0.15);
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY;
  let head = 'route to your friend', main = 'stuck', col = C.coral;
  if (t >= T.rewind[0] && t < T.move[1]) { main = 'you → A → bridge → C → friend'; col = C.blueSoft; }
  if (t >= T.move[1]) { head = 'hellos from the bridge'; main = ''; col = C.ink; }
  if (t >= T.stale) { head = 'route to your friend'; main = 'stale'; col = GREY; }
  if (t >= T.rreq) { main = 'searching…'; col = C.blueSoft; }
  if (t >= T.fresh) { main = 'you → E → F → friend'; col = C.blueSoft; }
  ctx.fillText(head, 132, 1460);
  if (main) { ctx.font = '40px EBold'; ctx.fillStyle = col; ctx.fillText(main, 132, 1522); }
  if (t >= T.move[1] && t < T.stale) {                                       // hello slots: heard before the bridge left, then missed
    [0, 1].forEach(i => check(ctx, 160 + i * 110, 1522, 36, C.blueSoft));
    if (t >= 9.9) cross(ctx, [(160 + 2 * 110) / G, 1522 / G], 0.24, 1);
    if (t >= T.miss) cross(ctx, [(160 + 3 * 110) / G, 1522 / G], 0.24, 1);
    if (t >= T.lost) { ctx.font = '40px EBold'; ctx.fillStyle = C.coral; ctx.fillText('link lost', 600, 1522); }
  }
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
  if (big) { line('THE BRIDGE', 360, C.ink, 118); line('WALKED AWAY', 495, C.coral, 112); }
  else { line('THE BRIDGE', 390, C.ink, 96); line('WALKED AWAY', 488, C.coral, 92); }
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
  for (let i = 0; i < 8; i++) add(0.1 + i * 0.5, 'dots', 0.12, { dur: 0.2 });
  add(1.9, 'retry', 0.16);
  add(T.rewind[0], 'sweep', 0.14, { dur: 0.7 }); add(T.rewind[1], 'land', 0.2); add(T.move[0], 'dots', 0.4, { dur: T.move[1] - T.move[0] });
  for (let i = 0; i < 5; i++) add(T.hello0 + i, 'tick', 0.14); add(9.9, 'fizz', 0.14); add(T.miss, 'fizz', 0.16); add(T.lost, 'offline', 0.2); add(T.lost + 0.05, 'stamp', 0.18);
  add(T.stale, 'click', 0.14); add(T.rerr[0], 'zip', 0.16); add(T.rerr[1], 'stop', 0.16);
  [0, 0.5, 1.0, 1.45].forEach(d => add(T.rreq + d, 'pen', 0.12, { dur: 0.4 })); add(T.rrep[0], 'zip', 0.18); add(T.rrep[1], 'stop', 0.2); add(T.fresh, 'pen', 0.2, { dur: 0.9 });
  add(T.msg[0], 'zip', 0.18); add(T.msg[1], 'relay', 0.2);
  add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
