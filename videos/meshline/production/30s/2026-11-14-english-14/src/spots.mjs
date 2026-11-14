// Meshline production 30s, batch 2026-11-14-english-14: "Why a hand's width can bring the signal back".
// Same Transit-Map world as english-06..13 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). Multipath: echoes off walls arrive out of sync and
// add or cancel, leaving dead spots; at 2.4 GHz one wavelength is ~12.5 cm (c/f, NIST c), and minima sit at least half a
// wavelength apart (ITU-R P.1406-2 §3.3; indoor multipath ITU-R P.1238-13 §4.1). The signal map is computed from a
// direct path plus three wall reflections (image method) and is illustrative. No Meshline transport/range claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 40 };                                   // taller sheet: the add/cancel and wavelength strips sit below the room
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
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

// ------------------------------------------------------------------ the field: direct path + three wall reflections (image method)
// Illustrative two-dimensional model. Wavelength 1.6 G stands for 12.5 cm (2.4 GHz), so near the phone the pattern is
// roughly to scale with the phone glyph (1 G ≈ 7.8 cm); the room itself is not to scale.
const TX = [3.8, 15.5], ROOM = { x0: 1.6, x1: 16.4, y0: 10.0, y1: 21.0 }, LAM = 1.6, KW = TAU / LAM;
const SRC = [[TX[0], TX[1], 1], [TX[0], 2 * ROOM.y0 - TX[1], -0.8], [TX[0], 2 * ROOM.y1 - TX[1], -0.8], [2 * ROOM.x1 - TX[0], TX[1], -0.6]];
const field = (x, y) => { let re = 0, im = 0; for (const [sx, sy, a] of SRC) { const r = Math.hypot(x - sx, y - sy); re += a / r * Math.cos(-KW * r); im += a / r * Math.sin(-KW * r); } return re * re + im * im; };
const HM = { x0: 9.6, x1: 16.3, y0: 10.15, y1: 20.85, res: 0.03 };
let P95 = 1; { const v = []; for (let x = HM.x0; x <= HM.x1; x += 0.1) for (let y = HM.y0; y <= HM.y1; y += 0.1) v.push(field(x, y)); v.sort((a, b) => a - b); P95 = v[Math.floor(0.95 * (v.length - 1))]; }
const level = (x, y) => clamp(field(x, y) / P95);
// the dead spot (deep null) and the strong spot one hand's width away (computed once, deterministic)
const NUL = (() => { let b = null; for (let x = 12.4; x <= 13.6; x += 0.02) for (let y = 14.6; y <= 16.4; y += 0.02) { const v = field(x, y); if (!b || v < b[2]) b = [x, y, v]; } return [b[0], b[1]]; })();
const PEAK = (() => { let b = null; for (let a = 0; a < 360; a += 2) for (let d = 0.9; d <= 1.35; d += 0.05) { const x = NUL[0] + d * Math.cos(a * Math.PI / 180), y = NUL[1] + d * Math.sin(a * Math.PI / 180), v = field(x, y); if (!b || v > b[2]) b = [x, y, v]; } return [b[0], b[1]]; })();
let HEAT = null;
function heatImage() {
  if (HEAT) return HEAT;
  const w = Math.round((HM.x1 - HM.x0) / HM.res), h = Math.round((HM.y1 - HM.y0) / HM.res), cv = createCanvas(w, h), c = cv.getContext('2d'), img = c.createImageData(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const v = Math.pow(level(HM.x0 + (i + 0.5) * HM.res, HM.y0 + (j + 0.5) * HM.res), 0.8), o = (j * w + i) * 4;
    img.data[o] = lerp(49, 190, v * v); img.data[o + 1] = lerp(87, 205, v * v); img.data[o + 2] = 255; const fx = clamp((i * HM.res) / 1.2); img.data[o + 3] = Math.round(255 * (0.04 + 0.62 * v) * fx * fx * (3 - 2 * fx));   // feathered left edge
  }
  c.putImageData(img, 0, 0); HEAT = cv; return cv;
}

