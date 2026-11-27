// Meshline production 30s, batch 2026-11-27-english-25: "Why a radio can send farther by slowing down".
// Same Transit-Map world as english-06..24 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). Bluetooth LE Coded PHY (S=8): forward error
// correction plus pattern mapping turn one bit into 8 symbols, so data can be decoded at a lower SNR: about 4x the
// range of LE 1M with no extra transmit power, at 1/8 of the data rate (125 kb/s vs 1 Mb/s) (Bluetooth SIG, "Exploring
// Bluetooth 5 - Going the Distance", 2017; "Understanding Bluetooth Range"). The level curve and corrupted symbols are
// illustrative. No Meshline radio, range or protocol claims (listing facts only in the CTA).
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
// ------------------------------------------------------------------ a sender, a far receiver, two symbol lanes, and above them a signal-vs-noise strip
const SX = 1.6, RX = 11.4, PYL = 20.2, LANE_F = 19.45, LANE_C = 20.95, XEND = 14.2;
const lvl = x => 12.6 + 4.0 * Math.log10(Math.max(0.8, x - SX) / 0.8) / Math.log10(16);   // received level falls with log distance (illustrative)
const Y_FAST = lvl(SX + 2.8), Y_CODED = lvl(SX + 11.2), X_FAST = SX + 2.8, X_CODED = SX + 11.2;   // needs: fast mode crosses at 1×, long range at 4× the distance
const NOISE = [17.05, 17.55];
const T = {
  curve: [3.7, 5.0], noise: 4.6, needF: 5.0, sink: 4.9,
  zoom: 7.4, split: [8.25, 9.3], eight: 9.0,
  needC: 12.3, slide: [13.9, 14.8], fix: 13.25,
  rate: 16.4, slower: 16.5, reach: 18.5,
  short: 22.6, video: 24.0,
  cta: 25.61,
};
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ camera (each key inside the sheet: left/right edges and the top edge, screen top = y − 1000/(60·z) ≥ 0)
function cam(t) {
  return K(t, [
    [0, { x: 7.2, y: 20.85, z: 1.25 }], [3.3, { x: 7.2, y: 20.8, z: 1.28 }],           // hook: fast dots die out; slow groups arrive
    [3.8, { x: 8.6, y: 17.4, z: 1.08 }], [6.6, { x: 8.6, y: 17.4, z: 1.08 }],           // signal sinks toward the noise
    [7.4, { x: 6.0, y: 19.6, z: 2.0 }], [10.6, { x: 6.2, y: 19.6, z: 2.05 }],           // one bit becomes eight symbols
    [11.3, { x: 8.6, y: 17.6, z: 1.08 }], [15.7, { x: 8.6, y: 17.6, z: 1.1 }],          // the receiver fixes errors; the needed level drops
    [16.2, { x: 8.6, y: 18.4, z: 1.08 }], [20.7, { x: 8.6, y: 18.4, z: 1.1 }],          // cost and gain
    [21.4, { x: 10.0, y: 19.8, z: 1.5 }], [25.2, { x: 10.0, y: 19.8, z: 1.52 }],        // payoff: short messages, not videos
    [26.2, { x: 8.6, y: 17.6, z: 1.08 }], [30, { x: 8.6, y: 17.7, z: 1.15 }],           // CTA: slow push under the veil
  ]);
}

