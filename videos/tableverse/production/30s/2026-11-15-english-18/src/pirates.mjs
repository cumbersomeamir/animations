// english-18 cut-paper pirate props: identical sailor friends (the counted objects), rowboat hulls, wave crests,
// the rescue ship and its flag. All original drawings in the approved Pop-up Counting Storybook construction
// (white cut margins, soft layer shadows, grain).
import { C, cutPoly, cutCircle, roundRectPts, pathFrom, piece, withShadow, noShadow } from './craft.mjs';

const SKIN = '#F6C9A3', SHIRT = '#FFFDF8', STRIPE = C.violet, BANDANA = C.orange;
export const FRIEND_HANDS = { lx: -19, rx: 19, y: -21 };

/** one friend; feet at (x, y). o = { s, cheer (0..1), blink (bool), bob } */
export function drawFriend(ctx, x, y, o = {}) {
  const s = o.s ?? 1, ch = o.cheer || 0;
  ctx.save(); ctx.translate(x, y - (o.bob || 0)); ctx.scale(s, s);
  withShadow(ctx, 3, 0.25);
  // legs
  ctx.fillStyle = C.deep;
  ctx.beginPath(); ctx.roundRect(-11, -14, 8, 14, 3); ctx.roundRect(3, -14, 8, 14, 3); ctx.fill();
  // arms: down at the sides, raised when cheering
  ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    const hx = sx * (19 + 4 * ch), hy = -21 - 44 * ch;
    ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(sx * 13, -38); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = SKIN; ctx.lineWidth = 5.5; ctx.stroke();
  }
  // striped shirt
  const body = cutPoly(roundRectPts(-16, -46, 32, 34, 11), 2001, 0.4, 8);
  piece(ctx, body, SHIRT, { margin: 2.5, grainA: 0.04 });
  noShadow(ctx);
  ctx.save(); pathFrom(ctx, body); ctx.clip();
  ctx.fillStyle = STRIPE; for (let k = 0; k < 4; k++) ctx.fillRect(-18, -42 + k * 9, 36, 4);
  ctx.restore();
  // head + bandana
  withShadow(ctx, 3, 0.22);
  piece(ctx, cutCircle(0, -60, 15, 15, 2002, 0.4, 22), SKIN, { margin: 2.5, grainA: 0.04 });
  noShadow(ctx);
  ctx.save(); ctx.beginPath(); ctx.arc(0, -60, 15.5, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fillStyle = BANDANA; ctx.fill(); ctx.restore();
  ctx.fillStyle = BANDANA; ctx.beginPath(); ctx.moveTo(13, -66); ctx.lineTo(23, -72); ctx.lineTo(22, -60); ctx.closePath(); ctx.fill();
  // face
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
  if (o.blink) { ctx.lineWidth = 2; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 6 - 2.5, -58); ctx.lineTo(sx * 6 + 2.5, -58); ctx.stroke(); } }
  else for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 6, -58, 2.3, 0, Math.PI * 2); ctx.fill(); }
  ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -54, ch > 0.3 ? 6 : 4.5, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  ctx.fillStyle = 'rgba(255,120,140,0.35)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 10, -53, 3, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

/** buddy rope between two hand points */
export function drawRope(ctx, x0, y0, x1, y1, a = 1, glow = 0) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
  const mx = (x0 + x1) / 2, my = Math.max(y0, y1) + 7;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1);
  if (glow > 0.01) { ctx.strokeStyle = `rgba(255,236,120,${0.7 * glow})`; ctx.lineWidth = 18; ctx.stroke(); }
  ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 10; ctx.stroke();
  ctx.strokeStyle = C.orange; ctx.lineWidth = 6; ctx.stroke();
  ctx.restore();
}

/** buddy-rope loop around a pair's waists: back half drawn before the two friends, front half after */
export function drawLoopHalf(ctx, cx, cy, rx, ry, half, a = 1, glow = 0) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
  ctx.beginPath();
  if (half === 'back') ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2);
  else ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  if (glow > 0.01) { ctx.strokeStyle = `rgba(255,236,120,${0.75 * glow})`; ctx.lineWidth = 20; ctx.stroke(); }
  ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 12; ctx.stroke();
  ctx.strokeStyle = half === 'back' ? '#C9590A' : C.orange; ctx.lineWidth = 7; ctx.stroke();
  ctx.restore();
}

