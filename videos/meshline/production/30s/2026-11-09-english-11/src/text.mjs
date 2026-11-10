// Meshline production 30s, batch 2026-11-09-english-11: "Why a text gets through when a call won't".
// Same Transit-Map world as english-06..10 (charcoal printed sheet, electric-blue ink, white stations, label halos, paper
// veils, Inter labels, screen-space caption plate + one screen-space instrument). The map has one busy DOORWAY (the
// cell tower's gate) that a crowd's traffic streams through. A CALL needs a path held open through it for every
// second; a TEXT is one tiny burst that can wait at the doorway and slip through a gap. Sources: FCC/FEMA disaster
// tips (DOC-309723A1), FCC 14-6 (SMS needs much lower signal levels; often transmitted during congestion),
// 3GPP TS 23.040 (store-and-forward service centre; 140 octets) and TS 23.038 (160 7-bit characters).
// Generic network behaviour only; no Meshline feature claims beyond the listing ("nearby messaging, even offline").
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000;
const GREY = '#C9D0CC';

// ------------------------------------------------------------------ map (G units, octilinear routes)
const YOU0 = [4.4, 19.6], FRIEND0 = [13.6, 19.6], GATE = [9.0, 13.9], TOWER = [9.0, 11.1], CROWD = [9.0, 21.5], PIN = [9.0, 24.9];
const YOU1 = [7.0, 24.4], FRIEND1 = [11.0, 24.4];
const RL = [[4.4, 18.5], GATE], FULL = [[4.4, 18.5], GATE, [13.6, 18.5]];
const STREAM = { y0: 20.6, y1: 12.9, v: 3.0 };
const T = {
  callTry: 0.3, callFail: 0.85, sent: 2.1,
  band: [3.75, 4.6], held: 4.53, blocked: 4.9,
  burst: 8.03, chars: 9.61,
  bars: 12.24, holdTag: 14.06, gap: 15.68,
  guide: 16.9, before: 21.55, pin: 22.86, walk: [25.0, 26.0],
  cta: 26.14, link: [26.6, 27.15], hop: 27.4, range: 28.4,
};
const TRIPS = [
  { go: 1.45, gate: 1.9, out: 1.98, end: 2.5 },
  { go: 12.45, gate: 13.4, out: 15.68, end: 16.25 },
  { go: 19.32, gate: 19.76, out: 19.84, end: 20.35 },
  { go: 23.96, gate: 24.36, out: 24.44, end: 24.95 },
];
const GAPS = TRIPS.map(tr => tr.out);
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const LRL = len(RL), LFULL = len(FULL);

// crowd traffic through the doorway: a deterministic schedule of grey capsules with gaps where a text slips through
const SPAWNS = [];
for (let k = 0, s = -3; s < 30; k++, s += 0.3) {
  const sp = s + (hash(k * 1.7) - 0.5) * 0.08, atGate = sp + (STREAM.y0 - GATE[1]) / STREAM.v;
  if (GAPS.some(g => Math.abs(atGate - g) < 0.42)) continue;
  SPAWNS.push(sp);
}
const capsY = t => SPAWNS.map(sp => STREAM.y0 - (t - sp) * STREAM.v).filter(y => y <= STREAM.y0 + 0.3 && y >= STREAM.y1 - 0.3);
const gateBusy = t => capsY(t).some(y => Math.abs(y - GATE[1]) < 0.55);

// phones walk to the meeting point in l6
const walkK = t => ease.inOut(inv(...T.walk, t));
const youP = t => [lerp(YOU0[0], YOU1[0], walkK(t)), lerp(YOU0[1], YOU1[1], walkK(t))];
const friendP = t => [lerp(FRIEND0[0], FRIEND1[0], walkK(t)), lerp(FRIEND0[1], FRIEND1[1], walkK(t))];

