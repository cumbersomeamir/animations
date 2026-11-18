// toy3d — chunky "toy" objects for the Tensorblue 3D stage (new in english-20, original code).
// Answers the 2026-11-18 feedback ("motion graphics lack 3D depth and are not fun"):
//  * extrude(): any 2D outline (speech bubble with a tail, tick, clock, rounded phone) becomes a thick lit
//    object — every side wall is a real quad shaded by its own normal, the front face is lit, textured and
//    glossed — so objects read as solid toys, not flat cards;
//  * distance fog toward the background navy (atmospheric depth) for everything drawn here;
//  * squash-and-stretch scale for bouncy landings; soft blurred layers for depth of field.
// Draws on the same 2D canvas as brt.mjs / stage3d.mjs; no external 3D library.
import { createCanvas } from '@napi-rs/canvas';
import { project, norm, sub, add, mul, dot, cross } from './stage3d.mjs';

export const LIGHT = norm([-0.45, 0.85, 0.55]);
export const FOG = { color: [3, 6, 16], near: 6, far: 17, max: 0.72 };
const rgbOf = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
export function fogK(cam, p) { const z = dot(sub(p, cam.eye), cam.f); return Math.max(0, Math.min(1, (z - FOG.near) / (FOG.far - FOG.near))) * FOG.max; }
// colour lit by k and fogged by f, as a CSS string
export function lit(hex, k, f = 0, alpha = 1) {
  const c = rgbOf(hex);
  const ch = (i) => Math.round(Math.min(255, c[i] * k) * (1 - f) + FOG.color[i] * f);
  return alpha >= 1 ? `rgb(${ch(0)},${ch(1)},${ch(2)})` : `rgba(${ch(0)},${ch(1)},${ch(2)},${alpha})`;
}

// local → world: scale, roll (z), pitch (x), yaw (y), translate
export function frame(o) {
  const cr = Math.cos(o.roll || 0), sr = Math.sin(o.roll || 0), cp = Math.cos(o.pitch || 0), sp = Math.sin(o.pitch || 0);
  const cy = Math.cos(o.yaw || 0), sy = Math.sin(o.yaw || 0), sx = o.sx ?? 1, syy = o.sy ?? 1, sz = o.sz ?? 1;
  return (l) => {
    let x = l[0] * sx, y = l[1] * syy, z = l[2] * sz;
    [x, y] = [x * cr - y * sr, x * sr + y * cr];
    [y, z] = [y * cp - z * sp, y * sp + z * cp];
    [x, z] = [x * cy + z * sy, -x * sy + z * cy];
    return [o.p[0] + x, o.p[1] + y, o.p[2] + z];
  };
}

// ---- 2D outlines (counter-clockwise, centred, units) ----
export function rrectPts(w, h, r, seg = 5) {
  const pts = [], cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 1], [-w / 2 + r, -h / 2 + r, 2], [w / 2 - r, -h / 2 + r, 3]];
  for (const [cx, cy, q] of cs) for (let i = 0; i <= seg; i++) { const a = (q + i / seg) * Math.PI / 2; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return pts;
}
// a speech bubble: rounded rect with a tail at the bottom right (side = 1) or bottom left (side = -1)
export function bubblePts(w, h, r, side = 1, seg = 5) {
  const base = rrectPts(w, h, r, seg), k = (seg + 1) * 3;   // base[k] = first point of the bottom-right corner
  // the bottom edge runs left → right between base[k-1] and base[k]; splice a tail near the chosen corner
  const tx = w / 2 - r * 0.9, A = [tx - h * 0.24, -h / 2], T = [tx + h * 0.3, -h / 2 - h * 0.32], B = [tx + h * 0.02, -h / 2];
  const tail = side > 0 ? [A, T, B] : [[-B[0], B[1]], [-T[0], T[1]], [-A[0], A[1]]];
  return [...base.slice(0, k), ...tail, ...base.slice(k)];
}
export function circlePts(r, n = 28) { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; p.push([r * Math.cos(a), r * Math.sin(a)]); } return p; }
// a fat check mark (one tick) centred at 0
export function tickPts(s = 1) {
  const t = 0.17 * s;
  return [[-0.42 * s, 0.02 * s], [-0.13 * s, -0.27 * s], [0.45 * s, 0.31 * s], [0.45 * s - t * 0.9, 0.31 * s + t * 0.9], [-0.13 * s, -0.27 * s + t * 1.35], [-0.42 * s + t * 0.9, 0.02 * s + t * 0.9]];
}

