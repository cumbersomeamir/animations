// Shared helpers: palette, easing, keyframes, deterministic noise and a tiny pinhole-camera projector.
export const W = 1080, H = 1920, FPS = 30, DURATION = 15;

// palette sampled from videos/meshline/assets/icon.png (+ derived tints)
export const C = {
  bg: '#111714', bgDeep: '#0A0F0D', ink: '#F7F7F2', blue: '#3157FF', blueSoft: '#8EA2FF', blueDeep: '#1B33A8',
  glass: '#3157FF', coral: '#FF6A5C', charcoal: '#111714', muted: '#8D9692', line: '#26302C',
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const inv = (a, b, v) => clamp((v - a) / (b - a));
export const TAU = Math.PI * 2;
export const ease = {
  linear: k => k, in: k => k * k * k, out: k => 1 - Math.pow(1 - k, 3),
  inOut: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  sine: k => -(Math.cos(Math.PI * k) - 1) / 2,
  outBack: k => { const c1 = 1.8, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  inBack: k => { const c1 = 1.7; return (c1 + 1) * k * k * k - c1 * k * k; },
  hold: k => (k < 1 ? 0 : 1),
};
export const env = (t, a, b, e = 'inOut') => ease[e](inv(a, b, t));
export const pulse = (t, a, b, c, d) => env(t, a, b) * (1 - env(t, c, d));
export const wobble = (t, t0, f = 6, d = 5, amp = 1) => (t < t0 ? 0 : amp * Math.sin((t - t0) * f * TAU) * Math.exp(-(t - t0) * d));
export function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

const mix = (a, b, k) => {
  if (Array.isArray(a)) return a.map((v, i) => lerp(v, b[i], k));
  if (a && typeof a === 'object') { const o = { ...a }; for (const key of Object.keys(b)) o[key] = key in a ? mix(a[key], b[key], k) : b[key]; return o; }
  return typeof a === 'number' ? lerp(a, b, k) : (k < 0.5 ? a : b);
};
// keys: [[time, value, easeName?], ...]; ease applies to the segment ending at that key
export function K(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e = 'inOut'] = keys[i];
    if (t <= t1) { const [t0, v0] = keys[i - 1]; return mix(v0, v1, t1 === t0 ? 1 : ease[e]((t - t0) / (t1 - t0))); }
  }
  return keys[keys.length - 1][1];
}

export function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

export function ik2(ax, ay, tx, ty, l1, l2, bend) {
  let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 0.01;
  if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
  d = Math.max(d, Math.abs(l1 - l2) + 0.01);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const ang = Math.atan2(dy, dx) + bend * a;
  return { jx: ax + Math.cos(ang) * l1, jy: ay + Math.sin(ang) * l1, ex: ax + dx, ey: ay + dy };
}

// ---------------------------------------------------------------- pinhole camera (y up, right-handed)
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export function camera(pos, target, fovDeg, roll = 0) {
  const f = norm(sub(target, pos));
  let r = norm(cross(f, [0, 1, 0]));
  let u = cross(r, f);
  if (roll) { const c = Math.cos(roll), s = Math.sin(roll); const r2 = r.map((v, i) => v * c + u[i] * s); u = u.map((v, i) => v * c - r[i] * s); r = r2; }
  return { pos, f, r, u, focal: (H / 2) / Math.tan((fovDeg * Math.PI) / 360) };
}
// returns {x, y, z (depth), s (px per world unit)} or null if behind the near plane
export function project(cam, p) {
  const d = sub(p, cam.pos), z = dot(d, cam.f);
  if (z < 0.15) return null;
  const s = cam.focal / z;
  return { x: W / 2 + dot(d, cam.r) * s, y: H / 2 - dot(d, cam.u) * s, z, s };
}
