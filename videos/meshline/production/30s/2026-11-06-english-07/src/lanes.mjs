// Meshline production 30s, batch 2026-11-06-english-07: "Upload vs download: why sending a video takes longer".
// Same Transit-Map world as english-06 / round-02 (charcoal printed sheet, electric-blue ink, white stations, pen tips, paper
// veils, Inter labels, screen-space caption plate + one screen-space instrument). The map: an INTERNET zone and YOUR PHONE
// joined by a wide five-track DOWNLOAD bundle and a single-track UPLOAD line (5:1, like the FCC 100/20 benchmark). Video tiles
// race both ways; the instrument shows two progress bars on a labelled sped-up clock (8 s vs 40 s for 100 MB). Generic
// connection behaviour only; no Meshline speed, range or relay claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000;

// ------------------------------------------------------------------ map (G units, octilinear routes)
const PHONE = [9.0, 21.6], NET = { x0: 5.2, y0: 9.4, x1: 12.8, y1: 11.8 };
const DOWN_X = [6.2, 6.5, 6.8, 7.1, 7.4];                                   // five parallel download tracks
const downTrack = x => [[x, NET.y1], [x, 21.0 - (8.6 - x)], [8.6, 21.0]];   // five vertical tracks merging at 45° into the phone
const UP = [[9.45, 20.95], [11.2, 19.2], [11.2, NET.y1]];               // single upload track (phone → internet)
const T = {
  hookDown: [0.2, 1.2], hookUp: [1.3, 4.1],
  wide: 5.5, narrow: 6.9, plaque: 8.4, down100: 10.5, up20: 12.1,
  race: [14.2, 18.6], resetBars: 13.6,
  text: [19.6, 20.5], check: 22.0, cta: 26.14,
};
const SIM = t => clamp((t - T.race[0]) / (T.race[1] - T.race[0])) * 40;      // simulated seconds (sped-up clock)
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const LU = len(UP);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const WIDE = { x: 9.0, y: 16.4, z: 1.0 };
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 16.3, z: 1.02 }], [4.0, { x: 9.0, y: 16.4, z: 1.04 }],
    [5.0, { x: 7.8, y: 16.0, z: 1.12 }], [6.5, { x: 7.8, y: 16.0, z: 1.13 }],          // the wide lane down
    [7.3, { x: 10.2, y: 16.0, z: 1.12 }], [8.2, { x: 10.2, y: 16.0, z: 1.13 }],        // the narrow lane up
    [9.0, WIDE], [13.2, { x: 9.0, y: 16.4, z: 1.02 }],
    [14.0, { x: 9.0, y: 16.6, z: 1.06 }], [18.7, { x: 9.0, y: 16.6, z: 1.08 }],        // the race
    [19.4, { x: 10.0, y: 16.2, z: 1.12 }], [21.3, { x: 10.0, y: 16.2, z: 1.13 }],      // a tiny text slips up
    [22.1, WIDE], [26.0, { x: 9.0, y: 16.5, z: 1.02 }], [30, { x: 9.0, y: 16.7, z: 1.07 }],
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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / english-06)
function strokePath(ctx, pts, d, width, col, shadow = true, dash = null) {
  const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0] * G, pts[0][1] * G); let rem = d; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (rem >= L) { ctx.lineTo(pts[i][0] * G, pts[i][1] * G); rem -= L; } else { const p = at(pts, d); ctx.lineTo(p[0] * G, p[1] * G); break; } } };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  if (shadow) { path(); ctx.save(); ctx.translate(3, 5); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = width; ctx.stroke(); ctx.restore(); }
  path(); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.stroke(); ctx.setLineDash([]);
}
function label(ctx, txt, x, y, size, col = C.ink, align = 'left', font = 'EBold', alpha = 1) {
  if (alpha <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${size * G}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineWidth = 0.1 * G; ctx.strokeStyle = hexA(C.bg, 0.92); ctx.strokeText(txt, x * G, y * G); ctx.fillStyle = col; ctx.fillText(txt, x * G, y * G); ctx.restore();
}
function ring(ctx, p, age, col = C.blueSoft, maxR = 0.6) { if (age < 0 || age > 0.6) return; ctx.strokeStyle = hexA(col, 1 - age / 0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, (0.2 + maxR * age / 0.6) * G, 0, TAU); ctx.stroke(); }
function arrow(ctx, x, y, s, dir, col) {                                  // ▼ / ▲ drawn as a path (dir +1 = down)
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - s, y - dir * s * 0.6); ctx.lineTo(x + s, y - dir * s * 0.6); ctx.lineTo(x, y + dir * s * 0.8); ctx.closePath(); ctx.fill();
}
function check(ctx, x, y, s, col, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.45, y); ctx.lineTo(x - s * 0.1, y + s * 0.35); ctx.lineTo(x + s * 0.5, y - s * 0.35); ctx.stroke(); ctx.restore();
}
function tile(ctx, p, s = 0.42, a = 1) {                                  // a printed video tile (film frame with sprocket holes)
  if (a <= 0) return; const x = p[0] * G, y = p[1] * G, w = s * G, h = s * 0.8 * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 4, w, h, 3); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 3); ctx.fill();
  ctx.fillStyle = C.blue; ctx.fillRect(x - w / 2 + w * 0.2, y - h / 2 + h * 0.22, w * 0.6, h * 0.56);
  ctx.fillStyle = C.charcoal; for (let i = 0; i < 3; i++) { ctx.fillRect(x - w / 2 + w * 0.06, y - h / 2 + h * (0.15 + i * 0.28), w * 0.08, h * 0.12); ctx.fillRect(x + w / 2 - w * 0.14, y - h / 2 + h * (0.15 + i * 0.28), w * 0.08, h * 0.12); }
  ctx.restore();
}
function envelope(ctx, p, s = 0.62, alpha = 1, col = C.ink) {
  const x = p[0] * G, y = p[1] * G, w = s * G, h = s * 0.68 * G;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, -w / 2 + 3, -h / 2 + 5, w, h, 4); ctx.fill();
  ctx.fillStyle = col; roundRect(ctx, -w / 2, -h / 2, w, h, 4); ctx.fill();
  ctx.strokeStyle = C.blue; ctx.lineWidth = Math.max(2, w * 0.07); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-w / 2 + 3, -h / 2 + 3); ctx.lineTo(0, h * 0.08); ctx.lineTo(w / 2 - 3, -h / 2 + 3); ctx.stroke();
  ctx.restore();
}
function phone(ctx, p, lit = 0, s = 1) {
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  const l = Math.max(lit, 0.3); ctx.fillStyle = hexA(C.blue, 0.85 * l); roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
}

