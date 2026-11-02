// Meshline production 30s #02, "Why a walkie-talkie can work when the internet is down".
// Transit-Map art direction (lemomo-ai/lemo-opuscar styles/transit-map/STYLE.md, read-only). One printed sheet:
// the internet hub goes offline, a direct radio route is inked, channels must match, a range ring, a hill blocks
// the path, a hilltop repeater relays it, a printed comparison panel, then finite coverage rings on the whole map.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1080;

// ------------------------------------------------------------------ network (G, octilinear)
const A = [3.5, 13], B = [14.5, 13], HUB = [9, 4.6], ROUTER = [3.5, 8.6], MOBILE = [14.5, 8.6], WEBSITE = [9, 7.4];
const OLD = [A, ROUTER, [3.5, 6.6], [5.5, 4.6], HUB, [12.5, 4.6], [14.5, 6.6], MOBILE, B];
const DIRECT = { pts: [A, B], t0: 3.0, dur: 1.3 };
const HILL = [9, 18.5], R = [9, 18.5], Cst = [14.5, 27];
const LOW = { pts: [A, [9, 18.5], [14.5, 24], Cst], t0: 14.3, dur: 1.5 };      // attempted low path A→C
const T = {
  offline: 0.45, oldTry: [1.2, 2.3], website: 6.3, mobile: 7.0, router: 7.9,
  mismatch: [9.5, 11.0], match: 11.0, range: [12.0, 12.8], obstacles: 14.3, hillStop: 15.4,
  repeater: 17.55, relay: [18.2, 19.3], panel: [20.9, 21.4], rings: [26.0, 27.6], sig: 28.9,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
[DIRECT, LOW].forEach(r => { r.L = len(r.pts); });
const OLD_L = len(OLD);
const RELAY2 = { pts: [R, [14.5, 24], Cst], t0: T.relay[0], dur: 1.1 }; RELAY2.L = len(RELAY2.pts);

// ------------------------------------------------------------------ camera
function cam(t) {
  return K(t, [
    [0, { x: 9, y: 9.2, z: 1.22 }], [2.9, { x: 9, y: 9.3, z: 1.22 }], [4.4, { x: 9, y: 9.7, z: 1.24 }],
    [9.2, { x: 9, y: 9.8, z: 1.24 }], [10.2, { x: 9.1, y: 14.0, z: 1.12 }], [13.9, { x: 9.2, y: 14.1, z: 1.12 }],
    [14.9, { x: 9, y: 19.6, z: 1.02 }], [20.6, { x: 9, y: 19.7, z: 1.03 }], [21.7, { x: 6.1, y: 29.9, z: 1.38 }],
    [25.7, { x: 6.1, y: 30.0, z: 1.4 }], [26.9, { x: 9, y: 16.6, z: 0.6 }], [30, { x: 9, y: 16.6, z: 0.6 }],
  ]);
}

// ------------------------------------------------------------------ cached sheet (charcoal stock, tooth, grid, light, printed terrain)
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
  // printed hill: contour rings (terrain is printed, flat; the camera gives depth)
  for (let k = 0; k < 5; k++) { c.strokeStyle = hexA('#9AA59F', 0.16 + k * 0.05); c.lineWidth = 2; c.beginPath(); c.ellipse(HILL[0] * G, HILL[1] * G, (3.4 - k * 0.6) * G, (2.3 - k * 0.42) * G, 0, 0, TAU); c.stroke(); }
  c.fillStyle = hexA('#9AA59F', 0.08); c.beginPath(); c.ellipse(HILL[0] * G, HILL[1] * G, 3.4 * G, 2.3 * G, 0, 0, TAU); c.fill();
  // printed buildings block near the low path
  for (const [bx, by, bw, bh] of [[11.4, 21.0, 1.2, 1.0], [12.8, 21.4, 0.9, 1.4], [11.6, 22.3, 1.0, 0.8]]) { c.fillStyle = hexA('#9AA59F', 0.18); c.strokeStyle = hexA('#C9D0CC', 0.35); c.lineWidth = 1.5; c.fillRect(bx * G, by * G, bw * G, bh * G); c.strokeRect(bx * G, by * G, bw * G, bh * G); }
  const lg = c.createLinearGradient(0, 0, w, h); lg.addColorStop(0, 'rgba(247,247,242,0.05)'); lg.addColorStop(1, 'rgba(0,0,0,0.12)'); c.fillStyle = lg; c.fillRect(0, 0, w, h);
  SHEET_IMG = cv; return cv;
}

