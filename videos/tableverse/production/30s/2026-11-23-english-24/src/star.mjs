// Cut-paper star character (new for english-24), built like the approved puppets: layered paper, white cut margin,
// soft offset shadow, a brass split pin at the centre. Its five points are its head, arms and legs.
// drawStar(ctx, s) with s = { x, y (bottom point), size (point radius, px), rot (deg), squashX, squashY, hop,
//   eyes: open|happy|wide|tired|dizzy|wink|look, look: [dx, dy], mouth: smile|open|o|grin|puff, armWave (deg),
//   cheeks (0..1), dizzyT, shine (0..1 sparkle) }
import { C, cutPoly, piece, withShadow, noShadow, splitPin, sparkle } from './craft.mjs';
import { D2R, clamp } from './util.mjs';

export function drawStar(ctx, s) {
  const R = s.size ?? 60, r = R * 0.52;
  ctx.save();
  // the star stands on its two lower points; (x, y) = ground under it
  ctx.translate(s.x, s.y - (s.hop || 0) - R * 0.82);
  if (s.rot) ctx.rotate(s.rot * D2R);
  ctx.scale(s.squashX ?? 1, s.squashY ?? 1);
  const wave = (s.armWave || 0) * D2R;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    let a = -Math.PI / 2 + (i * Math.PI) / 5;
    // the two "arm" points (i = 2 and 8) swing a little when waving
    if (i === 2) a -= wave; if (i === 8) a += wave * 0.6;
    const rr = i % 2 ? r : R;
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  withShadow(ctx, 8, 0.3);
  const g = ctx.createRadialGradient(-R * 0.25, -R * 0.35, R * 0.1, 0, 0, R * 1.1);
  g.addColorStop(0, '#FFF7B0'); g.addColorStop(0.5, C.yellow); g.addColorStop(1, '#F2B01E');
  ctx.lineJoin = 'round';
  piece(ctx, cutPoly(pts, 9801, 0.8, 8), g, { margin: 3.5, grainA: 0.08, edge: 'rgba(200,90,0,0.6)' });
  noShadow(ctx);
  // cheeks
  const ch = s.cheeks ?? 0.4;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * R * 0.3, R * 0.06, R * 0.11, R * 0.07, 0, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,120,80,${0.35 + 0.4 * ch})`; ctx.fill(); }
  // eyes
  const ey = s.eyes || 'open';
  const [lx, ly] = s.look || [0, 0];
  const er = R * 0.12;
  ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink;
  for (const sx of [-1, 1]) {
    const ex = sx * R * 0.17, eyY = -R * 0.1;
    if (ey === 'happy' || (ey === 'wink' && sx > 0)) { ctx.lineWidth = R * 0.06; ctx.beginPath(); ctx.arc(ex, eyY + er * 0.4, er * 0.9, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); continue; }
    if (ey === 'tired') { ctx.lineWidth = R * 0.055; ctx.beginPath(); ctx.moveTo(ex - er, eyY); ctx.lineTo(ex + er, eyY + er * 0.2); ctx.stroke(); continue; }
    const big = ey === 'wide' ? 1.3 : 1;
    ctx.beginPath(); ctx.ellipse(ex, eyY, er * big, er * 1.2 * big, 0, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = R * 0.035; ctx.stroke();
    if (ey === 'dizzy') {
      ctx.lineWidth = R * 0.03; ctx.beginPath();
      for (let k = 0; k <= 22; k++) { const an = (s.dizzyT || 0) * sx + k * 0.55, rr = er * 0.045 * k; const px = ex + Math.cos(an) * rr, py = eyY + Math.sin(an) * rr; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); continue;
    }
    const pr = er * (ey === 'wide' ? 0.42 : 0.6);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * er * 0.35, eyY + clamp(ly, -1, 1) * er * 0.4, pr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * er * 0.35 + pr * 0.4, eyY + clamp(ly, -1, 1) * er * 0.4 - pr * 0.4, pr * 0.35, 0, Math.PI * 2); ctx.fill();
  }
  // mouth
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = R * 0.05;
  const m = s.mouth || 'smile', my = R * 0.18;
  if (m === 'open') { ctx.beginPath(); ctx.ellipse(0, my, R * 0.11, R * 0.1, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FF8FB8'; ctx.beginPath(); ctx.ellipse(0, my + R * 0.04, R * 0.06, R * 0.035, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'o') { ctx.beginPath(); ctx.ellipse(0, my, R * 0.06, R * 0.075, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'puff') { ctx.beginPath(); ctx.ellipse(0, my, R * 0.12, R * 0.05, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(-R * 0.16, my - R * 0.04); ctx.quadraticCurveTo(0, my + R * 0.2, R * 0.16, my - R * 0.04); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-R * 0.06, my - R * 0.04, R * 0.12, R * 0.05); }
  else { ctx.beginPath(); ctx.arc(0, my - R * 0.06, R * 0.12, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  splitPin(ctx, 0, R * 0.42, R * 0.06);
  ctx.restore();
  if ((s.shine || 0) > 0.01) sparkle(ctx, s.x + R * 0.8, s.y - (s.hop || 0) - R * 1.6, 26 * s.shine, '#FFFFFF');
}