// ------------------------------------------------------------------ beats
const T = {
  msg0: [0.3, 1.0], slide: [1.15, 2.05], msg1: [2.3, 2.95], why: 3.67,
  rays: [4.75, 6.5], walls: 7.25, sync: 9.8, add: 11.1, cancel: 11.9,
  ghz: 13.4, cm: 16.6, spots: 18.8, apart: 20.1, back: [20.5, 21.3],
  stall: [21.9, 22.55], shift: [23.35, 24.25], msg2: [24.35, 24.95], cta: 25.92,
};
const slideK = t => ease.inOut(inv(...T.slide, t)) * (1 - ease.inOut(inv(...T.back, t))) + ease.inOut(inv(...T.shift, t));
const rxPos = t => { const k = clamp(slideK(t)); return [lerp(NUL[0], PEAK[0], k), lerp(NUL[1], PEAK[1], k)]; };
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const PANEL_Y = 25.6, RULER_Y = 30.2;
function cam(t) {
  return K(t, [
    [0, { x: 11.6, y: 15.6, z: 1.42 }], [4.3, { x: 11.6, y: 15.6, z: 1.45 }],          // hook: in the dead spot, slide a hand's width
    [4.9, { x: 9.0, y: 15.5, z: 1.01 }], [8.7, { x: 9.0, y: 15.5, z: 1.03 }],           // the room: several paths
    [9.2, { x: 9.0, y: PANEL_Y, z: 1.15 }], [12.8, { x: 9.0, y: PANEL_Y, z: 1.17 }],   // add up / cancel
    [13.3, { x: 9.0, y: RULER_Y, z: 1.15 }], [17.9, { x: 9.0, y: RULER_Y, z: 1.17 }], // one wavelength ≈ 12 cm
    [18.5, { x: 11.9, y: 15.6, z: 1.5 }], [21.4, { x: 11.9, y: 15.6, z: 1.52 }],       // spots centimetres apart
    [21.9, { x: 9.4, y: 15.6, z: 1.05 }], [25.8, { x: 9.4, y: 15.6, z: 1.07 }],      // the move, before vs after
    [30, { x: 9.4, y: 15.6, z: 1.1 }],
  ]);
}

// ------------------------------------------------------------------ props
function phoneRX(ctx, p, t, glyph, s = 1.6, a = 1) {                     // phone with live signal bars sampled from the field
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  const n = Math.round(4 * Math.pow(level(p[0], p[1]), 0.6)), col = n <= 1 ? C.coral : C.blueSoft, bs = 0.36 * G * s / 1.6;
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i < n ? col : hexA(C.ink, 0.2); const bh = bs * (0.3 + i * 0.22); roundRect(ctx, x - w * 0.3 + i * bs * 0.26, y - h * 0.24 - bh, bs * 0.17, bh, bs * 0.04); ctx.fill(); }
  if (glyph === 'env' || glyph === 'ok') envelope(ctx, x, y + 0.08 * G * s, 0.4 * G * s, 1);
  if (glyph === 'ok') check(ctx, x, y + 0.36 * G * s, 0.22 * G * s, C.blueSoft);
  if (glyph === 'x') cross(ctx, [x / G, (y + 0.32 * G * s) / G], 0.09 * s, 1);
  ctx.restore();
}
function sine(ctx, x0, x1, y, amp, lam, phase, col, width, a = 1) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.beginPath();
  for (let x = x0; x <= x1 + 1e-6; x += 0.03) { const Y = y + Math.sin((x - x0) * TAU / lam + phase) * amp; if (x === x0) ctx.moveTo(x * G, Y * G); else ctx.lineTo(x * G, Y * G); }
  ctx.stroke(); ctx.restore();
}
// reflection points for the three bounce paths to a receiver point (image method)
const bouncePaths = rx => [
  [TX, rx],
  [TX, [lerp(TX[0], rx[0], (TX[1] - ROOM.y0) / ((TX[1] - ROOM.y0) + (rx[1] - ROOM.y0))), ROOM.y0], rx],
  [TX, [lerp(TX[0], rx[0], (ROOM.y1 - TX[1]) / ((ROOM.y1 - TX[1]) + (ROOM.y1 - rx[1]))), ROOM.y1], rx],
];