// ------------------------------------------------------------------ ink helpers
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
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${size * G}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';   // multiplies any outer veil
  ctx.lineWidth = 0.1 * G; ctx.strokeStyle = hexA(C.bg, 0.92); ctx.strokeText(txt, x * G, y * G); ctx.fillStyle = col; ctx.fillText(txt, x * G, y * G); ctx.restore();
}
function ring(ctx, p, age, col = C.blueSoft, maxR = 0.6) { if (age < 0 || age > 0.6) return; ctx.strokeStyle = hexA(col, 1 - age / 0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, (0.2 + maxR * age / 0.6) * G, 0, TAU); ctx.stroke(); }
function stationStop(ctx, p, r, age, ringCol = C.blue, dim = 1) {
  if (age < 0) return; const s = age < 0.28 ? 0.6 + 0.4 * ease.outBack(age / 0.28) : 1;
  ctx.save(); ctx.globalAlpha = dim;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(p[0] * G + 2, p[1] * G + 4, r * G * s, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.strokeStyle = ringCol; ctx.lineWidth = 0.05 * G; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, r * G * s, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  ring(ctx, p, age);
}
// a handheld two-way radio drawn as the station marker (white body, antenna, speaker grille)
function radioStation(ctx, p, age, name, labelSide = 'below') {
  if (age < 0) return;
  const s = age < 0.3 ? 0.6 + 0.4 * ease.outBack(age / 0.3) : 1, x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 0.98 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 6, w, h, 0.12 * G); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.08 * G; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w * 0.25, y - h / 2); ctx.lineTo(x + w * 0.25, y - h / 2 - 0.42 * G * s); ctx.stroke();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.12 * G); ctx.fill();
  ctx.fillStyle = C.blue; roundRect(ctx, x - w * 0.32, y - h * 0.34, w * 0.64, h * 0.22, 4); ctx.fill();
  ctx.fillStyle = C.charcoal; for (let i = 0; i < 3; i++) ctx.fillRect(x - w * 0.28, y + h * (0.02 + i * 0.12), w * 0.56, h * 0.05);
  ring(ctx, p, age, C.blueSoft, 0.9);
  label(ctx, name, p[0], p[1] + (labelSide === 'below' ? 1.0 : -1.25), 0.46, C.ink, 'center', 'EBold', clamp(age / 0.3));
}
function voiceToken(ctx, p, s = 0.5, alpha = 1, col = C.ink) {
  const x = p[0] * G, y = p[1] * G, z = s * G;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x - z / 2 + 3, y - z / 2 + 5, z, z, z * 0.3); ctx.fill();
  ctx.fillStyle = col; roundRect(ctx, x - z / 2, y - z / 2, z, z, z * 0.3); ctx.fill();
  ctx.strokeStyle = C.blue; ctx.lineWidth = z * 0.09; ctx.lineCap = 'round';                      // printed sound-wave glyph = voice
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x - z * 0.22, y, z * (0.16 + k * 0.13), -0.75, 0.75); ctx.stroke(); }
  ctx.restore();
}
function fizz(ctx, p, t, t0) { // signal breaking up: short coral sparks
  const k = t - t0; if (k < 0 || k > 0.7) return;
  ctx.strokeStyle = hexA(C.coral, 1 - k / 0.7); ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + hash(i + t0) * 0.6, d0 = (0.2 + k * 0.9) * G, d1 = d0 + 0.18 * G; ctx.beginPath(); ctx.moveTo(p[0] * G + Math.cos(a) * d0, p[1] * G + Math.sin(a) * d0); ctx.lineTo(p[0] * G + Math.cos(a) * d1, p[1] * G + Math.sin(a) * d1); ctx.stroke(); }
}
function bullet(ctx, p, txt, col, flip = 1) { // line bullet: disc with a figure (style §2)
  const x = p[0] * G, y = p[1] * G, r = 0.42 * G;
  ctx.save(); ctx.translate(x, y); ctx.scale(1, Math.max(0.05, Math.abs(flip)));
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(3, 5, r, 0, TAU); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.font = `${0.34 * G}px EDisplay`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 1);
  ctx.restore();
}

