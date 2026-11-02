// Character rigs: the stickman kid (FK skeleton + expressions + headband follow-through)
// and "Seven", a buddy drawn as an original simplified take on the TableVerse icon's
// purple/orange number-7 mascot.
import { D2R } from './util.mjs';
import { PAL } from './palette.mjs';

export const KID = { headR: 42, neck: 4, torso: 92, shoulderDrop: 12, ua: 56, fa: 52, th: 62, sh: 60, lw: 15, hipGap: 7 };

// Pose angles in degrees. Limb angles: 0 = pointing down, +90 = screen-right, 180 = up, -90 = screen-left.
// Arm angles are relative to the torso; forearm/shin angles are relative to their parent segment.
export const POSE = {
  stand: { lean: 0, head: 0, lUA: -14, lFA: 8, rUA: 14, rFA: -8, lTh: -9, lSh: 5, rTh: 9, rSh: -5 },
  lookUp: { lean: 0, head: -4, lUA: -18, lFA: 14, rUA: 18, rFA: -14, lTh: -10, lSh: 5, rTh: 10, rSh: -5 },
  flinch: { lean: -4, head: -6, lUA: -40, lFA: 120, rUA: 40, rFA: -120, lTh: -30, lSh: 46, rTh: 30, rSh: -46 },
  startle: { lean: -6, head: -8, lUA: -145, lFA: -20, rUA: 145, rFA: 20, lTh: -26, lSh: 30, rTh: 22, rSh: -10 },
  scared: { lean: -3, head: 4, lUA: -36, lFA: 118, rUA: 36, rFA: -118, lTh: -20, lSh: 28, rTh: 20, rSh: -28 },
  frozen: { lean: 0, head: 6, lUA: -24, lFA: 122, rUA: 24, rFA: -122, lTh: -5, lSh: 4, rTh: 5, rSh: -4 },
  crouch: { lean: 0, head: 4, lUA: -38, lFA: -30, rUA: 38, rFA: 30, lTh: -66, lSh: 96, rTh: 66, rSh: -96 },
  deepCrouch: { lean: 0, head: 8, lUA: -55, lFA: -25, rUA: 55, rFA: 25, lTh: -78, lSh: 116, rTh: 78, rSh: -116 },
  launch: { lean: 0, head: -6, lUA: -20, lFA: -6, rUA: 20, rFA: 6, lTh: -4, lSh: 0, rTh: 4, rSh: 0 },
  reachR: { lean: 6, head: -10, lUA: -78, lFA: -24, rUA: 148, rFA: 16, lTh: -18, lSh: 34, rTh: 8, rSh: -6 },
  reachL: { lean: -6, head: -10, lUA: -148, lFA: -16, rUA: 78, rFA: 24, lTh: -8, lSh: 6, rTh: 18, rSh: -34 },
  fall: { lean: 0, head: 2, lUA: -105, lFA: -14, rUA: 105, rFA: 14, lTh: -14, lSh: 10, rTh: 14, rSh: -10 },
  land: { lean: 0, head: 6, lUA: -70, lFA: -10, rUA: 70, rFA: 10, lTh: -48, lSh: 70, rTh: 48, rSh: -70 },
  victory: { lean: 0, head: -4, lUA: -150, lFA: -12, rUA: 150, rFA: 12, lTh: -16, lSh: 6, rTh: 16, rSh: -6 },
  punchUL: { lean: -10, head: -12, lUA: -152, lFA: -4, rUA: 34, rFA: -118, lTh: -20, lSh: 40, rTh: 14, rSh: -30 },
  kickUR: { lean: -14, head: -4, lUA: -100, lFA: -20, rUA: 58, rFA: 50, lTh: -16, lSh: 46, rTh: 122, rSh: 6 },
  uppercut: { lean: 6, head: -10, lUA: -40, lFA: -28, rUA: 160, rFA: 8, lTh: -10, lSh: 30, rTh: 12, rSh: -36 },
  tuck: { lean: 0, head: 0, lUA: -60, lFA: 100, rUA: 60, rFA: -100, lTh: -110, lSh: 140, rTh: 110, rSh: -140 },
  highFive: { lean: 6, head: -2, lUA: -24, lFA: 30, rUA: 112, rFA: 10, lTh: -12, lSh: 6, rTh: 12, rSh: -6 },
  wave: { lean: 0, head: 3, lUA: -16, lFA: 10, rUA: 136, rFA: 26, lTh: -9, lSh: 5, rTh: 9, rSh: -5 },
  hop: { lean: 0, head: -4, lUA: -60, lFA: -20, rUA: 60, rFA: 20, lTh: -30, lSh: 50, rTh: 24, rSh: -40 },
};

