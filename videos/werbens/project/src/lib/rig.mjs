// Stickman rig: forward kinematics, auto ground contact, squash/stretch, faces and accessories.
// Angles in degrees, defined for a character facing RIGHT (facing = -1 mirrors).
//  t     torso lean (+ = lean forward)            head  head tilt relative to torso (+ = nod forward/down)
//  aSh   near upper-arm, relative to torso (0 = hanging, 90 = forward, 180 = up, -90 = back)
//  aEl   near elbow bend (+ = forearm curls forward/up)
//  bSh/bEl far arm.   aHip/bHip thigh absolute (0 = down, + = forward).   aKn/bKn knee bend (+ = shin swings back)
import { C } from "./palette.mjs";
import { lerp, rad, E, inv, clamp } from "./util.mjs";
import { circle, rr as rrect } from "./draw.mjs";

export const BONES = { thigh: 70, shin: 68, torso: 118, neck: 14, headR: 38, upper: 60, fore: 56 };
const KEYS = ["t", "head", "aSh", "aEl", "bSh", "bEl", "aHip", "aKn", "bHip", "bKn"];

export const POSES = {
  stand:     { t: 0, head: 0, aSh: 14, aEl: 10, bSh: -14, bEl: 10, aHip: 6, aKn: 2, bHip: -6, bKn: 2 },
  lookUp:    { t: -6, head: -22, aSh: 18, aEl: 14, bSh: -10, bEl: 12, aHip: 6, aKn: 2, bHip: -6, bKn: 2 },
  crouch:    { t: 22, head: -18, aSh: -50, aEl: 25, bSh: -60, bEl: 25, aHip: 75, aKn: 115, bHip: 62, bKn: 110 },
  reachUp:   { t: -6, head: -20, aSh: 172, aEl: 8, bSh: 160, bEl: 14, aHip: 14, aKn: 34, bHip: -18, bKn: 50 },
  holdUp:    { t: -5, head: -12, aSh: 158, aEl: 22, bSh: 150, bEl: 28, aHip: 8, aKn: 4, bHip: -8, bKn: 4 },
  holdFront: { t: 2, head: 6, aSh: 62, aEl: 72, bSh: 54, bEl: 78, aHip: 6, aKn: 2, bHip: -6, bKn: 2 },
  land:      { t: 18, head: 4, aSh: 70, aEl: 60, bSh: 60, bEl: 60, aHip: 48, aKn: 80, bHip: 34, bKn: 72 },
  windUp:    { t: -16, head: -6, aSh: -135, aEl: -30, bSh: 70, bEl: 20, aHip: 26, aKn: 10, bHip: -24, bKn: 18 },
  throw:     { t: 22, head: 6, aSh: 112, aEl: 6, bSh: -50, bEl: 20, aHip: 34, aKn: 8, bHip: -34, bKn: 36 },
  shock:     { t: -12, head: -8, aSh: 148, aEl: 70, bSh: 138, bEl: 72, aHip: 18, aKn: 6, bHip: -18, bKn: 6 },
  slump:     { t: 24, head: 24, aSh: 6, aEl: 0, bSh: -4, bEl: 0, aHip: 10, aKn: 16, bHip: -4, bKn: 18 },
  tangled:   { t: 4, head: -4, aSh: 8, aEl: 18, bSh: -8, bEl: 18, aHip: 4, aKn: 4, bHip: -4, bKn: 4 },
  point:     { t: 6, head: 2, aSh: 84, aEl: 4, bSh: -12, bEl: 12, aHip: 10, aKn: 2, bHip: -10, bKn: 4 },
  bendPick:  { t: 58, head: -18, aSh: 64, aEl: 4, bSh: 30, bEl: 10, aHip: 46, aKn: 64, bHip: 22, bKn: 56 },
  cheer:     { t: -4, head: -10, aSh: 166, aEl: 4, bSh: 162, bEl: 6, aHip: 20, aKn: 30, bHip: -20, bKn: 40 },
  wave:      { t: 0, head: -4, aSh: 150, aEl: 30, bSh: -14, bEl: 10, aHip: 6, aKn: 2, bHip: -6, bKn: 2 },
  thumbsUp:  { t: 2, head: -4, aSh: 70, aEl: 92, bSh: -12, bEl: 10, aHip: 6, aKn: 2, bHip: -6, bKn: 2 },
  catchUp:   { t: -6, head: -16, aSh: 150, aEl: 12, bSh: 140, bEl: 18, aHip: 8, aKn: 6, bHip: -10, bKn: 8 },
  read:      { t: 4, head: 14, aSh: 44, aEl: 96, bSh: 36, bEl: 100, aHip: 6, aKn: 2, bHip: -6, bKn: 2 },
  fist:      { t: -4, head: -8, aSh: 120, aEl: 110, bSh: -20, bEl: 20, aHip: 10, aKn: 4, bHip: -10, bKn: 6 },
  talk:      { t: 2, head: -4, aSh: 52, aEl: 64, bSh: -16, bEl: 16, aHip: 6, aKn: 2, bHip: -6, bKn: 2 },
  sit:       { t: 8, head: -6, aSh: 30, aEl: 40, bSh: 20, bEl: 40, aHip: 85, aKn: 90, bHip: 80, bKn: 90 },
  film:      { t: 4, head: 4, aSh: 96, aEl: 48, bSh: 78, bEl: 60, aHip: 12, aKn: 4, bHip: -12, bKn: 6 },
  selfie:    { t: -4, head: -10, aSh: 140, aEl: -10, bSh: 40, bEl: 120, aHip: 6, aKn: 2, bHip: -8, bKn: 6 },
  dance:     { t: 8, head: 8, aSh: 130, aEl: 60, bSh: -60, bEl: 40, aHip: 30, aKn: 40, bHip: -10, bKn: 20 },
};