// ------------------------------------------------------------------ scene beats
function drawOldNetwork(ctx, t) {
  // the internet path: printed before the film starts; fades to a grey dashed "offline" print after the hub goes down
  const off = env(t, T.offline, T.offline + 0.5);
  const col = off > 0.5 ? hexA('#7E8884', 0.75) : C.blue;
  strokePath(ctx, OLD, OLD_L, 0.16 * G, col, true, off > 0.5 ? [10, 9] : null);
  strokePath(ctx, [HUB, WEBSITE], 2.8, 0.13 * G, col, true, off > 0.5 ? [10, 9] : null);
  // hub capsule
  const [x, y] = HUB, w = 3.3 * G, h = 1.15 * G;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x * G - w / 2 + 4, y * G - h / 2 + 7, w, h, h / 2); ctx.fill();
  ctx.fillStyle = off > 0.5 ? '#C9CEC9' : C.ink; roundRect(ctx, x * G - w / 2, y * G - h / 2, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = off > 0.5 ? C.coral : C.charcoal; ctx.lineWidth = 0.07 * G; ctx.stroke();
  ctx.fillStyle = C.charcoal; ctx.font = `${0.5 * G}px EBold`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('INTERNET', x * G, y * G + 2);
  if (off > 0) { // stamped offline
    ctx.save(); ctx.globalAlpha = off; ctx.strokeStyle = C.coral; ctx.lineWidth = 0.12 * G; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x * G - w / 2 + 14, y * G - h / 2 + 8); ctx.lineTo(x * G + w / 2 - 14, y * G + h / 2 - 8); ctx.stroke(); ctx.restore();
    label(ctx, 'offline', x + 1.95, y - 0.95, 0.42, C.coral, 'left', 'EBold', off);
  }
  // stops on the internet path, each stamped "not needed" as the voice names it
  for (const [p, name, tt, side] of [[ROUTER, 'ROUTER', T.router, 'right'], [MOBILE, 'MOBILE DATA', T.mobile, 'left'], [WEBSITE, 'WEBSITE', T.website, 'right']]) {
    stationStop(ctx, p, 0.17, 10, off > 0.5 ? '#7E8884' : C.blue, off > 0.5 ? 0.8 : 1);
    const lx = side === 'right' ? p[0] + 0.45 : p[0] - 0.45;
    label(ctx, name, lx, p[1], 0.4, off > 0.5 ? '#B5BDB8' : C.ink, side === 'right' ? 'left' : 'right', 'EBold');
    const k = clamp((t - tt) / 0.3);
    if (k > 0) { label(ctx, 'not needed', lx, p[1] + 0.55, 0.34, C.coral, side === 'right' ? 'left' : 'right', 'ESemi', k * (1 - env(t, 13.6, 14.2))); ring(ctx, p, t - tt, C.coral); }
  }
  // hook: a voice token tries the internet path and stops at the router
  if (t > T.oldTry[0] && t < T.oldTry[1] + 0.5) {
    const k = ease.out(clamp((t - T.oldTry[0]) / (T.oldTry[1] - T.oldTry[0])));
    const p = at(OLD, k * 4.4);
    voiceToken(ctx, p, 0.5, 1 - env(t, T.oldTry[1], T.oldTry[1] + 0.4));
  }
  fizz(ctx, ROUTER, t, T.oldTry[1]);
}