const dirv = (deg) => [Math.sin(deg * D2R), Math.cos(deg * D2R)];

export function kidJoints(p) {
  const up = [Math.sin(p.lean * D2R), -Math.cos(p.lean * D2R)];
  const neck = [up[0] * KID.torso, up[1] * KID.torso];
  const sd = KID.torso - KID.shoulderDrop;
  const shoulder = [up[0] * sd, up[1] * sd];
  const headAng = p.lean + p.head;
  const hu = [Math.sin(headAng * D2R), -Math.cos(headAng * D2R)];
  const hd = KID.neck + KID.headR;
  const head = [neck[0] + hu[0] * hd, neck[1] + hu[1] * hd];
  const limb = (o, a1, a2, L1, L2) => {
    const d1 = dirv(a1);
    const e = [o[0] + d1[0] * L1, o[1] + d1[1] * L1];
    const d2 = dirv(a1 + a2);
    return [e, [e[0] + d2[0] * L2, e[1] + d2[1] * L2], a1 + a2];
  };
  const [lE, lH] = limb(shoulder, p.lUA - p.lean, p.lFA, KID.ua, KID.fa);
  const [rE, rH] = limb(shoulder, p.rUA - p.lean, p.rFA, KID.ua, KID.fa);
  const lHip = [-KID.hipGap, 0], rHip = [KID.hipGap, 0];
  const [lK, lF, lFa] = limb(lHip, p.lTh, p.lSh, KID.th, KID.sh);
  const [rK, rF, rFa] = limb(rHip, p.rTh, p.rSh, KID.th, KID.sh);
  return { neck, shoulder, head, headAng, lE, lH, rE, rH, lK, lF, rK, rF, lHip, rHip, lFa, rFa };
}

/** hip y so that the lowest foot (plus shoe) rests on groundY. */
export function groundedHipY(pose, s, groundY, sq = 1, rot = 0) {
  const J = kidJoints(pose);
  const c = Math.cos(rot * D2R), sn = Math.sin(rot * D2R);
  const sx = s / Math.sqrt(sq), sy = s * sq;
  const fy = (p) => p[0] * sx * sn + p[1] * sy * c;
  return groundY - Math.max(fy(J.lF), fy(J.rF)) - 9 * s;
}

/** world-space position of a joint (for hand-offs, contact points, effects) */
export function kidWorld(k, name) {
  const J = kidJoints(k.pose);
  const p = J[name];
  const sq = k.sq || 1;
  const sx = k.s / Math.sqrt(sq), sy = k.s * sq;
  const c = Math.cos((k.rot || 0) * D2R), sn = Math.sin((k.rot || 0) * D2R);
  const x = p[0] * sx, y = p[1] * sy;
  return [k.x + x * c - y * sn, k.y + x * sn + y * c];
}

function poly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

function shoe(ctx, foot, ang, fill, outline, pass) {
  // shoe sits under the foot, pointing outward-ish along the shin direction rotated 90deg
  ctx.save();
  ctx.translate(foot[0], foot[1] + 3);
  const a = Math.max(-35, Math.min(35, -ang * 0.4));
  ctx.rotate(a * D2R);
  ctx.beginPath();
  ctx.ellipse(0, 0, pass === 'outline' ? 19 : 15, pass === 'outline' ? 12 : 8.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = pass === 'outline' ? outline : fill;
  ctx.fill();
  if (pass !== 'outline') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(-14, 3, 28, 3);
  }
  ctx.restore();
}

