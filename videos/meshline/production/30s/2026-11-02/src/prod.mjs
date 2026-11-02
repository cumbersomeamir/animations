// Meshline production 30s #01, "Why full bars can still mean slow data".
// Transit-Map art direction (lemomo-ai/lemo-opuscar styles/transit-map/STYLE.md, read-only): one printed network
// sheet; routes grow as pen tips ink them; stations pop; an interchange lands with weight; one continuous sheet
// with camera glides/pull-backs. Original Canvas2D code. drawFrame(ctx,t) is a pure function of time.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60;                                   // grid step, sheet px
const SHEET = { w: 18, h: 32 };                 // in G
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));

// ------------------------------------------------------------------ network (G coords, octilinear)
const YOU = [5, 24], TOWER = [9, 12], FRIEND = [16.2, 23.4], MEET = [11, 27.2];
const SIGNAL = { pts: [YOU, [5, 18], [9, 14], [9, 12.6]], t0: 3.5, dur: 3.4 };          // the "clear road"
const QUEUE = [[10.9, 12], [13, 12], [15, 14], [15, 19.8]];                              // hollow siding for waiting tokens
const RACK = { x: 6.25, y: 9.55, n: 6, s: 0.92 };                                        // shared-capacity slots above the tower
const CROWD = [];
{
  const spots = [[1.5, 4], [3.5, 3.6], [5.5, 4.2], [7.6, 3.6], [10.4, 3.6], [12.5, 4.2], [14.5, 3.6], [16.5, 4.2],
    [1.2, 6.6], [16.8, 6.6], [2.6, 8.6], [15.4, 8.8], [1.2, 11.2], [16.8, 11.4], [2.8, 13.6]];
  spots.forEach(([x, y], i) => {
    // octilinear route from each phone station to the tower: vertical/horizontal then 45° into the station
    const tx = TOWER[0] + (x < TOWER[0] ? -0.75 : 0.75), ty = TOWER[1];
    const dy = ty - y, dx = tx - x;
    const mid = Math.abs(dx) > Math.abs(dy) ? [tx - Math.sign(dx) * Math.abs(dy), y] : [x, ty - Math.abs(dx) * Math.sign(dy)];
    CROWD.push({ pts: [[x, y], mid, [tx, ty]], t0: 12.25 + i * 0.22 + hash(i) * 0.12, dur: 1.15 });
  });
}
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
[SIGNAL, ...CROWD].forEach(r => { r.L = len(r.pts); });
const QL = len(QUEUE);
const WALK_YOU = { pts: [YOU, [7.6, 26.6], [8.2, 27.2], MEET], t0: 26.0, dur: 1.5 };
const WALK_FRIEND = { pts: [FRIEND, [16.2, 25], [14, 27.2], MEET], t0: 26.6, dur: 1.4 };
[WALK_YOU, WALK_FRIEND].forEach(r => { r.L = len(r.pts); });

// ------------------------------------------------------------------ capacity & queue (illustrative simulation)
const occupied = t => Math.round(lerp(2, 6, ease.inOut(inv(12.4, 15.2, t))));                 // busy slots out of 6
const queueLen = t => lerp(0, 13, ease.inOut(inv(14.2, 17.0, t)));                           // tokens waiting on the siding
const MU = 1.35;                                                                              // service rate once full (tokens/s)
const YOU_TOKEN = { launch: 18.05, arrive: 19.45, join: 19.9, idx0: 12.6, front: 29.2 };
const yourIdx = t => lerp(YOU_TOKEN.idx0, 0, clamp((t - YOU_TOKEN.join) / (YOU_TOKEN.front - YOU_TOKEN.join)));
const queuePoint = q => at(QUEUE, Math.min(QL - 0.2, 0.45 + q * 0.62));