/** rowboat hull (front layer): top edge at y = 0 */
export function drawHull(ctx, x, y, rot = 0, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (glow > 0.01) {
    const g = ctx.createRadialGradient(0, -20, 20, 0, -20, 200);
    g.addColorStop(0, `rgba(255,224,130,${0.45 * glow})`); g.addColorStop(1, 'rgba(255,224,130,0)');
    ctx.fillStyle = g; ctx.fillRect(-200, -120, 400, 220);
  }
  withShadow(ctx, 6, 0.3);
  const hull = cutPoly([[-160, -10], [160, -10], [134, 44], [0, 54], [-134, 44]], 2010, 0.9, 12);
  piece(ctx, hull, '#C98B4E', { margin: 3, grainA: 0.14 });
  noShadow(ctx);
  ctx.save(); pathFrom(ctx, hull); ctx.clip();
  ctx.fillStyle = C.violet; ctx.fillRect(-170, 6, 340, 11);
  ctx.strokeStyle = 'rgba(90,50,20,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-150, 30); ctx.lineTo(150, 30); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/** scalloped wave crest strip centred at x, top at y */
export function drawCrest(ctx, x, y, w, phase, col = '#A4DEF5') {
  // low wave in front of a hull: only the scalloped top edge is outlined, the ends taper into the sea
  ctx.save(); ctx.translate(x, y);
  const n = Math.round(w / 30), top = [];
  for (let i = 0; i <= n; i++) { const e = i === 0 || i === n ? 8 : 0; top.push([-w / 2 + (i * w) / n, 6 + e + 4 * Math.sin(i * 1.7 + phase)]); }
  const crest = () => { ctx.beginPath(); ctx.moveTo(...top[0]); for (let i = 0; i < n; i++) { const [x0, y0] = top[i], [x1, y1] = top[i + 1]; ctx.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 9, x1, y1); } };
  crest(); ctx.lineTo(w / 2 - 16, 24); ctx.quadraticCurveTo(0, 32, -w / 2 + 16, 24); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  crest(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
}

/** rescue ship hull + rail (front layer, drawn over the friends on deck) */
export function drawShipHull(ctx, glow = 0) {
  withShadow(ctx, 10, 0.35);
  const hull = cutPoly([[250, 1306], [990, 1290], [1012, 1258], [1000, 1300], [936, 1472], [326, 1472], [256, 1352]], 2020, 1.2, 14);
  piece(ctx, hull, '#2F1A8F', { margin: 3.5, grainA: 0.1 });
  noShadow(ctx);
  ctx.save(); pathFrom(ctx, hull); ctx.clip();
  ctx.fillStyle = '#C98B4E'; ctx.fillRect(200, 1290, 860, 22);
  ctx.fillStyle = C.yellow; ctx.fillRect(200, 1350, 860, 9);
  ctx.restore();
  for (let k = 0; k < 6; k++) {
    const px = 390 + k * 100;
    piece(ctx, cutCircle(px, 1408, 15, 15, 2030 + k, 0.3, 18), glow > 0.05 ? '#FFF2B0' : C.cream, { margin: 0, grainA: 0, edge: C.yellow });
  }
}

/** pirate flag on a pole at the stern; the emblem is the app's yellow "×", not a skull */
export function drawFlag(ctx, f) {
  const px = 258, top = 1180;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px, 1300); ctx.lineTo(px, top); ctx.stroke();
  const wv = (i) => 4 * Math.sin(f * 0.15 + i);
  withShadow(ctx, 4, 0.25);
  piece(ctx, [[px + 2, top + 4], [px + 30, top + 6 + wv(1)], [px + 58, top + 4 + wv(2)], [px + 57, top + 44 + wv(2)], [px + 30, top + 46 + wv(1)], [px + 2, top + 42]], C.violet, { margin: 2.5, grainA: 0.05 });
  noShadow(ctx);
  ctx.strokeStyle = C.yellow; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(px + 20, top + 14); ctx.lineTo(px + 40, top + 34); ctx.moveTo(px + 40, top + 14); ctx.lineTo(px + 20, top + 34); ctx.stroke();
}
