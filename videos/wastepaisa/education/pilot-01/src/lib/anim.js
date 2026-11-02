// Deterministic animation helpers. Every value is a pure function of time t
// (seconds) so any frame can be rendered independently and reproducibly.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (k) => k * k * (3 - 2 * k);

export const ease = {
  linear: (k) => k,
  inQuad: (k) => k * k,
  outQuad: (k) => 1 - (1 - k) * (1 - k),
  inOut: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  inCubic: (k) => k * k * k,
  outCubic: (k) => 1 - Math.pow(1 - k, 3),
  inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outBack: (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
  inBack: (k, s = 1.70158) => (s + 1) * k * k * k - s * k * k,
  outElastic: (k) => {
    if (k === 0 || k === 1) return k;
    const c4 = (2 * Math.PI) / 3.2;
    return Math.pow(2, -9 * k) * Math.sin((k * 9 - 0.75) * c4) + 1;
  },
  outBounce: (k) => {
    const n1 = 7.5625, d1 = 2.75;
    if (k < 1 / d1) return n1 * k * k;
    if (k < 2 / d1) return n1 * (k -= 1.5 / d1) * k + 0.75;
    if (k < 2.5 / d1) return n1 * (k -= 2.25 / d1) * k + 0.9375;
    return n1 * (k -= 2.625 / d1) * k + 0.984375;
  },
};

// 0..1 progress of t through [a, b] with easing.
export const prog = (t, a, b, e = ease.inOut) => e(clamp((t - a) / (b - a)));

// Keyframe track: keys = [[time, value, easeIntoThisKey?], ...]. Values may be
// numbers or arrays of numbers. Holds first/last value outside the range.
export function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const k = (e || ease.inOut)(clamp((t - t0) / (t1 - t0 || 1)));
      if (Array.isArray(v0)) return v0.map((x, j) => lerp(x, v1[j], k));
      return lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}

// Damped oscillation triggered at times (secondary motion / follow-through).
export function wobble(t, triggers, freq = 6, damp = 5) {
  let v = 0;
  for (const [t0, amp] of triggers) {
    const d = t - t0;
    if (d > 0) v += amp * Math.exp(-damp * d) * Math.sin(2 * Math.PI * freq * d);
  }
  return v;
}

// Pulse 0..1..0 centred on c with half-width w.
export const pulse = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);

// Deterministic pseudo-random (mulberry32).
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Blink schedule: returns eyelid closure 0..1 at time t for blink start times.
export function blink(t, times, dur = 0.16) {
  let c = 0;
  for (const b of times) {
    const d = (t - b) / dur;
    if (d > 0 && d < 1) c = Math.max(c, Math.sin(Math.PI * d));
  }
  return c;
}
