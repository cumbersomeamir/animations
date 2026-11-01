// Stick-figure rig: forward kinematics, optional 2-bone IK for hands, faces with moods,
// follow-through scarf driven by the figure's own motion history.
import { C, circle, line } from './paper.mjs';
import { TAU, clamp } from './core.mjs';

export const BASE = {
  x: 540, ground: 1650, lift: 0, s: 1, face: 1, lean: 0, head: 0,
  aL: [0.15, 0.2], aR: [-0.15, 0.2], // [upper angle from down (+ toward facing), elbow bend]
  lL: [0.08, 0], lR: [-0.08, 0], // [thigh angle, knee bend (negative = shin swings back)]
  mood: 'neutral', look: 0.6, lookY: 0, blink: 0, spin: 0, spinEye: 0,
};

const dir = (a) => ({ x: Math.sin(a), y: Math.cos(a) }); // angle from straight down
const add = (p, a, l) => ({ x: p.x + Math.sin(a) * l, y: p.y + Math.cos(a) * l });

function ik(sh, tg, a, b, bend) {
  const dx = tg.x - sh.x, dy = tg.y - sh.y;
  const d = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 1, a + b - 0.5);
  const base = Math.atan2(dx, dy);
  const alpha = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
  const up = base + bend * alpha;
  const el = add(sh, up, a);
  const fa = Math.atan2(tg.x - el.x, tg.y - el.y);
  return { el, hand: add(el, fa, b), up, fa };
}

/** Compute joint positions. P.aL/aR may be {ik:{x,y}, bend:±1}. */
export function geom(P0) {
  const P = { ...BASE, ...P0 };
  const s = P.s, f = P.face;
  // spin (0..1 per turn) squashes the body horizontally to fake a turn
  const sx = P.spin ? Math.cos(P.spin * TAU) : 1;
  const L = { T: 150 * s, UA: 78 * s, FA: 74 * s, TH: 98 * s, SH: 96 * s, HR: 40 * s };
  const lean = P.lean * f;
  const legs = ['lL', 'lR'].map((k) => {
    const [th, kn] = P[k];
    const a1 = th * f, a2 = (th + kn) * f;
    return { a1, a2 };
  });
  // provisional hip at origin to find foot drop
  const o = { x: 0, y: 0 };
  const kneeL = add(o, legs[0].a1, L.TH), footL = add(kneeL, legs[0].a2, L.SH);
  const kneeR = add(o, legs[1].a1, L.TH), footR = add(kneeR, legs[1].a2, L.SH);
  const drop = Math.max(footL.y, footR.y);
  const hip = { x: P.x, y: P.ground - drop - P.lift };
  const T = (p) => ({ x: hip.x + (p.x) * sx, y: hip.y + p.y });
  const neck0 = { x: Math.sin(lean) * L.T, y: -Math.cos(lean) * L.T };
  const sh0 = { x: Math.sin(lean) * (L.T - 12 * s), y: -Math.cos(lean) * (L.T - 12 * s) };
  const headA = lean + P.head * f;
  const head0 = { x: neck0.x + Math.sin(headA) * (L.HR + 4 * s), y: neck0.y - Math.cos(headA) * (L.HR + 4 * s) };
  const arms = ['aL', 'aR'].map((k) => {
    const a = P[k];
    if (a && a.ik) {
      const tg = { x: (a.ik.x - hip.x) / (sx || 1e-3), y: a.ik.y - hip.y };
      const r = ik(sh0, tg, L.UA, L.FA, (a.bend ?? 1) * f);
      return { el: r.el, hand: r.hand, fa: r.fa };
    }
    const up = lean + a[0] * f, fa = up + a[1] * f;
    const el = add(sh0, up, L.UA);
    return { el, hand: add(el, fa, L.FA), fa };
  });
  return {
    P, L, s, f, sx,
    hip, neck: T(neck0), sh: T(sh0), head: T(head0), headA,
    kneeL: T(kneeL), footL: T(footL), kneeR: T(kneeR), footR: T(footR),
    elL: T(arms[0].el), handL: T(arms[0].hand), faL: arms[0].fa,
    elR: T(arms[1].el), handR: T(arms[1].hand), faR: arms[1].fa,
  };
}