// a text's trip: up the left route, wait before the doorway, slip through, down to the friend
function tripPos(tr, t) {
  if (t < tr.go || t > tr.end + 0.25) return null;
  const hold = LRL - 0.6;
  if (t < tr.gate) return at(FULL, hold * ease.inOut(inv(tr.go, tr.gate, t)));
  if (t < tr.out - 0.12) return at(FULL, hold);
  return at(FULL, lerp(hold, LFULL, ease.sine(inv(tr.out - 0.12, tr.end, t))));
}

// ------------------------------------------------------------------ camera (one purposeful move per beat)
function cam(t) {
  return K(t, [
    [0, { x: 8.6, y: 16.85, z: 1.2 }], [3.0, { x: 8.6, y: 16.85, z: 1.23 }],          // hook: call fails, text goes
    [3.6, { x: 9.0, y: 16.4, z: 1.1 }], [7.1, { x: 9.0, y: 16.3, z: 1.12 }],          // a call needs the whole path held
    [7.6, { x: 6.4, y: 17.6, z: 1.42 }], [11.6, { x: 6.4, y: 17.6, z: 1.45 }],        // a text is one tiny burst
    [12.1, { x: 9.0, y: 16.4, z: 1.08 }], [16.4, { x: 9.2, y: 16.5, z: 1.1 }],        // less signal, held, slips through a gap
    [17.0, { x: 8.0, y: 16.0, z: 1.0 }], [21.0, { x: 8.0, y: 16.0, z: 1.02 }],        // the guides' advice
    [21.6, { x: 9.0, y: 20.2, z: 1.0 }], [25.8, { x: 9.0, y: 20.2, z: 1.02 }],        // meeting point + one short text
    [26.4, { x: 9.0, y: 20.0, z: 1.0 }], [30, { x: 9.0, y: 20.0, z: 1.03 }],
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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / english-06..10)
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
function tag(ctx, txt, x, y, size, col, mark, a) {                          // label + drawn mark (✕/✓ are not in the font)
  if (a <= 0.01) return; label(ctx, txt, x, y, size, col, 'left', 'EBold', a);
  ctx.save(); ctx.font = `${size * G}px EBold`; const w = ctx.measureText(txt).width / G; ctx.restore();
  if (mark === 'x') cross(ctx, [x + w + size * 0.55, y], size * 0.3, a); else check(ctx, (x + w + size * 0.6) * G, y * G, size * 0.75 * G, col, a);
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
function spinner(ctx, x, y, r, t, col) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r, t * 6, t * 6 + Math.PI * 1.4); ctx.stroke(); ctx.restore(); }
function cellBars(ctx, x, y, s, n, col) {                                  // mobile signal: n of 4 rising bars lit (x,y = bottom-left)
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i < n ? col : hexA(C.ink, 0.2); const h = s * (0.3 + i * 0.22); roundRect(ctx, x + i * s * 0.26, y - h, s * 0.17, h, s * 0.04); ctx.fill(); }
}
function handset(ctx, x, y, s, col) {                                      // classic handset glyph
  ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI * 0.25); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round';
  ctx.lineWidth = s * 0.2; ctx.beginPath(); ctx.arc(0, 0, s * 0.42, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
  for (const a of [Math.PI * 0.62, Math.PI * 1.38]) { ctx.save(); ctx.translate(Math.cos(a) * s * 0.42, Math.sin(a) * s * 0.42); ctx.rotate(a + Math.PI / 2); roundRect(ctx, -s * 0.2, -s * 0.11, s * 0.4, s * 0.22, s * 0.08); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function envelope(ctx, x, y, s, a = 1, flap = C.blue) {                    // message token
  if (a <= 0) return; const w = s, h = s * 0.68;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 5, w, h, s * 0.08); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, s * 0.08); ctx.fill();
  ctx.strokeStyle = flap; ctx.lineWidth = Math.max(2, s * 0.08); ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - w / 2 + s * 0.08, y - h / 2 + s * 0.08); ctx.lineTo(x, y + h * 0.08); ctx.lineTo(x + w / 2 - s * 0.08, y - h / 2 + s * 0.08); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ props (generic glyphs, no app UI)
