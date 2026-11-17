// Meshline production 30s, batch 2026-11-17-english-19: "Why two radios can collide without hearing each other".
// Same Transit-Map world as english-06..18 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). The hidden-terminal problem: the left and right
// phones both reach the middle one but not each other, so both sense silence, send, and collide at the receiver
// ("sensing happens at the sender, but interference at the receiver is what matters", MIT 6.033 L13 2017). Illustrative
// turn-taking: a request, then the middle's "clear to send" that both sides overhear (RTS/CTS, optional in Wi-Fi).
// General wireless mechanism; no Meshline protocol claims (listing facts only in the CTA).
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

// ------------------------------------------------------------------ three phones: left and right both reach the middle, not each other
const L = [3.2, 16.4], M = [9.0, 16.4], R = [14.8, 16.4], RANGE = 6.4;
const T = {
  hook: [2.05, 2.72], crash: 2.8, how: 3.9, hsil: 1.7,
  rangeL: 5.3, rangeR: 5.75, notEach: 7.8,
  silence: 9.7, send: [10.75, 12.15], clash: 12.25,
  sender: 14.3, receiver: 15.9,
  req: [18.8, 19.4], cts: [19.85, 20.9], ctsLab: 20.95,
  wait: 22.95, dataL: [23.4, 24.2], dataR: [24.75, 25.5], cta: 26.29,
};
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 16.2, z: 1.08 }], [4.4, { x: 9.0, y: 16.2, z: 1.11 }],             // hook: heard nothing, still crashed
    [4.9, { x: 9.0, y: 16.2, z: 1.02 }], [17.6, { x: 9.0, y: 16.2, z: 1.06 }],          // ranges, silence, clash, where it matters
    [18.1, { x: 9.0, y: 16.0, z: 1.04 }], [25.8, { x: 9.0, y: 16.0, z: 1.08 }],         // ask first; take turns
    [30, { x: 9.0, y: 16.2, z: 1.2 }],                                                     // CTA: slow push under the veil
  ]);
}

// ------------------------------------------------------------------ glyphs
function device(ctx, p, a = 1, lit = 0, col = C.blueSoft) {
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 1.0 * G, h = 1.62 * G;
  ctx.save(); ctx.globalAlpha *= a;
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 1.5 * G); g.addColorStop(0, hexA(col, 0.5 * lit)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 1.5 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 5, w, h, 0.14 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.14 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G, y - h / 2 + 0.13 * G, w - 0.14 * G, h - 0.26 * G, 0.05 * G); ctx.fill();
  ctx.restore();
}
function rangeRing(ctx, p, a, col = C.blueSoft) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = hexA(col, 0.06); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, RANGE * G, 0, TAU); ctx.fill();
  ctx.setLineDash([14, 10]); ctx.strokeStyle = hexA(col, 0.7); ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]); ctx.restore();
}
function silenceBubble(ctx, p, a) {                                        // "listening: silence" bubble (flat line)
  if (a <= 0.01) return; const x = p[0] * G, y = (p[1] - 1.95) * G, w = 3.6 * G, h = 1.0 * G;
  ctx.save(); ctx.globalAlpha *= a; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.2 * G); ctx.fillStyle = 'rgba(10,14,12,0.94)'; ctx.fill(); ctx.strokeStyle = hexA(C.ink, 0.5); ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = GREY; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - w * 0.4, y); ctx.lineTo(x - w * 0.2, y); ctx.stroke();
  ctx.font = `${0.56 * G}px EBold`; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('silence', x - 0.14 * w, y + 0.02 * G); ctx.restore();
}
function burst(ctx, p, t, t0, big = 1) {                                   // collision burst at the receiver
  const k = (t - t0) / 1.2; if (k < 0 || k > 1) return;
  const x = p[0] * G, y = p[1] * G, g = ctx.createRadialGradient(x, y, 0, x, y, 1.8 * G * big); g.addColorStop(0, hexA(C.coral, 0.6 * (1 - k))); g.addColorStop(1, hexA(C.coral, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 1.8 * G * big, 0, TAU); ctx.fill();
  ctx.save(); ctx.strokeStyle = hexA(C.coral, 1 - k); ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + 0.13, r0 = (0.9 + 0.6 * k) * G * big, r1 = r0 + 0.45 * G * big; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); ctx.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1); ctx.stroke(); }
  ctx.restore();
}