// ------------------------------------------------------------------ camera (G centre, zoom)
function cam(t) {
  return K(t, [
    [0, { x: 5.3, y: 23.2, z: 1.55 }], [3.2, { x: 5.3, y: 23.0, z: 1.55 }],
    [5.2, { x: 6.6, y: 18.8, z: 1.42 }], [7.6, { x: 8.6, y: 15.2, z: 1.36 }], [8.6, { x: 9.3, y: 14.9, z: 1.42 }],
    [11.6, { x: 9.4, y: 14.9, z: 1.44 }], [16.2, { x: 9.0, y: 12.9, z: 0.78 }], [17.4, { x: 9.0, y: 13.0, z: 0.78 }],
    [19.0, { x: 8.7, y: 16.6, z: 1.12 }], [22.4, { x: 8.9, y: 16.4, z: 1.14 }], [23.6, { x: 6.6, y: 16.2, z: 1.26 }],
    [25.6, { x: 6.8, y: 16.6, z: 1.24 }], [26.6, { x: 10.3, y: 25.1, z: 1.15 }], [29.0, { x: 10.3, y: 25.0, z: 1.16 }],
    [29.8, { x: 9.0, y: 14.7, z: 0.66 }], [30, { x: 9.0, y: 14.7, z: 0.66 }],
  ]);
}
const SCREEN_CY = 1080; // sheet focus sits below the caption band

// ------------------------------------------------------------------ cached sheet: charcoal stock, tooth, grid, raking light
let SHEET_IMG = null;
function sheetImage() {
  if (SHEET_IMG) return SHEET_IMG;
  const s = 2, cv = createCanvas(SHEET.w * G * s, SHEET.h * G * s), c = cv.getContext('2d');
  c.scale(s, s);
  const w = SHEET.w * G, h = SHEET.h * G;
  c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = hexA(C.ink, 0.01 + 0.025 * hash(i * 3.7)); c.fillRect(hash(i * 1.3) * w, hash(i * 2.9) * h, 1.5, 1.5); }
  c.strokeStyle = hexA(C.ink, 0.03); c.lineWidth = 0.8;
  for (let i = 0; i < 900; i++) { const x = hash(i * 5.1) * w, y = hash(i * 7.3) * h, a = hash(i) * TAU, l = 1.5 + hash(i * 2.2) * 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  c.strokeStyle = hexA(C.blueSoft, 0.05); c.lineWidth = 1;
  for (let x = 1; x < SHEET.w; x++) { c.beginPath(); c.moveTo(x * G, 0); c.lineTo(x * G, h); c.stroke(); }
  for (let y = 1; y < SHEET.h; y++) { c.beginPath(); c.moveTo(0, y * G); c.lineTo(w, y * G); c.stroke(); }
  const lg = c.createLinearGradient(0, 0, w, h); lg.addColorStop(0, 'rgba(247,247,242,0.05)'); lg.addColorStop(1, 'rgba(0,0,0,0.12)');
  c.fillStyle = lg; c.fillRect(0, 0, w, h);
  // printed concert venue block (static print)
  roundRect(c, 3.2 * G, 0.9 * G, 11.6 * G, 1.5 * G, 0.75 * G); c.fillStyle = hexA(C.blue, 0.16); c.fill(); c.strokeStyle = hexA(C.blueSoft, 0.6); c.lineWidth = 2; c.stroke();
  c.fillStyle = hexA(C.ink, 0.85); c.font = `${0.5 * G}px EBold`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CONCERT STAGE', 9 * G, 1.68 * G);
  SHEET_IMG = cv; return cv;
}

