'use strict';
// Original stick-figure "advocate" rig: black coat, white bands, expressive face.
// Pose angles are radians. Limb angles are measured from straight down, positive = toward the
// facing direction. Arms are relative to the torso; legs are relative to world vertical.
const { deg, TAU, clamp, lerp } = require('./lib');
const C = require('./palette');

const DIM = { torso: 120, neck: 12, head: 35, upperArm: 60, foreArm: 56, thigh: 70, shin: 68, limb: 12 };
const LEG = DIM.thigh + DIM.shin;

function base(over = {}) {
  return Object.assign({
    x: 0, y: 0, s: 1, f: 1, lean: 0, head: 0, squash: 1, rot: 0,
    aL: [deg(-12), deg(10)], aR: [deg(12), deg(14)],
    lL: [deg(-5), deg(4)], lR: [deg(6), deg(4)],
    face: { eye: 1, look: 0.35, lookY: 0, brow: 0, tilt: 0, mouth: 0.4, open: 0, blink: 0 },
  }, over);
}

const dir = (a, f) => [f * Math.sin(a), Math.cos(a)];

// Compute world-space joints (before the optional whole-body rotation `rot`, which is applied
// in draw via the canvas transform around the hip).
function joints(p) {
  const s = p.s, f = p.f, q = p.squash;
  const hip = [0, 0];
  const up = [f * Math.sin(p.lean), -Math.cos(p.lean)];
  const neck = [hip[0] + up[0] * DIM.torso * s, hip[1] + up[1] * DIM.torso * s * q];
  const sh = [lerp(hip[0], neck[0], 0.88), lerp(hip[1], neck[1], 0.88)];
  const headC = [neck[0] + up[0] * (DIM.neck + DIM.head) * s, neck[1] + up[1] * (DIM.neck + DIM.head) * s * q];
  const arm = (a) => {
    const a1 = p.lean + a[0];
    const d1 = dir(a1, f);
    const el = [sh[0] + d1[0] * DIM.upperArm * s, sh[1] + d1[1] * DIM.upperArm * s];
    const a2 = a1 + a[1];
    const d2 = dir(a2, f);
    const hand = [el[0] + d2[0] * DIM.foreArm * s, el[1] + d2[1] * DIM.foreArm * s];
    return { el, hand, a2 };
  };
  const leg = (l) => {
    const d1 = dir(l[0], f);
    const kn = [hip[0] + d1[0] * DIM.thigh * s, hip[1] + d1[1] * DIM.thigh * s * q];
    const a2 = l[0] - l[1];
    const d2 = dir(a2, f);
    const ft = [kn[0] + d2[0] * DIM.shin * s, kn[1] + d2[1] * DIM.shin * s * q];
    return { kn, ft, a2 };
  };
  return { hip, neck, sh, headC, L: arm(p.aL), R: arm(p.aR), LL: leg(p.lL), LR: leg(p.lR), up };
}

// World position of a hand (accounts for p.x/p.y and rot).
function handWorld(p, which = 'R') {
  const j = joints(p);
  const h = j[which].hand;
  const c = Math.cos(p.rot), sn = Math.sin(p.rot);
  return { x: p.x + h[0] * c - h[1] * sn, y: p.y + h[0] * sn + h[1] * c, a: j[which].a2 + p.rot * p.f };
}
function headWorld(p) {
  const j = joints(p);
  const h = j.headC;
  const c = Math.cos(p.rot), sn = Math.sin(p.rot);
  return { x: p.x + h[0] * c - h[1] * sn, y: p.y + h[0] * sn + h[1] * c };
}

