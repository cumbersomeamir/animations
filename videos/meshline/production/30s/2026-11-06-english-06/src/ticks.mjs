// Meshline production 30s, batch 2026-11-06-english-06: "One tick, but not two: where is your message?" (sent vs delivered,
// and a direct nearby link that skips the server). Same Transit-Map world as the English batch-02 / store-and-forward /
// round-02 episodes (charcoal printed sheet, electric-blue ink, white stations, pen tips, paper veils, Inter labels,
// screen-space caption plate + one screen-space instrument). The map: YOUR PHONE → SERVER → THEIR PHONE as printed routes
// with envelope tokens; the instrument is a receipt tracker (clock / one tick / two ticks under your phone · server ·
// their phone). Generic messaging behaviour only; no Meshline protocol, range or delivery claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000;

// ------------------------------------------------------------------ map (G units, octilinear routes)
const YOU = [4.4, 20.8], FRIEND = [13.6, 20.8], NEAR = [6.9, 21.6], SERVER = [9.0, 12.4];
const UP = [[4.4, 20.0], [4.4, 16.6], [8.2, 12.8]], DOWN = [[9.8, 12.8], [13.6, 16.6], [13.6, 20.0]];
const CUT_F = [13.6, 18.3], CUT_Y = [4.4, 18.3], REACH = 3.1;
const T = {
  m1: [0.15, 0.85], friendOff: 1.0, stuck: 2.3,
  replay: [5.4, 7.3], serverHl: 7.2,
  friendOn: 8.9, m1down: [9.05, 9.85],
  friendOff2: 11.9, m2: [12.0, 12.75], held: 13.2, tries: [14.15, 14.75, 15.35],
  yourCut: 16.0, m3: 16.2, conn: 18.45,
  near: 20.3, dlink: [20.55, 21.05], dhop: [21.4, 22.1], reach: [23.5, 24.4], cta: 26.14,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const LU = len(UP), LD = len(DOWN);
const friendOn = t => clamp((t - T.friendOn) / 0.25) * (1 - clamp((t - T.friendOff2) / 0.25)) + (t < T.friendOff ? 1 - clamp((t - T.friendOff + 0.2) / 0.2) : 0);
const yourOn = t => 1 - clamp((t - T.yourCut) / 0.25) + clamp((t - T.near + 0.2) / 0.3);   // your connection drops for the clock beat only
// receipt state shown by the instrument: 0 = clock (still on your phone), 1 = one tick (server), 2 = two ticks (their phone), 3 = direct
function receipt(t) {
  if (t < T.m1[1]) return { s: 0, u: inv(...T.m1, t) };
  if (t < T.m1down[1]) return { s: 1, u: 0 };
  if (t < T.m2[0]) return { s: 2, u: 0 };
  if (t < T.m2[1]) return { s: 0, u: inv(...T.m2, t) };
  if (t < T.m3 - 0.1) return { s: 1, u: 0 };
  if (t < T.near + 0.2) return { s: 0, u: 0 };                         // hold the clock while the tracker fades out
  return { s: 3, u: 0 };
}

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const WIDE = { x: 8.8, y: 17.1, z: 0.98 };
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 15.8, z: 1.08 }], [3.3, { x: 9.0, y: 15.9, z: 1.1 }],
    [4.6, { x: 8.4, y: 16.0, z: 1.08 }], [8.0, { x: 8.4, y: 16.0, z: 1.1 }],          // along your route to the server
    [8.9, { x: 9.6, y: 16.0, z: 1.08 }], [10.8, { x: 9.6, y: 16.0, z: 1.1 }],       // server → their phone
    [11.6, { x: 10.0, y: 15.6, z: 1.1 }], [15.2, { x: 10.0, y: 15.7, z: 1.12 }],       // the server holds it
    [16.1, { x: 7.8, y: 17.4, z: 1.02 }], [19.6, { x: 7.8, y: 17.45, z: 1.04 }],        // clock: still on your phone
    [20.6, WIDE], [26.0, { x: 8.8, y: 17.0, z: 0.99 }], [30, { x: 8.6, y: 17.2, z: 1.03 }],
  ]);
}

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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / round-02)
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
function fizz(ctx, p, t, t0) {
  const k = t - t0; if (k < 0 || k > 0.6) return;
  ctx.strokeStyle = hexA(C.coral, 1 - k / 0.6); ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + hash(i + t0) * 0.6, d0 = (0.2 + k * 0.9) * G, d1 = d0 + 0.18 * G; ctx.beginPath(); ctx.moveTo(p[0] * G + Math.cos(a) * d0, p[1] * G + Math.sin(a) * d0); ctx.lineTo(p[0] * G + Math.cos(a) * d1, p[1] * G + Math.sin(a) * d1); ctx.stroke(); }
}
function ticks(ctx, x, y, n, s, col, a = 1) {                             // ✓ or ✓✓ drawn as strokes
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) { const ox = x + i * s * 0.42 - (n - 1) * s * 0.21; ctx.beginPath(); ctx.moveTo(ox - s * 0.42, y); ctx.lineTo(ox - s * 0.1, y + s * 0.32); ctx.lineTo(ox + s * 0.45, y - s * 0.34); ctx.stroke(); }
  ctx.restore();
}
function clockIcon(ctx, x, y, r, col, t, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); const an = -Math.PI / 2 + t * 2.4;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * r * 0.65, y + Math.sin(an) * r * 0.65); ctx.moveTo(x, y); ctx.lineTo(x, y - r * 0.45); ctx.stroke(); ctx.restore();
}
function envelope(ctx, p, s = 0.62, alpha = 1, col = C.ink) {
  const x = p[0] * G, y = p[1] * G, w = s * G, h = s * 0.68 * G;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, -w / 2 + 3, -h / 2 + 5, w, h, 4); ctx.fill();
  ctx.fillStyle = col; roundRect(ctx, -w / 2, -h / 2, w, h, 4); ctx.fill();
  ctx.strokeStyle = C.blue; ctx.lineWidth = Math.max(2, w * 0.07); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-w / 2 + 3, -h / 2 + 3); ctx.lineTo(0, h * 0.08); ctx.lineTo(w / 2 - 3, -h / 2 + 3); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ props (generic glyphs, no app UI)
