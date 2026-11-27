// Cut-paper frog drummer puppet (new for english-25), built like the approved puppets: layered paper, white cut margins,
// brass split pins at the shoulders, soft offset shadows. Sits behind its drum; both sticks swing on split pins.
// drawFrog(ctx, f) with f = { x, y (seat), s, squashX, squashY, hop, eyes: open|happy|wide|closed|wink, look: [dx, dy],
//   mouth: smile|open|o|grin, stickL, stickR (0 = resting on the drum, 1 = raised high), tie (bow tie colour), cap (bool) }
// drawDrum(ctx, x, y, r, col, hit (0..1 flash))
import { C, cutPoly, cutCircle, roundRectPts, piece, withShadow, noShadow, splitPin } from './craft.mjs';
import { clamp, lerp } from './util.mjs';

const SKIN = '#58C98B', SKIN_DK = '#2E9A63', BELLY = '#E9F7D8';

export function drawFrog(ctx, fr) {
  const s = fr.s ?? 1;
  ctx.save();
  ctx.translate(fr.x, fr.y - (fr.hop || 0));
  ctx.scale(s * (fr.squashX ?? 1), s * (fr.squashY ?? 1));
  // back legs (folded, webbed feet)
  withShadow(ctx, 6, 0.26);
  for (const sx of [-1, 1]) {
    piece(ctx, cutCircle(sx * 58, -22, 34, 24, 9601 + sx, 0.6, 26), SKIN_DK, { margin: 2.5, grainA: 0.06 });
    piece(ctx, cutPoly([[sx * 62, -6], [sx * 98, 4], [sx * 104, -6], [sx * 92, -14], [sx * 70, -14]], 9603 + sx, 0.4, 8), C.orange, { margin: 2, grainA: 0.03 });
  }
  // body
  const g = ctx.createRadialGradient(-20, -110, 8, 0, -80, 110);
  g.addColorStop(0, '#A6EFC4'); g.addColorStop(0.5, SKIN); g.addColorStop(1, SKIN_DK);
  piece(ctx, cutCircle(0, -78, 76, 70, 9610, 0.9, 46), g, { margin: 3, grainA: 0.08 });
  noShadow(ctx);
  piece(ctx, cutCircle(0, -56, 46, 38, 9611, 0.5, 32), BELLY, { grainA: 0.04, edge: null });
  // spots
  for (const [dx, dy, r] of [[-48, -112, 8], [44, -120, 6], [56, -86, 5]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(46,154,99,0.6)'; ctx.fill(); }
  // eyes on top
  const ey = fr.eyes || 'open';
  const [lx, ly] = fr.look || [0, 0];
  for (const sx of [-1, 1]) {
    withShadow(ctx, 5, 0.25);
    piece(ctx, cutCircle(sx * 36, -146, 28, 28, 9620 + sx, 0.6, 28), SKIN, { margin: 2.5, grainA: 0.05 });
    noShadow(ctx);
    const ex = sx * 36, eyY = -148;
    ctx.lineCap = 'round'; ctx.strokeStyle = C.ink;
    if (ey === 'happy' || (ey === 'wink' && sx > 0)) { ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(ex, eyY + 6, 13, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); continue; }
    if (ey === 'closed') { ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(ex, eyY - 4, 13, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); continue; }
    const big = ey === 'wide' ? 1.2 : 1;
    ctx.beginPath(); ctx.arc(ex, eyY, 19 * big, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke();
    const pr = ey === 'wide' ? 6 : 9;
    ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * 7, eyY + clamp(ly, -1, 1) * 7, pr, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * 7 + 3, eyY + clamp(ly, -1, 1) * 7 - 3, pr * 0.35, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  }
  // mouth: a wide frog grin
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  const m = fr.mouth || 'smile';
  if (m === 'open') { ctx.beginPath(); ctx.moveTo(-40, -104); ctx.quadraticCurveTo(0, -60, 40, -104); ctx.quadraticCurveTo(0, -92, -40, -104); ctx.fill(); ctx.fillStyle = '#FF8FB8'; ctx.beginPath(); ctx.ellipse(0, -82, 14, 6, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'o') { ctx.beginPath(); ctx.ellipse(0, -92, 10, 12, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(-44, -104); ctx.quadraticCurveTo(0, -70, 44, -104); ctx.quadraticCurveTo(0, -88, -44, -104); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(-42, -102); ctx.quadraticCurveTo(0, -80, 42, -102); ctx.stroke(); }
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 52, -96, 9, 6, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,120,170,0.5)'; ctx.fill(); }
  // bow tie or cap
  if (fr.tie) { piece(ctx, cutPoly([[0, -66], [-24, -78], [-24, -54], [0, -66], [24, -78], [24, -54]], 9630, 0.4, 6), fr.tie, { margin: 2, grainA: 0.04 }); piece(ctx, cutCircle(0, -66, 6, 6, 9631, 0.3, 12), C.yellow, { grainA: 0 }); }
  if (fr.cap) {
    withShadow(ctx, 4, 0.25);
    piece(ctx, cutPoly([[-34, -172], [-30, -196], [0, -206], [30, -196], [34, -172]], 9640, 0.5, 8), C.orange, { margin: 2.5, grainA: 0.05 });
    piece(ctx, cutPoly([[24, -176], [64, -172], [60, -164], [24, -166]], 9641, 0.4, 6), C.orange, { margin: 2, grainA: 0.04 });
    noShadow(ctx);
  }
  // arms with drumsticks (hinged at the shoulders); 0 = stick tip on the drum, 1 = raised high
  for (const [sx, k] of [[-1, fr.stickL ?? 0], [1, fr.stickR ?? 0]]) {
    const sh = [sx * 58, -78];
    // rest: the stick tip touches the drumhead in front; raised: the stick points up and out
    const hand = [sx * lerp(54, 70, k), lerp(-44, -128, k)];
    const tip = [sx * lerp(18, 86, k), lerp(-26, -196, k)];
    ctx.lineCap = 'round'; ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(...sh); ctx.lineTo(...hand); ctx.stroke();
    ctx.strokeStyle = SKIN; ctx.lineWidth = 14; ctx.stroke();
    splitPin(ctx, sh[0], sh[1], 4);
    ctx.strokeStyle = '#8A5A24'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(...hand); ctx.lineTo(...tip); ctx.stroke();
    ctx.beginPath(); ctx.arc(tip[0], tip[1], 9, 0, Math.PI * 2); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.arc(hand[0], hand[1], 9, 0, Math.PI * 2); ctx.fillStyle = SKIN_DK; ctx.fill();
  }
  ctx.restore();
}

export function drawDrum(ctx, x, y, r, col, hit = 0) {
  // front view of a drum: body + top head (ellipse); a hit flashes the head and squashes it a little
  const h = r * 1.0, ry = r * 0.34 * (1 - 0.15 * hit);
  ctx.save();
  withShadow(ctx, 8, 0.3);
  ctx.beginPath(); ctx.moveTo(x - r, y - h); ctx.lineTo(x - r * 0.94, y); ctx.ellipse(x, y, r * 0.94, r * 0.3, 0, Math.PI, 0, true); ctx.lineTo(x + r, y - h); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  noShadow(ctx);
  // zig-zag rope
  ctx.strokeStyle = 'rgba(255,253,248,0.9)'; ctx.lineWidth = 4; ctx.beginPath();
  for (let k = 0; k <= 8; k++) { const px = x - r * 0.92 + (k * r * 1.84) / 8, py = k % 2 ? y - h * 0.2 : y - h * 0.8; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(42,22,80,0.25)'; ctx.fillRect(x - r, y - h, 2 * r, 8);
  // head
  ctx.beginPath(); ctx.ellipse(x, y - h, r, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = hit > 0.05 ? `rgba(255,${246 - 20 * hit},${200 - 120 * hit},1)` : '#FFF6E6'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#FFFDF8'; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(42,22,80,0.4)'; ctx.stroke();
  ctx.restore();
}