function drawDirect(ctx, t) {
  const k = ease.inOut(clamp((t - DIRECT.t0) / DIRECT.dur));
  if (k <= 0) return;
  strokePath(ctx, DIRECT.pts, k * DIRECT.L, 0.26 * G, C.blue);
  if (k < 1) penTip(ctx, at(DIRECT.pts, k * DIRECT.L));
  label(ctx, 'direct radio link', 9, 12.2, 0.42, C.blueSoft, 'center', 'EBold', env(t, 3.9, 4.4) * (1 - env(t, 13.6, 14.0)));
  // voice packets ride the direct link (paused while channels mismatch)
  const mism = t > T.mismatch[0] && t < T.match;
  for (let i = 0; i < 9; i++) {
    const t0 = 4.4 + i * 0.85; if (t < t0 || t > 13.9) continue;
    const u = (t - t0) / 1.2; if (u > 1) continue;
    const start = t0;
    if (start > T.mismatch[0] - 1.2 && start < T.match) { // during mismatch: token stops halfway and fizzles
      const uu = Math.min(u, 0.55); voiceToken(ctx, at(DIRECT.pts, ease.inOut(uu) * DIRECT.L), 0.5, u > 0.55 ? 1 - (u - 0.55) / 0.3 : 1);
      if (u > 0.55 && u < 0.62) fizz(ctx, at(DIRECT.pts, 0.55 * DIRECT.L), t, t - (u - 0.55) * 1.2);
      continue;
    }
    voiceToken(ctx, at(DIRECT.pts, ease.inOut(u) * DIRECT.L), 0.5);
  }
}

function drawChannels(ctx, t) {
  if (t < T.mismatch[0] - 0.2) return;
  const a = env(t, T.mismatch[0] - 0.2, T.mismatch[0] + 0.2) * (1 - env(t, 25.9, 26.4));
  ctx.save(); ctx.globalAlpha = a;
  bullet(ctx, [A[0] - 1.25, A[1] - 0.9], 'CH 7', C.blue);
  const flipK = clamp((t - T.match + 0.15) / 0.3), flip = Math.cos(flipK * Math.PI);
  bullet(ctx, [B[0] + 1.25, B[1] - 0.9], flipK < 0.5 ? 'CH 3' : 'CH 7', flipK < 0.5 ? C.coral : C.blue, flip);
  ctx.restore();
  label(ctx, t < T.match ? 'settings don’t match' : 'matching settings', 9, 14.2, 0.4, t < T.match ? C.coral : C.blueSoft, 'center', 'EBold', a * env(t, T.mismatch[0], T.mismatch[0] + 0.3) * (1 - env(t, 13.6, 14.0)));
}

function drawRange(ctx, t, rk = null) {
  // usable range: a printed dashed ring around A that reaches just past B
  const k = rk ?? ease.out(clamp((t - T.range[0]) / (T.range[1] - T.range[0])));
  const fadeOut = 1 - env(t, 13.9, 14.4);
  if (k <= 0 || fadeOut <= 0) return;
  ctx.save(); ctx.globalAlpha = fadeOut; ctx.strokeStyle = hexA(C.blueSoft, 0.85); ctx.lineWidth = 0.06 * G; ctx.setLineDash([14, 12]);
  ctx.beginPath(); ctx.arc(A[0] * G, A[1] * G, 12.2 * G, -Math.PI * 0.5 * k, Math.PI * 0.5 * k); ctx.stroke(); ctx.restore();
  label(ctx, 'usable range', A[0] + 11.0, A[1] + 3.2, 0.42, C.blueSoft, 'right', 'EBold', clamp((t - T.range[0] - 0.3) / 0.3) * (1 - env(t, 13.6, 14.0)));
}

