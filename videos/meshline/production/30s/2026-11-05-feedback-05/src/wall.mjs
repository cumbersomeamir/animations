// Meshline production 30s, batch 2026-11-05-feedback-05 (Hindi): "दीवार के पीछे हेडफ़ोन की आवाज़ क्यों टूटती है?" (why Bluetooth
// headphones break up behind a thick wall). Same Transit-Map world and Hindi recipe as Hindi batches 03–04 (charcoal printed
// sheet, electric-blue ink, white stations, pen tips, paper veils, Devanagari labels, screen-space caption plate + one
// screen-space instrument). One familiar scene: a printed home floor plan with a phone on a table, a thick hatched concrete
// wall with a doorway, a headphones token walking a printed footpath, a second radio making noise, and (later) the mobile
// tower. Link quality is computed from the drawn geometry (distance + wall crossing + noise), so the instrument's bars and
// audio waveform follow what the map shows. Generic Bluetooth behaviour only; no Meshline radio/range claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';
import { CAP } from './caplayout.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000, HF = 'HBold, EBold', HS = 'HSemi, ESemi';

// ------------------------------------------------------------------ map (G units)
const HOME = { x0: 2.4, y0: 15.0, x1: 15.6, y1: 24.0 };
const WALL = { x0: 9.0, x1: 9.6, y0: 15.0, y1: 22.2 };                  // thick interior wall; doorway below it (y 22.2–24)
const PHONE = [5.4, 18.4], TABLE = { x0: 4.3, y0: 17.6, x1: 6.5, y1: 19.2 };
const WALK = [[7.0, 20.4], [9.3, 22.7], [11.0, 22.7], [12.8, 20.9], [12.8, 18.6]];   // footpath: near the phone → doorway → behind the wall
const ROUTER = [14.4, 16.3], TOWER = [3.6, 11.4];
const CELL = [[5.4, 17.75], [5.4, 13.2], [3.6, 11.4]];
const T = {
  query: 2.0, link: [5.0, 5.6], wallHl: [7.7, 10.4], weak: 10.2, dist: [11.0, 11.5], noise: [11.9, 13.2],
  walkBack: [13.6, 16.0], clean: 16.2, why: 17.0,
  tower: 18.9, stepIn: [19.6, 20.9], cmp: 21.0, stepOut: [22.6, 24.2], tagDist: 24.0, tagPath: 24.65, cta: 25.99,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const WL = len(WALK), DC = len(WALK.slice(0, 4));
function hpD(t) {                                                         // headphones position along the footpath
  if (t < 1.8) return lerp(6.0, WL, ease.out(inv(0, 1.8, t)));
  if (t < T.walkBack[0]) return WL;
  if (t < T.walkBack[1]) return lerp(WL, 0, ease.inOut(inv(...T.walkBack, t)));
  if (t < T.stepIn[0]) return 0;
  if (t < T.stepIn[1]) return lerp(0, DC, ease.inOut(inv(...T.stepIn, t)));
  if (t < T.stepOut[0]) return DC;
  if (t < T.stepOut[1]) return lerp(DC, 0, ease.inOut(inv(...T.stepOut, t)));
  return 0;
}
const noise = t => env(t, T.noise[0], T.noise[0] + 0.3) * (1 - env(t, T.noise[1], T.noise[1] + 0.4));
function linkState(t) {                                                   // illustrative link quality from the drawn geometry
  const hp = at(WALK, hpD(t)), d = Math.hypot(hp[0] - PHONE[0], hp[1] - PHONE[1]);
  let cross = 0;
  if (hp[0] > WALL.x0) { const k = (9.3 - PHONE[0]) / (hp[0] - PHONE[0]), y = PHONE[1] + (hp[1] - PHONE[1]) * k; cross = clamp((WALL.y1 + 0.2 - y) / 0.4) * clamp((hp[0] - WALL.x0) / 0.6); }
  const q = clamp(1.15 - 0.06 * d - 0.6 * cross - 0.18 * noise(t));
  return { hp, d, cross, q, bars: Math.round(q * 4) };
}

// ------------------------------------------------------------------ camera (one purposeful move per beat; follows the walks)
const WIDE = { x: 9.0, y: 17.2, z: 0.88 };
function cam(t) {
  return K(t, [
    [0, { x: 9.1, y: 19.4, z: 1.15 }], [3.4, { x: 9.2, y: 19.3, z: 1.18 }],
    [4.2, { x: 9.1, y: 18.9, z: 1.25 }], [7.3, { x: 9.1, y: 18.9, z: 1.27 }],         // the direct link
    [8.0, { x: 10.0, y: 18.6, z: 1.0 }], [12.9, { x: 10.0, y: 18.7, z: 1.02 }],      // wall, distance, radio noise
    [13.6, { x: 9.4, y: 19.6, z: 1.15 }], [16.0, { x: 7.8, y: 20.2, z: 1.25 }], [18.3, { x: 7.8, y: 20.1, z: 1.27 }],   // the test walk
    [19.2, WIDE], [22.4, { x: 9.0, y: 17.2, z: 0.885 }],                            // tower vs headphone link
    [25.8, { x: 8.6, y: 17.6, z: 0.92 }], [30, { x: 8.4, y: 17.9, z: 0.98 }],
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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / Hindi batches)
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
function check(ctx, x, y, s, col, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.45, y); ctx.lineTo(x - s * 0.1, y + s * 0.35); ctx.lineTo(x + s * 0.5, y - s * 0.35); ctx.stroke(); ctx.restore();
}
function sparks(ctx, p, t, a = 1) {                                       // coral breakup sparks where the link hits the wall
  if (a <= 0.02) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const ph = (t * 2.2 + i / 6) % 1, an = i / 6 * TAU + hash(i) * 0.8, r0 = (0.15 + ph * 0.55) * G; ctx.globalAlpha = a * (1 - ph); ctx.beginPath(); ctx.moveTo(p[0] * G + Math.cos(an) * r0, p[1] * G + Math.sin(an) * r0); ctx.lineTo(p[0] * G + Math.cos(an) * (r0 + 0.16 * G), p[1] * G + Math.sin(an) * (r0 + 0.16 * G)); ctx.stroke(); }
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
function headphones(ctx, p, q, t) {                                       // over-ear headphones token; sound arcs clean or broken by link quality
  const x = p[0] * G, y = p[1] * G;
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 0.13 * G; ctx.beginPath(); ctx.arc(3, 5, 0.42 * G, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.13 * G; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 0.42 * G, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  for (const sx of [-1, 1]) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, sx * 0.42 * G - 0.15 * G + 3, -0.12 * G + 5, 0.3 * G, 0.46 * G, 0.12 * G); ctx.fill(); ctx.fillStyle = C.ink; roundRect(ctx, sx * 0.42 * G - 0.15 * G, -0.12 * G, 0.3 * G, 0.46 * G, 0.12 * G); ctx.fill(); ctx.fillStyle = C.blue; roundRect(ctx, sx * 0.42 * G - 0.07 * G, -0.04 * G, 0.14 * G, 0.3 * G, 0.06 * G); ctx.fill(); }
  ctx.restore();
  for (let i = 0; i < 3; i++) {                                           // sound arcs: steady when q is high, choppy/coral when low
    const ph = (t * 0.9 + i / 3) % 1, on = hash(Math.floor(t * 9) + i * 13.1) < q * 1.15;
    if (!on) continue;
    ctx.strokeStyle = hexA(q > 0.55 ? C.blueSoft : C.coral, (1 - ph) * 0.9); ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y + 0.05 * G, (0.75 + ph * 0.5) * G, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke();
  }
}
function router(ctx, p, lit = 0) {
  const x = p[0] * G, y = p[1] * G, w = 0.95 * G, h = 0.5 * G;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.07 * G; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w * 0.3, y - h / 2); ctx.lineTo(x - w * 0.36, y - h / 2 - 0.32 * G); ctx.moveTo(x + w * 0.3, y - h / 2); ctx.lineTo(x + w * 0.36, y - h / 2 - 0.32 * G); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.12 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.12 * G); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = lit > 0 ? hexA(C.coral, 0.4 + 0.6 * lit) : '#9AA39F'; ctx.beginPath(); ctx.arc(x - 0.2 * G + i * 0.2 * G, y, 0.055 * G, 0, TAU); ctx.fill(); }
}
function tower(ctx, p) {
  const x = p[0] * G, y = p[1] * G;
  ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 0.08 * G; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - 0.5 * G, y + 0.5 * G); ctx.lineTo(x, y - 1.15 * G); ctx.lineTo(x + 0.5 * G, y + 0.5 * G);
  ctx.moveTo(x - 0.33 * G, y - 0.05 * G); ctx.lineTo(x + 0.33 * G, y - 0.05 * G); ctx.moveTo(x - 0.2 * G, y - 0.5 * G); ctx.lineTo(x + 0.2 * G, y - 0.5 * G); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y - 1.2 * G, 0.11 * G, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 3; for (const r of [0.38, 0.62]) { ctx.beginPath(); ctx.arc(x, y - 1.2 * G, r * G, -Math.PI * 0.3, Math.PI * 0.3); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - 1.2 * G, r * G, Math.PI * 0.7, Math.PI * 1.3); ctx.stroke(); }
  ctx.restore();
}