function path(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.closePath(); }
// draw an image affinely mapped by one triangle; clip = false paints the whole current clip (no seam under the
// second triangle: english-20 QA found a faint anti-aliased diagonal where two clipped triangles met)
function texTri(ctx, img, s0, s1, s2, t0, t1, t2, clip = true) {
  const det = (t1[0] - t0[0]) * (t2[1] - t0[1]) - (t2[0] - t0[0]) * (t1[1] - t0[1]);
  if (Math.abs(det) < 1e-6) return;
  const a = ((s1.x - s0.x) * (t2[1] - t0[1]) - (s2.x - s0.x) * (t1[1] - t0[1])) / det;
  const b = ((s1.y - s0.y) * (t2[1] - t0[1]) - (s2.y - s0.y) * (t1[1] - t0[1])) / det;
  const c = ((s2.x - s0.x) * (t1[0] - t0[0]) - (s1.x - s0.x) * (t2[0] - t0[0])) / det;
  const d = ((s2.y - s0.y) * (t1[0] - t0[0]) - (s1.y - s0.y) * (t2[0] - t0[0])) / det;
  const e = s0.x - a * t0[0] - c * t0[1], f = s0.y - b * t0[0] - d * t0[1];
  const cx = (s0.x + s1.x + s2.x) / 3, cy = (s0.y + s1.y + s2.y) / 3, g = (p) => ({ x: p.x + Math.sign(p.x - cx) * 0.7, y: p.y + Math.sign(p.y - cy) * 0.7 });
  ctx.save(); if (clip) { path(ctx, [g(s0), g(s1), g(s2)]); ctx.clip(); } ctx.transform(a, b, c, d, e, f); ctx.drawImage(img, 0, 0); ctx.restore();
}