function drawHillBeat(ctx, t) {
  const age = t - T.obstacles;
  if (age < -0.3) return;
  radioStation(ctx, Cst, age, 'RADIO C', 'below');
  label(ctx, 'hill', HILL[0] - 2.2, HILL[1] - 1.9, 0.42, '#C9D0CC', 'left', 'EBold', clamp(age / 0.3));
  label(ctx, 'buildings', 13.9, 20.7, 0.38, '#C9D0CC', 'left', 'EBold', clamp((age - 0.4) / 0.3));
  // interference scribble near C
  const ia = clamp((age - 0.8) / 0.3) * (1 - env(t, 17.6, 18.2));
  if (ia > 0) { ctx.save(); ctx.globalAlpha = ia; ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 18; i++) { const x = (15.4 + i * 0.09) * G, y = (24.2 + Math.sin(i * 1.9 + t * 9) * 0.22) * G; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); label(ctx, 'interference', 15.3, 23.5, 0.36, C.coral, 'left', 'EBold', ia); }
  // the low path: ink thins and breaks up at the hill (weak signal)
  const k = ease.out(clamp((t - LOW.t0) / LOW.dur));
  if (k > 0 && t < T.repeater + 0.6) {
    const stopD = 6.9;                                         // the hill edge along the path
    const d = Math.min(k * LOW.L, stopD + (k * LOW.L - stopD) * 0.0);
    const fade = 1 - env(t, T.repeater, T.repeater + 0.6);
    strokePath(ctx, LOW.pts, Math.min(d, stopD * 0.7), 0.2 * G, hexA(C.blue, fade));
    if (d > stopD * 0.7) strokePath(ctx, LOW.pts, d, 0.12 * G, hexA(C.blue, 0.45 * fade), false, [8, 10]);
    if (k < 1) penTip(ctx, at(LOW.pts, d));
    // voice tokens fade out as they hit the hill
    for (let i = 0; i < 3; i++) { const t0 = 15.0 + i * 0.7; const u = (t - t0) / 0.9; if (u < 0 || u > 1.2) continue; const dd = Math.min(ease.out(Math.min(u, 1)) * stopD, stopD); voiceToken(ctx, at(LOW.pts, dd), 0.46, (u < 0.8 ? 1 : 1 - (u - 0.8) / 0.4) * fade); if (u > 0.8 && u < 0.9) fizz(ctx, at(LOW.pts, stopD), t, t0 + 0.8); }
    label(ctx, 'signal weakens', HILL[0] - 0.3, HILL[1] + 2.75, 0.4, C.coral, 'center', 'EBold', clamp((t - T.hillStop) / 0.3) * fade);
  }
}

function drawRepeater(ctx, t) {
  const land = t - T.repeater;
  if (land < 0) return;
  // solid relay route: A → repeater (already on the hill) → C
  strokePath(ctx, [A, R], Math.hypot(R[0] - A[0], R[1] - A[1]) * ease.out(clamp(land / 0.5)), 0.24 * G, C.blue);
  const k = ease.inOut(clamp((t - RELAY2.t0) / RELAY2.dur));
  if (k > 0) { strokePath(ctx, RELAY2.pts, k * RELAY2.L, 0.24 * G, C.blue); if (k < 1) penTip(ctx, at(RELAY2.pts, k * RELAY2.L)); }
  // repeater mast falls onto the hilltop with weight
  const s = land < 0.4 ? 1 + 2.2 * (1 - ease.out(land / 0.4)) : 1, off = land < 0.4 ? 16 * (1 - land / 0.4) : 0;
  const x = R[0] * G, y = R[1] * G;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.arc(x + 4 + off, y + 7 + off, 0.42 * G * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.07 * G; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 1.0 * G * s); ctx.moveTo(x - 0.35 * G * s, y); ctx.lineTo(x, y - 1.0 * G * s); ctx.lineTo(x + 0.35 * G * s, y); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 0.38 * G * s, 0, TAU); ctx.fill(); ctx.strokeStyle = C.charcoal; ctx.lineWidth = 0.07 * G; ctx.stroke();
  ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(x, y, 0.16 * G * s, 0, TAU); ctx.fill();
  if (land < 0.9) { const kk = land / 0.9; ctx.strokeStyle = hexA(C.ink, 1 - kk); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, (0.6 + 2.0 * kk) * G, 0, TAU); ctx.stroke(); }
  label(ctx, 'REPEATER', R[0] + 0.6, R[1] - 0.75, 0.46, C.ink, 'left', 'EBold', clamp(land / 0.3));
  label(ctx, 'on the hill', R[0] + 0.6, R[1] - 0.2, 0.36, C.blueSoft, 'left', 'ESemi', clamp((land - 0.3) / 0.3) * (1 - env(t, 25.9, 26.4)));
  // voice relayed: hop A → repeater (pause + ring) → C
  for (let i = 0; i < 3; i++) {
    const t0 = 18.4 + i * 0.75, u = (t - t0) / 1.6; if (u < 0 || u > 1) continue;
    const L1 = Math.hypot(R[0] - A[0], R[1] - A[1]);
    let p;
    if (u < 0.42) p = at([A, R], ease.inOut(u / 0.42) * L1);
    else if (u < 0.55) { p = R; ring(ctx, R, (u - 0.42) * 1.6 * 2, C.ink, 0.9); }
    else p = at(RELAY2.pts, ease.inOut((u - 0.55) / 0.45) * RELAY2.L);
    voiceToken(ctx, p, 0.5);
  }
  if (t > 19.6) ring(ctx, Cst, (t - 19.6) % 0.75, C.blueSoft, 0.8);
}

