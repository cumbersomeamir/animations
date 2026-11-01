// Shared math, easing and keyframe helpers. Deterministic: everything is a pure function of time.
export const W = 1080, H = 1920, FPS = 30, DURATION = 30;

export const C = {
  bg: '#111714',        // icon background (sampled from assets/icon.png)
  bgDeep: '#0B100E',
  ink: '#F7F7F2',       // icon node white
  inkDim: '#B3B9B4',    // far limbs
  mesh: '#3157FF',      // icon wave blue
  meshLight: '#8EA2FF',
  coral: '#FF6A5C',     // offline / error state, used sparingly
  bld1: '#151C19',
  bld2: '#19211E',
  bld3: '#1E2724',
  line: '#2B3531',
  ground: '#0D1210',
  muted: '#8D9692',
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, v) => clamp((v - a) / (b - a));
export const TAU = Math.PI * 2;

export const ease = {
  linear: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  inBack: t => { const c1 = 1.7, c3 = c1 + 1; return c3 * t * t * t - c1 * t * t; },
  outElastic: t => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  hold: t => (t < 1 ? 0 : 1),
  outQuad: t => 1 - (1 - t) * (1 - t),
  inQuad: t => t * t,
  expoIn: t => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  expoOut: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

const mix = (a, b, k) => {
  if (Array.isArray(a)) return a.map((v, i) => lerp(v, b[i], k));
  if (typeof a === 'object' && a !== null) {
    const o = {};
    for (const key of Object.keys(a)) o[key] = key in b ? mix(a[key], b[key], k) : a[key];
    for (const key of Object.keys(b)) if (!(key in o)) o[key] = b[key];
    return o;
  }
  return lerp(a, b, k);
};

// Keyframe track: keys = [[time, value, easeName?], ...]; ease applies to the segment ending at that key.
export function K(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e = 'inOut'] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const k = t1 === t0 ? 1 : ease[e]((t - t0) / (t1 - t0));
      return mix(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}

// 0 -> 1 envelope between a and b with easing
export const env = (t, a, b, e = 'inOut') => ease[e](inv(a, b, t));
// pulse up then down: rise over [a,b], hold, fall over [c,d]
export const pulse = (t, a, b, c, d, e = 'inOut') => env(t, a, b, e) * (1 - env(t, c, d, e));

// damped oscillation starting at t0
export const wobble = (t, t0, freq = 6, decay = 5, amp = 1) =>
  t < t0 ? 0 : amp * Math.sin((t - t0) * freq * TAU) * Math.exp(-(t - t0) * decay);

// deterministic hash noise
export function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
export function noise1(x) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }

export function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
export function mixHex(h1, h2, k) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, k));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, k));
  const bl = Math.round(lerp(a & 255, b & 255, k));
  return `rgb(${r},${g},${bl})`;
}

// Projectile drop with bounces. Returns {y, impacts:[times], vy}
export function bounceY(t, t0, y0, yRest, g = 3800, rest = 0.32, n = 3) {
  const h = yRest - y0;
  const tf = Math.sqrt((2 * h) / g);
  const impacts = [t0 + tf];
  let v = g * tf * rest, tt = t0 + tf;
  const segs = [];
  for (let i = 0; i < n; i++) { const d = (2 * v) / g; segs.push([tt, v, d]); tt += d; impacts.push(tt); v *= rest; }
  if (t < t0) return { y: y0, impacts, landed: false };
  if (t < t0 + tf) { const d = t - t0; return { y: y0 + 0.5 * g * d * d, impacts, landed: false }; }
  for (const [s, v0, d] of segs) if (t < s + d) { const e = t - s; return { y: yRest - (v0 * e - 0.5 * g * e * e), impacts, landed: true }; }
  return { y: yRest, impacts, landed: true };
}

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// two-bone IK. a = root, target, lengths l1,l2, bend sign (+1 / -1). returns joint position.
export function ik2(ax, ay, tx, ty, l1, l2, bend) {
  let dx = tx - ax, dy = ty - ay;
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 0.01;
  if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
  d = Math.max(d, Math.abs(l1 - l2) + 0.01);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const base = Math.atan2(dy, dx);
  const ang = base + bend * a;
  return { jx: ax + Math.cos(ang) * l1, jy: ay + Math.sin(ang) * l1, ex: ax + dx, ey: ay + dy };
}
