// Original stickman rig: FK + 2-bone IK, pose blending, expressive face and a leaf sprout.
// Angle convention: a limb angle `a` points along (sin a, cos a) in screen space,
// so 0 = straight down, 90 = toward +x, 180 = straight up. Poses are authored facing
// right; `face: -1` mirrors them.
import { D2R, clamp, lerp, C, rgba } from './util.mjs';

export const RIG = { torso: 132, neck: 12, headR: 46, upper: 76, fore: 72, thigh: 90, shin: 88, stroke: 15, foot: 22 };

const dirv = (a) => [Math.sin(a * D2R), Math.cos(a * D2R)];
const angOf = (dx, dy) => Math.atan2(dx, dy) / D2R;
const add = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k];

export function ik(S, T, L1, L2, bend) {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  const d = Math.hypot(dx, dy);
  const dc = clamp(d, Math.abs(L1 - L2) + 0.5, L1 + L2 - 0.5);
  const base = angOf(dx, dy);
  const A = Math.acos(clamp((L1 * L1 + dc * dc - L2 * L2) / (2 * L1 * dc), -1, 1)) / D2R;
  const a1 = base + bend * A;
  const E = add(S, dirv(a1), L1);
  const a2 = angOf(T[0] - E[0], T[1] - E[1]);
  return [a1, a2];
}

const LIMBS = ['aB', 'aF', 'lB', 'lF'];

// Compute torso landmarks for a pose whose hip is known.
function frame(p, hip) {
  const s = p.sc ?? 1, F = p.face ?? 1;
  const tor = (p.torso ?? 0) * F;
  const up = [Math.sin(tor * D2R), -Math.cos(tor * D2R)];
  const neck = add(hip, up, RIG.torso * s);
  const shoulder = add(hip, up, RIG.torso * s * 0.86);
  return { s, F, tor, up, neck, shoulder };
}

// Convert IK limbs to angles and place the hip on the ground if requested.
// Returns a pose where every limb is [a1, a2] in the facing frame and y is explicit.
export function resolve(p) {
  const q = { ...p, ex: { ...(p.ex || {}) } };
  const s = q.sc ?? 1, F = q.face ?? 1;
  const L = { th: RIG.thigh * s, sh: RIG.shin * s, up: RIG.upper * s, fo: RIG.fore * s };
  // legs: angles may be needed before hip y is known (ground mode)
  if (q.ground !== undefined && Array.isArray(q.lB) && Array.isArray(q.lF)) {
    let drop = 0;
    for (const k of ['lB', 'lF']) {
      const a = q[k];
      drop = Math.max(drop, Math.cos(a[0] * D2R) * L.th + Math.cos(a[1] * D2R) * L.sh);
    }
    q.y = q.ground - (q.lift ?? 0) - drop - RIG.stroke * s * 0.5;
  }
  const hip = [q.x, q.y];
  for (const k of ['lB', 'lF']) {
    const v = q[k];
    if (v && !Array.isArray(v)) {
      const [a1, a2] = ik(hip, v.t, L.th, L.sh, (v.bend ?? 1) * F);
      q[k] = [a1 * F, a2 * F];
    }
  }
  const fr = frame(q, hip);
  for (const k of ['aB', 'aF']) {
    const v = q[k];
    if (v && !Array.isArray(v)) {
      const [a1, a2] = ik(fr.shoulder, v.t, L.up, L.fo, (v.bend ?? 1) * F);
      q[k] = [a1 * F, a2 * F];
    }
  }
  return q;
}

const shortest = (a, b, t) => {
  const d = ((((b - a) % 360) + 540) % 360) - 180;
  return a + d * t;
};

