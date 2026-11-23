// Meshline production 30s, batch 2026-11-23-english-24: "Why a weak signal drains your battery faster".
// Same Transit-Map world as english-06..23 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). Weak signal makes the radio work harder for the same
// data: lower data rate (longer airtime), retransmissions and higher transmit power (Ding et al., ACM SIGMETRICS 2013).
// Measured: the same 100 KB 3G download used 52% more energy at RSSI -105 vs -85 dBm; delaying background traffic until
// the signal improves saved up to 21.5-23.7% of data energy in their what-if analysis. Schedules and power steps are
// illustrative and scaled to that ratio. No Meshline battery, radio or protocol claims (listing facts only in the CTA).
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
// ------------------------------------------------------------------ one tower at the top; a strong-signal phone near it, a weak-signal phone far below; the same download on both
const ANT = [8.4, 11.25], TOWER = { x: 8.4, base: 14.6, h: 3.3 };          // world sits low enough that no camera key shows the sheet's top edge
const SP = [4.0, 17.4], WP = [12.6, 21.6], PW = 1.5, PH = 2.45;
const T = {
  why: 2.2, wide: 3.7, same: 4.0, go: 4.3,
  rate: 7.6, lost: [10.4, 12.25], again: [12.4, 15.0], power: 13.75,
  done: 18.45,
  later: 21.55, bars: [21.9, 22.8], up: [23.05, 23.65], wait: 22.9,
  cta: 25.61,
};
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);
// the transfers: [t0, t1, lost?] per lane; the energy model below integrates the same schedule (weak lane: longer airtime, a resend, higher power)
const S_SENDS = [[4.3, 5.2], [5.3, 6.2], [6.3, 7.2], [7.3, 8.2]];
const W_SENDS = [[4.3, 6.9], [7.2, 9.8], [10.4, 12.25, true], [12.4, 15.0], [15.2, 17.8]];
const powerW = t => 1 + 0.55 * env(t, T.power - 0.2, T.power + 0.4);          // relative transmit power (illustrative), rises when the phone is asked to transmit louder
const airtime = (list, t, pw = () => 1) => { let e = 0; for (const [a, b] of list) { const x = clamp((t - a) / (b - a)); e += x * (b - a) * pw(a + x * (b - a) / 2); } return e; };
const E_S_END = airtime(S_SENDS, 30), E_W_RAW = airtime(W_SENDS, 30, powerW);
const eS = t => airtime(S_SENDS, t) / E_S_END;                                // strong lane: 1x when done
const eW = t => airtime(W_SENDS, t, powerW) / E_W_RAW * 1.52;                  // weak lane, scaled to the study's measured ratio (+52%, 3G, same 100 KB download)

// ------------------------------------------------------------------ camera (each key checked against the sheet edges; vital objects left of x ≈ 880 px)
function cam(t) {
  return K(t, [
    [0, { x: 12.6, y: 21.55, z: 2.6 }], [3.0, { x: 12.6, y: 21.55, z: 2.68 }],          // hook: close on the phone: one bar, battery falling
    [3.7, { x: 9.0, y: 17, z: 1.0 }], [10.5, { x: 9.0, y: 17, z: 1.02 }],           // the same download on both phones
    [11.2, { x: 9.4, y: 17.9, z: 1.15 }], [15.6, { x: 9.4, y: 17.9, z: 1.16 }],         // lost and sent again; higher power
    [16.3, { x: 9.0, y: 17, z: 1.0 }], [20.8, { x: 9.0, y: 17, z: 1.02 }],          // the measured difference
    [21.5, { x: 11.57, y: 22.6, z: 1.4 }], [25.0, { x: 11.57, y: 22.6, z: 1.42 }],      // payoff: wait for a stronger signal (tower above frame)
    [26.0, { x: 9.0, y: 17, z: 1.0 }], [30, { x: 9.0, y: 17.1, z: 1.1 }],             // CTA: slow push under the veil
  ]);
}

