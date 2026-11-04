// Meshline production 30s, Hindi batch 04: "बिना मोबाइल डेटा जीपीएस, और ऑफ़लाइन नक्शा" (GPS location without mobile data; map tiles
// need downloading). Same Transit-Map world and Hindi recipe as batch 03 (charcoal printed sheet, electric-blue ink, white
// stations, pen tips, paper veils, Devanagari labels, screen-space caption plate + one screen-space instrument).
// New props: printed satellites with one-way signal rays, a tiled street map that is blank until an area is saved, an
// internet zone feeding tiles through a cut (data off) or a Wi-Fi router, a saved-area frame with a check stamp, and a route
// the phone follows. Generic GPS / map-app behaviour only (GPS.gov, Google Maps Help); no Meshline feature claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';
import { CAP } from './caplayout.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000, HF = 'HBold, EBold', HS = 'HSemi, ESemi';

// ------------------------------------------------------------------ map (G units)
const GRID = { x0: 3.6, y0: 15.6, cols: 5, rows: 3, s: 2.4 };
const SAVED = { c0: 1, c1: 4 };                                            // the saved area covers columns 1–4 (the whole route)
const START = [7.2, 21.6], DEST = [14.4, 16.8];
const ROUTE = [START, [9.6, 21.6], [12.0, 19.2], [14.4, 19.2], DEST];
const SATS = [[3.8, 9.5], [7.9, 8.5], [11.3, 9.2]];
const NETZ = { x0: 12.6, y0: 11.2, x1: 16.8, y1: 13.4 };
const NETPATH = [[14.4, 13.4], [14.4, 15.6]], CUTP = [14.4, 14.5];
const STREETS = [                                                           // printed street network (shown only on loaded tiles)
  [[3.6, 16.8], [15.6, 16.8]], [[3.6, 19.2], [15.6, 19.2]], [[3.6, 21.6], [15.6, 21.6]],
  [[4.8, 15.6], [4.8, 22.8]], [[7.2, 15.6], [7.2, 22.8]], [[9.6, 15.6], [9.6, 22.8]], [[12.0, 15.6], [12.0, 22.8]], [[14.4, 15.6], [14.4, 22.8]],
  [[9.6, 21.6], [12.0, 19.2]], [[4.8, 19.2], [7.2, 16.8]], [[12.0, 22.8], [14.4, 20.4]],
];
const LANES = [[[6.0, 18.0], [9.6, 18.0]], [[10.8, 16.8], [10.8, 19.2]], [[12.0, 20.4], [15.6, 20.4]], [[8.4, 19.2], [8.4, 22.8]], [[13.2, 15.6], [13.2, 16.8]]];
const T = {
  badge: 0.5, query: 2.9,
  sats: 4.6, rays: [5.6, 6.4], fix: [7.9, 9.0], inst: 4.3,
  dataHl: [10.6, 12.5],
  noStreets: 13.3, netIn: 14.9, tries: [15.5, 16.3],
  router: 18.4, route: [19.2, 20.1], frame: [19.7, 20.5], fill: [19.0, 20.7], saved: 20.8, check: 21.5,
  satHl: 22.3, mapHl: 24.3, travel: [22.6, 25.3], cta: 26.0,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const RLEN = len(ROUTE);
const tiles = [];
for (let r = 0; r < GRID.rows; r++) for (let c = 0; c < GRID.cols; c++) {
  const x = GRID.x0 + c * GRID.s, y = GRID.y0 + r * GRID.s, saved = c >= SAVED.c0 && c <= SAVED.c1;
  const d = Math.hypot(x + GRID.s / 2 - NETPATH[1][0], y + GRID.s / 2 - NETPATH[1][1]);
  tiles.push({ x, y, saved, t0: saved ? lerp(T.fill[0], T.fill[1] - 0.3, d / 9.5) : Infinity });
}
function phonePos(t) {                                                      // the phone follows the route in the takeaway, then loops
  if (t < T.travel[0]) return START;
  if (t < T.travel[1]) return at(ROUTE, RLEN * ease.inOut(inv(...T.travel, t)));
  const u = ((t - T.travel[1]) / 3.0) % 2, k = ease.inOut(u < 1 ? 1 - u : u - 1);
  return at(ROUTE, RLEN * k);
}

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const WIDE = { x: 9.8, y: 16.2, z: 0.86 };
function cam(t) {
  return K(t, [
    [0, { x: 7.2, y: 20.3, z: 1.35 }], [4.0, { x: 7.2, y: 20.2, z: 1.38 }],
    [4.9, { x: 8.6, y: 15.4, z: 0.9 }], [9.8, { x: 8.6, y: 15.5, z: 0.915 }],          // up to the satellites
    [10.6, WIDE], [12.6, { x: 9.8, y: 16.2, z: 0.865 }],
    [13.4, { x: 10.0, y: 16.0, z: 0.9 }], [17.2, { x: 10.1, y: 16.0, z: 0.91 }],     // the map and the internet
    [18.0, { x: 10.2, y: 16.5, z: 0.95 }], [21.9, { x: 10.2, y: 16.6, z: 0.965 }],   // saving the area on Wi-Fi
    [22.6, WIDE], [26.0, { x: 9.8, y: 16.2, z: 0.87 }], [30, { x: 9.8, y: 16.35, z: 0.9 }],
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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / Hindi batch 03)
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
function label(ctx, txt, x, y, size, col = C.ink, align = 'left', font = HF, alpha = 1) {
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
function check(ctx, x, y, s, col, a = 1) {                                 // ✓ drawn as strokes (screen or sheet px)
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.45, y); ctx.lineTo(x - s * 0.1, y + s * 0.35); ctx.lineTo(x + s * 0.5, y - s * 0.35); ctx.stroke(); ctx.restore();
}
function fizz(ctx, p, t, t0) {
  const k = t - t0; if (k < 0 || k > 0.6) return;
  ctx.strokeStyle = hexA(C.coral, 1 - k / 0.6); ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + hash(i + t0) * 0.6, d0 = (0.2 + k * 0.9) * G, d1 = d0 + 0.18 * G; ctx.beginPath(); ctx.moveTo(p[0] * G + Math.cos(a) * d0, p[1] * G + Math.sin(a) * d0); ctx.lineTo(p[0] * G + Math.cos(a) * d1, p[1] * G + Math.sin(a) * d1); ctx.stroke(); }
}

// ------------------------------------------------------------------ props (generic glyphs, no app UI)
function phone(ctx, p, lit = 0, s = 1) {
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  if (lit > 0) { ctx.fillStyle = hexA(C.blue, 0.85 * lit); roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill(); }
}
function satellite(ctx, p, k, glow = 0) {                                  // printed satellite: body + two solar panels + dish
  if (k <= 0) return; const x = p[0] * G, y = p[1] * G;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.35);
  if (glow > 0) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1.0 * G); g.addColorStop(0, hexA(C.blueSoft, 0.35 * glow)); g.addColorStop(1, hexA(C.blueSoft, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1.0 * G, 0, TAU); ctx.fill(); }
  for (const sx of [-1, 1]) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(sx * 0.32 * G - (sx < 0 ? 0.62 * G : 0) + 3, -0.2 * G + 5, 0.62 * G, 0.4 * G);
    ctx.fillStyle = C.blue; ctx.fillRect(sx * 0.32 * G - (sx < 0 ? 0.62 * G : 0), -0.2 * G, 0.62 * G, 0.4 * G);
    ctx.strokeStyle = hexA(C.ink, 0.6); ctx.lineWidth = 1.5; for (let i = 1; i < 3; i++) { const gx = sx * 0.32 * G - (sx < 0 ? 0.62 * G : 0) + i * 0.62 * G / 3; ctx.beginPath(); ctx.moveTo(gx, -0.2 * G); ctx.lineTo(gx, 0.2 * G); ctx.stroke(); }
  }
  ctx.fillStyle = C.ink; roundRect(ctx, -0.26 * G, -0.3 * G, 0.52 * G, 0.6 * G, 0.08 * G); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.06 * G; ctx.beginPath(); ctx.arc(0, 0.5 * G, 0.18 * G, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.restore();
}
function router(ctx, p, lit = 0) {
  const x = p[0] * G, y = p[1] * G, w = 0.95 * G, h = 0.5 * G;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.07 * G; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w * 0.3, y - h / 2); ctx.lineTo(x - w * 0.36, y - h / 2 - 0.32 * G); ctx.moveTo(x + w * 0.3, y - h / 2); ctx.lineTo(x + w * 0.36, y - h / 2 - 0.32 * G); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.12 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.12 * G); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = lit > 0 ? hexA(C.blue, 0.4 + 0.6 * lit) : '#9AA39F'; ctx.beginPath(); ctx.arc(x - 0.2 * G + i * 0.2 * G, y, 0.055 * G, 0, TAU); ctx.fill(); }
}
function tileToken(ctx, p, a = 1) {                                        // a map tile in transit (small printed square with streets)
  const x = p[0] * G, y = p[1] * G, s = 0.42 * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - s / 2 + 3, y - s / 2 + 5, s, s);
  ctx.fillStyle = C.ink; ctx.fillRect(x - s / 2, y - s / 2, s, s); ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x - s / 2, y); ctx.lineTo(x + s / 2, y); ctx.moveTo(x, y - s / 2); ctx.lineTo(x, y + s / 2); ctx.stroke(); ctx.restore();
}

