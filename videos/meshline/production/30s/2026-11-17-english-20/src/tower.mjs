// Meshline production 30s, batch 2026-11-17-english-20: "Why your phone skips the nearest tower".
// Same Transit-Map world as english-06..19 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). How a phone picks a tower: a cell must belong to the
// selected/registered PLMN ("suitable cell", 3GPP TS 36.304 §4.1/§3.1); cells are ranked on measured RSRP with a
// hysteresis (Qhyst) and reselection needs the better ranking to hold for Treselection (TS 36.304 §5.2.4.6); in calls the
// A3 event uses an offset and a time-to-trigger to limit ping-pong handovers. Illustrative levels from one simple walk
// model; no Meshline cellular or radio claims (listing facts only in the CTA).
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
// ------------------------------------------------------------------ a street, the nearest tower (another network), tower 1 (farther, yours), a building, tower 2 (yours)
const STREET = 18.3, BASE = 17.5;
const TW = { n: { x: 9.4, h: 6.6 }, t1: { x: 1.6, h: 6.0 }, t2: { x: 13.8, h: 6.0 } };
const BLD = { x0: 10.75, x1: 12.35, y0: 13.0, y1: 17.5 };
const top = k => [TW[k].x, BASE - TW[k].h];
const T = {
  why: 3.59, other: 5.35, pull: [7.5, 8.6], inst: 8.3, names: 8.7, stronger: 9.15, nearer: 10.15,
  walk: [10.6, 12.6, 17.0, 20.5], wait: 13.8, marginOn: 16.55, setTime: 17.7, bounce: [18.95, 19.95],
  near6: 22.2, moment: 24.2, cta: 26.09,
};
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ one walk model drives the phone, the bars and every switch decision
const W4 = [[0, 0], [T.walk[0], 0], [T.walk[1], 0.62, 'in'], [T.walk[2], 0.85, 'lin'], [T.walk[3], 1, 'out']];
function walkW(t) { for (let i = 1; i < W4.length; i++) if (t <= W4[i][0]) { const [t0, w0] = W4[i - 1], [t1, w1, e] = W4[i], u = inv(t0, t1, t); return lerp(w0, w1, e === 'lin' ? u : e === 'out' ? 1 - (1 - u) ** 2 : u * u * (3 - 2 * u)); } return 1; }
const phoneX = t => lerp(8.2, 12.8, walkW(t));
const jit = (t, s) => 0.004 * Math.sin(t * 7.1 + s) + 0.003 * Math.sin(t * 12.7 + 2 * s);
const sig1 = t => 0.62 - 0.10 * walkW(t) + jit(t, 0.4);                    // tower 1: farther, steady, slowly fading as you walk away
const sig2 = t => 0.24 + 0.513 * walkW(t) + jit(t, 1.9);                   // tower 2: nearer, but behind the building until you pass it
const MARGIN = 0.15;
const scan = f => { for (let t = 0; t < 30; t += 1 / 120) if (f(t)) return +t.toFixed(3); return 99; };
T.cross = scan(t => t > 11 && sig2(t) > sig1(t));                            // tower 2 now measures stronger
T.margin = scan(t => t > 11 && sig2(t) > sig1(t) + MARGIN);                  // ...and better by the margin
T.switch = +(T.margin + 3.0).toFixed(3);                                     // held for the (illustrative) set time
const serving = t => (t >= T.switch ? 't2' : 't1');

// ------------------------------------------------------------------ camera (one purposeful move per beat; every key checked against the sheet edges)
function cam(t) {
  return K(t, [
    [0, { x: 7.6, y: 15.0, z: 1.25 }], [4.5, { x: 7.6, y: 15.0, z: 1.27 }],              // hook: the phone at the foot of the nearest tower
    [5.0, { x: 7.7, y: 15.0, z: 1.25 }], [7.4, { x: 7.7, y: 15.0, z: 1.24 }],            // that tower is another network's
    [8.6, { x: 9.0, y: 14.2, z: 1.0 }], [11.6, { x: 9.0, y: 14.2, z: 1.0 }],             // your towers: measured, not distance
    [13.0, { x: 9.0, y: 14.25, z: 1.02 }], [20.8, { x: 9.0, y: 14.3, z: 1.02 }],         // walk, stronger, margin, set time, switch
    [21.8, { x: 9.0, y: 14.2, z: 1.0 }], [25.9, { x: 9.0, y: 14.2, z: 1.01 }],           // payoff: the whole street
    [30, { x: 9.0, y: 14.4, z: 1.12 }],                                                    // CTA: slow push under the veil
  ]);
}