/**
 * k = { x, y (hip), s, rot, sq, pose, face, col, alpha, tailAng (world deg, 0=right, 90=down) }
 * face = { eyes: dot|wide|happy|closed|squint, mouth: smile|grin|o|flat|wavy|open|determined,
 *          brows (-1 worried .. 1 determined), lookX, lookY, sweat, blush, blink (0..1) }
 */
export function drawKid(ctx, k) {
  const J = kidJoints(k.pose);
  const sq = k.sq || 1;
  ctx.save();
  ctx.globalAlpha *= k.alpha ?? 1;
  ctx.translate(k.x, k.y);
  ctx.rotate((k.rot || 0) * D2R);
  ctx.scale(k.s / Math.sqrt(sq), k.s * sq);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const col = k.col || PAL.cream;
  const lines = [
    [[0, 0], J.neck],
    [J.shoulder, J.lE, J.lH],
    [J.shoulder, J.rE, J.rH],
    [J.lHip, J.lK, J.lF],
    [J.rHip, J.rK, J.rF],
    [J.lHip, J.rHip],
  ];
  // --- outline pass (keeps silhouette readable over bright stars)
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = KID.lw + 9;
  for (const l of lines) poly(ctx, l);
  ctx.fillStyle = PAL.ink;
  for (const h of [J.lH, J.rH]) {
    ctx.beginPath();
    ctx.arc(h[0], h[1], 13.5, 0, Math.PI * 2);
    ctx.fill();
  }
  shoe(ctx, J.lF, J.lFa, PAL.orange, PAL.ink, 'outline');
  shoe(ctx, J.rF, J.rFa, PAL.orange, PAL.ink, 'outline');
  ctx.beginPath();
  ctx.arc(J.head[0], J.head[1], KID.headR + 5, 0, Math.PI * 2);
  ctx.fill();
  // headband tails (behind head)
  drawTails(ctx, k, J);
  // --- fill pass
  ctx.strokeStyle = col;
  ctx.lineWidth = KID.lw;
  for (const l of lines) poly(ctx, l);
  ctx.fillStyle = col;
  for (const h of [J.lH, J.rH]) {
    ctx.beginPath();
    ctx.arc(h[0], h[1], 9, 0, Math.PI * 2);
    ctx.fill();
  }
  shoe(ctx, J.lF, J.lFa, PAL.orange, PAL.ink, 'fill');
  shoe(ctx, J.rF, J.rFa, PAL.orange, PAL.ink, 'fill');
  // head
  ctx.save();
  ctx.translate(J.head[0], J.head[1]);
  ctx.rotate(J.headAng * D2R);
  ctx.beginPath();
  ctx.arc(0, 0, KID.headR, 0, Math.PI * 2);
  ctx.fillStyle = col;
  ctx.fill();
  // headband across the forehead
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, KID.headR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = PAL.orange;
  ctx.fillRect(-KID.headR, -32, KID.headR * 2, 13);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-KID.headR, -32, KID.headR * 2, 3);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(KID.headR - 3, -25.5, 7.5, 0, Math.PI * 2);
  ctx.fillStyle = PAL.orange;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = PAL.ink;
  ctx.stroke();
  ctx.scale(KID.headR / 36, KID.headR / 36);
  drawFace(ctx, k.face || {});
  ctx.restore();
  ctx.restore();
}

function drawTails(ctx, k, J) {
  // two ribbon tails from the knot on the right of the head; angle follows motion (follow-through)
  const knotLocal = [KID.headR - 3, -25.5];
  const ha = J.headAng * D2R;
  const kx = J.head[0] + knotLocal[0] * Math.cos(ha) - knotLocal[1] * Math.sin(ha);
  const ky = J.head[1] + knotLocal[0] * Math.sin(ha) + knotLocal[1] * Math.cos(ha);
  const worldA = k.tailAng ?? 40;
  const a = (worldA - (k.rot || 0)) * D2R;
  const flutter = k.tailFlutter || 0;
  const tails = [
    [44, 0.0, 10],
    [34, -0.42, 9],
  ];
  for (const pass of ['o', 'f']) {
    for (const [len, off, w] of tails) {
      const aa = a + off + flutter * 0.25;
      const ex = kx + Math.cos(aa) * len, ey = ky + Math.sin(aa) * len;
      const mx = kx + Math.cos(aa + flutter * 0.5 + 0.3) * len * 0.55;
      const my = ky + Math.sin(aa + flutter * 0.5 + 0.3) * len * 0.55;
      ctx.beginPath();
      ctx.moveTo(kx, ky);
      ctx.quadraticCurveTo(mx, my, ex, ey);
      ctx.lineWidth = pass === 'o' ? w + 7 : w;
      ctx.strokeStyle = pass === 'o' ? PAL.ink : PAL.orange;
      ctx.stroke();
    }
  }
}

