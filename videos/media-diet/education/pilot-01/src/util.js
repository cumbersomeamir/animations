// Small deterministic animation helpers (pure functions of time; no wall clock, no randomness).
import * as THREE from 'three';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  step: (t) => (t < 1 ? 0 : 1),
};

// Normalised progress of t inside [a, b] with an easing curve.
export function prog(t, a, b, e = ease.inOut) { return e(clamp((t - a) / (b - a))); }

// Pulse that rises at a, peaks, falls by b (0 outside).
export function pulse(t, a, b) { if (t < a || t > b) return 0; const x = (t - a) / (b - a); return Math.sin(Math.PI * x); }

// Damped oscillation starting at t0 (for follow-through / wobble).
export function wobble(t, t0, freq = 3, decay = 5, amp = 1) {
  if (t < t0) return 0; const x = t - t0; return amp * Math.sin(2 * Math.PI * freq * x) * Math.exp(-decay * x);
}

// Deterministic value noise for subtle handheld camera drift.
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i; const a = hash(i + seed * 57.3), b = hash(i + 1 + seed * 57.3);
  return lerp(a, b, smooth(f)) * 2 - 1;
}

// Keyframe track: keys = [[time, value, easeName?], ...]; values may be numbers or arrays.
export function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i]; const [t1, v1, e] = keys[i + 1];
    if (t <= t1) {
      const p = (ease[e || 'inOut'])(clamp((t - t0) / (t1 - t0)));
      if (Array.isArray(v0)) return v0.map((x, k) => lerp(x, v1[k], p));
      return lerp(v0, v1, p);
    }
  }
  return keys[keys.length - 1][1];
}

// Quadratic arc between two points with an apex height above the midpoint.
export function arc(p0, p1, h, u, out = new THREE.Vector3()) {
  out.lerpVectors(p0, p1, u);
  out.y += 4 * h * u * (1 - u);
  return out;
}

export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  tex.userData.canvas = c; tex.userData.draw = draw;
  return tex;
}

export function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

export function radialGlowTexture(color = '#2addfa') {
  return canvasTexture(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, color); gr.addColorStop(0.35, color + '88'); gr.addColorStop(1, color + '00');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}