function drawPanel(ctx, t) {
  // printed comparison panel (style §4 callout): two different radio links, two different rule sets
  const a = env(t, T.panel[0], T.panel[1]);
  if (a <= 0) return;
  const x = 0.8, y = 27.55, w = 10.6, h = 3.9;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(ctx, x * G + 6, y * G + 9, w * G, h * G, 0.25 * G); ctx.fill();
  ctx.fillStyle = 'rgba(14,20,18,0.97)'; roundRect(ctx, x * G, y * G, w * G, h * G, 0.25 * G); ctx.fill();
  ctx.fillStyle = C.blue; ctx.fillRect(x * G, y * G, 0.1 * G, h * G * clamp((t - T.panel[0]) / 0.5));
  // row 1: walkie-talkie
  radioStation(ctx, [x + 0.9, y + 1.05], 9, '', 'below');
  label(ctx, 'Walkie-talkie', x + 1.8, y + 0.8, 0.46, C.ink, 'left', 'EBold');
  label(ctx, 'two-way radio · channel + range', x + 1.8, y + 1.38, 0.34, '#B5BDB8', 'left', 'ESemi');
  // row 2: offline messaging app (generic; not any specific app's radio or range)
  const r2 = clamp((t - 22.2) / 0.4);
  ctx.globalAlpha = a * r2;
  const px = (x + 0.9) * G, py = (y + 2.75) * G;
  ctx.fillStyle = C.ink; roundRect(ctx, px - 0.26 * G, py - 0.45 * G, 0.52 * G, 0.9 * G, 0.1 * G); ctx.fill();
  ctx.fillStyle = C.charcoal; roundRect(ctx, px - 0.2 * G, py - 0.36 * G, 0.4 * G, 0.64 * G, 0.06 * G); ctx.fill();
  ctx.strokeStyle = hexA(C.blueSoft, 0.9); ctx.lineWidth = 2.5; ctx.setLineDash([4, 5]); for (const rr of [0.62, 0.86]) { ctx.beginPath(); ctx.arc(px, py, rr * G, -0.8, 0.8); ctx.stroke(); } ctx.setLineDash([]);
  label(ctx, 'Offline messaging app', x + 1.8, y + 2.5, 0.46, C.ink, 'left', 'EBold', a * r2);
  label(ctx, 'radios + rules vary · check its limits', x + 1.8, y + 3.08, 0.34, C.coral, 'left', 'ESemi', a * r2 * clamp((t - 23.6) / 0.4));
  ctx.restore();
}

function drawRings(ctx, t) {
  // takeaway: every link has a finite, printed coverage ring (illustrative radii)
  const k = ease.out(clamp((t - T.rings[0]) / (T.rings[1] - T.rings[0])));
  if (k <= 0) return;
  ctx.save(); ctx.setLineDash([12, 12]); ctx.lineWidth = 0.08 * G;
  for (const [p, r, i] of [[A, 5.2, 0], [B, 5.2, 1], [R, 5.4, 2], [Cst, 4.2, 3]]) {
    const kk = clamp(k * 1.6 - i * 0.2); if (kk <= 0) continue;
    ctx.strokeStyle = hexA(C.blueSoft, 0.85); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, r * G * kk, 0, TAU); ctx.stroke();
    ctx.fillStyle = hexA(C.blue, 0.06 * kk); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, r * G * kk, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // printed callout
  const ca = clamp((t - 26.6) / 0.4);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca;
    ctx.fillStyle = 'rgba(14,20,18,0.95)'; roundRect(ctx, 9.7 * G, 14.7 * G, 8.0 * G, 2.75 * G, 0.3 * G); ctx.fill(); ctx.fillStyle = C.coral; ctx.fillRect(9.7 * G, 14.7 * G, 0.12 * G, 2.75 * G);
    ctx.restore();
    label(ctx, 'No internet ≠', 10.15, 15.45, 0.86, C.ink, 'left', 'EBold', ca);
    label(ctx, 'unlimited range', 10.15, 16.65, 0.86, C.ink, 'left', 'EBold', ca);
  }
}

