// Meshline production 30s, batch 2026-11-15-english-16: "Why Bluetooth hops 1,600 times a second".
// Same Transit-Map world as english-06..15 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). A hop map (79 one-MHz channels, 2402-2480 MHz, vs
// time) drawn as a transit line whose stations are the channels visited; two connected devices tune to the same station
// at every hop. Sources: NIST SP 800-121r2-upd1 §2.1 (79 x 1 MHz, ~1600 hops/s, 625 us, pseudo-random sequence,
// interference avoidance, crowded band), ETSI EN 300 328 (adaptive frequency hopping excludes used channels), Apple router
// guide (20 MHz on 2.4 GHz avoids issues with Bluetooth devices). Generic radio behaviour; no Meshline transport claims.
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

// ------------------------------------------------------------------ the hop map: 79 one-MHz channels (2402–2480 MHz) against time
const MAP = { x0: 4.4, x1: 13.6, y0: 9.4, y1: 22.6 }, NCH = 79, DY = (MAP.y1 - MAP.y0) / NCH;
const rowY = k => MAP.y1 - (k + 0.5) * DY;                                 // channel k = 2402 + k MHz (higher = up)
const PA = [2.35, 16.0], PB = [15.65, 16.0];                               // the two connected devices
const WIFI = [{ c: 2412, at: 5.45 }, { c: 2437, at: 5.85 }, { c: 2462, at: 6.25 }];
const T = {
  title: 0.55, l2: 4.7, gadgets: 6.6, hop: 8.88, together: 9.46, n79: 10.26,
  brief: 13.0, spoil: 13.9, few: 15.0, spot: 17.7, skip: 19.18,
  router: 20.3, w20: 23.1, room: 24.95, cta: 26.29,
};
const R = t => (t < 4.6 ? 9 : 6);                                          // visual hop rate (slow motion), faster in the hook
const headIdx = t => (t < 4.6 ? 9 * t : 9 * 4.6 + 6 * (t - 4.6)) + 30;
const hopT = i => { const j = i - 30; return j < 41.4 ? j / 9 : 4.6 + (j - 41.4) / 6; };
const bandHalf = (b, t) => (b.c === 2437 ? lerp(20, 10, ease.inOut(inv(T.w20 - 0.1, T.w20 + 0.6, t))) * (t > T.router ? 1 : 0.5) + (t > T.router ? 0 : 0) : 10);
function bandA(b, t) {                                                     // which Wi-Fi bands are on the map, and how strongly
  const on = env(t, b.at - 0.1, b.at + 0.2);
  if (b.c !== 2437) return on * (1 - env(t, T.router - 0.2, T.router + 0.3));
  return on;
}
// Wi-Fi is bursty: each band carries short bursts in time (about a quarter of the slots), so only some hops are hit
const BURSTS = WIFI.map((b, j) => { const out = []; let i = 0; while (i < 420) { i += 4 + Math.floor(hash(i * 1.9 + j * 13.1) * 10); const n = 2 + Math.floor(hash(i * 3.3 + j * 7.7) * 3); out.push([i, i + n]); i += n; } return out; });
const inBand = (k, b, half = 10) => Math.abs(2402 + k - b.c) <= half;
const burstAt = (i, j) => BURSTS[j].some(([a, e]) => i >= a && i < e);
const hitAt = i => { const k = rawCh(i), t = hopT(i); return t < T.skip && t < T.router && WIFI.some((b, j) => inBand(k, b) && burstAt(i, j)); };
const busy = (k, t) => (t < T.router ? WIFI.some(b => inBand(k, b)) : inBand(k, WIFI[1], lerp(20, 10, ease.inOut(inv(T.w20 - 0.1, T.w20 + 0.7, t)))));
const rawCh = i => Math.floor(hash(i * 1.37 + 0.31) * NCH);
function chAt(i) {                                                          // adaptive hopping (after T.skip) remaps busy channels to free ones
  const k = rawCh(i), t = hopT(i);
  if (t < T.skip || !busy(k, t)) return k;
  for (let n = 1; n < 80; n++) { const k2 = Math.floor(hash(i * 2.11 + n * 0.77) * NCH); if (!busy(k2, t)) return k2; }
  return k;
}
const DX = 0.46, HEADX = 13.0;
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 16.0, z: 1.05 }], [4.4, { x: 9.0, y: 16.0, z: 1.07 }],            // hook: the hop route between two devices
    [12.0, { x: 9.0, y: 16.0, z: 1.07 }],
    [12.6, { x: 10.0, y: 16.0, z: 1.25 }], [16.2, { x: 10.0, y: 16.0, z: 1.27 }],       // each stop is brief; a few hits
    [16.8, { x: 9.0, y: 16.0, z: 1.06 }], [30, { x: 9.0, y: 16.0, z: 1.1 }],           // skip busy channels; router tip; CTA
  ]);
}