// Blend two resolved poses.
export function mixPose(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const o = { ...a };
  for (const k of ['x', 'y', 'sc', 'torso', 'head', 'squash', 'lift']) {
    if (a[k] !== undefined || b[k] !== undefined) o[k] = lerp(a[k] ?? (k === 'sc' ? 1 : 0), b[k] ?? (k === 'sc' ? 1 : 0), t);
  }
  if (a.ground !== undefined && b.ground !== undefined) o.ground = lerp(a.ground, b.ground, t);
  else delete o.ground;
  for (const k of LIMBS) o[k] = [shortest(a[k][0], b[k][0], t), shortest(a[k][1], b[k][1], t)];
  o.face = t < 0.5 ? a.face ?? 1 : b.face ?? 1;
  const ea = a.ex || {}, eb = b.ex || {};
  const ex = { ...ea };
  for (const k of new Set([...Object.keys(ea), ...Object.keys(eb)])) {
    const va = ea[k], vb = eb[k];
    if (typeof va === 'number' || typeof vb === 'number') ex[k] = lerp(va ?? 0, vb ?? 0, t);
    else if (Array.isArray(va) || Array.isArray(vb)) {
      const A = va || [0, 0], B = vb || [0, 0];
      ex[k] = [lerp(A[0], B[0], t), lerp(A[1], B[1], t)];
    } else ex[k] = t < 0.5 ? va ?? vb : vb ?? va;
  }
  o.ex = ex;
  return o;
}

// Full skeleton from a resolved pose.
export function solve(p) {
  const r = resolve(p);
  const hip = [r.x, r.y];
  const fr = frame(r, hip);
  const s = fr.s, F = fr.F;
  const ht = fr.tor + (r.head ?? 0) * F;
  const hup = [Math.sin(ht * D2R), -Math.cos(ht * D2R)];
  const R = RIG.headR * s;
  const head = add(fr.neck, hup, RIG.neck * s + R);
  const limb = (base, ang, L1, L2) => {
    const a1 = ang[0] * F, a2 = ang[1] * F;
    const mid = add(base, dirv(a1), L1);
    const end = add(mid, dirv(a2), L2);
    return { base, mid, end, a1, a2 };
  };
  return {
    pose: r, s, F, hip, neck: fr.neck, shoulder: fr.shoulder, head, headAng: ht, R,
    aB: limb(fr.shoulder, r.aB, RIG.upper * s, RIG.fore * s),
    aF: limb(fr.shoulder, r.aF, RIG.upper * s, RIG.fore * s),
    lB: limb(hip, r.lB, RIG.thigh * s, RIG.shin * s),
    lF: limb(hip, r.lF, RIG.thigh * s, RIG.shin * s),
    ex: r.ex || {},
  };
}

export function headTop(J) {
  return [J.head[0] + Math.sin(J.headAng * D2R) * J.R, J.head[1] - Math.cos(J.headAng * D2R) * J.R];
}

function strokeLimb(ctx, L, w, col) {
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(L.base[0], L.base[1]);
  ctx.lineTo(L.mid[0], L.mid[1]);
  ctx.lineTo(L.end[0], L.end[1]);
  ctx.stroke();
}

function drawFoot(ctx, L, F, s, w, col) {
  ctx.strokeStyle = col;
  ctx.lineWidth = w * 1.05;
  ctx.beginPath();
  ctx.moveTo(L.end[0] - F * 4 * s, L.end[1]);
  ctx.lineTo(L.end[0] + F * RIG.foot * s, L.end[1] + 1);
  ctx.stroke();
}

function drawHand(ctx, L, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(L.end[0], L.end[1], 9.5 * s, 0, Math.PI * 2);
  ctx.fill();
}