export function pose(name, over = {}) {
  return { ...POSES[name], ...over };
}
export function mixPose(a, b, t) {
  const o = {};
  for (const k of KEYS) o[k] = lerp(a[k] ?? 0, b[k] ?? 0, t);
  return o;
}
export function addPose(a, d) {
  const o = { ...a };
  for (const k of Object.keys(d)) o[k] = (o[k] ?? 0) + d[k];
  return o;
}
/** keys: [[frame, poseNameOrObj, ease?], ...] */
export function poseAt(keys, f) {
  const P = (p) => (typeof p === "string" ? POSES[p] : p);
  if (f <= keys[0][0]) return { ...P(keys[0][1]) };
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const e = keys[i][2] || E.inOutCubic;
      return mixPose(P(keys[i - 1][1]), P(keys[i][1]), e(inv(keys[i - 1][0], keys[i][0], f)));
    }
  }
  return { ...P(keys[keys.length - 1][1]) };
}
/** Procedural walk cycle pose, phase in cycles. */
export function walkPose(phase, amt = 1) {
  const s = Math.sin(phase * Math.PI * 2);
  const c = Math.cos(phase * Math.PI * 2);
  return {
    t: 6 * amt, head: 0,
    aSh: -26 * s * amt + 8, aEl: 18, bSh: 26 * s * amt - 8, bEl: 18,
    aHip: 28 * s * amt, aKn: Math.max(0, 40 * c) * amt + 4, bHip: -28 * s * amt, bKn: Math.max(0, -40 * c) * amt + 4,
  };
}

const dirDown = (aDeg) => ({ x: Math.sin(rad(aDeg)), y: Math.cos(rad(aDeg)) });
const dirUp = (aDeg) => ({ x: Math.sin(rad(aDeg)), y: -Math.cos(rad(aDeg)) });

