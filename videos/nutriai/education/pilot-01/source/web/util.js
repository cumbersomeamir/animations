// util.js: small deterministic helpers shared by the pilot modules.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (f, a, b) => (b === a ? (f >= b ? 1 : 0) : clamp((f - a) / (b - a)));
export const ease = {
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  outBounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};
// damped oscillation (impulse response), t in seconds
export const wobble = (t, freq = 3, damp = 4) => (t <= 0 ? 0 : Math.exp(-damp * t) * Math.sin(2 * Math.PI * freq * t));
// keyframe track: [[frame, value(s), easeFn?], ...]
export function track(f, keys) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    if (f <= f1) {
      const [f0, v0] = keys[i - 1];
      const t = (e || ease.inOutCubic)(seg(f, f0, f1));
      return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], t)) : lerp(v0, v1, t);
    }
  }
  return keys[keys.length - 1][1];
}
// parabolic hop between two points with apex height h; t 0..1
export function hop(p0, p1, h, t) {
  return [lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t) + 4 * h * t * (1 - t), lerp(p0[2], p1[2], t)];
}
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Palette: icon-sampled brand colours + food colours (food keeps its natural colour).
export const COL = {
  ink: '#151E16', leaf: '#5AB626', green: '#86DA3F', lime: '#A6E955', void: '#050806', mist: '#EDF6E5',
  leafDark: '#2F7A1C', mango: '#FFA51F', mangoDeep: '#F07D10', amber: '#F2A93B', vitc: '#FFB830',
};
