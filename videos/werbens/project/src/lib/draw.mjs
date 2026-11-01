// Generic editorial drawing primitives.
import { C } from "./palette.mjs";
import { mulberry32, clamp, lerp, E } from "./util.mjs";

export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function line(ctx, pts, width, color, cap = "round") {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = cap;
  ctx.lineJoin = "round";
  ctx.stroke();
}

export function circle(ctx, x, y, r, fill, stroke, lw = 4) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

/** Soft contact shadow on the ground. */
export function groundShadow(ctx, x, y, w, alpha = 0.16) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(1, w), Math.max(1, w * 0.16), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Paper-cutout drop shadow helper: draws shape twice (shadow offset, then fill). */
export function cutout(ctx, pathFn, fill, { dx = 6, dy = 8, shadow = "rgba(27,20,51,0.16)", stroke = C.ink, lw = 4 } = {}) {
  ctx.save();
  ctx.translate(dx, dy);
  pathFn(ctx);
  ctx.fillStyle = shadow;
  ctx.fill();
  ctx.restore();
  pathFn(ctx);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = "round"; ctx.stroke(); }
}

/** Expanding dust puffs (deterministic). p = 0..1 progress. */
export function dust(ctx, x, y, p, { n = 6, spread = 120, size = 26, seed = 3, dir = 0, color = C.paperShade } = {}) {
  if (p <= 0 || p >= 1) return;
  const r = mulberry32(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const side = dir !== 0 ? dir : i % 2 ? 1 : -1;
    const a = r() * 0.6;
    const d = spread * (0.4 + r() * 0.6) * E.outCubic(p);
    const px = x + side * d * Math.cos(a);
    const py = y - d * Math.sin(a) * 0.7 - 6;
    const s = size * (0.6 + r() * 0.6) * (0.5 + p * 0.8);
    ctx.globalAlpha = (1 - p) * 0.9;
    circle(ctx, px, py, s, color, C.ink, 3);
  }
  ctx.restore();
}

/** Comic impact burst lines. */
export function burst(ctx, x, y, p, { n = 10, r0 = 40, r1 = 110, color = C.ink, lw = 6, rot = 0 } = {}) {
  if (p <= 0 || p >= 1) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw * (1 - p * 0.6);
  ctx.lineCap = "round";
  const e = E.outCubic(p);
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const a0 = lerp(r0, r1, e * 0.7), a1 = lerp(r0, r1, Math.min(1, e * 1.25));
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * a0, y + Math.sin(a) * a0);
    ctx.lineTo(x + Math.cos(a) * a1, y + Math.sin(a) * a1);
    ctx.stroke();
  }
  ctx.restore();
}

/** Four-point sparkle. */
export function sparkle(ctx, x, y, s, color = C.violet, alpha = 1) {
  if (s <= 0.01 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0);
  ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
  ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0);
  ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s);
  ctx.fill();
  ctx.restore();
}

/** Speed / motion lines trailing behind a moving object. */
export function speedLines(ctx, x, y, ang, len, alpha, { n = 3, gap = 16, color = C.ink, lw = 4 } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  const bx = -Math.cos(ang), by = -Math.sin(ang);
  const nx = -by, ny = bx;
  for (let i = 0; i < n; i++) {
    const o = (i - (n - 1) / 2) * gap;
    const l = len * (i === (n - 1) / 2 ? 1 : 0.7);
    ctx.beginPath();
    ctx.moveTo(x + nx * o + bx * 30, y + ny * o + by * 30);
    ctx.lineTo(x + nx * o + bx * (30 + l), y + ny * o + by * (30 + l));
    ctx.stroke();
  }
  ctx.restore();
}

