// Origami models built from facets (local coordinates). Each fold reveals tone changes so the
// soft top-left light carries the form, as the skill's origami lane prescribes.
import { P, F, TAU, lerp, clamp, facets, path, hinge, shade, star4 } from './lib.mjs';

const L = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

// ---------------------------------------------------------------- heart (icon motif: gold rings heart)
export function heart(ctx, x, y, s, c = P.gold, opt = {}) {
  const p = (px, py) => [x + px * s, y + py * s];
  const N = p(0, -0.28), C0 = p(0, 0.12), B = p(0, 0.9);
  const lt = p(-0.52, -0.62), lo = p(-1.0, -0.16), rt = p(0.52, -0.62), ro = p(1.0, -0.16);
  const lc = p(-0.86, -0.52), rc = p(0.86, -0.52);
  facets(ctx, [
    { pts: [N, lt, lc, lo, C0], c, tone: 0.32, crease: [[N, C0]] },
    { pts: [lo, B, C0], c, tone: 0.02, crease: [[lo, C0]] },
    { pts: [N, C0, ro, rc, rt], c, tone: -0.12 },
    { pts: [C0, B, ro], c, tone: -0.32, crease: [[C0, B]] },
  ], { blur: opt.blur ?? 14, sx: 4, sy: 8 });
}

/** Ribbon band crossing (icon motif) between two points, folded once in the middle. */
export function ribbon(ctx, a, b, w, c = P.rasp) {
  const m = L(a, b, 0.5);
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l * w / 2, ny = dx / l * w / 2;
  facets(ctx, [
    { pts: [[a[0] + nx, a[1] + ny], [m[0] + nx * 1.1, m[1] + ny * 1.1], [m[0] - nx * 0.9, m[1] - ny * 0.9], [a[0] - nx, a[1] - ny]], c, tone: 0.18 },
    { pts: [[m[0] + nx * 1.1, m[1] + ny * 1.1], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [m[0] - nx * 0.9, m[1] - ny * 0.9]], c, tone: -0.22 },
  ], { blur: 8, sx: 3, sy: 6 });
}

// ---------------------------------------------------------------- crane
const K = {
  B0: [[0, -205], [0, -32]], B1: [[0, 205], [8, 68]], BL: [[-125, -25], [-82, 10]], BR: [[125, -25], [86, 4]],
  Nn: [[125, -25], [54, -16]], N: [[125, -25], [186, -168]], H1: [[125, -25], [218, -150]], H2: [[125, -25], [198, -138]],
  Tt: [[-125, -25], [-50, -16]], T: [[-125, -25], [-204, -118]],
};
/** m: 0 kite base -> 1 crane. phi: wing angle (0 up, PI down). dir: 1 faces right. */
export function crane(ctx, x, y, s, m, phi, dir = 1, opt = {}) {
  const q = {};
  for (const k in K) { const [a, b] = K[k]; q[k] = [x + dir * lerp(a[0], b[0], m) * s, y + lerp(a[1], b[1], m) * s]; }
  const wa = [x + dir * -46 * s, y - 24 * s * m - (1 - m) * 60 * s], wb = [x + dir * 44 * s, y - 26 * s * m - (1 - m) * 60 * s];
  const wl = 250 * s * m;
  const wing = (dx, scale, base) => {
    const c = Math.cos(phi);
    const tip = [x + dir * (dx * s), (wa[1] + wb[1]) / 2 - wl * scale * c];
    const front = c >= 0;
    return { pts: [wa, wb, tip], c: front ? P.cream : P.raspLight, tone: front ? base + 0.25 * c : -0.05 + 0.2 * c };
  };
  const far = wing(30, 0.82, -0.25), near = wing(-14, 1, 0.12);
  const body = [
    { pts: [q.BL, q.B0, q.B1], c: P.cream, tone: 0.28, crease: [[q.B0, q.B1]] },
    { pts: [q.B0, q.BR, q.B1], c: P.cream, tone: -0.14 },
  ];
  const neck = [{ pts: [q.BR, q.Nn, q.N], c: P.cream, tone: 0.12 }, { pts: [q.N, q.H1, q.H2], c: P.raspLight, tone: -0.1 }];
  const tail = [{ pts: [q.BL, q.Tt, q.T], c: P.cream, tone: 0.2 }];
  const order = m > 0.05 ? [far, ...tail, ...body, ...neck, near] : [...body];
  facets(ctx, order, { blur: opt.blur ?? 22, sx: opt.shx ?? 10, sy: opt.shy ?? 18 });
}

