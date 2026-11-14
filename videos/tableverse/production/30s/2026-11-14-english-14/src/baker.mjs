// Cut-paper baker puppet (approved design from the 2026-11-02 episode, reused unchanged): hinged limbs on
// brass split pins, chef hat, violet apron. drawBaker(ctx, st) with st = { x, y (feet), s, rise, lean,
// aL/fL, aR/fR (arm + forearm angles, 0 = hanging, + = outward/up), head, hop, eyes, mouth }.
import { C, cutPoly, cutCircle, roundRectPts, piece, withShadow, noShadow, scoreLine, splitPin } from './craft.mjs';
import { D2R } from './util.mjs';

export function drawBaker(ctx, st) {
  if (st.rise <= 0.01) { scoreLine(ctx, st.x - 40, st.y, st.x + 40, st.y); return; }
  ctx.save();
  ctx.translate(st.x, st.y - st.hop);
  ctx.scale(st.s, st.s * Math.max(0.03, st.rise));
  ctx.rotate(st.lean * D2R);
  withShadow(ctx, 7, 0.28);
  // legs + shoes
  for (const sx of [-1, 1]) {
    piece(ctx, cutPoly(roundRectPts(sx * 13 - 9, -52, 18, 50, 7), 200 + sx, 0.5, 8), C.deep, { margin: 2, grainA: 0.05 });
    piece(ctx, cutPoly(roundRectPts(sx * 13 - 15 + sx * 4, -10, 30, 14, 7), 210 + sx, 0.5, 8), C.ink, { margin: 2, grainA: 0 });
  }
  const arm = (side, a, fa) => {
    // side -1 = left (outward to -x), +1 = right
    const sh = [side * 38, -138];
    const d1 = [side * Math.sin(a * D2R), Math.cos(a * D2R)];
    const el = [sh[0] + d1[0] * 44, sh[1] + d1[1] * 44];
    const a2 = a + fa;
    const d2 = [side * Math.sin(a2 * D2R), Math.cos(a2 * D2R)];
    const hd = [el[0] + d2[0] * 40, el[1] + d2[1] * 40];
    const seg = (p, q, w, col, seed) => {
      const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
      const nx = (-dy / l) * w / 2, ny = (dx / l) * w / 2;
      piece(ctx, cutPoly([[p[0] + nx, p[1] + ny], [q[0] + nx, q[1] + ny], [q[0] - nx, q[1] - ny], [p[0] - nx, p[1] - ny]], seed, 0.5, 8), col, { margin: 2, grainA: 0.05 });
    };
    seg(sh, el, 20, '#FFFFFF', 220 + side);
    seg(el, hd, 18, '#FFFFFF', 230 + side);
    piece(ctx, cutCircle(hd[0], hd[1], 11, 11, 240 + side, 0.5, 14), '#E9B48C', { margin: 2, grainA: 0.05 });
    return [sh, el];
  };
  // back arm first
  const pinsL = arm(-1, st.aL, st.fL);
  // torso: chef jacket + violet apron
  piece(ctx, cutPoly([[-44, -50], [44, -50], [36, -150], [-36, -150]], 250, 0.8, 10), '#FFFFFF', { margin: 2, grainA: 0.06 });
  noShadow(ctx);
  piece(ctx, cutPoly([[-34, -54], [34, -54], [28, -128], [-28, -128]], 251, 0.7, 10), C.violet, { grainA: 0.08 });
  piece(ctx, cutPoly(roundRectPts(-16, -96, 32, 22, 6), 252, 0.4, 8), C.purple, { grainA: 0.05 });
  ctx.fillStyle = C.lilac; for (const by of [-136, -120]) { ctx.beginPath(); ctx.arc(0, by, 3.2, 0, Math.PI * 2); ctx.fill(); }
  withShadow(ctx, 7, 0.28);
  // head
  ctx.save();
  ctx.translate(0, -186);
  ctx.rotate(st.head * D2R);
  piece(ctx, cutCircle(0, 0, 36, 36, 260, 0.8, 30), '#F1C19A', { margin: 2, grainA: 0.06 });
  noShadow(ctx);
  ctx.fillStyle = 'rgba(255,120,140,0.45)'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 20, 10, 7, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    if (st.eyes === 'open') { ctx.beginPath(); ctx.arc(sx * 12, -4, 4.6, 0, Math.PI * 2); ctx.fill(); }
    else if (st.eyes === 'happy') { ctx.beginPath(); ctx.arc(sx * 12, -1, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(sx * 12 - 5, -3); ctx.lineTo(sx * 12 + 5, -3); ctx.stroke(); }
  }
  if (st.mouth === 'open') { ctx.beginPath(); ctx.arc(0, 10, 9, 0, Math.PI); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0, 6, 10, Math.PI * 0.18, Math.PI * 0.82); ctx.stroke(); }
  // moustache-free friendly face; chef hat
  withShadow(ctx, 6, 0.25);
  piece(ctx, cutPoly(roundRectPts(-30, -52, 60, 22, 6), 270, 0.5, 8), '#FFFFFF', { margin: 2, grainA: 0.05 });
  noShadow(ctx);
  for (const [hx, hy, hr] of [[-20, -66, 18], [0, -78, 22], [20, -66, 18]]) piece(ctx, cutCircle(hx, hy, hr, hr, 280 + hx, 0.6, 20), '#FFFFFF', { grainA: 0.05, edge: 'rgba(40,20,60,0.18)' });
  ctx.fillStyle = C.lilac; ctx.fillRect(-30, -40, 60, 5);
  ctx.restore();
  withShadow(ctx, 7, 0.28);
  const pinsR = arm(1, st.aR, st.fR);
  noShadow(ctx);
  // brass split pins at the hinged joints (visible construction)
  for (const [p, q] of [pinsL, pinsR]) { splitPin(ctx, p[0], p[1], 5); splitPin(ctx, q[0], q[1], 4.5); }
  splitPin(ctx, 0, -152, 4.5);
  for (const sx of [-1, 1]) splitPin(ctx, sx * 13, -50, 4);
  ctx.restore();
  scoreLine(ctx, st.x - 46, st.y + 2, st.x + 46, st.y + 2, 'rgba(42,22,80,0.3)', 2);
}
