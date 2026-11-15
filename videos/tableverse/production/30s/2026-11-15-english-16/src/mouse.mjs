// Playful cut-paper mouse puppet (english-16): hinged arms, ears and a wagging tail on brass split pins,
// same construction as the approved baker. drawMouse(ctx, m) with m = { x, y (feet), s, hop, arm (deg, 0 = down,
// 90 = reaching right, 160 = up), arm2, tail (deg wag), eyes: open|happy, squash }.
import { C, cutPoly, cutCircle, roundRectPts, piece, withShadow, noShadow, splitPin } from './craft.mjs';
import { D2R } from './util.mjs';

const FUR = '#B9AEDC', FUR_DK = '#9283C2', BELLY = '#ECE6FA', PINK = '#FF9EC0';

export function drawMouse(ctx, m) {
  const s = m.s ?? 1, sq = m.squash ?? 1;
  ctx.save();
  ctx.translate(m.x, m.y - (m.hop || 0));
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
  piece(ctx, cutCircle(0, -36, 27, 32, 1610, 0.8, 30), FUR, { margin: 2.5, grainA: 0.08 });
  noShadow(ctx);
  piece(ctx, cutCircle(0, -30, 16, 20, 1611, 0.5, 24), BELLY, { grainA: 0.04, edge: null });
  // arms (hinged at the shoulders)
  const arm = (side, deg) => {
    const sh = [side * 18, -50];
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
    ctx.save(); ctx.translate(sx * 20, -92); ctx.rotate(sx * ew);
    piece(ctx, cutCircle(0, -10, 17, 17, 1620 + sx, 0.5, 24), FUR, { margin: 2.5, grainA: 0.06 });
    noShadow(ctx); piece(ctx, cutCircle(0, -10, 10, 10, 1622 + sx, 0.4, 18), PINK, { grainA: 0, edge: null });
    withShadow(ctx, 5, 0.25);
    ctx.restore();
    splitPin(ctx, sx * 20, -92, 3);
  }
  piece(ctx, cutCircle(0, -80, 25, 22, 1630, 0.6, 28), FUR, { margin: 2.5, grainA: 0.06 });
  noShadow(ctx);
  // face
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    if ((m.eyes || 'open') === 'happy') { ctx.beginPath(); ctx.arc(sx * 9, -82, 5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(sx * 9, -84, 3.8, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(sx * 9 + 1.2, -85.5, 1.2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.fillStyle = C.ink; }
  }
  ctx.beginPath(); ctx.ellipse(0, -73, 5, 4, 0, 0, Math.PI * 2); ctx.fillStyle = PINK; ctx.fill();
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, -70, 6, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  ctx.strokeStyle = 'rgba(42,22,80,0.55)'; ctx.lineWidth = 1.6;
  for (const sx of [-1, 1]) for (const dy of [-3, 1, 5]) { ctx.beginPath(); ctx.moveTo(sx * 9, -73 + dy * 0.5); ctx.lineTo(sx * 30, -76 + dy * 1.4); ctx.stroke(); }
  ctx.restore();
}
