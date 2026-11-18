// Playful cut-paper mouse puppet (english-16): hinged arms, ears and a wagging tail on brass split pins,
// same construction as the approved baker. drawMouse(ctx, m) with m = { x, y (feet), s, hop, arm (deg, 0 = down,
// 90 = reaching right, 160 = up), arm2, tail (deg wag), eyes: open|happy|sleep, squash,
// belly (1 = normal, >1 = rounder after eating; english-19), mouth: smile|open (chewing) }.
// english-20 comic options (approved look unchanged): eyes wide|dizzy|sly|wink, mouth gasp|grin, rot (deg, about the
// feet; -90 = flat on its back), earsUp (0..1, ears shoot up in a "take"), dizzyT (spiral phase).
import { C, cutPoly, cutCircle, roundRectPts, piece, withShadow, noShadow, splitPin } from './craft.mjs';
import { D2R } from './util.mjs';

const FUR = '#B9AEDC', FUR_DK = '#9283C2', BELLY = '#ECE6FA', PINK = '#FF9EC0';

export function drawMouse(ctx, m) {
  const s = m.s ?? 1, sq = m.squash ?? 1;
  ctx.save();
  ctx.translate(m.x, m.y - (m.hop || 0));
  if (m.rot) ctx.rotate(m.rot * D2R);
  ctx.scale(s / Math.sqrt(sq), s * sq);
  // tail (behind), hinged at the hip on a split pin
  const ta = (m.tail || 0) * D2R;
  ctx.save(); ctx.translate(-20, -18); ctx.rotate(ta);
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-34, 6, -46, -30, -26, -52); ctx.stroke();
  ctx.strokeStyle = PINK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-34, 6, -46, -30, -26, -52); ctx.stroke();
  ctx.restore();
  withShadow(ctx, 6, 0.28);
  // feet
  for (const sx of [-1, 1]) piece(ctx, cutPoly(roundRectPts(sx * 12 - 11, -8, 22, 10, 5), 1600 + sx, 0.4, 6), PINK, { margin: 2, grainA: 0 });
  // body
  const bl = m.belly ?? 1;
  piece(ctx, cutCircle(0, -36, 27 * bl, 32 + 4 * (bl - 1), 1610, 0.8, 30), FUR, { margin: 2.5, grainA: 0.08 });
  noShadow(ctx);
  piece(ctx, cutCircle(0, -30, 16 * bl * bl, 20 + 4 * (bl - 1), 1611, 0.5, 24), BELLY, { grainA: 0.04, edge: null });
  // arms (hinged at the shoulders)
  const arm = (side, deg) => {
    const sh = [side * 18 * bl, -50];
    const a = deg * D2R;
    const hx = sh[0] + side * Math.sin(a) * 22, hy = sh[1] + Math.cos(a) * 22;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...sh); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = FUR_DK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(...sh); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy, 5.5, 0, Math.PI * 2); ctx.fillStyle = PINK; ctx.fill();
    splitPin(ctx, sh[0], sh[1], 3.5);
  };
  arm(-1, m.arm2 ?? 20);
  arm(1, m.arm ?? 20);
  // head + ears (ears on split pins wiggle a little)
  withShadow(ctx, 5, 0.25);
  const ew = (m.ears || 0) * D2R;
  for (const sx of [-1, 1]) {
    ctx.save(); ctx.translate(sx * 20, -92 - 10 * (m.earsUp || 0)); ctx.rotate(sx * ew - sx * 0.35 * (m.earsUp || 0));
    piece(ctx, cutCircle(0, -10, 17, 17, 1620 + sx, 0.5, 24), FUR, { margin: 2.5, grainA: 0.06 });
    noShadow(ctx); piece(ctx, cutCircle(0, -10, 10, 10, 1622 + sx, 0.4, 18), PINK, { grainA: 0, edge: null });
    withShadow(ctx, 5, 0.25);
    ctx.restore();
    splitPin(ctx, sx * 20, -92 - 10 * (m.earsUp || 0), 3);
  }
  piece(ctx, cutCircle(0, -80, 25, 22, 1630, 0.6, 28), FUR, { margin: 2.5, grainA: 0.06 });
  noShadow(ctx);
  // face
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    const ey = m.eyes || 'open';
    if (ey === 'happy' || (ey === 'wink' && sx > 0)) { ctx.beginPath(); ctx.arc(sx * 9, -82, 5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    else if (ey === 'sleep') { ctx.beginPath(); ctx.arc(sx * 9, -84, 5, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
    else if (ey === 'wide') {
      // cartoon "take": big white eyes, tiny pupils
      ctx.beginPath(); ctx.ellipse(sx * 10, -86, 8, 9.5, 0, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(sx * 10, -85, 3, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); ctx.lineWidth = 3;
    } else if (ey === 'dizzy') {
      ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 26; i++) { const a = (m.dizzyT || 0) * sx + i * 0.55, r = 0.3 * i; const px = sx * 9 + Math.cos(a) * r, py = -84 + Math.sin(a) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); ctx.lineWidth = 3;
    } else if (ey === 'sly') {
      // half-lidded, looking sideways: the sneaky plan
      ctx.beginPath(); ctx.arc(sx * 9 + 2, -84, 3.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = FUR; ctx.fillRect(sx * 9 - 6, -92, 12, 7); ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.moveTo(sx * 9 - 6, -85.5); ctx.lineTo(sx * 9 + 6, -85.5 - sx * 1.5); ctx.stroke();
    }
    else { ctx.beginPath(); ctx.arc(sx * 9, -84, 3.8, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(sx * 9 + 1.2, -85.5, 1.2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.fillStyle = C.ink; }
  }
  ctx.beginPath(); ctx.ellipse(0, -73, 5, 4, 0, 0, Math.PI * 2); ctx.fillStyle = PINK; ctx.fill();
  if (m.mouth === 'gasp') { ctx.beginPath(); ctx.ellipse(0, -62, 8, 11, 0, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); ctx.fillStyle = PINK; ctx.beginPath(); ctx.ellipse(0, -57, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m.mouth === 'grin') { ctx.beginPath(); ctx.moveTo(-9, -70); ctx.quadraticCurveTo(0, -58, 10, -71); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-2.5, -69, 5, 3.5); }
  else if (m.mouth === 'open') { ctx.beginPath(); ctx.ellipse(0, -66, 5.5, 6.5, 0, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); ctx.fillStyle = PINK; ctx.beginPath(); ctx.ellipse(0, -63.5, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, -70, 6, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(42,22,80,0.55)'; ctx.lineWidth = 1.6;
  for (const sx of [-1, 1]) for (const dy of [-3, 1, 5]) { ctx.beginPath(); ctx.moveTo(sx * 9, -73 + dy * 0.5); ctx.lineTo(sx * 30, -76 + dy * 1.4); ctx.stroke(); }
  ctx.restore();
}

/** world position of a paw (side -1 / +1 before flipping) for props held by the mouse */
export function mousePaw(m, side) {
  const s = m.s ?? 1, sq = m.squash ?? 1, bl = m.belly ?? 1;
  const deg = side > 0 ? (m.arm ?? 20) : (m.arm2 ?? 20);
  const a = deg * D2R;
  let px = side * 18 * bl + side * Math.sin(a) * 22, py = -50 + Math.cos(a) * 22;
  px *= s / Math.sqrt(sq); py *= s * sq;
  const r = (m.rot || 0) * D2R;
  let wx = px * Math.cos(r) - py * Math.sin(r), wy = px * Math.sin(r) + py * Math.cos(r);
  if (m.flip) wx = -wx;
  return [m.x + wx, m.y - (m.hop || 0) + wy];
}
