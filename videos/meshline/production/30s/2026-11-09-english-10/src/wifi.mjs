// Meshline production 30s, batch 2026-11-09-english-10: "Full Wi-Fi bars, but no internet".
// Same Transit-Map world as english-06..09 (charcoal printed sheet, electric-blue ink, white stations, label halos, paper
// veils, Inter labels, screen-space caption plate + one screen-space instrument). The map separates two links: the
// PHONE ↔ ROUTER Wi-Fi radio link (dashed, what the bars measure) and the ROUTER ↔ PROVIDER internet link (solid blue).
// The internet link is cut: bars stay full, a request fizzles at the cut, a second device fails too, then cables + a
// restart re-ink the link. Sources: Android developer docs (bars = RSSI level; internet = separately validated) and
// Google Pixel Help (another-device check; restart router & modem). Generic behaviour only; no Meshline claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000;

// ------------------------------------------------------------------ map (G units, octilinear routes)
const PHONE = [5.2, 21.0], LAPTOP = [12.8, 21.0], ROUTER = [9.0, 17.2], PROV = [9.0, 10.8], CUT = [9.0, 14.0];
const RADIO = [[5.65, 20.55], [8.5, 17.7]], RADIO2 = [[12.35, 20.55], [9.5, 17.7]];
const WAN = [[9.0, 16.6], [9.0, 11.45]];
const T = {
  spin: 0.3, query: 1.4, radio: [4.4, 5.0], bars: 3.2,
  wan: [8.6, 9.5], prov: 10.6, down: 12.7, full: 13.7, req: [14.6, 15.5],
  laptop: 17.3, lapFail: 18.4, verdict: 19.6, cables: 22.6, restart: 24.0, up: 24.7, cta: 26.14,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const wanUp = t => clamp((t - T.up) / 0.3);                               // the internet link: down from the start, back after the restart
const loaded = t => clamp((t - T.up - 0.4) / 0.3);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const WIDE = { x: 9.0, y: 16.8, z: 0.95 };
function cam(t) {
  return K(t, [
    [0, { x: 6.9, y: 19.7, z: 1.5 }], [2.6, { x: 6.9, y: 19.7, z: 1.53 }],           // hook: close on the phone's full bars
    [3.4, { x: 7.4, y: 19.0, z: 1.2 }], [7.5, { x: 7.4, y: 19.0, z: 1.22 }],           // the Wi-Fi radio link
    [8.4, { x: 9.0, y: 14.6, z: 1.05 }], [13.4, { x: 9.0, y: 14.8, z: 1.06 }],         // the second link, up to the provider
    [14.3, { x: 9.0, y: 16.6, z: 1.0 }], [16.2, { x: 9.0, y: 16.6, z: 1.0 }],
    [17.0, WIDE], [21.6, { x: 9.0, y: 16.8, z: 0.96 }],
    [22.4, { x: 9.0, y: 16.0, z: 1.0 }], [25.6, { x: 9.0, y: 16.05, z: 1.01 }],        // cables + restart (device labels stay clear of the instrument)
    [26.4, WIDE], [30, { x: 9.0, y: 17.0, z: 1.0 }],
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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / english-06..09)
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
function spinner(ctx, x, y, r, t, col) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r, t * 6, t * 6 + Math.PI * 1.4); ctx.stroke(); ctx.restore(); }
function wifiBars(ctx, x, y, s, n, col) {                                 // Wi-Fi fan (n of 4 levels lit)
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { ctx.strokeStyle = i < n ? col : hexA(C.ink, 0.2); ctx.lineWidth = s * 0.16; ctx.beginPath(); ctx.arc(x, y, s * (0.25 + i * 0.27), -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke(); }
  ctx.fillStyle = n > 0 ? col : hexA(C.ink, 0.2); ctx.beginPath(); ctx.arc(x, y, s * 0.08, 0, TAU); ctx.fill(); ctx.restore();
}

// ------------------------------------------------------------------ props (generic glyphs, no app UI)
function phone(ctx, p, t, ok, s = 1.25) {
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  wifiBars(ctx, x, y - h * 0.18, 0.42 * G, 4, C.blueSoft);                // full bars on its own screen
  if (ok > 0) check(ctx, x, y + h * 0.16, 0.36 * G, C.blueSoft, ok); else spinner(ctx, x, y + h * 0.18, 0.13 * G, t, C.coral);
}
function laptop(ctx, p, t, ok, a) {
  if (a <= 0) return; const x = p[0] * G, y = p[1] * G, w = 1.5 * G, h = 0.95 * G;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.1 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.1 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.08 * G, y - h / 2 + 0.08 * G, w - 0.16 * G, h - 0.16 * G, 0.05 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w * 0.62, y + h / 2 - 0.02 * G, w * 1.24, 0.16 * G, 0.06 * G); ctx.fill();
  if (ok > 0) check(ctx, x, y, 0.36 * G, C.blueSoft, ok); else { spinner(ctx, x - 0.25 * G, y, 0.13 * G, t, C.coral); if (t > T.lapFail) cross(ctx, [p[0] + 0.3, p[1]], 0.14, clamp((t - T.lapFail) / 0.2)); }
  ctx.restore();
}
function router(ctx, p, t) {
  const x = p[0] * G, y = p[1] * G, w = 1.5 * G, h = 0.72 * G;
  for (let k = 0; k < 2; k++) { const age = ((t + k * 0.6) % 1.2) / 1.2; ctx.strokeStyle = hexA(C.blueSoft, 0.55 * (1 - age)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y - 0.1 * G, (0.9 + 0.9 * age) * G, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke(); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.08 * G; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w * 0.3, y - h / 2); ctx.lineTo(x - w * 0.36, y - h / 2 - 0.42 * G); ctx.moveTo(x + w * 0.3, y - h / 2); ctx.lineTo(x + w * 0.36, y - h / 2 - 0.42 * G); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.16 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.16 * G); ctx.fill();
  const up = wanUp(t);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = i === 2 ? (up > 0.5 ? C.blue : C.coral) : C.blue; ctx.beginPath(); ctx.arc(x - 0.36 * G + i * 0.36 * G, y, 0.08 * G, 0, TAU); ctx.fill(); }
}
function provider(ctx, p, k) {
  if (k <= 0) return; const x = p[0] * G, y = p[1] * G, w = 2.2 * G, h = 1.2 * G;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, -w / 2 + 4, -h / 2 + 7, w, h, 0.22 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, -w / 2, -h / 2, w, h, 0.22 * G); ctx.fill();
  ctx.strokeStyle = C.charcoal; ctx.lineWidth = 0.08 * G; ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = '#C9D0CC'; roundRect(ctx, -w / 2 + 0.25 * G, -h / 2 + (0.22 + i * 0.3) * G, w - 0.7 * G, 0.18 * G, 0.05 * G); ctx.fill(); }
  ctx.restore();
}

