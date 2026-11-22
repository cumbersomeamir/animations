// Cut-paper sleepy dragon puppet (new for english-23), built like the approved baker / mouse / robot puppets: layered
// paper, white cut margins, brass split pins at the wing and arm joints, soft offset shadows. Front-facing and chubby.
// drawDragon(ctx, d) with d = { x, y (feet), s, squashX, squashY, rot (deg), hop,
//   eyes: sleepy|closed|open|wide|happy|peek (one eye open), look: [dx, dy], mouth: smile|yawn|o|grin|snore,
//   armL, armR (deg: 0 = down, 90 = sideways, 170 = up), wing (deg flap), tail (deg wag), cap (nightcap droop 0..1) }
// drawPillow(ctx, x, y, w, h, o) — the absurd giant pillow (o = { rot, squashX, squashY, seed, puff })
import { C, cutPoly, cutCircle, roundRectPts, piece, withShadow, noShadow, splitPin } from './craft.mjs';
import { D2R, clamp } from './util.mjs';

const SKIN = '#2FBFC4', SKIN_DK = '#1A8E9A', BELLY = '#FFD9A3', BELLY_DK = '#F2B26A', WING = '#C9A2FB', HORN = C.yellow;

export function drawDragon(ctx, d) {
  const s = d.s ?? 1;
  ctx.save();
  ctx.translate(d.x, d.y - (d.hop || 0));
  if (d.rot) ctx.rotate(d.rot * D2R);
  ctx.scale(s * (d.squashX ?? 1), s * (d.squashY ?? 1));
  // tail (behind), curling out to the right with a spade tip
  const ta = (d.tail || 0) * D2R;
  ctx.save(); ctx.translate(40, -40); ctx.rotate(ta);
  withShadow(ctx, 5, 0.25);
  ctx.lineCap = 'round'; ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 30;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(60, 10, 96, -10, 104, -54); ctx.stroke();
  ctx.strokeStyle = SKIN_DK; ctx.lineWidth = 24; ctx.stroke();
  noShadow(ctx);
  piece(ctx, cutPoly([[104, -54], [86, -78], [104, -104], [124, -78]], 9001, 0.5, 8), C.orange, { margin: 2.5, grainA: 0.04 });
  ctx.restore();
  // wings on split pins (behind the body)
  const wa = (d.wing || 0) * D2R;
  for (const sx of [-1, 1]) {
    ctx.save(); ctx.translate(sx * 46, -130); ctx.rotate(-sx * (0.35 + wa));
    withShadow(ctx, 5, 0.25);
    piece(ctx, cutPoly([[0, 0], [sx * 70, -54], [sx * 82, -10], [sx * 62, 6], [sx * 46, 24], [sx * 22, 20]], 9010 + sx, 0.6, 8), WING, { margin: 2.5, grainA: 0.06 });
    noShadow(ctx);
    ctx.strokeStyle = 'rgba(57,12,214,0.35)'; ctx.lineWidth = 2;
    for (const [px, py] of [[sx * 70, -54], [sx * 82, -10], [sx * 62, 6]]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(px * 0.85, py * 0.85); ctx.stroke(); }
    ctx.restore();
    splitPin(ctx, sx * 46, -130, 4);
  }
  // feet
  withShadow(ctx, 6, 0.28);
  for (const sx of [-1, 1]) piece(ctx, cutPoly(roundRectPts(sx * 30 - 24, -16, 48, 20, 10), 9020 + sx, 0.5, 8), SKIN_DK, { margin: 2.5, grainA: 0.04 });
  // body
  const body = cutCircle(0, -78, 66, 76, 9030, 0.9, 46);
  const g = ctx.createRadialGradient(-22, -110, 8, 0, -78, 90);
  g.addColorStop(0, '#7FE6E8'); g.addColorStop(0.5, SKIN); g.addColorStop(1, SKIN_DK);
  piece(ctx, body, g, { margin: 3, grainA: 0.08 });
  noShadow(ctx);
  // belly plates
  piece(ctx, cutCircle(0, -66, 40, 50, 9031, 0.6, 32), BELLY, { grainA: 0.05, edge: null });
  ctx.strokeStyle = BELLY_DK; ctx.lineWidth = 3;
  for (const py of [-92, -72, -52]) { ctx.beginPath(); ctx.moveTo(-30 + Math.abs(py + 72) * 0.3, py); ctx.quadraticCurveTo(0, py + 6, 30 - Math.abs(py + 72) * 0.3, py); ctx.stroke(); }
  // arms
  const arm = (side, deg) => {
    const sh = [side * 56, -110];
    const r = deg * D2R;
    const hx = sh[0] + side * Math.sin(r) * 34, hy = sh[1] + Math.cos(r) * 34;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(...sh); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = SKIN; ctx.lineWidth = 17; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2); ctx.fillStyle = SKIN_DK; ctx.fill();
    splitPin(ctx, sh[0], sh[1], 4);
  };
  arm(-1, d.armL ?? 20); arm(1, d.armR ?? 20);
  // head
  withShadow(ctx, 6, 0.28);
  piece(ctx, cutCircle(0, -190, 58, 52, 9040, 0.8, 40), SKIN, { margin: 3, grainA: 0.07 });
  noShadow(ctx);
  // horns
  for (const sx of [-1, 1]) piece(ctx, cutPoly([[sx * 20, -234], [sx * 34, -270], [sx * 42, -228]], 9041 + sx, 0.4, 6), HORN, { margin: 2, grainA: 0.03 });
  // muzzle + nostrils
  piece(ctx, cutCircle(0, -168, 36, 24, 9043, 0.5, 28), '#8DEDEB', { grainA: 0.04, edge: null });
  ctx.fillStyle = SKIN_DK; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 11, -174, 4, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  // cheeks
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 40, -170, 9, 6, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,120,170,0.5)'; ctx.fill(); }
  // eyes
  const ey = d.eyes || 'sleepy';
  const [lx, ly] = d.look || [0, 0];
  ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink;
  for (const sx of [-1, 1]) {
    const ex = sx * 22, eyY = -200;
    const shut = ey === 'closed' || (ey === 'peek' && sx < 0);
    if (shut) { ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ex, eyY - 2, 10, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); continue; }
    if (ey === 'happy') { ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ex, eyY + 4, 10, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); continue; }
    const big = ey === 'wide' ? 1.25 : 1;
    ctx.beginPath(); ctx.ellipse(ex, eyY, 13 * big, 15 * big, 0, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke();
    const pr = ey === 'wide' ? 5 : 7;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * 4, eyY + 2 + clamp(ly, -1, 1) * 5, pr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * 4 + 2.5, eyY - 1 + clamp(ly, -1, 1) * 5, pr * 0.35, 0, Math.PI * 2); ctx.fill();
    if (ey === 'sleepy' || ey === 'peek') { ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(ex, eyY - 8, 15, 11, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(ex - 15, eyY - 9, 30, 4); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(ex - 13, eyY - 4); ctx.lineTo(ex + 13, eyY - 4); ctx.stroke(); }
  }
  // mouth
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5;
  const m = d.mouth || 'smile';
  if (m === 'yawn') { ctx.beginPath(); ctx.ellipse(0, -150, 15, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FF8FB8'; ctx.beginPath(); ctx.ellipse(0, -142, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'o' || m === 'snore') { ctx.beginPath(); ctx.ellipse(0, -152, m === 'snore' ? 6 : 8, m === 'snore' ? 5 : 9, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(-18, -158); ctx.quadraticCurveTo(0, -136, 18, -158); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-6, -158, 4, 5); ctx.fillRect(2, -158, 4, 5); }
  else { ctx.beginPath(); ctx.arc(0, -160, 12, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  // nightcap drooping to one side, with a yellow pom-pom
  const cp = d.cap ?? 1;
  if (cp > 0) {
    withShadow(ctx, 5, 0.25);
    piece(ctx, cutPoly([[-46, -226], [44, -232], [30, -262], [70 + 20 * cp, -250 + 14 * cp], [10, -280], [-30, -266]], 9050, 0.6, 8), C.violet, { margin: 2.5, grainA: 0.06 });
    noShadow(ctx);
    ctx.fillStyle = '#FFFDF8'; ctx.beginPath(); ctx.roundRect(-50, -236, 98, 14, 7); ctx.fill();
    piece(ctx, cutCircle(72 + 20 * cp, -250 + 14 * cp, 12, 12, 9051, 0.5, 16), C.yellow, { margin: 2, grainA: 0.03 });
  }
  ctx.restore();
}

export function drawPillow(ctx, x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot * D2R); ctx.scale(o.squashX ?? 1, o.squashY ?? 1);
  const pts = [];
  const n = 64, puff = o.puff ?? 0.12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    // superellipse with bulging sides and pinched corners (a stuffed pillow)
    const cx = Math.cos(a), sy = Math.sin(a);
    const px = Math.sign(cx) * Math.pow(Math.abs(cx), 0.55) * w / 2, py = Math.sign(sy) * Math.pow(Math.abs(sy), 0.55) * h / 2;
    const bulge = 1 + puff * (Math.abs(Math.sin(2 * a)) < 0.5 ? 0.6 : -0.4);
    pts.push([px * bulge, py * bulge]);
  }
  withShadow(ctx, 12, 0.3);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#FFFDF8'); g.addColorStop(1, '#EADCF7');
  piece(ctx, cutPoly(pts, o.seed || 9101, 0.9, 16), g, { margin: 3, grainA: 0.06 });
  noShadow(ctx);
  ctx.save(); pathFrom2(ctx, pts); ctx.clip();
  ctx.fillStyle = 'rgba(145,31,249,0.22)';
  for (let k = -3; k <= 3; k++) ctx.fillRect(k * w / 7 - w / 28, -h, w / 14, 2 * h);
  ctx.restore();
  // seams and corner tassels
  ctx.strokeStyle = 'rgba(57,12,214,0.25)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
  ctx.beginPath(); ctx.ellipse(0, 0, w * 0.4, h * 0.36, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) piece(ctx, cutCircle(sx * w * 0.5, sy * h * 0.5, 11, 11, 9110 + sx * 2 + sy, 0.4, 14), C.orange, { margin: 2, grainA: 0.03 });
  ctx.restore();
}
function pathFrom2(ctx, pts) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