// ------------------------------------------------------------------ glyphs
function phoneUI(ctx, p, bars, batt, opt = {}) {                           // generic phone: signal bars, a battery icon, and an optional big centre text
  const { a = 1, lit = 0, litCol = C.blueSoft, big = '', bigCol = C.ink, small = '' } = opt; if (a <= 0.01) return;
  const x = p[0] * G, y = p[1] * G, w = PW * G, h = PH * G;
  ctx.save(); ctx.globalAlpha *= a;
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 2.0 * G); g.addColorStop(0, hexA(litCol, 0.45 * lit)); g.addColorStop(1, hexA(litCol, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 2.0 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 5, y - h / 2 + 8, w, h, 0.2 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.2 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.08 * G, y - h / 2 + 0.16 * G, w - 0.16 * G, h - 0.32 * G, 0.08 * G); ctx.fill();
  for (let i = 0; i < 4; i++) { const bh = (0.12 + 0.07 * i) * G; ctx.fillStyle = i < bars ? C.ink : hexA(C.ink, 0.2); ctx.fillRect(x - w / 2 + 0.22 * G + i * 0.13 * G, y - h / 2 + 0.58 * G - bh, 0.09 * G, bh); }
  const bx = x + w / 2 - 0.62 * G, by = y - h / 2 + 0.34 * G; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(bx, by, 0.4 * G, 0.2 * G); ctx.fillStyle = C.ink; ctx.fillRect(bx + 0.4 * G, by + 0.05 * G, 0.04 * G, 0.1 * G);
  ctx.fillStyle = batt < 0.25 ? C.coral : C.ink; ctx.fillRect(bx + 2, by + 2, (0.4 * G - 4) * clamp(batt), 0.2 * G - 4);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (big) { ctx.font = `${0.6 * G}px EBold`; ctx.fillStyle = bigCol; ctx.fillText(big, x, y + 0.05 * G); }
  if (small) { ctx.font = `${0.26 * G}px ESemi`; ctx.fillStyle = GREY; ctx.fillText(small, x, y + 0.62 * G); }
  ctx.restore();
}
function mast(ctx, a = 1, t = 0) {                                        // lattice tower (same grammar as english-20)
  if (a <= 0.01) return; const X = TOWER.x * G, B = TOWER.base * G, Tp = (TOWER.base - TOWER.h) * G, wb = 0.7 * G, wt = 0.14 * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
  const legs = (dx, dy, c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(X - wb + dx, B + dy); ctx.lineTo(X - wt + dx, Tp + dy); ctx.moveTo(X + wb + dx, B + dy); ctx.lineTo(X + wt + dx, Tp + dy);
    const n = 5; for (let i = 0; i < n; i++) { const y0 = B - (B - Tp) * i / n, y1 = B - (B - Tp) * (i + 1) / n, w0 = lerp(wb, wt, i / n), w1 = lerp(wb, wt, (i + 1) / n); ctx.moveTo(X - w0 + dx, y0 + dy); ctx.lineTo(X + w1 + dx, y1 + dy); ctx.moveTo(X + w0 + dx, y0 + dy); ctx.lineTo(X - w1 + dx, y1 + dy); } ctx.stroke(); };
  legs(3, 5, 'rgba(0,0,0,0.5)', 0.075 * G); legs(0, 0, C.blueSoft, 0.07 * G);
  ctx.fillStyle = C.blueSoft; ctx.beginPath(); ctx.arc(X, Tp - 0.1 * G, 0.12 * G, 0, TAU); ctx.fill();
  ctx.restore();
}
const laneFrom = p => [p[0], p[1] - PH / 2 - 0.1];
function parcel(ctx, from, s, L, col, a = 1) {                              // a data burst on the air: a capsule whose length shows its airtime
  if (a <= 0.01) return; const dx = ANT[0] - from[0], dy = ANT[1] - from[1], d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
  const c = s * d, h0 = Math.max(0, c - L / 2), h1 = Math.min(d, c + L / 2); if (h1 <= h0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 0.34 * G; ctx.beginPath(); ctx.moveTo((from[0] + ux * h0) * G + 3, (from[1] + uy * h0) * G + 5); ctx.lineTo((from[0] + ux * h1) * G + 3, (from[1] + uy * h1) * G + 5); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 0.3 * G; ctx.beginPath(); ctx.moveTo((from[0] + ux * h0) * G, (from[1] + uy * h0) * G); ctx.lineTo((from[0] + ux * h1) * G, (from[1] + uy * h1) * G); ctx.stroke();
  ctx.restore();
}
const lanePoint = (from, s) => [lerp(from[0], ANT[0], s), lerp(from[1], ANT[1], s)];

// ------------------------------------------------------------------ scene
function drawScene(ctx, t) {
  const v = veil(t), sF = laneFrom(SP), wF = laneFrom(WP);
  mast(ctx, (1 - 0.6 * v) * (1 - env(t, 21.0, 21.4) * (1 - env(t, 25.6, 26.0))), t);
  // lanes (dashed paths to the antenna)
  for (const f of [sF, wF]) { ctx.save(); ctx.globalAlpha *= (1 - 0.7 * v) * (t < 3.3 ? 0.3 : 1); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = hexA(C.blueSoft, 0.4); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(f[0] * G, f[1] * G); ctx.lineTo(ANT[0] * G, ANT[1] * G); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
  // strong lane: short bursts, quick
  for (const [a, b] of S_SENDS) if (t > a && t < b + 0.1) parcel(ctx, sF, ease.inOut(clamp((t - a) / (b - a))), 0.6, C.blue, 1 - clamp((t - b) / 0.1));
  // weak lane: long bursts (slower rate), one lost and sent again; plus the hook's opening burst
  if (t < 3.4) parcel(ctx, wF, 0.05 + 0.025 * t, 0.9, C.blue, 1 - env(t, 3.0, 3.35));       // hook: a slow burst just leaving the phone (clear of the title)
  for (const [a, b, lost] of W_SENDS) {
    if (t < a || t > b + 0.1) continue; const k = clamp((t - a) / (b - a));
    if (!lost) parcel(ctx, wF, ease.inOut(k), 1.7, C.blue, 1 - clamp((t - b) / 0.1));
    else { const s = 0.55 * ease.out(Math.min(1, k * 1.6)), fall = clamp((k - 0.62) / 0.38); parcel(ctx, wF, s, 1.7, fall > 0 ? C.coral : C.blue, 1 - fall); if (fall > 0) cross(ctx, lanePoint(wF, s), 0.38, 1 - clamp((t - b) / 0.5) * 0); }
  }
  const lp = lanePoint(wF, 0.55);
  if (t > T.lost[1] - 0.3 && t < T.again[1] + 0.2) { const la = env(t, T.lost[1] - 0.3, T.lost[1]) * (1 - env(t, T.again[1] - 0.3, T.again[1])); cross(ctx, lp, 0.38, la); label(ctx, 'lost', lp[0] + 1.0, lp[1] - 0.1, 0.62, C.coral, 'left', 'EBold', la); label(ctx, 'sent again', 10.9, 17.7, 0.62, C.blueSoft, 'right', 'EBold', env(t, T.again[0], T.again[0] + 0.2) * (1 - env(t, T.again[1] - 0.3, T.again[1]))); }
  // transmit-power rings while sending: small on the strong phone; bigger and heavier on the weak one after the power step
  const sending = (list, tt) => list.some(([a, b]) => tt > a && tt < b);
  for (let j = 0; j < 3; j++) {
    const age = ((t * 1.1 + j / 3) % 1);
    if (sending(S_SENDS, t)) { ctx.save(); ctx.strokeStyle = hexA(C.blueSoft, 0.6 * (1 - age)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(SP[0] * G, (SP[1] - 0.3) * G, (0.9 + 0.7 * age) * G, 0, TAU); ctx.stroke(); ctx.restore(); }
    if (sending(W_SENDS, t) || t < 3.4) { const pw = powerW(t); ctx.save(); ctx.strokeStyle = hexA(pw > 1.2 ? C.ink : C.blueSoft, 0.65 * (1 - age)); ctx.lineWidth = 3 + 4 * (pw - 1) / 0.55; ctx.beginPath(); ctx.arc(WP[0] * G, (WP[1] - 0.3) * G, (1.0 + (0.8 + 1.1 * (pw - 1) / 0.55) * age) * G, 0, TAU); ctx.stroke(); ctx.restore(); }
  }
  label(ctx, 'higher power', WP[0] - 2.3, WP[1] - 1.6, 0.62, C.ink, 'right', 'EBold', env(t, T.power, T.power + 0.25) * (1 - env(t, 15.6, 15.9)));
  // labels for the rate beat
  const ra = env(t, T.rate, T.rate + 0.25) * (1 - env(t, 10.8, 11.1));
  label(ctx, 'fast rate', SP[0] + 1.3, SP[1] - 2.4, 0.64, C.blueSoft, 'left', 'EBold', ra);
  label(ctx, 'slow rate', WP[0] - 1.3, WP[1] - 2.6, 0.64, C.blueSoft, 'right', 'EBold', ra);
  label(ctx, 'longer on air', WP[0] - 1.3, WP[1] - 1.85, 0.5, GREY, 'right', 'EBold', ra);
  // "same download" headers, done ticks
  const sd = env(t, T.same, T.same + 0.25) * (1 - env(t, 7.4, 7.7));
  label(ctx, 'same download', SP[0], SP[1] - 2.2, 0.6, C.ink, 'center', 'EBold', sd); label(ctx, 'same download', WP[0], WP[1] - 2.2, 0.6, C.ink, 'center', 'EBold', sd);
  check(ctx, (SP[0] + 1.25) * G, (SP[1] - 1.0) * G, 0.7 * G, C.blueSoft, env(t, 8.25, 8.45) * (1 - env(t, 21.0, 21.3)) * (1 - v));
  check(ctx, (WP[0] + 1.25) * G, (WP[1] - 1.0) * G, 0.7 * G, C.blueSoft, env(t, 17.85, 18.05) * (1 - env(t, 21.0, 21.3)) * (1 - v));
  // payoff: a big upload waits; bars climb; then it goes quickly
  const pa = env(t, T.later, T.later + 0.25) * (1 - v);
  const wb = t < T.bars[0] ? 1 : Math.round(lerp(1, 4, clamp((t - T.bars[0]) / (T.bars[1] - T.bars[0]))));
  if (pa > 0) {
    const sent = t > T.up[1];
    if (!sent) { const ss = t > T.up[0] ? ease.inOut(clamp((t - T.up[0]) / (T.up[1] - T.up[0]))) : 0; parcel(ctx, wF, ss > 0 ? ss : 0.08, ss > 0 ? 0.55 : 0.9, C.blue, pa); }
    const LX = 11.1, LY = WP[1] - PH / 2 - 2.0;
    label(ctx, 'big upload: waiting', LX, LY, 0.6, C.ink, 'center', 'EBold', pa * (1 - env(t, T.up[1] - 0.1, T.up[1] + 0.1)));
    label(ctx, 'sent on a strong signal', LX, LY, 0.58, C.blueSoft, 'center', 'EBold', pa * env(t, T.up[1], T.up[1] + 0.2));
    check(ctx, (WP[0] + 1.25) * G, (WP[1] - 1.0) * G, 0.7 * G, C.blueSoft, pa * env(t, T.up[1], T.up[1] + 0.2));
  }
  // the phones
  const pct = Math.round(41 - 4 * clamp(t / 3.2));
  const hideS = (t < 3.3 ? 0 : 1) * (1 - env(t, 21.0, 21.3) * (1 - env(t, 25.6, 26.0)));
  phoneUI(ctx, SP, 4, 0.7, { a: hideS * (1 - 0.55 * v), lit: sending(S_SENDS, t) ? 0.8 : 0 });
  phoneUI(ctx, WP, t > T.later ? wb : 1, t < 3.4 ? pct / 100 : 0.36, { a: 1 - 0.55 * v, lit: (sending(W_SENDS, t) || t < 3.4) ? 0.8 : 0, big: t < 3.4 ? `${pct}%` : '', bigCol: C.ink, small: t < 3.4 ? 'sending…' : '' });
  label(ctx, 'sped up', WP[0], WP[1] + PH / 2 + 0.55, 0.42, GREY, 'center', 'EBold', 1 - env(t, 3.0, 3.3));
  label(ctx, '?', WP[0] + 1.65, WP[1] - 1.45, 1.1 * ease.outBack(clamp((t - T.why) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.why) / 0.2) * (1 - env(t, 3.2, 3.5)));
  label(ctx, 'strong signal', SP[0], SP[1] + PH / 2 + 0.6, 0.6, C.ink, 'center', 'EBold', hideS * (1 - v));
  label(ctx, 'weak signal', WP[0], WP[1] + PH / 2 + 0.6, 0.6, C.ink, 'center', 'EBold', env(t, 3.4, 3.7) * (1 - env(t, T.bars[1], T.bars[1] + 0.2)) * (1 - v));
  label(ctx, 'stronger signal', WP[0], WP[1] + PH / 2 + 0.6, 0.6, C.blueSoft, 'center', 'EBold', env(t, T.bars[1], T.bars[1] + 0.2) * (1 - v));
}

// ------------------------------------------------------------------ screen-space instrument: energy for the same download (one readout; left of the right-side controls)
function drawInstrument(ctx, t) {
  const A = env(t, T.go - 0.2, T.go + 0.1) * (1 - env(t, 21.0, 21.35));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 768, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('energy for the same download', 132, 1450);
  const X0 = 330, U = 260, fin = t >= T.done;
  const rows = [['strong signal', eS(t), 1494, C.blue, fin ? '1×' : ''], ['weak signal', eW(t), 1540, C.coral, fin ? '+52%' : '']];
  for (const [name, e, y, col, val] of rows) {
    ctx.font = '28px EBold'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(name, 132, y);
    roundRect(ctx, X0, y - 14, Math.max(14, U * e), 28, 9); ctx.fillStyle = col; ctx.fill();
    if (val) { ctx.font = '30px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = col === C.coral ? C.coral : C.blueSoft; ctx.fillText(val, 830, y); }
  }
  ctx.strokeStyle = hexA(C.ink, 0.5); ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(X0 + U, 1474); ctx.lineTo(X0 + U, 1560); ctx.stroke(); ctx.setLineDash([]);
  if (fin) { ctx.font = '22px ESemi'; ctx.textAlign = 'right'; ctx.fillStyle = GREY; ctx.fillText('one study, 3G', 830, 1450); }
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
  if (big) { line('ONE BAR.', 345, C.ink, 118); line('MORE DRAIN?', 470, C.coral, 118); }
  else { line('ONE BAR.', 362, C.ink, 94); line('MORE DRAIN?', 452, C.coral, 94); }
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
  add(0.02, 'tick', 0.12); add(1.0, 'tick', 0.1); add(2.0, 'tick', 0.1); add(T.why, 'retry', 0.14);
  add(T.wide, 'sweep', 0.14, { dur: 0.6 });
  for (const [a, b] of S_SENDS) { add(a, 'zip', 0.1); } add(8.25, 'chime', 0.14);
  for (const [a, b, lost] of W_SENDS) { add(a, 'zip', 0.12); if (lost) { add(b - 0.1, 'fizz', 0.24); add(b, 'offline', 0.12); } }
  add(T.rate, 'click', 0.14); add(T.power, 'land', 0.18); add(17.85, 'stop', 0.16); add(T.done, 'chime', 0.16);
  add(T.later, 'sweep', 0.12, { dur: 0.4 }); for (let i = 0; i < 3; i++) add(T.bars[0] + i * 0.3, 'tick', 0.14); add(T.up[0], 'zip', 0.16); add(T.up[1], 'chime', 0.16);
  add(T.cta, 'chime', 0.3); add(T.cta + 0.4, 'click', 0.18);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