function drawScene(ctx, t) {
  const v = veil(t), rx = rxPos(t);
  // room walls (they reflect)
  const wa = 0.55 + 0.45 * env(t, T.walls - 0.1, T.walls + 0.2) * (1 - env(t, 8.6, 9.0));
  ctx.save(); ctx.strokeStyle = hexA(C.ink, 0.5 * wa + 0.2); ctx.lineWidth = 0.14 * G; ctx.lineCap = 'square';
  ctx.strokeRect(ROOM.x0 * G, ROOM.y0 * G, (ROOM.x1 - ROOM.x0) * G, (ROOM.y1 - ROOM.y0) * G); ctx.restore();
  label(ctx, 'walls', 9.0, ROOM.y0 - 0.55, 0.6, C.ink, 'center', 'EBold', env(t, T.walls - 0.1, T.walls + 0.2) * (1 - env(t, 8.6, 9.0)));
  // the signal map: bright where echoes add, dark where they cancel
  const ha = (1 - env(t, 4.5, 5.0) * 0.55) * (1 - env(t, 8.8, 9.2) * 0.0) * (1 - v * 0.6);
  ctx.save(); ctx.globalAlpha *= ha; ctx.imageSmoothingEnabled = true; ctx.drawImage(heatImage(), HM.x0 * G, HM.y0 * G, (HM.x1 - HM.x0) * G, (HM.y1 - HM.y0) * G); ctx.restore();
  // l2: three paths from the sender, with travelling crests
  const ra = env(t, T.rays[0] - 0.1, T.rays[0] + 0.2) * (1 - env(t, 8.6, 9.0));
  if (ra > 0) {
    const paths = bouncePaths(PEAK);
    paths.forEach((pts, i) => {
      const k = ease.inOut(inv(T.rays[0] + i * 0.45, T.rays[0] + i * 0.45 + 0.8, t)); if (k <= 0) return;
      ctx.save(); ctx.globalAlpha *= ra; ctx.lineDashOffset = -t * 40; strokePath(ctx, pts, len(pts) * k, (i === 0 ? 0.13 : 0.1) * G, i === 0 ? C.blueSoft : hexA(C.blueSoft, 0.8), true, [16, 12]); ctx.restore();
      if (k < 1) penTip(ctx, at(pts, len(pts) * k));
    });
    label(ctx, '3 paths', 6.3, 14.35, 0.7, C.blueSoft, 'center', 'EBold', ra * env(t, 6.3, 6.6));
  }
  // the sender
  phoneRX(ctx, TX, t, t > T.msg0[0] - 0.3 && t < T.msg0[0] + 0.1 || (t > T.msg1[0] - 0.3 && t < T.msg1[0] + 0.1) || (t > T.stall[0] - 0.3 && t < T.stall[0] + 0.1) || (t > T.msg2[0] - 0.3 && t < T.msg2[0] + 0.1) ? 'env' : 'none', 1.6, 1);
  // messages: stall in the dead spot, arrive in the strong spot
  const trip = (tt, ok) => { if (t < tt[0] || t > tt[1] + 0.3) return; const q = ease.inOut(inv(tt[0], tt[1], t)), dst = ok ? rxPos(tt[1]) : [rxPos(tt[1])[0] - 0.9, rxPos(tt[1])[1]]; const p = [lerp(TX[0] + 0.7, dst[0] - (ok ? 0.6 : 0), q), lerp(TX[1], dst[1], q)]; envelope(ctx, p[0] * G, p[1] * G, 0.55 * G, clamp((t - tt[0]) / 0.1) * (1 - clamp((t - tt[1]) / 0.2))); if (!ok) fizz(ctx, dst, t, tt[1]); };
  trip(T.msg0, false); trip(T.msg1, true); trip(T.stall, false); trip(T.msg2, true);
  // before / after markers
  const ba = env(t, T.slide[0], T.slide[0] + 0.2) * (1 - env(t, 4.2, 4.6)) + env(t, T.shift[0], T.shift[0] + 0.2) * (1 - v);
  if (ba > 0) {
    ctx.save(); ctx.globalAlpha *= ba; ctx.setLineDash([6, 6]); ctx.strokeStyle = hexA(C.coral, 0.85); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(NUL[0] * G, NUL[1] * G, 0.55 * G, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    cross(ctx, NUL, 0.16, ba);
    const y = Math.max(NUL[1], PEAK[1]) + 1.35, xa = Math.min(NUL[0], PEAK[0]), xb = Math.max(NUL[0], PEAK[0]);
    ctx.save(); ctx.globalAlpha *= ba; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa * G, y * G); ctx.lineTo(xb * G, y * G); for (const x of [xa, xb]) { ctx.moveTo(x * G, (y - 0.2) * G); ctx.lineTo(x * G, (y + 0.2) * G); } ctx.stroke(); ctx.restore();
    label(ctx, "a hand's width", (xa + xb) / 2, y + 0.55, 0.5, C.ink, 'center', 'EBold', ba * (1 - v));
    label(ctx, 'dead spot', NUL[0] + 0.75, NUL[1] - 0.95, 0.5, C.coral, 'left', 'EBold', ba * (1 - v) * (t < 9 ? 1 : env(t, T.shift[0], T.shift[0] + 0.2)));
  }
  label(ctx, '?', 14.6, 13.6, 1.0 * ease.outBack(clamp((t - T.why) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.why) / 0.2) * (1 - env(t, 4.2, 4.5)));
  // the receiving phone
  const rg = (t >= T.msg1[1] && t < 4.4) || (t >= T.msg2[1] && t < 28) ? 'ok' : (t >= T.msg0[1] && t < T.slide[0] + 0.2) || (t >= T.stall[1] && t < T.shift[0]) ? 'x' : 'none';
  phoneRX(ctx, rx, t, rg, 1.6, 1);
  ring(ctx, rx, t - T.msg1[1], C.blueSoft, 0.9); ring(ctx, rx, t - T.msg2[1], C.blueSoft, 0.9);
  // l5: strong and weak spots, centimetres apart (marks on the map)
  const sa = env(t, T.spots - 0.1, T.spots + 0.2) * (1 - env(t, 21.3, 21.7));
  if (sa > 0) {
    ctx.save(); ctx.globalAlpha *= sa; ctx.lineWidth = 4;
    ctx.strokeStyle = C.coral; ctx.beginPath(); ctx.arc(NUL[0] * G, NUL[1] * G, 0.42 * G, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.blueSoft; ctx.beginPath(); ctx.arc(PEAK[0] * G, PEAK[1] * G, 0.42 * G, 0, TAU); ctx.stroke(); ctx.restore();
    label(ctx, 'weak', NUL[0] + 0.6, NUL[1] - 0.75, 0.55, C.coral, 'left', 'EBold', sa);
    label(ctx, 'strong', PEAK[0] - 0.6, PEAK[1] - 0.75, 0.55, C.blueSoft, 'right', 'EBold', sa);
    label(ctx, 'centimetres apart', (NUL[0] + PEAK[0]) / 2, Math.max(NUL[1], PEAK[1]) + 1.25, 0.55, C.ink, 'center', 'EBold', sa * env(t, T.apart - 0.1, T.apart + 0.2));
  }
  // l3: add up / cancel (printed panel below the room)
  const pa = env(t, 8.9, 9.3) * (1 - env(t, 12.9, 13.3));
  if (pa > 0) {
    const ph = -t * 5, y1 = PANEL_Y - 1.5, y2 = PANEL_Y + 1.8, xl = 2.4, xr = 7.4, xs = 9.6, xe = 15.0;
    label(ctx, 'echo 1 + echo 2', (xl + xr) / 2, PANEL_Y - 3.35, 0.5, GREY, 'center', 'EBold', pa * env(t, T.sync - 0.1, T.sync + 0.2));
    const r1 = env(t, T.add - 0.4, T.add) * pa, r2 = env(t, T.cancel - 0.4, T.cancel) * pa;
    sine(ctx, xl, xr, y1 - 0.35, 0.35, 1.6, ph, C.blueSoft, 4, r1); sine(ctx, xl, xr, y1 + 0.35, 0.35, 1.6, ph, hexA(C.blueSoft, 0.7), 4, r1);
    sine(ctx, xs, xe, y1, 0.7, 1.6, ph, C.blue, 7, r1 * env(t, T.add, T.add + 0.25));
    label(ctx, '=', 8.5, y1, 0.8, C.ink, 'center', 'EBold', r1); label(ctx, 'add up', 12.3, y1 - 1.25, 0.6, C.blueSoft, 'center', 'EBold', r1 * env(t, T.add, T.add + 0.25));
    sine(ctx, xl, xr, y2 - 0.35, 0.35, 1.6, ph, C.blueSoft, 4, r2); sine(ctx, xl, xr, y2 + 0.35, 0.35, 1.6, ph + Math.PI, hexA(C.blueSoft, 0.7), 4, r2);
    ctx.save(); ctx.globalAlpha *= r2 * env(t, T.cancel, T.cancel + 0.25); ctx.strokeStyle = C.coral; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(xs * G, y2 * G); ctx.lineTo(xe * G, y2 * G); ctx.stroke(); ctx.restore();
    label(ctx, '=', 8.5, y2, 0.8, C.ink, 'center', 'EBold', r2); label(ctx, 'cancel', 12.3, y2 - 0.8, 0.6, C.coral, 'center', 'EBold', r2 * env(t, T.cancel, T.cancel + 0.25));
  }
  // l4: one wavelength at 2.4 GHz ≈ 12 cm (ruler strip at the bottom of the sheet)
  const wa2 = env(t, 13.0, 13.4) * (1 - env(t, 17.9, 18.3));
  if (wa2 > 0) {
    const L4 = 4.4, x0 = 9.0 - L4 * 1.5, y = RULER_Y;
    sine(ctx, x0, x0 + L4 * 3, y, 0.8, L4, -Math.PI / 2 - t * 3.0, C.blueSoft, 6, wa2);
    label(ctx, '2.4 GHz', 9.0, y - 2.15, 0.7, C.blueSoft, 'center', 'EBold', wa2 * env(t, T.ghz - 0.1, T.ghz + 0.2));
    const ca = wa2 * env(t, T.cm - 0.1, T.cm + 0.2), yb = y + 1.35;
    if (ca > 0) {
      ctx.save(); ctx.globalAlpha *= ca; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo((9.0 - L4 / 2) * G, yb * G); ctx.lineTo((9.0 + L4 / 2) * G, yb * G);
      for (const x of [9.0 - L4 / 2, 9.0 + L4 / 2]) { ctx.moveTo(x * G, (yb - 0.25) * G); ctx.lineTo(x * G, (yb + 0.25) * G); } ctx.stroke(); ctx.restore();
      label(ctx, '≈ 12 cm', 9.0, yb + 0.7, 0.75, C.ink, 'center', 'EBold', ca);
    }
  }
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(9.95 * G, 10.75 * G, 0.1 * G, 1.2 * G); ctx.restore();
  label(ctx, 'Dead spots', 10.25, 11.1, 0.5, C.ink, 'left', 'EBold', a);
  label(ctx, 'signal map', 10.25, 11.7, 0.34, GREY, 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument: signal at the phone (live)
function drawInstrument(ctx, t) {
  const A = (1 - env(t, 8.7, 9.0) + env(t, 18.2, 18.5)) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const lv = Math.pow(level(...rxPos(t)), 0.6), weak = lv < 0.4, Y = 1496;
  ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('signal at the phone', 132, Y - 30);
  ctx.font = '38px EBold'; ctx.fillStyle = weak ? C.coral : C.blueSoft; ctx.fillText(weak ? 'dead spot' : 'strong', 132, Y + 16);
  roundRect(ctx, 420, Y - 17, 520, 34, 12); ctx.strokeStyle = hexA(C.ink, 0.25); ctx.lineWidth = 2; ctx.stroke();
  roundRect(ctx, 420, Y - 17, Math.max(24, 520 * lv), 34, 12); ctx.fillStyle = weak ? C.coral : C.blue; ctx.fill();
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
function drawWorld(ctx, t, cm, thumb = false) {
  const sc = cm.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  if (!thumb) drawCartouche(ctx, 1 - env(t, 3.6, 4.1));
  drawScene(ctx, t);
  const v2 = env(t, 8.9, 9.3) * (1 - env(t, 18.0, 18.4));                    // l3-l4: veil the room while the panels explain
  if (v2 > 0) { ctx.fillStyle = hexA(C.bg, 0.88 * v2); ctx.fillRect((ROOM.x0 - 0.4) * G, (ROOM.y0 - 1.3) * G, (ROOM.x1 - ROOM.x0 + 0.8) * G, (ROOM.y1 - ROOM.y0 + 1.7) * G); }
  const v = veil(t);                                                         // paper veil for the CTA
  if (v > 0) { ctx.fillStyle = hexA(C.bg, 0.7 * v); ctx.fillRect(0, 0, SHEET.w * G, SHEET.h * G); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
}
export function drawFrame(ctx, t, assets) {
  drawWorld(ctx, t, cam(t));
  drawInstrument(ctx, t);
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '22px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not to scale · generic principle, not a product feature', 96, 1612);
  if (assets.icon) {                                                        // CTA signature: official icon + wordmark in the safe area
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 364, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 364, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 444, 1495); ctx.restore(); }
  }
}

// separate vertical thumbnail tied to the hook: two SIM-less phones, a message mid-hop; 4 large words
export function drawThumb(ctx, assets) {
  const t = 0.9;
  drawWorld(ctx, t, { x: 11.6, y: 15.9, z: 1.45 }, true);
  ctx.save(); const g = ctx.createLinearGradient(0, 120, 0, 900); g.addColorStop(0, 'rgba(8,11,10,0.94)'); g.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900); ctx.restore();
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const big = (s, y, col, size) => { ctx.font = `${size}px EDisplay`; ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(8,11,10,0.95)'; ctx.strokeText(s, 540, y); ctx.fillStyle = col; ctx.fillText(s, 540, y); };
  big('DEAD SPOT?', 360, C.coral, 132); big('MOVE IT.', 540, C.blueSoft, 150);
  ctx.restore();
  if (assets.icon) { ctx.save(); roundRect(ctx, 384, 1640, 72, 72, 16); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 384, 1640, 72, 72); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '50px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 472, 1677); ctx.restore(); }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  add(T.msg0[0], 'zip', 0.18); add(T.msg0[1], 'fizz', 0.22); add(T.slide[0], 'sweep', 0.16, { dur: 0.8 }); add(T.msg1[0], 'zip', 0.18); add(T.msg1[1], 'stop', 0.24); add(T.why, 'retry', 0.14);
  add(T.rays[0], 'pen', 0.22, { dur: 1.7 }); add(T.walls, 'thunk', 0.18);
  add(T.sync, 'sweep', 0.12, { dur: 0.4 }); add(T.add, 'land', 0.22); add(T.cancel, 'offline', 0.16);
  add(T.ghz, 'click', 0.16); add(T.cm, 'stamp', 0.2);
  add(T.spots, 'stop', 0.18); add(T.apart, 'click', 0.14); add(T.back[0], 'sweep', 0.12, { dur: 0.7 });
  add(T.stall[0], 'zip', 0.16); add(T.stall[1], 'fizz', 0.2); add(T.shift[0], 'sweep', 0.16, { dur: 0.8 }); add(T.msg2[0], 'zip', 0.18); add(T.msg2[1], 'stop', 0.24);
  add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
