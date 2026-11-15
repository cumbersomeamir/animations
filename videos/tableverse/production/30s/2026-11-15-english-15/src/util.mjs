// Shared math, easing, deterministic randomness and keyframe helpers.
// Every animated value in this project is a pure function of the frame number,
// so any frame can be rendered on its own (stills, QA, re-renders) with identical output.

export const D2R = Math.PI / 180;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
/** normalised progress of x between a and b, clamped to 0..1 */
export const prog = (a, b, x) => clamp((x - a) / (b - a));

export const E = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outSine: (t) => Math.sin((t * Math.PI) / 2),
  outBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outBackBig: (t) => {
    const c1 = 3.0, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  inBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  outElastic: (t) =>
    t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * (2 * Math.PI)) / 3) + 1,
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  hold: () => 0,
};

/** mulberry32 seeded PRNG */
export function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Interpolate numbers, strings (step) or flat objects of those. */
export function mix(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return t < 0.5 ? a : b;
  const o = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const va = a[k] ?? b[k];
    const vb = b[k] ?? a[k];
    o[k] = mix(va, vb, t);
  }
  return o;
}

/**
 * Keyframe track. keys = [[frame, value, easeIntoThisKey?], ...] sorted by frame.
 * Returns the interpolated value at frame f.
 */
export function track(keys, f) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const [f0, v0] = keys[i - 1];
      const [f1, v1, e] = keys[i];
      const t = f1 === f0 ? 1 : (E[e || 'inOutCubic'])((f - f0) / (f1 - f0));
      return mix(v0, v1, t);
    }
  }
  return keys[keys.length - 1][1];
}

/** damped oscillation: amp * e^(-decay*t) * sin(freq*t), t in frames since start (0 before start) */
export function wobble(t, amp, freq, decay) {
  if (t < 0) return 0;
  return amp * Math.exp(-decay * t) * Math.sin(freq * t);
}

/** parabolic jump height 0..1..0 for u in 0..1 */
export const arc = (u) => 4 * u * (1 - u);

export function quadBezier(p0, p1, p2, t) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}

/** smooth deterministic 1D noise in -1..1 */
export function noise1(x, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  const h = (n) => {
    const s = Math.sin((n + seed * 101.3) * 127.1) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u);
}

export function angleLerp(a, b, t) {
  let d = ((b - a + 540) % 360) - 180;
  return a + d * t;
}
