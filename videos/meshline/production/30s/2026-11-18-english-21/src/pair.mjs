// Meshline production 30s, batch 2026-11-18-english-21: "Why pairing shows the same six digits on both phones".
// Same Transit-Map world as english-06..20 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). Bluetooth Secure Simple Pairing / LE Secure
// Connections "numeric comparison": each device sends its ECDH public key, both derive a shared secret, each shows a
// six-digit confirmation value and the user confirms a match; a man-in-the-middle substitutes its own keys, so the values
// would almost surely differ (NIST SP 800-121r2-upd1 §3.1.1, §3.2.2.2; Bluetooth SIG blog 2017-01-19). The digits are
// illustrative. Generic mechanism; no Meshline pairing or security claims (listing facts only in the CTA).
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
// ------------------------------------------------------------------ two phones (you, friend), and a middleman that can sit on the line between them
const YOU = [3.4, 16.4], FRI = [14.6, 16.4], MID = [9.0, 16.9];
const PW = 3.4, PH = 5.6;
const CODE = ['482', '913'], BAD_Y = ['731', '064'], BAD_F = ['295', '418'];   // illustrative six-digit values
const T = {
  same: 1.8, why: 3.27,
  mmIn: 5.15, pose: 5.72, mmOut: [7.5, 7.95],
  keyY: [8.4, 9.5], keyF: [8.6, 9.7], secret: 10.6,
  roll1: [13.05, 14.7], match1: 14.8,
  mm2: 16.7, steal: [17.3, 17.95], fake: [18.0, 18.75], roll2: [19.0, 19.9], differ: 20.4,
  clean: [21.4, 21.8], roll3: [21.8, 22.25], pairBtn: 22.3, tapY: 22.6, tapF: 23.05, ok: 24.3,
  cta: 25.61,
};
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ camera (every key inside the sheet: x·60·z ≥ 540 and (18−x)·60·z ≥ 540)
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 16.0, z: 1.08 }], [4.4, { x: 9.0, y: 16.0, z: 1.11 }],             // hook: same six digits on both screens
    [5.0, { x: 9.0, y: 16.1, z: 1.15 }], [7.4, { x: 9.0, y: 16.1, z: 1.16 }],            // someone in the middle
    [8.2, { x: 9.0, y: 15.9, z: 1.06 }], [12.4, { x: 9.0, y: 15.9, z: 1.07 }],           // public keys, shared secret
    [13.0, { x: 9.0, y: 16.0, z: 1.1 }], [16.3, { x: 9.0, y: 16.0, z: 1.11 }],           // six-digit check: match
    [16.9, { x: 9.0, y: 16.1, z: 1.14 }], [21.2, { x: 9.0, y: 16.1, z: 1.16 }],          // middleman swaps keys: numbers differ
    [22.0, { x: 9.0, y: 16.0, z: 1.08 }], [25.4, { x: 9.0, y: 16.0, z: 1.1 }],           // payoff: tap pair only on a match
    [30, { x: 9.0, y: 16.1, z: 1.18 }],                                                    // CTA: slow push under the veil
  ]);
}