/** Compute joints in local (unscaled) coordinates with hip at origin. */
export function joints(p) {
  const B = BONES;
  const hip = { x: 0, y: 0 };
  const up = dirUp(p.t);
  const neck = { x: up.x * B.torso, y: up.y * B.torso };
  const sh = { x: up.x * B.torso * 0.86, y: up.y * B.torso * 0.86 };
  const hu = dirUp(p.t + p.head);
  const head = { x: neck.x + hu.x * (B.neck + B.headR), y: neck.y + hu.y * (B.neck + B.headR) };
  const arm = (shA, elA) => {
    const A1 = shA - p.t, A2 = A1 + elA;
    const d1 = dirDown(A1), d2 = dirDown(A2);
    const el = { x: sh.x + d1.x * B.upper, y: sh.y + d1.y * B.upper };
    const hand = { x: el.x + d2.x * B.fore, y: el.y + d2.y * B.fore };
    return { el, hand, ang: A2 };
  };
  const leg = (hipA, knA) => {
    const d1 = dirDown(hipA), d2 = dirDown(hipA - knA);
    const knee = { x: d1.x * B.thigh, y: d1.y * B.thigh };
    const foot = { x: knee.x + d2.x * B.shin, y: knee.y + d2.y * B.shin };
    return { knee, foot };
  };
  return { hip, neck, sh, head, headAng: p.t + p.head, a: arm(p.aSh, p.aEl), b: arm(p.bSh, p.bEl), la: leg(p.aHip, p.aKn), lb: leg(p.bHip, p.bKn) };
}

export const DEFAULT_FACE = { eye: 1, look: 0, lookY: 0, brow: 0, browTilt: 0, smile: 0.4, open: 0, blush: 0 };

