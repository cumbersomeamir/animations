// Meshline production 30s, batch 2026-11-19-english-22: "Why two short wireless hops can beat one long hop".
// Same Transit-Map world as english-06..21 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). Free-space loss grows 6 dB per doubling of distance
// (ITU-R P.525-4), so a half-length hop delivers about 4x the power; weak links lose packets and need retransmissions,
// and a route's expected transmissions are the sum over its links (ETX, De Couto et al., MobiCom 2003); a relay also
// costs airtime (it cannot receive and send at once), so a decent direct link still wins. Illustrative sample run
// (lost, lost, delivered vs two deliveries). No Meshline range, relay or protocol claims (listing facts only in the CTA).
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
// ------------------------------------------------------------------ three islands across a gap: you, a relay on a small islet, a friend
const YOU = [2.4, 16.0], FRI = [13.8, 16.0], REL = [8.1, 17.2];
const TOP = p => [p[0], p[1] - 1.3];
const DIRECT = [TOP(YOU), [8.1, 6.9], TOP(FRI)], HOP1 = [TOP(YOU), [5.25, 12.9], TOP(REL)], HOP2 = [TOP(REL), [10.95, 12.9], TOP(FRI)];
const T = {
  j0: [-0.8, 1.35], route: [0.75, 1.2], h1: [1.35, 0.6], h2: [2.05, 0.6], why: 2.95,
  rings: [4.1, 4.7, 5.3], strong: 4.6, weak: 5.8,
  ruler: 7.3, half: 7.9, bars: 9.4, four: 9.9,
  a1: [12.2, 1.1], a2: [13.75, 0.95], a3: [14.75, 0.8], weakLab: 12.3,
  b1: [16.75, 0.65], b2: [17.5, 0.65], total: 18.4,
  air: [20.35, 21.7], decent: 22.4, d1: [22.55, 0.85], wins: 23.6,
  cta: 25.61,
};
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);
const bez = (P, q) => [(1 - q) ** 2 * P[0][0] + 2 * q * (1 - q) * P[1][0] + q * q * P[2][0], (1 - q) ** 2 * P[0][1] + 2 * q * (1 - q) * P[1][1] + q * q * P[2][1]];
const pathPts = (P, q0 = 0, q1 = 1) => { const pts = []; for (let i = 0; i <= 30; i++) pts.push(bez(P, lerp(q0, q1, i / 30))); return pts; };

// ------------------------------------------------------------------ camera (z 1.0 needs x = 9; each key checked against the sheet edges, friend kept left of x ≈ 880 px)
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 16.2, z: 1.0 }], [3.6, { x: 9.0, y: 16.2, z: 1.0 }],               // hook: the long jump fails, the way around works
    [4.1, { x: 8.7, y: 16.0, z: 1.04 }], [6.9, { x: 8.7, y: 15.95, z: 1.05 }],           // signals weaken with distance
    [7.3, { x: 9.0, y: 16.5, z: 1.0 }], [11.7, { x: 9.0, y: 16.5, z: 1.0 }],             // half the hop, about four times the signal
    [12.1, { x: 8.7, y: 16.05, z: 1.04 }], [16.0, { x: 8.7, y: 16.0, z: 1.05 }],         // the weak link: sent again and again
    [16.5, { x: 9.0, y: 16.2, z: 1.0 }], [19.6, { x: 9.0, y: 16.2, z: 1.0 }],            // two strong hops
    [20.1, { x: 8.7, y: 16.05, z: 1.04 }], [24.9, { x: 8.7, y: 16.0, z: 1.05 }],         // airtime; a decent direct link wins
    [30, { x: 9.0, y: 16.3, z: 1.1 }],                                                     // CTA: slow push under the veil
  ]);
}