// ------------------------------------------------------------------ ink helpers (sheet coords)
function strokePath(ctx, pts, d, width, col, shadow = true) {
  const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0] * G, pts[0][1] * G); let rem = d; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (rem >= L) { ctx.lineTo(pts[i][0] * G, pts[i][1] * G); rem -= L; } else { const p = at(pts, d); ctx.lineTo(p[0] * G, p[1] * G); break; } } };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (shadow) { path(); ctx.save(); ctx.translate(3, 5); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = width; ctx.stroke(); ctx.restore(); }
  path(); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.stroke();
}
function penTip(ctx, p, col = C.blueSoft) {
  const g = ctx.createRadialGradient(p[0] * G, p[1] * G, 0, p[0] * G, p[1] * G, 0.8 * G); g.addColorStop(0, hexA(col, 0.45)); g.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.8 * G, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.blue; ctx.lineWidth = 0.05 * G; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.11 * G, 0, TAU); ctx.fill(); ctx.stroke();
}
function stop(ctx, p, r, age, ring = C.blue) {
  if (age < 0) return;
  const s = age < 0.28 ? 0.6 + 0.4 * ease.outBack(age / 0.28) : 1;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(p[0] * G + 2, p[1] * G + 4, r * G * s, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.strokeStyle = ring; ctx.lineWidth = 0.05 * G; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, r * G * s, 0, TAU); ctx.fill(); ctx.stroke();
  if (age < 0.6) { ctx.strokeStyle = hexA(C.blueSoft, 1 - age / 0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, (0.1 + 0.32 * age / 0.6) * G * 2.2, 0, TAU); ctx.stroke(); }
}
function label(ctx, txt, x, y, size, col = C.ink, align = 'left', font = 'EBold', alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = `${size * G}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineWidth = 0.1 * G; ctx.strokeStyle = hexA(C.bg, 0.92); ctx.strokeText(txt, x * G, y * G);   // paper halo
  ctx.fillStyle = col; ctx.fillText(txt, x * G, y * G); ctx.restore();
}
function token(ctx, p, s, opt = {}) {
  const x = p[0] * G, y = p[1] * G, z = s * G;
  ctx.save(); ctx.globalAlpha = opt.alpha ?? 1;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x - z / 2 + 3, y - z / 2 + 5, z, z, z * 0.2); ctx.fill();
  ctx.fillStyle = opt.you ? C.ink : '#C9D0E2'; roundRect(ctx, x - z / 2, y - z / 2, z, z, z * 0.2); ctx.fill();
  ctx.fillStyle = C.blue; ctx.fillRect(x - z / 2, y + z * 0.06, z, z * 0.16);
  if (opt.you) { ctx.strokeStyle = C.coral; ctx.lineWidth = 0.06 * G; ctx.beginPath(); ctx.arc(x, y, z * 0.95 + 3 * Math.sin((opt.t || 0) * 7), 0, TAU); ctx.stroke(); }
  ctx.restore();
}

// ------------------------------------------------------------------ scene pieces
function drawSignalBars(ctx, t) {
  // printed bars next to YOUR PHONE: all four fully bright whenever "signal: full" is shown
  const lit = clamp(inv(0.15, 0.85, t) * 4, 0, 4);
  const [x, y] = YOU;
  for (let i = 0; i < 4; i++) {
    const bh = (0.3 + i * 0.24) * G;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x * G - 2.75 * G + i * 0.42 * G + 2, y * G - 0.55 * G - bh + 4, 0.3 * G, bh, 4); ctx.fill();
    ctx.fillStyle = lit > i ? C.ink : hexA(C.ink, 0.12); roundRect(ctx, x * G - 2.75 * G + i * 0.42 * G, y * G - 0.55 * G - bh, 0.3 * G, bh, 4); ctx.fill();
  }
  label(ctx, 'signal: full', x - 2.8, y - 0.1, 0.36, C.blueSoft, 'left', 'ESemi', clamp((t - 0.85) / 0.2)); // only once all four bars are lit
}

function drawTower(ctx, t) {
  const [x, y] = TOWER;
  const land = t - (SIGNAL.t0 + SIGNAL.dur);
  if (land < 0) return;
  const s = land < 0.4 ? 1 + 2.4 * (1 - ease.out(land / 0.4)) : 1;            // falls from above, sharpens as it lands
  const w = 3.8 * G * s, h = 1.25 * G * s, off = land < 0.4 ? 18 * (1 - land / 0.4) : 0;
  const busy = env(t, 14.2, 15.0);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x * G - w / 2 + 4 + off, y * G - h / 2 + 7 + off, w, h, h / 2); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x * G - w / 2, y * G - h / 2, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = busy > 0.5 ? C.coral : C.charcoal; ctx.lineWidth = 0.07 * G; ctx.stroke();
  ctx.fillStyle = C.charcoal; ctx.font = `${0.52 * G}px EBold`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CELL TOWER', x * G, y * G + 2);
  if (land < 0.9) { const k = land / 0.9; ctx.strokeStyle = hexA(C.ink, 1 - k); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x * G, y * G, (0.6 + 2.0 * k) * G, 0, TAU); ctx.stroke(); }
}

function drawRack(ctx, t) {
  // shared capacity: a printed rack of 6 slots. Filled = in use, outlined = spare.
  const a = env(t, 8.3, 8.9);
  if (a <= 0) return;
  const { x, y, n, s } = RACK;
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, (x - 0.35) * G, (y - 0.75) * G, (n * s + 0.5) * G, 1.5 * G, 0.3 * G); ctx.fillStyle = 'rgba(8,12,10,0.75)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.55); ctx.lineWidth = 2; ctx.stroke();
  const occ = occupied(t);
  for (let i = 0; i < n; i++) {
    const cx = x + i * s + 0.4, cy = y;
    const reveal = clamp((t - 8.4 - i * 0.08) / 0.25);
    if (reveal <= 0) continue;
    if (i < occ) {
      // in use; once full, slots turn over at the service rate (a served token flashes out, the next drops in)
      const turn = t > 15.2 ? ((t - 15.2) * MU + i * 0.37) % 1 : 1;
      token(ctx, [cx, cy], 0.5, { alpha: reveal * (turn < 0.15 ? turn / 0.15 : 1) });
    } else {
      const glow = t > 8.9 && t < 12.2 ? 0.5 + 0.5 * Math.sin(t * 6 + i) : 0;
      ctx.strokeStyle = hexA(C.blueSoft, 0.6 + 0.4 * glow); ctx.lineWidth = 3; ctx.setLineDash([6, 5]); roundRect(ctx, (cx - 0.25) * G, (cy - 0.25) * G, 0.5 * G, 0.5 * G, 6); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  label(ctx, 'shared capacity', x + (n * s) / 2 - 0.05, y - 1.2, 0.4, C.ink, 'center', 'ESemi');
  const spare = 6 - occ;
  label(ctx, spare > 0 ? `${spare} spare` : 'no spare', x + n * s + 0.35, y, 0.38, spare > 0 ? C.blueSoft : C.coral, 'left', 'EBold', clamp((t - 8.9) / 0.3));
  ctx.restore();
}

function drawQueue(ctx, t) {
  const a = env(t, 13.6, 14.2);
  if (a <= 0) return;
  // hollow siding: two blue edges with a charcoal core (a different line form from the solid signal route)
  strokePath(ctx, QUEUE, QL, 0.34 * G, hexA(C.blueSoft, 0.9 * a));
  strokePath(ctx, QUEUE, QL, 0.2 * G, C.bg, false);
  label(ctx, 'waiting', QUEUE[3][0] - 0.5, QUEUE[3][1] - 0.2, 0.38, C.coral, 'right', 'EBold', a * env(t, 15.0, 15.5) * (1 - env(t, 22.5, 22.9))); // hidden once the camera moves to the legend (would clip at frame edge)
  const n = queueLen(t);
  const crawl = t > 15.2 ? ((t - 15.2) * MU) % 1 : 0;
  const you = t >= YOU_TOKEN.join ? yourIdx(t) : -9;
  for (let i = 0; i < Math.floor(n) + 1; i++) {
    const q = i - crawl;
    if (q < -0.2 || i >= n) continue;
    if (Math.abs(q - you) < 0.55) continue;
    token(ctx, queuePoint(Math.max(0, q)), 0.42, { alpha: clamp(n - i) * clamp(q + 0.2) });
  }
  if (you > -1) { const p = queuePoint(you); token(ctx, p, 0.56, { you: true, t }); }
}

function drawYourToken(ctx, t) {
  // the message: stuck at YOUR PHONE in the hook; later rides the clear signal route fast, then waits at the station
  const [x, y] = YOU;
  if (t < 3.0) {
    const k = clamp((t - 0.6) / 0.3);
    if (k <= 0) return;
    const tryK = (t * 1.6) % 1;
    const p = [x + 0.65 * Math.sin(Math.min(1, tryK * 1.4) * Math.PI) * 0.6, y - 0.05];
    token(ctx, [p[0] + 0.55, y], 0.56, { you: true, t, alpha: k });
    label(ctx, 'sending…', x + 1.2, y - 0.8, 0.36, C.coral, 'left', 'ESemi', k * (0.6 + 0.4 * Math.sin(t * 8)));
    return;
  }
  if (t >= YOU_TOKEN.launch && t < YOU_TOKEN.join) {
    const k = ease.inOut(clamp((t - YOU_TOKEN.launch) / (YOU_TOKEN.arrive - YOU_TOKEN.launch)));
    let p = at(SIGNAL.pts, k * SIGNAL.L);
    if (t > YOU_TOKEN.arrive) p = [lerp(TOWER[0] + 1.6, queuePoint(YOU_TOKEN.idx0)[0], ease.inOut(inv(YOU_TOKEN.arrive, YOU_TOKEN.join, t))), lerp(TOWER[1], queuePoint(YOU_TOKEN.idx0)[1], ease.inOut(inv(YOU_TOKEN.arrive, YOU_TOKEN.join, t)))];
    token(ctx, p, 0.56, { you: true, t });
  }
}

function drawLegend(ctx, t) {
  // printed callout comparing the two quantities (no numbers beyond the rack's own slot count)
  const a = env(t, 22.8, 23.3);
  if (a <= 0) return;
  const x = 0.75, y = 15.35, w = 6.7, h = 3.25;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(ctx, x * G + 6, y * G + 9, w * G, h * G, 0.25 * G); ctx.fill();
  ctx.fillStyle = 'rgba(14,20,18,0.97)'; roundRect(ctx, x * G, y * G, w * G, h * G, 0.25 * G); ctx.fill();
  ctx.fillStyle = C.blue; ctx.fillRect(x * G, y * G, 0.1 * G, h * G * clamp((t - 22.8) / 0.5));
  label(ctx, 'Signal strength', x + 0.4, y + 0.75, 0.42, C.ink, 'left', 'EBold');
  for (let i = 0; i < 4; i++) { const bh = (0.22 + i * 0.16) * G; roundRect(ctx, (x + 4.6 + i * 0.36) * G, (y + 1.0) * G - bh, 0.24 * G, bh, 3); ctx.fillStyle = C.ink; ctx.fill(); }
  label(ctx, 'Spare capacity', x + 0.4, y + 2.15, 0.42, C.ink, 'left', 'EBold', clamp((t - 23.4) / 0.4));
  for (let i = 0; i < 6; i++) { ctx.strokeStyle = hexA(C.coral, clamp((t - 23.5 - i * 0.05) / 0.2)); ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]); roundRect(ctx, (x + 4.25 + i * 0.37) * G, (y + 1.97) * G, 0.28 * G, 0.36 * G, 4); ctx.stroke(); ctx.setLineDash([]); }
  label(ctx, 'none', x + 4.25, y + 2.75, 0.32, C.coral, 'left', 'ESemi', clamp((t - 23.8) / 0.3));
  ctx.restore();
}

function drawWalk(ctx, r, t, col) {
  // walking transfer through the street: ink dots between stations (style §3), drawn by a moving tip
  const k = clamp((t - r.t0) / r.dur);
  if (k <= 0) return;
  const d = ease.inOut(k) * r.L;
  for (let s = 0; s <= d; s += 0.16) { const p = at(r.pts, s); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.055 * G, 0, TAU); ctx.fill(); }
  if (k < 1) penTip(ctx, at(r.pts, d), C.ink);
}

function drawMeeting(ctx, t) {
  if (t < 25.7) return;
  const age = t - 25.7;
  stop(ctx, FRIEND, 0.2, age);
  label(ctx, 'FRIEND', FRIEND[0] - 0.4, FRIEND[1] - 0.75, 0.46, C.ink, 'right', 'EBold', clamp(age / 0.3));
  drawWalk(ctx, WALK_YOU, t, C.ink); drawWalk(ctx, WALK_FRIEND, t, C.ink);
  const ma = t - 27.3;
  if (ma > 0) {
    const s = ma < 0.3 ? 0.6 + 0.4 * ease.outBack(ma / 0.3) : 1;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(MEET[0] * G + 3, MEET[1] * G + 5, 0.34 * G * s, 0, TAU); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(MEET[0] * G, MEET[1] * G, 0.34 * G * s, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.charcoal; ctx.lineWidth = 0.08 * G; ctx.stroke();
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(MEET[0] * G, MEET[1] * G, 0.13 * G * s, 0, TAU); ctx.fill();
    label(ctx, 'agreed meeting spot', MEET[0], MEET[1] + 0.85, 0.44, C.ink, 'center', 'EBold', clamp(ma / 0.35));
  }
}

function drawCartouche(ctx, t) {
  // the film's title is printed on the map (style §4), bottom-left of the sheet
  const a = 1;
  ctx.fillStyle = C.blue; ctx.fillRect(0.7 * G, 25.25 * G, 0.1 * G, 1.1 * G);
  label(ctx, 'Why full bars can', 1.0, 25.55, 0.42, C.ink, 'left', 'EBold', a);
  label(ctx, 'still mean slow data', 1.0, 26.1, 0.42, C.ink, 'left', 'EBold', a);
}

// ------------------------------------------------------------------ captions (screen space; ink inside y 350–470)
export const CAPTION_LAYOUT = { size: 52, base1: 398, base2: 458, maxW: 920 };
function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b) continue;
    const a = clamp((t - c.a) / 0.16) * (1 - clamp((t - (c.b - 0.14)) / 0.14));
    ctx.save(); ctx.globalAlpha = a; ctx.font = `${CAPTION_LAYOUT.size}px EBold`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const w = Math.max(...c.l.map(s => ctx.measureText(s).width)) + 64;
    roundRect(ctx, 540 - w / 2, 334, w, c.l.length > 1 ? 152 : 92, 22); ctx.fillStyle = 'rgba(8,12,10,0.86)'; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.ink;
    if (c.l.length === 1) ctx.fillText(c.l[0], 540, 398); else { ctx.fillText(c.l[0], 540, CAPTION_LAYOUT.base1); ctx.fillText(c.l[1], 540, CAPTION_LAYOUT.base2); }
    ctx.restore();
  }
}

// ------------------------------------------------------------------ frame
export function drawFrame(ctx, t, assets) {
  const cm = cam(t);
  const sc = cm.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);           // table
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  // sheet with contact shadow
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  drawCartouche(ctx, t);
  // crowd routes (thinner, deeper blue) then the strong signal route on top
  for (const r of CROWD) {
    const k = ease.inOut(clamp((t - r.t0) / r.dur)); if (k <= 0) continue;
    strokePath(ctx, r.pts, k * r.L, 0.13 * G, '#2C45C4');
    stop(ctx, r.pts[0], 0.13, t - r.t0);
    if (k < 1) penTip(ctx, at(r.pts, k * r.L));
  }
  drawQueue(ctx, t);
  const sk = ease.inOut(clamp((t - SIGNAL.t0) / SIGNAL.dur));
  if (sk > 0) {
    // "clear road": a light pulse runs freely along it once complete
    strokePath(ctx, SIGNAL.pts, sk * SIGNAL.L, 0.26 * G, C.blue);
    if (sk < 1) penTip(ctx, at(SIGNAL.pts, sk * SIGNAL.L));
    else for (let i = 0; i < 3; i++) { const u = ((t * 0.45 + i / 3) % 1); const p = at(SIGNAL.pts, u * SIGNAL.L); ctx.fillStyle = hexA(C.ink, 0.75 * (1 - u)); ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.11 * G, 0, TAU); ctx.fill(); }
    label(ctx, 'radio signal', 5.45, 20.6, 0.42, C.blueSoft, 'left', 'EBold', env(t, 4.6, 5.1));
    label(ctx, 'clear road', 5.45, 21.3, 0.42, C.ink, 'left', 'EBold', env(t, 17.6, 18.0));
  }
  drawTower(ctx, t);
  drawRack(ctx, t);
  label(ctx, 'crowded station', 11.15, 10.95, 0.42, C.coral, 'left', 'EBold', env(t, 18.6, 19.0) * (1 - env(t, 22.6, 23.0)));
  stop(ctx, YOU, 0.22, t - 0.05);
  label(ctx, 'YOUR PHONE', YOU[0] + 0.45, YOU[1] + 0.85, 0.5, C.ink, 'left', 'EBold');
  drawSignalBars(ctx, t);
  drawYourToken(ctx, t);
  drawLegend(ctx, t);
  const veil = 0.62 * env(t, 25.7, 26.3) * (1 - env(t, 29.3, 29.75));   // paper veil: the offline plan leads
  if (veil > 0) { ctx.fillStyle = hexA(C.bg, veil); ctx.fillRect(0, 0, SHEET.w * G, SHEET.h * G); }
  drawMeeting(ctx, t);
  // grade: light vignette
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1060, 560, 540, 1060, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // safe-area grade: keep the platform-overlay zones (top 0–300, bottom ~1650+) visually clear in every shot
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bgd = ctx.createLinearGradient(0, 1640, 0, 1920); bgd.addColorStop(0, 'rgba(8,11,10,0)'); bgd.addColorStop(1, 'rgba(8,11,10,0.85)'); ctx.fillStyle = bgd; ctx.fillRect(0, 1640, W, 280);
  drawCaptions(ctx, t);
  // small, always-in-frame notes (bottom-left label, subtle signature bottom-right from 28.6 s)
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '24px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not real network data', 48, 1858);
  if (assets.icon) { const a = env(t, 28.6, 29.2) * 0.62; if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 806, 1824, 38, 38, 9); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 806, 1824, 38, 38); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '26px ESemi'; ctx.fillText('Meshline', 852, 1852); ctx.restore(); } }
}

// ------------------------------------------------------------------ cue sheet (same timebase)
export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  [0.25, 0.4, 0.55, 0.7].forEach((t, i) => add(t, 'bar', 0.5, { step: i }));
  [0.6, 1.25, 1.9, 2.55].forEach(t => add(t, 'retry', 0.4));
  add(SIGNAL.t0, 'pen', 0.7, { dur: SIGNAL.dur });
  add(SIGNAL.t0 + SIGNAL.dur, 'land', 0.9);
  add(8.4, 'chime', 0.6);
  for (let i = 0; i < 6; i++) add(8.4 + i * 0.08, 'slot', 0.25);
  CROWD.forEach(r => { add(r.t0, 'penShort', 0.22, { dur: r.dur }); add(r.t0 + r.dur, 'stop', 0.22); });
  for (let t = 15.2; t < 29.5; t += 1 / MU) add(t, 'turn', 0.18);
  add(YOU_TOKEN.launch, 'zip', 0.6); add(YOU_TOKEN.arrive, 'stop', 0.5); add(YOU_TOKEN.join, 'thunk', 0.4);
  add(22.8, 'callout', 0.5);
  add(WALK_YOU.t0, 'dots', 0.35, { dur: WALK_YOU.dur }); add(WALK_FRIEND.t0, 'dots', 0.3, { dur: WALK_FRIEND.dur });
  add(27.3, 'chime', 0.7);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