function phone(ctx, p, t, bars, glyph, s = 2.0) {
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  cellBars(ctx, x - w * 0.3, y - h * 0.3, 0.42 * G, bars, bars <= 1 ? C.coral : C.blueSoft);
  const gy = y + h * 0.08, gs = 0.62 * G;
  if (glyph === 'call') { handset(ctx, x, gy, gs, C.blueSoft); spinner(ctx, x, gy + 0.62 * G, 0.11 * G, t, C.blueSoft); }
  else if (glyph === 'callFail') { handset(ctx, x, gy, gs, hexA(C.coral, 0.6)); cross(ctx, [x / G, (gy + 0.6 * G) / G], 0.13, 1); }
  else if (glyph === 'env' || glyph === 'envOk') { envelope(ctx, x, gy, 0.62 * G, 1); if (glyph === 'envOk') check(ctx, x, gy + 0.62 * G, 0.34 * G, C.blueSoft); }
}
function youGlyph(t) {
  if (t >= T.callTry && t < T.callFail) return 'call';
  if (t >= T.callFail && t < 1.45) return 'callFail';
  if (t >= 1.45 && t < 3.4) return t >= T.sent ? 'envOk' : 'env';
  if (t >= T.band[0] - 0.2 && t < T.blocked) return 'call';
  if (t >= T.blocked && t < 7.3) return 'callFail';
  if ((t >= 7.8 && t < 16.4) || (t >= 19.1 && t < 20.6) || (t >= 23.7 && t < 25.2)) return 'env';
  return 'none';
}
function friendGlyph(t) {
  const arr = TRIPS.find(tr => t >= tr.end && t < tr.end + 1.2) || (t >= T.hop + 0.35 ? { end: 0 } : null);
  return arr ? 'envOk' : 'none';
}
function tower(ctx, t) {
  const [x, y] = [TOWER[0] * G, TOWER[1] * G];
  for (let k = 0; k < 2; k++) { const age = ((t + k * 0.7) % 1.4) / 1.4; ctx.strokeStyle = hexA(C.blueSoft, 0.5 * (1 - age)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, (0.35 + 0.75 * age) * G, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.08 * G; ctx.lineCap = 'round';
  const by = (GATE[1] - 0.45) * G;
  ctx.beginPath(); ctx.moveTo(x - 0.42 * G, by); ctx.lineTo(x, y); ctx.lineTo(x + 0.42 * G, by);
  for (const f of [0.35, 0.65]) { const yy = lerp(y, by, f), dx = 0.42 * G * f; ctx.moveTo(x - dx, yy); ctx.lineTo(x + dx, yy); }
  ctx.stroke(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 0.1 * G, 0, TAU); ctx.fill();
}
function doorway(ctx, t) {
  const x = GATE[0] * G, y = GATE[1] * G, busy = gateBusy(t);
  if (busy) { const g = ctx.createRadialGradient(x, y, 0, x, y, 0.9 * G); g.addColorStop(0, hexA(C.coral, 0.28)); g.addColorStop(1, hexA(C.coral, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 0.9 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = C.ink; for (const dx of [-0.42, 0.42]) { roundRect(ctx, x + dx * G - 0.07 * G, y - 0.45 * G, 0.14 * G, 0.95 * G, 0.04 * G); ctx.fill(); }
  ctx.fillStyle = busy ? C.coral : C.blueSoft; roundRect(ctx, x - 0.58 * G, y - 0.56 * G, 1.16 * G, 0.16 * G, 0.06 * G); ctx.fill();
}
function crowd(ctx, t) {
  for (let i = 0; i < 46; i++) {
    const a = hash(i * 3.1) * TAU, r = Math.sqrt(hash(i * 5.7)), x = CROWD[0] + Math.cos(a) * r * 1.65, y = CROWD[1] + Math.sin(a) * r * 0.72;
    const tw = 0.5 + 0.35 * Math.sin(t * 2.2 + i * 1.3);
    ctx.fillStyle = hexA(i % 5 === 0 ? C.blueSoft : C.ink, 0.35 + 0.35 * tw); ctx.beginPath(); ctx.arc(x * G, y * G, 0.1 * G, 0, TAU); ctx.fill();
  }
}
function stream(ctx, t) {
  ctx.strokeStyle = hexA(C.ink, 0.16); ctx.lineWidth = 0.1 * G; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(GATE[0] * G, STREAM.y0 * G); ctx.lineTo(GATE[0] * G, (GATE[1] - 0.4) * G); ctx.stroke();
  for (const yc of capsY(t)) {
    const a = clamp((STREAM.y0 + 0.3 - yc) / 0.5) * clamp((yc - STREAM.y1 + 0.3) / 0.6);
    if (a <= 0) continue; const x = GATE[0] * G, y = yc * G, w = 0.28 * G, h = 0.55 * G;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = hexA(GREY, 0.9); roundRect(ctx, x - w / 2, y - h / 2, w, h, w / 2); ctx.fill();
    ctx.fillStyle = hexA(C.bg, 0.55); roundRect(ctx, x - w * 0.22, y - h * 0.28, w * 0.44, h * 0.18, 2); ctx.fill(); roundRect(ctx, x - w * 0.22, y + h * 0.06, w * 0.44, h * 0.18, 2); ctx.fill();
    ctx.restore();
  }
}

// ------------------------------------------------------------------ beats
function drawScene(ctx, t) {
  const cta = env(t, T.cta - 0.2, T.cta + 0.3);
  // the two routes through the doorway (faint printed rails)
  strokePath(ctx, FULL, LFULL, 0.1 * G, hexA(C.blueSoft, 0.32), false);
  // l2: a call needs the whole path held open; its band inks to the doorway and is blocked there
  const gh = env(t, T.band[0], T.band[0] + 0.3) * (1 - env(t, 7.0, 7.5));
  if (gh > 0) { ctx.save(); ctx.globalAlpha *= gh; strokePath(ctx, FULL, LFULL, 0.42 * G, hexA(C.blueSoft, 0.16), false); ctx.restore(); }
  label(ctx, 'held open', 11.9, 15.6, 0.44, C.blueSoft, 'left', 'EBold', env(t, T.held, T.held + 0.3) * (1 - env(t, 7.0, 7.5)));
  const bk = ease.inOut(inv(...T.band, t)), ba = 1 - env(t, 7.0, 7.5);
  if (bk > 0 && ba > 0) {
    ctx.save(); ctx.globalAlpha *= ba; strokePath(ctx, RL, (LRL - 0.75) * bk, 0.24 * G, C.blue); ctx.restore();
    if (bk < 1) penTip(ctx, at(RL, (LRL - 0.75) * bk));
  }
  const blk = env(t, T.blocked, T.blocked + 0.2) * (1 - env(t, 7.0, 7.5));
  cross(ctx, at(RL, LRL - 0.75), 0.24 * (0.6 + 0.4 * ease.outBack(clamp((t - T.blocked) / 0.3))), blk);
  fizz(ctx, at(RL, LRL - 0.75), t, T.blocked);
  // the busy doorway, its tower and the crowd's traffic
  crowd(ctx, t); stream(ctx, t); tower(ctx, t); doorway(ctx, t);
  const busyA = env(t, T.blocked, T.blocked + 0.3) * (1 - env(t, 16.5, 16.9)) + env(t, T.cta + 0.3, T.cta + 0.7);
  label(ctx, 'busy doorway', 8.3, 13.25, 0.44, C.coral, 'right', 'EBold', Math.min(1, busyA));
  label(ctx, 'tower', 9.75, 11.3, 0.4, C.ink, 'left', 'EBold', (1 - env(t, 7.3, 7.6) + env(t, 11.9, 12.2)) * (1 - env(t, 21.2, 21.6)));  // veiled while it would sit by the caption band (l3)
  label(ctx, 'crowd', 10.95, 21.5, 0.4, '#B5BDB8', 'left', 'EBold', (1 - env(t, 7.3, 7.6) + env(t, 11.9, 12.2)) * (1 - env(t, 24.6, 25.0)));  // veiled at the l3 close-up (would clip the right edge)
  // l3: the text as one tiny burst
  const eb = ease.outBack(clamp((t - T.burst) / 0.35)), ea = clamp((t - T.burst) / 0.2) * (1 - env(t, 11.7, 12.1));
  if (ea > 0) envelope(ctx, 2.6 * G, 17.0 * G, 0.95 * G * Math.max(0.01, eb), ea);
  ring(ctx, [2.6, 17.0], t - T.burst, C.blueSoft, 0.8);
  label(ctx, 'one burst', 2.6, 16.15, 0.42, C.blueSoft, 'center', 'EBold', ea);
  label(ctx, 'up to 160', 2.6, 17.9, 0.4, C.ink, 'center', 'EBold', clamp((t - T.chars) / 0.25) * (1 - env(t, 11.7, 12.1)));
  label(ctx, 'characters', 2.6, 18.4, 0.4, C.ink, 'center', 'EBold', clamp((t - T.chars) / 0.25) * (1 - env(t, 11.7, 12.1)));
  // texts in flight (each waits before the doorway, then slips through a gap)
  for (const tr of TRIPS) {
    const p = tripPos(tr, t); if (!p) continue;
    const a = clamp((t - tr.go) / 0.15) * (1 - clamp((t - tr.end) / 0.2));
    if (t > tr.gate && t < tr.out - 0.1 && tr.out - tr.gate > 1) {                // held: a waiting clock ring
      const k = clamp((t - tr.gate) / (tr.out - 0.1 - tr.gate)); ctx.strokeStyle = hexA(C.blueSoft, 0.85); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.5 * G, -Math.PI / 2, -Math.PI / 2 + k * TAU); ctx.stroke();
    }
    envelope(ctx, p[0] * G, p[1] * G, 0.62 * G, a);
    ring(ctx, at(FULL, LFULL), t - tr.end, C.blueSoft, 0.8);
  }
  label(ctx, 'held', 7.75, 14.35, 0.46, C.blueSoft, 'right', 'EBold', env(t, T.holdTag, T.holdTag + 0.25) * (1 - env(t, T.gap - 0.1, T.gap + 0.2)));
  label(ctx, 'slips through a gap', 9.75, 13.25, 0.42, C.blueSoft, 'left', 'EBold', env(t, T.gap - 0.05, T.gap + 0.25) * (1 - env(t, 16.6, 17.0)));
  label(ctx, 'delivered', 12.85, 18.25, 0.44, C.blueSoft, 'right', 'EBold', env(t, 16.25, 16.5) * (1 - env(t, 17.6, 18.0)));
  // hook tags + l4 signal tag beside your phone
  const yp = youP(t), fp = friendP(t);
  tag(ctx, 'call', 5.35, 19.0, 0.56, C.coral, 'x', env(t, T.callFail, T.callFail + 0.2) * (1 - env(t, 3.0, 3.4)));
  tag(ctx, 'text', 5.35, 19.8, 0.56, C.blueSoft, 'v', env(t, T.sent, T.sent + 0.2) * (1 - env(t, 3.0, 3.4)));
  label(ctx, '1 bar is enough', 5.35, 19.4, 0.44, C.blueSoft, 'left', 'EBold', env(t, T.bars + 0.15, T.bars + 0.45) * (1 - env(t, 16.4, 16.8)));
  // l6: the meeting point, agreed before the event
  const pk = ease.outBack(clamp((t - T.pin) / 0.4)), pa = clamp((t - T.pin) / 0.15);
  label(ctx, 'before the event', PIN[0], PIN[1] - 0.4, 0.42, '#B5BDB8', 'center', 'EBold', env(t, T.before, T.before + 0.3) * (1 - env(t, T.pin - 0.25, T.pin)));
  if (pa > 0) {
    const x = PIN[0] * G, y = PIN[1] * G, s = 0.95 * G * pk;
    ctx.save(); ctx.globalAlpha *= pa; ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 4, 0.28 * G, 0.1 * G, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - s * 0.55, y - s * 0.55, x - s * 0.42, y - s * 1.05, x, y - s * 1.05); ctx.bezierCurveTo(x + s * 0.42, y - s * 1.05, x + s * 0.55, y - s * 0.55, x, y); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y - s * 0.68, s * 0.16, 0, TAU); ctx.fill(); ctx.restore();
  }
  ring(ctx, [PIN[0], PIN[1] - 0.5], t - T.pin, C.blueSoft, 0.9);
  label(ctx, 'meeting point', PIN[0], PIN[1] + 1.05, 0.42, C.ink, 'center', 'EBold', pa * (1 - env(t, T.cta, T.cta + 0.4)));
  // walk to the meeting point (dashed footpaths)
  const wa = env(t, T.walk[0] - 0.2, T.walk[0]) * (1 - env(t, T.cta + 0.2, T.cta + 0.6));
  if (wa > 0) { ctx.save(); ctx.globalAlpha *= wa * 0.6; strokePath(ctx, [YOU0, YOU1], len([YOU0, YOU1]) * walkK(t), 0.07 * G, C.ink, false, [6, 10]); strokePath(ctx, [FRIEND0, FRIEND1], len([FRIEND0, FRIEND1]) * walkK(t), 0.07 * G, C.ink, false, [6, 10]); ctx.restore(); }
  // l7: a short nearby link between the two phones (limited range, drawn as a ring)
  const lk = ease.inOut(inv(...T.link, t));
  const ARC = [[7.65, 23.9], [8.3, 23.35], [9.7, 23.35], [10.35, 23.9]];
  if (lk > 0) { strokePath(ctx, ARC, len(ARC) * lk, 0.13 * G, C.blueSoft, true, [14, 9]); if (lk < 1) penTip(ctx, at(ARC, len(ARC) * lk)); }
  label(ctx, 'nearby', 9.0, 22.75, 0.42, C.blueSoft, 'center', 'EBold', env(t, T.link[1] - 0.2, T.link[1] + 0.2));
  if (t > T.hop && t < T.hop + 0.7) { const q = ease.inOut(inv(T.hop, T.hop + 0.45, t)); const p = at(ARC, len(ARC) * q); envelope(ctx, p[0] * G, p[1] * G, 0.5 * G, 1 - clamp((t - T.hop - 0.45) / 0.2)); }
  const ra = env(t, T.range, T.range + 0.5);
  if (ra > 0) { ctx.save(); ctx.globalAlpha *= ra * 0.5; ctx.setLineDash([10, 12]); ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(9.0 * G, 24.3 * G, 2.75 * G, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
  // phones
  phone(ctx, yp, t, t >= T.bars && t < 21.0 ? 1 : 2, youGlyph(t));
  phone(ctx, fp, t, 2, friendGlyph(t));
  const pl = 1 - env(t, T.walk[0] - 0.3, T.walk[0]);
  label(ctx, 'you', yp[0], yp[1] + 1.35, 0.42, C.ink, 'center', 'EBold', pl);
  label(ctx, 'friend', fp[0], fp[1] + 1.35, 0.42, C.ink, 'center', 'EBold', pl);
  void cta;
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(2.75 * G, 13.75 * G, 0.1 * G, 1.3 * G); ctx.restore();
  label(ctx, 'Call vs text', 3.05, 14.1, 0.5, C.ink, 'left', 'EBold', a);
  label(ctx, 'what each one needs', 3.05, 14.75, 0.34, '#B5BDB8', 'left', 'ESemi', a);
}
function drawGuide(ctx, t) {                                               // l5: printed callout block
  const a = env(t, T.guide, T.guide + 0.4) * (1 - env(t, 21.0, 21.4)); if (a <= 0.01) return;
  const rv = k => clamp((t - T.guide - k * 0.25) / 0.3);
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(1.3 * G, 12.95 * G, 0.12 * G, 3.6 * G * ease.out(rv(0))); ctx.restore();
  label(ctx, 'EMERGENCY GUIDES', 1.7, 13.3, 0.38, '#B5BDB8', 'left', 'ESemi', a * rv(0));
  label(ctx, 'to check in,', 1.7, 14.1, 0.6, C.ink, 'left', 'EBold', a * rv(1));
  label(ctx, 'text instead', 1.7, 14.95, 0.66, C.blueSoft, 'left', 'EBold', a * rv(2));
  label(ctx, 'of calling', 1.7, 15.8, 0.66, C.blueSoft, 'left', 'EBold', a * rv(3));
}

// ------------------------------------------------------------------ screen-space instrument (one plate; phases swap out, then in)
function drawInstrument(ctx, t) {
  const A = env(t, 0.1, 0.4) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const Y1 = 1462, Y2 = 1530, X = 262;
  const pA = 1 - env(t, 11.55, 11.85), pB = env(t, 11.95, 12.25) * (1 - env(t, 20.95, 21.25)), pC = env(t, 21.35, 21.65);
  const head = (txt, y, a = 1) => { ctx.globalAlpha = A * a; ctx.font = '25px EBold'; ctx.fillStyle = C.ink; ctx.fillText(txt, 132, y); };
  const txt = (s, x, y, col, font = '25px EBold', a = 1) => { ctx.globalAlpha = A * a; ctx.font = font; ctx.fillStyle = col; ctx.fillText(s, x, y); };
  if (pA > 0) {
    const k = pA;
    head('call', Y1, k);
    if (t < 3.4) {
      if (t >= T.callTry && t < T.callFail) { ctx.globalAlpha = A * k; spinner(ctx, X + 14, Y1, 11, t, C.blueSoft); txt('connecting…', X + 40, Y1, hexA(C.ink, 0.7), '25px EBold', k); }
      if (t >= T.callFail) { ctx.globalAlpha = A * k; cross(ctx, [(X + 14) / G, Y1 / G], 0.16, 1); txt('failed', X + 40, Y1, C.coral, '25px EBold', k); }
    } else {
      const f = ease.inOut(inv(T.band[0], 6.6, t));
      ctx.globalAlpha = A * k; roundRect(ctx, X, Y1 - 14, 690, 28, 10); ctx.strokeStyle = hexA(C.ink, 0.25); ctx.lineWidth = 2; ctx.stroke();
      if (f > 0) { roundRect(ctx, X, Y1 - 14, Math.max(20, 690 * f), 28, 10); ctx.fillStyle = C.blue; ctx.fill(); }
      for (let s = 1; s < 10; s++) { if (s / 10 > f) break; ctx.fillStyle = hexA(C.ink, 0.35); ctx.fillRect(X + 69 * s, Y1 - 9, 2, 18); }
      txt('held open the whole call', X + 14, Y1 + 1, C.ink, '21px ESemi', k * clamp((t - T.held) / 0.3));
    }
    head('text', Y2, k * (t < 3.4 || t >= 7.8 ? 1 : 0.35));
    if (t >= T.sent && t < 3.4) { ctx.globalAlpha = A * k; check(ctx, X + 14, Y2, 26, C.blueSoft); txt('sent', X + 40, Y2, C.blueSoft, '25px EBold', k); }
    if (t >= T.burst) {
      const b = ease.outBack(clamp((t - T.burst) / 0.3)); ctx.globalAlpha = A * k; roundRect(ctx, X, Y2 - 14 * b, 18, 28 * b, 6); ctx.fillStyle = C.blueSoft; ctx.fill();
      txt('one tiny burst', X + 36, Y2, C.blueSoft, '25px EBold', k * clamp((t - T.burst - 0.4) / 0.3));
      txt('· up to 160 characters', X + 228, Y2, C.ink, '25px EBold', k * clamp((t - T.chars) / 0.3));
    }
  }
  if (pB > 0) {
    const k = pB;
    head('signal', Y1, k);
    ctx.globalAlpha = A * k; const n = t < T.bars ? 2 : 1; cellBars(ctx, X, Y1 + 15, 34, n, n <= 1 ? C.coral : C.blueSoft);
    txt('1 bar · still enough for a text', X + 60, Y1, C.blueSoft, '25px EBold', k * clamp((t - T.bars - 0.2) / 0.3));
    head('text', Y2, k);
    const h = clamp((t - T.holdTag) / 0.25), d = clamp((t - T.gap) / 0.25);
    if (h > 0) { ctx.globalAlpha = A * k * h; ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X + 14, Y2, 11, -Math.PI / 2, -Math.PI / 2 + TAU * clamp((t - T.holdTag) / (T.gap - T.holdTag))); ctx.stroke(); txt('held by the network', X + 36, Y2, C.ink, '25px EBold', k * h); }
    if (d > 0) { txt('→', X + 292, Y2, hexA(C.ink, 0.6), '25px EBold', k * d); ctx.globalAlpha = A * k * d; check(ctx, X + 342, Y2, 26, C.blueSoft); txt('delivered in a gap', X + 368, Y2, C.blueSoft, '25px EBold', k * d); }
  }
  if (pC > 0) {
    const k = pC;
    head('plan', Y1, k);
    txt('before the event:', X, Y1, hexA(C.ink, 0.7), '25px EBold', k * clamp((t - T.before) / 0.3));
    const m = clamp((t - T.pin) / 0.3); if (m > 0) { ctx.globalAlpha = A * k * m; check(ctx, X + 222, Y1, 26, C.blueSoft); txt('meeting point agreed', X + 248, Y1, C.blueSoft, '25px EBold', k * m); }
    head('text', Y2, k);
    const msg = 'At the meeting point.', n = Math.round(msg.length * clamp((t - 23.96) / 0.6));
    if (t >= 23.9) {
      ctx.globalAlpha = A * k; roundRect(ctx, X - 6, Y2 - 21, 300, 42, 14); ctx.fillStyle = hexA(C.blue, 0.85); ctx.fill();
      txt(msg.slice(0, n), X + 10, Y2 + 1, C.ink, '23px EBold', k);
      txt(`${n} / 160 characters`, X + 316, Y2, hexA(C.ink, 0.7), '23px ESemi', k);
      if (t >= 24.95) { ctx.globalAlpha = A * k; check(ctx, X + 560, Y2, 24, C.blueSoft); }
    }
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
  drawCartouche(ctx, 1 - env(t, 3.0, 3.5));
  drawGuide(ctx, t);
  drawScene(ctx, t);
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
  add(T.callTry, 'retry', 0.18); add(T.callFail, 'offline', 0.24);
  for (const tr of TRIPS) { add(tr.go, 'zip', 0.22); add(tr.out, 'slot', 0.3); add(tr.end, 'stop', 0.26); }
  for (let t = 13.6; t < 15.5; t += 0.5) add(t, 'tick', 0.14);
  add(T.band[0], 'pen', 0.35, { dur: T.band[1] - T.band[0] }); add(T.blocked, 'fizz', 0.26); add(T.blocked + 0.05, 'stamp', 0.22);
  add(T.burst, 'land', 0.15); add(T.chars, 'click', 0.15); add(T.bars, 'retry', 0.2);
  add(T.guide, 'callout', 0.24); add(T.pin, 'land', 0.28); add(T.walk[0], 'dots', 0.5, { dur: T.walk[1] - T.walk[0] });
  add(T.cta, 'chime', 0.3); add(T.link[0], 'pen', 0.3, { dur: T.link[1] - T.link[0] }); add(T.hop, 'relay', 0.26);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