// ------------------------------------------------------------------ glyphs
function device(ctx, p, a = 1, lit = 0, col = C.blueSoft) {
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 1.15 * G, h = 1.86 * G;
  ctx.save(); ctx.globalAlpha *= a;
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 1.5 * G); g.addColorStop(0, hexA(col, 0.5 * lit)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 1.5 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 5, w, h, 0.14 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.14 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G, y - h / 2 + 0.13 * G, w - 0.14 * G, h - 0.26 * G, 0.05 * G); ctx.fill();
  ctx.restore();
}
function tower(ctx, k, col, a = 1, t = 0, pulse = 1) {                     // lattice mast + panel antennas + gentle broadcast rings
  if (a <= 0.01) return; const { x, h } = TW[k], X = x * G, B = BASE * G, Tp = (BASE - h) * G, wb = 0.82 * G, wt = 0.16 * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(X + 6, B + 4, wb * 1.25, 0.16 * G, 0, 0, TAU); ctx.fill();
  const legs = (dx, dy, c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(X - wb + dx, B + dy); ctx.lineTo(X - wt + dx, Tp + dy); ctx.moveTo(X + wb + dx, B + dy); ctx.lineTo(X + wt + dx, Tp + dy);
    const n = Math.round(h / 0.62); for (let i = 0; i < n; i++) { const y0 = B - (B - Tp) * i / n, y1 = B - (B - Tp) * (i + 1) / n, w0 = lerp(wb, wt, i / n), w1 = lerp(wb, wt, (i + 1) / n); ctx.moveTo(X - w0 + dx, y0 + dy); ctx.lineTo(X + w1 + dx, y1 + dy); ctx.moveTo(X + w0 + dx, y0 + dy); ctx.lineTo(X - w1 + dx, y1 + dy); }
    ctx.stroke(); };
  legs(3, 5, 'rgba(0,0,0,0.5)', 0.08 * G); legs(0, 0, col, 0.075 * G);
  ctx.fillStyle = col; for (const s of [-1, 1]) { roundRect(ctx, X + s * 0.2 * G - 0.07 * G, Tp - 0.05 * G, 0.14 * G, 0.5 * G, 0.04 * G); ctx.fill(); }
  ctx.beginPath(); ctx.arc(X, Tp - 0.12 * G, 0.11 * G, 0, TAU); ctx.fill();
  for (let j = 0; j < 2; j++) { const age = ((t * 0.8 + j * 0.5 + x * 0.13) % 1); ctx.strokeStyle = hexA(col, 0.55 * (1 - age) * pulse); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, Tp - 0.12 * G, (0.35 + 1.15 * age) * G, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); }
  ctx.restore();
}
function building(ctx, a) {
  if (a <= 0.01) return; const { x0, x1, y0, y1 } = BLD;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x0 * G + 6, y0 * G + 8, (x1 - x0) * G, (y1 - y0) * G, 8); ctx.fill();
  ctx.fillStyle = '#1C2521'; roundRect(ctx, x0 * G, y0 * G, (x1 - x0) * G, (y1 - y0) * G, 8); ctx.fill();
  ctx.strokeStyle = hexA(C.ink, 0.3); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = hexA(C.ink, 0.16); for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) ctx.fillRect((x0 + 0.28 + c * 0.48) * G, (y0 + 0.35 + r * 0.56) * G, 0.24 * G, 0.26 * G);
  ctx.restore();
}
function link(ctx, from, to, d = 1, col = C.blue, a = 1, dash = null, t = 0) {   // curved radio link phone → antenna, drawn up to fraction d
  if (a <= 0.01 || d <= 0) return; const mx = (from[0] + to[0]) / 2, my = Math.min(from[1], to[1]) - 1.5, pts = [];
  for (let i = 0; i <= 28; i++) { const u = i / 28; pts.push([(1 - u) ** 2 * from[0] + 2 * u * (1 - u) * mx + u * u * to[0], (1 - u) ** 2 * from[1] + 2 * u * (1 - u) * my + u * u * to[1]]); }
  ctx.save(); ctx.globalAlpha *= a; strokePath(ctx, pts, len(pts) * d, 0.09 * G, col, !dash, dash);
  if (!dash && d >= 1) for (let j = 0; j < 3; j++) { const p = at(pts, len(pts) * ((t * 0.55 + j / 3) % 1)); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.09 * G, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function pill(ctx, txt, x, y, size, col, bg, a) {                           // tag with a solid plate (reads over any line)
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `${size * G}px EBold`; const w = ctx.measureText(txt).width + 0.5 * G, h = size * 1.55 * G;
  roundRect(ctx, x * G - w / 2, y * G - h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = hexA(col, 0.6); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x * G, y * G + 0.02 * G); ctx.restore();
}
function timerRing(ctx, p, k, a, col = C.blueSoft) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
  ctx.strokeStyle = hexA(C.ink, 0.18); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 1.45 * G, 0, TAU); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 1.45 * G, -Math.PI / 2, -Math.PI / 2 + clamp(k) * TAU); ctx.stroke(); ctx.restore();
}

