// Meshline production 30s, batch 2026-11-13-english-13: "How two phones talk with no SIM card".
// Same Transit-Map world as english-06..12 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). Two phones with no SIM still swap a message:
// the SIM is the carrier identity (IMSI + secret key K checked by the network: 3GPP TS 31.102 / TS 33.102), while
// Bluetooth is a separate 2.4 GHz unlicensed radio whose devices pair with their own keys (Bluetooth SIG; NIST SP
// 800-121). Reach is limited and walls cut it (Bluetooth SIG). Prerequisites: Bluetooth on + Android "Nearby devices"
// permission (Android Developers). Generic behaviour only; no Meshline transport/range claims (listing facts only).
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
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

// ------------------------------------------------------------------ map (G units) and beats
const A0 = [5.4, 16.0], B0 = [12.6, 16.0], CARD = [9.0, 12.5], TOWER = [9.0, 8.6];
const T = {
  eject: [0.0, 1.3], noSim: 1.11, hop0: [1.75, 2.6], how: 3.3,
  card: 4.6, notRadio: 5.25, id: 6.5,
  tower: 8.55, chal: [9.1, 9.55], resp: [9.6, 10.0], ok: 10.1, deny: 10.95,
  bt: 12.6, sep: 13.3, keys: [14.5, 15.7], paired: 16.6, hop1: [17.0, 17.6],
  away: [18.3, 19.2], wall: 19.55, back: [20.55, 21.25],
  chip1: 21.95, chip2: 22.95, chip3: 24.7, cta: 26.19,
};
const bOff = t => 2.8 * ease.inOut(inv(...T.away, t)) * (1 - ease.inOut(inv(...T.back, t)));
const Bpos = t => [B0[0] + bOff(t), B0[1]];
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 15.6, z: 1.22 }], [4.2, { x: 9.0, y: 15.6, z: 1.25 }],          // hook: SIMs fly out, message still hops
    [4.7, { x: 9.0, y: 13.6, z: 1.3 }], [8.1, { x: 9.0, y: 13.6, z: 1.33 }],          // the SIM card: an ID, not a radio
    [8.6, { x: 9.0, y: 12.9, z: 1.14 }], [12.2, { x: 9.0, y: 12.9, z: 1.16 }],        // the network checks it
    [12.7, { x: 9.0, y: 15.4, z: 1.2 }], [17.9, { x: 9.0, y: 15.4, z: 1.22 }],        // Bluetooth: its own radio and keys
    [18.3, { x: 9.8, y: 15.6, z: 1.1 }], [21.2, { x: 9.8, y: 15.6, z: 1.11 }],        // limited reach, walls
    [21.7, { x: 9.0, y: 13.7, z: 1.12 }], [26.0, { x: 9.0, y: 13.7, z: 1.14 }],       // what it needs
    [30, { x: 9.0, y: 13.7, z: 1.17 }],
  ]);
}