// ------------------------------------------------------------------ drawing
function phoneCh(ctx, p, t, k, s = 1.6) {                                   // device glyph showing the channel it is on right now
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  ctx.fillStyle = GREY; ctx.font = `${0.2 * G * s}px ESemi`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ch', x, y - 0.18 * G * s);
  ctx.fillStyle = C.blueSoft; ctx.font = `${0.36 * G * s}px EBold`; ctx.fillText(String(k), x, y + 0.14 * G * s);
}
function drawScene(ctx, t) {
  const v = veil(t);
  // printed map frame + 79 channel rows (every 10th stronger)
  ctx.save(); ctx.strokeStyle = hexA(C.ink, 0.35); ctx.lineWidth = 0.06 * G; ctx.strokeRect(MAP.x0 * G, MAP.y0 * G, (MAP.x1 - MAP.x0) * G, (MAP.y1 - MAP.y0) * G);
  for (let k = 0; k < NCH; k++) { ctx.strokeStyle = hexA(C.ink, k % 10 === 0 ? 0.13 : 0.05); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(MAP.x0 * G, rowY(k) * G); ctx.lineTo(MAP.x1 * G, rowY(k) * G); ctx.stroke(); }
  ctx.restore();
  label(ctx, '2402 MHz', MAP.x0 + 0.1, MAP.y1 + 0.45, 0.36, GREY, 'left', 'ESemi', 1 - v);
  label(ctx, '2480 MHz', MAP.x0 + 0.1, MAP.y0 - 0.45, 0.36, GREY, 'left', 'ESemi', 1 - v);
  // Wi-Fi: faint band outlines plus short coral bursts that scroll with the route (until the router beat)
  const H0 = headIdx(t), xOfI = i => HEADX - (H0 - i) * DX;
  WIFI.forEach((b, j) => {
    const a = (0.55 + 0.45 * env(t, b.at - 0.1, b.at + 0.2)) * (1 - env(t, T.router - 0.3, T.router + 0.2)) * (1 - v * 0.7); if (a <= 0.01) return;
    const k0 = b.c - 10 - 2402, k1 = Math.min(NCH - 1, b.c + 10 - 2402), y0 = rowY(k1) - DY / 2, y1 = rowY(Math.max(0, k0)) + DY / 2;
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = hexA(C.coral, 0.35); ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]); ctx.strokeRect(MAP.x0 * G, y0 * G, (MAP.x1 - MAP.x0) * G, (y1 - y0) * G); ctx.setLineDash([]);
    ctx.beginPath(); ctx.rect(MAP.x0 * G, y0 * G, (MAP.x1 - MAP.x0) * G, (y1 - y0) * G); ctx.clip();
    for (const [s0, s1] of BURSTS[j]) { const xa = xOfI(s0 - 0.5), xb = xOfI(s1 - 0.5); if (xb < MAP.x0 || xa > HEADX + 0.2) continue; ctx.fillStyle = hexA(C.coral, 0.42); ctx.fillRect(Math.max(MAP.x0, xa) * G, y0 * G, (Math.min(HEADX + 0.2, xb) - Math.max(MAP.x0, xa)) * G, (y1 - y0) * G); }
    ctx.restore();
    label(ctx, 'Wi-Fi', MAP.x0 + 0.25, (y0 + y1) / 2, 0.5, C.coral, 'left', 'EBold', a * env(t, b.at - 0.1, b.at + 0.2));
  });
  // the router beat: one Wi-Fi channel allocation, narrowed from 40 to 20 MHz
  { const b = WIFI[1], a = env(t, T.router - 0.1, T.router + 0.3) * (1 - v * 0.7);
    if (a > 0.01) { const half = lerp(20, 10, ease.inOut(inv(T.w20 - 0.1, T.w20 + 0.7, t))), k0 = Math.max(0, b.c - half - 2402), k1 = Math.min(NCH - 1, b.c + half - 2402), y0 = rowY(k1) - DY / 2, y1 = rowY(k0) + DY / 2;
      ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = hexA(C.coral, 0.22); ctx.fillRect(MAP.x0 * G, y0 * G, (MAP.x1 - MAP.x0) * G, (y1 - y0) * G); ctx.strokeStyle = hexA(C.coral, 0.65); ctx.lineWidth = 2; ctx.strokeRect(MAP.x0 * G, y0 * G, (MAP.x1 - MAP.x0) * G, (y1 - y0) * G); ctx.restore();
      label(ctx, 'your Wi-Fi', MAP.x0 + 0.25, (y0 + y1) / 2, 0.55, C.coral, 'left', 'EBold', a);
      label(ctx, half > 15 ? '40 MHz' : '20 MHz', MAP.x1 - 0.25, (y0 + y1) / 2, 0.62, half > 15 ? C.coral : C.blueSoft, 'right', 'EBold', a); } }
  // freed channels glow after the router narrows its band (l6)
  const fr = env(t, T.w20 + 0.5, T.w20 + 0.9) * (1 - v);
  if (fr > 0) { ctx.save(); ctx.globalAlpha *= fr * 0.22; ctx.fillStyle = C.blue; for (const [a0, a1] of [[2417, 2426], [2448, 2457]]) { const y0 = rowY(a1 - 2402) - DY / 2, y1 = rowY(a0 - 2402) + DY / 2; ctx.fillRect(MAP.x0 * G, y0 * G, (MAP.x1 - MAP.x0) * G, (y1 - y0) * G); } ctx.restore(); }
  label(ctx, 'more room', 9.0, MAP.y0 - 0.55, 0.7, C.blueSoft, 'center', 'EBold', env(t, T.room - 0.1, T.room + 0.2) * (1 - v));
  // other 2.4 GHz gadgets: short coral blips
  const ga = env(t, T.gadgets - 0.1, T.gadgets + 0.2) * (1 - env(t, 8.0, 8.5));
  if (ga > 0) for (let i = 0; i < 14; i++) { const ph = (t * 2.2 + hash(i * 4.1)) % 1; ctx.fillStyle = hexA(C.coral, 0.7 * ga * Math.sin(Math.PI * ph)); ctx.fillRect((MAP.x0 + 0.4 + hash(i * 2.7) * 9.2) * G, rowY(Math.floor(hash(i * 6.3) * NCH)) * G - 3, 0.5 * G, 6); }
  label(ctx, 'other gadgets', 9.0, MAP.y0 - 0.55, 0.6, C.coral, 'center', 'EBold', ga);
  // adaptive hopping: busy rows are struck out (hatched) once the radio "spots" them
  const sa = env(t, T.spot - 0.1, T.spot + 0.3) * (1 - env(t, T.router - 0.3, T.router)) * (1 - v);
  if (sa > 0) for (const b of WIFI) {
    const k0 = b.c - 10 - 2402, k1 = b.c + 10 - 2402, y0 = rowY(Math.min(NCH - 1, k1)) - DY / 2, y1 = rowY(Math.max(0, k0)) + DY / 2;
    ctx.save(); ctx.globalAlpha *= sa; ctx.beginPath(); ctx.rect(MAP.x0 * G, y0 * G, (MAP.x1 - MAP.x0) * G, (y1 - y0) * G); ctx.clip(); ctx.strokeStyle = hexA(C.ink, 0.35); ctx.lineWidth = 2;
    for (let xx = MAP.x0 - 4; xx < MAP.x1; xx += 0.35) { ctx.beginPath(); ctx.moveTo(xx * G, y1 * G); ctx.lineTo((xx + (y1 - y0)) * G, y0 * G); ctx.stroke(); } ctx.restore();
  }
  label(ctx, 'skip busy channels', 9.0, MAP.y0 - 0.55, 0.62, C.blueSoft, 'center', 'EBold', env(t, T.skip - 0.1, T.skip + 0.2) * (1 - env(t, T.router - 0.3, T.router)));
  // the hop route: a transit line whose stations are the channels it visits, slot by slot
  const H = headIdx(t), i1 = Math.floor(H), frac = H - i1, N = Math.ceil((HEADX - MAP.x0) / DX) + 1;
  const xOf = i => HEADX - (H - i) * DX;
  const pts = []; for (let i = i1 - N; i <= i1; i++) { const x = xOf(i); if (x < MAP.x0 - 0.01) continue; pts.push([x, rowY(chAt(i)), i]); }
  const headK = chAt(i1);
  const ra = 1 - v * 0.6;
  if (pts.length > 1) {
    ctx.save(); ctx.globalAlpha *= ra; ctx.beginPath(); ctx.rect(MAP.x0 * G, (MAP.y0 - 0.2) * G, (MAP.x1 - MAP.x0) * G, (MAP.y1 - MAP.y0 + 0.4) * G); ctx.clip();
    ctx.save(); ctx.globalAlpha *= 0.7; strokePath(ctx, pts.map(p => [p[0], p[1]]), len(pts.map(p => [p[0], p[1]])), 0.07 * G, C.blue, false); ctx.restore();   // thin jump lines; the stops are the transmissions
    for (const [x, y, i] of pts) {
      const hit = hitAt(i);
      ctx.fillStyle = hit ? C.coral : C.ink; ctx.strokeStyle = hit ? C.coral : C.blue; ctx.lineWidth = 0.05 * G; ctx.beginPath(); ctx.arc(x * G, y * G, (hit ? 0.15 : 0.12) * G, 0, TAU); ctx.fill(); ctx.stroke();
      if (hit && t > 12.4 && t < 16.6) cross(ctx, [x, y - 0.32], 0.12, env(t, T.spoil - 0.2, T.spoil));
    }
    ctx.restore();
  }
  penTip(ctx, [HEADX, rowY(headK)]);
  // both devices tune to the same channel at every hop: their links meet at the head station
  const la = (1 - v * 0.7);
  for (const p of [PA, PB]) { ctx.save(); ctx.globalAlpha *= la * 0.5; strokePath(ctx, [[p[0] + (p[0] < 9 ? 0.5 : -0.5), p[1]], [HEADX, rowY(headK)]], 99, 0.05 * G, C.blueSoft, false, [8, 8]); ctx.restore(); }
  phoneCh(ctx, PA, t, headK); phoneCh(ctx, PB, t, headK);
  label(ctx, 'in sync', 9.0, MAP.y0 - 0.55, 0.7, C.blueSoft, 'center', 'EBold', env(t, T.together - 0.1, T.together + 0.2) * (1 - env(t, T.n79 - 0.25, T.n79 - 0.05)));
  // 79 channels bracket
  const ba = env(t, T.n79 - 0.1, T.n79 + 0.2) * (1 - env(t, 12.2, 12.6));
  if (ba > 0) { const x = MAP.x1 + 0.35; ctx.save(); ctx.globalAlpha *= ba; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo((x - 0.15) * G, MAP.y0 * G); ctx.lineTo(x * G, MAP.y0 * G); ctx.lineTo(x * G, MAP.y1 * G); ctx.lineTo((x - 0.15) * G, MAP.y1 * G); ctx.stroke(); ctx.restore(); label(ctx, '79 channels', 9.0, MAP.y0 - 0.55, 0.7, C.ink, 'center', 'EBold', ba); }
  // l4: each stop under a millisecond; only a few hits
  const sb = env(t, T.brief - 0.1, T.brief + 0.2) * (1 - env(t, 16.2, 16.6));
  if (sb > 0) { const xa = HEADX - DX, xb = HEADX, y = MAP.y1 + 0.4; ctx.save(); ctx.globalAlpha *= sb; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa * G, y * G); ctx.lineTo(xb * G, y * G); for (const x of [xa, xb]) { ctx.moveTo(x * G, (y - 0.15) * G); ctx.lineTo(x * G, (y + 0.15) * G); } ctx.stroke(); ctx.restore(); label(ctx, '625 µs per stop', HEADX - DX / 2, y + 0.55, 0.55, C.ink, 'right', 'EBold', sb); }
  label(ctx, 'only a few hits', MAP.x0 + 0.2, MAP.y1 + 0.95, 0.55, C.coral, 'left', 'EBold', env(t, T.few - 0.1, T.few + 0.2) * (1 - env(t, 16.2, 16.6)));
}

