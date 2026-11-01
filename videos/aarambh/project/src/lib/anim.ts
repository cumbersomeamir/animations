// Small, dependency-free animation toolkit used by every scene.

export type Ease = (t: number) => number;

const c1 = 1.70158;
const c3 = c1 + 1;

export const E = {
  lin: (t: number) => t,
  in: (t: number) => t * t * t,
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  in2: (t: number) => t * t,
  out2: (t: number) => 1 - (1 - t) * (1 - t),
  inOut2: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outBack: (t: number) => 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2),
  inBack: (t: number) => c3 * t * t * t - c1 * t * t,
  outElastic: (t: number) =>
    t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
  outBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  step: (t: number) => (t < 1 ? 0 : 1),
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Normalised progress of f through [a, b], eased. */
export const prog = (f: number, a: number, b: number, ease: Ease = E.inOut) =>
  ease(clamp((f - a) / (b - a)));

export type Key = [frame: number, value: number, ease?: Ease];

/** Piecewise keyframe interpolation; the ease on key i+1 shapes segment i→i+1. */
export function kf(f: number, keys: Key[]): number {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1, e] = keys[i + 1];
    if (f <= f1) {
      const t = f1 === f0 ? 1 : (f - f0) / (f1 - f0);
      return v0 + (v1 - v0) * (e ?? E.inOut)(t);
    }
  }
  return keys[keys.length - 1][1];
}

export type ObjKey<T> = [frame: number, value: Partial<T>, ease?: Ease];

/** Keyframe a record of numbers; missing fields carry the previous key's value. */
export function kfo<T extends Record<string, number>>(f: number, base: T, keys: ObjKey<T>[]): T {
  // Resolve full records for each key (carry-forward).
  const full: [number, T, Ease | undefined][] = [];
  let prev = base;
  for (const [fr, v, e] of keys) {
    prev = { ...prev, ...v } as T;
    full.push([fr, prev, e]);
  }
  if (f <= full[0][0]) return full[0][1];
  for (let i = 0; i < full.length - 1; i++) {
    const [f0, v0] = full[i];
    const [f1, v1, e] = full[i + 1];
    if (f <= f1) {
      const t = (e ?? E.inOut)(f1 === f0 ? 1 : (f - f0) / (f1 - f0));
      const out = {} as Record<string, number>;
      for (const k of Object.keys(v0)) out[k] = (v0 as Record<string, number>)[k] + ((v1 as Record<string, number>)[k] - (v0 as Record<string, number>)[k]) * t;
      return out as T;
    }
  }
  return full[full.length - 1][1];
}

/** Damped spring response from 0 → 1 starting at frame `start` (closed form, deterministic). */
export function spring(f: number, start: number, freq = 2.2, damping = 0.45): number {
  const t = (f - start) / 30;
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const z = damping;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
}

/** Decaying oscillation, useful for shakes and wobbles after an impact. */
export function decay(f: number, start: number, amp: number, freq = 6, life = 12): number {
  const d = f - start;
  if (d < 0 || d > life * 3) return 0;
  return amp * Math.exp(-d / life) * Math.sin((d / 30) * 2 * Math.PI * freq);
}

/** Smooth deterministic pseudo-noise in [-1, 1]. */
export function wob(f: number, seed = 0, speed = 1): number {
  const x = f * speed * 0.05 + seed * 13.37;
  return (Math.sin(x * 1.7) * 0.5 + Math.sin(x * 2.9 + 1.3) * 0.3 + Math.sin(x * 4.3 + 2.1) * 0.2);
}

/** Point on a quadratic bezier. */
export function qbez(p0: [number, number], c: [number, number], p1: [number, number], t: number): [number, number] {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
}

/** Hand-made "boil": tiny stepped jitter every n frames. */
export const boil = (f: number, seed: number, amp = 0.8, n = 4) => {
  const s = Math.floor(f / n) + seed * 7.1;
  return [Math.sin(s * 12.9898) * amp, Math.sin(s * 78.233) * amp] as [number, number];
};

export const active = (f: number, a: number, b: number) => f >= a && f < b;
