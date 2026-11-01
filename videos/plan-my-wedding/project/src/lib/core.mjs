// Math, easing and timing helpers. Every visual is a pure function of time t (seconds),
// so any frame can be rendered independently (parallel chunks, single-frame inspection).
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, u) => a + (b - a) * u;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const TAU = Math.PI * 2;

export const ease = {
  lin: (u) => u,
  inQuad: (u) => u * u,
  outQuad: (u) => 1 - (1 - u) * (1 - u),
  inOutQuad: (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2),
  inCubic: (u) => u * u * u,
  outCubic: (u) => 1 - Math.pow(1 - u, 3),
  inOutCubic: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  outQuart: (u) => 1 - Math.pow(1 - u, 4),
  inOutSine: (u) => -(Math.cos(Math.PI * u) - 1) / 2,
  outBack: (u, s = 1.70158) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2),
  inBack: (u, s = 1.70158) => (s + 1) * u * u * u - s * u * u,
  outElastic: (u) => (u === 0 || u === 1 ? u : Math.pow(2, -10 * u) * Math.sin((u * 10 - 0.75) * (TAU / 3)) + 1),
  outBounce: (u) => {
    const n = 7.5625, d = 2.75;
    if (u < 1 / d) return n * u * u;
    if (u < 2 / d) return n * (u -= 1.5 / d) * u + 0.75;
    if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + 0.9375;
    return n * (u -= 2.625 / d) * u + 0.984375;
  },
};

/** eased progress between a and b */
export const seg = (t, a, b, e = ease.inOutCubic) => e(prog(t, a, b));

/** damped oscillation after t0: 0 before, starts at amp, decays */
export const wobble = (t, t0, freq = 4, decay = 6, amp = 1) =>
  t < t0 ? 0 : amp * Math.exp(-decay * (t - t0)) * Math.cos(TAU * freq * (t - t0));
/** damped sine (starts at 0) */
export const shake = (t, t0, freq = 9, decay = 8, amp = 1) =>
  t < t0 ? 0 : amp * Math.exp(-decay * (t - t0)) * Math.sin(TAU * freq * (t - t0));

/** deterministic PRNG */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Keyframe interpolation of numbers or flat/nested objects of numbers.
 *  keys: [[time, value, easeFn?], ...]; ease on a key applies to the segment arriving at it. */
export function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1, e = ease.inOutCubic] = keys[i];
      return mix(v0, v1, e((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
}

export function mix(a, b, u) {
  if (typeof a === 'number') return a + (b - a) * u;
  if (Array.isArray(a)) return a.map((v, i) => mix(v, b[i], u));
  if (a && typeof a === 'object') {
    const o = {};
    for (const k of Object.keys(a)) o[k] = k in b && typeof a[k] !== 'string' ? mix(a[k], b[k], u) : u < 0.5 ? a[k] : b[k];
    for (const k of Object.keys(b)) if (!(k in a)) o[k] = b[k];
    return o;
  }
  return u < 0.5 ? a : b;
}

/** quadratic bezier point */
export const qb = (p0, p1, p2, u) => ({
  x: (1 - u) * (1 - u) * p0.x + 2 * (1 - u) * u * p1.x + u * u * p2.x,
  y: (1 - u) * (1 - u) * p0.y + 2 * (1 - u) * u * p1.y + u * u * p2.y,
});
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