function drawCartouche(ctx) {
  ctx.fillStyle = C.blue; ctx.fillRect(5.15 * G, 9.95 * G, 0.1 * G, 1.1 * G);
  label(ctx, 'Why a walkie-talkie', 5.45, 10.25, 0.42, C.ink, 'left', 'EBold');
  label(ctx, 'works offline', 5.45, 10.8, 0.42, C.ink, 'left', 'EBold');
}

// ------------------------------------------------------------------ captions (screen space; ink in y 350–470)
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
  ctx.save(); ctx.globalAlpha = 1 - env(t, 9.3, 10.0) * (1 - env(t, 25.9, 26.6)); drawCartouche(ctx); ctx.restore();   // title printed for the hook + final overview only
  ctx.save(); ctx.globalAlpha = 1 - 0.7 * env(t, 9.3, 10.0) * (1 - env(t, 25.9, 26.6)); drawOldNetwork(ctx, t); ctx.restore();   // veil: the internet path recedes once it no longer matters
  drawRange(ctx, t);
  drawHillBeat(ctx, t);
  drawRepeater(ctx, t);
  drawDirect(ctx, t);
  radioStation(ctx, A, t, 'RADIO A', 'below');
  radioStation(ctx, B, t, 'RADIO B', 'below');
  drawChannels(ctx, t);
  drawRings(ctx, t);
  const veil = 0.6 * env(t, 21.0, 21.6) * (1 - env(t, 25.7, 26.2));        // paper veil while the panel leads
  if (veil > 0) { ctx.fillStyle = hexA(C.bg, veil); ctx.fillRect(0, 0, SHEET.w * G, SHEET.h * G); }
  drawPanel(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1060, 560, 540, 1060, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.85)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '24px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not real coverage data', 48, 1858);
  if (assets.icon) { const a = env(t, T.sig, T.sig + 0.5) * 0.62; if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 806, 1824, 38, 38, 9); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 806, 1824, 38, 38); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '26px ESemi'; ctx.fillText('Meshline', 852, 1852); ctx.restore(); } }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  add(T.offline, 'offline', 0.7); add(T.oldTry[0], 'ptt', 0.5); add(T.oldTry[1], 'fizz', 0.6);
  add(DIRECT.t0, 'pen', 0.7, { dur: DIRECT.dur }); add(DIRECT.t0 + DIRECT.dur, 'stop', 0.6);
  for (let i = 0; i < 9; i++) { const t0 = 4.4 + i * 0.85; if (t0 < 13.9) add(t0, t0 > T.mismatch[0] - 1.2 && t0 < T.match ? 'pttFail' : 'ptt', 0.35); }
  [T.website, T.mobile, T.router].forEach(t => add(t, 'stamp', 0.5));
  add(T.match - 0.15, 'click', 0.7); add(T.range[0], 'sweep', 0.4, { dur: T.range[1] - T.range[0] + 0.3 });
  add(LOW.t0, 'pen', 0.5, { dur: LOW.dur }); [15.8, 16.5, 17.2].forEach(t => add(t, 'fizz', 0.45));
  add(T.repeater, 'land', 0.55); add(T.repeater + 0.15, 'chime', 0.3); add(RELAY2.t0, 'pen', 0.5, { dur: RELAY2.dur });
  for (let i = 0; i < 3; i++) { add(18.4 + i * 0.75, 'ptt', 0.2); add(18.4 + i * 0.75 + 0.7, 'relay', 0.18); }
  add(T.panel[0], 'callout', 0.5); add(22.2, 'stop', 0.4);
  add(T.rings[0], 'sweep', 0.5, { dur: 1.6 }); add(26.6, 'callout', 0.45); add(T.sig, 'chime', 0.55);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
