// Cut-paper octopus puppet (new for english-21), built like the approved baker / mouse / robot puppets: layered paper,
// white cut margins, brass split pins where the eight arms join the mantle, soft offset shadows.
// Arms are tapered paper strips along a centreline (idle: a curling tentacle on the sand; reach: a bezier to a target).
//   drawOctopusArms(ctx, o)  — the eight arms (drawn behind the counted oranges)
//   drawOctopusBody(ctx, o)  — mantle, face, hat (drawn after the arms)
// o = { x, y (centre of the arm roots), s, look: [dx, dy], eyes: open|sly|wide|dizzy|happy|wink, mouth: grin|open|smile|o,
//       squash, arms: [ { pts: [[x, y], ...] } x 8 ], hat (0..1 visible), hatTilt (deg), blush }
import { C, cutPoly, cutCircle, roundRectPts, piece, withShadow, noShadow, splitPin } from './craft.mjs';
import { clamp, lerp } from './util.mjs';

export const SKIN = '#9B3BF2', SKIN_DK = '#6E1FC4', SKIN_LT = '#C68BFA', SUCK = '#F3D9FF';
export const ARM_N = 26;

/** arm root positions (world) for an octopus at (x, y) and scale s; i = 0 (left) .. 7 (right) */
export function armRoot(o, i) {
  const s = o.s ?? 1;
  return [o.x + s * (-78 + (i * 156) / 7), o.y - 8 * s];
}

/** idle tentacle centreline: starts at the root heading `a0` (rad), curls by `curl`, wiggles with `phase` */
export function idleArm(root, a0, len, curl, phase, wig = 0.35) {
  const pts = [root.slice()];
  let a = a0, x = root[0], y = root[1];
  for (let k = 1; k <= ARM_N; k++) {
    const t = k / ARM_N;
    a += (curl * t * t * 2.2 + wig * Math.sin(phase + t * 4.2) * (0.4 + t)) / ARM_N * 3;
    x += Math.cos(a) * (len / ARM_N); y += Math.sin(a) * (len / ARM_N);
    pts.push([x, y]);
  }
  return pts;
}

/** reaching tentacle: cubic bezier root -> tip with two control points */
export function bezArm(p0, p1, p2, p3) {
  const pts = [];
  for (let k = 0; k <= ARM_N; k++) {
    const t = k / ARM_N, u = 1 - t;
    pts.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
  }
  return pts;
}
/** quick reach: bend sideways by `bend` px */
export function reachArm(root, tip, bend) {
  const dx = tip[0] - root[0], dy = tip[1] - root[1], l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l;
  return bezArm(root, [root[0] + dx * 0.3 + nx * bend, root[1] + dy * 0.3 + ny * bend], [root[0] + dx * 0.7 + nx * bend * 0.6, root[1] + dy * 0.7 + ny * bend * 0.6], tip);
}
export function mixArm(a, b, t) { return a.map((p, k) => [lerp(p[0], b[k][0], t), lerp(p[1], b[k][1], t)]); }

function armOutline(pts, s) {
  const L = [], R = [];
  for (let k = 0; k < pts.length; k++) {
    const p = pts[k], q = pts[Math.min(pts.length - 1, k + 1)], r = pts[Math.max(0, k - 1)];
    let dx = q[0] - r[0], dy = q[1] - r[1];
    const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = lerp(19, 5, k / (pts.length - 1)) * s;
    L.push([p[0] - dy * w, p[1] + dx * w]); R.push([p[0] + dy * w, p[1] - dx * w]);
  }
  return { L, R };
}