/** Wind swirl (gust) — a curl drawn progressively. */
export function swirl(ctx, x, y, p, scale = 1, alpha = 1) {
  if (p <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = C.inkSoft;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  const N = Math.floor(60 * clamp(p));
  for (let i = 0; i <= N; i++) {
    const t = i / 60;
    const px = -120 + t * 200 + Math.cos(t * Math.PI * 3.2) * 34 * t;
    const py = Math.sin(t * Math.PI * 3.2) * 34 * t;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

/** Simple icon set drawn in a (0,0)-centred box of size s. */
export function icon(ctx, kind, x, y, s, color = C.ink, lw = 3) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const h = s / 2;
  switch (kind) {
    case "people": {
      ctx.beginPath(); ctx.arc(-h * 0.28, -h * 0.25, h * 0.28, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(-h * 0.28, h * 0.75, h * 0.55, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(h * 0.42, -h * 0.15, h * 0.22, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(h * 0.42, h * 0.75, h * 0.42, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      break;
    }
    case "doc": {
      rr(ctx, -h * 0.62, -h * 0.8, h * 1.24, h * 1.6, h * 0.18); ctx.stroke();
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-h * 0.32, -h * 0.3 + i * h * 0.36); ctx.lineTo(h * 0.32, -h * 0.3 + i * h * 0.36); ctx.stroke(); }
      break;
    }
    case "chat": {
      rr(ctx, -h * 0.85, -h * 0.7, h * 1.7, h * 1.15, h * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-h * 0.35, h * 0.45); ctx.lineTo(-h * 0.55, h * 0.85); ctx.lineTo(h * 0.0, h * 0.45); ctx.stroke();
      break;
    }
    case "board": {
      rr(ctx, -h * 0.8, -h * 0.8, h * 1.6, h * 1.6, h * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-h * 0.8, -h * 0.25); ctx.lineTo(h * 0.8, -h * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-h * 0.15, -h * 0.25); ctx.lineTo(-h * 0.15, h * 0.8); ctx.stroke();
      break;
    }
    case "search": {
      ctx.beginPath(); ctx.arc(-h * 0.15, -h * 0.15, h * 0.5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(h * 0.22, h * 0.22); ctx.lineTo(h * 0.7, h * 0.7); ctx.stroke();
      break;
    }
    case "check": {
      ctx.beginPath(); ctx.moveTo(-h * 0.55, 0); ctx.lineTo(-h * 0.12, h * 0.42); ctx.lineTo(h * 0.6, -h * 0.45); ctx.stroke();
      break;
    }
    case "heart": {
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      ctx.bezierCurveTo(-h * 1.1, -h * 0.1, -h * 0.5, -h * 0.95, 0, -h * 0.35);
      ctx.bezierCurveTo(h * 0.5, -h * 0.95, h * 1.1, -h * 0.1, 0, h * 0.7);
      ctx.fill();
      break;
    }
    case "thumb": {
      rr(ctx, -h * 0.75, -h * 0.05, h * 0.38, h * 0.85, h * 0.1); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-h * 0.28, h * 0.8); ctx.lineTo(h * 0.55, h * 0.8);
      ctx.quadraticCurveTo(h * 0.8, h * 0.8, h * 0.78, h * 0.5);
      ctx.lineTo(h * 0.72, h * 0.05); ctx.quadraticCurveTo(h * 0.7, -h * 0.15, h * 0.45, -h * 0.15);
      ctx.lineTo(h * 0.12, -h * 0.15); ctx.lineTo(h * 0.2, -h * 0.6);
      ctx.quadraticCurveTo(h * 0.2, -h * 0.9, -h * 0.05, -h * 0.85);
      ctx.lineTo(-h * 0.28, -h * 0.1); ctx.closePath(); ctx.fill();
      break;
    }
    case "link": {
      ctx.beginPath(); ctx.ellipse(-h * 0.3, 0, h * 0.45, h * 0.25, -0.6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(h * 0.3, 0, h * 0.45, h * 0.25, -0.6, 0, Math.PI * 2); ctx.stroke();
      break;
    }
  }
  ctx.restore();
}