// ------------------------------------------------------------------ beats
function drawNet(ctx, t) {
  ctx.fillStyle = hexA(C.blue, 0.08); roundRect(ctx, NET.x0 * G, NET.y0 * G, (NET.x1 - NET.x0) * G, (NET.y1 - NET.y0) * G, 0.5 * G); ctx.fill();
  ctx.strokeStyle = hexA(C.blueSoft, 0.55); ctx.lineWidth = 2.5; ctx.setLineDash([4, 10]); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, 'internet', (NET.x0 + NET.x1) / 2, (NET.y0 + NET.y1) / 2, 0.6, C.ink, 'center', 'EBold', 1);
}
function drawLanes(ctx, t) {
  const wideHl = env(t, T.wide, T.wide + 0.3) * (1 - env(t, 8.4, 8.9)), narHl = env(t, T.narrow, T.narrow + 0.3) * (1 - env(t, 8.4, 8.9));
  const chk = env(t, T.check, T.check + 0.3) * (1 - env(t, 25.6, 26.1));
  for (const x of DOWN_X) { const tr = downTrack(x); if (wideHl > 0) strokePath(ctx, tr, len(tr), 0.34 * G, hexA(C.blueSoft, 0.18 * wideHl), false); strokePath(ctx, tr, len(tr), 0.16 * G, C.blue, x === DOWN_X[0]); }
  if (narHl + chk > 0) strokePath(ctx, UP, LU, 0.42 * G, hexA(chk > 0.2 ? C.coral : C.blueSoft, 0.22 * Math.max(narHl, chk)), false);
  strokePath(ctx, UP, LU, 0.16 * G, C.blueSoft);
  // lane names, then the benchmark numbers (FCC 2024 fixed broadband: 100/20 Mbps)
  label(ctx, 'download', 5.95, 15.4, 0.46, C.ink, 'right', 'EBold', 1);
  label(ctx, 'wide', 5.95, 16.05, 0.4, C.blueSoft, 'right', 'EBold', wideHl);
  label(ctx, 'upload', 11.5, 15.4, 0.46, C.ink, 'left', 'EBold', 1);
  label(ctx, 'narrow', 11.5, 16.05, 0.4, C.blueSoft, 'left', 'EBold', narHl);
  label(ctx, '100 Mbps', 5.95, 16.75, 0.5, C.blueSoft, 'right', 'EBold', env(t, T.down100, T.down100 + 0.3));
  label(ctx, '20 Mbps', 11.5, 16.75, 0.5, C.blueSoft, 'left', 'EBold', env(t, T.up20, T.up20 + 0.3));
  label(ctx, 'check this lane', 11.5, 17.55, 0.44, C.coral, 'left', 'EBold', chk);
}
function drawPlaque(ctx, t) {                                              // printed reference plaque, between the two lanes
  const a = env(t, T.plaque, T.plaque + 0.4) * (1 - env(t, 13.0, 13.5)); if (a <= 0) return;
  const x = 7.75, y = 12.55, w = 3.1, h = 1.55;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(ctx, x * G + 5, y * G + 7, w * G, h * G, 0.2 * G); ctx.fill();
  ctx.fillStyle = 'rgba(14,20,18,0.97)'; roundRect(ctx, x * G, y * G, w * G, h * G, 0.2 * G); ctx.fill();
  ctx.fillStyle = C.blue; ctx.fillRect(x * G, y * G, 0.1 * G, h * G);
  ctx.restore();
  label(ctx, 'US benchmark', x + 0.3, y + 0.5, 0.4, C.ink, 'left', 'EBold', a);
  label(ctx, 'FCC · 2024', x + 0.3, y + 1.08, 0.32, '#B5BDB8', 'left', 'ESemi', a);
}
function drawTraffic(ctx, t) {
  const queue = (n, a) => { for (let i = 0; i < n; i++) tile(ctx, [10.1 + (i % 3) * 0.48, 21.35 + Math.floor(i / 3) * 0.42], 0.36, a); };
  // hook: a downloaded video pours down the wide bundle; the upload of the same video crawls up the single lane
  if (t > T.hookDown[0] && t < T.hookDown[1] + 0.3) for (const [i, x] of DOWN_X.entries()) for (let j = 0; j < 2; j++) {
    const q = inv(T.hookDown[0] + j * 0.25 + i * 0.03, T.hookDown[0] + 0.6 + j * 0.25 + i * 0.03, t), tr = downTrack(x);
    if (q > 0 && q < 1) tile(ctx, at(tr, len(tr) * ease.in(q)), 0.36);
  }
  if (t > T.hookUp[0] && t < T.resetBars) {                                // upload queue waiting at the phone
    const sent = Math.floor(clamp((t - T.hookUp[0]) / 9) * 4), a = 1 - clamp((t - T.resetBars + 0.3) / 0.3);
    queue(Math.max(0, 6 - sent), a);
    const q = ((t - T.hookUp[0]) / 2.3) % 1; tile(ctx, at(UP, LU * q), 0.36, a * Math.min(1, q / 0.1, (1 - q) / 0.1));
    label(ctx, 'sending…', 11.55, 21.3, 0.4, C.coral, 'left', 'EBold', a * env(t, 2.1, 2.5));
  }
  // the race (100 MB): ten tiles each way; download finishes at 8 simulated s, upload at 40
  if (t > T.race[0] - 0.3 && t < 21.0) {
    const s = SIM(t), a = env(t, T.race[0] - 0.3, T.race[0]) * (1 - env(t, 20.4, 21.0));
    for (let k = 0; k < 10; k++) {                                          // download: tiles leave in two waves, five abreast
      const t0 = (k < 5 ? 0 : 3.2) + (k % 5) * 0.2, q = clamp((s - t0) / 4.4), tr = downTrack(DOWN_X[k % 5]);
      if (q > 0 && q < 1) tile(ctx, at(tr, len(tr) * q), 0.36, a);
    }
    let waiting = 0;
    for (let k = 0; k < 10; k++) {                                          // upload: single file, one tile every 3.9 simulated s
      const q = clamp((s - k * 3.9) / 4.4);
      if (q <= 0) waiting++; else if (q < 1) tile(ctx, at(UP, LU * q), 0.36, a);
    }
    queue(waiting, a);
  }
  if (t > 21.6) {
    const a2 = env(t, 21.6, 22.2);
    for (const [i, x] of DOWN_X.entries()) { const tr = downTrack(x), q = ((t - 21.6) / 1.1 + i * 0.13) % 1; tile(ctx, at(tr, len(tr) * q), 0.32, a2 * Math.min(1, q / 0.1, (1 - q) / 0.1)); }
    const q = ((t - 21.6) / 3.2) % 1; tile(ctx, at(UP, LU * q), 0.32, a2 * Math.min(1, q / 0.1, (1 - q) / 0.1));
  }
  // a tiny text slips up the narrow lane
  if (t > T.text[0] - 0.1 && t < T.text[1] + 0.3) { const q = ease.inOut(inv(...T.text, t)); envelope(ctx, at(UP, LU * q), 0.44, 1 - clamp((t - T.text[1]) / 0.3)); }
  label(ctx, 'text: tiny', 11.75, 19.0, 0.44, C.ink, 'left', 'EBold', env(t, T.text[0], T.text[0] + 0.3) * (1 - env(t, 21.4, 21.8)));
  ring(ctx, [11.2, NET.y1], t - T.text[1], C.blueSoft, 0.8);
  // phone
  phone(ctx, PHONE, clamp(1 - Math.abs(t - T.hookDown[1]) / 0.5), 1.15);
  label(ctx, 'your phone', PHONE[0], PHONE[1] + 1.1, 0.44, C.ink, 'center', 'EBold', 1);
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(13.3 * G, 9.5 * G, 0.1 * G, 1.25 * G); ctx.restore();
  label(ctx, 'Down vs up', 13.6, 9.85, 0.48, C.ink, 'left', 'EBold', a);
  label(ctx, 'two lanes', 13.6, 10.45, 0.36, '#B5BDB8', 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument: two progress bars on a sped-up clock
function drawInstrument(ctx, t) {
  const a = env(t, 0.1, 0.4) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  const rows = [1462, 1530], X0 = 330, X1 = 800;
  const speed = env(t, T.check - 0.2, T.check + 0.2);                     // the takeaway swaps bars for a speed-test readout
  const bars = 1 - speed;
  // progress values
  let pd, pu, td = '', tu = '';
  if (t < T.resetBars) { pd = ease.out(inv(...T.hookDown, t)); pu = 0.12 * inv(T.hookUp[0], 13.0, t) + 0.06 * inv(T.hookUp[0], T.hookUp[1], t); td = pd >= 1 ? 'done' : ''; tu = t > T.hookUp[0] ? 'sending…' : ''; }
  else { const s = SIM(t); pd = clamp(s / 8); pu = clamp(s / 40); td = `${Math.min(8, s).toFixed(0)} s`; tu = `${s.toFixed(0)} s`; if (t < T.race[0]) { td = ''; tu = ''; } }
  const reset = env(t, T.resetBars - 0.3, T.resetBars) * (1 - env(t, T.resetBars, T.resetBars + 0.3));
  ctx.save(); ctx.globalAlpha *= bars * (1 - reset);
  [['download', pd, td, 1], ['upload', pu, tu, -1]].forEach(([name, p, txt, dir], i) => {
    const y = rows[i]; arrow(ctx, 136, y, 10, dir, dir > 0 ? C.blue : C.blueSoft);
    ctx.fillStyle = C.ink; ctx.font = '26px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(name, 158, y);
    roundRect(ctx, X0, y - 11, X1 - X0, 22, 11); ctx.fillStyle = '#26302C'; ctx.fill();
    if (p > 0) { roundRect(ctx, X0, y - 11, Math.max(22, (X1 - X0) * p), 22, 11); ctx.fillStyle = dir > 0 ? C.blue : (t < T.resetBars ? C.coral : C.blueSoft); ctx.fill(); }
    ctx.fillStyle = dir < 0 && t < T.resetBars ? C.coral : C.ink; ctx.font = '26px EBold'; ctx.fillText(txt, X1 + 22, y);
    if (dir > 0 && p >= 1) check(ctx, X1 + (txt === 'done' ? 104 : 82), y, 22, C.blueSoft);
  });
  if (t > T.race[0] - 0.2 && t < T.check) { ctx.fillStyle = hexA(C.ink, 0.55); ctx.font = '20px ESemi'; ctx.textAlign = 'right'; ctx.fillText('100 MB video · clock sped up', 966, 1436); }
  ctx.restore();
  // speed-test readout (takeaway): check the upload number, not just the download number
  if (speed > 0) {
    ctx.save(); ctx.globalAlpha *= speed;
    ctx.fillStyle = hexA(C.ink, 0.6); ctx.font = '22px ESemi'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('speed test reports both', 128, 1440);
    [['download', '100', 1], ['upload', '20', -1]].forEach(([name, v, dir], i) => {
      const x = 150 + i * 420, y = 1508;
      if (dir < 0) { roundRect(ctx, x - 32, y - 46, 372, 92, 18); ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.stroke(); }
      arrow(ctx, x, y, 12, dir, dir > 0 ? C.blue : C.blueSoft);
      ctx.fillStyle = C.ink; ctx.font = '26px EBold'; ctx.textAlign = 'left'; ctx.fillText(name, x + 24, y - 18);
      ctx.font = '40px EDisplay'; ctx.fillText(v, x + 24, y + 20); ctx.font = '24px ESemi'; ctx.fillStyle = hexA(C.ink, 0.7); ctx.fillText('Mbps', x + 24 + (v.length * 26) + 12, y + 24);
    });
    ctx.restore();
  }
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
  drawCartouche(ctx, 1 - env(t, 3.8, 4.3));
  drawNet(ctx, t);
  drawLanes(ctx, t);
  drawPlaque(ctx, t);
  drawTraffic(ctx, t);
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
  add(T.hookDown[0], 'zip', 0.3); add(T.hookDown[1], 'chime', 0.3); add(T.hookUp[0], 'retry', 0.24);
  for (let t = T.hookUp[0] + 0.4; t < 4.0; t += 0.5) add(t, 'tick', 0.13);
  add(T.wide, 'sweep', 0.22, { dur: 0.7 }); add(T.narrow, 'turn', 0.3);
  add(T.plaque, 'callout', 0.26); add(T.down100, 'stamp', 0.28); add(T.up20, 'stamp', 0.28);
  add(T.race[0], 'zip', 0.26); add(T.race[0] + 0.88, 'chime', 0.3);
  for (let k = 0; k < 10; k++) add(T.race[0] + (k * 3.9 + 4.4) / 40 * 4.4 - 0.05, 'turn', 0.18);
  add(T.text[0], 'zip', 0.24); add(T.text[1], 'stop', 0.28);
  add(T.check, 'callout', 0.26); add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev.filter(e => e.t < 29.5) };
}
