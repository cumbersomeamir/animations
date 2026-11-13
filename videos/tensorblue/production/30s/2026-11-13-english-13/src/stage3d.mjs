// stage3d — a small original 3D stage for the Blue Receipt Theatre kit (Tensorblue). From english-12; english-13 adds a bottom face.
// Perspective camera, lit box faces (directional light + ambient), per-object painter's sort,
// textured faces (two-triangle affine mapping), soft contact shadows on the bench, 3D tubes.
// Draws onto the same 2D canvas as brt.mjs; no external 3D library.
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const LIGHT = norm([-0.45, 0.85, 0.4]);
const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export function shadeHex(hex, k) { const c = hexRgb(hex); return `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`; }

export function camera(eye, target, fovDeg = 34, cx = 540, cy = 1010) {
  const f = norm(sub(target, eye)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
  return { eye, f, r, u, cx, cy, focal: 540 / Math.tan((fovDeg * Math.PI) / 360) };
}
export function project(cam, p) {
  const d = sub(p, cam.eye), z = dot(d, cam.f);
  return { x: cam.cx + (dot(d, cam.r) / z) * cam.focal, y: cam.cy - (dot(d, cam.u) / z) * cam.focal, z };
}
// box corners: pivot at bottom centre; pitch (about x) then yaw (about y), then translate
function xform(o, l) {
  const cp = Math.cos(o.pitch || 0), sp = Math.sin(o.pitch || 0), cy = Math.cos(o.yaw || 0), sy = Math.sin(o.yaw || 0);
  const y1 = l[1] * cp - l[2] * sp, z1 = l[1] * sp + l[2] * cp;
  return [o.x + l[0] * cy + z1 * sy, o.y + y1, o.z - l[0] * sy + z1 * cy];
}
export function boxFaces(o) {
  const w = o.w / 2, h = o.h, d = o.d / 2;
  const P = (x, y, z) => xform(o, [x, y, z]);
  return {
    front: [P(-w, h, d), P(w, h, d), P(w, 0, d), P(-w, 0, d)],
    back: [P(w, h, -d), P(-w, h, -d), P(-w, 0, -d), P(w, 0, -d)],
    left: [P(-w, h, -d), P(-w, h, d), P(-w, 0, d), P(-w, 0, -d)],
    right: [P(w, h, d), P(w, h, -d), P(w, 0, -d), P(w, 0, d)],
    top: [P(-w, h, -d), P(w, h, -d), P(w, h, d), P(-w, h, d)],
    bottom: [P(-w, 0, d), P(w, 0, d), P(w, 0, -d), P(-w, 0, -d)],   // english-13: lets a tile flip over (pitch ≈ π)
  };
}
export function boxCenter(o) { return xform(o, [0, o.h / 2, 0]); }

function polyPath(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.closePath(); }
function texTri(ctx, img, s0, s1, s2, t0, t1, t2) {
  const det = (t1[0] - t0[0]) * (t2[1] - t0[1]) - (t2[0] - t0[0]) * (t1[1] - t0[1]);
  if (Math.abs(det) < 1e-6) return;
  const a = ((s1.x - s0.x) * (t2[1] - t0[1]) - (s2.x - s0.x) * (t1[1] - t0[1])) / det;
  const b = ((s1.y - s0.y) * (t2[1] - t0[1]) - (s2.y - s0.y) * (t1[1] - t0[1])) / det;
  const c = ((s2.x - s0.x) * (t1[0] - t0[0]) - (s1.x - s0.x) * (t2[0] - t0[0])) / det;
  const d = ((s2.y - s0.y) * (t1[0] - t0[0]) - (s1.y - s0.y) * (t2[0] - t0[0])) / det;
  const e = s0.x - a * t0[0] - c * t0[1], f = s0.y - b * t0[0] - d * t0[1];
  const cx = (s0.x + s1.x + s2.x) / 3, cy = (s0.y + s1.y + s2.y) / 3, g = (p) => ({ x: p.x + (p.x - cx) * 0.02 + Math.sign(p.x - cx) * 0.6, y: p.y + (p.y - cy) * 0.02 + Math.sign(p.y - cy) * 0.6 });
  ctx.save(); polyPath(ctx, [g(s0), g(s1), g(s2)]); ctx.clip(); ctx.transform(a, b, c, d, e, f); ctx.drawImage(img, 0, 0); ctx.restore();
}
// draw one box: faces facing the camera, lit; optional textures per face {front: canvas}
export function drawBox(ctx, cam, o) {
  const F = boxFaces(o), C0 = boxCenter(o), alpha = o.alpha ?? 1;
  if (alpha <= 0) return;
  const list = [];
  for (const [name, pts] of Object.entries(F)) {
    if (o.skip && o.skip.includes(name)) continue;
    let n = norm(cross(sub(pts[3], pts[0]), sub(pts[1], pts[0])));
    const cen = mul(add(add(pts[0], pts[1]), add(pts[2], pts[3])), 0.25);
    if (dot(n, sub(cen, C0)) < 0) n = mul(n, -1);
    if (dot(n, sub(cam.eye, cen)) <= 0) continue;
    const sp = pts.map((p) => project(cam, p)); if (sp.some((p) => p.z < 0.2)) continue;
    list.push({ name, sp, n, z: dot(sub(cen, cam.eye), cam.f) });
  }
  list.sort((a, b) => b.z - a.z);
  ctx.save(); ctx.globalAlpha = alpha;
  for (const fc of list) {
    const k = (o.ambient ?? 0.55) + (1 - (o.ambient ?? 0.55)) * Math.max(0, dot(fc.n, LIGHT));
    const base = (o.colors && o.colors[fc.name]) || o.color;
    ctx.fillStyle = shadeHex(base, k); polyPath(ctx, fc.sp); ctx.fill();
    const tex = o.tex && o.tex[fc.name];
    if (tex) {
      const W = tex.width, H = tex.height, [p0, p1, p2, p3] = fc.sp;
      texTri(ctx, tex, p0, p1, p2, [0, 0], [W, 0], [W, H]); texTri(ctx, tex, p0, p2, p3, [0, 0], [W, H], [0, H]);
      if (k < 0.98) { ctx.fillStyle = `rgba(3,6,16,${(1 - k) * 0.55})`; polyPath(ctx, fc.sp); ctx.fill(); }
    }
    if (o.edge) { ctx.strokeStyle = o.edge; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; polyPath(ctx, fc.sp); ctx.stroke(); }
  }
  ctx.restore();
}
// soft contact shadow of a box footprint on the bench plane y = y0
export function contactShadow(ctx, cam, o, strength = 0.5, spread = 0.25, y0 = 0) {
  if ((o.alpha ?? 1) <= 0) return;
  const w = o.w / 2 + spread, d = o.d / 2 + spread, lift = Math.max(0, o.y - y0);
  const off = [0.25 + lift * 0.35, 0, 0.2 + lift * 0.25];
  const pts = [[-w, 0, -d], [w, 0, -d], [w, 0, d], [-w, 0, d]].map((l) => {
    const cy = Math.cos(o.yaw || 0), sy = Math.sin(o.yaw || 0);
    return project(cam, [o.x + l[0] * cy + l[2] * sy + off[0], y0 + 0.002, o.z - l[0] * sy + l[2] * cy + off[2]]);
  });
  if (pts.some((p) => p.z < 0.2)) return;
  const blur = Math.max(4, Math.min(30, (10 + lift * 18) * cam.focal / 1800 * (12 / Math.max(4, pts[0].z))));
  ctx.save(); ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.globalAlpha = (o.alpha ?? 1) * strength / (1 + lift * 0.6);
  ctx.fillStyle = '#000000'; polyPath(ctx, pts); ctx.fill(); ctx.restore();
}
// a 3D tube along a cubic Bézier, drawn from t0..t1 (for plugging / unplugging)
export function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [0, 1, 2].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]);
}
export function tube(ctx, cam, P, t0, t1, radius, color, dark, alpha = 1, hi = 0.35) {
  if (alpha <= 0 || t1 <= t0) return;
  const N = 48, pts = [];
  for (let i = 0; i <= N; i++) { const t = t0 + (t1 - t0) * (i / N); const p = project(cam, bez(...P, t)); if (p.z > 0.2) pts.push(p); }
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [col, wk, dy] of [[dark, 1, 0.12], [color, 0.82, 0], [`rgba(255,255,255,${hi})`, 0.22, -0.28]]) {
    ctx.strokeStyle = col;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], wpx = (radius * cam.focal) / ((a.z + b.z) / 2);
      ctx.lineWidth = Math.max(1, wpx * 2 * wk); ctx.beginPath(); ctx.moveTo(a.x, a.y + dy * wpx); ctx.lineTo(b.x, b.y + dy * wpx); ctx.stroke();
    }
  }
  ctx.restore();
}
// a lit floor slab with a soft spotlight pool
export function floor(ctx, cam, o, spot) {
  drawBox(ctx, cam, { ...o, ambient: 0.75 });
  const F = boxFaces(o).top.map((p) => project(cam, p));
  if (F.some((p) => p.z < 0.2)) return;
  const c = project(cam, spot.at), r = (spot.radius * cam.focal) / c.z;
  ctx.save(); polyPath(ctx, F); ctx.clip();
  const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
  g.addColorStop(0, `rgba(59,130,246,${spot.strength})`); g.addColorStop(0.55, `rgba(59,130,246,${spot.strength * 0.35})`); g.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
}
