// earth.mjs — Aarambh english-23: a software-rendered 3D Earth cutaway (orthographic, per pixel) and physical P-wave ray paths.
// The cutaway removes the front half of the globe (local z > 0), so the cut plane (local z = 0) faces the camera and shows the layers.
// Ray paths are traced in that plane through a simplified PREM P-velocity profile, conserving the ray parameter p = r·sin(i)/v (Snell's law
// for a layered sphere); the head of each ray moves with the computed travel time, so it visibly slows in the outer core and speeds up in the inner core.
import { createCanvas, loadImage } from '@napi-rs/canvas';

export const RE = 6371, RCMB = 3480, RICB = 1221.5; // km (PREM radii)
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// ---------- simplified PREM P-wave speed (km/s), piecewise linear in radius ----------
const VT = {
  mantle: [[6371, 6.2], [6346, 8.1], [6151, 8.0], [5971, 8.9], [5961, 9.13], [5701, 10.27], [5700, 10.75], [5600, 11.07], [5371, 11.46], [4871, 12.0], [4371, 12.5], [3871, 13.1], [3630, 13.68], [3480, 13.72]],
  outer: [[3480, 8.06], [3000, 8.9], [2500, 9.5], [2000, 9.9], [1500, 10.2], [1221.5, 10.36]],
  inner: [[1221.5, 11.03], [0, 11.26]],
};
export function vAt(r, layer) {
  const T = VT[layer];
  for (let i = 0; i < T.length - 1; i++) { const [r0, v0] = T[i], [r1, v1] = T[i + 1]; if (r <= r0 && r >= r1) return v0 + (v1 - v0) * (r0 - r) / (r0 - r1 || 1); }
  return r > T[0][0] ? T[0][1] : T[T.length - 1][1];
}
/** Trace one ray with ray parameter p (s/rad) from the surface. The path is symmetric about its deepest point (turning point,
 * reflection at a boundary or the centre), so the downgoing half is traced and mirrored. Returns points [r_km, theta_rad, time_s, layer]. */
export function trace(p, ds = 3) {
  let r = RE, th = 0, layer = 'mantle', tt = 0; const half = [[r, 0, 0, layer]];
  for (let k = 0; k < 60000; k++) {
    const v = vAt(r, layer), s = p * v / r;
    if (s >= 1) break;                                   // turning point
    const c = Math.sqrt(1 - s * s), h = Math.min(ds, Math.max(0.01, 0.02 * r));
    let rn = r - c * h; const dth = s * h / r; let stop = false;
    if (layer === 'mantle' && rn < RCMB) { if (p * vAt(RCMB, 'outer') / RCMB < 1) { layer = 'outer'; rn = RCMB - 0.01; } else { rn = RCMB; stop = true; } }
    else if (layer === 'outer' && rn < RICB) { if (p * vAt(RICB, 'inner') / RICB < 1) { layer = 'inner'; rn = RICB - 0.01; } else { rn = RICB; stop = true; } }
    if (rn <= 0.5) { rn = 0.5; stop = true; }
    tt += h / v; th += dth; r = rn; half.push([r, th, tt, layer]);
    if (stop) break;
  }
  const [, thT, tT] = half[half.length - 1];
  const pts = half.concat(half.slice(0, -1).reverse().map(([rr, a, b, l]) => [rr, 2 * thT - a, 2 * tT - b, l]));
  return { p, pts, delta: 2 * thT * 180 / Math.PI, time: 2 * tT, deepest: half[half.length - 1][0] };
}
/** Bisection for the ray parameter that lands at a target distance on a monotonic branch [pLo, pHi] (rising: distance grows with p). */
export function solveP(target, pLo, pHi, rising = true) {
  for (let i = 0; i < 60; i++) { const m = (pLo + pHi) / 2, d = trace(m, 4).delta; if ((d < target) === rising) pLo = m; else pHi = m; }
  return (pLo + pHi) / 2;
}

// ---------- rotation (local -> world), orthographic camera looking along -z ----------
export function rot(yaw, pitch) { // M = Ry(yaw) · Rx(pitch)
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  return [[cy, sy * sp, sy * cp], [0, cp, -sp], [-sy, cy * sp, cy * cp]];
}
const mul = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
const mulT = (M, v) => [M[0][0] * v[0] + M[1][0] * v[1] + M[2][0] * v[2], M[0][1] * v[0] + M[1][1] * v[1] + M[2][1] * v[2], M[0][2] * v[0] + M[1][2] * v[1] + M[2][2] * v[2]];
/** Screen position (relative to the Earth's centre, y down) of a point on the cut plane: (u, v) in Earth radii, angle measured from local +x. */
export function planeToScreen(M, R, u, v) { const w = mul(M, [u, v, 0]); return [w[0] * R, -w[1] * R]; }