// ---------------------------------------------------------------- people (pleated paper figures)
/** Person standing with base at (x,y), height h. kind 'A' raspberry pleated dress + veil, 'B' gold jacket. */
export function person(ctx, x, y, h, kind, opt = {}) {
  const s = h / 260;
  const p = (px, py) => [x + px * s, y + py * s];
  const col = opt.col || (kind === 'A' ? P.rasp : P.gold);
  const arms = opt.arms || [0.25, -0.25]; // rotation of each arm from hanging (radians, + = toward right)
  const list = [];
  const sh = [p(-30, -188), p(30, -188)];
  const arm = (side, ang) => {
    const o = side < 0 ? sh[0] : sh[1];
    const len = 92 * s, w = 13 * s;
    const dx = Math.sin(ang), dy = Math.cos(ang);
    const tip = [o[0] + dx * len, o[1] + dy * len];
    list.push({ pts: [[o[0] - dy * w * 0.5 + side * 2, o[1] + dx * w * 0.5], [o[0] + dy * w * 0.5 + side * 2, o[1] - dx * w * 0.5], tip], c: col, tone: side < 0 ? 0.15 : -0.2 });
    return tip;
  };
  if (kind === 'A') {
    // veil behind
    list.push({ pts: [p(-10, -250), p(-58, -150), p(-30, -120)], c: P.cream, tone: 0.1 });
    const hands = [arm(-1, arms[0]), arm(1, arms[1])];
    const hem = [p(-78, -4), p(-40, 4), p(0, -2), p(40, 4), p(78, -4)];
    const neck = p(0, -196);
    // pleated dress: alternating lit/shaded panels
    for (let i = 0; i < 4; i++) list.push({ pts: [L(p(-22, -196), p(22, -196), i / 4), L(p(-22, -196), p(22, -196), (i + 1) / 4), hem[i + 1], hem[i]], c: col, tone: [0.3, 0.08, -0.12, -0.3][i] });
    list.push({ pts: [p(-22, -196), p(22, -196), p(16, -150), p(-16, -150)], c: col, tone: 0.05 });
    list.push({ pts: [neck, p(-6, -150), p(6, -150)], c: P.goldPale, tone: 0.2 });
    opt.hands = hands;
  } else {
    const hands = [arm(-1, arms[0]), arm(1, arms[1])];
    // trousers
    list.push({ pts: [p(-28, -100), p(-2, -100), p(-6, 0), p(-30, 0)], c: P.ink, tone: 0.25 });
    list.push({ pts: [p(2, -100), p(28, -100), p(30, 0), p(6, 0)], c: P.ink, tone: 0.0 });
    // jacket halves + lapel
    list.push({ pts: [p(-34, -192), p(0, -192), p(0, -92), p(-32, -96)], c: col, tone: 0.28 });
    list.push({ pts: [p(0, -192), p(34, -192), p(32, -96), p(0, -92)], c: col, tone: -0.18 });
    list.push({ pts: [p(-10, -192), p(10, -192), p(0, -150)], c: P.cream, tone: 0.2 });
    opt.hands = hands;
  }
  facets(ctx, list, { blur: opt.blur ?? 16, sx: 5, sy: 10 });
  // head: folded hexagon, two facets
  const hc = p(0, -226), r = 27 * s;
  const hx = (i) => [hc[0] + Math.cos(i * TAU / 6 - Math.PI / 2) * r, hc[1] + Math.sin(i * TAU / 6 - Math.PI / 2) * r];
  const skin = '#E9C9AE';
  facets(ctx, [
    { pts: [hx(0), hx(3), hx(4), hx(5)], c: skin, tone: 0.25 },
    { pts: [hx(0), hx(1), hx(2), hx(3)], c: skin, tone: -0.12 },
    kind === 'A' ? { pts: [hx(5), hx(0), hx(1), [hc[0], hc[1] - r * 0.35]], c: P.ink, tone: 0.1 } : { pts: [hx(5), hx(0), hx(1), [hc[0] + r * 0.2, hc[1] - r * 0.45]], c: P.ink, tone: -0.05 },
  ], { blur: 10, sx: 3, sy: 6 });
  if (kind === 'A') star4(ctx, hc[0] - r * 0.7, hc[1] - r * 0.6, 9 * s, P.raspLight);
  if (kind === 'B') star4(ctx, x + 18 * s, y - 170 * s, 8 * s, P.gold, P.goldLight);
  // gentle face
  if (!opt.noFace) {
    ctx.fillStyle = P.ink;
    const f = opt.look ?? 0;
    ctx.beginPath(); ctx.arc(hc[0] - 8 * s + f * 4 * s, hc[1] + 2 * s, 2.6 * s, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(hc[0] + 8 * s + f * 4 * s, hc[1] + 2 * s, 2.6 * s, 0, TAU); ctx.fill();
    ctx.strokeStyle = P.ink; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(hc[0] + f * 4 * s, hc[1] + 9 * s, 6 * s, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  }
  return opt.hands;
}

// ---------------------------------------------------------------- venue: pillars, pleated canopy
export function pillar(ctx, x, h, w = 64) {
  facets(ctx, [
    { pts: [[x - w / 2, 0], [x - w / 2, -h], [x, -h - 10], [x, 0]], c: P.goldPale, tone: 0.3, crease: [[[x, -h - 10], [x, 0]]] },
    { pts: [[x, 0], [x, -h - 10], [x + w / 2, -h], [x + w / 2, 0]], c: P.goldPale, tone: -0.22 },
    { pts: [[x - w / 2 - 12, -h + 4], [x + w / 2 + 12, -h + 4], [x + w / 2, -h - 22], [x - w / 2, -h - 22]], c: P.gold, tone: 0.05 },
    { pts: [[x - w / 2 - 14, 0], [x + w / 2 + 14, 0], [x + w / 2 + 6, -22], [x - w / 2 - 6, -22]], c: P.gold, tone: -0.1 },
  ]);
}
/** pleated canopy band between x0..x1, top y0, depth d. u 0..1 unfolds the pleats from the left. */
export function canopy(ctx, x0, x1, y0, d, u, n = 10) {
  const list = [];
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const v = clamp(u * n - i);
    if (v <= 0) continue;
    const a = x0 + i * w, b = a + w;
    const dd = d * v;
    const zig = i % 2 ? 10 : -6;
    list.push({ pts: [[a, y0], [b, y0], [b, y0 + dd + (i % 2 ? -zig : zig)], [a, y0 + dd + zig]], c: P.blush, tone: i % 2 ? -0.25 : 0.22, crease: [[[b, y0], [b, y0 + dd]]] });
  }
  if (list.length) facets(ctx, list, { blur: 14, sx: 5, sy: 10 });
}

// ---------------------------------------------------------------- vendor objects (base at 0)
export function cake(ctx) {
  const tier = (w, h, y, i) => {
    facets(ctx, [
      { pts: [[-w / 2, y], [w / 2, y], [w / 2, y - h], [-w / 2, y - h]], c: P.cream, tone: 0.15 - i * 0.05 },
      { pts: [[w / 2, y], [w / 2 + 18, y - 10], [w / 2 + 18, y - h - 10], [w / 2, y - h]], c: P.cream, tone: -0.3 },
      { pts: [[-w / 2, y - h], [w / 2, y - h], [w / 2 + 18, y - h - 10], [-w / 2 + 18, y - h - 10]], c: P.cream, tone: 0.42 },
      { pts: [[-w / 2, y - h * 0.42], [w / 2, y - h * 0.42], [w / 2, y - h * 0.62], [-w / 2, y - h * 0.62]], c: P.rasp, tone: 0.05 },
    ], { blur: 10, sx: 4, sy: 8 });
  };
  tier(150, 62, 0, 0); tier(112, 54, -62, 1); tier(76, 46, -116, 2);
  star4(ctx, 8, -176, 18, P.rasp, P.raspDark);
}
export function tulips(ctx) {
  const stem = (x0, x1, top) => {
    ctx.strokeStyle = P.goldDark; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, -70); ctx.lineTo(x1, top); ctx.stroke();
  };
  const bloom = (x, y, c) => facets(ctx, [
    { pts: [[x - 26, y - 34], [x - 6, y - 6], [x - 22, y + 10]], c, tone: 0.3 },
    { pts: [[x - 22, y + 10], [x - 6, y - 6], [x, y - 40], [x + 6, y - 6], [x + 22, y + 10], [x, y + 22]], c, tone: 0.0 },
    { pts: [[x + 26, y - 34], [x + 22, y + 10], [x + 6, y - 6]], c, tone: -0.28 },
  ], { blur: 8, sx: 3, sy: 6 });
  stem(-6, -34, -140); stem(0, 4, -175); stem(6, 38, -130);
  // gold leaves (icon leaf colour)
  facets(ctx, [{ pts: [[-4, -80], [-50, -112], [-30, -88]], c: P.gold, tone: 0.25 }, { pts: [[4, -84], [52, -118], [30, -90]], c: P.gold, tone: -0.15 }], { blur: 6, sx: 2, sy: 4 });
  bloom(-34, -150, P.raspLight); bloom(4, -186, P.rasp); bloom(38, -140, P.blushDeep);
  // vase
  facets(ctx, [
    { pts: [[-40, 0], [0, 0], [0, -80], [-34, -80]], c: P.goldPale, tone: 0.25 },
    { pts: [[0, 0], [40, 0], [34, -80], [0, -80]], c: P.goldPale, tone: -0.2 },
  ], { blur: 10, sx: 4, sy: 8 });
}
export function camera(ctx) {
  facets(ctx, [
    { pts: [[-75, 0], [75, 0], [75, -96], [-75, -96]], c: P.blush, tone: 0.1 },
    { pts: [[75, 0], [96, -14], [96, -110], [75, -96]], c: P.blush, tone: -0.32 },
    { pts: [[-75, -96], [75, -96], [96, -110], [-54, -110]], c: P.blush, tone: 0.4 },
    { pts: [[-46, -110], [-10, -110], [-14, -128], [-42, -128]], c: P.ink, tone: 0.2 },
  ], { blur: 12, sx: 5, sy: 9 });
  const cx = 2, cy = -48, r = 38;
  const lens = [];
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * TAU, a1 = ((i + 1) / 8) * TAU;
    lens.push({ pts: [[cx, cy], [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]], c: P.raspDark, tone: Math.cos((a0 + a1) / 2 + 2.3) * 0.35 });
  }
  facets(ctx, lens, { shadow: false });
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r * 0.42, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,250,242,0.7)'; ctx.beginPath(); ctx.arc(cx - 8, cy - 8, 6, 0, TAU); ctx.fill();
}

