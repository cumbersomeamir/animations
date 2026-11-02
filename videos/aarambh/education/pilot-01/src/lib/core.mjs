// Core math / easing / keyframe helpers. Original code for Aarambh education pilots.
export const TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => clamp((v - a) / (b - a));
export const smooth = (t) => t * t * (3 - 2 * t);
export const mix2 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];

export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuint: (t) => 1 - Math.pow(1 - t, 5),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1;
  },
};

// progress of t through [a,b] with easing
export const prog = (t, a, b, e = 'linear') => ease[e](invLerp(a, b, t));
export const span = (t, range, e = 'linear') => prog(t, range[0], range[1], e);

// Keyframes: [[time, value, easeIntoThisKey?], ...]; value number or array
export function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e = 'inOutCubic'] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const u = ease[e]((t - t0) / Math.max(1e-6, t1 - t0));
      if (Array.isArray(v0)) return v0.map((x, j) => lerp(x, v1[j], u));
      return lerp(v0, v1, u);
    }
  }
  return keys[keys.length - 1][1];
}

// Damped spring "settle" for follow-through: returns offset that decays
export const wobble = (t, t0, amp = 1, freq = 3.2, decay = 5) => {
  if (t < t0) return 0;
  const x = t - t0;
  return amp * Math.exp(-decay * x) * Math.sin(TAU * freq * x);
};

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Two-bone IK: returns elbow point given shoulder s, target p, lengths a,b; bend sign
export function ik2(s, p, a, b, bend = 1) {
  const dx = p[0] - s[0], dy = p[1] - s[1];
  let d = Math.hypot(dx, dy);
  const maxd = a + b - 0.01;
  let tx = p[0], ty = p[1];
  if (d > maxd) { tx = s[0] + (dx / d) * maxd; ty = s[1] + (dy / d) * maxd; d = maxd; }
  d = Math.max(d, Math.abs(a - b) + 0.01);
  const ang = Math.atan2(ty - s[1], tx - s[0]);
  const cosA = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1);
  const A = Math.acos(cosA) * bend;
  return { elbow: [s[0] + Math.cos(ang - A) * a, s[1] + Math.sin(ang - A) * a], hand: [tx, ty] };
}

export const hexToRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgba = (h, a) => { const [r, g, b] = hexToRgb(h); return `rgba(${r},${g},${b},${a})`; };
export const mixHex = (h1, h2, t) => {
  const a = hexToRgb(h1), b = hexToRgb(h2);
  const c = a.map((x, i) => Math.round(lerp(x, b[i], t)));
  return '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('');
};