function phone(ctx, p, on = 1, lit = 0, s = 1) {
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = on > 0.5 ? C.ink : '#8D9692'; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  const l = Math.max(lit, 0.35 * on); if (l > 0) { ctx.fillStyle = hexA(C.blue, 0.85 * l); roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill(); }
}
function server(ctx, p, lit = 0, dim = 0) {                              // white station block with server slots
  const x = p[0] * G, y = p[1] * G, w = 1.6 * G, h = 1.2 * G;
  ctx.save(); ctx.globalAlpha *= 1 - 0.65 * dim;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.2 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.2 * G); ctx.fill();
  ctx.strokeStyle = lit > 0 ? hexA(C.blue, 0.5 + 0.5 * lit) : C.charcoal; ctx.lineWidth = 0.08 * G; ctx.stroke();
  for (let i = 0; i < 3; i++) { const yy = y - h / 2 + (0.26 + i * 0.3) * G; ctx.fillStyle = '#C9D0CC'; roundRect(ctx, x - w / 2 + 0.18 * G, yy, w - 0.6 * G, 0.17 * G, 0.05 * G); ctx.fill(); ctx.fillStyle = i === 1 && lit > 0 ? C.blue : '#7E8884'; ctx.beginPath(); ctx.arc(x + w / 2 - 0.25 * G, yy + 0.085 * G, 0.06 * G, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// ------------------------------------------------------------------ beats
function drawRoutes(ctx, t) {
  const fo = clamp(friendOn(t)), yo = clamp(yourOn(t)), dim = env(t, T.dhop[0] - 0.3, T.dhop[0] + 0.2) * 0.7;
  const route = (pts, on, hl) => {
    ctx.save(); ctx.globalAlpha *= 1 - dim;
    if (on > 0) { ctx.save(); ctx.globalAlpha *= on; if (hl > 0) strokePath(ctx, pts, len(pts), 0.42 * G, hexA(C.blueSoft, 0.28 * hl), false); strokePath(ctx, pts, len(pts), 0.24 * G, C.blue); ctx.restore(); }
    if (on < 1) { ctx.save(); ctx.globalAlpha *= 1 - on; strokePath(ctx, pts, len(pts), 0.13 * G, hexA(C.coral, 0.7), false, [12, 12]); ctx.restore(); }
    ctx.restore();
  };
  const upHl = env(t, T.replay[0], T.replay[0] + 0.3) * (1 - env(t, 8.3, 8.7)), downHl = env(t, T.friendOn, T.friendOn + 0.3) * (1 - env(t, 10.9, 11.3));
  route(UP, yo, upHl); route(DOWN, fo, downHl);
  cross(ctx, CUT_F, 0.26, (1 - fo) * (1 - dim));
  cross(ctx, CUT_Y, 0.26, (1 - yo));
  label(ctx, 'offline', FRIEND[0], CUT_F[1] - 0.75 + 0.0, 0.42, C.coral, 'center', 'EBold', (1 - fo) * (1 - dim) * (t > 0.9 ? 1 : 0));
  label(ctx, 'your connection', CUT_Y[0] + 0.55, CUT_Y[1], 0.42, C.coral, 'left', 'EBold', env(t, T.conn - 0.2, T.conn + 0.2) * (1 - env(t, 19.9, 20.3)));
  label(ctx, 'internet route', 6.0, 14.4, 0.4, C.blueSoft, 'right', 'EBold', env(t, T.replay[0], T.replay[0] + 0.3) * (1 - env(t, 8.3, 8.7)));
  // the server
  const sLit = Math.max(clamp(1 - Math.abs(t - T.m1[1]) / 0.4), clamp(1 - Math.abs(t - T.m2[1]) / 0.4), env(t, T.serverHl, T.serverHl + 0.3) * (1 - env(t, 8.4, 8.8)), env(t, T.held, T.held + 0.3) * (1 - env(t, 15.4, 15.8)));
  server(ctx, SERVER, sLit, dim);
  label(ctx, 'server', SERVER[0], SERVER[1] - 1.0, 0.46, C.ink, 'center', 'EBold', 1 - dim);
  ring(ctx, SERVER, t - T.m1[1], C.blueSoft, 1.0); ring(ctx, SERVER, t - T.m2[1], C.blueSoft, 1.0);
  label(ctx, 'one tick = at the server', SERVER[0] - 1.05, SERVER[1] - 0.55, 0.42, C.blueSoft, 'right', 'EBold', env(t, T.serverHl, T.serverHl + 0.3) * (1 - env(t, 8.5, 8.9)));
  label(ctx, 'held · retrying', SERVER[0] + 1.1, SERVER[1] + 0.05, 0.44, C.ink, 'left', 'EBold', env(t, T.held, T.held + 0.3) * (1 - env(t, 15.4, 15.8)));
  label(ctx, '?', SERVER[0] + 1.25, SERVER[1] - 0.15, 0.85 * ease.outBack(clamp((t - T.stuck) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.stuck) / 0.25) * (1 - env(t, 3.6, 4.0)));
  // retries toward their phone fizzle at the offline cut
  for (const t0 of T.tries) { const q = inv(t0 - 0.45, t0, t); if (q > 0 && q < 1) { const p = at([DOWN[0], DOWN[1], CUT_F], len([DOWN[0], DOWN[1], CUT_F]) * ease.in(q)); ctx.fillStyle = hexA(C.ink, 0.9); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.12 * G, 0, TAU); ctx.fill(); } fizz(ctx, CUT_F, t, t0); }
}
function drawMessages(ctx, t) {
  // m1: up to the server (hook), parked while their phone is off, then down to their phone
  if (t < T.m1[1]) envelope(ctx, at(UP, LU * ease.inOut(inv(...T.m1, t))), 0.62);
  else if (t < T.m1down[0]) envelope(ctx, [SERVER[0], SERVER[1] - 0.05], 0.62);
  else if (t < T.m1down[1]) envelope(ctx, at(DOWN, LD * ease.inOut(inv(...T.m1down, t))), 0.62);
  else if (t < T.friendOff2 - 0.2) envelope(ctx, [FRIEND[0] + 0.75, FRIEND[1] - 0.2], 0.5, 1 - clamp((t - T.friendOff2 + 0.5) / 0.3));
  // replay ghost of the first leg (one tick = left your phone, reached the server)
  if (t > T.replay[0] && t < T.replay[1] + 0.2) envelope(ctx, at(UP, LU * ease.inOut(inv(...T.replay, t))), 0.55, 0.75 * (1 - clamp((t - T.replay[1]) / 0.2)));
  // m2: their phone is off → reaches the server and waits there
  if (t > T.m2[0] && t < T.m3) envelope(ctx, t < T.m2[1] ? at(UP, LU * ease.inOut(inv(...T.m2, t))) : [SERVER[0], SERVER[1] - 0.05], 0.62, 1 - clamp((t - T.m3 + 0.4) / 0.3));
  // m3: your connection is down → it stays on your phone with a clock
  if (t > T.m3 && t < T.near + 0.2) {
    const a = clamp((t - T.m3) / 0.25) * (1 - clamp((t - T.near) / 0.2));
    envelope(ctx, [YOU[0] + 0.85, YOU[1] - 0.75], 0.55, a);
    clockIcon(ctx, (YOU[0] + 1.45) * G, (YOU[1] - 1.2) * G, 0.22 * G, C.coral, t, a);
  }
  ring(ctx, FRIEND, t - T.m1down[1], C.blueSoft, 1.0);
}
function drawDirect(ctx, t) {
  const na = ease.outBack(clamp((t - T.near) / 0.35)); if (na <= 0) return;
  // limited range of the direct link (illustrative, not to scale)
  const rk = ease.out(inv(...T.reach, t));
  if (rk > 0) {
    const r = REACH * rk, g = ctx.createRadialGradient(YOU[0] * G, YOU[1] * G, 0, YOU[0] * G, YOU[1] * G, r * G);
    g.addColorStop(0, hexA(C.blue, 0.22)); g.addColorStop(0.8, hexA(C.blue, 0.08)); g.addColorStop(1, hexA(C.blue, 0.02));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(YOU[0] * G, YOU[1] * G, r * G, 0, TAU); ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.75); ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'limited range', YOU[0] - 1.25, YOU[1] - REACH - 0.15, 0.42, C.blueSoft, 'center', 'EBold', env(t, T.reach[0] + 0.3, T.reach[1]));
    for (let k = 0; k < 6; k++) { const s = T.reach[1] + k * 1.1, age = t - s; if (age > 0 && age < 1.0) { ctx.strokeStyle = hexA(C.blueSoft, 0.5 * (1 - age)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(YOU[0] * G, YOU[1] * G, (0.6 + (REACH - 0.6) * age) * G, 0, TAU); ctx.stroke(); } }
    label(ctx, 'out of range', FRIEND[0], FRIEND[1] + 1.55, 0.42, C.coral, 'center', 'EBold', env(t, T.reach[1] - 0.2, T.reach[1] + 0.2));
  }
  const a = [YOU[0] + 0.4, YOU[1] + 0.2], b = [NEAR[0] - 0.4, NEAR[1] - 0.1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), dk = ease.out(inv(...T.dlink, t));
  if (dk > 0) { strokePath(ctx, [a, b], L * dk, 0.14 * G, C.blueSoft, true, [14, 9]); if (dk < 1) penTip(ctx, at([a, b], L * dk)); }
  // a message hops straight to the nearby phone, then loops
  if (t > T.dhop[0]) {
    const u = t < T.dhop[1] ? inv(...T.dhop, t) : ((t - T.dhop[1]) / 1.6) % 1, k = ease.inOut(u), fade = t < T.dhop[1] ? 1 : Math.min(1, u / 0.12, (1 - u) / 0.12);
    const p = at([a, b], L * k); envelope(ctx, [p[0], p[1] - 0.45], 0.5, fade);
  }
  ring(ctx, NEAR, t - T.dhop[1], C.blueSoft, 0.8);
  ctx.save(); ctx.translate(NEAR[0] * G, NEAR[1] * G); ctx.scale(na, na); ctx.translate(-NEAR[0] * G, -NEAR[1] * G); phone(ctx, NEAR, 1, clamp(1 - Math.abs(t - T.dhop[1]) / 0.4)); ctx.restore();
  label(ctx, 'nearby phone', NEAR[0] + 0.5, NEAR[1] + 0.02, 0.4, C.ink, 'left', 'EBold', clamp(na));
}
function drawPhones(ctx, t) {
  phone(ctx, YOU, 1, clamp(1 - Math.abs(t - 0.2) / 0.3));
  label(ctx, 'your phone', YOU[0], YOU[1] + 0.95, 0.42, C.ink, 'center', 'EBold', 1);
  const fo = clamp(friendOn(t));
  phone(ctx, FRIEND, fo, clamp(1 - Math.abs(t - T.m1down[1]) / 0.4));
  label(ctx, 'their phone', FRIEND[0], FRIEND[1] + 0.95, 0.42, C.ink, 'center', 'EBold', 1);
  label(ctx, 'phone off', FRIEND[0] - 0.55, FRIEND[1] + 0.02, 0.4, C.coral, 'right', 'EBold', (1 - fo) * (t > 0.9 ? 1 : 0) * (1 - env(t, T.near - 0.3, T.near)));
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(2.6 * G, 10.4 * G, 0.1 * G, 1.25 * G); ctx.restore();
  label(ctx, 'Sent vs delivered', 2.9, 10.75, 0.5, C.ink, 'left', 'EBold', a);
  label(ctx, 'where is your message?', 2.9, 11.38, 0.36, '#B5BDB8', 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument: receipt tracker (above the bottom overlay zone)
function drawInstrument(ctx, t) {
  const a = env(t, 0.1, 0.4) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (a <= 0) return;
  const R = receipt(t), out = clamp((t - T.near) / 0.2), direct = clamp((t - T.near - 0.2) / 0.2);   // sequential swap, never overlapping
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  // chat bubble with its status glyph (generic, no app UI)
  roundRect(ctx, 122, 1452, 176, 84, 22); ctx.fillStyle = C.ink; ctx.fill();
  ctx.fillStyle = C.charcoal; ctx.font = '30px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Hi!', 144, 1486);
  const sx = 262, sy = 1514, col = '#5E6864';
  if (out < 1) {
    ctx.save(); ctx.globalAlpha *= 1 - out;
    if (R.s === 0) clockIcon(ctx, sx, sy, 9, t > T.m3 ? C.coral : col, t); else ticks(ctx, sx, sy, R.s === 1 ? 1 : 2, 20, col);
    ctx.restore();
  }
  // tracker: your phone — server — their phone; the active message sits at its stage
  const X = [440, 680, 900], Y = 1500;
  ctx.save(); ctx.globalAlpha *= 1 - out;
  ctx.strokeStyle = hexA(C.ink, 0.2); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X[0], Y); ctx.lineTo(X[2], Y); ctx.stroke();
  const pos = R.s === 0 ? lerp(X[0], X[1], ease.inOut(R.u)) : R.s === 1 ? X[1] : X[2];
  ctx.strokeStyle = C.blue; ctx.beginPath(); ctx.moveTo(X[0], Y); ctx.lineTo(pos, Y); ctx.stroke();
  ['your phone', 'server', 'their phone'].forEach((s, i) => {
    const reached = (i === 0) || (i === 1 && R.s >= 1) || (i === 2 && R.s === 2);
    ctx.fillStyle = reached ? C.ink : '#3A4440'; ctx.beginPath(); ctx.arc(X[i], Y, 11, 0, TAU); ctx.fill();
    ctx.fillStyle = hexA(C.ink, 0.85); ctx.font = '24px ESemi'; ctx.textAlign = 'center'; ctx.fillText(s, X[i], 1450);
  });
  clockIcon(ctx, X[0], 1543, 9, hexA(C.ink, 0.6), 0); ticks(ctx, X[1], 1543, 1, 18, hexA(C.ink, 0.6)); ticks(ctx, X[2], 1543, 2, 18, hexA(C.ink, 0.6));
  envelope(ctx, [pos / G, (Y - 26) / G], 0.42, 1);
  ctx.restore();
  // direct mode: your phone → nearby phone, no server stage
  if (direct > 0) {
    ctx.save(); ctx.globalAlpha *= direct;
    const D = [440, 900];
    ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 6; ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.moveTo(D[0], Y); ctx.lineTo(D[1], Y); ctx.stroke(); ctx.setLineDash([]);
    ['your phone', 'nearby phone'].forEach((s, i) => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(D[i], Y, 11, 0, TAU); ctx.fill(); ctx.fillStyle = hexA(C.ink, 0.85); ctx.font = '24px ESemi'; ctx.textAlign = 'center'; ctx.fillText(s, D[i], 1450); });
    ctx.fillStyle = C.blueSoft; ctx.font = '24px EBold'; ctx.fillText('no server · limited range', 670, 1545);
    ctx.restore();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ captions (screen space; ink in y 350–470, x 90–990)
function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b) continue;
    const a = clamp((t - c.a) / 0.16) * (1 - clamp((t - (c.b - 0.14)) / 0.14));
    ctx.save(); ctx.globalAlpha = a; ctx.font = '52px EBold'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const w = Math.max(...c.l.map(s => ctx.measureText(s).width)) + 64;
    roundRect(ctx, 540 - w / 2, 334, w, c.l.length > 1 ? 152 : 92, 22); ctx.fillStyle = 'rgba(8,12,10,0.86)'; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = C.ink;
    if (c.l.length === 1) ctx.fillText(c.l[0], 540, 398); else { ctx.fillText(c.l[0], 540, 398); ctx.fillText(c.l[1], 540, 458); }
    ctx.restore();
  }
}