// ------------------------------------------------------------------ beats
function drawMap(ctx, t) {
  const satHl = 0, mapHl = env(t, T.mapHl, T.mapHl + 0.4) * (1 - env(t, T.cta + 1.5, T.cta + 2.2));
  const blankHl = env(t, T.noStreets, T.noStreets + 0.3) * (1 - env(t, T.fill[0], T.fill[0] + 0.4));
  for (const tl of tiles) {
    const k = clamp((t - tl.t0) / 0.35), x = tl.x * G, y = tl.y * G, s = GRID.s * G;
    ctx.fillStyle = k > 0 ? `rgba(${lerp(20, 26, k)},${lerp(27, 36, k)},${lerp(24, 31, k)},1)` : '#141B18'; ctx.fillRect(x, y, s, s);
    if (k < 1) {                                                            // blank tile: faint hatch (no streets yet)
      ctx.save(); ctx.globalAlpha *= (1 - k) * (0.5 + 0.5 * blankHl); ctx.beginPath(); ctx.rect(x, y, s, s); ctx.clip();
      ctx.strokeStyle = blankHl > 0.3 ? hexA(C.coral, 0.22) : hexA(C.ink, 0.07); ctx.lineWidth = 2;
      for (let i = -4; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x + i * 0.4 * G, y); ctx.lineTo(x + i * 0.4 * G + s, y + s); ctx.stroke(); }
      ctx.restore();
    }
    if (k > 0) {                                                            // loaded tile: printed streets, clipped to the tile
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, s, s); ctx.clip(); ctx.globalAlpha *= k;
      for (const st of LANES) strokePath(ctx, st, 99, 0.06 * G, hexA(C.ink, 0.28), false);
      for (const st of STREETS) strokePath(ctx, st, 99, (0.11 + 0.03 * mapHl) * G, hexA(C.ink, 0.5 + 0.3 * mapHl), false);
      ctx.restore();
      const pop = clamp(1 - Math.abs(t - tl.t0 - 0.15) / 0.2);
      if (pop > 0) { ctx.strokeStyle = hexA(C.blueSoft, 0.8 * pop); ctx.lineWidth = 3; ctx.strokeRect(x + 3, y + 3, s - 6, s - 6); }
    }
    ctx.strokeStyle = hexA(C.blueSoft, 0.12); ctx.lineWidth = 1.5; ctx.strokeRect(x, y, s, s);
  }
  label(ctx, 'सड़कें नहीं', GRID.x0 + 2.5 * GRID.s, GRID.y0 + 0.75 * GRID.s, 0.5, C.coral, 'center', HF, blankHl);
  // saved-area frame + check stamp
  const fk = ease.inOut(inv(...T.frame, t));
  if (fk > 0) {
    const x0 = GRID.x0 + SAVED.c0 * GRID.s - 0.12, x1 = GRID.x0 + (SAVED.c1 + 1) * GRID.s + 0.12, y0 = GRID.y0 - 0.12, y1 = GRID.y0 + GRID.rows * GRID.s + 0.12;
    const fr = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
    strokePath(ctx, fr, len(fr) * fk, 0.09 * G, C.blueSoft, false, [14, 9]);
    if (fk < 1) penTip(ctx, at(fr, len(fr) * fk));
    label(ctx, 'सेव इलाका', x0 + 0.15, y0 - 0.5, 0.46, C.blueSoft, 'left', HF, env(t, T.frame[0] + 0.3, T.frame[1]));
    const ck = ease.outBack(clamp((t - T.check) / 0.35));
    if (ck > 0) {
      const cx = x1 - 0.1, cy = y1 + 0.42;                                  // clear of the instrument plate
      ctx.save(); ctx.translate(cx * G, cy * G); ctx.scale(ck, ck);
      ctx.font = `${0.36 * G}px ${HF}`; const tw = ctx.measureText('ऑफ़लाइन जाँचा').width, pw = tw + 0.95 * G;   // pill sized to its text
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, -pw + 3, -0.36 * G + 5, pw, 0.72 * G, 0.36 * G); ctx.fill();
      ctx.fillStyle = C.ink; roundRect(ctx, -pw, -0.36 * G, pw, 0.72 * G, 0.36 * G); ctx.fill();
      check(ctx, -pw + 0.38 * G, 0, 0.4 * G, C.blue);
      ctx.fillStyle = C.charcoal; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('ऑफ़लाइन जाँचा', -pw + 0.7 * G, 0.03 * G);
      ctx.restore();
    }
  }
  // route to the destination (pen-drawn once the area is saved)
  const rk = ease.inOut(inv(...T.route, t));
  if (rk > 0) {
    strokePath(ctx, ROUTE, RLEN * rk, (0.2 + 0.04 * mapHl) * G, C.blue);
    if (rk < 1) penTip(ctx, at(ROUTE, RLEN * rk));
    const pk = ease.outBack(clamp((t - T.route[1] + 0.1) / 0.35));
    if (pk > 0) {                                                           // destination pin
      const x = DEST[0] * G, y = DEST[1] * G;
      ctx.save(); ctx.translate(x, y); ctx.scale(pk, pk); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(3, -0.55 * G + 5, 0.3 * G, 0, TAU); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-0.24 * G, -0.45 * G); ctx.arc(0, -0.55 * G, 0.3 * G, Math.PI * 0.85, Math.PI * 0.15); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(0, -0.55 * G, 0.12 * G, 0, TAU); ctx.fill(); ctx.restore();
      label(ctx, 'मंज़िल', DEST[0] + 0.45, DEST[1] - 0.6, 0.42, C.ink, 'left', HF, pk > 0 ? clamp(pk) : 0);
    }
  }
}
function drawSats(ctx, t, ph) {
  const satHl = env(t, T.satHl, T.satHl + 0.4) * (1 - env(t, T.mapHl - 0.2, T.mapHl + 0.3));
  const rk = ease.inOut(inv(...T.rays, t));
  SATS.forEach((s, i) => {
    const k = ease.outBack(clamp((t - T.sats - i * 0.18) / 0.35));
    satellite(ctx, s, k, satHl);
    ring(ctx, s, t - T.sats - i * 0.18, C.blueSoft, 0.8);
    if (rk <= 0) return;
    const tgt = [ph[0], ph[1] - 0.7], v = [tgt[0] - s[0], tgt[1] - s[1]], L = Math.hypot(...v), u = [v[0] / L, v[1] / L];
    const a = [s[0] + u[0] * 0.55, s[1] + u[1] * 0.55], b = [tgt[0] - u[0] * 0.25, tgt[1] - u[1] * 0.25], seg = [a, b];
    strokePath(ctx, seg, len(seg) * rk, (0.07 + 0.03 * satHl) * G, hexA(C.blueSoft, 0.55 + 0.35 * satHl), false, [8, 10]);
    if (rk >= 1) {                                                          // arrowhead: the signal only comes down (one-way)
      const x = b[0] * G, y = b[1] * G, an = Math.atan2(u[1], u[0]);
      ctx.fillStyle = C.blueSoft; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(an - 0.45) * 0.32 * G, y - Math.sin(an - 0.45) * 0.32 * G); ctx.lineTo(x - Math.cos(an + 0.45) * 0.32 * G, y - Math.sin(an + 0.45) * 0.32 * G); ctx.closePath(); ctx.fill();
      for (let j = 0; j < 2; j++) {                                         // pulses travel down the ray, never up
        const q = ((t - T.rays[1]) / 1.4 + j / 2 + i * 0.21) % 1, p = at(seg, len(seg) * q);
        ctx.fillStyle = hexA(C.ink, 0.95 * Math.sin(q * Math.PI)); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.11 * G, 0, TAU); ctx.fill();
      }
    } else penTip(ctx, at(seg, len(seg) * rk));
  });
  label(ctx, 'एकतरफ़ा सिग्नल', 6.6, 13.2, 0.46, C.blueSoft, 'center', HF, env(t, T.rays[0] + 0.3, T.rays[1]) * (1 - env(t, 12.4, 12.9)));
  label(ctx, 'सैटेलाइट → जगह', SATS[1][0], SATS[1][1] + 1.25, 0.5, C.ink, 'center', HF, satHl > 0 ? satHl : 0);
}
function drawNet(ctx, t) {
  const za = env(t, T.netIn, T.netIn + 0.35); if (za <= 0) return;
  ctx.save(); ctx.globalAlpha *= za; ctx.fillStyle = hexA(C.blue, 0.08); roundRect(ctx, NETZ.x0 * G, NETZ.y0 * G, (NETZ.x1 - NETZ.x0) * G, (NETZ.y1 - NETZ.y0) * G, 0.5 * G); ctx.fill();
  ctx.strokeStyle = hexA(C.blueSoft, 0.55); ctx.lineWidth = 2.5; ctx.setLineDash([4, 10]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  label(ctx, 'इंटरनेट', (NETZ.x0 + NETZ.x1) / 2, (NETZ.y0 + NETZ.y1) / 2, 0.56, C.ink, 'center', HF, za);
  const viaWifi = clamp((t - T.router) / 0.3);
  // mobile data is off: the path into the map is cut, tiles fizzle at the cut; on Wi-Fi the router carries them
  if (viaWifi < 1) { ctx.save(); ctx.globalAlpha *= za * (1 - viaWifi); strokePath(ctx, NETPATH, len(NETPATH), 0.12 * G, hexA(C.coral, 0.7), false, [10, 10]); ctx.restore(); cross(ctx, CUTP, 0.26, za * (1 - viaWifi)); }
  if (viaWifi > 0) { ctx.save(); ctx.globalAlpha *= viaWifi; strokePath(ctx, NETPATH, len(NETPATH), 0.2 * G, C.blueSoft); ctx.restore(); const s = ease.outBack(viaWifi); ctx.save(); ctx.translate(CUTP[0] * G, CUTP[1] * G); ctx.scale(s, s); ctx.translate(-CUTP[0] * G, -CUTP[1] * G); router(ctx, CUTP, clamp((t - T.fill[0]) / 0.3) * (t < T.fill[1] + 0.3 ? 1 : 0.4)); ctx.restore(); }
  label(ctx, 'नक्शा: इंटरनेट से', NETZ.x0 - 0.3, NETZ.y1 + 0.7, 0.42, C.ink, 'right', HF, env(t, T.netIn + 0.2, T.netIn + 0.5) * (1 - env(t, T.router - 0.2, T.router + 0.1)));
  label(ctx, 'वाई-फ़ाई', CUTP[0] - 0.75, CUTP[1], 0.44, C.blueSoft, 'right', HF, env(t, T.router + 0.1, T.router + 0.4) * (1 - env(t, 22.3, 22.8)));
  for (let k = 0; k < 2; k++) {                                             // attempts over mobile data: stopped at the cut
    const t0 = T.tries[0] + k * 0.8, q = inv(t0 - 0.5, t0, t);
    if (q > 0 && q < 1) tileToken(ctx, at([NETPATH[0], CUTP], len([NETPATH[0], CUTP]) * ease.in(q)), 1);
    fizz(ctx, CUTP, t, t0);
  }
  if (t > T.fill[0] - 0.4 && t < T.fill[1]) for (let j = 0; j < 4; j++) {     // via Wi-Fi: tiles stream into the map
    const q = ((t - T.fill[0] + 0.4) / 0.5 + j / 4) % 1; tileToken(ctx, at(NETPATH, len(NETPATH) * q), Math.sin(q * Math.PI));
  }
}
function drawPhone(ctx, t, ph) {
  // location halo (the blue dot of a map app), fix circles closing in, lock
  const lock = clamp((t - T.fix[1]) / 0.25);
  for (let k = 0; k < 2; k++) { const age = ((t + k * 0.8) % 1.6) / 1.6; ctx.strokeStyle = hexA(C.blue, 0.6 * (1 - age)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ph[0] * G, ph[1] * G, (0.7 + 0.9 * age) * G, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = hexA(C.blue, 0.28); ctx.beginPath(); ctx.arc(ph[0] * G, ph[1] * G, 0.75 * G, 0, TAU); ctx.fill();
  for (let i = 0; i < 3; i++) {
    const q = inv(T.fix[0] + i * 0.12, T.fix[1], t); if (q <= 0 || q >= 1) continue;
    ctx.strokeStyle = hexA(C.ink, 0.8 * (1 - q * 0.5)); ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.arc((ph[0] + Math.cos(i * 2.1) * (1 - q) * 0.9) * G, (ph[1] + Math.sin(i * 2.1) * (1 - q) * 0.9) * G, lerp(3.0, 0.8, ease.inOut(q)) * G, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  }
  ring(ctx, ph, t - T.fix[1], C.ink, 1.1);
  phone(ctx, ph, 0.35 + 0.5 * lock * clamp(1 - (t - T.fix[1]) / 0.8), 1.1);
  label(ctx, 'आपकी जगह', ph[0] + 0.85, ph[1] + 0.05, 0.46, C.ink, 'left', HF, lock * (1 - env(t, T.noStreets - 0.3, T.noStreets)));
  label(ctx, 'आपका फ़ोन', ph[0], ph[1] + 1.05, 0.4, C.ink, 'center', HF, 1 - env(t, T.travel[0] - 0.3, T.travel[0]));
  // "mobile data off" tag on the phone
  const k = ease.outBack(clamp((t - T.badge) / 0.35)) * (1 - env(t, T.travel[0] - 0.3, T.travel[0]));
  if (k > 0) {
    const x = (ph[0] + 0.55) * G, y = (ph[1] - 0.95) * G, hl = env(t, T.dataHl[0], T.dataHl[0] + 0.3) * (1 - env(t, T.dataHl[1] - 0.3, T.dataHl[1]));
    ctx.save(); ctx.translate(x, y); ctx.scale(k * (1 + 0.12 * hl), k * (1 + 0.12 * hl));
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, 3, -0.34 * G + 5, 2.15 * G, 0.68 * G, 0.34 * G); ctx.fill();
    ctx.fillStyle = C.coral; roundRect(ctx, 0, -0.34 * G, 2.15 * G, 0.68 * G, 0.34 * G); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = `${0.36 * G}px ${HF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('डेटा बंद', 1.075 * G, 0.03 * G);
    ctx.restore();
  }
  label(ctx, '?', ph[0] - 1.05, ph[1] - 0.6, 0.85 * ease.outBack(clamp((t - T.query) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.query) / 0.25) * (1 - env(t, 4.3, 4.7)));
  label(ctx, 'सेव नक्शा → सड़कें', GRID.x0 + 2.5 * GRID.s + 0.6, GRID.y0 + GRID.rows * GRID.s + 0.62, 0.5, C.ink, 'center', HF, env(t, T.mapHl, T.mapHl + 0.4) * (1 - env(t, T.cta + 1.5, T.cta + 2.2)));
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(3.9 * G, 16.25 * G, 0.1 * G, 1.3 * G); ctx.restore();
  label(ctx, 'जीपीएस बनाम नक्शा', 4.2, 16.6, 0.52, C.ink, 'left', HF, a);
  label(ctx, 'जगह कहाँ से, सड़कें कहाँ से?', 4.2, 17.27, 0.38, '#B5BDB8', 'left', HS, a);
}

// ------------------------------------------------------------------ screen-space instrument: location vs streets panel
function drawInstrument(ctx, t) {
  const a = env(t, T.inst, T.inst + 0.5) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  const rows = [1452, 1500, 1548];
  const hl = [env(t, T.dataHl[0], T.dataHl[0] + 0.3) * (1 - env(t, T.dataHl[1] - 0.3, T.dataHl[1])),
    Math.max(env(t, T.dataHl[0], T.dataHl[0] + 0.3) * (1 - env(t, T.dataHl[1] - 0.3, T.dataHl[1])), env(t, T.satHl, T.satHl + 0.3) * (1 - env(t, T.mapHl - 0.2, T.mapHl + 0.2))),
    env(t, T.mapHl, T.mapHl + 0.3)];
  rows.forEach((y, i) => { if (hl[i] > 0) { ctx.fillStyle = hexA(i === 0 ? C.coral : C.blue, 0.18 * hl[i]); roundRect(ctx, 108, y - 22, 864, 44, 12); ctx.fill(); } });
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  // row 0: mobile data off
  ctx.font = `25px ${HF}`; ctx.fillStyle = C.ink; ctx.fillText('मोबाइल डेटा', 132, rows[0]);
  ctx.fillStyle = C.coral; ctx.fillText('बंद', 400, rows[0]);
  roundRect(ctx, 878, rows[0] - 14, 56, 28, 14); ctx.fillStyle = '#2A322F'; ctx.fill(); ctx.strokeStyle = hexA(C.coral, 0.8); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(892, rows[0], 10, 0, TAU); ctx.fill();
  // row 1: location ← satellite signals
  ctx.fillStyle = C.ink; ctx.fillText('जगह', 132, rows[1]);
  const lock = clamp((t - T.fix[1]) / 0.3);
  ctx.fillStyle = hexA(C.blueSoft, Math.max(0.35, env(t, T.rays[0], T.rays[1]))); ctx.fillText('सैटेलाइट सिग्नल से', 400, rows[1]);
  if (lock > 0) check(ctx, 906, rows[1], 30, C.blueSoft, lock); else { ctx.fillStyle = hexA(C.ink, 0.4); ctx.fillText('…', 896, rows[1]); }
  // row 2: streets ← map (internet, then the saved map)
  const r2 = env(t, 12.9, 13.3), saved = clamp((t - T.saved) / 0.3);
  ctx.fillStyle = hexA(C.ink, Math.max(0.35, r2)); ctx.fillText('सड़कें', 132, rows[2]);
  if (r2 > 0) {
    const out = clamp((t - T.saved) / 0.15), inn = clamp((t - T.saved - 0.15) / 0.2);   // sequential swap, never overlapping
    ctx.fillStyle = hexA(C.ink, r2 * (1 - out)); ctx.fillText('नक्शा: इंटरनेट से', 400, rows[2]);
    ctx.fillStyle = hexA(C.blueSoft, inn); ctx.fillText('सेव नक्शे से', 400, rows[2]);
    ctx.fillStyle = hexA(C.coral, r2 * (1 - out)); ctx.font = '32px EDisplay'; ctx.fillText('?', 898, rows[2]);
    check(ctx, 906, rows[2], 30, C.blueSoft, inn);
  }
  ctx.restore();
}

// ------------------------------------------------------------------ captions (screen space; Devanagari, upper safe band y 340–520, x 90–990)
function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b) continue;
    const a = clamp((t - c.a) / 0.16) * (1 - clamp((t - (c.b - 0.14)) / 0.14));
    ctx.save(); ctx.globalAlpha = a; ctx.font = `${CAP.size}px ${CAP.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const w = Math.max(...c.l.map(s => ctx.measureText(s).width)) + CAP.pad;
    roundRect(ctx, 540 - w / 2, CAP.plateY, w, c.l.length > 1 ? CAP.plateH2 : CAP.plateH1, 22); ctx.fillStyle = 'rgba(8,12,10,0.86)'; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = C.ink;
    ctx.fillText(c.l[0], 540, CAP.base1); if (c.l.length > 1) ctx.fillText(c.l[1], 540, CAP.base2);
    ctx.restore();
  }
}

// ------------------------------------------------------------------ frame
export function drawFrame(ctx, t, assets) {
  const cm = cam(t), sc = cm.z, ph = phonePos(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  drawMap(ctx, t);
  drawCartouche(ctx, 1 - env(t, 3.9, 4.4));
  drawNet(ctx, t);
  drawSats(ctx, t, ph);
  drawPhone(ctx, t, ph);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
  drawInstrument(ctx, t);
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = `22px HMed, EMed`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('सांकेतिक नक्शा · पैमाने पर नहीं · सामान्य जीपीएस/मैप व्यवहार, ऐप की सुविधा नहीं', 96, 1612);
  if (assets.icon) {                                                        // CTA signature: official icon + wordmark in the safe area
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 404, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 404, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 484, 1495); ctx.restore(); }
  }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  add(T.badge, 'stamp', 0.3); add(T.query, 'retry', 0.28);
  add(4.0, 'sweep', 0.28, { dur: 0.9 }); for (let i = 0; i < 3; i++) add(T.sats + i * 0.18, 'stop', 0.25);
  add(T.rays[0], 'pen', 0.4, { dur: T.rays[1] - T.rays[0] });
  for (let t = T.rays[1] + 0.1; t < T.fix[0]; t += 0.7) add(t, 'tick', 0.16);
  add(T.fix[0], 'sweep', 0.2, { dur: 0.9 }); add(T.fix[1], 'chime', 0.33);
  add(10.0, 'sweep', 0.22, { dur: 0.8 }); add(T.dataHl[0], 'click', 0.3);
  add(T.noStreets, 'thunk', 0.3); add(T.netIn, 'callout', 0.28);
  for (let k = 0; k < 2; k++) add(T.tries[0] + k * 0.8, 'fizz', 0.32);
  add(T.router, 'stop', 0.35); add(T.router + 0.05, 'click', 0.3);
  for (const tl of tiles) if (tl.saved) add(tl.t0 + 0.1, 'turn', 0.22);
  add(T.route[0], 'pen', 0.4, { dur: T.route[1] - T.route[0] }); add(T.frame[0], 'penShort', 0.3, { dur: 0.6 });
  add(T.check, 'stamp', 0.35);
  add(T.satHl, 'callout', 0.26); add(T.mapHl, 'callout', 0.26); add(T.travel[0], 'dots', 0.25, { dur: T.travel[1] - T.travel[0] });
  add(T.cta, 'chime', 0.32);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