// ------------------------------------------------------------------ screen-space instrument: real-time hop counter (about 1,600 per second)
function drawInstrument(ctx, t) {
  const A = (1 - env(t, 12.2, 12.5) + env(t, 16.3, 16.6)) * (1 - env(t, T.router - 0.3, T.router)) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('hops so far, real time (~1,600/s)', 132, 1460);
  ctx.font = '60px EDisplay'; ctx.fillStyle = C.blueSoft; ctx.fillText(Math.floor(1600 * t).toLocaleString('en-US'), 132, 1522);
  ctx.textAlign = 'right'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('the map is slowed down', 940, 1522);
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
  if (big) { line('1,600 HOPS', 360, C.ink, 118); line('A SECOND?', 490, C.blueSoft, 118); }
  else { line('1,600 HOPS', 390, C.ink, 96); line('A SECOND?', 488, C.blueSoft, 96); }
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
  for (let i = 31; i < 300; i++) { const s = hopT(i); if (s < 0.05 || s > 26.0) continue; if (s > T.router - 0.2 && s < T.cta) { if (i % 3) continue; } add(s, 'tick', s < 4.6 ? 0.07 : 0.06); }
  add(T.l2 + 0.75, 'stamp', 0.14); add(T.l2 + 1.15, 'stamp', 0.12); add(T.l2 + 1.55, 'stamp', 0.12); add(T.gadgets, 'fizz', 0.12);
  add(T.hop, 'relay', 0.16); add(T.n79, 'click', 0.16); add(T.brief, 'click', 0.14);
  for (let i = 31; i < 300; i++) { const s = hopT(i); if (s > 0.05 && hitAt(i)) add(s, 'fizz', 0.1); }
  add(T.spot, 'sweep', 0.14, { dur: 0.6 }); add(T.skip, 'chime', 0.16);
  add(T.router, 'sweep', 0.12, { dur: 0.5 }); add(T.w20, 'land', 0.2); add(T.room, 'stop', 0.18);
  add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