// Leaf sprout on the head; `sway` (deg) comes from the follow-through spring.
function drawSprout(ctx, J, sway, ink) {
  const s = J.s, R = J.R;
  ctx.save();
  ctx.translate(J.head[0], J.head[1]);
  ctx.rotate(J.headAng * D2R);
  ctx.translate(0, -R + 2 * s);
  ctx.rotate((sway || 0) * D2R);
  // stem
  ctx.strokeStyle = ink;
  ctx.lineWidth = 6 * s;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-2 * s, -16 * s, 4 * s, -30 * s);
  ctx.stroke();
  // big leaf (right)
  const leaf = (len, wid, rot, col) => {
    ctx.save();
    ctx.translate(4 * s, -30 * s);
    ctx.rotate(rot * D2R);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(wid * s, -len * 0.25 * s, wid * 0.9 * s, -len * 0.8 * s, 0, -len * s);
    ctx.bezierCurveTo(-wid * 0.9 * s, -len * 0.8 * s, -wid * s, -len * 0.25 * s, 0, 0);
    ctx.fill();
    ctx.strokeStyle = rgba('#FFFFFF', 0.55);
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(0, -3 * s);
    ctx.quadraticCurveTo(wid * 0.15 * s, -len * 0.5 * s, 0, -len * 0.85 * s);
    ctx.stroke();
    ctx.restore();
  };
  leaf(40, 17, 48, C.leaf);
  leaf(26, 12, -50, C.lime);
  ctx.restore();
}

