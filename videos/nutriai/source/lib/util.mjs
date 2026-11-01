// Small math / easing / colour helpers shared by every module.
export const TAU = Math.PI * 2;
export const D2R = Math.PI / 180;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (f, a, b) => (b === a ? (f >= b ? 1 : 0) : clamp((f - a) / (b - a)));
export const smooth = (t) => t * t * (3 - 2 * t);

export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outSine: (t) => Math.sin((t * Math.PI) / 2),
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
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

// Damped spring step response (0 -> 1 with overshoot). t in seconds.
export function spring(t, freq = 2.2, damp = 5) {
  if (t <= 0) return 0;
  return 1 - Math.exp(-damp * t) * Math.cos(TAU * freq * t);
}
// Damped oscillation around 0 (impulse response). t in seconds.
export function wobble(t, freq = 3, damp = 4) {
  if (t <= 0) return 0;
  return Math.exp(-damp * t) * Math.sin(TAU * freq * t);
}

// Keyframe track: keys = [[frame, value, easeFn?], ...]; value may be a number or array.
export function track(f, keys) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    if (f <= f1) {
      const [f0, v0] = keys[i - 1];
      const t = (e || ease.inOutCubic)(seg(f, f0, f1));
      if (Array.isArray(v0)) return v0.map((x, j) => lerp(x, v1[j], t));
      return lerp(v0, v1, t);
    }
  }
  return keys[keys.length - 1][1];
}

// Quadratic arc between two points, peaking `h` px above the midpoint.
export function arc(p0, p1, h, t) {
  const cx = (p0[0] + p1[0]) / 2, cy = Math.min(p0[1], p1[1]) - h;
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * cx + t * t * p1[0], u * u * p0[1] + 2 * u * t * cy + t * t * p1[1]];
}

// Deterministic PRNG (mulberry32).
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

export function hex(c) {
  const h = c.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function mix(c1, c2, t) {
  const a = hex(c1), b = hex(c2);
  const r = a.map((x, i) => Math.round(lerp(x, b[i], clamp(t))));
  return '#' + r.map((x) => x.toString(16).padStart(2, '0')).join('');
}
export function rgba(c, a) {
  const [r, g, b] = hex(c);
  return `rgba(${r},${g},${b},${clamp(a)})`;
}
export function lum(c) {
  const [r, g, b] = hex(c).map((x) => x / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
// Multi-stop colour ramp: stops = [[t, '#hex'], ...]
export function ramp(stops, t) {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  }
  return stops[stops.length - 1][1];
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

// Palette (see context/05-progress.md, creative decisions).
export const C = {
  paper: '#F5EEDF',
  paper2: '#EFE4CF',
  ink: '#1C2620',
  ink2: '#4A544C',
  leaf: '#4FAE2E',
  leafDark: '#2F7A1C',
  lime: '#7ACC3E',
  mint: '#C6EA9C',
  honey: '#EBB66D',
  honeyDark: '#C98A36',
  water: '#3FA7E0',
  waterLight: '#A9DCF5',
  coral: '#E8735A',
  cream: '#FFF8EC',
  white: '#FFFFFF',
  night: '#22303C',
  nightInk: '#F5EEDF',
};