/** Draw figure. opts.who = 'A' (bun + scarf) | 'B' (tuft + marigold boutonniere). trail = neck history for scarf. */
export function drawFig(ctx, g, opts = {}) {
  const { P, s } = g;
  const lw = 13 * s, ink = opts.ink || C.ink;
  if (opts.who === 'A' && opts.trail) scarf(ctx, g, opts.trail, opts.scarfFlare || 0);
  line(ctx, [g.hip, g.kneeL, g.footL], ink, lw);
  line(ctx, [g.hip, g.kneeR, g.footR], ink, lw);
  line(ctx, [g.hip, g.neck], ink, lw);
  line(ctx, [g.sh, g.elL, g.handL], ink, lw);
  line(ctx, [g.sh, g.elR, g.handR], ink, lw);
  if (opts.who === 'B') {
    // marigold boutonniere on chest
    const p = { x: g.hip.x + (g.neck.x - g.hip.x) * 0.72 + 12 * s * g.f * g.sx, y: g.hip.y + (g.neck.y - g.hip.y) * 0.72 };
    for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; circle(ctx, p.x + Math.cos(a) * 7 * s, p.y + Math.sin(a) * 7 * s, 6 * s, C.goldDeep); }
    circle(ctx, p.x, p.y, 7 * s, C.gold);
  }
  headDraw(ctx, g, opts);
}

