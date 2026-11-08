// Meshline production 30s, batch 2026-11-07-english-08: "Latency vs bandwidth: why a video call still lags".
// Same Transit-Map world as english-06/07 (charcoal printed sheet, electric-blue ink, white stations, pen tips, paper veils,
// Inter labels, screen-space caption plate + one screen-space instrument). The map: YOU and a FRIEND joined by two routes of
// the SAME width (five tracks, "100 Mbps" each): a short ground fibre route and a long hop via a high satellite. Packets
// travel five abreast on both (bandwidth); one ping token per route shows the trip time (latency). Figures from ITU-T G.114
// (fibre 5 µs/km → 2,000 km ≈ 10 ms; 36,000 km satellite ≈ 260 ms one way; 150 ms for transparent interactivity).
// Generic network behaviour only; no Meshline speed, range or relay claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000;

// ------------------------------------------------------------------ map (G units, octilinear routes)
const YOU = [3.6, 21.6], FRIEND = [14.4, 21.6], SAT = [9.0, 10.2];
const GROUND = [[4.25, 21.6], [13.75, 21.6]];
const SKY = [[3.6, 20.85], [3.6, 15.6], [8.2, 11.0], [9.8, 11.0], [14.4, 15.6], [14.4, 20.85]];
const OFF = [-0.44, -0.22, 0, 0.22, 0.44];                                 // five tracks = the same "width" on both routes
const T = {
  msg: [0.35, 0.95], call: [1.8, 3.8],
  flow: [4.6, 8.4], plates: 5.3,
  ping: 8.9, pingG: 0.55, pingS: 6.7, stamp: 13.0, quarter: 14.6, pipe: 16.1,
  meter: 17.7, line150: 18.6, overlap: 20.4, cards: 23.0, pingHl: 23.5, cta: 26.14,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
function offsetPath(pts, d) {                                              // parallel track with mitred joins
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const n1 = i > 0 ? norm([p[1] - a[1], -(p[0] - a[0])]) : null, n2 = i < pts.length - 1 ? norm([b[1] - p[1], -(b[0] - p[0])]) : null;
    if (!n1) return [p[0] + n2[0] * d, p[1] + n2[1] * d];
    if (!n2) return [p[0] + n1[0] * d, p[1] + n1[1] * d];
    const m = norm([n1[0] + n2[0], n1[1] + n2[1]]), c = m[0] * n1[0] + m[1] * n1[1];
    return [p[0] + m[0] * d / c, p[1] + m[1] * d / c];
  });
}
function norm(v) { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
const SKY_T = OFF.map(o => offsetPath(SKY, o)), GND_T = OFF.map(o => offsetPath(GROUND, o));
const LS = len(SKY), LG = len(GROUND);
const pingPos = (route, L, t0, dur, t) => at(route, L * ease.inOut(clamp((t - t0) / dur)));

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const WIDE = { x: 9.0, y: 16.4, z: 0.95 };
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 17.2, z: 1.0 }], [3.9, { x: 9.0, y: 17.1, z: 1.02 }],
    [4.8, WIDE], [8.3, { x: 9.0, y: 16.4, z: 0.96 }],
    [9.2, { x: 9.0, y: 17.6, z: 1.05 }], [11.6, { x: 9.0, y: 17.6, z: 1.06 }],        // the ground ping arrives
    [12.6, { x: 9.0, y: 14.6, z: 1.05 }], [16.0, { x: 9.0, y: 14.7, z: 1.06 }],        // up to the satellite (ground row tucks under the instrument)
    [17.4, WIDE], [26.0, { x: 9.0, y: 16.5, z: 0.97 }], [30, { x: 9.0, y: 16.7, z: 1.02 }],
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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / english-06/07)
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
function check(ctx, x, y, s, col, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.45, y); ctx.lineTo(x - s * 0.1, y + s * 0.35); ctx.lineTo(x + s * 0.5, y - s * 0.35); ctx.stroke(); ctx.restore();
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
function bubble(ctx, p, s, col, a = 1) {                                   // speech-bubble token (a moment of the call)
  if (a <= 0) return; const x = p[0] * G, y = p[1] * G, w = s * G, h = s * 0.7 * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 5, w, h, h / 2); ctx.fill();
  ctx.fillStyle = col; roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - w * 0.2, y + h / 2 - 2); ctx.lineTo(x - w * 0.32, y + h / 2 + h * 0.35); ctx.lineTo(x - w * 0.02, y + h / 2 - 2); ctx.fill();
  ctx.fillStyle = C.charcoal; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(x + i * w * 0.2, y, h * 0.09, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function phone(ctx, p, lit = 0, s = 1) {
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  const l = Math.max(lit, 0.3); ctx.fillStyle = hexA(C.blue, 0.85 * l); roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
}
function satellite(ctx, p, k, glow = 0) {                                  // printed satellite (same glyph as Hindi batch 04)
  if (k <= 0) return; const x = p[0] * G, y = p[1] * G;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.35);
  if (glow > 0) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1.1 * G); g.addColorStop(0, hexA(C.blueSoft, 0.35 * glow)); g.addColorStop(1, hexA(C.blueSoft, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1.1 * G, 0, TAU); ctx.fill(); }
  for (const sx of [-1, 1]) {
    const px = sx * 0.32 * G - (sx < 0 ? 0.62 * G : 0);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(px + 3, -0.2 * G + 5, 0.62 * G, 0.4 * G);
    ctx.fillStyle = C.blue; ctx.fillRect(px, -0.2 * G, 0.62 * G, 0.4 * G);
    ctx.strokeStyle = hexA(C.ink, 0.6); ctx.lineWidth = 1.5; for (let i = 1; i < 3; i++) { const gx = px + i * 0.62 * G / 3; ctx.beginPath(); ctx.moveTo(gx, -0.2 * G); ctx.lineTo(gx, 0.2 * G); ctx.stroke(); }
  }
  ctx.fillStyle = C.ink; roundRect(ctx, -0.26 * G, -0.3 * G, 0.52 * G, 0.6 * G, 0.08 * G); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.06 * G; ctx.beginPath(); ctx.arc(0, 0.5 * G, 0.18 * G, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ beats
function drawRoutes(ctx, t) {
  const pipeHl = env(t, T.pipe, T.pipe + 0.3) * (1 - env(t, 17.6, 18.1));
  const flowHl = env(t, T.flow[0], T.flow[0] + 0.3) * (1 - env(t, T.flow[1], T.flow[1] + 0.4));
  [...SKY_T.map(p => [p, LS]), ...GND_T.map(p => [p, LG])].forEach(([p, L], i) => {
    const sky = i < 5; if ((sky && pipeHl > 0) || flowHl > 0) strokePath(ctx, p, len(p), 0.3 * G, hexA(C.blueSoft, 0.16 * Math.max(sky ? pipeHl : 0, flowHl)), false);
    strokePath(ctx, p, len(p), 0.12 * G, C.blue, i === 0 || i === 5);
  });
  satellite(ctx, SAT, 1, env(t, T.stamp, T.stamp + 0.3) * (1 - env(t, 17.4, 17.9)));
  // labels: the same speed on both routes, very different distance
  const pl = env(t, T.plates, T.plates + 0.3);
  label(ctx, 'ground fibre · 2,000 km', 9.0, 22.75, 0.42, C.ink, 'center', 'EBold', 1);
  label(ctx, 'via high satellite', 9.0, 9.0, 0.44, C.ink, 'center', 'EBold', TOPV);
  label(ctx, '100 Mbps', 9.0, 20.85, 0.46, C.blueSoft, 'center', 'EBold', pl);
  label(ctx, '100 Mbps', 4.35, 17.6, 0.46, C.blueSoft, 'left', 'EBold', pl);
  label(ctx, 'same speed number', 9.0, 15.0, 0.44, C.blueSoft, 'center', 'EBold', pl * (1 - env(t, 8.4, 8.8)));
  label(ctx, '36,000 km up', 10.55, 10.2, 0.42, C.ink, 'left', 'EBold', env(t, T.stamp, T.stamp + 0.3) * TOPV2);
  label(ctx, '≈ 260 ms each way', 9.0, 13.5, 0.48, C.coral, 'center', 'EBold', env(t, T.quarter, T.quarter + 0.3) * (1 - env(t, 17.4, 17.9)));
  label(ctx, 'width ≠ delay', 9.0, 14.3, 0.42, C.blueSoft, 'center', 'EBold', pipeHl);
}
function drawTraffic(ctx, t) {
  // hook: a text lands instantly (ground), while the call's speech crawls the long satellite route
  if (t > T.msg[0] && t < T.msg[1] + 0.2) envelope(ctx, at(GROUND, LG * ease.inOut(inv(...T.msg, t))), 0.55, 1 - clamp((t - T.msg[1]) / 0.2));
  ring(ctx, FRIEND, t - T.msg[1], C.blueSoft, 0.9);
  label(ctx, 'text: delivered', FRIEND[0], FRIEND[1] - 1.05, 0.4, C.ink, 'center', 'EBold', env(t, T.msg[1], T.msg[1] + 0.2) * (1 - env(t, 3.4, 3.8)));
  if (t > T.call[0] - 0.3 && t < 4.4) { const q = inv(T.call[0], T.call[0] + 3.4, t); bubble(ctx, at(SKY, LS * q), 0.6, C.ink, env(t, T.call[0] - 0.3, T.call[0]) * (1 - env(t, 4.0, 4.4))); }
  label(ctx, 'call audio: still travelling', 9.0, 15.0, 0.42, C.coral, 'center', 'EBold', env(t, 2.4, 2.8) * (1 - env(t, 4.0, 4.4)));
  // bandwidth: packets travel together, five abreast, on both routes
  if (t > T.flow[0] - 0.2 && t < T.flow[1] + 0.4) {
    const a = env(t, T.flow[0] - 0.2, T.flow[0] + 0.2) * (1 - env(t, T.flow[1], T.flow[1] + 0.4));
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
      const qg = ((t - T.flow[0]) / 1.6 + j / 3) % 1, qs = ((t - T.flow[0]) / 4.0 + j / 3) % 1;
      const pg = at(GND_T[i], LG * qg), ps = at(SKY_T[i], LS * qs);
      ctx.fillStyle = hexA(C.ink, a * Math.min(1, qg / 0.08, (1 - qg) / 0.08)); ctx.fillRect(pg[0] * G - 6, pg[1] * G - 6, 12, 12);
      ctx.fillStyle = hexA(C.ink, a * Math.min(1, qs / 0.05, (1 - qs) / 0.05)); ctx.fillRect(ps[0] * G - 6, ps[1] * G - 6, 12, 12);
    }
  }
  // latency: one ping per route (slowed-down clock); the ground ping arrives almost at once, the satellite ping takes the long way
  if (t > T.ping - 0.1 && t < 17.6) {
    const a = env(t, T.ping - 0.1, T.ping + 0.1) * (1 - env(t, 17.2, 17.6));
    const pg = pingPos(GROUND, LG, T.ping, T.pingG, t), ps = pingPos(SKY, LS, T.ping, T.pingS, t);
    for (const [p, col] of [[pg, C.blueSoft], [ps, C.coral]]) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.18 * G, 0, TAU); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
    label(ctx, '≈ 10 ms ✓', FRIEND[0] - 0.2, FRIEND[1] - 1.05, 0.44, C.blueSoft, 'center', 'EBold', a * env(t, T.ping + T.pingG, T.ping + T.pingG + 0.2));
    label(ctx, 'ping', ps[0] + 0.35, ps[1] - 0.35, 0.36, C.coral, 'left', 'EBold', a * (t < T.ping + T.pingS ? 1 : 0));
  }
  ring(ctx, FRIEND, t - (T.ping + T.pingG), C.blueSoft, 0.8); ring(ctx, SAT, t - (T.ping + T.pingS / 2), C.coral, 1.0); ring(ctx, FRIEND, t - (T.ping + T.pingS), C.coral, 1.0);
  // from the meter onwards: a quiet loop of both pings so the map keeps explaining the takeaway
  if (t > T.meter) {
    const a = env(t, T.meter, T.meter + 0.4);
    const qg = ((t - T.meter) / 0.9) % 1, qs = ((t - T.meter) / 4.2) % 1, pg = at(GROUND, LG * qg), ps = at(SKY, LS * qs);
    for (const [p, col, q] of [[pg, C.blueSoft, qg], [ps, C.coral, qs]]) { ctx.save(); ctx.globalAlpha *= a * Math.min(1, q / 0.08, (1 - q) / 0.08); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.15 * G, 0, TAU); ctx.fill(); ctx.restore(); }
  }
  phone(ctx, YOU, clamp(1 - Math.abs(t - 0.3) / 0.3), 1.1); phone(ctx, FRIEND, clamp(1 - Math.abs(t - T.msg[1]) / 0.4), 1.1);
  label(ctx, 'you', YOU[0], YOU[1] + 1.0, 0.44, C.ink, 'center', 'EBold', 1);
  label(ctx, 'friend', FRIEND[0], FRIEND[1] + 1.0, 0.44, C.ink, 'center', 'EBold', 1);
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(1.7 * G, 12.0 * G, 0.1 * G, 1.25 * G); ctx.restore();
  label(ctx, 'Fast but laggy?', 2.0, 12.35, 0.48, C.ink, 'left', 'EBold', a);
  label(ctx, 'width vs distance', 2.0, 12.95, 0.36, '#B5BDB8', 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument (one plate, five sequential states)
function phase(t, a, b) { return env(t, a, a + 0.2) * (1 - env(t, b - 0.2, b)); }
function drawInstrument(ctx, t) {
  const A = env(t, 0.1, 0.4) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; const Y1 = 1462, Y2 = 1530;
  // P0 hook: the call timeline: your words and your friend's reply overlap because each way is delayed
  let p = phase(t, 0, 4.3);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha *= p; ctx.font = '26px EBold'; ctx.textAlign = 'left'; ctx.fillStyle = C.ink; ctx.fillText('you', 132, Y1); ctx.fillText('friend', 132, Y2);
    const g = ease.out(inv(0.3, 3.4, t));
    roundRect(ctx, 260, Y1 - 14, 300 * g + 1, 28, 14); ctx.fillStyle = C.blueSoft; ctx.fill();
    const fr = ease.out(inv(1.4, 3.6, t)); roundRect(ctx, 470, Y2 - 14, 330 * fr + 1, 28, 14); ctx.fillStyle = C.ink; ctx.fill();
    const ov = env(t, 2.6, 3.0); if (ov > 0) { ctx.fillStyle = hexA(C.coral, 0.55 * ov); ctx.fillRect(470, Y1 - 24, 90, Y2 - Y1 + 48); ctx.fillStyle = hexA(C.coral, ov); ctx.font = '24px EBold'; ctx.fillText('talking over each other', 600, Y1); }
    ctx.restore();
  }
  // P1 bandwidth: the same number on both routes
  p = phase(t, 4.3, 8.7);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha *= p; ctx.font = '26px EBold'; ctx.textAlign = 'left';
    [['ground', Y1], ['satellite', Y2]].forEach(([n, y]) => { ctx.fillStyle = C.ink; ctx.fillText(n, 132, y); roundRect(ctx, 300, y - 11, 480, 22, 11); ctx.fillStyle = C.blue; ctx.fill(); ctx.fillStyle = C.ink; ctx.fillText('100 Mbps', 800, y); });
    ctx.restore();
  }
  // P2 latency: stopwatches on a slowed-down clock (one way)
  p = phase(t, 8.7, 17.7);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha *= p; ctx.font = '26px EBold'; ctx.textAlign = 'left';
    const msG = Math.round(10 * clamp((t - T.ping) / T.pingG)), msS = Math.round(260 * clamp((t - T.ping) / T.pingS));
    [['ground', Y1, msG, 10, C.blueSoft], ['satellite', Y2, msS, 260, C.coral]].forEach(([n, y, ms, max, col]) => {
      ctx.fillStyle = C.ink; ctx.fillText(n, 132, y); roundRect(ctx, 300, y - 11, 480, 22, 11); ctx.fillStyle = '#26302C'; ctx.fill();
      const w = 480 * ms / 400; if (w > 0) { roundRect(ctx, 300, y - 11, Math.max(22, w), 22, 11); ctx.fillStyle = col; ctx.fill(); }
      ctx.fillStyle = col; ctx.fillText(`${ms} ms`, 800, y); if (ms >= max) check(ctx, 920, y, 22, col);
    });
    ctx.fillStyle = hexA(C.ink, 0.55); ctx.font = '20px ESemi'; ctx.textAlign = 'right'; ctx.fillText('one way · clock slowed down', 966, 1436);
    ctx.restore();
  }
  // P3 the 150 ms line (ITU-T G.114): below it, talk feels instant
  p = phase(t, 17.7, 23.0);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha *= p; const X0 = 160, X1 = 920, X = ms => lerp(X0, X1, ms / 400), y = 1508;
    ctx.fillStyle = hexA(C.blue, 0.35); ctx.fillRect(X0, y - 14, X(150) - X0, 28); ctx.fillStyle = hexA(C.coral, 0.25); ctx.fillRect(X(150), y - 14, X1 - X(150), 28);
    const l = env(t, T.line150, T.line150 + 0.3); ctx.fillStyle = hexA(C.ink, l); ctx.fillRect(X(150) - 2, y - 30, 4, 60);
    ctx.font = '22px EBold'; ctx.textAlign = 'center'; ctx.fillStyle = hexA(C.ink, l); ctx.fillText('150 ms', X(150), 1450);
    ctx.fillStyle = C.blueSoft; ctx.fillText('feels instant', (X0 + X(150)) / 2, 1450); ctx.fillStyle = C.coral; ctx.fillText('lag you notice', (X(150) + X1) / 2, 1450);
    for (const [ms, col, txt] of [[10, C.blueSoft, 'ground ≈10'], [260, C.coral, 'satellite ≈260']]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(ms), y, 11, 0, TAU); ctx.fill(); ctx.font = '22px EBold'; ctx.fillText(txt, X(ms) + (ms < 50 ? 60 : 0), 1550); }
    const ov = env(t, T.overlap, T.overlap + 0.3); if (ov > 0) { ctx.strokeStyle = hexA(C.coral, ov); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(X(260), y, 22, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  // P4 takeaway: two speed tests with the same download number and very different ping (round trip)
  p = phase(t, 23.0, 30);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha *= p; ctx.textAlign = 'left';
    [['ground', '100', '≈20 ms', C.blueSoft], ['satellite', '100', '520+ ms', C.coral]].forEach(([n, mb, ping, col], i) => {
      const x = 120 + i * 430, y = 1440;
      ctx.fillStyle = hexA(C.ink, 0.7); ctx.font = '22px ESemi'; ctx.fillText(n, x + 14, y);
      ctx.fillStyle = C.ink; ctx.font = '24px EBold'; ctx.fillText(`↓ ${mb} Mbps`, x + 14, y + 40);
      const hl = env(t, T.pingHl, T.pingHl + 0.3);
      if (hl > 0) { roundRect(ctx, x + 180, y + 18, 222, 46, 12); ctx.strokeStyle = hexA(col, hl); ctx.lineWidth = 3; ctx.stroke(); }
      ctx.fillStyle = col; ctx.font = '24px EBold'; ctx.fillText(`ping ${ping}`, x + 196, y + 41);
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
let TOPV = 1, TOPV2 = 1;                                                 // paper veil: top labels hide whenever they would sit behind the caption band
export function drawFrame(ctx, t, assets) {
  const cm = cam(t), sc = cm.z;
  TOPV = clamp((SCREEN_CY + (9.0 - cm.y) * G * sc - 505) / 40); TOPV2 = clamp((SCREEN_CY + (10.2 - cm.y) * G * sc - 505) / 40);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  drawCartouche(ctx, 1 - env(t, 3.8, 4.3));
  drawRoutes(ctx, t);
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
  add(T.msg[0], 'zip', 0.3); add(T.msg[1], 'chime', 0.3); add(2.7, 'retry', 0.24);
  add(T.plates, 'stamp', 0.26); add(T.flow[0], 'sweep', 0.2, { dur: 0.8 });
  add(T.ping, 'zip', 0.26); add(T.ping + T.pingG, 'stop', 0.3);
  for (let t = T.ping + 0.8; t < T.ping + T.pingS; t += 0.7) add(t, 'tick', 0.13);
  add(T.ping + T.pingS / 2, 'relay', 0.28); add(T.ping + T.pingS, 'stop', 0.3);
  add(T.quarter, 'stamp', 0.28); add(T.pipe, 'sweep', 0.2, { dur: 0.6 });
  add(T.line150, 'callout', 0.26); add(T.overlap, 'retry', 0.22);
  add(T.pingHl, 'stamp', 0.26); add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