function line(ctx, pts, w, color) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineWidth = w;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawShoe(ctx, ft, a2, s, f) {
  ctx.save();
  ctx.translate(ft[0], ft[1]);
  ctx.rotate(-f * (a2 * 0.35));
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.ellipse(f * 9 * s, 2 * s, 17 * s, 8 * s, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawCoat(ctx, j, p) {
  const s = p.s, f = p.f;
  const ang = Math.atan2(j.up[0], -j.up[1]);
  const len = Math.hypot(j.neck[0] - j.hip[0], j.neck[1] - j.hip[1]);
  ctx.save();
  ctx.translate(j.hip[0], j.hip[1]);
  ctx.rotate(ang);
  // coat body (from neck to below hip), slightly flared, drawn in torso-local coords (up = -y)
  const top = -len, wTop = 25 * s, wBot = 33 * s, hem = 22 * s;
  ctx.fillStyle = C.coat;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.moveTo(-wTop, top + 8 * s);
  ctx.quadraticCurveTo(0, top - 6 * s, wTop, top + 8 * s);
  ctx.lineTo(wBot, hem);
  ctx.quadraticCurveTo(0, hem + 8 * s, -wBot, hem);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // shirt V + lapels, offset toward facing side
  const off = f * 6 * s;
  ctx.fillStyle = C.shirt;
  ctx.beginPath();
  ctx.moveTo(off - 15 * s, top + 4 * s);
  ctx.lineTo(off + 15 * s, top + 4 * s);
  ctx.lineTo(off, top + 50 * s);
  ctx.closePath();
  ctx.fill();
  // advocate bands (two white tabs)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.5 * s;
  for (const dx of [-5.5, 5.5]) {
    ctx.beginPath();
    ctx.roundRect(off + dx * s - 4.5 * s, top + 8 * s, 9 * s, 30 * s, 2 * s);
    ctx.fill();
    ctx.stroke();
  }
  // lapel lines
  ctx.strokeStyle = '#3A4256';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(off - 17 * s, top + 6 * s); ctx.lineTo(off - 1 * s, top + 58 * s);
  ctx.moveTo(off + 17 * s, top + 6 * s); ctx.lineTo(off + 1 * s, top + 58 * s);
  ctx.stroke();
  // buttons
  ctx.fillStyle = C.gold;
  for (const yy of [top + 72 * s, top + 92 * s]) {
    ctx.beginPath(); ctx.arc(off, yy, 3.2 * s, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawHead(ctx, j, p) {
  const s = p.s, f = p.f, F = p.face;
  const [cx, cy] = j.headC;
  const r = DIM.head * s;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(f * p.head + Math.atan2(j.up[0], -j.up[1]) * 0.5);
  // head
  ctx.fillStyle = C.skin;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 8 * s;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
  // hair cap (top/back of the head), clipped to the head circle
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r - 2 * s, 0, TAU); ctx.clip();
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.ellipse(-f * 9 * s, -r * 0.92, r * 1.0, r * 0.52, -f * 0.18, 0, TAU);
  ctx.fill();
  ctx.restore();
  // eyes
  const lx = F.look * 13 * s * f, ly = F.lookY * 8 * s;
  const open = clamp(F.eye * (1 - F.blink), 0.06, 1.6);
  for (const ex of [-11, 11]) {
    const x = ex * s + lx, y = -4 * s + ly;
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.ellipse(x, y, 4.6 * s * (F.eye > 1.2 ? 1.25 : 1), 6.2 * s * open, 0, 0, TAU);
    ctx.fill();
    if (F.eye > 1.2) { // wide eyes get a highlight
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + 1.6 * s, y - 2.4 * s, 1.6 * s, 0, TAU); ctx.fill();
    }
  }
  // brows: F.brow raises (+) / lowers (-); F.tilt > 0 = worried (inner ends up), < 0 = cross
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4 * s;
  ctx.lineCap = 'round';
  const tiltK = F.tilt || 0;
  for (const side of [-1, 1]) {
    const x = side * 11 * s + lx;
    const y = -18 * s + ly - F.brow * 4 * s;
    const inner = -tiltK * 4 * s, outer = tiltK * 2 * s;
    ctx.beginPath();
    ctx.moveTo(x - side * 6 * s, y + inner);
    ctx.lineTo(x + side * 6 * s, y + outer);
    ctx.stroke();
  }
  // mouth
  const mx = lx * 0.9, my = 13 * s + ly * 0.5;
  ctx.lineWidth = 4 * s;
  if (F.open > 0.08) {
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.ellipse(mx, my + 1 * s, (5 + 3 * Math.max(0, F.mouth)) * s, (2 + 7 * F.open) * s, 0, 0, TAU);
    ctx.fill();
  } else {
    const w = 9 * s, curve = F.mouth * 7 * s;
    ctx.beginPath();
    ctx.moveTo(mx - w, my - curve * 0.3);
    ctx.quadraticCurveTo(mx, my + curve, mx + w, my - curve * 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

// opts.propR / propL: (ctx, handPoint, forearmAngle, pose) drawn in rig-local space.
function drawAdvocate(ctx, p, opts = {}) {
  const j = joints(p);
  const s = p.s;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  const w = DIM.limb * s;
  // soft contact shadow is drawn by caller (needs ground y)
  // far arm + far leg
  line(ctx, [j.sh, j.L.el, j.L.hand], w, C.inkFar);
  if (opts.propL) opts.propL(ctx, j.L.hand, j.L.a2, p);
  line(ctx, [j.hip, j.LL.kn, j.LL.ft], w, C.inkFar);
  drawShoe(ctx, j.LL.ft, j.LL.a2, s, p.f);
  // near leg
  line(ctx, [j.hip, j.LR.kn, j.LR.ft], w, C.ink);
  drawShoe(ctx, j.LR.ft, j.LR.a2, s, p.f);
  drawCoat(ctx, j, p);
  // neck
  line(ctx, [j.neck, [lerp(j.neck[0], j.headC[0], 0.6), lerp(j.neck[1], j.headC[1], 0.6)]], w * 0.9, C.ink);
  drawHead(ctx, j, p);
  if (opts.behindNearArm) opts.behindNearArm(ctx, j, p);
  // near arm (sleeve = coat colour on upper arm)
  line(ctx, [j.sh, j.R.el], w * 1.25, C.ink);
  line(ctx, [j.sh, j.R.el], w * 0.55, C.coat);
  line(ctx, [j.R.el, j.R.hand], w, C.ink);
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(j.R.hand[0], j.R.hand[1], w * 0.75, 0, TAU); ctx.fill();
  if (opts.propR) opts.propR(ctx, j.R.hand, j.R.a2, p);
  ctx.restore();
}

function contactShadow(ctx, x, groundY, s, lift = 0, alpha = 0.18) {
  const k = clamp(1 - lift / 300, 0.3, 1);
  ctx.save();
  ctx.fillStyle = `rgba(14,42,82,${alpha * k})`;
  ctx.beginPath();
  ctx.ellipse(x, groundY + 4 * s, 62 * s * k, 11 * s * k, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ---- pose library (partial poses merged over base) ----
const POSES = {
  stand: { lean: deg(0), aL: [deg(-10), deg(12)], aR: [deg(10), deg(14)], lL: [deg(-6), deg(3)], lR: [deg(6), deg(3)] },
  windUp: { lean: deg(-14), aL: [deg(160), deg(20)], aR: [deg(172), deg(14)], lL: [deg(-22), deg(40)], lR: [deg(18), deg(40)], head: deg(-10) },
  throwThrough: { lean: deg(22), aL: [deg(60), deg(-10)], aR: [deg(70), deg(-6)], lL: [deg(-28), deg(18)], lR: [deg(26), deg(30)], head: deg(6) },
  recoil: { lean: deg(-12), aL: [deg(120), deg(70)], aR: [deg(135), deg(60)], lL: [deg(-24), deg(10)], lR: [deg(10), deg(10)], head: deg(-8) },
  duck: { lean: deg(28), aL: [deg(155), deg(110)], aR: [deg(160), deg(115)], lL: [deg(-35), deg(80)], lR: [deg(35), deg(85)], head: deg(16) },
  squat: { lean: deg(18), aL: [deg(30), deg(40)], aR: [deg(40), deg(40)], lL: [deg(-30), deg(90)], lR: [deg(40), deg(95)] },
  fallBack: { lean: deg(-80), aL: [deg(150), deg(30)], aR: [deg(120), deg(30)], lL: [deg(70), deg(20)], lR: [deg(95), deg(10)], head: deg(-10) },
  sitDazed: { lean: deg(-18), aL: [deg(-40), deg(30)], aR: [deg(-30), deg(25)], lL: [deg(80), deg(10)], lR: [deg(95), deg(30)] },
  skid: { lean: deg(-26), aL: [deg(130), deg(30)], aR: [deg(100), deg(20)], lL: [deg(-10), deg(10)], lR: [deg(42), deg(4)], head: deg(-10) },
  shrug: { lean: deg(0), aL: [deg(-70), deg(-110)], aR: [deg(70), deg(110)], lL: [deg(-6), deg(3)], lR: [deg(6), deg(3)], head: deg(-8) },
  despair: { lean: deg(16), aL: [deg(130), deg(130)], aR: [deg(140), deg(125)], lL: [deg(-8), deg(10)], lR: [deg(10), deg(14)], head: deg(18) },
  phoneUp: { lean: deg(-4), aL: [deg(-10), deg(14)], aR: [deg(70), deg(68)], lL: [deg(-8), deg(3)], lR: [deg(8), deg(3)], head: deg(-6) },
  phoneHigh: { lean: deg(-8), aL: [deg(-14), deg(14)], aR: [deg(150), deg(10)], lL: [deg(-9), deg(3)], lR: [deg(9), deg(3)], head: deg(-14) },
  crouch: { lean: deg(24), aL: [deg(-40), deg(20)], aR: [deg(-30), deg(20)], lL: [deg(-25), deg(85)], lR: [deg(35), deg(90)], head: deg(4) },
  leap: { lean: deg(10), aL: [deg(150), deg(10)], aR: [deg(140), deg(20)], lL: [deg(-30), deg(70)], lR: [deg(50), deg(40)], head: deg(-6) },
  land: { lean: deg(16), aL: [deg(60), deg(30)], aR: [deg(80), deg(20)], lL: [deg(-25), deg(70)], lR: [deg(30), deg(75)] },
  plant: { lean: deg(18), aL: [deg(-20), deg(20)], aR: [deg(120), deg(-40)], lL: [deg(-14), deg(18)], lR: [deg(20), deg(22)] },
  point: { lean: deg(-2), aL: [deg(-12), deg(14)], aR: [deg(95), deg(-4)], lL: [deg(-6), deg(3)], lR: [deg(6), deg(3)] },
  ask: { lean: deg(-6), aL: [deg(-14), deg(10)], aR: [deg(115), deg(70)], lL: [deg(-6), deg(3)], lR: [deg(6), deg(3)], head: deg(-12) },
  holdCard: { lean: deg(0), aL: [deg(-8), deg(12)], aR: [deg(62), deg(30)], lL: [deg(-6), deg(3)], lR: [deg(6), deg(3)] },
  lens: { lean: deg(4), aL: [deg(55), deg(40)], aR: [deg(90), deg(-6)], lL: [deg(-8), deg(3)], lR: [deg(8), deg(3)] },
  thumbsUp: { lean: deg(-4), aL: [deg(55), deg(40)], aR: [deg(40), deg(120)], lL: [deg(-8), deg(3)], lR: [deg(8), deg(3)], head: deg(-6) },
  tap: { lean: deg(8), aL: [deg(-14), deg(12)], aR: [deg(86), deg(-2)], lL: [deg(-10), deg(4)], lR: [deg(14), deg(6)] },
  wave: { lean: deg(-3), aL: [deg(-12), deg(12)], aR: [deg(150), deg(30)], lL: [deg(-6), deg(3)], lR: [deg(6), deg(3)], head: deg(-6) },
};

const FACES = {
  neutral: { tilt: 0, eye: 1, look: 0.35, lookY: 0, brow: 0, mouth: 0.3, open: 0, blink: 0 },
  determined: { tilt: -0.8, eye: 0.85, look: 0.6, lookY: 0, brow: -0.4, mouth: -0.1, open: 0, blink: 0 },
  effort: { tilt: -1, eye: 0.35, look: 0.5, lookY: -0.2, brow: -0.5, mouth: -0.3, open: 0.4, blink: 0 },
  shock: { tilt: 0, eye: 1.5, look: 0.6, lookY: -0.3, brow: 1, mouth: 0, open: 0.9, blink: 0 },
  worry: { tilt: 1, eye: 1.1, look: 0.2, lookY: -0.4, brow: 0.2, mouth: -0.6, open: 0, blink: 0 },
  dazed: { tilt: 0, eye: 0.25, look: 0, lookY: 0.2, brow: 0.2, mouth: -0.2, open: 0.25, blink: 0 },
  idea: { tilt: 0, eye: 1.35, look: 0.5, lookY: -0.5, brow: 1, mouth: 0.9, open: 0.35, blink: 0 },
  happy: { tilt: 0, eye: 1, look: 0.4, lookY: 0, brow: 0.5, mouth: 1, open: 0, blink: 0 },
  grin: { tilt: 0, eye: 0.9, look: 0.5, lookY: -0.1, brow: 0.6, mouth: 1, open: 0.45, blink: 0 },
  curious: { tilt: 0, eye: 1.15, look: 0.8, lookY: -0.5, brow: 0.8, mouth: 0.1, open: 0.15, blink: 0 },
  focus: { tilt: -0.4, eye: 0.7, look: 0.9, lookY: 0.1, brow: -0.3, mouth: 0, open: 0, blink: 0 },
};

function pose(name, over = {}) {
  return base(Object.assign({}, POSES[name], over));
}

// Procedural locomotion. phase: number of cycles; returns limbs + bob offset (px at s=1).
function runCycle(phase, k = 1) {
  const p = phase * TAU;
  const leg = (q) => [deg(42 * k) * Math.sin(q), deg(20 + 70 * k * Math.max(0, Math.cos(q)))];
  const arm = (q) => [deg(-50 * k) * Math.sin(q), deg(80)];
  return {
    lean: deg(16 * k),
    lR: leg(p), lL: leg(p + Math.PI),
    aR: arm(p), aL: arm(p + Math.PI),
    bob: -Math.abs(Math.cos(p)) * 14 * k + 10 * k,
  };
}
function walkCycle(phase, k = 1) {
  const p = phase * TAU;
  const leg = (q) => [deg(24 * k) * Math.sin(q), deg(6 + 26 * k * Math.max(0, Math.cos(q)))];
  const arm = (q) => [deg(-22 * k) * Math.sin(q), deg(16)];
  return {
    lean: deg(4 * k),
    lR: leg(p), lL: leg(p + Math.PI),
    aR: arm(p), aL: arm(p + Math.PI),
    bob: -Math.abs(Math.cos(p)) * 6 * k + 3 * k,
  };
}

// Hip height for a standing pose (feet on ground) — uses the lower foot.
function hipAbove(p) {
  const j = joints(Object.assign({}, p, { x: 0, y: 0, rot: 0 }));
  return Math.max(j.LL.ft[1], j.LR.ft[1]) + 9 * p.s;
}


function shoulderWorld(p) {
  const j = joints(p);
  const c = Math.cos(p.rot), sn = Math.sin(p.rot);
  return { x: p.x + j.sh[0] * c - j.sh[1] * sn, y: p.y + j.sh[0] * sn + j.sh[1] * c };
}

// Two-bone IK: returns [shoulderAngle, elbowAngle] (pose convention) so that the hand reaches
// (tx,ty) in world space, elbow kept on the lower side. Assumes p.rot === 0.
function reachIK(p, which, tx, ty) {
  const sh = shoulderWorld(p);
  const l1 = DIM.upperArm * p.s, l2 = DIM.foreArm * p.s;
  let vx = tx - sh.x, vy = ty - sh.y;
  let d = Math.hypot(vx, vy);
  const maxD = (l1 + l2) * 0.995;
  if (d > maxD) { vx *= maxD / d; vy *= maxD / d; d = maxD; }
  d = Math.max(d, Math.abs(l1 - l2) + 1);
  const ang = (x, y) => Math.atan2(p.f * x, y);
  const at = ang(vx, vy);
  const alpha = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  let best = null;
  for (const sg of [1, -1]) {
    const ua = at + sg * alpha;
    const ex = sh.x + p.f * Math.sin(ua) * l1, ey = sh.y + Math.cos(ua) * l1;
    const fa = ang(sh.x + vx - ex, sh.y + vy - ey);
    if (!best || ey > best.ey) best = { ua, fa, ey };
  }
  return [best.ua - p.lean, best.fa - best.ua];
}

// Draw with a solid paper-cutout outline (for dark backgrounds).
let _off = null, _sil = null;
function drawAdvocateSticker(ctx, p, color, width) {
  const { createCanvas } = require('@napi-rs/canvas');
  const Wd = 520, Ht = 640, ox = 260, oy = 380;
  if (!_off) { _off = createCanvas(Wd, Ht); _sil = createCanvas(Wd, Ht); }
  const a = _off.getContext('2d'), b = _sil.getContext('2d');
  a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, Wd, Ht);
  a.translate(ox - p.x, oy - p.y);
  drawAdvocate(a, p);
  b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, Wd, Ht);
  b.drawImage(_off, 0, 0);
  b.globalCompositeOperation = 'source-in';
  b.fillStyle = color; b.fillRect(0, 0, Wd, Ht);
  b.globalCompositeOperation = 'source-over';
  for (let k = 0; k < 16; k++) {
    const an = (k / 16) * TAU;
    ctx.drawImage(_sil, p.x - ox + Math.cos(an) * width, p.y - oy + Math.sin(an) * width);
  }
  ctx.drawImage(_off, p.x - ox, p.y - oy);
}

module.exports = { shoulderWorld, reachIK, drawAdvocateSticker, DIM, LEG, base, pose, POSES, FACES, joints, handWorld, headWorld, drawAdvocate, contactShadow, runCycle, walkCycle, hipAbove };