// ------------------------------------------------------------------ scene
function drawScene(ctx, t) {
  const v = veil(t), px = phoneX(t), P = [px, STREET], ant = [px, STREET - 0.95];
  // street
  ctx.fillStyle = hexA(C.ink, 0.045); ctx.fillRect(0, (STREET - 0.62) * G, SHEET.w * G, 1.24 * G);
  ctx.strokeStyle = hexA(C.ink, 0.13); ctx.lineWidth = 3; for (const y of [STREET - 0.62, STREET + 0.62]) { ctx.beginPath(); ctx.moveTo(0, y * G); ctx.lineTo(SHEET.w * G, y * G); ctx.stroke(); }
  ctx.setLineDash([22, 22]); ctx.strokeStyle = hexA(C.ink, 0.1); ctx.beginPath(); ctx.moveTo(0, (STREET + 0.95) * G); ctx.lineTo(SHEET.w * G, (STREET + 0.95) * G); ctx.stroke(); ctx.setLineDash([]);
  // towers: the nearest one turns grey once we learn it is another network's
  const og = env(t, T.other - 0.15, T.other + 0.25);
  const nCol = og > 0.5 ? GREY : C.blueSoft;
  tower(ctx, 'n', nCol, (1 - 0.35 * og) * (1 - 0.6 * v), t, 1 - og);
  tower(ctx, 't1', C.blueSoft, 1 - 0.6 * v, t); tower(ctx, 't2', C.blueSoft, 1 - 0.6 * v, t);
  building(ctx, 1 - 0.6 * v);
  // the nearest tower: "?" on the hook, then "other network" and a struck-out link
  label(ctx, '?', top('n')[0] + 1.1, top('n')[1] + 0.2, 1.1 * ease.outBack(clamp((t - T.why) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.why) / 0.2) * (1 - env(t, 5.0, 5.3)));
  const nl = og * (1 - env(t, 7.6, 8.0));
  if (nl > 0) { link(ctx, ant, [top('n')[0] + 0.15, top('n')[1] + 0.3], 1, hexA(GREY, 0.8), nl, [14, 12]); const m = [(ant[0] + top('n')[0]) / 2 + 0.1, Math.min(ant[1], top('n')[1]) - 0.55]; cross(ctx, m, 0.3, nl); }
  pill(ctx, 'other network', top('n')[0], top('n')[1] - 1.0, 0.5, GREY, 'rgba(14,19,17,0.95)', og * (1 - v));
  label(ctx, 'nearest', top('n')[0], top('n')[1] - 1.9, 0.62, C.ink, 'center', 'EBold', env(t, T.near6, T.near6 + 0.25) * (1 - v));
  // tower names and what the phone measures (stronger / nearer), the descriptor moving with the model
  const nm = env(t, T.names, T.names + 0.25) * (1 - v);
  label(ctx, 'tower 1', top('t1')[0], top('t1')[1] - 0.95, 0.6, C.blueSoft, 'center', 'EBold', nm);
  label(ctx, 'tower 2', top('t2')[0], top('t2')[1] - 0.95, 0.6, C.blueSoft, 'center', 'EBold', nm);
  const s1a = env(t, T.stronger, T.stronger + 0.25) * (1 - env(t, T.cross, T.cross + 0.2)) * (1 - v);
  const s2a = env(t, T.cross, T.cross + 0.25) * (1 - env(t, 21.0, 21.3)) * (1 - v);
  label(ctx, 'stronger', top('t1')[0], top('t1')[1] - 1.75, 0.66, C.ink, 'center', 'EBold', s1a);
  label(ctx, 'nearer', top('t2')[0], top('t2')[1] - 1.75, 0.66, GREY, 'center', 'EBold', env(t, T.nearer, T.nearer + 0.25) * (1 - env(t, T.cross - 0.2, T.cross)));
  label(ctx, 'stronger', top('t2')[0], top('t2')[1] - 1.75, 0.66, C.ink, 'center', 'EBold', s2a);
  label(ctx, 'building', (BLD.x0 + BLD.x1) / 2, BLD.y0 - 0.5, 0.5, GREY, 'center', 'EBold', env(t, T.nearer, T.nearer + 0.25) * (1 - env(t, 14.5, 14.8)) * (1 - v));
  // the serving link: tower 1 until the switch, then it swings to tower 2
  const sw = clamp((t - T.switch) / 0.6), lv = 1 - 0.8 * v;
  if (sw < 1) link(ctx, ant, [top('t1')[0] + 0.15, top('t1')[1] + 0.3], 1 - ease.inOut(sw), C.blue, lv, null, t);
  if (sw > 0) link(ctx, ant, [top('t2')[0] - 0.15, top('t2')[1] + 0.3], ease.inOut(sw), C.blue, lv, null, t);
  check(ctx, (top('t2')[0] + 1.15) * G, (top('t2')[1] + 0.7) * G, 0.75 * G, C.blueSoft, env(t, T.switch + 0.5, T.switch + 0.7) * (1 - v));
  // the switch waits: label, then (after the margin) the set-time ring around the phone
  const wa = env(t, T.wait - 0.1, T.wait + 0.2) * (1 - env(t, T.margin - 0.2, T.margin));
  label(ctx, 'waits', px - 1.75, STREET + 0.05, 0.68, GREY, 'right', 'EBold', wa * (1 - v));
  const tk = inv(T.margin, T.switch, t), ta = env(t, T.margin, T.margin + 0.2) * (1 - env(t, T.switch + 0.4, T.switch + 0.8));
  timerRing(ctx, P, tk, ta);
  label(ctx, 'set time', px - 1.75, STREET + 0.05, 0.66, C.blueSoft, 'right', 'EBold', env(t, T.setTime, T.setTime + 0.2) * (1 - env(t, T.switch + 0.4, T.switch + 0.8)));
  // without a margin: the link would bounce between towers (ghost), struck out
  if (t > T.bounce[0] && t < T.bounce[1] + 0.4) {
    const ga = env(t, T.bounce[0], T.bounce[0] + 0.15) * (1 - env(t, T.bounce[1], T.bounce[1] + 0.35)), side = Math.floor((t - T.bounce[0]) / 0.22) % 2;
    link(ctx, ant, side ? [top('t2')[0] - 0.15, top('t2')[1] + 0.3] : [top('t1')[0] + 0.15, top('t1')[1] + 0.3], 1, C.coral, ga * 0.9, [16, 12]);
    label(ctx, 'bouncing', px - 1.3, BLD.y0 - 0.75, 0.66, C.coral, 'center', 'EBold', ga);
    cross(ctx, [px + 0.55, BLD.y0 - 0.75], 0.3, ga * env(t, T.bounce[1] - 0.35, T.bounce[1] - 0.2));
  }
  // payoff: switches take a moment
  const mo = env(t, T.moment, T.moment + 0.25) * (1 - v);
  if (mo > 0) { timerRing(ctx, P, 1, mo * 0.8); label(ctx, 'a moment', px - 1.75, STREET + 0.05, 0.66, C.blueSoft, 'right', 'EBold', mo); }
  // the phone (you), walking: a small bob while it moves
  const moving = t > T.walk[0] && t < T.walk[3], bob = moving ? 0.05 * Math.abs(Math.sin(t * 9)) : 0;
  device(ctx, [px, STREET - bob], 1, 0.7 * (1 - v));
  label(ctx, 'you', px, STREET + 1.45, 0.6, C.ink, 'center', 'EBold', 1 - v);
}