function drawFace(ctx, J, ink) {
  const ex = J.ex, R = J.R, s = J.s, F = J.F;
  ctx.save();
  ctx.translate(J.head[0], J.head[1]);
  ctx.rotate(J.headAng * D2R);
  const look = ex.look || [0, 0];
  const fx = F * R * 0.12 + look[0] * R * 0.14;
  const fy = look[1] * R * 0.12;
  const ex1 = -R * 0.3 + fx, ex2 = R * 0.3 + fx, ey = -R * 0.06 + fy;
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineCap = 'round';
  const blink = clamp(ex.blink ?? 0);
  const eyes = ex.eyes || 'open';
  ctx.lineWidth = 5 * s;
  for (const x of [ex1, ex2]) {
    if (eyes === 'happy') {
      ctx.beginPath();
      ctx.arc(x, ey + 4 * s, 8 * s, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (eyes === 'closed' || blink > 0.85) {
      ctx.beginPath();
      ctx.moveTo(x - 7 * s, ey);
      ctx.quadraticCurveTo(x, ey + 5 * s, x + 7 * s, ey);
      ctx.stroke();
    } else if (eyes === 'squeeze') {
      const d = x < fx ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x - 7 * s * d, ey - 6 * s);
      ctx.lineTo(x + 6 * s * d, ey);
      ctx.lineTo(x - 7 * s * d, ey + 6 * s);
      ctx.stroke();
    } else if (eyes === 'wide') {
      ctx.fillStyle = C.white;
      ctx.beginPath();
      ctx.ellipse(x, ey, 10.5 * s, 11.5 * s * (1 - blink), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3.5 * s;
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(x + look[0] * 3 * s, ey + look[1] * 3 * s, 5 * s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(x, ey, 6.2 * s, 7.4 * s * (1 - blink) + 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // brows
  const brows = ex.brows;
  if (brows) {
    ctx.lineWidth = 4.5 * s;
    for (const [x, side] of [[ex1, -1], [ex2, 1]]) {
      const by = ey - 17 * s;
      let inner = 0, outer = 0;
      if (brows === 'worried') { inner = -6; outer = 3; }
      if (brows === 'determined') { inner = 5; outer = -4; }
      if (brows === 'up') { inner = -6; outer = -6; }
      ctx.beginPath();
      ctx.moveTo(x + side * 9 * s, by + outer * s);
      ctx.lineTo(x - side * 6 * s, by + inner * s);
      ctx.stroke();
    }
  }
  // blush
  if (ex.blush) {
    ctx.fillStyle = rgba(C.coral, 0.32 * ex.blush);
    for (const x of [ex1 - 6 * s, ex2 + 6 * s]) {
      ctx.beginPath();
      ctx.ellipse(x, ey + 17 * s, 8 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // mouth
  const mx = fx * 0.9, my = R * 0.38 + fy * 0.5;
  const mouth = ex.mouth || 'smile';
  const mo = clamp(ex.mouthOpen ?? 0.6, 0, 1.4);
  ctx.lineWidth = 5 * s;
  ctx.fillStyle = ink;
  if (mouth === 'smile') {
    ctx.beginPath();
    ctx.arc(mx, my - 9 * s, 12 * s, Math.PI * 0.18, Math.PI * 0.82);
    ctx.stroke();
  } else if (mouth === 'grin') {
    ctx.beginPath();
    ctx.moveTo(mx - 14 * s, my - 4 * s);
    ctx.quadraticCurveTo(mx, my - 2 * s, mx + 14 * s, my - 4 * s);
    ctx.quadraticCurveTo(mx + 10 * s, my + 14 * s * mo, mx, my + 14 * s * mo);
    ctx.quadraticCurveTo(mx - 10 * s, my + 14 * s * mo, mx - 14 * s, my - 4 * s);
    ctx.fill();
    ctx.fillStyle = C.coral;
    ctx.beginPath();
    ctx.ellipse(mx + 2 * s, my + 7 * s * mo, 6 * s, 3.5 * s * mo, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (mouth === 'o' || mouth === 'chomp') {
    ctx.beginPath();
    ctx.ellipse(mx, my, (mouth === 'o' ? 7 : 11) * s, Math.max(1.5, 13 * s * mo), 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (mouth === 'flat') {
    ctx.beginPath();
    ctx.moveTo(mx - 9 * s, my);
    ctx.lineTo(mx + 9 * s, my);
    ctx.stroke();
  } else if (mouth === 'wavy') {
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const x = mx - 13 * s + (i * 26 * s) / 6;
      const y = my + (i % 2 ? -3.5 : 3.5) * s;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  } else if (mouth === 'frown') {
    ctx.beginPath();
    ctx.arc(mx, my + 10 * s, 11 * s, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawStick(ctx, J, opt = {}) {
  const ink = opt.ink || C.ink;
  const back = opt.back || '#3E4A42';
  const w = RIG.stroke * J.s;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // optional squash/stretch about the ground contact
  const sq = J.pose.squash ?? 0;
  if (sq) {
    const gy = Math.max(J.lB.end[1], J.lF.end[1]);
    ctx.translate(J.hip[0], gy);
    ctx.scale(1 + sq * 0.6, 1 - sq);
    ctx.translate(-J.hip[0], -gy);
  }
  strokeLimb(ctx, J.lB, w, back);
  drawFoot(ctx, J.lB, J.F, J.s, w, back);
  strokeLimb(ctx, J.aB, w, back);
  drawHand(ctx, J.aB, J.s, back);
  // torso
  ctx.strokeStyle = ink;
  ctx.lineWidth = w * 1.08;
  ctx.beginPath();
  ctx.moveTo(J.hip[0], J.hip[1]);
  ctx.lineTo(J.neck[0], J.neck[1]);
  ctx.stroke();
  strokeLimb(ctx, J.lF, w, ink);
  drawFoot(ctx, J.lF, J.F, J.s, w, ink);
  // head
  drawSprout(ctx, J, opt.sway, ink);
  ctx.fillStyle = opt.headFill || C.cream;
  ctx.strokeStyle = ink;
  ctx.lineWidth = w * 0.82;
  ctx.beginPath();
  ctx.arc(J.head[0], J.head[1], J.R, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawFace(ctx, J, ink);
  if (opt.beforeFrontArm) opt.beforeFrontArm(ctx, J);
  strokeLimb(ctx, J.aF, w, ink);
  drawHand(ctx, J.aF, J.s, ink);
  ctx.restore();
}

export function contactShadow(ctx, J, ground, alpha = 0.16) {
  const lift = Math.max(0, ground - Math.max(J.lB.end[1], J.lF.end[1]));
  const k = clamp(1 - lift / 260, 0.35, 1);
  ctx.fillStyle = `rgba(28,38,32,${alpha * k})`;
  ctx.beginPath();
  ctx.ellipse(J.hip[0] + J.F * 6, ground + 4, 78 * J.s * k, 12 * J.s * k, 0, 0, Math.PI * 2);
  ctx.fill();
}