/** Draw the head (circle + face + accessory) in local head coords (centre 0,0, upright). */
export function drawHead(ctx, kind, face, R = BONES.headR, lw = 9) {
  const F = { ...DEFAULT_FACE, ...face };
  // back-of-head accessories
  if (kind === "brand") {
    circle(ctx, -R * 0.78, -R * 0.62, R * 0.4, C.ink);
  }
  if (kind === "phones") {
    ctx.save();
    ctx.lineWidth = 9; ctx.strokeStyle = C.ink; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(0, 0, R + 8, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = C.lilac;
    ctx.beginPath(); ctx.arc(0, 0, R + 8, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
    ctx.restore();
  }
  circle(ctx, 0, 0, R, C.white, C.ink, lw);
  // hair / hats
  if (kind === "brand") {
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, R, Math.PI * 0.92, Math.PI * 1.62); ctx.arc(-R * 0.05, -R * 0.1, R * 0.62, Math.PI * 1.55, Math.PI * 0.98, true);
    ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
    ctx.restore();
  }
  if (kind === "cap") {
    ctx.save();
    const cy = -R * 0.46;
    ctx.beginPath(); ctx.moveTo(-R * 0.94, cy); ctx.arc(0, cy, R * 0.94, Math.PI, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = C.coral; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-R * 0.55, cy - 2); ctx.quadraticCurveTo(-R * 1.55, cy - R * 0.12, -R * 1.6, cy + R * 0.12); ctx.lineTo(-R * 0.78, cy + R * 0.14); ctx.closePath();
    ctx.fillStyle = C.coral; ctx.fill(); ctx.stroke();
    circle(ctx, 0, cy - R * 0.95, R * 0.12, C.ink);
    ctx.restore();
  }
  if (kind === "beanie") {
    ctx.save();
    const cy = -R * 0.5;
    ctx.beginPath(); ctx.moveTo(-R * 0.92, cy); ctx.arc(0, cy, R * 0.92, Math.PI, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = C.yellow; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); rrect(ctx, -R * 1.0, cy - R * 0.06, R * 2.0, R * 0.3, R * 0.1); ctx.fillStyle = C.yellow; ctx.fill(); ctx.stroke();
    circle(ctx, 0, cy - R * 1.0, R * 0.22, C.yellow, C.ink, 5);
    ctx.restore();
  }
  if (kind === "phones") {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(-R * 0.18, R * 0.02, R * 0.3, R * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = C.lilac; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
  }
  // face (3/4 view, shifted toward facing direction)
  const fx = R * 0.3;
  const ex = [fx - R * 0.27, fx + R * 0.27];
  const ey = -R * 0.06 + (F.lookY || 0) * 3;
  ctx.save();
  ctx.fillStyle = C.ink;
  ctx.strokeStyle = C.ink;
  ctx.lineCap = "round";
  for (let i = 0; i < 2; i++) {
    const ox = ex[i] + F.look * 4;
    const eh = 7.5 * clamp(F.eye, 0, 1.6);
    if (eh < 1.6) {
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ox - 6, ey + 1); ctx.quadraticCurveTo(ox, ey + 5, ox + 6, ey + 1); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.ellipse(ox, ey, 5.2 * Math.min(1.25, 0.8 + F.eye * 0.2), eh, 0, 0, Math.PI * 2); ctx.fill();
      if (F.eye > 1.05) { circle(ctx, ox + 1.8, ey - eh * 0.4, 1.8, C.white); }
    }
    // brows
    const by = ey - 15 - F.brow * 6;
    const tilt = (i === 0 ? 1 : -1) * F.browTilt * 0.35;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(ox - 7, by + Math.sin(tilt) * 7);
    ctx.lineTo(ox + 7, by - Math.sin(tilt) * 7);
    ctx.stroke();
  }
  // blush
  if (F.blush > 0) {
    ctx.globalAlpha = F.blush * 0.55;
    circle(ctx, fx + R * 0.52, R * 0.3, 6, C.coral);
    circle(ctx, fx - R * 0.5, R * 0.3, 6, C.coral);
    ctx.globalAlpha = 1;
  }
  // mouth
  const mx = fx + F.look * 3, my = R * 0.42;
  const mw = 11;
  if (F.open > 0.08) {
    ctx.beginPath();
    ctx.ellipse(mx, my + 2, mw * (0.6 + F.open * 0.3), 3 + F.open * 9, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(mx - mw, my - F.smile * 2);
    ctx.quadraticCurveTo(mx, my + F.smile * 12, mx + mw, my - F.smile * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draw a stickman.
 * o = { x, ground, s, facing, pose, face, kind, lift, sx, sy, rot, alpha, holdA(ctx, hand, ang), holdB, shadow }
 * Returns world-space positions of hands/head for prop attachment.
 */
export function drawStick(ctx, o) {
  const s = o.s ?? 1, fc = o.facing ?? 1, sx = o.sx ?? 1, sy = o.sy ?? 1;
  const p = o.pose;
  const J = joints(p);
  const footMax = Math.max(J.la.foot.y, J.lb.foot.y);
  const lift = o.lift ?? 0;
  const lw = 13;
  const ink = o.color ?? C.ink;

  // world transform helper
  const toWorld = (pt) => ({ x: o.x + fc * pt.x * s * sx, y: o.ground - lift + (pt.y - footMax) * s * sy });

  if (o.shadow !== false) {
    const sh = Math.max(0.25, 1 - lift / 400);
    ctx.save();
    ctx.globalAlpha = 0.16 * sh * (o.alpha ?? 1);
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.ellipse(o.x, o.ground + 2, 62 * s * sh, 10 * s * sh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.translate(o.x, o.ground - lift);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(fc * s * sx, s * sy);
  ctx.translate(0, -footMax);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const limb = (a, b, c, color) => {
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y);
    ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.stroke();
  };
  const foot = (f, knee, color) => {
    ctx.beginPath(); ctx.moveTo(f.x - 2, f.y); ctx.lineTo(f.x + 15, f.y + 1);
    ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.stroke();
  };
  const far = o.farColor ?? C.inkFar;
  // far limbs
  limb(J.sh, J.b.el, J.b.hand, far);
  circle(ctx, J.b.hand.x, J.b.hand.y, 8, far);
  limb(J.hip, J.lb.knee, J.lb.foot, far);
  foot(J.lb.foot, J.lb.knee, far);
  // torso
  ctx.beginPath(); ctx.moveTo(J.hip.x, J.hip.y); ctx.lineTo(J.neck.x, J.neck.y);
  ctx.lineWidth = lw + 1; ctx.strokeStyle = ink; ctx.stroke();
  // tie (brand)
  if (o.kind === "brand") {
    const u = { x: (J.neck.x - J.hip.x) / BONES.torso, y: (J.neck.y - J.hip.y) / BONES.torso };
    const n = { x: -u.y, y: u.x };
    const at = (k, side) => ({ x: J.hip.x + u.x * BONES.torso * k + n.x * side, y: J.hip.y + u.y * BONES.torso * k + n.y * side });
    const p1 = at(0.92, 0), p2 = at(0.7, 9), p3 = at(0.42, 0), p4 = at(0.7, -9);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath();
    ctx.fillStyle = C.violet; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke();
  }
  // near leg
  limb(J.hip, J.la.knee, J.la.foot, ink);
  foot(J.la.foot, J.la.knee, ink);
  // head
  ctx.save();
  ctx.translate(J.head.x, J.head.y);
  ctx.rotate(rad(J.headAng));
  drawHead(ctx, o.kind, o.face || {});
  ctx.restore();
  // near arm
  limb(J.sh, J.a.el, J.a.hand, ink);
  circle(ctx, J.a.hand.x, J.a.hand.y, 8, ink);
  ctx.restore();

  const hands = { a: toWorld(J.a.hand), b: toWorld(J.b.hand), head: toWorld(J.head), neck: toWorld(J.neck), hip: toWorld(J.hip), aAng: J.a.ang, bAng: J.b.ang };
  if (o.rot) {
    // approximate: rotate attachment points around (x, ground-lift)
    const cx = o.x, cy = o.ground - lift, cs = Math.cos(o.rot), sn = Math.sin(o.rot);
    for (const k of ["a", "b", "head", "neck", "hip"]) {
      const q = hands[k]; const dx = q.x - cx, dy = q.y - cy;
      hands[k] = { x: cx + dx * cs - dy * sn, y: cy + dx * sn + dy * cs };
    }
  }
  hands.headR = BONES.headR * s;
  return hands;
}

/** World-space attachment points for a stick figure without drawing it (same mapping as drawStick). */
export function rigWorld(o) {
  const s = o.s ?? 1, fc = o.facing ?? 1, sx = o.sx ?? 1, sy = o.sy ?? 1;
  const J = joints(o.pose);
  const footMax = Math.max(J.la.foot.y, J.lb.foot.y);
  const lift = o.lift ?? 0;
  const cx = o.x, cy = o.ground - lift, cs = Math.cos(o.rot ?? 0), sn = Math.sin(o.rot ?? 0);
  const tw = (pt) => {
    const dx = fc * pt.x * s * sx, dy = (pt.y - footMax) * s * sy;
    return { x: cx + dx * cs - dy * sn, y: cy + dx * sn + dy * cs };
  };
  return { a: tw(J.a.hand), b: tw(J.b.hand), head: tw(J.head), neck: tw(J.neck), hip: tw(J.hip), headR: BONES.headR * s,
    aAng: J.a.ang, bAng: J.b.ang };
}

/** Interpolate numeric face params from keyframes [[f, {..}], ...]. */
export function faceAt(keys, f) {
  const base = { ...DEFAULT_FACE };
  const get = (o) => ({ ...base, ...o });
  if (f <= keys[0][0]) return get(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const a = get(keys[i - 1][1]), b = get(keys[i][1]);
      const t = E.inOutCubic(inv(keys[i - 1][0], keys[i][0], f));
      const o = {};
      for (const k of Object.keys(base)) o[k] = lerp(a[k], b[k], t);
      return o;
    }
  }
  return get(keys[keys.length - 1][1]);
}