/** small folded tag with a label (base centre at 0,0) */
export function tag(ctx, text, px = 30) {
  ctx.font = F.sansB(px);
  const w = ctx.measureText(text).width + 34, h = px + 22;
  facets(ctx, [
    { pts: [[-w / 2, 0], [w / 2, 0], [w / 2, -h / 2], [-w / 2, -h / 2]], c: P.cream, tone: -0.08 },
    { pts: [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2 - 6, -h], [-w / 2 + 6, -h]], c: P.cream, tone: 0.3 },
  ], { blur: 8, sx: 3, sy: 6 });
  ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, -h / 2 + 1);
}

// ---------------------------------------------------------------- checklist accordion + budget box
export function strip(ctx, x, y, w, h, i, text, th, checkU) {
  // pleated strip hinged at its top edge; th = fold angle (PI folded up, 0 open)
  const sk = i % 2 ? -12 : 12;
  const pts = [[x - w / 2, y], [x + w / 2, y], [x + w / 2 + sk, y + h], [x - w / 2 + sk, y + h]];
  const hg = hinge(pts, [x - w / 2, y], [x + w / 2, y], th);
  if (Math.abs(hg.k) < 0.04) return;
  facets(ctx, [{ pts: hg.pts, c: hg.front ? P.cream : P.blush, tone: (i % 2 ? -0.16 : 0.16) * Math.abs(hg.k) + (hg.front ? 0 : -0.1) }], { blur: 12, sx: 4, sy: 8 });
  if (!hg.front || hg.k < 0.6) return;
  ctx.save();
  ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
  // checkbox + text
  const bx = x - w / 2 + 40 + sk * 0.5, by = y + h / 2;
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5; ctx.strokeRect(bx - 17, by - 17, 34, 34);
  ctx.fillStyle = P.ink; ctx.font = F.sansB(32); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + 32, by + 1);
  if (checkU > 0) check(ctx, bx + 2, by - 4, 30 * checkU);
  ctx.restore();
}
/** folded raspberry check mark */
export function check(ctx, x, y, s) {
  if (s <= 0) return;
  const p = (a, b) => [x + a * s, y + b * s];
  facets(ctx, [
    { pts: [p(-0.7, -0.05), p(-0.42, -0.3), p(-0.05, 0.12), p(-0.12, 0.55)], c: P.rasp, tone: 0.2 },
    { pts: [p(-0.12, 0.55), p(-0.05, 0.12), p(0.62, -0.75), p(0.9, -0.5)], c: P.rasp, tone: -0.15 },
  ], { blur: 6, sx: 2, sy: 4 });
}
export function box(ctx, w, h, label) {
  facets(ctx, [
    { pts: [[-w / 2 + 16, -h], [w / 2 + 16, -h], [w / 2, -h + 14], [-w / 2, -h + 14]], c: P.raspDark, tone: -0.2 },
    { pts: [[-w / 2, 0], [w / 2, 0], [w / 2, -h + 14], [-w / 2, -h + 14]], c: P.blush, tone: 0.18 },
    { pts: [[w / 2, 0], [w / 2 + 16, -14], [w / 2 + 16, -h], [w / 2, -h + 14]], c: P.blush, tone: -0.3 },
    { pts: [[-w / 2, -h + 14], [w / 2, -h + 14], [w / 2 - 14, -h + 34], [-w / 2 + 14, -h + 34]], c: P.blush, tone: 0.4 },
  ], { blur: 12, sx: 5, sy: 9 });
  ctx.fillStyle = P.ink; ctx.font = F.sansB(34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, -h / 2 + 12);
}
export function coin(ctx, x, y, r, rot = 0) {
  const list = [];
  for (let i = 0; i < 8; i++) {
    const a0 = rot + (i / 8) * TAU, a1 = rot + ((i + 1) / 8) * TAU;
    list.push({ pts: [[x, y], [x + Math.cos(a0) * r, y + Math.sin(a0) * r], [x + Math.cos(a1) * r, y + Math.sin(a1) * r]], c: P.gold, tone: Math.cos((a0 + a1) / 2 + 2.4) * 0.4 });
  }
  facets(ctx, list, { blur: 8, sx: 3, sy: 6 });
}