// ---------- texture: NASA Blue Marble (2002, public domain), graded to the Aarambh palette ----------
let TEXW = 0, TEXH = 0, GT = null;
export async function loadTexture(file) {
  const img = await loadImage(file); TEXW = img.width; TEXH = img.height;
  const cv = createCanvas(TEXW, TEXH), c = cv.getContext('2d'); c.drawImage(img, 0, 0); const d = c.getImageData(0, 0, TEXW, TEXH).data;
  GT = new Float32Array(TEXW * TEXH * 3);
  const deep = hex('#06333A'), shallow = hex('#1A6E67'), landLo = hex('#6E6236'), landHi = hex('#EBDCAA'), veg = hex('#4E7A4A'), ice = hex('#FBF7EE');
  for (let i = 0; i < TEXW * TEXH; i++) {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], lum = 0.3 * r + 0.59 * g + 0.11 * b;
    let col;
    if (b > r + 6 && b >= g - 10) col = mix(deep, shallow, clamp((lum - 15) / 90));
    else if (lum > 205) col = ice;
    else { col = mix(landLo, landHi, clamp((lum - 30) / 170)); col = mix(col, veg, clamp((g - r) / 35) * 0.55); }
    GT[i * 3] = col[0]; GT[i * 3 + 1] = col[1]; GT[i * 3 + 2] = col[2];
  }
}
const sampleTex = (lon, lat) => { // lon, lat in radians
  let u = (lon / (2 * Math.PI) + 0.5) % 1; if (u < 0) u += 1; const v = clamp(0.5 - lat / Math.PI, 0, 0.9999);
  const i = (Math.floor(v * TEXH) * TEXW + Math.floor(u * TEXW)) * 3; return [GT[i], GT[i + 1], GT[i + 2]];
};

// ---------- the cutaway ----------
const C_CRUST = hex('#F3EAD2'), C_M0 = hex('#7E3520'), C_M1 = hex('#D2652B'), C_OC0 = hex('#E0912C'), C_OC1 = hex('#F7C759'), C_IC0 = hex('#FFF6DA'), C_IC1 = hex('#FCD98A'), C_VEIL = hex('#1B120B');
const L = (() => { const v = [-0.5, 0.55, 0.68], n = Math.hypot(...v); return v.map((x) => x / n); })();
const hash2 = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
/**
 * Render the cutaway. Returns { cv, M, ss, x0, y0, w, h }: draw cv at (centre + x0, centre + y0) with size w x h.
 * opts: R (px radius on screen), yaw, pitch, spin (rad), t (s), veil 0..1 (hide the inner core), solid 0..1 (crystal facets), icGlow 0..1, cutFace bool
 */
