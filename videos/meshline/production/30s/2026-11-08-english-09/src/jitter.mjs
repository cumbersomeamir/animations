// Meshline production 30s, batch 2026-11-08-english-09: "Packet loss and jitter: why a video call freezes".
// Same Transit-Map world as english-06/07/08 (charcoal printed sheet, electric-blue ink, white stations, label halos,
// paper veils, Inter labels, screen-space caption plate + one screen-space instrument). The map: a FRIEND sends a steady
// stream of packets down a printed route into a BUFFER tray and onto YOUR CALL SCREEN (an abstract bouncing-ball picture
// whose motion is driven by the packets that actually arrive). Lost packets puff out (the picture freezes, then skips);
// uneven arrivals fill the buffer (smooth but delayed). Targets from ITU-T Y.1541 Class 0 (VoIP/VTC): packet loss
// ≤ 1×10⁻³, delay variation ≤ 50 ms. Generic network behaviour only; no Meshline call/quality claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000;

// ------------------------------------------------------------------ map (G units, octilinear routes)
const FRIEND = [14.4, 11.6], TRAY = [5.4, 15.3];
const ROUTE = [[13.75, 11.6], [7.2, 11.6], [5.4, 13.4], [5.4, 14.7]];
const SCR = { x0: 4.4, y0: 16.6, x1: 13.6, y1: 21.8 };
const T = {
  speed: 0.2, freezeHook: 1.2, steady: 4.8, even: 6.7, loss: 8.7, skip: 9.9, jitter: 12.0, buffer: 13.6,
  targets: 15.6, loss1k: 16.6, jit50: 19.6, check: 21.8, stab: 24.1, cta: 26.14,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const LR = len(ROUTE);

// ------------------------------------------------------------------ packet schedule (deterministic)
// emitted every P seconds; travel TT; modes by emission time: loss (hook, l3), jitter (l4), otherwise even.
const P = 0.22, TT = 1.6, BUF = 0.45;
function modeAt(e) {
  if (e > -0.9 && e < 1.6) return 'burst';                                // hook: a burst of loss → the picture visibly freezes
  if (e < 3.0) return 'loss';
  if (e < 6.9) return 'even';
  if (e < 10.6) return 'loss';
  if (e < 14.2) return 'jitter';
  return 'even';
}
const PKTS = [];
for (let k = 0; ; k++) {
  const e = -2.2 + k * P; if (e > 30) break;
  const m = modeAt(e), h = hash(k * 7.13 + 1.7);
  const lost = (m === 'loss' && h < 0.42) || (m === 'burst' && h < 0.9);
  const tt = m === 'jitter' ? TT + (hash(k * 3.31 + 0.4) - 0.5) * 0.9 : TT;
  PKTS.push({ e, a: e + tt, tt, lost, cut: 0.25 + 0.6 * hash(k * 5.7), m });
}
const bufferedPlay = t => t > T.jitter + 0.2 && t < 16.6;                // jitter beat: the app plays from its buffer
function content(t) {                                                      // which moment of the friend's video is on your screen
  if (bufferedPlay(t)) return t - TT - BUF;
  let c = -9; for (const p of PKTS) if (!p.lost && p.a <= t && p.e > c) c = p.e;
  return c;
}
function stalled(t) { const c = content(t); return !bufferedPlay(t) && t - TT - c > 0.4; }

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const WIDE = { x: 9.0, y: 16.4, z: 0.95 };
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 16.6, z: 1.0 }], [3.9, { x: 9.0, y: 16.6, z: 1.02 }],
    [4.8, { x: 9.4, y: 15.6, z: 1.05 }], [7.6, { x: 9.4, y: 15.6, z: 1.06 }],          // the steady stream (screen label tucks under the instrument)
    [8.5, { x: 9.0, y: 17.6, z: 1.05 }], [11.6, { x: 9.0, y: 17.6, z: 1.06 }],         // loss → the picture freezes
    [12.4, { x: 7.8, y: 15.4, z: 1.12 }], [15.2, { x: 7.8, y: 15.4, z: 1.13 }],        // jitter → the buffer
    [16.0, WIDE], [26.0, { x: 9.0, y: 16.5, z: 0.97 }], [30, { x: 9.0, y: 16.7, z: 1.02 }],
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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / english-06..08)
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
function check(ctx, x, y, s, col, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.45, y); ctx.lineTo(x - s * 0.1, y + s * 0.35); ctx.lineTo(x + s * 0.5, y - s * 0.35); ctx.stroke(); ctx.restore();
}
function puff(ctx, p, age) {                                              // a lost packet: coral sparks where it vanished
  if (age < 0 || age > 0.5) return;
  ctx.strokeStyle = hexA(C.coral, 1 - age / 0.5); ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, d0 = (0.15 + age * 0.8) * G, d1 = d0 + 0.14 * G; ctx.beginPath(); ctx.moveTo(p[0] * G + Math.cos(a) * d0, p[1] * G + Math.sin(a) * d0); ctx.lineTo(p[0] * G + Math.cos(a) * d1, p[1] * G + Math.sin(a) * d1); ctx.stroke(); }
}
function phone(ctx, p, lit = 0, s = 1) {
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  const l = Math.max(lit, 0.3); ctx.fillStyle = hexA(C.blue, 0.85 * l); roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
}

