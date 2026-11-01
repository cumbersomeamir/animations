// Original stickman rig: forward kinematics with foot planting, squash/stretch,
// facial cues and an optional verlet-simulated scarf (follow-through).
import { D2R } from './math.mjs';

export const RIG = { headR: 40, neck: 12, torso: 150, upper: 82, fore: 78, thigh: 92, shin: 92, lw: 13 };

// dir(a): a=0 points down, +90 right, -90 left, 180 up (screen space, y down)
const dir = (a) => [Math.sin(a * D2R), Math.cos(a * D2R)];
const add = (p, v, l) => [p[0] + v[0] * l, p[1] + v[1] * l];

export const BASE = {
  x: 540, lift: 0, rot: 0, lean: 0, head: 0,
  aL: -14, eL: -8, aR: 14, eR: 8,
  hL: -7, kL: 2, hR: 7, kR: -2,
  sx: 1, sy: 1, s: 1,
  lx: 0, ly: 0, mouth: 0.4, open: 0, brow: 0, blink: 0, eye: 1, eyeMode: 'dot',
};

// Solve joint positions. groundAt(x) gives ground y at x.
export function solve(pin, groundAt) {
  const p = { ...BASE, ...pin };
  const s = p.s;
  const L = {}; for (const k in RIG) L[k] = RIG[k] * s;
  const rot = p.rot;
  const hip0 = [0, 0];
  const upA = 180 - p.lean - rot; // torso direction (hip -> shoulder)
  const sh = add(hip0, dir(upA), L.torso);
  const headA = upA - p.head;
  const headC = add(sh, dir(headA), L.neck + L.headR);
  const downA = upA - 180;
  const elL = add(sh, dir(downA + p.aL), L.upper);
  const haL = add(elL, dir(downA + p.aL + p.eL), L.fore);
  const elR = add(sh, dir(downA + p.aR), L.upper);
  const haR = add(elR, dir(downA + p.aR + p.eR), L.fore);
  const knL = add(hip0, dir(p.hL - rot), L.thigh);
  const ftL = add(knL, dir(p.hL - rot + p.kL), L.shin);
  const knR = add(hip0, dir(p.hR - rot), L.thigh);
  const ftR = add(knR, dir(p.hR - rot + p.kR), L.shin);
  // plant lowest support point on the ground
  const supports = [ftL, ftR, knL, knR, hip0, sh, [headC[0], headC[1] + L.headR]];
  let low = -Infinity; for (const q of supports) low = Math.max(low, q[1]);
  const gy = p.y !== undefined ? null : groundAt(p.x);
  const hipY = p.y !== undefined ? p.y : gy - low - p.lift;
  const base = [p.x, p.y !== undefined ? p.y + low : gy - p.lift];
  const T = (q) => {
    const wx = p.x + q[0], wy = hipY + q[1];
    return [base[0] + (wx - base[0]) * p.sx, base[1] + (wy - base[1]) * p.sy];
  };
  const J = {
    hip: T(hip0), sh: T(sh), head: T(headC), elL: T(elL), haL: T(haL), elR: T(elR), haR: T(haR),
    knL: T(knL), ftL: T(ftL), knR: T(knR), ftR: T(ftR), base,
  };
  J.neckPt = T(add(sh, dir(downA), 8 * s));
  J.headA = headA; J.upA = upA; J.p = p; J.L = L;
  J.top = [J.head[0] + Math.sin((180 - headA) * D2R) * 0, J.head[1]];
  // point above head (for bulbs etc.)
  const hd = dir(headA);
  J.above = (d) => [J.head[0] + hd[0] * (L.headR + d) * p.sx, J.head[1] + hd[1] * (L.headR + d) * p.sy];
  return J;
}

function line(ctx, pts) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