// ------------------------------------------------------------------ glyphs
function phoneBig(ctx, p, digits, opt = {}) {                              // generic phone: a pairing prompt with a six-digit value (two rows)
  const { a = 1, col = C.ink, roll = 0, seed = 0, t = 0, pair = 0, pulse = 0, lit = 0, litCol = C.blueSoft } = opt;
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = PW * G, h = PH * G;
  ctx.save(); ctx.globalAlpha *= a;
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 3.4 * G); g.addColorStop(0, hexA(litCol, 0.32 * lit)); g.addColorStop(1, hexA(litCol, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 3.4 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 6, y - h / 2 + 10, w, h, 0.36 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.36 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.14 * G, y - h / 2 + 0.3 * G, w - 0.28 * G, h - 0.6 * G, 0.16 * G); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${0.36 * G}px ESemi`; ctx.fillStyle = GREY; ctx.fillText('pair?', x, y - 2.0 * G);
  const rows = roll > 0 ? [0, 1].map(r => [0, 1, 2].map(i => Math.floor(hash(seed * 13 + r * 7 + i * 3 + Math.floor(t * 18)) * 10)).join('')) : digits;
  const sc = 1 + 0.06 * pulse;
  ctx.save(); ctx.translate(x, y - 0.25 * G); ctx.scale(sc, sc);
  ctx.font = `${1.12 * G}px EBold`; ctx.fillStyle = roll > 0 ? GREY : col;
  if (rows) { ctx.fillText(rows[0], 0, -0.7 * G); ctx.fillText(rows[1], 0, 0.58 * G); }
  ctx.restore();
  if (pair > 0) { ctx.save(); ctx.globalAlpha *= pair; roundRect(ctx, x - 1.05 * G, y + 1.5 * G, 2.1 * G, 0.72 * G, 0.36 * G); ctx.fillStyle = C.blue; ctx.fill(); ctx.font = `${0.44 * G}px EBold`; ctx.fillStyle = C.ink; ctx.fillText('Pair', x, y + 1.87 * G); ctx.restore(); }
  ctx.restore();
}
function keyGlyph(ctx, x, y, s, col, a = 1) {                              // a plain key (head ring, shaft, two teeth)
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x * G, y * G);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 0.16 * s * G; ctx.lineCap = 'round';
  const draw = () => { ctx.beginPath(); ctx.arc(-0.45 * s * G, 0, 0.26 * s * G, 0, TAU); ctx.moveTo(-0.19 * s * G, 0); ctx.lineTo(0.6 * s * G, 0); ctx.moveTo(0.38 * s * G, 0); ctx.lineTo(0.38 * s * G, 0.24 * s * G); ctx.moveTo(0.58 * s * G, 0); ctx.lineTo(0.58 * s * G, 0.2 * s * G); ctx.stroke(); };
  ctx.save(); ctx.translate(3, 5); draw(); ctx.restore(); ctx.strokeStyle = col; draw(); ctx.restore();
}
function lockGlyph(ctx, x, y, s, col, a = 1) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x * G, y * G);
  ctx.strokeStyle = col; ctx.lineWidth = 0.13 * s * G; ctx.beginPath(); ctx.arc(0, -0.15 * s * G, 0.3 * s * G, Math.PI, 0); ctx.lineTo(0.3 * s * G, 0.05 * s * G); ctx.moveTo(-0.3 * s * G, -0.15 * s * G); ctx.lineTo(-0.3 * s * G, 0.05 * s * G); ctx.stroke();
  roundRect(ctx, -0.48 * s * G, 0.02 * s * G, 0.96 * s * G, 0.7 * s * G, 0.12 * s * G); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(0, 0.3 * s * G, 0.09 * s * G, 0, TAU); ctx.fill(); ctx.restore();
}
function middleman(ctx, p, a, t) {                                          // a masked device in coral: it relays, and poses as each side
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 2.0 * G, h = 3.3 * G;
  ctx.save(); ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 2.6 * G); g.addColorStop(0, hexA(C.coral, 0.28)); g.addColorStop(1, hexA(C.coral, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 2.6 * G, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 5, y - h / 2 + 8, w, h, 0.28 * G); ctx.fill();
  ctx.fillStyle = '#1A1210'; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.28 * G); ctx.fill(); ctx.strokeStyle = C.coral; ctx.lineWidth = 0.08 * G; ctx.stroke();
  ctx.fillStyle = C.coral; roundRect(ctx, x - 0.78 * G, y - 0.62 * G, 1.56 * G, 0.5 * G, 0.25 * G); ctx.fill();          // mask band
  ctx.fillStyle = '#1A1210'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * 0.36 * G, y - 0.37 * G, 0.16 * G, 0.1 * G, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function tag(ctx, txt, x, y, col, a, dir = 0) {                             // speech-tag with a small pointer
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `${0.5 * G}px EBold`; const w = ctx.measureText(txt).width + 0.5 * G, h = 0.8 * G, X = x * G, Y = y * G;
  roundRect(ctx, X - w / 2, Y - h / 2, w, h, 0.22 * G); ctx.fillStyle = 'rgba(14,19,17,0.96)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  if (dir) { ctx.beginPath(); ctx.moveTo(X + dir * (w / 2 - 2), Y - 0.16 * G); ctx.lineTo(X + dir * (w / 2 + 0.3 * G), Y + 0.1 * G); ctx.lineTo(X + dir * (w / 2 - 2), Y + 0.2 * G); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, X, Y + 0.02 * G); ctx.restore();
}
function tap(ctx, p, t, t0) {                                               // a tap ripple on the Pair button
  const k = (t - t0) / 0.7; if (k < 0 || k > 1) return; const x = p[0] * G, y = (p[1] + 1.87) * G;
  ctx.save(); ctx.strokeStyle = hexA(C.ink, 1 - k); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, (0.25 + 0.8 * k) * G, 0, TAU); ctx.stroke();
  ctx.fillStyle = hexA(C.ink, 0.6 * (1 - k)); ctx.beginPath(); ctx.arc(x, y, 0.22 * G, 0, TAU); ctx.fill(); ctx.restore();
}

// ------------------------------------------------------------------ scene
const LINE_Y = 15.6;
function travel(ctx, from, to, tt, t, col, lab, dy = 0) {                  // a key token travelling along the line between devices
  if (t < tt[0] || t > tt[1] + 0.25) return; const q = ease.inOut(inv(...tt, t)), a = 1 - clamp((t - tt[1]) / 0.25);
  const x = lerp(from, to, q), y = LINE_Y + dy - 0.55 * Math.sin(Math.PI * q);
  keyGlyph(ctx, x, y, 1.1, col, a); if (lab) label(ctx, lab, x, y - 0.85, 0.58, col, 'center', 'EBold', a * clamp(Math.sin(Math.PI * q) * 3));
}
function drawScene(ctx, t) {
  const v = veil(t);
  // the line between the phones (direct), cut by the middleman when it is there
  const mmA = Math.max(env(t, T.mmIn - 0.1, T.mmIn + 0.3) * (1 - env(t, ...T.mmOut)), env(t, T.mm2 - 0.1, T.mm2 + 0.3) * (1 - env(t, ...T.clean)));
  ctx.save(); ctx.globalAlpha *= 1 - v; ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 36; ctx.lineCap = 'round'; ctx.strokeStyle = hexA(C.blueSoft, 0.35 + 0.3 * (1 - mmA)); ctx.lineWidth = 0.07 * G;
  ctx.beginPath(); ctx.moveTo((YOU[0] + PW / 2 + 0.2) * G, LINE_Y * G); ctx.lineTo((FRI[0] - PW / 2 - 0.2) * G, LINE_Y * G); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  // hook: the same six digits on both screens
  const pulse = Math.max(0, Math.sin(clamp((t - T.same) / 0.5) * Math.PI));
  label(ctx, '?', 9.0, 13.6, 1.3 * ease.outBack(clamp((t - T.why) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.why) / 0.2) * (1 - env(t, 4.5, 4.9)));
  // the middleman: in the middle, posing as each phone
  middleman(ctx, MID, mmA * (1 - v), t);
  label(ctx, 'middleman', MID[0], MID[1] + 2.35, 0.6, C.coral, 'center', 'EBold', mmA * (1 - v));
  const pa = env(t, T.pose, T.pose + 0.25) * (1 - env(t, T.mmOut[0] - 0.3, T.mmOut[0]));
  tag(ctx, "I'm your friend", MID[0] - 1.35, 13.55, C.coral, pa, 0); tag(ctx, "I'm you", MID[0] + 1.75, 12.55, C.coral, pa, 0);
  // public keys cross, then each phone builds the shared secret
  travel(ctx, YOU[0] + PW / 2 + 0.45, FRI[0] - PW / 2 - 0.45, T.keyY, t, C.blueSoft, 'public key');
  travel(ctx, FRI[0] - PW / 2 - 0.45, YOU[0] + PW / 2 + 0.45, T.keyF, t, C.blue, '', 0.9);
  const sa = env(t, T.secret, T.secret + 0.3) * (1 - env(t, 12.6, 13.0));
  for (const p of [YOU, FRI]) { lockGlyph(ctx, p[0], p[1] - PH / 2 - 1.05, 1.15, C.blueSoft, sa); }
  label(ctx, 'shared secret', YOU[0], YOU[1] - PH / 2 - 2.25, 0.56, C.blueSoft, 'center', 'EBold', sa); label(ctx, 'shared secret', FRI[0], FRI[1] - PH / 2 - 2.25, 0.56, C.blueSoft, 'center', 'EBold', sa);
  // the middleman swaps keys: real keys go in, its own keys come out
  travel(ctx, YOU[0] + PW / 2 + 0.45, MID[0] - 1.2, T.steal, t, C.blueSoft, ''); travel(ctx, FRI[0] - PW / 2 - 0.45, MID[0] + 1.2, T.steal, t, C.blue, '', 0.9);
  travel(ctx, MID[0] - 1.2, YOU[0] + PW / 2 + 0.45, T.fake, t, C.coral, '');
  label(ctx, 'its own keys', MID[0], 13.3, 0.6, C.coral, 'center', 'EBold', env(t, T.fake[0] - 0.1, T.fake[0] + 0.15) * (1 - env(t, T.roll2[1] - 0.2, T.roll2[1] + 0.1))); travel(ctx, MID[0] + 1.2, FRI[0] - PW / 2 - 0.45, T.fake, t, C.coral, '', 0.9);
  // the phones: digits change with each round (match → differ → match)
  const roll = [T.roll1, T.roll2, T.roll3].some(r => t > r[0] && t < r[1]) ? 1 : 0;
  const bad = t >= T.roll2[1] && t < T.roll3[0];
  const show = t < 12.95 || t >= T.roll1[1];
  const dY = show ? (bad ? BAD_Y : CODE) : null, dF = show ? (bad ? BAD_F : CODE) : null;
  const colD = bad ? C.coral : C.ink;
  const pp = env(t, T.match1, T.match1 + 0.4) * (1 - env(t, T.match1 + 0.6, T.match1 + 1.0));
  const pb = env(t, T.pairBtn, T.pairBtn + 0.25) * (1 - v);
  const lit = (t < 4.4 ? 1 : 0) + (t > T.match1 && t < 16.3 ? 1 : 0) + (t > T.ok && t < T.cta ? 1 : 0);
  phoneBig(ctx, YOU, dY, { col: colD, roll, seed: 1, t, pulse: Math.max(pulse, pp), pair: pb, lit: clamp(lit) * (1 - v), litCol: bad ? C.coral : C.blueSoft, a: 1 - 0.55 * v });
  phoneBig(ctx, FRI, dF, { col: colD, roll, seed: 2, t, pulse: Math.max(pulse, pp), pair: pb, lit: clamp(lit) * (1 - v), litCol: bad ? C.coral : C.blueSoft, a: 1 - 0.55 * v });
  if (bad) { const ba = env(t, T.differ, T.differ + 0.2) * (1 - env(t, T.clean[0], T.clean[1])); cross(ctx, [9.0, 13.4], 0.45, ba); label(ctx, 'numbers differ', 9.0, 12.4, 0.66, C.coral, 'center', 'EBold', ba); }
  // payoff: tap Pair only when both screens show the same number
  tap(ctx, YOU, t, T.tapY); tap(ctx, FRI, t, T.tapF);
  const oa = env(t, T.ok, T.ok + 0.25) * (1 - v);
  check(ctx, 9.0 * G, 13.4 * G, 0.95 * G, C.blueSoft, oa); label(ctx, 'same number: pair', 9.0, 12.3, 0.66, C.blueSoft, 'center', 'EBold', oa);
  label(ctx, 'you', YOU[0], YOU[1] + PH / 2 + 0.75, 0.62, C.ink, 'center', 'EBold', 1 - v); label(ctx, 'friend', FRI[0], FRI[1] + PH / 2 + 0.75, 0.62, C.ink, 'center', 'EBold', 1 - v);
}

// ------------------------------------------------------------------ screen-space instrument: compare the two screens (one readout)
function xMark(ctx, x, y, s, col) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s / 2, y - s / 2); ctx.lineTo(x + s / 2, y + s / 2); ctx.moveTo(x + s / 2, y - s / 2); ctx.lineTo(x - s / 2, y + s / 2); ctx.stroke(); ctx.restore(); }
function drawInstrument(ctx, t) {
  const A = env(t, T.roll1[0] - 0.3, T.roll1[0]) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('compare the two screens', 132, 1450);
  const roll = t < T.roll1[0] || [T.roll1, T.roll2, T.roll3].some(r => t > r[0] && t < r[1]), bad = t >= T.roll2[1] && t < T.roll3[0];
  const rows = [['you', bad ? BAD_Y : CODE, 1], ['friend', bad ? BAD_F : CODE, 2]];
  for (const [i, [name, d, seed]] of rows.entries()) {
    const y = 1492 + i * 46; ctx.font = '28px EBold'; ctx.fillStyle = GREY; ctx.textAlign = 'left'; ctx.fillText(name, 132, y);
    const txt = roll ? [0, 1].map(r => [0, 1, 2].map(k => Math.floor(hash(seed * 13 + r * 7 + k * 3 + Math.floor(t * 18)) * 10)).join('')).join(' ') : d.join(' ');
    ctx.font = '40px EBold'; ctx.fillStyle = roll ? GREY : bad ? C.coral : C.ink; ctx.fillText(txt, 260, y);
  }
  if (!roll && t > T.roll1[1]) {
    const st = bad ? 'no match' : 'match'; ctx.font = '34px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = bad ? C.coral : C.blueSoft; ctx.fillText(st, 944, 1515);
    if (bad) xMark(ctx, 700, 1515, 30, C.coral); else check(ctx, 700, 1515, 40, C.blueSoft, 1);
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
  if (big) { line('SAME SIX DIGITS.', 360, C.ink, 100); line('WHY?', 500, C.coral, 128); }
  else { line('SAME SIX DIGITS.', 390, C.ink, 86); line('WHY?', 490, C.coral, 100); }
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
  add(0.02, 'click', 0.14); add(T.same, 'chime', 0.12); add(T.why, 'retry', 0.14);
  add(T.mmIn, 'stamp', 0.2); add(T.pose, 'offline', 0.12); add(T.mmOut[0], 'sweep', 0.12, { dur: 0.5 });
  add(T.keyY[0], 'zip', 0.16); add(T.keyF[0], 'zip', 0.14); add(T.secret, 'land', 0.18);
  for (let s = T.roll1[0]; s < T.roll1[1]; s += 0.12) add(s, 'tick', 0.06); add(T.match1, 'chime', 0.18);
  add(T.mm2, 'stamp', 0.18); add(T.steal[0], 'zip', 0.14); add(T.fake[0], 'zip', 0.16);
  for (let s = T.roll2[0]; s < T.roll2[1]; s += 0.12) add(s, 'tick', 0.06); add(T.differ, 'fizz', 0.24); add(T.differ + 0.03, 'offline', 0.14);
  add(T.clean[0], 'sweep', 0.12, { dur: 0.4 }); add(T.tapY, 'click', 0.2); add(T.tapF, 'click', 0.2); add(T.ok, 'chime', 0.18);
  add(T.cta, 'chime', 0.3); add(T.cta + 0.4, 'click', 0.18);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