export function drawOctopusArms(ctx, o) {
  const s = o.s ?? 1;
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const pts = o.arms[i].pts;
    const { L, R } = armOutline(pts, s);
    const poly = [...L, ...R.reverse()];
    withShadow(ctx, 6, 0.26);
    // white cut margin, then the arm
    ctx.beginPath(); poly.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#FFFDF8'; ctx.stroke();
    ctx.fillStyle = i % 2 ? SKIN : '#A247F5'; ctx.fill();
    noShadow(ctx);
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(40,10,70,0.35)'; ctx.stroke();
    // sucker dots along one side
    for (let k = 3; k < pts.length - 2; k += 3) {
      const t = k / (pts.length - 1), w = lerp(19, 5, t) * s;
      const p = pts[k], q = pts[k + 1];
      const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
      ctx.beginPath(); ctx.arc(p[0] + (dy / l) * w * 0.45, p[1] - (dx / l) * w * 0.45, Math.max(2, w * 0.36), 0, Math.PI * 2);
      ctx.fillStyle = SUCK; ctx.fill();
    }
  }
  ctx.restore();
}

export function drawOctopusBody(ctx, o) {
  const s = o.s ?? 1, sq = o.squash ?? 1;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.scale(s / Math.sqrt(sq), s * sq);
  // split pins at the arm roots (visible construction)
  for (let i = 0; i < 8; i++) splitPin(ctx, -78 + (i * 156) / 7, -8, 4);
  // mantle (head)
  withShadow(ctx, 10, 0.3);
  const head = cutCircle(0, -92, 112, 100, 4101, 1.0, 54);
  const g = ctx.createRadialGradient(-34, -140, 10, 0, -92, 130);
  g.addColorStop(0, SKIN_LT); g.addColorStop(0.55, SKIN); g.addColorStop(1, SKIN_DK);
  piece(ctx, head, g, { margin: 3.5, grainA: 0.08 });
  noShadow(ctx);
  // spots
  for (const [dx, dy, r] of [[-62, -128, 10], [-40, -160, 7], [58, -140, 9], [74, -104, 6], [30, -170, 6]]) {
    ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(110,31,196,0.55)'; ctx.fill();
  }
  // cheeks
  if ((o.blush ?? 1) > 0) for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 58, -58, 15, 9, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,130,180,0.55)'; ctx.fill(); }
  // eyes
  const [lx, ly] = o.look || [0, 0];
  const ey = o.eyes || 'open';
  ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    const ex = sx * 36, eyY = -96;
    if (ey === 'happy' || (ey === 'wink' && sx > 0)) {
      ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(ex, eyY + 8, 16, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      continue;
    }
    // white
    const big = ey === 'wide' ? 1.25 : 1;
    ctx.beginPath(); ctx.ellipse(ex, eyY, 24 * big, 28 * big, 0, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    if (ey === 'dizzy') {
      ctx.lineWidth = 3; ctx.beginPath();
      for (let k = 0; k <= 30; k++) { const a = (o.dizzyT || 0) * sx + k * 0.5, r = 0.65 * k; const px = ex + Math.cos(a) * r, py = eyY + Math.sin(a) * r; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      continue;
    }
    const pr = ey === 'wide' ? 8 : 12;
    ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * 9, eyY + clamp(ly, -1, 1) * 11, pr, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(ex + clamp(lx, -1, 1) * 9 + 4, eyY + clamp(ly, -1, 1) * 11 - 5, pr * 0.35, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    if (ey === 'sly') { // mischievous half-lids
      ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(ex, eyY - 14, 27, 18, sx * 0.25, Math.PI, 0); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(ex - 22, eyY - 10 + sx * 4); ctx.lineTo(ex + 22, eyY - 10 - sx * 4); ctx.stroke();
    }
  }
  // mouth
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
  const m = o.mouth || 'grin';
  if (m === 'open') { ctx.beginPath(); ctx.ellipse(0, -46, 16, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FF8FB8'; ctx.beginPath(); ctx.ellipse(0, -40, 9, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'o') { ctx.beginPath(); ctx.ellipse(0, -46, 9, 11, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(-26, -54); ctx.quadraticCurveTo(0, -24, 26, -56); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-9, -54, 18, 6); }
  else { ctx.beginPath(); ctx.arc(0, -60, 18, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
  ctx.restore();
}