// ------------------------------------------------------------------ frame
export function drawFrame(ctx, t, assets) {
  const cm = cam(t), sc = cm.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  drawCartouche(ctx, 1 - env(t, 3.6, 4.1));
  drawRoutes(ctx, t);
  drawDirect(ctx, t);
  drawPhones(ctx, t);
  drawMessages(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
  drawInstrument(ctx, t);
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '22px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not to scale · generic principle, not a product feature', 96, 1612);
  if (assets.icon) {                                                        // CTA signature: official icon + wordmark in the safe area
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 404, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 404, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 484, 1495); ctx.restore(); }
  }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  add(T.m1[0], 'zip', 0.32); add(T.m1[1], 'stop', 0.32); add(T.friendOff, 'offline', 0.26); add(T.stuck, 'retry', 0.24);
  add(T.replay[0], 'zip', 0.22); add(T.serverHl, 'stop', 0.26);
  add(T.friendOn, 'click', 0.3); add(T.m1down[0], 'zip', 0.28); add(T.m1down[1], 'chime', 0.32);
  add(T.friendOff2, 'offline', 0.24); add(T.m2[0], 'zip', 0.26); add(T.m2[1], 'stop', 0.28);
  for (const t0 of T.tries) add(t0, 'fizz', 0.24);
  add(T.yourCut, 'thunk', 0.28); for (let t = T.m3 + 0.4; t < T.near - 0.3; t += 0.5) add(t, 'tick', 0.13);
  add(T.near, 'stop', 0.3); add(T.dlink[0], 'pen', 0.35, { dur: T.dlink[1] - T.dlink[0] }); add(T.dhop[0], 'zip', 0.26); add(T.dhop[1], 'chime', 0.28);
  add(T.reach[0], 'sweep', 0.22, { dur: 0.8 }); add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