// ------------------------------------------------------------------ beats
function drawHome(ctx, t) {
  const wh = env(t, T.wallHl[0], T.wallHl[0] + 0.3) * (1 - env(t, T.wallHl[1], T.wallHl[1] + 0.4));
  ctx.fillStyle = hexA(C.blue, 0.04); ctx.fillRect(HOME.x0 * G, HOME.y0 * G, (HOME.x1 - HOME.x0) * G, (HOME.y1 - HOME.y0) * G);
  const outer = [[HOME.x0, HOME.y0], [HOME.x1, HOME.y0], [HOME.x1, HOME.y1], [HOME.x0, HOME.y1], [HOME.x0, HOME.y0]];
  ctx.save(); ctx.globalAlpha *= 0.85; strokePath(ctx, outer, 99, 0.12 * G, C.ink, true); ctx.restore();
  // the thick concrete wall: hatched block (flashes when the narration names it)
  const x = WALL.x0 * G, y = WALL.y0 * G, w = (WALL.x1 - WALL.x0) * G, h = (WALL.y1 - WALL.y0) * G;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 4, y + 6, w, h);
  ctx.fillStyle = wh > 0.3 ? '#3A4440' : '#2C3431'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = hexA(C.ink, 0.35 + 0.35 * wh); ctx.lineWidth = 2.5;
  for (let i = -3; i < 30; i++) { ctx.beginPath(); ctx.moveTo(x - 10, y + i * 0.3 * G); ctx.lineTo(x + w + 10, y + i * 0.3 * G - (w + 20)); ctx.stroke(); }
  ctx.restore(); ctx.strokeStyle = wh > 0.3 ? C.coral : C.ink; ctx.lineWidth = 3 + 2 * wh; ctx.strokeRect(x, y, w, h);
  label(ctx, 'मोटी दीवार', (WALL.x0 + WALL.x1) / 2, WALL.y0 - 0.5, 0.46, wh > 0.3 ? C.coral : C.ink, 'center', HF, 0.55 + 0.45 * Math.max(wh, env(t, 0.2, 0.6) * (1 - env(t, 3.4, 3.8))));
  label(ctx, 'कंक्रीट / धातु', (WALL.x0 + WALL.x1) / 2, WALL.y0 - 1.05, 0.38, '#B5BDB8', 'center', HS, wh);
  // printed footpath (where the listener walks)
  ctx.save(); ctx.fillStyle = hexA(C.ink, 0.22);
  for (let d = 0; d < WL; d += 0.32) { const p = at(WALK, d); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.05 * G, 0, TAU); ctx.fill(); }
  ctx.restore();
  label(ctx, 'दरवाज़ा', 9.3, 23.45, 0.36, '#B5BDB8', 'center', HS, 0.8);
  // table + phone
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(ctx, TABLE.x0 * G + 4, TABLE.y0 * G + 6, (TABLE.x1 - TABLE.x0) * G, (TABLE.y1 - TABLE.y0) * G, 0.15 * G); ctx.fill();
  ctx.fillStyle = '#1C2522'; roundRect(ctx, TABLE.x0 * G, TABLE.y0 * G, (TABLE.x1 - TABLE.x0) * G, (TABLE.y1 - TABLE.y0) * G, 0.15 * G); ctx.fill();
  ctx.strokeStyle = hexA(C.ink, 0.35); ctx.lineWidth = 2; ctx.stroke();
}
function drawRadio(ctx, t, L) {
  // second radio (another device on the shared 2.4 GHz band) making noise
  const n = noise(t), ra = env(t, T.noise[0] - 0.4, T.noise[0]) * (1 - env(t, 18.6, 19.0)) + env(t, 19.2, 19.6) * 0.75;
  if (ra > 0) {
    ctx.save(); ctx.globalAlpha *= ra; router(ctx, ROUTER, n); ctx.restore();
    if (n > 0) {
      ctx.save(); ctx.globalAlpha *= n; ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const ph = t * 7 + i * 1.7, ox = (hash(i * 3.1) - 0.5) * 1.6 - 0.9, oy = (hash(i * 5.3) - 0.5) * 1.2 + 0.9; ctx.beginPath(); for (let j = 0; j <= 6; j++) { const xx = (ROUTER[0] + ox - 0.3 + j * 0.1) * G, yy = (ROUTER[1] + oy + (j % 2 ? -0.09 : 0.09) * Math.sin(ph)) * G; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
      for (let k = 0; k < 2; k++) { const age = ((t + k * 0.5) % 1.0); ctx.strokeStyle = hexA(C.coral, 0.6 * (1 - age)); ctx.beginPath(); ctx.arc(ROUTER[0] * G, ROUTER[1] * G, (0.5 + 1.6 * age) * G, 0, TAU); ctx.stroke(); }
      ctx.restore();
    }
    label(ctx, 'रेडियो-शोर', ROUTER[0], ROUTER[1] + 0.75, 0.42, C.coral, 'center', HF, n);
  }
  // the direct Bluetooth link: phone ↔ headphones, broken where it passes through the wall
  const lk = ease.out(inv(...T.link, t)), hp = L.hp, a = [PHONE[0] + 0.35, PHONE[1]], b = [hp[0], hp[1] + 0.15];
  const show = Math.max(0.7, lk);                                          // the link exists from the hook; the pen re-inks it in l2
  const segL = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (segL > 0.4) {
    const good = L.q > 0.55, col = good ? C.blueSoft : hexA(C.blueSoft, 0.35 + 0.5 * L.q);
    ctx.save(); ctx.globalAlpha *= show;
    if (L.cross > 0.05) {                                                 // before the wall solid-ish, after the wall flickering dashes
      const k = (9.3 - a[0]) / (b[0] - a[0]), wp = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
      strokePath(ctx, [a, wp], Math.hypot(wp[0] - a[0], wp[1] - a[1]), 0.12 * G, C.blueSoft, true, [14, 9]);
      const flick = 0.35 + 0.4 * (hash(Math.floor(t * 12)) > 0.5 ? 1 : 0);
      ctx.save(); ctx.globalAlpha *= flick * (1 - 0.6 * L.cross); strokePath(ctx, [wp, b], Math.hypot(b[0] - wp[0], b[1] - wp[1]), 0.09 * G, hexA(C.coral, 0.85), false, [6, 14]); ctx.restore();
      sparks(ctx, wp, t, L.cross);
    } else strokePath(ctx, [a, b], segL, (0.12 + 0.04 * env(t, T.tagPath, T.tagPath + 0.3)) * G, col, true, [14, 9]);
    if (lk > 0 && lk < 1) penTip(ctx, at([a, b], segL * lk));
    ctx.restore();
    // audio packets riding the link (fade out after the wall)
    for (let i = 0; i < 3; i++) {
      const u = ((t * 0.8) + i / 3) % 1, p = at([a, b], segL * u);
      let alpha = Math.sin(u * Math.PI) * show;
      if (L.cross > 0.05) { const k = (9.3 - a[0]) / (b[0] - a[0]); if (u > k) alpha *= clamp(1 - (u - k) / 0.12) ; }
      ctx.fillStyle = hexA(C.ink, 0.9 * alpha); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.1 * G, 0, TAU); ctx.fill();
    }
    const mid = at([a, b], segL * 0.5);
    label(ctx, 'सीधा ब्लूटूथ लिंक', mid[0], mid[1] - 0.62, 0.42, C.blueSoft, 'center', HF, env(t, T.link[1] - 0.1, T.link[1] + 0.2) * (1 - env(t, 7.5, 7.9)));
  }
  // distance dimension line (l3)
  const dk = ease.out(inv(...T.dist, t)) * (1 - env(t, 13.4, 13.8));
  if (dk > 0) {
    const off = 1.15, p0 = [PHONE[0], PHONE[1] - off - 0.6], p1 = [lerp(PHONE[0], hp[0], dk), lerp(PHONE[1], hp[1], dk) - off - 0.6];
    ctx.save(); ctx.strokeStyle = hexA(C.ink, 0.8); ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(p0[0] * G, p0[1] * G); ctx.lineTo(p1[0] * G, p1[1] * G); ctx.stroke(); ctx.setLineDash([]);
    for (const p of [p0, p1]) { ctx.beginPath(); ctx.moveTo(p[0] * G, (p[1] - 0.2) * G); ctx.lineTo(p[0] * G, (p[1] + 0.2) * G); ctx.stroke(); }
    ctx.restore();
    label(ctx, 'दूरी', (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 0.42, 0.46, C.ink, 'center', HF, dk);
  }
  // the listener + phone
  phone(ctx, PHONE, 0.3, 1.1);
  label(ctx, 'आपका फ़ोन', PHONE[0], TABLE.y0 - 0.45, 0.42, C.ink, 'center', HF, 1);
  headphones(ctx, hp, L.q, t);
  label(ctx, 'हेडफ़ोन', hp[0], hp[1] + 0.95, 0.42, C.ink, 'center', HF, 1);
  label(ctx, '?', hp[0] + 0.95, hp[1] - 0.75, 0.85 * ease.outBack(clamp((t - T.query) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.query) / 0.25) * (1 - env(t, 3.6, 4.0)));
  // test result + cause (l4)
  const ck = ease.outBack(clamp((t - T.clean) / 0.35)) * (1 - env(t, 18.6, 19.0));
  if (ck > 0) {
    const cx = hp[0] + 0.6, cy = hp[1] + 1.85;                           // below the headphones, clear of the phone and its label
    ctx.save(); ctx.translate(cx * G, cy * G); ctx.scale(ck, ck);
    ctx.font = `${0.38 * G}px ${HF}`; const tw = ctx.measureText('आवाज़ साफ़').width, pw = tw + 0.95 * G;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, -pw / 2 + 3, -0.36 * G + 5, pw, 0.72 * G, 0.36 * G); ctx.fill();
    ctx.fillStyle = C.ink; roundRect(ctx, -pw / 2, -0.36 * G, pw, 0.72 * G, 0.36 * G); ctx.fill();
    check(ctx, -pw / 2 + 0.38 * G, 0, 0.4 * G, C.blue);
    ctx.fillStyle = C.charcoal; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('आवाज़ साफ़', -pw / 2 + 0.7 * G, 0.03 * G);
    ctx.restore();
  }
  label(ctx, 'वजह: दूरी या रुकावट', 9.9, 19.3, 0.46, C.ink, 'left', HF, env(t, T.why, T.why + 0.3) * (1 - env(t, 18.6, 19.0)));
  // takeaway tags (l6)
  label(ctx, 'कम दूरी', 5.2, TABLE.y1 + 0.75, 0.48, C.blueSoft, 'center', HF, env(t, T.tagDist, T.tagDist + 0.3) * (1 - env(t, 28.6, 29.2)));
  label(ctx, 'साफ़ रास्ता', 7.9, 17.1, 0.48, C.blueSoft, 'center', HF, env(t, T.tagPath, T.tagPath + 0.3) * (1 - env(t, 28.6, 29.2)));
}
function drawTower(ctx, t) {
  const a = env(t, T.tower, T.tower + 0.4); if (a <= 0) return;
  const lk = ease.inOut(inv(T.tower, T.tower + 0.7, t));
  ctx.save(); ctx.globalAlpha *= a; tower(ctx, TOWER); ctx.restore();
  strokePath(ctx, CELL, len(CELL) * lk, 0.22 * G, C.blue);
  if (lk < 1) penTip(ctx, at(CELL, len(CELL) * lk));
  if (lk >= 1) for (let i = 0; i < 2; i++) { const u = ((t * 0.7) + i / 2) % 1, p = at(CELL, len(CELL) * u); ctx.fillStyle = hexA(C.ink, 0.9 * Math.sin(u * Math.PI)); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.11 * G, 0, TAU); ctx.fill(); }
  label(ctx, 'मोबाइल टावर', TOWER[0] + 0.75, TOWER[1] - 1.25, 0.44, C.ink, 'left', HF, a);
  label(ctx, 'सिग्नल बार: यह लिंक', 5.05, 14.1, 0.42, C.blue, 'right', HF, env(t, T.tower + 0.6, T.tower + 0.9) * (1 - env(t, 25.6, 26.0)));
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(3.0 * G, 13.25 * G, 0.1 * G, 1.25 * G); ctx.restore();
  label(ctx, 'हेडफ़ोन बनाम दीवार', 3.3, 13.58, 0.5, C.ink, 'left', HF, a);
  label(ctx, 'आवाज़ क्यों टूटती है?', 3.3, 14.22, 0.36, '#B5BDB8', 'left', HS, a);
}