function headDraw(ctx, g, opts) {
  const { P, s, L } = g;
  const h = g.head, r = L.HR;
  const f = g.f;
  const side = g.sx; // -1..1 during spin: face visible when > 0
  if (opts.who === 'A') {
    // bun behind head (opposite to facing)
    const bx = h.x - f * r * 0.78 * side, by = h.y - r * 0.55;
    circle(ctx, bx, by, r * 0.42, C.ink);
  }
  circle(ctx, h.x, h.y, r, C.ivory, C.ink, 9 * s);
  if (opts.who === 'B') {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(h.x - 4 * s * f, h.y - r);
    ctx.quadraticCurveTo(h.x + 6 * s * f, h.y - r - 22 * s, h.x + 20 * s * f, h.y - r - 10 * s);
    ctx.stroke();
  }
  if (side < 0.15) return; // back of head during spin
  // face
  const look = P.look * f * side;
  const ex = h.x + look * r * 0.32, ey = h.y - r * 0.05 + (P.lookY || 0) * r * 0.16;
  const sp = r * 0.36 * Math.max(0.3, side);
  const mood = P.mood;
  ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineCap = 'round';
  const eye = (x) => {
    if (P.blink > 0.5 || mood === 'happy') {
      ctx.lineWidth = 5 * s;
      ctx.beginPath();
      if (mood === 'happy') ctx.arc(x, ey + 3 * s, 7 * s, Math.PI * 1.15, Math.PI * 1.85);
      else { ctx.moveTo(x - 7 * s, ey); ctx.lineTo(x + 7 * s, ey); }
      ctx.stroke();
    } else if (mood === 'dizzy') {
      ctx.lineWidth = 3.5 * s;
      ctx.beginPath();
      for (let k = 0; k < 24; k++) { const a = k * 0.55 + P.spinEye; const rr = k * 0.38 * s; const px = x + Math.cos(a) * rr, py = ey + Math.sin(a) * rr; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    } else {
      const er = (mood === 'surprised' ? 7.5 : 5.6) * s;
      circle(ctx, x, ey, er, C.ink);
    }
  };
  eye(ex - sp); eye(ex + sp);
  // brows
  ctx.lineWidth = 4.5 * s;
  const by = ey - 15 * s;
  const brow = (x, sgn) => {
    let tilt = 0, up = 0;
    if (mood === 'worried') tilt = -0.45 * sgn;
    if (mood === 'determined') tilt = 0.4 * sgn;
    if (mood === 'surprised') up = -6 * s;
    ctx.beginPath();
    ctx.moveTo(x - 8 * s, by + up + tilt * 8 * s);
    ctx.lineTo(x + 8 * s, by + up - tilt * 8 * s);
    ctx.stroke();
  };
  if (mood === 'worried' || mood === 'determined' || mood === 'surprised') { brow(ex - sp, -1); brow(ex + sp, 1); }
  // mouth
  const mx = ex, my = h.y + r * 0.42;
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  if (mood === 'happy') { ctx.arc(mx, my - 8 * s, 13 * s, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  else if (mood === 'surprised') { circle(ctx, mx, my, 7 * s, C.ink); }
  else if (mood === 'worried') { ctx.moveTo(mx - 10 * s, my + 2 * s); ctx.quadraticCurveTo(mx - 4 * s, my - 4 * s, mx, my); ctx.quadraticCurveTo(mx + 4 * s, my + 4 * s, mx + 10 * s, my - 2 * s); ctx.stroke(); }
  else if (mood === 'dizzy') { ctx.moveTo(mx - 10 * s, my); ctx.quadraticCurveTo(mx - 5 * s, my - 6 * s, mx, my); ctx.quadraticCurveTo(mx + 5 * s, my + 6 * s, mx + 10 * s, my); ctx.stroke(); }
  else if (mood === 'determined') { ctx.moveTo(mx - 9 * s, my); ctx.lineTo(mx + 9 * s, my - 1 * s); ctx.stroke(); }
  else { ctx.arc(mx, my - 6 * s, 9 * s, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  if (mood === 'happy' || mood === 'neutral') {
    circle(ctx, ex - sp - 6 * s, my - 4 * s, 6 * s, 'rgba(221,164,173,0.75)');
    circle(ctx, ex + sp + 6 * s, my - 4 * s, 6 * s, 'rgba(221,164,173,0.75)');
  }
}

/** Dupatta-style scarf: anchor at neck, tail follows recent neck positions (follow-through). */
function scarf(ctx, g, trail, flare) {
  const s = g.s, f = g.f;
  const pts = [{ x: g.neck.x + 4 * s * f, y: g.neck.y + 10 * s }];
  for (let k = 1; k < trail.length; k++) {
    // clamp history so very fast moves (falls, runs) give a streaming scarf, not a streak
    let dx0 = trail[k].x - trail[0].x, dy0 = trail[k].y - trail[0].y;
    const dl = Math.hypot(dx0, dy0), mx = k * 15 * s;
    if (dl > mx) { dx0 *= mx / dl; dy0 *= mx / dl; }
    const d = { x: trail[0].x + dx0, y: trail[0].y + dy0 };
    const off = { x: g.neck.x - trail[0].x, y: g.neck.y - trail[0].y }; // current offset
    const bx = d.x + off.x - f * k * 15 * s * (1 - flare) + Math.cos(k * 0.8 + (g.P.time || 0) * 7) * 3 * s * k;
    const by = d.y + off.y + 12 * s + k * 15 * s * (1 - flare * 0.8);
    // flare: swing outward horizontally (used during twirls)
    const fx = flare * Math.sin((g.P.spin || 0) * TAU + 1.2) * k * 26 * s;
    pts.push({ x: bx + fx, y: by - flare * k * 6 * s });
  }
  // ribbon
  ctx.fillStyle = C.rose;
  ctx.strokeStyle = C.roseDeep;
  ctx.lineWidth = 3 * s;
  const left = [], right = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    const w = (13 - i * 1.1) * s;
    left.push({ x: pts[i].x - (dy / l) * w, y: pts[i].y + (dx / l) * w });
    right.push({ x: pts[i].x + (dy / l) * w, y: pts[i].y - (dx / l) * w });
  }
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/** Walk/run cycle overlay. phase in radians; amp 0..1 (run up to 1.4). */
export function walk(phase, amp = 1) {
  const sn = Math.sin(phase), sn2 = Math.sin(phase + Math.PI);
  return {
    lL: [0.5 * amp * sn, -0.75 * amp * Math.max(0, Math.cos(phase))],
    lR: [0.5 * amp * sn2, -0.75 * amp * Math.max(0, Math.cos(phase + Math.PI))],
    aL: [-0.5 * amp * sn, 0.5 + 0.2 * amp],
    aR: [-0.5 * amp * sn2, 0.5 + 0.2 * amp],
    lift: 9 * amp * Math.abs(Math.sin(phase)),
    lean: 0.08 * amp,
  };
}

export const POSES = {
  stand: { aL: [0.12, 0.15], aR: [-0.12, 0.15], lL: [0.07, 0], lR: [-0.07, 0] },
  crouch: { aL: [-0.5, 0.9], aR: [-0.7, 0.9], lL: [0.85, -1.5], lR: [0.45, -1.3], lean: 0.25 },
  armsUp: { aL: [2.7, 0.15], aR: [-2.7, -0.15], lL: [0.12, 0], lR: [-0.12, 0] },
  jump: { aL: [2.5, 0.3], aR: [-2.5, -0.3], lL: [0.5, -0.9], lR: [-0.2, -0.6], lean: -0.05 },
  surprised: { aL: [1.9, 0.9], aR: [-1.9, -0.9], lL: [0.15, -0.1], lR: [-0.2, 0], lean: -0.15 },
  handsFace: { aL: { ik: null }, aR: { ik: null } },
};
