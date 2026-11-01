'use strict';
// Core math / easing / keyframe helpers (original, app-local).

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
const prog = (t, a, b) => clamp(inv(a, b, t)); // 0..1 progress of t inside [a,b]
const TAU = Math.PI * 2;
const deg = (d) => (d * Math.PI) / 180;

const E = {
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
  inBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return c3 * t * t * t - c1 * t * t; },
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outBackBig: (t) => { const c1 = 2.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
  outBounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

// Interpolate numbers, arrays or plain objects recursively.
function mix(a, b, t) {
  if (typeof a === 'number') return lerp(a, b, t);
  if (Array.isArray(a)) return a.map((v, i) => mix(v, b[i], t));
  if (a && typeof a === 'object') {
    const o = {};
    for (const k of Object.keys(a)) o[k] = k in b ? mix(a[k], b[k], t) : a[k];
    for (const k of Object.keys(b)) if (!(k in o)) o[k] = b[k];
    return o;
  }
  return t < 0.5 ? a : b;
}

// keys: [[time, value, easeIntoThisKey?], ...] sorted by time.
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, ease] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const e = (ease || E.inOutCubic)(clamp(inv(t0, t1, t)));
      return mix(v0, v1, e);
    }
  }
  return keys[keys.length - 1][1];
}

// Deterministic pseudo-random generator (mulberry32).
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth 1D value noise for hand-made jitter.
function noise1(x, seed = 1) {
  const i = Math.floor(x), f = x - i;
  const h = (n) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}

// Damped spring response to a step at time t0 (0 before t0, settles to 1).
function spring(t, t0, freq = 3.2, damp = 4.5) {
  if (t < t0) return 0;
  const x = t - t0;
  return 1 - Math.exp(-damp * x) * Math.cos(TAU * freq * x);
}
// Decaying oscillation (wobble) triggered at t0 — returns signed value, starts at 0.
function wobble(t, t0, freq = 3, damp = 3.5, amp = 1) {
  if (t < t0) return 0;
  const x = t - t0;
  return amp * Math.exp(-damp * x) * Math.sin(TAU * freq * x);
}

module.exports = { clamp, lerp, inv, prog, TAU, deg, E, mix, kf, rng, noise1, spring, wobble };