// ------------------------------------------------------------------ screen-space instrument: headphone audio + two separate meters
function bars(ctx, x, y, n, col, dim = '#2A322F') { for (let i = 0; i < 4; i++) { ctx.fillStyle = i < n ? col : dim; ctx.fillRect(x + i * 13, y + 10 - (i + 1) * 6, 9, (i + 1) * 6); } }
function drawInstrument(ctx, t, L) {
  const a = env(t, 0.15, 0.5) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  const Y1 = 1462, Y2 = 1532, cmp = env(t, T.cmp, T.cmp + 0.3) * (1 - env(t, 22.4, 22.8));
  if (cmp > 0) { ctx.fillStyle = hexA(C.coral, 0.14 * cmp); roundRect(ctx, 108, 1428, 864, 66, 14); ctx.fill(); ctx.fillStyle = hexA(C.blue, 0.2 * cmp); roundRect(ctx, 108, 1498, 864, 66, 14); ctx.fill(); }
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = `25px ${HF}`; ctx.fillStyle = C.ink; ctx.fillText('हेडफ़ोन लिंक', 132, Y1);
  bars(ctx, 300, Y1 - 4, L.bars, L.q > 0.55 ? C.blueSoft : C.coral);
  // headphone audio waveform: scrolls; dropouts (coral gaps) appear when the link is weak
  const x0 = 372, x1 = 952, n = 58, step = (x1 - x0) / n, sc = Math.floor(t * 14);
  for (let i = 0; i < n; i++) {
    const s = sc + i, amp = 0.35 + 0.65 * Math.abs(Math.sin(s * 0.7) * Math.sin(s * 0.23 + 1.3)), drop = hash(s * 7.31) > L.q * 1.1 + 0.05;
    const hgt = drop ? 3 : amp * 24, x = x0 + i * step;
    ctx.fillStyle = drop ? hexA(C.coral, 0.85) : C.blueSoft; ctx.fillRect(x, Y1 - hgt, step * 0.55, hgt * 2);
  }
  const r2 = env(t, T.tower, T.tower + 0.4);
  ctx.fillStyle = hexA(C.ink, Math.max(0.3, r2)); ctx.fillText('मोबाइल टावर', 132, Y2);
  if (r2 > 0) {
    ctx.save(); ctx.globalAlpha *= r2; bars(ctx, 300, Y2 - 4, 4, C.blue);
    ctx.fillStyle = hexA(C.ink, 0.8); ctx.font = `24px ${HS}`; ctx.fillText('फ़ोन के सिग्नल बार = टावर से जुड़ाव', 372, Y2); ctx.restore();
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
  const cm = cam(t), sc = cm.z, L = linkState(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  drawCartouche(ctx, 1 - env(t, 3.6, 4.1));
  drawTower(ctx, t);
  drawHome(ctx, t);
  drawRadio(ctx, t, L);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
  drawInstrument(ctx, t, L);
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = `22px HMed, EMed`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('सांकेतिक नक्शा · पैमाने पर नहीं · सामान्य ब्लूटूथ व्यवहार, ऐप की सुविधा नहीं', 96, 1612);
  if (assets.icon) {                                                        // CTA signature: official icon + wordmark in the safe area
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 404, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 404, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 484, 1495); ctx.restore(); }
  }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  for (const tt of [0.5, 1.3, 2.4]) add(tt, 'fizz', 0.26);
  add(T.query, 'retry', 0.26);
  add(4.0, 'sweep', 0.2, { dur: 0.7 }); add(T.link[0], 'pen', 0.4, { dur: T.link[1] - T.link[0] });
  add(T.wallHl[0], 'thunk', 0.4); for (let i = 0; i < 3; i++) add(T.weak + i * 0.1, 'bar', 0.2, { step: 2 - i });
  add(T.dist[0], 'penShort', 0.35, { dur: 0.5 }); add(T.noise[0], 'fizz', 0.32);
  add(T.walkBack[0], 'dots', 0.24, { dur: T.walkBack[1] - T.walkBack[0] }); add(T.clean, 'chime', 0.33);
  add(18.8, 'sweep', 0.24, { dur: 0.9 }); add(T.tower + 0.2, 'pen', 0.35, { dur: 0.7 });
  add(T.stepIn[0], 'dots', 0.22, { dur: T.stepIn[1] - T.stepIn[0] }); add(T.stepIn[1] - 0.2, 'fizz', 0.26); add(T.cmp, 'callout', 0.26);
  add(T.stepOut[0], 'dots', 0.22, { dur: T.stepOut[1] - T.stepOut[0] }); add(T.tagDist, 'stamp', 0.28); add(T.tagPath, 'stamp', 0.28);
  add(T.cta, 'chime', 0.32);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