export function renderCutaway(o) {
  // o.box = [x0, y0, w, h]: the screen window (px, relative to the Earth's centre, y down) to compute; clipped to the disc's bounds.
  const ss = o.ss ?? 1.5, R = o.R * ss, M = rot(o.yaw, o.pitch);
  let [bx0, by0, bw, bh] = o.box || [-o.R - 3, -o.R - 3, 2 * o.R + 6, 2 * o.R + 6];
  const X0 = Math.max(bx0, -o.R - 3), Y0 = Math.max(by0, -o.R - 3), X1 = Math.min(bx0 + bw, o.R + 3), Y1 = Math.min(by0 + bh, o.R + 3);
  const wpx = Math.max(1, Math.ceil((X1 - X0) * ss)), hpx = Math.max(1, Math.ceil((Y1 - Y0) * ss));
  const cv = createCanvas(wpx, hpx), c = cv.getContext('2d'), im = c.createImageData(wpx, hpx), D = im.data, size = wpx;
  const dl = mulT(M, [0, 0, -1]), nf = mul(M, [0, 0, 1]), nx = mul(M, [1, 0, 0]);
  const t = o.t || 0, veil = o.veil || 0, solid = o.solid || 0, spin = o.spin || 0, icR = RICB / RE, cmb = RCMB / RE, crust = 0.986;
  for (let j = 0; j < hpx; j++) {
    const wy = -(Y0 * ss + j + 0.5) / R;
    for (let i = 0; i < wpx; i++) {
      const wx = (X0 * ss + i + 0.5) / R; if (wx * wx + wy * wy > 1.0) continue;
      const ol = mulT(M, [wx, wy, 2]);
      const b = ol[0] * dl[0] + ol[1] * dl[1] + ol[2] * dl[2], cc = ol[0] * ol[0] + ol[1] * ol[1] + ol[2] * ol[2] - 1, disc = b * b - cc;
      if (disc < 0) continue;
      const sq = Math.sqrt(disc), t1 = -b - sq, t2 = -b + sq;
      const p1 = [ol[0] + t1 * dl[0], ol[1] + t1 * dl[1], ol[2] + t1 * dl[2]];
      const removed = (q) => q[0] > 0 && q[2] > 0; // the quarter wedge facing the viewer is cut away
      let col, a = 255, px = 0, py = 0, face = -1;
      if (!removed(p1)) { // outer surface of the remaining globe
        const n = mul(M, p1), lam = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
        const lat = Math.asin(clamp(p1[1], -1, 1)), lon = Math.atan2(p1[0], p1[2]) + spin;
        const tc = sampleTex(lon, lat), sh = 0.3 + 0.85 * lam, fres = Math.pow(1 - Math.abs(n[2]), 4);
        col = [tc[0] * sh + 120 * fres, tc[1] * sh + 190 * fres, tc[2] * sh + 170 * fres];
      } else { // leaves the wedge through the z = 0 face (x >= 0) or the x = 0 face (z >= 0)
        const tz = Math.abs(dl[2]) > 1e-9 ? -ol[2] / dl[2] : Infinity, tx = Math.abs(dl[0]) > 1e-9 ? -ol[0] / dl[0] : Infinity;
        const cand = [[tz, 0], [tx, 1]].filter(([tt]) => tt > t1 - 1e-9 && tt < t2).sort((u, w) => u[0] - w[0]);
        let hit = null;
        for (const [tt, f] of cand) { const q = [ol[0] + tt * dl[0], ol[1] + tt * dl[1], ol[2] + tt * dl[2]]; if (f === 0 ? q[0] >= -1e-9 : q[2] >= -1e-9) { hit = [q, f]; break; } }
        if (!hit) continue;
        face = hit[1]; px = face === 0 ? hit[0][0] : hit[0][2]; py = hit[0][1];
        const nfw = face === 0 ? nf : nx, fl = 0.72 + 0.28 * Math.max(0, nfw[0] * L[0] + nfw[1] * L[1] + nfw[2] * L[2]);
        const rho = Math.hypot(px, py), ang = Math.atan2(py, px) + face * 1.3;
        if (rho > crust) col = C_CRUST.map((x) => x * fl);
        else if (rho > cmb) {
          const k = (crust - rho) / (crust - cmb), n = 0.05 * Math.sin(9 * ang + 18 * rho + 0.4 * t) + 0.035 * Math.sin(23 * ang - 30 * rho);
          col = mix(C_M0, C_M1, clamp(k * k * 0.9 + 0.1 + n)).map((x) => x * fl * (rho > 0.95 ? 0.85 + 0.15 * (crust - rho) / 0.036 : 1));
          if (rho - cmb < 0.006) col = col.map((x) => x * 0.55);
        } else if (rho > icR) {
          const k = (cmb - rho) / (cmb - icR), n = 0.07 * Math.sin(11 * ang - 1.6 * t + 26 * rho) + 0.05 * Math.sin(5 * ang + 1.1 * t - 40 * rho);
          col = mix(C_OC0, C_OC1, clamp(k + n)).map((x) => x * (0.9 + 0.1 * fl));
          if (rho - icR < 0.005) col = col.map((x) => x * 0.7);
        } else {
          const k = rho / icR; let ic = mix(C_IC0, C_IC1, k * k);
          if (solid > 0) { // Voronoi crystal facets with glints (illustration of a solid, crystalline inner core)
            const sc = 0.045, gx = Math.floor(px / sc), gy = Math.floor(py / sc); let d1 = 9, d2 = 9, id = 0;
            for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) { const cx_ = gx + ox, cy_ = gy + oy, sx_ = (cx_ + hash2(cx_ + face * 57, cy_)) * sc, sy_ = (cy_ + hash2(cy_ - 91, cx_ + face * 13)) * sc, d = Math.hypot(px - sx_, py - sy_);
              if (d < d1) { d2 = d1; d1 = d; id = hash2(cx_ * 1.7 + face, cy_ * 2.3); } else if (d < d2) d2 = d; }
            const edge = clamp((d2 - d1) / (0.12 * sc)), glint = Math.pow(Math.max(0, Math.sin(id * 50 + t * 2.5)), 16) * 0.55, base = 0.82 + 0.3 * id;
            const fc = [255 * base + 200 * glint, 246 * base + 190 * glint, 222 * base + 150 * glint].map((x) => x * (0.62 + 0.38 * edge));
            ic = mix(ic, fc, solid); }
          if (veil > 0) { const n = 0.5 + 0.5 * Math.sin(7 * ang + 2 * t + 30 * rho) * Math.sin(3 * ang - t); ic = mix(ic, mix(C_VEIL, hex('#3A2410'), n * 0.6), veil); }
          col = ic;
        }
      }
      const q = (j * wpx + i) * 4; D[q] = col[0]; D[q + 1] = col[1]; D[q + 2] = col[2]; D[q + 3] = a;
    }
  }
  c.putImageData(im, 0, 0);
  return { cv, M, ss, x0: X0, y0: Y0, w: wpx / ss, h: hpx / ss };
}