// ------------------------------------------------------------------ beats
function drawScene(ctx, t) {
  // Wi-Fi radio links (dashed): phone ↔ router (always up), laptop ↔ router (once it joins)
  const rk = Math.max(0.999 * (t > 0 ? 1 : 0), 0) && ease.out(inv(...T.radio, t));
  const rhl = env(t, T.radio[0], T.radio[0] + 0.3) * (1 - env(t, 7.4, 7.9));
  if (rhl > 0) strokePath(ctx, RADIO, len(RADIO), 0.34 * G, hexA(C.blueSoft, 0.2 * rhl), false);
  strokePath(ctx, RADIO, len(RADIO), 0.13 * G, C.blueSoft, true, [14, 9]);
  if (rk > 0 && rk < 1) penTip(ctx, at(RADIO, len(RADIO) * rk));
  const la = ease.outBack(clamp((t - T.laptop) / 0.35));
  if (t > T.laptop) strokePath(ctx, RADIO2, len(RADIO2) * clamp((t - T.laptop) / 0.4), 0.13 * G, C.blueSoft, true, [14, 9]);
  label(ctx, 'Wi-Fi radio link', 5.75, 18.65, 0.44, C.blueSoft, 'right', 'EBold', rhl);
  label(ctx, 'bars = this link', 5.75, 19.3, 0.4, C.ink, 'right', 'EBold', env(t, T.bars + 2.4, T.bars + 2.8) * (1 - env(t, 7.4, 7.9)) + env(t, T.full, T.full + 0.3) * (1 - env(t, 16.4, 16.9)));
  // the internet link: router ↔ provider (solid when up, coral dashed while down)
  const wk = ease.inOut(inv(...T.wan, t)), up = wanUp(t), L = len(WAN);
  if (wk > 0) {
    const downA = env(t, T.down, T.down + 0.3) * (1 - up);
    if (downA < 1) { ctx.save(); ctx.globalAlpha *= 1 - downA; strokePath(ctx, WAN, L * wk, 0.24 * G, C.blue); ctx.restore(); }
    if (downA > 0) { ctx.save(); ctx.globalAlpha *= downA; strokePath(ctx, WAN, L * wk, 0.14 * G, hexA(C.coral, 0.75), false, [12, 12]); ctx.restore(); }
    if (wk < 1) penTip(ctx, at(WAN, L * wk));
    cross(ctx, CUT, 0.3 * (0.6 + 0.4 * ease.outBack(clamp((t - T.down) / 0.35))), downA);
    label(ctx, 'internet link', 9.55, 15.3, 0.44, C.ink, 'left', 'EBold', env(t, T.wan[0] + 0.2, T.wan[1]) * (1 - env(t, 16.4, 16.9)));
    label(ctx, 'down', 9.55, 14.0, 0.48, C.coral, 'left', 'EBold', downA * (1 - env(t, T.verdict - 0.2, T.verdict)));
    label(ctx, 'the problem is here', 9.55, 14.0, 0.46, C.coral, 'left', 'EBold', env(t, T.verdict, T.verdict + 0.3) * (1 - up));
    label(ctx, 'back up', 9.55, 14.0, 0.48, C.blueSoft, 'left', 'EBold', up * (1 - env(t, 28.6, 29.2)));
  }
  provider(ctx, PROV, ease.outBack(clamp((t - T.prov) / 0.35)));
  label(ctx, 'internet provider', PROV[0], PROV[1] - 1.0, 0.44, C.ink, 'center', 'EBold', clamp((t - T.prov) / 0.3));
  // a page request from the phone: across the Wi-Fi link fine, then stops at the cut
  if (t > T.req[0] && t < T.req[1] + 0.8) {
    const path = [RADIO[0], RADIO[1], [9.0, 16.6], CUT], Lp = len(path), q = ease.inOut(inv(...T.req, t));
    if (q < 1) { const p = at(path, Lp * q); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.15 * G, 0, TAU); ctx.fill(); }
    fizz(ctx, CUT, t, T.req[1]);
  }
  label(ctx, 'nothing gets through', CUT[0] - 0.55, CUT[1], 0.42, C.coral, 'right', 'EBold', env(t, T.req[1], T.req[1] + 0.3) * (1 - env(t, 16.6, 17.0)));
  // cables + restart at the router (l6)
  const cb = env(t, T.cables, T.cables + 0.3) * (1 - env(t, 25.4, 25.9));
  if (cb > 0) { ctx.save(); ctx.globalAlpha *= cb; ctx.strokeStyle = C.ink; ctx.lineWidth = 0.09 * G; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo((ROUTER[0] + 0.75) * G, ROUTER[1] * G); ctx.bezierCurveTo((ROUTER[0] + 1.6) * G, (ROUTER[1] + 0.2) * G, (ROUTER[0] + 1.4) * G, (ROUTER[1] + 1.2) * G, (ROUTER[0] + 2.3) * G, (ROUTER[1] + 1.1) * G); ctx.stroke(); ctx.fillStyle = C.ink; ctx.fillRect((ROUTER[0] + 2.3) * G, (ROUTER[1] + 0.95) * G, 0.32 * G, 0.3 * G); ctx.restore(); }
  label(ctx, 'check cables', ROUTER[0] + 2.75, ROUTER[1] + 1.1, 0.42, C.ink, 'left', 'EBold', cb);
  const rs = env(t, T.restart, T.restart + 0.2) * (1 - env(t, 25.6, 26.0));
  if (rs > 0) { ctx.save(); ctx.globalAlpha *= rs; const x = (ROUTER[0] - 1.65) * G, y = (ROUTER[1] - 0.1) * G, r = 0.32 * G; ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 0.08 * G; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI * 0.3 + t * 3, Math.PI * 1.3 + t * 3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - r * 1.25); ctx.lineTo(x, y - r * 0.35); ctx.stroke(); ctx.restore(); }
  label(ctx, 'restart', ROUTER[0] - 1.65, ROUTER[1] + 0.7, 0.4, C.blueSoft, 'center', 'EBold', rs);
  ring(ctx, ROUTER, t - T.up, C.blueSoft, 1.0); ring(ctx, PROV, t - T.up - 0.15, C.blueSoft, 1.0);
  // devices
  router(ctx, ROUTER, t);
  label(ctx, 'router', ROUTER[0], ROUTER[1] + 0.85, 0.42, C.ink, 'center', 'EBold', 1);
  phone(ctx, PHONE, t, loaded(t));
  label(ctx, 'your phone', PHONE[0], PHONE[1] + 1.15, 0.42, C.ink, 'center', 'EBold', 1);
  { const pa = env(t, 0.3, 0.6) * (1 - env(t, 3.2, 3.6)); if (pa > 0) { label(ctx, 'page: loading…', PHONE[0] + 0.8, PHONE[1] + 0.5, 0.42, C.coral, 'left', 'EBold', pa); label(ctx, 'Wi-Fi: full bars', PHONE[0] + 0.8, PHONE[1] - 0.08, 0.42, C.blueSoft, 'left', 'EBold', pa); } }
  label(ctx, '?', PHONE[0] - 0.95, PHONE[1] - 0.7, 0.85 * ease.outBack(clamp((t - T.query) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.query) / 0.25) * (1 - env(t, 3.4, 3.8)));
  label(ctx, 'phone: OK', PHONE[0], PHONE[1] + 1.75, 0.4, C.blueSoft, 'center', 'EBold', env(t, T.verdict, T.verdict + 0.3) * (1 - env(t, 22.0, 22.4)));
  laptop(ctx, LAPTOP, t, loaded(t), clamp(la));
  label(ctx, 'another device', LAPTOP[0], LAPTOP[1] + 1.0, 0.42, C.ink, 'center', 'EBold', clamp(la));
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(2.3 * G, 16.9 * G, 0.1 * G, 1.25 * G); ctx.restore();
  label(ctx, 'Full bars, no internet?', 2.6, 17.25, 0.46, C.ink, 'left', 'EBold', a);
  label(ctx, 'two different links', 2.6, 17.85, 0.36, '#B5BDB8', 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument: the two links, side by side
function drawInstrument(ctx, t) {
  const A = env(t, 0.1, 0.4) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const Y1 = 1462, Y2 = 1530, up = wanUp(t);
  const h1 = env(t, T.radio[0], T.radio[0] + 0.3) * (1 - env(t, 7.4, 7.9)), h2 = env(t, T.down, T.down + 0.3) * (1 - env(t, 16.4, 16.9)) + env(t, T.verdict, T.verdict + 0.3) * (1 - env(t, 22.0, 22.4));
  if (h1 > 0) { ctx.fillStyle = hexA(C.blue, 0.18 * h1); roundRect(ctx, 108, Y1 - 28, 864, 56, 12); ctx.fill(); }
  if (h2 > 0) { ctx.fillStyle = hexA(up > 0.5 ? C.blue : C.coral, 0.18 * Math.min(1, h2)); roundRect(ctx, 108, Y2 - 28, 864, 56, 12); ctx.fill(); }
  ctx.font = '25px EBold'; ctx.fillStyle = C.ink; ctx.fillText('Wi-Fi radio', 132, Y1); ctx.fillStyle = hexA(C.ink, 0.6); ctx.font = '21px ESemi'; ctx.fillText('phone ↔ router', 290, Y1);
  wifiBars(ctx, 640, Y1 + 10, 34, 4, C.blueSoft); ctx.fillStyle = C.blueSoft; ctx.font = '25px EBold'; ctx.fillText('full', 690, Y1);
  const r2 = env(t, T.wan[0], T.wan[0] + 0.3);
  ctx.save(); ctx.globalAlpha *= Math.max(0.35, r2);
  ctx.font = '25px EBold'; ctx.fillStyle = C.ink; ctx.fillText('internet', 132, Y2); ctx.fillStyle = hexA(C.ink, 0.6); ctx.font = '21px ESemi'; ctx.fillText('router ↔ provider', 290, Y2);
  const st = t < T.down ? '…' : up > 0.5 ? 'up' : 'down';
  ctx.font = '25px EBold'; ctx.fillStyle = st === 'down' ? C.coral : st === 'up' ? C.blueSoft : hexA(C.ink, 0.5); ctx.fillText(st, 690, Y2);
  if (st === 'down') cross(ctx, [640 / G, Y2 / G], 0.17, 1); else if (st === 'up') check(ctx, 640, Y2, 26, C.blueSoft);
  ctx.restore();
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
  drawCartouche(ctx, 1 - env(t, 3.0, 3.5));
  drawScene(ctx, t);
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
  for (let t = 0.4; t < 2.6; t += 0.5) add(t, 'tick', 0.14);
  add(T.query, 'retry', 0.24); add(T.radio[0], 'pen', 0.35, { dur: 0.6 });
  add(T.wan[0], 'pen', 0.4, { dur: T.wan[1] - T.wan[0] }); add(T.prov, 'stop', 0.28);
  add(T.down, 'offline', 0.26); add(T.down + 0.05, 'stamp', 0.26); add(T.req[0], 'zip', 0.24); add(T.req[1], 'fizz', 0.3);
  add(T.laptop, 'stop', 0.26); add(T.lapFail, 'retry', 0.22); add(T.verdict, 'callout', 0.24);
  add(T.cables, 'click', 0.28); add(T.restart, 'sweep', 0.2, { dur: 0.6 }); add(T.up, 'chime', 0.32);
  add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