export function drawScarf(ctx, chain, color, s = 1) {
  if (!chain || chain.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  // tapered tail: draw segments with decreasing width
  for (let i = 0; i < chain.length - 1; i++) {
    ctx.lineWidth = (19 - i * 1.6) * s;
    line(ctx, [chain[i], chain[i + 1]]);
  }
  ctx.restore();
}

export function drawStick(ctx, J, opt = {}) {
  const p = J.p, s = p.s;
  const col = opt.color || '#F4F7FB';
  const ink = opt.ink || '#1B2333';
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = col; ctx.lineWidth = RIG.lw * s;
  if (opt.scarf) drawScarf(ctx, opt.scarf, opt.scarfColor || '#6CDA7E', s);
  line(ctx, [J.ftL, J.knL, J.hip]);
  line(ctx, [J.ftR, J.knR, J.hip]);
  line(ctx, [J.hip, J.sh]);
  if (!opt.hideArmL) line(ctx, [J.sh, J.elL, J.haL]);
  if (!opt.hideArmR) line(ctx, [J.sh, J.elR, J.haR]);
  // hands
  ctx.fillStyle = col;
  for (const h of [opt.hideArmL ? null : J.haL, opt.hideArmR ? null : J.haR]) {
    if (!h) continue; ctx.beginPath(); ctx.arc(h[0], h[1], 8.5 * s, 0, Math.PI * 2); ctx.fill();
  }
  // scarf knot over the neck
  if (opt.scarf) {
    ctx.fillStyle = opt.scarfColor || '#6CDA7E';
    ctx.save(); ctx.translate(J.neckPt[0], J.neckPt[1]); ctx.rotate((180 - J.upA) * D2R);
    roundRect(ctx, -20 * s, -9 * s, 40 * s, 18 * s, 9 * s); ctx.fill();
    ctx.restore();
  }
  // head
  const r = RIG.headR * s;
  ctx.save();
  ctx.translate(J.head[0], J.head[1]);
  ctx.rotate((180 - J.headA) * D2R);
  ctx.scale(p.sx, p.sy);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  if (opt.hat) drawHat(ctx, opt.hat, r);
  drawFace(ctx, p, r, ink);
  ctx.restore();
  ctx.restore();
}

function drawHat(ctx, hat, r) {
  ctx.fillStyle = hat.color;
  if (hat.type === 'beanie') {
    ctx.beginPath(); ctx.arc(0, -r * 0.18, r * 1.02, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -r * 1.22, r * 0.22, 0, Math.PI * 2); ctx.fill();
  } else if (hat.type === 'cap') {
    ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 1.0, Math.PI * 1.0, Math.PI * 2.0); ctx.closePath(); ctx.fill();
    roundRect(ctx, 0, -r * 0.34, r * 1.35, r * 0.24, r * 0.12); ctx.fill();
  } else if (hat.type === 'bow') {
    ctx.save(); ctx.translate(r * 0.55, -r * 0.85);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * 0.45, -r * 0.3); ctx.lineTo(-r * 0.45, r * 0.3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 0.45, -r * 0.3); ctx.lineTo(r * 0.45, r * 0.3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (hat.type === 'phones') {
    ctx.lineWidth = r * 0.2; ctx.strokeStyle = hat.color;
    ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 1.12, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    roundRect(ctx, -r * 1.22, -r * 0.3, r * 0.34, r * 0.62, r * 0.12); ctx.fill();
    roundRect(ctx, r * 0.88, -r * 0.3, r * 0.34, r * 0.62, r * 0.12); ctx.fill();
  }
}

function drawFace(ctx, p, r, ink) {
  const fx = p.lx * r * 0.36, fy = p.ly * r * 0.3;
  const ex = r * 0.3, ey = -r * 0.1;
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round';
  const eyeOpen = Math.max(0.08, 1 - p.blink);
  for (const sgn of [-1, 1]) {
    const cx = fx + sgn * ex, cy = fy + ey;
    const m = p.eyeMode;
    if (m === 'x') {
      ctx.lineWidth = r * 0.11; const k = r * 0.13;
      ctx.beginPath(); ctx.moveTo(cx - k, cy - k); ctx.lineTo(cx + k, cy + k); ctx.moveTo(cx + k, cy - k); ctx.lineTo(cx - k, cy + k); ctx.stroke();
    } else if (m === 'squint') {
      ctx.lineWidth = r * 0.11; const k = r * 0.14;
      ctx.beginPath(); ctx.moveTo(cx - sgn * k, cy - k * 0.8); ctx.lineTo(cx + sgn * k * 0.6, cy); ctx.lineTo(cx - sgn * k, cy + k * 0.8); ctx.stroke();
    } else if (m === 'happy') {
      ctx.lineWidth = r * 0.11;
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.06, r * 0.13, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else if (m === 'dizzy') {
      ctx.lineWidth = r * 0.07;
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const a = i * 0.55 + (p.spin || 0) * sgn, rr = r * 0.015 + i * r * 0.0068;
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    } else {
      const w = r * 0.1 * p.eye, h = r * 0.15 * p.eye * eyeOpen;
      ctx.beginPath(); ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2); ctx.fill();
      if (p.eye > 1.15 && eyeOpen > 0.5) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(cx + w * 0.35, cy - h * 0.4, w * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ink;
      }
    }
    // brows
    if (p.brow !== 0 || m === 'dot') {
      ctx.lineWidth = r * 0.08;
      const by = cy - r * 0.27 * Math.max(1, p.eye * 0.9);
      const inner = -p.brow * r * 0.09, outer = p.brow * r * 0.05;
      ctx.beginPath();
      ctx.moveTo(cx + sgn * r * 0.15, by + outer);
      ctx.lineTo(cx - sgn * r * 0.06, by + inner);
      ctx.stroke();
    }
  }
  // mouth
  const mx = fx, my = fy + r * 0.38, mw = r * 0.27;
  ctx.lineWidth = r * 0.09;
  if (p.open > 0.05) {
    const h = r * 0.34 * p.open;
    ctx.beginPath();
    ctx.ellipse(mx, my + h * 0.1, mw * (0.55 + 0.25 * Math.abs(p.mouth)), h * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(mx - mw, my - p.mouth * r * 0.06);
    ctx.quadraticCurveTo(mx, my + p.mouth * r * 0.22, mx + mw, my - p.mouth * r * 0.06);
    ctx.stroke();
  }
}

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Verlet scarf, simulated across frames given anchor positions per frame.
export function simulateScarf(anchors, opts = {}) {
  const n = opts.n || 7, seg = opts.seg || 19, out = [];
  let pts = null, prev = null;
  for (let f = 0; f < anchors.length; f++) {
    const a = anchors[f];
    if (!pts) {
      pts = Array.from({ length: n }, (_, i) => [a[0] - i * seg * 0.7, a[1] + i * seg * 0.7]);
      prev = pts.map((q) => [...q]);
    }
    const sub = 3;
    for (let k = 0; k < sub; k++) {
      const wind = (opts.wind ? opts.wind(f) : -0.25) / sub;
      for (let i = 1; i < n; i++) {
        const q = pts[i], pq = prev[i];
        const vx = (q[0] - pq[0]) * 0.93, vy = (q[1] - pq[1]) * 0.93;
        prev[i] = [q[0], q[1]];
        q[0] += vx + wind; q[1] += vy + 0.55 / sub;
      }
      const ai = [anchors[Math.max(0, f - 1)], a];
      const t = (k + 1) / sub;
      pts[0] = [ai[0][0] + (ai[1][0] - ai[0][0]) * t, ai[0][1] + (ai[1][1] - ai[0][1]) * t];
      prev[0] = [...pts[0]];
      for (let it = 0; it < 6; it++) {
        for (let i = 0; i < n - 1; i++) {
          const p0 = pts[i], p1 = pts[i + 1];
          const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
          const d = Math.hypot(dx, dy) || 1e-6, diff = (d - seg) / d;
          if (i === 0) { p1[0] -= dx * diff; p1[1] -= dy * diff; }
          else { p0[0] += dx * diff * 0.5; p0[1] += dy * diff * 0.5; p1[0] -= dx * diff * 0.5; p1[1] -= dy * diff * 0.5; }
        }
      }
    }
    out.push(pts.map((q) => [q[0], q[1]]));
  }
  return out;
}