// ------------------------------------------------------------------ scene
function drawScene(ctx, t) {
  const v = veil(t);
  // ranges: faint in the hook, drawn properly in l2, kept as context afterwards
  const rl = (t < 4.6 ? 0.55 : 0.4 + 0.6 * env(t, T.rangeL - 0.1, T.rangeL + 0.3)) * (1 - v * 0.7), rr = (t < 4.6 ? 0.55 : 0.4 + 0.6 * env(t, T.rangeR - 0.1, T.rangeR + 0.3)) * (1 - v * 0.7);
  rangeRing(ctx, L, rl); rangeRing(ctx, R, rr);
  label(ctx, "left's reach", L[0] - 0.4, L[1] - RANGE + 0.8, 0.55, C.blueSoft, 'center', 'EBold', env(t, T.rangeL, T.rangeL + 0.25) * (1 - env(t, 9.0, 9.3)));
  label(ctx, "right's reach", R[0] + 0.4, R[1] - RANGE + 0.8, 0.55, C.blueSoft, 'center', 'EBold', env(t, T.rangeR, T.rangeR + 0.25) * (1 - env(t, 9.0, 9.3)));
  // left and right cannot hear each other
  const nh = (t < 4.6 ? 1 : env(t, T.notEach - 0.1, T.notEach + 0.2) * (1 - env(t, 13.6, 14.0))) * (1 - v);
  if (nh > 0) { ctx.save(); ctx.globalAlpha *= nh; strokePath(ctx, [[L[0], L[1] + 2.1], [R[0], R[1] + 2.1]], 99, 0.08 * G, hexA(C.coral, 0.8), false, [12, 10]); ctx.restore(); cross(ctx, [9.0, L[1] + 2.1], 0.32, nh); label(ctx, "can't hear each other", 9.0, L[1] + 3.15, 0.62, C.coral, 'center', 'EBold', nh * (t < 4.6 ? 0 : 1)); }
  // hook + l3: both send at once; the envelopes meet at the middle and burst
  const sendOnce = (t0, t1, tc) => {
    if (t < t0 || t > tc + 0.1) return; const q = ease.inOut(inv(t0, t1, t));
    for (const [p, dir] of [[L, 1], [R, -1]]) { const x = lerp(p[0] + dir * 0.8, M[0] - dir * 0.75, q); envelope(ctx, x * G, (M[1] - 0.05) * G, 0.84 * G, 1); }
  };
  if (t < 0.5) for (const dir of [1, -1]) envelope(ctx, (M[0] - dir * 0.6) * G, (M[1] - 0.05) * G, 0.84 * G, 1 - clamp(t / 0.5));   // frame zero: both packets already overlapping
  burst(ctx, M, t, -0.35, 1.15);
  sendOnce(...T.hook, T.crash); burst(ctx, M, t, T.crash, 1.1);
  sendOnce(...T.send, T.clash); burst(ctx, M, t, T.clash, 1.1);
  label(ctx, '?', M[0] + 1.6, M[1] - 2.2, 1.0 * ease.outBack(clamp((t - T.how) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.how) / 0.2) * (1 - env(t, 4.3, 4.6)));
  label(ctx, 'collision', M[0], M[1] - 1.95, 0.66, C.coral, 'center', 'EBold', env(t, T.clash, T.clash + 0.2) * (1 - env(t, 13.6, 13.9)));
  silenceBubble(ctx, L, env(t, T.hsil - 0.1, T.hsil + 0.15) * (1 - env(t, 2.25, 2.5)));
  silenceBubble(ctx, R, env(t, T.hsil - 0.1, T.hsil + 0.15) * (1 - env(t, 2.25, 2.5)));
  silenceBubble(ctx, L, env(t, T.silence - 0.1, T.silence + 0.2) * (1 - env(t, 10.7, 11.0)));
  silenceBubble(ctx, R, env(t, T.silence - 0.1, T.silence + 0.2) * (1 - env(t, 10.7, 11.0)));
  // l4: where listening happens vs where collisions happen
  const la = env(t, T.sender - 0.1, T.sender + 0.2) * (1 - env(t, 17.6, 17.9));
  label(ctx, 'listens here', L[0], L[1] - 1.95, 0.62, C.ink, 'center', 'EBold', la); label(ctx, 'listens here', R[0], R[1] - 1.95, 0.62, C.ink, 'center', 'EBold', la);
  const ca = env(t, T.receiver - 0.1, T.receiver + 0.2) * (1 - env(t, 17.6, 17.9));
  if (ca > 0) { ctx.save(); ctx.globalAlpha *= ca; ctx.strokeStyle = C.coral; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(M[0] * G, M[1] * G, 1.35 * G, 0, TAU); ctx.stroke(); ctx.restore(); }
  label(ctx, 'clash here', M[0], M[1] - 1.95, 0.66, C.coral, 'center', 'EBold', ca);
  // l5: ask first — a short request, then the middle's "clear to send" reaches both sides
  if (t > T.req[0] && t < T.req[1] + 0.2) { const q = ease.inOut(inv(...T.req, t)); ctx.save(); ctx.globalAlpha *= 1 - clamp((t - T.req[1]) / 0.2); ctx.fillStyle = C.blueSoft; roundRect(ctx, lerp(L[0] + 0.8, M[0] - 1.1, q) * G - 0.45 * G, (M[1] - 0.28) * G, 0.9 * G, 0.56 * G, 0.14 * G); ctx.fill(); ctx.restore(); }
  label(ctx, 'request', 6.1, M[1] - 1.05, 0.64, C.blueSoft, 'center', 'EBold', env(t, T.req[0], T.req[0] + 0.2) * (1 - env(t, T.cts[0], T.cts[0] + 0.2)));
  const ck = inv(...T.cts, t);
  if (ck > 0 && ck < 1) for (let j = 0; j < 2; j++) { const kk = clamp(ck * 1.2 - j * 0.2); if (kk <= 0) continue; ctx.strokeStyle = hexA(C.blueSoft, 0.9 * (1 - kk * 0.5)); ctx.lineWidth = 7 - j * 2; ctx.beginPath(); ctx.arc(M[0] * G, M[1] * G, (0.8 + (RANGE - 0.4) * ease.out(kk)) * G, 0, TAU); ctx.stroke(); }
  const ctsA = env(t, T.ctsLab - 0.1, T.ctsLab + 0.2) * (1 - env(t, 25.6, 25.9)) * (1 - v);
  label(ctx, 'clear to send', M[0], M[1] - 2.0, 0.72, C.blueSoft, 'center', 'EBold', ctsA);
  // l6: the far side waits; left sends ✓; then the right takes its turn ✓
  const wa = env(t, T.wait - 0.1, T.wait + 0.2) * (1 - env(t, T.dataR[0] - 0.2, T.dataR[0]));
  if (wa > 0) { const k = clamp((t - T.wait) / (T.dataR[0] - T.wait)); ctx.save(); ctx.globalAlpha *= wa; ctx.strokeStyle = GREY; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(R[0] * G, R[1] * G, 1.3 * G, -Math.PI / 2, -Math.PI / 2 + k * TAU); ctx.stroke(); ctx.restore(); }
  label(ctx, 'waits', R[0], R[1] - 2.0, 0.68, GREY, 'center', 'EBold', wa);
  for (const [p, tt, dir] of [[L, T.dataL, 1], [R, T.dataR, -1]]) {
    if (t > tt[0] && t < tt[1] + 0.3) { const q = ease.inOut(inv(...tt, t)); envelope(ctx, lerp(p[0] + dir * 0.8, M[0] - dir * 0.75, q) * G, (M[1] - 0.05) * G, 0.84 * G, 1 - clamp((t - tt[1]) / 0.3)); }
    check(ctx, (M[0] - dir * 1.05) * G, (M[1] - 0.05) * G, 0.66 * G, C.blueSoft, env(t, tt[1], tt[1] + 0.2) * (1 - v));
  }
  label(ctx, 'take turns', M[0], M[1] + 2.9, 0.7, C.blueSoft, 'center', 'EBold', env(t, T.dataR[0], T.dataR[0] + 0.25) * (1 - v));
  // the three phones (labels kept to positions only)
  const lit = t < 0.6 || (t > T.hook[0] - 0.1 && t < T.crash + 0.4) || (t > T.send[0] && t < T.clash + 0.4) ? 1 : 0;
  device(ctx, L, 1, lit * (1 - v)); device(ctx, R, 1, lit * (1 - v)); device(ctx, M, 1, t < 0.9 || (t > T.crash - 0.4 && t < T.crash + 0.8) || (t > T.clash - 0.4 && t < T.clash + 0.8) ? 1 : 0, C.coral);
  label(ctx, 'left', L[0], L[1] + 1.3, 0.58, C.ink, 'center', 'EBold', 1 - v); label(ctx, 'middle', M[0], M[1] + 1.3, 0.58, C.ink, 'center', 'EBold', 1 - v); label(ctx, 'right', R[0], R[1] + 1.3, 0.58, C.ink, 'center', 'EBold', 1 - v);
}

