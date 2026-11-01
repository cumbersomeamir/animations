// The Werbens ribbon motif: a two-tone twisting paper ribbon drawn along any polyline.
import { C } from "./palette.mjs";
import { polyLength, pointAt, clamp } from "./util.mjs";

/**
 * o: { w, s0, s1, freq (twists per px), phase, front, back, outline, alpha, taper }
 * Returns head point {x,y,ang} (at s1) for attaching things.
 */
export function drawRibbon(ctx, pts, o = {}) {
  const cum = polyLength(pts);
  const L = cum[cum.length - 1];
  const s0 = clamp(o.s0 ?? 0), s1 = clamp(o.s1 ?? 1);
  const head = pointAt(pts, s1, cum);
  if (s1 - s0 <= 0.002 || L < 1) return head;
  const w = o.w ?? 34;
  const freq = o.freq ?? 0.018;
  const phase = o.phase ?? 0;
  const front = o.front ?? C.violet, back = o.back ?? C.violetLight;
  const taperPx = o.taper ?? 26;
  const n = Math.max(6, Math.ceil(((s1 - s0) * L) / 5));
  const S = [];
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n;
    const p = pointAt(pts, s, cum);
    const tw = Math.cos(phase + s * L * freq);
    const dl = Math.min((s - s0) * L, (s1 - s) * L);
    const tp = taperPx > 0 ? clamp(dl / taperPx, 0.25, 1) : 1;
    const half = (w / 2) * (0.22 + 0.78 * Math.abs(tw)) * tp;
    S.push({ x: p.x, y: p.y, nx: -Math.sin(p.ang), ny: Math.cos(p.ang), half, front: tw >= 0 });
  }
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  // drop shadow
  if (o.shadow !== false) {
    ctx.save();
    ctx.translate(6, 9);
    ctx.fillStyle = "rgba(27,20,51,0.14)";
    ctx.beginPath();
    S.forEach((q, i) => (i ? ctx.lineTo(q.x + q.nx * q.half, q.y + q.ny * q.half) : ctx.moveTo(q.x + q.nx * q.half, q.y + q.ny * q.half)));
    for (let i = S.length - 1; i >= 0; i--) ctx.lineTo(S[i].x - S[i].nx * S[i].half, S[i].y - S[i].ny * S[i].half);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < S.length - 1; i++) {
    const a = S[i], b = S[i + 1];
    const col = a.front ? front : back;
    ctx.beginPath();
    ctx.moveTo(a.x + a.nx * a.half, a.y + a.ny * a.half);
    ctx.lineTo(b.x + b.nx * b.half, b.y + b.ny * b.half);
    ctx.lineTo(b.x - b.nx * b.half, b.y - b.ny * b.half);
    ctx.lineTo(a.x - a.nx * a.half, a.y - a.ny * a.half);
    ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = col; ctx.stroke();
  }
  if (o.outline !== false) {
    ctx.lineWidth = o.outlineW ?? 3;
    ctx.strokeStyle = o.outlineColor ?? C.ink;
    ctx.lineJoin = "round";
    for (const sgn of [1, -1]) {
      ctx.beginPath();
      S.forEach((q, i) => (i ? ctx.lineTo(q.x + sgn * q.nx * q.half, q.y + sgn * q.ny * q.half) : ctx.moveTo(q.x + sgn * q.nx * q.half, q.y + sgn * q.ny * q.half)));
      ctx.stroke();
    }
  }
  ctx.restore();
  return head;
}

/** Circle loop appended to a path end (lasso). */
export function loopPoints(cx, cy, r, a0 = -Math.PI / 2, turns = 1.1, n = 30) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * turns * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.62 });
  }
  return pts;
}
