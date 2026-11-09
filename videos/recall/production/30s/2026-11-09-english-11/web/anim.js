// Deterministic animation helpers: everything is a pure function of time t (seconds).
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const smooth = (e0, e1, x) => { const u = clamp((x - e0) / (e1 - e0)); return u * u * (3 - 2 * u); };

export const E = {
  lin: u => u,
  io: u => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2),
  io3: u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  out: u => 1 - (1 - u) * (1 - u),
  out3: u => 1 - Math.pow(1 - u, 3),
  in: u => u * u,
  in3: u => u * u * u,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  backIn: u => { const c1 = 1.70158, c3 = c1 + 1; return c3 * u * u * u - c1 * u * u; },
};

/** u in [0,1] across [t0,t1] with easing. */
export const seg = (t, t0, t1, ease = E.io) => ease(clamp((t - t0) / (t1 - t0)));

const mix = (a, b, u) => (Array.isArray(a) ? a.map((x, i) => x + (b[i] - x) * u) : a + (b - a) * u);

/** Keyframes: [[time, value, easeIntoThisKey?], ...]; values are numbers or arrays. */
export function key(t, ks) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1];
      const [t1, v1, e] = ks[i];
      return mix(v0, v1, (e || E.io)((t - t0) / Math.max(1e-6, t1 - t0)));
    }
  }
  return ks[ks.length - 1][1];
}

/** Damped oscillation that starts at t0 with amplitude amp. */
export function wobble(t, t0, amp, freq, decay) {
  if (t < t0) return 0;
  const x = t - t0;
  return amp * Math.exp(-decay * x) * Math.sin(2 * Math.PI * freq * x);
}

/** Single bump 0 -> 1 -> 0 between t0 and t1. */
export const pulse = (t, t0, t1) => (t <= t0 || t >= t1 ? 0 : Math.sin(Math.PI * (t - t0) / (t1 - t0)));

/** Fade window: 0 before a, ramps in over fi, holds, ramps out over fo before b. */
export const win = (t, a, b, fi = 0.15, fo = 0.15) => Math.min(smooth(a, a + fi, t), 1 - smooth(b - fo, b, t));

export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