// ------------------------------------------------------------------ glyphs (generic, code-drawn)
function simCard(ctx, x, y, s, a = 1, slash = false) {                    // SIM: card with a cut corner and a contact chip
  if (a <= 0.01) return; const w = 0.62 * s * G, h = 0.82 * s * G, c = 0.2 * s * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  const body = () => { ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2 - c, -h / 2); ctx.lineTo(w / 2, -h / 2 + c); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); };
  ctx.save(); ctx.translate(4, 6); body(); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill(); ctx.restore();
  body(); ctx.fillStyle = C.ink; ctx.fill();
  const cw = w * 0.56, ch = h * 0.38; roundRect(ctx, -cw / 2, -ch / 2 + h * 0.08, cw, ch, s * 0.05 * G); ctx.fillStyle = C.blue; ctx.fill();
  ctx.strokeStyle = hexA(C.ink, 0.8); ctx.lineWidth = Math.max(1.5, s * 0.025 * G);
  ctx.beginPath(); ctx.moveTo(-cw / 2, h * 0.08); ctx.lineTo(cw / 2, h * 0.08); ctx.moveTo(0, -ch / 2 + h * 0.08); ctx.lineTo(0, ch / 2 + h * 0.08); ctx.stroke();
  if (slash) { ctx.strokeStyle = C.coral; ctx.lineWidth = s * 0.08 * G; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w * 0.62, h * 0.55); ctx.lineTo(w * 0.62, -h * 0.55); ctx.stroke(); }
  ctx.restore();
}
function btGlyph(ctx, x, y, s, col, a = 1) {                              // generic short-range radio glyph (dot + waves); not the Bluetooth logo
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, s * 0.13, 0, TAU); ctx.fill();
  for (const r of [0.3, 0.5]) for (const side of [0, Math.PI]) { ctx.beginPath(); ctx.arc(x, y, s * r, side - Math.PI * 0.28, side + Math.PI * 0.28); ctx.stroke(); }
  ctx.restore();
}
function radioIcon(ctx, x, y, s, col, a = 1) {                             // antenna mast with waves
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y + s * 0.6); ctx.lineTo(x, y - s * 0.1); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - s * 0.15, s * 0.1, 0, TAU); ctx.fill();
  for (const r of [0.32, 0.55]) { ctx.beginPath(); ctx.arc(x, y - s * 0.15, s * r, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - s * 0.15, s * r, Math.PI * 0.2 - Math.PI, Math.PI * 0.8 - Math.PI, true); ctx.stroke(); }
  ctx.restore();
}
function keyGlyph(ctx, x, y, s, col, a = 1, flip = false) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
  ctx.strokeStyle = col; ctx.lineWidth = s * 0.14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(-s * 0.35, 0, s * 0.22, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s * 0.13, 0); ctx.lineTo(s * 0.5, 0); ctx.moveTo(s * 0.32, 0); ctx.lineTo(s * 0.32, s * 0.2); ctx.moveTo(s * 0.48, 0); ctx.lineTo(s * 0.48, s * 0.16); ctx.stroke(); ctx.restore();
}
function lockGlyph(ctx, x, y, s, col, a = 1) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s * 0.13;
  ctx.beginPath(); ctx.arc(x, y - s * 0.12, s * 0.26, Math.PI, 0); ctx.stroke(); roundRect(ctx, x - s * 0.38, y - s * 0.12, s * 0.76, s * 0.58, s * 0.08); ctx.fill(); ctx.restore();
}
function tower(ctx, t, a) {
  if (a <= 0.01) return; const [x, y] = [TOWER[0] * G, TOWER[1] * G];
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(1.3, 1.3); ctx.translate(-x, -y);
  for (let k = 0; k < 2; k++) { const age = ((t + k * 0.7) % 1.4) / 1.4; ctx.strokeStyle = hexA(C.blueSoft, 0.5 * (1 - age)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, (0.35 + 0.75 * age) * G, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.08 * G; ctx.lineCap = 'round'; const by = y + 1.6 * G;
  ctx.beginPath(); ctx.moveTo(x - 0.5 * G, by); ctx.lineTo(x, y); ctx.lineTo(x + 0.5 * G, by);
  for (const f of [0.35, 0.65]) { const yy = lerp(y, by, f), dx = 0.5 * G * f; ctx.moveTo(x - dx, yy); ctx.lineTo(x + dx, yy); }
  ctx.stroke(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 0.1 * G, 0, TAU); ctx.fill(); ctx.restore();
}
function phoneNS(ctx, p, t, glyph, a = 1, s = 2.3) {                      // phone glyph with a "no SIM" mark in its status corner
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  simCard(ctx, x - w * 0.27, y - h * 0.33, 0.32, 0.9, true);
  const bt = env(t, T.bt, T.bt + 0.3) * (1 - veil(t));
  btGlyph(ctx, x + w * 0.27, y - h * 0.33, 0.3 * G, C.blueSoft, bt);
  if (glyph === 'env' || glyph === 'ok') envelope(ctx, x, y + 0.02 * G * s, 0.36 * G * s, 1);
  if (glyph === 'ok') check(ctx, x, y + 0.34 * G * s, 0.2 * G * s, C.blueSoft);
  if (glyph === 'x') cross(ctx, [x / G, (y + 0.3 * G * s) / G], 0.08 * s, 1);
  ctx.restore();
}

// ------------------------------------------------------------------ scene
function drawScene(ctx, t) {
  const B = Bpos(t), v = veil(t);
  // the Bluetooth link between the two phones (dashed): stretches, then is cut by a wall, then returns
  const lx0 = A0[0] + 0.9, lx1 = B[0] - 0.9, far = clamp(bOff(t) / 2.8), wallK = ease.outBack(clamp((t - T.wall + 0.2) / 0.3)) * (1 - ease.inOut(inv(T.back[0] - 0.1, T.back[0] + 0.4, t)));
  const linkA = (1 - env(t, 4.3, 4.7) + env(t, 12.4, 12.8)) * (1 - v * 0.7);
  if (linkA > 0.01) {
    const col = far > 0.7 || wallK > 0.5 ? hexA(C.coral, 0.75) : C.blueSoft;
    ctx.save(); ctx.globalAlpha *= linkA * (1 - 0.5 * far);
    if (wallK > 0.5) { strokePath(ctx, [[lx0, 16.0], [11.0 - 0.5, 16.0]], 11.0 - 0.5 - lx0, 0.12 * G, col, false, [10, 10]); }
    else strokePath(ctx, [[lx0, 16.0], [lx1, 16.0]], lx1 - lx0, lerp(0.13, 0.07, far) * G, col, true, [14, 9]);
    ctx.restore();
  }
  // message hops (hook and after pairing)
  const hop = (t0, t1) => { if (t < t0 || t > t1 + 0.25) return; const q = ease.inOut(inv(t0, t1, t)); envelope(ctx, lerp(lx0, lx1, q) * G, 16.0 * G, 0.62 * G, clamp((t - t0) / 0.12) * (1 - clamp((t - t1) / 0.2))); };
  hop(...T.hop0); hop(...T.hop1);
  label(ctx, '?', 9.0, 14.3, 1.1 * ease.outBack(clamp((t - T.how) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.how) / 0.2) * (1 - env(t, 4.1, 4.4)));
  // "no SIM" tags under both phones (hook)
  const ns = env(t, T.noSim, T.noSim + 0.25) * (1 - env(t, 4.2, 4.6));
  label(ctx, 'no SIM', A0[0], 17.85, 0.6, C.coral, 'center', 'EBold', ns); label(ctx, 'no SIM', B0[0], 17.85, 0.6, C.coral, 'center', 'EBold', ns);
  // l2: the SIM card, big: an ID card, not a radio
  const ca = env(t, T.card - 0.1, T.card + 0.2) * (1 - env(t, 12.2, 12.6));
  const cs = lerp(1.6, 3.0, 1 - env(t, 8.3, 8.9)) * (0.85 + 0.15 * ease.outBack(clamp((t - T.card) / 0.35)));
  simCard(ctx, CARD[0] * G, CARD[1] * G, cs, ca);
  const ra = env(t, T.notRadio - 0.25, T.notRadio) * (1 - env(t, 8.1, 8.4));
  radioIcon(ctx, 5.6 * G, 12.2 * G, 1.1 * G, GREY, ra); cross(ctx, [5.6, 12.1], 0.45, ra * env(t, T.notRadio, T.notRadio + 0.2));
  label(ctx, 'not a radio', 5.6, 13.55, 0.5, C.coral, 'center', 'EBold', ra * env(t, T.notRadio, T.notRadio + 0.2));
  label(ctx, 'carrier ID', 10.6, 12.0, 0.6, C.ink, 'left', 'EBold', env(t, T.id, T.id + 0.25) * (1 - env(t, 8.1, 8.4)));
  label(ctx, '+ key', 10.6, 12.75, 0.5, C.blueSoft, 'left', 'EBold', env(t, T.id + 0.3, T.id + 0.55) * (1 - env(t, 8.1, 8.4)));
  // l3: the carrier network checks the card before it allows calls or data
  const ta = env(t, T.tower, T.tower + 0.3) * (1 - env(t, 12.2, 12.6));
  tower(ctx, t, ta);
  label(ctx, 'carrier network', TOWER[0] + 1.0, TOWER[1] - 0.2, 0.6, C.ink, 'left', 'EBold', ta);
  const tokenAt = (a, b, t0, t1) => { const q = ease.inOut(inv(t0, t1, t)); return [lerp(a[0], b[0], q), lerp(a[1], b[1], q)]; };
  if (t > T.chal[0] && t < T.chal[1]) { const p = tokenAt([TOWER[0], TOWER[1] + 2.1], [CARD[0], CARD[1] - 1.5], ...T.chal); label(ctx, '?', p[0], p[1], 0.8, C.blueSoft, 'center', 'EDisplay', 1); }
  if (t > T.resp[0] && t < T.resp[1]) { const p = tokenAt([CARD[0], CARD[1] - 1.5], [TOWER[0], TOWER[1] + 2.1], ...T.resp); ctx.save(); check(ctx, p[0] * G, p[1] * G, 0.5 * G, C.blueSoft); ctx.restore(); }
  check(ctx, (CARD[0] + 1.35) * G, (CARD[1] - 0.2) * G, 0.6 * G, C.blueSoft, env(t, T.ok, T.ok + 0.2) * ta);
  label(ctx, 'calls · data', CARD[0] + 1.85, CARD[1] - 0.2, 0.6, C.blueSoft, 'left', 'EBold', env(t, T.ok, T.ok + 0.25) * ta);
  const dn = env(t, T.deny - 0.3, T.deny) * ta;
  if (dn > 0) {
    for (const p of [A0, B0]) { ctx.save(); ctx.globalAlpha *= dn; strokePath(ctx, [[TOWER[0], TOWER[1] + 2.1], [p[0], p[1] - 1.4]], len([[TOWER[0], TOWER[1] + 2.1], [p[0], p[1] - 1.4]]) * ease.out(clamp((t - T.deny + 0.3) / 0.35)), 0.08 * G, hexA(C.coral, 0.7), false, [10, 10]); ctx.restore(); }
    cross(ctx, [A0[0], A0[1] - 1.85], 0.28, env(t, T.deny, T.deny + 0.2) * ta); cross(ctx, [B0[0], B0[1] - 1.85], 0.28, env(t, T.deny, T.deny + 0.2) * ta);
    label(ctx, 'no SIM, no carrier service', 9.0, 18.1, 0.6, C.coral, 'center', 'EBold', env(t, T.deny + 0.1, T.deny + 0.35) * ta);
  }
  // l4: Bluetooth radios ring out from each phone; pairing keys meet in the middle and lock
  const btA = env(t, T.bt, T.bt + 0.3) * (1 - env(t, 17.9, 18.3));
  if (btA > 0) for (const p of [A0, B0]) for (let k = 0; k < 2; k++) { const age = ((t - T.bt + k * 0.6) % 1.2) / 1.2; ctx.strokeStyle = hexA(C.blueSoft, 0.55 * (1 - age) * btA); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, (1.3 + 1.1 * age) * G, 0, TAU); ctx.stroke(); }
  label(ctx, 'Bluetooth radio', 9.0, 13.2, 0.6, C.blueSoft, 'center', 'EBold', env(t, T.sep - 0.1, T.sep + 0.2) * (1 - env(t, 14.3, 14.6)));
  const kq = ease.inOut(inv(...T.keys, t)), kA = env(t, T.keys[0] - 0.1, T.keys[0] + 0.1) * (1 - env(t, T.paired - 0.05, T.paired + 0.1));
  keyGlyph(ctx, lerp(A0[0] + 1.0, 8.2, kq) * G, 14.5 * G, 1.0 * G, C.ink, kA); keyGlyph(ctx, lerp(B0[0] - 1.0, 9.8, kq) * G, 14.5 * G, 1.0 * G, C.ink, kA, true);
  const lk = env(t, T.paired - 0.05, T.paired + 0.15) * (1 - env(t, 17.8, 18.2));
  lockGlyph(ctx, 9.0 * G, 14.5 * G, 0.8 * G * (0.8 + 0.2 * ease.outBack(clamp((t - T.paired) / 0.3))), C.blueSoft, lk);
  label(ctx, 'paired', 9.0, 13.45, 0.6, C.blueSoft, 'center', 'EBold', lk);
  ring(ctx, [9.0, 14.5], t - T.paired, C.blueSoft, 1.0);
  // l5: limited reach, then a wall
  label(ctx, 'limited reach', 10.8, 14.4, 0.6, C.coral, 'center', 'EBold', env(t, T.away[0] + 0.5, T.away[0] + 0.8) * (1 - env(t, T.wall - 0.2, T.wall)));
  if (wallK > 0.01) {
    const drop = (1 - Math.min(1, wallK)) * 2.0, x0 = (11.0 - 0.35) * G, y0 = (13.4 - drop) * G, wpx = 0.7 * G, hh = 5.2 * G;
    ctx.save(); ctx.globalAlpha *= clamp(wallK * 1.5);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x0 + 4, y0 + 6, wpx, hh); ctx.fillStyle = '#3A4440'; ctx.fillRect(x0, y0, wpx, hh);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, wpx, hh); ctx.clip(); ctx.strokeStyle = hexA(C.ink, 0.38); ctx.lineWidth = 2; for (let yy = y0 - wpx; yy < y0 + hh + wpx; yy += 0.28 * G) { ctx.beginPath(); ctx.moveTo(x0, yy + wpx); ctx.lineTo(x0 + wpx, yy); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = hexA(C.ink, 0.85); ctx.lineWidth = 2.5; ctx.strokeRect(x0, y0, wpx, hh); ctx.restore();
    cross(ctx, [11.0, 16.0], 0.3, env(t, T.wall + 0.2, T.wall + 0.4) * clamp(wallK));
    label(ctx, 'walls', 11.0, 12.75 - drop, 0.6, C.ink, 'center', 'EBold', clamp(wallK));
  }
  // l6: what it needs (printed chips, revealed one at a time)
  const chip = (i, t0, icon, txt, col) => {
    const a = env(t, t0 - 0.1, t0 + 0.2) * (1 - env(t, T.cta - 0.2, T.cta + 0.3)); if (a <= 0.01) return;
    const y = 10.2 + i * 1.5, s = 0.92 + 0.08 * ease.outBack(clamp((t - t0) / 0.3));
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(9.0 * G, y * G); ctx.scale(s, s);
    roundRect(ctx, -3.7 * G, -0.6 * G, 7.4 * G, 1.2 * G, 0.24 * G); ctx.fillStyle = 'rgba(10,14,12,0.9)'; ctx.fill(); ctx.strokeStyle = hexA(col, 0.6); ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = col; ctx.fillRect(-3.7 * G, -0.6 * G, 0.12 * G, 1.2 * G);
    icon(-2.85 * G, 0); ctx.font = `${0.66 * G}px EBold`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.ink; ctx.fillText(txt, -2.05 * G, 0.02 * G);
    ctx.restore();
  };
  chip(0, T.chip1, (x, y) => btGlyph(ctx, x, y, 0.62 * G, C.blueSoft), 'Bluetooth on', C.blueSoft);
  chip(1, T.chip2, (x, y) => { ctx.fillStyle = C.blueSoft; for (const [dx, dy] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) { ctx.beginPath(); ctx.arc(x + dx * G, y + dy * G, 0.11 * G, 0, TAU); ctx.fill(); } }, 'Nearby devices', C.blueSoft);
  chip(2, T.chip3, (x, y) => simCard(ctx, x, y, 0.85, 1, true), 'No SIM needed', C.coral);
  // the two phones
  const aG = t >= T.hop0[0] - 0.3 && t < T.hop0[0] + 0.1 || (t >= T.hop1[0] - 0.3 && t < T.hop1[0] + 0.1) ? 'env' : 'none';
  const bG = (t >= T.hop0[1] && t < 4.3) || (t >= T.hop1[1] && t < 18.3) ? 'ok' : 'none';
  phoneNS(ctx, A0, t, aG, 1 - v * 0); phoneNS(ctx, B, t, bG, 1);
  ring(ctx, B0, t - T.hop0[1], C.blueSoft, 0.9); ring(ctx, B0, t - T.hop1[1], C.blueSoft, 0.9);
  // hook (drawn in front of the phones): both SIM cards fly out of the phones and fade (they are not coming back)
  for (const [p, dir] of [[A0, -1], [B0, 1]]) {
    const k = inv(...T.eject, t); if (k >= 1) continue;
    const x = p[0] + dir * (0.2 + 1.4 * ease.out(k)), y = p[1] - 0.4 - 2.6 * ease.out(k) + 1.2 * k * k;
    ctx.save(); ctx.translate(x * G, y * G); ctx.rotate(dir * k * 1.6); simCard(ctx, 0, 0, 1.6, 1 - ease.in(k)); ctx.restore();
  }
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(3.0 * G, 10.55 * G, 0.1 * G, 1.3 * G); ctx.restore();
  label(ctx, 'SIM vs radio', 3.3, 10.9, 0.5, C.ink, 'left', 'EBold', a);
  label(ctx, 'no SIM in either phone', 3.3, 11.55, 0.34, GREY, 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument: mobile network vs Bluetooth (one readout)
function drawInstrument(ctx, t) {
  const A = (1 - env(t, 21.0, 21.3)) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = hexA(C.ink, 0.12); ctx.fillRect(539, 1436, 2, 120);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const txt = (s, x, y, col, font, a = 1) => { if (a <= 0.01) return; ctx.globalAlpha = A * a; ctx.font = font; ctx.fillStyle = col; ctx.fillText(s, x, y); };
  const hlL = env(t, T.card, T.card + 0.3) * (1 - env(t, 12.2, 12.5)), hlR = env(t, T.bt, T.bt + 0.3) * (1 - env(t, 21.0, 21.3)) + env(t, T.hop0[1], T.hop0[1] + 0.2) * (1 - env(t, 4.2, 4.5));
  if (hlL > 0) { ctx.globalAlpha = A * hlL; roundRect(ctx, 110, 1430, 418, 132, 16); ctx.fillStyle = hexA(C.coral, 0.13); ctx.fill(); }
  if (hlR > 0) { ctx.globalAlpha = A * Math.min(1, hlR); roundRect(ctx, 552, 1430, 418, 132, 16); ctx.fillStyle = hexA(C.blue, 0.18); ctx.fill(); }
  txt('mobile network', 132, 1464, GREY, '26px ESemi'); txt('Bluetooth', 574, 1464, GREY, '26px ESemi');
  const left = t < T.noSim ? ['…', GREY] : t < T.card ? ['no SIM', C.coral] : t < T.bt ? ['needs a SIM', C.coral] : ['not used', GREY];
  const right = t < T.hop0[1] ? ['…', GREY] : t < 4.3 ? ['message ✓', C.blueSoft] : t < T.bt ? ['—', GREY] : t < T.paired ? ['phone ↔ phone', C.blueSoft] : t < T.away[0] + 0.5 ? ['paired', C.blueSoft] : ['nearby only', C.coral];
  txt(left[0].replace(' ✓', ''), 132, 1520, left[1], '38px EBold'); txt(right[0].replace(' ✓', ''), 574, 1520, right[1], '38px EBold');
  if (right[0].endsWith('✓')) { ctx.globalAlpha = A; ctx.font = '38px EBold'; check(ctx, 574 + ctx.measureText(right[0].replace(' ✓', '')).width + 30, 1520, 30, C.blueSoft); }
  if (right[0] === 'paired') { ctx.globalAlpha = A; ctx.font = '38px EBold'; check(ctx, 574 + ctx.measureText('paired').width + 30, 1520, 30, C.blueSoft); }
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
  const t = 2.2;
  drawWorld(ctx, t, { x: 9.0, y: 15.2, z: 1.3 }, true);
  ctx.save(); const g = ctx.createLinearGradient(0, 120, 0, 900); g.addColorStop(0, 'rgba(8,11,10,0.94)'); g.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900); ctx.restore();
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const big = (s, y, col, size) => { ctx.font = `${size}px EDisplay`; ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(8,11,10,0.95)'; ctx.strokeText(s, 540, y); ctx.fillStyle = col; ctx.fillText(s, 540, y); };
  big('NO SIM.', 320, C.coral, 160); big('STILL', 480, C.ink, 140); big('TALKING?', 630, C.blueSoft, 140);
  ctx.restore();
  if (assets.icon) { ctx.save(); roundRect(ctx, 384, 1640, 72, 72, 16); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 384, 1640, 72, 72); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '50px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 472, 1677); ctx.restore(); }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  add(0.05, 'sweep', 0.18, { dur: 0.8 }); add(T.noSim, 'stamp', 0.18);
  add(T.hop0[0], 'zip', 0.2); add(T.hop0[1], 'stop', 0.24); add(T.how, 'retry', 0.14);
  add(T.card, 'land', 0.24); add(T.notRadio, 'fizz', 0.18); add(T.id, 'click', 0.16);
  add(T.tower, 'stop', 0.2); add(T.chal[0], 'zip', 0.16); add(T.resp[0], 'slot', 0.2); add(T.ok, 'relay', 0.18); add(T.deny, 'offline', 0.18);
  add(T.bt, 'sweep', 0.16, { dur: 0.5 }); add(T.keys[0], 'pen', 0.2, { dur: T.keys[1] - T.keys[0] }); add(T.paired, 'land', 0.24);
  add(T.hop1[0], 'zip', 0.18); add(T.hop1[1], 'stop', 0.22);
  add(T.away[0], 'sweep', 0.14, { dur: 0.8 }); add(T.wall - 0.1, 'land', 0.3); add(T.wall + 0.25, 'fizz', 0.2); add(T.back[0], 'sweep', 0.12, { dur: 0.6 });
  add(T.chip1, 'click', 0.2); add(T.chip2, 'click', 0.2); add(T.chip3, 'stamp', 0.2);
  add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