// ------------------------------------------------------------------ screen-space instrument: what your phone measures (one readout)
function drawInstrument(ctx, t) {
  const A = env(t, T.inst, T.inst + 0.35) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('what your phone measures', 132, 1450);
  const X0 = 300, X1 = 944, bx = s => X0 + (X1 - X0) * clamp(s), sv = serving(t);
  const rows = [['tower 1', sig1(t), 't1', 1494], ['tower 2', sig2(t), 't2', 1540]];
  for (const [name, s, k, y] of rows) {
    ctx.font = '28px EBold'; ctx.fillStyle = sv === k ? C.ink : GREY; ctx.textAlign = 'left'; ctx.fillText(name, 132, y);
    roundRect(ctx, X0, y - 15, X1 - X0, 30, 10); ctx.fillStyle = hexA(C.ink, 0.06); ctx.fill();
    roundRect(ctx, X0, y - 15, Math.max(20, bx(s) - X0), 30, 10); ctx.fillStyle = sv === k ? C.blue : hexA(C.blueSoft, 0.55); ctx.fill();
  }
  // the margin: tower 2 must beat tower 1 by this much (band on tower 2's row)
  const ma = env(t, T.marginOn, T.marginOn + 0.25) * (1 - env(t, T.switch + 0.6, T.switch + 1.0));
  if (ma > 0) {
    const a0 = bx(sig1(t)), a1 = bx(sig1(t) + MARGIN);
    ctx.save(); ctx.globalAlpha *= ma; ctx.fillStyle = hexA(C.ink, 0.22); ctx.fillRect(a0, 1540 - 22, a1 - a0, 44);
    ctx.fillStyle = C.ink; ctx.fillRect(a1 - 2, 1540 - 26, 4, 52); ctx.font = '24px EBold'; ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.fillText('margin', (a0 + a1) / 2, 1494); ctx.restore();
  }
  ctx.font = '30px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = C.blueSoft; ctx.fillText(sv === 't1' ? 'using tower 1' : 'using tower 2', 944, 1450);
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
  if (big) { line('NEAREST TOWER.', 360, C.ink, 104); line('NOT CHOSEN.', 495, C.coral, 112); }
  else { line('NEAREST TOWER.', 390, C.ink, 88); line('NOT CHOSEN.', 488, C.coral, 92); }
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
  add(0.02, 'zip', 0.14); add(T.why, 'retry', 0.14); add(T.other, 'stamp', 0.2); add(T.other + 0.4, 'offline', 0.12);
  add(T.pull[0], 'sweep', 0.14, { dur: 0.9 }); add(T.names, 'click', 0.14); add(T.stronger, 'click', 0.14); add(T.nearer, 'click', 0.12);
  for (let s = T.walk[0] + 0.2; s < T.walk[1]; s += 0.42) add(s, 'tick', 0.08);
  add(T.cross, 'pen', 0.16, { dur: 0.35 }); add(T.wait, 'tick', 0.14); add(T.marginOn, 'click', 0.16); add(T.margin, 'sweep', 0.12, { dur: 0.5 });
  for (let i = 0; i < 4; i++) add(T.bounce[0] + i * 0.22, 'zip', 0.1); add(T.bounce[1] - 0.3, 'offline', 0.14);
  add(T.switch, 'land', 0.2); add(T.switch + 0.5, 'chime', 0.16); add(T.near6, 'click', 0.14); add(T.moment, 'tick', 0.14);
  add(T.cta, 'chime', 0.3); add(T.cta + 0.4, 'click', 0.18);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