function drawFace(ctx, f) {
  const lx = (f.lookX || 0) * 7, ly = (f.lookY || 0) * 5;
  const ink = PAL.faceInk;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const eyes = f.eyes || 'dot';
  const blink = f.blink ?? 1;
  for (const sx of [-1, 1]) {
    const ex = sx * 12.5 + lx, ey = -3 + ly;
    ctx.save();
    ctx.translate(ex, ey);
    if (eyes === 'dot') {
      ctx.scale(1, Math.max(0.12, blink));
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 6.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = ink;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(1.6, -2.2, 1.7, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    } else if (eyes === 'wide') {
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = ink;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lx * 0.4, ly * 0.5, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = ink;
      ctx.fill();
    } else if (eyes === 'happy') {
      ctx.beginPath();
      ctx.arc(0, 3, 6.5, Math.PI * 1.12, Math.PI * 1.88);
      ctx.lineWidth = 4;
      ctx.strokeStyle = ink;
      ctx.stroke();
    } else if (eyes === 'closed') {
      ctx.beginPath();
      ctx.moveTo(-6, 1);
      ctx.lineTo(6, 1);
      ctx.lineWidth = 4;
      ctx.strokeStyle = ink;
      ctx.stroke();
    } else if (eyes === 'squint') {
      ctx.beginPath();
      ctx.moveTo(-5 * sx, -5);
      ctx.lineTo(4 * sx, 0);
      ctx.lineTo(-5 * sx, 5);
      ctx.lineWidth = 4;
      ctx.strokeStyle = ink;
      ctx.stroke();
    }
    ctx.restore();
  }
  // brows
  const b = f.brows || 0;
  if (Math.abs(b) > 0.05) {
    ctx.lineWidth = 3.6;
    ctx.strokeStyle = ink;
    for (const sx of [-1, 1]) {
      const bx = sx * 12.5 + lx, by = -15 + ly - (eyes === 'wide' ? 4 : 0);
      ctx.beginPath();
      // outer end rises and inner end (towards the nose) drops for determined (b>0); reverse for worried
      ctx.moveTo(bx + sx * 7, by - b * 2);
      ctx.lineTo(bx - sx * 6, by + b * 4);
      ctx.stroke();
    }
  }
  // blush
  if (f.blush) {
    ctx.fillStyle = `rgba(255,111,168,${0.45 * f.blush})`;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(sx * 22 + lx * 0.6, 9 + ly * 0.5, 6.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // mouth
  const m = f.mouth || 'smile';
  const mx = lx * 0.8, my = 15 + ly * 0.7;
  ctx.lineWidth = 4;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  if (m === 'smile') {
    ctx.beginPath();
    ctx.arc(mx, my - 6, 10, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  } else if (m === 'grin' || m === 'open') {
    const r = m === 'open' ? 11 : 12;
    ctx.beginPath();
    ctx.moveTo(mx - r, my - 3);
    ctx.arc(mx, my - 3, r, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(mx + 2, my + 8, 7, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = PAL.pink;
    ctx.fill();
    ctx.restore();
  } else if (m === 'o') {
    ctx.beginPath();
    ctx.ellipse(mx, my, 5.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (m === 'flat' || m === 'determined') {
    ctx.beginPath();
    ctx.moveTo(mx - 8, my - (m === 'determined' ? 1 : 0));
    ctx.lineTo(mx + 8, my + (m === 'determined' ? 1 : 0));
    ctx.stroke();
  } else if (m === 'wavy') {
    ctx.beginPath();
    ctx.moveTo(mx - 11, my);
    for (let i = 1; i <= 6; i++) ctx.lineTo(mx - 11 + i * 3.7, my + (i % 2 ? -3.5 : 2.5));
    ctx.stroke();
  }
  // sweat drop
  if (f.sweat) {
    ctx.save();
    ctx.globalAlpha *= f.sweat;
    ctx.translate(30, -18 + (1 - f.sweat) * 6);
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.quadraticCurveTo(8, 2, 0, 6);
    ctx.quadraticCurveTo(-8, 2, 0, -11);
    ctx.fillStyle = '#7FE3FF';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = PAL.ink;
    ctx.stroke();
    ctx.restore();
  }
}

// ---------------------------------------------------------------- Seven (buddy)
const SEVEN = { a: [-54, -82], b: [50, -82], c: [-14, 80], w: 64 };

function segPoint(p, q, t) {
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
}

/**
 * b = { x, y, s, rot, sx, sy, armL, armR (deg, 0=down, -90=left, +90=right), legL, legR,
 *       eyes: open|happy|closed, mouth: smile|grin|o, lookX, lookY, glow, alpha }
 */
export function drawBuddy(ctx, b) {
  ctx.save();
  ctx.globalAlpha *= b.alpha ?? 1;
  ctx.translate(b.x, b.y);
  ctx.rotate((b.rot || 0) * D2R);
  ctx.scale(b.s * (b.sx || 1), b.s * (b.sy || 1));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // glow
  if ((b.glow ?? 1) > 0) {
    const g = ctx.createRadialGradient(0, -10, 10, 0, -10, 175);
    g.addColorStop(0, `rgba(160,110,255,${0.42 * (b.glow ?? 1)})`);
    g.addColorStop(1, 'rgba(160,110,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -10, 175, 0, Math.PI * 2);
    ctx.fill();
  }
  // legs + sneakers
  const legs = [
    [[-30, 98], b.legL ?? -8],
    [[2, 102], b.legR ?? 8],
  ];
  for (const pass of ['o', 'f']) {
    for (const [o, ang] of legs) {
      const fx = o[0] + Math.sin(ang * D2R) * 34, fy = o[1] + Math.cos(ang * D2R) * 34;
      ctx.beginPath();
      ctx.moveTo(o[0], o[1]);
      ctx.lineTo(fx, fy);
      ctx.lineWidth = pass === 'o' ? 19 : 11;
      ctx.strokeStyle = pass === 'o' ? PAL.ink : PAL.buddyLimb;
      ctx.stroke();
      ctx.save();
      ctx.translate(fx + 6, fy + 6);
      ctx.rotate(-ang * 0.5 * D2R);
      ctx.beginPath();
      ctx.ellipse(0, 0, pass === 'o' ? 24 : 20, pass === 'o' ? 15 : 11, 0, 0, Math.PI * 2);
      ctx.fillStyle = pass === 'o' ? PAL.ink : PAL.orange;
      ctx.fill();
      if (pass === 'f') {
        ctx.fillStyle = PAL.purple;
        ctx.fillRect(-18, -11, 14, 9);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-18, 5, 36, 4);
      }
      ctx.restore();
    }
  }
  // arms + gloves
  const arms = [
    [[-24, 18], b.armL ?? -40],
    [[40, -52], b.armR ?? 40],
  ];
  const gloves = [];
  for (const pass of ['o', 'f']) {
    for (const [o, ang] of arms) {
      const gx = o[0] + Math.sin(ang * D2R) * 50, gy = o[1] + Math.cos(ang * D2R) * 50;
      if (pass === 'f') gloves.push([gx, gy]);
      ctx.beginPath();
      ctx.moveTo(o[0], o[1]);
      ctx.lineTo(gx, gy);
      ctx.lineWidth = pass === 'o' ? 19 : 11;
      ctx.strokeStyle = pass === 'o' ? PAL.ink : PAL.buddyLimb;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(gx, gy, pass === 'o' ? 20 : 16, 0, Math.PI * 2);
      ctx.fillStyle = pass === 'o' ? PAL.ink : '#FFFFFF';
      ctx.fill();
    }
  }
  // body "7"
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(...SEVEN.a);
    ctx.lineTo(...SEVEN.b);
    ctx.lineTo(...SEVEN.c);
  };
  body();
  ctx.lineWidth = SEVEN.w + 12;
  ctx.strokeStyle = PAL.ink;
  ctx.stroke();
  body();
  const grad = ctx.createLinearGradient(0, -120, 0, 120);
  grad.addColorStop(0, '#9A5CFF');
  grad.addColorStop(1, '#6223D2');
  ctx.lineWidth = SEVEN.w;
  ctx.strokeStyle = grad;
  ctx.stroke();
  // orange accents: bar end, stem band, foot of stem
  ctx.lineCap = 'butt';
  ctx.strokeStyle = PAL.orange;
  ctx.beginPath();
  ctx.moveTo(SEVEN.a[0], SEVEN.a[1]);
  ctx.lineTo(SEVEN.a[0] + 26, SEVEN.a[1]);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(SEVEN.a[0], SEVEN.a[1], SEVEN.w / 2, 0, Math.PI * 2);
  ctx.fillStyle = PAL.orange;
  ctx.fill();
  const s0 = segPoint(SEVEN.b, SEVEN.c, 0.46), s1 = segPoint(SEVEN.b, SEVEN.c, 0.62);
  ctx.beginPath();
  ctx.moveTo(...s0);
  ctx.lineTo(...s1);
  ctx.stroke();
  const t0 = segPoint(SEVEN.b, SEVEN.c, 0.88);
  ctx.beginPath();
  ctx.moveTo(...t0);
  ctx.lineTo(...SEVEN.c);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(SEVEN.c[0], SEVEN.c[1], SEVEN.w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = 'round';
  // gloss highlight
  ctx.beginPath();
  ctx.moveTo(-36, -102);
  ctx.lineTo(34, -102);
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.stroke();
  // eyes
  const lx = (b.lookX || 0) * 5, ly = (b.lookY || 0) * 5;
  const eyes = b.eyes || 'open';
  for (const ex of [-20, 18]) {
    const ey = -88;
    if (eyes === 'open') {
      ctx.beginPath();
      ctx.ellipse(ex, ey, 17, 21, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = PAL.ink;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ex + 2 + lx, ey + 3 + ly, 9.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1B1150';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 5 + lx, ey - 1 + ly, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    } else if (eyes === 'happy') {
      ctx.beginPath();
      ctx.arc(ex, ey + 6, 12, Math.PI * 1.1, Math.PI * 1.9);
      ctx.lineWidth = 6;
      ctx.strokeStyle = PAL.ink;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(ex - 11, ey + 2);
      ctx.lineTo(ex + 11, ey + 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = PAL.ink;
      ctx.stroke();
    }
  }
  // mouth (on the bar under the eyes)
  const m = b.mouth || 'smile';
  ctx.fillStyle = '#3A0E2E';
  ctx.strokeStyle = PAL.ink;
  if (m === 'o') {
    ctx.beginPath();
    ctx.ellipse(0, -60, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const r = m === 'grin' ? 14 : 11;
    ctx.beginPath();
    ctx.moveTo(-r, -64);
    ctx.arc(0, -64, r, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(2, -52, 7, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = PAL.pink;
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  return gloves;
}

/** world position of a buddy glove (0 = left arm, 1 = right arm) */
export function buddyGlove(b, idx) {
  const o = idx === 0 ? [-24, 18] : [40, -52];
  const ang = idx === 0 ? b.armL ?? -40 : b.armR ?? 40;
  const lx = o[0] + Math.sin(ang * D2R) * 50, ly = o[1] + Math.cos(ang * D2R) * 50;
  const sx = b.s * (b.sx || 1), sy = b.s * (b.sy || 1);
  const c = Math.cos((b.rot || 0) * D2R), s = Math.sin((b.rot || 0) * D2R);
  const x = lx * sx, y = ly * sy;
  return [b.x + x * c - y * s, b.y + x * s + y * c];
}