// ------------------------------------------------------------------ glyphs
function device(ctx, p, a = 1, lit = 0, col = C.blueSoft) {
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 1.45 * G, h = 2.3 * G;
  ctx.save(); ctx.globalAlpha *= a;
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 1.7 * G); g.addColorStop(0, hexA(col, 0.5 * lit)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 1.7 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.15 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.15 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G, y - h / 2 + 0.14 * G, w - 0.14 * G, h - 0.28 * G, 0.05 * G); ctx.fill();
  ctx.restore();
}
const fade = x => clamp(1 - (x - SX - 1.0) / 14);                         // symbols dim with distance (illustrative)
// fast lane: one symbol per bit, quick; past the fast-mode reach they turn coral and drop out
function fastLane(ctx, t, a) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 40; i++) { const x = SX + 0.9 + ((t * 4.0 + i * 0.42) % (RX - SX - 1.8)); if (x > RX - 0.9) continue;
    const past = x > X_FAST, drop = past && hash(i * 3.1 + Math.floor(t * 3)) < clamp((x - X_FAST) / 2.5); if (drop) continue;
    ctx.fillStyle = past ? hexA(C.coral, 0.9 * fade(x)) : hexA(C.blueSoft, 0.95); ctx.beginPath(); ctx.arc(x * G, LANE_F * G, 0.13 * G, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// long-range lane: each bit is a group of 8 short symbols, slower; noise corrupts a few (coral) but the group still decodes
function codedGroup(ctx, x, y, a, seed, spread = 1, bad = true) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.lineWidth = 0.08 * G;
  for (let k = 0; k < 8; k++) { const xx = x + (k - 3.5) * 0.17 * spread, corrupt = bad && x > X_FAST && hash(seed * 7 + k * 1.7) < 0.22 * clamp((x - X_FAST) / 4);
    ctx.strokeStyle = corrupt ? C.coral : C.blue; ctx.beginPath(); ctx.moveTo(xx * G, (y - 0.3) * G); ctx.lineTo(xx * G, (y + 0.3) * G); ctx.stroke(); }
  ctx.restore();
}
function codedLane(ctx, t, a) {
  if (a <= 0.01) return;
  const span = RX - SX - 2.0; for (let i = 0; i < 5; i++) { const x = SX + 1.0 + ((t * 1.5 + i * 2.4) % span); if (x > RX - 1.0) continue; codedGroup(ctx, x, LANE_C, a, i + Math.floor((t * 1.5 + i * 2.4) / span) * 5); }
}

// ------------------------------------------------------------------ scene
function drawScene(ctx, t) {
  const v = veil(t);
  // lanes (baselines)
  const laneA = 1 - 0.7 * v;
  ctx.save(); ctx.globalAlpha *= laneA; ctx.strokeStyle = hexA(C.ink, 0.1); ctx.lineWidth = 2; for (const y of [LANE_F, LANE_C]) { ctx.beginPath(); ctx.moveTo((SX + 0.8) * G, y * G); ctx.lineTo((RX - 0.8) * G, y * G); ctx.stroke(); } ctx.restore();
  const fastOn = (t < 7.0 || (t > 11.0 && t < 21.2)) ? 1 : 0, codedOn = t < 21.2 ? 1 : 0;
  fastLane(ctx, t, fastOn * (1 - env(t, 6.6, 7.0)) * laneA + (t > 11.0 && t < 21.2 ? env(t, 11.0, 11.4) * (1 - env(t, 20.8, 21.2)) * laneA : 0));
  const cu = env(t, 6.7, 7.1) * (1 - env(t, 10.8, 11.2));                       // close-up: keep only the bit
  codedLane(ctx, t, codedOn * laneA * (1 - env(t, 20.8, 21.2)) * (1 - 0.7 * cu));
  label(ctx, 'fast', SX + 1.7, LANE_F - 0.62, 0.58, C.blueSoft, 'left', 'EBold', (t < 21 ? 1 : 0) * (1 - env(t, 20.8, 21.2)) * laneA * (1 - cu));
  label(ctx, 'slow', SX + 4.4, LANE_C + 0.7, 0.58, C.blue, 'left', 'EBold', (t < 21 ? 1 : 0) * (1 - env(t, 20.8, 21.2)) * laneA * (1 - cu));
  // the fast lane dies where its needed level crosses the curve; the slow lane arrives
  cross(ctx, [X_FAST + 1.3, LANE_F], 0.32, (t < 21 ? 1 : 0) * (1 - env(t, 20.8, 21.2)) * laneA * (1 - cu));
  // signal-vs-noise strip
  const ga = env(t, T.curve[0] - 0.2, T.curve[0]) * (1 - env(t, 20.8, 21.2)) * (1 - v) * (1 - cu), gk = clamp((t - T.curve[0]) / (T.curve[1] - T.curve[0]));
  if (ga > 0) {
    ctx.save(); ctx.globalAlpha *= ga;
    const pts = []; for (let i = 0; i <= 60; i++) { const x = SX + 0.8 + (XEND - SX - 0.8) * i / 60; pts.push([x, lvl(x)]); }
    strokePath(ctx, pts, len(pts) * gk, 0.08 * G, C.blueSoft);
    ctx.restore();
    label(ctx, 'signal', SX + 1.5, lvl(SX + 1.5) - 0.6, 0.6, C.blueSoft, 'left', 'EBold', ga * clamp(gk * 3));
    const na = ga * env(t, T.noise, T.noise + 0.3);
    if (na > 0) { ctx.save(); ctx.globalAlpha *= na; for (let i = 0; i < 260; i++) { const x = SX + 0.8 + hash(i * 1.7 + Math.floor(t * 10)) * (XEND - SX - 0.8), y = NOISE[0] + hash(i * 2.9 + Math.floor(t * 10)) * (NOISE[1] - NOISE[0]); ctx.fillStyle = hexA(GREY, 0.5); ctx.fillRect(x * G, y * G, 3, 3); } ctx.restore();
      label(ctx, 'noise', SX + 0.9, NOISE[1] + 0.45, 0.56, GREY, 'left', 'EBold', na); }
    const fa = ga * env(t, T.needF, T.needF + 0.3);
    if (fa > 0) { ctx.save(); ctx.globalAlpha *= fa; ctx.setLineDash([12, 10]); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo((SX + 0.8) * G, Y_FAST * G); ctx.lineTo(XEND * G, Y_FAST * G); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      label(ctx, 'fast mode needs', 7.4, Y_FAST - 0.45, 0.56, C.ink, 'left', 'EBold', fa); }
    const ca = ga * env(t, T.needC, T.needC + 0.3);
    if (ca > 0) { ctx.save(); ctx.globalAlpha *= ca; ctx.setLineDash([12, 10]); ctx.strokeStyle = C.blue; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo((SX + 0.8) * G, Y_CODED * G); ctx.lineTo(XEND * G, Y_CODED * G); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      label(ctx, 'long range needs less', SX + 1.0, Y_CODED - 0.45, 0.56, C.blueSoft, 'left', 'EBold', ca); }
    // the crossing: where the signal falls below what the mode needs (its reach)
    const sk = clamp((t - T.slide[0]) / (T.slide[1] - T.slide[0])), xc = lerp(X_FAST, X_CODED, ease.inOut(sk)), yc = lvl(xc);
    const ma = fa * env(t, T.sink, T.sink + 0.25);
    if (ma > 0) { ctx.save(); ctx.globalAlpha *= ma; ctx.strokeStyle = sk > 0 ? C.blueSoft : C.coral; ctx.lineWidth = 3; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(xc * G, yc * G); ctx.lineTo(xc * G, (LANE_F - 0.4) * G); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = sk > 0 ? C.blueSoft : C.coral; ctx.beginPath(); ctx.arc(xc * G, yc * G, 0.16 * G, 0, TAU); ctx.fill(); ctx.restore();
      label(ctx, 'lost in noise', X_FAST + 0.35, Y_FAST + 0.66, 0.58, C.coral, 'left', 'EBold', ma * (1 - env(t, T.needC, T.needC + 0.3))); }
  }
  // one bit becomes eight symbols (close-up)
  const za = env(t, T.zoom, T.zoom + 0.3) * (1 - env(t, 10.7, 11.0));
  if (za > 0) {
    const sp = ease.inOut(clamp((t - T.split[0]) / (T.split[1] - T.split[0]))), bx = 6.0, by = 18.5;
    ctx.save(); ctx.globalAlpha *= za * (1 - sp); ctx.fillStyle = C.blueSoft; roundRect(ctx, (bx - 0.32) * G, (by - 0.32) * G, 0.64 * G, 0.64 * G, 0.12 * G); ctx.fill(); ctx.fillStyle = C.bg; ctx.font = `${0.5 * G}px EBold`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('1', bx * G, (by + 0.02) * G); ctx.restore();
    codedGroup(ctx, bx, by, za * sp, 0, 0.6 + 1.4 * sp, false);
    label(ctx, '1 bit', bx, by - 0.75, 0.44, C.ink, 'center', 'EBold', za * (1 - sp));
    label(ctx, '8 symbols', bx, by - 0.75, 0.44, C.blueSoft, 'center', 'EBold', za * env(t, T.eight, T.eight + 0.2));
  }
  // the receiver decodes the slow group despite corrupted symbols
  const fx = env(t, T.fix - 0.1, T.fix + 0.2) * (1 - env(t, 15.6, 15.9));
  const GY = LANE_F - 1.15;
  if (fx > 0) { codedGroup(ctx, RX - 2.0, GY, fx, 5, 1.0, true); for (const k of [2, 5]) { const xx = RX - 2.0 + (k - 3.5) * 0.17; ctx.save(); ctx.globalAlpha *= fx; ctx.strokeStyle = C.coral; ctx.lineWidth = 0.08 * G; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(xx * G, (GY - 0.3) * G); ctx.lineTo(xx * G, (GY + 0.3) * G); ctx.stroke(); ctx.restore(); }
    label(ctx, '→ 1', RX - 1.15, GY, 0.56, C.ink, 'left', 'EBold', fx); label(ctx, 'errors fixed', RX - 2.9, GY, 0.58, C.blueSoft, 'right', 'EBold', fx * env(t, T.fix + 0.4, T.fix + 0.6)); }
  // reach brackets: 1× and about 4× (distance from the sender)
  const rb = env(t, T.reach - 0.1, T.reach + 0.3) * (1 - env(t, 20.8, 21.2));
  if (rb > 0) { ctx.save(); ctx.globalAlpha *= rb; ctx.lineCap = 'round';
    const br = (x1, y, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(SX * G, (y - 0.2) * G); ctx.lineTo(SX * G, y * G); ctx.lineTo(x1 * G, y * G); ctx.lineTo(x1 * G, (y - 0.2) * G); ctx.stroke(); };
    br(X_FAST, 22.65, C.ink, 4); br(X_CODED, 23.35, C.blue, 5); ctx.restore();
    label(ctx, '1×', X_FAST + 0.3, 22.65, 0.6, C.ink, 'left', 'EBold', rb); label(ctx, 'about 4×', X_CODED - 0.25, 23.9, 0.62, C.blueSoft, 'right', 'EBold', rb); }
  // payoff: a short message arrives on the slow mode; a video crawls
  const pa = env(t, 21.3, 21.6) * (1 - v);
  if (pa > 0) {
    const mk = ease.inOut(clamp((t - T.short) / 0.6)), mx = lerp(RX - 5.0, RX - 1.9, mk);
    ctx.save(); ctx.globalAlpha *= pa; roundRect(ctx, (mx - 0.9) * G, 18.95 * G, 1.8 * G, 0.62 * G, 0.31 * G); ctx.fillStyle = C.blue; ctx.fill(); ctx.fillStyle = C.ink; ctx.font = `${0.32 * G}px EBold`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('on my way', mx * G, 19.27 * G); ctx.restore();
    label(ctx, 'short message', RX - 3.3, 18.35, 0.5, C.ink, 'center', 'EBold', pa * env(t, 21.6, 21.9));
    check(ctx, (RX + 0.95) * G, 18.95 * G, 0.6 * G, C.blueSoft, pa * env(t, T.short + 0.6, T.short + 0.8));
    const va = pa * env(t, T.video - 0.1, T.video + 0.2), vk = clamp((t - T.video) / 30);
    if (va > 0) { ctx.save(); ctx.globalAlpha *= va; const vx = RX - 4.9, vy = 21.25; roundRect(ctx, vx * G, (vy - 0.35) * G, 0.9 * G, 0.7 * G, 0.1 * G); ctx.strokeStyle = GREY; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = GREY; ctx.beginPath(); ctx.moveTo((vx + 0.35) * G, (vy - 0.18) * G); ctx.lineTo((vx + 0.62) * G, vy * G); ctx.lineTo((vx + 0.35) * G, (vy + 0.18) * G); ctx.closePath(); ctx.fill();
      roundRect(ctx, (vx + 1.15) * G, (vy - 0.12) * G, 2.6 * G, 0.24 * G, 0.12 * G); ctx.strokeStyle = hexA(C.ink, 0.3); ctx.stroke(); roundRect(ctx, (vx + 1.15) * G, (vy - 0.12) * G, Math.max(0.12, 2.6 * vk) * G, 0.24 * G, 0.12 * G); ctx.fillStyle = GREY; ctx.fill(); ctx.restore();
      label(ctx, 'video: crawls', vx + 2.45, vy + 0.62, 0.48, GREY, 'center', 'EBold', va); }
  }
  // phones
  device(ctx, [SX, PYL], 1, (t < 21 ? 0.6 : 0) * (1 - v)); device(ctx, [RX, PYL], 1, (t > 11.3 && t < 16 ? 0.7 : 0) * (1 - v));
  check(ctx, (RX + 1.05) * G, (LANE_C - 0.1) * G, 0.62 * G, C.blueSoft, (t < 21 ? 1 : 0) * (1 - env(t, 20.8, 21.2)) * (1 - v));
  label(ctx, 'sender', SX, PYL + 1.75, 0.6, C.ink, 'center', 'EBold', (1 - v) * (1 - env(t, 21.0, 21.3)) * (1 - cu)); label(ctx, 'far receiver', RX, PYL + 1.75, 0.6, C.ink, 'center', 'EBold', (1 - v) * (1 - env(t, 21.0, 21.3) * (1 - env(t, 25.5, 25.9))) * (1 - cu));
}

// ------------------------------------------------------------------ screen-space instrument: data rate (one readout, cost beat only; left of the right-side controls)
function drawInstrument(ctx, t) {
  const A = env(t, T.rate - 0.2, T.rate + 0.15) * (1 - env(t, 20.8, 21.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 768, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('data rate', 132, 1450);
  const X0 = 330, W = 360, k = ease.out(clamp((t - T.slower) / 0.6));
  ctx.font = '28px EBold'; ctx.fillStyle = C.ink; ctx.fillText('fast mode', 132, 1494); ctx.fillText('long range', 132, 1540);
  roundRect(ctx, X0, 1480, W, 28, 9); ctx.fillStyle = C.blueSoft; ctx.fill();
  roundRect(ctx, X0, 1526, lerp(W, W / 8, k), 28, 9); ctx.fillStyle = C.blue; ctx.fill();
  ctx.font = '30px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = C.blueSoft; ctx.fillText('1 Mb/s', 830, 1494); ctx.fillStyle = C.ink; ctx.fillText(k > 0.6 ? '125 kb/s' : '', 830, 1540);
  ctx.font = '22px ESemi'; ctx.fillStyle = GREY; ctx.fillText('Bluetooth LE 1M vs LE Coded (S=8)', 830, 1450);
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
  if (big) { line('SEND SLOWER.', 345, C.ink, 104); line('REACH FARTHER.', 470, C.coral, 104); }
  else { line('SEND SLOWER.', 362, C.ink, 86); line('REACH FARTHER.', 452, C.coral, 86); }
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
  add(0.02, 'zip', 0.12); add(0.9, 'fizz', 0.14); add(2.2, 'chime', 0.12);
  add(T.curve[0], 'pen', 0.16, { dur: 1.2 }); add(T.noise, 'sweep', 0.1, { dur: 0.6 }); add(T.sink + 0.1, 'offline', 0.14);
  add(T.zoom, 'sweep', 0.12, { dur: 0.5 }); for (let k = 0; k < 8; k++) add(T.split[0] + k * 0.12, 'tick', 0.1); add(T.eight, 'click', 0.14);
  add(T.needC, 'click', 0.16); add(T.fix, 'stamp', 0.16); add(T.fix + 0.5, 'chime', 0.14); add(T.slide[0], 'sweep', 0.14, { dur: 0.8 }); add(T.slide[1], 'land', 0.18);
  add(T.rate, 'click', 0.14); add(T.slower + 0.2, 'stop', 0.16); add(T.reach, 'pen', 0.14, { dur: 0.6 }); add(T.reach + 0.8, 'chime', 0.14);
  add(T.short, 'zip', 0.16); add(T.short + 0.65, 'chime', 0.16); add(T.video, 'tick', 0.12);
  add(T.cta, 'chime', 0.3); add(T.cta + 0.4, 'click', 0.18);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
