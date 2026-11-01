// Small math + easing toolkit (original code for this project).
export const D2R = Math.PI / 180;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, x) => (b === a ? (x >= b ? 1 : 0) : clamp((x - a) / (b - a)));
export const smooth = (a, b, x) => { const t = inv(a, b, x); return t * t * (3 - 2 * t); };
export const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
export const mix2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

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
  outBack: (t) => { const s = 1.70158; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
  outBackBig: (t) => { const s = 2.6; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
  inBack: (t) => { const s = 1.70158; return (s + 1) * t * t * t - s * t * t; },
  outElastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
  outBounce: (t) => {
    const n = 7.5625, d = 1 / 2.75;
    if (t < d) return n * t * t;
    if (t < 2 * d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 * d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
};

// Scalar keyframes: keys = [[frame, value, ease?], ...] (ease applies to the segment ending at that key)
export function track(keys, f) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    if (f <= f1) {
      const [f0, v0] = keys[i - 1];
      const t = (E[e || 'inOutCubic'])(inv(f0, f1, f));
      return lerp(v0, v1, t);
    }
  }
  return keys[keys.length - 1][1];
}

// Object keyframes: keys = [{f, p:{...}, e}] ; numeric fields are interpolated.
export function poseTrack(keys, f) {
  if (f <= keys[0].f) return { ...keys[0].p };
  for (let i = 1; i < keys.length; i++) {
    const k1 = keys[i];
    if (f <= k1.f) {
      const k0 = keys[i - 1];
      const t = (E[k1.e || 'inOutCubic'])(inv(k0.f, k1.f, f));
      const out = { ...k0.p };
      for (const key of Object.keys(k1.p)) {
        const a = k0.p[key], b = k1.p[key];
        out[key] = typeof a === 'number' && typeof b === 'number' ? lerp(a, b, t) : t < 0.5 ? (a ?? b) : b;
      }
      return out;
    }
  }
  return { ...keys[keys.length - 1].p };
}

// Deterministic PRNG
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth 1D value noise for shakes / wobble
export function noise1(x, seed = 0) {
  const h = (n) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
  const i = Math.floor(x), fr = x - i, u = fr * fr * (3 - 2 * fr);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}

// Quadratic bezier point
export const qbez = (p0, c, p1, t) => [
  (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
  (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1],
];

// Damped spring impulse response: 0 at t<0, kicks to amp then decays
export function kick(f, f0, amp, decay = 6, freq = 0.9) {
  const t = f - f0;
  if (t < 0) return 0;
  return amp * Math.exp(-t / decay) * Math.cos(t * freq);
}
