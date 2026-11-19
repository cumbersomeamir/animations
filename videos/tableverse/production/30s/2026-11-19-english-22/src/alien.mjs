// Cut-paper alien puppet (new for english-22), built like the approved baker / mouse / octopus puppets: layered paper,
// white cut margins, brass split pins at the antenna and arm joints, soft offset shadows.
// drawAlien(ctx, a) with a = { x, y (feet), s, kind: 'guest' | 'tiny', squashX, squashY, rot (deg), hop,
//   eyes: open|happy|wide|squint|cross|dizzy|wink|look, look: [dx, dy], mouth: smile|open|o|grin|frown,
//   armL, armR (deg: 0 = down, 90 = sideways, 170 = up), antL, antR (deg tilt), antStretch (px, right antenna pulled),
//   cheeks (0..1 squish), crossed (arms crossed), dizzyT, sit (0..1: sitting on a seat) }
import { C, cutPoly, cutCircle, roundRectPts, piece, withShadow, noShadow, splitPin } from './craft.mjs';
import { D2R, clamp } from './util.mjs';

const KIND = {
  guest: { body: '#C9A2FB', dark: '#9C6BEA', belly: '#EBDDFF', ball: C.yellow },
  tiny: { body: '#FF8A1E', dark: '#D95A00', belly: '#FFD7A8', ball: C.cyan },
};

export function drawAlien(ctx, a) {
  const k = KIND[a.kind || 'guest'];
  const s = a.s ?? 1;
  ctx.save();
  ctx.translate(a.x, a.y - (a.hop || 0));
  if (a.rot) ctx.rotate(a.rot * D2R);
  ctx.scale(s * (a.squashX ?? 1), s * (a.squashY ?? 1));
  const sit = a.sit ?? 0;
  // feet (hidden when sitting)
  withShadow(ctx, 5, 0.26);
  if (sit < 0.5) for (const sx of [-1, 1]) piece(ctx, cutPoly(roundRectPts(sx * 20 - 14, -12, 28, 14, 7), 7001 + sx, 0.4, 6), k.dark, { margin: 2, grainA: 0 });
  // antennae (behind the head), on split pins
  const ant = (side, deg, stretch) => {
    const bx = side * 18, by = -96;
    const a0 = (deg + side * 14) * D2R, L = 30 + stretch;
    const tx = bx + Math.sin(a0) * L, ty = by - Math.cos(a0) * L;
    ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.strokeStyle = k.dark; ctx.lineWidth = 3; ctx.stroke();
    piece(ctx, cutCircle(tx, ty, 9, 9, 7010 + side, 0.5, 18), k.ball, { margin: 2, grainA: 0.04 });
    return [bx, by];
  };
  const pL = ant(-1, a.antL || 0, 0), pR = ant(1, a.antR || 0, a.antStretch || 0);
  // body: one rounded blob (head and body together)
  const body = cutCircle(0, -52, 46, 52, 7020, 0.8, 44);
  const g = ctx.createRadialGradient(-16, -78, 6, 0, -52, 60);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.18, k.body); g.addColorStop(1, k.dark);
  piece(ctx, body, g, { margin: 3, grainA: 0.08 });
  noShadow(ctx);
  piece(ctx, cutCircle(0, -30, 26, 22, 7021, 0.5, 30), k.belly, { grainA: 0.04, edge: null });
  splitPin(ctx, pL[0], pL[1], 3.5); splitPin(ctx, pR[0], pR[1], 3.5);
  // arms
  const arm = (side, deg) => {
    const sh = [side * 40, -50];
    const r = deg * D2R;
    const hx = sh[0] + side * Math.sin(r) * 26, hy = sh[1] + Math.cos(r) * 26;
    ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(...sh); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = k.body; ctx.lineWidth = 7; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy, 6.5, 0, Math.PI * 2); ctx.fillStyle = k.dark; ctx.fill();
    splitPin(ctx, sh[0], sh[1], 3.2);
  };
  if (a.crossed) {
    // arms folded across the tummy: the impatient pose
    ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(-40, -50); ctx.lineTo(16, -34); ctx.moveTo(40, -50); ctx.lineTo(-16, -30); ctx.stroke();
    ctx.strokeStyle = k.body; ctx.lineWidth = 7; ctx.stroke();
  } else { arm(-1, a.armL ?? 15); arm(1, a.armR ?? 15); }
  // cheeks (squished against the crowd)
  const ch = a.cheeks ?? 0;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 30, -50, 9 + 5 * ch, 6 + 2 * ch, 0, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,110,160,${0.45 + 0.3 * ch})`; ctx.fill(); }
  // eyes
  const ey = a.eyes || 'open';
  const [lx, ly] = a.look || [0, 0];
  ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink;
  for (const sx of [-1, 1]) {
    const ex = sx * 17, eyY = -66;
    if (ey === 'happy' || (ey === 'wink' && sx > 0)) { ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ex, eyY + 4, 9, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); continue; }
    if (ey === 'squint') { ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ex - 9, eyY - 4 * sx * -1); ctx.lineTo(ex + 9, eyY); ctx.lineTo(ex - 9, eyY + 4 * sx * -1 + 6); ctx.stroke(); continue; }
    const big = ey === 'wide' ? 1.3 : 1;
    ctx.beginPath(); ctx.ellipse(ex, eyY, 12 * big, 14 * big, 0, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.stroke();
    if (ey === 'dizzy') {
      ctx.lineWidth = 2.2; ctx.beginPath();
      for (let i = 0; i <= 22; i++) { const an = (a.dizzyT || 0) * sx + i * 0.55, r = 0.45 * i; const px = ex + Math.cos(an) * r, py = eyY + Math.sin(an) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); continue;
    }
    const pr = ey === 'wide' ? 4.5 : 6.5;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * 4, eyY + clamp(ly, -1, 1) * 5, pr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * 4 + 2, eyY + clamp(ly, -1, 1) * 5 - 2.5, pr * 0.35, 0, Math.PI * 2); ctx.fill();
    if (ey === 'cross') { // cross brows: impatient
      ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(ex - 12 * sx * -1, eyY - 20); ctx.lineTo(ex + 10 * sx * -1, eyY - 12); ctx.stroke();
    }
  }
  // mouth
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5;
  const m = a.mouth || 'smile';
  if (m === 'open') { ctx.beginPath(); ctx.ellipse(0, -38, 9, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FF8FB8'; ctx.beginPath(); ctx.ellipse(0, -35, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'o') { ctx.beginPath(); ctx.ellipse(0, -38, 5, 6.5, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(-14, -44); ctx.quadraticCurveTo(0, -26, 14, -45); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-5, -44, 10, 4); }
  else if (m === 'frown') { ctx.beginPath(); ctx.arc(0, -30, 9, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0, -46, 10, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  ctx.restore();
}