// ------------------------------------------------------------------ beats
function drawRoute(ctx, t) {
  const stab = env(t, T.stab, T.stab + 0.3) * (1 - env(t, 28.6, 29.2)), chk = env(t, T.check, T.check + 0.3) * (1 - env(t, 28.6, 29.2));
  if (chk > 0) strokePath(ctx, ROUTE, LR, 0.5 * G, hexA(C.blueSoft, 0.12 * chk), false);
  strokePath(ctx, ROUTE, LR, 0.24 * G, C.blue);
  strokePath(ctx, [[TRAY[0], 16.05], [TRAY[0], SCR.y0]], 0.6, 0.16 * G, C.blue, false);
  // buffer tray (printed outline) with the packets waiting in it during the jitter beat
  const x = TRAY[0] * G, y = TRAY[1] * G;
  ctx.strokeStyle = hexA(C.blueSoft, 0.85); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 0.75 * G, y - 0.45 * G); ctx.lineTo(x - 0.75 * G, y + 0.45 * G); ctx.lineTo(x + 0.75 * G, y + 0.45 * G); ctx.lineTo(x + 0.75 * G, y - 0.45 * G); ctx.stroke();
  if (bufferedPlay(t)) {
    const c = content(t), n = PKTS.filter(p => !p.lost && p.a <= t && p.e > c).length;
    for (let i = 0; i < Math.min(n, 6); i++) { ctx.fillStyle = C.ink; ctx.fillRect(x - 0.6 * G + (i % 3) * 0.42 * G, y + 0.1 * G - Math.floor(i / 3) * 0.36 * G, 0.3 * G, 0.26 * G); }
  }
  label(ctx, 'buffer', TRAY[0] + 1.0, TRAY[1], 0.42, C.ink, 'left', 'EBold', 1);
  label(ctx, 'wait to smooth · adds delay', TRAY[0] + 1.0, TRAY[1] + 0.62, 0.36, C.blueSoft, 'left', 'ESemi', env(t, T.buffer, T.buffer + 0.3) * (1 - env(t, 16.0, 16.5)));
  phone(ctx, FRIEND, 0.4, 1.1);
  label(ctx, 'friend', FRIEND[0], FRIEND[1] + 1.0, 0.44, C.ink, 'center', 'EBold', 1);
  label(ctx, 'steady stream', 10.4, 10.85, 0.42, C.blueSoft, 'center', 'EBold', env(t, T.steady, T.steady + 0.3) * (1 - env(t, 8.2, 8.6)));
  label(ctx, 'packet loss', 10.4, 10.85, 0.44, C.coral, 'center', 'EBold', env(t, T.loss, T.loss + 0.3) * (1 - env(t, 11.6, 12.0)));
  label(ctx, 'jitter: uneven gaps', 10.4, 10.85, 0.44, C.coral, 'center', 'EBold', env(t, T.jitter, T.jitter + 0.3) * (1 - env(t, 15.4, 15.8)));
  // takeaway labels: three different properties of the same route
  label(ctx, 'bandwidth = width', 10.4, 10.85, 0.4, C.blueSoft, 'center', 'EBold', chk);
  label(ctx, 'latency = length', 10.4, 12.4, 0.4, C.blueSoft, 'center', 'EBold', chk);
  label(ctx, 'stability = even spacing', 10.4, 13.15, 0.42, C.coral, 'center', 'EBold', stab);
}
function drawPackets(ctx, t) {
  for (const p of PKTS) {
    const q = (t - p.e) / p.tt; if (q < 0) continue;
    if (p.lost) { const qq = Math.min(q, p.cut), pos = at(ROUTE, LR * qq); if (q < p.cut) { ctx.fillStyle = C.ink; ctx.fillRect(pos[0] * G - 7, pos[1] * G - 7, 14, 14); } puff(ctx, pos, (t - p.e) - p.cut * p.tt); continue; }
    if (q >= 1) continue;
    const pos = at(ROUTE, LR * q); ctx.fillStyle = C.ink; ctx.fillRect(pos[0] * G - 7, pos[1] * G - 7, 14, 14);
  }
  // even-spacing marks while the narration says "timed evenly"
  const ev = env(t, T.even, T.even + 0.3) * (1 - env(t, 8.2, 8.6));
  if (ev > 0) { ctx.save(); ctx.globalAlpha *= ev; ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { const d = LR * 0.04 + i * (LR * 0.6 / 6) * 0 + i * 0.22 / TT * LR; const p = at(ROUTE, d + ((t - T.even) / TT * LR) % (0.22 / TT * LR)); ctx.beginPath(); ctx.moveTo(p[0] * G, (p[1] - 0.42) * G); ctx.lineTo(p[0] * G, (p[1] - 0.26) * G); ctx.stroke(); } ctx.restore(); }
}
function drawScreen(ctx, t) {
  const x0 = SCR.x0 * G, y0 = SCR.y0 * G, w = (SCR.x1 - SCR.x0) * G, h = (SCR.y1 - SCR.y0) * G;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x0 + 6, y0 + 9, w, h, 0.3 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x0 - 0.12 * G, y0 - 0.12 * G, w + 0.24 * G, h + 0.24 * G, 0.36 * G); ctx.fill();
  ctx.fillStyle = '#0D1311'; roundRect(ctx, x0, y0, w, h, 0.3 * G); ctx.fill();
  // the friend's picture: a ball whose motion follows the video time that has actually arrived
  const c = content(t), st = stalled(t);
  ctx.save(); roundRect(ctx, x0, y0, w, h, 0.3 * G); ctx.clip();
  ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 0.4 * G, y0 + h * 0.78); ctx.lineTo(x0 + w - 0.4 * G, y0 + h * 0.78); ctx.stroke();
  const bx = 9.0 + 3.4 * Math.sin(c * 1.7), by = SCR.y0 + 3.9 - Math.abs(Math.cos(c * 3.4)) * 2.2;
  ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(bx * G, by * G, 0.42 * G, 0, TAU); ctx.fill();
  ctx.fillStyle = hexA(C.ink, 0.85); ctx.beginPath(); ctx.arc((bx - 0.12) * G, (by - 0.12) * G, 0.12 * G, 0, TAU); ctx.fill();
  if (st) {                                                                // frozen: blocky artefacts + coral badge
    for (let i = 0; i < 9; i++) { const hx = hash(i * 3.3 + Math.floor(c * 5)), hy = hash(i * 7.7 + Math.floor(c * 5)); ctx.fillStyle = hexA(i % 2 ? C.blue : C.blueSoft, 0.35); ctx.fillRect(x0 + hx * (w - 60), y0 + hy * (h - 60), 40 + 20 * hash(i), 30 + 20 * hash(i + 1)); }
    ctx.fillStyle = hexA(C.coral, 0.92); roundRect(ctx, x0 + w - 2.6 * G, y0 + 0.3 * G, 2.3 * G, 0.7 * G, 0.35 * G); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = `${0.38 * G}px EBold`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('frozen', x0 + w - 1.45 * G, y0 + 0.66 * G);
  }
  ctx.restore();
  label(ctx, 'your call screen', 9.0, SCR.y1 + 0.62, 0.42, C.ink, 'center', 'EBold', 1);
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(2.3 * G, 9.2 * G, 0.1 * G, 1.25 * G); ctx.restore();
  label(ctx, 'Fast, but frozen?', 2.6, 9.55, 0.48, C.ink, 'left', 'EBold', a);
  label(ctx, 'loss and jitter', 2.6, 10.15, 0.36, '#B5BDB8', 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument (sequential states)
function phase(t, a, b) { return env(t, a, a + 0.2) * (1 - env(t, b - 0.2, b)); }
function drawInstrument(ctx, t) {
  const A = env(t, 0.1, 0.4) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle';
  // P0/P1: speed test row + arrivals timeline (each tick = a packet reaching you; coral = lost; spacing = timing)
  let p = phase(t, 0, 15.6);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha *= p; ctx.font = '26px EBold'; ctx.textAlign = 'left';
    ctx.fillStyle = C.ink; ctx.fillText('speed test', 132, 1460); ctx.fillStyle = C.blueSoft; ctx.fillText('↓ 100 Mbps', 300, 1460); check(ctx, 470, 1460, 22, C.blueSoft);
    ctx.fillStyle = st(t) ? C.coral : hexA(C.ink, 0.7); ctx.fillText(st(t) ? 'call: frozen' : 'call: playing', 540, 1460);
    ctx.fillStyle = C.ink; ctx.fillText('arrivals', 132, 1530);
    const X0 = 300, X1 = 950, win = 2.6, Y = 1530;
    ctx.strokeStyle = hexA(C.ink, 0.15); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X0, Y + 18); ctx.lineTo(X1, Y + 18); ctx.stroke();
    for (const q of PKTS) {
      const ta = q.lost ? q.e + TT : q.a; if (ta > t || ta < t - win) continue;
      const x = lerp(X0, X1, 1 - (t - ta) / win);
      if (q.lost) { ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 7, Y - 7); ctx.lineTo(x + 7, Y + 7); ctx.moveTo(x + 7, Y - 7); ctx.lineTo(x - 7, Y + 7); ctx.stroke(); }
      else { ctx.fillStyle = q.m === 'jitter' ? C.ink : C.blueSoft; ctx.fillRect(x - 3, Y - 14, 6, 28); }
    }
    ctx.restore();
  }
  // P2: call-grade targets (ITU-T Y.1541 class 0)
  p = phase(t, 15.6, 21.8);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha *= p; ctx.textAlign = 'left';
    ctx.fillStyle = hexA(C.ink, 0.6); ctx.font = '20px ESemi'; ctx.fillText('call-grade network targets (ITU-T Y.1541)', 128, 1438);
    const a1 = env(t, T.loss1k - 0.2, T.loss1k + 0.3), a2 = env(t, T.jit50 - 0.2, T.jit50 + 0.3);
    ctx.save(); ctx.globalAlpha *= a1;                                     // 1,000 dots, one of them coral
    for (let i = 0; i < 1000; i++) { const gx = 128 + (i % 50) * 7.2, gy = 1462 + Math.floor(i / 50) * 4.6; ctx.fillStyle = i === 617 ? C.coral : hexA(C.blueSoft, 0.75); ctx.fillRect(gx, gy, 4.4, 3); }
    { const gx = 128 + (617 % 50) * 7.2 + 2, gy = 1462 + Math.floor(617 / 50) * 4.6 + 1.5; ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(gx, gy, 11, 0, TAU); ctx.stroke(); ctx.fillStyle = C.coral; ctx.font = '22px EBold'; ctx.fillText('1 lost', gx + 18, gy - 14); }
    ctx.fillStyle = C.ink; ctx.font = '24px EBold'; ctx.fillText('loss ≤ 1 in 1,000', 128, 1562 - 0);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= a2; const X0 = 560, X1 = 950, Y = 1500, X = ms => lerp(X0, X1, ms / 120);
    ctx.fillStyle = hexA(C.blue, 0.35); ctx.fillRect(X0, Y - 12, X(50) - X0, 24); ctx.fillStyle = hexA(C.coral, 0.22); ctx.fillRect(X(50), Y - 12, X1 - X(50), 24);
    ctx.fillStyle = C.ink; ctx.fillRect(X(50) - 2, Y - 24, 4, 48); ctx.font = '22px EBold'; ctx.textAlign = 'center'; ctx.fillText('50 ms', X(50), 1462);
    ctx.textAlign = 'left'; ctx.font = '24px EBold'; ctx.fillText('jitter ≤ 50 ms', X0, 1548);
    ctx.restore();
    ctx.restore();
  }
  // P3: what to check
  p = phase(t, 21.8, 30);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha *= p; ctx.font = '26px EBold'; ctx.textAlign = 'left';
    [['bandwidth', 'fine', C.blueSoft, 132], ['latency', 'fine', C.blueSoft, 420], ['loss · jitter', 'check', C.coral, 690]].forEach(([n, v, col, x], i) => {
      ctx.fillStyle = C.ink; ctx.fillText(n, x, 1470); ctx.fillStyle = col; ctx.fillText(v, x, 1520);
      if (i < 2) check(ctx, x + 80, 1520, 22, col);
      else { const hl = env(t, T.stab, T.stab + 0.3); if (hl > 0) { roundRect(ctx, x - 16, 1440, 270, 108, 16); ctx.strokeStyle = hexA(C.coral, hl); ctx.lineWidth = 4; ctx.stroke(); } }
    });
    ctx.restore();
  }
  ctx.restore();
}
const st = t => stalled(t);

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
  drawRoute(ctx, t);
  drawPackets(ctx, t);
  drawScreen(ctx, t);
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
  add(T.speed, 'stamp', 0.24); add(T.freezeHook, 'thunk', 0.26);
  for (const p of PKTS) if (p.lost) { const tl = p.e + p.cut * p.tt; if (tl > 0.2 && tl < 29.4 && (tl < 3.8 || (tl > 8.4 && tl < 11.8))) add(tl, 'fizz', 0.12); }
  add(T.steady, 'sweep', 0.2, { dur: 0.8 }); add(T.even, 'stop', 0.24);
  add(T.loss, 'retry', 0.24); add(T.jitter, 'turn', 0.28); add(T.buffer, 'stop', 0.26);
  add(T.loss1k, 'stamp', 0.26); add(T.jit50, 'stamp', 0.26); add(T.check, 'callout', 0.24); add(T.stab, 'stamp', 0.26); add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