// ------------------------------------------------------------------ screen-space instrument: what the middle phone receives (time lane)
const RX = [[-1.3, 0.05, 'L', true], [-1.3, 0.05, 'R', true], [T.hook[0] + 0.25, T.crash, 'L', true], [T.hook[0] + 0.25, T.crash, 'R', true], [T.send[0] + 0.3, T.clash, 'L', true], [T.send[0] + 0.3, T.clash, 'R', true],
  [T.req[0], T.req[1], 'L', false], [T.cts[0], T.cts[0] + 0.5, 'M', false], [T.dataL[0], T.dataL[1], 'L', false], [T.dataR[0], T.dataR[1], 'R', false]];
function drawInstrument(ctx, t) {
  const A = 1 - env(t, T.cta - 0.3, T.cta + 0.15);
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('what the middle phone receives', 132, 1458);
  const X0 = 132, X1 = 940, Y = 1520, WIN = 3.0, px = s => X0 + (X1 - X0) * (1 - (t - s) / WIN);
  roundRect(ctx, X0, Y - 24, X1 - X0, 48, 12); ctx.strokeStyle = hexA(C.ink, 0.2); ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(X0, Y - 24, X1 - X0, 48); ctx.clip();
  let state = '';
  for (const [s, e, who, hit] of RX) { if (s > t || e < t - WIN) continue; const x0 = Math.max(X0, px(s)), x1 = px(Math.min(e, t)); if (x1 - x0 < 1) continue; const yy = hit ? (who === 'L' ? Y - 18 : Y) : Y - 18; roundRect(ctx, x0, yy, x1 - x0, hit ? 18 : 36, 6); ctx.fillStyle = hit ? hexA(C.coral, 0.9) : (who === 'M' ? C.blueSoft : C.blue); ctx.fill(); if (s <= t && e >= t) state = hit ? 'collision' : who === 'M' ? 'clear to send' : 'clean'; }
  ctx.restore();
  ctx.fillStyle = C.ink; ctx.fillRect(X1 - 2, Y - 28, 3, 56);
  if (state) { ctx.font = '30px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = state === 'collision' ? C.coral : C.blueSoft; ctx.fillText(state, X1, 1458); }
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
  if (big) { line('HEARD NOTHING.', 360, C.ink, 104); line('STILL CRASHED.', 495, C.coral, 104); }
  else { line('HEARD NOTHING.', 390, C.ink, 86); line('STILL CRASHED.', 488, C.coral, 86); }
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
  add(0.02, 'fizz', 0.22); add(T.hsil, 'tick', 0.1); add(T.hook[0], 'zip', 0.16); add(T.crash, 'fizz', 0.28); add(T.crash + 0.03, 'stamp', 0.2); add(T.how, 'retry', 0.14);
  add(T.rangeL, 'pen', 0.16, { dur: 0.4 }); add(T.rangeR, 'pen', 0.16, { dur: 0.4 }); add(T.notEach, 'offline', 0.16);
  add(T.silence, 'tick', 0.12); add(T.silence + 0.5, 'tick', 0.12); add(T.send[0], 'zip', 0.2); add(T.clash, 'fizz', 0.3); add(T.clash + 0.03, 'stamp', 0.2);
  add(T.sender, 'click', 0.14); add(T.receiver, 'click', 0.16);
  add(T.req[0], 'zip', 0.16); add(T.cts[0], 'sweep', 0.18, { dur: 0.9 }); add(T.ctsLab, 'chime', 0.18);
  add(T.wait, 'tick', 0.12); add(T.dataL[0], 'zip', 0.18); add(T.dataL[1], 'stop', 0.2); add(T.dataR[0], 'zip', 0.18); add(T.dataR[1], 'stop', 0.2);
  add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