// ---------------------------------------------------------------- invitations
export function envelope(ctx, w, h, flap) {
  // base at 0; flap: fold angle 0 closed .. PI open (hinged on the top edge)
  const top = -h;
  facets(ctx, [
    { pts: [[-w / 2, 0], [w / 2, 0], [w / 2, top], [-w / 2, top]], c: P.cream, tone: 0.05 },
    { pts: [[-w / 2, 0], [0, top * 0.45], [w / 2, 0]], c: P.cream, tone: 0.28 },
    { pts: [[-w / 2, top], [0, top * 0.45], [-w / 2, 0]], c: P.cream, tone: -0.1 },
  ], { blur: 12, sx: 4, sy: 8 });
  const f = hinge([[-w / 2, top], [w / 2, top], [0, top * 0.35]], [-w / 2, top], [w / 2, top], flap);
  facets(ctx, [{ pts: f.pts, c: f.front ? P.cream : P.blush, tone: f.front ? -0.2 : 0.1 }], { blur: 8, sx: 3, sy: 6 });
  if (f.front && f.k > 0.4) {
    const tip = f.pts[2];
    heart(ctx, tip[0], tip[1] - 12 * f.k, 13, P.rasp, { blur: 4 });
  }
}
export function plane(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  facets(ctx, [
    { pts: [[40, 0], [-34, -24], [-18, 0]], c: P.cream, tone: 0.32 },
    { pts: [[40, 0], [-18, 0], [-34, 22]], c: P.cream, tone: -0.12 },
    { pts: [[40, 0], [-18, 0], [-22, 8]], c: P.raspLight, tone: -0.1 },
  ], { blur: 8, sx: 3, sy: 7 });
  ctx.restore();
}
/** pennant: triangle hinged at the string; th 0 hanging, PI folded up */
export function pennant(ctx, x, y, s, th, c) {
  const pts = [[x - s, y], [x + s, y], [x, y + s * 1.7]];
  const hg = hinge(pts, [x - s, y], [x + s, y], th);
  if (Math.abs(hg.k) < 0.05) return;
  facets(ctx, [
    { pts: [hg.pts[0], hg.pts[2], [x, y]], c, tone: 0.22 * hg.k },
    { pts: [[x, y], hg.pts[2], hg.pts[1]], c, tone: -0.2 * hg.k },
  ], { blur: 6, sx: 2, sy: 5 });
}