// Extrude an outline into a lit toy. o: { p, yaw, pitch, roll, sx, sy, pts, depth, color, side?, back?, tex?, texW?, texH?,
//   alpha?, ambient?, gloss?, edge? }. The front face is +z local; tex covers the local rect texW × texH on it.
export function extrude(ctx, cam, o) {
  const alpha = o.alpha ?? 1; if (alpha <= 0.003) return;
  const X = frame(o), d2 = o.depth / 2, pts = o.pts, n = pts.length;
  const F = pts.map(([u, v]) => X([u, v, d2])), B = pts.map(([u, v]) => X([u, v, -d2]));
  const centre = X([0, 0, 0]);
  const fk = o.noFog ? 0 : fogK(cam, centre);
  const PF = F.map((p) => project(cam, p)), PB = B.map((p) => project(cam, p));
  if (PF.some((p) => p.z < 0.25) || PB.some((p) => p.z < 0.25)) return;
  const amb = o.ambient ?? 0.5;
  const nFront = norm(sub(X([0, 0, 1]), X([0, 0, 0])));
  const toCam = norm(sub(cam.eye, centre));
  const frontVis = dot(nFront, toCam) > 0;
  ctx.save(); ctx.globalAlpha *= alpha;
  // side walls, far first
  const walls = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = F[i], b = F[j], c = B[j];
    let nn = norm(cross(sub(b, a), sub(c, a)));
    const mid = mul(add(add(a, b), add(B[i], c)), 0.25);
    if (dot(nn, sub(mid, centre)) < 0) nn = mul(nn, -1);
    if (dot(nn, sub(cam.eye, mid)) <= 0) continue;
    walls.push({ q: [PF[i], PF[j], PB[j], PB[i]], z: dot(sub(mid, cam.eye), cam.f), k: amb + (1 - amb) * Math.max(0, dot(nn, LIGHT)) });
  }
  walls.sort((p, q) => q.z - p.z);
  const side = o.side || o.color;
  for (const w of walls) { ctx.fillStyle = lit(side, w.k * 0.86, fk); path(ctx, w.q); ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke(); }
  // the visible cap
  const cap = frontVis ? PF : PB;
  const kCap = amb + (1 - amb) * Math.max(0, dot(frontVis ? nFront : mul(nFront, -1), LIGHT));
  ctx.fillStyle = lit(frontVis ? o.color : (o.back || side), Math.min(1.12, kCap + 0.12), fk); path(ctx, cap); ctx.fill();
  if (frontVis && o.tex) {
    const tw = o.texW, th = o.texH, T = o.tex;
    const q = [X([-tw / 2, th / 2, d2 + 0.001]), X([tw / 2, th / 2, d2 + 0.001]), X([tw / 2, -th / 2, d2 + 0.001]), X([-tw / 2, -th / 2, d2 + 0.001])].map((p) => project(cam, p));
    ctx.save(); path(ctx, cap); ctx.clip();
    texTri(ctx, T, q[0], q[1], q[2], [0, 0], [T.width, 0], [T.width, T.height], false);   // whole face (clipped to the cap)
    texTri(ctx, T, q[0], q[2], q[3], [0, 0], [T.width, T.height], [0, T.height]);         // second half on top
    if (fk > 0.01) { ctx.fillStyle = `rgba(3,6,16,${fk})`; ctx.fillRect(0, 0, 1080, 1920); }
    ctx.restore();
  }
  if (frontVis && (o.gloss ?? 0.16) > 0) {     // a soft studio highlight across the top of the front face
    const top = project(cam, X([0, (o.texH || 1) * 0.5, d2])), bot = project(cam, X([0, -(o.texH || 1) * 0.1, d2]));
    ctx.save(); path(ctx, cap); ctx.clip();
    const g = ctx.createLinearGradient(top.x, top.y, bot.x, bot.y);
    g.addColorStop(0, `rgba(255,255,255,${(o.gloss ?? 0.16) * (1 - fk)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
  }
  if (o.edge) { ctx.strokeStyle = o.edge; ctx.lineWidth = o.edgeW || 2; ctx.lineJoin = 'round'; path(ctx, cap); ctx.stroke(); }
  ctx.restore();
}

// a soft elliptical contact shadow on the floor y = y0 under a point, shrinking/softening with height
export function dropShadow(ctx, cam, p, rx, rz, strength = 0.55, y0 = 0) {
  const h = Math.max(0, p[1] - y0), k = strength / (1 + h * 0.9);
  if (k <= 0.01) return;
  const c = project(cam, [p[0] + h * 0.18, y0 + 0.003, p[2] + h * 0.12]); if (c.z < 0.25) return;
  const ex = project(cam, [p[0] + h * 0.18 + rx * (1 + h * 0.3), y0, p[2] + h * 0.12]), ez = project(cam, [p[0] + h * 0.18, y0, p[2] + h * 0.12 + rz * (1 + h * 0.3)]);
  const ax = Math.max(2, Math.abs(ex.x - c.x)), az = Math.max(1.5, Math.abs(ez.y - c.y));
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(ax, az);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, `rgba(0,0,0,${0.85 * k})`); g.addColorStop(0.6, `rgba(0,0,0,${0.35 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// a pool of light on the floor (radial, in the floor plane)
export function lightPool(ctx, cam, p, r, rgb, a) {
  const c = project(cam, p); if (c.z < 0.25) return;
  const e = project(cam, [p[0] + r, p[1], p[2]]), f = project(cam, [p[0], p[1], p[2] + r]);
  const ax = Math.abs(e.x - c.x), az = Math.max(2, Math.abs(f.y - c.y));
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(ax, az);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(0.5, `rgba(${rgb},${a * 0.4})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// squash & stretch for a landing: impact 0..1 → [sx, sy]
export function squash(impact) { const k = Math.max(0, Math.min(1, impact)); return [1 + 0.22 * k, 1 - 0.26 * k]; }
// a hop from a to b with height h at progress t (0..1)
export function hop(a, b, h, t) { const u = Math.max(0, Math.min(1, t)); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 4 * h * u * (1 - u), a[2] + (b[2] - a[2]) * u]; }

// depth of field: draw into a reusable layer, then composite blurred
const LAYER = createCanvas(1080, 1920), LG = LAYER.getContext('2d');
export function blurred(ctx, px, draw) {
  if (px < 0.4) { draw(ctx); return; }
  LG.setTransform(1, 0, 0, 1, 0, 0); LG.clearRect(0, 0, 1080, 1920); LG.globalAlpha = 1;
  draw(LG);
  ctx.save(); ctx.filter = `blur(${px.toFixed(1)}px)`; ctx.drawImage(LAYER, 0, 0); ctx.restore();
}