// ------------------------------------------------------------------ glyphs
function device(ctx, p, a = 1, lit = 0, col = C.blueSoft) {
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 1.45 * G, h = 2.35 * G;
  ctx.save(); ctx.globalAlpha *= a;
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 1.6 * G); g.addColorStop(0, hexA(col, 0.5 * lit)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 1.6 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.14 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.14 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G, y - h / 2 + 0.13 * G, w - 0.14 * G, h - 0.26 * G, 0.05 * G); ctx.fill();
  ctx.restore();
}
function island(ctx, cx, cy, rx, ry, seed, a = 1) {                       // a printed land patch with a hatched coast and a soft shadow (depth)
  if (a <= 0.01) return; const n = 40, pts = [];
  for (let i = 0; i < n; i++) { const an = i / n * TAU, r = 1 + 0.09 * Math.sin(an * 3 + seed) + 0.05 * Math.sin(an * 7 + 2 * seed); pts.push([cx + Math.cos(an) * rx * r, cy + Math.sin(an) * ry * r]); }
  const path = (dx = 0, dy = 0, k = 1) => { ctx.beginPath(); pts.forEach(([x, y], i) => { const X = (cx + (x - cx) * k) * G + dx, Y = (cy + (y - cy) * k) * G + dy; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); };
  ctx.save(); ctx.globalAlpha *= a;
  path(10, 16); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
  path(); ctx.fillStyle = '#1B2521'; ctx.fill(); ctx.strokeStyle = hexA(C.ink, 0.28); ctx.lineWidth = 3; ctx.stroke();
  path(0, 0, 0.86); ctx.setLineDash([8, 10]); ctx.strokeStyle = hexA(C.ink, 0.12); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}
function voidWaves(ctx, t, a) {                                             // the gap: slow drifting wave lines (motion without clutter)
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = hexA(C.blueSoft, 0.07); ctx.lineWidth = 2;
  for (let r = 0; r < 14; r++) { const y0 = 10.6 + r * 0.85; ctx.beginPath(); for (let i = 0; i <= 72; i++) { const x = i * 0.25, y = y0 + 0.12 * Math.sin(x * 1.3 + t * 0.9 + r * 1.7); i ? ctx.lineTo(x * G, y * G) : ctx.moveTo(x * G, y * G); } ctx.stroke(); }
  ctx.restore();
}
function arc(ctx, P, col, w, a, dash = null, q1 = 1) { if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; strokePath(ctx, pathPts(P, 0, q1), 99, w * G, col, !dash, dash); ctx.restore(); }
function bar(ctx, x, yb, h, col, a, txt) {                                 // relative received power (1× vs about 4×), bottom-anchored
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; const w = 0.62 * G;
  roundRect(ctx, x * G - w / 2 + 4, (yb - h) * G + 6, w, h * G, 8); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
  roundRect(ctx, x * G - w / 2, (yb - h) * G, w, h * G, 8); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  label(ctx, txt, x, yb - h - 0.45, 0.6, col, 'center', 'EBold', a);
}
// one send along a path: delivered, or lost (it falls into the gap halfway and fizzles)
function send(ctx, P, t, t0, dur, lost, col = C.blue) {
  const k = (t - t0) / dur; if (k < 0 || k > 1.05) return null;
  if (!lost) { const q = ease.inOut(clamp(k)); const p = bez(P, q); envelope(ctx, p[0] * G, p[1] * G, 1.12 * G, 1 - clamp((k - 1) / 0.05), col); return null; }
  const kq = 0.55, p0 = bez(P, 0.62);
  if (k < kq) { const p = bez(P, 0.62 * ease.inOut(k / kq)); envelope(ctx, p[0] * G, p[1] * G, 1.12 * G, 1, col); return null; }
  const u = clamp((k - kq) / (1 - kq)), x = p0[0] + 0.9 * u, y = p0[1] + 5.4 * u * u;
  // the dashed coral fall line shows where it is heading
  ctx.save(); ctx.globalAlpha *= 0.85 * (1 - u * 0.6); ctx.setLineDash([10, 9]); ctx.strokeStyle = C.coral; ctx.lineWidth = 0.06 * G; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i <= 16; i++) { const uu = i / 16, X = (p0[0] + 0.9 * uu) * G, Y = (p0[1] + 5.4 * uu * uu) * G; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  envelope(ctx, x * G, y * G, 1.12 * G * (1 - 0.25 * u), 1 - clamp((u - 0.75) / 0.25), col);
  return [p0[0] + 0.9, p0[1] + 4.2];
}
const splashAt = (P, t0, dur) => t0 + dur;                                  // when a lost send hits the gap
const FALL = [bez(DIRECT, 0.62)[0] + 0.9, bez(DIRECT, 0.62)[1] + 5.4];      // where it lands: open water between the islet and the friend's island

// ------------------------------------------------------------------ scene
function drawScene(ctx, t) {
  const v = veil(t);
  voidWaves(ctx, t, 1 - 0.5 * v);
  island(ctx, 1.3, 16.6, 2.9, 3.0, 1.3, 1 - 0.5 * v); island(ctx, 15.0, 16.6, 2.9, 2.9, 4.1, 1 - 0.5 * v); island(ctx, 8.1, 17.75, 1.85, 1.4, 2.2, 1 - 0.5 * v);
  // routes: the direct arc (weak, dashed grey) and the way around (two hops)
  const decent = env(t, T.decent - 0.1, T.decent + 0.3) * (1 - v);
  arc(ctx, DIRECT, hexA(GREY, 0.55), 0.06, (1 - decent) * (1 - v), [14, 12]);
  arc(ctx, DIRECT, C.blue, 0.1, decent);
  const ra = t < T.route[0] ? 0.35 : 0.35 + 0.65 * env(t, ...T.route);
  const strongHop = env(t, T.b1[0] - 0.3, T.b1[0]) * (1 - env(t, T.decent - 0.2, T.decent + 0.3));
  for (const P of [HOP1, HOP2]) { arc(ctx, P, hexA(C.blueSoft, 0.8), 0.07, ra * (1 - strongHop) * (1 - 0.4 * decent) * (1 - v), [12, 10]); arc(ctx, P, C.blue, 0.1, strongHop * (1 - v)); }
  // hook: a lost long jump (frame zero mid-jump), then the way around delivers
  let s = send(ctx, DIRECT, t, T.j0[0], T.j0[1], true); fizz(ctx, FALL, t, splashAt(DIRECT, ...T.j0));
  send(ctx, HOP1, t, ...T.h1, false); send(ctx, HOP2, t, ...T.h2, false);
  check(ctx, (FRI[0] + 1.35) * G, (FRI[1] - 1.8) * G, 0.85 * G, C.blueSoft, env(t, T.h2[0] + T.h2[1], T.h2[0] + T.h2[1] + 0.15) * (1 - env(t, 3.7, 4.0)));
  label(ctx, '?', 8.1, 9.6, 1.4 * ease.outBack(clamp((t - T.why) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.why) / 0.2) * (1 - env(t, 3.9, 4.2)));
  // signals weaken with distance: rings from you, fading as they spread
  for (const r0 of T.rings) { const k = (t - r0) / 1.7; if (k < 0 || k > 1) continue; const R = 0.8 + 12 * k, A = 0.95 / (1 + (R / 2.2) ** 2) * 4 * (1 - k * 0.3);
    ctx.save(); ctx.strokeStyle = hexA(C.blueSoft, Math.min(0.9, A)); ctx.lineWidth = 6 - 4 * k; ctx.beginPath(); ctx.arc(YOU[0] * G, (YOU[1] - 0.2) * G, R * G, 0, TAU); ctx.stroke(); ctx.restore(); }
  const l2 = 1 - env(t, 6.9, 7.2);
  label(ctx, 'strong', 4.9, 12.2, 0.76, C.ink, 'center', 'EBold', env(t, T.strong, T.strong + 0.2) * l2);
  label(ctx, 'weak', 12.0, 11.6, 0.76, GREY, 'center', 'EBold', env(t, T.weak, T.weak + 0.2) * l2);
  // half the hop: the ruler splits at the relay; received power 1× (long hop) vs about 4× (half-length hop), from the inverse-square law
  const ru = env(t, T.ruler - 0.1, T.ruler + 0.3) * (1 - env(t, 11.6, 11.95)), hf = env(t, T.half, T.half + 0.3);
  if (ru > 0) {
    const y = 20.6; ctx.save(); ctx.globalAlpha *= ru; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(YOU[0] * G, y * G); ctx.lineTo(FRI[0] * G, y * G); for (const x of [YOU[0], FRI[0]]) { ctx.moveTo(x * G, (y - 0.3) * G); ctx.lineTo(x * G, (y + 0.3) * G); } ctx.stroke();
    if (hf > 0) { ctx.globalAlpha *= hf; ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(REL[0] * G, (y - 0.45) * G); ctx.lineTo(REL[0] * G, (y + 0.45) * G); ctx.stroke(); }
    ctx.restore();
    label(ctx, 'one long hop', (YOU[0] + FRI[0]) / 2, y + 0.8, 0.66, C.ink, 'center', 'EBold', ru * (1 - hf));
    label(ctx, 'half', (YOU[0] + REL[0]) / 2, y + 0.8, 0.72, C.blueSoft, 'center', 'EBold', ru * hf); label(ctx, 'half', (REL[0] + FRI[0]) / 2, y + 0.8, 0.72, C.blueSoft, 'center', 'EBold', ru * hf);
  }
  const ba = env(t, T.bars, T.bars + 0.3) * (1 - env(t, 11.6, 11.95)), b4 = ease.out(clamp((t - T.four) / 0.5));
  // the weak link: lost, lost, delivered
  label(ctx, 'weak link', 8.1, 9.85, 0.72, GREY, 'center', 'EBold', env(t, T.weakLab, T.weakLab + 0.2) * (1 - env(t, 15.9, 16.2)));
  send(ctx, DIRECT, t, ...T.a1, true); fizz(ctx, FALL, t, splashAt(DIRECT, ...T.a1));
  send(ctx, DIRECT, t, ...T.a2, true); fizz(ctx, FALL, t, splashAt(DIRECT, ...T.a2));
  send(ctx, DIRECT, t, ...T.a3, false);
  check(ctx, (FRI[0] + 1.35) * G, (FRI[1] - 1.8) * G, 0.85 * G, C.blueSoft, env(t, T.a3[0] + T.a3[1], T.a3[0] + T.a3[1] + 0.15) * (1 - env(t, 16.1, 16.4)));
  // two strong hops: delivered, delivered
  label(ctx, 'strong', 4.6, 13.0, 0.72, C.blueSoft, 'center', 'EBold', strongHop * env(t, T.b1[0], T.b1[0] + 0.2) * (1 - env(t, 19.8, 20.1)));
  label(ctx, 'strong', 11.6, 13.0, 0.72, C.blueSoft, 'center', 'EBold', strongHop * env(t, T.b2[0], T.b2[0] + 0.2) * (1 - env(t, 19.8, 20.1)));
  send(ctx, HOP1, t, ...T.b1, false); send(ctx, HOP2, t, ...T.b2, false);
  check(ctx, (REL[0] + 1.3) * G, (REL[1] - 1.6) * G, 0.75 * G, C.blueSoft, env(t, T.b1[0] + T.b1[1], T.b1[0] + T.b1[1] + 0.15) * (1 - env(t, 19.8, 20.1)));
  check(ctx, (FRI[0] + 1.35) * G, (FRI[1] - 1.8) * G, 0.85 * G, C.blueSoft, env(t, T.b2[0] + T.b2[1], T.b2[0] + T.b2[1] + 0.15) * (1 - env(t, 19.8, 20.1)));
  // the relay also takes airtime: it must listen, then send again (a busy ring), then a decent direct link delivers in one send
  const aa = env(t, T.air[0] - 0.1, T.air[0] + 0.2) * (1 - env(t, 24.6, 24.9)) * (1 - v), ak = clamp((t - T.air[0]) / (T.air[1] - T.air[0]));
  if (aa > 0) { ctx.save(); ctx.globalAlpha *= aa; ctx.lineCap = 'round'; ctx.strokeStyle = hexA(C.ink, 0.18); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(REL[0] * G, REL[1] * G, 1.75 * G, 0, TAU); ctx.stroke();
    ctx.strokeStyle = GREY; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(REL[0] * G, REL[1] * G, 1.75 * G, -Math.PI / 2, -Math.PI / 2 + ak * TAU); ctx.stroke(); ctx.restore(); }
  label(ctx, 'listens, then sends again', REL[0], REL[1] + 2.85, 0.68, GREY, 'center', 'EBold', aa);
  label(ctx, 'decent direct link', 8.1, 9.85, 0.76, C.blueSoft, 'center', 'EBold', decent);
  send(ctx, DIRECT, t, ...T.d1, false);
  check(ctx, (FRI[0] + 1.35) * G, (FRI[1] - 1.8) * G, 0.85 * G, C.blueSoft, env(t, T.d1[0] + T.d1[1], T.d1[0] + T.d1[1] + 0.15) * (1 - v));
  // the phones
  const litY = (t < 0.4 || (t > T.a1[0] && t < T.a3[0] + 0.3) || (t > T.d1[0] - 0.2 && t < T.d1[0] + 0.4) || (t > 4.0 && t < 6.6)) ? 1 : 0;
  device(ctx, YOU, 1, litY * (1 - v)); device(ctx, REL, 1, (t > T.h1[0] + T.h1[1] - 0.1 && t < T.h2[0] + 0.3) || (t > T.b1[0] + T.b1[1] - 0.1 && t < T.b2[0] + 0.3) || aa > 0.5 ? 1 : 0); device(ctx, FRI, 1, 0);
  label(ctx, 'you', YOU[0], YOU[1] + 1.75, 0.72, C.ink, 'center', 'EBold', 1 - v); label(ctx, 'relay', REL[0], REL[1] + 1.75, 0.72, C.ink, 'center', 'EBold', (1 - v) * (1 - aa)); label(ctx, 'friend', FRI[0], FRI[1] + 1.75, 0.72, C.ink, 'center', 'EBold', 1 - v);
}

// ------------------------------------------------------------------ screen-space instrument: sends to deliver one message (one readout; kept left of the right-side controls)
const SENDS = {
  long: [[T.a1[0], T.a1[0] + T.a1[1], false], [T.a2[0], T.a2[0] + T.a2[1], false], [T.a3[0], T.a3[0] + T.a3[1], true]],
  hops: [[T.b1[0], T.b1[0] + T.b1[1], true], [T.b2[0], T.b2[0] + T.b2[1], true]],
  direct: [[T.d1[0], T.d1[0] + T.d1[1], true]],
};
function xMark(ctx, x, y, s, col) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s / 2, y - s / 2); ctx.lineTo(x + s / 2, y + s / 2); ctx.moveTo(x + s / 2, y - s / 2); ctx.lineTo(x - s / 2, y + s / 2); ctx.stroke(); ctx.restore(); }
function drawSignal(ctx, t) {                                              // mode A: relative received power, from the inverse-square law
  const A = env(t, T.bars - 0.1, T.bars + 0.25) * (1 - env(t, 11.55, 11.8)); if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 768, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('signal at the receiver', 132, 1450);
  const k = ease.out(clamp((t - T.four) / 0.6)), unit = 78;
  ctx.font = '28px EBold'; ctx.fillStyle = GREY; ctx.fillText('one long hop', 132, 1494); ctx.fillStyle = C.ink; ctx.fillText('half-length hop', 132, 1540);
  roundRect(ctx, 370, 1480, unit, 28, 9); ctx.fillStyle = GREY; ctx.fill();
  roundRect(ctx, 370, 1526, unit * (1 + 3 * k), 28, 9); ctx.fillStyle = C.blueSoft; ctx.fill();
  ctx.font = '30px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = GREY; ctx.fillText('1×', 830, 1494); ctx.fillStyle = C.blueSoft; ctx.fillText(k > 0.5 ? 'about 4×' : '1×', 830, 1540);
  ctx.restore();
}
function drawInstrument(ctx, t) {
  drawSignal(ctx, t);
  const A = env(t, T.a1[0] - 0.4, T.a1[0] - 0.1) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 768, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('sends to deliver one message', 132, 1450);
  const sw = env(t, T.decent - 0.1, T.decent + 0.25);                       // row 1 switches from the weak long hop to a decent direct link
  const rows = [[sw > 0.5 ? 'decent direct link' : 'one long hop', sw > 0.5 ? SENDS.direct : SENDS.long, 1494, sw > 0.5 ? 1 - (1 - sw) * 2 : 1 - sw * 2], ['two short hops', SENDS.hops, 1540, env(t, T.b1[0] - 0.3, T.b1[0])]];
  const n = (list) => list.filter(([s]) => t >= s).length;
  const winner = t >= T.d1[0] + T.d1[1] ? 0 : t >= T.total ? 1 : -1;
  for (const [i, [name, list, y, a]] of rows.entries()) {
    if (a <= 0.01) continue; ctx.save(); ctx.globalAlpha *= a;
    ctx.font = '28px EBold'; ctx.fillStyle = winner === i ? C.ink : GREY; ctx.textAlign = 'left'; ctx.fillText(name, 132, y);
    list.forEach(([s, e, ok], j) => { if (t < s) return; const x = 420 + j * 54; ctx.fillStyle = hexA(C.ink, 0.08); ctx.beginPath(); ctx.arc(x, y, 19, 0, TAU); ctx.fill();
      if (t >= e) { if (ok) check(ctx, x, y, 26, C.blueSoft, 1); else xMark(ctx, x, y, 20, C.coral); } else { ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 19, -Math.PI / 2, -Math.PI / 2 + clamp((t - s) / (e - s)) * TAU); ctx.stroke(); } });
    const k = n(list); if (k) { ctx.font = '30px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = winner === i ? C.blueSoft : C.ink; ctx.fillText(`${k} send${k > 1 ? 's' : ''}`, 830, y); }
    ctx.restore();
  }
  if (winner >= 0) { ctx.font = '24px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = C.blueSoft; ctx.fillText('fewer sends', 830, 1450); }
  ctx.restore();
}
// ------------------------------------------------------------------ captions (screen space; 2026-11-19 brief: ink and plate in y 280–460, x 100–900)
function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b) continue;
    const a = clamp((t - c.a) / 0.16) * (1 - clamp((t - (c.b - 0.14)) / 0.14));
    ctx.save(); ctx.globalAlpha = a; ctx.font = '52px EBold'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const w = Math.max(...c.l.map(s => ctx.measureText(s).width)) + 64;
    roundRect(ctx, CAP_CX - w / 2, 306, w, c.l.length > 1 ? 152 : 92, 22); ctx.fillStyle = 'rgba(8,12,10,0.86)'; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = C.ink;
    if (c.l.length === 1) ctx.fillText(c.l[0], CAP_CX, 370); else { ctx.fillText(c.l[0], CAP_CX, 370); ctx.fillText(c.l[1], CAP_CX, 430); }
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
  if (big) { line('THE SHORTER', 345, C.ink, 112); line('WAY AROUND', 470, C.coral, 112); }
  else { line('THE SHORTER', 362, C.ink, 90); line('WAY AROUND', 452, C.coral, 90); }
  ctx.restore();
}
export function drawFrame(ctx, t, assets) {
  drawWorld(ctx, t, cam(t));
  drawInstrument(ctx, t);
  drawTitle(ctx, 1 - env(t, 0.3, 0.55));
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '22px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not to scale · generic principle, not a product feature', 96, 1612);
  if (assets.icon) {                                                        // CTA (feedback "call to action needed"): icon + wordmark + an explicit action button
    const a = env(t, T.cta, T.cta + 0.5), b = env(t, T.cta + 0.35, T.cta + 0.8);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 364, 1404, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 364, 1404, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 444, 1437); ctx.restore(); }
    if (b > 0) {                                                            // listing facts only: price 0, Android
      const s = 0.92 + 0.08 * ease.outBack(b), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - T.cta - 1.2) * 4.2) * clamp(t - T.cta - 1.2);
      ctx.save(); ctx.globalAlpha = b; ctx.translate(500, 1520); ctx.scale(s * pulse, s * pulse);
      roundRect(ctx, -250, -40, 500, 80, 40); ctx.fillStyle = C.blue; ctx.fill(); ctx.strokeStyle = hexA(C.ink, 0.35); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = '36px EBold'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Download free · Android', 0, 2); ctx.restore();
    }
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
  const end = ([t0, d]) => t0 + d;
  add(0.02, 'zip', 0.12); add(end(T.j0), 'fizz', 0.24); add(T.route[0], 'sweep', 0.12, { dur: 0.45 });
  add(T.h1[0], 'zip', 0.16); add(T.h2[0], 'zip', 0.16); add(end(T.h2), 'chime', 0.16); add(T.why, 'retry', 0.14);
  for (const r of T.rings) add(r, 'sweep', 0.1, { dur: 0.6 }); add(T.weak, 'click', 0.12);
  add(T.ruler, 'pen', 0.16, { dur: 0.45 }); add(T.half, 'click', 0.16); add(T.four, 'land', 0.18);
  add(T.a1[0], 'zip', 0.16); add(end(T.a1), 'fizz', 0.24); add(T.a2[0], 'zip', 0.16); add(end(T.a2), 'fizz', 0.24); add(T.a3[0], 'zip', 0.16); add(end(T.a3), 'stop', 0.2);
  add(T.b1[0], 'zip', 0.16); add(end(T.b1), 'stop', 0.18); add(T.b2[0], 'zip', 0.16); add(end(T.b2), 'stop', 0.18); add(T.total, 'chime', 0.16);
  for (let s = T.air[0]; s < T.air[1]; s += 0.34) add(s, 'tick', 0.1);
  add(T.decent, 'sweep', 0.14, { dur: 0.5 }); add(T.d1[0], 'zip', 0.16); add(end(T.d1), 'stop', 0.2); add(T.wins, 'chime', 0.16);
  add(T.cta, 'chime', 0.3); add(T.cta + 0.4, 'click', 0.18);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
