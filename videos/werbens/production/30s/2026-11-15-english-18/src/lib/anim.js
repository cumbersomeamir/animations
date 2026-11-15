// Deterministic animation helpers: everything is a pure function of time t (seconds). No Math.random, no clocks.
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, u) => a + (b - a) * u;
export const smooth = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };

export const E = {
  lin: (u) => u,
  in: (u) => u * u * u,
  out: (u) => 1 - Math.pow(1 - u, 3),
  out2: (u) => 1 - (1 - u) * (1 - u),
  inOut: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  sine: (u) => -(Math.cos(Math.PI * u) - 1) / 2,
  outBack: (u) => { const s = 1.9; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); },
  inBack: (u) => { const s = 1.7; return (s + 1) * u * u * u - s * u * u; },
  outElastic: (u) => (u === 0 || u === 1 ? u : Math.pow(2, -9 * u) * Math.sin((u * 10 - 0.75) * ((2 * Math.PI) / 3.2)) + 1),
  hold: () => 0,
};

// 0→1 between t0 and t1 with easing
export const ramp = (t, t0, t1, ease = E.inOut) => ease(clamp((t - t0) / (t1 - t0)));
// 1 inside [t0,t1] with soft edges of width f (in/out envelope)
export const window = (t, t0, t1, fin = 0.15, fout = fin) => Math.min(ramp(t, t0, t0 + fin, E.out2), 1 - ramp(t, t1 - fout, t1, E.inOut));

// Keyframe track. ks = [[time, value, easeIntoThisKey?], ...]; value: number or array of numbers.
export function key(t, ks) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t1, v1, ez] = ks[i];
    if (t <= t1) {
      const [t0, v0] = ks[i - 1];
      const u = (ez || E.inOut)(clamp((t - t0) / Math.max(1e-6, t1 - t0)));
      return Array.isArray(v0) ? v0.map((a, k) => lerp(a, v1[k], u)) : lerp(v0, v1, u);
    }
  }
  return ks[ks.length - 1][1];
}

// Decaying oscillation impulse starting at t0 (follow-through / settle). Returns 0 before t0.
export const wobble = (t, t0, amp = 1, freq = 4, damp = 6) => {
  const d = t - t0; if (d < 0) return 0;
  return amp * Math.exp(-damp * d) * Math.sin(2 * Math.PI * freq * d);
};
// Critically-underdamped step 0→1 with overshoot, starting at t0
export const spring = (t, t0, freq = 2.2, damp = 5.5) => {
  const d = t - t0; if (d <= 0) return 0;
  return 1 - Math.exp(-damp * d) * Math.cos(2 * Math.PI * freq * d);
};

// Smooth deterministic value noise in [-1,1]
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const noise1 = (x, seed = 0) => {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57.3), hash(i + 1 + seed * 57.3), u) * 2 - 1;
};

// Seeded PRNG (mulberry32) for one-time layout decisions
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Blend expression/pose objects: base + Σ w_i * (preset_i - base) (numeric fields only)
export function mix(base, ...pairs) {
  const out = { ...base };
  for (const [p, w] of pairs) {
    if (!w) continue;
    for (const k in p) if (typeof p[k] === "number") out[k] = lerp(out[k] ?? 0, p[k], w);
  }
  return out;
}
