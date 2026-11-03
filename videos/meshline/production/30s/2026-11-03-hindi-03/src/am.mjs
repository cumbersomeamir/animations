// Meshline production 30s, Hindi batch 03: "एयरप्लेन मोड असल में क्या बंद करता है?" (what airplane mode actually switches off).
// Same Transit-Map world as batch-02 / store-and-forward / round-02 (charcoal printed sheet, electric-blue ink, white stations,
// pen tips, paper veils, printed labels, screen-space caption plate + one screen-space instrument). All text is Hindi
// (Noto Sans Devanagari, Inter fallback for the Latin wordmark). Generic phone behaviour only (Android developer docs,
// Google Android help, Apple support, Bluetooth SIG); no Meshline radio stack, range or feature claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';
import { CAP } from './caplayout.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000, HF = 'HBold, EBold', HS = 'HSemi, ESemi';

// ------------------------------------------------------------------ map (G units, octilinear routes)
const PHONE = [8.0, 19.0], EARBUDS = [4.8, 21.6], NEAR = [10.9, 21.8], FAR = [15.6, 22.6], TOWER = [4.2, 11.2], ROUTER = [13.2, 16.6];
const CELL = [[8.0, 18.15], [8.0, 15.4], [4.2, 11.6]];                    // phone → mobile tower (cellular radio)
const WIFI = [[8.75, 19.0], [10.8, 19.0], [13.2, 16.6]];                  // phone → Wi-Fi router
const NET = [[13.2, 16.1], [13.2, 12.75]];                                // router → internet
const BT1 = [[7.45, 19.55], [5.4, 21.6]], BT2 = [[8.55, 19.55], [10.35, 21.35]];   // direct Bluetooth links (earbuds, nearby phone)
const NETZ = { x0: 11.0, y0: 9.6, x1: 16.4, y1: 12.6 };
const REACH = 4.3;
const T = {
  apOn: 1.0, query: 2.1,
  cellDraw: [3.8, 5.0], cellCut: 6.05, towerOff: 6.8,
  wifiDraw: [8.9, 9.6], radiosOff: 10.32, radiosOn: 11.5,
  nearIn: 14.35, bt2Draw: [14.45, 14.95], token: [15.2, 15.9],
  reach: [18.2, 18.9], far: 18.7,
  netDraw: [20.15, 20.6], hop: [20.45, 21.0, 21.6],
  cutHl: 23.15, radiosHl: 24.95, cta: 26.25, inst: 3.7,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
// radio states (what the instrument shows and the map inks): 1 = on, 0 = off
const apState = t => clamp((t - T.apOn) / 0.2);
const cellOn = t => 1 - clamp((t - T.cellCut) / 0.25);
const localOn = t => 1 - clamp((t - T.radiosOff) / 0.25) + clamp((t - T.radiosOn) / 0.25);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const WIDE = { x: 9.6, y: 17.6, z: 0.86 };
function cam(t) {
  return K(t, [
    [0, { x: 6.8, y: 20.0, z: 1.45 }], [3.4, { x: 6.8, y: 19.9, z: 1.48 }],
    [4.4, { x: 6.6, y: 15.4, z: 1.12 }], [8.4, { x: 6.6, y: 15.5, z: 1.14 }],          // up the cellular line to the tower
    [9.3, { x: 9.6, y: 16.6, z: 0.95 }], [12.9, { x: 9.6, y: 16.7, z: 0.965 }],       // all three radios
    [13.8, { x: 7.9, y: 20.3, z: 1.35 }], [17.2, { x: 7.9, y: 20.35, z: 1.38 }],      // the local cluster
    [18.3, WIDE], [22.4, { x: 9.6, y: 17.6, z: 0.865 }], [26.2, { x: 9.5, y: 17.5, z: 0.875 }], [30, { x: 9.5, y: 17.45, z: 0.9 }],
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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02)
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
function cross(ctx, p, s, a = 1) {                                        // coral × drawn as strokes (no glyph)
  if (a <= 0) return; const x = p[0] * G, y = p[1] * G, r = s * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineWidth = 0.1 * G; ctx.lineCap = 'round'; ctx.strokeStyle = C.coral;
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); ctx.restore();
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
function phone(ctx, p, lit = 0, s = 1) {
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  if (lit > 0) { ctx.fillStyle = hexA(C.blue, 0.85 * lit); roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill(); }
}
function planeGlyph(ctx, x, y, s, col) {                                 // simple airplane silhouette (pointing up), drawn as a path
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(0, -12); ctx.quadraticCurveTo(2, -10, 2, -6); ctx.lineTo(2, -2); ctx.lineTo(11, 3); ctx.lineTo(11, 6); ctx.lineTo(2, 3); ctx.lineTo(2, 8);
  ctx.lineTo(5, 10.5); ctx.lineTo(5, 12.5); ctx.lineTo(0, 11); ctx.lineTo(-5, 12.5); ctx.lineTo(-5, 10.5); ctx.lineTo(-2, 8); ctx.lineTo(-2, 3); ctx.lineTo(-11, 6);
  ctx.lineTo(-11, 3); ctx.lineTo(-2, -2); ctx.lineTo(-2, -6); ctx.quadraticCurveTo(-2, -10, 0, -12); ctx.closePath(); ctx.fill(); ctx.restore();
}
function apBadge(ctx, t) {                                                // printed "airplane mode: on" tag on the phone
  const k = ease.outBack(clamp((t - T.apOn) / 0.35)); if (k <= 0) return;
  const x = (PHONE[0] + 0.95) * G, y = (PHONE[1] - 1.05) * G;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, -0.1 * G + 3, -0.34 * G + 5, 1.55 * G, 0.68 * G, 0.34 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, -0.1 * G, -0.34 * G, 1.55 * G, 0.68 * G, 0.34 * G); ctx.fill();
  planeGlyph(ctx, 0.27 * G, 0, 0.44 * G, C.blue);
  ctx.fillStyle = C.charcoal; ctx.font = `${0.36 * G}px ${HF}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('ऑन', 0.6 * G, 0.03 * G);
  ctx.restore();
}
function earbuds(ctx, p, playing, t) {                                      // two buds + sound arcs while audio plays
  for (const dx of [-0.32, 0.32]) {
    const x = (p[0] + dx) * G, y = p[1] * G;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 5, 0.22 * G, 0.26 * G, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(x, y, 0.22 * G, 0.26 * G, 0, 0, TAU); ctx.fill();
    ctx.fillRect(x - 0.06 * G + (dx > 0 ? 0.05 * G : -0.05 * G), y + 0.1 * G, 0.12 * G, 0.4 * G);
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(x, y - 0.03 * G, 0.08 * G, 0, TAU); ctx.fill();
  }
  if (playing > 0) {
    ctx.save(); ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 3; ctx.lineCap = 'round'; const ga = ctx.globalAlpha;
    for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i / 3) % 1; ctx.globalAlpha = ga * (1 - ph) * playing; ctx.beginPath(); ctx.arc(p[0] * G, (p[1] - 0.15) * G, (0.6 + ph * 0.55) * G, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); }
    ctx.restore();
  }
}
function tower(ctx, p, on) {                                              // printed lattice mast with radio arcs
  const x = p[0] * G, y = p[1] * G;
  ctx.save(); ctx.strokeStyle = on > 0.5 ? C.ink : '#8D9692'; ctx.lineWidth = 0.08 * G; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - 0.5 * G, y + 0.5 * G); ctx.lineTo(x, y - 1.15 * G); ctx.lineTo(x + 0.5 * G, y + 0.5 * G);
  ctx.moveTo(x - 0.33 * G, y - 0.05 * G); ctx.lineTo(x + 0.33 * G, y - 0.05 * G); ctx.moveTo(x - 0.2 * G, y - 0.5 * G); ctx.lineTo(x + 0.2 * G, y - 0.5 * G);
  ctx.moveTo(x - 0.33 * G, y - 0.05 * G); ctx.lineTo(x + 0.2 * G, y - 0.5 * G); ctx.stroke();
  ctx.fillStyle = on > 0.5 ? C.ink : '#8D9692'; ctx.beginPath(); ctx.arc(x, y - 1.2 * G, 0.11 * G, 0, TAU); ctx.fill();
  if (on > 0) { ctx.strokeStyle = hexA(C.blueSoft, on); ctx.lineWidth = 3; for (const r of [0.38, 0.62]) { ctx.beginPath(); ctx.arc(x, y - 1.2 * G, r * G, -Math.PI * 0.3, Math.PI * 0.3); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - 1.2 * G, r * G, Math.PI * 0.7, Math.PI * 1.3); ctx.stroke(); } }
  ctx.restore();
}
function router(ctx, p, lit = 0, dim = 0) {
  const x = p[0] * G, y = p[1] * G, w = 0.95 * G, h = 0.5 * G;
  ctx.save(); ctx.globalAlpha *= 1 - 0.6 * dim;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.07 * G; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w * 0.3, y - h / 2); ctx.lineTo(x - w * 0.36, y - h / 2 - 0.32 * G); ctx.moveTo(x + w * 0.3, y - h / 2); ctx.lineTo(x + w * 0.36, y - h / 2 - 0.32 * G); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.12 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.12 * G); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = lit > 0 ? hexA(C.blue, 0.4 + 0.6 * lit) : '#9AA39F'; ctx.beginPath(); ctx.arc(x - 0.2 * G + i * 0.2 * G, y, 0.055 * G, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// ------------------------------------------------------------------ beats
function drawCell(ctx, t) {
  const k = ease.inOut(inv(...T.cellDraw, t)); if (k <= 0) return;
  const L = len(CELL), on = cellOn(t), hl = env(t, T.cutHl, T.cutHl + 0.4);
  // live cellular route: solid blue; once airplane mode cuts it, the line veils to a grey dashed print
  if (on > 0) { ctx.save(); ctx.globalAlpha *= on; strokePath(ctx, CELL, L * k, 0.24 * G, C.blue); ctx.restore(); }
  if (on < 1) { ctx.save(); ctx.globalAlpha *= 1 - on; strokePath(ctx, CELL, L * k, 0.14 * G, hl > 0.5 ? hexA(C.coral, 0.75) : '#59625E', false, [12, 12]); ctx.restore(); }
  if (k < 1) penTip(ctx, at(CELL, L * k));
  // data pulses climb the line while the cellular radio is on
  if (t > T.cellDraw[1] - 0.3 && t < T.cellCut) for (let i = 0; i < 3; i++) { const u = ((t - 4.5) / 0.9 + i / 3) % 1; const p = at(CELL, L * u); ctx.fillStyle = hexA(C.ink, 0.9 * Math.sin(u * Math.PI)); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.12 * G, 0, TAU); ctx.fill(); }
  const ca = clamp((t - T.cellCut) / 0.2);
  cross(ctx, [6.1, 13.5], 0.28 * (0.6 + 0.4 * ease.outBack(clamp((t - T.cellCut) / 0.35))) * (1 + 0.25 * hl), ca);
  label(ctx, 'मोबाइल नेटवर्क', 8.35, 16.7, 0.4, C.blueSoft, 'left', HF, env(t, 4.1, 4.5) * (1 - env(t, 8.6, 9.0)));
  label(ctx, 'जुड़ाव कटा', 7.0, 13.6, 0.44, C.coral, 'left', HF, env(t, T.towerOff, T.towerOff + 0.3) * (1 - env(t, 12.9, 13.3)) + env(t, T.cutHl, T.cutHl + 0.4));
}
function drawWifi(ctx, t) {
  const k = ease.inOut(inv(...T.wifiDraw, t)); if (k <= 0) return;
  const L = len(WIFI), on = clamp(localOn(t)), hl = env(t, T.radiosHl, T.radiosHl + 0.4);
  if (on > 0) { ctx.save(); ctx.globalAlpha *= on; if (hl > 0) strokePath(ctx, WIFI, L * k, 0.4 * G, hexA(C.blueSoft, 0.25 * hl), false); strokePath(ctx, WIFI, L * k, 0.2 * G, C.blueSoft); ctx.restore(); }
  if (on < 1) { ctx.save(); ctx.globalAlpha *= 1 - on; strokePath(ctx, WIFI, L * k, 0.12 * G, '#59625E', false, [12, 12]); ctx.restore(); }
  if (k < 1) penTip(ctx, at(WIFI, L * k));
  // router → internet (only once the narration reaches the internet)
  const nk = ease.inOut(inv(...T.netDraw, t));
  if (nk > 0) { strokePath(ctx, NET, len(NET) * nk, 0.2 * G, C.blueSoft); if (nk < 1) penTip(ctx, at(NET, len(NET) * nk)); }
  const za = env(t, T.netDraw[0] - 0.1, T.netDraw[0] + 0.3), lit = clamp((t - T.hop[2]) / 0.3);
  if (za > 0) {
    ctx.save(); ctx.globalAlpha *= za; ctx.fillStyle = hexA(C.blue, 0.06 + 0.12 * lit); roundRect(ctx, NETZ.x0 * G, NETZ.y0 * G, (NETZ.x1 - NETZ.x0) * G, (NETZ.y1 - NETZ.y0) * G, 0.5 * G); ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.55); ctx.lineWidth = 2.5; ctx.setLineDash([4, 10]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    label(ctx, 'इंटरनेट', (NETZ.x0 + NETZ.x1) / 2, (NETZ.y0 + NETZ.y1) / 2, 0.56, C.ink, 'center', HF, za);
  }
  router(ctx, ROUTER, on * (0.4 + 0.6 * clamp((t - T.hop[1]) / 0.15) * (1 - clamp((t - T.hop[1] - 0.5) / 0.4))), 1 - on);
  label(ctx, 'वाई-फ़ाई राउटर', 12.55, 16.05, 0.4, C.ink, 'right', HF, env(t, T.wifiDraw[1] - 0.1, T.wifiDraw[1] + 0.2));
  // a message reaches the internet via Wi-Fi (beat l5), then loops in the takeaway
  const H = T.hop;
  if (t > H[0] && t < H[2] + 0.3) {
    const route = [PHONE, ...WIFI.slice(1), ...NET.slice(1)], d1 = len([PHONE, ...WIFI.slice(1)]), d2 = len(route);
    const d = t < H[1] ? lerp(0, d1, ease.inOut(inv(H[0], H[1], t))) : lerp(d1, d2, ease.inOut(inv(H[1] + 0.08, H[2], t)));
    const p = at(route, d); envelope(ctx, [p[0], p[1] - 0.55], 0.52, 1 - clamp((t - H[2]) / 0.3));
  }
  ring(ctx, ROUTER, t - H[1], C.ink, 0.6); ring(ctx, [13.2, 12.6], t - H[2], C.blueSoft, 0.9);
  if (t > T.radiosHl) {
    const route = [PHONE, ...WIFI.slice(1), ...NET.slice(1)], u = ((t - T.radiosHl) / 2.2) % 1, k2 = ease.inOut(clamp(u / 0.85));
    const fade = Math.min(1, u / 0.08, (0.92 - u) / 0.07) * env(t, T.radiosHl, T.radiosHl + 0.3);
    if (fade > 0) { const p = at(route, len(route) * k2); envelope(ctx, [p[0], p[1] - 0.55], 0.48, fade); }
  }
}
function drawLocal(ctx, t) {
  const on = clamp(localOn(t)), hl = env(t, T.radiosHl, T.radiosHl + 0.4);
  const btLink = (pts, d, a = 1) => {
    if (d <= 0 || a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
    if (on > 0) { ctx.save(); ctx.globalAlpha *= on; strokePath(ctx, pts, d, (0.13 + 0.05 * hl) * G, hl > 0.5 ? C.ink : C.blueSoft, true, [14, 9]); ctx.restore(); }
    if (on < 1) { ctx.save(); ctx.globalAlpha *= 1 - on; strokePath(ctx, pts, d, 0.09 * G, '#59625E', false, [6, 12]); ctx.restore(); }
    ctx.restore();
  };
  // reach of the short-range link (beat l5): illustrative, not to scale
  const rk = ease.out(inv(...T.reach, t));
  if (rk > 0) {
    const r = REACH * rk, g = ctx.createRadialGradient(PHONE[0] * G, PHONE[1] * G, 0, PHONE[0] * G, PHONE[1] * G, r * G);
    g.addColorStop(0, hexA(C.blue, 0.22)); g.addColorStop(0.8, hexA(C.blue, 0.08)); g.addColorStop(1, hexA(C.blue, 0.02));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(PHONE[0] * G, PHONE[1] * G, r * G, 0, TAU); ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.75); ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, 'सीमित पहुँच', PHONE[0] - 3.55, PHONE[1] - 3.3, 0.42, C.blueSoft, 'center', HF, env(t, T.reach[0] + 0.3, T.reach[1]) * (1 - env(t, T.cutHl - 0.3, T.cutHl)));
    for (let k = 0; k < 12; k++) { const s = T.reach[1] + k * 1.1, age = t - s; if (age > 0 && age < 1.0) { ctx.strokeStyle = hexA(C.blueSoft, 0.5 * (1 - age)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(PHONE[0] * G, PHONE[1] * G, (0.6 + (REACH - 0.6) * age) * G, 0, TAU); ctx.stroke(); } }
  }
  // far phone: beyond the reach (coral gap)
  const fa = env(t, T.far, T.far + 0.35);
  if (fa > 0) {
    const v = [FAR[0] - PHONE[0], FAR[1] - PHONE[1]], L = Math.hypot(...v), u = [v[0] / L, v[1] / L], p0 = [PHONE[0] + u[0] * (REACH + 0.1), PHONE[1] + u[1] * (REACH + 0.1)], p1 = [FAR[0] - u[0] * 0.65, FAR[1] - u[1] * 0.65];
    ctx.save(); ctx.globalAlpha *= fa; ctx.strokeStyle = hexA(C.coral, 0.9); ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p0[0] * G, p0[1] * G); ctx.lineTo(lerp(p0[0], p1[0], ease.out(inv(T.far, T.far + 0.5, t))) * G, lerp(p0[1], p1[1], ease.out(inv(T.far, T.far + 0.5, t))) * G); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    ctx.save(); ctx.globalAlpha *= fa; phone(ctx, FAR, 0, 0.95); ctx.restore();
    label(ctx, 'दूर का फ़ोन', FAR[0], FAR[1] + 0.95, 0.4, C.ink, 'center', HF, fa);
    label(ctx, 'पहुँच से बाहर', FAR[0] - 0.1, FAR[1] - 1.05, 0.42, C.coral, 'center', HF, env(t, T.far + 0.3, T.far + 0.6) * (1 - env(t, T.cutHl - 0.3, T.cutHl)));
  }
  // Bluetooth link to the earbuds (from the hook) and to a nearby phone (beat l4)
  btLink(BT1, len(BT1));
  const k2 = ease.out(inv(...T.bt2Draw, t)); btLink(BT2, len(BT2) * k2);
  if (k2 > 0 && k2 < 1) penTip(ctx, at(BT2, len(BT2) * k2));
  const ev = 1 - env(t, 3.4, 3.9) * (1 - env(t, 8.6, 9.2));            // earbuds veiled during the tower shot (they sit under the instrument)
  ctx.save(); ctx.globalAlpha *= ev; earbuds(ctx, EARBUDS, on, t); ctx.restore();
  const na = ease.outBack(clamp((t - T.nearIn) / 0.35));
  if (na > 0) { ctx.save(); ctx.translate(NEAR[0] * G, NEAR[1] * G); ctx.scale(na, na); ctx.translate(-NEAR[0] * G, -NEAR[1] * G); phone(ctx, NEAR, clamp(1 - Math.abs(t - T.token[1]) / 0.4), 0.95); ctx.restore(); }
  if (t > T.token[0] && t < T.token[1] + 0.1) { const k = ease.inOut(inv(...T.token, t)); const p = at(BT2, len(BT2) * k); envelope(ctx, [p[0] + 0.4, p[1] - 0.35], 0.5); }
  ring(ctx, NEAR, t - T.token[1], C.blueSoft, 0.8);
  if (t > T.radiosHl) { const u = ((t - T.radiosHl) / 1.4) % 1, k = ease.inOut(u), fade = Math.min(1, u / 0.12, (1 - u) / 0.12) * env(t, T.radiosHl, T.radiosHl + 0.3); const p = at(BT2, len(BT2) * k); envelope(ctx, [p[0] + 0.4, p[1] - 0.35], 0.46, fade); }
  // labels
  label(ctx, 'ईयरबड्स', EARBUDS[0], EARBUDS[1] + 0.95, 0.4, C.ink, 'center', HF, ev);
  label(ctx, 'पास का फ़ोन', NEAR[0], NEAR[1] + 0.95, 0.4, C.ink, 'center', HF, na > 0 ? clamp(na) : 0);
  label(ctx, 'ब्लूटूथ', 5.55, 20.05, 0.38, C.blueSoft, 'right', HF, env(t, 0.4, 0.8) * (1 - env(t, 3.3, 3.6)) + env(t, 9.6, 9.9) * (1 - env(t, 12.9, 13.3)));
  label(ctx, 'सीधा रेडियो लिंक', 9.95, 20.05, 0.4, C.ink, 'left', HF, env(t, T.token[0], T.token[0] + 0.3) * (1 - env(t, 17.6, 18.0)));
  label(ctx, '?', EARBUDS[0] + 1.0, EARBUDS[1] - 1.0, 0.8 * ease.outBack(clamp((t - T.query) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.query) / 0.25) * (1 - env(t, 3.4, 3.7)));
  // the phone itself
  phone(ctx, PHONE, 0.25, 1.35);
  apBadge(ctx, t);
  label(ctx, 'आपका फ़ोन', PHONE[0] - 0.75, PHONE[1] - 0.75, 0.42, C.ink, 'right', HF, 1);
}
function drawTowerLayer(ctx, t, veil = 1) {
  const a = env(t, 3.3, 3.9) * veil; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; tower(ctx, TOWER, cellOn(t) * (t > T.cellDraw[1] ? 1 : 0.4)); ctx.restore();
  label(ctx, 'मोबाइल टावर', TOWER[0] + 0.75, TOWER[1] - 1.25, 0.42, C.ink, 'left', HF, a);
  ring(ctx, [TOWER[0], TOWER[1] - 1.2], t - T.cellDraw[1], C.blueSoft, 0.7);
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(2.4 * G, 16.35 * G, 0.1 * G, 1.3 * G); ctx.restore();
  label(ctx, 'एयरप्लेन मोड', 2.7, 16.7, 0.54, C.ink, 'left', HF, a);
  label(ctx, 'असल में क्या बंद होता है?', 2.7, 17.38, 0.38, '#B5BDB8', 'left', HS, a);
}

// ------------------------------------------------------------------ screen-space instrument: airplane-mode panel (above the bottom overlay zone)
function drawInstrument(ctx, t) {
  const a = env(t, T.inst, T.inst + 0.5) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  // left block: airplane mode state
  planeGlyph(ctx, 146, 1470, 40, apState(t) > 0.5 ? C.blueSoft : '#8D9692');
  ctx.font = `27px ${HF}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.ink; ctx.fillText('एयरप्लेन मोड', 178, 1470);
  const pill = (cx, cy, on, col = C.blue, ring2 = 0) => {
    roundRect(ctx, cx - 32, cy - 16, 64, 32, 16); ctx.fillStyle = on > 0.5 ? col : '#2A322F'; ctx.fill();
    if (ring2 > 0) { ctx.strokeStyle = hexA(C.coral, ring2); ctx.lineWidth = 4; ctx.stroke(); }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + lerp(-16, 16, on), cy, 12, 0, TAU); ctx.fill();
  };
  pill(210, 1528, apState(t));
  ctx.font = `24px ${HF}`; ctx.fillStyle = hexA(C.ink, 0.8); ctx.fillText(apState(t) > 0.5 ? 'ऑन' : 'ऑफ़', 256, 1529);
  ctx.strokeStyle = hexA(C.ink, 0.15); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(352, 1436); ctx.lineTo(352, 1556); ctx.stroke();
  // three radios
  const hl1 = env(t, T.cutHl, T.cutHl + 0.3), hl2 = env(t, T.radiosHl, T.radiosHl + 0.3);
  const cols = [['मोबाइल नेटवर्क', 480, cellOn(t), hl1], ['वाई-फ़ाई', 682, clamp(localOn(t)), hl2], ['ब्लूटूथ', 862, clamp(localOn(t)), hl2]];
  for (const [txt, cx, on, h] of cols) {
    if (h > 0) { ctx.fillStyle = hexA(txt === 'मोबाइल नेटवर्क' ? C.coral : C.blue, 0.16 * h); roundRect(ctx, cx - 92, 1430, 184, 132, 14); ctx.fill(); }
    ctx.font = `25px ${HF}`; ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.fillText(txt, cx, 1470);
    pill(cx, 1528, on, txt === 'मोबाइल नेटवर्क' ? C.blue : C.blueSoft, txt === 'मोबाइल नेटवर्क' ? hl1 : 0);
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
  const cm = cam(t), sc = cm.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  drawCartouche(ctx, 1 - env(t, 3.3, 3.7));
  drawTowerLayer(ctx, t, 1 - clamp((sc - 1.2) / 0.1));                 // the tower is veiled in close-ups (it would sit behind the captions)
  drawCell(ctx, t);
  drawWifi(ctx, t);
  drawLocal(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tv = clamp((sc - 1.2) / 0.1) * 0.92 * env(t, 12.9, 13.6) * (1 - env(t, 17.4, 18.2));   // only the l4 close-up needs it
  if (tv > 0) { const g = ctx.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, hexA('#0C110F', tv)); g.addColorStop(0.8, hexA('#0C110F', tv)); g.addColorStop(1, hexA('#0C110F', 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 600); }
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
  drawInstrument(ctx, t);
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = `22px HMed, EMed`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('सांकेतिक नक्शा · पैमाने पर नहीं · सामान्य फ़ोन व्यवहार, ऐप की सुविधा नहीं', 96, 1612);
  // CTA signature (last ~3.7 s): official icon + wordmark inside the safe area, replacing the instrument
  if (assets.icon) {
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 404, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 404, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 484, 1495); ctx.restore(); }
  }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  add(T.apOn, 'click', 0.4); add(T.apOn + 0.05, 'stamp', 0.3); add(T.query, 'retry', 0.28);
  add(3.4, 'sweep', 0.28, { dur: 1.0 }); add(T.cellDraw[0], 'pen', 0.45, { dur: T.cellDraw[1] - T.cellDraw[0] }); add(T.cellDraw[1], 'stop', 0.3);
  add(T.cellCut, 'click', 0.35); add(T.cellCut + 0.05, 'offline', 0.3);
  add(T.wifiDraw[0], 'pen', 0.4, { dur: T.wifiDraw[1] - T.wifiDraw[0] }); add(T.radiosOff, 'click', 0.35); add(T.radiosOff + 0.05, 'thunk', 0.3);
  add(T.radiosOn, 'click', 0.35); add(T.radiosOn + 0.05, 'bar', 0.25, { step: 2 });
  add(13.0, 'sweep', 0.25, { dur: 0.9 }); add(T.bt2Draw[0], 'penShort', 0.4, { dur: 0.5 }); add(T.token[0], 'zip', 0.3); add(T.token[1], 'stop', 0.3);
  add(T.reach[0], 'sweep', 0.25, { dur: 0.8 }); add(T.far + 0.3, 'retry', 0.25);
  add(T.netDraw[0], 'penShort', 0.4, { dur: 0.45 }); add(T.hop[1], 'turn', 0.35); add(T.hop[2], 'chime', 0.32);
  add(T.cutHl, 'stamp', 0.3); add(T.radiosHl, 'callout', 0.28); add(T.cta, 'chime', 0.32);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
