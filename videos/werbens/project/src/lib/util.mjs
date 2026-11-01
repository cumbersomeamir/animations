// Math, easing, keyframe and randomness helpers (deterministic).
export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, v) => (b === a ? (v >= b ? 1 : 0) : clamp((v - a) / (b - a)));
export const rad = (d) => (d * Math.PI) / 180;

export const E = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outSine: (t) => Math.sin((t * Math.PI) / 2),
  inBack: (t) => 2.70158 * t * t * t - 1.70158 * t * t,
  outBack: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  outBackSoft: (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2),
  outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
};

/** Tween a value between frames f0..f1 with easing. */
export const tw = (f, f0, f1, a, b, ease = E.inOutCubic) => lerp(a, b, ease(inv(f0, f1, f)));

/** Scalar keyframe track: keys = [[frame, value, easeIntoThisKey?], ...] sorted by frame. */
export function track(keys, f) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (f <= f1) return lerp(v0, v1, (e || E.inOutCubic)(inv(f0, f1, f)));
  }
  return keys[keys.length - 1][1];
}

/** Damped spring 0 -> 1 starting at frame f0. */
export function spring(f, f0, freq = 2.0, damp = 6) {
  if (f < f0) return 0;
  const t = (f - f0) / FPS;
  return 1 - Math.exp(-damp * t) * Math.cos(2 * Math.PI * freq * t);
}

/** Decaying oscillation (impulse) started at f0: returns signed wobble. */
export function wobble(f, f0, freq = 3, damp = 7, amp = 1) {
  if (f < f0) return 0;
  const t = (f - f0) / FPS;
  return amp * Math.exp(-damp * t) * Math.sin(2 * Math.PI * freq * t);
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 1D value noise in [-1, 1]. */
export function noise1(x, seed = 1) {
  const h = (n) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const i = Math.floor(x), fr = x - i;
  const u = fr * fr * (3 - 2 * fr);
  return lerp(h(i), h(i + 1), u);
}

/** Hand-drawn "boil": a value that changes every `step` frames (editorial line jitter). */
export const boil = (f, step = 3) => Math.floor(f / step);

// ---------- path helpers ----------
export function bezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}
export function quad(p0, p1, p2, t) {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
}
export function samplePath(fn, n = 80) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(fn(i / n));
  return pts;
}
/** Catmull-Rom through points -> dense polyline. */
export function catmull(points, seg = 8) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    for (let j = 0; j < seg; j++) {
      const t = j / seg, t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
export function polyLength(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return cum;
}
/** Point + tangent angle at fraction s (0..1) of a polyline. */
export function pointAt(pts, s, cum = polyLength(pts)) {
  const L = cum[cum.length - 1] * clamp(s);
  let i = 1;
  while (i < cum.length - 1 && cum[i] < L) i++;
  const a = pts[i - 1], b = pts[i];
  const segL = cum[i] - cum[i - 1] || 1;
  const t = (L - cum[i - 1]) / segL;
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), ang: Math.atan2(b.y - a.y, b.x - a.x) };
}
/** Sub-polyline between fractions s0..s1. */
export function subPath(pts, s0, s1, cum = polyLength(pts)) {
  const L = cum[cum.length - 1];
  const a = clamp(s0) * L, b = clamp(s1) * L;
  const out = [pointAt(pts, s0, cum)];
  for (let i = 0; i < pts.length; i++) if (cum[i] > a && cum[i] < b) out.push(pts[i]);
  out.push(pointAt(pts, s1, cum));
  return out;
}
